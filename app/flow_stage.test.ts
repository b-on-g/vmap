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
	 * `$mol_view_selection` names `ShadowRoot` and `$mol_touch` names `PointerEvent`
	 * bare, so a field or a gesture in a node test dies on a `ReferenceError` that
	 * says nothing about the editor. Pointer capture is missing from jsdom
	 * elements outright, and `$mol_touch` calls it without a guard.
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
	 * A NEW SCENARIO NEEDS NONE OF THAT. One line makes the editor,
	 * `const stage = $bog_vmap_app_flow_stage( $ )`, and from then on everything is
	 * a gesture of the user:
	 *
	 * - `stage.drop( klass, stage.client([ x, y ]) )` carries a class out of the
	 *   palette onto the canvas, `stage.tap( stage.part_center( name ) )` clicks a
	 *   part, `stage.press/move/release( stage.overlay(), point )` is any gesture
	 *   in between, and `stage.port_dot( part, port, 'out' )` is where a wire starts;
	 * - `stage.button( 'Удалить' )`, `stage.field( 'Palette().Links()' )` and
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

		deliver({ kind: 'ready' })
		app.dom_tree()
		scene.flush()

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
			 * A checkbox or one option of a switch, by its label. Not a button:
			 * `$mol_check` answers `role="checkbox"`, and the options of a switch are
			 * checks, so the head bar toggles and the layout panel are found here.
			 */
			check( title: string ) {
				return found( '[role=checkbox]', `check «${ title }»`, el => el.textContent?.includes( title ) ?? false )
			},

			/** A row of the palette, by the class it offers. */
			class_row( klass: string ) {
				return found( '[bog_vmap_app_palette_item]', `palette row ${ klass }`, el => el.textContent === klass )
			},

			/** A text field, addressed by the tail of the id $mol builds out of the path to it. */
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
			 */
			drop( klass: string, point: readonly [ number, number ] ) {

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
