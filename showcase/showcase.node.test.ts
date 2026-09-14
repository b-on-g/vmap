namespace $ {

	$mol_test({

		'the built editor assembles a two page mortgage app from shelf parts and wires and hands it out as an archive'( $ ) {

			const out = $bog_probe_test( 'bog/vmap/showcase/-/node.js', 'bog_vmap_showcase_check', 600000 )

			$node.fs.writeFileSync( $.$mol_file.relative( 'bog/vmap/showcase/-/showcase.log' ).path(), out )

			$mol_assert_ok( out.includes( $bog_probe_skip ) || out.includes( $bog_vmap_showcase_ok ) )

		},

	})

}
