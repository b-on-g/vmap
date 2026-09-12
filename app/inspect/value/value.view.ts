namespace $.$$ {

	function sign_of( token: string ) {
		return [ ... token.matchAll( $mol_view_tree2_prop_signature ) ][ 0 ]?.groups
			?? { name: token, key: '', next: '' }
	}

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

		override num( next?: string ) {

			const val = this.tree()
			if( next === undefined ) return val.type

			guard( this, ()=> this.tree(
				val.struct( this.$.$bog_vmap_app_inspect_value_literal( next ) )
			) )

			return next
		}

		override flag_title() {
			return this.tree().type
		}

		override flag( next?: boolean ) {

			const val = this.tree()
			if( next === undefined ) return val.type === 'true'

			this.tree( val.struct( next ? 'true' : 'false' ) )

			return next
		}

		override raw() {
			return this.tree().toString().trimEnd()
		}

		Editor(): $mol_view {

			switch( this.kind() ) {
				case 'string': return this.String()
				case 'locale': return this.String()
				case 'number': return this.Num()
				case 'bool': return this.Flag()
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

		override text_rows() {
			return Math.min( 8, this.text().split( '\n' ).length )
		}

	}

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

				const named = val.struct( next.trim(), val.kids )

				if( !this.$.$mol_view_tree2_class_match( named ) ) this.$.$mol_fail(
					new Error( `Не имя класса: ${ JSON.stringify( next ) }` )
				)

				this.tree( named )

			} )

			return next
		}

		override item_marker( index: number ) {
			return this.keyed() && !this.tree().kids[ index ]?.kids.length
		}

		override item_key( index: number, next?: string ) {

			const tree = this.tree()
			const kid = tree.kids[ index ]

			if( next === undefined ) return this.keyed() ? kid?.type ?? '' : ''

			guard( this, ()=> {

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

	export class $bog_vmap_app_inspect_value_bind extends $.$bog_vmap_app_inspect_value_bind {

		op() {
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
				this.op(),
				this.Target(),
				... this.ref()?.kids.length ? [ this.Default() ] : [],
			] as readonly $mol_view_content[]
		}

	}

	type Node_meta = { klass: string, ports: readonly string[] }

	export class $bog_vmap_app_inspect_value_wire extends $.$bog_vmap_app_inspect_value_wire {

		override nodes(): Record< string, Node_meta > {
			return super.nodes()
		}

		override node_names() {
			return Object.keys( this.nodes() )
		}

		meta(): Node_meta {
			return this.nodes()[ this.origin() ] ?? { klass: '', ports: [] }
		}

		override ports() {
			return this.meta().ports
		}

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
				this.wire_op(),
				this.Origin(),
				this.wire_dot(),
				this.ports().length ? this.Port_pick() : this.Port_free(),
			] as readonly $mol_view_content[]
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
