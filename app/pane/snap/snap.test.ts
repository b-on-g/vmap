namespace $ {
	const box = ( x: number, y: number, width: number, height: number )=> ({ x, y, width, height })

	$mol_test({
		'an edge within the slack pulls the box onto the edge of its neighbour'( $ ) {
			const snap = $bog_vmap_app_pane_snap( box( 103, 300, 100, 50 ), [ box( 100, 0, 200, 100 ) ], 6 )

			$mol_assert_equal( snap.dx, -3 )
			$mol_assert_equal( snap.dy, 0 )

			$mol_assert_like( snap.lines, [
				{ axis: 'x', at: 100, from: 0, to: 350 },
				{ axis: 'x', at: 200, from: 0, to: 350 },
			] )

		},

		'the nearest pair wins on each axis, and the axes snap apart'( $ ) {
			const snap = $bog_vmap_app_pane_snap(
				box( 52, 205, 40, 40 ),
				[ box( 0, 0, 50, 50 ), box( 200, 200, 60, 60 ) ],
				6,
			)

			$mol_assert_equal( snap.dx, -2 )
			$mol_assert_equal( snap.dy, -5 )

			$mol_assert_like( snap.lines, [
				{ axis: 'x', at: 50, from: 0, to: 240 },
				{ axis: 'y', at: 200, from: 50, to: 260 },
			] )

		},

		'a centre meets a centre'( $ ) {
			const snap = $bog_vmap_app_pane_snap( box( 3, 0, 100, 40 ), [ box( 20, 100, 60, 60 ) ], 6 )

			$mol_assert_equal( snap.dx, -3 )
			$mol_assert_equal( snap.dy, 0 )

			$mol_assert_like( snap.lines, [ { axis: 'x', at: 50, from: 0, to: 160 } ] )

		},

		'beyond the slack nothing moves and no line is drawn, at the slack it snaps'( $ ) {
			const far = $bog_vmap_app_pane_snap( box( 110, 300, 100, 50 ), [ box( 100, 0, 200, 100 ) ], 6 )

			$mol_assert_equal( far.dx, 0 )
			$mol_assert_equal( far.dy, 0 )
			$mol_assert_like( far.lines, [] )

			const edge = $bog_vmap_app_pane_snap( box( 110, 300, 100, 50 ), [ box( 100, 0, 200, 100 ) ], 10 )

			$mol_assert_equal( edge.dx, -10 )
			$mol_assert_equal( edge.lines.length, 2 )

		},

		'lines on one coordinate merge into one from end to end'( $ ) {
			const snap = $bog_vmap_app_pane_snap(
				box( 100, 150, 50, 50 ),
				[ box( 100, 0, 50, 50 ), box( 100, 300, 50, 50 ) ],
				6,
			)

			$mol_assert_equal( snap.dx, 0 )
			$mol_assert_equal( snap.dy, 0 )

			$mol_assert_like( snap.lines, [
				{ axis: 'x', at: 100, from: 0, to: 350 },
				{ axis: 'x', at: 125, from: 0, to: 350 },
				{ axis: 'x', at: 150, from: 0, to: 350 },
			] )

		},

		'with no neighbours the box stays where the pointer put it'( $ ) {
			const snap = $bog_vmap_app_pane_snap( box( 7, 9, 10, 10 ), [], 6 )

			$mol_assert_like( snap, { dx: 0, dy: 0, lines: [] } )

		},

	})

}
