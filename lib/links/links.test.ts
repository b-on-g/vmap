namespace $ {

	const d = '$'

	const land_a = 'AbCdEfGh_12345678_ZyXwVuTs'
	const land_b = 'QwErTyUi_09876543_MnBvCxZl'

	$mol_test({

		'an empty field is no pack, no lands and nothing refused'( $ ) {

			$mol_assert_like(
				$bog_vmap_lib_links_parse( '' ),
				{ pack: null, lands: [], rejected: [] },
			)

			$mol_assert_like(
				$bog_vmap_lib_links_parse( ' , ,\n' ),
				{ pack: null, lands: [], rejected: [] },
			)

		},

		'one pack'( $ ) {

			$mol_assert_like(
				$bog_vmap_lib_links_parse( 'https://mol.hyoo.ru' ),
				{ pack: 'https://mol.hyoo.ru', lands: [], rejected: [] },
			)

		},

		'spaces and a trailing comma are tolerated'( $ ) {

			$mol_assert_like(
				$bog_vmap_lib_links_parse( '  https://mol.hyoo.ru , ' ),
				{ pack: 'https://mol.hyoo.ru', lands: [], rejected: [] },
			)

		},

		'a pack without a slash is kept as typed and grows one in the derived address'( $ ) {

			const links = $bog_vmap_lib_links_parse( 'https://b-on-g.github.io/gram' )

			$mol_assert_equal( links.pack, 'https://b-on-g.github.io/gram' )
			$mol_assert_equal( $bog_vmap_lib_slashed( links.pack! ), 'https://b-on-g.github.io/gram/' )

			$mol_assert_equal( $bog_vmap_lib_slashed( 'https://b-on-g.github.io/gram/' ), 'https://b-on-g.github.io/gram/' )

		},

		'a second pack is refused with a reason'( $ ) {

			const links = $bog_vmap_lib_links_parse( 'https://mol.hyoo.ru, https://b-on-g.github.io/gram/' )

			$mol_assert_equal( links.pack, 'https://mol.hyoo.ru' )
			$mol_assert_like( links.lands, [] )
			$mol_assert_like( links.rejected, [
				{ link: 'https://b-on-g.github.io/gram/', reason: $bog_vmap_lib_links_reason.pack_second },
			] )

			$mol_assert_equal(
				$bog_vmap_lib_links_note( links ),
				'https://b-on-g.github.io/gram/: ' + $bog_vmap_lib_links_reason.pack_second,
			)

		},

		'a pack and two lands'( $ ) {

			$mol_assert_like(
				$bog_vmap_lib_links_parse( `https://mol.hyoo.ru, ${ land_a }, ${ land_b }` ),
				{ pack: 'https://mol.hyoo.ru', lands: [ land_a, land_b ], rejected: [] },
			)

		},

		'a land first and the pack second still gives one pack'( $ ) {

			$mol_assert_like(
				$bog_vmap_lib_links_parse( `${ land_a }\nhttps://mol.hyoo.ru` ),
				{ pack: 'https://mol.hyoo.ru', lands: [ land_a ], rejected: [] },
			)

		},

		'a repeated land is listed once'( $ ) {

			$mol_assert_like(
				$bog_vmap_lib_links_parse( `${ land_a }, ${ land_a }` ).lands,
				[ land_a ],
			)

		},

		'garbage is refused, not guessed at'( $ ) {

			const links = $bog_vmap_lib_links_parse( `hello, ${ d }mol_view, ftp://x.y, abc_def` )

			$mol_assert_equal( links.pack, null )
			$mol_assert_like( links.lands, [] )
			$mol_assert_like(
				links.rejected.map( item => item.link ),
				[ 'hello', `${ d }mol_view`, 'ftp://x.y', 'abc_def' ],
			)

			for( const item of links.rejected ) {
				$mol_assert_equal( item.reason, $bog_vmap_lib_links_reason.unknown )
			}

		},

		'a link to a pawn inside a land is a land link too'( $ ) {

			$mol_assert_equal( $bog_vmap_lib_links_is_land( land_a + '_HeAdHeAd' ), true )

			$mol_assert_equal( $bog_vmap_lib_links_is_land( '_' ), false )
			$mol_assert_equal( $bog_vmap_lib_links_is_land( '' ), false )

		},

		'a status text is empty when nothing was refused'( $ ) {
			$mol_assert_equal( $bog_vmap_lib_links_note( $bog_vmap_lib_links_parse( 'https://mol.hyoo.ru' ) ), '' )
		},

	})

}
