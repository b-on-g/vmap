namespace $ {

	const view = { x: 0, y: 0, width: 1000, height: 800 }

	const box = ( x: number, y: number, width = 100, height = 40 ) => ({ x, y, width, height })

	$mol_test({

		'a part inside the viewport is shown'( $ ) {

			const shown = $bog_vmap_scene_cull(
				{ A: { x: 100, y: 100 } },
				{ A: box( 100, 100 ) },
				view,
				0,
				[ 'A' ],
			)

			$mol_assert_equal( shown.has( 'A' ), true )
		},

		'a part far outside is dropped'( $ ) {

			const shown = $bog_vmap_scene_cull(
				{ A: { x: 5000, y: 5000 } },
				{ A: box( 5000, 5000 ) },
				view,
				0,
				[ 'A' ],
			)

			$mol_assert_equal( shown.has( 'A' ), false )
		},

		'a part that only overlaps by its size is shown'( $ ) {

			const shown = $bog_vmap_scene_cull(
				{ A: { x: -50, y: 100 } },
				{ A: box( -50, 100 ) },
				view,
				0,
				[ 'A' ],
			)

			$mol_assert_equal( shown.has( 'A' ), true )
		},

		'slack widens the viewport on every side'( $ ) {

			const spots = { A: { x: -300, y: 100 }, B: { x: 1200, y: 100 } }
			const sizes = { A: box( -300, 100 ), B: box( 1200, 100 ) }

			const tight = $bog_vmap_scene_cull( spots, sizes, view, 0, [ 'A', 'B' ] )
			$mol_assert_equal( tight.size, 0 )

			const loose = $bog_vmap_scene_cull( spots, sizes, view, 400, [ 'A', 'B' ] )
			$mol_assert_equal( loose.size, 2 )
		},

		'a part nothing is known about is shown'( $ ) {

			const shown = $bog_vmap_scene_cull( {}, {}, view, 0, [ 'A' ] )

			$mol_assert_equal( shown.has( 'A' ), true )
		},

		'a placed part with no measurement is judged by its spot'( $ ) {

			const near = $bog_vmap_scene_cull( { A: { x: 100, y: 100 } }, {}, view, 0, [ 'A' ] )
			$mol_assert_equal( near.has( 'A' ), true )

			const far = $bog_vmap_scene_cull( { A: { x: 5000, y: 5000 } }, {}, view, 0, [ 'A' ] )
			$mol_assert_equal( far.has( 'A' ), false )
		},

		'placement wins over the last measured origin'( $ ) {

			const shown = $bog_vmap_scene_cull(
				{ A: { x: 100, y: 100 } },
				{ A: box( 9000, 9000 ) },
				view,
				0,
				[ 'A' ],
			)

			$mol_assert_equal( shown.has( 'A' ), true )
		},

		'only the names asked about come back'( $ ) {

			const shown = $bog_vmap_scene_cull(
				{ A: { x: 10, y: 10 }, B: { x: 10, y: 10 } },
				{},
				view,
				0,
				[ 'A' ],
			)

			$mol_assert_like( [ ... shown ], [ 'A' ] )
		},

		'viewport of a camera is the screen divided by the zoom'( $ ) {

			$mol_assert_like(
				$bog_vmap_scene_cull_viewport( { x: 10, y: 20, zoom: 2 }, { width: 1000, height: 800 } ),
				{ x: 10, y: 20, width: 500, height: 400 },
			)

			$mol_assert_like(
				$bog_vmap_scene_cull_viewport( { x: 0, y: 0, zoom: .5 }, { width: 1000, height: 800 } ),
				{ x: 0, y: 0, width: 2000, height: 1600 },
			)

		},

		'a zoom of zero does not make the world infinite'( $ ) {

			$mol_assert_like(
				$bog_vmap_scene_cull_viewport( { x: 0, y: 0, zoom: 0 }, { width: 1000, height: 800 } ),
				{ x: 0, y: 0, width: 1000, height: 800 },
			)

		},

	})

}
