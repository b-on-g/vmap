namespace $ {

	export const $bog_vmap_lib_predef = '$mol_view $mol_object\n\tdom_name \\\n\tstyle *\n\tevent *\n\tfield *\n\tattr *\n\tsub /\n\ttitle \\\n'

	export function $bog_vmap_lib_parse(
		this: $,
		src: string,
		uri = 'web.view.tree',
	) {

		const predef = this.$mol_tree2_from_string( $bog_vmap_lib_predef, '$bog_vmap_lib_predef' )
		const tree = this.$mol_tree2_from_string( src, uri )

		return this.$mol_view_tree2_normalize( tree.clone([ ... predef.kids, ... tree.kids ]) )
	}

	export function $bog_vmap_lib_slashed( uri: string ) {
		return uri.replace( /\/?$/, '/' )
	}

	export function $bog_vmap_lib_pack_note( link: string, error: unknown ) {

		const reason = String( ( error as Error )?.message || error )

		if( !link ) return `Пак не отвечает: ${ reason }`

		return `Пак не отвечает (${ reason }). Ожидался ${ link }`
			+ ' — дерево классов, которое сборка кладёт рядом с бандлом'
	}

	export function $bog_vmap_lib_sibling( page: string, module: string ) {

		const url = new URL( page )
		const path = url.pathname.split( '/' ).filter( Boolean )

		if( /\.html?$/i.test( path[ path.length - 1 ] ?? '' ) ) path.pop()

		if( path[ path.length - 1 ] === '-' ) {
			path.pop()
			path.pop()
			path.push( module, '-' )
		} else {
			path.push( module )
		}

		return `${ url.origin }/${ path.join( '/' ) }/`
	}

	export function $bog_vmap_lib_united(
		lib: $mol_tree2,
		kids: readonly $mol_tree2[],
	) {
		if( !kids.length ) return lib
		return lib.clone([ ... lib.kids, ... kids ])
	}

	export function $bog_vmap_lib_index( united: $mol_tree2 ) {

		const index = new Map< string, $mol_tree2 >()

		for( const cl of united.kids ) {
			const sup = cl.kids[0]
			if( !sup ) continue
			index.set( cl.type, sup )
		}

		return index
	}

	export function $bog_vmap_lib_chain(
		index: Map< string, $mol_tree2 >,
		base: string,
	) {

		const chain = [] as string[]
		const seen = new Set< string >()

		let cl = base

		while( cl && !seen.has( cl ) ) {
			seen.add( cl )
			chain.push( cl )
			cl = index.get( cl )?.type ?? ''
		}

		return chain
	}

	export function $bog_vmap_lib_props_map(
		this: $,
		index: Map< string, $mol_tree2 >,
		base: string,
	) {

		const all = new Map< string, $mol_tree2 >()
		const chain = $bog_vmap_lib_chain( index, base )

		for( let i = chain.length - 1; i >= 0; --i ) {

			const sup = index.get( chain[ i ] )
			if( !sup ) continue

			for( const prop of sup.kids ) {
				all.set( this.$mol_view_tree2_prop_parts( prop ).name, prop )
			}

		}

		return all
	}

	export function $bog_vmap_lib_props_owner(
		this: $,
		index: Map< string, $mol_tree2 >,
		base: string,
	) {

		const owner = new Map< string, string >()
		const chain = $bog_vmap_lib_chain( index, base )

		for( let i = chain.length - 1; i >= 0; --i ) {

			const sup = index.get( chain[ i ] )
			if( !sup ) continue

			for( const prop of sup.kids ) {
				owner.set( this.$mol_view_tree2_prop_parts( prop ).name, chain[ i ] )
			}

		}

		return owner
	}

	export class $bog_vmap_lib_any extends $mol_object {

		@ $mol_mem
		tree(): $mol_tree2 {
			return this.$.$bog_vmap_lib_parse( '' )
		}

		classes(): readonly $mol_tree2[] {
			return []
		}

		@ $mol_mem
		united() {
			return this.$.$bog_vmap_lib_united( this.tree(), this.classes() )
		}

		@ $mol_mem
		index() {
			return this.$.$bog_vmap_lib_index( this.united() )
		}

		@ $mol_mem
		class_list() {
			return [ ... this.index().keys() ]
		}

		@ $mol_mem
		base_options() {
			return [ ... this.class_list() ].reverse()
		}

		class_search( query: string ) {
			return this.class_list().filter(
				this.$.$mol_match_text( query, ( name: string )=> [ name ] )
			)
		}

		@ $mol_mem_key
		inherit_chain( cl: string ) {
			return this.$.$bog_vmap_lib_chain( this.index(), cl )
		}

		@ $mol_mem_key
		props_map( base: string ) {
			return this.$.$bog_vmap_lib_props_map( this.index(), base )
		}

		@ $mol_mem_key
		props_owner( base: string ) {
			return this.$.$bog_vmap_lib_props_owner( this.index(), base )
		}

		@ $mol_mem_key
		props_of( base: string ) {
			return this.united().list( [ ... this.props_map( base ).values() ].reverse() )
		}

	}

	export class $bog_vmap_lib extends $bog_vmap_lib_any {

		@ $mol_mem
		pack( next?: string ) {
			return next ?? 'https://mol.hyoo.ru'
		}

		@ $mol_mem
		pack_base() {
			const pack = this.pack()
			return pack ? $bog_vmap_lib_slashed( pack ) : ''
		}

		@ $mol_mem
		script_link() {
			const base = this.pack_base()
			return base ? new URL( 'web.js', base ).toString() : ''
		}

		@ $mol_mem
		tree_link() {
			const base = this.pack_base()
			return base ? new URL( 'web.view.tree', base ).toString() : ''
		}

		@ $mol_mem
		override tree() {
			const uri = this.tree_link()
			if( !uri ) return this.$.$bog_vmap_lib_parse( '' )
			return this.$.$bog_vmap_lib_parse( this.$.$mol_fetch.text( uri ), uri )
		}

	}

}
