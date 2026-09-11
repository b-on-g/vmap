namespace $ {
	const d = '$'

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

			app.board_add()

			const source = app.doc_source()

			$mol_assert_ok( source.includes( `Page ${d}mol_view` ) )
			$mol_assert_ok( source.includes( 'width \\1280px' ) )
			$mol_assert_ok( source.includes( 'flexDirection \\column' ) )

			$mol_assert_like( app.node().sub_names(), [ 'Page' ] )
			$mol_assert_like( app.node().sub_names( 'Page' ), [] )
			$mol_assert_like( app.doc_containers(), [ 'Page' ] )
			$mol_assert_equal( app.selected(), 'Page' )

			$mol_assert_ok( Boolean( app.spots()[ 'Page' ] ) )

			app.board_add()
			$mol_assert_like( app.doc_containers(), [ 'Page', 'Page_2' ] )

		},

		'a new artboard lands where the camera shows the whole of it'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app
			const pane = app.Pane() as $$.$bog_vmap_app_pane

			pane.view_rect = ()=> ({
				left: 0, top: 0, width: 600, height: 500, right: 600, bottom: 500,
			})

			app.board_add()

			const size = app.board_size()
			const spot = app.spots()[ 'Page' ]
			const zoom = pane.camera_zoom()
			const shift = pane.camera_shift()

			$mol_assert_equal( zoom, ( 600 - 48 ) / size.width )

			const left = spot.x * zoom + shift[0]
			const top = spot.y * zoom + shift[1]

			$mol_assert_equal( Math.round( left ), 24 )
			$mol_assert_equal( Math.round( left + size.width * zoom ), 576 )
			$mol_assert_ok( top >= 0 )
			$mol_assert_ok( top + size.height * zoom <= 500 )

		},

		'the direction a container is set to comes off the document'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.board_add()
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

			app.board_add()

			pane.sizes({ [ `${ app.doc_root() }/Page` ]: { x: 0, y: 0, width: 1280, height: 720 } })

			app.part_drop( `${d}mol_button_minor`, 100, 100 )

			$mol_assert_like( app.node().sub_names( 'Page' ), [ 'Button_minor' ] )
			$mol_assert_equal( app.spots()[ 'Button_minor' ], undefined )

			app.part_drop( `${d}mol_string`, 2000, 100 )

			$mol_assert_like( app.node().sub_names(), [ 'Page', 'String' ] )
			$mol_assert_like( app.spots()[ 'String' ], { x: 2000, y: 100 } )

		},

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

			app.board_add()
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
				'page.view.tree page.meta.tree index.html README.md'
					+ ' .gitattributes .gitignore .github/workflows/deploy.yml',
			)

			$mol_assert_equal(
				module.files[ 0 ].text,
				app.doc_source(),
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
			$mol_assert_ok( app.notes().includes( app.Export_note() ) )
			$mol_assert_equal( app.body().includes( app.Export_note() ), false )

			$mol_assert_fail( ()=> app.export_blob(), Error )

			app.root_js( 'greeting( who: string ) {\n\treturn who\n}\n' )

			$mol_assert_equal( app.export_ready(), true )
			$mol_assert_equal( app.export_notes().length, 0 )
			$mol_assert_equal( app.body().includes( app.Export_note() ), false )

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
			$mol_assert_equal( app.body().includes( app.Export_note() ), false )
			$mol_assert_equal( app.export_hint(), 'Документ ещё загружается' )

		},

		'an untouched document downloads as the empty page'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			const module = app.export_state().module!

			$mol_assert_equal( app.export_ready(), true )
			$mol_assert_equal( module.root, `${d}my_site_page` )
			$mol_assert_equal( module.files[ 0 ].text, `${d}my_site_page ${d}mol_view sub /\n` )

			$mol_assert_equal( module.path, 'my/site/page' )

			$mol_assert_like(
				module.files.map( file => file.name ),
				[
					'page.view.tree',
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
			$mol_assert_equal( app.body().includes( app.Root_note() ), false )

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

		'a click puts a free part beside what covers the middle, never inside it'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.click( stage.button( 'Артборд' ) )

			const page = stage.app.selected()!
			$mol_assert_ok( page )

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

			const field = stage.field( 'Inspect().Title()' )
			stage.type( field, 'Кнопка' )

			stage.blur( field )

			$mol_assert_equal( stage.app.selected(), 'Calc' )
			$mol_assert_equal( stage.field( 'Inspect().Title()' ).value, 'Кнопка' )

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
		'which panels are open outlives the page'( $ ) {
			const one = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			$mol_assert_equal( one.palette_showed(), true )
			$mol_assert_equal( one.inspect_showed(), true )
			$mol_assert_equal( one.code_showed(), false )

			one.palette_showed( false )
			one.code_showed( true )

			const two = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			$mol_assert_equal( two.palette_showed(), false )
			$mol_assert_equal( two.inspect_showed(), true )
			$mol_assert_equal( two.code_showed(), true )

			$mol_assert_equal( two.body_main().includes( two.Side() ), false )
			$mol_assert_equal( two.body_main().includes( two.Code() ), true )

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
	})

}
