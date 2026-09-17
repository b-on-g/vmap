namespace $ {
	const d = '$'

	const clicked = { x: 0, y: 0, width: 0, height: 0 }

	const measured = ( $: $mol_ambient_context )=> {

		const peer = { origin: 'null', postMessage() {} }

		const pane = $$.$bog_vmap_app_pane.make({
			$,
			doc_root: ()=> `${d}doc`,
			scene_peer: ()=> peer,
		})

		pane.handshake( pane.scene_key(), 1 )

		const report = ( sizes: { readonly [ node: string ]: $bog_vmap_bridge_rect } )=> pane.message_receive(
			{ data: { ns: $bog_vmap_bridge_ns, kind: 'sizes', sizes }, source: peer } as unknown as MessageEvent
		)

		return { pane, report }
	}

	$mol_test_mocks.push( $=> {
		class $mol_state_session_mock< Value > extends $.$mol_state_session< Value > {
			static store = {} as Record< string, string >

			static override native(): Pick< Storage, 'getItem' | 'setItem' | 'removeItem' > {
				const store = this.store
				return {
					getItem: ( key: string )=> store[ key ] ?? null,
					setItem: ( key: string, value: string )=> { store[ key ] = value },
					removeItem: ( key: string )=> { delete store[ key ] },
				}
			}

		}

		$.$mol_state_session = $mol_state_session_mock
	} )

	$mol_test({
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

		'panning does not touch the placement'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )
			const before = JSON.stringify( app.spots() )

			const pane = app.Pane() as $$.$bog_vmap_app_pane
			pane.camera_shift( new $mol_vector_2d( -500, -500 ) )

			$mol_assert_equal( JSON.stringify( app.spots() ), before )

		},

		'measured boxes survive a report without them'( $ ) {
			const { pane, report } = measured( $ )

			report({
				[ `${d}doc/A` ]: { x: 0, y: 0, width: 10, height: 10 },
				[ `${d}doc/B` ]: { x: 20, y: 0, width: 10, height: 10 },
			})

			report({ [ `${d}doc/A` ]: { x: 5, y: 5, width: 10, height: 10 } })

			$mol_assert_equal( pane.sizes()[ `${d}doc/A` ].x, 5 )
			$mol_assert_equal( Boolean( pane.sizes()[ `${d}doc/B` ] ), true )

		},

		'a part measured at a new path takes its insides with it'( $ ) {
			const { pane, report } = measured( $ )

			report({
				[ `${d}doc/Icon` ]: { x: 0, y: 0, width: 10, height: 10 },
				[ `${d}doc/Icon/Path` ]: { x: 0, y: 0, width: 8, height: 8 },
				[ `${d}doc/Icons` ]: { x: 0, y: 0, width: 10, height: 10 },
			})

			report({
				[ `${d}doc/Board/Icon` ]: { x: 30, y: 0, width: 10, height: 10 },
				[ `${d}doc/Board/Icon/Path` ]: { x: 30, y: 0, width: 8, height: 8 },
			})

			$mol_assert_equal( Boolean( pane.sizes()[ `${d}doc/Icon` ] ), false )
			$mol_assert_equal( Boolean( pane.sizes()[ `${d}doc/Icon/Path` ] ), false )

			$mol_assert_equal( Boolean( pane.sizes()[ `${d}doc/Icons` ] ), true )
			$mol_assert_equal( pane.sizes()[ `${d}doc/Board/Icon` ].x, 30 )

		},

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

			$mol_assert_like(
				app.lib_classes().map( tree => tree.type ),
				[ `${d}my_card`, `${d}my_badge` ],
			)

			const peers = app.node_peers().map( tree => tree.type )
			$mol_assert_like( peers, [ `${d}my_card`, `${d}my_badge`, app.doc_root() ] )

			app.links( 'https://mol.hyoo.ru' )
			$mol_assert_like( app.libs(), [] )

		},

		'a change of lands keeps the frame, a change of pack replaces it'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app
			const pane = app.Pane() as $$.$bog_vmap_app_pane

			app.links( 'https://mol.hyoo.ru' )
			const before = pane.scene_key()
			$mol_assert_equal( pane.pack_uri(), 'https://mol.hyoo.ru/web.js' )

			app.links( 'https://mol.hyoo.ru, AbCdEfGh_12345678_ZyXwVuTs' )
			$mol_assert_equal( pane.scene_key(), before )
			$mol_assert_like( app.lands(), [ 'AbCdEfGh_12345678_ZyXwVuTs' ] )

			app.links( 'https://b-on-g.github.io/gram, AbCdEfGh_12345678_ZyXwVuTs' )
			$mol_assert_ok( pane.scene_key() !== before )
			$mol_assert_equal( pane.pack_uri(), 'https://b-on-g.github.io/gram/web.js' )
			$mol_assert_equal( app.links(), 'https://b-on-g.github.io/gram, AbCdEfGh_12345678_ZyXwVuTs' )

			app.links( 'https://b-on-g.github.io/gram, https://mol.hyoo.ru' )
			$mol_assert_equal( pane.pack_uri(), 'https://b-on-g.github.io/gram/web.js' )
			$mol_assert_equal( app.links_parsed().rejected.length, 1 )

			app.links( 'AbCdEfGh_12345678_ZyXwVuTs' )
			$mol_assert_ok( !app.pack_link().startsWith( 'https://b-on-g.github.io/gram' ) )
			$mol_assert_like( app.lands(), [ 'AbCdEfGh_12345678_ZyXwVuTs' ] )

		},

		'the sandbox and the standard palette are found on both layouts'( $ ) {
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

			prod.links( 'https://mol.hyoo.ru' )
			$mol_assert_equal( prod.pack_link(), 'https://mol.hyoo.ru/' )
			$mol_assert_equal( prod.links(), 'https://mol.hyoo.ru' )

		},

		'an artboard is an ordinary node with a sub and a width'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.board_draw( clicked )

			const source = app.doc_source()

			$mol_assert_ok( source.includes( `Page ${d}mol_view` ) )
			$mol_assert_ok( source.includes( 'width \\1280px' ) )
			$mol_assert_ok( source.includes( 'flexDirection \\column' ) )

			$mol_assert_like( app.node().sub_names(), [ 'Page' ] )
			$mol_assert_like( app.node().sub_names( 'Page' ), [] )
			$mol_assert_like( app.doc_containers(), [ 'Page' ] )
			$mol_assert_equal( app.selected(), 'Page' )

			$mol_assert_ok( Boolean( app.spots()[ 'Page' ] ) )

			app.board_draw( clicked )
			$mol_assert_like( app.doc_containers(), [ 'Page', 'Page_2' ] )

		},

		'an artboard carried into the download takes a colour with its background'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.board_draw( clicked )

			const module = app.export_state().module!
			const tree = module.files.find( file => file.name.endsWith( '.view.tree' ) )!.text

			const styled = ( prop: string )=> tree.split( '\n' )
				.map( line => line.trim() )
				.find( line => line.startsWith( prop + ' \\' ) )
				?.slice( prop.length + 2 ) ?? ''

			$mol_assert_equal( styled( 'background' ), 'var(--mol_theme_back)' )
			$mol_assert_equal( styled( 'color' ), 'var(--mol_theme_text)' )

			$mol_assert_equal( /#[0-9a-f]{3,8}/i.test( tree ), false )

		},

		'a board drawn by a click takes the layout size at the point, a dragged one takes its box, and the camera stays'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app
			const pane = app.Pane() as $$.$bog_vmap_app_pane

			const styled = ( name: string, prop: string )=> {
				const style = app.node().over_tree( name, 'style' )?.kids[ 0 ] ?? null
				return $bog_vmap_lang_dict_get( style, prop )?.value ?? null
			}

			app.board_draw({ x: 40, y: 30, width: 0, height: 0 })

			$mol_assert_equal( app.selected(), 'Page' )
			$mol_assert_like( app.spots()[ 'Page' ], { x: 40, y: 30 } )
			$mol_assert_equal( styled( 'Page', 'width' ), `${ app.board_size().width }px` )
			$mol_assert_equal( styled( 'Page', 'minHeight' ), `${ app.board_size().height }px` )

			app.board_draw({ x: -10, y: 5, width: 300, height: 200 })

			$mol_assert_equal( app.selected(), 'Page_2' )
			$mol_assert_like( app.spots()[ 'Page_2' ], { x: -10, y: 5 } )
			$mol_assert_equal( styled( 'Page_2', 'width' ), '300px' )
			$mol_assert_equal( styled( 'Page_2', 'minHeight' ), '200px' )

			$mol_assert_like( [ ... pane.camera_shift() ], [ 0, 0 ] )
			$mol_assert_equal( pane.camera_zoom(), 1 )

			$mol_assert_equal( app.board_draw( null ), null )
			$mol_assert_like( app.doc_containers(), [ 'Page', 'Page_2' ] )

		},

		'the direction a container is set to comes off the document'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.board_draw( clicked )
			$mol_assert_equal( app.doc_axis( 'Page' ), 'column' )

			app.part_drop( `${d}mol_button_minor`, 2000, 100 )
			$mol_assert_equal( app.doc_axis( 'Button_minor' ), '' )

			app.node().over_set( 'Page', 'style', app.node().tree().struct( 'style', [
				app.node().tree().struct( '*', [
					app.node().tree().struct( 'flexDirection', [ app.node().tree().data( 'row' ) ] ),
				] ),
			] ) )

			$mol_assert_equal( app.doc_axis( 'Page' ), 'row' )

		},

		'a drop inside an artboard goes into its tree and gets no coordinate'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app
			const pane = app.Pane() as $$.$bog_vmap_app_pane

			app.board_draw( clicked )

			pane.sizes({ [ `${ app.doc_root() }/Page` ]: { x: 0, y: 0, width: 1280, height: 720 } })

			app.part_drop( `${d}mol_button_minor`, 100, 100 )

			$mol_assert_like( app.node().sub_names( 'Page' ), [ 'Button_minor' ] )
			$mol_assert_equal( app.spots()[ 'Button_minor' ], undefined )

			app.part_drop( `${d}mol_string`, 2000, 100 )

			$mol_assert_like( app.node().sub_names(), [ 'Page', 'String' ] )
			$mol_assert_like( app.spots()[ 'String' ], { x: 1904, y: 24 } )

		},

		'a part carried into an artboard leaves the placement'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.board_draw( clicked )
			app.part_drop( `${d}mol_button_minor`, 2000, 100 )

			$mol_assert_like( app.spots()[ 'Button_minor' ], { x: 1904, y: 24 } )

			app.tree_move({ name: 'Button_minor', owner: 'Page', index: 0 })

			$mol_assert_like( app.node().sub_names( 'Page' ), [ 'Button_minor' ] )
			$mol_assert_like( app.node().sub_names(), [ 'Page' ] )
			$mol_assert_equal( app.spots()[ 'Button_minor' ], undefined )

		},

		'deleting an artboard takes what is laid out inside it'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.board_draw( clicked )
			app.part_drop( `${d}mol_button_minor`, 2000, 100 )
			app.tree_move({ name: 'Button_minor', owner: 'Page', index: 0 })

			app.selected( 'Page' )
			app.node_delete()

			const names = app.node().prop_names()

			$mol_assert_equal( names.includes( 'Page' ), false )
			$mol_assert_equal( names.includes( 'Button_minor' ), false )
			$mol_assert_like( app.node().sub_names(), [] )

		},

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

		'renaming a node on a board keeps it drawn'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.board_draw( clicked )
			app.part_drop( `${d}mol_button_minor`, 2000, 100 )
			app.tree_move({ name: 'Button_minor', owner: 'Page', index: 0 })

			app.node_rename( 'Button_minor', 'Send' )

			$mol_assert_like( app.node().sub_names( 'Page' ), [ 'Send' ] )

		},

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

		'a name already taken is refused in words and moves nothing'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )
			app.part_drop( `${d}mol_string`, 300, 400 )
			app.selected( 'Button_minor' )

			const before = app.doc_source()

			app.node_title( 'String' )

			$mol_assert_equal( app.doc_source(), before )
			$mol_assert_equal( app.selected(), 'Button_minor' )
			$mol_assert_equal(
				app.node_title_note(),
				'Имя «String» в этом документе уже занято. Узел по-прежнему называется «Button_minor»',
			)

			app.selected( 'String' )
			$mol_assert_equal( app.node_title_note(), '' )

		},

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
				'Имя «Кнопка» не годится: в имени узла только латинские буквы, цифры и подчёркивание.'
					+ ' Узел по-прежнему называется «Button_minor»',
			)

			app.node_title( 'Send button' )
			$mol_assert_equal( app.doc_source(), before )
			$mol_assert_ok( app.node_title_note().startsWith( 'Имя «Send button» не годится' ) )

			app.node_title( 'Send' )
			$mol_assert_equal( app.selected(), 'Send' )
			$mol_assert_equal( app.node_title_note(), '' )

		},

		'a name that opens with a digit is refused, because it becomes a method name'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )
			app.selected( 'Button_minor' )

			const before = app.doc_source()

			app.node_title( '9bad' )

			$mol_assert_equal( app.doc_source(), before )
			$mol_assert_equal( app.selected(), 'Button_minor' )
			$mol_assert_equal(
				app.node_title_note(),
				'Имя «9bad» не годится: имя узла становится именем метода, а оно не начинается'
					+ ' с цифры. Узел по-прежнему называется «Button_minor»',
			)

			app.node_title( 'bad9' )

			$mol_assert_equal( app.selected(), 'bad9' )
			$mol_assert_equal( app.node_title_note(), '' )

		},

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

			$mol_assert_equal( app.doc_wires().length, 1 )
			$mol_assert_equal( app.doc_wires()[ 0 ].from, 'Field' )
			$mol_assert_equal( app.doc_wires()[ 0 ].to, 'Button_minor' )
			$mol_assert_equal( app.node().prop_names().includes( 'String' ), false )

		},

		'the download offers the module the export builds'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )

			const module = app.export_state().module!

			$mol_assert_equal( app.export_ready(), true )
			$mol_assert_equal( module.path, 'my/site/page' )
			$mol_assert_equal( module.name, 'page' )
			$mol_assert_equal(
				module.files.map( file => file.name ).join( ' ' ),
				'page.view.tree page.view.css page.meta.tree index.html README.md'
					+ ' .gitattributes .gitignore .github/workflows/deploy.yml',
			)

			$mol_assert_equal(
				module.files[ 0 ].text,
				app.doc_source() + `\tplugins /\n\t\t<= Theme ${d}mol_theme_auto\n`,
			)

			$mol_assert_equal( app.export_title(), 'Скачать my/site/page' )
			$mol_assert_equal( app.export_file(), 'page.zip' )
			$mol_assert_ok( app.export_hint().includes( 'npx mam my/site/page' ) )

		},

		'the archive is the module in its folder'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )

			const bytes = $.$bog_vmap_app_export_zip_archive( app.export_state().module! )
			const text = new TextDecoder().decode( bytes )

			$mol_assert_ok( text.includes( 'my/site/page/page.view.tree' ) )
			$mol_assert_ok( text.includes( 'my/site/page/index.html' ) )

			$mol_assert_ok( text.includes( `${d}mol_button_minor` ) )

		},

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

			const file_of = ( suffix: string )=>
				module.files.find( file => file.name.endsWith( suffix ) )?.text ?? ''

			$mol_assert_ok( file_of( '.view.ts' ).includes( `${d}mol_state_arg` ) )
			$mol_assert_ok( file_of( 'index.html' ).includes( `${d}bog_vmap_app_page_app` ) )

		},

		'an untyped body refuses the download and says why'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )
			app.root_js( 'greeting( who ) {\n\treturn who\n}\n' )

			$mol_assert_equal( app.export_ready(), false )
			$mol_assert_equal( app.export_title(), 'Скачать' )

			const notes = app.export_notes()

			$mol_assert_equal( notes.length, 2 )
			$mol_assert_ok( notes[ 1 ].includes( `${d}my_site_page` ) )
			$mol_assert_ok( notes[ 1 ].includes( 'строка 1' ) )
			$mol_assert_ok( notes[ 1 ].includes( 'greeting' ) )
			$mol_assert_ok( notes[ 1 ].includes( 'who' ) )

			$mol_assert_equal( app.export_rows().length, 2 )
			$mol_assert_equal( app.export_text( 1 ), notes[ 1 ] )
			$mol_assert_ok( app.notes().includes( app.Export_row( 1 ) ) )
			$mol_assert_equal( app.Canvas().foot().includes( app.Export_row( 1 ) ), true )

			$mol_assert_fail( ()=> app.export_blob(), Error )

			app.root_js( 'greeting( who: string ) {\n\treturn who\n}\n' )

			$mol_assert_equal( app.export_ready(), true )
			$mol_assert_equal( app.export_notes().length, 0 )
			$mol_assert_equal( app.export_rows().length, 0 )

		},

		'the download warns while the assets are still leaving'( $ ) {

			const app = $bog_vmap_app.make({
				$,
				store: ()=> $bog_vmap_app_store.make({
					$,
					doc_land_config: ()=> null,
					stage: ()=> 'ready',
					asset_links: ()=> [ 'one', 'two', 'three' ],
					assets_pending: ()=> [ 'three' ],
				}),
			}) as $$.$bog_vmap_app

			$mol_assert_ok( app.export_state().module )
			$mol_assert_equal( app.export_ready(), true )
			$mol_assert_equal( app.status(), 'ассеты ещё уходят на сервер: 2 из 3' )
			$mol_assert_equal(
				app.export_hint(),
				'Скачать можно, но ассеты ещё уходят на сервер: 2 из 3',
			)

		},

		'assets that reached the master leave the download silent'( $ ) {

			const app = $bog_vmap_app.make({
				$,
				store: ()=> $bog_vmap_app_store.make({
					$,
					doc_land_config: ()=> null,
					stage: ()=> 'ready',
					asset_links: ()=> [ 'one' ],
					assets_pending: ()=> [],
				}),
			}) as $$.$bog_vmap_app

			$mol_assert_equal( app.export_ready(), true )
			$mol_assert_equal( app.assets_note(), '' )
			$mol_assert_ok( app.export_hint().includes( 'npx mam my/site/page' ) )

		},

		'a document still on its way says nothing about its assets'( $ ) {

			const waiting = new Promise( ()=> {} )

			const app = $bog_vmap_app.make({
				$,
				store: ()=> $bog_vmap_app_store.make({
					$,
					doc_land_config: ()=> null,
					stage: ()=> 'ready',
					source: ()=> { throw waiting },
					assets_pending: ()=> { throw waiting },
				}),
			}) as $$.$bog_vmap_app

			$mol_assert_equal( app.assets_note(), '' )
			$mol_assert_equal( app.export_ready(), false )

		},

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

			$mol_assert_equal( app.export_ready(), false )
			$mol_assert_equal( app.export_notes().length, 0 )
			$mol_assert_equal( app.export_rows().length, 0 )
			$mol_assert_equal( app.export_hint(), 'Документ ещё загружается' )

		},

		'the editor takes no edits while the document is being made or loaded'( $ ) {
			const waiting = new Promise( ()=> {} )

			for( const stage of [ ()=> 'making' as const, ()=> { throw waiting } ] ) {

				const app = $bog_vmap_app.make({
					$,
					store: ()=> $bog_vmap_app_store.make({ $, doc_land_config: ()=> null, stage }),
				}) as $$.$bog_vmap_app

				for( const view of [ app.Main(), app.Instruments(), app.Root_name(), app.Publish() ] ) {
					$mol_assert_equal( view.dom_node_actual().hasAttribute( 'inert' ), true )
				}

				$mol_assert_equal( app.status(), 'Документ загружается…' )

			}

		},

		'a ready or a foreign document leaves the editor open'( $ ) {

			for( const [ stage, note ] of [
				[ 'ready', '' ],
				[ 'readonly', 'чужая сцена: только просмотр, правки не сохраняются' ],
			] as const ) {

				const app = $bog_vmap_app.make({
					$,
					store: ()=> $bog_vmap_app_store.make({ $, doc_land_config: ()=> null, stage: ()=> stage }),
				}) as $$.$bog_vmap_app

				for( const view of [ app.Main(), app.Instruments(), app.Root_name(), app.Publish() ] ) {
					$mol_assert_equal( view.dom_node_actual().hasAttribute( 'inert' ), false )
				}

				$mol_assert_equal( app.store_note(), note )

			}

		},

		'hotkeys wait for the document, the columns key does not'( $ ) {

			const make = ( stage: 'making' | 'ready' )=> $bog_vmap_app.make({
				$,
				store: ()=> $bog_vmap_app_store.make({ $, doc_land_config: ()=> null, stage: ()=> stage }),
			}) as $$.$bog_vmap_app

			const stroke = ( app: $$.$bog_vmap_app, code: string, shiftKey = false )=> app.key_press({
				code,
				key: code,
				shiftKey,
				metaKey: false,
				ctrlKey: false,
				altKey: false,
				target: null,
				preventDefault() {},
			} as unknown as KeyboardEvent )

			const making = make( 'making' )

			stroke( making, 'KeyF' )
			$mol_assert_equal( making.Pane().tool(), 'select' )

			stroke( making, 'Backslash', true )
			$mol_assert_equal( making.left_showed(), false )

			const ready = make( 'ready' )

			stroke( ready, 'KeyF' )
			$mol_assert_equal( ready.Pane().tool(), 'board' )

		},

		'every panel hears whether the scene may change'( $ ) {

			for( const [ stage, editable ] of [ [ 'ready', true ], [ 'readonly', false ], [ 'making', true ] ] as const ) {

				const app = $bog_vmap_app.make({
					$,
					store: ()=> $bog_vmap_app_store.make({ $, doc_land_config: ()=> null, stage: ()=> stage }),
				}) as $$.$bog_vmap_app

				const heard = [ app.Pane(), app.Layers(), app.Shelf(), app.Inspect(), app.Code() ].map( panel => panel.editable() )

				$mol_assert_like( heard, [ editable, editable, editable, editable, editable ] )
				$mol_assert_equal( app.Publish().foreign(), stage === 'readonly' )

			}

		},

		'a read only scene says so in the head and switches its edit controls off'( $ ) {

			const make = ( stage: 'ready' | 'readonly' )=> $bog_vmap_app.make({
				$,
				picked: ( next?: readonly string[] )=> next ?? [ 'Page' ],
				store: ()=> $bog_vmap_app_store.make({ $, doc_land_config: ()=> null, stage: ()=> stage }),
			}) as $$.$bog_vmap_app

			const theirs = make( 'readonly' )

			$mol_assert_equal( theirs.head().includes( theirs.Readonly() ), true )
			$mol_assert_equal( theirs.Readonly().title(), 'Только просмотр' )
			$mol_assert_like(
				[ theirs.Tool_board().enabled(), theirs.Delete().enabled(), theirs.Root_name().enabled() ],
				[ false, false, false ],
			)
			$mol_assert_like(
				[ theirs.Tool_select().enabled(), theirs.Tool_hand().enabled(), theirs.Zoom_in().enabled() ],
				[ true, true, true ],
			)

			const mine = make( 'ready' )

			$mol_assert_equal( mine.head().includes( mine.Readonly() ), false )
			$mol_assert_like(
				[ mine.Tool_board().enabled(), mine.Delete().enabled(), mine.Root_name().enabled() ],
				[ true, true, true ],
			)

		},

		'a read only scene draws, copies, wraps and deletes nothing and picks no phantom'( $ ) {

			const source = `${ d }my_site_page ${ d }mol_view\n\tPage ${ d }mol_view\n\tsub /\n\t\t<= Page\n`
			let picked = [] as readonly string[]

			const app = $bog_vmap_app.make({
				$,
				picked: ( next?: readonly string[] )=> next ? picked = next : picked,
				store: ()=> $bog_vmap_app_store.make({
					$,
					doc_land_config: ()=> null,
					stage: ()=> 'readonly',
					source: ()=> source,
					spots: ()=> ({ Page: { x: 0, y: 0 } }),
				}),
			}) as $$.$bog_vmap_app

			$mol_assert_equal( app.Pane().tool_board( true ), false )

			$mol_assert_equal( app.board_draw({ x: 400, y: 300, width: 0, height: 0 }), null )
			$mol_assert_like( picked, [] )

			picked = [ 'Page' ]

			app.node_copy()
			app.node_wrap()
			app.node_delete()

			$mol_assert_like( picked, [ 'Page' ] )
			$mol_assert_equal( app.doc_source(), source )
			$mol_assert_equal( app.selection_alive(), true )

		},

		'undo keys stay silent in a read only scene'( $ ) {

			const pressed = [] as string[]

			const make = ( stage: 'ready' | 'readonly' )=> {
				const app = $bog_vmap_app.make({
					$,
					store: ()=> $bog_vmap_app_store.make({ $, doc_land_config: ()=> null, stage: ()=> stage }),
				}) as $$.$bog_vmap_app
				app.History().press = ()=> { pressed.push( stage ); return true }
				return app
			}

			const undo = {
				code: 'KeyZ', key: 'z', metaKey: true, ctrlKey: false, altKey: false, shiftKey: false,
				target: null, preventDefault() {},
			} as unknown as KeyboardEvent

			make( 'readonly' ).key_press( undo )
			make( 'ready' ).key_press( undo )

			$mol_assert_like( pressed, [ 'ready' ] )

		},

		'an untouched document downloads as the empty page'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			const module = app.export_state().module!

			$mol_assert_equal( app.export_ready(), true )
			$mol_assert_equal( module.root, `${d}my_site_page` )
			$mol_assert_equal(
				module.files[ 0 ].text,
				`${d}my_site_page ${d}mol_view sub /\n\tplugins /\n\t\t<= Theme ${d}mol_theme_auto\n`,
			)

			$mol_assert_equal( module.path, 'my/site/page' )

			$mol_assert_like(
				module.files.map( file => file.name ),
				[
					'page.view.tree',
					'page.view.css',
					'page.meta.tree',
					'index.html',
					'README.md',
					'.gitattributes',
					'.gitignore',
					'.github/workflows/deploy.yml',
				],
			)

		},

		'an edit of the root leaves the other classes byte for byte'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.doc_source([
				`${d}bog_vmap_app_page ${d}mol_view sub /`,
				`${d}bog_vmap_app_card ${d}mol_view title \\Карточка`,
				``,
			].join( '\n' ) )

			const before = app.doc_model().class_source( `${d}bog_vmap_app_card` )

			app.part_drop( `${d}mol_button_minor`, 100, 200 )
			app.node_rename( 'Button_minor', 'Btn' )
			app.node_delete()

			$mol_assert_equal( app.doc_model().class_source( `${d}bog_vmap_app_card` ), before )
			$mol_assert_like( app.doc_model().names(), [
				`${d}bog_vmap_app_page`,
				`${d}bog_vmap_app_card`,
			] )

		},

		'the exported file puts a base above its heir after an edit'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.doc_source([
				`${d}bog_vmap_app_page ${d}bog_vmap_app_base sub /`,
				`${d}bog_vmap_app_base ${d}mol_view title \\Основа`,
				``,
			].join( '\n' ) )

			app.part_drop( `${d}mol_button_minor`, 100, 200 )

			$mol_assert_like( app.doc_model().names(), [
				`${d}bog_vmap_app_page`,
				`${d}bog_vmap_app_base`,
			] )

			const tree = app.export_state().module!.files[ 0 ].text

			$mol_assert_ok(
				tree.indexOf( `${d}bog_vmap_app_base ${d}mol_view` )
					< tree.indexOf( `${d}bog_vmap_app_page ${d}bog_vmap_app_base` )
			)

		},

		'renaming the root moves the module and the folder on the button'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )
			$mol_assert_equal( app.export_state().module!.path, 'my/site/page' )

			app.root_title( `${d}my_shop_page` )

			$mol_assert_equal( app.doc_root(), `${d}my_shop_page` )
			$mol_assert_equal( app.root_title(), `${d}my_shop_page` )

			const module = app.export_state().module!

			$mol_assert_equal( module.path, 'my/shop/page' )
			$mol_assert_equal( module.root, `${d}my_shop_page` )
			$mol_assert_equal( app.export_title(), 'Скачать my/shop/page' )
			$mol_assert_ok( module.files[ 0 ].text.startsWith( `${d}my_shop_page ` ) )

		},

		'a rename and the rename back leave the document as it was'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.doc_source([
				`${d}my_site_page ${d}mol_view sub /`,
				`${d}my_site_card ${d}mol_view title \\Карточка`,
				``,
			].join( '\n' ) )

			app.part_drop( `${d}mol_button_minor`, 100, 200 )
			app.root_js( 'greeting(){\n\treturn 1\n}\n' )
			app.class_js( `${d}my_site_card`, 'note(){\n\treturn 2\n}\n' )
			app.root_css( '[my] {\n\tcolor: red;\n}' )

			const source = app.doc_source()

			app.root_title( `${d}my_shop_page` )
			app.root_title( `${d}my_site_page` )

			$mol_assert_equal( app.doc_source(), source )
			$mol_assert_equal( app.doc_root(), `${d}my_site_page` )
			$mol_assert_equal( app.root_js(), 'greeting(){\n\treturn 1\n}\n' )
			$mol_assert_equal( app.root_css(), '[my] {\n\tcolor: red;\n}' )

			$mol_assert_equal( app.class_js( `${d}my_site_card` ), 'note(){\n\treturn 2\n}\n' )

		},

		'renaming the root carries the body and orphans nothing'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_string`, 100, 200 )
			app.part_drop( `${d}mol_button_minor`, 300, 400 )
			app.link_add({ from: 'String', from_prop: 'value', to: 'Button_minor', to_prop: 'title' })
			app.selected( 'String' )
			app.root_js( 'greeting(){\n\treturn 1\n}\n' )
			app.root_css( '[my] {\n\tcolor: red;\n}' )

			const source = app.doc_source()
			const spots = JSON.stringify( app.spots() )
			const wires = JSON.stringify( app.doc_wires() )

			app.root_title( `${d}my_shop_page` )

			$mol_assert_equal( app.root_js(), 'greeting(){\n\treturn 1\n}\n' )
			$mol_assert_equal( app.root_css(), '[my] {\n\tcolor: red;\n}' )
			$mol_assert_equal( app.selected(), 'String' )
			$mol_assert_equal( JSON.stringify( app.spots() ), spots )
			$mol_assert_equal( JSON.stringify( app.doc_wires() ), wires )

			$mol_assert_equal(
				app.doc_source(),
				source.replace( `${d}my_site_page`, `${d}my_shop_page` ),
			)

		},

		'a class renamed in its own text carries its body and its styles'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )
			app.root_js( 'greeting(){\n\treturn 1\n}\n' )
			app.root_css( '[my] {\n\tcolor: red;\n}' )

			app.code_whole( true )

			app.code_source(
				app.code_source().replace( `${d}my_site_page`, `${d}my_shop_page` )
			)

			$mol_assert_equal( app.doc_root(), `${d}my_shop_page` )
			$mol_assert_equal( app.class_js( `${d}my_shop_page` ), 'greeting(){\n\treturn 1\n}\n' )
			$mol_assert_equal( app.class_css( `${d}my_shop_page` ), '[my] {\n\tcolor: red;\n}' )

			$mol_assert_equal( app.doc_js()[ `${d}my_shop_page` ], 'greeting(){\n\treturn 1\n}\n' )
			$mol_assert_ok( app.doc_css().includes( 'color: red' ) )

		},

		'a slot rewritten into two classes carries nothing and loses nothing'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )
			app.root_js( 'greeting(){\n\treturn 1\n}\n' )

			app.code_whole( true )

			app.code_source([
				`${d}my_shop_page ${d}mol_view sub /`,
				`${d}my_shop_card ${d}mol_view title \\Карточка`,
				``,
			].join( '\n' ) )

			$mol_assert_like( app.doc_model().names(), [
				`${d}my_shop_page`,
				`${d}my_shop_card`,
			] )

			$mol_assert_equal( app.class_js( `${d}my_shop_page` ), '' )
			$mol_assert_equal( app.class_js( `${d}my_shop_card` ), '' )

			$mol_assert_equal( app.class_js( `${d}my_site_page` ), 'greeting(){\n\treturn 1\n}\n' )

		},

		'a second class typed under the first carries nothing away from it'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )
			app.root_js( 'greeting(){\n\treturn 1\n}\n' )

			app.code_whole( true )

			app.code_source(
				app.code_source() + `${d}my_site_card ${d}mol_view title \\Карточка\n`
			)

			$mol_assert_like( app.doc_model().names(), [
				`${d}my_site_page`,
				`${d}my_site_card`,
			] )

			$mol_assert_equal( app.doc_root(), `${d}my_site_page` )
			$mol_assert_equal( app.class_js( `${d}my_site_page` ), 'greeting(){\n\treturn 1\n}\n' )
			$mol_assert_equal( app.class_js( `${d}my_site_card` ), '' )

		},

		'the root name is committed on submit and not on a keystroke'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )
			const before = app.doc_source()

			app.root_draft( `${d}my` )
			app.root_draft( `${d}my_shop` )
			app.root_draft( `${d}my_shop_page` )

			$mol_assert_equal( app.doc_source(), before )
			$mol_assert_equal( app.doc_root(), `${d}my_site_page` )

			app.root_submit()

			$mol_assert_equal( app.doc_root(), `${d}my_shop_page` )
			$mol_assert_equal( app.root_draft(), `${d}my_shop_page` )

		},

		'a root name that is not a module path is refused in words'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )
			const before = app.doc_source()

			$mol_assert_equal( app.root_title( 'Страница' ), `${d}my_site_page` )
			$mol_assert_equal( app.doc_source(), before )
			$mol_assert_ok( app.root_title_note().includes( 'Страница' ) )
			$mol_assert_ok( app.notes().includes( app.Root_note() ) )
			$mol_assert_ok( app.Canvas().foot().includes( app.Root_note() ) )
			$mol_assert_equal( app.Canvas().body().includes( app.Root_note() ), false )

			app.root_draft( 'Страница' )
			app.root_submit()

			$mol_assert_equal( app.root_draft(), 'Страница' )
			$mol_assert_ok( app.root_title_note().includes( `${d}my_site_page` ) )

			$mol_assert_equal( app.root_title( `${d}page` ), `${d}my_site_page` )
			$mol_assert_equal( app.doc_source(), before )

			app.doc_source( before + `${d}my_site_card ${d}mol_view title \\Карточка\n` )
			$mol_assert_equal( app.root_title( `${d}my_site_card` ), `${d}my_site_page` )
			$mol_assert_ok( app.root_title_note().includes( 'already declared' ) )

		},

		async 'a pick belongs to its scene, and a new scene opens with none'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( `${d}flow_calc`, stage.client([ 200, 150 ]) )

			const first = stage.store.doc_current()!.link().str
			$mol_assert_equal( stage.app.selected(), 'Calc' )

			stage.click( stage.button( 'Новая сцена' ) )

			await $bog_vmap_app_flow_settle( ()=> stage.store.doc_links().length > 1 )
			stage.redraw()

			$mol_assert_equal( stage.app.selected(), null )
			$mol_assert_equal( stage.root.querySelector( '[bog_vmap_app_pane_handle]' ), null )
			$mol_assert_ok( stage.text().includes( 'Выберите узел на холсте' ) )

			const scenes = stage.app.Scenes() as $$.$bog_vmap_app_scenes
			scenes.current( first )
			stage.redraw()

			$mol_assert_equal( stage.app.selected(), 'Calc' )

		},

		async 'a scene change takes the pointer out of the node, and coming back keeps it out'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( `${d}flow_calc`, stage.client([ 200, 150 ]) )
			stage.tap( stage.client([ 500, 400 ]) )
			stage.tap( stage.part_center( 'Calc' ) )
			stage.tap( stage.part_center( 'Calc' ) )

			$mol_assert_equal( stage.pane.inside(), true )
			$mol_assert_ok( stage.pane.overlay_style().clipPath.includes( '104px 74px' ) )

			const first = stage.store.doc_current()!.link().str

			stage.click( stage.button( 'Новая сцена' ) )

			await $bog_vmap_app_flow_settle( ()=> stage.store.doc_links().length > 1 )
			stage.redraw()

			const scenes = stage.app.Scenes() as $$.$bog_vmap_app_scenes
			scenes.current( first )
			stage.redraw()

			$mol_assert_equal( stage.app.selected(), 'Calc' )
			$mol_assert_equal( stage.pane.inside(), false )
			$mol_assert_equal( stage.pane.overlay_style().clipPath, 'none' )
			$mol_assert_equal( stage.text().includes( 'Внутри' ), false )

		},

		'a pick naming nothing in the document leaves the panel inviting'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( `${d}flow_calc`, stage.client([ 200, 150 ]) )
			$mol_assert_equal( stage.app.selection_alive(), true )

			stage.app.doc_source( `${ stage.app.doc_root() } ${d}mol_view\n\tsub /\n` )
			stage.redraw()

			$mol_assert_equal( stage.app.selected(), 'Calc' )
			$mol_assert_equal( stage.app.selection_alive(), false )
			$mol_assert_ok( stage.text().includes( 'Выберите узел на холсте' ) )

		},

		'a mouse click takes the focus off the button, so Enter does not press it again'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const dom = $.$mol_dom_context
			const pane = stage.app.Pane()
			const hand = stage.root.querySelector( '[bog_vmap_app_tool_hand]' ) as HTMLElement

			hand.focus()
			hand.dispatchEvent( new dom.MouseEvent( 'click', { bubbles: true, cancelable: true, detail: 1 } ) )
			stage.redraw()

			$mol_assert_equal( pane.tool(), 'hand' )
			$mol_assert_equal( dom.document.activeElement, dom.document.body )

			dom.document.activeElement!.dispatchEvent(
				new dom.KeyboardEvent( 'keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true, cancelable: true } ),
			)
			stage.redraw()

			$mol_assert_equal( pane.tool(), 'hand' )

		},

		async 'a button that hands the focus on keeps the hand-off after the click'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const dom = $.$mol_dom_context
			const pane = stage.app.Pane()

			const name = stage.root.querySelector( '[bog_vmap_app_root_name]' ) as HTMLElement
			const zoom = stage.root.querySelector( '[bog_vmap_app_zoom_in]' ) as HTMLElement

			zoom.addEventListener( 'click', ()=> name.focus() )
			zoom.focus()
			zoom.dispatchEvent( new dom.MouseEvent( 'click', { bubbles: true, cancelable: true, detail: 1 } ) )

			$mol_assert_equal( dom.document.activeElement, name )

			stage.drop( `${d}flow_calc`, stage.client([ 200, 150 ]) )
			pane.entered( 'Calc' )
			stage.redraw()
			$mol_assert_equal( pane.inside(), true )

			const hand = stage.root.querySelector( '[bog_vmap_app_tool_hand]' ) as HTMLElement

			hand.focus()
			hand.dispatchEvent( new dom.MouseEvent( 'click', { bubbles: true, cancelable: true, detail: 1 } ) )
			await new Promise( done => setTimeout( done ) )

			$mol_assert_equal( pane.inside(), false )
			$mol_assert_equal( dom.document.activeElement, pane.dom_node() )

		},

		'a click from the keyboard, on a field or inside a popup leaves the focus where it was'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const dom = $.$mol_dom_context

			const click = ( el: HTMLElement, detail: number )=> {
				el.focus()
				el.dispatchEvent( new dom.MouseEvent( 'click', { bubbles: true, cancelable: true, detail } ) )
				return dom.document.activeElement
			}

			const hand = stage.root.querySelector( '[bog_vmap_app_tool_hand]' ) as HTMLElement
			$mol_assert_equal( click( hand, 0 ), hand )

			stage.assets()

			const files = stage.root.querySelector( '[bog_vmap_app_shelf_import_open_native]' ) as HTMLElement
			$mol_assert_ok( files.closest( '[mol_button]' ) )
			$mol_assert_equal( click( files, 1 ), files )

			stage.app.Shelf().filter( 'блок' )
			stage.redraw()

			const clear = stage.root.querySelector( '[bog_vmap_app_shelf_filter_clear]' ) as HTMLElement
			$mol_assert_ok( clear.closest( '[mol_pop]' ) )
			$mol_assert_equal( click( clear, 1 ), clear )

		},

		'a click puts a free part beside what covers the middle, never inside it'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const dom = $.$mol_dom_context

			dom.document.dispatchEvent( new dom.KeyboardEvent( 'keydown', { code: 'KeyF', key: 'f', bubbles: true } ) )
			stage.tap( stage.client([ 100, 100 ]) )

			const page = stage.app.selected()!
			$mol_assert_ok( page )

			stage.assets()
			stage.click( stage.shelf_row( 'Блок' ) )

			const node = stage.app.node()
			const block = stage.app.selected()!

			$mol_assert_ok( node.sub_names( '' )!.includes( block ) )
			$mol_assert_equal( node.sub_names( page )?.includes( block ) ?? false, false )

			const box = stage.pane.part_size( page )!
			const spot = stage.app.spots()[ block ]!

			$mol_assert_ok( box )
			$mol_assert_ok( spot.y >= box.y + box.height )

			stage.click( stage.shelf_row( 'Блок' ) )

			const next = stage.app.selected()!
			const below = stage.app.spots()[ next ]!
			const first = stage.pane.part_size( block )!

			$mol_assert_ok( next !== block )
			$mol_assert_ok( below.y >= first.y + first.height )

		},
		'a refused name stays in the field, and the real one is in the refusal'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( `${d}flow_calc`, stage.client([ 200, 150 ]) )
			stage.tap( stage.part_center( 'Calc' ) )

			const field = stage.field( 'Inspect().Name()' )
			stage.type( field, 'Кнопка' )

			stage.blur( field )

			$mol_assert_equal( stage.app.selected(), 'Calc' )
			$mol_assert_equal( stage.field( 'Inspect().Name()' ).value, 'Кнопка' )

			$mol_assert_ok( stage.text().includes( 'Узел по-прежнему называется «Calc»' ) )

		},
		async 'a click on «Новая сцена» makes a scene, and the address follows the pick'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			const first = stage.store.doc_current()!.link().str
			$mol_assert_equal( stage.store.doc_links().length, 1 )

			stage.click( stage.button( 'Новая сцена' ) )

			await $bog_vmap_app_flow_settle( ()=> stage.store.doc_links().length > 1 )
			stage.redraw()

			const second = stage.store.doc_current()!.link().str

			$mol_assert_equal( stage.store.doc_links().length, 2 )
			$mol_assert_ok( second !== first )

			$mol_assert_equal( $.$mol_state_arg.value( 'doc' ), second )

			stage.click( stage.scene_row( 'Сцена 1' ) )

			$mol_assert_equal( stage.store.doc_current()!.link().str, first )
			$mol_assert_equal( $.$mol_state_arg.value( 'doc' ), first )

			stage.click( stage.button( 'Новая сцена' ) )
			await $bog_vmap_app_flow_settle( ()=> stage.store.doc_links().length > 2 )

			stage.click( stage.button( 'Новая сцена' ) )
			await $bog_vmap_app_flow_settle( ()=> stage.store.doc_links().length > 3 )
			stage.redraw()

			const fourth = stage.store.doc_current()!.link().str

			$mol_assert_equal( stage.store.doc_links().length, 4 )
			$mol_assert_equal( $.$mol_state_arg.value( 'doc' ), fourth )

			stage.click( stage.scene_row( 'Сцена 1' ) )
			$mol_assert_equal( $.$mol_state_arg.value( 'doc' ), first )

		},
		'the shell is a head bar over three columns, and the canvas keeps no head of its own'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			const sub = app.sub()

			$mol_assert_equal( sub.length, 2 )
			$mol_assert_equal( sub[ 0 ], app.Head() )
			$mol_assert_equal( sub[ 1 ], app.Main() )

			const main = app.main()

			$mol_assert_equal( main.length, 3 )
			$mol_assert_equal( main[ 0 ], app.Left() )
			$mol_assert_equal( main[ 1 ], app.Canvas() )
			$mol_assert_equal( main[ 2 ], app.Right() )

			const left = app.Left().sub()

			$mol_assert_equal( left.length, 3 )
			$mol_assert_equal( left[ 0 ], app.Scenes() )
			$mol_assert_equal( left[ 1 ], app.Left_tabs() )
			$mol_assert_equal( left[ 2 ], app.Layers() )

			const right = app.Right().sub()

			$mol_assert_equal( right.length, 2 )
			$mol_assert_equal( right[ 0 ], app.Right_tabs() )
			$mol_assert_equal( right[ 1 ], app.Idle() )

			const head = app.head()

			$mol_assert_equal( head.length, 4 )
			$mol_assert_equal( head[ 0 ], app.Left_check() )
			$mol_assert_equal( head[ 1 ], app.Instruments() )
			$mol_assert_equal( head[ 2 ], app.Root_name() )
			$mol_assert_equal( head[ 3 ], app.Tools() )

			const instruments = app.instruments()

			$mol_assert_equal( instruments.length, 4 )
			$mol_assert_equal( instruments[ 0 ], app.Tool_select() )
			$mol_assert_equal( instruments[ 1 ], app.Tool_board() )
			$mol_assert_equal( instruments[ 2 ], app.Tool_hand() )
			$mol_assert_equal( instruments[ 3 ], app.Delete() )

			const tools = app.tools()

			for( const tool of [
				app.Zoom_out(),
				app.Zoom_reset(),
				app.Zoom_in(),
				app.History_check(),
				app.Publish(),
				app.Download(),
				app.Lights(),
				app.Right_check(),
			] ) $mol_assert_ok( tools.includes( tool ) )

			$mol_assert_equal( tools.includes( app.Status() ), false )

			const canvas = app.Canvas().sub()

			$mol_assert_equal( canvas.length, 2 )
			$mol_assert_equal( canvas[ 0 ], app.Canvas().Body() )
			$mol_assert_equal( canvas[ 1 ], app.Canvas().Foot() )

			$mol_assert_equal( app.Canvas().body()[ 0 ], app.Pane() )
			$mol_assert_equal( app.Canvas().foot(), [ app.Status() ] )
			$mol_assert_equal( app.floats().length, 0 )

		},

		'the column switches carry an icon and a hint instead of a label'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			const switches = [
				[ app.Left_check(), app.Left_icon() ],
				[ app.Right_check(), app.Right_icon() ],
				[ app.History_check(), app.History_icon() ],
			] as const

			for( const [ check, icon ] of switches ) {
				$mol_assert_equal( check.Icon(), icon )
				$mol_assert_equal( check.title(), '' )
				$mol_assert_ok( check.hint().length > 0 )
			}

		},

		'which columns and tabs are open outlives the page'( $ ) {
			const one = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			$mol_assert_equal( one.left_showed(), true )
			$mol_assert_equal( one.right_showed(), true )
			$mol_assert_equal( one.left_tab(), 'layers' )
			$mol_assert_equal( one.right_tab(), 'design' )

			one.left_showed( false )
			one.left_tab( 'assets' )
			one.right_tab( 'code' )

			const two = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			$mol_assert_equal( two.left_showed(), false )
			$mol_assert_equal( two.right_showed(), true )
			$mol_assert_equal( two.left_tab(), 'assets' )
			$mol_assert_equal( two.right_tab(), 'code' )

			$mol_assert_equal( two.main().includes( two.Left() ), false )
			$mol_assert_equal( two.Right().sub()[ 1 ], two.Code() )

		},

		'each tab shows one panel of its column'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			const left = ()=> app.Left().sub()[ 2 ]
			const right = ()=> app.Right().sub()[ 1 ]

			app.left_tab( 'layers' )
			$mol_assert_equal( left(), app.Layers() )

			app.left_tab( 'assets' )
			$mol_assert_equal( left(), app.Shelf() )

			app.right_tab( 'code' )
			$mol_assert_equal( right(), app.Code() )

			app.right_tab( 'history' )
			$mol_assert_equal( right(), app.History() )

			app.right_tab( 'design' )
			$mol_assert_equal( right(), app.Idle() )

			app.part_drop( `${d}mol_button_minor`, 100, 200 )
			$mol_assert_equal( right(), app.Inspect() )

		},

		'a click on the open tab keeps it open'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			const tabs = app.Right_tabs()

			tabs.option_checked( 'code', true )
			$mol_assert_equal( app.right_tab(), 'code' )

			tabs.option_checked( 'code', false )
			$mol_assert_equal( app.right_tab(), 'code' )
			$mol_assert_equal( app.Right().sub()[ 1 ], app.Code() )

			const left = app.Left_tabs()

			left.option_checked( 'layers', false )
			$mol_assert_equal( app.left_tab(), 'layers' )

		},

		'a narrow window starts with the canvas alone, and a column opens over it on demand'( $ ) {
			$.$mol_window = class extends $mol_window {
				static override size() {
					return { width: 400, height: 800 }
				}
			}

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			$mol_assert_equal( app.left_showed(), false )
			$mol_assert_equal( app.right_showed(), false )
			$mol_assert_equal( app.main().length, 1 )
			$mol_assert_equal( app.main()[ 0 ], app.Canvas() )

			app.left_showed( true )

			$mol_assert_equal( app.main()[ 0 ], app.Left() )
			$mol_assert_equal( app.main()[ 1 ], app.Canvas() )

		},

		'shift and backslash hide both columns and bring them back, but not from a field'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app
			const dom = $.$mol_dom_context

			let prevented = 0

			const stroke = ( target: EventTarget | null, over: object = {} )=> app.key_press({
				code: 'Backslash',
				key: '|',
				shiftKey: true,
				metaKey: false,
				ctrlKey: false,
				altKey: false,
				target,
				preventDefault() { ++ prevented },
				... over,
			} as unknown as KeyboardEvent )

			stroke( null )

			$mol_assert_equal( app.left_showed(), false )
			$mol_assert_equal( app.right_showed(), false )
			$mol_assert_equal( app.main().length, 1 )
			$mol_assert_equal( prevented, 1 )

			stroke( null )

			$mol_assert_equal( app.left_showed(), true )
			$mol_assert_equal( app.right_showed(), true )

			app.left_showed( false )
			stroke( null )

			$mol_assert_equal( app.left_showed(), false )
			$mol_assert_equal( app.right_showed(), false )

			stroke( dom.document.createElement( 'input' ) )
			stroke( null, { metaKey: true } )
			stroke( null, { shiftKey: false } )

			$mol_assert_equal( app.left_showed(), false )
			$mol_assert_equal( app.right_showed(), false )
			$mol_assert_equal( prevented, 3 )

		},

		'the code tab is what the code panel asks for'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			$mol_assert_equal( app.code_showed(), false )

			app.right_showed( false )
			app.code_showed( true )

			$mol_assert_equal( app.right_showed(), true )
			$mol_assert_equal( app.right_tab(), 'code' )
			$mol_assert_equal( app.code_showed(), true )
			$mol_assert_equal( app.history_showed(), false )

			app.history_showed( true )

			$mol_assert_equal( app.right_tab(), 'history' )
			$mol_assert_equal( app.code_showed(), false )

			app.history_showed( false )

			$mol_assert_equal( app.right_tab(), 'design' )
			$mol_assert_equal( app.right_showed(), true )

		},

		'an image dropped on the canvas becomes a node addressed at the file'( $ ) {

			const uri = 'https://baza.test/?BAZA:file=TQzejQsT_m3PFV7J3;name=logo.png'

			const store = $bog_vmap_app_store.make({ $, asset_put: ()=> uri })
			const app = $bog_vmap_app.make({ $, store: ()=> store }) as $$.$bog_vmap_app

			const file = new $.$mol_dom_context.File(
				[ new Uint8Array([ 137, 80, 78, 71 ]) ], 'logo.png', { type: 'image/png' },
			)

			app.files_drop({ files: [ file ], x: 100, y: 200, owner: '', index: -1 })

			const name = app.selected()!
			const source = app.doc_source()

			$mol_assert_equal( name, 'Image' )
			$mol_assert_ok( source.includes( `Image ${d}mol_image` ) )
			$mol_assert_ok( source.includes( `uri \\${ uri }` ) )
			$mol_assert_like( app.spots()[ name ], { x: 100, y: 200 } )

		},

		'a file that is not an image becomes a link carrying its name'( $ ) {

			const uri = 'https://baza.test/?BAZA:file=TQzejQsT_m3PFV7J3;name=notes.pdf'

			const store = $bog_vmap_app_store.make({ $, asset_put: ()=> uri })
			const app = $bog_vmap_app.make({ $, store: ()=> store }) as $$.$bog_vmap_app

			const file = new $.$mol_dom_context.File(
				[ new Uint8Array([ 37 ]) ], 'notes.pdf', { type: 'application/pdf' },
			)

			app.files_drop({ files: [ file ], x: 10, y: 20, owner: '', index: -1 })

			const source = app.doc_source()

			$mol_assert_equal( app.selected(), 'File' )
			$mol_assert_ok( source.includes( `File ${d}mol_link` ) )
			$mol_assert_ok( source.includes( `uri \\${ uri }` ) )
			$mol_assert_ok( source.includes( 'title \\notes.pdf' ) )

		},

		'a layer picked inside a part reaches the canvas by the address the panel made'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )
			const app = stage.app
			const dom = $.$mol_dom_context

			app.doc_source( [
				`${d}flow_inner ${d}mol_view`,
				`	Cell ${d}bog_vmap_part_cell`,
				`	sub / <= Cell`,
				``,
			].join( '\n' ) )

			app.picked([ 'Cell' ])
			stage.redraw()

			const layers = app.Layers() as $$.$bog_vmap_app_layers

			$mol_assert_like( layers.row_kids( 'Cell' ), [ 'Cell/Code', 'Cell/Draft', 'Cell/Note' ] )

			layers.row_pick(
				'Cell/Note',
				new dom.MouseEvent( 'click', { bubbles: true, cancelable: true } ),
			)
			stage.redraw()

			$mol_assert_equal( app.inner(), 'Cell/Note' )
			$mol_assert_equal( stage.pane.inner(), 'Cell/Note' )
			$mol_assert_like( [ ... app.picked() ], [ 'Cell' ] )

		},
	})

}
