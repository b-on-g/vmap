namespace $ {
	const box = ( x: number, y: number, width: number, height: number ) => ({ x, y, width, height })

	$mol_test({
		'a measured box in screen pixels of the pane'( $ ) {
			$mol_assert_like(
				$bog_vmap_app_pane_screen( box( 10, 20, 30, 40 ), 2, [ 5, 7 ] ),
				{ left: 25, top: 47, width: 60, height: 80 },
			)

		},

	})

}
