namespace $ {

	const d = '$'

	const master = 'https://baza.test/'

	function land( $: $ ) {
		return $giper_baza_land.make({ $ })
	}

	function assets( $: $, at = master ) {
		return $bog_vmap_asset.make({ $, master: ()=> at })
	}

	function file_of( $: $, name = 'logo.png', head = '11111111' ) {
		const one = land( $ ).Pawn( $giper_baza_file ).Head( new $giper_baza_link( head ) )
		one.buffer( new Uint8Array([ 137, 80, 78, 71 ]) )
		one.type( 'image/png' )
		one.name( name )
		return one
	}

	$mol_test({

		'an address is made from the master and read back as the same link'( $ ) {

			const file = file_of( $ )
			const uri = assets( $ ).uri( file )

			$mol_assert_ok( uri.startsWith( master + '?BAZA:file=' ) )
			$mol_assert_equal( $bog_vmap_asset_link( uri ), file.link().str )

		},

		'a master written without a trailing slash gets exactly one'( $ ) {

			const file = file_of( $ )
			const uri = assets( $, 'https://baza.test' ).uri( file )

			$mol_assert_ok( uri.startsWith( 'https://baza.test/?BAZA:file=' ) )
			$mol_assert_equal( $bog_vmap_asset_link( uri ), file.link().str )

		},

		'without a master there is no address at all'( $ ) {

			$mol_assert_equal( assets( $, '' ).uri( file_of( $ ) ), '' )

		},

		'the address carries the file name for whoever saves it'( $ ) {

			const uri = assets( $ ).uri( file_of( $, 'logo.png' ) )

			$mol_assert_ok( uri.includes( ';name=logo.png' ) )

		},

		'what is not an address reads as no link'( $ ) {

			$mol_assert_equal( $bog_vmap_asset_link( 'https://example.org/pic.png' ), null )
			$mol_assert_equal( $bog_vmap_asset_link( 'aaaaaaaa' ), null )
			$mol_assert_equal( $bog_vmap_asset_link( 'https://baza.test/?BAZA:file=' ), null )
			$mol_assert_equal( $bog_vmap_asset_link( 'https://baza.test/?BAZA:file=not a link' ), null )

		},

		'the assets of a document are listed once each, in order of mention'( $ ) {

			const one = assets( $ )
			const a = file_of( $, 'a.png', '11111111' )
			const b = file_of( $, 'b.png', '22222222' )

			const source = [
				`${d}my_page ${d}mol_view`,
				`	Logo ${d}mol_image uri \\${ one.uri( b ) }`,
				`	Hero ${d}mol_image uri \\${ one.uri( a ) }`,
				`	Again ${d}mol_image uri \\${ one.uri( b ) }`,
				'',
			].join( '\n' )

			$mol_assert_like(
				$bog_vmap_asset_links( source ),
				[ b.link().str, a.link().str ],
			)

		},

		'a document mentioning no asset lists none'( $ ) {

			$mol_assert_like(
				$bog_vmap_asset_links( `${d}my_page ${d}mol_view\n\ttitle \\Hi\n` ),
				[],
			)

		},

		'bytes, name and mime survive the round trip through a file'( $ ) {

			const file = land( $ ).Data( $giper_baza_file )
			const bytes = new Uint8Array([ 137, 80, 78, 71, 13, 10, 26, 10 ])

			file.buffer( bytes )
			file.type( 'image/png' )
			file.name( 'logo.png' )

			$mol_assert_like( [ ... file.buffer() ], [ ... bytes ] )
			$mol_assert_equal( file.type(), 'image/png' )
			$mol_assert_equal( file.name(), 'logo.png' )

		},

		'a file larger than one chunk comes back whole'( $ ) {

			const file = land( $ ).Data( $giper_baza_file )
			const bytes = new Uint8Array( 2 ** 15 + 100 )
			for( let i = 0; i < bytes.length; ++i ) bytes[ i ] = i % 251

			file.buffer( bytes )

			const back = file.buffer()

			$mol_assert_equal( back.byteLength, bytes.byteLength )
			$mol_assert_equal( back[ 0 ], bytes[ 0 ] )
			$mol_assert_equal( back[ 2 ** 15 - 1 ], bytes[ 2 ** 15 - 1 ] )
			$mol_assert_equal( back[ 2 ** 15 ], bytes[ 2 ** 15 ] )
			$mol_assert_equal( back[ back.length - 1 ], bytes[ bytes.length - 1 ] )

		},

		'an address that is not one resolves to no file at all'( $ ) {

			const one = assets( $ )

			$mol_assert_equal( one.file( 'not an address' ), null )
			$mol_assert_equal( one.bytes( 'not an address' ), null )
			$mol_assert_equal( one.mime( 'not an address' ), '' )
			$mol_assert_equal( one.name( 'not an address' ), '' )

		},

		'reading a file syncs its land unasked'( $ ) {

			const one = land( $ )

			const file = one.Data( $giper_baza_file )
			file.name( 'logo.png' )

			let synced = 0
			one.sync = ()=> { synced ++; return one }

			$mol_assert_equal( file.name(), 'logo.png' )
			$mol_assert_ok( synced > 0 )

		},

		async 'a dropped file goes into a land and comes back as an address'( $ ) {

			const bytes = new Uint8Array([ 137, 80, 78, 71, 13, 10, 26, 10 ])

			const one = $bog_vmap_asset.make({
				$,
				master: ()=> master,
				land: ()=> $giper_baza_land.make({ $ }),
			})

			const file = await $mol_wire_async( one ).made(
				new $mol_blob( [ bytes ], { type: 'image/png' } )
			)

			$mol_assert_like( [ ... file.buffer() ], [ ... bytes ] )
			$mol_assert_equal( file.type(), 'image/png' )

			const uri = one.uri( file )

			$mol_assert_ok( uri.startsWith( master + '?BAZA:file=' ) )
			$mol_assert_equal( $bog_vmap_asset_link( uri ), file.link().str )

			const put = await $mol_wire_async( one ).put(
				new $mol_blob( [ bytes ], { type: 'image/png' } )
			)

			$mol_assert_ok( !!$bog_vmap_asset_link( put ) )

		},

		'the master is the one that is not the page itself'( $ ) {

			$.$giper_baza_yard = class extends $giper_baza_yard {
				static override masters_default = [ 'https://page.test/' ]
				static override masters() {
					return [ 'https://page.test/', 'https://baza.test/' ]
				}
			}

			const yard = $.$giper_baza_yard.make({ $ })

			$mol_assert_equal(
				$bog_vmap_asset.make({ $, yard: ()=> yard }).master(),
				'https://baza.test/',
			)

		},

		'the master is the one the application talks to right now'( $ ) {

			$.$giper_baza_yard = class extends $giper_baza_yard {
				static override masters_default = [ 'https://page.test/' ]
				static override masters() {
					return [ 'https://page.test/', 'https://one.test/', 'https://two.test/' ]
				}
			}

			const yard = $.$giper_baza_yard.make({ $ })
			const one = $bog_vmap_asset.make({ $, yard: ()=> yard })

			$mol_assert_equal( one.master(), 'https://one.test/' )

			yard.master_cursor( 2 )

			$mol_assert_equal( one.master(), 'https://two.test/' )

		},

	})

}
