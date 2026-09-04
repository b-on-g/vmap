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
		 * is what a pack library answers, down to the `$mol_view` stub that a pack
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
		 * `$mol_view` of the pack: `index` keeps the LAST declaration of a name.
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

	})

}
