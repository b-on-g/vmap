namespace $ {

	const box = ( x: number, y: number, width: number, height: number )=> ({ x, y, width, height })

	const sized = ( gaps: readonly $bog_vmap_app_pane_gap[] )=> gaps.map( gap => gap.axis + ':' + gap.size )

	$mol_test({

		'a neighbour on the right gives the gap between the near edges'() {

			const gaps = $bog_vmap_app_pane_gaps( box( 0, 0, 100, 50 ), [ box( 180, 10, 100, 50 ) ] )

			$mol_assert_like( sized( gaps ), [ 'x:80' ] )
			$mol_assert_equal( gaps[ 0 ].from, 100 )
			$mol_assert_equal( gaps[ 0 ].to, 180 )
			$mol_assert_equal( gaps[ 0 ].cross, 30 )

		},

		'a neighbour above gives the gap up, and the nearest one wins'() {

			const gaps = $bog_vmap_app_pane_gaps(
				box( 0, 200, 100, 50 ),
				[ box( 10, 0, 100, 50 ), box( 10, 100, 100, 50 ) ],
			)

			$mol_assert_like( sized( gaps ), [ 'y:50' ] )
			$mol_assert_equal( gaps[ 0 ].from, 150 )
			$mol_assert_equal( gaps[ 0 ].to, 200 )

		},

		'a neighbour standing aside gives no number at all'() {

			const gaps = $bog_vmap_app_pane_gaps( box( 0, 0, 100, 50 ), [ box( 300, 300, 100, 50 ) ] )

			$mol_assert_like( sized( gaps ), [] )

		},

		'parts standing side by side show a zero, not silence'() {

			const gaps = $bog_vmap_app_pane_gaps( box( 0, 0, 100, 50 ), [ box( 100, 0, 100, 50 ) ] )

			$mol_assert_like( sized( gaps ), [ 'x:0' ] )

		},

		'the walls of the holder are measured as well'() {

			const gaps = $bog_vmap_app_pane_gaps( box( 120, 60, 100, 50 ), [], box( 20, 20, 400, 300 ) )

			$mol_assert_like( sized( gaps ), [ 'x:100', 'x:200', 'y:40', 'y:210' ] )

		},

		'a neighbour beats the wall when it stands closer'() {

			const gaps = $bog_vmap_app_pane_gaps(
				box( 120, 60, 100, 50 ),
				[ box( 260, 60, 40, 50 ) ],
				box( 20, 20, 400, 300 ),
			)

			$mol_assert_like( sized( gaps ), [ 'x:100', 'x:40', 'y:40', 'y:210' ] )

		},

	})

}
