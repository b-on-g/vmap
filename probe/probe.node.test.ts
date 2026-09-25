namespace $ {

	$mol_test({

		'the built editor keeps its layout even at 1280 and 400'( $ ) {

			const out = $bog_probe_test( 'bog/vmap/probe/-/node.js', 'bog_vmap_probe_check', 600000 )

			$node.fs.writeFileSync( $.$mol_file.relative( 'bog/vmap/probe/-/probe.log' ).path(), out )

			const ok = out.includes( $bog_probe_skip ) || out.includes( $bog_vmap_probe_ok )

			if( !ok ) {
				const broken = out.split( '\n' ).filter( line => line.includes( 'КРИВО' ) )
				console.error( broken.length ? broken.join( '\n' ) : out.slice( -4000 ) )
			}

			$mol_assert_ok( ok )

		},

	})

}
