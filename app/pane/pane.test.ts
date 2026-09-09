namespace $ {

	/**
	 * The gate over the scene: what a press, a move and a release do, without a
	 * browser. The pane is given a geometry and a fake peer window, and what is
	 * checked is what it picks, what it sends and when the watchdog is armed.
	 *
	 * `d` keeps `$` out of the string literals — mam builds its dependency graph by
	 * a regexp over sources, literals included.
	 */
	const d = '$'

	const root = `${d}doc`

	type sent = { kind: string, [ key: string ]: unknown }

	/**
	 * A pane with a scene that has said `ready`, a known rectangle and a listening
	 * peer. The clock is the test's own and moves only when the test says so, or a
	 * push and its answer could land on the same millisecond.
	 */
	const pane_make = (
		$: $mol_ambient_context,
		rect: Partial< $bog_vmap_app_pane_screen_box > = {},
		over: Partial< $$.$bog_vmap_app_pane > = {},
	) => {

		const posted = [] as sent[]

		const peer = {
			origin: 'null',
			postMessage( data: unknown ) { posted.push( data as sent ) },
		}

		const clock = { now: 1000 }

		const pane = $$.$bog_vmap_app_pane.make({
			$,
			doc_root: ()=> root,
			pane_rect: ()=> ({ left: 0, top: 0, width: 1000, height: 800, ... rect }),
			scene_peer: ()=> peer,
			now: ()=> clock.now,
			... over,
		})

		pane.handshake( pane.scene_key(), 1 )

		const answer = ( data: object )=> {
			clock.now ++
			pane.message_receive( { data: { ns: $bog_vmap_bridge_ns, ... data }, source: peer } as unknown as MessageEvent )
		}

		return { pane, peer, posted, clock, answer }
	}

	const box = ( x: number, y: number, width = 100, height = 50 ) => ({ x, y, width, height })

	const pointer = ( clientX: number, clientY: number, over: Partial< PointerEvent > = {} ) => ({
		button: 0,
		buttons: 1,
		pointerId: 1,
		clientX,
		clientY,
		altKey: false,
		ctrlKey: false,
		metaKey: false,
		shiftKey: false,
		preventDefault() {},
		... over,
	}) as unknown as PointerEvent

	const clicks = ( posted: sent[] ) => posted.filter( m => m.kind === 'click_at' )

	/** A timer that never fires by itself, so the test decides when time passes. */
	const timers_fake = ( $: $mol_ambient_context ) => {

		const made = [] as $mol_after_timeout[]

		$.$mol_after_timeout = class extends $mol_after_timeout {
			constructor( delay: number, task: ()=> void ) {
				super( delay, task )
				clearTimeout( this.id )
				made.push( this )
			}
		}

		return made
	}

	$mol_test({

		/**
		 * The first click picks and nothing else: the body of the node stays the
		 * editor's, to carry it by. The second one on the same node lets the pointer
		 * inside, and only then does the click go on to the live component, in world
		 * units, with the camera undone the same way the hit test undoes it.
		 */
		'the first click picks, the second lets the pointer in and relays it'( $ ) {

			const { pane, posted } = pane_make( $, { left: 10, top: 20 } )

			pane.camera_shift( new $mol_vector_2d( 100, 50 ) )
			pane.camera_zoom( 2 )

			pane.sizes_last = { [ `${root}/A` ]: box( 30, 40 ) }

			// World (50, 60) is screen 50*2+100+10, 60*2+50+20.
			pane.node_press( pointer( 210, 190 ) )
			pane.node_release( pointer( 210, 190, { buttons: 0 } ) )

			$mol_assert_equal( pane.primary(), 'A' )
			$mol_assert_equal( pane.inside(), false )
			$mol_assert_equal( clicks( posted ).length, 0 )

			pane.node_press( pointer( 210, 190 ) )
			pane.node_release( pointer( 210, 190, { buttons: 0 } ) )

			$mol_assert_equal( pane.inside(), true )

			const sent = clicks( posted )
			$mol_assert_equal( sent.length, 1 )
			$mol_assert_equal( sent[0].x, 50 )
			$mol_assert_equal( sent[0].y, 60 )

		},

		/** A pick of anything else closes the hole without anybody clearing it. */
		'picking another node puts the pointer back outside'( $ ) {

			const { pane } = pane_make( $ )

			pane.sizes_last = { [ `${root}/A` ]: box( 0, 0 ), [ `${root}/B` ]: box( 300, 0 ) }

			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 50, 25, { buttons: 0 } ) )
			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 50, 25, { buttons: 0 } ) )

			$mol_assert_equal( pane.inside(), true )

			pane.node_press( pointer( 350, 25 ) )
			pane.node_release( pointer( 350, 25, { buttons: 0 } ) )

			$mol_assert_equal( pane.primary(), 'B' )
			$mol_assert_equal( pane.inside(), false )
			$mol_assert_equal( pane.overlay_style().clipPath, 'none' )

			// And coming back to the first one starts from outside again: it is a
			// pick, not a return to where the pointer was left the time before.
			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 50, 25, { buttons: 0 } ) )

			$mol_assert_equal( pane.primary(), 'A' )
			$mol_assert_equal( pane.inside(), false )

		},

		'the modifiers travel with the click'( $ ) {

			const { pane, posted } = pane_make( $ )

			pane.sizes_last = { [ `${root}/A` ]: box( 0, 0 ) }

			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 50, 25, { buttons: 0 } ) )
			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 50, 25, { buttons: 0, shiftKey: true, metaKey: true } ) )

			$mol_assert_like( clicks( posted )[0].mods, { altKey: false, ctrlKey: false, metaKey: true, shiftKey: true } )

		},

		/** A gesture that went somewhere is a drag of the part, not a click. */
		'movement past the threshold moves the part and relays nothing'( $ ) {

			const { pane, posted } = pane_make( $ )

			pane.sizes_last = { [ `${root}/A` ]: box( 0, 0 ) }
			pane.spots({ A: { x: 0, y: 0 } })

			pane.node_press( pointer( 50, 25 ) )
			pane.node_move( pointer( 70, 25 ) )
			pane.node_release( pointer( 70, 25, { buttons: 0 } ) )

			$mol_assert_equal( pane.primary(), 'A' )
			$mol_assert_equal( pane.spots().A.x, 20 )
			$mol_assert_equal( pane.spots().A.y, 0 )
			$mol_assert_equal( clicks( posted ).length, 0 )

		},

		/** The overlay may miss the moves — a pan captures the pointer away — so the release is measured too. */
		'a release far from the press is not a click even without moves in between'( $ ) {

			const { pane, posted } = pane_make( $ )

			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 90, 25, { buttons: 0 } ) )

			$mol_assert_equal( clicks( posted ).length, 0 )

		},

		'a wobble within the threshold is still a click'( $ ) {

			const { pane, posted } = pane_make( $ )

			pane.sizes_last = { [ `${root}/A` ]: box( 0, 0 ) }

			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 50, 25, { buttons: 0 } ) )

			pane.node_press( pointer( 50, 25 ) )
			pane.node_move( pointer( 52, 27 ) )
			pane.node_release( pointer( 51, 26, { buttons: 0 } ) )

			$mol_assert_equal( clicks( posted ).length, 1 )

		},

		/**
		 * Bare canvas drops the pick and relays nothing: there is no node there to be
		 * let inside of, and a click sent anyway would give the focus to the frame —
		 * which is where the Delete of the editor stops arriving.
		 */
		'a click on bare canvas drops the selection and relays nothing'( $ ) {

			const { pane, posted } = pane_make( $ )

			pane.sizes_last = { [ `${root}/A` ]: box( 0, 0 ) }
			pane.picked([ 'A' ])

			pane.node_press( pointer( 500, 500 ) )
			pane.node_release( pointer( 500, 500, { buttons: 0 } ) )

			$mol_assert_equal( pane.primary(), null )
			$mol_assert_equal( clicks( posted ).length, 0 )

		},

		'nothing is relayed while the scene is not listening'( $ ) {

			const { pane, posted } = pane_make( $ )
			pane.handshake( pane.scene_key(), 0 )

			pane.node_press( pointer( 5, 5 ) )
			pane.node_release( pointer( 5, 5, { buttons: 0 } ) )

			$mol_assert_equal( posted.length, 0 )

		},

		/** The grip is a strip of screen pixels, so it does not shrink away when zooming out. */
		'the grip around a part is measured in screen pixels'( $ ) {

			const { pane } = pane_make( $ )

			pane.sizes_last = { [ `${root}/A` ]: box( 0, 0, 100, 100 ) }

			pane.camera_zoom( 1 )
			$mol_assert_equal( pane.node_at( [ 106, 50 ] ), 'A' )
			$mol_assert_equal( pane.node_at( [ 110, 50 ] ), null )

			// At zoom 1/4 the same strip is four times wider in world units.
			pane.camera_zoom( .25 )
			$mol_assert_equal( pane.node_at( [ 130, 50 ] ), 'A' )
			$mol_assert_equal( pane.node_at( [ 134, 50 ] ), null )

		},

		'the hole follows the picked part through the camera'( $ ) {

			const { pane } = pane_make( $ )

			pane.camera_shift( new $mol_vector_2d( 100, 50 ) )
			pane.camera_zoom( 2 )
			pane.sizes_last = { [ `${root}/A` ]: box( 30, 40, 100, 50 ) }

			$mol_assert_equal( pane.overlay_style().clipPath, 'none' )

			pane.picked([ 'A' ])

			// Picked and no more: the ring is drawn, the overlay is still whole.
			$mol_assert_equal( pane.overlay_style().clipPath, 'none' )
			$mol_assert_equal( pane.frame_showed(), true )

			pane.entered( 'A' )

			$mol_assert_like( pane.frame_box(), { left: 160, top: 130, width: 200, height: 100 } )
			$mol_assert_equal(
				pane.overlay_style().clipPath,
				'polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, 160px 130px, 360px 130px, 360px 230px, 160px 230px, 160px 130px)',
			)

			$mol_assert_like( pane.frame_style( 'A' ), { left: '160px', top: '130px', width: '200px', height: '100px' } )

		},

		/**
		 * The band takes what it OVERLAPS, and of a node and its container only the
		 * outer one: a child carried inside its parent must not be carried twice.
		 */
		'a band takes what it overlaps, containers and not their children'( $ ) {

			const { pane } = pane_make( $ )

			pane.sizes_last = {
				[ `${root}/A` ]: box( 0, 0, 100, 50 ),
				[ `${root}/Page` ]: box( 200, 0, 300, 200 ),
				[ `${root}/Page/B` ]: box( 200, 0, 100, 50 ),
			}

			// A sweep across the lot: the page comes, its child does not.
			pane.node_press( pointer( -10, -10, { ctrlKey: true } ) )
			pane.node_move( pointer( 600, 300, { ctrlKey: true } ) )
			pane.node_release( pointer( 600, 300, { ctrlKey: true, buttons: 0 } ) )

			$mol_assert_like( [ ... pane.picked() ], [ 'A', 'Page' ] )
			$mol_assert_equal( pane.band(), null )

			// A sweep that merely touches the corner of the first one still takes it.
			pane.node_press( pointer( 90, 40, { ctrlKey: true } ) )
			pane.node_move( pointer( 150, 100, { ctrlKey: true } ) )
			pane.node_release( pointer( 150, 100, { ctrlKey: true, buttons: 0 } ) )

			$mol_assert_like( [ ... pane.picked() ], [ 'A' ] )

		},

		/** A band puts the pointer back outside, wherever it ends. */
		'a band takes the pointer out of the node it was let into'( $ ) {

			const { pane } = pane_make( $ )

			pane.sizes_last = { [ `${root}/A` ]: box( 0, 0 ) }

			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 50, 25, { buttons: 0 } ) )
			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 50, 25, { buttons: 0 } ) )

			$mol_assert_equal( pane.inside(), true )

			// A sweep that ends up picking the very same node, and nothing else.
			pane.node_press( pointer( -10, -10, { ctrlKey: true } ) )
			pane.node_move( pointer( 150, 60, { ctrlKey: true } ) )
			pane.node_release( pointer( 150, 60, { ctrlKey: true, buttons: 0 } ) )

			$mol_assert_like( [ ... pane.picked() ], [ 'A' ] )
			$mol_assert_equal( pane.inside(), false )
			$mol_assert_equal( pane.overlay_style().clipPath, 'none' )

		},

		/** A modified click without a sweep takes nothing and clears nothing. */
		'a modified click leaves the picked set alone'( $ ) {

			const { pane } = pane_make( $ )

			pane.sizes_last = { [ `${root}/A` ]: box( 0, 0 ) }
			pane.picked([ 'A' ])

			pane.node_press( pointer( 500, 500, { ctrlKey: true } ) )
			pane.node_release( pointer( 500, 500, { ctrlKey: true, buttons: 0 } ) )

			$mol_assert_like( [ ... pane.picked() ], [ 'A' ] )
			$mol_assert_equal( pane.band(), null )

		},

		/** Everything picked travels by the same offset, each from its own start. */
		'a carry moves the whole picked set'( $ ) {

			const { pane } = pane_make( $ )

			pane.sizes_last = { [ `${root}/A` ]: box( 0, 0 ), [ `${root}/B` ]: box( 300, 0 ) }
			pane.spots({ A: { x: 0, y: 0 }, B: { x: 300, y: 0 } })
			pane.picked([ 'A', 'B' ])

			pane.node_press( pointer( 50, 25 ) )
			pane.node_move( pointer( 70, 45 ) )
			pane.node_release( pointer( 70, 45, { buttons: 0 } ) )

			$mol_assert_like( pane.spots(), { A: { x: 20, y: 20 }, B: { x: 320, y: 20 } } )

		},

		'the hole is closed while a drop from the palette is on'( $ ) {

			const { pane } = pane_make( $ )

			pane.sizes_last = { [ `${root}/A` ]: box( 0, 0 ) }
			pane.picked([ 'A' ])
			pane.entered( 'A' )
			pane.hole_allowed = ()=> false

			$mol_assert_equal( pane.overlay_style().clipPath, 'none' )
			// The ring itself stays: only the events stop going through.
			$mol_assert_equal( pane.frame_showed(), true )

		},

		'the hole geometry is pure arithmetic'( $ ) {

			$mol_assert_like(
				$bog_vmap_app_pane_screen( box( 10, 20, 30, 40 ), 2, [ 5, 7 ] ),
				{ left: 25, top: 47, width: 60, height: 80 },
			)

			$mol_assert_equal( $bog_vmap_app_pane_hole( null ), 'none' )

			$mol_assert_equal(
				$bog_vmap_app_pane_hole( { left: 1, top: 2, width: 3, height: 4 } ),
				'polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, 1px 2px, 4px 2px, 4px 6px, 1px 6px, 1px 2px)',
			)

		},

		/**
		 * THE PULSE HAS NO MODE. It runs as soon as the scene has proved itself and
		 * the bridge is up, asks once, and asks again only after an answer.
		 */
		'the heartbeat pings once warmed and re-arms on the pong'( $ ) {

			const timers = timers_fake( $ )
			const { pane, posted, clock, answer } = pane_make( $ )

			// Not warmed: no baseline, no pulse.
			$mol_assert_equal( pane.heartbeat(), null )

			pane.warmed( true )

			// The first read of the watch pushes everything to the fresh scene; let
			// the scene answer, so that what follows is about the pulse alone.
			pane.watchdog()
			answer({ kind: 'sizes', sizes: {} })
			$mol_assert_equal( pane.watchdog(), null )

			const first = pane.heartbeat()
			$mol_assert_equal( first, timers[ timers.length - 1 ] )

			clock.now ++
			first!.task()

			const pings = posted.filter( m => m.kind === 'ping' )
			$mol_assert_equal( pings.length, 1 )
			$mol_assert_equal( pings[0].nonce, 1 )

			// The ping is a question: the watchdog is armed by it.
			$mol_assert_equal( pane.watchdog() !== null, true )

			answer({ kind: 'pong', nonce: 1 })

			// Answered: disarmed, and the next ping is scheduled.
			$mol_assert_equal( pane.watchdog(), null )
			$mol_assert_equal( pane.heartbeat() !== first, true )

		},

		'a silent scene is called stalled when the limit runs out'( $ ) {

			const timers = timers_fake( $ )
			const { pane, clock } = pane_make( $ )

			pane.warmed( true )
			clock.now ++
			pane.heartbeat()!.task()

			const watch = pane.watchdog()
			$mol_assert_equal( watch, timers[ timers.length - 1 ] )
			$mol_assert_equal( watch!.delay, pane.answer_limit() )

			$mol_assert_equal( pane.stalled(), false )
			watch!.task()
			$mol_assert_equal( pane.stalled(), true )

		},

		/**
		 * The button on the strip: a new frame element, the accusation withdrawn,
		 * nothing sent until the new scene says `ready`, then everything re-sent.
		 */
		'scene_restart gives a fresh frame and clears stalled'( $ ) {

			timers_fake( $ )
			const { pane, posted, answer } = pane_make( $ )

			pane.warmed( true )
			pane.watchdog()
			answer({ kind: 'sizes', sizes: {} })

			const frame_before = pane.sub()[0]
			$mol_assert_equal( frame_before, pane.Scene( pane.scene_key() ) )

			pane.stalled( true )
			posted.length = 0

			pane.scene_restart()

			$mol_assert_equal( pane.stalled(), false )
			$mol_assert_equal( pane.ready(), false )
			$mol_assert_equal( pane.warmed(), false )
			$mol_assert_equal( pane.sub()[0] !== frame_before, true )
			$mol_assert_equal( pane.sub()[0], pane.Scene( pane.scene_key() ) )
			$mol_assert_equal( pane.sub().length, 3 )

			// a frame that has not spoken gets nothing and is accused of nothing
			$mol_assert_equal( pane.watchdog(), null )
			$mol_assert_equal( pane.heartbeat(), null )
			$mol_assert_equal( posted.length, 0 )

			answer({ kind: 'ready' })
			pane.watchdog()

			$mol_assert_equal( pane.ready(), true )
			$mol_assert_like(
				posted.map( m => m.kind ),
				// the pack first: the scene compiles nothing until it has one
				[ 'pack_set', 'doc_set', 'css_set', 'libs_set', 'spots_set', 'camera_set' ],
			)

		},

		/**
		 * The frame is isolated and has no address, and the ORDER of the two says so.
		 *
		 * `$mol_dom_render_attributes` writes the dictionary in key order, so a frame
		 * that got its source before its sandbox is already loading unsandboxed —
		 * with the attribute present in the DOM and the audit green. Reading the
		 * dictionary is therefore the check, not reading the element.
		 */
		'the frame is sandboxed first, addressed never and raised from markup'( $ ) {

			const { pane } = pane_make( $, {}, { scene_bundle: ()=> 'https://vmap.test/scene/web.js' } )

			// read as entries and not by property name: dropping the attribute would
			// then be a type error and the build would stop before this ever ran,
			// leaving the last green bundle in place to be tested instead
			const attr = pane.Scene( pane.scene_key() ).attr()
			const entries = Object.entries( attr )
			const keys = entries.map( ( [ name ] )=> name )

			$mol_assert_equal( keys[0], 'sandbox' )
			$mol_assert_equal( entries[0][1], 'allow-scripts' )

			// `null` is removal. An empty `src` would load the page we stand on.
			$mol_assert_equal( attr.src, null )
			$mol_assert_ok( keys.indexOf( 'srcdoc' ) > 0 )

			const html = String( attr.srcdoc )
			$mol_assert_ok( html.includes( 'src="https://vmap.test/scene/web.js"' ) )
			$mol_assert_ok( html.includes( 'color-scheme:dark' ) )

		},

		/**
		 * One pack per realm, held by the key of the frame now that no address holds
		 * it: the pack is IN the key, so naming another one addresses another frame.
		 * That the element really is replaced when a person types a pack is
		 * `flow.test.ts`, where the whole chain from the field down is real.
		 *
		 * The pack also goes out first, before the document and the libraries: the
		 * scene refuses to compile until it has one.
		 * @see ../../ARCHITECTURE.md section 5
		 */
		'the pack keys the frame and goes down the wire first'( $ ) {

			const one = pane_make( $, {}, { pack_uri: ()=> 'https://one.test/web.js' } )
			const two = pane_make( $, {}, { pack_uri: ()=> 'https://two.test/web.js' } )

			one.pane.watchdog()

			$mol_assert_equal( one.posted[0]?.kind, 'pack_set' )
			$mol_assert_equal( one.posted[0]?.uri, 'https://one.test/web.js' )

			$mol_assert_ok( one.pane.scene_key() !== two.pane.scene_key() )
			$mol_assert_ok( one.pane.scene_key().includes( 'https://one.test/web.js' ) )

			// same generation, different pack, different frame
			$mol_assert_equal( one.pane.scene_generation(), two.pane.scene_generation() )
			$mol_assert_ok( one.pane.sub()[0] !== two.pane.sub()[0] )

		},

		/** A click is a push like any other: it arms the watch, and geometry back disarms it. */
		'a relayed click arms the watchdog and sizes disarm it'( $ ) {

			timers_fake( $ )
			const { pane, clock, answer } = pane_make( $ )

			pane.sizes_last = { [ `${root}/A` ]: box( 0, 0 ) }
			pane.warmed( true )

			// The first read pushes the document and the rest; answered, the watch rests.
			pane.watchdog()
			answer({ kind: 'sizes', sizes: {} })
			$mol_assert_equal( pane.watchdog(), null )

			clock.now ++

			// Twice: the click that goes to the scene is the one that lets the
			// pointer inside, and the watch is armed by what is sent, not by a pick.
			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 50, 25, { buttons: 0 } ) )
			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 50, 25, { buttons: 0 } ) )

			$mol_assert_equal( pane.watchdog() !== null, true )

			answer({ kind: 'sizes', sizes: {} })

			$mol_assert_equal( pane.watchdog(), null )

		},

		/** Not warmed yet, the pulse is quiet and the watch is off, whatever was pushed. */
		'before the first sizes nothing is asked and nothing is accused'( $ ) {

			timers_fake( $ )
			const { pane } = pane_make( $ )

			pane.node_press( pointer( 5, 5 ) )
			pane.node_release( pointer( 5, 5, { buttons: 0 } ) )

			$mol_assert_equal( pane.heartbeat(), null )
			$mol_assert_equal( pane.watchdog(), null )

		},

		/**
		 * THE WIRE GESTURE. Camera panned and zoomed, so screen and world differ:
		 * a drag from the output dot of one part to the input dot of another puts
		 * exactly two lines into the document, and the click channel stays quiet.
		 */
		'a drag from an output to a fitting input writes exactly two lines'( $ ) {

			const { pane, node, posted } = wired_make( $ )

			pane.camera_shift( new $mol_vector_2d( 100, 50 ) )
			pane.camera_zoom( 2 )

			// Calc at world (0,0) is screen (100,50) 200×100; Map at world (300,0) is screen (700,50).
			pane.sizes_last = { [ `${root}/Calc` ]: box( 0, 0 ), [ `${root}/Map` ]: box( 300, 0 ) }
			pane.picked([ 'Calc' ])

			const before = node.source()

			// Output `result` is the first row: right of the box by the gap, half a row down.
			pane.node_press( pointer( 312, 57 ) )

			$mol_assert_like( pane.wire_drag(), { from: 'Calc', from_prop: 'result', kind: 'number' } )
			$mol_assert_equal( pane.primary(), 'Calc' )

			pane.node_move( pointer( 600, 100 ) )

			// In hand: the inputs of the other part, the number one lit, the string one not.
			$mol_assert_like(
				pane.wire_dots().map( dot => [ dot.node, dot.port.name, dot.side, dot.x, dot.y, dot.lit ] ),
				[ [ 'Map', 'zoom', 'in', 688, 57, true ], [ 'Map', 'marker', 'in', 688, 71, false ] ],
			)
			$mol_assert_equal( pane.wire_drag_geometry().startsWith( 'M 312 57 C' ), true )

			pane.node_release( pointer( 688, 57, { buttons: 0 } ) )

			$mol_assert_equal( pane.wire_drag(), null )

			// Two facts in the text: the wire at class level and the reference in the
			// target's declaration, the latter serialized on the declaration's own line.
			$mol_assert_equal( node.source().split( '\n' ).length, before.split( '\n' ).length + 1 )
			$mol_assert_equal( node.source().includes( '\tcalc_result = Calc result\n' ), true )
			$mol_assert_equal( node.source().includes( 'zoom <= calc_result\n' ), true )
			$mol_assert_like( node.wires(), [ { name: 'calc_result', node: 'Calc', prop: 'result', bidi: false } ] )
			$mol_assert_like( node.links().map( link => [ link.from, link.from_prop, link.to, link.to_prop ] ), [ [ 'Calc', 'result', 'Map', 'zoom' ] ] )

			$mol_assert_equal( clicks( posted ).length, 0 )

			// Drawn from the same numbers the dots were.
			$mol_assert_equal( pane.wire_lines().length, 1 )
			$mol_assert_equal( pane.wire_lines()[0].geometry.startsWith( 'M 312 57 C' ), true )
			$mol_assert_equal( pane.wire_lines()[0].geometry.endsWith( ', 688 57' ), true )
			$mol_assert_equal( pane.wire_dots().find( dot => dot.port.name === 'zoom' )?.linked, undefined )

			pane.picked([ 'Map' ])
			$mol_assert_equal( pane.wire_dots().find( dot => dot.port.name === 'zoom' && dot.side === 'in' )?.linked, true )

		},

		'a drag let go over nothing, or over an input of the wrong shape, writes nothing'( $ ) {

			const { pane, node } = wired_make( $ )

			pane.sizes_last = { [ `${root}/Calc` ]: box( 0, 0 ), [ `${root}/Map` ]: box( 300, 0 ) }
			pane.picked([ 'Calc' ])

			const before = node.source()

			pane.node_press( pointer( 112, 7 ) )
			pane.node_move( pointer( 200, 200 ) )
			pane.node_release( pointer( 200, 200, { buttons: 0 } ) )

			$mol_assert_equal( node.source(), before )
			$mol_assert_equal( pane.wire_drag(), null )

			// `marker` is a string, the wire carries a number: the dot is there, unlit, and takes nothing.
			pane.node_press( pointer( 112, 7 ) )
			pane.node_release( pointer( 288, 21, { buttons: 0 } ) )

			$mol_assert_equal( node.source(), before )

		},

		/** A dot sits on the grip strip of its part, and the wire is the finer target: no part is carried. */
		'a press on a dot is a wire even where the part would also be hit'( $ ) {

			const { pane } = wired_make( $ )

			pane.camera_zoom( .5 )
			pane.sizes_last = { [ `${root}/Calc` ]: box( 0, 0 ) }
			pane.picked([ 'Calc' ])

			// Box is 50 wide on screen, the dot at 62, the grip strip reaches 8 px past 50.
			pane.node_press( pointer( 62, 7 ) )

			$mol_assert_equal( pane.wire_drag() !== null, true )
			$mol_assert_equal( pane.drag, null )

			pane.node_release( pointer( 62, 7, { buttons: 0 } ) )

		},

		/** Pressing a wired input unplugs it at once and leaves the wire in hand from the same source. */
		'a press on a wired input unplugs it and carries on from its source'( $ ) {

			const { pane, node } = wired_make( $ )

			pane.sizes_last = { [ `${root}/Calc` ]: box( 0, 0 ), [ `${root}/Map` ]: box( 300, 0 ) }

			const before = node.source()
			node.link_add({ from: 'Calc', from_prop: 'result', to: 'Map', to_prop: 'zoom' })

			pane.picked([ 'Map' ])
			pane.node_press( pointer( 288, 7 ) )

			$mol_assert_equal( node.source(), before )
			$mol_assert_like( pane.wire_drag(), { from: 'Calc', from_prop: 'result', kind: 'number' } )

			// Let go over nothing: it stays unplugged.
			pane.node_release( pointer( 500, 500, { buttons: 0 } ) )
			$mol_assert_equal( node.source(), before )
			$mol_assert_equal( node.links().length, 0 )

			// The same again, put back where it was: the same two lines.
			node.link_add({ from: 'Calc', from_prop: 'result', to: 'Map', to_prop: 'zoom' })
			const wired = node.source()

			pane.node_press( pointer( 288, 7 ) )
			pane.node_release( pointer( 288, 7, { buttons: 0 } ) )

			$mol_assert_equal( node.source(), wired )

		},

		/**
		 * SECOND INVARIANT OF CULLING, seen from the wires: a part that left the
		 * viewport is missing from the next report, and its wire keeps its last end.
		 */
		'a wire is drawn from the last known box when one end is no longer reported'( $ ) {

			const { pane, node, answer } = wired_make( $ )

			node.link_add({ from: 'Calc', from_prop: 'result', to: 'Map', to_prop: 'zoom' })

			// One end never measured: nothing to draw yet.
			answer({ kind: 'sizes', sizes: { [ `${root}/Calc` ]: box( 0, 0 ) } })
			$mol_assert_equal( pane.wire_lines().length, 0 )

			answer({ kind: 'sizes', sizes: { [ `${root}/Map` ]: box( 300, 0 ) } })
			const drawn = pane.wire_lines()
			$mol_assert_equal( drawn.length, 1 )

			// Map culled, Calc moved: the wire follows the one and keeps the other.
			answer({ kind: 'sizes', sizes: { [ `${root}/Calc` ]: box( 0, 100 ) } })
			$mol_assert_equal( pane.wire_lines().length, 1 )
			$mol_assert_equal( pane.wire_lines()[0].geometry.startsWith( 'M 112 107 C' ), true )
			$mol_assert_equal( pane.wire_lines()[0].geometry.endsWith( ', 288 7' ), true )

		},

		/** The scene is asked for the wires on screen, and only for those, and asked again only when the set changes. */
		'values_want names the visible wires only'( $ ) {

			const { pane, node, posted } = wired_make( $, [
				`Calc ${d}my_calc`, `Map ${d}my_map`, `Calc_2 ${d}my_calc`, `Map_2 ${d}my_map`,
			] )

			node.link_add({ from: 'Calc', from_prop: 'result', to: 'Map', to_prop: 'zoom' })
			node.link_add({ from: 'Calc_2', from_prop: 'result', to: 'Map_2', to_prop: 'zoom' })

			pane.sizes_last = {
				[ `${root}/Calc` ]: box( 0, 0 ),
				[ `${root}/Map` ]: box( 300, 0 ),
				[ `${root}/Calc_2` ]: box( 5000, 5000 ),
				[ `${root}/Map_2` ]: box( 5300, 5000 ),
			}
			pane.sizes_version( pane.sizes_version() + 1 )

			const wants = ()=> posted.filter( m => m.kind === 'values_want' ).map( m => m.names )

			pane.values_push()
			$mol_assert_like( wants(), [ [ 'calc_result' ] ] )

			// A pan that keeps the same wire on screen asks nothing new.
			pane.camera_shift( new $mol_vector_2d( 10, 10 ) )
			pane.values_push()
			$mol_assert_equal( wants().length, 1 )

			// Over to the far pair.
			pane.camera_shift( new $mol_vector_2d( -5000, -5000 ) )
			pane.values_push()
			$mol_assert_like( wants(), [ [ 'calc_result' ], [ 'calc_2_result' ] ] )

			// The answer lands on the wire as its label.
			$mol_assert_equal( pane.wire_lines().find( line => line.key === 'Map_2.zoom' )?.label, '' )
			pane.message_receive( { data: { ns: $bog_vmap_bridge_ns, kind: 'values', values: { calc_2_result: '42' } }, source: pane.scene_peer() } as unknown as MessageEvent )
			$mol_assert_equal( pane.wire_lines().find( line => line.key === 'Map_2.zoom' )?.label, '42' )

			// A question that owes no answer must not arm the watch.
			$mol_assert_equal( pane.watchdog(), null )

		},

		/**
		 * Inside an artboard the deepest node wins, or a page would swallow every
		 * pick made on it: everything laid out inside it lies within its box.
		 */
		'the pick goes to the deepest node under the point'( $ ) {

			const { pane } = pane_make( $ )

			pane.sizes_last = {
				[ `${root}/Board` ]: box( 0, 0, 400, 300 ),
				[ `${root}/Board/Head` ]: box( 0, 0, 400, 100 ),
				[ `${root}/Loose` ]: box( 600, 0, 100, 50 ),
			}

			$mol_assert_equal( pane.node_at( [ 200, 50 ] ), 'Head' )
			$mol_assert_equal( pane.node_at( [ 200, 200 ] ), 'Board' )
			$mol_assert_equal( pane.node_at( [ 650, 25 ] ), 'Loose' )
			$mol_assert_equal( pane.node_at( [ 900, 400 ] ), null )

			// The box of a node is found at whatever depth it is drawn.
			$mol_assert_like( pane.part_size( 'Head' ), box( 0, 0, 400, 100 ) )
			$mol_assert_like( pane.node_path( 'Head' ), [ 'Board' ] )
			$mol_assert_like( pane.node_path( 'Loose' ), [] )

		},

		/**
		 * The camera is undone once, by `world_point`, and everything downstream
		 * works in world units — the hit test, the container and the position among
		 * its children alike.
		 */
		'a pan and a zoom do not move the slot a drop lands in'( $ ) {

			const { pane } = pane_make( $, {}, { containers: ()=> [ 'Board' ] } )

			pane.sizes_last = {
				[ `${root}/Board` ]: box( 0, 0, 400, 300 ),
				[ `${root}/Board/Head` ]: box( 0, 0, 400, 100 ),
				[ `${root}/Board/Foot` ]: box( 0, 100, 400, 100 ),
			}

			const world = [ 200, 120 ] as const
			const flat = pane.insert_slot( world )!

			$mol_assert_equal( flat.owner, 'Board' )
			$mol_assert_equal( flat.index, 1 )

			// The same world point through a moved and scaled camera: screen is
			// `world * zoom + shift`, and the press is given in screen pixels.
			pane.camera_shift( new $mol_vector_2d( 100, 50 ) )
			pane.camera_zoom( 2 )

			const point = pane.world_point( pointer( 200 * 2 + 100, 120 * 2 + 50 ) )
			$mol_assert_like( [ ... point ], [ ... world ] )
			$mol_assert_like( pane.insert_slot( point ), flat )

		},

		/**
		 * The two ways of laying a node out, told apart by where the release
		 * happened: inside an artboard the gesture means a position in the tree, on
		 * bare canvas it means a coordinate.
		 */
		'a drop inside an artboard goes into the tree, and no coordinate is written'( $ ) {

			const moves = [] as ( $$.$bog_vmap_app_pane_tree_move | null )[]

			const { pane } = pane_make( $, {}, {
				containers: ()=> [ 'Board' ],
				tree_move: ( next?: $$.$bog_vmap_app_pane_tree_move | null )=> {
					if( next ) moves.push( next )
					return next ?? null
				},
			} )

			pane.sizes_last = {
				[ `${root}/Board` ]: box( 0, 0, 400, 300 ),
				[ `${root}/Board/Head` ]: box( 0, 0, 400, 100 ),
				[ `${root}/Loose` ]: box( 600, 0, 100, 50 ),
			}

			pane.spots({ Loose: { x: 600, y: 0 } })

			pane.node_press( pointer( 650, 25 ) )
			pane.node_move( pointer( 200, 120 ) )

			// The line is drawn where the node would land, and the placement is
			// untouched while the pointer is over the page.
			$mol_assert_equal( pane.slot()?.owner, 'Board' )
			$mol_assert_equal( pane.slot()?.index, 1 )
			$mol_assert_like( pane.spots(), { Loose: { x: 600, y: 0 } } )

			pane.node_release( pointer( 200, 120, { buttons: 0 } ) )

			$mol_assert_like( moves, [ { name: 'Loose', owner: 'Board', index: 1 } ] )
			$mol_assert_equal( pane.slot(), null )
			$mol_assert_like( pane.spots(), { Loose: { x: 600, y: 0 } } )

		},

		'a drop on bare canvas still writes a coordinate and asks for no move'( $ ) {

			const moves = [] as ( $$.$bog_vmap_app_pane_tree_move | null )[]

			const { pane } = pane_make( $, {}, {
				containers: ()=> [ 'Board' ],
				tree_move: ( next?: $$.$bog_vmap_app_pane_tree_move | null )=> {
					if( next ) moves.push( next )
					return next ?? null
				},
			} )

			pane.sizes_last = {
				[ `${root}/Board` ]: box( 0, 0, 400, 300 ),
				[ `${root}/Loose` ]: box( 600, 0, 100, 50 ),
			}

			pane.spots({ Loose: { x: 600, y: 0 } })

			pane.node_press( pointer( 650, 25 ) )
			pane.node_move( pointer( 750, 125 ) )
			pane.node_release( pointer( 750, 125, { buttons: 0 } ) )

			$mol_assert_like( pane.spots(), { Loose: { x: 700, y: 100 } } )
			$mol_assert_like( moves, [] )
			$mol_assert_equal( pane.slot(), null )

		},

		/**
		 * A node drawn inside an artboard has no coordinate to change: `spots`
		 * positions the direct children of the root and nothing else, so a number
		 * written for it would move nothing and lie in the desk layout for good.
		 */
		'dragging a node that lives in a tree never writes a coordinate'( $ ) {

			const moves = [] as ( $$.$bog_vmap_app_pane_tree_move | null )[]

			const { pane } = pane_make( $, {}, {
				containers: ()=> [ 'Board' ],
				tree_move: ( next?: $$.$bog_vmap_app_pane_tree_move | null )=> {
					if( next ) moves.push( next )
					return next ?? null
				},
			} )

			pane.sizes_last = {
				[ `${root}/Board` ]: box( 0, 0, 400, 300 ),
				[ `${root}/Board/Head` ]: box( 0, 0, 400, 100 ),
				[ `${root}/Board/Foot` ]: box( 0, 100, 400, 100 ),
			}

			// Head taken by its own strip and carried below Foot.
			pane.node_press( pointer( 200, 50 ) )
			pane.node_move( pointer( 200, 180 ) )
			pane.node_release( pointer( 200, 180, { buttons: 0 } ) )

			$mol_assert_like( pane.spots(), {} )
			$mol_assert_like( moves, [ { name: 'Head', owner: 'Board', index: 2 } ] )

		},

		/**
		 * A row inside a column: the drop belongs to the innermost box it landed in,
		 * and the position in it is counted along ITS direction, not its parent's.
		 */
		'a container inside a container takes the drop itself'( $ ) {

			const { pane } = pane_make( $, {}, {
				containers: ()=> [ 'Page', 'Bar' ],
				axis: ( name: string )=> name === 'Bar' ? 'row' : 'column',
			} )

			pane.sizes_last = {
				[ `${root}/Page` ]: box( 0, 0, 400, 600 ),
				[ `${root}/Page/Head` ]: box( 0, 0, 400, 100 ),
				[ `${root}/Page/Bar` ]: box( 0, 100, 400, 100 ),
				[ `${root}/Page/Bar/Left` ]: box( 0, 100, 200, 100 ),
				[ `${root}/Page/Bar/Right` ]: box( 200, 100, 200, 100 ),
				[ `${root}/Page/Foot` ]: box( 0, 200, 400, 100 ),
			}

			// Inside the bar, which lies inside the page: the deeper one wins.
			const inner = pane.insert_slot( [ 250, 150 ] )!
			$mol_assert_equal( inner.owner, 'Bar' )
			$mol_assert_equal( inner.index, 1 )

			// Between the left and the right, across — the direction of the bar.
			$mol_assert_like( inner.line, { x: 200, y: 100, width: 0, height: 100 } )

			// The same page, below the bar: the page takes it, counted downwards.
			const outer = pane.insert_slot( [ 250, 400 ] )!
			$mol_assert_equal( outer.owner, 'Page' )
			$mol_assert_equal( outer.index, 3 )

			// The pick follows the same rule, so what is picked and what a drop goes
			// into never disagree about which box the pointer is in.
			$mol_assert_equal( pane.node_at( [ 250, 150 ] ), 'Right' )

		},

		/**
		 * A container cannot become its own descendant, and a line drawn where the
		 * drop would be refused is worse than no line at all.
		 */
		'an artboard carried over itself offers no slot'( $ ) {

			const { pane } = pane_make( $, {}, { containers: ()=> [ 'Board', 'Inner' ] } )

			pane.sizes_last = {
				[ `${root}/Board` ]: box( 0, 0, 400, 300 ),
				[ `${root}/Board/Inner` ]: box( 0, 0, 400, 100 ),
			}

			$mol_assert_equal( pane.insert_slot( [ 200, 50 ], 'Board' ), null )
			$mol_assert_equal( pane.insert_slot( [ 200, 50 ], 'Inner' )?.owner, 'Board' )

		},

	})

	/** Wirable ports of the two fixture classes, as the owner would hand them to the pane. */
	const ports: { readonly [ klass: string ]: readonly $bog_vmap_app_wire_port[] } = {
		[ `${d}my_calc` ]: [
			{ name: 'result', next: false, kind: 'number' },
			{ name: 'op', next: true, kind: 'string' },
		],
		[ `${d}my_map` ]: [
			{ name: 'zoom', next: true, kind: 'number' },
			{ name: 'marker', next: true, kind: 'string' },
		],
	}

	/**
	 * A pane over a real document model: two parts, no wires yet. The pane reads
	 * the wires and the ports through the same three properties the owner binds,
	 * and writes through the same two events, so what is checked is the document.
	 */
	function wired_make(
		$: $mol_ambient_context,
		parts = [ `Calc ${d}my_calc`, `Map ${d}my_map` ],
	) {

		const node = $bog_vmap_lang_node.make({ $ })
		node.source( [ `${root} ${d}mol_view`, ... parts.map( part => '\t' + part ), '\tsub /', '' ].join( '\n' ) )

		// To the fixed point of normalization, so that a write and its undo give the same bytes.
		node.tree( node.tree() )

		const klass_of = ( name: string )=> node.props_tree().select( name ).kids[0]?.kids[0]?.type ?? ''

		const made = pane_make( $, {}, {
			wires: ()=> node.links(),
			part_ports: ( name: string )=> ports[ klass_of( name ) ] ?? [],
			link_add: ( next?: $$.$bog_vmap_app_pane_link_new | null )=> {
				if( next ) node.link_add( next )
				return next ?? null
			},
			link_drop: ( next?: $$.$bog_vmap_app_pane_link_end | null )=> {
				if( next ) node.link_drop( next.to, next.to_prop )
				return next ?? null
			},
		} )

		return { ... made, node }
	}

}
