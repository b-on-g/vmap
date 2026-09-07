namespace $ {

	/**
	 * Tests of the switcher without a DOM: what it shows and what it writes, on a
	 * store whose documents live in the home land built in place. `add()` itself is
	 * not tested here — it hands the work to a fiber and answers at once; the store
	 * method it calls is tested in `app/store/`.
	 */
	const d = '$'

	/** Canonical `tree2` formatting, see the note in `app/store/store.test.ts`. */
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

			$mol_assert_like( view.scene_dict(), {} )
			$mol_assert_equal( view.current(), '' )
			$mol_assert_equal( view.current_exists(), false )
			$mol_assert_equal( view.title(), '' )
			$mol_assert_equal( view.add_title(), 'Сцена 1' )

		},

		'the picker lists every document by title, the last one open'( $ ) {

			const { store, view } = scenes( $ )

			const first = store.doc_add( 'First', src_page )
			const second = store.doc_add( 'Second', src_hero )

			$mol_assert_like( view.scene_dict(), {
				[ first.link().str ]: 'First',
				[ second.link().str ]: 'Second',
			} )

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

			// Empty goes back to the default, the last one made.
			view.current( '' )
			$mol_assert_equal( store.source(), src_hero )

			// So does something that is not a link. (`nonsense` would be one: eight
			// letters is a valid link.)
			view.current( first.link().str )
			view.current( 'not a link' )
			$mol_assert_equal( store.source(), src_hero )

		},

		'renaming writes the title of the open document and shows in the picker'( $ ) {

			const { store, view } = scenes( $ )

			const first = store.doc_add( 'First', src_page )
			const second = store.doc_add( 'Second', src_hero )

			view.title( 'Landing' )

			$mol_assert_equal( second.title(), 'Landing' )
			$mol_assert_equal( first.title(), 'First' )
			$mol_assert_equal( view.scene_dict()[ second.link().str ], 'Landing' )

		},

	})

}
