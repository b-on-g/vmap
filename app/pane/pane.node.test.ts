namespace $ {

	const sheets = ()=> {

		const seen = new Map< string, string[] >()

		const walk = ( dir: $mol_file ): void => {

			for( const kid of dir.sub() ) {

				if( kid.type() === 'dir' ) {
					if( kid.name().startsWith( '-' ) ) continue
					walk( kid )
					continue
				}

				if( !kid.name().endsWith( '.view.css.ts' ) ) continue

				for( const line of kid.text().split( '\n' ) ) {

					const found = /\$mol_style_define\(\s*(\$[\w$]+)/.exec( line )
					if( !found ) continue

					const klass = found[ 1 ]
					const where = seen.get( klass ) ?? []

					where.push( kid.relate( $mol_file.relative( '.' ) ) )
					seen.set( klass, where )

				}

			}

		}

		walk( $mol_file.relative( 'bog/vmap' ) )

		return seen
	}

	$mol_test({

		'no component in vmap gets a second style sheet'() {

			const doubled = [ ... sheets() ]
				.filter( ( [ , where ] )=> where.length > 1 )
				.map( ( [ klass, where ] )=> `${ klass }: ${ where.join( ', ' ) }` )

			$mol_assert_like( doubled, [] )

		},

		'the pane itself declares its sheet once'() {

			const where = sheets().get( '$bog_vmap_app_pane' ) ?? []

			$mol_assert_equal( where.length, 1 )

		},

	})

}
