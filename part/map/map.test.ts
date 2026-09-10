namespace $ {

	$mol_test({

		'the center defaults to Saint Petersburg'( $ ) {

			const map = $.$bog_vmap_part_map.make({ $ })

			$mol_assert_equal( map.lat(), 59.94 )
			$mol_assert_equal( map.lng(), 30.31 )
			$mol_assert_equal( [ ... map.center() ], [ 59.94, 30.31 ] )

		},

		'the center follows lat and lng and writes back into them'( $ ) {

			const map = $.$bog_vmap_part_map.make({ $ })

			map.lat( 55.75 )
			map.lng( 37.62 )
			$mol_assert_equal( [ ... map.center() ], [ 55.75, 37.62 ] )

			map.center( new $mol_vector_2d( 48.86, 2.35 ) )
			$mol_assert_equal( map.lat(), 48.86 )
			$mol_assert_equal( map.lng(), 2.35 )

		},

		'zoom is clamped into the range of the map'( $ ) {

			const map = $.$bog_vmap_part_map.make({ $ })

			$mol_assert_equal( map.zoom_limited(), 10 )

			map.zoom( 5 )
			$mol_assert_equal( map.zoom_limited(), 5 )

			map.zoom( 42 )
			$mol_assert_equal( map.zoom_limited(), 19 )

			map.zoom( -3 )
			$mol_assert_equal( map.zoom_limited(), 0 )

			map.zoom( 3.7 )
			$mol_assert_equal( map.zoom_limited(), 4 )

		},

		'zoom that is not a number falls back to the default'( $ ) {

			const map = $.$bog_vmap_part_map.make({ $ })

			map.zoom( NaN )
			$mol_assert_equal( map.zoom_limited(), 10 )

			map.zoom( Infinity )
			$mol_assert_equal( map.zoom_limited(), 10 )

		},

		'zoom written by the map itself is clamped before it reaches the port'( $ ) {

			const map = $.$bog_vmap_part_map.make({ $ })

			map.zoom_limited( 25 )
			$mol_assert_equal( map.zoom(), 19 )

			map.zoom_limited( 7 )
			$mol_assert_equal( map.zoom(), 7 )

		},

		'a mark exists exactly while the marker has text'( $ ) {

			const map = $.$bog_vmap_part_map.make({ $ })

			$mol_assert_equal( map.objects().length, 0 )

			map.marker( 'Дом' )
			$mol_assert_equal( map.objects().length, 1 )
			$mol_assert_equal( map.Mark().title(), 'Дом' )
			$mol_assert_equal( [ ... map.Mark().pos() ], [ 59.94, 30.31 ] )

			map.marker( '' )
			$mol_assert_equal( map.objects().length, 0 )

		},

	})

}
