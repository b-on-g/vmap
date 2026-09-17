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

	const right_click = ( $: $, x = 40, y = 80 ) => new $.$mol_dom_context.MouseEvent( 'contextmenu', {
		bubbles: true,
		cancelable: true,
		clientX: x,
		clientY: y,
	} )

	$mol_test({

		'nothing to pick and nothing to name while there are no documents'( $ ) {

			const { view } = scenes( $ )

			$mol_assert_like( view.scene_links(), [] )
			$mol_assert_equal( view.current(), '' )
			$mol_assert_equal( view.current_exists(), false )
			$mol_assert_equal( view.doc_title(), '' )
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
			$mol_assert_equal( view.doc_title(), 'Second' )
			$mol_assert_equal( view.add_title(), 'Сцена 3' )

		},

		'picking a document changes what the store reads'( $ ) {

			const { store, view } = scenes( $ )

			const first = store.doc_add( 'First', src_page )
			store.doc_add( 'Second', src_hero )

			view.current( first.link().str )

			$mol_assert_equal( store.source(), src_page )
			$mol_assert_equal( view.doc_title(), 'First' )

			view.current( '' )
			$mol_assert_equal( store.source(), src_hero )

			view.current( first.link().str )
			view.current( 'not a link' )
			$mol_assert_equal( store.source(), src_hero )

		},

		'a scene leaves the list only after the question of the menu is answered'( $ ) {

			const { store, view } = scenes( $ )

			const first = store.doc_add( 'First', src_page )
			const second = store.doc_add( 'Second', src_hero )

			$mol_assert_like( view.menu_items(), [] )

			view.scene_menu( first.link().str, right_click( $ ) )

			$mol_assert_equal( view.menu_showed(), true )
			$mol_assert_equal( view.menu_left(), '40px' )
			$mol_assert_equal( view.menu_top(), '80px' )
			$mol_assert_equal( view.menu_items().length, 1 )
			$mol_assert_equal( view.menu_items()[ 0 ], view.Drop() )

			view.drop_ask()

			$mol_assert_equal( view.menu_items().length, 3 )
			$mol_assert_equal( view.menu_items()[ 0 ], view.Drop_note() )
			$mol_assert_ok( view.drop_note().startsWith( 'Удалить «First»?' ) )
			$mol_assert_like( view.scene_links(), [ first.link().str, second.link().str ] )

			view.drop()

			$mol_assert_like( view.scene_links(), [ second.link().str ] )
			$mol_assert_equal( store.doc( first.link() ).title(), 'First' )

		},

		'the question of the menu can be refused, and the list stays whole'( $ ) {

			const { store, view } = scenes( $ )

			const first = store.doc_add( 'First', src_page )
			const second = store.doc_add( 'Second', src_hero )

			view.scene_menu( first.link().str, right_click( $ ) )
			view.drop_ask()
			view.menu_close()

			$mol_assert_equal( view.menu_showed(), false )
			$mol_assert_equal( view.menu_asking(), false )
			$mol_assert_like( view.menu_items(), [] )
			$mol_assert_like( view.scene_links(), [ first.link().str, second.link().str ] )

		},

		'dropping the open scene opens the one beside it, not the last of the list'( $ ) {

			const { store, view } = scenes( $ )

			const first = store.doc_add( 'First', src_page )
			const second = store.doc_add( 'Second', src_hero )
			const third = store.doc_add( 'Third', src_page )

			view.current( first.link().str )

			view.scene_menu( first.link().str, right_click( $ ) )
			view.drop_ask()
			view.drop()

			$mol_assert_equal( view.current(), second.link().str )
			$mol_assert_equal( store.source(), src_hero )

			view.current( third.link().str )

			view.scene_menu( second.link().str, right_click( $ ) )
			view.drop_ask()
			view.drop()

			$mol_assert_equal( view.current(), third.link().str )

		},

		'dropping the last scene leaves the editor with none open'( $ ) {

			const { store, view } = scenes( $ )

			const only = store.doc_add( 'Only', src_hero )

			view.scene_menu( only.link().str, right_click( $ ) )
			view.drop_ask()
			view.drop()

			$mol_assert_like( view.scene_links(), [] )
			$mol_assert_equal( view.current(), '' )
			$mol_assert_equal( view.current_exists(), false )

		},

		'renaming writes the title of the open document and shows in the list'( $ ) {

			const { store, view } = scenes( $ )

			const first = store.doc_add( 'First', src_page )
			const second = store.doc_add( 'Second', src_hero )

			view.doc_title( 'Landing' )

			$mol_assert_equal( second.title(), 'Landing' )
			$mol_assert_equal( first.title(), 'First' )
			$mol_assert_equal( view.scene_title( second.link().str ), 'Landing' )

		},

		'the list of documents is a page with the name field and the add button in its tools'( $ ) {

			const { store, view } = scenes( $ )

			store.doc_add( 'First', src_page )

			const dom = view.dom_tree() as Element

			$mol_assert_ok( dom.querySelector( '[mol_page_head]' ) )
			$mol_assert_equal( view.title(), 'Сцены' )

			const tools = dom.querySelector( '[mol_page_tools]' )!

			$mol_assert_ok( tools.contains( view.Name().dom_node() ) )
			$mol_assert_ok( tools.contains( view.Add().dom_node() ) )
			$mol_assert_ok( dom.querySelector( '[mol_page_body]' )!.contains( view.List().dom_node() ) )

		},

		'the add button is a plus with its name in the hint, like the pages of a design tool'( $ ) {

			const { view } = scenes( $ )

			const add = view.Add().dom_tree() as Element

			$mol_assert_equal( add.textContent, '' )
			$mol_assert_ok( add.contains( view.Add_icon().dom_node() ) )
			$mol_assert_ok( add.getAttribute( 'title' )!.startsWith( 'Новая сцена' ) )

		},

	})

}
