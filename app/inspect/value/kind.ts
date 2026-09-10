namespace $ {

	/**
	 * Shape of a `view.tree` value, as one word.
	 *
	 * Studio names the shapes through a stock helper that is used nowhere in mol
	 * itself — it is not the compiler's own grammar, it is a helper studio happens
	 * to lean on — and it throws on anything it does not name. Three shapes that
	 * really occur fall into that hole, and an inspector meets all three on the
	 * document of section 1:
	 *
	 * - `=`, the wire, which is the whole point of section 1;
	 * - `^`, which every `attr *` of a subclass starts with;
	 * - `+NaN` and `+Infinity`, which the number field itself is written with.
	 *
	 * Studio patches the first and the third in front of the call and still throws
	 * on `^`. Reproducing that patch would mean carrying its hole as well, so the
	 * mapping is spelled out here instead, against the grammar the compiler
	 * actually uses: the two guards below are the very functions the generator
	 * branches on, in the order it branches on them.
	 *
	 * @see ../../../../ARCHITECTURE.md section 1
	 */
	export type $bog_vmap_app_inspect_value_kind =
		| 'none'
		| 'null'
		| 'bool'
		| 'number'
		| 'string'
		| 'locale'
		| 'list'
		| 'dict'
		| 'object'
		| 'get'
		| 'bind'
		| 'put'
		| 'wire'
		| 'super'
		| 'raw'

	/**
	 * `raw` is the honest answer, not a failure: a value the editor has no form for
	 * is shown as its own source text and left alone. Failing here instead would
	 * take out the whole property list over one node nobody was editing.
	 */
	export function $bog_vmap_app_inspect_value_kind_of(
		val: $mol_tree2 | null,
	): $bog_vmap_app_inspect_value_kind {

		if( !val ) return 'none'

		switch( val.type ) {
			case '': return 'string'
			case 'true': return 'bool'
			case 'false': return 'bool'
			case 'null': return 'null'
			case '*': return 'dict'
			case '@': return 'locale'
			case '<=': return 'get'
			case '<=>': return 'bind'
			case '=>': return 'put'
			case '=': return 'wire'
			case '^': return 'super'
		}

		if( val.type[ 0 ] === '/' ) return 'list'

		// Order copied from the generator: a number wins over a class, which is why
		// `NaN` and `Infinity` are excluded from the class match there.
		if( $mol_tree2_js_is_number( val.type ) ) return 'number'
		if( $mol_view_tree2_class_match( val ) ) return 'object'

		return 'raw'
	}

	/**
	 * The grammar is the guard the generator itself branches on, borrowed for the
	 * same reason the token module borrows the stock signature regexp: a literal
	 * this accepts is a literal the compiler accepts, and a grammar of our own
	 * would part ways with it at the first exception. `+NaN` and `+Infinity` are
	 * exceptions of exactly that kind — `Number( '+NaN' ).toString()` is `NaN`, so
	 * the obvious round-trip test would reject two literals the number field is
	 * written with.
	 *
	 * Blank input is refused separately: `Number( '' )` is `0`, so the grammar
	 * accepts an empty type, while a tree node has no such thing.
	 */
	export function $bog_vmap_app_inspect_value_literal(
		this: $,
		text: string,
	) {

		const num = text.trim()

		if( !num || !$mol_tree2_js_is_number( num ) ) this.$mol_fail(
			new Error( `Не число: ${ JSON.stringify( text ) }` )
		)

		return num
	}

}
