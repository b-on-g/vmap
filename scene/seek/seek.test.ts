namespace $ {

	/**
	 * The walk that gives a failure its node.
	 *
	 * Trees of plain objects, nothing compiled: what the path of a node is, is a
	 * property of the walk and not of the framework, which is exactly why the walk
	 * takes the three framework questions as arguments.
	 */
	type Probe = {
		readonly name: string
		readonly kids?: readonly Probe[]
		readonly bad?: boolean
	}

	const how = ( key: string )=> ({
		key,
		view_of: ( kid: unknown )=> ( kid as Probe )?.name === undefined ? null : kid as Probe,
		kids_of: ( view: Probe )=> view.kids ?? [],
		prop_of: ( view: Probe )=> view.name,
	})

	const bad = ( view: Probe )=> !!view.bad

	$mol_test({

		'the path of a node is the root and every property down to it'( $ ) {

			const tree: Probe = { name: 'root', kids: [
				{ name: 'Head' },
				{ name: 'Tail', kids: [ { name: 'Deep', bad: true } ] },
			] }

			$mol_assert_equal( $bog_vmap_scene_seek( tree, how( 'doc' ), bad )?.path, 'doc/Tail/Deep' )

		},

		/**
		 * A document whose own render throws is the common case, and it must not be
		 * answered with a child that merely inherited the failure.
		 */
		'the root is asked before any child'( $ ) {

			const tree: Probe = { name: 'root', bad: true, kids: [ { name: 'Kid', bad: true } ] }

			const found = $bog_vmap_scene_seek( tree, how( 'doc' ), bad )

			$mol_assert_equal( found?.path, 'doc' )
			$mol_assert_equal( found?.view, tree )

		},

		'nothing to blame comes back as nothing, not as the root'( $ ) {

			const tree: Probe = { name: 'root', kids: [ { name: 'Kid' } ] }

			$mol_assert_equal( $bog_vmap_scene_seek( tree, how( 'doc' ), bad ), null )

		},

		/**
		 * A child held by no named property is still on the path, by its position.
		 * Losing it would shift every sibling after it onto the wrong node.
		 */
		'an unnamed child is addressed by its index'( $ ) {

			const tree: Probe = { name: 'root', kids: [ { name: '' }, { name: '', bad: true } ] }

			$mol_assert_equal( $bog_vmap_scene_seek( tree, how( 'doc' ), bad )?.path, 'doc/1' )

		},

		/**
		 * Content that is not a view is skipped rather than counted: a string
		 * between two views would otherwise push the second one off its own index.
		 */
		'text between views does not take an index'( $ ) {

			const tree = { name: 'root', kids: [ 'just text', { name: '', bad: true } ] } as unknown as Probe

			$mol_assert_equal( $bog_vmap_scene_seek( tree, how( 'doc' ), bad )?.path, 'doc/0' )

		},

		/** A cycle in the tree must end the walk instead of the process. */
		'a cycle is cut by the depth limit'( $ ) {

			const loop = { name: 'Loop' } as { name: string, kids?: unknown[] }
			loop.kids = [ loop ]

			$mol_assert_equal( $bog_vmap_scene_seek( loop as Probe, how( 'doc' ), bad ), null )

		},

	})

}
