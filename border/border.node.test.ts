namespace $ {

	$mol_test({

		'the sandboxed scene frame holds every isolation criterion in the built editor'( $ ) {

			const out = $bog_probe_test( 'bog/vmap/border/-/node.js', 'bog_vmap_border_check', 600000 )

			$node.fs.writeFileSync( $.$mol_file.relative( 'bog/vmap/border/-/border.log' ).path(), out )

			$mol_assert_ok( out.includes( $bog_probe_skip ) || out.includes( $bog_vmap_border_ok ) )

		},

	})

}
