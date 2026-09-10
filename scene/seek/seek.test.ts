namespace $ {

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

		'an unnamed child is addressed by its index'( $ ) {

			const tree: Probe = { name: 'root', kids: [ { name: '' }, { name: '', bad: true } ] }

			$mol_assert_equal( $bog_vmap_scene_seek( tree, how( 'doc' ), bad )?.path, 'doc/1' )

		},

		'text between views does not take an index'( $ ) {

			const tree = { name: 'root', kids: [ 'just text', { name: '', bad: true } ] } as unknown as Probe

			$mol_assert_equal( $bog_vmap_scene_seek( tree, how( 'doc' ), bad )?.path, 'doc/0' )

		},

		'a cycle is cut by the depth limit'( $ ) {

			const loop = { name: 'Loop' } as { name: string, kids?: unknown[] }
			loop.kids = [ loop ]

			$mol_assert_equal( $bog_vmap_scene_seek( loop as Probe, how( 'doc' ), bad ), null )

		},

	})

}
