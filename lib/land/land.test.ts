namespace $ {

	const d = '$'

	function shelf( $: $ ) {
		const land = $giper_baza_land.make({ $ })
		return land.Data( $bog_vmap_lib_land_shelf )
	}

	function part( shelf: $bog_vmap_lib_land_shelf, source: string ) {
		const one = shelf.Parts( null )!.make( null )
		one.tree( source )
		return one
	}

	const card_src = `${d}my_card ${d}mol_view\n\tcaption \\Карточка\n\tprice 0\n`
	const badge_src = `${d}my_badge ${d}my_card\n\tprice 1\n`

	$mol_test({

		'a library with nothing published is empty and not broken'( $ ) {

			const lib = $bog_vmap_lib_land.make({ $ })

			$mol_assert_like( lib.parts(), [] )
			$mol_assert_equal( lib.source(), '' )

			$mol_assert_like( lib.class_list(), [ `${d}mol_view` ] )

		},

		'components of a shelf come back in the order they were added'( $ ) {

			const one = shelf( $ )
			part( one, card_src )
			part( one, badge_src )

			const lib = $bog_vmap_lib_land.make({ $, shelf: ()=> one })

			$mol_assert_like(
				lib.parts().map( p => p.tree() ),
				[ card_src, badge_src ],
			)

		},

		'a land library lists its classes exactly as a pack would'( $ ) {

			const one = shelf( $ )
			part( one, card_src )
			part( one, badge_src )

			const land = $bog_vmap_lib_land.make({ $, shelf: ()=> one })
			const pack = $bog_vmap_lib_any.make({
				$,
				tree: ()=> $.$bog_vmap_lib_parse( card_src + badge_src ),
			})

			$mol_assert_like( land.class_list(), pack.class_list() )
			$mol_assert_like(
				[ ... land.props_map( `${d}my_badge` ).keys() ],
				[ ... pack.props_map( `${d}my_badge` ).keys() ],
			)

		},

		'a component inherits another component of the same library'( $ ) {

			const one = shelf( $ )
			part( one, card_src )
			part( one, badge_src )

			const lib = $bog_vmap_lib_land.make({ $, shelf: ()=> one })

			$mol_assert_like(
				lib.inherit_chain( `${d}my_badge` ),
				[ `${d}my_badge`, `${d}my_card`, `${d}mol_view`, `${d}mol_object` ],
			)

			const ports = [ ... lib.props_map( `${d}my_badge` ).keys() ]
			$mol_assert_ok( ports.includes( 'caption' ) )
			$mol_assert_ok( ports.includes( 'price' ) )
			$mol_assert_ok( ports.includes( 'sub' ) )

		},

		'classes handed to another library carry no stub'( $ ) {

			const one = shelf( $ )
			part( one, card_src )

			const lib = $bog_vmap_lib_land.make({ $, shelf: ()=> one })

			$mol_assert_like(
				lib.class_trees().map( tree => tree.type ),
				[ `${d}my_card` ],
			)

		},

		'a pack resolves the classes of a land handed to it'( $ ) {

			const one = shelf( $ )
			part( one, card_src )

			const land = $bog_vmap_lib_land.make({ $, shelf: ()=> one })
			const pack = $bog_vmap_lib_any.make({ $, classes: ()=> land.class_trees() })

			$mol_assert_like( pack.class_list(), [ `${d}mol_view`, `${d}my_card` ] )
			$mol_assert_ok(
				[ ... pack.props_map( `${d}my_card` ).keys() ].includes( 'caption' )
			)

		},

		'handwritten bodies are keyed by the class the source declares'( $ ) {

			const one = shelf( $ )
			const card = part( one, card_src )
			card.js( 'price(){ return 42 }' )
			part( one, badge_src )

			const lib = $bog_vmap_lib_land.make({ $, shelf: ()=> one })

			$mol_assert_like( lib.js(), { [ `${d}my_card` ]: 'price(){ return 42 }' } )

		},

		'the name of a class is read off its source': ( $ )=> {

			$mol_assert_equal( $bog_vmap_lib_land_name( card_src ), `${d}my_card` )
			$mol_assert_equal( $bog_vmap_lib_land_name( '' ), '' )
			$mol_assert_equal( $bog_vmap_lib_land_name( '   \n' ), '' )

		},

		'a part still hears its atom after being written through'( $ ) {

			const one = shelf( $ )
			const card = part( one, card_src )

			$mol_assert_equal( card.tree(), card_src )

			card.Tree()!.val( badge_src )

			$mol_assert_equal( card.tree(), badge_src )

		},

		'a shelf still hears its atom after being written through'( $ ) {

			const one = shelf( $ )

			one.title( 'Первая' )
			$mol_assert_equal( one.title(), 'Первая' )

			one.Title()!.val( 'Вторая' )
			$mol_assert_equal( one.title(), 'Вторая' )

		},

		'reading the parts of a shelf syncs their land unasked'( $ ) {

			const one = shelf( $ )
			part( one, card_src )

			const lib = $bog_vmap_lib_land.make({ $, shelf: ()=> one })

			const land = one.land()
			let synced = 0
			land.sync = ()=> { synced ++; return land }

			$mol_assert_equal( lib.parts().length, 1 )
			$mol_assert_ok( synced > 0 )

		},

		'a pack with a land stacked on it is one library from the outside'( $ ) {

			const pack_src = `${d}my_base ${d}mol_view\n\tpack_port \\\n`
			const tile_src = `${d}my_tile ${d}my_base\n\tcaption \\Плитка\n`
			const hero_src = `${d}my_hero ${d}my_tile\n\tcaption \\Герой\n`

			const one = shelf( $ )
			part( one, tile_src )
			part( one, hero_src )

			const lib = $bog_vmap_lib_land.make({ $, shelf: ()=> one })

			const stack = $bog_vmap_lib_land_stack.make({
				$,
				tree: ()=> $.$bog_vmap_lib_parse( pack_src ),
				lands: ()=> [ 'AbCdEfGh_12345678_ZyXwVuTs' ],
				land: ()=> lib,
			})

			$mol_assert_like(
				stack.class_list(),
				[ `${d}mol_view`, `${d}my_base`, `${d}my_tile`, `${d}my_hero` ],
			)

			$mol_assert_like(
				stack.inherit_chain( `${d}my_hero` ),
				[ `${d}my_hero`, `${d}my_tile`, `${d}my_base`, `${d}mol_view`, `${d}mol_object` ],
			)

			const ports = [ ... stack.props_map( `${d}my_hero` ).keys() ]
			$mol_assert_ok( ports.includes( 'pack_port' ) )
			$mol_assert_ok( ports.includes( 'caption' ) )
			$mol_assert_ok( ports.includes( 'sub' ) )

			$mol_assert_equal( stack.props_map( `${d}my_hero` ).get( 'caption' )!.kids[0].value, 'Герой' )

			$mol_assert_like(
				stack.land_trees().map( tree => tree.type ),
				[ `${d}my_tile`, `${d}my_hero` ],
			)

		},

		'the sources of a stack are the parts of its lands in order'( $ ) {

			const one = shelf( $ )
			part( one, card_src )
			const badge = part( one, badge_src )
			badge.js( 'price(){ return 1 }' )
			badge.css( '[my_badge] { color: red }' )

			const lib = $bog_vmap_lib_land.make({ $, shelf: ()=> one })

			const stack = $bog_vmap_lib_land_stack.make({
				$,
				lands: ()=> [ 'AbCdEfGh_12345678_ZyXwVuTs' ],
				land: ()=> lib,
			})

			$mol_assert_like( stack.parts(), [
				{ tree: card_src, js: '', css: '' },
				{ tree: badge_src, js: 'price(){ return 1 }', css: '[my_badge] { color: red }' },
			] )

		},

		'the sources of a stack follow an edit of a part'( $ ) {

			const one = shelf( $ )
			const card = part( one, card_src )

			const lib = $bog_vmap_lib_land.make({ $, shelf: ()=> one })

			const stack = $bog_vmap_lib_land_stack.make({
				$,
				lands: ()=> [ 'AbCdEfGh_12345678_ZyXwVuTs' ],
				land: ()=> lib,
			})

			$mol_assert_like( stack.parts(), [ { tree: card_src, js: '', css: '' } ] )
			$mol_assert_like( stack.land_trees().map( tree => tree.type ), [ `${d}my_card` ] )

			card.Tree()!.val( badge_src )
			card.Css( null )!.val( '[my_badge] { color: red }' )

			$mol_assert_like( stack.parts(), [ { tree: badge_src, js: '', css: '[my_badge] { color: red }' } ] )
			$mol_assert_like( stack.land_trees().map( tree => tree.type ), [ `${d}my_badge` ] )

			part( one, card_src )
			$mol_assert_equal( stack.parts().length, 2 )

		},

		'a stack with no lands is the pack alone'( $ ) {

			const stack = $bog_vmap_lib_land_stack.make({
				$,
				tree: ()=> $.$bog_vmap_lib_parse( card_src ),
			})

			$mol_assert_like( stack.class_list(), [ `${d}mol_view`, `${d}my_card` ] )
			$mol_assert_like( stack.parts(), [] )

		},

		'the link grammar copied into lib/links agrees with the database'( $ ) {

			const samples = [
				'AbCdEfGh',
				'AbCdEfGh_12345678_ZyXwVuTs',
				'AbCdEfGh_12345678_ZyXwVuTs_HeAdHeAd',
				'_12345678',
				'AbCdEfGh_',
				'æÆ123456',
				'abc',
				'AbCdEfGh_1234567',
				'AbCdEfGh_12345678_ZyXwVuTs_HeAdHeAd_TooMany1',
				'https://mol.hyoo.ru',
				'hello world',
				'',
				'_',
			]

			for( const token of samples ) {

				const ours = $bog_vmap_lib_links_is_land( token )
				const theirs = $giper_baza_link.check( token ) !== null && /[a-zæA-ZÆ0-9]{8}/.test( token )

				$mol_assert_equal( `${ token }: ${ ours }`, `${ token }: ${ theirs }` )

			}

		},

	})

}
