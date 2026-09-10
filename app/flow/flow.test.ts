namespace $ {

	/**
	 * Stand for the end to end scenarios of `flow.test.ts`: the whole editor in a
	 * real DOM, with the sandbox replaced by a fake bridge peer.
	 *
	 * A `.test.ts` and not a plain module: nothing here may reach the product
	 * bundle, and mam keeps test files out of it. Everything the stand fakes is
	 * named below; the rest of the editor is the editor.
	 *
	 * `d` keeps `$` out of the string literals — mam builds its dependency graph by
	 * a regexp over sources, literals included.
	 */
	const d = '$'

	/**
	 * Class tree of the donor pack, served instead of the network.
	 *
	 * Shaped like the `web.view.tree` of a deployed module, because that is what
	 * the library parses: a class per block, properties under it. Two of them carry
	 * a number and a string, which is what makes a wire between them possible.
	 */
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

	/**
	 * A SECOND application, served at an address of its own.
	 *
	 * There to be added by hand: a person pastes the address of a deployed mol
	 * application and its own classes join the shelf. One class is enough for that,
	 * and a name of its own is what makes the difference visible.
	 */
	export const $bog_vmap_app_flow_other = 'http://other.pack/'

	export const $bog_vmap_app_flow_other_pack = [
		`${d}shop_basket ${d}mol_view`,
		`\ttitle \\`,
		``,
	].join( '\n' )

	/** Where the pane sits in the viewport. jsdom lays nothing out, so it is told. */
	export const $bog_vmap_app_flow_rect = {
		left: 200, top: 50, width: 600, height: 500, right: 800, bottom: 550,
	}

	/** Size the fake scene reports for a part with nothing inside it. */
	export const $bog_vmap_app_flow_size = { width: 100, height: 50 }

	/** Size it reports for a container, big enough to aim a drop inside it. */
	export const $bog_vmap_app_flow_board = { width: 400, height: 300 }

	/** A message the host put on the wire, as the stand keeps it. */
	export type $bog_vmap_app_flow_sent = { kind: string, [ key: string ]: unknown }

	/**
	 * Globals of a browser that node does not define and jsdom does not export.
	 *
	 * The selection plugin of the view pack names `ShadowRoot` and the touch plugin
	 * names `PointerEvent` bare, so a field or a gesture in a node test dies on a
	 * `ReferenceError` that says nothing about the editor. Pointer capture is
	 * missing from jsdom elements outright, and the touch plugin calls it without a
	 * guard.
	 */
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

	/** The editor of the previous scenario, taken down before the next one starts. */
	let $bog_vmap_app_flow_last = null as null | $mol_object

	/**
	 * Waits for work a click handed to a fiber of its own: making a document,
	 * publishing a part. Both answer at once and land later, so a scenario that
	 * looked at the result on the next tick would sometimes be too early.
	 */
	export async function $bog_vmap_app_flow_settle< Value >( done: ()=> Value, limit = 300 ) {

		const till = Date.now() + limit

		while( !done() && Date.now() < till ) {
			await new Promise( next => setTimeout( next, 2 ) )
		}

		return done()
	}

	/**
	 * The editor, rendered into the jsdom document and talking to a fake scene.
	 *
	 * Faked, and nothing else is: the donor pack (a fixture instead of the
	 * network), the sandbox (a peer that answers like a scene), the geometry of the
	 * pane (jsdom has no layout), the timers (they must not fire by themselves),
	 * and the land of the documents (the home land, so no proof of work).
	 *
	 * A NEW SCENARIO NEEDS NONE OF THAT. One line makes the editor — the stand
	 * factory below, called with the context — and from then on everything is
	 * a gesture of the user:
	 *
	 * - `stage.drop( klass, stage.client([ x, y ]) )` carries a class out of the
	 *   palette onto the canvas, `stage.tap( stage.part_center( name ) )` clicks a
	 *   part, `stage.press/move/release( stage.overlay(), point )` is any gesture
	 *   in between, and `stage.port_dot( part, port, 'out' )` is where a wire starts;
	 * - `stage.button( 'Удалить' )`, `stage.field( 'Shelf().Links()' )` and
	 *   `stage.class_row( klass )` find what to press, and fail by name when it is
	 *   not on screen; `stage.click` and `stage.type` press and type into them;
	 * - `stage.text()` is the whole editor as text, `stage.app` and `stage.pane`
	 *   the state behind it;
	 * - `stage.scene.last( 'doc_set' )` is what the sandbox was told last,
	 *   `stage.scene.values({ … })` is the sandbox answering, `stage.scene.silence()`
	 *   is the sandbox dying. Answers are delivered by `stage.scene.flush()`, and
	 *   every gesture above flushes on its own.
	 *
	 * Points are in the screen space of the pane and go through `stage.client()`,
	 * which is the only place that knows where the pane sits.
	 */
	/** What a scenario may set up differently. Everything else is the editor as it is. */
	export type $bog_vmap_app_flow_over = {

		/** The store to open the editor on. Default: a fresh document in the home land. */
		readonly store?: $bog_vmap_app_store

		/** Leave the scene silent, so the editor is seen while the frame is still booting. */
		readonly mute?: boolean

	}

	export function $bog_vmap_app_flow_stage( $: $, over: $bog_vmap_app_flow_over = {} ) {

		browser_gaps( $ )

		const dom = $.$mol_dom_context

		// The editor of the previous scenario keeps window listeners alive, and its
		// document node keeps taking events; both go before this one is built.
		$bog_vmap_app_flow_last?.destructor()
		dom.document.body.innerHTML = ''

		const timers = [] as $mol_after_timeout[]

		class $mol_after_timeout_flow extends $mol_after_timeout {
			constructor( delay: number, task: ()=> void ) {
				super( delay, task )
				clearTimeout( this.id )
				timers.push( this )
			}
		}
		$.$mol_after_timeout = $mol_after_timeout_flow

		class $mol_fetch_flow extends $mol_fetch {
			static override text( input: RequestInfo ) {
				const uri = String( input )
				if( uri === $bog_vmap_app_flow_other + 'web.view.tree' ) return $bog_vmap_app_flow_other_pack
				if( uri.endsWith( 'web.view.tree' ) ) return $bog_vmap_app_flow_pack
				return $mol_fail( new Error( 'network in a test: ' + uri ) )
			}
		}
		$.$mol_fetch = $mol_fetch_flow

		// A store of the scenario's own is how a document that is still loading, or
		// somebody else's, is put on the stand; the default one is a fresh document
		// in the home land, made here so that nothing waits on `boot`.
		const store = over.store ?? $bog_vmap_app_store.make({ $, doc_land_config: ()=> null })
		if( !over.store ) store.doc_add( 'Сцена 1' )

		const app = $bog_vmap_app.make({ $, store: ()=> store }) as $$.$bog_vmap_app
		$bog_vmap_app_flow_last = app

		// WHICH PANELS ARE OPEN IS SAID OUT LOUD, because otherwise it is inherited
		// from whatever ran before. The three flags live in the session store, and
		// that store is one for the whole process: its values sit on the base class,
		// reachable by name, so a subclass per test — which is what the mock in
		// `app/app.test.ts` makes, and what its comment claims isolates them — shares
		// the same slots. Dropping the memoised store underneath does not help
		// either; measured, the values come back.
		//
		// The cost of not saying it is a suite whose colour depends on the order of
		// its tests: a scenario that folds the palette away leaves it folded, and the
		// next stand opens without one. Found when this stand moved into a folder of
		// its own and the flow scenarios landed after a scenario that folds it —
		// sixteen of them went red at once, having been green in the other order.
		app.palette_showed( true )
		app.inspect_showed( true )
		app.code_showed( false )

		const posted = [] as $bog_vmap_app_flow_sent[]
		const queue = [] as $bog_vmap_app_flow_sent[]

		/** Which way a node stacks what is inside it, as its `style` says. */
		const direction = ( name: string )=> {
			const style = app.node().over_tree( name, 'style' )?.kids[ 0 ] ?? null
			return $bog_vmap_lang_dict_get( style, 'flexDirection' )?.value
				?? 'row' // what `[mol_view]` is with no direction written
		}

		/**
		 * Geometry of the document as a scene would measure it: free parts at their
		 * spots, and whatever a container carries stacked inside it along the
		 * direction the node declares.
		 *
		 * A rough flex box and nothing more — boxes of one size, laid end to end —
		 * but enough for what the host does with the numbers: hit testing, the ring,
		 * the ends of a wire, and aiming a drop between two children of a page.
		 */
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

		/**
		 * The far end of the bridge: records what the host sends and lines up the
		 * answer a scene owes. Answered on `flush()` and not here, because a reply
		 * posted from inside `postMessage` would write cells while the cell that
		 * pushed is still computing.
		 */
		let silent = false
		let exposed = false

		const peer = {

			/**
			 * A frame in a sandbox has an opaque origin, and reading it from outside
			 * throws — which is how the host tells a working sandbox from a missing
			 * one. So the peer throws by default, and answers only for the scenario
			 * that asks what happens when the sandbox is gone.
			 */
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

		/** Hands one message to the host the way the frame does: a window event from the peer. */
		const deliver = ( data: $bog_vmap_app_flow_sent )=> {
			const event = new dom.MessageEvent( 'message', { data: { ns: $bog_vmap_bridge_ns, ... data } } )
			Object.defineProperty( event, 'source', { value: peer } )
			dom.dispatchEvent( event )
		}

		const scene = {

			posted,

			/** Everything of one kind the host has sent, in order. */
			sent( kind: string ) {
				return posted.filter( message => message.kind === kind )
			},

			/** The last message of a kind, or undefined. */
			last( kind: string ) {
				return this.sent( kind ).at( -1 )
			},

			/** Answers everything owed, then lets the editor redraw on the answers. */
			flush() {
				while( queue.length ) deliver( queue.shift()! )
				app.dom_tree()
			},

			/** Values of the wires, as the scene reports them. */
			values( values: { readonly [ wire: string ]: string } ) {
				deliver({ kind: 'values', values })
				app.dom_tree()
			},

			/** From now on the scene takes everything and says nothing back. */
			silence() {
				silent = true
				queue.length = 0
			},

			/** The frame boots and announces itself, as a scene does on load. */
			hello() {
				deliver({ kind: 'ready' })
				app.dom_tree()
				this.flush()
			},

			/** The sandbox is gone: the origin of the frame reads back from the host. */
			expose() {
				exposed = true
				app.dom_tree()
			},

		}

		const pane = app.Pane() as $$.$bog_vmap_app_pane
		pane.scene_peer = ()=> peer

		const root = app.dom_tree()
		dom.document.body.appendChild( root )

		// The pane and the camera plugin read their rectangle through a cell that
		// only a browser ever refreshes, so both are told it outright.
		const rect = $bog_vmap_app_flow_rect
		pane.dom_node().getBoundingClientRect = ()=> rect as DOMRect
		pane.view_rect = ()=> rect
		pane.Touch().view_rect = ()=> rect

		// A muted stand is the frame that boots and then says nothing: the scene
		// announces itself and stops, which is what document code looping on the
		// first compile looks like from here. The editor never sees geometry, so it
		// never warms, and that is the state the cold watch exists for.
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

		/**
		 * A pointer event as a browser makes one: cancelable, so that
		 * `preventDefault` in a handler really stops the camera, and bubbling, so
		 * that a press on the overlay reaches the plugins of the pane.
		 */
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

			app, pane, store, scene, root, timers,

			/** Viewport point of a point in the screen space of the pane. */
			client( point: readonly [ number, number ] ) {
				return [ rect.left + point[0], rect.top + point[1] ] as const
			},

			/** The whole editor as text, for a coarse look at what is on screen. */
			text() {
				return root.textContent ?? ''
			},

			/** Views that failed to render, by their id. The frame is not one: see below. */
			broken() {
				return [ ... root.querySelectorAll( '[mol_view_error]' ) ].map( el => el.getAttribute( 'id' ) )
			},

			button( title: string ) {
				return found( '[role=button]', `button «${ title }»`, el => el.textContent?.startsWith( title ) ?? false )
			},

			/**
			 * A checkbox or one option of a switch, by its label. Not a button: the
			 * check primitive answers `role="checkbox"`, and the options of a switch
			 * are checks, so the head bar toggles and the layout panel are found here.
			 */
			check( title: string ) {
				return found( '[role=checkbox]', `check «${ title }»`, el => el.textContent?.includes( title ) ?? false )
			},

			/** A row of the palette, by the class it offers. */
			class_row( klass: string ) {
				return found( '[bog_vmap_app_palette_item]', `palette row ${ klass }`, el => el.textContent === klass )
			},

			/** Unfolds the class list of the panel, the second level under the shelf. */
			classes_open() {
				app.Shelf().classes_showed( true )
				app.dom_tree()
				scene.flush()
			},

			/** A row of the scene list, addressed by the name of the document. */
			scene_row( title: string ) {
				return found( '[bog_vmap_app_scenes_scene_row]', `scene row ${ title }`, el => el.textContent === title )
			},

			/** A row of the shelf, addressed by what it says. */
			shelf_row( title: string ) {
				return found( '[bog_vmap_app_shelf_item_row]', `shelf row ${ title }`, el => el.textContent === title )
			},

			/** A text field, addressed by the tail of the id built out of the path to it. */
			field( tail: string ) {

				return found( 'input, textarea', `field ${ tail }`, el => el.getAttribute( 'id' )?.endsWith( tail ) ?? false ) as HTMLInputElement
			},

			overlay() {
				return root.querySelector( '[bog_vmap_app_pane_overlay]' )!
			},

			/** The frame element itself, so that a restart can be seen to replace it. */
			frame() {
				return root.querySelector( 'iframe' )!
			},

			/** Types into a field the way a person does: the value, then the input event. */
			type( el: HTMLInputElement, value: string ) {
				el.value = value
				el.dispatchEvent( new dom.Event( 'input', { bubbles: true } ) )
				app.dom_tree()
				scene.flush()
			},

			/**
			 * Leaves a field, which is how a name is committed without pressing
			 * Enter: the rename is bound to `blur` as well, because a person who
			 * typed a name and clicked elsewhere meant it.
			 */
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

			/**
			 * Carries a class from the palette onto the canvas: a press on the row,
			 * a move across the window, a release over the overlay. The pointer
			 * moves on the window because that is where the editor listens for it.
			 *
			 * The class list is the SECOND level of the panel and is folded away
			 * when the editor opens, so the gesture starts by opening it, exactly as
			 * a person reaching for a primitive does.
			 */
			drop( klass: string, point: readonly [ number, number ] ) {

				this.classes_open()
				this.press( this.class_row( klass ), [ 10, 300 ] )
				dom.dispatchEvent( pointer( 'pointermove', point ) )
				this.release( this.overlay(), point )

				app.dom_tree()
				scene.flush()

			},

			/** A click on the canvas: press and release without moving. */
			tap( point: readonly [ number, number ], over: object = {} ) {

				this.press( this.overlay(), point, over )
				this.release( this.overlay(), point, over )

				app.dom_tree()
				scene.flush()

			},

			/** Centre of a part on screen, as the scene has measured it. */
			part_center( name: string ) {

				const box = pane.part_box( name )!
				if( !box ) $mol_fail( new Error( `part ${ name } is not measured` ) )

				return this.client([ box.left + box.width / 2, box.top + box.height / 2 ])
			},

			/**
			 * Viewport point of the dot of a port, from the geometry the pane draws
			 * the dots with: the box of the part and the row of the port among the
			 * wirable ports of its class.
			 */
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

	/**
	 * The editor from the user's side: real clicks on real elements of a rendered
	 * DOM, one scenario per test.
	 *
	 * These are not tests of methods. Every step is what a person does — press a
	 * palette row, drag onto the canvas, type into a field, click a button — and
	 * what is checked is where it leaves the document, the panels and the scene.
	 * The stand and everything it fakes are in `flow_stage.test.ts`.
	 *
	 * `d` keeps `$` out of the string literals — mam builds its dependency graph by
	 * a regexp over sources, literals included.
	 */
	const d = '$'

	const calc = `${d}flow_calc`
	const map = `${d}flow_map`
	const button = `${d}flow_button`

	$mol_test({

		/**
		 * The editor opens: the head bar, the palette of the pack, the canvas and
		 * the invitation in the properties panel. The pack is a fixture and the
		 * network is fenced off — a fetch of anything else throws by name.
		 */
		'the editor opens with its bar, its palette and its canvas'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			// The bar: everything the scenarios below press.
			stage.button( 'Новая сцена' )
			stage.button( '−' )
			stage.button( '+' )
			stage.button( 'Сбросить вид' )
			stage.button( 'Удалить' )
			stage.button( 'В библиотеку' )

			const text = stage.text()
			$mol_assert_ok( text.includes( 'Полка' ) )
			$mol_assert_ok( text.includes( 'Свойства' ) )
			$mol_assert_ok( text.includes( '100%' ) )
			$mol_assert_ok( text.includes( 'Выберите узел на холсте' ) )

			// The panel opens on ready made things, not on a catalogue of classes.
			const shelf = [ ... stage.root.querySelectorAll(
				'[bog_vmap_app_shelf_items] [bog_vmap_app_shelf_item_row]',
			) ].map( el => el.textContent )

			$mol_assert_like( shelf.slice( 0, 6 ), [
				'Блок', 'Ячейка кода', 'График', 'Калькулятор', 'Карта', 'Калькулятор и карта',
			] )

			// And the widgets of input under them, which is what drives the rest.
			$mol_assert_ok( shelf.includes( 'Поле' ) )
			$mol_assert_ok( shelf.includes( 'Выбор' ) )

			// Under them, the objects of the connected application: what its author
			// declared, by their own names and without a line of mol among them.
			const apps = [ ... stage.root.querySelectorAll(
				'[bog_vmap_app_shelf_app_list] [bog_vmap_app_shelf_item_row]',
			) ].map( el => el.textContent )

			$mol_assert_like( apps, [ 'Button', 'Calc', 'Map' ] )

			// The classes of the pack are a level down, folded away until asked for,
			// and then they are all there, the base view stub included.
			$mol_assert_equal( stage.root.querySelector( '[bog_vmap_app_palette_class_row]' ), null )

			stage.classes_open()

			const rows = [ ... stage.root.querySelectorAll( '[bog_vmap_app_palette_class_row]' ) ]
				.map( el => el.textContent )

			$mol_assert_like( rows, [ `${d}mol_view`, button, calc, map ] )

			// Nothing failed to draw except the frame, which stays suspended for
			// ever: jsdom never loads the sandbox page, so its `onload` never fires.
			$mol_assert_like( stage.broken(), [ stage.pane.Scene( stage.pane.scene_key() ).dom_id() ] )

		},

		/**
		 * The point of the shelf: a wired pair arrives whole, by one gesture.
		 *
		 * A wire is the thing nobody guesses on their own, so the shelf carries an
		 * example of one already drawn. What lands is checked in the DOCUMENT and
		 * not by eye: a wire written the wrong way still reads plausibly, and all
		 * five traps of section 1 build green.
		 */
		'a ready made pair lands wired, by one click on the shelf'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.click( stage.shelf_row( 'Калькулятор и карта' ) )

			const node = stage.app.node()

			// Both parts and the box holding them, and the box is what lies on the
			// canvas: one thing to move, not two.
			$mol_assert_like( node.sub_names( '' ), [ 'Pair' ] )
			$mol_assert_like( node.sub_names( 'Pair' ), [ 'Calc', 'Map' ] )
			$mol_assert_like( Object.keys( stage.app.spots() ), [ 'Pair' ] )

			// The wire, from the result of the calculator into the zoom of the map.
			const links = node.links()
			$mol_assert_equal( links.length, 1 )
			$mol_assert_like(
				[ links[ 0 ].from, links[ 0 ].from_prop, links[ 0 ].to, links[ 0 ].to_prop ],
				[ 'Calc', 'result', 'Map', 'zoom' ],
			)

			// The scene compiles what the document says, byte for byte.
			$mol_assert_equal( stage.scene.last( 'doc_set' )!.src, stage.app.doc_source() )

			// Picked by the drop itself, as a dragged part is.
			$mol_assert_equal( stage.app.selected(), 'Pair' )

		},

		/**
		 * An application is added by its address, and its own objects are on the
		 * shelf right after.
		 *
		 * Nothing is asked of whoever deployed it: a mol module carries the tree of
		 * its classes beside its bundle, so any deployed application is a library
		 * already. What the shelf shows is what its author wrote, without the
		 * framework the bundle carries along.
		 */
		'an application added by its address puts its objects on the shelf'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.type( stage.field( 'Shelf().Links()' ), $bog_vmap_app_flow_other )

			// The frame is a new one — a realm cannot unload a bundle — and it boots.
			stage.scene.hello()

			const apps = [ ... stage.root.querySelectorAll(
				'[bog_vmap_app_shelf_app_list] [bog_vmap_app_shelf_item_row]',
			) ].map( el => el.textContent )

			$mol_assert_like( apps, [ 'Basket' ] )

			// And an object of somebody else's application lies down like any other.
			stage.click( stage.shelf_row( 'Basket' ) )

			$mol_assert_ok( stage.app.doc_source().includes( `Basket ${d}shop_basket` ) )
			$mol_assert_equal( stage.app.selected(), 'Basket' )

		},

		/**
		 * A component is carried out of the palette onto the canvas: it is declared,
		 * placed, picked on the spot — the properties panel is open on it without a
		 * second gesture — and a click on it goes on to the live component as well.
		 */
		'a class carried from the palette becomes a part, picked and ready to press'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )

			// One declaration and one reference, and the placement beside them.
			const source = stage.app.doc_source()
			$mol_assert_ok( source.includes( `Calc ${ calc }` ) )
			$mol_assert_ok( source.includes( '<= Calc' ) )
			$mol_assert_like( stage.app.spots(), { Calc: { x: 200, y: 150 } } )

			// The scene compiles what the document says, byte for byte.
			$mol_assert_equal( stage.scene.last( 'doc_set' )!.src, source )

			// Picked by the drop itself: the ring is on the canvas and the inspector
			// is on the part, with the ports of its class in it.
			$mol_assert_equal( stage.app.selected(), 'Calc' )
			$mol_assert_ok( stage.root.querySelector( '[bog_vmap_app_pane_handle]' ) !== null )
			stage.field( "Row('result').Value().Number().Num()" )

			// A click on the part keeps the pick and goes on to the live component.
			stage.tap( stage.part_center( 'Calc' ) )

			$mol_assert_equal( stage.app.selected(), 'Calc' )

			const click = stage.scene.last( 'click_at' )!
			$mol_assert_equal( click.x, 250 )
			$mol_assert_equal( click.y, 175 )

		},

		/**
		 * A property typed into the inspector lands in the document as the line of
		 * that property, and the scene is handed the document again.
		 */
		'a value typed into the inspector goes into the document and to the scene'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			stage.tap( stage.part_center( 'Calc' ) )

			const before = stage.scene.sent( 'doc_set' ).length

			stage.type( stage.field( "Row('result').Value().Number().Num()" ), '42' )

			const source = stage.app.doc_source()
			$mol_assert_ok( source.includes( `Calc ${ calc } result 42` ) )

			// The neighbouring lines are untouched: one property moved, not the class.
			$mol_assert_ok( source.includes( '<= Calc' ) )

			$mol_assert_ok( stage.scene.sent( 'doc_set' ).length > before )
			$mol_assert_equal( stage.scene.last( 'doc_set' )!.src, source )

		},

		/**
		 * A wire drawn by hand: from the output dot of one part to the input dot of
		 * another. Two lines go into the document, unplugging takes both away, and
		 * the value the scene reports is shown on the wire.
		 */
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

			// The host asks the scene for the value of the wire it now draws.
			stage.scene.flush()
			$mol_assert_like( stage.scene.last( 'values_want' )!.names, [ 'calc_result' ] )

			stage.scene.values({ calc_result: '42' })
			$mol_assert_like(
				stage.pane.wire_lines().map( line => [ line.key, line.label ] ),
				[ [ 'Map.zoom', '42' ] ],
			)

			// A press on the wired input pulls the wire out; let go over bare canvas
			// and both lines are gone from the document.
			stage.tap( stage.part_center( 'Map' ) )
			stage.press( overlay, stage.port_dot( 'Map', 'zoom', 'in' ) )
			stage.release( overlay, stage.client([ 550, 450 ]) )
			stage.redraw()

			const after = stage.app.doc_source()
			$mol_assert_equal( after.includes( 'calc_result' ), false )
			$mol_assert_like( stage.app.doc_wires(), [] )

		},

		/**
		 * The whole point of publishing: a part goes out as a class of the library,
		 * its link goes into the palette field of a scene, and it is a component
		 * again — droppable like any other.
		 *
		 * The library land is the home land here, so no proof of work, as in
		 * `publish/publish.test.ts`. The link is resolved by the real stack through
		 * the real database.
		 */
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

			// Publishing encodes units, which is asynchronous even without the proof
			// of work; the click hands it to a fiber and answers at once.
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

			// In the palette beside the classes of the pack, and it drops like them.
			stage.drop( `${d}bog_vmap_pub_button`, stage.client([ 400, 300 ]) )

			$mol_assert_ok( stage.app.doc_source().includes( ` ${d}bog_vmap_pub_button\n` ) )
			$mol_assert_equal( Object.keys( stage.app.spots() ).length, 2 )

		},

		/**
		 * A second scene is a document of its own: made from the bar, it opens
		 * empty, and going back brings the first one with everything on it.
		 */
		async 'a second scene is a document of its own and the first one comes back'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			const first = stage.store.doc_current()!.link().str
			const source = stage.app.doc_source()

			stage.click( stage.button( 'Новая сцена' ) )

			// The store makes the document in a fiber of its own, as the click does.
			await $bog_vmap_app_flow_settle( ()=> stage.store.doc_links().length > 1 )
			stage.redraw()

			$mol_assert_equal( stage.store.doc_links().length, 2 )
			$mol_assert_ok( stage.store.doc_current()!.link().str !== first )
			$mol_assert_equal( stage.app.doc_source(), `${ stage.app.doc_root() } ${d}mol_view\n\tsub /\n` )
			$mol_assert_like( stage.app.spots(), {} )

			// Back to the first one, by the same value the picker of the bar writes.
			const scenes = stage.app.Scenes() as $$.$bog_vmap_app_scenes
			scenes.current( first )
			stage.redraw()

			$mol_assert_equal( stage.app.doc_source(), source )
			$mol_assert_like( stage.app.spots(), { Calc: { x: 200, y: 150 } } )

		},

		/**
		 * The sandbox is raised from markup, not from an address: there is exactly
		 * one page in the project and the sandbox is not it.
		 *
		 * What the markup has to carry is checked here rather than argued: the
		 * isolation, the absence of any address, and an ABSOLUTE address of the
		 * bundle — an opaque origin has no base to resolve a relative one against.
		 */
		'the frame is raised from markup and carries no address'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )
			const frame = stage.frame()

			$mol_assert_equal( frame.getAttribute( 'sandbox' ), 'allow-scripts' )
			$mol_assert_equal( frame.hasAttribute( 'src' ), false )

			const html = frame.getAttribute( 'srcdoc' ) ?? ''
			const bundle = stage.app.scene_bundle()

			$mol_assert_ok( bundle.endsWith( '/scene/web.js' ) )
			$mol_assert_ok( html.includes( `src="${ bundle }"` ) )

			// the frame paints its own ground, see `scene_html()`
			$mol_assert_ok( html.includes( 'color-scheme:dark' ) )

		},

		/**
		 * The pack travels the bridge, and it travels FIRST.
		 *
		 * The scene compiles nothing until it has been told a pack, because a class
		 * picks its base once and a document built a moment early would inherit the
		 * sandbox's own base view for good. So the order of the first three
		 * messages of a handshake is part of the contract, not an accident of how
		 * the cells happen to be listed.
		 */
		'the pack goes down the wire before the document and the libraries'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			const kinds = stage.scene.posted.map( message => message.kind )
			const pack = kinds.indexOf( 'pack_set' )

			$mol_assert_ok( pack >= 0 )
			$mol_assert_ok( pack < kinds.indexOf( 'doc_set' ) )
			$mol_assert_ok( pack < kinds.indexOf( 'libs_set' ) )

			$mol_assert_equal( stage.scene.last( 'pack_set' )?.uri, stage.app.pack_script() )

		},

		/**
		 * One pack per frame, held by construction now that no address holds it: the
		 * pack is part of the key of the frame, so naming another one gives a new
		 * element and a realm that has never seen the first bundle. A land is
		 * compiled into the sandbox instead, so a change of lands must not cost the
		 * frame, its camera or its live instances.
		 * @see ../ARCHITECTURE.md section 5
		 */
		'a new pack gives a new frame, a new land keeps the old one'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )
			const field = stage.field( 'Shelf().Links()' )

			const before = stage.frame()

			stage.type( field, 'http://pack.test/, AbCdEfGh' )
			$mol_assert_ok( stage.frame() !== before )
			$mol_assert_like( stage.app.lands(), [ 'AbCdEfGh' ] )

			// the fresh frame has proved nothing yet, so nothing is pushed at it
			$mol_assert_equal( stage.pane.ready(), false )

			// it boots and gets the new pack first, exactly as the first one did
			const seen = stage.scene.posted.length
			stage.scene.hello()

			$mol_assert_equal( stage.pane.ready(), true )
			$mol_assert_equal( stage.scene.posted[ seen ]?.kind, 'pack_set' )
			$mol_assert_equal( stage.scene.last( 'pack_set' )?.uri, 'http://pack.test/web.js' )

			// a land rides the bridge, so the frame stands
			const kept = stage.frame()
			stage.type( field, 'http://pack.test/, AbCdEfGh, ZyXwVuTs' )

			$mol_assert_equal( stage.frame(), kept )
			$mol_assert_like( stage.app.lands(), [ 'AbCdEfGh', 'ZyXwVuTs' ] )

		},

		/**
		 * A change of pack must not be mistaken for a scene that died.
		 *
		 * The frame is replaced, and the new one then spends the whole cold load of
		 * the pack saying nothing — 610 ms in the measurement of section 4, and much
		 * worse on a slow line, against a watchdog limit of eight seconds. Two things
		 * therefore have to hold across the swap, and they are checked apart because
		 * they fail apart.
		 *
		 * NOTHING IS PUSHED at a window that has not booted. A push into a frame
		 * still loading is lost silently, and the host would never learn that the
		 * document it thinks it sent was never received.
		 *
		 * THE WATCH DOES NOT ARM. `warmed` is still true from the frame that just
		 * went, so an armed watch here would accuse a perfectly healthy scene of
		 * being stuck and offer to reload the very thing that is loading. This is
		 * held by the handshake being kept per frame, not per pane.
		 */
		'a change of pack raises no false alarm about the scene'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )
			const watch = ()=> stage.timers.filter( timer => timer.delay === stage.pane.answer_limit() ).length

			// real traffic first, so the scene has proved itself and the pulse is on
			stage.drop( calc, stage.client([ 200, 150 ]) )
			$mol_assert_equal( stage.pane.warmed(), true )

			const sent = stage.scene.posted.length
			const armed = watch()

			stage.type( stage.field( 'Shelf().Links()' ), 'http://pack.test/' )

			// a frame that has said nothing, and nothing said to it
			$mol_assert_equal( stage.pane.ready(), false )
			$mol_assert_equal( stage.scene.posted.length, sent )

			// and no claim made about its silence
			$mol_assert_equal( stage.pane.watchdog(), null )
			$mol_assert_equal( watch(), armed )
			$mol_assert_equal( stage.pane.stalled(), false )
			$mol_assert_equal( stage.text().includes( 'Сцена не отвечает' ), false )

			// it boots, and only then does anything go out — the pack first
			stage.scene.hello()

			$mol_assert_equal( stage.pane.ready(), true )
			$mol_assert_equal( stage.scene.posted[ sent ]?.kind, 'pack_set' )
			$mol_assert_equal( stage.scene.posted[ sent ]?.uri, 'http://pack.test/web.js' )

		},

		/**
		 * The palette field takes a pack and lands together, and refuses a second
		 * pack out loud: the reason is under the field and the frame keeps the pack
		 * it already loaded.
		 */
		'the palette field takes a pack with lands and says why it refuses a second'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			const field = stage.field( 'Shelf().Links()' )
			stage.type( field, 'http://pack.test/, AbCdEfGh' )

			$mol_assert_equal( stage.app.pack_link(), 'http://pack.test/' )
			$mol_assert_like( stage.app.lands(), [ 'AbCdEfGh' ] )

			const key = stage.pane.scene_key()
			$mol_assert_equal( stage.pane.pack_uri(), 'http://pack.test/web.js' )

			stage.type( field, 'http://pack.test/, AbCdEfGh, http://other.test/' )

			// The refusal is on screen, in the user's words, under the field.
			$mol_assert_ok( stage.text().includes( $bog_vmap_lib_links_reason.pack_second ) )
			$mol_assert_ok( stage.text().includes( 'http://other.test/' ) )

			// The frame is the one it already was: no reload.
			$mol_assert_equal( stage.pane.scene_key(), key )
			$mol_assert_equal( stage.field( 'Shelf().Links()' ).value, 'http://pack.test/, AbCdEfGh, http://other.test/' )

		},

		/**
		 * The delete button takes the picked part out of the document, and the
		 * camera cannot touch the document at all: panning and zooming leave the
		 * text byte for byte where it was.
		 */
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

			// A drag over bare canvas is a pan…
			const overlay = stage.overlay()
			stage.press( overlay, stage.client([ 450, 400 ]) )
			stage.move( overlay, stage.client([ 500, 430 ]) )
			stage.release( overlay, stage.client([ 500, 430 ]) )
			stage.redraw()

			$mol_assert_like( [ ... stage.pane.camera_shift() ], [ 50, 30 ] )

			// …and the buttons of the bar are the zoom.
			stage.click( stage.button( '+' ) )
			$mol_assert_ok( stage.text().includes( '125%' ) )

			stage.click( stage.button( 'Сбросить вид' ) )
			$mol_assert_ok( stage.text().includes( '100%' ) )
			$mol_assert_like( [ ... stage.pane.camera_shift() ], [ 0, 0 ] )

			$mol_assert_equal( stage.app.doc_source(), source )

		},

		/**
		 * The artboard from the user's side: a page is put on the canvas, two parts
		 * are dropped INTO it and go into its tree instead of onto the desk, and the
		 * direction switch of the inspector decides how they stack — including where
		 * the next drop goes in.
		 */
		'a page takes the parts dropped into it and stacks them the way it is set'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.click( stage.button( 'Артборд' ) )

			// Nothing marks a page as one: it is a view with a `sub` of its own.
			$mol_assert_equal( stage.app.selected(), 'Page' )

			const node = stage.app.node()
			$mol_assert_like( node.sub_names( 'Page' ), [] )

			const page = stage.pane.part_box( 'Page' )!
			$mol_assert_ok( page )

			// Dropped inside the page, both go into its tree and neither takes a
			// coordinate: on the desk only the page itself lies.
			stage.drop( calc, stage.client([ page.left + 200, page.top + 40 ]) )
			stage.drop( map, stage.client([ page.left + 200, page.top + 250 ]) )

			$mol_assert_like( node.sub_names( 'Page' ), [ 'Calc', 'Map' ] )
			$mol_assert_like( Object.keys( stage.app.spots() ), [ 'Page' ] )
			$mol_assert_equal( stage.app.doc_source().includes( '\t\tsub /\n\t\t\t<= Calc\n\t\t\t<= Map\n' ), true )

			// The page is picked again by a click on the empty part of it.
			stage.tap( stage.client([ page.left + 200, page.top + 250 ]) )
			$mol_assert_equal( stage.app.selected(), 'Page' )

			// The layout panel of the inspector turns the column into a row.
			stage.click( stage.check( 'рядом' ) )

			$mol_assert_ok( stage.app.doc_source().includes( 'flexDirection \\row' ) )
			$mol_assert_equal( stage.scene.last( 'doc_set' )!.src, stage.app.doc_source() )

			const first = stage.pane.part_box( 'Calc' )!
			const second = stage.pane.part_box( 'Map' )!
			$mol_assert_equal( first.top, second.top )
			$mol_assert_ok( second.left > first.left )

			// And the next drop is aimed by the same row: to the left of both is first.
			stage.drop( button, stage.client([ page.left + 20, page.top + 20 ]) )
			$mol_assert_like( node.sub_names( 'Page' ), [ 'Button', 'Calc', 'Map' ] )

		},

		/**
		 * A document opened by a link lives in a land of its own, and until that
		 * land arrives every read of it suspends. THE SANDBOX MUST COME UP ANYWAY:
		 * the markup of the frame is not the document's business, and an editor that
		 * waits for the text before it raises the frame waits for ever on a document
		 * whose master is not reachable — which is what «ожидание сцены…» was.
		 */
		'the sandbox comes up while the document of the address is still on its way'( $ ) {

			// Every read of the open document suspends, as an unsynced land does.
			const waiting = new Promise( ()=> {} )
			const store = $bog_vmap_app_store.make({
				$,
				doc_land_config: ()=> null,
				source: ()=> { throw waiting },
				spots: ()=> { throw waiting },
				pack: ()=> { throw waiting },
			})

			const stage = $bog_vmap_app_flow_stage( $, { store } )

			// The frame has its markup, so the scene boots and answers.
			$mol_assert_ok( stage.frame().getAttribute( 'srcdoc' ) )
			$mol_assert_equal( stage.pane.ready(), true )

			// The complaint itself: the head bar no longer says it is waiting.
			$mol_assert_equal( stage.text().includes( 'ожидание сцены' ), false )

			// The palette of the document is unknown, so the standard one stands in
			// and is on screen rather than suspended.
			$mol_assert_equal( stage.app.links(), '' )
			stage.classes_open()
			stage.class_row( calc )

		},

		/**
		 * A scene that stopped answering is called out on a strip of its own, and
		 * the button on it replaces the frame rather than talking to the stuck one.
		 *
		 * Time is the test's own: the timers of the stand never fire by themselves,
		 * so the watchdog is asked to fire the moment its limit would have run out.
		 */
		'a silent scene raises the strip and the button gives a fresh frame'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			$mol_assert_equal( stage.pane.stalled(), false )

			const frame = stage.frame()

			stage.scene.silence()

			// Something is pushed and never answered.
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

			// A frame element of its own, so the stuck document is gone with it.
			$mol_assert_ok( stage.frame() !== frame )

		},

		/**
		 * Deleting a wired part takes its wires with it, from either end. A wire
		 * left behind would name a node the document no longer declares, and the
		 * scene compiles that into a call of a property nobody has.
		 */
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

			// The source of the wire goes.
			stage.tap( stage.part_center( 'Calc' ) )
			stage.click( stage.button( 'Удалить' ) )

			$mol_assert_equal( stage.app.doc_source().includes( 'calc_result' ), false )
			$mol_assert_like( stage.app.doc_wires(), [] )
			$mol_assert_ok( stage.app.doc_source().includes( `Map ${ map }` ) )

			// And the same from the other end: a wire drawn again and the consumer
			// deleted leaves the source part standing and no wire behind. The name
			// of the deleted part is free again, so the new one takes it.
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

	})

}
