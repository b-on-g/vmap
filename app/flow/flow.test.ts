namespace $ {
	const d = '$'

	export const $bog_vmap_app_flow_pack = [
		`${d}flow_button ${d}mol_view`,
		`\ttitle \\`,
		`\tenabled true`,
		`${d}flow_calc ${d}mol_view`,
		`\tresult 0`,
		`\top \\plus`,
		`${d}flow_map ${d}mol_view`,
		`\tzoom 0`,
		`\tmarker \\`,
		``,
	].join( '\n' )

	export const $bog_vmap_app_flow_other = 'http://other.pack/'

	export const $bog_vmap_app_flow_other_pack = [
		`${d}shop_basket ${d}mol_view`,
		`\ttitle \\`,
		``,
	].join( '\n' )

	export const $bog_vmap_app_flow_ui = $bog_vmap_app_shelf_packs().find( offer => offer.id === 'builderui' )!.link

	export const $bog_vmap_app_flow_ui_pack = [
		`${d}bog_builderui_card ${d}mol_view`,
		`\ttitle \\`,
		``,
	].join( '\n' )

	export const $bog_vmap_app_flow_rect = {
		left: 200, top: 50, width: 600, height: 500, right: 800, bottom: 550,
	}

	export const $bog_vmap_app_flow_size = { width: 100, height: 50 }

	export const $bog_vmap_app_flow_board = { width: 400, height: 300 }

	export type $bog_vmap_app_flow_sent = { kind: string, [ key: string ]: unknown }

	function browser_gaps( $: $ ) {
		const dom = $.$mol_dom_context

		Object.assign( globalThis, {
			ShadowRoot: globalThis.ShadowRoot ?? dom.ShadowRoot,
			PointerEvent: globalThis.PointerEvent ?? dom.PointerEvent,
		} )

		const proto = dom.Element.prototype

		if( !proto.setPointerCapture ) Object.assign( proto, {
			setPointerCapture() {},
			releasePointerCapture() {},
			hasPointerCapture() { return false },
		} )

	}

	let $bog_vmap_app_flow_last = null as null | $mol_object

	let $bog_vmap_app_flow_host = null as null | HTMLElement

	export async function $bog_vmap_app_flow_settle< Value >( done: ()=> Value, limit = 300 ) {
		const till = Date.now() + limit

		while( !done() && Date.now() < till ) {
			await new Promise( next => setTimeout( next, 2 ) )
		}

		return done()
	}

	export type $bog_vmap_app_flow_over = {
		readonly store?: $bog_vmap_app_store

		readonly mute?: boolean

	}

	export function $bog_vmap_app_flow_stage( $: $, over: $bog_vmap_app_flow_over = {} ) {
		browser_gaps( $ )

		const dom = $.$mol_dom_context

		$bog_vmap_app_flow_last?.destructor()
		$bog_vmap_app_flow_host?.remove()

		const host = dom.document.createElement( 'div' )
		host.setAttribute( 'bog_vmap_app_flow_host', '' )
		host.style.position = 'fixed'
		host.style.left = '-20000px'
		host.style.top = '0'
		dom.document.body.appendChild( host )
		$bog_vmap_app_flow_host = host

		const timers = [] as $mol_after_timeout[]

		class $mol_after_timeout_flow extends $mol_after_timeout {
			constructor( delay: number, task: ()=> void ) {
				super( delay, task )
				clearTimeout( this.id )
				timers.push( this )
			}
		}
		$.$mol_after_timeout = $mol_after_timeout_flow

		const kept = {} as { [ key: string ]: string | undefined }

		class $mol_state_local_flow< Value > extends $mol_state_local< Value > {
			static override value< Value >( key: string, next?: Value | null ): Value | null {

				if( next === undefined ) return JSON.parse( kept[ key ] ?? 'null' )

				if( next === null ) delete kept[ key ]
				else kept[ key ] = JSON.stringify( next )

				return next
			}
		}
		$.$mol_state_local = $mol_state_local_flow

		class $mol_fetch_flow extends $mol_fetch {
			static override text( input: RequestInfo ) {
				const uri = String( input )
				if( uri === $bog_vmap_app_flow_other + 'web.view.tree' ) return $bog_vmap_app_flow_other_pack
				if( uri === $bog_vmap_app_flow_ui + 'web.view.tree' ) return $bog_vmap_app_flow_ui_pack
				if( uri.endsWith( 'web.view.tree' ) ) return $bog_vmap_app_flow_pack
				return $mol_fail( new Error( 'network in a test: ' + uri ) )
			}
		}
		$.$mol_fetch = $mol_fetch_flow

		const store = over.store ?? $bog_vmap_app_store.make({ $, doc_land_config: ()=> null })
		if( !over.store ) store.doc_add( 'Сцена 1' )

		const app = $bog_vmap_app.make({ $, store: ()=> store }) as $$.$bog_vmap_app
		$bog_vmap_app_flow_last = app

		const posted = [] as $bog_vmap_app_flow_sent[]
		const queue = [] as $bog_vmap_app_flow_sent[]

		const direction = ( name: string )=> {
			const style = app.node().over_tree( name, 'style' )?.kids[ 0 ] ?? null
			return $bog_vmap_lang_dict_get( style, 'flexDirection' )?.value
				?? 'row' // what `[mol_view]` is with no direction written
		}

		const sizes = ()=> {
			const res = {} as { [ node: string ]: $bog_vmap_bridge_rect }
			const node = app.node()

			const place = ( name: string, path: string, x: number, y: number ) => {
				const kids = node.sub_names( name )
				const box = { x, y, ... kids ? $bog_vmap_app_flow_board : $bog_vmap_app_flow_size }

				res[ path ] = box
				if( !kids ) return box

				const row = direction( name ) === 'row'
				let at = 0

				for( const kid of kids ) {
					if( !kid ) continue
					const inner = place( kid, path + '/' + kid, row ? x + at : x, row ? y : y + at )
					at += row ? inner.width : inner.height
				}

				return box
			}

			const spots = app.spots()
			for( const name of Object.keys( spots ) ) {
				place( name, app.doc_root() + '/' + name, spots[ name ].x, spots[ name ].y )
			}

			return res
		}

		let silent = false
		let exposed = false

		const peer = {
			get origin() {
				if( exposed ) return 'http://localhost'
				return $mol_fail( new Error( 'SecurityError: cross-origin frame' ) )
			},

			postMessage( data: unknown ) {
				const message = data as $bog_vmap_app_flow_sent
				posted.push( message )

				if( silent ) return

				if( message.kind === 'ping' ) queue.push({ kind: 'pong', nonce: message.nonce })
				else if( message.kind !== 'values_want' ) queue.push({ kind: 'sizes', sizes: sizes() })

			},
		}

		const deliver = ( data: $bog_vmap_app_flow_sent )=> {
			const event = new dom.MessageEvent( 'message', { data: { ns: $bog_vmap_bridge_ns, ... data } } )
			Object.defineProperty( event, 'source', { value: peer } )
			dom.dispatchEvent( event )
		}

		const scene = {
			posted,

			sent( kind: string ) {
				return posted.filter( message => message.kind === kind )
			},

			last( kind: string ) {
				return this.sent( kind ).at( -1 )
			},

			flush() {
				while( queue.length ) deliver( queue.shift()! )
				app.dom_tree()
			},

			values( values: { readonly [ wire: string ]: string } ) {
				deliver({ kind: 'values', values })
				app.dom_tree()
			},

			silence() {
				silent = true
				queue.length = 0
			},

			pack_note( message: string | null ) {
				deliver({ kind: 'error', at: 'pack', message })
				app.dom_tree()
			},

			hello() {
				deliver({ kind: 'ready' })
				app.dom_tree()
				this.flush()
			},

			expose() {
				exposed = true
				app.dom_tree()
			},

		}

		const pane = app.Pane() as $$.$bog_vmap_app_pane
		pane.scene_peer = ()=> peer

		const root = app.dom_tree()
		host.appendChild( root )

		const rect = $bog_vmap_app_flow_rect
		pane.dom_node().getBoundingClientRect = ()=> rect as DOMRect
		pane.view_rect = ()=> rect
		pane.Touch().view_rect = ()=> rect

		if( over.mute ) {
			deliver({ kind: 'ready' })
			silent = true
			queue.length = 0
			app.dom_tree()
		} else {
			deliver({ kind: 'ready' })
			app.dom_tree()
			scene.flush()
		}

		const found = ( selector: string, note: string, match: ( el: Element )=> boolean )=> {
			const el = [ ... root.querySelectorAll( selector ) ].find( match )
			if( !el ) $mol_fail( new Error( `nothing on screen: ${ note }` ) )

			return el
		}

		const pointer = ( type: string, point: readonly [ number, number ], over: object = {} )=> {
			return new dom.PointerEvent( type, {
				bubbles: true,
				cancelable: true,
				clientX: point[0],
				clientY: point[1],
				button: 0,
				buttons: type === 'pointerup' ? 0 : 1,
				pointerId: 1,
				... over,
			} )
		}

		return {
			app, pane, store, scene, root, timers, kept,

			client( point: readonly [ number, number ] ) {
				return [ rect.left + point[0], rect.top + point[1] ] as const
			},

			text() {
				return root.textContent ?? ''
			},

			broken() {
				return [ ... root.querySelectorAll( '[mol_view_error]' ) ].map( el => el.getAttribute( 'id' ) )
			},

			button( title: string ) {
				return found( '[role=button]', `button «${ title }»`, el => el.textContent?.startsWith( title ) ?? false )
			},

			check( title: string ) {
				return found( '[role=checkbox]', `check «${ title }»`, el => el.textContent?.includes( title ) ?? false )
			},

			class_row( klass: string ) {
				return found( '[bog_vmap_app_palette_item]', `palette row ${ klass }`, el => el.textContent === klass )
			},

			classes_open() {
				app.Shelf().classes_showed( true )
				app.dom_tree()
				scene.flush()
			},

			scene_row( title: string ) {
				return found( '[bog_vmap_app_scenes_scene_row]', `scene row ${ title }`, el => el.textContent === title )
			},

			shelf_row( title: string ) {
				return found( '[bog_vmap_app_shelf_item_row]', `shelf row ${ title }`, el => el.textContent === title )
			},

			pack_row( title: string ) {
				return found( '[bog_vmap_app_shelf_pack_row]', `pack row ${ title }`, el => el.textContent === title )
			},

			theme_button( which: 'light' | 'system' | 'dark' ) {
				return found( `[bog_theme_switch_${ which }]`, `theme button ${ which }`, ()=> true )
			},

			theme_worn() {
				return root.getAttribute( 'mol_theme' )
			},

			field( tail: string ) {
				return found( 'input, textarea', `field ${ tail }`, el => el.getAttribute( 'id' )?.endsWith( tail ) ?? false ) as HTMLInputElement
			},

			overlay() {
				return root.querySelector( '[bog_vmap_app_pane_overlay]' )!
			},

			frame() {
				return root.querySelector( 'iframe' )!
			},

			type( el: HTMLInputElement, value: string ) {
				el.value = value
				el.dispatchEvent( new dom.Event( 'input', { bubbles: true } ) )
				app.dom_tree()
				scene.flush()
			},

			blur( el: Element ) {
				el.dispatchEvent( new dom.Event( 'blur', { bubbles: true } ) )
				app.dom_tree()
				scene.flush()
			},

			click( el: Element ) {
				el.dispatchEvent( new dom.MouseEvent( 'click', { bubbles: true, cancelable: true } ) )
				app.dom_tree()
				scene.flush()
			},

			press( el: Element, point: readonly [ number, number ], over: object = {} ) {
				el.dispatchEvent( pointer( 'pointerdown', point, over ) )
			},

			move( el: Element, point: readonly [ number, number ], over: object = {} ) {
				el.dispatchEvent( pointer( 'pointermove', point, over ) )
			},

			release( el: Element, point: readonly [ number, number ], over: object = {} ) {
				el.dispatchEvent( pointer( 'pointerup', point, over ) )
			},

			drop( klass: string, point: readonly [ number, number ] ) {
				this.classes_open()
				this.press( this.class_row( klass ), [ 10, 300 ] )
				dom.dispatchEvent( pointer( 'pointermove', point ) )
				this.release( this.overlay(), point )

				app.dom_tree()
				scene.flush()

			},

			tap( point: readonly [ number, number ], over: object = {} ) {
				this.press( this.overlay(), point, over )
				this.release( this.overlay(), point, over )

				app.dom_tree()
				scene.flush()

			},

			part_center( name: string ) {
				const box = pane.part_box( name )!
				if( !box ) $mol_fail( new Error( `part ${ name } is not measured` ) )

				return this.client([ box.left + box.width / 2, box.top + box.height / 2 ])
			},

			port_dot( name: string, port: string, side: $bog_vmap_app_wire_side ) {
				const box = pane.part_box( name )!
				const index = app.part_ports( name ).findIndex( known => known.name === port )
				if( !box || index < 0 ) $mol_fail( new Error( `no port ${ name }.${ port } on screen` ) )

				return this.client( $bog_vmap_app_wire_port_point( box, side, index ) )
			},

			redraw() {
				app.dom_tree()
			},

		}

	}

}

namespace $ {
	const d = '$'

	const calc = `${d}flow_calc`
	const map = `${d}flow_map`
	const button = `${d}flow_button`

	$mol_test({
		'the editor opens with its bar, its palette and its canvas'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.button( 'Новая сцена' )
			stage.button( 'Удалить' )
			stage.button( 'В библиотеку' )

			const canvas = stage.pane.dom_node()
			for( const title of [ '−', '+', 'Сбросить вид' ] ) {
				$mol_assert_equal( canvas.contains( stage.button( title ) ), true )
			}
			$mol_assert_equal( canvas.contains( stage.button( 'Удалить' ) ), false )

			const text = stage.text()
			$mol_assert_ok( text.includes( 'Полка' ) )
			$mol_assert_ok( text.includes( 'Свойства' ) )
			$mol_assert_ok( text.includes( '100%' ) )
			$mol_assert_ok( text.includes( 'Выберите узел на холсте' ) )

			const shelf = [ ... stage.root.querySelectorAll(
				'[bog_vmap_app_shelf_items] [bog_vmap_app_shelf_item_row]',
			) ].map( el => el.textContent )

			$mol_assert_like( shelf.slice( 0, 6 ), [
				'Блок', 'Ячейка кода', 'График', 'Калькулятор', 'Карта', 'Калькулятор и карта',
			] )

			$mol_assert_ok( shelf.includes( 'Поле' ) )
			$mol_assert_ok( shelf.includes( 'Выбор' ) )

			const apps = [ ... stage.root.querySelectorAll(
				'[bog_vmap_app_shelf_app_list] [bog_vmap_app_shelf_item_row]',
			) ].map( el => el.textContent )

			$mol_assert_like( apps, [ 'Button', 'Calc', 'Map' ] )

			$mol_assert_equal( stage.root.querySelector( '[bog_vmap_app_palette_class_row]' ), null )

			stage.classes_open()

			const rows = [ ... stage.root.querySelectorAll( '[bog_vmap_app_palette_class_row]' ) ]
				.map( el => el.textContent )

			$mol_assert_like( rows, [ `${d}mol_view`, button, calc, map ] )

			$mol_assert_like( stage.broken(), [ stage.pane.Scene( stage.pane.scene_key() ).dom_id() ] )

		},

		'a ready made pair lands wired, by one click on the shelf'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.click( stage.shelf_row( 'Калькулятор и карта' ) )

			const node = stage.app.node()

			$mol_assert_like( node.sub_names( '' ), [ 'Pair' ] )
			$mol_assert_like( node.sub_names( 'Pair' ), [ 'Calc', 'Map' ] )
			$mol_assert_like( Object.keys( stage.app.spots() ), [ 'Pair' ] )

			const links = node.links()
			$mol_assert_equal( links.length, 1 )
			$mol_assert_like(
				[ links[ 0 ].from, links[ 0 ].from_prop, links[ 0 ].to, links[ 0 ].to_prop ],
				[ 'Calc', 'result', 'Map', 'zoom' ],
			)

			$mol_assert_equal( stage.scene.last( 'doc_set' )!.src, stage.app.doc_source() )

			$mol_assert_equal( stage.app.selected(), 'Pair' )

		},

		'an application added by its address puts its objects on the shelf'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.type( stage.field( 'Shelf().Links()' ), $bog_vmap_app_flow_other )

			stage.scene.hello()

			const apps = [ ... stage.root.querySelectorAll(
				'[bog_vmap_app_shelf_app_list] [bog_vmap_app_shelf_item_row]',
			) ].map( el => el.textContent )

			$mol_assert_like( apps, [ 'Basket' ] )

			stage.click( stage.shelf_row( 'Basket' ) )

			$mol_assert_ok( stage.app.doc_source().includes( `Basket ${d}shop_basket` ) )
			$mol_assert_equal( stage.app.selected(), 'Basket' )

		},

		'a class carried from the palette becomes a part, picked and ready to press'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )

			const source = stage.app.doc_source()
			$mol_assert_ok( source.includes( `Calc ${ calc }` ) )
			$mol_assert_ok( source.includes( '<= Calc' ) )
			$mol_assert_like( stage.app.spots(), { Calc: { x: 200, y: 150 } } )

			$mol_assert_equal( stage.scene.last( 'doc_set' )!.src, source )

			$mol_assert_equal( stage.app.selected(), 'Calc' )
			$mol_assert_ok( stage.root.querySelector( '[bog_vmap_app_pane_handle]' ) !== null )
			stage.field( "Row('result').Value().Number().Num()" )

			stage.tap( stage.part_center( 'Calc' ) )

			$mol_assert_equal( stage.app.selected(), 'Calc' )

			const click = stage.scene.last( 'click_at' )!
			$mol_assert_equal( click.x, 250 )
			$mol_assert_equal( click.y, 175 )

		},

		'a value typed into the inspector goes into the document and to the scene'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			stage.tap( stage.part_center( 'Calc' ) )

			const before = stage.scene.sent( 'doc_set' ).length

			stage.type( stage.field( "Row('result').Value().Number().Num()" ), '42' )

			const source = stage.app.doc_source()
			$mol_assert_ok( source.includes( `Calc ${ calc } result 42` ) )

			$mol_assert_ok( source.includes( '<= Calc' ) )

			$mol_assert_ok( stage.scene.sent( 'doc_set' ).length > before )
			$mol_assert_equal( stage.scene.last( 'doc_set' )!.src, source )

		},

		'a wire drawn between two parts is written, labelled and unplugged'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 100, 100 ]) )
			stage.drop( map, stage.client([ 400, 100 ]) )
			stage.tap( stage.part_center( 'Calc' ) )

			const overlay = stage.overlay()
			const out = stage.port_dot( 'Calc', 'result', 'out' )
			const into = stage.port_dot( 'Map', 'zoom', 'in' )

			stage.press( overlay, out )
			stage.move( overlay, into )
			stage.release( overlay, into )
			stage.redraw()

			const source = stage.app.doc_source()
			$mol_assert_ok( source.includes( '\tcalc_result = Calc result\n' ) )
			$mol_assert_ok( source.includes( 'zoom <= calc_result' ) )

			stage.scene.flush()
			$mol_assert_like(
				stage.scene.last( 'values_want' )!.names,
				[ 'calc_result', 'Calc.result', 'Calc.op', 'Map.marker' ],
			)

			stage.scene.values({ calc_result: '42', 'Calc.result': '42', 'Calc.op': 'plus' })
			$mol_assert_like(
				stage.pane.wire_lines().map( line => [ line.key, line.label ] ),
				[ [ 'Map.zoom', '42' ] ],
			)
			$mol_assert_like( stage.pane.label_lines( 'Calc' ), [ 'result: 42', 'op: plus' ] )

			stage.tap( stage.part_center( 'Map' ) )
			stage.press( overlay, stage.port_dot( 'Map', 'zoom', 'in' ) )
			stage.release( overlay, stage.client([ 550, 450 ]) )
			stage.redraw()

			const after = stage.app.doc_source()
			$mol_assert_equal( after.includes( 'calc_result' ), false )
			$mol_assert_like( stage.app.doc_wires(), [] )

		},

		async 'a published part comes back through the palette field'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			const library = $bog_vmap_app_publish_store.make({
				$,
				shelf_land_config: ()=> $.$giper_baza_glob.home().land(),
			})
			stage.app.Publish().store = ()=> library

			stage.drop( button, stage.client([ 200, 150 ]) )
			stage.tap( stage.part_center( 'Button' ) )

			stage.click( stage.button( 'В библиотеку' ) )

			const link = await $bog_vmap_app_flow_settle( ()=> library.link() )
			stage.redraw()

			$mol_assert_ok( link )
			$mol_assert_ok( stage.text().includes( 'опубликовано' ) )
			$mol_assert_ok( stage.text().includes( link ) )

			stage.type( stage.field( 'Shelf().Links()' ), link )

			$mol_assert_like( stage.app.lands(), [ link ] )
			$mol_assert_like(
				stage.app.lib_classes().map( tree => tree.type ),
				[ `${d}bog_vmap_pub_button` ],
			)

			stage.drop( `${d}bog_vmap_pub_button`, stage.client([ 400, 300 ]) )

			$mol_assert_ok( stage.app.doc_source().includes( ` ${d}bog_vmap_pub_button\n` ) )
			$mol_assert_equal( Object.keys( stage.app.spots() ).length, 2 )

		},

		async 'a second scene is a document of its own and the first one comes back'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			const first = stage.store.doc_current()!.link().str
			const source = stage.app.doc_source()

			stage.click( stage.button( 'Новая сцена' ) )

			await $bog_vmap_app_flow_settle( ()=> stage.store.doc_links().length > 1 )
			stage.redraw()

			$mol_assert_equal( stage.store.doc_links().length, 2 )
			$mol_assert_ok( stage.store.doc_current()!.link().str !== first )
			$mol_assert_equal( stage.app.doc_source(), `${ stage.app.doc_root() } ${d}mol_view\n\tsub /\n` )
			$mol_assert_like( stage.app.spots(), {} )

			const scenes = stage.app.Scenes() as $$.$bog_vmap_app_scenes
			scenes.current( first )
			stage.redraw()

			$mol_assert_equal( stage.app.doc_source(), source )
			$mol_assert_like( stage.app.spots(), { Calc: { x: 200, y: 150 } } )

		},

		'the frame is raised from markup and carries no address'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const frame = stage.frame()

			$mol_assert_equal( frame.getAttribute( 'sandbox' ), 'allow-scripts' )
			$mol_assert_equal( frame.hasAttribute( 'src' ), false )

			const html = frame.getAttribute( 'srcdoc' ) ?? ''
			const bundle = stage.app.scene_bundle()

			$mol_assert_ok( bundle.endsWith( '/scene/web.js' ) )
			$mol_assert_ok( html.includes( `src="${ bundle }"` ) )

			$mol_assert_ok( html.includes( 'color-scheme:dark' ) )

		},

		'the pack goes down the wire before the document and the libraries'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			const kinds = stage.scene.posted.map( message => message.kind )
			const pack = kinds.indexOf( 'pack_set' )

			$mol_assert_ok( pack >= 0 )
			$mol_assert_ok( pack < kinds.indexOf( 'doc_set' ) )
			$mol_assert_ok( pack < kinds.indexOf( 'libs_set' ) )

			$mol_assert_equal( stage.scene.last( 'pack_set' )?.uri, stage.app.pack_script() )

		},

		'a new pack gives a new frame, a new land keeps the old one'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const field = stage.field( 'Shelf().Links()' )

			const before = stage.frame()

			stage.type( field, 'http://pack.test/, AbCdEfGh' )
			$mol_assert_ok( stage.frame() !== before )
			$mol_assert_like( stage.app.lands(), [ 'AbCdEfGh' ] )

			$mol_assert_equal( stage.pane.ready(), false )

			const seen = stage.scene.posted.length
			stage.scene.hello()

			$mol_assert_equal( stage.pane.ready(), true )
			$mol_assert_equal( stage.scene.posted[ seen ]?.kind, 'pack_set' )
			$mol_assert_equal( stage.scene.last( 'pack_set' )?.uri, 'http://pack.test/web.js' )

			const kept = stage.frame()
			stage.type( field, 'http://pack.test/, AbCdEfGh, ZyXwVuTs' )

			$mol_assert_equal( stage.frame(), kept )
			$mol_assert_like( stage.app.lands(), [ 'AbCdEfGh', 'ZyXwVuTs' ] )

		},

		'a change of pack raises no false alarm about the scene'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const watch = ()=> stage.timers.filter( timer => timer.delay === stage.pane.answer_limit() ).length

			stage.drop( calc, stage.client([ 200, 150 ]) )
			$mol_assert_equal( stage.pane.warmed(), true )

			const sent = stage.scene.posted.length
			const armed = watch()

			stage.type( stage.field( 'Shelf().Links()' ), 'http://pack.test/' )

			$mol_assert_equal( stage.pane.ready(), false )
			$mol_assert_equal( stage.scene.posted.length, sent )

			$mol_assert_equal( stage.pane.watchdog(), null )
			$mol_assert_equal( watch(), armed )
			$mol_assert_equal( stage.pane.stalled(), false )
			$mol_assert_equal( stage.text().includes( 'Сцена не отвечает' ), false )

			stage.scene.hello()

			$mol_assert_equal( stage.pane.ready(), true )
			$mol_assert_equal( stage.scene.posted[ sent ]?.kind, 'pack_set' )
			$mol_assert_equal( stage.scene.posted[ sent ]?.uri, 'http://pack.test/web.js' )

		},

		'the palette field takes a pack with lands and says why it refuses a second'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			const field = stage.field( 'Shelf().Links()' )
			stage.type( field, 'http://pack.test/, AbCdEfGh' )

			$mol_assert_equal( stage.app.pack_link(), 'http://pack.test/' )
			$mol_assert_like( stage.app.lands(), [ 'AbCdEfGh' ] )

			const key = stage.pane.scene_key()
			$mol_assert_equal( stage.pane.pack_uri(), 'http://pack.test/web.js' )

			stage.type( field, 'http://pack.test/, AbCdEfGh, http://other.test/' )

			$mol_assert_ok( stage.text().includes( $bog_vmap_lib_links_reason.pack_second ) )
			$mol_assert_ok( stage.text().includes( 'http://other.test/' ) )

			$mol_assert_equal( stage.pane.scene_key(), key )
			$mol_assert_equal( stage.field( 'Shelf().Links()' ).value, 'http://pack.test/, AbCdEfGh, http://other.test/' )

		},

		'delete takes the part out, and the camera leaves the document alone'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 100, 100 ]) )
			stage.drop( map, stage.client([ 300, 100 ]) )
			stage.tap( stage.part_center( 'Calc' ) )

			stage.click( stage.button( 'Удалить' ) )

			const source = stage.app.doc_source()
			$mol_assert_equal( source.includes( 'Calc' ), false )
			$mol_assert_ok( source.includes( `Map ${ map }` ) )
			$mol_assert_equal( stage.app.selected(), null )
			$mol_assert_like( Object.keys( stage.app.spots() ), [ 'Map' ] )

			const overlay = stage.overlay()
			stage.press( overlay, stage.client([ 450, 400 ]) )
			stage.move( overlay, stage.client([ 500, 430 ]) )
			stage.release( overlay, stage.client([ 500, 430 ]) )
			stage.redraw()

			$mol_assert_like( [ ... stage.pane.camera_shift() ], [ 50, 30 ] )

			stage.click( stage.button( '+' ) )
			$mol_assert_ok( stage.text().includes( '125%' ) )

			stage.click( stage.button( 'Сбросить вид' ) )
			$mol_assert_ok( stage.text().includes( '100%' ) )

			const size = $bog_vmap_app_flow_size
			const shift = stage.pane.camera_shift()

			$mol_assert_like(
				[ 300 + size.width / 2 + shift[0], 100 + size.height / 2 + shift[1] ],
				[ $bog_vmap_app_flow_rect.width / 2, $bog_vmap_app_flow_rect.height / 2 ],
			)

			$mol_assert_equal( stage.app.doc_source(), source )

		},

		'a page takes the parts dropped into it and stacks them the way it is set'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.click( stage.button( 'Артборд' ) )

			$mol_assert_equal( stage.app.selected(), 'Page' )

			const node = stage.app.node()
			$mol_assert_like( node.sub_names( 'Page' ), [] )

			const page = stage.pane.part_box( 'Page' )!
			$mol_assert_ok( page )

			const zoom = stage.pane.camera_zoom()
			const inside = ( x: number, y: number )=> stage.client([
				page.left + x * zoom,
				page.top + y * zoom,
			])

			stage.drop( calc, inside( 200, 40 ) )
			stage.drop( map, inside( 200, 250 ) )

			$mol_assert_like( node.sub_names( 'Page' ), [ 'Calc', 'Map' ] )
			$mol_assert_like( Object.keys( stage.app.spots() ), [ 'Page' ] )
			$mol_assert_equal( stage.app.doc_source().includes( '\t\tsub /\n\t\t\t<= Calc\n\t\t\t<= Map\n' ), true )

			stage.tap( inside( 200, 250 ) )
			$mol_assert_equal( stage.app.selected(), 'Page' )

			stage.click( stage.check( 'рядом' ) )

			$mol_assert_ok( stage.app.doc_source().includes( 'flexDirection \\row' ) )
			$mol_assert_equal( stage.scene.last( 'doc_set' )!.src, stage.app.doc_source() )

			const first = stage.pane.part_box( 'Calc' )!
			const second = stage.pane.part_box( 'Map' )!
			$mol_assert_equal( first.top, second.top )
			$mol_assert_ok( second.left > first.left )

			stage.drop( button, inside( 20, 20 ) )
			$mol_assert_like( node.sub_names( 'Page' ), [ 'Button', 'Calc', 'Map' ] )

		},

		'the sandbox comes up while the document of the address is still on its way'( $ ) {
			const waiting = new Promise( ()=> {} )
			const store = $bog_vmap_app_store.make({
				$,
				doc_land_config: ()=> null,
				source: ()=> { throw waiting },
				spots: ()=> { throw waiting },
				pack: ()=> { throw waiting },
			})

			const stage = $bog_vmap_app_flow_stage( $, { store } )

			$mol_assert_ok( stage.frame().getAttribute( 'srcdoc' ) )
			$mol_assert_equal( stage.pane.ready(), true )

			$mol_assert_equal( stage.text().includes( 'сцена на связи' ), false )

			$mol_assert_equal( stage.app.links(), '' )
			stage.classes_open()
			stage.class_row( calc )

		},

		'a silent scene raises the strip and the button gives a fresh frame'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			$mol_assert_equal( stage.pane.stalled(), false )

			const frame = stage.frame()

			stage.scene.silence()

			stage.click( stage.button( '+' ) )

			const watch = stage.timers.filter( timer => timer.delay === stage.pane.answer_limit() ).at( -1 )!
			$mol_assert_ok( watch )

			watch.task()
			stage.redraw()

			$mol_assert_equal( stage.pane.stalled(), true )
			$mol_assert_ok( stage.text().includes( 'Сцена не отвечает' ) )

			stage.click( stage.button( 'Перезагрузить сцену' ) )

			$mol_assert_equal( stage.pane.stalled(), false )
			$mol_assert_equal( stage.pane.ready(), false )
			$mol_assert_equal( stage.text().includes( 'Сцена не отвечает' ), false )

			$mol_assert_ok( stage.frame() !== frame )

		},

		'the stand keeps to its own corner and leaves the page it was opened on alone'( $ ) {
			const dom = $.$mol_dom_context
			const live = dom.document.createElement( 'div' )
			live.setAttribute( 'id', 'flow_live_mark' )
			dom.document.body.appendChild( live )

			const stage = $bog_vmap_app_flow_stage( $ )
			stage.drop( calc, stage.client([ 200, 150 ]) )

			$mol_assert_equal( live.isConnected, true )
			$mol_assert_equal( stage.root.isConnected, true )
			$mol_assert_equal( stage.root.parentElement === dom.document.body, false )

			$bog_vmap_app_flow_stage( $ )

			$mol_assert_equal( live.isConnected, true )
			$mol_assert_equal( stage.root.isConnected, false )

			live.remove()
		},

		'a pack that never answers names itself in the header instead of a green lie'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const note = 'Загрузка библиотеки компонентов… http://localhost:9080/bog/vmap/part/-/web.js'

			stage.drop( calc, stage.client([ 200, 150 ]) )
			$mol_assert_ok( stage.text().includes( 'сцена на связи' ) )

			stage.scene.silence()
			stage.pane.warmed( false )
			stage.scene.pack_note( note )
			stage.redraw()

			$mol_assert_equal( stage.pane.pack_note(), note )
			$mol_assert_ok( stage.text().includes( note ) )
			$mol_assert_equal( stage.text().includes( 'сцена на связи' ), false )

		},

		'a dead pack skips the pointless relaunch and the plate hands the default pack back'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const dead = 'https://dead.test/'

			stage.drop( calc, stage.client([ 200, 150 ]) )

			stage.app.links( dead )
			stage.scene.silence()
			stage.pane.warmed( false )
			stage.scene.pack_note( 'Загрузка библиотеки компонентов… ' + dead + 'web.js' )
			stage.redraw()

			const generation = stage.pane.scene_generation()

			$mol_assert_ok( stage.pane.watchdog() !== null )

			const watch = stage.timers.filter( timer => timer.delay === stage.pane.cold_limit() ).at( -1 )!
			$mol_assert_ok( watch )

			watch.task()
			stage.redraw()

			$mol_assert_equal( stage.pane.stalled(), true )
			$mol_assert_equal( stage.pane.restart_tries(), 0 )
			$mol_assert_equal( stage.pane.scene_generation(), generation )
			$mol_assert_ok( stage.text().includes( 'верните пак по умолчанию' ) )

			stage.click( stage.button( 'Вернуть пак по умолчанию' ) )
			stage.redraw()

			$mol_assert_equal( stage.app.links(), '' )
			$mol_assert_equal( stage.app.links_parsed().pack, null )
			$mol_assert_equal( stage.pane.scene_generation(), generation + 1 )
			$mol_assert_equal( stage.pane.stalled(), false )

		},

		'the default pack comes back without taking the lands of the shelf with it'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const land = 'AbCdEfGh'

			stage.app.links( 'https://dead.test/, ' + land )
			$mol_assert_like( stage.app.links_parsed().lands, [ land ] )

			stage.app.pack_default()

			$mol_assert_equal( stage.app.links(), land )
			$mol_assert_equal( stage.app.links_parsed().pack, null )
			$mol_assert_like( stage.app.links_parsed().lands, [ land ] )

		},

		'deleting a wired part leaves no wire to a node that is gone'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 100, 100 ]) )
			stage.drop( map, stage.client([ 400, 100 ]) )
			stage.tap( stage.part_center( 'Calc' ) )

			const overlay = stage.overlay()
			stage.press( overlay, stage.port_dot( 'Calc', 'result', 'out' ) )
			stage.move( overlay, stage.port_dot( 'Map', 'zoom', 'in' ) )
			stage.release( overlay, stage.port_dot( 'Map', 'zoom', 'in' ) )
			stage.redraw()

			$mol_assert_equal( stage.app.doc_wires().length, 1 )

			stage.tap( stage.part_center( 'Calc' ) )
			stage.click( stage.button( 'Удалить' ) )

			$mol_assert_equal( stage.app.doc_source().includes( 'calc_result' ), false )
			$mol_assert_like( stage.app.doc_wires(), [] )
			$mol_assert_ok( stage.app.doc_source().includes( `Map ${ map }` ) )

			stage.drop( calc, stage.client([ 100, 300 ]) )
			$mol_assert_equal( stage.app.selected(), 'Calc' )

			stage.press( overlay, stage.port_dot( 'Calc', 'result', 'out' ) )
			stage.move( overlay, stage.port_dot( 'Map', 'zoom', 'in' ) )
			stage.release( overlay, stage.port_dot( 'Map', 'zoom', 'in' ) )
			stage.redraw()

			$mol_assert_equal( stage.app.doc_wires().length, 1 )

			stage.tap( stage.part_center( 'Map' ) )
			stage.click( stage.button( 'Удалить' ) )

			$mol_assert_like( stage.app.doc_wires(), [] )
			$mol_assert_equal( stage.app.doc_source().includes( 'calc_result' ), false )
			$mol_assert_ok( stage.app.doc_source().includes( `Calc ${ calc }` ) )
			$mol_assert_equal( stage.app.doc_source().includes( `Map ${ map }` ), false )

		},

		'a file dropped on the canvas reaches the scene and the export by one address'( $ ) {

			const uri = 'https://baza.test/?BAZA:file=TQzejQsT_m3PFV7J3;name=logo.png'

			const store = $bog_vmap_app_store.make({
				$,
				doc_land_config: ()=> null,
				asset_put: ()=> uri,
			})
			store.doc_add( 'Сцена 1' )

			const stage = $bog_vmap_app_flow_stage( $, { store } )
			const dom = $.$mol_dom_context

			const point = stage.client([ 300, 200 ])

			const drop = new dom.Event( 'drop', { bubbles: true, cancelable: true } )
			Object.defineProperty( drop, 'clientX', { value: point[ 0 ] } )
			Object.defineProperty( drop, 'clientY', { value: point[ 1 ] } )
			Object.defineProperty( drop, 'dataTransfer', {
				value: {
					files: [ new dom.File(
						[ new Uint8Array([ 137, 80, 78, 71 ]) ],
						'logo.png',
						{ type: 'image/png' },
					) ],
				},
			} )

			stage.overlay().dispatchEvent( drop )
			stage.redraw()

			const source = stage.app.doc_source()

			$mol_assert_ok( source.includes( `uri \\${ uri }` ) )
			$mol_assert_like( stage.app.spots(), { Image: { x: 300, y: 200 } } )
			$mol_assert_equal( stage.app.selected(), 'Image' )

			$mol_assert_equal( stage.scene.last( 'doc_set' )!.src, source )

			const module = stage.app.export_state().module!
			const tree = module.files.find( file => file.name.endsWith( '.view.tree' ) )!.text

			$mol_assert_ok( tree.includes( `uri \\${ uri }` ) )

		},

		'entering a node does not move the canvas down by a row'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )

			const column = stage.app.body()

			stage.tap( stage.part_center( 'Calc' ) )
			stage.tap( stage.part_center( 'Calc' ) )
			stage.redraw()

			$mol_assert_ok( stage.app.inside_note() )
			$mol_assert_equal( stage.pane.inside(), true )

			const after = stage.app.body()
			$mol_assert_equal( after.length, column.length )
			for( let i = 0; i < column.length; ++i ) $mol_assert_equal( after[ i ], column[ i ] )

			const note = stage.app.Notes().dom_node()
			$mol_assert_equal( stage.app.Body().dom_node().contains( note ), true )
			$mol_assert_equal( note.parentElement === stage.root, false )

			const sheet = $mol_dom_context.document.getElementById(
				'$mol_style_attach:$bog_vmap_app',
			)!.innerHTML

			const rule = sheet.slice( sheet.indexOf( '[bog_vmap_app_notes]' ) )
			$mol_assert_ok( rule.slice( 0, rule.indexOf( '}' ) ).includes( 'position: absolute' ) )

		},

	})

}

namespace $ {
	const d = '$'

	const card = `${d}bog_builderui_card`

	$mol_test({

		'the theme picked in the bar is worn by the editor and told to the scene'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.click( stage.theme_button( 'light' ) )

			$mol_assert_equal( stage.theme_worn(), '$mol_theme_light' )
			$mol_assert_equal( stage.scene.last( 'theme_set' )!.theme, '$mol_theme_light' )

			stage.click( stage.theme_button( 'dark' ) )

			$mol_assert_equal( stage.theme_worn(), '$mol_theme_dark' )
			$mol_assert_equal( stage.scene.last( 'theme_set' )!.theme, '$mol_theme_dark' )

		},

		'the editor keeps the hue of the scene, so the two halves of the screen agree'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			$mol_assert_ok( stage.root.getAttribute( 'style' )?.includes( '--mol_theme_hue: 240deg' ) )

		},

		'the theme is kept under a key of this app, not one shared by the origin'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.click( stage.theme_button( 'light' ) )

			const keys = Object.keys( stage.kept )

			$mol_assert_equal( keys.length, 1 )
			$mol_assert_ok( keys[ 0 ].startsWith( '$bog_vmap_app' ) )
			$mol_assert_equal( stage.kept[ keys[ 0 ] ], '"light"' )

		},

		'the shelf offers the packs by name, and the current one is marked'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			const offers = [ ... stage.root.querySelectorAll( '[bog_vmap_app_shelf_pack_row]' ) ]
				.map( el => el.textContent )

			$mol_assert_like( offers, [ 'Детали vmap', 'Builderui' ] )

			const marked = ()=> [ ... stage.root.querySelectorAll( '[bog_vmap_app_shelf_pack_current]' ) ]
				.map( el => el.textContent )

			$mol_assert_like( marked(), [ 'Детали vmap' ] )

			stage.click( stage.pack_row( 'Builderui' ) )
			stage.scene.hello()

			$mol_assert_like( marked(), [ 'Builderui' ] )

		},

		'the pack chosen on the shelf is the one the scene is sent to load'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.click( stage.pack_row( 'Builderui' ) )
			stage.scene.hello()

			$mol_assert_equal( stage.app.links(), $bog_vmap_app_flow_ui )
			$mol_assert_equal( stage.scene.last( 'pack_set' )!.uri, $bog_vmap_app_flow_ui + 'web.js' )

			const apps = [ ... stage.root.querySelectorAll(
				'[bog_vmap_app_shelf_app_list] [bog_vmap_app_shelf_item_row]',
			) ].map( el => el.textContent )

			$mol_assert_like( apps, [ 'Builderui_card' ] )

		},

		'a class of the chosen pack lands on the canvas and gets measured'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.click( stage.pack_row( 'Builderui' ) )
			stage.scene.hello()

			stage.drop( card, stage.client([ 200, 150 ]) )

			$mol_assert_ok( stage.app.doc_source().includes( `Builderui_card ${ card }` ) )
			$mol_assert_like( stage.app.spots(), { Builderui_card: { x: 200, y: 150 } } )
			$mol_assert_like( stage.pane.part_box( 'Builderui_card' ), {
				left: 200, top: 150, width: 100, height: 50,
			} )

		},

		'a pack taken back gives the editor its own parts again'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.click( stage.pack_row( 'Builderui' ) )
			stage.scene.hello()

			stage.click( stage.pack_row( 'Детали vmap' ) )
			stage.scene.hello()

			$mol_assert_equal( stage.app.links(), '' )

			const apps = [ ... stage.root.querySelectorAll(
				'[bog_vmap_app_shelf_app_list] [bog_vmap_app_shelf_item_row]',
			) ].map( el => el.textContent )

			$mol_assert_like( apps, [ 'Button', 'Calc', 'Map' ] )

		},

	})

}
