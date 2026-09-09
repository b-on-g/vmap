namespace $ {

	/**
	 * Tests of the culling decision.
	 *
	 * Nothing here needs a DOM, a camera or a compiled document, which is the whole
	 * reason the decision was pulled out of the view: the measurement of «a thousand
	 * nodes do not render» belongs in a browser, but the rule that says which ones
	 * do not is arithmetic and belongs here.
	 */
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

		/** Off screen by its corner, on screen by its body. Culling by the point alone would lose it. */
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

		/**
		 * The deadlock this function must not be able to produce: a part hidden
		 * because nothing is known about it would never be drawn, never be measured,
		 * and so never stop being unknown.
		 */
		'a part nothing is known about is shown'( $ ) {

			const shown = $bog_vmap_scene_cull( {}, {}, view, 0, [ 'A' ] )

			$mol_assert_equal( shown.has( 'A' ), true )
		},

		/** A placed but unmeasured part counts as a point, so it is drawn once and measured. */
		'a placed part with no measurement is judged by its spot'( $ ) {

			const near = $bog_vmap_scene_cull( { A: { x: 100, y: 100 } }, {}, view, 0, [ 'A' ] )
			$mol_assert_equal( near.has( 'A' ), true )

			const far = $bog_vmap_scene_cull( { A: { x: 5000, y: 5000 } }, {}, view, 0, [ 'A' ] )
			$mol_assert_equal( far.has( 'A' ), false )
		},

		/**
		 * The spot wins over the measured origin, and it has to: after a drag the
		 * host has already moved the part, while the last measurement still describes
		 * where it used to be. Judging by the stale origin would blink the node out
		 * exactly while it is being dragged across the edge.
		 */
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

		/** A zoom of zero comes from outside, and a viewport of `Infinity` is not an answer. */
		'a zoom of zero does not make the world infinite'( $ ) {

			$mol_assert_like(
				$bog_vmap_scene_cull_viewport( { x: 0, y: 0, zoom: 0 }, { width: 1000, height: 800 } ),
				{ x: 0, y: 0, width: 1000, height: 800 },
			)

		},

	})

}
