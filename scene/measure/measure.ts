namespace $ {

	export type $bog_vmap_scene_measure_rect = {
		readonly isConnected: boolean
		getBoundingClientRect(): {
			readonly left: number
			readonly top: number
			readonly width: number
			readonly height: number
		}
	}

	export type $bog_vmap_scene_measure_result< Node > = {
		readonly sizes: { readonly [ node: string ]: $bog_vmap_scene_cull_box }
		readonly nodes: readonly Node[]
	}

	export function $bog_vmap_scene_measure<
		View extends { dom_node(): $bog_vmap_scene_measure_rect },
	>(
		root: View,
		how: {
			readonly key: string
			readonly zoom: number
			readonly view_of: ( kid: unknown )=> View | null
			readonly kids_of: ( view: View )=> readonly unknown[]
			readonly prop_of: ( view: View )=> string
		},
	): $bog_vmap_scene_measure_result< ReturnType< View[ 'dom_node' ] > > {

		const sizes = {} as { [ node: string ]: $bog_vmap_scene_cull_box }
		const nodes = [] as ReturnType< View[ 'dom_node' ] >[]

		const base = root.dom_node().getBoundingClientRect()
		const zoom = how.zoom || 1

		const put = ( key: string, view: View )=> {

			const node = view.dom_node() as ReturnType< View[ 'dom_node' ] >
			if( !node.isConnected ) return

			const box = node.getBoundingClientRect()

			sizes[ key ] = {
				x: ( box.left - base.left ) / zoom,
				y: ( box.top - base.top ) / zoom,
				width: box.width / zoom,
				height: box.height / zoom,
			}

			nodes.push( node )
		}

		const walk = ( view: View, path: string, depth: number )=> {

			if( depth > 16 ) return

			let index = 0

			for( const kid of how.kids_of( view ) ) {

				const sub = how.view_of( kid )
				if( !sub ) continue

				const key = path + '/' + ( how.prop_of( sub ) || index )
				index ++

				put( key, sub )
				walk( sub, key, depth + 1 )

			}

		}

		put( how.key, root )
		walk( root, how.key, 0 )

		return { sizes, nodes }
	}

	export function $bog_vmap_scene_measure_watch< Node >(
		watcher: {
			observe( node: Node ): void
			unobserve( node: Node ): void
		},
		prev: ReadonlySet< Node >,
		next: readonly Node[],
	) {

		const kept = new Set( next )

		for( const node of prev ) if( !kept.has( node ) ) watcher.unobserve( node )
		for( const node of kept ) if( !prev.has( node ) ) watcher.observe( node )

		return kept
	}

}
