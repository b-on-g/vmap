namespace $ {

	/**
	 * Tests of the palette: what the address and the land trees handed in become on
	 * the way to the library. Nothing renders and nothing is fetched — the library
	 * is never asked for its tree here.
	 *
	 * The FIELD is not here any more. It moved to the shelf, which is the level of
	 * the panel that is always on screen, and its tests moved with it.
	 */
	$mol_test({

		'the address handed in reaches the library, slash and all'( $ ) {

			const palette = $bog_vmap_app_palette.make({
				$,
				pack_link: ()=> 'https://b-on-g.github.io/gram/',
			}) as $$.$bog_vmap_app_palette

			$mol_assert_equal( palette.Lib().pack(), 'https://b-on-g.github.io/gram/' )
			$mol_assert_equal( palette.Lib().script_link(), 'https://b-on-g.github.io/gram/web.js' )

		},

		'no address gives an empty library, not a failure'( $ ) {

			const palette = $bog_vmap_app_palette.make({ $ }) as $$.$bog_vmap_app_palette

			$mol_assert_equal( palette.Lib().script_link(), '' )
			$mol_assert_like( palette.Lib().class_list(), [ '$' + 'mol_view' ] )

		},

		/** Land classes handed in by the owner resolve against the pack stub like any class. */
		'classes of the lands join the list'( $ ) {

			const d = '$'

			const palette = $bog_vmap_app_palette.make({
				$,
				land_classes: ()=> $.$mol_tree2_from_string( `${d}my_card ${d}mol_view\n\tprice 0\n` ).kids,
			}) as $$.$bog_vmap_app_palette

			$mol_assert_like( palette.Lib().class_list(), [ `${d}mol_view`, `${d}my_card` ] )
			$mol_assert_ok( [ ... palette.Lib().props_map( `${d}my_card` ).keys() ].includes( 'sub' ) )

		},

	})

}
