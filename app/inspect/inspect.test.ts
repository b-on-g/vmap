namespace $ {

	/**
	 * Tests of the inspector stand, and only of what does not need a network.
	 *
	 * The row list needs `$bog_vmap_lib`, which fetches a deployed pack, so it is
	 * not touched here: a test that reaches the network is a test that fails on a
	 * train. What IS tested is the thing that used to eat data — a document of
	 * several classes, edited one class at a time.
	 *
	 * The guarantee itself belongs to `$bog_vmap_lang_doc` and is proven there. The
	 * point here is narrower and still worth pinning: that the stand is wired to it
	 * at all, rather than to the class model it looks like it could be wired to.
	 */
	$mol_test({

		'the stand hands the inspector one class of a multi class document'( $ ) {

			const stand = $.$bog_vmap_app_inspect_demo.make({ $ })
			const names = stand.names()

			$mol_assert_equal( names.length, 2 )
			$mol_assert_ok( stand.class_source().startsWith( names[ 0 ] ) )

		},

		'picking a class switches what the stand hands over'( $ ) {

			const stand = $.$bog_vmap_app_inspect_demo.make({ $ })
			const names = stand.names()

			stand.klass( names[ 1 ] )

			$mol_assert_ok( stand.class_source().startsWith( names[ 1 ] ) )

		},

		'an edit through the stand leaves the other class byte for byte'( $ ) {

			const stand = $.$bog_vmap_app_inspect_demo.make({ $ })
			const other = stand.names()[ 1 ]
			const before = stand.Doc().class_source( other )

			stand.class_source( stand.class_source().replace( 'count 24', 'count 42' ) )

			$mol_assert_equal( stand.Doc().class_source( other ), before )
			$mol_assert_ok( stand.class_source().includes( 'count 42' ) )

		},

		/**
		 * The classes the inspector hands to the library: the one being edited plus
		 * its siblings, and never a second copy of itself. `$bog_vmap_lib_index`
		 * keeps the LAST declaration of a name, so a stale twin among the peers
		 * would quietly shadow the class actually being edited.
		 */
		'the inspected class is not duplicated by its own peers'( $ ) {

			const stand = $.$bog_vmap_app_inspect_demo.make({ $ })
			const types = stand.Inspect().classes().map( tree => tree.type )

			$mol_assert_like( types, stand.names() )

		},

	})

}
