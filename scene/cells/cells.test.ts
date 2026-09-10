namespace $ {

	$mol_test({

		'zero argument methods of a body become cells, the rest stay methods'( $ ) {

			class Probe {
				count = 0
				plain() { return ++ this.count }
				with_arg( x: number ) { return x }
				async later() { return 1 }
			}

			$bog_vmap_scene_cells( Probe, [], [] )

			const probe = new Probe

			$mol_assert_equal( probe.plain(), 1 )
			$mol_assert_equal( probe.plain(), 1 )
			$mol_assert_ok( Reflect.get( probe, 'plain()' ) )

			$mol_assert_equal( probe.with_arg( 5 ), 5 )
			$mol_assert_equal( Reflect.get( probe, 'with_arg()' ), undefined )

			$mol_assert_ok( $mol_promise_like( probe.later() ) )
			$mol_assert_equal( Reflect.get( probe, 'later()' ), undefined )

		},

		'the tree decides for keyed and changeable methods'( $ ) {

			class Probe {
				row( id: string ) { return id }
				note( next?: string ) { return next ?? '' }
			}

			$bog_vmap_scene_cells( Probe, [ 'row' ], [ 'note' ] )

			const probe = new Probe

			$mol_assert_equal( probe.row( 'a' ), 'a' )
			$mol_assert_ok( Reflect.get( probe, 'row()' ) instanceof Map )

			$mol_assert_equal( probe.note( 'typed' ), 'typed' )
			$mol_assert_equal( probe.note(), 'typed' )

		},

	})

}
