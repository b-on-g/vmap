namespace $ {

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

	function view( prop: string, box: ReturnType< typeof node >, kids: readonly Fake[] = [] ): Fake {
		return { prop, box, kids, dom_node: ()=> box }
	}

	function measure( root: Fake, zoom = 1 ) {
		return $bog_vmap_scene_measure( root, {
			key: 'doc',
			zoom,
			view_of: kid => ( kid as Fake )?.dom_node ? kid as Fake : null,
			kids_of: made => made.kids,
			prop_of: made => made.prop,
		} )
	}

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

		'every node of the document is measured, not only the free parts'( $ ) {

			const { sizes } = measure( doc( 1280 ) )

			$mol_assert_like( Object.keys( sizes ), [
				'doc',
				'doc/Board',
				'doc/Board/Head',
				'doc/Board/Body',
				'doc/Loose',
			] )

			$mol_assert_like( sizes[ 'doc/Board/Head' ], { x: 100, y: 100, width: 1280, height: 40 } )

		},

		'a narrower artboard reports narrower nodes inside it'( $ ) {

			const wide = measure( doc( 1280 ) ).sizes
			const narrow = measure( doc( 390 ) ).sizes

			$mol_assert_equal( wide[ 'doc/Board' ].width, 1280 )
			$mol_assert_equal( narrow[ 'doc/Board' ].width, 390 )
			$mol_assert_equal( narrow[ 'doc/Board/Body' ].width, 390 )

			$mol_assert_like( wide[ 'doc/Loose' ], narrow[ 'doc/Loose' ] )

		},

		'boxes are reported in world units, relative to the root'( $ ) {

			const { sizes } = measure( doc( 1280 ), 2 )

			$mol_assert_like( sizes[ 'doc/Board' ], { x: 50, y: 50, width: 640, height: 300 } )

		},

		'a node out of the document is not measured'( $ ) {

			const { sizes, nodes } = measure(
				view( 'Doc', node( 0, 0, 100, 100 ), [
					view( 'Gone', node( 0, 0, 10, 10, false ) ),
					view( 'Here', node( 0, 0, 10, 10 ) ),
				] )
			)

			$mol_assert_like( Object.keys( sizes ), [ 'doc', 'doc/Here' ] )
			$mol_assert_equal( nodes.length, 2 )

		},

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

			const first = $bog_vmap_scene_measure_watch( watcher, new Set< string >(), [ 'a', 'b' ] )
			$mol_assert_like( log, [ '+a', '+b' ] )

			const second = $bog_vmap_scene_measure_watch( watcher, first, [ 'b', 'c' ] )
			$mol_assert_like( log, [ '+a', '+b', '-a', '+c' ] )
			$mol_assert_like( [ ... second ], [ 'b', 'c' ] )

			$bog_vmap_scene_measure_watch( watcher, second, [] )
			$mol_assert_like( log, [ '+a', '+b', '-a', '+c', '-b', '-c' ] )

		},

	})

}
