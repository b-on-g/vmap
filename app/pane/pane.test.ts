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

	const calc = `${d}flow_calc`
	const map = `${d}flow_map`

	type sent = { kind: string, [ key: string ]: unknown }

	/**
	 * A pane with a scene that has said `ready`, a known rectangle and a listening
	 * peer.
	 *
	 * No clock is handed in, and there used to be one: the stamps a question and an
	 * answer are ordered by were read off a wall clock, so two of them could land on
	 * the same millisecond and the watch would disarm over a scene that had answered
	 * nothing. They are serial numbers now, and a serial cannot repeat, so the stand
	 * has nothing left to hold still.
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

		// Every name the geometry mentions is a node of the document, unless the
		// scenario says otherwise: these tests hand in the boxes themselves, and
		// what they hand in is what they mean. A scenario about the boundary
		// between the document and the insides of a pack class says so outright.
		const declared = ()=> {
			const names = new Set< string >()
			for( const key of Object.keys( pane.sizes() ) ) {
				for( const step of key.split( '/' ).slice( 1 ) ) names.add( step )
			}
			return [ ... names ]
		}

		const pane = $$.$bog_vmap_app_pane.make({
			$,
			doc_root: ()=> root,
			doc_names: declared,
			pane_rect: ()=> ({ left: 0, top: 0, width: 1000, height: 800, ... rect }),
			scene_peer: ()=> peer,
			... over,
		})

		pane.handshake( pane.scene_key(), 1 )

		const answer = ( data: object )=> {
			pane.message_receive( { data: { ns: $bog_vmap_bridge_ns, ... data }, source: peer } as unknown as MessageEvent )
		}

		return { pane, peer, posted, answer }
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

		'a dropped part is carried by a drag across its body'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			$mol_assert_like( stage.app.spots(), { Calc: { x: 200, y: 150 } } )

			// The overlay is whole: the body of the part just dropped is the handle.
			$mol_assert_equal( stage.pane.overlay_style().clipPath, 'none' )

			const overlay = stage.overlay()
			const from = stage.part_center( 'Calc' )

			stage.press( overlay, from )
			stage.move( overlay, [ from[0] + 60, from[1] + 40 ] )
			stage.release( overlay, [ from[0] + 60, from[1] + 40 ] )
			stage.redraw()

			$mol_assert_like( stage.app.spots(), { Calc: { x: 260, y: 190 } } )

		},

		'the second click lets the pointer inside the part, Escape takes it back out'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			stage.drop( map, stage.client([ 400, 150 ]) )

			// The first click on another part only picks it, and no click reaches the scene.
			const before = stage.scene.sent( 'click_at' ).length
			stage.tap( stage.part_center( 'Calc' ) )

			$mol_assert_equal( stage.app.selected(), 'Calc' )
			$mol_assert_equal( stage.pane.inside(), false )
			$mol_assert_equal( stage.pane.overlay_style().clipPath, 'none' )
			$mol_assert_equal( stage.scene.sent( 'click_at' ).length, before )

			// The second one lets the pointer inside, and the click goes on to the component.
			stage.tap( stage.part_center( 'Calc' ) )

			$mol_assert_equal( stage.pane.inside(), true )
			$mol_assert_ok( stage.pane.overlay_style().clipPath.includes( '200px 150px' ) )
			$mol_assert_equal( stage.scene.sent( 'click_at' ).length, before + 1 )

			const dom = $.$mol_dom_context
			dom.document.dispatchEvent( new dom.KeyboardEvent( 'keydown', { key: 'Escape', bubbles: true } ) )
			stage.redraw()

			$mol_assert_equal( stage.pane.inside(), false )
			$mol_assert_equal( stage.app.selected(), 'Calc' )

		},

		'the Delete key takes the picked part out of the document'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 100, 100 ]) )
			stage.drop( map, stage.client([ 300, 100 ]) )
			stage.tap( stage.part_center( 'Calc' ) )

			$mol_assert_equal( stage.app.selected(), 'Calc' )

			const dom = $.$mol_dom_context
			dom.document.dispatchEvent( new dom.KeyboardEvent( 'keydown', { key: 'Delete', bubbles: true } ) )
			stage.redraw()

			$mol_assert_equal( stage.app.doc_source().includes( 'Calc' ), false )
			$mol_assert_equal( stage.app.selected(), null )

		},

		/**
		 * The band: a modified sweep over the canvas takes everything it overlaps, and
		 * from then on the whole set is one thing — it travels together and it goes
		 * together.
		 */
		'a band takes several parts, and they move and delete as one'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 100, 100 ]) )
			stage.drop( map, stage.client([ 300, 100 ]) )

			// Only the last dropped one is picked, as a drop leaves it.
			$mol_assert_like( [ ... stage.app.picked() ], [ 'Map' ] )

			// A sweep with the modifier down, from above and left of both to below
			// and right of both.
			const overlay = stage.overlay()
			const mods = { ctrlKey: true }

			stage.press( overlay, stage.client([ 50, 50 ]), mods )
			stage.move( overlay, stage.client([ 450, 200 ]), mods )
			$mol_assert_ok( stage.pane.band() !== null )

			stage.release( overlay, stage.client([ 450, 200 ]), mods )
			stage.redraw()
			stage.scene.flush()

			$mol_assert_like( [ ... stage.app.picked() ], [ 'Calc', 'Map' ] )
			$mol_assert_equal( stage.pane.band(), null )

			// Carried by the body of one of them, both travel by the same offset.
			const from = stage.part_center( 'Calc' )

			stage.press( overlay, from )
			stage.move( overlay, [ from[0] + 40, from[1] + 30 ] )
			stage.release( overlay, [ from[0] + 40, from[1] + 30 ] )
			stage.redraw()

			$mol_assert_like( stage.app.spots(), {
				Calc: { x: 140, y: 130 },
				Map: { x: 340, y: 130 },
			} )

			// And deleted together: out of the document, out of `sub`, out of the desk.
			stage.click( stage.button( 'Удалить' ) )

			const source = stage.app.doc_source()
			$mol_assert_equal( source.includes( 'Calc' ), false )
			$mol_assert_equal( source.includes( 'Map' ), false )
			$mol_assert_like( Object.keys( stage.app.spots() ), [] )
			$mol_assert_like( [ ... stage.app.picked() ], [] )

		},

		/**
		 * REPRO: a drop out of the palette while something is picked carried the
		 * picked node to the point of the drop as well.
		 */
		/**
		 * REPRO end to end: a frame that boots and stops before any geometry. The
		 * canvas used to sit in «ожидание сцены…» with no strip and no button, since
		 * the watch was off until the frame had warmed.
		 */
		'a scene that never came up says so, and says what to do about it'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $, { mute: true } )

			$mol_assert_equal( stage.pane.warmed(), false )
			$mol_assert_equal( stage.app.stalled(), false )

			// The watch is armed on the cold limit; time passes and it fires.
			const timer = stage.timers.at( -1 )!
			$mol_assert_ok( stage.pane.watchdog() !== null )
			$mol_assert_equal( stage.pane.watchdog()!.delay, stage.pane.cold_limit() )

			stage.pane.watchdog()!.task()
			stage.redraw()

			$mol_assert_equal( stage.app.stalled(), true )

			const text = stage.text()
			$mol_assert_ok( text.includes( 'Сцена не запустилась' ) )
			$mol_assert_ok( text.includes( 'исправьте код в панели' ) )
			stage.button( 'Перезагрузить сцену' )

			$mol_assert_ok( timer !== null )

		},

		/**
		 * REPRO: entering a part gave it the pointer but not the keyboard. The scene
		 * focuses the element under the click, and that alone left the active element
		 * of the frame at `body` — typing went nowhere at all.
		 */
		'entering a part hands the keyboard to the frame'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )

			// A drop picks the part, so a click on it would already be the second of
			// the pair. Bare canvas first, to start from nothing picked.
			stage.tap( stage.client([ 500, 400 ]) )
			$mol_assert_equal( stage.app.selected(), null )

			let focused = 0
			stage.frame().focus = ()=> { focused ++ }

			// The first click only picks: the keyboard stays with the editor.
			stage.tap( stage.part_center( 'Calc' ) )
			$mol_assert_equal( stage.pane.inside(), false )
			$mol_assert_equal( focused, 0 )

			// The second lets the pointer in, and the keys go with it.
			stage.tap( stage.part_center( 'Calc' ) )

			$mol_assert_equal( stage.pane.inside(), true )
			$mol_assert_equal( focused, 1 )

		},

		/**
		 * Inside a part the keys belong to the part, and the strip says so with the
		 * way out. Nothing else on screen would explain why Delete stopped deleting.
		 */
		'the strip says the pointer is inside a part, and how to get out'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			$mol_assert_equal( stage.text().includes( 'Внутри' ), false )

			stage.tap( stage.part_center( 'Calc' ) )
			stage.tap( stage.part_center( 'Calc' ) )

			$mol_assert_equal( stage.pane.inside(), true )
			$mol_assert_ok( stage.text().includes( 'Внутри Calc' ) )
			$mol_assert_ok( stage.text().includes( 'Esc' ) )

			const dom = $.$mol_dom_context
			dom.document.dispatchEvent( new dom.KeyboardEvent( 'keydown', { key: 'Escape', bubbles: true } ) )
			stage.redraw()

			$mol_assert_equal( stage.pane.inside(), false )
			$mol_assert_equal( stage.text().includes( 'Внутри' ), false )

		},

		/**
		 * REPRO: a wire drawn onto an input that already carries one used to be
		 * written straight over, leaving the previous source line in the document
		 * with nobody reading it.
		 */
		'REPRO rebinding an occupied input leaves no orphan behind'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			// Two sources of the same shape, names sharing a prefix on purpose.
			stage.drop( calc, stage.client([ 100, 100 ]) )
			stage.drop( calc, stage.client([ 100, 300 ]) )
			stage.drop( map, stage.client([ 400, 100 ]) )

			const wire = ( from: string, prop: string )=> {
				stage.press( stage.overlay(), stage.port_dot( from, prop, 'out' ) )
				stage.move( stage.overlay(), stage.port_dot( 'Map', 'zoom', 'in' ) )
				stage.release( stage.overlay(), stage.port_dot( 'Map', 'zoom', 'in' ) )
				stage.redraw()
				stage.scene.flush()
			}

			stage.tap( stage.part_center( 'Calc' ) )
			wire( 'Calc', 'result' )

			$mol_assert_ok( stage.app.doc_source().includes( 'calc_result = Calc result' ) )
			$mol_assert_like( stage.app.doc_wires().map( link => `${ link.to }.${ link.to_prop }` ), [ 'Map.zoom' ] )

			// The same input, a different source: the first wire goes with its line,
			// and the wire lands on the part it was dropped on, prefix name and all.
			stage.tap( stage.part_center( 'Calc_2' ) )
			wire( 'Calc_2', 'result' )

			const source = stage.app.doc_source()
			$mol_assert_equal( source.includes( 'calc_result =' ), false )
			$mol_assert_ok( source.includes( 'calc_2_result = Calc_2 result' ) )
			$mol_assert_like( stage.app.doc_wires().map( link => `${ link.to }.${ link.to_prop } <= ${ link.from }` ), [ 'Map.zoom <= Calc_2' ] )

		},

		'REPRO a drop from the palette leaves the picked part where it was'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 100, 100 ]) )
			$mol_assert_equal( stage.app.selected(), 'Calc' )

			// Picked by a click, the way a person picks before reaching for the palette.
			stage.tap( stage.part_center( 'Calc' ) )
			$mol_assert_equal( stage.app.selected(), 'Calc' )

			stage.drop( map, stage.client([ 400, 300 ]) )

			$mol_assert_like( stage.app.spots(), {
				Calc: { x: 100, y: 100 },
				Map: { x: 400, y: 300 },
			} )

		},

		'a part inside a page is carried to another position in its tree'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.click( stage.button( 'Артборд' ) )

			const page = stage.pane.part_box( 'Page' )!

			stage.drop( calc, stage.client([ page.left + 200, page.top + 40 ]) )
			stage.drop( map, stage.client([ page.left + 200, page.top + 250 ]) )

			const node = stage.app.node()
			$mol_assert_like( node.sub_names( 'Page' ), [ 'Calc', 'Map' ] )

			// Carry the second one above the first: press on it, drag up, release.
			const overlay = stage.overlay()
			const from = stage.part_center( 'Map' )
			const to = stage.client([ page.left + 200, page.top + 5 ])

			stage.press( overlay, from )
			stage.move( overlay, to )
			stage.release( overlay, to )
			stage.redraw()
			stage.scene.flush()

			$mol_assert_like( node.sub_names( 'Page' ), [ 'Map', 'Calc' ] )

		},



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

			pane.sizes({ [ `${root}/A` ]: box( 30, 40 ) })

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

		/**
		 * CARRYING A NODE IS NOT ENTERING IT. The second press on a node picked alone
		 * is the one that would let the pointer in, and a drag begins with exactly
		 * that press — so the only thing telling the two apart is how far the pointer
		 * travelled, and it is read on the release.
		 *
		 * THE RELEASE IS ITS OWN WITNESS, and that is what this pins down. A move
		 * records the travel as it goes, so an ordinary drag is told from a click
		 * long before the button comes up. What has no move at all is a release that
		 * arrives far from its press — the pointer went out of the window and the
		 * capture was lost, or the release is a synthetic one — and there the only
		 * measurement ever taken is the one the release takes itself.
		 *
		 * The guarantee is thin enough to lose by accident: the press lives in a cell
		 * now, its travel is recorded by replacing the value, and a release that took
		 * its reference to the press BEFORE measuring would read the press as it
		 * started — never moved, therefore a click, therefore a way in. Written after
		 * a negative run: the first version of this scenario moved the pointer first
		 * and stayed green with the fault put back, because the move had already
		 * recorded everything.
		 */
		'a release far from its press is not a way into the node'( $ ) {

			const { pane } = pane_make( $ )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })
			pane.spots({ A: { x: 0, y: 0 } })

			// First click: picked, and the pointer stays outside.
			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 50, 25, { buttons: 0 } ) )

			$mol_assert_equal( pane.primary(), 'A' )
			$mol_assert_equal( pane.inside(), false )

			// The press that would have let the pointer in, and then nothing until a
			// release two hundred pixels away.
			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 250, 225, { buttons: 0 } ) )

			$mol_assert_equal( pane.inside(), false )

		},

		/** A pick of anything else closes the hole without anybody clearing it. */
		'picking another node puts the pointer back outside'( $ ) {

			const { pane } = pane_make( $ )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ), [ `${root}/B` ]: box( 300, 0 ) })

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

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })

			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 50, 25, { buttons: 0 } ) )
			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 50, 25, { buttons: 0, shiftKey: true, metaKey: true } ) )

			$mol_assert_like( clicks( posted )[0].mods, { altKey: false, ctrlKey: false, metaKey: true, shiftKey: true } )

		},

		/** A gesture that went somewhere is a drag of the part, not a click. */
		'movement past the threshold moves the part and relays nothing'( $ ) {

			const { pane, posted } = pane_make( $ )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })
			pane.spots({ A: { x: 0, y: 0 } })

			pane.node_press( pointer( 50, 25 ) )
			pane.node_move( pointer( 70, 25 ) )
			pane.node_release( pointer( 70, 25, { buttons: 0 } ) )

			$mol_assert_equal( pane.primary(), 'A' )
			$mol_assert_equal( pane.spots().A.x, 20 )
			$mol_assert_equal( pane.spots().A.y, 0 )
			$mol_assert_equal( clicks( posted ).length, 0 )

		},

		/**
		 * THE RING FOLLOWS THE POINTER, AND COUNTS THE MOVE ONCE. Measured boxes are
		 * debounced inside the scene and the timer restarts on every change, so
		 * through a continuous drag no fresh report arrives at all: a ring drawn from
		 * the report alone would stand at the grab until the pointer stopped. The
		 * live offset is added for exactly that. But the moment a report DOES arrive
		 * it already carries the move, and adding the offset on top of it would count
		 * the same twenty pixels twice.
		 *
		 * The two cases are told apart by the identity of the report the grab was
		 * taken against, and by nothing else — a fresh report is a new object. Written
		 * because the guard had no test at all: it was a version counter before, and
		 * the negative run on the identity that replaced it came back green.
		 */
		'the ring carries the live offset only until a fresh report arrives'( $ ) {

			const { pane } = pane_make( $ )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })
			pane.spots({ A: { x: 0, y: 0 } })

			pane.node_press( pointer( 50, 25 ) )
			pane.node_move( pointer( 70, 25 ) )

			// Nothing has been measured since the grab: the box is still at the
			// origin, and the ring stands twenty pixels to the right of it.
			$mol_assert_equal( pane.sizes()[ `${root}/A` ].x, 0 )
			$mol_assert_equal( pane.part_box( 'A' )!.left, 20 )

			// Now the scene reports the node where the drag has already put it.
			pane.sizes({ [ `${root}/A` ]: box( 20, 0 ) })

			$mol_assert_equal( pane.part_box( 'A' )!.left, 20 )

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

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })

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

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })
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

		/**
		 * REPRO: the zoom pivots on the middle of the canvas, and the FIRST one after
		 * a load did not — the box it reads answers `null` until something has read
		 * it once, and an unread box put the pivot in the corner.
		 */
		'the first zoom after a load pivots on the middle of the canvas'( $ ) {

			const { pane } = pane_make( $ )

			// Nothing has read the geometry yet, exactly as after a fresh load.
			pane.zoom_by( 1.25 )

			// 1000 x 800, so the middle is 500, 400; the pivot keeps it still.
			$mol_assert_equal( pane.camera_zoom(), 1.25 )
			$mol_assert_like( [ ... pane.camera_shift() ], [ -125, -100 ] )

		},

		/** The grip is a strip of screen pixels, so it does not shrink away when zooming out. */
		'the grip around a part is measured in screen pixels'( $ ) {

			const { pane } = pane_make( $ )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0, 100, 100 ) })

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
			pane.sizes({ [ `${root}/A` ]: box( 30, 40, 100, 50 ) })

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

			pane.sizes({
				[ `${root}/A` ]: box( 0, 0, 100, 50 ),
				[ `${root}/Page` ]: box( 200, 0, 300, 200 ),
				[ `${root}/Page/B` ]: box( 200, 0, 100, 50 ),
			})

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

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })

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

		/**
		 * REPRO: the hit test walks the insides of a pack class and picks a view the
		 * document never declared. Everything below the part is the part's body.
		 */
		'REPRO the hit test stops at the nodes the document declares'( $ ) {

			const { pane } = pane_make( $, {}, { doc_names: ()=> [ 'Calc' ] } )

			// A part of the document, and two views of its class inside it.
			pane.sizes({
				[ `${root}/Calc` ]: box( 0, 0, 200, 100 ),
				[ `${root}/Calc/Head` ]: box( 0, 0, 200, 30 ),
				[ `${root}/Calc/Head/String` ]: box( 10, 5, 80, 20 ),
			})

			$mol_assert_equal( pane.node_at([ 50, 15 ]), 'Calc' )
			$mol_assert_equal( pane.node_at([ 100, 50 ]), 'Calc' )
			$mol_assert_like( pane.part_names(), [ 'Calc' ] )

			// And the ring is the box of the part, not of the view inside it.
			pane.picked([ 'Calc' ])
			$mol_assert_like( pane.frame_style( 'Calc' ), { left: '0px', top: '0px', width: '200px', height: '100px' } )

		},

		/** A node of the document inside an artboard is still reached, at any depth. */
		'REPRO the deepest node of the document wins, the pack inside it does not'( $ ) {

			const { pane } = pane_make( $, {}, { doc_names: ()=> [ 'Page', 'Calc' ] } )

			pane.sizes({
				[ `${root}/Page` ]: box( 0, 0, 400, 300 ),
				[ `${root}/Page/Calc` ]: box( 0, 0, 200, 100 ),
				[ `${root}/Page/Calc/Head` ]: box( 0, 0, 200, 30 ),
			})

			$mol_assert_equal( pane.node_at([ 100, 15 ]), 'Calc' )
			$mol_assert_equal( pane.node_at([ 300, 200 ]), 'Page' )

		},

		/**
		 * REPRO: a press whose release never came back left the carry live, and the
		 * next drag across the canvas — the one out of the palette — carried the
		 * picked node with it, grabbed where it had last been pressed.
		 */
		'REPRO a drag from the palette carries nothing of the canvas'( $ ) {

			const { pane } = pane_make( $ )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })
			pane.spots({ A: { x: 0, y: 0 } })

			// Picked and grabbed in the middle; the release fell into the hole and
			// never reached the overlay, so the gesture was never ended.
			pane.node_press( pointer( 50, 25 ) )

			// The owner now carries a class across the canvas, button down.
			pane.carrying = ()=> true

			pane.node_move( pointer( 400, 300 ) )
			pane.node_release( pointer( 400, 300, { buttons: 0 } ) )

			$mol_assert_like( pane.spots(), { A: { x: 0, y: 0 } } )

		},

		/**
		 * REPRO: a node carried into a container is measured at a new path, and the
		 * box under its old path kept answering to the same name. Two boxes for one
		 * name is how a wire lands on the neighbour of the part it was dropped on.
		 */
		'REPRO a node that moved leaves no box behind at its old path'( $ ) {

			const { pane } = pane_make( $, {}, { doc_names: ()=> [ 'Pair', 'Schet' ] } )

			pane.sizes({
				[ `${root}/Schet` ]: box( 700, 600 ),
				[ `${root}/Pair` ]: box( 0, 0, 400, 300 ),
			})

			// Carried into the pair: the scene will measure it at the new path, and
			// the owner tells the canvas to forget where it used to be.
			pane.sizes_forget( 'Schet' )

			$mol_assert_like( Object.keys( pane.sizes() ), [ `${root}/Pair` ] )

			// And the new report puts it inside, with one box answering to the name.
			pane.sizes({ ... pane.sizes(), [ `${root}/Pair/Schet` ]: box( 10, 10 ) })

			$mol_assert_like( pane.part_size( 'Schet' ), box( 10, 10 ) )
			$mol_assert_equal( pane.part_names().filter( name => name === 'Schet' ).length, 1 )

			// Carried OUT of the pair, which is the case a rule written as a prefix of
			// the root path cannot see: the stale key is a deep one.
			pane.sizes_forget( 'Schet' )

			$mol_assert_like( Object.keys( pane.sizes() ), [ `${root}/Pair` ] )

		},

		/**
		 * REPRO: two parts of one container whose names share a prefix. The dot the
		 * pointer is over belongs to the part it is drawn on, and to no other.
		 */
		'REPRO a port dot belongs to the part it is drawn on, prefix or not'( $ ) {

			const ports = [
				{ name: 'zoom', next: false, kind: 'number' as const },
				{ name: 'marker', next: false, kind: 'string' as const },
			]

			const { pane } = pane_make( $, {}, {
				doc_names: ()=> [ 'Pair', 'Map', 'Map_2' ],
				part_ports: ()=> ports,
				wires: ()=> [],
			} )

			// Stacked inside the pair, sharing a left edge: Map_2 above Map.
			pane.sizes({
				[ `${root}/Pair` ]: box( 0, 0, 400, 500 ),
				[ `${root}/Pair/Map_2` ]: box( 0, 0, 320, 220 ),
				[ `${root}/Pair/Map` ]: box( 0, 220, 320, 220 ),
			})

			pane.wire_drag({ from: 'Pair', from_prop: 'x', kind: 'number' })

			const dots = pane.wire_dots()
			const at = ( x: number, y: number )=> $bog_vmap_app_wire_dot_at( dots, [ x, y ] )

			// The zoom dot of the upper map, and of the lower one.
			$mol_assert_equal( at( -12, 7 )?.node, 'Map_2' )
			$mol_assert_equal( at( -12, 227 )?.node, 'Map' )

			// One dot set per part, not two.
			$mol_assert_equal( dots.filter( dot => dot.node === 'Map' ).length, 2 )

		},

		/** A modified click without a sweep takes nothing and clears nothing. */
		'a modified click leaves the picked set alone'( $ ) {

			const { pane } = pane_make( $ )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })
			pane.picked([ 'A' ])

			pane.node_press( pointer( 500, 500, { ctrlKey: true } ) )
			pane.node_release( pointer( 500, 500, { ctrlKey: true, buttons: 0 } ) )

			$mol_assert_like( [ ... pane.picked() ], [ 'A' ] )
			$mol_assert_equal( pane.band(), null )

		},

		/** Everything picked travels by the same offset, each from its own start. */
		'a carry moves the whole picked set'( $ ) {

			const { pane } = pane_make( $ )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ), [ `${root}/B` ]: box( 300, 0 ) })
			pane.spots({ A: { x: 0, y: 0 }, B: { x: 300, y: 0 } })
			pane.picked([ 'A', 'B' ])

			pane.node_press( pointer( 50, 25 ) )
			pane.node_move( pointer( 70, 45 ) )
			pane.node_release( pointer( 70, 45, { buttons: 0 } ) )

			$mol_assert_like( pane.spots(), { A: { x: 20, y: 20 }, B: { x: 320, y: 20 } } )

		},

		'the hole is closed while a drop from the palette is on'( $ ) {

			const { pane } = pane_make( $ )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })
			pane.picked([ 'A' ])
			pane.entered( 'A' )
			pane.carrying = ()=> true

			$mol_assert_equal( pane.overlay_style().clipPath, 'none' )
			// The ring itself stays: only the events stop going through.
			$mol_assert_equal( pane.frame_showed(), true )

		},


		/**
		 * THE PULSE HAS NO MODE. It runs as soon as the scene has proved itself and
		 * the bridge is up, asks once, and asks again only after an answer.
		 */
		'the heartbeat pings once warmed and re-arms on the pong'( $ ) {

			const timers = timers_fake( $ )
			const { pane, posted, answer } = pane_make( $ )

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

			first!.task()

			const pings = posted.filter( m => m.kind === 'ping' )
			$mol_assert_equal( pings.length, 1 )

			// The nonce is a serial off the same clock as the stamps, so what is
			// promised about it is that it is a number and that the echo carries it
			// back, not what its value happens to be.
			const nonce = pings[0].nonce as number
			$mol_assert_equal( nonce > 0, true )

			// The ping is a question: the watchdog is armed by it.
			$mol_assert_equal( pane.watchdog() !== null, true )

			answer({ kind: 'pong', nonce })

			// Answered: disarmed, and the next ping is scheduled.
			$mol_assert_equal( pane.watchdog(), null )
			$mol_assert_equal( pane.heartbeat() !== first, true )

		},

		'a silent scene is called stalled when the limit runs out'( $ ) {

			const timers = timers_fake( $ )
			const { pane } = pane_make( $ )

			pane.warmed( true )
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
			const { pane, answer } = pane_make( $ )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })
			pane.warmed( true )

			// The first read pushes the document and the rest; answered, the watch rests.
			pane.watchdog()
			answer({ kind: 'sizes', sizes: {} })
			$mol_assert_equal( pane.watchdog(), null )


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
		/**
		 * The pulse waits for the scene to prove itself; the watch does not, since
		 * E9 — see the scenario below. A ping into a frame that has not loaded would
		 * be a question asked of nobody, and every answer to it a false all clear.
		 */
		'before the first sizes the pulse is quiet'( $ ) {

			timers_fake( $ )
			const { pane } = pane_make( $ )

			pane.node_press( pointer( 5, 5 ) )
			pane.node_release( pointer( 5, 5, { buttons: 0 } ) )

			$mol_assert_equal( pane.heartbeat(), null )

		},

		/**
		 * REPRO: document code that loops on the first compile stops the scene before
		 * any geometry, so the frame never warms. The watch used to be off until it
		 * warmed, which left this one case with no strip, no button and no way out.
		 */
		'a frame that never answered at all is called out, on a limit of its own'( $ ) {

			const timers = timers_fake( $ )
			const { pane, answer } = pane_make( $ )

			// The frame boots and says `ready`, which proves nothing but the boot.
			answer({ kind: 'ready' })

			// The host asks its questions; the scene compiles the document and stops.
			pane.watchdog()

			$mol_assert_equal( pane.warmed(), false )
			$mol_assert_ok( pane.watchdog() !== null )

			// The limit is the generous one, not the warm one.
			$mol_assert_equal( timers.at( -1 )!.delay, pane.cold_limit() )
			$mol_assert_ok( pane.cold_limit() > pane.answer_limit() )

			timers.at( -1 )!.task()

			$mol_assert_equal( pane.stalled(), true )

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
			pane.sizes({ [ `${root}/Calc` ]: box( 0, 0 ), [ `${root}/Map` ]: box( 300, 0 ) })
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

			pane.sizes({ [ `${root}/Calc` ]: box( 0, 0 ), [ `${root}/Map` ]: box( 300, 0 ) })
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
			pane.sizes({ [ `${root}/Calc` ]: box( 0, 0 ) })
			pane.picked([ 'Calc' ])

			// Box is 50 wide on screen, the dot at 62, the grip strip reaches 8 px past 50.
			pane.node_press( pointer( 62, 7 ) )

			$mol_assert_equal( pane.wire_drag() !== null, true )
			$mol_assert_equal( pane.drag(), null )

			pane.node_release( pointer( 62, 7, { buttons: 0 } ) )

		},

		/** Pressing a wired input unplugs it at once and leaves the wire in hand from the same source. */
		'a press on a wired input unplugs it and carries on from its source'( $ ) {

			const { pane, node } = wired_make( $ )

			pane.sizes({ [ `${root}/Calc` ]: box( 0, 0 ), [ `${root}/Map` ]: box( 300, 0 ) })

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

			pane.sizes({
				[ `${root}/Calc` ]: box( 0, 0 ),
				[ `${root}/Map` ]: box( 300, 0 ),
				[ `${root}/Calc_2` ]: box( 5000, 5000 ),
				[ `${root}/Map_2` ]: box( 5300, 5000 ),
			})

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

			// A question that owes no answer must not arm the watch. Asserted on the
			// stamp and no longer on `watchdog()` being null: since the cold frame is
			// watched too, the pushes of the boot arm it by themselves, and a null
			// there would stop meaning «this question was free».
			const stamped = pane.poke_at

			pane.camera_shift( new $mol_vector_2d( -5000, -4000 ) )
			pane.values_push()

			$mol_assert_equal( pane.poke_at, stamped )

		},

		/**
		 * Inside an artboard the deepest node wins, or a page would swallow every
		 * pick made on it: everything laid out inside it lies within its box.
		 */
		'the pick goes to the deepest node under the point'( $ ) {

			const { pane } = pane_make( $ )

			pane.sizes({
				[ `${root}/Board` ]: box( 0, 0, 400, 300 ),
				[ `${root}/Board/Head` ]: box( 0, 0, 400, 100 ),
				[ `${root}/Loose` ]: box( 600, 0, 100, 50 ),
			})

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

			pane.sizes({
				[ `${root}/Board` ]: box( 0, 0, 400, 300 ),
				[ `${root}/Board/Head` ]: box( 0, 0, 400, 100 ),
				[ `${root}/Board/Foot` ]: box( 0, 100, 400, 100 ),
			})

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

			pane.sizes({
				[ `${root}/Board` ]: box( 0, 0, 400, 300 ),
				[ `${root}/Board/Head` ]: box( 0, 0, 400, 100 ),
				[ `${root}/Loose` ]: box( 600, 0, 100, 50 ),
			})

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

			pane.sizes({
				[ `${root}/Board` ]: box( 0, 0, 400, 300 ),
				[ `${root}/Loose` ]: box( 600, 0, 100, 50 ),
			})

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

			pane.sizes({
				[ `${root}/Board` ]: box( 0, 0, 400, 300 ),
				[ `${root}/Board/Head` ]: box( 0, 0, 400, 100 ),
				[ `${root}/Board/Foot` ]: box( 0, 100, 400, 100 ),
			})

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

			pane.sizes({
				[ `${root}/Page` ]: box( 0, 0, 400, 600 ),
				[ `${root}/Page/Head` ]: box( 0, 0, 400, 100 ),
				[ `${root}/Page/Bar` ]: box( 0, 100, 400, 100 ),
				[ `${root}/Page/Bar/Left` ]: box( 0, 100, 200, 100 ),
				[ `${root}/Page/Bar/Right` ]: box( 200, 100, 200, 100 ),
				[ `${root}/Page/Foot` ]: box( 0, 200, 400, 100 ),
			})

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

			pane.sizes({
				[ `${root}/Board` ]: box( 0, 0, 400, 300 ),
				[ `${root}/Board/Inner` ]: box( 0, 0, 400, 100 ),
			})

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
