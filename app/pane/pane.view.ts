namespace $.$$ {

	/**
	 * How far outside its box, in SCREEN pixels, a part still counts as hit.
	 *
	 * This strip is the grip of a part. Under the picked part the overlay is cut
	 * open, so a press inside the box goes to the live component and never gets
	 * here; the part is taken hold of by the ring around it, and the ring has to be
	 * as wide as a finger at any zoom, which is why the number is in screen pixels
	 * and divided by the zoom before it is compared with world units. The corner
	 * handles are drawn exactly this wide, so what looks grabbable is grabbable.
	 *
	 * It also keeps a zero sized part reachable, and that is not a rare shape: the
	 * root of the document is a flex box with absolutely positioned children, so a
	 * child that does not size itself measures 0 wide while its text is plainly on
	 * screen — `$mol_paragraph` does exactly this.
	 */
	const grab_slack = 8

	/**
	 * How far a pressed pointer may travel and still be a click, in screen pixels.
	 *
	 * The same tolerance `$mol_touch` gives a draw before it counts as one. Below it
	 * the gesture is relayed to the scene as `click_at`; above it the gesture is a
	 * drag of a part or a pan of the camera and nothing is relayed.
	 */
	const click_slack = 4

	/** The other end of the bridge, as much of a window as the pane needs. */
	export type $bog_vmap_app_pane_peer = {
		postMessage( data: unknown, origin: string ): void
		readonly origin: string
	}

	/**
	 * Infinite canvas: background grid, sandboxed scene and the pointer gate over it.
	 *
	 * The camera is a screen-space pan vector plus an isotropic zoom, exactly what
	 * $mol_touch produces. The scene gets it as world coordinates over the bridge and
	 * applies the transform itself, because the host cannot reach into an opaque origin.
	 *
	 * There are no editor modes. The overlay takes every gesture, a click that does
	 * not move is relayed to the scene, and the picked part alone gets real events
	 * through a hole cut in the overlay. Hover on any other part does not work, and
	 * that is accepted: the alternative is the document deciding what the editor sees.
	 * @see ../../ARCHITECTURE.md sections 4 and 8
	 */
	export class $bog_vmap_app_pane extends $.$bog_vmap_app_pane {

		/** Handwritten class bodies. Empty until the code editor of stage 4. */
		override doc_js(): { readonly [ klass: string ]: string } {
			return {}
		}

		zoom_min() { return .05 }
		zoom_max() { return 16 }

		@ $mol_mem
		override camera_zoom( next?: number ) {
			const zoom = next ?? 1
			return Math.min( this.zoom_max(), Math.max( this.zoom_min(), zoom ) )
		}

		/** World point under the top left corner of the viewport, plus the zoom. */
		camera(): $bog_vmap_bridge_camera {
			const shift = this.camera_shift()
			const zoom = this.camera_zoom()
			return { x: -shift[0] / zoom, y: -shift[1] / zoom, zoom }
		}

		@ $mol_action
		camera_reset() {
			this.camera_zoom( 1 )
			this.camera_shift( new this.$.$mol_vector_2d( 0, 0 ) )
		}

		/** Zooms around the middle of the viewport, keeping that point still. */
		zoom_by( mult: number ) {

			const zoom_prev = this.camera_zoom()
			const zoom_next = this.camera_zoom( zoom_prev * mult )
			const real = zoom_next / zoom_prev

			const rect = this.view_rect()
			const center = new this.$.$mol_vector_2d(
				( rect?.width ?? 0 ) / 2,
				( rect?.height ?? 0 ) / 2,
			)

			this.camera_shift(
				this.camera_shift().multed0( real ).added1( center.multed0( 1 - real ) )
			)

		}

		/**
		 * Both channels at once. They clear independently, so a single slot would
		 * let a fixed compile erase a runtime failure that is still live.
		 */
		override error() {
			return [ this.error_at( 'compile' ), this.error_at( 'runtime' ) ]
				.filter( Boolean )
				.join( '\n' )
		}

		/**
		 * Peer window, taken from the frame itself and never from `event.source`.
		 *
		 * The channel carries no origin, so any window able to post a `ready` would
		 * otherwise take it over — caught in testing, where a second scene opened
		 * for a probe stole the binding from the real frame.
		 */
		scene_peer(): $bog_vmap_app_pane_peer | null {
			return ( this.Scene( this.scene_generation() ).dom_node() as HTMLIFrameElement ).contentWindow
		}

		/** The live frame under the overlay. */
		override sub() {
			return [ this.Scene( this.scene_generation() ), this.Overlay() ] as readonly $mol_view[]
		}

		/**
		 * Replaces the frame with a fresh one that has said nothing and proved nothing
		 * yet. Nothing is lost: the host owns the document, the placement and the
		 * camera, and every push cell re-sends on the new handshake.
		 */
		@ $mol_action
		scene_restart() {
			this.scene_generation( this.scene_generation() + 1 )
			this.handshake( 0 )
			this.warmed( false )
			this.stalled( false )
		}

		/**
		 * Handshakes seen. A counter, not a flag, so a scene reload re-pushes.
		 *
		 * One scene load does not mean exactly one step here: observed both +1
		 * and +2 for a single reload, because the scene may announce itself more
		 * than once. Only the change matters, never the number — do not go
		 * hunting for a bug on the strength of an even count.
		 */
		@ $mol_mem
		override handshake( next?: number ) {
			return next ?? 0
		}

		override ready() {
			return this.handshake() > 0
		}

		/** The window to push to, or null until the scene says it is listening. */
		target() {
			return this.handshake() ? this.scene_peer() : null
		}

		/**
		 * Wall clock of the last push the scene owes an answer to.
		 *
		 * A plain field, written from inside the `*_push` cells. Writing a field there
		 * is fine and writing a CELL there would not be: a cell set from the body of
		 * another cell is an invalidation loop. Nothing reads this reactively either —
		 * `watchdog()` reads it only alongside the cells that move it.
		 */
		poke_at = 0

		/** Wall clock of the last message the scene sent, of any kind. */
		answer_at = 0

		/** The clock both stamps are taken from. A method so that a test can move it by hand. */
		now() {
			return Date.now()
		}

		/** Bumped for every message accepted, so `watchdog()` recomputes on an answer. */
		@ $mol_mem
		traffic_version( next?: number ) {
			return next ?? 0
		}

		/**
		 * The scene has reported geometry at least once.
		 *
		 * Until it has, the host has no baseline and CANNOT tell a busy start from a
		 * dead one, so it does not try. A cold pack is 610 ms and much worse on a slow
		 * line; worse, the scene is legitimately mute for all of it, because
		 * `report_task` reads `instance()`, `instance()` suspends on `pack_ready()`,
		 * and a suspended cell arms no timer and posts nothing. A watchdog running
		 * then would call a perfectly healthy scene dead and offer to reload the very
		 * thing that is loading.
		 *
		 * `sizes` and not `ready`: the scene announces `ready` on `$mol_after_tick`,
		 * long before the pack lands, so it proves the frame booted and nothing else.
		 * Geometry proves the whole path — pack in the realm, document compiled,
		 * layout measured, bridge answering.
		 */
		@ $mol_mem
		warmed( next?: boolean ) {
			return next ?? false
		}

		/**
		 * How long the scene may stay silent while it owes an answer.
		 *
		 * Generous on purpose. A compile is synchronous and takes milliseconds, so
		 * anything near this is not slowness but a stop; the margin is there for a
		 * document whose own code suspends on something of its own. If it does suspend
		 * longer than this the strip appears and then clears itself on the next
		 * message, which is the right way round: the state is a claim about silence,
		 * not a verdict, and nothing is destroyed by being wrong.
		 */
		answer_limit() {
			return 8000
		}

		@ $mol_mem
		override stalled( next?: boolean ) {
			return next ?? false
		}

		/**
		 * Gap between a `pong` and the next `ping`, in ms.
		 *
		 * Together with `answer_limit()` this sets how late the news can be: a scene
		 * that stops right after answering is noticed at worst one period plus one
		 * limit later. Cheap enough to keep short — a `ping` is a number over
		 * `postMessage` and the scene answers it without touching a single cell.
		 */
		ping_period() {
			return 2000
		}

		/** Serial of the last `ping`. Only ever moves forward. */
		@ $mol_mem
		ping_nonce( next?: number ) {
			return next ?? 0
		}

		/** Serial of the last relayed click. Read by the watchdog, so a click arms it. */
		@ $mol_mem
		click_serial( next?: number ) {
			return next ?? 0
		}

		/**
		 * The pulse. Always on once the scene has proved itself, see `warmed()`.
		 *
		 * The ordinary traffic is a heartbeat as far as it goes: the host pushes and
		 * the scene owes `sizes`. What it cannot cover is user code running on an
		 * event the host never sent — a real press through the hole under the picked
		 * part, a timer inside the document — and a document that loops there would
		 * leave a dead canvas nobody asked a question of. The pulse is that question.
		 *
		 * Re-armed by `traffic_version()`, which every answer bumps, so the loop is
		 * ping, pong, wait, ping. A scene that stops answering therefore gets exactly
		 * one outstanding ping and no flood: the watchdog only needs one.
		 */
		@ $mol_mem
		heartbeat() {

			if( !this.warmed() ) return null

			const target = this.target()
			if( !target ) return null

			this.traffic_version()

			return new this.$.$mol_after_timeout( this.ping_period(), () => {
				const nonce = this.ping_nonce() + 1
				this.ping_nonce( nonce )
				this.post( target, { kind: 'ping', nonce } )
			} )
		}

		/**
		 * Watchdog over the bridge.
		 *
		 * The document shares its reactive graph with the scene — the boundary runs
		 * between scene and host, not between document and scene — so a looping fiber
		 * of user code freezes the whole scene, bridge handling included. The editor
		 * survives, which is the point of the boundary, but the canvas goes dead
		 * without a word and the only way out the user has is F5 of the editor.
		 *
		 * Watching is expectation driven rather than periodic: it arms only while the
		 * scene owes an answer, so an idle editor is never accused of anything. Every
		 * push is a question — `report_task` in the scene subscribes to the document,
		 * the styles, the placement and the camera, and always answers `sizes`; a
		 * relayed click is answered the same way, and a ping with a pong.
		 * @see ../../ARCHITECTURE.md section 4
		 */
		@ $mol_mem
		watchdog() {

			// Armed by everything we send…
			this.doc_push()
			this.css_push()
			this.libs_push()
			this.spots_push()
			this.camera_push()

			// …including a ping and a click, which are sent from a timer and from a
			// handler and so move no push cell of their own. Without these reads the
			// pulse would stamp `poke_at` and the watch would never notice.
			this.ping_nonce()
			this.click_serial()

			// …and disarmed by anything the scene says back.
			this.traffic_version()

			if( !this.warmed() ) return null
			if( this.poke_at <= this.answer_at ) return null

			return new this.$.$mol_after_timeout( this.answer_limit(), () => this.stalled( true ) )
		}

		/**
		 * Latest measured node boxes, in world units, keyed by the path the scene
		 * walks: the root class name, then a property name per level.
		 *
		 * A plain field with a version cell beside it. The boxes arrive from a
		 * message handler, and a `@ $mol_mem` written from there would still be fine;
		 * what would not is comparing them — `$mol_compare_deep` over a hundred boxes
		 * on every report round, twice a second, to learn that the layout did not
		 * move. The version says «something arrived» and costs one number.
		 */
		sizes_last: { readonly [ node: string ]: $bog_vmap_bridge_rect } = {}

		@ $mol_mem
		sizes_version( next?: number ) {
			return next ?? 0
		}

		sizes() {
			this.sizes_version()
			return this.sizes_last
		}

		/**
		 * Drops the remembered boxes of a part that is gone from the document.
		 *
		 * The counterpart of the merge in `message_receive`. Since a missing name no
		 * longer means «has no size», something has to say when a name means nothing
		 * at all, and only the delete knows that. A node removed by editing the text
		 * by hand is not covered and will leave a box behind — harmless, because
		 * nothing looks up a name the document no longer carries, and worth fixing
		 * when the code editor of stage 4 makes that path real.
		 */
		sizes_forget( name: string ) {

			const prefix = this.doc_root() + '/' + name
			const kept = {} as { [ node: string ]: $bog_vmap_bridge_rect }

			for( const key of Object.keys( this.sizes_last ) ) {
				if( key === prefix || key.startsWith( prefix + '/' ) ) continue
				kept[ key ] = this.sizes_last[ key ]
			}

			this.sizes_last = kept
			this.sizes_version( this.sizes_version() + 1 )
		}

		/**
		 * The box of a free part, or `null` while the scene has not reported one.
		 *
		 * Only the direct children of the root are addressed, and that is the whole
		 * set of things lying free on the canvas — section 1: every named sub view
		 * becomes a flat property of the root class, so one path segment is exactly
		 * one part. Anything deeper (`…/Icon_close/Path`) lives INSIDE a part, and
		 * picking those is a tree question, which is what artboards are for.
		 */
		part_size( name: string ) {
			return this.sizes()[ this.doc_root() + '/' + name ] ?? null
		}

		/** Names of the parts the scene has measured, in the order it walked them. */
		part_names() {

			const prefix = this.doc_root() + '/'

			return Object.keys( this.sizes() )
				.filter( key => key.startsWith( prefix ) && !key.includes( '/', prefix.length ) )
				.map( key => key.slice( prefix.length ) )
		}

		/**
		 * The node being dragged, kept as a plain field.
		 *
		 * `version` is the reading of `sizes_version()` when the grab started, and it
		 * is what makes the ring exact instead of merely quick. Measured boxes are
		 * debounced by 120 ms in the scene, and the timer restarts on every change,
		 * so during a continuous drag NO fresh box ever arrives: a ring drawn from
		 * `sizes()` alone would sit at the start of the gesture until the pointer
		 * stopped. Adding the live offset fixes that, and would then double count the
		 * move the moment a fresh box did arrive — hence the guard. When the version
		 * moves, the boxes already carry the drag, and the offset stops being added
		 * on the same frame. Nothing has to clear it.
		 */
		drag: {
			name: string,
			spot: { readonly x: number, readonly y: number },
			grab: readonly [ number, number ],
			version: number,
		} | null = null

		/** Whether a moved pointer still counts, i.e. the button is not up yet. */
		drag_live = false

		/**
		 * The press in progress, kept until its release.
		 *
		 * `moved` is decided in screen pixels against `click_slack`, and once true it
		 * stays true: a pointer that wandered and came back is not a click. The world
		 * point is the one relayed to the scene, so the click lands where the press
		 * did, not where the release happened to be.
		 */
		press: {
			screen: readonly [ number, number ],
			world: readonly [ number, number ],
			moved: boolean,
		} | null = null

		/**
		 * Where this pane sits in the viewport.
		 *
		 * Read off the DOM rather than through `view_rect()`: that one is a watched
		 * cell, and a handler subscribed to it gets re-run by the very layout change
		 * its own drop or drag causes. A method of its own so that a test can hand in
		 * a geometry the test DOM has no way to lay out.
		 */
		pane_rect(): { readonly left: number, readonly top: number } {
			return this.dom_node().getBoundingClientRect()
		}

		/**
		 * World point under a pointer event.
		 *
		 * The camera is a screen-pixel shift plus an isotropic zoom, and the scene
		 * puts its stage at `transform-origin: 0 0` inside a frame pinned to the top
		 * left of this pane. So a screen point is `world * zoom + shift`, and this is
		 * that solved for world.
		 */
		world_point( event: PointerEvent ) {

			const rect = this.pane_rect()
			const shift = this.camera_shift()
			const zoom = this.camera_zoom()

			return [
				( event.clientX - rect.left - shift[0] ) / zoom,
				( event.clientY - rect.top - shift[1] ) / zoom,
			] as const
		}

		/**
		 * Which part is under a world point, or `null` for bare canvas.
		 *
		 * The LAST match wins, because the parts are absolutely positioned siblings
		 * and a later one paints over an earlier one. Picking the first, or the
		 * smallest, would hand back a node the user cannot see.
		 */
		node_at( point: readonly [ number, number ] ) {

			const slack = grab_slack / this.camera_zoom()

			let found = null as string | null

			for( const name of this.part_names() ) {

				const box = this.part_size( name )
				if( !box ) continue

				if( point[0] < box.x - slack ) continue
				if( point[1] < box.y - slack ) continue
				if( point[0] > box.x + box.width + slack ) continue
				if( point[1] > box.y + box.height + slack ) continue

				found = name

			}

			return found
		}

		/**
		 * Press picks, and a press on a part also starts carrying it.
		 *
		 * The pick is taken from `pointerdown` and never from `click`, because the
		 * capture below retargets the later `click` to whoever captured — so by the
		 * time a `click` arrived it would name the overlay, not the node.
		 *
		 * `preventDefault` on a hit is what keeps the camera still: `$mol_touch`
		 * checks `defaultPrevented` at the top of both `event_start` and `event_move`,
		 * so the same gesture pans over bare canvas and drags over a node, decided
		 * once, by the hit test. A press that hits nothing is left alone deliberately
		 * — that is the pan.
		 *
		 * Whether it will also be a click is not known yet: that is decided by the
		 * release, from how far the pointer went.
		 */
		node_press( event?: PointerEvent ) {

			if( !event ) return
			if( event.button !== 0 ) return

			const point = this.world_point( event )
			const name = this.node_at( point )

			this.selected( name )

			this.press = {
				screen: [ event.clientX, event.clientY ],
				world: point,
				moved: false,
			}

			if( !name ) return

			event.preventDefault()

			this.drag = {
				name,
				spot: this.spots()[ name ] ?? { x: 0, y: 0 },
				grab: point,
				version: this.sizes_version(),
			}
			this.drag_live = true

			// A pointer released off the window would otherwise leave the gesture
			// hanging. Capture is best effort on purpose: a synthetic pointer never
			// becomes active, so this throws under an automated browser and nowhere
			// else, and losing it costs a drag that ends at the edge of the pane.
			try {
				this.Overlay().dom_node().setPointerCapture( event.pointerId )
			} catch {}

		}

		/** Notes whether the pointer has gone further than a click may. */
		press_track( event: PointerEvent ) {

			const press = this.press
			if( !press || press.moved ) return

			const dx = event.clientX - press.screen[0]
			const dy = event.clientY - press.screen[1]

			if( Math.hypot( dx, dy ) > click_slack ) press.moved = true
		}

		/**
		 * Carrying a node writes straight into `spots`, the same channel a drop from
		 * the palette writes: placement is one fact with one owner, whatever moved it.
		 */
		node_move( event?: PointerEvent ) {

			if( !event ) return

			this.press_track( event )

			const drag = this.drag
			if( !drag || !this.drag_live ) return

			// The button came up somewhere we never heard about it.
			if( !event.buttons ) return this.node_release( event )

			event.preventDefault()

			const point = this.world_point( event )

			this.spots({
				... this.spots(),
				[ drag.name ]: {
					x: drag.spot.x + point[0] - drag.grab[0],
					y: drag.spot.y + point[1] - drag.grab[1],
				},
			})

		}

		/**
		 * Release ends whatever the press started, and a press that went nowhere is
		 * a click and goes to the scene.
		 *
		 * A pan never gets here: on its first move `$mol_touch` captures the pointer
		 * to the pane, and from then on the overlay sees neither the moves nor the
		 * release. The distance is still measured, so the outcome does not depend on
		 * that capture having happened.
		 */
		node_release( event?: PointerEvent ) {

			if( !event ) return

			const press = this.press
			if( press ) this.press_track( event )
			this.press = null

			if( this.drag_live ) {

				this.drag_live = false

				try {
					this.Overlay().dom_node().releasePointerCapture( event.pointerId )
				} catch {}

			}

			if( !press ) return
			if( event.button !== 0 ) return
			if( press.moved ) return

			this.click_send( press.world, event )

		}

		/**
		 * Relays a click to the scene, in world coordinates.
		 *
		 * The pick itself has already happened on the press; this is the other half
		 * of «one click both selects and presses». The scene finds the element under
		 * the point and replays the events on it, so a `$mol_button` in the document
		 * fires the moment it is picked, and a text field takes the focus.
		 *
		 * Through `post()`, so the scene owes an answer and the watchdog is armed:
		 * of everything the host sends, a click is the likeliest to start a loop in
		 * document code.
		 */
		click_send( point: readonly [ number, number ], event: PointerEvent ) {

			const target = this.target()
			if( !target ) return

			this.click_serial( this.click_serial() + 1 )

			this.post( target, {
				kind: 'click_at',
				x: point[0],
				y: point[1],
				mods: {
					altKey: Boolean( event.altKey ),
					ctrlKey: Boolean( event.ctrlKey ),
					metaKey: Boolean( event.metaKey ),
					shiftKey: Boolean( event.shiftKey ),
				},
			} )

		}

		/** The ring is drawn while something is picked and measured. */
		override frame_showed() {
			return Boolean( this.frame_box() )
		}

		/**
		 * Where the picked part is on screen, in pixels of this pane, or `null`.
		 *
		 * World to screen is `world * zoom + shift`, the same transform the scene
		 * applies to itself. Done on the host so that the ring keeps its stroke width
		 * at any zoom, and done once so that the ring and the hole in the overlay are
		 * cut from the same numbers.
		 */
		@ $mol_mem
		frame_box(): $bog_vmap_app_pane_screen_box | null {

			const name = this.selected()
			if( !name ) return null

			const box = this.part_size( name )
			if( !box ) return null

			const drag = this.drag
			const spot = this.spots()[ name ]

			// See `drag`: while the measured boxes are stale, and only then, the ring
			// carries the offset the pointer has added since the grab.
			const live = drag && drag.name === name && spot && this.sizes_version() === drag.version
			const dx = live ? spot.x - drag.spot.x : 0
			const dy = live ? spot.y - drag.spot.y : 0

			return this.$.$bog_vmap_app_pane_screen(
				{ x: box.x + dx, y: box.y + dy, width: box.width, height: box.height },
				this.camera_zoom(),
				this.camera_shift(),
			)
		}

		@ $mol_mem
		override frame_style(): { readonly [ prop: string ]: string } {

			const rect = this.frame_box()
			if( !rect ) return {}

			return {
				left: rect.left + 'px',
				top: rect.top + 'px',
				width: rect.width + 'px',
				height: rect.height + 'px',
			}
		}

		/**
		 * The hole under the picked part.
		 *
		 * The overlay is cut open exactly where the picked part is, so that inside
		 * it the frame is the topmost thing on the page and the live component gets
		 * its events for real: hover, scroll, text selection, a drag of its own. The
		 * ring and the handles are drawn around the hole and stay on the overlay,
		 * which is what the part is carried by.
		 *
		 * Closed while `hole_allowed()` is off — see the tree: a drop from the
		 * palette has no pointer capture and would fall into the frame.
		 */
		@ $mol_mem
		override overlay_style(): { readonly [ prop: string ]: string } {
			const rect = this.hole_allowed() ? this.frame_box() : null
			return { clipPath: this.$.$bog_vmap_app_pane_hole( rect ) }
		}

		/**
		 * Puts a message on the wire and notes that an answer is now owed.
		 *
		 * Every push goes through here rather than calling the bridge directly, so
		 * the watchdog cannot be defeated by a new kind of message somebody adds
		 * later and forgets to stamp.
		 */
		post( target: { postMessage( data: unknown, origin: string ): void }, message: $bog_vmap_bridge_down ) {
			this.$.$bog_vmap_bridge_send( target, message )
			this.poke_at = this.now()
		}

		@ $mol_mem
		doc_push() {

			const target = this.target()
			const src = this.doc_src()
			if( !target ) return src

			this.post( target, {
				kind: 'doc_set',
				src,
				js: this.doc_js(),
				root: this.doc_root(),
			} )

			return src
		}

		@ $mol_mem
		css_push() {

			const target = this.target()
			const css = this.doc_css()
			if( !target ) return css

			this.post( target, { kind: 'css_set', css } )

			return css
		}

		/**
		 * Canvas placement of the free parts, on a wire of its own.
		 *
		 * Not folded into `css_push()`, and that separation is the whole point: the
		 * document CSS is what an export writes out, so coordinates travelling on it
		 * would be one careless join away from shipping the editor's desk layout into
		 * a deployed site. Here the host sends numbers and the scene alone turns them
		 * into rules, so the export cannot see placement by construction rather than
		 * by nobody having mixed the two up yet.
		 */
		@ $mol_mem
		spots_push() {

			const target = this.target()
			const spots = this.spots()
			if( !target ) return spots

			this.post( target, { kind: 'spots_set', spots } )

			return spots
		}

		/**
		 * Sources of the land libraries, the whole list on every change.
		 *
		 * A wire of its own and not a field of `doc_set`: the document changes on
		 * every keystroke and the libraries change when a link is pasted, and a
		 * document push carrying every library source would resend them all on
		 * each keystroke. The scene merges nothing, it recompiles from the last list.
		 */
		@ $mol_mem
		libs_push() {

			const target = this.target()
			const parts = this.libs()
			if( !target ) return parts

			this.post( target, { kind: 'libs_set', parts } )

			return parts
		}

		@ $mol_mem
		camera_push() {

			const target = this.target()
			const camera = this.camera()
			if( !target ) return camera

			this.post( target, { kind: 'camera_set', camera } )

			return camera
		}

		/**
		 * The `sandbox` attribute proves nothing, an unreachable origin does.
		 * The scene is served from our own origin, so a SecurityError here means the
		 * sandbox gave it an opaque origin, which is `null` seen from the inside.
		 */
		@ $mol_mem
		override isolation() {

			if( !this.ready() ) return ''

			const peer = this.scene_peer()
			if( !peer ) return 'кадра нет'

			try {
				return `БЕЗ ПЕСОЧНИЦЫ: origin ${ peer.origin }`
			} catch {
				return 'песочница: origin кадра недоступен'
			}

		}

		message_receive( event?: MessageEvent ) {

			if( !event ) return

			// Only our own frame speaks here. A missing peer means no frame yet, and
			// `read` without one would drop the check entirely, so bail before calling.
			const peer = this.scene_peer()
			if( !peer ) return

			const message = this.$.$bog_vmap_bridge_read< $bog_vmap_bridge_up >( event, peer )
			if( !message ) return

			// Any message at all is proof of life, whatever it says: an `error` means
			// the scene compiled, failed and got as far as telling us, which is a
			// working bridge. The claim being retracted here is only about silence.
			this.answer_at = this.now()
			this.traffic_version( this.traffic_version() + 1 )
			this.stalled( false )

			if( message.kind === 'ready' ) {

				this.error_at( 'compile', '' )
				this.error_at( 'runtime', '' )

				// A fresh frame has proved nothing yet, so the baseline goes with the
				// old one. Without this the watch would stay armed at its short limit
				// across a reload and accuse the new scene of being stuck while it is
				// merely fetching its pack — and the reload is exactly the moment when
				// a pack fetch happens, so the false alarm would be the common case,
				// not the corner one.
				this.warmed( false )

				this.handshake( this.handshake() + 1 )
				return
			}

			if( message.kind === 'error' ) {

				const at = message.at === 'compile' ? 'compile' : 'runtime'

				// `null` is the scene saying this channel is clear again. An empty
				// string is not: an error with no text is a plausible bug of its own
				// and must not read as good news.
				if( message.message === null ) {
					this.error_at( at, '' )
					return
				}

				const label = at === 'compile' ? 'компиляция' : 'исполнение'
				const node = message.node ? ` — ${ message.node }` : ''
				this.error_at( at, `${ label }${ node }: ${ message.message }` )
				return
			}

			if( message.kind === 'sizes' ) {

				// MERGED, never replaced. Culling means the scene stops drawing what
				// is off screen, and what is not drawn cannot be measured, so a name
				// missing from a report is a node that went out of view — not one
				// that lost its size. Replacing would drop the box the moment the
				// node left the viewport, and the selection ring, which is drawn from
				// exactly these boxes, would blink out at the edge of the canvas.
				//
				// Stale entries are dropped by `sizes_forget()`, from the one place
				// that knows a node is gone for good: the delete.
				this.sizes_last = { ... this.sizes_last, ... message.sizes }

				this.sizes_version( this.sizes_version() + 1 )
				// Geometry is what starts the watch, see `warmed()`.
				this.warmed( true )
				return
			}

		}

		@ $mol_mem
		message_listener() {
			return new this.$.$mol_dom_listener(
				this.$.$mol_dom_context,
				'message',
				$mol_wire_async( this ).message_receive,
			)
		}

		override auto() {
			return [
				... super.auto(),
				this.message_listener(),
				this.doc_push(),
				this.css_push(),
				this.libs_push(),
				this.spots_push(),
				this.camera_push(),
				this.heartbeat(),
				this.watchdog(),
			]
		}

	}

	/**
	 * Pointer gate over the scene, and the layer the editor draws selection on.
	 *
	 * Everything it knows comes down from the pane, which owns the camera and the
	 * measured geometry. Selection is drawn here rather than in the scene because
	 * the overlay belongs to the host: no code inside the document can forge a
	 * selection ring or hide one, and the stroke keeps its width at any zoom
	 * because this layer is not the one being scaled.
	 * @see ../../ARCHITECTURE.md section 4
	 */
	export class $bog_vmap_app_pane_overlay extends $.$bog_vmap_app_pane_overlay {

		/**
		 * The ring, or nothing at all.
		 *
		 * A node kept in the tree and merely hidden would still be a view to build,
		 * measure and keep alive, and an empty canvas is the common state.
		 */
		override sub() {
			return this.frame_showed() ? [ this.Frame() ] : []
		}

	}

}
