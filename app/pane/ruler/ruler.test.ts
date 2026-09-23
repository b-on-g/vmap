namespace $ {

	$mol_test({

		'the step keeps the ladder of one, two and five at every zoom'() {

			$mol_assert_equal( $bog_vmap_app_pane_ruler_step( 1 ), 100 )
			$mol_assert_equal( $bog_vmap_app_pane_ruler_step( 2 ), 50 )
			$mol_assert_equal( $bog_vmap_app_pane_ruler_step( 0.5 ), 200 )

		},

		'the step holds at the far ends of the zoom range'() {

			$mol_assert_equal( $bog_vmap_app_pane_ruler_step( 0.05 ), 2000 )
			$mol_assert_equal( $bog_vmap_app_pane_ruler_step( 16 ), 5 )

			$mol_assert_ok( $bog_vmap_app_pane_ruler_step( 0.05 ) * 0.05 >= 64 )
			$mol_assert_ok( $bog_vmap_app_pane_ruler_step( 16 ) * 16 >= 64 )

		},

		'a step of zero comes out of a zoom of zero, and nothing is drawn'() {

			$mol_assert_equal( $bog_vmap_app_pane_ruler_step( 0 ), 0 )
			$mol_assert_like( $bog_vmap_app_pane_ruler_ticks( 0, 100, 0 ), [] )

		},

		'ticks stand on round numbers inside the asked range'() {

			const ticks = $bog_vmap_app_pane_ruler_ticks( -30, 220, 100 )

			$mol_assert_like( ticks.map( tick => tick.label ), [ 0, 100, 200 ] )
			$mol_assert_like( ticks.map( tick => tick.at ), [ 0, 100, 200 ] )

		},

		'the zero of the ruler moves with its origin, labels stay relative to it'() {

			const ticks = $bog_vmap_app_pane_ruler_ticks( 100, 420, 100, 120 )

			$mol_assert_like( ticks.map( tick => tick.label ), [ 0, 100, 200, 300 ] )
			$mol_assert_like( ticks.map( tick => tick.at ), [ 120, 220, 320, 420 ] )

		},

		'an empty or inside out range gives no ticks'() {

			$mol_assert_like( $bog_vmap_app_pane_ruler_ticks( 100, 100, 10 ), [] )
			$mol_assert_like( $bog_vmap_app_pane_ruler_ticks( 200, 100, 10 ), [] )

		},

	})

}
