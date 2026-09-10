namespace $ {

	$mol_test({

		'numbers on the port become one line, positioned by their order'( $ ) {

			const plot = $bog_vmap_part_plot.make({
				$,
				values: ()=> [ 3, 1, 4, 1, 5 ],
			}) as $$.$bog_vmap_part_plot

			$mol_assert_equal( plot.Chart().graphs().length, 1 )
			$mol_assert_like( plot.Line().series_y(), [ 3, 1, 4, 1, 5 ] )

			$mol_assert_like( plot.series_x(), [ 0, 1, 2, 3, 4 ] )

		},

		'no numbers is an empty chart and not a failure'( $ ) {

			const plot = $bog_vmap_part_plot.make({ $ }) as $$.$bog_vmap_part_plot

			$mol_assert_like( plot.series_x(), [] )
			$mol_assert_like( plot.Line().series_y(), [] )

		},

	})

}
