namespace $ {

	$mol_test({

		'result follows the operands and the operation'( $ ) {

			const calc = $.$bog_vmap_part_calc.make({ $ })

			calc.left( 6 )
			calc.right( 3 )

			$mol_assert_equal( calc.result(), 9 )
			$mol_assert_equal( calc.result_text(), '9' )

			calc.op( 'sub' )
			$mol_assert_equal( calc.result(), 3 )

			calc.op( 'mul' )
			$mol_assert_equal( calc.result(), 18 )

			calc.op( 'div' )
			$mol_assert_equal( calc.result(), 2 )

		},

		'result is a number, not a string'( $ ) {

			const calc = $.$bog_vmap_part_calc.make({ $ })

			calc.left( 2.5 )
			calc.right( 0.5 )

			$mol_assert_equal( typeof calc.result(), 'number' )
			$mol_assert_equal( calc.result(), 3 )

		},

		'division by zero is NaN and says so'( $ ) {

			const calc = $.$bog_vmap_part_calc.make({ $ })

			calc.left( 5 )
			calc.right( 0 )
			calc.op( 'div' )

			$mol_assert_ok( Number.isNaN( calc.result() ) )
			$mol_assert_equal( calc.result_text(), calc.zero_note() )

			calc.left( 0 )
			$mol_assert_ok( Number.isNaN( calc.result() ) )
			$mol_assert_equal( calc.result_text(), calc.zero_note() )

		},

		'an empty operand gives no number'( $ ) {

			const calc = $.$bog_vmap_part_calc.make({ $ })

			calc.left( NaN )
			calc.right( 3 )

			$mol_assert_ok( Number.isNaN( calc.result() ) )
			$mol_assert_equal( calc.result_text(), calc.empty_note() )

		},

		'an unknown operation gives no number'( $ ) {

			const calc = $.$bog_vmap_part_calc.make({ $ })

			calc.op( 'pow' )

			$mol_assert_ok( Number.isNaN( calc.result() ) )
			$mol_assert_equal( calc.result_text(), calc.empty_note() )

		},

		'the switch offers exactly the four operations'( $ ) {

			const calc = $.$bog_vmap_part_calc.make({ $ })

			$mol_assert_equal( Object.keys( calc.Op().options() ).join( ' ' ), 'add sub mul div' )
			$mol_assert_equal( calc.Op().value(), 'add' )

			calc.Op().value( 'mul' )
			$mol_assert_equal( calc.op(), 'mul' )

		},

	})

}
