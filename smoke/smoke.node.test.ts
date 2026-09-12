namespace $ {

	$mol_test({

		'the built editor takes a part from the shelf, opens it and comes back from a hung scene'( $ ) {

			const out = $bog_probe_test( 'bog/vmap/smoke/-/node.js', 'bog_vmap_smoke_check', 600000 )

			$node.fs.writeFileSync( $.$mol_file.relative( 'bog/vmap/smoke/-/smoke.log' ).path(), out )

			$mol_assert_ok( out.includes( $bog_vmap_smoke_skip ) || out.includes( 'перезапуск одним нажатием' ) )

		},

	})

}
