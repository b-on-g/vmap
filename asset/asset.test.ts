namespace $ {

	const d = '$'

	const master = 'https://baza.test/'

	function land( $: $ ) {
		return $giper_baza_land.make({ $ })
	}

	function assets( $: $, at = master ) {
		return $bog_vmap_asset.make({ $, master: ()=> at })
	}

	function yard_of(
		$: $,
		seen: ( land: string )=> null | $giper_baza_face_map,
		ports: $mol_rest_port[],
	) {

		const Yard = class extends $giper_baza_yard {

			override masters() {
				return ports
			}

			override face_port_land( [ port, land ]: [ $mol_rest_port, $giper_baza_link ] ) {
				return seen( land.str )
			}

		}

		return Yard.make({ $ })
	}

	function mirror_of(
		land: $giper_baza_land,
		shift: { time?: number, summ?: number } = {},
	) {

		const mirror = new $giper_baza_face_map

		for( const [ peer, face ] of land.faces ) {
			mirror.peer_time( peer, face.time + ( shift.time ?? 0 ), face.tick )
			mirror.peer_summ( peer, face.summ + ( shift.summ ?? 0 ) )
		}

		return mirror
	}

	function assets_of( $: $, file: $giper_baza_file, yard: $giper_baza_yard ) {
		return $bog_vmap_asset.make({
			$,
			master: ()=> master,
			pawn: ()=> file,
			yard: ()=> yard,
		})
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

		'a land no master has answered about is still on its way'( $ ) {

			const file = file_of( $ )
			const link = file.link().str

			const one = assets_of( $, file, yard_of( $, ()=> null, [ $mol_rest_port.make({}) ] ) )

			$mol_assert_equal( one.filled( link ), true )
			$mol_assert_equal( one.sent( link ), false )
			$mol_assert_equal( one.ready( link ), false )

		},

		'units the master has not seen yet keep the asset on its way'( $ ) {

			const file = file_of( $ )
			const link = file.link().str
			const land = file.land()
			const port = $mol_rest_port.make({})

			$mol_assert_ok( land.faces.size > 0 )

			const by_summ = assets_of(
				$, file,
				yard_of( $, ()=> mirror_of( land, { summ: -1 } ), [ port ] ),
			)

			$mol_assert_equal( by_summ.sent( link ), false )

			const by_time = assets_of(
				$, file,
				yard_of( $, ()=> mirror_of( land, { time: -1 } ), [ port ] ),
			)

			$mol_assert_equal( by_time.sent( link ), false )

			const empty = assets_of(
				$, file,
				yard_of( $, ()=> new $giper_baza_face_map, [ port ] ),
			)

			$mol_assert_equal( empty.sent( link ), false )

		},

		'a land the master reports back in full counts as sent'( $ ) {

			const file = file_of( $ )
			const link = file.link().str
			const land = file.land()

			const one = assets_of(
				$, file,
				yard_of( $, ()=> mirror_of( land ), [ $mol_rest_port.make({}) ] ),
			)

			$mol_assert_equal( one.sent( link ), true )
			$mol_assert_equal( one.ready( link ), true )

		},

		'the mirror is looked up by the land of the asset'( $ ) {

			const file = file_of( $ )
			const land = file.land()
			const asked = [] as string[]

			const one = assets_of(
				$, file,
				yard_of(
					$,
					at => {
						asked.push( at )
						return at === 'another land' ? mirror_of( land ) : null
					},
					[ $mol_rest_port.make({}) ],
				),
			)

			$mol_assert_equal( one.sent( file.link().str ), false )
			$mol_assert_like( asked, [ land.link().str ] )

		},

		'without a master port nothing counts as sent'( $ ) {

			const file = file_of( $ )
			const land = file.land()

			const one = assets_of( $, file, yard_of( $, ()=> mirror_of( land ), [] ) )

			$mol_assert_equal( one.sent( file.link().str ), false )

		},

		'bytes that are not here yet leave the asset unready'( $ ) {

			const empty = land( $ ).Pawn( $giper_baza_file ).Head( new $giper_baza_link( '33333333' ) )
			const link = empty.link().str

			const one = assets_of(
				$, empty,
				yard_of( $, ()=> mirror_of( empty.land() ), [ $mol_rest_port.make({}) ] ),
			)

			$mol_assert_equal( one.filled( link ), false )
			$mol_assert_equal( one.sent( link ), true )
			$mol_assert_equal( one.ready( link ), false )

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
