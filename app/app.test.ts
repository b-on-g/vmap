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
		 * of pack is a change of the KEY of the frame and the element is replaced; a
		 * land is compiled into the sandbox like the document, so a change of lands
		 * leaves the key — and with it the frame, its camera and its live
		 * instances — exactly where they were.
		 *
		 * The pack rides the bridge now rather than the address of the frame, so
		 * what is read here is the key, which is what the guarantee actually rests
		 * on. That a key really makes a new element is `flow.test.ts`.
		 */
		'a change of lands keeps the frame, a change of pack replaces it'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app
			const pane = app.Pane() as $$.$bog_vmap_app_pane

			app.links( 'https://mol.hyoo.ru' )
			const before = pane.scene_key()
			$mol_assert_equal( pane.pack_uri(), 'https://mol.hyoo.ru/web.js' )

			app.links( 'https://mol.hyoo.ru, AbCdEfGh_12345678_ZyXwVuTs' )
			$mol_assert_equal( pane.scene_key(), before )
			$mol_assert_like( app.lands(), [ 'AbCdEfGh_12345678_ZyXwVuTs' ] )

			// the slash grows in the derived address, the field keeps what was typed
			app.links( 'https://b-on-g.github.io/gram, AbCdEfGh_12345678_ZyXwVuTs' )
			$mol_assert_ok( pane.scene_key() !== before )
			$mol_assert_equal( pane.pack_uri(), 'https://b-on-g.github.io/gram/web.js' )
			$mol_assert_equal( app.links(), 'https://b-on-g.github.io/gram, AbCdEfGh_12345678_ZyXwVuTs' )

			// a second pack is refused: the frame keeps the first
			app.links( 'https://b-on-g.github.io/gram, https://mol.hyoo.ru' )
			$mol_assert_equal( pane.pack_uri(), 'https://b-on-g.github.io/gram/web.js' )
			$mol_assert_equal( app.links_parsed().rejected.length, 1 )

			// a field naming no pack falls back to the standard palette, see below
			app.links( 'AbCdEfGh_12345678_ZyXwVuTs' )
			$mol_assert_ok( !app.pack_link().startsWith( 'https://b-on-g.github.io/gram' ) )
			$mol_assert_like( app.lands(), [ 'AbCdEfGh_12345678_ZyXwVuTs' ] )

		},

		/**
		 * The two layouts of one pack, from the address of the editor page alone.
		 *
		 * The dev server keeps every module in `<pack>/<module>/-/`, while a deploy
		 * publishes the editor at the root of the site and the other modules as
		 * folders under it. Neither the sandbox nor the standard palette has a page
		 * on either layout, so what is derived is a bundle and a folder, and nothing
		 * is configured or typed. The derivation itself is covered in `lib`; here it
		 * is that the editor asks for the right two siblings.
		 */
		'the sandbox and the standard palette are found on both layouts'( $ ) {

			// the address of the page is put in by hand rather than through `make`:
			// it is a method of the derived class, and `make` types its overrides
			// against the class the tree declares
			const dev = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app
			dev.page_uri = ()=> 'http://localhost:9080/bog/vmap/app/-/test.html'

			$mol_assert_equal( dev.scene_bundle(), 'http://localhost:9080/bog/vmap/scene/-/web.js' )
			$mol_assert_equal( dev.pack_link(), 'http://localhost:9080/bog/vmap/part/-/' )
			$mol_assert_equal( dev.pack_script(), 'http://localhost:9080/bog/vmap/part/-/web.js' )

			const prod = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app
			prod.page_uri = ()=> 'https://b-on-g.github.io/vmap/'

			$mol_assert_equal( prod.scene_bundle(), 'https://b-on-g.github.io/vmap/scene/web.js' )
			$mol_assert_equal( prod.pack_link(), 'https://b-on-g.github.io/vmap/part/' )
			$mol_assert_equal( prod.pack_script(), 'https://b-on-g.github.io/vmap/part/web.js' )

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
		 * Which way a container stacks is stated by the document, and the host reads
		 * it out rather than guessing: the boxes of the children say nothing while
		 * there are fewer than two of them, which is every page just made.
		 */
		'the direction a container is set to comes off the document'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.board_add()
			$mol_assert_equal( app.doc_axis( 'Page' ), 'column' )

			app.part_drop( `${d}mol_button_minor`, 2000, 100 )
			$mol_assert_equal( app.doc_axis( 'Button_minor' ), '' )

			// What the layout panel writes is what the canvas reads back.
			app.node().over_set( 'Page', 'style', app.node().tree().struct( 'style', [
				app.node().tree().struct( '*', [
					app.node().tree().struct( 'flexDirection', [ app.node().tree().data( 'row' ) ] ),
				] ),
			] ) )

			$mol_assert_equal( app.doc_axis( 'Page' ), 'row' )

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

		/**
		 * The name of a node is the key of the pick, of the placement and of the
		 * remembered box at once, so a rename that only touches the text orphans all
		 * three: the node lives under the new name while the editor points at one
		 * nothing declares.
		 */
		'renaming a node carries the pick and the placement with it'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )
			app.selected( 'Button_minor' )

			const spot = app.spots()[ 'Button_minor' ]
			$mol_assert_equal( Boolean( spot ), true )

			app.node_rename( 'Button_minor', 'Send' )

			$mol_assert_equal( app.node().prop_names().includes( 'Send' ), true )
			$mol_assert_equal( app.node().prop_names().includes( 'Button_minor' ), false )

			$mol_assert_equal( app.selected(), 'Send' )
			$mol_assert_like( app.spots()[ 'Send' ], spot )
			$mol_assert_equal( app.spots()[ 'Button_minor' ], undefined )

		},

		/** A node drawn on a page keeps its place in that page under the new name. */
		'renaming a node on a board keeps it drawn'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.board_add()
			app.part_drop( `${d}mol_button_minor`, 2000, 100 )
			app.tree_move({ name: 'Button_minor', owner: 'Page', index: 0 })

			app.node_rename( 'Button_minor', 'Send' )

			$mol_assert_like( app.node().sub_names( 'Page' ), [ 'Send' ] )

		},

		/**
		 * The document refuses the rename, and the editor state must not move for a
		 * rename that did not happen.
		 */
		'a rename onto a name already taken changes nothing'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )
			app.part_drop( `${d}mol_string`, 300, 400 )
			app.selected( 'Button_minor' )

			const before = app.doc_source()
			const spots = JSON.stringify( app.spots() )

			$mol_assert_fail( ()=> app.node_rename( 'Button_minor', 'String' ), Error )

			$mol_assert_equal( app.doc_source(), before )
			$mol_assert_equal( JSON.stringify( app.spots() ), spots )
			$mol_assert_equal( app.selected(), 'Button_minor' )

		},

		/**
		 * The field of the inspector renames through the editor, so the pick and the
		 * placement travel with it. Bound rather than left to the class model the
		 * inspector holds: that one knows the text and nothing else.
		 */
		'the name field of the inspector renames the picked node'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )
			app.selected( 'Button_minor' )

			$mol_assert_equal( app.node_title(), 'Button_minor' )

			app.node_title( 'Send' )

			$mol_assert_equal( app.selected(), 'Send' )
			$mol_assert_equal( app.node().prop_names().includes( 'Send' ), true )
			$mol_assert_equal( app.node_title(), 'Send' )
			$mol_assert_equal( app.node_title_note(), '' )

		},

		/**
		 * The refusal has to reach the person in words: a throw out of a `$mol_string`
		 * setter lands in `setCustomValidity`, which is not where anybody looks.
		 */
		'a name already taken is refused in words and moves nothing'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )
			app.part_drop( `${d}mol_string`, 300, 400 )
			app.selected( 'Button_minor' )

			const before = app.doc_source()

			app.node_title( 'String' )

			$mol_assert_equal( app.doc_source(), before )
			$mol_assert_equal( app.selected(), 'Button_minor' )
			// The exact words, because words are the whole point of this path.
			$mol_assert_equal( app.node_title_note(), 'Имя «String» в этом документе уже занято' )

			// The message belongs to the node it is about, so another pick is clean.
			app.selected( 'String' )
			$mol_assert_equal( app.node_title_note(), '' )

		},

		/**
		 * The interface is Russian and the field asks for a name, so a Russian name
		 * is the first thing anybody types into it — and a node name is a property
		 * name, which `view.tree` allows latin letters, digits and `_` and nothing
		 * else. Left to the model this came back as `Bad property signature`, which
		 * is neither the language of the person nor an answer to what they did.
		 */
		'a name the language does not allow is refused in words and moves nothing'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )
			app.selected( 'Button_minor' )

			const before = app.doc_source()

			app.node_title( 'Кнопка' )

			$mol_assert_equal( app.doc_source(), before )
			$mol_assert_equal( app.selected(), 'Button_minor' )
			$mol_assert_equal(
				app.node_title_note(),
				'Имя «Кнопка» не годится: в имени узла только латинские буквы, цифры и подчёркивание',
			)

			// A space is the other everyday way to write a name nothing can address.
			app.node_title( 'Send button' )
			$mol_assert_equal( app.doc_source(), before )
			$mol_assert_ok( app.node_title_note().startsWith( 'Имя «Send button» не годится' ) )

			// And a name the language does allow still goes through.
			app.node_title( 'Send' )
			$mol_assert_equal( app.selected(), 'Send' )
			$mol_assert_equal( app.node_title_note(), '' )

		},

		/**
		 * A wire spells the name of the node it reads, so a rename that misses it
		 * leaves a wire pointing at a name nothing declares — and the canvas draws
		 * it, because a wire is a line of the document like any other. The model is
		 * proven to rewrite references; what is pinned here is that the field of the
		 * inspector reaches that path and not some other one.
		 */
		'renaming through the name field carries the wire'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_string`, 100, 200 )
			app.part_drop( `${d}mol_button_minor`, 300, 400 )

			app.link_add({ from: 'String', from_prop: 'value', to: 'Button_minor', to_prop: 'title' })

			$mol_assert_equal( app.doc_wires().length, 1 )
			$mol_assert_equal( app.doc_wires()[ 0 ].from, 'String' )

			app.selected( 'String' )
			app.node_title( 'Field' )

			$mol_assert_equal( app.selected(), 'Field' )

			// One wire still, reading the node under its new name. Not dropped, and
			// not doubled by a second one left behind under the old name.
			$mol_assert_equal( app.doc_wires().length, 1 )
			$mol_assert_equal( app.doc_wires()[ 0 ].from, 'Field' )
			$mol_assert_equal( app.doc_wires()[ 0 ].to, 'Button_minor' )
			$mol_assert_equal( app.node().prop_names().includes( 'String' ), false )

		},

		/**
		 * The button hands over the module the export builds, folder included.
		 *
		 * Names spelled out rather than compared against a second call of the same
		 * builder: a comparison of the export with itself would pass on any wiring at
		 * all, including one where the button downloads the wrong document.
		 */
		'the download offers the module the export builds'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )

			const module = app.export_state().module!

			$mol_assert_equal( app.export_ready(), true )
			$mol_assert_equal( module.path, 'bog/vmap/app/page' )
			$mol_assert_equal( module.name, 'page' )
			$mol_assert_equal(
				module.files.map( file => file.name ).join( ' ' ),
				'page.view.tree page.view.ts page.view.css.ts page.meta.tree index.html',
			)

			// The declaration downloaded is the document, not a rendering of it.
			$mol_assert_equal(
				module.files[ 0 ].text,
				app.doc_source(),
			)

			// And the folder is on the button itself, where it is read without
			// hovering: section 10, the folder is not free and the author chose it.
			$mol_assert_equal( app.export_title(), 'Скачать bog/vmap/app/page' )
			$mol_assert_equal( app.export_file(), 'page.zip' )
			$mol_assert_ok( app.export_hint().includes( 'npx mam bog/vmap/app/page' ) )

		},

		/**
		 * The archive carries the module folder inside, so unpacking at the root of a
		 * checkout puts the files where mam resolves the class names to.
		 */
		'the archive is the module in its folder'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )

			const bytes = $.$bog_vmap_app_export_archive( app.export_state().module! )
			const text = new TextDecoder().decode( bytes )

			$mol_assert_ok( text.includes( 'bog/vmap/app/page/page.view.tree' ) )
			$mol_assert_ok( text.includes( 'bog/vmap/app/page/index.html' ) )

			// Stored, not compressed, so the sources travel as themselves.
			$mol_assert_ok( text.includes( `${d}mol_button_minor` ) )

		},

		/** Two artboards make a site of two pages, and the download carries its router. */
		'a document of two artboards downloads with a router'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.doc_source([
				`${d}bog_vmap_app_page ${d}mol_view`,
				`	Home ${d}mol_view sub /`,
				`	About ${d}mol_view sub /`,
				`	sub /`,
				`		<= Home`,
				`		<= About`,
				``,
			].join( '\n' ) )

			const module = app.export_state().module!

			$mol_assert_equal( module.root, `${d}bog_vmap_app_page_app` )
			$mol_assert_equal( module.path, 'bog/vmap/app/page' )

			const tree = module.files[ 0 ].text
			$mol_assert_ok( tree.includes( `${d}bog_vmap_app_page_app ${d}mol_view` ) )

			// The address key is the standard one, so a link between the pages is an
			// ordinary link written in the document itself.
			$mol_assert_ok( module.files[ 1 ].text.includes( `${d}mol_state_arg` ) )
			$mol_assert_ok( module.files[ 4 ].text.includes( `${d}bog_vmap_app_page_app` ) )

		},

		/**
		 * A body that works in the preview and would not compile refuses the whole
		 * download, and the reason stands on the screen in words instead of in a
		 * console. Without this the person meets it as a build failure on a machine
		 * the editor never sees.
		 */
		'an untyped body refuses the download and says why'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )
			app.root_js( 'greeting( who ) {\n\treturn who\n}\n' )

			$mol_assert_equal( app.export_ready(), false )
			$mol_assert_equal( app.export_title(), 'Скачать' )

			const notes = app.export_notes()

			$mol_assert_equal( notes.length, 2 )
			$mol_assert_ok( notes[ 1 ].includes( `${d}bog_vmap_app_page` ) )
			$mol_assert_ok( notes[ 1 ].includes( 'строка 1' ) )
			$mol_assert_ok( notes[ 1 ].includes( 'greeting' ) )
			$mol_assert_ok( notes[ 1 ].includes( 'who' ) )

			// The rows are on the screen, and they are the sentences themselves.
			$mol_assert_equal( app.export_rows().length, 2 )
			$mol_assert_equal( app.export_text( 1 ), notes[ 1 ] )
			$mol_assert_ok( app.body().includes( app.Export_note() ) )

			// And nothing can be taken out of the editor while it is refused.
			$mol_assert_fail( ()=> app.export_blob(), Error )

			// The strip goes as soon as the body is typed, and the button comes back.
			app.root_js( 'greeting( who: string ) {\n\treturn who\n}\n' )

			$mol_assert_equal( app.export_ready(), true )
			$mol_assert_equal( app.export_notes().length, 0 )
			$mol_assert_equal( app.body().includes( app.Export_note() ), false )

		},

		/**
		 * The button must not make the editor wait for the document.
		 *
		 * A document opened by a link lives in a land that suspends every read until
		 * it syncs, and the toolbar is drawn from the same cell the button reads. A
		 * suspension passed on from here suspends the whole editor, frame included,
		 * and the sandbox never comes up — measured, the standing test of that
		 * invariant went red the moment this was wired to the toolbar with a rethrow.
		 */
		'a document still on its way holds nothing up'( $ ) {

			const waiting = new Promise( ()=> {} )

			const app = $bog_vmap_app.make({
				$,
				store: ()=> $bog_vmap_app_store.make({
					$,
					doc_land_config: ()=> null,
					source: ()=> { throw waiting },
					spots: ()=> { throw waiting },
					pack: ()=> { throw waiting },
				}),
			}) as $$.$bog_vmap_app

			// Nothing to download yet, and nothing to complain about either: a wait is
			// not a refusal, so no strip stands on the screen saying it is.
			$mol_assert_equal( app.export_ready(), false )
			$mol_assert_equal( app.export_notes().length, 0 )
			$mol_assert_equal( app.body().includes( app.Export_note() ), false )
			$mol_assert_equal( app.export_hint(), 'Документ ещё загружается' )

		},

		/**
		 * An untouched editor downloads too, and downloads a module that builds: an
		 * empty page is a legal document, not a state to be guarded against.
		 */
		'an untouched document downloads as the empty page'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			const module = app.export_state().module!

			$mol_assert_equal( app.export_ready(), true )
			$mol_assert_equal( module.files.length, 5 )
			$mol_assert_equal( module.root, `${d}bog_vmap_app_page` )
			$mol_assert_equal( module.files[ 0 ].text, `${d}bog_vmap_app_page ${d}mol_view sub /\n` )

			// No hand written body anywhere, so no subclass and no rule is emitted.
			$mol_assert_equal( module.files[ 1 ].text.includes( 'export class' ), false )
			$mol_assert_equal( module.files[ 2 ].text.includes( 'style_attach' ), false )

		},

	})

}
