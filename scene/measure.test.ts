namespace $ {

	/**
	 * Tests of the measurement walk and of what it hands the observer.
	 *
	 * No DOM and no compiled document: the walk is handed what a view is, what its
	 * children are and where its box is, so a fixture here is three plain objects
	 * and the arithmetic is visible.
	 */

	/** A node with a box, standing in for an element. */
	function node( left: number, top: number, width: number, height: number, isConnected = true ) {
		return {
			isConnected,
			getBoundingClientRect: ()=> ({ left, top, width, height }),
		}
	}

	type Fake = {
		readonly prop: string
		readonly box: ReturnType< typeof node >
		readonly kids: readonly Fake[]
		dom_node(): ReturnType< typeof node >
	}

	/** A view: a property name, a box and children. */
	function view( prop: string, box: ReturnType< typeof node >, kids: readonly Fake[] = [] ): Fake {
		return { prop, box, kids, dom_node: ()=> box }
	}

	function measure( root: Fake, zoom = 1 ) {
		return $bog_vmap_scene_measure( root, {
			key: '$doc',
			zoom,
			view_of: kid => ( kid as Fake )?.dom_node ? kid as Fake : null,
			kids_of: made => made.kids,
			prop_of: made => made.prop,
		} )
	}

	/**
	 * An artboard: a page of fixed width with two rows inside it, and a free part
	 * beside it on the canvas.
	 */
	function doc( width: number ) {
		return view( 'Doc', node( 0, 0, 2000, 1000 ), [
			view( 'Board', node( 100, 100, width, 600 ), [
				view( 'Head', node( 100, 100, width, 40 ) ),
				view( 'Body', node( 100, 140, width, 560 ) ),
			] ),
			view( 'Loose', node( 1500, 100, 80, 24 ) ),
		] )
	}

	$mol_test({

		/**
		 * The host addresses a node by the property that holds it, at any depth —
		 * section 1 — so the path is the chain of those names, and everything inside
		 * an artboard is reachable by one.
		 */
		'every node of the document is measured, not only the free parts'( $ ) {

			const { sizes } = measure( doc( 1280 ) )

			$mol_assert_like( Object.keys( sizes ), [
				'$doc',
				'$doc/Board',
				'$doc/Board/Head',
				'$doc/Board/Body',
				'$doc/Loose',
			] )

			$mol_assert_like( sizes[ '$doc/Board/Head' ], { x: 100, y: 100, width: 1280, height: 40 } )

		},

		/**
		 * The point of the width switcher: the artboard changes size, and so does
		 * everything laid out inside it, while the free part beside it does not move.
		 */
		'a narrower artboard reports narrower nodes inside it'( $ ) {

			const wide = measure( doc( 1280 ) ).sizes
			const narrow = measure( doc( 390 ) ).sizes

			$mol_assert_equal( wide[ '$doc/Board' ].width, 1280 )
			$mol_assert_equal( narrow[ '$doc/Board' ].width, 390 )
			$mol_assert_equal( narrow[ '$doc/Board/Body' ].width, 390 )

			$mol_assert_like( wide[ '$doc/Loose' ], narrow[ '$doc/Loose' ] )

		},

		/** The host owns the camera and is told world units, whatever the zoom. */
		'boxes are reported in world units, relative to the root'( $ ) {

			const { sizes } = measure( doc( 1280 ), 2 )

			$mol_assert_like( sizes[ '$doc/Board' ], { x: 50, y: 50, width: 640, height: 300 } )

		},

		'a node out of the document is not measured'( $ ) {

			const { sizes, nodes } = measure(
				view( 'Doc', node( 0, 0, 100, 100 ), [
					view( 'Gone', node( 0, 0, 10, 10, false ) ),
					view( 'Here', node( 0, 0, 10, 10 ) ),
				] )
			)

			$mol_assert_like( Object.keys( sizes ), [ '$doc', '$doc/Here' ] )
			$mol_assert_equal( nodes.length, 2 )

		},

		/**
		 * Watching the root alone leaves everything inside an artboard unwatched,
		 * which is exactly where a late font or a decoded image reflows without the
		 * root changing size.
		 */
		'the observer is handed every measured node'( $ ) {

			const { nodes } = measure( doc( 1280 ) )

			$mol_assert_equal( nodes.length, 5 )

		},

		'watching adds what is new, drops what is gone and leaves the rest alone'( $ ) {

			const log = [] as string[]
			const watcher = {
				observe: ( node: string )=> log.push( '+' + node ),
				unobserve: ( node: string )=> log.push( '-' + node ),
			}

			const first = $bog_vmap_scene_watch( watcher, new Set< string >(), [ 'a', 'b' ] )
			$mol_assert_like( log, [ '+a', '+b' ] )

			// A node still there is NOT observed again: every fresh `observe` gets a
			// box delivered, and a report that re-observes everything would answer
			// its own delivery with another report.
			const second = $bog_vmap_scene_watch( watcher, first, [ 'b', 'c' ] )
			$mol_assert_like( log, [ '+a', '+b', '-a', '+c' ] )
			$mol_assert_like( [ ... second ], [ 'b', 'c' ] )

			$bog_vmap_scene_watch( watcher, second, [] )
			$mol_assert_like( log, [ '+a', '+b', '-a', '+c', '-b', '-c' ] )

		},

	})

}
