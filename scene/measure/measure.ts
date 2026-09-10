namespace $ {

	/** As much of a DOM node as measuring needs. */
	export type $bog_vmap_scene_measure_rect = {
		readonly isConnected: boolean
		getBoundingClientRect(): {
			readonly left: number
			readonly top: number
			readonly width: number
			readonly height: number
		}
	}

	/** What the walk of one rendered document came out to. */
	export type $bog_vmap_scene_measure_result< Node > = {
		readonly sizes: { readonly [ node: string ]: $bog_vmap_scene_cull_box }
		readonly nodes: readonly Node[]
	}

	/**
	 * Geometry of a rendered document, in world units, and the nodes it was read off.
	 *
	 * Pure, and out of the view for the reason the culling decision is: this is the
	 * whole of what the host learns about the layout, and a walk worth testing is
	 * worth testing without a compiled document. Everything that knows about the
	 * framework — what counts as a view, what a view's children are, which property
	 * holds it — is handed in, so the function itself knows only rectangles and paths.
	 *
	 * The nodes come back beside the sizes because the two are one question asked
	 * twice: what the host is told about, and what has to be watched for changing
	 * behind the graph's back. Watching the root alone leaves every node inside an
	 * artboard of fixed width unwatched, and a reflow INSIDE a box that keeps its
	 * own size is exactly what an artboard is made of.
	 *
	 * @param key path of the root, which every deeper path is built onto
	 * @param zoom camera zoom the measured pixels are divided by, so the host, which
	 *        owns the camera, is told world units
	 */
	export function $bog_vmap_scene_measure<
		View extends { dom_node(): $bog_vmap_scene_measure_rect },
	>(
		root: View,
		how: {
			readonly key: string
			readonly zoom: number
			/** The kid as a view, or `null` when it is not one. */
			readonly view_of: ( kid: unknown )=> View | null
			/** Children of a view, or none when they cannot be read. */
			readonly kids_of: ( view: View )=> readonly unknown[]
			/** Property the view is held by, empty when it is held by nothing named. */
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

	/**
	 * Brings the watched set to exactly `next`, and says what it now is.
	 *
	 * Only the difference is touched: a node already watched is left alone rather
	 * than re-observed, because `ResizeObserver` delivers a first box on every fresh
	 * `observe()`, and re-observing the whole tree after every report would answer
	 * its own delivery with another report, forever.
	 */
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
