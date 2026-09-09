namespace $ {

	/**
	 * The overlay cut open, as arithmetic: no pane and no camera, just the
	 * `clip-path` value the inner rectangle turns into.
	 */
	$mol_test({

		'the hole is a polygon with the box cut out of it'( $ ) {

			$mol_assert_equal( $bog_vmap_app_pane_hole( null ), 'none' )

			$mol_assert_equal(
				$bog_vmap_app_pane_hole( { left: 1, top: 2, width: 3, height: 4 } ),
				'polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, 1px 2px, 4px 2px, 4px 6px, 1px 6px, 1px 2px)',
			)

		},

	})

}
