namespace $ {

	const d = '$'

	$mol_test({

		'the built editor takes a part from the shelf, opens it and comes back from a hung scene'( $ ) {

			const bundle = $.$mol_file.relative( 'bog/vmap/smoke/-/node.js' )

			if( !bundle.exists() ) $mol_fail( new Error(
				`Дымовой тест: нет ${ bundle.path() }, модуль не собран`
			) )

			const code = `
				const $ = require( ${ JSON.stringify( bundle.path() ) } )
				$[ ${ JSON.stringify( d + 'bog_vmap_smoke_check' ) } ]().then(
					report => { process.stdout.write( String( report ) + '\\n' ); process.exit( 0 ) },
					error => { process.stdout.write( 'дым упал: ' + String( ( error && error.stack ) || error ) + '\\n' ); process.exit( 1 ) },
				)
			`

			const run = $node.child_process.spawnSync( $node.process.execPath, [ '-e', code ], {
				encoding: 'utf8',
				timeout: 600000,
				maxBuffer: 1 << 24,
				cwd: $.$mol_file.relative( '.' ).path(),
			} )

			const out = String( run.stdout ?? '' ) + String( run.stderr ?? '' )

			$node.fs.writeSync( 1, out )

			if( run.status !== 0 ) $mol_fail( new Error(
				`Дымовой тест: код ${ run.status }, сигнал ${ run.signal }\n${ out }`
			) )

			$mol_assert_ok( out.includes( $bog_vmap_smoke_skip ) || out.includes( 'перезапуск одним нажатием' ) )

		},

	})

}
