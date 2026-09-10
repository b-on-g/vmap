namespace $ {

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

		if( $mol_tree2_js_is_number( val.type ) ) return 'number'
		if( $mol_view_tree2_class_match( val ) ) return 'object'

		return 'raw'
	}

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
