namespace $ {

	/**
	 * Tests of the compile order. Trees only, nothing is compiled: the rule that
	 * says which class is declared before which is a property of the declarations.
	 *
	 * `d` keeps `$` out of the literals so mam does not read a fixture as a
	 * dependency.
	 */
	const d = '$'

	const defs = ( $: $, src: string )=> $.$mol_tree2_from_string( src ).kids

	const names = ( trees: readonly $mol_tree2[] )=> trees.map( tree => tree.type ).join( ' ' )

	$mol_test({

		'the document comes after the libraries'( $ ) {

			const libs = defs( $, `${d}l_a ${d}mol_view\n${d}l_b ${d}l_a\n` )
			const doc = defs( $, `${d}doc ${d}l_b\n${d}doc_part ${d}mol_view\n` )

			$mol_assert_equal(
				names( $.$bog_vmap_scene_order( libs, doc ) ),
				`${d}l_a ${d}l_b ${d}doc ${d}doc_part`,
			)

		},

		'a heir written above its base moves below it'( $ ) {

			const libs = defs( $, `${d}l_b ${d}l_a\n${d}l_a ${d}mol_view\n` )

			$mol_assert_equal(
				names( $.$bog_vmap_scene_order( libs, [] ) ),
				`${d}l_a ${d}l_b`,
			)

		},

		/**
		 * The bases nobody declares are the classes of the pack, already in the
		 * sandbox: they are not in the list and must not be asked for.
		 */
		'a base the list does not declare is left to the sandbox'( $ ) {

			const doc = defs( $, `${d}doc ${d}mol_button_minor\n` )

			$mol_assert_equal( names( $.$bog_vmap_scene_order( [], doc ) ), `${d}doc` )

		},

		'a document class shadows a library class of the same name'( $ ) {

			const libs = defs( $, `${d}x ${d}mol_view\n\tfrom_lib \\\n` )
			const doc = defs( $, `${d}x ${d}mol_view\n\tfrom_doc \\\n` )

			const sorted = $.$bog_vmap_scene_order( libs, doc )

			$mol_assert_equal( names( sorted ), `${d}x` )

			// the properties of a class hang under its super node
			$mol_assert_equal( sorted[ 0 ].kids[ 0 ].kids[ 0 ].type, 'from_doc' )

		},

		'a cycle is a readable failure'( $ ) {

			const libs = defs( $, `${d}a ${d}b\n${d}b ${d}a\n` )

			$mol_assert_fail(
				()=> $.$bog_vmap_scene_order( libs, [] ),
				`Circular inheritance around ${d}a`,
			)

		},

		'nothing in gives nothing out'( $ ) {
			$mol_assert_equal( $.$bog_vmap_scene_order( [], [] ).length, 0 )
		},

	})

}
