namespace $ {
	const d = '$'

	const root = `${d}doc`

	const calc = `${d}flow_calc`
	const map = `${d}flow_map`

	type sent = { kind: string, [ key: string ]: unknown }

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

			const before = stage.scene.sent( 'click_at' ).length
			stage.tap( stage.part_center( 'Calc' ) )

			$mol_assert_equal( stage.app.selected(), 'Calc' )
			$mol_assert_equal( stage.pane.inside(), false )
			$mol_assert_equal( stage.pane.overlay_style().clipPath, 'none' )
			$mol_assert_equal( stage.scene.sent( 'click_at' ).length, before )

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

		async 'leaving a part takes the focus back off the frame'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const dom = $.$mol_dom_context

			stage.drop( calc, stage.client([ 200, 150 ]) )
			stage.tap( stage.client([ 500, 400 ]) )

			stage.tap( stage.part_center( 'Calc' ) )
			stage.tap( stage.part_center( 'Calc' ) )
			$mol_assert_equal( stage.pane.inside(), true )

			stage.frame().focus()
			$mol_assert_equal( dom.document.activeElement, stage.frame() )

			dom.document.dispatchEvent( new dom.KeyboardEvent( 'keydown', { key: 'Escape', bubbles: true } ) )
			stage.redraw()

			await Promise.resolve()
			await Promise.resolve()

			$mol_assert_equal( stage.pane.inside(), false )
			$mol_assert_equal( dom.document.activeElement === stage.frame(), false )
			$mol_assert_equal( dom.document.activeElement, stage.pane.dom_node() )

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

		'a band takes several parts, and they move and delete as one'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 100, 100 ]) )
			stage.drop( map, stage.client([ 300, 100 ]) )

			$mol_assert_like( [ ... stage.app.picked() ], [ 'Map' ] )

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

			const from = stage.part_center( 'Calc' )

			stage.press( overlay, from )
			stage.move( overlay, [ from[0] + 40, from[1] + 30 ] )
			stage.release( overlay, [ from[0] + 40, from[1] + 30 ] )
			stage.redraw()

			$mol_assert_like( stage.app.spots(), {
				Calc: { x: 140, y: 130 },
				Map: { x: 340, y: 130 },
			} )

			stage.click( stage.button( 'Удалить' ) )

			const source = stage.app.doc_source()
			$mol_assert_equal( source.includes( 'Calc' ), false )
			$mol_assert_equal( source.includes( 'Map' ), false )
			$mol_assert_like( Object.keys( stage.app.spots() ), [] )
			$mol_assert_like( [ ... stage.app.picked() ], [] )

		},

		'a scene that never came up says so, and says what to do about it'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $, { mute: true } )

			$mol_assert_equal( stage.pane.warmed(), false )
			$mol_assert_equal( stage.app.stalled(), false )

			const timer = stage.timers.at( -1 )!
			$mol_assert_ok( stage.pane.watchdog() !== null )
			$mol_assert_equal( stage.pane.watchdog()!.delay, stage.pane.cold_limit() )

			const watch = stage.pane.watchdog()!

			watch.task()
			stage.redraw()

			$mol_assert_equal( stage.app.stalled(), false )
			$mol_assert_equal( stage.pane.restart_tries(), 1 )

			watch.task()
			stage.redraw()

			$mol_assert_equal( stage.app.stalled(), true )

			const text = stage.text()
			$mol_assert_ok( text.includes( 'Сцена не запустилась' ) )
			$mol_assert_ok( text.includes( 'уже исправлен' ) )
			$mol_assert_ok( text.includes( 'ещё раз' ) )
			$mol_assert_ok( text.includes( 'сначала исправьте код' ) )
			stage.button( 'Перезагрузить сцену' )

			$mol_assert_ok( timer !== null )

		},

		'entering a part hands the keyboard to the frame'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )

			stage.tap( stage.client([ 500, 400 ]) )
			$mol_assert_equal( stage.app.selected(), null )

			let focused = 0
			stage.frame().focus = ()=> { focused ++ }

			stage.tap( stage.part_center( 'Calc' ) )
			$mol_assert_equal( stage.pane.inside(), false )
			$mol_assert_equal( focused, 0 )

			stage.tap( stage.part_center( 'Calc' ) )

			$mol_assert_equal( stage.pane.inside(), true )
			$mol_assert_equal( focused, 1 )

		},

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

		'REPRO rebinding an occupied input leaves no orphan behind'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

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

			const zoom = stage.pane.camera_zoom()
			const inside = ( x: number, y: number )=> stage.client([
				page.left + x * zoom,
				page.top + y * zoom,
			])

			stage.drop( calc, inside( 200, 40 ) )
			stage.drop( map, inside( 200, 250 ) )

			const node = stage.app.node()
			$mol_assert_like( node.sub_names( 'Page' ), [ 'Calc', 'Map' ] )

			const overlay = stage.overlay()
			const from = stage.part_center( 'Map' )
			const to = inside( 200, 5 )

			stage.press( overlay, from )
			stage.move( overlay, to )
			stage.release( overlay, to )
			stage.redraw()
			stage.scene.flush()

			$mol_assert_like( node.sub_names( 'Page' ), [ 'Map', 'Calc' ] )

		},

		'the first click picks, the second lets the pointer in and relays it'( $ ) {
			const { pane, posted } = pane_make( $, { left: 10, top: 20 } )

			pane.camera_shift( new $mol_vector_2d( 100, 50 ) )
			pane.camera_zoom( 2 )

			pane.sizes({ [ `${root}/A` ]: box( 30, 40 ) })

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

		'a release far from its press is not a way into the node'( $ ) {
			const { pane } = pane_make( $ )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })
			pane.spots({ A: { x: 0, y: 0 } })

			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 50, 25, { buttons: 0 } ) )

			$mol_assert_equal( pane.primary(), 'A' )
			$mol_assert_equal( pane.inside(), false )

			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 250, 225, { buttons: 0 } ) )

			$mol_assert_equal( pane.inside(), false )

		},

		'a second click that drifts a few pixels still lets the pointer inside'( $ ) {
			const { pane } = pane_make( $ )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })
			pane.spots({ A: { x: 0, y: 0 } })

			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 50, 25, { buttons: 0 } ) )

			$mol_assert_equal( pane.primary(), 'A' )
			$mol_assert_equal( pane.inside(), false )

			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 55, 25, { buttons: 0 } ) )

			$mol_assert_equal( pane.inside(), true )

		},

		'two separate clicks with a keystroke between them let the pointer in'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			stage.drop( map, stage.client([ 400, 150 ]) )

			stage.tap( stage.part_center( 'Calc' ) )

			$mol_assert_equal( stage.app.selected(), 'Calc' )
			$mol_assert_equal( stage.pane.inside(), false )

			const dom = $.$mol_dom_context
			dom.document.dispatchEvent( new dom.KeyboardEvent( 'keydown', { key: '9', bubbles: true } ) )
			stage.redraw()

			$mol_assert_equal( stage.app.selected(), 'Calc' )

			const centre = stage.part_center( 'Calc' )
			stage.press( stage.overlay(), centre )
			stage.release( stage.overlay(), [ centre[0] + 3, centre[1] + 3 ] )
			stage.redraw()
			stage.scene.flush()

			$mol_assert_equal( stage.pane.inside(), true )

		},

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

			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 50, 25, { buttons: 0 } ) )

			$mol_assert_equal( pane.primary(), 'A' )
			$mol_assert_equal( pane.inside(), false )

		},

		'Escape relayed from the frame steps out of the node, then out of the pick'( $ ) {
			const { pane, answer } = pane_make( $ )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })

			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 50, 25, { buttons: 0 } ) )
			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 50, 25, { buttons: 0 } ) )

			$mol_assert_equal( pane.inside(), true )

			answer({ kind: 'key', key: 'Escape' })

			$mol_assert_equal( pane.inside(), false )
			$mol_assert_equal( pane.primary(), 'A' )

			answer({ kind: 'key', key: 'Escape' })

			$mol_assert_equal( pane.primary(), null )
			$mol_assert_like( pane.picked(), [] )

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

		'the ring carries the live offset only until a fresh report arrives'( $ ) {
			const { pane } = pane_make( $ )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })
			pane.spots({ A: { x: 0, y: 0 } })

			pane.node_press( pointer( 50, 25 ) )
			pane.node_move( pointer( 70, 25 ) )

			$mol_assert_equal( pane.sizes()[ `${root}/A` ].x, 0 )
			$mol_assert_equal( pane.part_box( 'A' )!.left, 20 )

			pane.sizes({ [ `${root}/A` ]: box( 20, 0 ) })

			$mol_assert_equal( pane.part_box( 'A' )!.left, 20 )

		},

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

		'the first zoom after a load pivots on the middle of the canvas'( $ ) {
			const { pane } = pane_make( $ )

			pane.zoom_by( 1.25 )

			$mol_assert_equal( pane.camera_zoom(), 1.25 )
			$mol_assert_like( [ ... pane.camera_shift() ], [ -125, -100 ] )

		},

		'the grip around a part is measured in screen pixels'( $ ) {
			const { pane } = pane_make( $ )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0, 100, 100 ) })

			pane.camera_zoom( 1 )
			$mol_assert_equal( pane.node_at( [ 106, 50 ] ), 'A' )
			$mol_assert_equal( pane.node_at( [ 110, 50 ] ), null )

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

		'a band takes what it overlaps, containers and not their children'( $ ) {
			const { pane } = pane_make( $ )

			pane.sizes({
				[ `${root}/A` ]: box( 0, 0, 100, 50 ),
				[ `${root}/Page` ]: box( 200, 0, 300, 200 ),
				[ `${root}/Page/B` ]: box( 200, 0, 100, 50 ),
			})

			pane.node_press( pointer( -10, -10, { ctrlKey: true } ) )
			pane.node_move( pointer( 600, 300, { ctrlKey: true } ) )
			pane.node_release( pointer( 600, 300, { ctrlKey: true, buttons: 0 } ) )

			$mol_assert_like( [ ... pane.picked() ], [ 'A', 'Page' ] )
			$mol_assert_equal( pane.band(), null )

			pane.node_press( pointer( 90, 40, { ctrlKey: true } ) )
			pane.node_move( pointer( 150, 100, { ctrlKey: true } ) )
			pane.node_release( pointer( 150, 100, { ctrlKey: true, buttons: 0 } ) )

			$mol_assert_like( [ ... pane.picked() ], [ 'A' ] )

		},

		'a band takes the pointer out of the node it was let into'( $ ) {
			const { pane } = pane_make( $ )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })

			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 50, 25, { buttons: 0 } ) )
			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 50, 25, { buttons: 0 } ) )

			$mol_assert_equal( pane.inside(), true )

			pane.node_press( pointer( -10, -10, { ctrlKey: true } ) )
			pane.node_move( pointer( 150, 60, { ctrlKey: true } ) )
			pane.node_release( pointer( 150, 60, { ctrlKey: true, buttons: 0 } ) )

			$mol_assert_like( [ ... pane.picked() ], [ 'A' ] )
			$mol_assert_equal( pane.inside(), false )
			$mol_assert_equal( pane.overlay_style().clipPath, 'none' )

		},

		'REPRO the hit test stops at the nodes the document declares'( $ ) {
			const { pane } = pane_make( $, {}, { doc_names: ()=> [ 'Calc' ] } )

			pane.sizes({
				[ `${root}/Calc` ]: box( 0, 0, 200, 100 ),
				[ `${root}/Calc/Head` ]: box( 0, 0, 200, 30 ),
				[ `${root}/Calc/Head/String` ]: box( 10, 5, 80, 20 ),
			})

			$mol_assert_equal( pane.node_at([ 50, 15 ]), 'Calc' )
			$mol_assert_equal( pane.node_at([ 100, 50 ]), 'Calc' )
			$mol_assert_like( pane.part_names(), [ 'Calc' ] )

			pane.picked([ 'Calc' ])
			$mol_assert_like( pane.frame_style( 'Calc' ), { left: '0px', top: '0px', width: '200px', height: '100px' } )

		},

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

		'REPRO a drag from the palette carries nothing of the canvas'( $ ) {
			const { pane } = pane_make( $ )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })
			pane.spots({ A: { x: 0, y: 0 } })

			pane.node_press( pointer( 50, 25 ) )

			pane.carrying = ()=> true

			pane.node_move( pointer( 400, 300 ) )
			pane.node_release( pointer( 400, 300, { buttons: 0 } ) )

			$mol_assert_like( pane.spots(), { A: { x: 0, y: 0 } } )

		},

		'REPRO a node that moved leaves no box behind at its old path'( $ ) {
			const { pane, answer } = pane_make( $, {}, { doc_names: ()=> [ 'Pair', 'Schet' ] } )

			answer({ kind: 'sizes', sizes: {
				[ `${root}/Schet` ]: box( 700, 600 ),
				[ `${root}/Pair` ]: box( 0, 0, 400, 300 ),
			} })

			answer({ kind: 'sizes', sizes: { [ `${root}/Pair/Schet` ]: box( 10, 10 ) } })

			$mol_assert_like( Object.keys( pane.sizes() ), [ `${root}/Pair`, `${root}/Pair/Schet` ] )
			$mol_assert_like( pane.part_size( 'Schet' ), box( 10, 10 ) )
			$mol_assert_equal( pane.part_names().filter( name => name === 'Schet' ).length, 1 )

			answer({ kind: 'sizes', sizes: { [ `${root}/Schet` ]: box( 700, 600 ) } })

			$mol_assert_like( Object.keys( pane.sizes() ), [ `${root}/Pair`, `${root}/Schet` ] )
			$mol_assert_like( pane.part_size( 'Schet' ), box( 700, 600 ) )
			$mol_assert_equal( pane.part_names().filter( name => name === 'Schet' ).length, 1 )

		},

		'a node the report leaves out keeps the box it had'( $ ) {
			const { pane, answer } = pane_make( $, {}, { doc_names: ()=> [ 'Pair', 'Schet' ] } )

			answer({ kind: 'sizes', sizes: {
				[ `${root}/Schet` ]: box( 700, 600 ),
				[ `${root}/Pair` ]: box( 0, 0, 400, 300 ),
			} })

			answer({ kind: 'sizes', sizes: { [ `${root}/Pair` ]: box( 0, 0, 400, 400 ) } })

			$mol_assert_like( pane.part_size( 'Schet' ), box( 700, 600 ) )
			$mol_assert_like( pane.part_size( 'Pair' ), box( 0, 0, 400, 400 ) )

		},

		'REPRO a port dot belongs to the part it is drawn on, prefix or not'( $ ) {
			const ports = [
				{ name: 'zoom', next: false, own: true, kind: 'number' as const },
				{ name: 'marker', next: false, own: true, kind: 'string' as const },
			]

			const { pane } = pane_make( $, {}, {
				doc_names: ()=> [ 'Pair', 'Map', 'Map_2' ],
				part_ports: ()=> ports,
				wires: ()=> [],
			} )

			pane.sizes({
				[ `${root}/Pair` ]: box( 0, 0, 400, 500 ),
				[ `${root}/Pair/Map_2` ]: box( 0, 0, 320, 220 ),
				[ `${root}/Pair/Map` ]: box( 0, 220, 320, 220 ),
			})

			pane.wire_drag({ from: 'Pair', from_prop: 'x', kind: 'number' })
			pane.wire_point([ -12, 227 ])

			const dots = pane.wire_dots()
			const at = ( x: number, y: number )=> $bog_vmap_app_wire_dot_at( dots, [ x, y ] )

			$mol_assert_equal( at( -12, 227 )?.node, 'Map' )
			$mol_assert_equal( at( -12, 7 )?.node, 'Map_2' )

			$mol_assert_equal( dots.filter( dot => dot.node === 'Map' ).length, 2 )
			$mol_assert_equal( dots.filter( dot => dot.node === 'Map_2' ).length, 1 )

		},

		'a stack of short parts keeps every dot on the part it belongs to'( $ ) {
			const own = [ 'left', 'right', 'op', 'result' ]
			const base = [ 'dom_name', 'title', 'style', 'minimal_height' ]

			const ports = [
				... own.map( name => ({ name, next: false, own: true, kind: 'number' as const }) ),
				... base.map( name => ({ name, next: false, own: false, kind: 'number' as const }) ),
			]

			const { pane } = pane_make( $, {}, {
				doc_names: ()=> [ 'Fuel', 'Cost', 'Total' ],
				part_ports: ()=> ports,
				wires: ()=> [],
			} )

			pane.sizes({
				[ `${root}/Fuel` ]: box( 0, 0, 200, 17 ),
				[ `${root}/Cost` ]: box( 0, 17, 200, 17 ),
				[ `${root}/Total` ]: box( 0, 34, 200, 17 ),
			})

			pane.wire_drag({ from: 'Board', from_prop: 'x', kind: 'number' })
			pane.wire_point([ 100, 8 ])

			const dots = pane.wire_dots()
			const at = ( x: number, y: number )=> $bog_vmap_app_wire_dot_at( dots, [ x, y ] )

			$mol_assert_equal( dots.some( dot => base.includes( dot.port.name ) ), false )

			$mol_assert_equal( dots.filter( dot => dot.node === 'Fuel' ).length, own.length )
			$mol_assert_equal( dots.filter( dot => dot.node === 'Cost' ).length, 1 )
			$mol_assert_equal( dots.filter( dot => dot.node === 'Total' ).length, 1 )

			const left = $bog_vmap_app_wire_port_point( pane.part_box( 'Fuel' )!, 'in', 0 )

			$mol_assert_equal( at( left[0], left[1] )?.node, 'Fuel' )
			$mol_assert_equal( at( left[0], left[1] )?.port.name, 'left' )

			const cost = $bog_vmap_app_wire_side_point( pane.part_box( 'Cost' )!, 'in' )
			const total = $bog_vmap_app_wire_side_point( pane.part_box( 'Total' )!, 'in' )

			$mol_assert_equal( Math.abs( cost[1] - total[1] ) > $bog_vmap_app_wire_hit, true )
			$mol_assert_equal( at( cost[0], cost[1] )?.node, 'Cost' )
			$mol_assert_equal( at( total[0], total[1] )?.node, 'Total' )

			pane.wire_point( cost )

			const opened = pane.wire_dots().filter( dot => dot.node === 'Cost' )

			$mol_assert_equal( opened.length, own.length )
			$mol_assert_like( [ opened[ 0 ].x, opened[ 0 ].y ], [ cost[0], cost[1] ] )
			$mol_assert_equal( opened[ 0 ].port.name, 'left' )

		},

		'a modified click leaves the picked set alone'( $ ) {
			const { pane } = pane_make( $ )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })
			pane.picked([ 'A' ])

			pane.node_press( pointer( 500, 500, { ctrlKey: true } ) )
			pane.node_release( pointer( 500, 500, { ctrlKey: true, buttons: 0 } ) )

			$mol_assert_like( [ ... pane.picked() ], [ 'A' ] )
			$mol_assert_equal( pane.band(), null )

		},

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
			$mol_assert_equal( pane.frame_showed(), true )

		},

		'the heartbeat pings once warmed and re-arms on the pong'( $ ) {
			const timers = timers_fake( $ )
			const { pane, posted, answer } = pane_make( $ )

			$mol_assert_equal( pane.heartbeat(), null )

			pane.warmed( true )

			pane.watchdog()
			answer({ kind: 'sizes', sizes: {} })
			$mol_assert_equal( pane.watchdog(), null )

			const first = pane.heartbeat()
			$mol_assert_equal( first, timers[ timers.length - 1 ] )

			first!.task()

			const pings = posted.filter( m => m.kind === 'ping' )
			$mol_assert_equal( pings.length, 1 )

			const nonce = pings[0].nonce as number
			$mol_assert_equal( nonce > 0, true )

			$mol_assert_equal( pane.watchdog() !== null, true )

			answer({ kind: 'pong', nonce })

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

		'a restart takes the old frame down before it puts a new one up'( $ ) {
			const timers = timers_fake( $ )
			const { pane } = pane_make( $ )

			const frame_before = pane.Scene( pane.scene_key() )
			$mol_assert_equal( pane.sub()[0], frame_before )

			pane.scene_restart()

			$mol_assert_equal( pane.scene_shown(), false )
			$mol_assert_equal( pane.sub().includes( frame_before ), false )
			$mol_assert_equal( pane.sub().some( kid => kid === pane.Scene( pane.scene_key() ) ), false )
			$mol_assert_equal( pane.sub()[0], pane.Overlay() )

			const remount = timers.at( -1 )!
			$mol_assert_equal( remount.delay, pane.remount_delay() )

			remount.task()

			$mol_assert_equal( pane.scene_shown(), true )
			$mol_assert_equal( pane.sub()[0], pane.Scene( pane.scene_key() ) )
			$mol_assert_equal( pane.sub()[0] !== frame_before, true )

		},

		'scene_restart gives a fresh frame and clears stalled'( $ ) {
			const timers = timers_fake( $ )
			const { pane, posted, answer } = pane_make( $ )

			pane.warmed( true )
			pane.watchdog()
			answer({ kind: 'sizes', sizes: {} })

			const frame_before = pane.sub()[0]
			$mol_assert_equal( frame_before, pane.Scene( pane.scene_key() ) )

			pane.stalled( true )
			posted.length = 0

			pane.scene_restart()
			timers.at( -1 )!.task()

			$mol_assert_equal( pane.stalled(), false )
			$mol_assert_equal( pane.ready(), false )
			$mol_assert_equal( pane.warmed(), false )
			$mol_assert_equal( pane.sub()[0] !== frame_before, true )
			$mol_assert_equal( pane.sub()[0], pane.Scene( pane.scene_key() ) )
			$mol_assert_equal( pane.sub().length, 5 )
			$mol_assert_equal( pane.sub()[3], pane.Marks() )
			$mol_assert_equal( pane.sub()[4], pane.Camera() )

			$mol_assert_equal( pane.watchdog(), null )
			$mol_assert_equal( pane.heartbeat(), null )
			$mol_assert_equal( posted.length, 0 )

			answer({ kind: 'ready' })
			pane.watchdog()

			$mol_assert_equal( pane.ready(), true )
			$mol_assert_like(
				posted.map( m => m.kind ),
				[ 'pack_set', 'theme_set', 'doc_set', 'css_set', 'libs_set', 'spots_set', 'camera_set' ],
			)

		},

		'the frame is sandboxed first, addressed never and raised from markup'( $ ) {
			const { pane } = pane_make( $, {}, { scene_bundle: ()=> 'https://vmap.test/scene/web.js' } )

			const attr = pane.Scene( pane.scene_key() ).attr()
			const entries = Object.entries( attr )
			const keys = entries.map( ( [ name ] )=> name )

			$mol_assert_equal( keys[0], 'sandbox' )
			$mol_assert_equal( entries[0][1], 'allow-scripts' )

			$mol_assert_equal( attr.src, null )
			$mol_assert_ok( keys.indexOf( 'srcdoc' ) > 0 )

			const html = String( attr.srcdoc )
			$mol_assert_ok( html.includes( 'src="https://vmap.test/scene/web.js"' ) )
			$mol_assert_ok( html.includes( 'color-scheme:dark' ) )

		},

		'the pack keys the frame and goes down the wire first'( $ ) {
			const one = pane_make( $, {}, { pack_uri: ()=> 'https://one.test/web.js' } )
			const two = pane_make( $, {}, { pack_uri: ()=> 'https://two.test/web.js' } )

			one.pane.watchdog()

			$mol_assert_equal( one.posted[0]?.kind, 'pack_set' )
			$mol_assert_equal( one.posted[0]?.uri, 'https://one.test/web.js' )

			$mol_assert_ok( one.pane.scene_key() !== two.pane.scene_key() )
			$mol_assert_ok( one.pane.scene_key().includes( 'https://one.test/web.js' ) )

			$mol_assert_equal( one.pane.scene_generation(), two.pane.scene_generation() )
			$mol_assert_ok( one.pane.sub()[0] !== two.pane.sub()[0] )

		},

		'a relayed click arms the watchdog and sizes disarm it'( $ ) {
			timers_fake( $ )
			const { pane, answer } = pane_make( $ )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })
			pane.warmed( true )

			pane.watchdog()
			answer({ kind: 'sizes', sizes: {} })
			$mol_assert_equal( pane.watchdog(), null )

			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 50, 25, { buttons: 0 } ) )
			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 50, 25, { buttons: 0 } ) )

			$mol_assert_equal( pane.watchdog() !== null, true )

			answer({ kind: 'sizes', sizes: {} })

			$mol_assert_equal( pane.watchdog(), null )

		},

		'before the first sizes the pulse is quiet'( $ ) {
			timers_fake( $ )
			const { pane } = pane_make( $ )

			pane.node_press( pointer( 5, 5 ) )
			pane.node_release( pointer( 5, 5, { buttons: 0 } ) )

			$mol_assert_equal( pane.heartbeat(), null )

		},

		'a frame that never answered at all is called out, on a limit of its own'( $ ) {
			const timers = timers_fake( $ )
			const { pane, answer } = pane_make( $ )

			answer({ kind: 'ready' })

			pane.watchdog()

			$mol_assert_equal( pane.warmed(), false )
			$mol_assert_ok( pane.watchdog() !== null )

			$mol_assert_equal( timers.at( -1 )!.delay, pane.cold_limit() )
			$mol_assert_ok( pane.cold_limit() > pane.answer_limit() )

			const generation = pane.scene_generation()
			const watch = timers.at( -1 )!

			watch.task()

			$mol_assert_equal( pane.stalled(), false )
			$mol_assert_equal( pane.restart_tries(), 1 )
			$mol_assert_equal( pane.scene_generation(), generation + 1 )

			watch.task()

			$mol_assert_equal( pane.stalled(), true )
			$mol_assert_equal( pane.restart_tries(), 1 )
			$mol_assert_equal( pane.scene_generation(), generation + 1 )

		},

		'the pack channel of the scene lands in its own note and a fresh frame clears it'( $ ) {
			const { pane, answer } = pane_make( $ )

			$mol_assert_equal( pane.pack_note(), '' )

			answer({ kind: 'error', at: 'pack', message: 'Загрузка библиотеки компонентов… http://dead.test/web.js' } )

			$mol_assert_equal( pane.pack_note(), 'Загрузка библиотеки компонентов… http://dead.test/web.js' )
			$mol_assert_equal( pane.error().includes( 'библиотеки' ), false )
			$mol_assert_like( pane.errors(), {} )

			answer({ kind: 'ready' })

			$mol_assert_equal( pane.pack_note(), '' )

		},

		'a frame held up by the pack is called out at once, without a pointless relaunch'( $ ) {
			const timers = timers_fake( $ )
			const { pane, answer } = pane_make( $ )

			answer({ kind: 'ready' })
			pane.watchdog()
			answer({ kind: 'sizes', sizes: {} })

			$mol_assert_equal( pane.watchdog(), null )

			answer({ kind: 'error', at: 'pack', message: 'Загрузка библиотеки компонентов… http://dead.test/web.js' } )
			pane.warmed( false )

			$mol_assert_ok( pane.watchdog() !== null )
			$mol_assert_equal( timers.at( -1 )!.delay, pane.cold_limit() )

			const generation = pane.scene_generation()

			timers.at( -1 )!.task()

			$mol_assert_equal( pane.stalled(), true )
			$mol_assert_equal( pane.restart_tries(), 0 )
			$mol_assert_equal( pane.scene_generation(), generation )

		},

		'a scene that comes up gets its automatic retry back for next time'( $ ) {
			const timers = timers_fake( $ )
			const { pane, answer } = pane_make( $ )

			answer({ kind: 'ready' })
			pane.watchdog()

			timers.at( -1 )!.task()
			$mol_assert_equal( pane.restart_tries(), 1 )

			answer({ kind: 'sizes', sizes: {} })

			$mol_assert_equal( pane.warmed(), true )
			$mol_assert_equal( pane.restart_tries(), 0 )

		},

		'a drag from an output to a fitting input writes exactly two lines'( $ ) {
			const { pane, node, posted } = wired_make( $ )

			pane.camera_shift( new $mol_vector_2d( 100, 50 ) )
			pane.camera_zoom( 2 )

			pane.sizes({ [ `${root}/Calc` ]: box( 0, 0 ), [ `${root}/Map` ]: box( 300, 0 ) })
			pane.picked([ 'Calc' ])

			const before = node.source()

			pane.node_press( pointer( 312, 57 ) )

			$mol_assert_like( pane.wire_drag(), { from: 'Calc', from_prop: 'result', kind: 'number' } )
			$mol_assert_equal( pane.primary(), 'Calc' )

			pane.node_move( pointer( 600, 100 ) )

			$mol_assert_like(
				pane.wire_dots().map( dot => [ dot.node, dot.port.name, dot.side, dot.x, dot.y, dot.lit ] ),
				[ [ 'Map', 'zoom', 'in', 688, 57, true ] ],
			)

			pane.node_move( pointer( 710, 60 ) )

			$mol_assert_like(
				pane.wire_dots().map( dot => [ dot.node, dot.port.name, dot.side, dot.x, dot.y, dot.lit ] ),
				[ [ 'Map', 'zoom', 'in', 688, 57, true ], [ 'Map', 'marker', 'in', 688, 71, false ] ],
			)
			$mol_assert_equal( pane.wire_drag_geometry().startsWith( 'M 312 57 C' ), true )

			pane.node_release( pointer( 688, 57, { buttons: 0 } ) )

			$mol_assert_equal( pane.wire_drag(), null )

			$mol_assert_equal( node.source().split( '\n' ).length, before.split( '\n' ).length + 1 )
			$mol_assert_equal( node.source().includes( '\tcalc_result = Calc result\n' ), true )
			$mol_assert_equal( node.source().includes( 'zoom <= calc_result\n' ), true )
			$mol_assert_like( node.wires(), [ { name: 'calc_result', node: 'Calc', prop: 'result', bidi: false } ] )
			$mol_assert_like( node.links().map( link => [ link.from, link.from_prop, link.to, link.to_prop ] ), [ [ 'Calc', 'result', 'Map', 'zoom' ] ] )

			$mol_assert_equal( clicks( posted ).length, 0 )

			$mol_assert_equal( pane.wire_lines().length, 1 )
			$mol_assert_equal( pane.wire_lines()[0].geometry.startsWith( 'M 312 57 C' ), true )
			$mol_assert_equal( pane.wire_lines()[0].geometry.endsWith( ', 688 57' ), true )
			$mol_assert_equal( pane.wire_dots().find( dot => dot.port.name === 'zoom' )?.linked, undefined )

			const folded = pane.wire_lines()[0].geometry

			pane.picked([ 'Map' ])
			$mol_assert_equal( pane.wire_lines()[0].geometry, folded )
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

			pane.node_press( pointer( 112, 7 ) )
			pane.node_release( pointer( 288, 21, { buttons: 0 } ) )

			$mol_assert_equal( node.source(), before )

		},

		'a press on a dot is a wire even where the part would also be hit'( $ ) {
			const { pane } = wired_make( $ )

			pane.camera_zoom( .5 )
			pane.sizes({ [ `${root}/Calc` ]: box( 0, 0 ) })
			pane.picked([ 'Calc' ])

			pane.node_press( pointer( 62, 7 ) )

			$mol_assert_equal( pane.wire_drag() !== null, true )
			$mol_assert_equal( pane.drag(), null )

			pane.node_release( pointer( 62, 7, { buttons: 0 } ) )

		},

		'a press on a wired input unplugs it and carries on from its source'( $ ) {
			const { pane, node } = wired_make( $ )

			pane.sizes({ [ `${root}/Calc` ]: box( 0, 0 ), [ `${root}/Map` ]: box( 300, 0 ) })

			const before = node.source()
			node.link_add({ from: 'Calc', from_prop: 'result', to: 'Map', to_prop: 'zoom' })

			pane.picked([ 'Map' ])
			pane.node_press( pointer( 288, 7 ) )

			$mol_assert_equal( node.source(), before )
			$mol_assert_like( pane.wire_drag(), { from: 'Calc', from_prop: 'result', kind: 'number' } )

			pane.node_release( pointer( 500, 500, { buttons: 0 } ) )
			$mol_assert_equal( node.source(), before )
			$mol_assert_equal( node.links().length, 0 )

			node.link_add({ from: 'Calc', from_prop: 'result', to: 'Map', to_prop: 'zoom' })
			const wired = node.source()

			pane.node_press( pointer( 288, 7 ) )
			pane.node_release( pointer( 288, 7, { buttons: 0 } ) )

			$mol_assert_equal( node.source(), wired )

		},

		'a wire is drawn from the last known box when one end is no longer reported'( $ ) {
			const { pane, node, answer } = wired_make( $ )

			node.link_add({ from: 'Calc', from_prop: 'result', to: 'Map', to_prop: 'zoom' })

			answer({ kind: 'sizes', sizes: { [ `${root}/Calc` ]: box( 0, 0 ) } })
			$mol_assert_equal( pane.wire_lines().length, 0 )

			answer({ kind: 'sizes', sizes: { [ `${root}/Map` ]: box( 300, 0 ) } })
			const drawn = pane.wire_lines()
			$mol_assert_equal( drawn.length, 1 )

			answer({ kind: 'sizes', sizes: { [ `${root}/Calc` ]: box( 0, 100 ) } })
			$mol_assert_equal( pane.wire_lines().length, 1 )
			$mol_assert_equal( pane.wire_lines()[0].geometry.startsWith( 'M 112 107 C' ), true )
			$mol_assert_equal( pane.wire_lines()[0].geometry.endsWith( ', 288 7' ), true )

			const folded = pane.wire_lines()[0].geometry

			pane.picked([ 'Calc' ])
			$mol_assert_equal( pane.wire_lines()[0].geometry, folded )

		},

		'values_want names the visible wires and the output ports of the visible free parts'( $ ) {
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
			$mol_assert_like( wants(), [ [ 'calc_result', 'Calc.result', 'Calc.op', 'Map.marker' ] ] )

			pane.camera_shift( new $mol_vector_2d( 10, 10 ) )
			pane.values_push()
			$mol_assert_equal( wants().length, 1 )

			pane.camera_shift( new $mol_vector_2d( -5000, -5000 ) )
			pane.values_push()
			$mol_assert_like( wants(), [
				[ 'calc_result', 'Calc.result', 'Calc.op', 'Map.marker' ],
				[ 'calc_2_result', 'Calc_2.result', 'Calc_2.op', 'Map_2.marker' ],
			] )

			$mol_assert_equal( pane.wire_lines().find( line => line.key === 'Map_2.zoom' )?.label, '' )
			pane.message_receive( { data: { ns: $bog_vmap_bridge_ns, kind: 'values', values: { calc_2_result: '42' } }, source: pane.scene_peer() } as unknown as MessageEvent )
			$mol_assert_equal( pane.wire_lines().find( line => line.key === 'Map_2.zoom' )?.label, '42' )

			const stamped = pane.poke_at

			pane.camera_shift( new $mol_vector_2d( -5000, -4000 ) )
			pane.values_push()

			$mol_assert_equal( pane.poke_at, stamped )

		},

		'no value is drawn under a part until the scene answers with sizes'( $ ) {
			const { pane, answer } = wired_make( $ )

			const sizes = { [ `${root}/Calc` ]: box( 0, 0 ), [ `${root}/Map` ]: box( 300, 0 ) }

			pane.sizes( sizes )
			pane.values({ 'Calc.result': '42' })

			$mol_assert_equal( pane.warmed(), false )
			$mol_assert_equal( pane.value_labels().length, 0 )

			answer({ kind: 'sizes', sizes })

			$mol_assert_equal( pane.warmed(), true )
			$mol_assert_equal( pane.value_labels().length, 1 )
			$mol_assert_equal( pane.value_labels()[0], pane.Label( 'Calc' ) )
			$mol_assert_like( pane.Label( 'Calc' ).lines(), [ 'result: 42' ] )
			$mol_assert_like( pane.label_style( 'Calc' ), { left: '0px', top: '50px' } )

		},

		'an output port is one the part declares itself and no wire feeds'( $ ) {
			const { pane, node, answer } = wired_make( $ )

			const sizes = { [ `${root}/Calc` ]: box( 0, 0 ), [ `${root}/Map` ]: box( 300, 0 ) }
			answer({ kind: 'sizes', sizes })

			$mol_assert_like( pane.part_ports( 'Calc' ).map( port => port.name ), [ 'result', 'op', 'title' ] )
			$mol_assert_like( pane.part_outs( 'Calc' ).map( port => port.name ), [ 'result', 'op' ] )
			$mol_assert_like( pane.parts_visible(), [ 'Calc', 'Map' ] )
			$mol_assert_like( pane.ports_visible(), [ 'Calc.result', 'Calc.op', 'Map.zoom', 'Map.marker' ] )

			node.link_add({ from: 'Calc', from_prop: 'result', to: 'Map', to_prop: 'zoom' })

			$mol_assert_like( pane.part_outs( 'Map' ).map( port => port.name ), [ 'marker' ] )
			$mol_assert_like( pane.ports_visible(), [ 'Calc.result', 'Calc.op', 'Map.marker' ] )

		},

		'a port answered with an empty text gets no line, and a part with no line no label'( $ ) {
			const { pane, answer } = wired_make( $ )

			answer({ kind: 'sizes', sizes: { [ `${root}/Calc` ]: box( 0, 0 ), [ `${root}/Map` ]: box( 300, 0 ) } })

			$mol_assert_equal( pane.value_labels().length, 0 )

			pane.values({ 'Calc.result': '', 'Calc.title': 'наследство', 'Map.marker': 'дом' })

			$mol_assert_like( pane.label_lines( 'Calc' ), [] )
			$mol_assert_like( pane.label_lines( 'Map' ), [ 'marker: дом' ] )
			$mol_assert_equal( pane.value_labels().length, 1 )
			$mol_assert_equal( pane.value_labels()[0], pane.Label( 'Map' ) )

		},

		'a table value becomes a row of cells, a plain one a single line'( $ ) {
			const { pane, answer } = wired_make( $ )

			answer({ kind: 'sizes', sizes: { [ `${root}/Calc` ]: box( 0, 0 ) } })
			pane.values({ 'Calc.result': 'city\tsum\nМосква\t7' })

			const label = pane.Label( 'Calc' )

			$mol_assert_like( label.lines(), [ 'result', 'city\tsum', 'Москва\t7' ] )
			$mol_assert_equal( label.rows().length, 3 )
			$mol_assert_equal( label.row_cells( '0' ).length, 1 )
			$mol_assert_equal( label.row_cells( '2' ).length, 2 )
			$mol_assert_equal( label.row_cells( '2' )[1], label.Cell( '2/1' ) )
			$mol_assert_equal( label.cell_text( '0/0' ), 'result' )
			$mol_assert_equal( label.cell_text( '1/1' ), 'sum' )
			$mol_assert_equal( label.cell_text( '2/0' ), 'Москва' )
			$mol_assert_equal( label.cell_text( '2/1' ), '7' )

		},

		'a part carried off the screen stops being asked and stops being labelled'( $ ) {
			const { pane, answer } = wired_make( $ )

			answer({ kind: 'sizes', sizes: { [ `${root}/Calc` ]: box( 0, 0 ) } })
			pane.values({ 'Calc.result': '42' })

			$mol_assert_like( pane.ports_visible(), [ 'Calc.result', 'Calc.op' ] )
			$mol_assert_equal( pane.value_labels().length, 1 )

			pane.camera_shift( new $mol_vector_2d( -2000, 0 ) )

			$mol_assert_like( pane.ports_visible(), [] )
			$mol_assert_equal( pane.value_labels().length, 0 )

		},

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

			$mol_assert_like( pane.part_size( 'Head' ), box( 0, 0, 400, 100 ) )
			$mol_assert_like( pane.node_path( 'Head' ), [ 'Board' ] )
			$mol_assert_like( pane.node_path( 'Loose' ), [] )

		},

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

			pane.camera_shift( new $mol_vector_2d( 100, 50 ) )
			pane.camera_zoom( 2 )

			const point = pane.world_point( pointer( 200 * 2 + 100, 120 * 2 + 50 ) )
			$mol_assert_like( [ ... point ], [ ... world ] )
			$mol_assert_like( pane.insert_slot( point ), flat )

		},

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

			pane.node_press( pointer( 200, 50 ) )
			pane.node_move( pointer( 200, 180 ) )
			pane.node_release( pointer( 200, 180, { buttons: 0 } ) )

			$mol_assert_like( pane.spots(), {} )
			$mol_assert_like( moves, [ { name: 'Head', owner: 'Board', index: 2 } ] )

		},

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

			const inner = pane.insert_slot( [ 250, 150 ] )!
			$mol_assert_equal( inner.owner, 'Bar' )
			$mol_assert_equal( inner.index, 1 )

			$mol_assert_like( inner.line, { x: 200, y: 100, width: 0, height: 100 } )

			const outer = pane.insert_slot( [ 250, 400 ] )!
			$mol_assert_equal( outer.owner, 'Page' )
			$mol_assert_equal( outer.index, 3 )

			$mol_assert_equal( pane.node_at( [ 250, 150 ] ), 'Right' )

		},

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

	const ports: { readonly [ klass: string ]: readonly $bog_vmap_app_wire_port[] } = {
		[ `${d}my_calc` ]: [
			{ name: 'result', next: false, own: true, kind: 'number' },
			{ name: 'op', next: true, own: true, kind: 'string' },
			{ name: 'title', next: false, own: false, kind: 'string' },
		],
		[ `${d}my_map` ]: [
			{ name: 'zoom', next: true, own: true, kind: 'number' },
			{ name: 'marker', next: true, own: true, kind: 'string' },
		],
	}

	function wired_make(
		$: $mol_ambient_context,
		parts = [ `Calc ${d}my_calc`, `Map ${d}my_map` ],
	) {
		const node = $bog_vmap_lang_node.make({ $ })
		node.source( [ `${root} ${d}mol_view`, ... parts.map( part => '\t' + part ), '\tsub /', '' ].join( '\n' ) )

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

namespace $ {
	const d = '$'

	const root = `${d}bog_vmap_app_page`

	const pane_make = ( $: $mol_ambient_context )=> {
		const peer = { origin: 'null', postMessage() {} }

		const pane = $$.$bog_vmap_app_pane.make({
			$,
			doc_root: ()=> root,
			doc_names: ()=> [ 'Calc' ],
			pane_rect: ()=> ({ left: 0, top: 0, width: 1000, height: 800 }),
			scene_peer: ()=> peer,
		})

		pane.handshake( pane.scene_key(), 1 )

		const answer = ( data: object )=> pane.message_receive(
			{ data: { ns: $bog_vmap_bridge_ns, ... data }, source: peer } as unknown as MessageEvent
		)

		return { pane, answer }
	}

	$mol_test({
		'a failure the scene attributes lands on that node'( $ ) {
			const { pane, answer } = pane_make( $ )

			answer({ kind: 'error', at: 'runtime', message: 'boom', node: 'Calc' })

			$mol_assert_equal( pane.node_error( 'Calc' ), 'исполнение — Calc: boom' )
			$mol_assert_equal( pane.node_error( 'Hero' ), '' )

		},

		'a failure with no node stays off every node'( $ ) {
			const { pane, answer } = pane_make( $ )

			answer({ kind: 'error', at: 'compile', message: 'boom' })

			$mol_assert_equal( Object.keys( pane.errors() ).length, 0 )
			$mol_assert_equal( pane.error().includes( 'boom' ), true )

		},

		'the two channels of one node are both shown on it'( $ ) {
			const { pane, answer } = pane_make( $ )

			answer({ kind: 'error', at: 'compile', message: 'first', node: 'Calc' })
			answer({ kind: 'error', at: 'runtime', message: 'second', node: 'Calc' })

			$mol_assert_equal(
				pane.node_error( 'Calc' ),
				'компиляция — Calc: first\nисполнение — Calc: second',
			)

		},

		'a cleared channel takes the mark off the node'( $ ) {
			const { pane, answer } = pane_make( $ )

			answer({ kind: 'error', at: 'runtime', message: 'boom', node: 'Calc' })
			answer({ kind: 'error', at: 'runtime', message: null, node: 'Calc' })

			$mol_assert_equal( pane.node_error( 'Calc' ), '' )

		},

		'a fresh scene starts with no failure on any node'( $ ) {
			const { pane, answer } = pane_make( $ )

			answer({ kind: 'error', at: 'compile', message: 'boom', node: 'Calc' })
			answer({ kind: 'ready' })

			$mol_assert_equal( pane.node_error( 'Calc' ), '' )

		},

		'a mark is drawn only where the node has been measured'( $ ) {
			const { pane, answer } = pane_make( $ )

			answer({ kind: 'error', at: 'runtime', message: 'boom', node: 'Calc' })

			$mol_assert_equal( pane.error_marks().length, 0 )

			answer({
				kind: 'sizes',
				sizes: { [ `${ root }/Calc` ]: { x: 10, y: 20, width: 100, height: 50 } },
			})

			$mol_assert_equal( pane.error_marks().length, 1 )
			$mol_assert_equal( pane.mark_hint( 'Calc' ), 'исполнение — Calc: boom' )

		},

		'the mark of a failure reaches the screen'( $ ) {
			const { pane, answer } = pane_make( $ )

			answer({
				kind: 'sizes',
				sizes: { [ `${ root }/Calc` ]: { x: 10, y: 20, width: 100, height: 50 } },
			})
			answer({ kind: 'error', at: 'runtime', message: 'boom', node: 'Calc' })

			pane.dom_tree()

			const node = pane.Mark( 'Calc' ).dom_tree()

			$mol_assert_equal( node.getAttribute( 'title' ), 'исполнение — Calc: boom' )
			$mol_assert_equal( pane.dom_node().contains( node ), true )

		},

		'a node that stops being drawn keeps its mark where it was'( $ ) {
			const { pane, answer } = pane_make( $ )

			answer({
				kind: 'sizes',
				sizes: { [ `${ root }/Calc` ]: { x: 10, y: 20, width: 100, height: 50 } },
			})

			answer({ kind: 'sizes', sizes: {} })
			answer({ kind: 'error', at: 'runtime', message: 'boom', node: 'Calc' })

			$mol_assert_equal( pane.error_marks().length, 1 )
			$mol_assert_equal( pane.mark_style( 'Calc' ).left, '10px' )
			$mol_assert_equal( pane.mark_style( 'Calc' ).top, '20px' )

		},

		'a node never drawn gets no mark, and is still told about'( $ ) {
			const { pane, answer } = pane_make( $ )

			answer({ kind: 'error', at: 'compile', message: 'boom', node: 'Calc' })

			$mol_assert_equal( pane.error_marks().length, 0 )
			$mol_assert_equal( pane.node_error( 'Calc' ), 'компиляция — Calc: boom' )

		},

		'the code panel shows the failure of the node it is editing'( $ ) {
			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )

			const name = app.selected()!
			const pane = app.Pane()

			pane.error_at( 'runtime', 'исполнение: boom' )
			pane.error_node( 'runtime', name )

			$mol_assert_equal( app.code_error(), 'исполнение: boom' )

			app.selected( null )
			$mol_assert_equal( app.code_error(), '' )

		},

		'a file dropped on the canvas is handed on with the point it landed at'( $ ) {

			const { pane } = pane_make( $ )

			const dropped = [] as $$.$bog_vmap_app_pane_files[]
			pane.files_drop = next => {
				if( next ) dropped.push( next )
				return next ?? null
			}

			const file = new $mol_blob( [ new Uint8Array([ 137 ]) ], { type: 'image/png' } )

			let prevented = 0

			pane.file_take({
				clientX: 200,
				clientY: 150,
				preventDefault: ()=> { prevented ++ },
				dataTransfer: { files: [ file ] },
			} as unknown as DragEvent )

			$mol_assert_equal( prevented, 1 )
			$mol_assert_equal( dropped.length, 1 )
			$mol_assert_equal( dropped[ 0 ].files[ 0 ], file )
			$mol_assert_like( [ dropped[ 0 ].x, dropped[ 0 ].y ], [ 200, 150 ] )

		},

		'a drag that carries no file hands nothing on'( $ ) {

			const { pane } = pane_make( $ )

			const dropped = [] as $$.$bog_vmap_app_pane_files[]
			pane.files_drop = next => {
				if( next ) dropped.push( next )
				return next ?? null
			}

			pane.file_take({
				clientX: 200,
				clientY: 150,
				preventDefault: ()=> {},
				dataTransfer: { files: [] },
			} as unknown as DragEvent )

			$mol_assert_equal( dropped.length, 0 )

		},

		'a drag over the canvas is claimed, or the browser opens the file itself'( $ ) {

			const { pane } = pane_make( $ )

			let prevented = 0
			pane.file_over({ preventDefault: ()=> { prevented ++ } } as unknown as Event )

			$mol_assert_equal( prevented, 1 )

		},

		async 'a file whose write suspends still becomes a node, though the drag empties itself'( $ ) {

			const uri = 'https://baza.test/?BAZA:file=TQzejQsT_m3PFV7J3;name=logo.png'

			let waited = 0

			const store = $bog_vmap_app_store.make({
				$,
				doc_land_config: ()=> null,
				asset_put: ()=> {
					if( waited ++ === 0 ) $mol_fail_hidden( Promise.resolve() )
					return uri
				},
			})
			store.doc_add( 'Сцена 1' )

			const stage = $bog_vmap_app_flow_stage( $, { store } )
			const dom = $.$mol_dom_context

			const carried = [ new dom.File(
				[ new Uint8Array([ 137, 80, 78, 71 ]) ],
				'logo.png',
				{ type: 'image/png' },
			) ]

			let taken = 0

			const point = stage.client([ 300, 200 ])
			const drop = new dom.Event( 'drop', { bubbles: true, cancelable: true } )

			Object.defineProperty( drop, 'clientX', { value: point[ 0 ] } )
			Object.defineProperty( drop, 'clientY', { value: point[ 1 ] } )
			Object.defineProperty( drop, 'dataTransfer', {
				value: { get files() { return taken ++ ? [] : carried } },
			} )

			stage.overlay().dispatchEvent( drop )

			await $bog_vmap_app_flow_settle( ()=> waited > 1 )
			stage.redraw()

			$mol_assert_equal( waited, 2 )
			$mol_assert_equal( taken, 1 )
			$mol_assert_equal( stage.app.selected(), 'Image' )
			$mol_assert_ok( stage.app.doc_source().includes( `uri \\${ uri }` ) )
			$mol_assert_like( stage.app.spots(), { Image: { x: 300, y: 200 } } )

		},

	})

}

namespace $ {
	const d = '$'

	const root = `${d}bog_vmap_app_board`

	const pane_make = ( $: $mol_ambient_context, width: number, height: number )=> {
		const peer = { origin: 'null', postMessage() {} }

		const pane = $$.$bog_vmap_app_pane.make({
			$,
			doc_root: ()=> root,
			doc_names: ()=> [ 'Near', 'Far' ],
			pane_rect: ()=> ({ left: 0, top: 0, width, height }),
			scene_peer: ()=> peer,
		})

		const screen = ( box: $bog_vmap_bridge_rect )=> {
			const zoom = pane.camera_zoom()
			const shift = pane.camera_shift()
			return {
				left: box.x * zoom + shift[0],
				top: box.y * zoom + shift[1],
				right: ( box.x + box.width ) * zoom + shift[0],
				bottom: ( box.y + box.height ) * zoom + shift[1],
			}
		}

		const inside = ( box: $bog_vmap_bridge_rect )=> {
			const seen = screen( box )
			return seen.left >= 0 && seen.top >= 0 && seen.right <= width && seen.bottom <= height
		}

		return { pane, screen, inside }
	}

	$mol_test({
		'a board wider than the pane is fitted whole and centred'( $ ) {
			const { pane, screen, inside } = pane_make( $, 600, 500 )

			const board = { x: -340, y: 250, width: 1280, height: 720 }

			$mol_assert_ok( Boolean( pane.camera_fit([ board ]) ) )
			$mol_assert_equal( pane.camera_zoom(), ( 600 - 48 ) / 1280 )
			$mol_assert_equal( inside( board ), true )

			const seen = screen( board )
			$mol_assert_equal( Math.round( ( seen.left + seen.right ) / 2 ), 300 )
			$mol_assert_equal( Math.round( ( seen.top + seen.bottom ) / 2 ), 250 )

		},

		'fitting a small box never zooms past life size'( $ ) {
			const { pane, inside } = pane_make( $, 600, 500 )

			const box = { x: 0, y: 0, width: 40, height: 20 }

			pane.camera_fit([ box ])

			$mol_assert_equal( pane.camera_zoom(), 1 )
			$mol_assert_equal( inside( box ), true )

		},

		'reset view brings every free node into the frame'( $ ) {
			const { pane, inside } = pane_make( $, 600, 500 )

			const near = { x: -600, y: -400, width: 200, height: 100 }
			const far = { x: 1800, y: 900, width: 200, height: 100 }

			pane.sizes({ [ `${ root }/Near` ]: near, [ `${ root }/Far` ]: far })

			pane.camera_shift( new $mol_vector_2d( 700, 700 ) )
			pane.camera_zoom( 4 )

			pane.camera_reset()

			$mol_assert_equal( inside( near ), true )
			$mol_assert_equal( inside( far ), true )

		},

		'reset view on an empty document goes back to the origin'( $ ) {
			const { pane } = pane_make( $, 600, 500 )

			pane.camera_shift( new $mol_vector_2d( 700, 700 ) )
			pane.camera_zoom( 4 )

			pane.camera_reset()

			$mol_assert_equal( pane.camera_zoom(), 1 )
			$mol_assert_like( [ ... pane.camera_shift() ], [ 0, 0 ] )

		},

		'a node laid out inside a board does not stretch the reset'( $ ) {
			const { pane, inside } = pane_make( $, 600, 500 )

			const board = { x: 500, y: 400, width: 400, height: 300 }

			pane.sizes({
				[ `${ root }/Near` ]: board,
				[ `${ root }/Near/Far` ]: { x: 520, y: 420, width: 100, height: 50 },
			})

			pane.camera_reset()

			$mol_assert_equal( pane.camera_zoom(), 1 )
			$mol_assert_equal( inside( board ), true )

		},

	})

}

namespace $ {
	const d = '$'

	const root = `${d}bog_vmap_app_hover`

	const ports = [
		{ name: 'result', next: false, own: true, kind: 'number' as const },
		{ name: 'op', next: true, own: true, kind: 'string' as const },
		{ name: 'title', next: false, own: false, kind: 'string' as const },
	]

	const pane_make = ( $: $mol_ambient_context )=> {
		const peer = { origin: 'null', postMessage() {} }

		const pane = $$.$bog_vmap_app_pane.make({
			$,
			doc_root: ()=> root,
			doc_names: ()=> [ 'Calc', 'Map' ],
			pane_rect: ()=> ({ left: 0, top: 0, width: 1000, height: 800 }),
			scene_peer: ()=> peer,
			part_ports: ()=> ports,
			wires: ()=> [],
		})

		pane.sizes({
			[ `${ root }/Calc` ]: { x: 0, y: 0, width: 100, height: 50 },
			[ `${ root }/Map` ]: { x: 300, y: 0, width: 100, height: 50 },
		})

		return pane
	}

	const pointer = ( clientX: number, clientY: number )=> ({
		button: 0,
		buttons: 0,
		pointerId: 1,
		clientX,
		clientY,
		altKey: false,
		ctrlKey: false,
		metaKey: false,
		shiftKey: false,
		preventDefault() {},
	}) as unknown as PointerEvent

	const dots_of = ( pane: $$.$bog_vmap_app_pane, node: string )=> {
		return pane.wire_dots().filter( dot => dot.node === node )
	}

	$mol_test({
		'the ports of the node under the pointer come out named'( $ ) {
			const pane = pane_make( $ )

			$mol_assert_equal( dots_of( pane, 'Map' ).length, 0 )

			pane.node_move( pointer( 350, 25 ) )

			$mol_assert_equal( pane.hovered(), 'Map' )

			const dots = dots_of( pane, 'Map' )
			$mol_assert_equal( dots.length, 4 )
			$mol_assert_equal( dots.every( dot => Boolean( dot.port.name ) ), true )

			$mol_assert_like(
				[ ... new Set( dots.map( dot => dot.port.name ) ) ].sort(),
				[ 'op', 'result' ],
			)

		},

		'the pointer off the parts leaves the named ports to the picked one'( $ ) {
			const pane = pane_make( $ )

			pane.picked([ 'Calc' ])
			pane.node_move( pointer( 350, 25 ) )

			$mol_assert_equal( dots_of( pane, 'Calc' ).length, 4 )
			$mol_assert_equal( dots_of( pane, 'Map' ).length, 4 )

			pane.node_move( pointer( 700, 400 ) )

			$mol_assert_equal( pane.hovered(), null )
			$mol_assert_equal( dots_of( pane, 'Calc' ).length, 4 )
			$mol_assert_equal( dots_of( pane, 'Map' ).length, 0 )

		},

		'the pointer gone off the canvas takes the hover with it'( $ ) {
			const pane = pane_make( $ )

			pane.node_move( pointer( 350, 25 ) )
			$mol_assert_equal( pane.hovered(), 'Map' )

			pane.node_away()

			$mol_assert_equal( pane.hovered(), null )
			$mol_assert_equal( dots_of( pane, 'Map' ).length, 0 )

		},

		'the picked node stays named while the pointer hovers another'( $ ) {
			const pane = pane_make( $ )

			pane.picked([ 'Calc' ])
			pane.node_move( pointer( 350, 25 ) )

			const picked = dots_of( pane, 'Calc' )

			$mol_assert_equal( picked.length, 4 )
			$mol_assert_like(
				[ ... new Set( picked.map( dot => dot.port.name ) ) ].sort(),
				[ 'op', 'result' ],
			)

		},

		'a drag in progress keeps the hover out of the dots'( $ ) {
			const pane = pane_make( $ )

			pane.picked([ 'Calc' ])
			pane.wire_drag({ from: 'Calc', from_prop: 'result', kind: 'number' })
			pane.node_move( pointer( 350, 25 ) )

			$mol_assert_equal( pane.hovered(), null )

		},

	})

}
