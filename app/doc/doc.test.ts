namespace $ {

	/**
	 * Tests of the document schema.
	 *
	 * Everything runs on bare lands made in place, with no master and no network.
	 * Deliberately absent: `remote_list()`, which resolves links through the static
	 * `glob.Land`, waits for a master that the tests do not have, and suspends for
	 * ever; and land grabbing, which costs proof of work. A hanging test is worse
	 * than a missing one here, because a failed assertion and a hung run look
	 * exactly alike — silence, no output — and the build hangs with it.
	 *
	 * `d` keeps `$` out of the string literals: mam builds its dependency graph by
	 * a regexp over sources, literals included.
	 */
	const d = '$'

	const src_root = `${d}bog_vmap_app_doc_test_page ${d}mol_view\n\tCalc ${d}bog_vmap_app_doc_test_calc\n\tcalc_result = Calc result\n\tsub / <= Calc\n`
	const src_hero = `${d}bog_vmap_app_doc_test_hero ${d}mol_view title \\Hi\n`

	/** Heads fixed by hand, so two peers address the same node without a list. */
	const head_root = new $giper_baza_link( '11111111' )
	const head_hero = new $giper_baza_link( '22222222' )

	/** A wire method leaves its original on the wrapper. That is how we spot one. */
	function wired( value: unknown ) {
		return typeof value === 'function' && 'orig' in value
	}

	function statics_own( Klass: Function ) {
		return Object.getOwnPropertyNames( Klass )
			.filter( name => ![ 'length', 'name', 'prototype' ].includes( name ) )
			.map( name => ({ name, value: Object.getOwnPropertyDescriptor( Klass, name )?.value }) )
	}

	$mol_test({

		'three sources of a node survive a write and a read'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const node = land.Pawn( $bog_vmap_app_doc_node ).Head( head_root )

			$mol_assert_equal( node.source(), '' )
			$mol_assert_equal( node.js(), '' )
			$mol_assert_equal( node.css(), '' )

			node.source( src_root )
			node.js( 'result(){ return 42 }' )
			node.css( '[bog_vmap_app_doc_test_page]{ color: red }' )

			$mol_assert_equal( node.source(), src_root )
			$mol_assert_equal( node.js(), 'result(){ return 42 }' )
			$mol_assert_equal( node.css(), '[bog_vmap_app_doc_test_page]{ color: red }' )

		},

		/**
		 * Coordinates in `atom_real`. The point of the test is the round trip itself:
		 * `atom_bint` takes `3000n` and gives back `null`, which is why numbers here
		 * are floats and why this is pinned rather than assumed.
		 */
		'canvas coordinates survive a write and a read'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const doc = land.Pawn( $bog_vmap_app_doc ).Data()

			const spot = doc.Spots( null )!.key( 'Calc', null )!

			$mol_assert_equal( spot.x(), 0 )
			$mol_assert_equal( spot.y(), 0 )

			spot.x( 3000 )
			spot.y( -12.5 )

			$mol_assert_equal( spot.x(), 3000 )
			$mol_assert_equal( spot.y(), -12.5 )

			$mol_assert_equal( doc.Spots()!.key( 'Calc' )!.x(), 3000 )

		},

		/**
		 * The payoff of one atom per node: two people editing two different nodes
		 * both keep their text. One `sand_ordered` over the whole document would
		 * lose one of the two.
		 */
		async 'edits to different nodes merge without loss'( $ ) {

			const land1 = $giper_baza_land.make({ $ })
			const land2 = $giper_baza_land.make({ $ })

			land1.Pawn( $bog_vmap_app_doc_node ).Head( head_root ).source( src_root )

			land2.tick()
			land2.Pawn( $bog_vmap_app_doc_node ).Head( head_hero ).source( src_hero )

			await $mol_wire_async( land1 ).units_steal( land2 )

			$mol_assert_equal( land1.Pawn( $bog_vmap_app_doc_node ).Head( head_root ).source(), src_root )
			$mol_assert_equal( land1.Pawn( $bog_vmap_app_doc_node ).Head( head_hero ).source(), src_hero )

		},

		/**
		 * The other half of the same trade, stated honestly: inside ONE node the
		 * later write wins outright, there is no merge. Per node LWW is the choice
		 * of section 9, not a shortcoming of this schema, and it stands until the
		 * engine's own ordered text is fixed.
		 */
		async 'edits to one node are last write wins'( $ ) {

			const land1 = $giper_baza_land.make({ $ })
			const land2 = $giper_baza_land.make({ $ })

			land1.Pawn( $bog_vmap_app_doc_node ).Head( head_root ).source( src_root )

			land2.tick()
			land2.Pawn( $bog_vmap_app_doc_node ).Head( head_root ).source( src_hero )

			await $mol_wire_async( land1 ).units_steal( land2 )

			$mol_assert_equal( land1.Pawn( $bog_vmap_app_doc_node ).Head( head_root ).source(), src_hero )

		},

		/**
		 * The regression that made every accessor here a plain method.
		 *
		 * With `@$mol_mem` on `source()` this fails: the node whose text you typed
		 * yourself freezes at your version and never shows the merged one, for the
		 * rest of the session. Read-only cells track fine, so the fault hides until
		 * two people edit the same document — precisely the case section 9 is about.
		 *
		 * The same shape is inherited from the entity of the database, which is why
		 * `doc.title()` is overridden rather than reused.
		 */
		async 'a locally edited node still sees a remote edit'( $ ) {

			const land1 = $giper_baza_land.make({ $ })
			const land2 = $giper_baza_land.make({ $ })

			const node1 = land1.Pawn( $bog_vmap_app_doc_node ).Head( head_root )
			node1.source( src_root )
			$mol_assert_equal( node1.source(), src_root )

			land2.tick()
			land2.Pawn( $bog_vmap_app_doc_node ).Head( head_root ).Tree( null )!.val( src_hero )

			await $mol_wire_async( land1 ).units_steal( land2 )

			$mol_assert_equal( node1.Tree()!.val(), src_hero )
			$mol_assert_equal( node1.source(), src_hero )

		},

		'a document titles itself and points at its root'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const doc = land.Pawn( $bog_vmap_app_doc ).Data()

			doc.title( 'Landing' )
			$mol_assert_equal( doc.title(), 'Landing' )

			$mol_assert_equal( doc.pack(), '' )
			doc.pack( 'https://mol.hyoo.ru' )
			$mol_assert_equal( doc.pack(), 'https://mol.hyoo.ru' )

			const root = land.Pawn( $bog_vmap_app_doc_node ).Head( head_root )
			root.source( src_root )

			doc.Root( null )!.remote( root )

			/**
			 * Read back as a raw link, not through `remote()`. The typed getter
			 * resolves the target with the STATIC glob, which waits on a master the
			 * tests do not have. Storing the link is the schema's whole job here.
			 */
			$mol_assert_equal( doc.Root()!.val()!.str, root.link().str )

		},

		/**
		 * The schema is exactly this and nothing else.
		 *
		 * Pinned key by key on purpose. Every field anybody is tempted to add here —
		 * the class name, the property list, the wires — is recomputable from `Tree`,
		 * and a stored copy of a derived thing is the first source of desync. Wires
		 * in particular are two lines of the source text, see the note in `doc.ts`.
		 */
		'nothing derivable is stored'( $ ) {

			$mol_assert_like(
				Object.keys( $bog_vmap_app_doc_node.schema ),
				[ 'Tree', 'Js', 'Css' ],
			)

			$mol_assert_like(
				Object.keys( $bog_vmap_app_doc_spot.schema ),
				[ 'X', 'Y' ],
			)

			$mol_assert_like(
				Object.keys( $bog_vmap_app_doc.schema ),
				[ 'Title', 'Nodes', 'Root', 'Spots', 'Pack' ],
			)

			$mol_assert_like(
				Object.keys( $bog_vmap_app_doc_home.schema ),
				[ 'Docs' ],
			)

		},

		/**
		 * The schema stays pure.
		 *
		 * A static action decorator on an entity takes the class itself as the fiber
		 * owner, so fibers stop deduplicating consistently and writes go missing
		 * between devices with no error anywhere. It cost a rewrite once already.
		 * Checked rather than reviewed, because the damage is silent and the
		 * temptation to put one CRUD helper on the class is permanent.
		 */
		'schema carries no static wire methods'( $ ) {

			for( const Klass of $bog_vmap_app_doc_schema ) {

				const wired_names = statics_own( Klass )
					.filter( prop => wired( prop.value ) )
					.map( prop => prop.name )

				$mol_assert_like( wired_names, [] )

			}

		},

	})

}
