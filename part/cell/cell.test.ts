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

		'the body takes the inputs by number, by the name given to them and as a list'( $ ) {

			const one = cell( $ )

			one.auto( true )
			one.in1 = ()=> 3
			one.in2 = ()=> 4

			one.code( 'return in1 * in2' )
			$mol_assert_equal( one.result_number(), 12 )

			one.slots( 'width, height' )

			one.code( 'return width + height' )
			$mol_assert_equal( one.result_number(), 7 )

			one.code( 'return ins.length' )
			$mol_assert_equal( one.result_number(), 6 )

			one.code( 'return ins[ 2 ]' )
			$mol_assert_equal( one.result_text(), '' )

		},

		'a name that is no identifier is left out and the body still runs'( $ ) {

			const one = cell( $ )

			one.auto( true )
			one.in1 = ()=> 5
			one.slots( '2bad, good' )
			one.code( 'return in1 + in2' )

			$mol_assert_equal( one.error(), '' )
			$mol_assert_equal( one.result_number(), 5 )

			$mol_assert_ok( one.slots_note().includes( '«2bad»' ) )
			$mol_assert_ok( one.slots_note().includes( 'под номерами' ) )
			$mol_assert_equal( one.slots_note().includes( 'good' ), false )

			one.slots( 'good' )
			$mol_assert_equal( one.slots_note(), '' )

		},

		'a cell written before there were inputs runs as it did'( $ ) {

			const one = cell( $ )

			one.code( 'return 2 + 2' )
			one.run( null )

			$mol_assert_equal( one.result_number(), 4 )
			$mol_assert_equal( one.error(), '' )
			$mol_assert_like( one.ins(), [ null, null, null, null, null, null ] )

		},

		'an input that changes counts the cell again, even off the button'( $ ) {

			const one = cell( $ )

			const width = $mol_wire_atom.solo( {}, function width( next?: number ): number {
				return next ?? 2
			} )

			one.in1 = ()=> width.sync()

			one.code( 'return in1 * 10' )
			one.run( null )

			$mol_assert_equal( one.result_number(), 20 )

			width.put( 3 )

			$mol_assert_equal( one.result_number(), 30 )

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
