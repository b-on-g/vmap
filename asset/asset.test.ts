namespace $ {

	/**
	 * Tests of `$bog_vmap_asset`.
	 *
	 * The address layer is covered whole: it is pure text work and every branch of
	 * it is reachable without a database. The storage layer is covered as far as a
	 * land built locally goes — writing a file and reading its bytes back is the
	 * real path, `$giper_baza_file` and all.
	 *
	 * **`put()` itself is NOT tested, deliberately.** It calls `land_grab`, which
	 * mines proof of work; that needs a fiber and takes seconds, and a mol test is
	 * given one. A test of it would either hang or flake, and a hanging test looks
	 * exactly like a failed assertion — a `node.test.js` that prints nothing — so it
	 * would cost every module downstream more than it proves. What `put` does that
	 * is testable, writing name, MIME and bytes into a file pawn, is tested below
	 * against a land made by hand.
	 */

	/**
	 * Keeps `$` out of the fixtures. mam builds its dependency graph by a regexp
	 * over sources, string literals included, so a bare class name in a document
	 * fixture is read as a dependency and the build fails looking for a package
	 * that never existed.
	 */
	const d = '$'

	/** A land with no proof of work behind it, the way baza tests make one. */
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

			// The prefix alone addresses nothing, and an id that is not a link is
			// not an id: the grammar is `$giper_baza_link`, not «any word».
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

		/**
		 * The one branch worth a test of its own: a lazy delivery means an asset is
		 * routinely not here yet, and blanking its address would turn a wait into a
		 * broken reference that arrival no longer repairs.
		 */
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

		/**
		 * A file bigger than one chunk. `$giper_baza_file` splits at 32 KB, and a
		 * fixture under that size would never once exercise the seam it glues back
		 * together — which is the only part of the round trip that can go wrong.
		 */
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

	})

}
