namespace $ {

	/**
	 * Tests of the editor shell that need no DOM.
	 *
	 * Nothing here renders. What is checked is the rule that the canvas must not be
	 * able to break: where the camera points is not part of the document.
	 *
	 * `d` keeps `$` out of the string literals — mam builds its dependency graph by
	 * a regexp over sources, literals included, so a bare class name in a fixture
	 * would drag a whole module into the bundle.
	 */
	const d = '$'

	$mol_test({

		/**
		 * FIRST INVARIANT OF CULLING: what is drawn may depend on the camera, what is
		 * stored may not — not by a byte.
		 *
		 * Cheap to check and worth checking, because the tempting way to implement
		 * culling is to push a document with the off screen parts left out of `sub`.
		 * That reads as harmless, costs a full recompile per frame of panning, and
		 * quietly makes the saved document a function of where the user was looking.
		 * This test fails the moment anybody tries it.
		 */
		'panning does not touch the document'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )
			app.part_drop( `${d}mol_string`, 300, 400 )

			const before = app.doc_source()

			const pane = app.Pane() as $$.$bog_vmap_app_pane
			pane.camera_shift( new $mol_vector_2d( -900, -700 ) )
			pane.camera_zoom( 4 )
			pane.camera_shift( new $mol_vector_2d( 0, 0 ) )
			pane.camera_zoom( 1 )

			$mol_assert_equal( app.doc_source(), before )

		},

		/** Placement is editor state and moves with the camera never, with a drag only. */
		'panning does not touch the placement'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )
			const before = JSON.stringify( app.spots() )

			const pane = app.Pane() as $$.$bog_vmap_app_pane
			pane.camera_shift( new $mol_vector_2d( -500, -500 ) )

			$mol_assert_equal( JSON.stringify( app.spots() ), before )

		},

		/**
		 * Boxes survive a report that does not mention them, because culling makes
		 * silence mean «not drawn» rather than «has no size». Only a delete clears one.
		 */
		'measured boxes survive a report without them'( $ ) {

			const pane = $bog_vmap_app_pane.make({
				$,
				doc_root: ()=> `${d}doc`,
			}) as $$.$bog_vmap_app_pane

			pane.sizes_last = {
				[ `${d}doc/A` ]: { x: 0, y: 0, width: 10, height: 10 },
				[ `${d}doc/B` ]: { x: 20, y: 0, width: 10, height: 10 },
			}

			// What a report looks like once `B` has been culled: it is simply absent.
			pane.sizes_last = { ... pane.sizes_last, [ `${d}doc/A` ]: { x: 5, y: 5, width: 10, height: 10 } }

			$mol_assert_equal( pane.sizes_last[ `${d}doc/A` ].x, 5 )
			$mol_assert_equal( Boolean( pane.sizes_last[ `${d}doc/B` ] ), true )

			pane.sizes_forget( 'B' )

			$mol_assert_equal( Boolean( pane.sizes_last[ `${d}doc/B` ] ), false )
			$mol_assert_equal( Boolean( pane.sizes_last[ `${d}doc/A` ] ), true )

		},

		/** A part's own sub views go with it, or they would outlive their owner. */
		'forgetting a part forgets what was measured inside it'( $ ) {

			const pane = $bog_vmap_app_pane.make({
				$,
				doc_root: ()=> `${d}doc`,
			}) as $$.$bog_vmap_app_pane

			pane.sizes_last = {
				[ `${d}doc/Icon` ]: { x: 0, y: 0, width: 10, height: 10 },
				[ `${d}doc/Icon/Path` ]: { x: 0, y: 0, width: 8, height: 8 },
				[ `${d}doc/Icons` ]: { x: 0, y: 0, width: 10, height: 10 },
			}

			pane.sizes_forget( 'Icon' )

			$mol_assert_equal( Boolean( pane.sizes_last[ `${d}doc/Icon` ] ), false )
			$mol_assert_equal( Boolean( pane.sizes_last[ `${d}doc/Icon/Path` ] ), false )

			// A name this one is a prefix of is a different part and must stay.
			$mol_assert_equal( Boolean( pane.sizes_last[ `${d}doc/Icons` ] ), true )

		},

		/**
		 * The whole way of a land from the field to the wire, on a land built by hand:
		 * what the scene is sent is the parts of the shelf, in order, three texts each,
		 * and the palette and the inspector are handed the classes of the same parts.
		 *
		 * `land()` is overridden on the library so no link is ever looked up; the link
		 * in the field is shaped like a real one and points nowhere. No proof of work,
		 * no master, so the test is well inside its second.
		 */
		'the sources of the lands reach the scene as they lie in the shelf'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const shelf = land.Data( $bog_vmap_lib_land_shelf )

			const card_src = `${d}my_card ${d}mol_view\n\tprice 0\n`
			const badge_src = `${d}my_badge ${d}my_card\n`

			const card = shelf.Parts( null )!.make( null )
			card.tree( card_src )
			card.css( '[my_card] { color: red }' )

			const badge = shelf.Parts( null )!.make( null )
			badge.tree( badge_src )
			badge.js( 'price(){ return 1 }' )

			const lib = $bog_vmap_lib_land.make({ $, shelf: ()=> shelf })

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app
			app.Lib().land = ()=> lib

			app.links( 'https://mol.hyoo.ru, AbCdEfGh_12345678_ZyXwVuTs' )

			$mol_assert_like( app.libs(), [
				{ tree: card_src, js: '', css: '[my_card] { color: red }' },
				{ tree: badge_src, js: 'price(){ return 1 }', css: '' },
			] )

			// the same classes for the palette and, beside the root, for the inspector
			$mol_assert_like(
				app.lib_classes().map( tree => tree.type ),
				[ `${d}my_card`, `${d}my_badge` ],
			)

			const peers = app.node_peers().map( tree => tree.type )
			$mol_assert_like( peers, [ `${d}my_card`, `${d}my_badge`, app.doc_root() ] )

			// a field with no lands sends an empty list, not nothing
			app.links( 'https://mol.hyoo.ru' )
			$mol_assert_like( app.libs(), [] )

		},

		/**
		 * Section 5 in one test: a pack cannot be unloaded from a realm, so a change
		 * of pack is a change of the frame address and the browser reloads; a land is
		 * compiled into the sandbox like the document, so a change of lands leaves
		 * the address — and with it the frame, its camera and its live instances —
		 * exactly where they were.
		 */
		'a change of lands keeps the frame, a change of pack reloads it'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.links( 'https://mol.hyoo.ru' )
			const before = app.scene_uri()
			$mol_assert_ok( before.includes( encodeURIComponent( 'https://mol.hyoo.ru/web.js' ) ) )

			app.links( 'https://mol.hyoo.ru, AbCdEfGh_12345678_ZyXwVuTs' )
			$mol_assert_equal( app.scene_uri(), before )
			$mol_assert_like( app.lands(), [ 'AbCdEfGh_12345678_ZyXwVuTs' ] )

			// the slash grows in the derived address, the field keeps what was typed
			app.links( 'https://b-on-g.github.io/gram, AbCdEfGh_12345678_ZyXwVuTs' )
			$mol_assert_ok( app.scene_uri() !== before )
			$mol_assert_ok( app.scene_uri().includes( encodeURIComponent( 'https://b-on-g.github.io/gram/web.js' ) ) )
			$mol_assert_equal( app.links(), 'https://b-on-g.github.io/gram, AbCdEfGh_12345678_ZyXwVuTs' )

			// a second pack is refused: the frame keeps the first
			app.links( 'https://b-on-g.github.io/gram, https://mol.hyoo.ru' )
			$mol_assert_ok( app.scene_uri().includes( encodeURIComponent( 'https://b-on-g.github.io/gram/web.js' ) ) )
			$mol_assert_equal( app.links_parsed().rejected.length, 1 )

			// a field naming no pack falls back to the standard palette, see below
			app.links( 'AbCdEfGh_12345678_ZyXwVuTs' )
			$mol_assert_ok( !app.pack_link().startsWith( 'https://b-on-g.github.io/gram' ) )
			$mol_assert_like( app.lands(), [ 'AbCdEfGh_12345678_ZyXwVuTs' ] )

		},

		/**
		 * The two layouts of one pack, from the address of the editor page alone.
		 *
		 * The dev server keeps a module in `<pack>/<module>/-/` and a deploy
		 * publishes the content of `-/` into `<pack>/<module>/`, so both the sandbox
		 * and the standard palette are found without anything being configured or
		 * typed. The derivation itself is covered in `lib`; here it is that the
		 * editor asks for the right two siblings.
		 */
		'the sandbox and the standard palette are found on both layouts'( $ ) {

			// the address of the page is put in by hand rather than through `make`:
			// it is a method of the derived class, and `make` types its overrides
			// against the class the tree declares
			const dev = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app
			dev.page_uri = ()=> 'http://localhost:9080/bog/vmap/app/-/test.html'

			$mol_assert_equal( dev.scene_page(), 'http://localhost:9080/bog/vmap/scene/-/index.html' )
			$mol_assert_equal( dev.pack_link(), 'http://localhost:9080/bog/vmap/part/-/' )
			$mol_assert_equal(
				dev.scene_uri(),
				'http://localhost:9080/bog/vmap/scene/-/index.html?pack='
					+ encodeURIComponent( 'http://localhost:9080/bog/vmap/part/-/web.js' ),
			)

			const prod = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app
			prod.page_uri = ()=> 'https://b-on-g.github.io/vmap/app/'

			$mol_assert_equal( prod.scene_page(), 'https://b-on-g.github.io/vmap/scene/index.html' )
			$mol_assert_equal( prod.pack_link(), 'https://b-on-g.github.io/vmap/part/' )
			$mol_assert_equal(
				prod.scene_uri(),
				'https://b-on-g.github.io/vmap/scene/index.html?pack='
					+ encodeURIComponent( 'https://b-on-g.github.io/vmap/part/web.js' ),
			)

			// what a person typed is used as typed and never replaced by the sibling
			prod.links( 'https://mol.hyoo.ru' )
			$mol_assert_equal( prod.pack_link(), 'https://mol.hyoo.ru/' )
			$mol_assert_equal( prod.links(), 'https://mol.hyoo.ru' )

		},

		/**
		 * An artboard is a node with a `sub` of its own and a width, written in
		 * plain `view.tree`. No class of ours, so an exported document depends on
		 * nothing of this pack, and no mark on the side, so the text is the whole
		 * truth about what is a page.
		 */
		'an artboard is an ordinary node with a sub and a width'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.board_add()

			const source = app.doc_source()

			$mol_assert_ok( source.includes( `Page ${d}mol_view` ) )
			$mol_assert_ok( source.includes( 'width \\1280px' ) )
			// `[mol_view]` is `display: flex` with no direction, which is a ROW.
			$mol_assert_ok( source.includes( 'flexDirection \\column' ) )

			$mol_assert_like( app.node().sub_names(), [ 'Page' ] )
			$mol_assert_like( app.node().sub_names( 'Page' ), [] )
			$mol_assert_like( app.doc_containers(), [ 'Page' ] )
			$mol_assert_equal( app.selected(), 'Page' )

			// It lies on the canvas like any free part, so a second one goes beside
			// the first rather than on top of it — that is what several pages are.
			$mol_assert_ok( Boolean( app.spots()[ 'Page' ] ) )

			app.board_add()
			$mol_assert_like( app.doc_containers(), [ 'Page', 'Page_2' ] )

		},

		/**
		 * The same drop, two ways of being laid out, told apart by where the release
		 * happened: inside a page it is a position in the tree, outside it is a
		 * coordinate on the desk.
		 */
		'a drop inside an artboard goes into its tree and gets no coordinate'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app
			const pane = app.Pane() as $$.$bog_vmap_app_pane

			app.board_add()

			pane.sizes_last = { [ `${ app.doc_root() }/Page` ]: { x: 0, y: 0, width: 1280, height: 720 } }
			pane.sizes_version( pane.sizes_version() + 1 )

			app.part_drop( `${d}mol_button_minor`, 100, 100 )

			$mol_assert_like( app.node().sub_names( 'Page' ), [ 'Button_minor' ] )
			$mol_assert_equal( app.spots()[ 'Button_minor' ], undefined )

			// Outside the page it is a free part with a coordinate, as before.
			app.part_drop( `${d}mol_string`, 2000, 100 )

			$mol_assert_like( app.node().sub_names(), [ 'Page', 'String' ] )
			$mol_assert_like( app.spots()[ 'String' ], { x: 2000, y: 100 } )

		},

		/** Carried into a page, a part loses the coordinate that no longer moves it. */
		'a part carried into an artboard leaves the placement'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.board_add()
			app.part_drop( `${d}mol_button_minor`, 2000, 100 )

			$mol_assert_like( app.spots()[ 'Button_minor' ], { x: 2000, y: 100 } )

			app.tree_move({ name: 'Button_minor', owner: 'Page', index: 0 })

			$mol_assert_like( app.node().sub_names( 'Page' ), [ 'Button_minor' ] )
			$mol_assert_like( app.node().sub_names(), [ 'Page' ] )
			$mol_assert_equal( app.spots()[ 'Button_minor' ], undefined )

		},

		/**
		 * A page goes with everything on it. Left behind, its children would stay
		 * declared and referenced by nothing: nothing draws them, so nothing can
		 * select them, so nothing can ever take them out again.
		 */
		'deleting an artboard takes what is laid out inside it'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.board_add()
			app.part_drop( `${d}mol_button_minor`, 2000, 100 )
			app.tree_move({ name: 'Button_minor', owner: 'Page', index: 0 })

			app.selected( 'Page' )
			app.node_delete()

			const names = app.node().prop_names()

			$mol_assert_equal( names.includes( 'Page' ), false )
			$mol_assert_equal( names.includes( 'Button_minor' ), false )
			$mol_assert_like( app.node().sub_names(), [] )

		},

	})

}
