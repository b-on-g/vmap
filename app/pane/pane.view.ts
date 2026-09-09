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

	/**
	 * Root class the markup of the frame mounts, as a name and nothing more.
	 *
	 * Glued from two halves on purpose. mam builds its dependency graph by a regexp
	 * over sources, string literals included, so the name written whole would make
	 * the editor depend on the sandbox module and carry the whole scene bundle
	 * inside its own — the two are separate bundles by design, and the frame loads
	 * the second one itself.
	 */
	const scene_root = '$' + 'bog_vmap_scene'

	/** A wire to make: both ends, as the pane asks the owner to write it. */
	export type $bog_vmap_app_pane_link_new = Pick< $bog_vmap_lang_link, 'from' | 'from_prop' | 'to' | 'to_prop' >

	/** An input to unplug. */
	export type $bog_vmap_app_pane_link_end = Pick< $bog_vmap_lang_link, 'to' | 'to_prop' >

	/** A node put into the tree of a container, as the pane asks the owner to write it. */
	export type $bog_vmap_app_pane_tree_move = {
		readonly name: string
		readonly owner: string
		readonly index: number
	}

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

			// Through `pane_rect()`, which is the warmed reading. Straight off
			// `view_rect()` this was `null` until something else had read it, so the
			// FIRST zoom after a load pivoted on the corner of the canvas instead of
			// its middle, and the whole document jumped sideways under the pointer.
			const rect = this.pane_rect()
			const center = new this.$.$mol_vector_2d( rect.width / 2, rect.height / 2 )

			this.camera_shift(
				this.camera_shift().multed0( real ).added1( center.multed0( 1 - real ) )
			)

		}

		/**
		 * Everything the user has to be told about the scene: a sandbox that is not
		 * there, and the two error channels. They clear independently, so a single
		 * slot would let a fixed compile erase a runtime failure that is still live.
		 */
		override error() {
			return [ this.isolation(), this.error_at( 'compile' ), this.error_at( 'runtime' ) ]
				.filter( Boolean )
				.join( '\n' )
		}

		/**
		 * The two channels sorted onto the nodes they were attributed to.
		 *
		 * A failure the scene could not attribute stays on the strip alone: a mark
		 * on the wrong node would be worse than no mark, and there is nowhere else
		 * to put it. Both channels can name the same node, and then both texts go
		 * on it, and a channel cleared by the scene takes its mark off with it —
		 * the name of a node without a text of its own is not a failure.
		 */
		@ $mol_mem
		errors(): { readonly [ node: string ]: string } {

			const res = {} as { [ node: string ]: string }

			for( const at of [ 'compile', 'runtime' ] as const ) {

				const node = this.error_node( at )
				const text = this.error_at( at )
				if( !node || !text ) continue

				res[ node ] = res[ node ] ? res[ node ] + '\n' + text : text

			}

			return res
		}

		/** What the scene said about one node, empty when it said nothing. */
		node_error( name: string ) {
			return this.errors()[ name ] ?? ''
		}

		/** A mark per node the scene complained about, once it has been measured. */
		@ $mol_mem
		override error_marks() {
			return Object.keys( this.errors() )
				.filter( name => this.part_box( name ) )
				.map( name => this.Mark( name ) )
		}

		@ $mol_mem_key
		override mark_hint( name: string ) {
			return this.node_error( name )
		}

		/** At the top left corner of the node, in screen pixels, like the ring. */
		@ $mol_mem_key
		override mark_style( name: string ): { readonly [ prop: string ]: string } {

			const rect = this.part_box( name )
			if( !rect ) return {}

			return {
				left: rect.left + 'px',
				top: rect.top + 'px',
			}
		}

		/**
		 * Which frame is the live one: the generation, and the pack it was raised
		 * with. A new key is a new `$mol_frame`, a new element and a new document.
		 *
		 * The pack belongs in the key because a realm cannot unload a bundle, and a
		 * second pack over the first poisons half the palette without a word — 277
		 * classes of 414 in the measurement of section 5. The frame no longer has an
		 * address for the pack to ride in, so what used to be held by the browser
		 * reloading on a changed `src` is held here instead, by the same means the
		 * restart button uses.
		 */
		scene_key() {
			return this.scene_generation() + ' ' + this.pack_uri()
		}

		/**
		 * The document of the frame, handed to it as markup instead of fetched.
		 *
		 * There is no page for the sandbox anywhere in the project, and the boundary
		 * of section 4 does not depend on there being one: `allow-scripts` without
		 * `allow-same-origin` gives the frame an opaque origin whether it arrived by
		 * address or by markup. What an opaque origin does lose is a base to resolve
		 * against, so the bundle is named absolutely.
		 *
		 * `color-scheme` is what gives a frame its base background, and it has to be
		 * declared: without it Chrome keeps a transparent frame transparent only
		 * until something inside takes a compositing layer — the camera transform on
		 * `Stage` does — and from then on fills it with a pale base of its own.
		 * Measured in a live window with `requestAnimationFrame` ticking, not under
		 * automation.
		 *
		 * So the frame is opaque on purpose, and everything that has to be seen
		 * beneath the document lives inside it: the canvas grid is drawn in there
		 * with it. Inline rather than by a rule, so that it also holds during the
		 * first paint, before the bundle has loaded.
		 */
		override scene_html() {
			return [
				'<!doctype html>',
				'<html lang="en" mol_view_root style="height:100%;width:100%;color-scheme:dark">',
				'<head><meta charset="utf-8" />',
				'<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1" />',
				'</head>',
				'<body mol_view_root style="padding:0;margin:0;height:100%;width:100%">',
				`<div mol_view_root="${ scene_root }"></div>`,
				`<script src="${ this.scene_bundle() }" charset="utf-8"></script>`,
				'</body></html>',
			].join( '' )
		}

		/**
		 * Peer window, taken from the frame itself and never from `event.source`.
		 *
		 * The channel carries no origin, so any window able to post a `ready` would
		 * otherwise take it over — caught in testing, where a second scene opened
		 * for a probe stole the binding from the real frame.
		 */
		scene_peer(): $bog_vmap_app_pane_peer | null {
			return ( this.Scene( this.scene_key() ).dom_node() as HTMLIFrameElement ).contentWindow
		}

		/**
		 * The live frame, the gate over it, the wires above both, and the insertion
		 * line while a drop has somewhere to go.
		 *
		 * The line is topmost and lives here rather than on the overlay: the overlay
		 * is cut open under the picked node, and a line crossing that hole would be
		 * cut in half exactly when the user is aiming at it.
		 */
		override sub() {
			return [
				this.Scene( this.scene_key() ),
				this.Overlay(),
				this.Wire(),
				... this.slot() ? [ this.Insert() ] : [],
				... this.band() ? [ this.Band() ] : [],
			] as readonly $mol_view[]
		}

		/**
		 * Replaces the frame with a fresh one that has said nothing and proved nothing
		 * yet. Nothing is lost: the host owns the document, the placement and the
		 * camera, and every push cell re-sends on the new handshake.
		 *
		 * The handshake is not cleared here and must not be: it is kept per frame, so
		 * the new key already reads zero. What is cleared is the two claims the host
		 * makes about the OLD frame, so that the strip stops accusing it the moment
		 * the button is pressed.
		 */
		@ $mol_action
		scene_restart() {
			this.scene_generation( this.scene_generation() + 1 )
			this.warmed( false )
			this.stalled( false )
		}

		/**
		 * Handshakes seen from one frame. A counter, not a flag, so a scene reload
		 * re-pushes; keyed by the frame, so a REPLACED frame starts from zero.
		 *
		 * Keyed and not plain, because the frame is now replaced by two different
		 * things — the restart button and a change of pack — and only one of them is
		 * an action that could clear a plain cell. A derived change of key would
		 * otherwise leave this reading «already shaken hands», the host would push
		 * into a window that has not booted, and every one of those messages would
		 * be lost silently while the watchdog counted the new frame's pack fetch
		 * against it.
		 *
		 * One scene load does not mean exactly one step here: observed both +1
		 * and +2 for a single reload, because the scene may announce itself more
		 * than once. Only the change matters, never the number — do not go
		 * hunting for a bug on the strength of an even count.
		 */
		@ $mol_mem_key
		override handshake( key: string, next?: number ) {
			return next ?? 0
		}

		override ready() {
			return this.handshake( this.scene_key() ) > 0
		}

		/** The window to push to, or null until the scene says it is listening. */
		target() {
			return this.ready() ? this.scene_peer() : null
		}

		/**
		 * Serial of the last push the scene owes an answer to.
		 *
		 * A plain field, written from inside the `*_push` cells. Writing a field there
		 * is fine and writing a CELL there would not be: a cell set from the body of
		 * another cell is an invalidation loop. Nothing reads this reactively either —
		 * `watchdog()` reads it only alongside the cells that move it.
		 */
		poke_at = 0

		/** Serial of the last message the scene sent, of any kind. */
		answer_at = 0

		/** The clock both stamps are taken from. A method so that a test can move it by hand. */
		now() {
			return Date.now()
		}

		/**
		 * Serial the two stamps are taken from, so a question and an answer can never
		 * share one.
		 *
		 * A wall clock cannot promise that. The host answers `ready` by pushing the
		 * document again, and both the answer and the questions it causes land inside
		 * the same millisecond — `Date.now()` stamps them equally, `poke <= answer`
		 * reads as «answered», and the watch disarms over a scene that was never
		 * asked anything it managed to reply to. Caught by a test of the cold frame
		 * that passed alone and failed in a full run, which is what a clock used as
		 * an order does.
		 */
		stamp_last = 0

		stamp() {
			return ++ this.stamp_last
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

		/**
		 * How long a frame that has never reported geometry may stay silent.
		 *
		 * Much longer than the warm limit, and on for the same reason the warm one
		 * is. A cold frame is legitimately mute for a while: the pack is fetched into
		 * a fresh realm, `report_task` suspends on `pack_ready()`, and a suspended
		 * cell arms no timer and posts nothing. That is why this watch used to be off
		 * altogether — and off, it left the one case with no way out at all. Document
		 * code that loops on the first compile stops the scene BEFORE any geometry,
		 * so the frame never warms, the strip never appears, and the canvas sits in
		 * «ожидание сцены…» with no button to press. The generous limit buys the slow
		 * line its time and still ends in a sentence instead of silence.
		 */
		cold_limit() {
			return 30000
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
			this.pack_push()
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

			if( this.poke_at <= this.answer_at ) return null

			// A cold frame is watched too, on a limit of its own. See `cold_limit()`.
			const limit = this.warmed() ? this.answer_limit() : this.cold_limit()

			return new this.$.$mol_after_timeout( limit, () => this.stalled( true ) )
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
		 * Drops every remembered box of a node: the node itself wherever it was
		 * drawn, and everything that was drawn inside it.
		 *
		 * The counterpart of the merge in `message_receive`. Since a missing name no
		 * longer means «has no size», something has to say when a name means nothing
		 * where it used to, and only the two writes that move or remove a node know
		 * that. A node removed by editing the text by hand is not covered and will
		 * leave a box behind — worth fixing when the code editor of stage 4 makes
		 * that path real.
		 *
		 * BY SEGMENT AND NOT BY PREFIX, which is the whole difference between this
		 * and what it was. A node carried into a container is measured at a NEW path,
		 * and the old key kept its last box beside it: two boxes answered to one
		 * name, and everything that looks a node up by name — the ring, the hit test,
		 * the port dots — could get either. Measured on the deploy: `…/Schet` with
		 * its free coordinate living next to `…/Pair/Schet`.
		 */
		sizes_forget( name: string ) {

			const prefix = this.doc_root() + '/'
			const kept = {} as { [ node: string ]: $bog_vmap_bridge_rect }

			for( const key of Object.keys( this.sizes_last ) ) {
				const path = key.startsWith( prefix ) ? key.slice( prefix.length ).split( '/' ) : []
				if( path.includes( name ) ) continue
				kept[ key ] = this.sizes_last[ key ]
			}

			this.sizes_last = kept
			this.sizes_version( this.sizes_version() + 1 )
		}

		/**
		 * Every measured node of the document, with the path the scene walked to it
		 * and the name it is addressed by, in the order it was walked.
		 *
		 * The name is the LAST segment of the path and nothing else: section 1 makes
		 * every named node a flat property of the root class whatever its depth, so a
		 * node inside an artboard is addressed exactly like one lying free, and the
		 * path says only where it is drawn.
		 *
		 * The order is the order of the report, which is the order of the DOM, which
		 * is the order the children of an artboard are laid out in. Everything below
		 * relies on that and on nothing else.
		 */
		@ $mol_mem
		nodes_measured() {

			const prefix = this.doc_root() + '/'
			const known = new Set( this.doc_names() )
			const nodes = [] as { name: string, path: readonly string[], box: $bog_vmap_bridge_rect }[]

			for( const key of Object.keys( this.sizes() ) ) {

				if( !key.startsWith( prefix ) ) continue

				const path = key.slice( prefix.length ).split( '/' )

				// EVERY segment has to be a node the document declares. The scene walks
				// the whole rendered tree, so a part of two hundred pixels reports the
				// button and the field inside it as well, and without this the hit test
				// handed back a view the document never named: the ring came out the
				// size of an inner control, the inspector had no declaration to show,
				// and the part itself could not be picked, carried or deleted.
				//
				// Every segment and not only the last, because a name of the document
				// may repeat inside a pack class, and the ancestry is what tells the two
				// apart. The cost is a node put inside a pack property rather than into
				// `sub` — which this editor cannot author, and a foreign document can:
				// such a node draws, and stays out of reach of the pointer.
				if( path.some( step => !known.has( step ) ) ) continue

				nodes.push({ name: path[ path.length - 1 ], path, box: this.sizes()[ key ] })
			}

			return nodes
		}

		/**
		 * The box of a node, at whatever depth it is drawn, or `null` while the scene
		 * has not reported one.
		 *
		 * A name is looked up rather than a path, because a name is what the document,
		 * the selection and the placement are all keyed by. The last match wins, the
		 * same rule the hit test follows: a name drawn twice is a keyed sub view, and
		 * the later one is the one on top.
		 */
		part_size( name: string ) {

			let found = null as $bog_vmap_bridge_rect | null

			for( const node of this.nodes_measured() ) if( node.name === name ) found = node.box

			return found
		}

		/** Names of the nodes the scene has measured, at every depth. */
		part_names() {
			return this.nodes_measured().map( node => node.name )
		}

		/** Names of the parts lying free on the canvas: the direct children of the root. */
		free_names() {
			return this.nodes_measured().filter( node => node.path.length === 1 ).map( node => node.name )
		}

		/** Where a node is drawn: the names of the nodes it lies inside, outermost first. */
		node_path( name: string ): readonly string[] {

			for( const node of this.nodes_measured() ) {
				if( node.name === name ) return node.path.slice( 0, -1 )
			}

			return []
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
			/** Where every node being carried started, by name. A group moves as one. */
			spots: { readonly [ name: string ]: { readonly x: number, readonly y: number } },
			grab: readonly [ number, number ],
			version: number,
			/** Drawn inside another node, so it is laid out by tree and has no coordinate. */
			nested: boolean,
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
		 *
		 * `entering` says the press landed on the node that was ALREADY picked, so a
		 * click out of it is the second one and lets the pointer inside. See `entered`.
		 */
		press: {
			screen: readonly [ number, number ],
			world: readonly [ number, number ],
			moved: boolean,
			entering: boolean,
			/** The node under the press, `null` for bare canvas. */
			name: string | null,
		} | null = null

		/**
		 * The node the pointer has been let inside of, or `null`.
		 *
		 * The hole in the overlay hangs on THIS and not on the pick, and that is the
		 * whole of it: a picked node is carried by its body, an entered one lives its
		 * own life. Cut open on the pick alone, the overlay handed the frame every
		 * press on the node just dropped — so it could not be dragged at all except
		 * by the eight pixel strip around it — and the focus the scene gives inside
		 * the hole took the keyboard into the frame, where the Delete of the editor
		 * never arrives.
		 *
		 * Compared against `primary()` rather than cleared by hand: a pick of
		 * anything else closes the hole by itself, and nothing has to remember to.
		 */
		@ $mol_mem
		entered( next?: string | null ) {
			return next ?? null
		}

		/**
		 * The primary of the picked nodes: the last one taken.
		 *
		 * The hole, the wire dots and the inspector all speak about ONE node, and
		 * this is which one. Derived from `picked()` and never stored beside it: two
		 * cells for one fact need somebody to keep them in step.
		 */
		primary() {
			const picked = this.picked()
			return picked.length ? picked[ picked.length - 1 ] : null
		}

		/** Whether the pointer is inside the picked node, i.e. the overlay is cut open. */
		inside() {
			const name = this.primary()
			return Boolean( name ) && this.entered() === name
		}

		/**
		 * Where this pane sits in the viewport.
		 *
		 * `view_rect()` and not a `getBoundingClientRect()` of our own. The reason
		 * written here before — that a handler reading the watched cell would be
		 * re-run by the layout its own gesture causes — was wrong: the handlers run
		 * as one shot tasks through `event_async()` and subscribe to nothing. What is
		 * true of that cell is that its FIRST read answers `null` on purpose, to keep
		 * a reflow out of the render; `$mol_touch` answers that by reading it in
		 * `auto()`, and so does this pane. A method of its own so that a test can
		 * hand in a geometry the test DOM has no way to lay out.
		 */
		pane_rect(): $bog_vmap_app_pane_screen_box {
			const rect = this.view_rect()
			if( !rect ) return { left: 0, top: 0, width: 0, height: 0 }
			return { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
		}

		/** Point of a pointer event in screen pixels of this pane, the space the wires are drawn in. */
		screen_point( event: PointerEvent ) {
			const rect = this.pane_rect()
			return [ event.clientX - rect.left, event.clientY - rect.top ] as const
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

			const screen = this.screen_point( event )
			const shift = this.camera_shift()
			const zoom = this.camera_zoom()

			return [
				( screen[0] - shift[0] ) / zoom,
				( screen[1] - shift[1] ) / zoom,
			] as const
		}

		/**
		 * Which part is under a world point, or `null` for bare canvas.
		 *
		 * The DEEPEST match wins, and among equally deep ones the last, because the
		 * parts are absolutely positioned siblings and a later one paints over an
		 * earlier one. Picking the first, or the smallest, would hand back a node the
		 * user cannot see.
		 *
		 * Depth first is what makes a node inside an artboard reachable at all: it
		 * lies inside the box of the artboard, so a rule that stopped at the free
		 * parts would always hand back the page and never anything on it. The strip
		 * of slack around a box is added on every level, so a child still catches the
		 * pointer near its edge, and its parent catches it further out.
		 */
		node_at( point: readonly [ number, number ] ) {

			const slack = grab_slack / this.camera_zoom()

			let found = null as string | null
			let depth = 0

			for( const node of this.nodes_measured() ) {

				const box = node.box

				if( point[0] < box.x - slack ) continue
				if( point[1] < box.y - slack ) continue
				if( point[0] > box.x + box.width + slack ) continue
				if( point[1] > box.y + box.height + slack ) continue

				if( node.path.length < depth ) continue

				found = node.name
				depth = node.path.length

			}

			return found
		}

		/**
		 * Boxes of the children of a container, in the order they are laid out.
		 *
		 * Off the report and not off the document: the order the scene walked is the
		 * order of the DOM, and a child hidden by culling has no box and no place on
		 * screen to put an insertion line at.
		 */
		node_kids( owner: string ) {
			return this.nodes_measured()
				.filter( node => node.path[ node.path.length - 2 ] === owner )
				.map( node => node.box )
		}

		/**
		 * The container a point falls into, or `null` for bare canvas.
		 *
		 * A container is a node whose declaration carries a `sub` — an artboard, see
		 * section 8 — and the deepest one wins, so a box nested inside an artboard
		 * takes the drop rather than the page around it.
		 *
		 * The node being carried is stepped over, and so is everything inside it: a
		 * node cannot become its own descendant, and offering that as a target would
		 * mean drawing a line where the drop is going to be refused.
		 */
		container_at( point: readonly [ number, number ], moving = '' ) {

			const containers = new Set( this.containers() )

			let found = null as string | null
			let depth = 0

			for( const node of this.nodes_measured() ) {

				if( !containers.has( node.name ) ) continue
				if( node.path.length < depth ) continue

				if( moving && node.path.includes( moving ) ) continue

				const box = node.box
				if( point[0] < box.x || point[0] > box.x + box.width ) continue
				if( point[1] < box.y || point[1] > box.y + box.height ) continue

				found = node.name
				depth = node.path.length

			}

			return found
		}

		/** Where a node dropped at this point would go, or `null` for bare canvas. */
		insert_slot( point: readonly [ number, number ], moving = '' ) {

			const owner = this.container_at( point, moving )
			if( !owner ) return null

			const box = this.part_size( owner )
			if( !box ) return null

			return this.$.$bog_vmap_app_pane_slot(
				owner,
				box,
				this.node_kids( owner ),
				point,
				this.axis( owner ),
			)
		}

		/**
		 * The slot the gesture in hand is aiming at, drawn as a line between children.
		 *
		 * A cell rather than a field, because the line is drawn from it; the whole
		 * point of the feedback is that it follows the pointer.
		 */
		@ $mol_mem
		slot( next?: $bog_vmap_app_pane_slot | null ) {
			return next ?? null
		}

		override tree_move( next?: $bog_vmap_app_pane_tree_move | null ) {
			return next ?? null
		}

		/**
		 * The band being swept over the canvas, in world units, or `null`.
		 *
		 * A cell and not a field for the reason the slot is one: the band is drawn
		 * from it and has to follow the pointer. Kept as the two corners the gesture
		 * has rather than as a normalised rectangle, because a sweep upwards or to
		 * the left is an ordinary sweep and normalising is one line where it is used.
		 */
		@ $mol_mem
		band( next?: { readonly from: readonly [ number, number ], readonly to: readonly [ number, number ] } | null ) {
			return next ?? null
		}

		/**
		 * Whether this press sweeps a band rather than picks.
		 *
		 * Control or command, which is what the user asked for and what leaves the
		 * plain drag alone: over bare canvas that is still the pan, and over a node
		 * it is still the carry. Shift is left free — it is the natural key for
		 * adding one more node to a selection, and spending it on the band would
		 * cost the gesture that is asked for next.
		 */
		band_wanted( event: PointerEvent ) {
			return Boolean( event.ctrlKey || event.metaKey )
		}

		/** The band as a rectangle in world units, whichever way it was swept. */
		band_box() {

			const band = this.band()
			if( !band ) return null

			return {
				x: Math.min( band.from[0], band.to[0] ),
				y: Math.min( band.from[1], band.to[1] ),
				width: Math.abs( band.to[0] - band.from[0] ),
				height: Math.abs( band.to[1] - band.from[1] ),
			}
		}

		/**
		 * The nodes a rectangle in world units takes: everything it OVERLAPS, and of
		 * a node and its container only the outer one.
		 *
		 * Overlap and not containment, because a band drawn across a wide page would
		 * otherwise take nothing at all, and a part half off the band is plainly
		 * being pointed at. The descendants of a taken node are dropped because they
		 * move with it: taking both would carry a child twice, once by its own spot
		 * and once inside its parent, and delete it twice over.
		 */
		nodes_covered( box: $bog_vmap_bridge_rect ) {

			const hit = this.nodes_measured().filter( node => {
				const own = node.box
				if( own.x + own.width < box.x ) return false
				if( own.y + own.height < box.y ) return false
				if( own.x > box.x + box.width ) return false
				if( own.y > box.y + box.height ) return false
				return true
			} )

			const names = new Set( hit.map( node => node.name ) )

			return hit
				.filter( node => !node.path.slice( 0, -1 ).some( up => names.has( up ) ) )
				.map( node => node.name )
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

			// The drag crossing this canvas is the owner's, not ours. Measured cost of
			// not saying so: a press whose release fell into the hole leaves the carry
			// live, and the next pointer to cross the overlay with a button down —
			// which is exactly a drag out of the palette — moves the picked node to
			// wherever it is let go, grabbed where it was last pressed.
			if( this.carrying() ) return

			// A dot before a part: dots lie on the grip strip of the part they belong
			// to, and the wire is the finer target.
			const dot = $bog_vmap_app_wire_dot_at( this.wire_dots(), this.screen_point( event ) )
			if( dot ) return this.wire_press( dot, event )

			const point = this.world_point( event )

			// A modified pointer sweeps a band instead of picking: the modifier is
			// what tells a sweep from a pan, and it is read here and nowhere else, so
			// the rest of the gesture does not have to keep asking.
			if( this.band_wanted( event ) ) {
				event.preventDefault()
				this.band({ from: point, to: point })
				this.press = { screen: [ event.clientX, event.clientY ], world: point, moved: false, entering: false, name: null }
				return
			}

			const name = this.node_at( point )

			// A press on something already picked leaves the set alone, so that a group
			// is carried by the body of any one of it, and the body of a single node
			// stays the handle it is carried by. Reducing the set to the node pressed
			// is the business of the release, and only when nothing moved.
			//
			// The second press on a node picked alone is the one that lets the pointer
			// inside it; every other press keeps the pointer out.
			const already = Boolean( name ) && this.picked().includes( name! )
			const entering = already && this.picked().length === 1

			if( !already ) this.picked( name ? [ name ] : [] )
			if( !entering ) this.entered( null )

			this.press = {
				screen: [ event.clientX, event.clientY ],
				world: point,
				moved: false,
				entering,
				name,
			}

			if( !name ) return

			event.preventDefault()

			// Everything picked travels, and only what lies by a coordinate can: a node
			// inside an artboard is laid out by tree and has no spot to move.
			const spots = {} as { [ node: string ]: { readonly x: number, readonly y: number } }
			for( const picked of this.picked() ) {
				if( this.node_path( picked ).length ) continue
				spots[ picked ] = this.spots()[ picked ] ?? { x: 0, y: 0 }
			}

			this.drag = {
				name,
				spots,
				grab: point,
				version: this.sizes_version(),
				nested: this.node_path( name ).length > 0,
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
		 *
		 * Over a container it writes nothing at all. Inside an artboard the layout is
		 * a tree and not a set of coordinates, so what the gesture means there is a
		 * position among children, and the only feedback until the release is the
		 * insertion line. A node that is drawn inside one never gets a coordinate
		 * either way: `spots` positions the direct children of the root and nothing
		 * else, so writing one would leave a number in the document's desk layout
		 * that moves nothing.
		 */
		node_move( event?: PointerEvent ) {

			if( !event ) return
			if( this.carrying() ) return

			this.press_track( event )

			if( this.wire_drag() ) {
				if( !event.buttons ) return this.node_release( event )
				event.preventDefault()
				this.wire_point( this.screen_point( event ) )
				return
			}

			const band = this.band()
			if( band ) {
				if( !event.buttons ) return this.node_release( event )
				event.preventDefault()
				this.band({ from: band.from, to: this.world_point( event ) })
				return
			}

			const drag = this.drag
			if( !drag || !this.drag_live ) return

			// The button came up somewhere we never heard about it.
			if( !event.buttons ) return this.node_release( event )

			event.preventDefault()

			const point = this.world_point( event )

			const slot = this.insert_slot( point, drag.name )
			this.slot( slot )

			if( slot || drag.nested ) return

			const next = { ... this.spots() }

			for( const name of Object.keys( drag.spots ) ) {
				next[ name ] = {
					x: drag.spots[ name ].x + point[0] - drag.grab[0],
					y: drag.spots[ name ].y + point[1] - drag.grab[1],
				}
			}

			this.spots( next )

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
			if( this.carrying() ) return

			const press = this.press
			if( press ) this.press_track( event )
			this.press = null

			if( this.wire_drag() ) return this.wire_release( event )

			// A band that never grew is a modified click, and takes nothing: sweeping
			// is a gesture with an area, and a stray click with a key held down
			// should not silently clear what is picked.
			const box = this.band_box()
			if( box ) {

				this.band( null )
				if( !press?.moved ) return

				// The pointer goes back outside: a band that happened to end on the
				// node it was left inside of would otherwise cut the overlay open
				// with no second click, which is the whole rule it would break.
				this.entered( null )
				this.picked( this.nodes_covered( box ) )

				return
			}

			if( this.drag_live ) {

				// The drop into a tree is asked for here and never written here: the
				// pane owns the geometry of the gesture, the document is the owner's.
				const drag = this.drag
				const slot = this.slot()

				this.slot( null )

				if( drag && slot ) this.tree_move({ name: drag.name, owner: slot.owner, index: slot.index })

				// Cleared, not merely switched off: a carry left standing is a carry
				// that some later pointer can pick up again.
				this.drag = null
				this.drag_live = false

				try {
					this.Overlay().dom_node().releasePointerCapture( event.pointerId )
				} catch {}

			}

			if( !press ) return
			if( event.button !== 0 ) return
			if( press.moved ) return

			// A click on one node of a group means that one node: the group was kept
			// through the press so that it could have been carried, and now it was not.
			if( press.name && this.picked().length > 1 ) return this.picked([ press.name ])

			// Only the second click on one and the same node goes on to the live
			// component. The first one is the editor's: it picks, and it leaves both
			// the body of the node and the keyboard where the editor can use them.
			if( !press.entering ) return

			this.entered( this.primary() )

			// The keyboard has to follow the pointer inside. `focus()` on the element
			// INSIDE the frame is the scene's half and it is not enough by itself:
			// measured in the browser, after a relayed click the active element of
			// the frame document was still `body` and typing went nowhere. Focusing
			// the frame element is the host's half, it is allowed across origins, and
			// it is what puts the frame's document in the keyboard's way. Best effort
			// for the same reason the pointer capture is: a test DOM may not have it.
			try {
				( this.Scene( this.scene_key() ).dom_node() as HTMLElement ).focus()
			} catch {}

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

		/** Names of the picked nodes a ring can be drawn for: the measured ones. */
		override frames() {
			return this.picked().filter( name => this.part_box( name ) )
		}

		/** Whether a ring is drawn at all, for the tests and for anything that only needs the flag. */
		frame_showed() {
			return this.frames().length > 0
		}

		/**
		 * Where the picked part is on screen, in pixels of this pane, or `null`.
		 *
		 * World to screen is `world * zoom + shift`, the same transform the scene
		 * applies to itself. Done on the host so that the ring keeps its stroke width
		 * at any zoom, and done once so that the ring and the hole in the overlay are
		 * cut from the same numbers.
		 */
		frame_box(): $bog_vmap_app_pane_screen_box | null {
			const name = this.primary()
			return name ? this.part_box( name ) : null
		}

		/**
		 * Where a part is on screen, in pixels of this pane, or `null` while the
		 * scene has not measured it. The last known box is kept across culling, so a
		 * wire to a part that left the viewport still has an end to go to.
		 */
		@ $mol_mem_key
		part_box( name: string ): $bog_vmap_app_pane_screen_box | null {

			const box = this.part_size( name )
			if( !box ) return null

			const drag = this.drag
			const spot = this.spots()[ name ]
			const start = drag?.spots[ name ]

			// See `drag`: while the measured boxes are stale, and only then, the ring
			// carries the offset the pointer has added since the grab. Every node of
			// a group gets its own, which is why the starts are kept by name.
			const live = start && spot && this.sizes_version() === drag!.version
			const dx = live ? spot.x - start.x : 0
			const dy = live ? spot.y - start.y : 0

			return this.$.$bog_vmap_app_pane_screen(
				{ x: box.x + dx, y: box.y + dy, width: box.width, height: box.height },
				this.camera_zoom(),
				this.camera_shift(),
			)
		}

		/** Where the line goes on screen. Flat in world units, two pixels thick here. */
		@ $mol_mem
		override insert_style(): { readonly [ prop: string ]: string } {

			const slot = this.slot()
			if( !slot ) return {}

			const rect = this.$.$bog_vmap_app_pane_screen(
				slot.line,
				this.camera_zoom(),
				this.camera_shift(),
			)

			return {
				left: rect.left + 'px',
				top: rect.top + 'px',
				width: Math.max( rect.width, 2 ) + 'px',
				height: Math.max( rect.height, 2 ) + 'px',
			}
		}

		/** Where the band is on screen. Empty while none is being swept. */
		@ $mol_mem
		override band_style(): { readonly [ prop: string ]: string } {

			const box = this.band_box()
			if( !box ) return {}

			const rect = this.$.$bog_vmap_app_pane_screen(
				box,
				this.camera_zoom(),
				this.camera_shift(),
			)

			return {
				left: rect.left + 'px',
				top: rect.top + 'px',
				width: rect.width + 'px',
				height: rect.height + 'px',
			}
		}

		@ $mol_mem_key
		override frame_style( name: string ): { readonly [ prop: string ]: string } {

			const rect = this.part_box( name )
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
		 * Open under the node the pointer has been let INSIDE of, which is the second
		 * click on it and not the pick — see `entered`. Closed as well while the
		 * palette is carrying: that drag has no pointer capture and a release over
		 * the hole would fall into the frame.
		 */
		@ $mol_mem
		override overlay_style(): { readonly [ prop: string ]: string } {
			const rect = !this.carrying() && this.inside() ? this.frame_box() : null
			return { clipPath: this.$.$bog_vmap_app_pane_hole( rect ) }
		}

		override link_add( next?: $bog_vmap_app_pane_link_new | null ) {
			return next ?? null
		}

		override link_drop( next?: $bog_vmap_app_pane_link_end | null ) {
			return next ?? null
		}

		/** The source end of the wire in hand, or `null`. */
		@ $mol_mem
		wire_drag( next?: { from: string, from_prop: string, kind: $bog_vmap_app_inspect_value_kind } | null ) {
			return next ?? null
		}

		/** Where the loose end of the wire in hand is, in screen pixels. */
		@ $mol_mem
		wire_point( next?: readonly [ number, number ] ) {
			return next ?? [ 0, 0 ] as const
		}

		/** Row of a port among the wirable ports of the part's class; the first row when the class is unknown. */
		port_index( name: string, port: string ) {
			return Math.max( 0, this.part_ports( name ).findIndex( known => known.name === port ) )
		}

		/** Centre of a port dot on screen, or `null` while the part is not measured. */
		port_point( name: string, port: string, side: $bog_vmap_app_wire_side ) {
			const box = this.part_box( name )
			return box && $bog_vmap_app_wire_port_point( box, side, this.port_index( name, port ) )
		}

		/** Every wire whose both ends have a last known box. Labelled from `values()`. */
		@ $mol_mem
		override wire_lines(): readonly $bog_vmap_app_wire_line[] {

			const values = this.values()
			const lines = [] as $bog_vmap_app_wire_line[]

			for( const link of this.wires() ) {

				const from = this.port_point( link.from, link.from_prop, 'out' )
				const to = this.port_point( link.to, link.to_prop, 'in' )
				if( !from || !to ) continue

				const mid = $bog_vmap_app_wire_curve_mid( from, to )

				lines.push({
					key: `${ link.to }.${ link.to_prop }`,
					geometry: $bog_vmap_app_wire_curve( from, to ),
					label: String( values[ link.name ] ?? '' ),
					label_x: mid[0],
					label_y: mid[1],
				})

			}

			return lines
		}

		/**
		 * Dots to draw and to hit: both sides of the picked part, or, while a wire is
		 * in hand, the inputs of every other measured part, lit where the shape fits.
		 */
		@ $mol_mem
		override wire_dots(): readonly $bog_vmap_app_wire_dot[] {

			const linked = new Set( this.wires().map( link => `${ link.to }.${ link.to_prop }` ) )
			const dots = [] as $bog_vmap_app_wire_dot[]

			const add = (
				node: string,
				side: $bog_vmap_app_wire_side,
				lit: ( port: $bog_vmap_app_wire_port )=> boolean,
			)=> {

				const box = this.part_box( node )
				if( !box ) return

				this.part_ports( node ).forEach( ( port, index )=> {
					const [ x, y ] = $bog_vmap_app_wire_port_point( box, side, index )
					dots.push({
						node, port, side, x, y,
						lit: lit( port ),
						linked: side === 'in' && linked.has( `${ node }.${ port.name }` ),
					})
				} )

			}

			const drag = this.wire_drag()

			if( drag ) {
				for( const name of this.part_names() ) {
					if( name === drag.from ) continue
					add( name, 'in', port => $bog_vmap_app_wire_fits( drag.kind, port.kind ) )
				}
				return dots
			}

			const name = this.primary()
			if( name ) {
				add( name, 'in', ()=> true )
				add( name, 'out', ()=> true )
			}

			return dots
		}

		override wire_drag_geometry() {

			const drag = this.wire_drag()
			if( !drag ) return ''

			const from = this.port_point( drag.from, drag.from_prop, 'out' )
			if( !from ) return ''

			return $bog_vmap_app_wire_curve( from, this.wire_point() )
		}

		/**
		 * A press on a dot: an output starts a wire from it, a wired input unplugs
		 * its wire and carries on from the same source, a bare input takes the press
		 * and does nothing, so that it does not fall through to the canvas and drop
		 * the pick. `preventDefault` keeps `$mol_touch` from panning.
		 */
		wire_press( dot: $bog_vmap_app_wire_dot, event: PointerEvent ) {

			event.preventDefault()
			this.press = null

			let source = { from: dot.node, from_prop: dot.port.name, kind: dot.port.kind }

			if( dot.side === 'in' ) {

				const link = this.wires().find( link => link.to === dot.node && link.to_prop === dot.port.name )
				if( !link ) return

				const port = this.part_ports( link.from ).find( port => port.name === link.from_prop )
				source = { from: link.from, from_prop: link.from_prop, kind: port?.kind ?? 'null' }

				this.link_drop({ to: link.to, to_prop: link.to_prop })

			}

			this.wire_point( this.screen_point( event ) )
			this.wire_drag( source )

			try {
				this.Overlay().dom_node().setPointerCapture( event.pointerId )
			} catch {}

		}

		/** The loose end lands on a lit input, and the document gets the wire; anywhere else, nothing. */
		wire_release( event: PointerEvent ) {

			const drag = this.wire_drag()!
			const dot = $bog_vmap_app_wire_dot_at( this.wire_dots(), this.screen_point( event ) )

			this.wire_drag( null )

			try {
				this.Overlay().dom_node().releasePointerCapture( event.pointerId )
			} catch {}

			if( !dot || !dot.lit ) return

			this.link_add({ from: drag.from, from_prop: drag.from_prop, to: dot.node, to_prop: dot.port.name })

		}

		/**
		 * Names of the wires with an end on screen. Memoized on its content, so the
		 * push below fires when the set changes and not on every frame of a pan.
		 */
		@ $mol_mem
		wires_visible(): readonly string[] {

			const rect = this.pane_rect()
			const names = new Set< string >()

			for( const link of this.wires() ) {

				const from = this.port_point( link.from, link.from_prop, 'out' )
				const to = this.port_point( link.to, link.to_prop, 'in' )
				if( !from || !to ) continue

				if( Math.max( from[0], to[0] ) < 0 ) continue
				if( Math.max( from[1], to[1] ) < 0 ) continue
				if( Math.min( from[0], to[0] ) > rect.width ) continue
				if( Math.min( from[1], to[1] ) > rect.height ) continue

				names.add( link.name )

			}

			return [ ... names ]
		}

		/**
		 * Asks the scene for the values of the wires on screen. Not through `post()`:
		 * the scene answers an empty list with nothing, and the watchdog must not be
		 * armed by a question that owes no answer.
		 */
		@ $mol_mem
		values_push() {

			const target = this.target()
			const names = this.wires_visible()
			if( !target ) return names

			this.$.$bog_vmap_bridge_send( target, { kind: 'values_want', names } )

			return names
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
			this.poke_at = this.stamp()
		}

		/**
		 * The donor pack, named to the scene before anything else is.
		 *
		 * First of the pushes in `auto()` and first in the reads of `watchdog()`, and
		 * the order is load bearing rather than tidy: the scene refuses to compile
		 * until it has been told a pack, because a class picks its base once and a
		 * document built a moment early would inherit the sandbox's own `$mol_view`
		 * for good. Sending the document first would not break anything — the scene
		 * would simply hold it — but it would make the ordinary path the one that
		 * compiles twice.
		 */
		@ $mol_mem
		pack_push() {

			const target = this.target()
			const uri = this.pack_uri()
			if( !target ) return uri

			this.post( target, { kind: 'pack_set', uri } )

			return uri
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
		 * What is WRONG with the isolation of the scene, and empty when nothing is.
		 *
		 * The `sandbox` attribute proves nothing, an unreachable origin does: the
		 * scene is served from our own origin, so a SecurityError on reading it is
		 * the sandbox doing its job — the frame got an opaque origin. That is the
		 * ordinary state and it says nothing to anybody, so it says nothing at all.
		 * It used to report itself, which put a sentence about origins where the
		 * user expected news and made the plain «сцена на связи» unreachable.
		 *
		 * An origin that DOES read back is the news: the sandbox is off and the code
		 * of the document runs beside the editor. That goes to the error strip, not
		 * to the status line, because it is not a state of the work but a fault.
		 */
		@ $mol_mem
		override isolation() {

			if( !this.ready() ) return ''

			const peer = this.scene_peer()
			if( !peer ) return 'Кадра сцены нет — рисовать документ негде'

			try {
				const origin = peer.origin
				return `Песочница не работает: кадр сцены живёт на origin ${ origin }, то есть код документа исполняется наравне с редактором`
			} catch {
				return ''
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
			this.answer_at = this.stamp()
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

				const key = this.scene_key()
				this.handshake( key, this.handshake( key ) + 1 )
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
				this.error_node( at, message.node ?? '' )
				return
			}

			if( message.kind === 'values' ) {
				this.values( message.values )
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
				// The first read of this cell answers `null` by design, so that a
				// render does not force a reflow; every later read is the real box.
				// Read here for the same reason `$mol_touch` reads its own in `auto()`:
				// the gestures and the zoom need the box on their FIRST use, not their
				// second.
				this.view_rect(),
				this.message_listener(),
				// The pack goes before the document and the libraries: the scene
				// compiles nothing until it has one, see `pack_push()`.
				this.pack_push(),
				this.doc_push(),
				this.css_push(),
				this.libs_push(),
				this.spots_push(),
				this.camera_push(),
				this.values_push(),
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
		 * A ring per picked node, and nothing at all when nothing is picked.
		 *
		 * A node kept in the tree and merely hidden would still be a view to build,
		 * measure and keep alive, and an empty canvas is the common state.
		 */
		override sub() {
			return this.frames().map( name => this.Frame( name ) )
		}

	}

}
