namespace $ {

	export type $bog_vmap_app_store_spots = {
		readonly [ name: string ]: { readonly x: number, readonly y: number }
	}

	export type $bog_vmap_app_store_parts = {
		readonly [ klass: string ]: string
	}

	export type $bog_vmap_app_store_state = {
		readonly source: string
		readonly js: $bog_vmap_app_store_parts
		readonly css: $bog_vmap_app_store_parts
	}

	export class $bog_vmap_app_store extends $mol_object {

		home() {
			return this.$.$giper_baza_glob.home().land().Data( $bog_vmap_app_doc_home )
		}

		doc_links(): readonly $giper_baza_link[] {
			return this.home().Docs()?.items()?.filter( $mol_guard_defined ) ?? []
		}

		doc( link: $giper_baza_link ) {
			return this.$.$giper_baza_glob.Pawn( link, $bog_vmap_app_doc )
		}

		doc_arg( next?: string | null ) {
			return this.$.$mol_state_arg.value( 'doc', next )
		}

		doc_current(): $bog_vmap_app_doc | null {

			const arg = this.doc_arg()
			const checked = arg ? $giper_baza_link.check( arg ) : null
			if( checked ) return this.doc( new $giper_baza_link( checked ) )

			const last = this.doc_links().at( -1 )
			return last ? this.doc( last ) : null
		}

		doc_pick( link: $giper_baza_link | null ) {
			this.doc_arg( link?.str ?? null )
		}

		doc_editable() {
			const doc = this.doc_current()
			return doc ? doc.can_change() : true
		}

		stage(): 'ready' | 'making' | 'readonly' {
			if( !this.doc_current() ) return 'making'
			if( !this.doc_editable() ) return 'readonly'
			return 'ready'
		}

		doc_land_config(): null | $giper_baza_rank_preset {
			return [[ null, this.$.$giper_baza_rank_read ]]
		}

		title_next() {
			return `Сцена ${ this.doc_links().length + 1 }`
		}

		doc_add( title = '', source = '', spots: $bog_vmap_app_store_spots = {}, pack = '' ) {

			const doc = this.home().Docs( null )!.make( this.doc_land_config() )

			if( title ) doc.title( title )
			if( source ) this.doc_source( doc, source )
			if( pack ) doc.pack( pack )
			if( Object.keys( spots ).length ) this.doc_spots( doc, spots )

			const root = this.nodes( doc )[ 0 ]
			if( root ) doc.Root( null )!.val( root.link() )

			this.doc_pick( doc.link() )

			return doc
		}

		doc_first() {

			if( this.doc_current() ) return

			this.doc_add(
				this.title_next(),
				this.draft_source(),
				this.draft_spots(),
				this.draft_pack(),
			)

		}

		@ $mol_mem
		doc_first_task() {
			return { task: $mol_wire_async( this ).doc_first() }
		}

		boot(): 'ready' | 'making' {

			const doc = this.doc_current()

			if( doc ) {
				this.doc_keep( doc )
				return 'ready'
			}

			this.doc_first_task()

			return 'making'
		}

		doc_keep( doc: $bog_vmap_app_doc ) {
			doc.land().persisted( true )
		}

		@ $mol_mem
		draft_source( next?: string ) {
			return next ?? ''
		}

		@ $mol_mem
		draft_spots( next?: $bog_vmap_app_store_spots ): $bog_vmap_app_store_spots {
			return next ?? {}
		}

		@ $mol_mem
		draft_pack( next?: string ) {
			return next ?? ''
		}

		nodes( doc: $bog_vmap_app_doc ) {

			const links = doc.Nodes()?.items()?.filter( $mol_guard_defined ) ?? []
			const land = doc.land()

			return links.map(
				link => land.Pawn( $bog_vmap_app_doc_node ).Head( link.head() )
			)
		}

		doc_source( doc: $bog_vmap_app_doc, next?: string ): string {

			const nodes = this.nodes( doc )

			if( next === undefined ) {
				return nodes
					.map( node => node.source() )
					.filter( Boolean )
					.map( text => text.replace( /\n?$/, '\n' ) )
					.join( '' )
			}

			const trees = this.$.$mol_tree2_from_string(
				next.replace( /\n?$/, '\n' ), 'vmap.view.tree',
			).kids

			const spare = new Map< string, $bog_vmap_app_doc_node[] >()
			for( const node of nodes ) {
				const name = $bog_vmap_app_store_class_name( node.source() )
				const same = spare.get( name )
				if( same ) same.push( node )
				else spare.set( name, [ node ] )
			}

			const list = doc.Nodes( null )!
			const links = [] as $giper_baza_link[]

			for( const tree of trees ) {

				const node = spare.get( tree.type )?.shift() ?? list.make( null )

				node.source( tree.toString() )
				links.push( node.link() )

			}

			const prev = list.items().filter( $mol_guard_defined )
			const same = prev.length === links.length
				&& prev.every( ( link, index ) => link.str === links[ index ].str )

			if( !same ) list.items( links )

			return next
		}

		node( doc: $bog_vmap_app_doc, name: string ) {
			return this.nodes( doc ).find(
				node => $bog_vmap_app_store_class_name( node.source() ) === name
			) ?? null
		}

		node_js( doc: $bog_vmap_app_doc, name: string, next?: string ) {
			return this.node( doc, name )?.js( next ) ?? ''
		}

		node_css( doc: $bog_vmap_app_doc, name: string, next?: string ) {
			return this.node( doc, name )?.css( next ) ?? ''
		}

		doc_root( doc: $bog_vmap_app_doc, next?: string ) {

			if( next !== undefined ) {
				const node = this.node( doc, next )
				if( node ) doc.Root( null )!.val( node.link() )
				return next
			}

			const link = doc.Root()?.val()
			if( !link ) return ''

			const node = doc.land().Pawn( $bog_vmap_app_doc_node ).Head( link.head() )
			return $bog_vmap_app_store_class_name( node.source() )
		}

		doc_spots( doc: $bog_vmap_app_doc, next?: $bog_vmap_app_store_spots ): $bog_vmap_app_store_spots {

			if( next === undefined ) {

				const dict = doc.Spots()
				const res = {} as { [ name: string ]: { x: number, y: number } }

				const keys = ( dict?.keys() ?? [] )
					.filter( ( key ): key is string => typeof key === 'string' )
					.sort()

				for( const key of keys ) {
					const spot = dict!.key( key )
					if( spot ) res[ key ] = { x: spot.x(), y: spot.y() }
				}

				return res
			}

			const dict = doc.Spots( null )!

			for( const name of Object.keys( next ) ) {
				const spot = dict.key( name, null )!
				spot.x( next[ name ].x )
				spot.y( next[ name ].y )
			}

			for( const key of dict.keys() ) {
				if( typeof key !== 'string' ) continue
				if( !( key in next ) ) dict.has( key, false )
			}

			return next
		}

		source( next?: string ): string {

			const doc = this.doc_current()
			if( !doc ) return this.draft_source( next )

			if( next !== undefined && !doc.can_change() ) return this.doc_source( doc )

			return this.doc_source( doc, next )
		}

		spots( next?: $bog_vmap_app_store_spots ): $bog_vmap_app_store_spots {

			const doc = this.doc_current()
			if( !doc ) return this.draft_spots( next )

			if( next !== undefined && !doc.can_change() ) return this.doc_spots( doc )

			return this.doc_spots( doc, next )
		}

		title( next?: string ) {

			const doc = this.doc_current()
			if( !doc ) return ''

			if( next !== undefined && !doc.can_change() ) return doc.title()

			return doc.title( next )
		}

		pack( next?: string ) {

			const doc = this.doc_current()
			if( !doc ) return this.draft_pack( next )

			if( next !== undefined && !doc.can_change() ) return doc.pack()

			return doc.pack( next )
		}

		doc_state( doc: $bog_vmap_app_doc, next?: $bog_vmap_app_store_state ): $bog_vmap_app_store_state {

			if( next !== undefined ) {

				this.doc_source( doc, next.source )

				for( const node of this.nodes( doc ) ) {
					const name = $bog_vmap_app_store_class_name( node.source() )
					node.js( next.js[ name ] ?? '' )
					node.css( next.css[ name ] ?? '' )
				}

				return next
			}

			const js = {} as { [ klass: string ]: string }
			const css = {} as { [ klass: string ]: string }

			for( const node of this.nodes( doc ) ) {

				const name = $bog_vmap_app_store_class_name( node.source() )

				const body = node.js()
				if( body ) js[ name ] = body

				const style = node.css()
				if( style ) css[ name ] = style

			}

			return { source: this.doc_source( doc ), js, css }
		}

		snap_limit() {
			return 50
		}

		snaps( doc: $bog_vmap_app_doc ): readonly $bog_vmap_app_doc_snap[] {

			const links = doc.Snaps()?.items()?.filter( $mol_guard_defined ) ?? []
			const land = doc.land()

			return links.map(
				link => land.Pawn( $bog_vmap_app_doc_snap ).Head( link.head() )
			)
		}

		snap_state( snap: $bog_vmap_app_doc_snap ): $bog_vmap_app_store_state {
			return {
				source: snap.source(),
				js: $bog_vmap_app_store_parts_unpack( snap.js() ),
				css: $bog_vmap_app_store_parts_unpack( snap.css() ),
			}
		}

		snap_add( doc: $bog_vmap_app_doc, state: $bog_vmap_app_store_state, time: number ) {

			const snap = doc.Snaps( null )!.make( null )

			snap.time( time )
			snap.author( doc.land().auth().pass().lord().str )
			snap.source( state.source )
			snap.js( $bog_vmap_app_store_parts_pack( state.js ) )
			snap.css( $bog_vmap_app_store_parts_pack( state.css ) )

			this.snap_evict( doc )

			return snap
		}

		snap_evict( doc: $bog_vmap_app_doc ) {

			const list = doc.Snaps( null )!
			const links = list.items().filter( $mol_guard_defined )
			const extra = links.length - this.snap_limit()

			if( extra <= 0 ) return

			const land = doc.land()

			for( const link of links.slice( 0, extra ) ) {
				const snap = land.Pawn( $bog_vmap_app_doc_snap ).Head( link.head() )
				snap.source( '' )
				snap.js( '' )
				snap.css( '' )
			}

			list.items( links.slice( extra ) )

		}

	}

	export function $bog_vmap_app_store_parts_pack( parts: $bog_vmap_app_store_parts ) {
		return Object.keys( parts ).length ? JSON.stringify( parts ) : ''
	}

	export function $bog_vmap_app_store_parts_unpack( packed: string ): $bog_vmap_app_store_parts {
		if( !packed ) return {}
		return JSON.parse( packed )
	}

	export function $bog_vmap_app_store_class_name( source: string ) {
		return /^(\S+)/.exec( source.trimStart() )?.[ 1 ] ?? ''
	}

}
