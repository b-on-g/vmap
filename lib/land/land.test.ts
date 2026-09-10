namespace $ {

	/**
	 * Tests of the land library.
	 *
	 * A land is built locally, the way the database's own tests build one, so there
	 * is no proof of work anywhere here and no master to wait for. `make( null )`
	 * puts a part in the same land as its shelf, which is both the storage decision
	 * and the reason this is testable at all.
	 *
	 * **`remote_list()` is never called, and that is the point of `shelf.parts()`.**
	 * It resolves links through the static glob, which waits on a master that a test
	 * does not have; the wait never ends, the run prints nothing, and every build
	 * that runs the tests hangs. Reading through the shelf's own land is the same
	 * answer without the wait.
	 *
	 * **Publishing a library into a land of its own is NOT tested.** Grabbing a land
	 * mines proof of work — a fiber and seconds against a one second limit — and a
	 * test of it would hang or flake, which reads exactly like a failed assertion.
	 * What is testable is everything after: writing the sources and reading a class
	 * tree out of them, against a land made by hand.
	 */

	/**
	 * Keeps `$` out of the fixtures. mam builds its dependency graph by a regexp
	 * over sources, string literals included, so a bare class name in a document
	 * fixture is read as a dependency of the module.
	 */
	const d = '$'

	/** A land with no proof of work behind it, as the database's own tests make one. */
	function shelf( $: $ ) {
		const land = $giper_baza_land.make({ $ })
		return land.Data( $bog_vmap_lib_land_shelf )
	}

	/** Adds a component to a shelf, in the shelf's own land. */
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

			// The stub, and nothing else. An empty land is a state, not a failure.
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

		/**
		 * The requirement of the task in one assertion: what a land library answers
		 * is what a pack library answers, down to the base class stub that a pack
		 * never carries in its own file.
		 */
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

		/**
		 * A library is one namespace, so a component may inherit another component
		 * of the same library. That only resolves because the sources are glued into
		 * one tree before parsing, which is the reason `source()` exists at all.
		 */
		'a component inherits another component of the same library'( $ ) {

			const one = shelf( $ )
			part( one, card_src )
			part( one, badge_src )

			const lib = $bog_vmap_lib_land.make({ $, shelf: ()=> one })

			$mol_assert_like(
				lib.inherit_chain( `${d}my_badge` ),
				[ `${d}my_badge`, `${d}my_card`, `${d}mol_view`, `${d}mol_object` ],
			)

			// Inherited and own ports together, exactly as for a pack class.
			const ports = [ ... lib.props_map( `${d}my_badge` ).keys() ]
			$mol_assert_ok( ports.includes( 'caption' ) )
			$mol_assert_ok( ports.includes( 'price' ) )
			$mol_assert_ok( ports.includes( 'sub' ) )

		},

		/**
		 * Composing a land onto a pack, which section 5 says is the normal case.
		 * The stub has to be absent from what is handed over, or it shadows the real
		 * base class of the pack: the index keeps the LAST declaration of a name.
		 */
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

		/**
		 * The rule this project has now paid for three times: a read path must not
		 * share a cell with a write path.
		 *
		 * Written through once, an `@ $mol_mem` accessor over a database atom freezes
		 * at the written value forever — a later change to the atom is reported by
		 * the atom and ignored by the cell. It only shows on the component you edited
		 * yourself, so in a shared library it is invisible until two people are in it.
		 *
		 * The write below goes straight to the atom, which is what a remote edit
		 * amounts to once it has merged.
		 */
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

		/**
		 * The premise the library rests on: a land syncs itself on every read of a
		 * pawn, through `sand_ordered()`, so nobody has to ask. A `sync()` called by
		 * hand used to sit in `parts()` on the belief that it did not.
		 *
		 * The counter goes on AFTER the part has been written and starts from zero,
		 * so that a write cannot pay for the read. Counting from the start would
		 * pass just as well with a land that only syncs when written to, and that is
		 * a different statement — one that would not justify dropping the call.
		 */
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

		/**
		 * The palette field in one object: a pack with a land on top. A land class
		 * inheriting a pack class, and another land class inheriting that one, both
		 * resolve their chain down into the pack — one namespace, as section 5 says.
		 *
		 * `land` is handed a local library so the link is never looked up; the link
		 * itself is a placeholder shaped like a real one.
		 */
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

			// the chain runs from the land into the pack and down to the stub
			$mol_assert_like(
				stack.inherit_chain( `${d}my_hero` ),
				[ `${d}my_hero`, `${d}my_tile`, `${d}my_base`, `${d}mol_view`, `${d}mol_object` ],
			)

			const ports = [ ... stack.props_map( `${d}my_hero` ).keys() ]
			$mol_assert_ok( ports.includes( 'pack_port' ) )
			$mol_assert_ok( ports.includes( 'caption' ) )
			$mol_assert_ok( ports.includes( 'sub' ) )

			// the nearer declaration wins the value
			$mol_assert_equal( stack.props_map( `${d}my_hero` ).get( 'caption' )!.kids[0].value, 'Герой' )

			// what is handed to the palette and the inspector carries no stub
			$mol_assert_like(
				stack.land_trees().map( tree => tree.type ),
				[ `${d}my_tile`, `${d}my_hero` ],
			)

		},

		/** What the scene receives: the three texts per component, in shelf order. */
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

		/**
		 * An author fixes a component and the consumer's scene has to follow: the
		 * sources depend on the texts of the parts, not merely on the list of links.
		 * The write goes straight to the atom, which is what a merged remote edit
		 * amounts to, and the array the scene is sent changes with it.
		 */
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
			// `null` makes the atom, the way `Parts( null )` makes the list above
			card.Css( null )!.val( '[my_badge] { color: red }' )

			$mol_assert_like( stack.parts(), [ { tree: badge_src, js: '', css: '[my_badge] { color: red }' } ] )
			$mol_assert_like( stack.land_trees().map( tree => tree.type ), [ `${d}my_badge` ] )

			// a component added later joins the list too
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

		/**
		 * The link grammar in `lib/links` is a COPY of the one in `$giper_baza_link`,
		 * kept there so that `lib/` stays free of the database. This is the guard on
		 * the copy: on a sample of tokens the two must agree. The original admits the
		 * empty string and bare underscores, which the copy rules out on purpose, so
		 * the comparison adds that one rule to the original.
		 */
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
