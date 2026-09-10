namespace $ {

	function cell( $: $ ) {
		return $bog_vmap_part_cell.make({ $ }) as $$.$bog_vmap_part_cell
	}

	$mol_test({

		'nothing runs until the button is pressed'( $ ) {

			const one = cell( $ )

			one.code( 'return 2 + 2' )

			$mol_assert_equal( one.result_text(), '' )
			$mol_assert_equal( one.spent(), '' )

			one.run( null )

			$mol_assert_equal( one.result_text(), '4' )
			$mol_assert_equal( one.result_number(), 4 )
			$mol_assert_ok( one.spent().endsWith( 'мс' ) )

		},

		'reactive mode follows the text with no button at all'( $ ) {

			const one = cell( $ )

			one.auto( true )
			one.code( 'return 40 + 2' )

			$mol_assert_equal( one.result_number(), 42 )

			one.code( 'return 1' )
			$mol_assert_equal( one.result_number(), 1 )

		},

		'the answer comes out on both ports, each in its own type'( $ ) {

			const one = cell( $ )

			one.auto( true )

			one.code( 'return 7' )
			$mol_assert_equal( one.result_number(), 7 )
			$mol_assert_equal( one.result_text(), '7' )

			one.code( 'return "hi"' )
			$mol_assert_equal( one.result_text(), 'hi' )
			$mol_assert_equal( Number.isNaN( one.result_number() ), true )

			one.code( 'return { a: 1 }' )
			$mol_assert_ok( one.result_text().includes( '"a": 1' ) )

		},

		'a mistake is a line on the cell and not a failure of the page'( $ ) {

			const one = cell( $ )

			one.auto( true )
			one.code( 'return nope' )

			$mol_assert_equal( one.result_text(), '' )
			$mol_assert_ok( one.error().includes( 'nope' ) )

			one.code( 'return 1' )
			$mol_assert_equal( one.error(), '' )

		},

	})

}
