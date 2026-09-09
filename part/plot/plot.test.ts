namespace $ {

	/**
	 * Tests of the chart that takes a wire. Nothing renders: what is checked is
	 * the shape of what reaches `$mol_chart`, because that is the whole reason
	 * this class exists.
	 */
	$mol_test({

		'numbers on the port become one line, positioned by their order'( $ ) {

			const plot = $bog_vmap_part_plot.make({
				$,
				values: ()=> [ 3, 1, 4, 1, 5 ],
			}) as $$.$bog_vmap_part_plot

			// One graph for the chart, and it carries the numbers as they came.
			$mol_assert_equal( plot.Chart().graphs().length, 1 )
			$mol_assert_like( plot.Line().series_y(), [ 3, 1, 4, 1, 5 ] )

			// The axis is derived and not asked for: a wire carries one series, and
			// a second port would exist only to count from zero.
			$mol_assert_like( plot.series_x(), [ 0, 1, 2, 3, 4 ] )

		},

		'no numbers is an empty chart and not a failure'( $ ) {

			const plot = $bog_vmap_part_plot.make({ $ }) as $$.$bog_vmap_part_plot

			$mol_assert_like( plot.series_x(), [] )
			$mol_assert_like( plot.Line().series_y(), [] )

		},

	})

}
