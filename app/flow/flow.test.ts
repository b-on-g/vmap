namespace $ {
	const d = '$'

	export const $bog_vmap_app_flow_parts = [
		`${d}mol_string ${d}mol_view`,
		`\tvalue? \\`,
		`${d}mol_number ${d}mol_view`,
		`\tvalue? 0`,
		`\tsub /`,
		`\t\t<= String ${d}mol_string`,
		`${d}mol_select ${d}mol_view`,
		`\tvalue? \\`,
		`${d}mol_switch ${d}mol_view`,
		`\tvalue? \\`,
		`${d}mol_check_box ${d}mol_view`,
		`\tchecked? false`,
		`${d}mol_paragraph ${d}mol_view`,
		`\ttitle \\`,
		`${d}bog_vmap_part_cell ${d}mol_view`,
		`\tresult \\`,
		`\tcode? \\`,
		`\tslots? \\`,
		`\tin1 null`,
		`\tin2 null`,
		`\tin3 null`,
		`\tsub /`,
		`\t\t<= Code ${d}mol_string`,
		`\t\t\tvalue? <=> code?`,
		`\t\t<= Draft ${d}mol_string`,
		`\t\t<= Note ${d}mol_paragraph`,
		`\t\t\ttitle \\Выполнить`,
		`${d}bog_vmap_part_plot ${d}mol_view`,
		`\tseries /`,
		`${d}bog_vmap_part_calc ${d}mol_view`,
		`\tresult 0`,
		`\tsub /`,
		`\t\t<= Left ${d}mol_number`,
		`\t\t<= Right ${d}mol_number`,
		`${d}bog_vmap_part_map ${d}mol_view`,
		`\tzoom 0`,
	]

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
		... $bog_vmap_app_flow_parts,
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

		readonly camera?: 'pinned' | 'own'

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
			@ $mol_mem_key
			static override value< Value >( key: string, next?: Value | null ): Value | null {

				if( next === undefined ) return JSON.parse( kept[ key ] ?? 'null' )

				if( next === null ) delete kept[ key ]
				else kept[ key ] = JSON.stringify( next )

				return next
			}
		}
		$.$mol_state_local = $mol_state_local_flow

		const session = {} as { [ key: string ]: string | undefined }

		class $mol_state_session_flow< Value > extends $mol_state_session< Value > {
			@ $mol_mem_key
			static override value< Value >( key: string, next?: Value | null ): Value {

				if( next === undefined ) return JSON.parse( session[ key ] ?? 'null' )

				if( next === null ) delete session[ key ]
				else session[ key ] = JSON.stringify( next )

				return next as Value
			}
		}
		$.$mol_state_session = $mol_state_session_flow

		class $mol_media_flow extends $mol_media {
			static override match( query: string, next?: boolean ) {
				if( query === '(prefers-color-scheme: light)' ) return false
				return super.match( query, next )
			}
		}
		$.$mol_media = $mol_media_flow

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
		app.page_uri = ()=> 'http://localhost/'
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

		const camera_pin = ()=> {
			pane.camera_doc( pane.camera_key() )
			pane.camera_zoom( 1 )
			pane.camera_shift( new $mol_vector_2d( 0, 0 ) )
			app.dom_tree()
		}

		if( over.camera !== 'own' ) camera_pin()

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
				const named = [ ... root.querySelectorAll( '[role=button]' ) ].find( el => el.textContent?.startsWith( title ) )
				return named ?? found( '[role=button]', `button «${ title }»`, el => el.getAttribute( 'title' )?.startsWith( title ) ?? false )
			},

			check( title: string ) {
				return found( '[role=checkbox]', `check «${ title }»`, el => el.textContent?.includes( title ) ?? false )
			},

			class_row( klass: string ) {
				return found( '[bog_vmap_app_palette_item]', `palette row ${ klass }`, el => el.textContent === klass )
			},

			assets() {
				this.click( this.check( 'Ассеты' ) )
			},

			classes_open() {
				this.assets()
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

			lights_toggle() {
				return found( '[bog_vmap_app_lights]', 'lights toggle', ()=> true )
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
				const index = pane.part_dots( name ).findIndex( known => known.name === port )
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

	const number = `${d}mol_number`

	$mol_test({
		'the editor opens with the head of its canvas, its palette and its canvas'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.button( 'Новая сцена' )
			stage.button( 'Удалить' )
			stage.button( 'В библиотеку' )

			const canvas = stage.pane.dom_node()
			const tools = stage.root.querySelector( '[bog_vmap_app_tools]' )!

			for( const title of [ '−', '100%', '+' ] ) {
				$mol_assert_equal( tools.contains( stage.button( title ) ), true )
				$mol_assert_equal( canvas.contains( stage.button( title ) ), false )
			}
			$mol_assert_equal( canvas.querySelector( '[role=button]' ), null )

			const text = stage.text()
			$mol_assert_ok( text.includes( 'Ассеты' ) )
			$mol_assert_ok( text.includes( 'Свойства' ) )
			$mol_assert_ok( text.includes( '100%' ) )
			$mol_assert_ok( text.includes( 'Выберите узел на холсте' ) )

			stage.assets()

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

			$mol_assert_like( apps, [
				'Button', 'Calc', 'Map',
				'Vmap_part_cell', 'Vmap_part_plot', 'Vmap_part_calc', 'Vmap_part_map',
			] )

			$mol_assert_equal( stage.root.querySelector( '[bog_vmap_app_palette_class_row]' ), null )

			stage.classes_open()

			const rows = [ ... stage.root.querySelectorAll( '[bog_vmap_app_palette_class_row]' ) ]
				.map( el => el.textContent )

			$mol_assert_like( rows, [
				`${d}mol_view`, button, calc, map,
				... $bog_vmap_app_flow_parts.filter( line => line[ 0 ] === '$' ).map( line => line.split( ' ' )[ 0 ] ),
			] )

			$mol_assert_like( stage.broken(), [ stage.pane.Scene( stage.pane.scene_key() ).dom_id() ] )

		},

		'a ready made pair lands wired, by one click on the shelf'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.assets()
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

			stage.assets()
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
			$mol_assert_like( stage.app.spots(), { Calc: { x: 104, y: 74 } } )

			$mol_assert_equal( stage.scene.last( 'doc_set' )!.src, source )

			$mol_assert_equal( stage.app.selected(), 'Calc' )
			$mol_assert_ok( stage.root.querySelector( '[bog_vmap_app_pane_handle]' ) !== null )
			stage.field( "Row('result').Value().Num()" )

			stage.tap( stage.part_center( 'Calc' ) )

			$mol_assert_equal( stage.app.selected(), 'Calc' )

			const click = stage.scene.last( 'click_at' )!
			$mol_assert_equal( click.x, 154 )
			$mol_assert_equal( click.y, 99 )

		},

		'a value typed into the inspector goes into the document and to the scene'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			stage.tap( stage.part_center( 'Calc' ) )

			const before = stage.scene.sent( 'doc_set' ).length

			stage.type( stage.field( "Row('result').Value().Num()" ), '42' )

			const source = stage.app.doc_source()
			$mol_assert_ok( source.includes( `Calc ${ calc } result 42` ) )

			$mol_assert_ok( source.includes( '<= Calc' ) )

			$mol_assert_ok( stage.scene.sent( 'doc_set' ).length > before )
			$mol_assert_equal( stage.scene.last( 'doc_set' )!.src, source )

		},

		'a value typed for a field is a cell of the root that follows the field through a rename and a delete'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const app = stage.app

			stage.drop( number, stage.client([ 200, 150 ]) )
			stage.tap( stage.part_center( 'Number' ) )

			stage.type( stage.field( "Row('value').Value().Num()" ), '6000000' )

			$mol_assert_equal( app.node().over_tree( 'Number', 'value' )!.toString(), 'value? <=> number_value?\n' )
			$mol_assert_equal( app.node().prop_decl( 'number_value' )!.toString(), 'number_value? 6000000\n' )
			$mol_assert_equal( stage.scene.last( 'doc_set' )!.src, app.doc_source() )

			stage.click( stage.check( 'Слои' ) )
			const layers = app.Layers().dom_node().textContent ?? ''
			$mol_assert_ok( stage.root.contains( app.Layers().dom_node() ) )
			$mol_assert_ok( layers.includes( 'Number' ) )
			$mol_assert_equal( layers.includes( 'number_value' ), false )
			$mol_assert_like( app.doc_wires(), [] )
			$mol_assert_like( stage.pane.wire_lines(), [] )

			stage.type( stage.field( "Row('value').Value().Num()" ), '7000000' )

			$mol_assert_equal( app.node().prop_decl( 'number_value' )!.toString(), 'number_value? 7000000\n' )
			$mol_assert_equal( app.doc_source().includes( '6000000' ), false )
			$mol_assert_equal( app.doc_source().split( '\n' ).filter( line => line.includes( 'number_value' ) ).length, 2 )
			$mol_assert_equal( stage.field( "Row('value').Value().Num()" ).value, '7000000' )

			const name = stage.field( 'Inspect().Name()' )
			stage.type( name, 'Amount' )
			stage.blur( name )

			$mol_assert_equal( app.selected(), 'Amount' )
			$mol_assert_equal( app.node().cell_of( 'Amount', 'value' ), 'amount_value' )
			$mol_assert_equal( app.doc_source().includes( 'number_value' ), false )
			$mol_assert_equal( stage.field( "Row('value').Value().Num()" ).value, '7000000' )
			$mol_assert_equal( stage.scene.last( 'doc_set' )!.src, app.doc_source() )

			app.node_delete()

			$mol_assert_equal( app.doc_source().includes( 'amount_value' ), false )
			$mol_assert_equal( app.doc_source().includes( 'Amount' ), false )

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

		async 'a drag with the shift held writes a two way wire, and one undo takes it back'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const history = stage.app.History() as $$.$bog_vmap_app_history

			const stepped = async ()=> {
				const source = stage.app.doc_source()
				const taken = ()=> history.ring( history.doc_key() ).at( -1 )?.source === source

				for( let i = 0; i < 10 && !taken(); ++i ) {
					stage.timers.filter( timer => timer.delay === history.step_delay() ).at( -1 )?.task()
					await $bog_vmap_app_flow_settle( taken, 30 )
					stage.redraw()
				}

				$mol_assert_equal( taken(), true )
			}

			stage.drop( number, stage.client([ 100, 100 ]) )
			stage.drop( number, stage.client([ 400, 100 ]) )
			stage.tap( stage.part_center( 'Number' ) )

			await stepped()
			const before = stage.app.doc_source()

			const overlay = stage.overlay()
			const out = stage.port_dot( 'Number', 'value', 'out' )
			const into = stage.port_dot( 'Number_2', 'value', 'in' )

			stage.press( overlay, out, { shiftKey: true } )
			stage.move( overlay, into, { shiftKey: true } )
			stage.release( overlay, into, { shiftKey: true } )
			stage.redraw()

			const source = stage.app.doc_source()
			$mol_assert_ok( source.includes( '\tnumber_value? = Number value?\n' ) )
			$mol_assert_ok( source.includes( 'value? <=> number_value?\n' ) )
			$mol_assert_equal( stage.app.doc_wires()[0].bidi, true )
			$mol_assert_equal( stage.pane.Wire().label_text( 'Number_2.value' ), '⇄' )

			stage.scene.values({ number_value: '7' })
			$mol_assert_equal( stage.pane.Wire().label_text( 'Number_2.value' ), '⇄ 7' )

			await stepped()
			history.undo()
			stage.redraw()

			$mol_assert_equal( stage.app.doc_source(), before )
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
			$mol_assert_like( stage.app.spots(), { Calc: { x: 104, y: 74 } } )

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
			stage.assets()
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

			stage.assets()
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

			stage.click( stage.button( '125%' ) )
			$mol_assert_ok( stage.text().includes( '100%' ) )

			const size = $bog_vmap_app_flow_size
			const shift = stage.pane.camera_shift()

			$mol_assert_like(
				[ 204 + size.width / 2 + shift[0], 24 + size.height / 2 + shift[1] ],
				[ $bog_vmap_app_flow_rect.width / 2, $bog_vmap_app_flow_rect.height / 2 ],
			)

			$mol_assert_equal( stage.app.doc_source(), source )

		},

		'a page takes the parts dropped into it and stacks them the way it is set'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const dom = $.$mol_dom_context

			dom.document.dispatchEvent( new dom.KeyboardEvent( 'keydown', { code: 'KeyF', key: 'f', bubbles: true } ) )
			stage.tap( stage.client([ 100, 100 ]) )

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

			const column = stage.app.Canvas().body()

			stage.tap( stage.part_center( 'Calc' ) )
			stage.tap( stage.part_center( 'Calc' ) )
			stage.redraw()

			$mol_assert_ok( stage.app.inside_note() )
			$mol_assert_equal( stage.pane.inside(), true )

			const after = stage.app.Canvas().body()
			$mol_assert_equal( after.length, column.length )
			for( let i = 0; i < column.length; ++i ) $mol_assert_equal( after[ i ], column[ i ] )

			const note = stage.app.Inside_note().dom_node()

			$mol_assert_equal( stage.root.querySelector( '[bog_vmap_app_canvas_foot]' )!.contains( note ), true )
			$mol_assert_equal( stage.root.querySelector( '[bog_vmap_app_canvas_body]' )!.contains( note ), false )

		},

	})

}

namespace $ {
	const d = '$'

	const card = `${d}bog_builderui_card`

	$mol_test({

		'the light switch is worn by the editor and told to the scene'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			$mol_assert_equal( stage.theme_worn(), '$mol_theme_dark' )

			stage.click( stage.lights_toggle() )

			$mol_assert_equal( stage.theme_worn(), '$mol_theme_light' )
			$mol_assert_equal( stage.scene.last( 'theme_set' )!.theme, '$mol_theme_light' )

			stage.click( stage.lights_toggle() )

			$mol_assert_equal( stage.theme_worn(), '$mol_theme_dark' )
			$mol_assert_equal( stage.scene.last( 'theme_set' )!.theme, '$mol_theme_dark' )

		},

		'the light choice is kept under a key of this app, not one shared by the origin'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.click( stage.lights_toggle() )

			const keys = Object.keys( stage.kept )

			$mol_assert_equal( keys.length, 1 )
			$mol_assert_ok( keys[ 0 ].startsWith( '$bog_vmap_app' ) )
			$mol_assert_equal( stage.kept[ keys[ 0 ] ], 'true' )

		},

		'the shell is a head bar over three columns and the canvas has no head of its own'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const app = stage.app

			$mol_assert_ok( stage.root.hasAttribute( 'mol_page' ) )
			$mol_assert_equal( stage.root.hasAttribute( 'mol_book2' ), false )

			const head = stage.root.querySelector( '[bog_vmap_app_head]' )!

			$mol_assert_ok( head.hasAttribute( 'mol_page_head' ) )
			$mol_assert_equal( head.parentElement, stage.root )

			const inside = ( view: $mol_view )=> head.contains( view.dom_node() )

			for( const view of [
				app.Left_check(),
				app.Tool_select(),
				app.Tool_board(),
				app.Tool_hand(),
				app.Delete(),
				app.Root_name(),
				app.Zoom_out(),
				app.Zoom_reset(),
				app.Zoom_in(),
				app.History_check(),
				app.Publish(),
				app.Download(),
				app.Lights(),
				app.Right_check(),
			] ) $mol_assert_ok( inside( view ) )

			$mol_assert_equal( inside( app.Status() ), false )

			const holds = ( parent: $mol_view, kids: readonly $mol_view[] )=> {
				const nodes = [ ... parent.dom_node().children ]
				$mol_assert_equal( nodes.length, kids.length )
				kids.forEach( ( kid, index )=> $mol_assert_ok( nodes[ index ] === kid.dom_node() ) )
			}

			holds( app.Main(), [ app.Left(), app.Canvas(), app.Right() ] )
			holds( app.Left(), [ app.Scenes(), app.Left_tabs(), app.Layers() ] )
			holds( app.Right(), [ app.Right_tabs(), app.Idle() ] )

			$mol_assert_equal( stage.root.querySelector( '[bog_vmap_app_canvas_head]' ), null )
			$mol_assert_equal( app.Canvas().dom_node().querySelector( '[mol_page_head]' ), null )
			$mol_assert_equal( app.Canvas().title(), 'Холст' )

			const foot = stage.root.querySelector( '[bog_vmap_app_canvas_foot]' )!

			$mol_assert_ok( app.Canvas().body().includes( app.Pane() ) )
			$mol_assert_equal( foot.childElementCount, 1 )
			$mol_assert_ok( foot.contains( app.Status().dom_node() ) )

		},

		'the percent in the canvas tools zooms and gives the view back'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.pane.camera_shift( new $mol_vector_2d( 700, 700 ) )
			stage.redraw()

			stage.click( stage.button( '+' ) )

			$mol_assert_equal( stage.pane.camera_zoom(), 1.25 )
			$mol_assert_ok( stage.button( '125%' ) )

			stage.click( stage.button( '−' ) )

			$mol_assert_equal( stage.pane.camera_zoom(), 1 )

			stage.click( stage.button( '+' ) )
			stage.click( stage.button( '125%' ) )

			$mol_assert_equal( stage.pane.camera_zoom(), 1 )
			$mol_assert_like( [ ... stage.pane.camera_shift() ], [ 0, 0 ] )
			$mol_assert_ok( stage.button( '100%' ) )

		},

		'the column checks and the tabs put panels on screen and take them off'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const app = stage.app

			const showed = ( page: $mol_view )=> stage.root.contains( page.dom_node() )

			$mol_assert_ok( showed( app.Scenes() ) )
			$mol_assert_ok( showed( app.Layers() ) )
			$mol_assert_ok( showed( app.Idle() ) )
			$mol_assert_equal( showed( app.Shelf() ), false )
			$mol_assert_equal( showed( app.Code() ), false )
			$mol_assert_equal( showed( app.History() ), false )

			stage.click( stage.check( 'Ассеты' ) )

			$mol_assert_ok( showed( app.Shelf() ) )
			$mol_assert_equal( showed( app.Layers() ), false )

			stage.click( stage.check( 'Слои' ) )

			$mol_assert_ok( showed( app.Layers() ) )
			$mol_assert_equal( showed( app.Shelf() ), false )

			stage.click( stage.check( 'Код' ) )

			$mol_assert_ok( showed( app.Code() ) )
			$mol_assert_equal( showed( app.Idle() ), false )

			stage.click( stage.check( 'Код' ) )

			$mol_assert_ok( showed( app.Code() ) )

			stage.click( stage.check( 'Версии' ) )

			$mol_assert_ok( showed( app.History() ) )
			$mol_assert_equal( showed( app.Code() ), false )

			stage.click( app.History_check().dom_node() )

			$mol_assert_ok( showed( app.Idle() ) )
			$mol_assert_equal( showed( app.History() ), false )

			stage.click( app.History_check().dom_node() )

			$mol_assert_ok( showed( app.History() ) )

			stage.click( app.Left_check().dom_node() )

			$mol_assert_equal( showed( app.Scenes() ), false )
			$mol_assert_equal( showed( app.Layers() ), false )

			stage.click( app.Right_check().dom_node() )

			$mol_assert_equal( showed( app.History() ), false )
			$mol_assert_equal( app.Main().dom_node().childElementCount, 1 )
			$mol_assert_ok( showed( app.Canvas() ) )

			stage.click( app.Left_check().dom_node() )

			$mol_assert_ok( showed( app.Scenes() ) )
			$mol_assert_ok( showed( app.Layers() ) )

		},

		'a panel under a tab keeps its tools, and a title that only repeats the tab is gone'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const app = stage.app

			const title = ( page: $mol_view )=> page.dom_node().querySelector( '[mol_page_title]' )
			const tools = ( page: $mol_view )=> page.dom_node().querySelector( '[mol_page_tools]' )!

			stage.assets()

			$mol_assert_equal( title( app.Shelf() ), null )
			$mol_assert_ok( tools( app.Shelf() ).contains( ( app.Shelf() as $$.$bog_vmap_app_shelf ).Filter().dom_node() ) )

			stage.click( stage.check( 'Версии' ) )

			$mol_assert_equal( title( app.History() ), null )
			$mol_assert_ok( tools( app.History() ).contains( stage.button( 'Отменить' ) ) )

			stage.click( stage.check( 'Код' ) )

			$mol_assert_ok( title( app.Code() ) )

			stage.click( stage.check( 'Дизайн' ) )
			stage.drop( `${d}flow_calc`, stage.client([ 200, 150 ]) )

			$mol_assert_ok( title( app.Inspect() )!.contains( ( app.Inspect() as $$.$bog_vmap_app_inspect ).Name().dom_node() ) )

		},

		'shift and backslash on the page fold both columns away, and typed into a field it stays a letter'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const app = stage.app
			const dom = $.$mol_dom_context

			const stroke = ( target: EventTarget )=> {
				target.dispatchEvent( new dom.KeyboardEvent( 'keydown', { code: 'Backslash', key: '|', shiftKey: true, bubbles: true } ) )
				stage.redraw()
			}

			const count = ()=> app.Main().dom_node().childElementCount

			$mol_assert_equal( count(), 3 )

			stroke( dom.document )

			$mol_assert_equal( count(), 1 )
			$mol_assert_equal( stage.root.contains( app.Layers().dom_node() ), false )

			stroke( stage.field( 'Root_name()' ) )

			$mol_assert_equal( count(), 1 )

			stroke( dom.document )

			$mol_assert_equal( count(), 3 )
			$mol_assert_ok( stage.root.contains( app.Layers().dom_node() ) )

		},

		'the shelf offers the packs by name, and the current one is marked'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.assets()

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

			stage.assets()
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

			stage.assets()
			stage.click( stage.pack_row( 'Builderui' ) )
			stage.scene.hello()

			stage.drop( card, stage.client([ 200, 150 ]) )

			$mol_assert_ok( stage.app.doc_source().includes( `Builderui_card ${ card }` ) )
			$mol_assert_like( stage.app.spots(), { Builderui_card: { x: 104, y: 74 } } )
			$mol_assert_like( stage.pane.part_box( 'Builderui_card' ), {
				left: 104, top: 74, width: 100, height: 50,
			} )

		},

		'a pack taken back gives the editor its own parts again'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.assets()
			stage.click( stage.pack_row( 'Builderui' ) )
			stage.scene.hello()

			stage.click( stage.pack_row( 'Детали vmap' ) )
			stage.scene.hello()

			$mol_assert_equal( stage.app.links(), '' )

			const apps = [ ... stage.root.querySelectorAll(
				'[bog_vmap_app_shelf_app_list] [bog_vmap_app_shelf_item_row]',
			) ].map( el => el.textContent )

			$mol_assert_like( apps, [
				'Button', 'Calc', 'Map',
				'Vmap_part_cell', 'Vmap_part_plot', 'Vmap_part_calc', 'Vmap_part_map',
			] )

		},

	})

}

namespace $ {
	const d = '$'

	const calc = `${d}flow_calc`
	const map = `${d}flow_map`

	type stage = ReturnType< typeof $bog_vmap_app_flow_stage >

	const key_of = ( code: string )=> {
		if( code === 'Space' ) return ' '
		if( code.startsWith( 'Key' ) ) return code.slice( 3 ).toLowerCase()
		return code
	}

	const pressed = ( $: $, stage: stage, code: string, over: KeyboardEventInit = {}, target?: EventTarget )=> {
		const dom = $.$mol_dom_context
		const event = new dom.KeyboardEvent( 'keydown', { code, key: key_of( code ), bubbles: true, cancelable: true, ... over } )
		;( target ?? dom.document ).dispatchEvent( event )
		stage.redraw()
		stage.scene.flush()
		return event
	}

	const stepped = async ( stage: stage )=> {
		const history = stage.app.History() as $$.$bog_vmap_app_history
		const source = stage.app.doc_source()
		const taken = ()=> history.ring( history.doc_key() ).at( -1 )?.source === source

		for( let i = 0; i < 10 && !taken(); ++i ) {
			stage.timers.filter( timer => timer.delay === history.step_delay() ).at( -1 )?.task()
			await $bog_vmap_app_flow_settle( taken, 30 )
			stage.redraw()
		}

		$mol_assert_equal( taken(), true )
	}

	const undone = ( stage: stage )=> {
		const history = stage.app.History() as $$.$bog_vmap_app_history
		history.undo()
		stage.redraw()
		stage.scene.flush()
	}

	const styled = ( stage: stage, name: string, prop: string )=> {
		const style = stage.app.node().over_tree( name, 'style' )?.kids[ 0 ] ?? null
		return $bog_vmap_lang_dict_get( style, prop )?.value ?? null
	}

	const settle = async ()=> {
		await Promise.resolve()
		await Promise.resolve()
	}

	$mol_test({

		'the window hands the tool keys to the canvas, and a field keeps them'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const dom = $.$mol_dom_context

			const f = pressed( $, stage, 'KeyF' )
			$mol_assert_equal( stage.pane.tool(), 'board' )
			$mol_assert_equal( f.defaultPrevented, true )

			pressed( $, stage, 'KeyH' )
			$mol_assert_equal( stage.pane.tool(), 'hand' )

			pressed( $, stage, 'KeyV' )
			$mol_assert_equal( stage.pane.tool(), 'select' )

			const field = stage.app.Root_name().dom_node()
			const typed = pressed( $, stage, 'KeyF', {}, field )
			$mol_assert_equal( stage.pane.tool(), 'select' )
			$mol_assert_equal( typed.defaultPrevented, false )

			pressed( $, stage, 'Space' )
			$mol_assert_equal( stage.pane.grip(), true )

			dom.document.dispatchEvent( new dom.KeyboardEvent( 'keyup', { code: 'Space', key: ' ', bubbles: true } ) )
			$mol_assert_equal( stage.pane.grip(), false )

			pressed( $, stage, 'Space' )
			dom.dispatchEvent( new dom.FocusEvent( 'blur' ) )
			$mol_assert_equal( stage.pane.grip(), false )

		},

		async 'Backspace from the window deletes the pick, a field keeps it, and one undo brings it back'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			$mol_assert_equal( stage.app.selected(), 'Calc' )

			await stepped( stage )
			const before = stage.app.doc_source()

			pressed( $, stage, 'Backspace', {}, stage.app.Root_name().dom_node() )
			$mol_assert_equal( stage.app.doc_source(), before )

			const gone = pressed( $, stage, 'Backspace' )
			$mol_assert_equal( gone.defaultPrevented, true )
			$mol_assert_equal( stage.app.doc_source().includes( 'Calc' ), false )
			$mol_assert_equal( stage.app.selected(), null )

			await stepped( stage )
			undone( stage )

			$mol_assert_equal( stage.app.doc_source(), before )
			$mol_assert_like( Object.keys( stage.app.spots() ), [ 'Calc' ] )

		},

		async 'Cmd+D puts a copy beside the pick under the next free number, and each undo takes one copy back'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			await stepped( stage )
			const before = stage.app.doc_source()

			const copy = pressed( $, stage, 'KeyD', { metaKey: true } )
			$mol_assert_equal( copy.defaultPrevented, true )

			$mol_assert_ok( stage.app.doc_source().includes( `Calc_2 ${ calc }` ) )
			$mol_assert_like( stage.app.spots()[ 'Calc_2' ], { x: 228, y: 74 } )
			$mol_assert_like( [ ... stage.app.picked() ], [ 'Calc_2' ] )
			$mol_assert_like( stage.app.node().sub_names(), [ 'Calc', 'Calc_2' ] )

			await stepped( stage )
			const once = stage.app.doc_source()

			pressed( $, stage, 'KeyD', { ctrlKey: true } )
			$mol_assert_like( stage.app.spots()[ 'Calc_3' ], { x: 352, y: 74 } )
			$mol_assert_like( [ ... stage.app.picked() ], [ 'Calc_3' ] )

			await stepped( stage )

			undone( stage )
			$mol_assert_equal( stage.app.doc_source(), once )

			undone( stage )
			$mol_assert_equal( stage.app.doc_source(), before )
			$mol_assert_like( Object.keys( stage.app.spots() ), [ 'Calc' ] )

		},

		async 'a copy of a board copies what is laid out in it, a nested copy goes after its original'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const node = stage.app.node()

			pressed( $, stage, 'KeyF' )
			stage.tap( stage.client([ 100, 100 ]) )

			const page = stage.pane.part_box( 'Page' )!
			stage.drop( calc, stage.client([ page.left + 200, page.top + 40 ]) )
			$mol_assert_like( node.sub_names( 'Page' ), [ 'Calc' ] )

			await stepped( stage )
			const before = stage.app.doc_source()

			stage.app.selected( 'Page' )
			pressed( $, stage, 'KeyD', { metaKey: true } )

			$mol_assert_like( node.sub_names(), [ 'Page', 'Page_2' ] )
			$mol_assert_like( node.sub_names( 'Page' ), [ 'Calc' ] )
			$mol_assert_like( node.sub_names( 'Page_2' ), [ 'Calc_2' ] )
			$mol_assert_like( stage.app.spots()[ 'Page_2' ], { x: 524, y: 100 } )
			$mol_assert_equal( styled( stage, 'Page_2', 'width' ), '1280px' )

			await stepped( stage )
			const once = stage.app.doc_source()

			stage.app.selected( 'Calc' )
			pressed( $, stage, 'KeyD', { metaKey: true } )

			$mol_assert_like( node.sub_names( 'Page' ), [ 'Calc', 'Calc_3' ] )
			$mol_assert_equal( stage.app.spots()[ 'Calc_3' ], undefined )
			$mol_assert_like( [ ... stage.app.picked() ], [ 'Calc_3' ] )

			await stepped( stage )

			undone( stage )
			$mol_assert_equal( stage.app.doc_source(), once )

			undone( stage )
			$mol_assert_equal( stage.app.doc_source(), before )
			$mol_assert_like( Object.keys( stage.app.spots() ), [ 'Page' ] )

		},

		'a board picked together with what is inside it is copied once'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const node = stage.app.node()

			pressed( $, stage, 'KeyF' )
			stage.tap( stage.client([ 100, 100 ]) )

			const page = stage.pane.part_box( 'Page' )!
			stage.drop( calc, stage.client([ page.left + 200, page.top + 40 ]) )

			stage.app.picked([ 'Page', 'Calc' ])
			pressed( $, stage, 'KeyD', { metaKey: true } )

			$mol_assert_like( node.sub_names(), [ 'Page', 'Page_2' ] )
			$mol_assert_like( node.sub_names( 'Page' ), [ 'Calc' ] )
			$mol_assert_like( node.sub_names( 'Page_2' ), [ 'Calc_2' ] )
			$mol_assert_like( [ ... stage.app.picked() ], [ 'Page_2' ] )

		},

		async 'the board tool puts a board where it is clicked, and of the box it is dragged under the camera'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const overlay = stage.overlay()

			pressed( $, stage, 'KeyF' )
			stage.tap( stage.client([ 100, 100 ]) )

			$mol_assert_equal( stage.app.selected(), 'Page' )
			$mol_assert_like( stage.app.spots()[ 'Page' ], { x: 100, y: 100 } )
			$mol_assert_equal( styled( stage, 'Page', 'width' ), '1280px' )
			$mol_assert_equal( styled( stage, 'Page', 'minHeight' ), '720px' )
			$mol_assert_equal( stage.pane.tool(), 'select' )

			await stepped( stage )
			const before = stage.app.doc_source()

			stage.pane.camera_shift( new $mol_vector_2d( 100, 50 ) )
			stage.pane.camera_zoom( 2 )

			pressed( $, stage, 'KeyF' )
			stage.press( overlay, stage.client([ 200, 150 ]) )
			stage.move( overlay, stage.client([ 400, 350 ]) )
			stage.release( overlay, stage.client([ 400, 350 ]) )
			stage.redraw()
			stage.scene.flush()

			$mol_assert_equal( stage.app.selected(), 'Page_2' )
			$mol_assert_like( stage.app.spots()[ 'Page_2' ], { x: 50, y: 50 } )
			$mol_assert_equal( styled( stage, 'Page_2', 'width' ), '100px' )
			$mol_assert_equal( styled( stage, 'Page_2', 'minHeight' ), '100px' )
			$mol_assert_like( [ ... stage.pane.camera_shift() ], [ 100, 50 ] )
			$mol_assert_equal( stage.pane.camera_zoom(), 2 )

			await stepped( stage )
			undone( stage )

			$mol_assert_equal( stage.app.doc_source(), before )

		},

		'a pick moved off the canvas and back through the layers does not let the pointer in again'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			stage.drop( map, stage.client([ 400, 150 ]) )

			stage.tap( stage.part_center( 'Calc' ) )
			stage.tap( stage.part_center( 'Calc' ) )
			$mol_assert_equal( stage.pane.inside(), true )
			$mol_assert_ok( stage.text().includes( 'Внутри Calc' ) )

			stage.click( stage.check( 'Слои' ) )

			const layer = ( name: string )=> [ ... stage.root.querySelectorAll( '[bog_vmap_app_layers_pick]' ) ]
				.find( el => el.textContent === name )!

			stage.click( layer( 'Map' ) )
			$mol_assert_equal( stage.app.selected(), 'Map' )
			$mol_assert_equal( stage.pane.inside(), false )
			$mol_assert_equal( stage.text().includes( 'Внутри' ), false )

			stage.click( layer( 'Calc' ) )
			$mol_assert_equal( stage.app.selected(), 'Calc' )
			$mol_assert_equal( stage.pane.inside(), false )
			$mol_assert_equal( stage.pane.overlay_style().clipPath, 'none' )
			$mol_assert_equal( stage.text().includes( 'Внутри' ), false )

		},

		async 'a new scene opened from inside a node says nothing about being inside'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			stage.tap( stage.part_center( 'Calc' ) )
			stage.tap( stage.part_center( 'Calc' ) )
			$mol_assert_ok( stage.text().includes( 'Внутри Calc' ) )

			stage.click( stage.button( 'Новая сцена' ) )
			await $bog_vmap_app_flow_settle( ()=> stage.store.doc_links().length > 1 )
			stage.redraw()

			$mol_assert_equal( stage.pane.inside(), false )
			$mol_assert_equal( stage.text().includes( 'Внутри' ), false )

		},

		'the tool buttons of the head are the tools'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const app = stage.app

			stage.click( app.Tool_board().dom_node() )
			$mol_assert_equal( stage.pane.tool(), 'board' )
			$mol_assert_equal( app.Tool_board().checked(), true )
			$mol_assert_equal( app.Tool_select().checked(), false )

			stage.click( app.Tool_board().dom_node() )
			$mol_assert_equal( stage.pane.tool(), 'select' )

			stage.click( app.Tool_hand().dom_node() )
			$mol_assert_equal( stage.pane.tool(), 'hand' )

			pressed( $, stage, 'KeyV' )
			$mol_assert_equal( app.Tool_select().checked(), true )
			$mol_assert_equal( app.Tool_hand().checked(), false )

		},

		async 'Escape from the window in a field only takes the focus off the field'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const dom = $.$mol_dom_context

			stage.drop( calc, stage.client([ 200, 150 ]) )

			const field = stage.app.Root_name().dom_node() as HTMLInputElement
			field.focus()

			pressed( $, stage, 'Escape', {}, field )
			await settle()

			$mol_assert_equal( dom.document.activeElement, stage.pane.dom_node() )
			$mol_assert_equal( stage.app.selected(), 'Calc' )

			pressed( $, stage, 'Escape' )
			$mol_assert_equal( stage.app.selected(), null )

		},

	})

}

namespace $ {
	const d = '$'

	const calc = `${d}flow_calc`
	const map = `${d}flow_map`

	type stage = ReturnType< typeof $bog_vmap_app_flow_stage >

	const context = ( $: $, stage: stage, point: readonly [ number, number ] )=> {
		const dom = $.$mol_dom_context
		const event = new dom.MouseEvent( 'contextmenu', {
			bubbles: true,
			cancelable: true,
			button: 2,
			clientX: point[0],
			clientY: point[1],
		} )
		stage.overlay().dispatchEvent( event )
		stage.redraw()
		stage.scene.flush()
		return event
	}

	const items = ( stage: stage )=> [ ... stage.root.querySelectorAll( '[bog_vmap_app_menu_item]' ) ]

	const label = ( el: Element )=> el.querySelector( '[bog_vmap_app_menu_item_label]' )?.textContent ?? ''

	const titles = ( stage: stage )=> items( stage ).map( label )

	const chosen = ( stage: stage, title: string )=> {
		const item = items( stage ).find( el => label( el ) === title )
		if( !item ) return $mol_fail( new Error( `no item «${ title }» in the menu` ) )
		stage.click( item )
	}

	const pressed = ( $: $, stage: stage, code: string, over: KeyboardEventInit = {}, target?: EventTarget )=> {
		const dom = $.$mol_dom_context
		const event = new dom.KeyboardEvent( 'keydown', { code, key: code, bubbles: true, cancelable: true, ... over } )
		;( target ?? dom.document ).dispatchEvent( event )
		stage.redraw()
		stage.scene.flush()
		return event
	}

	const stepped = async ( stage: stage )=> {
		const history = stage.app.History() as $$.$bog_vmap_app_history
		const source = stage.app.doc_source()
		const taken = ()=> history.ring( history.doc_key() ).at( -1 )?.source === source

		for( let i = 0; i < 10 && !taken(); ++i ) {
			stage.timers.filter( timer => timer.delay === history.step_delay() ).at( -1 )?.task()
			await $bog_vmap_app_flow_settle( taken, 30 )
			stage.redraw()
		}

		$mol_assert_equal( taken(), true )
	}

	const undone = ( stage: stage )=> {
		const history = stage.app.History() as $$.$bog_vmap_app_history
		history.undo()
		stage.redraw()
		stage.scene.flush()
	}

	const styled = ( stage: stage, name: string, prop: string )=> {
		const style = stage.app.node().over_tree( name, 'style' )?.kids[ 0 ] ?? null
		return $bog_vmap_lang_dict_get( style, prop )?.value ?? null
	}

	const shown = ( stage: stage, name: string )=> {
		const box = stage.pane.part_box( name )
		const rect = $bog_vmap_app_flow_rect
		return Boolean( box ) && box!.left >= 0 && box!.top >= 0
			&& box!.left + box!.width <= rect.width && box!.top + box!.height <= rect.height
	}

	const settle = async ()=> {
		await Promise.resolve()
		await Promise.resolve()
	}

	$mol_test({

		async 'a right click on a part opens its menu at the pointer, and Copy puts a copy beside it'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			await stepped( stage )
			const before = stage.app.doc_source()

			const at = stage.part_center( 'Calc' )
			const event = context( $, stage, at )

			$mol_assert_equal( event.defaultPrevented, true )
			$mol_assert_like( titles( stage ), [ 'Копировать', 'Удалить', 'Обернуть в артборд', 'Выделить родителя', 'Внутрь' ] )

			const style = ( stage.pane.menu_view().dom_node() as HTMLElement ).style
			$mol_assert_equal( style.left, ( at[0] - $bog_vmap_app_flow_rect.left ) + 'px' )
			$mol_assert_equal( style.top, ( at[1] - $bog_vmap_app_flow_rect.top ) + 'px' )

			const spot = stage.app.spots()[ 'Calc' ]

			chosen( stage, 'Копировать' )

			$mol_assert_ok( stage.app.doc_source().includes( `Calc_2 ${ calc }` ) )
			$mol_assert_like( stage.app.spots()[ 'Calc_2' ], { x: spot.x + 100 + 24, y: spot.y } )
			$mol_assert_like( [ ... stage.app.picked() ], [ 'Calc_2' ] )
			$mol_assert_equal( items( stage ).length, 0 )

			await stepped( stage )
			undone( stage )

			$mol_assert_equal( stage.app.doc_source(), before )

		},

		'Delete from the menu takes the picked part out'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			stage.drop( map, stage.client([ 400, 150 ]) )

			context( $, stage, stage.part_center( 'Calc' ) )
			$mol_assert_like( [ ... stage.app.picked() ], [ 'Calc' ] )

			chosen( stage, 'Удалить' )

			$mol_assert_equal( stage.app.doc_source().includes( 'Calc' ), false )
			$mol_assert_like( Object.keys( stage.app.spots() ), [ 'Map' ] )
			$mol_assert_equal( items( stage ).length, 0 )

		},

		async 'Wrap from the menu puts a free part into a board of its box, one undo takes it back out, and Cmd+Alt+G does the same'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const node = stage.app.node()

			stage.drop( calc, stage.client([ 200, 150 ]) )
			await stepped( stage )
			const before = stage.app.doc_source()
			const spot = stage.app.spots()[ 'Calc' ]

			context( $, stage, stage.part_center( 'Calc' ) )
			chosen( stage, 'Обернуть в артборд' )

			$mol_assert_like( node.sub_names(), [ 'Page' ] )
			$mol_assert_like( node.sub_names( 'Page' ), [ 'Calc' ] )
			$mol_assert_like( stage.app.spots(), { Page: spot } )
			$mol_assert_equal( styled( stage, 'Page', 'width' ), '100px' )
			$mol_assert_equal( styled( stage, 'Page', 'minHeight' ), '50px' )
			$mol_assert_like( [ ... stage.app.picked() ], [ 'Page' ] )

			await stepped( stage )
			undone( stage )

			$mol_assert_equal( stage.app.doc_source(), before )
			$mol_assert_like( Object.keys( stage.app.spots() ), [ 'Calc' ] )

			stage.app.picked([ 'Calc' ])
			const key = pressed( $, stage, 'KeyG', { key: '©', metaKey: true, altKey: true } )

			$mol_assert_equal( key.defaultPrevented, true )
			$mol_assert_like( node.sub_names(), [ 'Page' ] )
			$mol_assert_like( node.sub_names( 'Page' ), [ 'Calc' ] )

		},

		'Wrap from the menu gives a part laid out in a board a board of its own at the same place'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const node = stage.app.node()

			pressed( $, stage, 'KeyF', { key: 'f' } )
			stage.tap( stage.client([ 100, 100 ]) )

			const page = stage.pane.part_box( 'Page' )!
			stage.drop( calc, stage.client([ page.left + 200, page.top + 40 ]) )
			stage.drop( map, stage.client([ page.left + 200, page.top + 120 ]) )
			$mol_assert_like( node.sub_names( 'Page' ), [ 'Calc', 'Map' ] )

			context( $, stage, stage.part_center( 'Calc' ) )
			chosen( stage, 'Обернуть в артборд' )

			$mol_assert_like( node.sub_names(), [ 'Page' ] )
			$mol_assert_like( node.sub_names( 'Page' ), [ 'Page_2', 'Map' ] )
			$mol_assert_like( node.sub_names( 'Page_2' ), [ 'Calc' ] )
			$mol_assert_equal( stage.app.spots()[ 'Page_2' ], undefined )
			$mol_assert_equal( styled( stage, 'Page_2', 'width' ), '100px' )
			$mol_assert_like( [ ... stage.app.picked() ], [ 'Page_2' ] )

		},

		'Wrap from the menu takes a picked set into one board around them, top to bottom and left to right'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const node = stage.app.node()

			stage.drop( map, stage.client([ 400, 150 ]) )
			stage.drop( calc, stage.client([ 200, 150 ]) )

			const spots = stage.app.spots()
			$mol_assert_equal( spots[ 'Map' ].y, spots[ 'Calc' ].y )
			$mol_assert_equal( spots[ 'Map' ].x - spots[ 'Calc' ].x, 200 )

			stage.app.picked([ 'Map', 'Calc' ])
			context( $, stage, stage.part_center( 'Map' ) )
			$mol_assert_like( [ ... stage.app.picked() ], [ 'Map', 'Calc' ] )

			chosen( stage, 'Обернуть в артборд' )

			$mol_assert_like( node.sub_names(), [ 'Page' ] )
			$mol_assert_like( node.sub_names( 'Page' ), [ 'Calc', 'Map' ] )
			$mol_assert_like( stage.app.spots(), { Page: spots[ 'Calc' ] } )
			$mol_assert_equal( styled( stage, 'Page', 'width' ), '300px' )
			$mol_assert_equal( styled( stage, 'Page', 'minHeight' ), '50px' )

		},

		'Select parent from the menu picks the board around the part, and is off for a free part'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			pressed( $, stage, 'KeyF', { key: 'f' } )
			stage.tap( stage.client([ 100, 100 ]) )

			const page = stage.pane.part_box( 'Page' )!
			stage.drop( calc, stage.client([ page.left + 200, page.top + 40 ]) )
			stage.drop( map, stage.client([ 700, 520 ]) )

			context( $, stage, stage.part_center( 'Map' ) )
			const parent = items( stage ).find( el => label( el ) === 'Выделить родителя' )!
			$mol_assert_equal( parent.getAttribute( 'disabled' ), 'true' )

			context( $, stage, stage.part_center( 'Calc' ) )
			chosen( stage, 'Выделить родителя' )

			$mol_assert_like( [ ... stage.app.picked() ], [ 'Page' ] )
			$mol_assert_equal( items( stage ).length, 0 )

		},

		async 'Inside from the menu lets the pointer into the part and hands it the keyboard'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const dom = $.$mol_dom_context

			stage.drop( calc, stage.client([ 200, 150 ]) )
			stage.drop( map, stage.client([ 400, 150 ]) )

			stage.app.picked([ 'Calc', 'Map' ])
			context( $, stage, stage.part_center( 'Calc' ) )
			chosen( stage, 'Внутрь' )
			await settle()

			$mol_assert_like( [ ... stage.app.picked() ], [ 'Calc' ] )
			$mol_assert_equal( stage.pane.inside(), true )
			$mol_assert_equal( dom.document.activeElement, stage.frame() )
			$mol_assert_ok( stage.text().includes( 'Внутри Calc' ) )
			$mol_assert_equal( stage.scene.sent( 'click_at' ).length, 0 )

		},

		'a right click on bare canvas offers a board there and the whole view'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			stage.app.picked([ 'Calc' ])

			stage.pane.camera_shift( new $mol_vector_2d( 100, 50 ) )
			stage.pane.camera_zoom( 2 )

			const event = context( $, stage, stage.client([ 300, 450 ]) )
			$mol_assert_equal( event.defaultPrevented, true )
			$mol_assert_like( titles( stage ), [ 'Артборд здесь', 'Показать всё' ] )
			$mol_assert_like( [ ... stage.app.picked() ], [ 'Calc' ] )

			chosen( stage, 'Артборд здесь' )

			$mol_assert_like( stage.app.spots()[ 'Page' ], { x: 100, y: 200 } )
			$mol_assert_equal( styled( stage, 'Page', 'width' ), '1280px' )
			$mol_assert_equal( stage.pane.tool(), 'select' )
			$mol_assert_equal( items( stage ).length, 0 )

			stage.pane.camera_shift( new $mol_vector_2d( 3000, 3000 ) )
			stage.redraw()
			$mol_assert_equal( shown( stage, 'Calc' ), false )

			context( $, stage, stage.client([ 30, 30 ]) )
			chosen( stage, 'Показать всё' )

			$mol_assert_equal( shown( stage, 'Calc' ), true )
			$mol_assert_equal( shown( stage, 'Page' ), true )

		},

		'the menu goes away on Escape and on a press elsewhere, and a right click inside the entered part is left to it'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )

			context( $, stage, stage.part_center( 'Calc' ) )
			$mol_assert_equal( items( stage ).length, 5 )

			const escape = pressed( $, stage, 'Escape' )
			$mol_assert_equal( escape.defaultPrevented, true )
			$mol_assert_equal( items( stage ).length, 0 )
			$mol_assert_equal( stage.app.selected(), 'Calc' )

			context( $, stage, stage.client([ 500, 450 ]) )
			$mol_assert_equal( items( stage ).length, 2 )

			stage.press( stage.root, stage.client([ 20, 20 ]) )
			stage.redraw()
			$mol_assert_equal( items( stage ).length, 0 )

			stage.tap( stage.part_center( 'Calc' ) )
			stage.tap( stage.part_center( 'Calc' ) )
			$mol_assert_equal( stage.pane.inside(), true )

			const inner = context( $, stage, stage.part_center( 'Calc' ) )
			$mol_assert_equal( inner.defaultPrevented, false )
			$mol_assert_equal( items( stage ).length, 0 )
			$mol_assert_equal( stage.pane.inside(), true )

		},

		'Shift+1, Shift+2 and Shift+0 from the window show everything, the pick and life size, and in a field they are letters'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const pane = stage.pane

			stage.drop( calc, stage.client([ 200, 150 ]) )
			stage.drop( map, stage.client([ 600, 500 ]) )

			pane.camera_shift( new $mol_vector_2d( 4000, 4000 ) )
			pane.camera_zoom( 3 )
			stage.redraw()

			const field = stage.app.Root_name().dom_node()
			const typed = pressed( $, stage, 'Digit1', { key: '!', shiftKey: true }, field )
			$mol_assert_equal( typed.defaultPrevented, false )
			$mol_assert_equal( pane.camera_zoom(), 3 )

			const all = pressed( $, stage, 'Digit1', { key: '!', shiftKey: true } )
			$mol_assert_equal( all.defaultPrevented, true )
			$mol_assert_equal( shown( stage, 'Calc' ), true )
			$mol_assert_equal( shown( stage, 'Map' ), true )
			$mol_assert_ok( pane.camera_zoom() <= 1 )

			stage.app.picked([ 'Map' ])
			pressed( $, stage, 'Digit2', { key: '@', shiftKey: true } )

			const map_box = pane.part_box( 'Map' )!
			$mol_assert_ok( pane.camera_zoom() > 1 )
			$mol_assert_equal( shown( stage, 'Map' ), true )
			$mol_assert_equal( Math.round( map_box.left + map_box.width / 2 ), $bog_vmap_app_flow_rect.width / 2 )
			$mol_assert_equal( Math.round( map_box.top + map_box.height / 2 ), $bog_vmap_app_flow_rect.height / 2 )

			pane.camera_zoom( .3 )
			pressed( $, stage, 'Digit0', { key: ')', shiftKey: true } )
			$mol_assert_equal( pane.zoom_title(), '100%' )

		},

	})

}
