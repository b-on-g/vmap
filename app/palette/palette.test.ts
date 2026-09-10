namespace $ {

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

		'a pack that does not answer says so, and says what was looked for'( $ ) {

			const palette = $bog_vmap_app_palette.make({
				$,
				pack_link: ()=> 'http://dead.test/',
				Lib: ()=> $bog_vmap_lib.make({
					$,
					pack: ()=> 'http://dead.test/',
					tree: ()=> $mol_fail( new Error( 'Not Found' ) ),
				}),
			}) as $$.$bog_vmap_app_palette

			$mol_assert_like( palette.class_list(), [] )

			const note = palette.total()
			$mol_assert_ok( note.includes( 'Not Found' ) )
			$mol_assert_ok( note.includes( 'http://dead.test/web.view.tree' ) )

		},

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
