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

		pane.handshake( 1 )

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
		 * One click both picks and presses. The point goes out in world units, with
		 * the camera undone the same way the hit test undoes it.
		 */
		'a press and a release without movement pick the part and relay one click'( $ ) {

			const { pane, posted } = pane_make( $, { left: 10, top: 20 } )

			pane.camera_shift( new $mol_vector_2d( 100, 50 ) )
			pane.camera_zoom( 2 )

			pane.sizes_last = { [ `${root}/A` ]: box( 30, 40 ) }

			// World (50, 60) is screen 50*2+100+10, 60*2+50+20.
			pane.node_press( pointer( 210, 190 ) )
			pane.node_release( pointer( 210, 190, { buttons: 0 } ) )

			$mol_assert_equal( pane.selected(), 'A' )

			const sent = clicks( posted )
			$mol_assert_equal( sent.length, 1 )
			$mol_assert_equal( sent[0].x, 50 )
			$mol_assert_equal( sent[0].y, 60 )

		},

		'the modifiers travel with the click'( $ ) {

			const { pane, posted } = pane_make( $ )

			pane.node_press( pointer( 5, 5 ) )
			pane.node_release( pointer( 5, 5, { buttons: 0, shiftKey: true, metaKey: true } ) )

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

			$mol_assert_equal( pane.selected(), 'A' )
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

			pane.node_press( pointer( 50, 25 ) )
			pane.node_move( pointer( 52, 27 ) )
			pane.node_release( pointer( 51, 26, { buttons: 0 } ) )

			$mol_assert_equal( clicks( posted ).length, 1 )

		},

		/** The scene may well have something clickable on bare canvas, so the click goes out anyway. */
		'a click on bare canvas drops the selection and is still relayed'( $ ) {

			const { pane, posted } = pane_make( $ )

			pane.sizes_last = { [ `${root}/A` ]: box( 0, 0 ) }
			pane.selected( 'A' )

			pane.node_press( pointer( 500, 500 ) )
			pane.node_release( pointer( 500, 500, { buttons: 0 } ) )

			$mol_assert_equal( pane.selected(), null )

			const sent = clicks( posted )
			$mol_assert_equal( sent.length, 1 )
			$mol_assert_equal( sent[0].x, 500 )
			$mol_assert_equal( sent[0].y, 500 )

		},

		'nothing is relayed while the scene is not listening'( $ ) {

			const { pane, posted } = pane_make( $ )
			pane.handshake( 0 )

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

			pane.selected( 'A' )

			$mol_assert_like( pane.frame_box(), { left: 160, top: 130, width: 200, height: 100 } )
			$mol_assert_equal(
				pane.overlay_style().clipPath,
				'polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, 160px 130px, 360px 130px, 360px 230px, 160px 230px, 160px 130px)',
			)

			$mol_assert_like( pane.frame_style(), { left: '160px', top: '130px', width: '200px', height: '100px' } )

		},

		'the hole is closed while a drop from the palette is on'( $ ) {

			const { pane } = pane_make( $ )

			pane.sizes_last = { [ `${root}/A` ]: box( 0, 0 ) }
			pane.selected( 'A' )
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
			$mol_assert_equal( frame_before, pane.Scene( pane.scene_generation() ) )

			pane.stalled( true )
			posted.length = 0

			pane.scene_restart()

			$mol_assert_equal( pane.stalled(), false )
			$mol_assert_equal( pane.ready(), false )
			$mol_assert_equal( pane.warmed(), false )
			$mol_assert_equal( pane.sub()[0] !== frame_before, true )
			$mol_assert_equal( pane.sub()[0], pane.Scene( pane.scene_generation() ) )
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
				[ 'doc_set', 'css_set', 'libs_set', 'spots_set', 'camera_set' ],
			)

		},

		/** A click is a push like any other: it arms the watch, and geometry back disarms it. */
		'a relayed click arms the watchdog and sizes disarm it'( $ ) {

			timers_fake( $ )
			const { pane, clock, answer } = pane_make( $ )

			pane.warmed( true )

			// The first read pushes the document and the rest; answered, the watch rests.
			pane.watchdog()
			answer({ kind: 'sizes', sizes: {} })
			$mol_assert_equal( pane.watchdog(), null )

			clock.now ++
			pane.node_press( pointer( 5, 5 ) )
			pane.node_release( pointer( 5, 5, { buttons: 0 } ) )

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
			pane.selected( 'Calc' )

			const before = node.source()

			// Output `result` is the first row: right of the box by the gap, half a row down.
			pane.node_press( pointer( 312, 57 ) )

			$mol_assert_like( pane.wire_drag(), { from: 'Calc', from_prop: 'result', kind: 'number' } )
			$mol_assert_equal( pane.selected(), 'Calc' )

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

			pane.selected( 'Map' )
			$mol_assert_equal( pane.wire_dots().find( dot => dot.port.name === 'zoom' && dot.side === 'in' )?.linked, true )

		},

		'a drag let go over nothing, or over an input of the wrong shape, writes nothing'( $ ) {

			const { pane, node } = wired_make( $ )

			pane.sizes_last = { [ `${root}/Calc` ]: box( 0, 0 ), [ `${root}/Map` ]: box( 300, 0 ) }
			pane.selected( 'Calc' )

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
			pane.selected( 'Calc' )

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

			pane.selected( 'Map' )
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
