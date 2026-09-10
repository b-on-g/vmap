namespace $ {

	const d = '$'

	const src_page = `${d}bog_vmap_app_scenes_test_page ${d}mol_view\n\tCalc ${d}mol_view\n\tsub / <= Calc\n`
	const src_hero = `${d}bog_vmap_app_scenes_test_hero ${d}mol_view\n\ttitle \\Hi\n\tsub / <= title\n`

	function scenes( $: $ ) {

		const store = $bog_vmap_app_store.make({
			$,
			doc_land_config: ()=> null,
		})

		const view = $bog_vmap_app_scenes.make({
			$,
			store: ()=> store,
		}) as $$.$bog_vmap_app_scenes

		return { store, view }
	}

	$mol_test({

		'nothing to pick and nothing to name while there are no documents'( $ ) {

			const { view } = scenes( $ )

			$mol_assert_like( view.scene_links(), [] )
			$mol_assert_equal( view.current(), '' )
			$mol_assert_equal( view.current_exists(), false )
			$mol_assert_equal( view.title(), '' )
			$mol_assert_equal( view.add_title(), 'Сцена 1' )

		},

		'the list carries every document by title, the last one open'( $ ) {

			const { store, view } = scenes( $ )

			const first = store.doc_add( 'First', src_page )
			const second = store.doc_add( 'Second', src_hero )

			$mol_assert_like(
				view.scene_links(),
				[ first.link().str, second.link().str ],
			)

			$mol_assert_like(
				view.scene_links().map( link => view.scene_title( link ) ),
				[ 'First', 'Second' ],
			)

			$mol_assert_like(
				view.scene_links().map( link => view.scene_current( link ) ),
				[ false, true ],
			)

			$mol_assert_equal( view.current(), second.link().str )
			$mol_assert_equal( view.current_exists(), true )
			$mol_assert_equal( view.title(), 'Second' )
			$mol_assert_equal( view.add_title(), 'Сцена 3' )

		},

		'picking a document changes what the store reads'( $ ) {

			const { store, view } = scenes( $ )

			const first = store.doc_add( 'First', src_page )
			store.doc_add( 'Second', src_hero )

			view.current( first.link().str )

			$mol_assert_equal( store.source(), src_page )
			$mol_assert_equal( view.title(), 'First' )

			view.current( '' )
			$mol_assert_equal( store.source(), src_hero )

			view.current( first.link().str )
			view.current( 'not a link' )
			$mol_assert_equal( store.source(), src_hero )

		},

		'renaming writes the title of the open document and shows in the list'( $ ) {

			const { store, view } = scenes( $ )

			const first = store.doc_add( 'First', src_page )
			const second = store.doc_add( 'Second', src_hero )

			view.title( 'Landing' )

			$mol_assert_equal( second.title(), 'Landing' )
			$mol_assert_equal( first.title(), 'First' )
			$mol_assert_equal( view.scene_title( second.link().str ), 'Landing' )

		},

	})

}
