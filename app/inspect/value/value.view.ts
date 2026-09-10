namespace $.$$ {

	/** Signature parts of a token, with the blank studio's callers all repeat. */
	function sign_of( token: string ) {
		return [ ... token.matchAll( $mol_view_tree2_prop_signature ) ][ 0 ]?.groups
			?? { name: token, key: '', next: '' }
	}

	/**
	 * The throw is what keeps the document clean, and it has to stay a throw: it is
	 * the only thing that stops the write on its way to the source. But a throw
	 * alone is invisible, because the string field catches it and files the message
	 * under `setCustomValidity`, which a form that is never submitted never shows.
	 * So the message is put where the view can read it first, and only then thrown.
	 *
	 * A suspension is passed through untouched. It is not a refusal, it is a cell
	 * asking to be called again, and turning it into a message would both lose the
	 * value and post gibberish.
	 */
	function guard< Result >(
		host: { alarm( next?: string ): string },
		job: ()=> Result,
	): Result {

		try {
			const res = job()
			host.alarm( '' )
			return res
		} catch( error ) {
			if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
			host.alarm( error instanceof Error ? error.message : String( error ) )
			return $mol_fail_hidden( error )
		}

	}

	/**
	 * None of the accessors in this file is memoized, deliberately. Each is a two
	 * line derivation of `tree()`, which is a cell already, and a cell of its own
	 * here would be a cell that a write freezes: a write to a memoized cell freezes
	 * its dependencies, so the editor would keep showing the value the user typed
	 * after the document moved underneath it — the one failure mode of an editor
	 * that nobody reports as a bug, because it looks like it worked.
	 */
	export class $bog_vmap_app_inspect_value extends $.$bog_vmap_app_inspect_value {

		kind() {
			return this.$.$bog_vmap_app_inspect_value_kind_of( this.tree() )
		}

		override seq_keyed() {
			return this.kind() !== 'list'
		}

		override seq_klass() {
			return this.kind() === 'object'
		}

		Editor(): $mol_view {

			switch( this.kind() ) {
				case 'string': return this.String()
				case 'locale': return this.String()
				case 'number': return this.Number()
				case 'bool': return this.Bool()
				case 'list': return this.Seq()
				case 'dict': return this.Seq()
				case 'object': return this.Seq()
				case 'get': return this.Bind()
				case 'bind': return this.Bind()
				case 'put': return this.Bind()
				case 'wire': return this.Wire()
			}

			return this.Raw()
		}

		override editors() {
			return [
				this.Editor(),
				... this.alarm() ? [ this.Alarm() ] : [],
			] as readonly $mol_view[]
		}

	}

	export class $bog_vmap_app_inspect_value_string extends $.$bog_vmap_app_inspect_value_string {

		override text( next?: string ) {

			const val = this.tree()
			if( next === undefined ) return val.text()

			// `data()` splits on newlines into kid nodes by itself, which is what
			// makes a multi line value survive the round trip.
			this.tree( val.type === '@' ? val.struct( '@', [ val.data( next ) ] ) : val.data( next ) )

			return next
		}

		override locale( next?: boolean ) {

			const val = this.tree()
			if( next === undefined ) return val.type === '@'

			this.tree(
				next
					? val.struct( '@', [ val.data( val.text() ) ] )
					: val.data( val.text() )
			)

			return next
		}

		/** Grows with the value, up to a panel's worth of lines. */
		override text_rows() {
			return Math.min( 8, this.text().split( '\n' ).length )
		}

	}

	export class $bog_vmap_app_inspect_value_number extends $.$bog_vmap_app_inspect_value_number {

		override num( next?: string ) {

			const val = this.tree()
			if( next === undefined ) return val.type

			guard( this, ()=> this.tree(
				val.struct( this.$.$bog_vmap_app_inspect_value_literal( next ) )
			) )

			return next
		}

	}

	export class $bog_vmap_app_inspect_value_bool extends $.$bog_vmap_app_inspect_value_bool {

		override flag_title() {
			return this.tree().type
		}

		override flag( next?: boolean ) {

			const val = this.tree()
			if( next === undefined ) return val.type === 'true'

			this.tree( val.struct( next ? 'true' : 'false' ) )

			return next
		}

	}

	export class $bog_vmap_app_inspect_value_raw extends $.$bog_vmap_app_inspect_value_raw {

		override raw() {
			return this.tree().toString().trimEnd()
		}

	}

	/**
	 * `keyed` says whether an element is a bare value or a named node with the
	 * value under it, `klass` whether the node type is an editable class name.
	 * Those two bits are the entire difference between a list, a dictionary and an
	 * object.
	 */
	export class $bog_vmap_app_inspect_value_seq extends $.$bog_vmap_app_inspect_value_seq {

		items() {
			return this.tree().kids.map( ( _, index )=> this.Item( index ) )
		}

		override add_title() {
			return this.keyed() ? ( this.klass() ? '+ свойство' : '+ ключ' ) : '+ элемент'
		}

		override class_name( next?: string ) {

			const val = this.tree()
			if( next === undefined ) return val.type

			guard( this, ()=> {

				// The tree constructor refuses a type with a space, a newline or a
				// backslash before this line is even reached, so what is left to
				// check is only that the name is a class name.
				const named = val.struct( next.trim(), val.kids )

				if( !this.$.$mol_view_tree2_class_match( named ) ) this.$.$mol_fail(
					new Error( `Не имя класса: ${ JSON.stringify( next ) }` )
				)

				this.tree( named )

			} )

			return next
		}

		/**
		 * The entry carries nothing under it, so it is `^` and not a pair. In a list
		 * every element is a bare node and none of them is a marker, which is why
		 * the answer is `false` there whatever the shape.
		 */
		override item_marker( index: number ) {
			return this.keyed() && !this.tree().kids[ index ]?.kids.length
		}

		override item_key( index: number, next?: string ) {

			const tree = this.tree()
			const kid = tree.kids[ index ]

			if( next === undefined ) return this.keyed() ? kid?.type ?? '' : ''

			guard( this, ()=> {

				// A key is NOT a property name, so the token guard of the language
				// module would be the wrong grammar here: `padding-top` in a
				// `style *` is legal and has a hyphen. The guard is the tree
				// constructor, which is the rule the serializer itself lives by.
				if( !next.trim() ) this.$.$mol_fail( new Error( 'Ключ не может быть пустым' ) )

				this.tree( tree.insert( kid.struct( next.trim(), kid.kids ), index ) )

			} )

			return next
		}

		override item_value( index: number, next?: $mol_tree2 ) {

			const tree = this.tree()
			const kid = tree.kids[ index ]

			if( !this.keyed() ) {
				if( next === undefined ) return kid
				this.tree( tree.insert( next, index ) )
				return next
			}

			// An entry with no kids is `^`, the inherit-everything marker of a
			// dictionary. It has no value, so it stands for itself and the raw
			// editor shows it as it is written.
			if( next === undefined ) return kid.kids[ 0 ] ?? kid

			if( !kid.kids.length ) this.$.$mol_fail(
				new Error( `Записи ${ JSON.stringify( kid.type ) } нечего присвоить` )
			)

			this.tree( tree.insert( kid.clone([ next ]), index ) )

			return next
		}

		override item_add() {

			const tree = this.tree()

			const blank = this.keyed()
				? tree.struct( 'key', [ tree.struct( 'null' ) ] )
				: tree.struct( 'null' )

			this.tree( tree.clone([ ... tree.kids, blank ]) )

		}

		override item_drop( index: number ) {
			const tree = this.tree()
			this.tree( tree.clone( tree.kids.filter( ( _, i )=> i !== index ) ) )
		}

		override seq_sub() {
			return [
				... this.klass() ? [ this.Class_name() ] : [],
				this.Items(),
				this.Add(),
			] as readonly $mol_view[]
		}

	}

	export class $bog_vmap_app_inspect_value_item extends $.$bog_vmap_app_inspect_value_item {

		override item_sub() {
			return [
				... this.keyed() && !this.marker() ? [ this.Key() ] : [],
				this.Value(),
				this.Drop(),
			] as readonly $mol_view[]
		}

	}

	/**
	 * The target is one bare name plus the sign it already carries. The sign is
	 * preserved rather than derived, because both spellings are legal and mean
	 * different things: `<=> value?` demands the `?` on both ends, while a one way
	 * binding onto a writable property, as the string field of mol writes its own
	 * change handler, carries the `?` on one side only. Only the name is editable,
	 * so neither can be broken by a rename.
	 */
	export class $bog_vmap_app_inspect_value_bind extends $.$bog_vmap_app_inspect_value_bind {

		override op() {
			return this.tree().type
		}

		ref() {
			return this.tree().kids[ 0 ] ?? null
		}

		override target( next?: string ) {

			const val = this.tree()
			const ref = this.ref()
			const sign = sign_of( ref?.type ?? '' )

			if( next === undefined ) return sign.name

			guard( this, ()=> {

				const name = this.$.$bog_vmap_lang_token( next.trim(), 'Свойство' )

				this.tree( val.clone([
					val.struct( `${ name }${ sign.key || '' }${ sign.next || '' }`, ref?.kids ?? [] )
				]) )

			} )

			return next
		}

		override default_value( next?: $mol_tree2 ) {

			const val = this.tree()
			const ref = this.ref()!

			if( next === undefined ) return ref.kids[ 0 ]

			this.tree( val.clone([ ref.clone([ next ]) ]) )

			return next
		}

		override bind_sub() {
			return [
				this.Op(),
				this.Target(),
				... this.ref()?.kids.length ? [ this.Default() ] : [],
			] as readonly $mol_view[]
		}

	}

	/** What the inspector knows about one node of the document. */
	type Node_meta = { klass: string, ports: readonly string[] }

	/** A wire, `= Узел порт`. */
	export class $bog_vmap_app_inspect_value_wire extends $.$bog_vmap_app_inspect_value_wire {

		override nodes(): Record< string, Node_meta > {
			return super.nodes()
		}

		/** In declaration order. */
		override node_names() {
			return Object.keys( this.nodes() )
		}

		/**
		 * A wire may point at a node that has since been renamed or dropped, so the
		 * lookup misses on a perfectly ordinary document and answers with a blank
		 * rather than failing. The far end is then a text field holding the port
		 * that is already written, which is the only thing that lets the wire be
		 * repaired instead of retyped.
		 */
		meta(): Node_meta {
			return this.nodes()[ this.origin() ] ?? { klass: '', ports: [] }
		}

		override ports() {
			return this.meta().ports
		}

		/**
		 * Said only when the port cannot be picked, and it names the reason rather
		 * than the symptom: which node, which class, and which of the two things
		 * went wrong.
		 */
		override note() {

			if( this.ports().length ) return ''

			const origin = this.origin()
			if( !origin ) return 'Сначала узел'

			const klass = this.meta().klass

			return klass
				? `Пак не знает класса ${ klass } — порт вводится вручную`
				: `Узел ${ origin } документом не объявлен — порт вводится вручную`
		}

		override wire_row() {
			return [
				this.Op(),
				this.Origin(),
				this.Dot(),
				this.ports().length ? this.Port_pick() : this.Port_free(),
			] as readonly $mol_view[]
		}

		override wire_sub() {
			return [
				this.Row(),
				... this.note() ? [ this.Note() ] : [],
			] as readonly $mol_view[]
		}

		parts() {

			const node = this.tree().kids[ 0 ]
			const port = sign_of( node?.kids[ 0 ]?.type ?? '' )

			return {
				node: node?.type ?? '',
				port: port.name,
				bidi: Boolean( port.next ),
			}
		}

		override origin( next?: string ) {

			const parts = this.parts()
			if( next === undefined ) return parts.node

			guard( this, ()=> this.write( next.trim(), parts.port, parts.bidi ) )

			return next
		}

		override port( next?: string ) {

			const parts = this.parts()
			if( next === undefined ) return parts.port

			guard( this, ()=> this.write( parts.node, next.trim(), parts.bidi ) )

			return next
		}

		write( node: string, port: string, bidi: boolean ): void {

			const val = this.tree()

			const name = this.$.$bog_vmap_lang_token( node, 'Узел' )
			const prop = this.$.$bog_vmap_lang_token( port, 'Порт' )

			// Kept although both ends are now picked from lists. The pickers are the
			// interface; this is the document's own rule, and it has to hold against
			// a wire written by hand, imported from a file, or left pointing at a
			// node that has since been renamed.
			const names = this.node_names()

			if( !names.includes( name ) ) this.$.$mol_fail( new Error(
				names.length
					? `Узел ${ name } не объявлен. Есть: ${ names.join( ', ' ) }`
					: 'В документе нет ни одного объявленного узла'
			) )

			this.tree( val.struct( '=', [
				val.struct( name, [ val.struct( prop + ( bidi ? '?' : '' ) ) ] ),
			] ) )

		}

	}

}
