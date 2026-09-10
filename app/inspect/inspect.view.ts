namespace $.$$ {

	function sign_of( token: string ) {
		return [ ... token.matchAll( $mol_view_tree2_prop_signature ) ][ 0 ]?.groups
			?? { name: token, key: '', next: '' }
	}

	export class $bog_vmap_app_inspect extends $.$bog_vmap_app_inspect {

		override classes() {
			const own = this.Node().tree()
			return [ own, ... this.peers().filter( tree => tree.type !== own.type ) ]
		}

		class_title( next?: string ) {
			return this.Node().name( next )
		}

		@ $mol_mem_key
		title_draft( name: string, next?: string ) {
			return next ?? name
		}

		title_value( next?: string ) {
			return this.title_draft( this.class_title(), next )
		}

		@ $mol_action
		title_submit( event?: Event ) {

			const draft = this.title_value()
			if( !draft || draft === this.class_title() ) return

			this.class_title( draft )
		}

		override body() {

			if( !this.class_ready() ) return [ this.Empty() ] as readonly $mol_view[]

			return [
				this.Head(),
				... this.title_note() ? [ this.Note() ] : [],
				this.Body(),
			] as readonly $mol_view[]
		}

		body_content() {
			return [
				this.Flex(),
				this.Rows(),
			] as readonly $mol_view[]
		}

		class_ready() {
			try {
				return Boolean( this.Node().tree() )
			} catch( error: unknown ) {
				if( $mol_promise_like( error ) ) return $mol_fail_hidden( error )
				return false
			}
		}

		base_title() {
			return this.Node().base()
		}

		@ $mol_mem
		ports() {
			return this.Lib().props_map( this.class_title() )
		}

		@ $mol_mem
		owners() {
			return this.Lib().props_owner( this.base_title() )
		}

		@ $mol_mem
		port_list() {

			const base = this.owners()
			const names = [ ... this.ports().keys() ]

			return [
				... names.filter( name => !base.has( name ) ),
				... names.filter( name => base.has( name ) ),
			]
		}

		rows() {
			return this.port_list().map( name => this.Row( name ) )
		}

		total() {
			const all = this.port_list().length
			const own = this.Node().prop_names().length
			return `${ all } портов, своих ${ own }`
		}

		port_node( name: string ) {
			return this.ports().get( name ) ?? this.Node().prop_tree( name ) ?? null
		}

		row_sign( name: string ) {
			return this.port_node( name )?.type ?? name
		}

		row_owner( name: string ) {
			return this.owners().get( name ) ?? ''
		}

		row_inherited( name: string ) {
			return !this.Node().prop_names().includes( name )
		}

		binds() {
			return this.port_list()
		}

		@ $mol_mem
		nodes() {

			const node = this.Node()
			const lib = this.Lib()

			const res = {} as Record< string, { klass: string, ports: readonly string[] } >

			for( const name of node.prop_names() ) {

				const val = node.prop_tree( name )?.kids[ 0 ] ?? null
				if( this.$.$bog_vmap_app_inspect_value_kind_of( val ) !== 'object' ) continue

				const klass = val!.type

				res[ name ] = {
					klass,
					ports: [ ... lib.props_map( klass ).keys() ],
				}

			}

			return res
		}

		row_value( name: string, next?: $mol_tree2 ) {

			const decl = this.port_node( name )!

			if( next === undefined ) {

				const val = decl.kids[ 0 ] ?? decl

				if( this.row_inherited( name ) && val.type === '*' ) {
					return val.clone([ val.struct( '^' ) ])
				}

				return val

			}

			const node = this.Node()

			if( this.row_inherited( name ) ) node.prop_add( decl.type )

			const own = node.prop_tree( name )!
			node.prop_tree( name, own.clone([ next ]) )

			return next
		}

		row_keyed( name: string, next?: boolean ) {

			if( next === undefined ) return Boolean( sign_of( this.row_sign( name ) ).key )

			return this.Node().property( name ).key( next )
		}

		row_changeable( name: string, next?: boolean ) {

			const node = this.Node()

			if( next === undefined ) return Boolean( sign_of( this.row_sign( name ) ).next )

			const value = this.port_node( name )?.kids[ 0 ] ?? null

			if( this.$.$bog_vmap_app_inspect_value_kind_of( value ) === 'wire' ) {

				const origin = value!.kids[ 0 ]

				node.wire_add({
					name,
					node: origin?.type ?? '',
					prop: sign_of( origin?.kids[ 0 ]?.type ?? '' ).name,
					bidi: next,
				})

				return next
			}

			return node.property( name ).next( next )
		}

		row_drop( name: string ) {
			this.Node().prop_drop( name )
		}

		style_dict() {

			const dict = this.Node().prop_decl( 'style' )?.kids[ 0 ] ?? null

			return dict?.type === '*' ? dict : null
		}

		flex_value( key: string, next?: string ) {

			const node = this.Node()
			const dict = this.style_dict()

			if( next === undefined ) {
				return this.$.$bog_vmap_lang_dict_get( dict, key )?.value ?? ''
			}

			const tree = node.tree()
			const base = dict ?? tree.struct( '*', [ tree.struct( '^' ) ] )

			const written = this.$.$bog_vmap_lang_dict_set(
				base,
				key,
				next ? tree.data( next ) : null,
			)

			if( ! node.prop_names().includes( 'style' ) ) node.prop_add( 'style' )

			node.prop_tree( 'style', node.prop_tree( 'style' )!.clone([ written ]) )

			return next
		}

	}

	const demo_source = [
		'$bog_vmap_app_inspect_demo_doc $mol_view',
		'	Price $mol_view title <= calc_result',
		'	Hero $mol_view sub / <= Price',
		'	Calc $mol_number',
		'	Card $bog_vmap_app_inspect_demo_doc_card',
		'	Ghost $bog_vmap_app_inspect_demo_doc_ghost',
		'	calc_result = Card price',
		'	label \\Всего',
		'	count 24',
		'	dense false',
		'	style * padding \\4px',
		'	sub / <= Hero',
		'$bog_vmap_app_inspect_demo_doc_card $mol_view',
		'	caption \\Карточка',
		'	price 0',
		'	sub / <= caption',
		'',
	].join( '\n' )

	export class $bog_vmap_app_inspect_demo extends $.$bog_vmap_app_inspect_demo {

		@ $mol_mem
		override source( next?: string ) {
			return next ?? demo_source
		}

		override names() {
			return this.Doc().names()
		}

		override trees() {
			return this.Doc().trees()
		}

		@ $mol_mem
		override klass( next?: string ) {
			return next ?? this.names()[ 0 ] ?? ''
		}

		override class_source( next?: string ) {
			return this.Doc().class_source( this.klass(), next )
		}

	}

}
