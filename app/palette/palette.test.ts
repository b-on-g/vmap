namespace $ {

	/**
	 * Tests of the palette field: what the list of links becomes on the way to the
	 * library and to the status line. Nothing renders and nothing is fetched — the
	 * library is never asked for its tree here.
	 */
	$mol_test({

		'the field is stored as typed and the pack address is derived with its slash'( $ ) {

			const palette = $bog_vmap_app_palette.make({ $ }) as $$.$bog_vmap_app_palette

			palette.links( 'https://b-on-g.github.io/gram' )

			$mol_assert_equal( palette.links(), 'https://b-on-g.github.io/gram' )
			$mol_assert_equal( palette.pack_link(), 'https://b-on-g.github.io/gram/' )
			$mol_assert_equal( palette.Lib().pack(), 'https://b-on-g.github.io/gram/' )
			$mol_assert_equal( palette.Lib().script_link(), 'https://b-on-g.github.io/gram/web.js' )
			$mol_assert_equal( palette.rejected_note(), '' )

		},

		'a second pack is shown under the field and does not reach the library'( $ ) {

			const palette = $bog_vmap_app_palette.make({ $ }) as $$.$bog_vmap_app_palette

			palette.links( 'https://mol.hyoo.ru, https://b-on-g.github.io/gram/' )

			$mol_assert_equal( palette.pack_link(), 'https://mol.hyoo.ru/' )
			$mol_assert_equal(
				palette.rejected_note(),
				'https://b-on-g.github.io/gram/: ' + $bog_vmap_lib_links_reason.pack_second,
			)

			// the strip is in the body only while there is something to say
			$mol_assert_equal( palette.body().includes( palette.Note() ), true )

			palette.links( 'https://mol.hyoo.ru' )
			$mol_assert_equal( palette.body().includes( palette.Note() ), false )

		},

		'a field with no pack gives an empty address and an empty library, not a failure'( $ ) {

			const palette = $bog_vmap_app_palette.make({ $ }) as $$.$bog_vmap_app_palette

			palette.links( 'AbCdEfGh_12345678_ZyXwVuTs' )

			$mol_assert_equal( palette.pack_link(), '' )
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

			palette.links( '' )

			$mol_assert_like( palette.Lib().class_list(), [ `${d}mol_view`, `${d}my_card` ] )
			$mol_assert_ok( [ ... palette.Lib().props_map( `${d}my_card` ).keys() ].includes( 'sub' ) )

		},

	})

}
