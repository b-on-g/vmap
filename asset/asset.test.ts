namespace $ {

	const d = '$'

	function land( $: $ ) {
		return $giper_baza_land.make({ $ })
	}

	const link_a = 'aaaaaaaa'
	const link_b = 'bbbbbbbb_cccccccc'

	$mol_test({

		'an address is made and read back'( $ ) {

			$mol_assert_equal( $bog_vmap_asset_uri( link_a ), 'asset:' + link_a )
			$mol_assert_equal( $bog_vmap_asset_id( 'asset:' + link_a ), link_a )

		},

		'what is not an address reads as none of one'( $ ) {

			$mol_assert_equal( $bog_vmap_asset_id( 'https://example.org/pic.png' ), null )
			$mol_assert_equal( $bog_vmap_asset_id( link_a ), null )

			$mol_assert_equal( $bog_vmap_asset_id( 'asset:' ), null )
			$mol_assert_equal( $bog_vmap_asset_id( 'asset:not a link' ), null )

		},

		'the assets of a document are listed once each, in order of mention'( $ ) {

			const source = [
				`${d}my_page ${d}mol_view`,
				`	Logo ${d}mol_image uri \\asset:${ link_b }`,
				`	Hero ${d}mol_image uri \\asset:${ link_a }`,
				`	Again ${d}mol_image uri \\asset:${ link_b }`,
				'',
			].join( '\n' )

			$mol_assert_like( $bog_vmap_asset_ids( source ), [ link_b, link_a ] )

		},

		'a document mentioning no asset lists none'( $ ) {

			$mol_assert_like(
				$bog_vmap_asset_ids( `${d}my_page ${d}mol_view\n\ttitle \\Hi\n` ),
				[],
			)

		},

		'every address is swapped for what the renderer answers'( $ ) {

			const source = `uri \\asset:${ link_a } and \\asset:${ link_b }`

			$mol_assert_equal(
				$bog_vmap_asset_swap( source, id => `blob:${ id }` ),
				`uri \\blob:${ link_a } and \\blob:${ link_b }`,
			)

		},

		'an address the renderer has no answer for is left untouched'( $ ) {

			const source = `uri \\asset:${ link_a } and \\asset:${ link_b }`

			$mol_assert_equal(
				$bog_vmap_asset_swap( source, id => id === link_a ? 'blob:here' : null ),
				`uri \\blob:here and \\asset:${ link_b }`,
			)

		},

		'text that is not an address survives a swap'( $ ) {

			const source = 'uri \\https://example.org/asset:x\n\ttitle \\asset:\n'

			$mol_assert_equal( $bog_vmap_asset_swap( source, ()=> 'blob:x' ), source )

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

		'an id that is not a link resolves to no file at all'( $ ) {

			const assets = $bog_vmap_asset.make({ $ })

			$mol_assert_equal( assets.file( 'not a link' ), null )
			$mol_assert_equal( assets.bytes( 'not a link' ), null )
			$mol_assert_equal( assets.mime( 'not a link' ), '' )

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

	})

}
