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

	const session_fake = ( $: $mol_ambient_context ) => {

		const kept = {} as { [ key: string ]: string | undefined }

		class $mol_state_session_fake< Value > extends $mol_state_session< Value > {
			@ $mol_mem_key
			static override value< Value >( key: string, next?: Value | null ): Value {

				if( next === undefined ) return JSON.parse( kept[ key ] ?? 'null' )

				if( next === null ) delete kept[ key ]
				else kept[ key ] = JSON.stringify( next )

				return next as Value
			}
		}

		$.$mol_state_session = $mol_state_session_fake

		return kept
	}

	const doc_opened = ( $: $mol_ambient_context ) => {
		return ( next?: string ) => $.$mol_state_session.value< string >( 'doc_opened', next ) ?? 'one'
	}

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
			$mol_assert_like( stage.app.spots(), { Calc: { x: 104, y: 74 } } )

			$mol_assert_equal( stage.pane.overlay_style().clipPath, 'none' )

			const overlay = stage.overlay()
			const from = stage.part_center( 'Calc' )

			stage.press( overlay, from )
			stage.move( overlay, [ from[0] + 60, from[1] + 40 ] )
			stage.release( overlay, [ from[0] + 60, from[1] + 40 ] )
			stage.redraw()

			$mol_assert_like( stage.app.spots(), { Calc: { x: 164, y: 114 } } )

		},

		'a drag with Alt leaves the original where it was and drops a copy under the pointer'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )

			const overlay = stage.overlay()
			const from = stage.part_center( 'Calc' )
			const to = [ from[0] + 60, from[1] + 40 ] as const

			stage.press( overlay, from, { altKey: true } )
			stage.move( overlay, to, { altKey: true } )
			stage.release( overlay, to, { altKey: true } )
			stage.redraw()

			$mol_assert_like( stage.app.spots(), { Calc: { x: 104, y: 74 }, Calc_2: { x: 164, y: 114 } } )
			$mol_assert_like( [ ... stage.app.picked() ], [ 'Calc_2' ] )
			$mol_assert_ok( stage.app.doc_source().includes( `Calc_2 ${ calc }` ) )

		},

		'Alt taken up in the middle of a drag still drops a copy, Alt let go moves the original'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )

			const overlay = stage.overlay()
			const first = stage.part_center( 'Calc' )
			const away = [ first[0] + 60, first[1] + 40 ] as const

			stage.press( overlay, first )
			stage.move( overlay, away )
			stage.release( overlay, away, { altKey: true } )
			stage.redraw()
			stage.scene.flush()

			$mol_assert_like( stage.app.spots(), { Calc: { x: 104, y: 74 }, Calc_2: { x: 164, y: 114 } } )

			const second = stage.part_center( 'Calc_2' )
			const back = [ second[0] - 30, second[1] - 20 ] as const

			stage.press( overlay, second, { altKey: true } )
			stage.move( overlay, back, { altKey: true, metaKey: true } )
			stage.release( overlay, back, { metaKey: true } )
			stage.redraw()

			$mol_assert_like( stage.app.spots(), { Calc: { x: 104, y: 74 }, Calc_2: { x: 134, y: 94 } } )

		},

		'Escape closes the menu of the canvas'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )
			const dom = $.$mol_dom_context

			stage.overlay().dispatchEvent( new dom.MouseEvent( 'contextmenu', {
				bubbles: true,
				cancelable: true,
				clientX: stage.client([ 480, 380 ])[ 0 ],
				clientY: stage.client([ 480, 380 ])[ 1 ],
			} ) )

			stage.redraw()

			$mol_assert_equal( stage.pane.menu_showed(), true )
			$mol_assert_equal( stage.pane.menu_on_node(), false )

			dom.document.dispatchEvent( new dom.KeyboardEvent( 'keydown', { key: 'Escape', bubbles: true } ) )
			stage.redraw()

			$mol_assert_equal( stage.pane.menu_showed(), false )

		},

		'Escape closes the menu of a node'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )
			const dom = $.$mol_dom_context

			stage.drop( calc, stage.client([ 200, 150 ]) )

			const at = stage.part_center( 'Calc' )

			stage.overlay().dispatchEvent( new dom.MouseEvent( 'contextmenu', {
				bubbles: true,
				cancelable: true,
				clientX: at[ 0 ],
				clientY: at[ 1 ],
			} ) )

			stage.redraw()

			$mol_assert_equal( stage.pane.menu_showed(), true )
			$mol_assert_equal( stage.pane.menu_on_node(), true )

			dom.document.dispatchEvent( new dom.KeyboardEvent( 'keydown', { key: 'Escape', bubbles: true } ) )
			stage.redraw()

			$mol_assert_equal( stage.pane.menu_showed(), false )

		},

		'while Alt is held the place of the original is marked, and the mark goes on release'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )

			const overlay = stage.overlay()
			const from = stage.part_center( 'Calc' )
			const to = [ from[0] + 60, from[1] + 40 ] as const

			const marks = ()=> stage.pane.ghost_views().length

			$mol_assert_equal( marks(), 0 )

			stage.press( overlay, from, { altKey: true } )
			stage.move( overlay, to, { altKey: true } )
			stage.redraw()

			$mol_assert_equal( marks(), 1 )
			$mol_assert_like( stage.pane.ghost_style( 'Calc' ), {
				left: '104px',
				top: '74px',
				width: '100px',
				height: '50px',
			} )

			stage.release( overlay, to, { altKey: true } )
			stage.redraw()

			$mol_assert_equal( marks(), 0 )

			stage.press( overlay, stage.part_center( 'Calc' ) )

			$mol_assert_equal( marks(), 0 )

			stage.release( overlay, stage.part_center( 'Calc' ) )

		},

		'Alt let go in the middle of a drag takes the mark away'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )

			const overlay = stage.overlay()
			const from = stage.part_center( 'Calc' )

			stage.press( overlay, from, { altKey: true } )
			stage.move( overlay, [ from[0] + 30, from[1] ], { altKey: true } )

			$mol_assert_equal( stage.pane.ghost_views().length, 1 )

			stage.move( overlay, [ from[0] + 60, from[1] ] )

			$mol_assert_equal( stage.pane.ghost_views().length, 0 )

			stage.release( overlay, [ from[0] + 60, from[1] ] )
			stage.redraw()

			$mol_assert_like( stage.app.spots(), { Calc: { x: 164, y: 74 } } )

		},

		'Escape in the middle of a drag puts the node back and takes the mark away'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )

			const overlay = stage.overlay()
			const from = stage.part_center( 'Calc' )
			const to = [ from[0] + 60, from[1] + 40 ] as const

			stage.press( overlay, from, { altKey: true } )
			stage.move( overlay, to, { altKey: true } )

			$mol_assert_equal( stage.pane.ghost_views().length, 1 )

			stage.pane.key_down({
				key: 'Escape',
				code: 'Escape',
				altKey: true,
				ctrlKey: false,
				metaKey: false,
				shiftKey: false,
				target: null,
				preventDefault() {},
			})

			stage.redraw()

			$mol_assert_equal( stage.pane.ghost_views().length, 0 )
			$mol_assert_equal( stage.pane.drag(), null )
			$mol_assert_like( stage.app.spots(), { Calc: { x: 104, y: 74 } } )

			stage.release( overlay, to, { altKey: true } )
			stage.redraw()

			$mol_assert_like( stage.app.spots(), { Calc: { x: 104, y: 74 } } )
			$mol_assert_equal( stage.app.doc_source().includes( 'Calc_2' ), false )

		},

		'the mark is no node: nothing stands at its place and nothing drops into it'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )

			const overlay = stage.overlay()
			const from = stage.part_center( 'Calc' )
			const to = [ from[0] + 300, from[1] + 200 ] as const

			stage.press( overlay, from, { altKey: true } )
			stage.move( overlay, to, { altKey: true } )
			stage.redraw()

			$mol_assert_equal( stage.pane.ghost_views().length, 1 )

			const place = [ 104 + 50, 74 + 25 ] as const

			$mol_assert_equal( stage.pane.insert_slot( place ), null )
			$mol_assert_like( [ ... stage.pane.part_names() ], [ 'Calc' ] )
			$mol_assert_equal( Object.keys( stage.pane.sizes() ).length, 1 )

			const ghost = stage.pane.Ghost( 'Calc' ).dom_node()

			$mol_assert_equal( stage.pane.dom_node().contains( ghost ), true )
			$mol_assert_equal( ghost.getAttribute( 'id' )!.includes( 'Ghost' ), true )

		},

		'a copy dragged out with Alt carries the overrides and the wire of the original'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( map, stage.client([ 160, 120 ]) )
			stage.drop( calc, stage.client([ 420, 120 ]) )

			const node = stage.app.node()
			const tree = node.tree()

			node.over_set( 'Calc', 'title', tree.struct( 'title', [ tree.data( 'Итог' ) ] ) )
			stage.app.link_add({ from: 'Map', from_prop: 'marker', to: 'Calc', to_prop: 'op' })
			stage.redraw()

			const wired = stage.app.node().over_tree( 'Calc', 'op' )!.toString()

			const overlay = stage.overlay()
			const from = stage.part_center( 'Calc' )
			const to = [ from[0] + 40, from[1] + 30 ] as const

			stage.press( overlay, from, { altKey: true } )
			stage.move( overlay, to, { altKey: true } )
			stage.release( overlay, to, { altKey: true } )
			stage.redraw()

			$mol_assert_equal( stage.app.node().over_tree( 'Calc_2', 'title' )!.toString(), 'title \\Итог\n' )
			$mol_assert_equal( stage.app.node().over_tree( 'Calc_2', 'op' )!.toString(), wired )
			$mol_assert_equal( stage.app.node().over_tree( 'Calc', 'title' )!.toString(), 'title \\Итог\n' )

		},

		'a drag with Alt into a board leaves the original outside and drops the copy inside'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.pane.tool( 'board' )
			stage.tap( stage.client([ 40, 40 ]) )
			stage.drop( calc, stage.client([ 520, 430 ]) )

			const node = stage.app.node()

			$mol_assert_like( node.sub_names( 'Page' ), [] )

			const overlay = stage.overlay()
			const from = stage.part_center( 'Calc' )
			const into = stage.client([ 120, 120 ])

			stage.press( overlay, from, { altKey: true } )
			stage.move( overlay, stage.client([ 480, 300 ]), { altKey: true } )

			$mol_assert_equal( stage.pane.slot(), null )
			$mol_assert_like( stage.app.spots()[ 'Calc' ], { x: 430, y: 275 } )

			stage.move( overlay, into, { altKey: true } )

			$mol_assert_ok( stage.pane.slot() )
			$mol_assert_equal( stage.pane.ghost_views().length, 1 )

			stage.release( overlay, into, { altKey: true } )
			stage.redraw()
			stage.scene.flush()

			$mol_assert_like( stage.app.node().sub_names( 'Page' ), [ 'Calc_2' ] )
			$mol_assert_like( stage.app.node().sub_names(), [ 'Page', 'Calc' ] )
			$mol_assert_like( stage.app.spots()[ 'Calc' ], { x: 424, y: 354 } )
			$mol_assert_equal( stage.app.spots()[ 'Calc_2' ], undefined )
			$mol_assert_equal( stage.pane.ghost_views().length, 0 )

		},

		'a nested node dragged with Alt is copied beside itself, inside its own board'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.pane.tool( 'board' )
			stage.tap( stage.client([ 40, 40 ]) )
			stage.drop( calc, stage.client([ 520, 430 ]) )
			stage.drop( map, stage.client([ 560, 200 ]) )

			stage.app.tree_move({ names: [ 'Calc' ], owner: 'Page', index: 0 })
			stage.app.tree_move({ names: [ 'Map' ], owner: 'Page', index: 1 })
			stage.redraw()
			stage.scene.flush()

			$mol_assert_like( stage.app.node().sub_names( 'Page' ), [ 'Calc', 'Map' ] )

			const overlay = stage.overlay()
			const from = stage.part_center( 'Calc' )
			const near = [ from[0] + 8, from[1] + 8 ] as const

			stage.press( overlay, from, { altKey: true } )
			stage.move( overlay, near, { altKey: true } )
			stage.release( overlay, near, { altKey: true } )
			stage.redraw()
			stage.scene.flush()

			$mol_assert_like( stage.app.node().sub_names( 'Page' ), [ 'Calc', 'Calc_2', 'Map' ] )
			$mol_assert_equal( stage.app.spots()[ 'Calc_2' ], undefined )
			$mol_assert_like( [ ... stage.app.picked() ], [ 'Calc_2' ] )

		},

		'a drop into a board without Alt still moves the part, copies nothing'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.pane.tool( 'board' )
			stage.tap( stage.client([ 40, 40 ]) )
			stage.drop( calc, stage.client([ 520, 430 ]) )

			const overlay = stage.overlay()
			const from = stage.part_center( 'Calc' )
			const into = stage.client([ 120, 120 ])

			stage.press( overlay, from )
			stage.move( overlay, into )
			stage.release( overlay, into )
			stage.redraw()
			stage.scene.flush()

			$mol_assert_like( stage.app.node().sub_names( 'Page' ), [ 'Calc' ] )
			$mol_assert_equal( stage.app.doc_source().includes( 'Calc_2' ), false )
			$mol_assert_equal( stage.app.spots()[ 'Calc' ], undefined )

		},

		'a picked set dragged into a board moves the whole set, top to bottom, in one write'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.pane.tool( 'board' )
			stage.tap( stage.client([ 40, 40 ]) )
			stage.drop( calc, stage.client([ 520, 430 ]) )
			stage.drop( map, stage.client([ 560, 200 ]) )

			stage.app.picked([ 'Calc', 'Map' ])
			stage.redraw()

			const app = stage.app
			let writes = 0
			const kept = app.doc_source.bind( app )
			app.doc_source = ( next?: string )=> {
				if( next !== undefined ) ++ writes
				return kept( next )
			}

			const overlay = stage.overlay()
			const from = stage.part_center( 'Calc' )
			const into = stage.client([ 120, 120 ])

			stage.press( overlay, from )
			stage.move( overlay, into )
			stage.release( overlay, into )

			Reflect.deleteProperty( app, 'doc_source' )
			stage.redraw()
			stage.scene.flush()

			$mol_assert_like( stage.app.node().sub_names( 'Page' ), [ 'Map', 'Calc' ] )
			$mol_assert_like( stage.app.node().sub_names(), [ 'Page' ] )
			$mol_assert_equal( stage.app.spots()[ 'Calc' ], undefined )
			$mol_assert_equal( stage.app.spots()[ 'Map' ], undefined )
			$mol_assert_equal( writes, 1 )

		},

		'a drag by a part outside the pick takes only it and the pick moves onto it'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.pane.tool( 'board' )
			stage.tap( stage.client([ 40, 40 ]) )
			stage.drop( calc, stage.client([ 520, 430 ]) )
			stage.drop( map, stage.client([ 560, 200 ]) )
			stage.drop( `${ d }mol_number`, stage.client([ 600, 300 ]) )

			stage.app.picked([ 'Calc', 'Map' ])
			stage.redraw()

			const spots = stage.app.spots()

			const overlay = stage.overlay()
			const from = stage.part_center( 'Number' )
			const into = stage.client([ 120, 120 ])

			stage.press( overlay, from )
			$mol_assert_like( [ ... stage.app.picked() ], [ 'Number' ] )

			stage.move( overlay, into )
			stage.release( overlay, into )
			stage.redraw()
			stage.scene.flush()

			$mol_assert_like( stage.app.node().sub_names( 'Page' ), [ 'Number' ] )
			$mol_assert_like( stage.app.node().sub_names(), [ 'Page', 'Calc', 'Map' ] )
			$mol_assert_like( stage.app.spots()[ 'Calc' ], spots[ 'Calc' ] )
			$mol_assert_like( stage.app.spots()[ 'Map' ], spots[ 'Map' ] )

		},

		'a picked set dragged into a board with Alt copies the whole set, top to bottom'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.pane.tool( 'board' )
			stage.tap( stage.client([ 40, 40 ]) )
			stage.drop( calc, stage.client([ 520, 430 ]) )
			stage.drop( map, stage.client([ 560, 200 ]) )

			stage.app.picked([ 'Map', 'Calc' ])
			stage.redraw()

			const overlay = stage.overlay()
			const from = stage.part_center( 'Calc' )
			const into = stage.client([ 120, 120 ])

			stage.press( overlay, from, { altKey: true } )
			stage.move( overlay, into, { altKey: true } )
			stage.release( overlay, into, { altKey: true } )
			stage.redraw()
			stage.scene.flush()

			$mol_assert_like( stage.app.node().sub_names( 'Page' ), [ 'Map_2', 'Calc_2' ] )
			$mol_assert_like( stage.app.node().sub_names(), [ 'Page', 'Calc', 'Map' ] )
			$mol_assert_like( [ ... stage.app.picked() ], [ 'Map_2', 'Calc_2' ] )
			$mol_assert_equal( stage.app.spots()[ 'Map_2' ], undefined )
			$mol_assert_equal( stage.app.spots()[ 'Calc_2' ], undefined )
			$mol_assert_like( stage.app.spots()[ 'Map' ], { x: 464, y: 124 } )
			$mol_assert_like( stage.app.spots()[ 'Calc' ], { x: 424, y: 354 } )

		},

		'a nested node dragged with Alt out of every container is copied beside itself'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.pane.tool( 'board' )
			stage.tap( stage.client([ 60, 60 ]) )
			stage.drop( calc, stage.client([ 120, 120 ]) )
			stage.drop( map, stage.client([ 560, 420 ]) )

			const node = stage.app.node()

			stage.app.tree_move({ names: [ 'Calc' ], owner: 'Page', index: 0 })
			stage.redraw()
			stage.scene.flush()

			$mol_assert_like( node.sub_names( 'Page' ), [ 'Calc' ] )

			stage.app.picked([ 'Map', 'Calc' ])
			stage.redraw()

			const overlay = stage.overlay()
			const from = stage.part_center( 'Calc' )
			const to = stage.client([ 550, 460 ])

			stage.press( overlay, from, { altKey: true } )
			stage.move( overlay, to, { altKey: true } )
			stage.release( overlay, to, { altKey: true } )
			stage.redraw()
			stage.scene.flush()

			$mol_assert_equal( stage.pane.slot(), null )
			$mol_assert_like( stage.app.node().sub_names( 'Page' ), [ 'Calc', 'Calc_2' ] )
			$mol_assert_like( [ ... stage.app.picked() ], [ 'Calc_2' ] )
			$mol_assert_equal( stage.app.spots()[ 'Calc_2' ], undefined )
			$mol_assert_equal( stage.app.doc_source().includes( 'Map_2' ), false )

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
			$mol_assert_ok( stage.pane.overlay_style().clipPath.includes( '104px 74px' ) )
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
				Calc: { x: 44, y: 54 },
				Map: { x: 244, y: 54 },
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
				Calc: { x: 4, y: 24 },
				Map: { x: 304, y: 224 },
			} )

		},

		'a part inside a page is carried to another position in its tree'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const dom = $.$mol_dom_context

			dom.document.dispatchEvent( new dom.KeyboardEvent( 'keydown', { code: 'KeyF', key: 'f', bubbles: true } ) )
			stage.tap( stage.client([ 100, 100 ]) )

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

		'a folded dot whose first port is of the wrong shape stands on the row it carries'( $ ) {
			const ports = [
				{ name: 'result', next: false, own: true, kind: 'number' as const },
				{ name: 'op', next: false, own: true, kind: 'string' as const },
			]

			const { pane } = pane_make( $, {}, {
				doc_names: ()=> [ 'Calc', 'Map' ],
				part_ports: ()=> ports,
				wires: ()=> [],
			} )

			pane.sizes({
				[ `${root}/Calc` ]: box( 0, 0, 200, 50 ),
				[ `${root}/Map` ]: box( 400, 0, 200, 50 ),
			})

			pane.wire_drag({ from: 'Map', from_prop: 'marker', kind: 'string' })
			pane.wire_point([ -9999, -9999 ])

			const folded = pane.wire_dots().filter( dot => dot.node === 'Calc' )
			const row = $bog_vmap_app_wire_port_point( pane.part_box( 'Calc' )!, 'in', 1 )

			$mol_assert_equal( folded.length, 1 )
			$mol_assert_equal( folded[ 0 ].port.name, 'op' )
			$mol_assert_equal( folded[ 0 ].x, row[ 0 ] )
			$mol_assert_equal( folded[ 0 ].y, row[ 1 ] )

			pane.wire_point([ folded[ 0 ].x, folded[ 0 ].y ])

			const opened = pane.wire_dots()
			const under = $bog_vmap_app_wire_dot_at( opened, [ folded[ 0 ].x, folded[ 0 ].y ] )

			$mol_assert_equal( opened.filter( dot => dot.node === 'Calc' ).length, 2 )
			$mol_assert_equal( under?.node, 'Calc' )
			$mol_assert_equal( under?.port.name, 'op' )
			$mol_assert_equal( under?.lit, true )

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
			$mol_assert_equal( pane.field_sub()[0], frame_before )

			pane.scene_restart()

			$mol_assert_equal( pane.scene_shown(), false )
			$mol_assert_equal( pane.field_sub().includes( frame_before ), false )
			$mol_assert_equal( pane.field_sub().some( kid => kid === pane.Scene( pane.scene_key() ) ), false )
			$mol_assert_equal( pane.field_sub()[0], pane.Overlay() )

			const remount = timers.at( -1 )!
			$mol_assert_equal( remount.delay, pane.remount_delay() )

			remount.task()

			$mol_assert_equal( pane.scene_shown(), true )
			$mol_assert_equal( pane.field_sub()[0], pane.Scene( pane.scene_key() ) )
			$mol_assert_equal( pane.field_sub()[0] !== frame_before, true )

		},

		'scene_restart gives a fresh frame and clears stalled'( $ ) {
			const timers = timers_fake( $ )
			const { pane, posted, answer } = pane_make( $ )

			pane.warmed( true )
			pane.watchdog()
			answer({ kind: 'sizes', sizes: {} })

			const frame_before = pane.field_sub()[0]
			$mol_assert_equal( frame_before, pane.Scene( pane.scene_key() ) )

			pane.stalled( true )
			posted.length = 0

			pane.scene_restart()
			timers.at( -1 )!.task()

			$mol_assert_equal( pane.stalled(), false )
			$mol_assert_equal( pane.ready(), false )
			$mol_assert_equal( pane.warmed(), false )
			$mol_assert_equal( pane.field_sub()[0] !== frame_before, true )

			const layers = pane.field_sub()
			const kept = [
				pane.Scene( pane.scene_key() ),
				pane.Overlay(),
				pane.Wire(),
				pane.Values(),
				pane.Names(),
				pane.Marks(),
			]

			$mol_assert_like( layers.slice( 0, kept.length ), kept )
			$mol_assert_equal( layers.includes( pane.Insert() ), false )
			$mol_assert_equal( layers.includes( pane.Draft() ), false )

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
			$mol_assert_ok( one.pane.field_sub()[0] !== two.pane.field_sub()[0] )

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

		'a read only pane selects and enters, but neither draws, drags, drops nor deletes'( $ ) {
			const done = [] as string[]
			const deed = ( name: string )=> ()=> { done.push( name ); return null }

			const { pane } = pane_make( $, {}, {
				editable: ()=> false,
				node_delete: deed( 'delete' ),
				node_copy: deed( 'copy' ),
				node_wrap: deed( 'wrap' ),
				carry_drop: deed( 'carry' ),
				board_draw: deed( 'board' ),
			} )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })
			pane.spots({ A: { x: 0, y: 0 } })

			$mol_assert_equal( pane.tool_board( true ), false )
			$mol_assert_equal( pane.tool(), 'select' )

			pane.node_press( pointer( 50, 25 ) )
			$mol_assert_like( pane.picked(), [ 'A' ] )
			$mol_assert_equal( pane.drag(), null )
			pane.node_release( pointer( 50, 25, { buttons: 0 } ) )

			pane.node_press( pointer( 50, 25 ) )
			pane.node_release( pointer( 55, 25, { buttons: 0 } ) )
			$mol_assert_equal( pane.inside(), true )

			pane.leave()
			pane.picked([ 'A' ])

			const stroke = ( over: object )=> pane.key_down({
				key: '', code: '', metaKey: false, ctrlKey: false, altKey: false, shiftKey: false,
				target: null, preventDefault() {}, ... over,
			} as unknown as $$.$bog_vmap_app_pane_stroke )

			$mol_assert_equal( stroke({ key: 'Delete' }), false )
			$mol_assert_equal( stroke({ code: 'KeyD', metaKey: true }), false )
			$mol_assert_equal( stroke({ code: 'KeyG', metaKey: true, altKey: true }), false )
			stroke({ code: 'KeyF' })
			$mol_assert_equal( pane.tool(), 'select' )

			$mol_assert_equal( pane.carry_at({ x: 10, y: 10 }), null )

			let taken = false
			pane.file_over({ preventDefault() { taken = true } } as Event )
			$mol_assert_equal( taken, false )

			$mol_assert_equal( pane.Menu( pane.menu_key() ).editable(), false )
			$mol_assert_like( done, [] )
		},

		'a read only pane pulls no wire from a port'( $ ) {
			const { pane, node } = wired_make( $ )
			pane.editable = ()=> false

			pane.camera_shift( new $mol_vector_2d( 100, 50 ) )
			pane.camera_zoom( 2 )

			pane.sizes({ [ `${root}/Calc` ]: box( 0, 0 ), [ `${root}/Map` ]: box( 300, 0 ) })
			pane.picked([ 'Calc' ])

			const before = node.source()

			pane.node_press( pointer( 312, 57 ) )
			$mol_assert_equal( pane.wire_drag(), null )

			pane.node_move( pointer( 600, 100 ) )
			pane.node_release( pointer( 600, 100, { buttons: 0 } ) )

			$mol_assert_equal( node.source(), before )
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

		'a picked part shows its sources on the right and only the wired inputs on the left'( $ ) {

			const { pane, node } = wired_make( $ )

			pane.sizes({ [ `${root}/Calc` ]: box( 0, 0 ), [ `${root}/Map` ]: box( 300, 0 ) })
			pane.picked([ 'Map' ])

			const bare = pane.wire_dots().filter( dot => dot.node === 'Map' )

			$mol_assert_equal( bare.length, pane.part_dots( 'Map' ).length )
			$mol_assert_equal( bare.every( dot => dot.side === 'out' ), true )

			node.link_add({ from: 'Calc', from_prop: 'result', to: 'Map', to_prop: 'zoom', bidi: false })

			const wired = pane.wire_dots().filter( dot => dot.node === 'Map' )
			const inputs = wired.filter( dot => dot.side === 'in' )

			$mol_assert_equal( wired.length, pane.part_dots( 'Map' ).length + 1 )
			$mol_assert_like( inputs.map( dot => dot.port.name ), [ 'zoom' ] )
			$mol_assert_equal( inputs[ 0 ].linked, true )

		},

		'a wired input keeps its dot, and a press on it takes the wire off'( $ ) {

			const { pane, node } = wired_make( $ )

			pane.sizes({ [ `${root}/Calc` ]: box( 0, 0 ), [ `${root}/Map` ]: box( 300, 0 ) })
			pane.picked([ 'Map' ])

			node.link_add({ from: 'Calc', from_prop: 'result', to: 'Map', to_prop: 'zoom', bidi: false })

			$mol_assert_equal( node.links().length, 1 )

			const dot = pane.wire_dots().find( dot => dot.side === 'in' && dot.port.name === 'zoom' )!

			$mol_assert_equal( Boolean( dot ), true )

			pane.node_press( pointer( dot.x, dot.y ) )

			$mol_assert_equal( node.links().length, 0 )
			$mol_assert_like(
				[ pane.wire_drag()?.from, pane.wire_drag()?.from_prop ],
				[ 'Calc', 'result' ],
			)

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

		'a drag with the shift held between two signed ports writes a two way wire'( $ ) {
			const { pane, node } = wired_make( $ )

			pane.sizes({ [ `${root}/Calc` ]: box( 0, 0 ), [ `${root}/Map` ]: box( 300, 0 ) })
			pane.picked([ 'Calc' ])

			const out = pane.port_point( 'Calc', 'op', 'out' )!

			pane.node_press( pointer( out[0], out[1], { shiftKey: true } ) )

			$mol_assert_equal( pane.wire_bidi(), true )

			pane.node_move( pointer( 320, 20, { shiftKey: true } ) )

			const into = pane.wire_dots().find( dot => dot.port.name === 'marker' )!
			$mol_assert_equal( into.lit, true )

			pane.node_release( pointer( into.x, into.y, { buttons: 0, shiftKey: true } ) )

			$mol_assert_equal( pane.wire_bidi(), false )
			$mol_assert_equal( pane.wire_shift(), false )

			$mol_assert_equal( node.source().includes( '\tcalc_op? = Calc op?\n' ), true )
			$mol_assert_equal( node.source().includes( 'marker? <=> calc_op?\n' ), true )
			$mol_assert_like( node.wires(), [ { name: 'calc_op', node: 'Calc', prop: 'op', bidi: true } ] )
			$mol_assert_equal( node.links()[0].bidi, true )

			$mol_assert_equal( pane.wire_lines()[0].bidi, true )
			$mol_assert_equal( pane.Wire().label_text( 'Map.marker' ), '⇄' )

		},

		'the same drag without the shift stays one way'( $ ) {
			const { pane, node } = wired_make( $ )

			pane.sizes({ [ `${root}/Calc` ]: box( 0, 0 ), [ `${root}/Map` ]: box( 300, 0 ) })
			pane.picked([ 'Calc' ])

			const out = pane.port_point( 'Calc', 'op', 'out' )!

			pane.node_press( pointer( out[0], out[1] ) )

			$mol_assert_equal( pane.wire_bidi(), false )

			pane.node_move( pointer( 320, 20 ) )

			const into = pane.wire_dots().find( dot => dot.port.name === 'marker' )!
			pane.node_release( pointer( into.x, into.y, { buttons: 0 } ) )

			$mol_assert_equal( node.source().includes( '\tcalc_op = Calc op\n' ), true )
			$mol_assert_equal( node.source().includes( 'marker <= calc_op\n' ), true )
			$mol_assert_equal( node.links()[0].bidi, false )

			$mol_assert_equal( pane.wire_lines()[0].bidi, false )
			$mol_assert_equal( pane.Wire().label_text( 'Map.marker' ), '' )

		},

		'with the shift held an input without a sign is dark and takes nothing'( $ ) {
			const { pane, node } = wired_make( $ )

			pane.sizes({ [ `${root}/Calc` ]: box( 0, 0 ), [ `${root}/Map` ]: box( 300, 0 ) })
			pane.picked([ 'Map' ])

			const before = node.source()
			const out = pane.port_point( 'Map', 'zoom', 'out' )!

			pane.node_press( pointer( out[0], out[1], { shiftKey: true } ) )
			pane.node_move( pointer( 50, 20, { shiftKey: true } ) )

			const dark = pane.wire_dots().find( dot => dot.port.name === 'result' )!
			$mol_assert_equal( dark.lit, false )

			pane.node_release( pointer( dark.x, dark.y, { buttons: 0, shiftKey: true } ) )

			$mol_assert_equal( node.source(), before )
			$mol_assert_like( node.links(), [] )

			pane.node_press( pointer( out[0], out[1] ) )
			pane.node_move( pointer( 50, 20 ) )

			const open = pane.wire_dots().find( dot => dot.port.name === 'result' )!
			$mol_assert_equal( open.lit, true )

			pane.node_release( pointer( open.x, open.y, { buttons: 0 } ) )

			$mol_assert_equal( node.source().includes( '\tmap_zoom = Map zoom\n' ), true )
			$mol_assert_equal( node.links()[0].bidi, false )

		},

		'the shift let go in the middle of a drag leaves a one way wire'( $ ) {
			const { pane, node } = wired_make( $ )

			pane.sizes({ [ `${root}/Calc` ]: box( 0, 0 ), [ `${root}/Map` ]: box( 300, 0 ) })
			pane.picked([ 'Calc' ])

			const out = pane.port_point( 'Calc', 'op', 'out' )!

			pane.node_press( pointer( out[0], out[1], { shiftKey: true } ) )
			pane.node_move( pointer( 320, 20, { shiftKey: true } ) )

			$mol_assert_equal( pane.wire_bidi(), true )

			pane.node_move( pointer( 320, 20 ) )

			$mol_assert_equal( pane.wire_bidi(), false )

			const into = pane.wire_dots().find( dot => dot.port.name === 'marker' )!
			pane.node_release( pointer( into.x, into.y, { buttons: 0 } ) )

			$mol_assert_equal( node.links()[0].bidi, false )

		},

		'the port aimed at during a drag offers the shift, and stops once it is held'( $ ) {
			const { pane } = wired_make( $ )

			pane.sizes({ [ `${root}/Calc` ]: box( 0, 0 ), [ `${root}/Map` ]: box( 300, 0 ) })
			pane.picked([ 'Calc' ])

			const aimed = ()=> pane.wire_dots().find( dot => dot.hint )

			const out = pane.port_point( 'Calc', 'op', 'out' )!

			pane.node_press( pointer( out[0], out[1] ) )
			pane.node_move( pointer( 320, 20 ) )

			$mol_assert_equal( aimed(), undefined )

			const into = pane.wire_dots().find( dot => dot.port.name === 'marker' )!
			pane.node_move( pointer( into.x, into.y ) )

			$mol_assert_equal( aimed()?.port.name, 'marker' )
			$mol_assert_equal( pane.Wire().name_text( 'in:Map.marker' ), 'marker? · Shift — двусторонний' )

			pane.node_move( pointer( into.x, into.y, { shiftKey: true } ) )

			$mol_assert_equal( aimed(), undefined )
			$mol_assert_equal( pane.Wire().name_text( 'in:Map.marker' ), 'marker?' )

			pane.node_release( pointer( into.x, into.y, { buttons: 0, shiftKey: true } ) )

		},

		'a port that cannot go both ways never offers the shift'( $ ) {
			const { pane } = wired_make( $ )

			pane.sizes({ [ `${root}/Calc` ]: box( 0, 0 ), [ `${root}/Map` ]: box( 300, 0 ) })
			pane.picked([ 'Map' ])

			const aimed = ()=> pane.wire_dots().find( dot => dot.hint )

			const signed = pane.port_point( 'Map', 'zoom', 'out' )!

			pane.node_press( pointer( signed[0], signed[1] ) )
			pane.node_move( pointer( 50, 20 ) )

			const plain = pane.wire_dots().find( dot => dot.port.name === 'result' )!
			pane.node_move( pointer( plain.x, plain.y ) )

			$mol_assert_equal( aimed(), undefined )

			pane.node_release( pointer( 900, 700, { buttons: 0 } ) )

			pane.picked([ 'Calc' ])

			const plain_out = pane.port_point( 'Calc', 'result', 'out' )!

			pane.node_press( pointer( plain_out[0], plain_out[1] ) )
			pane.node_move( pointer( 320, 20 ) )

			const target = pane.wire_dots().find( dot => dot.port.name === 'zoom' )!
			pane.node_move( pointer( target.x, target.y ) )

			$mol_assert_equal( target.port.next, true )
			$mol_assert_equal( aimed(), undefined )

			pane.node_release( pointer( 900, 700, { buttons: 0 } ) )

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

		'a value is signed only where the author set it or a wire feeds it'( $ ) {
			const { pane, node, answer } = wired_make( $ )

			const sizes = { [ `${root}/Calc` ]: box( 0, 0 ), [ `${root}/Map` ]: box( 300, 0 ) }
			answer({ kind: 'sizes', sizes })

			$mol_assert_like( pane.part_ports( 'Calc' ).map( port => port.name ), [ 'result', 'op', 'title' ] )
			$mol_assert_like( pane.part_outs( 'Calc' ).map( port => port.name ), [ 'result', 'op' ] )
			$mol_assert_like( pane.part_outs( 'Map' ).map( port => port.name ), [ 'zoom', 'marker' ] )
			$mol_assert_like( pane.parts_visible(), [ 'Calc', 'Map' ] )
			$mol_assert_like( pane.ports_visible(), [ 'Calc.result', 'Calc.op', 'Map.zoom', 'Map.marker' ] )

			node.link_add({ from: 'Calc', from_prop: 'result', to: 'Map', to_prop: 'zoom' })

			$mol_assert_like( pane.part_outs( 'Map' ).map( port => port.name ), [ 'marker' ] )
			$mol_assert_like( pane.wire_lines().map( line => line.key ), [ 'Map.zoom' ] )

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

		'the labels of live values are drawn on the canvas, one under each labelled part'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			stage.drop( map, stage.client([ 400, 300 ]) )

			stage.scene.values({ 'Calc.result': '42', 'Calc.op': 'plus', 'Map.marker': 'дом' })

			$mol_assert_equal( stage.pane.value_labels().length, 0 )

			const node = stage.app.node()
			const tree = node.tree()

			for( const [ part, port, text ] of [
				[ 'Calc', 'result', '0' ],
				[ 'Calc', 'op', 'plus' ],
				[ 'Map', 'marker', 'дом' ],
			] ) {
				node.over_set( part, port, tree.struct( port, [ tree.data( text ) ] ) )
			}

			stage.redraw()
			stage.scene.flush()
			stage.redraw()

			const layer = stage.pane.dom_node().querySelector( '[bog_vmap_app_pane_values]' )
			const drawn = [ ... layer?.querySelectorAll( '[bog_vmap_app_pane_label]' ) ?? [] ]
				.map( label => label.textContent )
				.sort()

			$mol_assert_equal( stage.pane.value_labels().length, 2 )
			$mol_assert_like( drawn, [ 'marker: дом', 'result: 42op: plus' ] )

		},

		'a board is labelled by none of the view machinery, a part beside it by its own values'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.pane.tool( 'board' )
			stage.tap( stage.client([ 100, 100 ]) )
			stage.drop( calc, stage.client([ 560, 450 ]) )

			const node = stage.app.node()
			const tree = node.tree()

			for( const port of [ 'result', 'op' ] ) {
				node.over_set( 'Calc', port, tree.struct( port, [ tree.data( '0' ) ] ) )
			}

			stage.redraw()
			stage.scene.flush()
			stage.redraw()

			$mol_assert_like( stage.pane.parts_visible(), [ 'Page', 'Calc' ] )
			$mol_assert_like( stage.pane.part_ports( 'Page' ).map( port => port.name ), [ 'dom_name', 'sub', 'title' ] )

			const asked = stage.scene.last( 'values_want' )!.names as readonly string[]

			$mol_assert_like( asked.filter( name => name.startsWith( 'Calc.' ) ), [ 'Calc.result', 'Calc.op' ] )
			$mol_assert_like( asked.filter( name => name === 'Page.dom_name' || name === 'Page.sub' ), [] )

			stage.scene.values({
				'Calc.result': '42',
				'Calc.op': 'plus',
				'Page.dom_name': 'mol_view',
				'Page.sub': '[{"dom_node()":"doc.Page()"}]',
			})

			const layer = stage.pane.dom_node().querySelector( '[bog_vmap_app_pane_values]' )
			const drawn = [ ... layer?.querySelectorAll( '[bog_vmap_app_pane_label]' ) ?? [] ]
				.map( label => label.textContent )

			$mol_assert_like( stage.pane.label_lines( 'Page' ), [] )
			$mol_assert_like( drawn, [ 'result: 42op: plus' ] )

		},

		'no dot of a board offers the machinery of a view, at rest or as a target of a drag'( $ ) {
			const ports = [
				{ name: 'dom_name', next: false, own: true, kind: 'string' as const },
				{ name: 'sub', next: false, own: true, kind: 'list' as const },
				{ name: 'title', next: false, own: true, kind: 'string' as const },
			]

			const { pane } = pane_make( $, {}, {
				doc_names: ()=> [ 'Page', 'Calc' ],
				containers: ()=> [ 'Page' ],
				part_ports: ()=> ports,
				wires: ()=> [],
			} )

			pane.sizes({
				[ `${root}/Page` ]: box( 0, 0, 400, 300 ),
				[ `${root}/Calc` ]: box( 600, 0 ),
			})

			pane.picked([ 'Page' ])

			$mol_assert_like( pane.part_ports( 'Page' ).map( port => port.name ), [ 'dom_name', 'sub', 'title' ] )
			$mol_assert_like( pane.part_dots( 'Page' ).map( port => port.name ), [ 'title' ] )

			$mol_assert_like(
				[ ... new Set( pane.wire_dots().filter( dot => dot.node === 'Page' ).map( dot => dot.port.name ) ) ],
				[ 'title' ],
			)

			pane.wire_drag({ from: 'Calc', from_prop: 'result', kind: 'string' })
			pane.wire_point([ 0, 0 ])

			$mol_assert_like(
				pane.wire_dots().filter( dot => dot.node === 'Page' ).map( dot => dot.port.name ),
				[ 'title' ],
			)

		},

		'a board wears its own name above the frame and no value label under it'( $ ) {
			const ports = [
				{ name: 'dom_name', next: false, own: true, kind: 'string' as const },
				{ name: 'sub', next: false, own: true, kind: 'list' as const },
				{ name: 'title', next: false, own: true, kind: 'string' as const },
			]

			const { pane } = pane_make( $, {}, {
				doc_names: ()=> [ 'Page', 'Send' ],
				containers: ()=> [ 'Page' ],
				part_ports: ()=> ports,
				part_overs: ()=> ports.map( port => port.name ),
				wires: ()=> [],
			} )

			pane.sizes({
				[ `${root}/Page` ]: box( 40, 60, 400, 300 ),
				[ `${root}/Send` ]: box( 600, 0 ),
			})

			pane.warmed( true )
			pane.values({ 'Page.title': 'Loan', 'Send.title': 'Отправить' })
			pane.dom_tree()

			$mol_assert_like( pane.ports_visible(), [] )
			$mol_assert_like( pane.label_lines( 'Page' ), [] )
			$mol_assert_like( pane.label_lines( 'Send' ), [] )

			$mol_assert_equal( pane.value_labels().length, 0 )

			const frame = pane.part_box( 'Page' )!

			$mol_assert_like( pane.name_style( 'Page' ), { left: frame.left + 'px', top: frame.top + 'px' } )
			$mol_assert_equal( pane.name_views().length, 1 )
			$mol_assert_equal( pane.name_views()[ 0 ], pane.Name( 'Page' ) )
			$mol_assert_like( pane.Name( 'Page' ).sub(), [ 'Page' ] )

			const layer = pane.dom_node().querySelector( '[bog_vmap_app_pane_names]' )
			const drawn = [ ... layer?.querySelectorAll( '[bog_vmap_app_pane_name]' ) ?? [] ]
				.map( name => name.textContent )

			$mol_assert_like( drawn, [ 'Page' ] )

		},

		'every scene keeps its own camera, and a scene without a kept one is shown whole'( $ ) {

			const kept = session_fake( $ )
			const opened = doc_opened( $ )

			const { pane, answer } = pane_make( $, {}, { doc_key: ()=> opened() } )

			const sizes = { [ `${root}/A` ]: box( 100, 100, 400, 300 ) }

			answer({ kind: 'sizes', sizes })
			pane.dom_tree()

			pane.camera_zoom( 2 )
			pane.camera_shift( new $mol_vector_2d( 30, 40 ) )
			pane.dom_tree()

			$mol_assert_like( JSON.parse( kept[ 'vmap_camera one' ]! ), { x: 30, y: 40, zoom: 2 } )

			opened( 'two' )
			answer({ kind: 'sizes', sizes })
			pane.dom_tree()

			$mol_assert_equal( pane.camera_zoom(), 1 )
			$mol_assert_like( [ ... pane.camera_shift() ], [ 200, 150 ] )

			opened( 'one' )
			answer({ kind: 'sizes', sizes })
			pane.dom_tree()

			$mol_assert_equal( pane.camera_zoom(), 2 )
			$mol_assert_like( [ ... pane.camera_shift() ], [ 30, 40 ] )

		},

		'the size left by a renamed node is swept, and that name starts unmeasured again'( $ ) {

			const paths = $mol_wire_atom.solo( {}, function paths( next?: readonly string[] ): readonly string[] {
				return next ?? [ 'Calc', 'Map' ]
			} )

			const { pane, answer } = pane_make( $, {}, { doc_paths: ()=> paths.sync() } )

			answer({ kind: 'sizes', sizes: {
				[ `${root}/Calc` ]: box( 0, 0 ),
				[ `${root}/Map` ]: box( 200, 0 ),
			} })

			$mol_assert_like( Object.keys( pane.sizes() ).sort(), [ `${root}/Calc`, `${root}/Map` ] )
			$mol_assert_like( pane.part_size( 'Calc' ), box( 0, 0 ) )

			paths.put([ 'Summa', 'Map' ])

			answer({ kind: 'sizes', sizes: {
				[ `${root}/Summa` ]: box( 0, 0 ),
				[ `${root}/Map` ]: box( 200, 0 ),
			} })

			$mol_assert_like( Object.keys( pane.sizes() ).sort(), [ `${root}/Map`, `${root}/Summa` ] )

			paths.put([ 'Summa', 'Map', 'Calc' ])

			$mol_assert_equal( pane.part_size( 'Calc' ), null )

		},

		'a nested node renamed inside a board leaves no size behind'( $ ) {

			const paths = $mol_wire_atom.solo( {}, function paths( next?: readonly string[] ): readonly string[] {
				return next ?? [ 'Page', 'Page/Amount' ]
			} )

			const { pane, answer } = pane_make( $, {}, { doc_paths: ()=> paths.sync() } )

			answer({ kind: 'sizes', sizes: {
				[ `${root}/Page` ]: box( 0, 0, 400, 300 ),
				[ `${root}/Page/Amount` ]: box( 10, 10 ),
			} })

			paths.put([ 'Page', 'Page/Summa' ])

			answer({ kind: 'sizes', sizes: {
				[ `${root}/Page` ]: box( 0, 0, 400, 300 ),
				[ `${root}/Page/Summa` ]: box( 10, 10 ),
			} })

			$mol_assert_like(
				Object.keys( pane.sizes() ).sort(),
				[ `${root}/Page`, `${root}/Page/Summa` ],
			)

		},

		'a part the scene never reported keeps its size while it lives in the document'( $ ) {

			const { pane, answer } = pane_make( $, {}, { doc_paths: ()=> [ 'Near', 'Far' ] } )

			answer({ kind: 'sizes', sizes: {
				[ `${root}/Near` ]: box( 0, 0 ),
				[ `${root}/Far` ]: box( 9000, 9000 ),
			} })

			answer({ kind: 'sizes', sizes: { [ `${root}/Near` ]: box( 0, 0 ) } })

			$mol_assert_like( Object.keys( pane.sizes() ).sort(), [ `${root}/Far`, `${root}/Near` ] )
			$mol_assert_like( pane.part_size( 'Far' ), box( 9000, 9000 ) )

		},

		'a node the document still holds is never swept, whatever the message brings'( $ ) {

			const { pane, answer } = pane_make( $, {}, { doc_paths: ()=> [ 'Page', 'Page/Amount' ] } )

			answer({ kind: 'sizes', sizes: {
				[ `${root}/Page` ]: box( 0, 0, 400, 300 ),
				[ `${root}/Page/Amount` ]: box( 10, 10 ),
			} })

			answer({ kind: 'sizes', sizes: { [ `${root}/Page/Amount` ]: box( 20, 20 ) } })

			$mol_assert_like(
				Object.keys( pane.sizes() ).sort(),
				[ `${root}/Page`, `${root}/Page/Amount` ],
			)

			$mol_assert_like( pane.sizes()[ `${root}/Page` ], box( 0, 0, 400, 300 ) )

		},

		'the sweep leaves the inner layers of a part alone until the part is measured anew'( $ ) {

			const { pane, answer } = pane_make( $, {}, { doc_paths: ()=> [ 'Debt' ] } )

			answer({ kind: 'sizes', sizes: {
				[ `${root}/Debt` ]: box( 0, 0, 300, 200 ),
				[ `${root}/Debt/Title` ]: box( 10, 10 ),
			} })

			answer({ kind: 'sizes', sizes: { [ `${root}/Debt` ]: box( 0, 0, 300, 200 ) } })

			$mol_assert_like(
				Object.keys( pane.sizes() ).sort(),
				[ `${root}/Debt`, `${root}/Debt/Title` ],
			)

			answer({ kind: 'sizes', sizes: {
				[ `${root}/Debt` ]: box( 0, 0, 300, 200 ),
				[ `${root}/Debt/Line` ]: box( 20, 20 ),
			} })

			$mol_assert_like(
				Object.keys( pane.sizes() ).sort(),
				[ `${root}/Debt`, `${root}/Debt/Line` ],
			)

		},

		'the column stays open while the pointer walks down it to a deep port'( $ ) {

			const ports = [] as { name: string, next: boolean, own: boolean, kind: 'number' }[]
			for( let i = 0; i < 22; ++ i ) ports.push({ name: 'p' + i, next: false, own: true, kind: 'number' })

			const { pane } = pane_make( $, {}, {
				doc_names: ()=> [ 'Num', 'Source' ],
				part_ports: ()=> ports,
				wires: ()=> [],
			} )

			pane.sizes({
				[ `${root}/Num` ]: box( 400, 0, 120, 40 ),
				[ `${root}/Source` ]: box( 0, 400, 120, 40 ),
			})

			pane.wire_drag({ from: 'Source', from_prop: 'p0', kind: 'number' })

			const deep = $bog_vmap_app_wire_port_point( pane.part_box( 'Num' )!, 'in', 19 )

			pane.wire_point( deep )

			$mol_assert_equal( pane.wire_over(), 'Num' )
			$mol_assert_equal( pane.wire_dots().filter( dot => dot.node === 'Num' ).length, 22 )
			$mol_assert_equal( $bog_vmap_app_wire_dot_at( pane.wire_dots(), deep )?.port.name, 'p19' )

		},

		'a part under the column keeps its own dots, the column above does not take them'( $ ) {

			const ports = [] as { name: string, next: boolean, own: boolean, kind: 'number' }[]
			for( let i = 0; i < 22; ++ i ) ports.push({ name: 'p' + i, next: false, own: true, kind: 'number' })

			const { pane } = pane_make( $, {}, {
				doc_names: ()=> [ 'Num', 'Under', 'Source' ],
				part_ports: ()=> ports,
				wires: ()=> [],
			} )

			pane.sizes({
				[ `${root}/Num` ]: box( 400, 0, 120, 40 ),
				[ `${root}/Under` ]: box( 400, 200, 120, 40 ),
				[ `${root}/Source` ]: box( 0, 600, 120, 40 ),
			})

			pane.wire_drag({ from: 'Source', from_prop: 'p0', kind: 'number' })

			const inside = [ 460, 220 ] as const

			pane.wire_point( inside )
			$mol_assert_equal( pane.wire_over(), 'Under' )

			const deep = $bog_vmap_app_wire_port_point( pane.part_box( 'Num' )!, 'in', 19 )

			pane.wire_point( deep )
			$mol_assert_equal( pane.wire_over(), 'Num' )

		},

		'the names written on the node become the labels of its open slots'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )
			const cell = `${d}bog_vmap_part_cell`

			stage.drop( cell, stage.client([ 300, 200 ]) )

			const node = stage.app.node()
			const name = node.sub_names()!.find( known => known.startsWith( 'Vmap_part_cell' ) )!

			const dots = ()=> stage.pane.part_dots( name )
				.filter( port => $bog_vmap_app_wire_slot( port ) )
				.map( port => port.label || port.name )

			$mol_assert_like( dots(), [ 'in1' ] )

			const tree = node.tree()
			node.over_set( name, 'slots', tree.struct( 'slots', [ tree.data( 'price, 2bad, rate' ) ] ) )
			stage.redraw()

			$mol_assert_like( dots(), [ 'price' ] )

			node.over_set( name, 'in1', tree.struct( 'in1', [ tree.struct( '<=', [ tree.struct( 'amount' ) ] ) ] ) )
			stage.redraw()

			$mol_assert_like( dots(), [ 'price', 'in2' ] )

		},

		'open input slots come one at a time, the taken ones stay and the rest wait'( $ ) {

			const ports = [
				{ name: 'result', next: false, own: true, kind: 'number' as const },
				{ name: 'in1', next: false, own: true, kind: 'null' as const },
				{ name: 'in2', next: false, own: true, kind: 'null' as const },
				{ name: 'in3', next: false, own: true, kind: 'null' as const },
				{ name: 'run', next: true, own: true, kind: 'null' as const },
			]

			const taken = $mol_wire_atom.solo( {}, function taken(
				next?: readonly string[],
			): readonly string[] {
				return next ?? []
			} )

			const { pane } = pane_make( $, {}, {
				doc_names: ()=> [ 'Cell' ],
				part_ports: ()=> ports,
				part_overs: ()=> taken.sync(),
				wires: ()=> [],
			} )

			pane.sizes({ [ `${root}/Cell` ]: box( 0, 0, 200, 100 ) })

			$mol_assert_like( pane.part_dots( 'Cell' ).map( port => port.name ), [ 'result', 'in1', 'run' ] )

			taken.put([ 'in1' ])

			$mol_assert_like( pane.part_dots( 'Cell' ).map( port => port.name ), [ 'result', 'in1', 'in2', 'run' ] )

			taken.put([ 'in1', 'in2' ])

			$mol_assert_like( pane.part_dots( 'Cell' ).map( port => port.name ), [ 'result', 'in1', 'in2', 'in3', 'run' ] )

		},

		'a scene opened for the first time is shown whole once it is measured'( $ ) {

			const kept = session_fake( $ )
			const opened = doc_opened( $ )

			const { pane, answer } = pane_make( $, {}, { doc_key: ()=> opened() } )

			answer({ kind: 'sizes', sizes: {} })
			pane.dom_tree()

			$mol_assert_equal( pane.camera_doc(), '' )
			$mol_assert_equal( kept[ 'vmap_camera one' ], undefined )

			answer({ kind: 'sizes', sizes: { [ `${root}/A` ]: box( 100, 100, 400, 300 ) } })
			pane.dom_tree()

			$mol_assert_equal( pane.camera_doc(), 'vmap_camera one' )
			$mol_assert_like( [ ... pane.camera_shift() ], [ 200, 150 ] )
			$mol_assert_like( JSON.parse( kept[ 'vmap_camera one' ]! ), { x: 200, y: 150, zoom: 1 } )

		},

		'the editor left to its own camera brings the measured part onto the screen'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $, { camera: 'own' } )

			stage.drop( calc, stage.client([ 560, 450 ]) )

			const rect = $bog_vmap_app_flow_rect
			const box = stage.pane.part_box( 'Calc' )!

			$mol_assert_ok( box )
			$mol_assert_equal( box.left >= 0, true )
			$mol_assert_equal( box.top >= 0, true )
			$mol_assert_equal( box.left + box.width <= rect.width, true )
			$mol_assert_equal( box.top + box.height <= rect.height, true )

		},

		'the camera of the scene left behind is not written under the scene opened'( $ ) {

			const kept = session_fake( $ )
			const opened = doc_opened( $ )

			const { pane, answer } = pane_make( $, {}, { doc_key: ()=> opened() } )

			const sizes = { [ `${root}/A` ]: box( 100, 100, 400, 300 ) }

			answer({ kind: 'sizes', sizes })
			pane.camera_zoom( 2 )
			pane.camera_shift( new $mol_vector_2d( 30, 40 ) )
			pane.dom_tree()

			opened( 'two' )
			pane.dom_tree()

			$mol_assert_equal( kept[ 'vmap_camera two' ], undefined )
			$mol_assert_like( JSON.parse( kept[ 'vmap_camera one' ]! ), { x: 30, y: 40, zoom: 2 } )

		},

		'a click on the name picks the board, a double click renames it in place'( $ ) {
			let title = 'Page'

			const { pane } = pane_make( $, {}, {
				doc_names: ()=> [ 'Page' ],
				containers: ()=> [ 'Page' ],
				part_ports: ()=> [],
				wires: ()=> [],
				node_title: ( next?: string )=> {
					if( next === undefined ) return title
					if( /^[0-9]/.test( next ) ) return title
					return title = next
				},
			} )

			pane.sizes({ [ `${root}/Page` ]: box( 0, 0, 400, 300 ) })

			const dom = $.$mol_dom_context
			const mouse = ( kind: string )=> new dom.MouseEvent( kind, { bubbles: true, cancelable: true } )

			pane.name_press( 'Page', mouse( 'click' ) )

			$mol_assert_like( [ ... pane.picked() ], [ 'Page' ] )
			$mol_assert_equal( pane.name_editing( 'Page' ), false )

			pane.name_edit( 'Page', mouse( 'dblclick' ) )

			$mol_assert_equal( pane.name_editing( 'Page' ), true )
			$mol_assert_equal( pane.name_views()[ 0 ], pane.Name_field( 'Page' ) )
			$mol_assert_like( pane.Name_field( 'Page' ).selection(), [ 0, 4 ] )

			pane.name_draft( 'Page', 'Other' )
			pane.name_key( 'Page', { key: 'Escape', stopPropagation() {} } as KeyboardEvent )

			$mol_assert_equal( pane.name_editing( 'Page' ), false )
			$mol_assert_equal( pane.name_draft( 'Page' ), 'Page' )
			$mol_assert_equal( title, 'Page' )

			pane.name_edit( 'Page', mouse( 'dblclick' ) )
			pane.name_draft( 'Page', '9bad' )
			pane.name_submit( 'Page', mouse( 'blur' ) )

			$mol_assert_equal( title, 'Page' )
			$mol_assert_equal( pane.name_editing( 'Page' ), true )

			pane.name_draft( 'Page', 'Loan' )
			pane.name_submit( 'Page', mouse( 'blur' ) )

			$mol_assert_equal( title, 'Loan' )
			$mol_assert_equal( pane.name_editing( 'Page' ), false )

		},

		'every layer the tree puts in sub is returned by the override of sub'( $ ) {
			const { pane } = pane_make( $ )

			const declared = Object.getPrototypeOf( $$.$bog_vmap_app_pane.prototype ).sub.call( pane ) as readonly $mol_view[]
			const returned = pane.sub()

			$mol_assert_ok( declared.length > 0 )
			$mol_assert_like( declared.filter( view => !returned.includes( view ) ).map( String ), [] )

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

			$mol_assert_like( moves, [ { names: [ 'Loose' ], owner: 'Board', index: 1 } ] )
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
			$mol_assert_like( moves, [ { names: [ 'Head' ], owner: 'Board', index: 2 } ] )

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
			part_overs: ( name: string )=> ( ports[ klass_of( name ) ] ?? [] )
				.filter( port => port.own )
				.map( port => port.name ),
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

	const sized = ( $: $mol_ambient_context )=> {

		const made = [] as $$.$bog_vmap_app_pane_size[]

		const { pane } = pane_make( $, {}, {
			node_resize: ( next?: $$.$bog_vmap_app_pane_size | null )=> {
				if( next ) made.push( next )
				return next ?? null
			},
		} )

		pane.sizes({ [ `${root}/A` ]: box( 100, 100, 200, 80 ) })
		pane.picked([ 'A' ])

		return { pane, made }
	}

	const inner_sizes = {
		[ `${root}/Debt` ]: box( 0, 0, 400, 300 ),
		[ `${root}/Debt/Title` ]: box( 10, 20, 200, 40 ),
		[ `${root}/Debt/Chart` ]: box( 10, 80, 380, 200 ),
		[ `${root}/Debt/Chart/Plot/Line` ]: box( 20, 90, 360, 180 ),
	}

	const twin_sizes = {
		[ `${root}/Debt` ]: box( 0, 0, 400, 300 ),
		[ `${root}/Debt/Title` ]: box( 10, 20, 200, 40 ),
		[ `${root}/Debt/Chart` ]: box( 10, 80, 380, 200 ),
		[ `${root}/Debt/Chart/Legend/Title` ]: box( 300, 90, 80, 16 ),
	}

	const inner_pane = (
		$: $mol_ambient_context,
		inner = '',
		sizes: { readonly [ node: string ]: $bog_vmap_bridge_rect } = inner_sizes,
	)=> {

		const { pane } = pane_make( $, {}, {
			doc_names: ()=> [ 'Debt' ],
			inner: ()=> inner,
		} )

		pane.sizes( sizes )

		return pane
	}

	$mol_test({

		'a pull by the corner sizes the node and writes it once, at the end'( $ ) {

			const { pane, made } = sized( $ )

			$mol_assert_equal( pane.handle_at( [ 300, 180 ] ), 'se' )

			pane.node_press( pointer( 300, 180 ) )

			$mol_assert_equal( pane.sizing()?.name, 'A' )
			$mol_assert_equal( pane.sizing()?.corner, 'se' )
			$mol_assert_like( pane.sizing_box(), box( 100, 100, 200, 80 ) )

			pane.node_move( pointer( 360, 230 ) )

			$mol_assert_like( pane.sizing_box(), box( 100, 100, 260, 130 ) )
			$mol_assert_ok( pane.sizing_note().startsWith( '260 × 130' ) )
			$mol_assert_like( made, [] )

			pane.node_release( pointer( 360, 230, { buttons: 0 } ) )

			$mol_assert_equal( pane.sizing(), null )
			$mol_assert_like( made, [ { name: 'A', width: 260, height: 130, floor: false } ] )

		},

		'a low node keeps its middle, and a node with no width offers no handle'( $ ) {

			const { pane } = sized( $ )

			pane.sizes({ [ `${ root }/A` ]: box( 100, 100, 200, 12 ) })

			$mol_assert_equal( pane.handle_at( [ 200, 106 ] ), '' )
			$mol_assert_equal( pane.handle_at( [ 300, 112 ] ), 'se' )

			pane.sizes({ [ `${ root }/A` ]: box( 100, 100, 0, 12 ) })

			$mol_assert_equal( pane.handle_at( [ 100, 106 ] ), '' )
			$mol_assert_equal( pane.handle_at( [ 100, 100 ] ), '' )

		},

		'a pull by a side moves only its own edge, and the far edges stay'( $ ) {

			const west = sized( $ )

			$mol_assert_equal( west.pane.handle_at( [ 100, 140 ] ), 'w' )

			west.pane.node_press( pointer( 100, 140 ) )
			west.pane.node_move( pointer( 60, 140 ) )

			$mol_assert_like( west.pane.sizing_box(), box( 60, 100, 240, 80 ) )

			const north = sized( $ )

			north.pane.node_press( pointer( 200, 100 ) )
			north.pane.node_move( pointer( 200, 70 ) )

			$mol_assert_like( north.pane.sizing_box(), box( 100, 70, 200, 110 ) )

		},

		'Shift keeps the shape of the node while it is pulled'( $ ) {

			const { pane } = sized( $ )

			pane.node_press( pointer( 300, 180 ) )
			pane.node_move( pointer( 500, 185, { shiftKey: true } ) )

			$mol_assert_equal( pane.sizing()?.ratio, true )
			$mol_assert_like( pane.sizing_box(), box( 100, 100, 400, 160 ) )

		},

		'Escape gives the node its size back and writes nothing'( $ ) {

			const { pane, made } = sized( $ )

			pane.node_press( pointer( 300, 180 ) )
			pane.node_move( pointer( 500, 400 ) )

			$mol_assert_ok( pane.sizing() )

			pane.escape()

			$mol_assert_equal( pane.sizing(), null )
			$mol_assert_like( made, [] )
			$mol_assert_like( pane.part_size( 'A' ), box( 100, 100, 200, 80 ) )

		},

		'the caption says who holds the size: the content below and the parent aside'( $ ) {

			const { pane } = pane_make( $, {}, {
				doc_names: ()=> [ 'A', 'B' ],
				axis: ( name: string )=> name === 'A' ? 'column' : '',
			} )

			pane.sizes({
				[ `${root}/A` ]: box( 100, 100, 200, 80 ),
				[ `${root}/A/B` ]: box( 100, 100, 200, 60 ),
			})

			pane.picked([ 'A' ])
			pane.node_press( pointer( 300, 180 ) )
			pane.node_move( pointer( 300, 120 ) )

			$mol_assert_like( pane.sizing_box(), box( 100, 100, 200, 20 ) )
			$mol_assert_equal( pane.sizing_note(), '200 × 60 по содержимому' )

			pane.node_move( pointer( 300, 300 ) )
			$mol_assert_equal( pane.sizing_note(), '200 × 200' )

			const kid = pane_make( $, {}, {
				doc_names: ()=> [ 'A', 'B' ],
				axis: ( name: string )=> name === 'A' ? 'column' : '',
			} )

			kid.pane.sizes({
				[ `${root}/A` ]: box( 100, 100, 200, 80 ),
				[ `${root}/A/B` ]: box( 100, 100, 200, 60 ),
			})

			kid.pane.picked([ 'B' ])

			$mol_assert_equal( kid.pane.size_hard( 'B' ), 'width' )

			kid.pane.node_press( pointer( 300, 130 ) )
			kid.pane.node_move( pointer( 340, 130 ) )

			$mol_assert_equal( kid.pane.sizing_note(), '240 жёстко × 60' )

		},

		'a pull that changes nothing writes nothing'( $ ) {

			const { pane, made } = sized( $ )

			pane.node_press( pointer( 300, 180 ) )
			pane.node_move( pointer( 300, 180 ) )
			pane.node_release( pointer( 300, 180, { buttons: 0 } ) )

			$mol_assert_like( made, [] )

		},

		'a layer inside a part is addressed by the chain of its layers, however deep the scene renders it'( $ ) {

			const pane = inner_pane( $ )

			$mol_assert_like( pane.part_size( 'Debt/Title' ), box( 10, 20, 200, 40 ) )
			$mol_assert_like( pane.part_size( 'Debt/Chart/Line' ), box( 20, 90, 360, 180 ) )
			$mol_assert_like( pane.part_size( 'Debt' ), box( 0, 0, 400, 300 ) )

			$mol_assert_equal( pane.part_size( 'Debt/Chart/Nobody' ), null )
			$mol_assert_equal( pane.part_size( 'Title' ), null )

		},

		'a namesake above does not steal the frame from the layer the chain names'( $ ) {

			const above = inner_pane( $, '', twin_sizes )
			$mol_assert_like( above.part_size( 'Debt/Title' ), box( 10, 20, 200, 40 ) )

			const below = inner_pane( $, '', twin_sizes )
			$mol_assert_like( below.part_size( 'Debt/Chart/Title' ), box( 300, 90, 80, 16 ) )

			const framed = inner_pane( $, 'Debt/Chart/Title', twin_sizes )
			$mol_assert_like(
				framed.inner_style(),
				{ left: '300px', top: '90px', width: '80px', height: '16px' },
			)

		},

		'a chain the scene never rendered falls back on the shortest path under the node'( $ ) {

			const pane = inner_pane( $, '', twin_sizes )

			$mol_assert_like( pane.part_size( 'Debt/Nowhere/Title' ), box( 10, 20, 200, 40 ) )

		},

		'an inner layer is framed apart from the node, with no handles of its own'( $ ) {

			const bare = inner_pane( $ )

			$mol_assert_equal( bare.inner_shown(), '' )
			$mol_assert_like( bare.inner_style(), {} )
			$mol_assert_equal( bare.Overlay().sub().includes( bare.Overlay().Inner() ), false )

			const pane = inner_pane( $, 'Debt/Title' )
			pane.picked([ 'Debt' ])

			$mol_assert_equal( pane.inner_shown(), 'Debt/Title' )
			$mol_assert_like(
				pane.inner_style(),
				{ left: '10px', top: '20px', width: '200px', height: '40px' },
			)

			const overlay = pane.Overlay()

			$mol_assert_equal( overlay.sub().includes( overlay.Inner() ), true )
			$mol_assert_equal( overlay.Inner().sub().length, 0 )
			$mol_assert_equal( overlay.Frame( 'Debt' ).sub().length, 8 )

		},

		'an inner layer the scene never measured gets no frame'( $ ) {

			const pane = inner_pane( $, 'Debt/Nobody' )

			$mol_assert_equal( pane.inner_shown(), '' )
			$mol_assert_like( pane.inner_style(), {} )
			$mol_assert_equal( pane.Overlay().sub().length, 0 )

		},

		'the frame of an inner layer leaves the pointer to the canvas under it'( $ ) {

			const bare = inner_pane( $ )
			const framed = inner_pane( $, 'Debt/Title' )

			$mol_assert_equal( bare.node_at( [ 50, 30 ] ), 'Debt' )
			$mol_assert_equal( framed.node_at( [ 50, 30 ] ), 'Debt' )

			framed.node_press( pointer( 50, 30 ) )
			framed.node_release( pointer( 50, 30, { buttons: 0 } ) )

			$mol_assert_like( [ ... framed.picked() ], [ 'Debt' ] )

		},

		'the camera goes to an inner layer the same way it goes to a node'( $ ) {

			const pane = inner_pane( $, 'Debt/Title' )

			pane.node_show( 'Debt/Title' )

			$mol_assert_like( [ ... pane.camera_shift() ], [ 390, 360 ] )
			$mol_assert_equal( pane.camera_zoom(), 1 )

		},

	})

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
			$mol_assert_equal( dots.length, 2 )
			$mol_assert_equal( dots.every( dot => dot.side === 'out' ), true )
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

			$mol_assert_equal( dots_of( pane, 'Calc' ).length, 2 )
			$mol_assert_equal( dots_of( pane, 'Map' ).length, 2 )

			pane.node_move( pointer( 700, 400 ) )

			$mol_assert_equal( pane.hovered(), null )
			$mol_assert_equal( dots_of( pane, 'Calc' ).length, 2 )
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

			$mol_assert_equal( picked.length, 2 )
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

namespace $ {
	const d = '$'

	const root = `${d}doc`

	const calc = `${d}flow_calc`
	const map = `${d}flow_map`

	const box = ( x: number, y: number, width = 100, height = 50 ) => ({ x, y, width, height })

	const tools_make = ( $: $mol_ambient_context, over: Partial< $$.$bog_vmap_app_pane > = {} ) => {
		const peer = { origin: 'null', postMessage() {} }

		const pane = $$.$bog_vmap_app_pane.make({
			$,
			doc_root: ()=> root,
			doc_names: ()=> {
				const names = new Set< string >()
				for( const key of Object.keys( pane.sizes() ) ) {
					for( const step of key.split( '/' ).slice( 1 ) ) names.add( step )
				}
				return [ ... names ]
			},
			pane_rect: ()=> ({ left: 10, top: 20, width: 1000, height: 800 }),
			scene_peer: ()=> peer,
			... over,
		})

		pane.handshake( pane.scene_key(), 1 )

		return pane
	}

	const key_of = ( code: string )=> {
		if( code === 'Space' ) return ' '
		if( code.startsWith( 'Key' ) ) return code.slice( 3 ).toLowerCase()
		return code
	}

	const stroke = ( code: string, over: Partial< $$.$bog_vmap_app_pane_stroke > = {} ) => {
		let prevented = false

		return {
			key: key_of( code ),
			code,
			altKey: false,
			ctrlKey: false,
			metaKey: false,
			shiftKey: false,
			target: null as EventTarget | null,
			get prevented() { return prevented },
			preventDefault() { prevented = true },
			... over,
		}
	}

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

	const tap = ( pane: $$.$bog_vmap_app_pane, x: number, y: number ) => {
		pane.node_press( pointer( x, y ) )
		pane.node_release( pointer( x, y, { buttons: 0 } ) )
	}

	const nudged = ( $: $mol_ambient_context )=> {

		type spots = { readonly [ name: string ]: { readonly x: number, readonly y: number } }

		const writes = [] as spots[]
		let places = { A: { x: 100, y: 100 }, B: { x: 200, y: 100 } } as spots

		const pane = tools_make( $, {
			spots: ( next?: spots )=> {
				if( next === undefined ) return places
				places = next
				writes.push( next )
				return places
			},
		} )

		pane.sizes({
			[ `${ root }/A` ]: box( 100, 100 ),
			[ `${ root }/B` ]: box( 200, 100 ),
			[ `${ root }/Board` ]: box( 400, 0, 300, 200 ),
			[ `${ root }/Board/Inner` ]: box( 410, 10 ),
		})

		pane.picked([ 'A' ])

		return { pane, writes, places: ()=> places }
	}

	const drawn = ()=> {
		const boards = [] as ( $bog_vmap_bridge_rect | null | undefined )[]
		const board_draw = ( next?: $bog_vmap_bridge_rect | null )=> {
			boards.push( next )
			return next ?? null
		}
		return { boards, board_draw }
	}

	const settle = async ()=> {
		await Promise.resolve()
		await Promise.resolve()
	}

	$mol_test({

		'all the styles of the pane live in one sheet: a second define would wipe the first'( $ ) {

			const sheet = $.$mol_dom_context.document.getElementById( '$mol_style_attach:$bog_vmap_app_pane' )
			$mol_assert_ok( sheet )

			const text = sheet!.innerHTML

			for( const part of [ 'scene', 'overlay', 'band', 'draft', 'ghost', 'sizing', 'text_field', 'say' ] ) {
				$mol_assert_equal( part + ' есть: ' + text.includes( `bog_vmap_app_pane_${ part }` ), part + ' есть: true' )
			}

		},

		'the tool keys switch the tool, and Escape steps back to the arrow'( $ ) {
			const pane = tools_make( $ )

			$mol_assert_equal( pane.tool(), 'select' )

			const f = stroke( 'KeyF' )
			$mol_assert_equal( pane.key_down( f ), true )
			$mol_assert_equal( f.prevented, true )
			$mol_assert_equal( pane.tool(), 'board' )

			pane.key_down( stroke( 'KeyH' ) )
			$mol_assert_equal( pane.tool(), 'hand' )
			$mol_assert_equal( pane.hand(), true )

			pane.key_down( stroke( 'KeyV' ) )
			$mol_assert_equal( pane.tool(), 'select' )
			$mol_assert_equal( pane.hand(), false )

			pane.key_down( stroke( 'KeyF' ) )
			pane.key_down( stroke( 'Escape' ) )
			$mol_assert_equal( pane.tool(), 'select' )

		},

		'letters go by the place of the key on any layout, Escape and Delete by their name'( $ ) {
			let deleted = 0
			const pane = tools_make( $, { node_delete: ()=> { ++ deleted; return null } } )

			pane.key_down( stroke( 'KeyF', { key: 'а' } ) )
			$mol_assert_equal( pane.tool(), 'board' )

			pane.key_down( stroke( 'KeyV', { key: 'м' } ) )
			$mol_assert_equal( pane.tool(), 'select' )

			$mol_assert_equal( pane.key_down( stroke( 'KeyJ', { key: 'h' } ) ), false )
			$mol_assert_equal( pane.tool(), 'select' )

			pane.key_down( stroke( 'KeyH' ) )
			$mol_assert_equal( pane.key_down( stroke( '', { key: 'Escape' } ) ), true )
			$mol_assert_equal( pane.tool(), 'select' )

			pane.picked([ 'A' ])
			$mol_assert_equal( pane.key_down( stroke( '', { key: 'Backspace' } ) ), true )
			$mol_assert_equal( pane.key_down( stroke( '', { key: 'Delete' } ) ), true )
			$mol_assert_equal( deleted, 2 )

		},

		'plus and minus step the zoom about the middle of the view, and a hundred comes back by two keys'( $ ) {

			const pane = tools_make( $ )
			const middle = { clientX: 10 + 500, clientY: 20 + 400 }
			const under = ()=> pane.world_point( middle as PointerEvent ).map( one => Math.round( one ) )

			const held = under()

			const plus = stroke( 'Equal', { key: '+', shiftKey: true } )
			$mol_assert_equal( pane.key_down( plus ), true )
			$mol_assert_equal( plus.prevented, true )
			$mol_assert_equal( Math.round( pane.camera_zoom() * 100 ), 125 )
			$mol_assert_like( under(), held )

			pane.key_down( stroke( 'Minus', { key: '-' } ) )
			$mol_assert_equal( Math.round( pane.camera_zoom() * 100 ), 100 )
			$mol_assert_like( under(), held )

			pane.key_down( stroke( 'Equal' ) )
			pane.key_down( stroke( 'Digit0', { metaKey: true } ) )
			$mol_assert_equal( pane.camera_zoom(), 1 )

			pane.key_down( stroke( 'Equal' ) )
			pane.key_down( stroke( 'Digit0', { shiftKey: true } ) )
			$mol_assert_equal( pane.camera_zoom(), 1 )

			const browser = stroke( 'Equal', { metaKey: true } )
			$mol_assert_equal( pane.key_down( browser ), false )
			$mol_assert_equal( browser.prevented, false )
			$mol_assert_equal( pane.camera_zoom(), 1 )

		},

		'an arrow moves a free part by a step, Shift by ten, and writes the places once a press'( $ ) {

			const { pane, writes, places } = nudged( $ )

			const right = stroke( 'ArrowRight' )
			$mol_assert_equal( pane.key_down( right ), true )
			$mol_assert_equal( right.prevented, true )
			$mol_assert_like( places().A, { x: 101, y: 100 } )
			$mol_assert_equal( writes.length, 1 )

			pane.key_down( stroke( 'ArrowDown', { shiftKey: true } ) )
			$mol_assert_like( places().A, { x: 101, y: 110 } )
			$mol_assert_equal( writes.length, 2 )

			pane.key_down( stroke( 'ArrowUp' ) )
			pane.key_down( stroke( 'ArrowLeft', { shiftKey: true } ) )
			$mol_assert_like( places().A, { x: 91, y: 109 } )
			$mol_assert_equal( writes.length, 4 )

			pane.picked([ 'A', 'B' ])
			pane.key_down( stroke( 'ArrowRight', { shiftKey: true } ) )

			$mol_assert_like( places().A, { x: 101, y: 109 } )
			$mol_assert_like( places().B, { x: 210, y: 100 } )
			$mol_assert_equal( writes.length, 5 )

			$mol_assert_equal( pane.say(), '' )

		},

		'a part held by a layout says so instead of moving, and a modifier leaves the arrow alone'( $ ) {

			const { pane, writes, places } = nudged( $ )

			pane.picked([ 'Inner' ])

			const arrow = stroke( 'ArrowRight' )
			$mol_assert_equal( pane.key_down( arrow ), true )
			$mol_assert_equal( writes.length, 0 )
			$mol_assert_like( places().A, { x: 100, y: 100 } )
			$mol_assert_ok( pane.say().includes( 'Inner' ) )
			$mol_assert_ok( pane.say().includes( 'раскладка родителя' ) )

			pane.picked([ 'A' ])

			const carried = stroke( 'ArrowRight', { metaKey: true } )
			$mol_assert_equal( pane.key_down( carried ), false )
			$mol_assert_equal( carried.prevented, false )
			$mol_assert_equal( writes.length, 0 )

			pane.picked([])
			$mol_assert_equal( pane.key_down( stroke( 'ArrowRight' ) ), false )
			$mol_assert_equal( writes.length, 0 )

		},

		'a tool key with a modifier, or typed into a field, changes nothing'( $ ) {
			const pane = tools_make( $ )
			const dom = $.$mol_dom_context

			for( const key of [
				stroke( 'KeyF', { metaKey: true } ),
				stroke( 'KeyH', { ctrlKey: true } ),
				stroke( 'KeyF', { altKey: true } ),
				stroke( 'KeyH', { shiftKey: true } ),
				stroke( 'KeyF', { target: dom.document.createElement( 'input' ) } ),
				stroke( 'KeyH', { target: dom.document.createElement( 'textarea' ) } ),
				stroke( 'KeyF', { target: dom.document.createElement( 'select' ) } ),
				stroke( 'KeyF', { target: { tagName: 'DIV', isContentEditable: true } as unknown as EventTarget } ),
				stroke( 'Space', { target: dom.document.createElement( 'input' ) } ),
			] ) {
				$mol_assert_equal( pane.key_down( key ), false )
				$mol_assert_equal( key.prevented, false )
			}

			$mol_assert_equal( pane.tool(), 'select' )
			$mol_assert_equal( pane.grip(), false )

		},

		'Escape takes the draft away, then the tool, then the pick'( $ ) {
			const pane = tools_make( $ )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })

			tap( pane, 60, 45 )
			$mol_assert_like( pane.picked(), [ 'A' ] )

			pane.key_down( stroke( 'KeyF' ) )
			pane.node_press( pointer( 510, 420 ) )
			$mol_assert_ok( pane.draft() !== null )

			pane.key_down( stroke( 'Escape' ) )
			$mol_assert_equal( pane.draft(), null )
			$mol_assert_equal( pane.tool(), 'board' )
			$mol_assert_like( pane.picked(), [ 'A' ] )

			pane.key_down( stroke( 'Escape' ) )
			$mol_assert_equal( pane.tool(), 'select' )
			$mol_assert_like( pane.picked(), [ 'A' ] )

			pane.key_down( stroke( 'Escape' ) )
			$mol_assert_like( pane.picked(), [] )

		},

		'Escape takes the pointer out of the node before it takes the pick'( $ ) {
			const pane = tools_make( $ )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })

			tap( pane, 60, 45 )
			tap( pane, 60, 45 )
			$mol_assert_equal( pane.inside(), true )

			pane.key_down( stroke( 'Escape' ) )
			$mol_assert_equal( pane.inside(), false )
			$mol_assert_like( pane.picked(), [ 'A' ] )

			pane.key_down( stroke( 'Escape' ) )
			$mol_assert_like( pane.picked(), [] )

		},

		'a tool picked while inside a node takes the pointer out of it'( $ ) {
			const pane = tools_make( $ )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })

			tap( pane, 60, 45 )
			tap( pane, 60, 45 )
			$mol_assert_equal( pane.inside(), true )

			pane.key_down( stroke( 'KeyF' ) )

			$mol_assert_equal( pane.inside(), false )
			$mol_assert_equal( pane.entered(), null )
			$mol_assert_like( pane.picked(), [ 'A' ] )

		},

		'Delete and Backspace ask for the delete, Cmd+D and Ctrl+D for a copy, only with a pick'( $ ) {
			let deleted = 0
			let copied = 0

			const pane = tools_make( $, {
				node_delete: ()=> { ++ deleted; return null },
				node_copy: ()=> { ++ copied; return null },
			} )

			for( const code of [ 'Delete', 'Backspace' ] ) $mol_assert_equal( pane.key_down( stroke( code ) ), false )
			$mol_assert_equal( pane.key_down( stroke( 'KeyD', { metaKey: true } ) ), false )
			$mol_assert_equal( deleted + copied, 0 )

			pane.picked([ 'A' ])

			const del = stroke( 'Delete' )
			$mol_assert_equal( pane.key_down( del ), true )
			$mol_assert_equal( del.prevented, true )
			pane.key_down( stroke( 'Backspace' ) )
			pane.key_down( stroke( 'Delete', { shiftKey: true } ) )
			$mol_assert_equal( deleted, 3 )

			for( const key of [
				stroke( 'Delete', { metaKey: true } ),
				stroke( 'Backspace', { ctrlKey: true } ),
				stroke( 'Backspace', { altKey: true } ),
				stroke( 'Delete', { target: $.$mol_dom_context.document.createElement( 'input' ) } ),
			] ) $mol_assert_equal( pane.key_down( key ), false )
			$mol_assert_equal( deleted, 3 )

			const cmd = stroke( 'KeyD', { metaKey: true } )
			$mol_assert_equal( pane.key_down( cmd ), true )
			$mol_assert_equal( cmd.prevented, true )
			pane.key_down( stroke( 'KeyD', { ctrlKey: true } ) )
			$mol_assert_equal( copied, 2 )

			for( const key of [
				stroke( 'KeyD' ),
				stroke( 'KeyD', { metaKey: true, shiftKey: true } ),
				stroke( 'KeyD', { ctrlKey: true, altKey: true } ),
				stroke( 'KeyD', { metaKey: true, target: $.$mol_dom_context.document.createElement( 'textarea' ) } ),
			] ) $mol_assert_equal( pane.key_down( key ), false )
			$mol_assert_equal( copied, 2 )

			$mol_assert_equal( pane.tool(), 'select' )

		},

		'the space bar holds the hand until it goes up'( $ ) {
			const pane = tools_make( $ )

			const space = stroke( 'Space' )
			$mol_assert_equal( pane.key_down( space ), true )
			$mol_assert_equal( space.prevented, true )
			$mol_assert_equal( pane.grip(), true )
			$mol_assert_equal( pane.hand(), true )
			$mol_assert_equal( pane.tool(), 'select' )

			pane.key_up( stroke( 'KeyV' ) )
			$mol_assert_equal( pane.grip(), true )

			pane.key_up( stroke( 'Space' ) )
			$mol_assert_equal( pane.grip(), false )
			$mol_assert_equal( pane.hand(), false )

			$mol_assert_equal( pane.key_down( stroke( 'Space', { shiftKey: true } ) ), false )
			$mol_assert_equal( pane.grip(), false )

		},

		'a host that forgets the entered node on a new pick still gets the keyboard back'( $ ) {
			const pane = tools_make( $ )

			const own = pane.picked.bind( pane )
			pane.picked = ( next?: readonly string[] )=> {
				if( next !== undefined && !$mol_compare_deep( next, own() ) ) pane.entered( null )
				return own( next )
			}

			let focused = 0
			pane.focused = ( next?: boolean )=> {
				if( next ) ++ focused
				return Boolean( next )
			}

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ), [ `${root}/B` ]: box( 300, 0 ) })

			tap( pane, 60, 45 )
			tap( pane, 60, 45 )
			$mol_assert_equal( pane.inside(), true )
			$mol_assert_equal( focused, 0 )

			tap( pane, 360, 45 )

			$mol_assert_like( pane.picked(), [ 'B' ] )
			$mol_assert_equal( pane.inside(), false )
			$mol_assert_equal( focused, 1 )

		},

		'the tool ports of the head switch the tool and say which one is on'( $ ) {
			const pane = tools_make( $ )

			$mol_assert_equal( pane.tool_select(), true )

			pane.tool_board( true )
			$mol_assert_equal( pane.tool(), 'board' )
			$mol_assert_equal( pane.tool_board(), true )
			$mol_assert_equal( pane.tool_select(), false )

			pane.tool_board( false )
			$mol_assert_equal( pane.tool(), 'select' )

			pane.tool_board( true )
			pane.tool_hand( true )
			$mol_assert_equal( pane.tool(), 'hand' )
			$mol_assert_equal( pane.tool_board(), false )

			pane.tool_hand( false )
			$mol_assert_equal( pane.tool(), 'select' )

			pane.tool_board( true )
			pane.tool_select( true )
			$mol_assert_equal( pane.tool(), 'select' )

			pane.tool_select( false )
			$mol_assert_equal( pane.tool(), 'select' )

		},

		'a drag with the board tool asks for a board of that box in the world'( $ ) {
			const { boards, board_draw } = drawn()
			const pane = tools_make( $, { board_draw } )

			pane.camera_shift( new $mol_vector_2d( 100, 50 ) )
			pane.camera_zoom( 2 )

			pane.key_down( stroke( 'KeyF' ) )

			pane.node_press( pointer( 310, 270 ) )
			pane.node_move( pointer( 710, 470 ) )

			$mol_assert_like( pane.draft_style(), { left: '300px', top: '250px', width: '400px', height: '200px' } )

			pane.node_release( pointer( 710, 470, { buttons: 0 } ) )

			$mol_assert_like( boards, [ { x: 100, y: 100, width: 200, height: 100 } ] )
			$mol_assert_equal( pane.draft(), null )
			$mol_assert_like( pane.draft_style(), {} )
			$mol_assert_equal( pane.tool(), 'select' )

		},

		'a drag the other way asks for the same box, rounded to whole pixels'( $ ) {
			const { boards, board_draw } = drawn()
			const pane = tools_make( $, { board_draw } )

			pane.camera_shift( new $mol_vector_2d( 100, 50 ) )
			pane.camera_zoom( 2 )

			pane.tool_board( true )

			pane.node_press( pointer( 711, 471 ) )
			pane.node_move( pointer( 311, 271 ) )
			pane.node_release( pointer( 311, 271, { buttons: 0 } ) )

			$mol_assert_like( boards, [ { x: 101, y: 101, width: 200, height: 100 } ] )

		},

		'a click with the board tool asks for the default board at the point'( $ ) {
			const { boards, board_draw } = drawn()
			const pane = tools_make( $, { board_draw } )

			pane.camera_shift( new $mol_vector_2d( 100, 50 ) )
			pane.camera_zoom( 2 )

			pane.tool_board( true )

			pane.node_press( pointer( 310, 270 ) )
			pane.node_move( pointer( 313, 271 ) )
			pane.node_release( pointer( 313, 271, { buttons: 0 } ) )

			$mol_assert_like( boards, [ { x: 100, y: 100, width: 0, height: 0 } ] )
			$mol_assert_equal( pane.tool(), 'select' )

		},

		'the board tool draws over a node without picking or carrying it'( $ ) {
			const { boards, board_draw } = drawn()
			const pane = tools_make( $, { board_draw } )

			pane.sizes({ [ `${root}/A` ]: box( 80, 80 ) })
			pane.spots({ A: { x: 80, y: 80 } })

			pane.tool_board( true )

			pane.node_press( pointer( 110, 120 ) )
			pane.node_move( pointer( 410, 320 ) )
			pane.node_release( pointer( 410, 320, { buttons: 0 } ) )

			$mol_assert_like( pane.picked(), [] )
			$mol_assert_like( pane.spots(), { A: { x: 80, y: 80 } } )
			$mol_assert_like( boards, [ { x: 100, y: 100, width: 300, height: 200 } ] )

		},

		'the hand and the board tool keep the pointer off the ports'( $ ) {
			const pane = tools_make( $ )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })

			pane.tool_hand( true )
			pane.node_move( pointer( 60, 45, { buttons: 0 } ) )
			$mol_assert_equal( pane.hovered(), null )

			pane.tool_board( true )
			pane.node_move( pointer( 60, 45, { buttons: 0 } ) )
			$mol_assert_equal( pane.hovered(), null )

			pane.tool_select( true )
			pane.grip( true )
			pane.node_move( pointer( 60, 45, { buttons: 0 } ) )
			$mol_assert_equal( pane.hovered(), null )

			pane.grip( false )
			pane.node_move( pointer( 60, 45, { buttons: 0 } ) )
			$mol_assert_equal( pane.hovered(), 'A' )

		},

		'the hand takes the press away from the node and the wire'( $ ) {
			const pane = tools_make( $ )

			pane.sizes({ [ `${root}/A` ]: box( 0, 0 ) })
			pane.spots({ A: { x: 0, y: 0 } })

			pane.tool_hand( true )

			pane.node_press( pointer( 60, 45 ) )
			pane.node_move( pointer( 160, 95 ) )
			pane.node_release( pointer( 160, 95, { buttons: 0 } ) )

			$mol_assert_like( pane.picked(), [] )
			$mol_assert_equal( pane.drag(), null )
			$mol_assert_equal( pane.band(), null )
			$mol_assert_equal( pane.wire_drag(), null )
			$mol_assert_like( pane.spots(), { A: { x: 0, y: 0 } } )

		},

		'a copy of a free node stands to the right of it, a nested one gets no spot'( $ ) {
			const pane = tools_make( $ )

			pane.sizes({
				[ `${root}/A` ]: box( 80, 80 ),
				[ `${root}/P` ]: box( 400, 0, 300, 200 ),
				[ `${root}/P/B` ]: box( 400, 0 ),
			})
			pane.spots({ A: { x: 80, y: 80 }, P: { x: 400, y: 0 }, C: { x: 5, y: 6 } })

			$mol_assert_like( pane.copy_spot( 'A' ), { x: 204, y: 80 } )
			$mol_assert_like( pane.copy_spot( 'P' ), { x: 724, y: 0 } )
			$mol_assert_like( pane.copy_spot( 'C' ), { x: 29, y: 6 } )
			$mol_assert_equal( pane.copy_spot( 'B' ), null )

		},

		'the draft is drawn on the canvas while the board tool is dragged'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const overlay = stage.overlay()
			const drafts = ()=> stage.root.querySelectorAll( '[bog_vmap_app_pane_draft]' )

			stage.pane.tool_board( true )
			stage.redraw()

			$mol_assert_equal( stage.pane.dom_node().getAttribute( 'bog_vmap_app_pane_tool' ), 'board' )
			$mol_assert_equal( drafts().length, 0 )

			stage.press( overlay, stage.client([ 100, 100 ]) )
			stage.move( overlay, stage.client([ 300, 250 ]) )
			stage.redraw()

			$mol_assert_equal( drafts().length, 1 )

			const style = ( drafts()[ 0 ] as HTMLElement ).style
			$mol_assert_like(
				[ style.left, style.top, style.width, style.height ],
				[ '100px', '100px', '200px', '150px' ],
			)

			stage.release( overlay, stage.client([ 300, 250 ]) )
			stage.redraw()

			$mol_assert_equal( drafts().length, 0 )
			$mol_assert_equal( stage.pane.dom_node().getAttribute( 'bog_vmap_app_pane_tool' ), 'select' )

		},

		'the hand pans over a node and leaves the node and the pick alone'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const overlay = stage.overlay()

			stage.drop( calc, stage.client([ 200, 150 ]) )
			$mol_assert_like( [ ... stage.app.picked() ], [ 'Calc' ] )

			stage.pane.tool_hand( true )

			const from = stage.part_center( 'Calc' )
			stage.press( overlay, from )
			stage.move( overlay, [ from[0] + 60, from[1] + 40 ] )
			stage.release( overlay, [ from[0] + 60, from[1] + 40 ] )
			stage.redraw()

			$mol_assert_like( [ ... stage.pane.camera_shift() ], [ 60, 40 ] )
			$mol_assert_like( stage.app.spots(), { Calc: { x: 104, y: 74 } } )
			$mol_assert_like( [ ... stage.app.picked() ], [ 'Calc' ] )

		},

		'the space bar pans over a node, and a drag begun before it stays a drag'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const overlay = stage.overlay()

			stage.drop( calc, stage.client([ 200, 150 ]) )

			stage.pane.key_down( stroke( 'Space' ) )

			let from = stage.part_center( 'Calc' )
			stage.press( overlay, from )
			stage.move( overlay, [ from[0] + 60, from[1] + 40 ] )
			stage.release( overlay, [ from[0] + 60, from[1] + 40 ] )
			stage.redraw()

			stage.pane.key_up( stroke( 'Space' ) )

			$mol_assert_like( [ ... stage.pane.camera_shift() ], [ 60, 40 ] )
			$mol_assert_like( stage.app.spots(), { Calc: { x: 104, y: 74 } } )

			from = stage.part_center( 'Calc' )
			stage.press( overlay, from )
			stage.move( overlay, [ from[0] + 10, from[1] ] )

			stage.pane.key_down( stroke( 'Space' ) )

			stage.move( overlay, [ from[0] + 30, from[1] + 20 ] )
			stage.release( overlay, [ from[0] + 30, from[1] + 20 ] )
			stage.redraw()

			stage.pane.key_up( stroke( 'Space' ) )

			$mol_assert_like( [ ... stage.pane.camera_shift() ], [ 60, 40 ] )
			$mol_assert_like( stage.app.spots(), { Calc: { x: 134, y: 94 } } )

		},

		'the held hand lifts the hole over the entered node, and lets it back'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			stage.tap( stage.part_center( 'Calc' ) )
			stage.tap( stage.part_center( 'Calc' ) )

			$mol_assert_equal( stage.pane.inside(), true )
			$mol_assert_ok( stage.pane.overlay_style().clipPath !== 'none' )

			stage.pane.key_down( stroke( 'Space' ) )
			$mol_assert_equal( stage.pane.overlay_style().clipPath, 'none' )
			$mol_assert_equal( stage.pane.inside(), true )

			stage.redraw()
			$mol_assert_equal( stage.pane.dom_node().getAttribute( 'bog_vmap_app_pane_hand' ), 'true' )

			stage.pane.key_up( stroke( 'Space' ) )
			$mol_assert_ok( stage.pane.overlay_style().clipPath !== 'none' )

			stage.redraw()
			$mol_assert_equal( stage.pane.dom_node().hasAttribute( 'bog_vmap_app_pane_hand' ), false )

		},

		async 'a press on another node takes the keyboard back from the frame'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const dom = $.$mol_dom_context

			stage.drop( calc, stage.client([ 200, 150 ]) )
			stage.drop( map, stage.client([ 400, 150 ]) )

			stage.tap( stage.part_center( 'Calc' ) )
			stage.tap( stage.part_center( 'Calc' ) )
			$mol_assert_equal( stage.pane.inside(), true )

			stage.frame().focus()
			$mol_assert_equal( dom.document.activeElement, stage.frame() )

			stage.tap( stage.part_center( 'Map' ) )
			await settle()

			$mol_assert_equal( stage.app.selected(), 'Map' )
			$mol_assert_equal( stage.pane.inside(), false )
			$mol_assert_equal( dom.document.activeElement, stage.pane.dom_node() )

		},

		async 'a press on the empty canvas takes the keyboard back from the frame'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const dom = $.$mol_dom_context

			stage.drop( calc, stage.client([ 200, 150 ]) )

			stage.tap( stage.part_center( 'Calc' ) )
			stage.tap( stage.part_center( 'Calc' ) )
			$mol_assert_equal( stage.pane.inside(), true )

			stage.frame().focus()

			stage.tap( stage.client([ 520, 420 ]) )
			await settle()

			$mol_assert_equal( stage.app.selected(), null )
			$mol_assert_equal( dom.document.activeElement, stage.pane.dom_node() )

		},

		async 'Escape relayed from the frame gives the keyboard back to the host'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const dom = $.$mol_dom_context

			stage.drop( calc, stage.client([ 200, 150 ]) )

			stage.tap( stage.part_center( 'Calc' ) )
			stage.tap( stage.part_center( 'Calc' ) )

			stage.frame().focus()

			const event = new dom.MessageEvent( 'message', { data: { ns: $bog_vmap_bridge_ns, kind: 'key', key: 'Escape' } } )
			Object.defineProperty( event, 'source', { value: stage.pane.scene_peer() } )
			dom.dispatchEvent( event )
			stage.redraw()
			await settle()

			$mol_assert_equal( stage.pane.inside(), false )
			$mol_assert_equal( stage.app.selected(), 'Calc' )
			$mol_assert_equal( dom.document.activeElement, stage.pane.dom_node() )

		},

		async 'Escape in a field of the host only takes the focus off the field'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const dom = $.$mol_dom_context

			stage.drop( calc, stage.client([ 200, 150 ]) )
			$mol_assert_equal( stage.app.selected(), 'Calc' )

			const field = stage.app.Root_name().dom_node() as HTMLInputElement
			field.focus()
			$mol_assert_equal( dom.document.activeElement, field )

			const first = stroke( 'Escape', { target: field } )
			$mol_assert_equal( stage.pane.key_down( first ), true )
			await settle()

			$mol_assert_equal( dom.document.activeElement, stage.pane.dom_node() )
			$mol_assert_equal( stage.app.selected(), 'Calc' )

			stage.pane.key_down( stroke( 'Escape', { target: stage.pane.dom_node() } ) )

			$mol_assert_equal( stage.app.selected(), null )

		},

	})

}

namespace $ {
	const d = '$'

	const root = `${d}bog_vmap_app_snap`

	const calc = `${d}flow_calc`
	const map = `${d}flow_map`

	const box = ( x: number, y: number, width = 100, height = 50 )=> ({ x, y, width, height })

	const pane_make = (
		$: $mol_ambient_context,
		boxes: { readonly [ name: string ]: $bog_vmap_bridge_rect },
		over: Partial< $$.$bog_vmap_app_pane > = {},
	)=> {
		const peer = { origin: 'null', postMessage() {} }

		const pane = $$.$bog_vmap_app_pane.make({
			$,
			doc_root: ()=> root,
			doc_names: ()=> Object.keys( boxes ),
			pane_rect: ()=> ({ left: 0, top: 0, width: 1000, height: 800 }),
			scene_peer: ()=> peer,
			... over,
		})

		const sizes = {} as { [ key: string ]: $bog_vmap_bridge_rect }
		const spots = {} as { [ name: string ]: { readonly x: number, readonly y: number } }

		for( const name of Object.keys( boxes ) ) {
			sizes[ `${ root }/${ name }` ] = boxes[ name ]
			spots[ name ] = { x: boxes[ name ].x, y: boxes[ name ].y }
		}

		pane.sizes( sizes )
		pane.spots( spots )

		return pane
	}

	const pointer = ( clientX: number, clientY: number, over: Partial< PointerEvent > = {} )=> ({
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

	$mol_test({
		'a dragged node snaps its edge onto its neighbour, the snap hints follow and go on release'( $ ) {
			const pane = pane_make( $, { A: box( 0, 0 ), B: box( 300, 200 ) } )

			pane.node_press( pointer( 50, 25 ) )
			pane.node_move( pointer( 347, 129 ) )

			$mol_assert_like( pane.spots()[ 'A' ], { x: 300, y: 104 } )
			$mol_assert_like( pane.snap_hints(), [
				{ axis: 'x', at: 300, from: 104, to: 250 },
				{ axis: 'x', at: 350, from: 104, to: 250 },
				{ axis: 'x', at: 400, from: 104, to: 250 },
			] )

			pane.node_release( pointer( 347, 129, { buttons: 0 } ) )

			$mol_assert_like( pane.spots()[ 'A' ], { x: 300, y: 104 } )
			$mol_assert_like( pane.snap_hints(), [] )

		},

		'Cmd or Ctrl held during a drag lets the node free of its neighbours, Alt does not'( $ ) {
			const pane = pane_make( $, { A: box( 0, 0 ), B: box( 300, 200 ) } )

			pane.node_press( pointer( 50, 25 ) )

			pane.node_move( pointer( 347, 129, { metaKey: true } ) )

			$mol_assert_like( pane.spots()[ 'A' ], { x: 297, y: 104 } )
			$mol_assert_like( pane.snap_hints(), [] )

			pane.node_move( pointer( 347, 129, { altKey: true } ) )

			$mol_assert_like( pane.spots()[ 'A' ], { x: 300, y: 104 } )
			$mol_assert_equal( pane.snap_hints().length, 3 )

			pane.node_move( pointer( 347, 129, { ctrlKey: true } ) )

			$mol_assert_like( pane.spots()[ 'A' ], { x: 297, y: 104 } )
			$mol_assert_like( pane.snap_hints(), [] )

			pane.node_move( pointer( 347, 129 ) )

			$mol_assert_like( pane.spots()[ 'A' ], { x: 300, y: 104 } )
			$mol_assert_equal( pane.snap_hints().length, 3 )

		},

		'the slack is counted in pixels of the screen, not of the world'( $ ) {
			const near = pane_make( $, { A: box( 0, 0 ), B: box( 300, 200 ) } )

			near.node_press( pointer( 50, 25 ) )
			near.node_move( pointer( 346, 129 ) )

			$mol_assert_like( near.spots()[ 'A' ], { x: 300, y: 104 } )

			const zoomed = pane_make( $, { A: box( 0, 0 ), B: box( 300, 200 ) } )
			zoomed.camera_zoom( 2 )

			zoomed.node_press( pointer( 100, 50 ) )
			zoomed.node_move( pointer( 692, 258 ) )

			$mol_assert_like( zoomed.spots()[ 'A' ], { x: 296, y: 104 } )
			$mol_assert_like( zoomed.snap_hints(), [] )

			zoomed.node_move( pointer( 698, 258 ) )

			$mol_assert_like( zoomed.spots()[ 'A' ], { x: 300, y: 104 } )
			$mol_assert_like( zoomed.snap_hint_style( 0 ), { left: '600px', top: '208px', width: '1px', height: '292px' } )

		},

		'a neighbour off the screen does not pull'( $ ) {
			const pane = pane_make( $, { A: box( 0, 0 ), B: box( 1200, 0 ) } )

			pane.node_press( pointer( 50, 25 ) )
			pane.node_move( pointer( 1147, 25 ) )

			$mol_assert_like( pane.spots()[ 'A' ], { x: 1097, y: 0 } )
			$mol_assert_like( pane.snap_hints(), [] )

		},

		'a picked set snaps as one box'( $ ) {
			const pane = pane_make( $, { A: box( 0, 0 ), B: box( 0, 100, 160, 50 ), C: box( 300, 400 ) } )
			pane.picked([ 'A', 'B' ])

			pane.node_press( pointer( 50, 25 ) )
			pane.node_move( pointer( 187, 25 ) )

			$mol_assert_like( pane.spots(), { A: { x: 140, y: 0 }, B: { x: 140, y: 100 }, C: { x: 300, y: 400 } } )
			$mol_assert_like( pane.snap_hints(), [ { axis: 'x', at: 300, from: 0, to: 450 } ] )

		},

		'over a container the snap hints give way to the insertion line'( $ ) {
			const pane = pane_make(
				$,
				{ A: box( 0, 0 ), B: box( 300, 200 ), P: box( 500, 500, 300, 200 ) },
				{ containers: ()=> [ 'P' ] },
			)

			pane.node_press( pointer( 50, 25 ) )
			pane.node_move( pointer( 347, 129 ) )

			$mol_assert_equal( pane.snap_hints().length, 3 )

			pane.node_move( pointer( 600, 600 ) )

			$mol_assert_ok( pane.slot() !== null )
			$mol_assert_like( pane.snap_hints(), [] )

		},

		'the snap hints are drawn on the canvas while a part is dragged, and go on release'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const overlay = stage.overlay()
			const hints = ()=> [ ... stage.root.querySelectorAll( '[bog_vmap_app_pane_snap_hint]' ) ] as HTMLElement[]

			stage.drop( calc, stage.client([ 200, 150 ]) )
			stage.drop( map, stage.client([ 400, 300 ]) )

			stage.app.spots({ Calc: { x: 100, y: 100 }, Map: { x: 300, y: 300 } })
			stage.redraw()
			stage.scene.flush()

			const from = stage.part_center( 'Calc' )

			stage.press( overlay, from )
			stage.move( overlay, [ from[0] + 203, from[1] + 50 ], { metaKey: true } )
			stage.redraw()

			$mol_assert_like( stage.app.spots()[ 'Calc' ], { x: 303, y: 150 } )
			$mol_assert_equal( hints().length, 0 )

			stage.move( overlay, [ from[0] + 203, from[1] + 50 ] )
			stage.redraw()

			$mol_assert_like( stage.app.spots()[ 'Calc' ], { x: 300, y: 150 } )
			$mol_assert_equal( hints().length, 3 )

			const line = hints()[ 0 ].style
			$mol_assert_like( [ line.left, line.top, line.width, line.height ], [ '300px', '150px', '1px', '200px' ] )

			stage.release( overlay, [ from[0] + 203, from[1] + 50 ] )
			stage.redraw()

			$mol_assert_like( stage.app.spots()[ 'Calc' ], { x: 300, y: 150 } )
			$mol_assert_equal( hints().length, 0 )

		},

		'a part from the shelf lands centred by a guess, and exactly once its kind is measured'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			$mol_assert_like( stage.app.spots(), { Calc: { x: 104, y: 74 } } )

			stage.drop( calc, stage.client([ 400, 300 ]) )
			$mol_assert_like( stage.app.spots()[ 'Calc_2' ], { x: 350, y: 275 } )

			const box = stage.pane.part_box( 'Calc_2' )!
			$mol_assert_like( [ box.left + box.width / 2, box.top + box.height / 2 ], [ 400, 300 ] )

		},

		'the measure is taken from the same declaration, not from the same class'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )

			const node = stage.app.node()
			node.over_set( 'Calc', 'op', node.tree().struct( 'op', [ node.tree().data( 'minus' ) ] ) )
			stage.redraw()
			stage.scene.flush()

			stage.drop( calc, stage.client([ 400, 300 ]) )
			$mol_assert_like( stage.app.spots()[ 'Calc_2' ], { x: 304, y: 224 } )

		},

		'a part nested in a board gives no measure to a free one'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )

			stage.app.board_draw({ x: 0, y: 0, width: 400, height: 300 })
			stage.redraw()
			stage.scene.flush()

			stage.drop( calc, stage.client([ 100, 100 ]) )
			$mol_assert_like( stage.app.node().sub_names( 'Page' ), [ 'Calc' ] )

			stage.drop( calc, stage.client([ 500, 400 ]) )
			$mol_assert_like( stage.app.spots()[ 'Calc_2' ], { x: 404, y: 324 } )

		},

		'a text and a part put in the same place get the same holder'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const pane = stage.pane

			stage.app.board_draw({ x: 0, y: 0, width: 400, height: 300 })
			stage.redraw()
			stage.scene.flush()

			stage.drop( calc, stage.client([ 100, 100 ]) )

			$mol_assert_like( stage.app.node().sub_names( 'Page' ), [ 'Calc' ] )

			pane.tool_text( true )
			stage.tap( stage.client([ 100, 200 ]) )
			pane.text_new( 'Привет' )
			pane.text_new_submit()
			stage.redraw()

			$mol_assert_like( stage.app.node().sub_names( 'Page' ), [ 'Calc', 'Text' ] )
			$mol_assert_equal( stage.app.spots()[ 'Text' ], undefined )
			$mol_assert_equal( ( stage.app.node().sub_names() ?? [] ).includes( 'Text' ), false )

		},

		'Escape over a typed text keeps the work and says so, over an empty one writes nothing'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const pane = stage.pane

			const escape = { key: 'Escape', stopPropagation() {} } as unknown as KeyboardEvent

			pane.tool_text( true )
			stage.tap( stage.client([ 300, 200 ]) )
			pane.text_new( 'Привет' )
			pane.text_new_key( escape )
			stage.redraw()

			$mol_assert_like( stage.app.node().part_names(), [ 'Text' ] )
			$mol_assert_ok( stage.app.doc_source().includes( 'title \\Привет' ) )
			$mol_assert_equal( pane.say(), pane.text_kept_note() )
			$mol_assert_equal( pane.text_spot(), null )

			const before = stage.app.doc_source()

			pane.tool_text( true )
			stage.tap( stage.client([ 500, 400 ]) )
			pane.text_new( '   ' )
			pane.text_new_key( escape )
			stage.redraw()

			$mol_assert_equal( stage.app.doc_source(), before )
			$mol_assert_equal( pane.text_spot(), null )

		},

		'a text on bare canvas stays a free node with a spot of its own'( $ ) {
			const stage = $bog_vmap_app_flow_stage( $ )
			const pane = stage.pane

			pane.tool_text( true )
			stage.tap( stage.client([ 300, 200 ]) )
			pane.text_new( 'Привет' )
			pane.text_new_submit()
			stage.redraw()

			$mol_assert_like( stage.app.node().part_names(), [ 'Text' ] )
			$mol_assert_ok( stage.app.spots()[ 'Text' ] )

		},

		'a guide pulled off the ruler reaches the document only on release'( $ ) {
			const pane = pane_make( $, { A: box( 0, 0 ) } )

			pane.ruler_press( 'x', pointer( 300, 40 ) )

			const id = pane.guide_ids()[ 0 ]

			$mol_assert_equal( pane.guide_ids().length, 1 )
			$mol_assert_like( pane.guide_at( id ), { axis: 'x', at: 300 } )
			$mol_assert_like( pane.guides(), {} )

			pane.guide_move( id, pointer( 420, 200 ) )

			$mol_assert_like( pane.guide_at( id ), { axis: 'x', at: 420 } )
			$mol_assert_like( pane.guides(), {} )

			pane.guide_release( id, pointer( 420, 200, { buttons: 0 } ) )

			$mol_assert_like( pane.guides(), { [ id ]: { axis: 'x', at: 420 } } )
			$mol_assert_equal( pane.guide_drag(), null )

		},

		'a guide moves, and a drag back onto the ruler takes it away'( $ ) {
			const pane = pane_make( $, { A: box( 0, 0 ) }, {
				pane_rect: ()=> ({ left: 20, top: 20, width: 1000, height: 800 }),
			} )

			pane.guides({ one: { axis: 'x', at: 300 } })

			const press = ( x: number )=> pointer( x, 120, { stopPropagation() {} } )

			pane.guide_press( 'one', press( 320 ) )
			pane.guide_move( 'one', pointer( 380, 120 ) )

			$mol_assert_like( pane.guide_at( 'one' ), { axis: 'x', at: 360 } )

			pane.guide_release( 'one', pointer( 380, 120, { buttons: 0 } ) )

			$mol_assert_like( pane.guides(), { one: { axis: 'x', at: 360 } } )

			pane.guide_press( 'one', press( 380 ) )
			pane.guide_move( 'one', pointer( 10, 120 ) )

			$mol_assert_equal( pane.guide_drag()?.off, true )

			pane.guide_release( 'one', pointer( 10, 120, { buttons: 0 } ) )

			$mol_assert_like( pane.guides(), {} )

		},

		'Delete takes away the picked guide and leaves the nodes alone'( $ ) {
			const pane = pane_make( $, { A: box( 0, 0 ) } )

			pane.guides({ one: { axis: 'y', at: 200 } })
			pane.picked([ 'A' ])

			let dropped = 0
			pane.node_delete = ()=> { ++ dropped; return null }

			pane.guide_press( 'one', pointer( 400, 200, { stopPropagation() {} } ) )
			pane.guide_release( 'one', pointer( 400, 200, { buttons: 0 } ) )

			$mol_assert_equal( pane.guide_picked( 'one' ), true )

			const stroke = { key: 'Delete', prevented: false, preventDefault() { this.prevented = true } }

			$mol_assert_equal( pane.key_down( stroke as unknown as KeyboardEvent ), true )
			$mol_assert_like( pane.guides(), {} )
			$mol_assert_equal( dropped, 0 )
			$mol_assert_equal( pane.key_down( stroke as unknown as KeyboardEvent ), true )
			$mol_assert_equal( dropped, 1 )

		},

		'a node snaps to a guide on the axis of the guide, and only on it'( $ ) {
			const upright = pane_make( $, { A: box( 0, 0 ) } )

			upright.guides({ one: { axis: 'x', at: 300 } })

			upright.node_press( pointer( 50, 25 ) )
			upright.node_move( pointer( 347, 129 ) )

			$mol_assert_like( upright.spots()[ 'A' ], { x: 300, y: 104 } )

			const flat = pane_make( $, { A: box( 0, 0 ) } )

			flat.guides({ one: { axis: 'y', at: 100 } })

			flat.node_press( pointer( 50, 25 ) )
			flat.node_move( pointer( 347, 129 ) )

			$mol_assert_like( flat.spots()[ 'A' ], { x: 297, y: 100 } )

		},

		'a guide dragged near a node edge sticks to it'( $ ) {
			const pane = pane_make( $, { A: box( 0, 0 ), B: box( 300, 200 ) } )

			pane.ruler_press( 'x', pointer( 297, 40 ) )

			const id = pane.guide_ids()[ 0 ]

			$mol_assert_like( pane.guide_at( id ), { axis: 'x', at: 300 } )

			pane.guide_move( id, pointer( 500, 200 ) )

			$mol_assert_like( pane.guide_at( id ), { axis: 'x', at: 500 } )

		},

		'a document that cannot be changed gets no guides'( $ ) {
			const pane = pane_make( $, { A: box( 0, 0 ) }, { editable: ()=> false } )

			pane.ruler_press( 'x', pointer( 300, 40 ) )

			$mol_assert_equal( pane.guide_drag(), null )
			$mol_assert_like( pane.guides(), {} )

		},

	})

}

namespace $ {
	const d = '$'

	const root = `${d}doc`

	const calc = `${d}flow_calc`

	const map = `${d}flow_map`

	const box = ( x: number, y: number, width = 100, height = 50 ) => ({ x, y, width, height })

	const menu_pane = ( $: $, over: Partial< $$.$bog_vmap_app_pane > = {} ) => {
		const peer = { origin: 'null', postMessage() {} }

		const pane = $$.$bog_vmap_app_pane.make({
			$,
			doc_root: ()=> root,
			doc_names: ()=> {
				const names = new Set< string >()
				for( const key of Object.keys( pane.sizes() ) ) {
					for( const step of key.split( '/' ).slice( 1 ) ) names.add( step )
				}
				return [ ... names ]
			},
			pane_rect: ()=> ({ left: 10, top: 20, width: 1000, height: 800 }),
			scene_peer: ()=> peer,
			... over,
		})

		pane.handshake( pane.scene_key(), 1 )

		return pane
	}

	const right = ( clientX: number, clientY: number )=> {
		let prevented = false

		const event = {
			button: 2,
			buttons: 0,
			clientX,
			clientY,
			altKey: false,
			ctrlKey: false,
			metaKey: false,
			shiftKey: false,
			preventDefault() { prevented = true },
		} as unknown as MouseEvent

		return { event, prevented: ()=> prevented }
	}

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

	const tap = ( pane: $$.$bog_vmap_app_pane, x: number, y: number ) => {
		pane.node_press( pointer( x, y ) )
		pane.node_release( pointer( x, y, { buttons: 0 } ) )
	}

	const stroke = ( code: string, over: Partial< $$.$bog_vmap_app_pane_stroke > = {} ) => {
		let prevented = false

		return {
			key: code.startsWith( 'Key' ) ? code.slice( 3 ).toLowerCase() : code,
			code,
			altKey: false,
			ctrlKey: false,
			metaKey: false,
			shiftKey: false,
			target: null as EventTarget | null,
			get prevented() { return prevented },
			preventDefault() { prevented = true },
			... over,
		}
	}

	const menus = ( pane: $$.$bog_vmap_app_pane )=> pane.field_sub().filter( view => view instanceof $bog_vmap_app_menu )

	$mol_test({

		'a right click on a node picks it alone, on a picked one keeps the set, on bare canvas keeps the pick'( $ ) {
			const pane = menu_pane( $ )

			pane.sizes({
				[ `${ root }/A` ]: box( 0, 0 ),
				[ `${ root }/B` ]: box( 300, 0 ),
				[ `${ root }/C` ]: box( 600, 0 ),
			})

			pane.picked([ 'A', 'B' ])

			const on_b = right( 360, 45 )
			pane.node_context( on_b.event )
			$mol_assert_equal( on_b.prevented(), true )
			$mol_assert_like( pane.picked(), [ 'A', 'B' ] )
			$mol_assert_equal( pane.menu()?.name, 'B' )
			$mol_assert_equal( pane.menu_on_node(), true )

			pane.node_context( right( 660, 45 ).event )
			$mol_assert_like( pane.picked(), [ 'C' ] )
			$mol_assert_equal( pane.menu()?.name, 'C' )

			const bare = right( 510, 420 )
			pane.node_context( bare.event )
			$mol_assert_equal( bare.prevented(), true )
			$mol_assert_like( pane.picked(), [ 'C' ] )
			$mol_assert_equal( pane.menu()?.name, null )
			$mol_assert_equal( pane.menu_on_node(), false )
		},

		'the menu stands at the click in the coordinates of the pane and is on the canvas only while open'( $ ) {
			const pane = menu_pane( $ )

			$mol_assert_equal( menus( pane ).length, 0 )

			pane.node_context( right( 110, 70 ).event )

			$mol_assert_equal( pane.menu_left(), '100px' )
			$mol_assert_equal( pane.menu_top(), '50px' )
			$mol_assert_equal( pane.menu_showed(), true )
			$mol_assert_like( menus( pane ), [ pane.menu_view() ] )

			pane.menu_view().close()

			$mol_assert_equal( pane.menu(), null )
			$mol_assert_equal( menus( pane ).length, 0 )
		},

		'a right click at another point gives a menu of its own'( $ ) {
			const pane = menu_pane( $ )

			pane.node_context( right( 110, 70 ).event )
			const first = pane.menu_view()

			pane.node_context( right( 210, 170 ).event )
			const second = pane.menu_view()

			$mol_assert_ok( first !== second )
			$mol_assert_like( menus( pane ), [ second ] )
			$mol_assert_equal( second.left(), '200px' )
		},

		'a right click inside the entered node is left to the component, around it the menu takes the pointer out'( $ ) {
			const pane = menu_pane( $ )

			pane.sizes({ [ `${ root }/A` ]: box( 0, 0 ) })

			tap( pane, 60, 45 )
			tap( pane, 60, 45 )
			$mol_assert_equal( pane.inside(), true )

			const inner = right( 60, 45 )
			pane.node_context( inner.event )
			$mol_assert_equal( inner.prevented(), false )
			$mol_assert_equal( pane.menu(), null )
			$mol_assert_equal( pane.inside(), true )

			const ring = right( 114, 45 )
			pane.node_context( ring.event )
			$mol_assert_equal( ring.prevented(), true )
			$mol_assert_equal( pane.menu()?.name, 'A' )
			$mol_assert_equal( pane.inside(), false )
			$mol_assert_like( pane.picked(), [ 'A' ] )
		},

		'nothing opens while a part is carried in from the shelf'( $ ) {
			const pane = menu_pane( $, { carrying: ()=> true } )

			const carried = right( 510, 420 )
			pane.node_context( carried.event )

			$mol_assert_equal( carried.prevented(), false )
			$mol_assert_equal( pane.menu(), null )
		},

		'any key closes the menu, and Escape does nothing more'( $ ) {
			const pane = menu_pane( $ )

			pane.sizes({ [ `${ root }/A` ]: box( 0, 0 ) })

			pane.node_context( right( 60, 45 ).event )
			$mol_assert_like( pane.picked(), [ 'A' ] )

			const escape = stroke( 'Escape', { key: 'Escape' } )
			$mol_assert_equal( pane.key_down( escape ), true )
			$mol_assert_equal( escape.prevented, true )
			$mol_assert_equal( pane.menu(), null )
			$mol_assert_like( pane.picked(), [ 'A' ] )

			pane.node_context( right( 60, 45 ).event )
			pane.key_down( stroke( 'KeyH' ) )
			$mol_assert_equal( pane.menu(), null )
			$mol_assert_equal( pane.tool(), 'hand' )
		},

		'copy, delete, wrap and the whole view of the menu are the ports of the pane'( $ ) {
			const done = [] as string[]
			const port = ( name: string )=> ( next?: unknown )=> {
				if( next !== undefined ) done.push( name )
				return null
			}

			const pane = menu_pane( $, {
				node_copy: port( 'copy' ),
				node_delete: port( 'delete' ),
				node_wrap: port( 'wrap' ),
				camera_reset: port( 'fit' ),
			} )

			pane.sizes({ [ `${ root }/A` ]: box( 0, 0 ) })
			pane.node_context( right( 60, 45 ).event )

			const menu = pane.menu_view()
			const event = {} as Event

			menu.copy( event )
			menu.remove( event )
			menu.wrap( event )
			menu.fit( event )

			$mol_assert_like( done, [ 'copy', 'delete', 'wrap', 'fit' ] )
		},

		'select parent picks the containers of the pick, and is off when every picked node is free'( $ ) {
			const pane = menu_pane( $ )

			pane.sizes({
				[ `${ root }/Board` ]: box( 0, 0, 400, 300 ),
				[ `${ root }/Board/A` ]: box( 0, 0 ),
				[ `${ root }/Board/B` ]: box( 0, 50 ),
				[ `${ root }/C` ]: box( 600, 0 ),
			})

			pane.picked([ 'C' ])
			pane.node_context( right( 660, 45 ).event )
			$mol_assert_equal( pane.menu_parent_enabled(), false )

			pane.picked([ 'A', 'B', 'C' ])
			pane.node_context( right( 60, 45 ).event )
			$mol_assert_equal( pane.menu_parent_enabled(), true )

			pane.menu_view().parent( {} as Event )
			$mol_assert_like( pane.picked(), [ 'Board' ] )
		},

		'inside lets the pointer into the clicked node alone'( $ ) {
			const pane = menu_pane( $ )

			pane.sizes({ [ `${ root }/A` ]: box( 0, 0 ), [ `${ root }/B` ]: box( 300, 0 ) })
			pane.picked([ 'A', 'B' ])

			pane.node_context( right( 60, 45 ).event )
			pane.menu_view().enter( {} as Event )

			$mol_assert_like( pane.picked(), [ 'A' ] )
			$mol_assert_equal( pane.entered(), 'A' )
			$mol_assert_equal( pane.inside(), true )
		},

		'a board from the canvas menu is asked for at the world point of the click'( $ ) {
			const boards = [] as ( $bog_vmap_bridge_rect | null | undefined )[]
			const pane = menu_pane( $, {
				board_draw: ( next?: $bog_vmap_bridge_rect | null )=> {
					boards.push( next )
					return next ?? null
				},
			} )

			pane.camera_shift( new $mol_vector_2d( 100, 50 ) )
			pane.camera_zoom( 2 )

			pane.node_context( right( 10 + 301, 20 + 451 ).event )
			pane.menu_view().board( {} as Event )

			$mol_assert_like( boards, [ { x: 101, y: 201, width: 0, height: 0 } ] )
		},

		'Cmd+Alt+G and Ctrl+Alt+G ask for a wrap, only with a pick and never typed into a field'( $ ) {
			let wrapped = 0
			const pane = menu_pane( $, { node_wrap: ()=> { ++ wrapped; return null } } )

			$mol_assert_equal( pane.key_down( stroke( 'KeyG', { metaKey: true, altKey: true } ) ), false )
			$mol_assert_equal( wrapped, 0 )

			pane.picked([ 'A' ])

			const mac = stroke( 'KeyG', { metaKey: true, altKey: true, key: '©' } )
			$mol_assert_equal( pane.key_down( mac ), true )
			$mol_assert_equal( mac.prevented, true )

			pane.key_down( stroke( 'KeyG', { ctrlKey: true, altKey: true } ) )
			$mol_assert_equal( wrapped, 2 )

			for( const key of [
				stroke( 'KeyG' ),
				stroke( 'KeyG', { altKey: true } ),
				stroke( 'KeyG', { metaKey: true, altKey: true, shiftKey: true } ),
				stroke( 'KeyG', { ctrlKey: true, altKey: true, target: $.$mol_dom_context.document.createElement( 'input' ) } ),
			] ) {
				$mol_assert_equal( pane.key_down( key ), false )
				$mol_assert_equal( key.prevented, false )
			}

			$mol_assert_equal( wrapped, 2 )
		},

		'a board drawn by a drag keeps the dragged rectangle, rulers or not'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )
			const pane = stage.pane
			const overlay = stage.overlay()

			$mol_assert_equal( pane.ruler_shown(), true )

			pane.tool_board( true )

			stage.press( overlay, stage.client([ 40, 40 ]) )
			stage.move( overlay, stage.client([ 520, 760 ]) )
			stage.release( overlay, stage.client([ 520, 760 ]) )
			stage.redraw()

			const node = stage.app.node()

			const style = node.over_tree( 'Page', 'style' )?.kids[ 0 ] ?? null
			const styled = ( prop: string )=> $bog_vmap_lang_dict_get( style, prop )?.value ?? null

			$mol_assert_like( node.part_names(), [ 'Page' ] )
			$mol_assert_equal( styled( 'width' ), '480px' )
			$mol_assert_equal( styled( 'minHeight' ), '720px' )

			const spot = stage.app.spots()[ 'Page' ]

			$mol_assert_equal( spot.x, stage.pane.world_point({ clientX: stage.client([ 40, 40 ])[ 0 ], clientY: stage.client([ 40, 40 ])[ 1 ] })[ 0 ] )
			$mol_assert_equal( spot.y, stage.pane.world_point({ clientX: stage.client([ 40, 40 ])[ 0 ], clientY: stage.client([ 40, 40 ])[ 1 ] })[ 1 ] )

		},

		'a hand drawing a board in forty small steps keeps the whole drag, buttons reported or not'( $ ) {

			for( const buttons of [ 1, 0 ] ) {

				const stage = $bog_vmap_app_flow_stage( $ )
				const pane = stage.pane
				const overlay = stage.overlay()

				pane.tool_board( true )

				const steps = 40

				stage.press( overlay, stage.client([ 40, 40 ]) )

				for( let step = 1; step <= steps; ++ step ) {
					stage.move( overlay, stage.client([ 40 + 480 * step / steps, 40 + 720 * step / steps ]), { buttons } )
				}

				stage.release( overlay, stage.client([ 520, 760 ]) )
				stage.redraw()

				const node = stage.app.node()
				const style = node.over_tree( 'Page', 'style' )?.kids[ 0 ] ?? null
				const styled = ( prop: string )=> $bog_vmap_lang_dict_get( style, prop )?.value ?? null

				$mol_assert_like( node.part_names(), [ 'Page' ] )
				$mol_assert_equal( styled( 'width' ), '480px' )
				$mol_assert_equal( styled( 'minHeight' ), '720px' )

			}

		},

		'a text field drawn in small steps keeps the width of the whole drag'( $ ) {

			for( const buttons of [ 1, 0 ] ) {

				const stage = $bog_vmap_app_flow_stage( $ )
				const pane = stage.pane
				const overlay = stage.overlay()

				pane.tool_text( true )

				const steps = 30

				stage.press( overlay, stage.client([ 40, 40 ]) )

				for( let step = 1; step <= steps; ++ step ) {
					stage.move( overlay, stage.client([ 40 + 300 * step / steps, 40 + 60 * step / steps ]), { buttons } )
				}

				stage.release( overlay, stage.client([ 340, 100 ]) )
				stage.redraw()

				$mol_assert_equal( pane.text_spot()?.width, 300 )

			}

		},

		'the drag still ends on a real release, on a cancel and on Escape'( $ ) {

			const key = ( pane: $$.$bog_vmap_app_pane, code: string )=> pane.key_down({
				key: code, code, metaKey: false, ctrlKey: false, altKey: false, shiftKey: false,
				target: null, preventDefault() {},
			} as unknown as $$.$bog_vmap_app_pane_stroke )

			const started = ( stage: ReturnType< typeof $bog_vmap_app_flow_stage > )=> {
				stage.drop( calc, stage.client([ 100, 100 ]) )
				const spot = stage.app.spots()[ 'Calc' ]
				stage.press( stage.overlay(), stage.part_center( 'Calc' ) )
				stage.move( stage.overlay(), stage.client([ 300, 260 ]) )
				$mol_assert_ok( stage.pane.drag() )
				return spot
			}

			const released = $bog_vmap_app_flow_stage( $ )
			started( released )
			released.release( released.overlay(), released.client([ 300, 260 ]) )

			$mol_assert_equal( released.pane.drag(), null )
			$mol_assert_ok( released.app.spots()[ 'Calc' ].x !== 100 )

			const cancelled = $bog_vmap_app_flow_stage( $ )
			started( cancelled )
			cancelled.cancel( cancelled.overlay(), cancelled.client([ 300, 260 ]) )

			$mol_assert_equal( cancelled.pane.drag(), null )

			const escaped = $bog_vmap_app_flow_stage( $ )
			const spot = started( escaped )
			key( escaped.pane, 'Escape' )
			escaped.redraw()

			$mol_assert_equal( escaped.pane.drag(), null )
			$mol_assert_like( escaped.app.spots()[ 'Calc' ], spot )

		},

		'without a captured pointer a move with no button still ends the drag'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )
			const pane = stage.pane
			const overlay = stage.overlay()

			pane.tool_board( true )

			stage.press( overlay, stage.client([ 40, 40 ]) )

			$mol_assert_equal( overlay.hasPointerCapture( 1 ), true )

			overlay.releasePointerCapture( 1 )

			stage.move( overlay, stage.client([ 520, 760 ]), { buttons: 0 } )
			stage.redraw()

			$mol_assert_equal( pane.draft(), null )
			$mol_assert_like( stage.app.node().part_names(), [ 'Page' ] )

		},

		'a lost pointer capture ends the drag instead of hanging it'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )
			const pane = stage.pane
			const overlay = stage.overlay()

			pane.tool_board( true )

			stage.press( overlay, stage.client([ 40, 40 ]) )
			stage.move( overlay, stage.client([ 520, 760 ]) )

			$mol_assert_ok( pane.draft() )

			stage.lost( overlay, stage.client([ 520, 760 ]) )
			stage.redraw()

			$mol_assert_equal( pane.draft(), null )
			$mol_assert_like( stage.app.node().part_names(), [ 'Page' ] )

		},

		'a hand drawing a wire in dozens of small steps reaches the input'( $ ) {

			for( const buttons of [ 1, 0 ] ) {

				const stage = $bog_vmap_app_flow_stage( $ )
				const overlay = stage.overlay()

				stage.drop( calc, stage.client([ 100, 100 ]) )
				stage.drop( map, stage.client([ 400, 100 ]) )

				stage.tap( stage.part_center( 'Calc' ) )

				const from = stage.port_dot( 'Calc', 'result', 'out' )
				const to = stage.port_dot( 'Map', 'zoom', 'in' )
				const steps = 30

				stage.press( overlay, from )

				for( let step = 1; step <= steps; ++ step ) {
					stage.move( overlay, [
						from[ 0 ] + ( to[ 0 ] - from[ 0 ] ) * step / steps,
						from[ 1 ] + ( to[ 1 ] - from[ 1 ] ) * step / steps,
					], { buttons } )
				}

				$mol_assert_like( stage.pane.wire_drag(), { from: 'Calc', from_prop: 'result', kind: 'number' } )

				stage.release( overlay, to )
				stage.redraw()
				stage.scene.flush()

				$mol_assert_like( stage.app.doc_wires().map( link => `${ link.to }.${ link.to_prop }` ), [ 'Map.zoom' ] )

			}

		},

		'the rulers show round marks, hide on a small pane and move their zero inside a node'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )
			const pane = stage.pane

			stage.drop( calc, stage.client([ 200, 150 ]) )

			$mol_assert_equal( pane.ruler_shown(), true )
			$mol_assert_equal( pane.ruler_views().length, 2 )

			const marks = pane.ruler_ticks( 'x' ).map( tick => tick.label )

			$mol_assert_ok( marks.length )
			$mol_assert_equal( marks.every( label => label % 100 === 0 ), true )
			$mol_assert_equal( pane.tick_title( 'x:0' ), String( marks[ 0 ] ) )

			pane.entered( 'Calc' )
			stage.redraw()

			const box = pane.part_size( 'Calc' )!
			$mol_assert_like( pane.ruler_zero(), { x: box.x, y: box.y } )
			$mol_assert_ok( pane.ruler_ticks( 'x' ).some( tick => tick.label === 0 && tick.at === box.x ) )

			pane.entered( null )
			pane.view_rect = ()=> ({ left: 0, top: 0, width: 300, height: 200, right: 300, bottom: 200 })
			stage.redraw()

			$mol_assert_equal( pane.ruler_shown(), false )
			$mol_assert_like( pane.ruler_views(), [] )
			$mol_assert_like( pane.ruler_ticks( 'x' ), [] )

		},

		'the ruler paints the range taken by the selection'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )
			const pane = stage.pane

			stage.drop( calc, stage.client([ 200, 150 ]) )
			stage.drop( map, stage.client([ 500, 150 ]) )

			stage.app.picked([])
			stage.redraw()

			$mol_assert_equal( pane.ruler_span( 'x' ), null )

			stage.app.picked([ 'Calc', 'Map' ])
			stage.redraw()

			const box = pane.picked_box()!
			const span = pane.ruler_span( 'x' )!

			$mol_assert_ok( span )
			$mol_assert_equal( span.size, box.width * pane.camera_zoom() )
			$mol_assert_equal( pane.span_style( 'x' ).width, box.width * pane.camera_zoom() + 'px' )

		},

		'the rulers take their own field, and the screen starts where the field starts'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )
			const pane = stage.pane
			const room = $bog_vmap_app_flow_rect

			$mol_assert_equal( pane.ruler_shown(), true )
			$mol_assert_like( pane.field_style(), { left: '20px', top: '20px' } )

			$mol_assert_like( pane.sub(), [ pane.Field(), pane.Ruler( 'x' ), pane.Ruler( 'y' ) ] )
			$mol_assert_equal( pane.field_sub().includes( pane.Overlay() ), true )
			$mol_assert_equal( pane.sub().includes( pane.Overlay() ), false )

			const size = pane.ruler_size()

			pane.Field().view_rect = ()=> ({
				left: room.left + size,
				top: room.top + size,
				width: room.width - size,
				height: room.height - size,
				right: room.right,
				bottom: room.bottom,
			})
			stage.redraw()

			$mol_assert_like( pane.pane_rect(), {
				left: room.left + size,
				top: room.top + size,
				width: room.width - size,
				height: room.height - size,
			} )

			pane.view_rect = ()=> ({ left: 0, top: 0, width: 300, height: 200, right: 300, bottom: 200 })
			stage.redraw()

			$mol_assert_equal( pane.ruler_shown(), false )
			$mol_assert_like( pane.field_style(), { left: '0px', top: '0px' } )

		},

		'a press on the ruler band itself leaves a guide on the canvas'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )
			const pane = stage.pane
			const room = $bog_vmap_app_flow_rect

			const band = pane.Ruler( 'x' ).dom_node()

			$mol_assert_equal( band.getAttribute( 'id' )?.includes( 'Ruler' ), true )
			$mol_assert_like( stage.app.guides(), {} )

			stage.press( band, [ room.left + 240, room.top + 8 ] )

			const id = pane.guide_ids()[ 0 ]

			$mol_assert_equal( pane.guide_ids().length, 1 )
			$mol_assert_equal( pane.field_sub().includes( pane.Guide( id ) ), true )

			stage.move( band, [ room.left + 260, room.top + 120 ] )
			stage.release( band, [ room.left + 260, room.top + 120 ], { buttons: 0 } )
			stage.redraw()

			const kept = Object.values( stage.app.guides() ) as readonly { axis: string, at: number }[]

			$mol_assert_like( kept, [ { axis: 'x', at: 260 } ] )
			$mol_assert_like( pane.guide_style( id ), { left: '260px', top: '0', bottom: '0', width: '1px' } )

		},

		'the mark of zero stands over the zero of the field and inside its own band'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )
			const pane = stage.pane
			const size = pane.ruler_size()

			$mol_assert_equal( size, 20 )

			for( const axis of [ 'x', 'y' ] as const ) {

				const index = pane.ruler_ticks( axis ).findIndex( tick => tick.at === 0 )
				$mol_assert_ok( index >= 0 )

				const side = axis === 'x' ? 'left' : 'top'
				const inside = parseFloat( pane.tick_style( axis + ':' + index )[ side ] )
				const band = parseFloat( pane.ruler_style( axis )[ side ] )

				$mol_assert_equal( inside, 0 )
				$mol_assert_equal( band + inside, size )

			}

		},

		'a point of the field is the same point for the pointer and for the paint'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )
			const pane = stage.pane
			const room = $bog_vmap_app_flow_rect
			const size = pane.ruler_size()

			pane.Field().view_rect = ()=> ({
				left: room.left + size,
				top: room.top + size,
				width: room.width - size,
				height: room.height - size,
				right: room.right,
				bottom: room.bottom,
			})
			stage.redraw()

			$mol_assert_like( pane.screen_point({ clientX: room.left + size + 90, clientY: room.top + size + 70 }), [ 90, 70 ] )

			stage.drop( calc, [ room.left + size + 90, room.top + size + 70 ] )

			const box = pane.part_box( 'Calc' )!
			const spot = stage.app.spots()[ 'Calc' ]

			$mol_assert_equal( box.left, spot.x * pane.camera_zoom() + pane.camera_shift()[0] )
			$mol_assert_like( pane.world_point({ clientX: room.left + size + box.left, clientY: room.top + size + box.top }), [ spot.x, spot.y ] )

		},

		'showing everything leaves the ruler bands clear'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )
			const pane = stage.pane
			const room = $bog_vmap_app_flow_rect
			const size = pane.ruler_size()

			pane.Field().view_rect = ()=> ({
				left: room.left + size,
				top: room.top + size,
				width: room.width - size,
				height: room.height - size,
				right: room.right,
				bottom: room.bottom,
			})

			stage.drop( calc, stage.client([ 200, 150 ]) )
			stage.drop( map, stage.client([ 500, 400 ]) )
			stage.redraw()

			pane.camera_reset()
			stage.redraw()

			for( const name of [ 'Calc', 'Map' ] ) {
				const box = pane.part_box( name )!
				$mol_assert_equal( box.left >= 0, true )
				$mol_assert_equal( box.top >= 0, true )
			}

		},

		'numbers show up on hover over a neighbour and only when something is picked'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			stage.drop( map, stage.client([ 500, 150 ]) )

			const pane = stage.pane

			stage.app.picked([])
			pane.hovered( 'Map' )
			stage.redraw()

			$mol_assert_like( pane.gaps().map( gap => gap.axis + ':' + gap.size ), [] )

			stage.app.picked([ 'Calc' ])
			pane.hovered( 'Map' )
			stage.redraw()

			const gaps = pane.gaps()

			$mol_assert_equal( gaps.length, 1 )
			$mol_assert_equal( gaps[ 0 ].axis, 'x' )
			$mol_assert_equal( gaps[ 0 ].size, 200 )
			$mol_assert_equal( pane.gap_title( 0 ), '200' )
			$mol_assert_equal( pane.gap_views().length, 1 )

			pane.hovered( 'Calc' )
			stage.redraw()

			$mol_assert_like( pane.gaps().map( gap => gap.size ), [] )

			stage.app.picked([ 'Calc', 'Map' ])
			pane.hovered( 'Map' )
			stage.redraw()

			$mol_assert_like( pane.gaps().map( gap => gap.size ), [] )

		},

		'the number keeps its own size whatever the zoom is'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			stage.drop( map, stage.client([ 500, 150 ]) )

			const pane = stage.pane

			stage.app.picked([ 'Calc' ])
			pane.hovered( 'Map' )
			stage.redraw()

			const close = pane.gap_style( 0 )

			pane.camera_zoom( 0.3 )
			stage.redraw()

			const far = pane.gap_style( 0 )

			$mol_assert_like( Object.keys( close ).sort(), [ 'left', 'top' ] )
			$mol_assert_like( Object.keys( far ).sort(), [ 'left', 'top' ] )
			$mol_assert_equal( close.left === far.left, false )

		},

		'Cmd+G groups and Shift+Cmd+G ungroups, only with a pick and never typed into a field'( $ ) {

			let grouped = 0
			let ungrouped = 0
			let ready = false

			const pane = menu_pane( $, {
				node_group: ()=> { ++ grouped; return null },
				node_ungroup: ()=> { ++ ungrouped; return null },
				ungroup_enabled: ()=> ready,
			} )

			$mol_assert_equal( pane.key_down( stroke( 'KeyG', { metaKey: true } ) ), false )
			$mol_assert_equal( grouped, 0 )

			pane.picked([ 'A' ])

			const mac = stroke( 'KeyG', { metaKey: true, key: '\u00A9' } )
			$mol_assert_equal( pane.key_down( mac ), true )
			$mol_assert_equal( mac.prevented, true )

			pane.key_down( stroke( 'KeyG', { ctrlKey: true } ) )
			$mol_assert_equal( grouped, 2 )

			$mol_assert_equal( pane.key_down( stroke( 'KeyG', { metaKey: true, shiftKey: true } ) ), false )
			$mol_assert_equal( ungrouped, 0 )

			ready = true

			const back = stroke( 'KeyG', { metaKey: true, shiftKey: true } )
			$mol_assert_equal( pane.key_down( back ), true )
			$mol_assert_equal( back.prevented, true )
			$mol_assert_equal( ungrouped, 1 )
			$mol_assert_equal( grouped, 2 )

			const typed = stroke( 'KeyG', { metaKey: true, target: $.$mol_dom_context.document.createElement( 'input' ) } )
			$mol_assert_equal( pane.key_down( typed ), false )
			$mol_assert_equal( typed.prevented, false )
			$mol_assert_equal( grouped, 2 )

		},

	})

}

namespace $ {
	const d = '$'

	const root = `${d}board`

	const zoom_pane = ( $: $ )=> {
		const peer = { origin: 'null', postMessage() {} }

		const pane = $$.$bog_vmap_app_pane.make({
			$,
			doc_root: ()=> root,
			doc_names: ()=> [ 'Near', 'Far', 'Tiny' ],
			pane_rect: ()=> ({ left: 0, top: 0, width: 600, height: 500 }),
			scene_peer: ()=> peer,
		})

		const inside = ( box: $bog_vmap_bridge_rect )=> {
			const zoom = pane.camera_zoom()
			const shift = pane.camera_shift()
			return box.x * zoom + shift[0] >= 0 && box.y * zoom + shift[1] >= 0
				&& ( box.x + box.width ) * zoom + shift[0] <= 600 && ( box.y + box.height ) * zoom + shift[1] <= 500
		}

		return { pane, inside }
	}

	const near = { x: -600, y: -400, width: 200, height: 100 }
	const far = { x: 1800, y: 900, width: 200, height: 100 }
	const tiny = { x: 40, y: 30, width: 10, height: 5 }

	const stroke = ( code: string, over: Partial< $$.$bog_vmap_app_pane_stroke > = {} ) => {
		let prevented = false

		return {
			key: code,
			code,
			altKey: false,
			ctrlKey: false,
			metaKey: false,
			shiftKey: true,
			target: null as EventTarget | null,
			get prevented() { return prevented },
			preventDefault() { prevented = true },
			... over,
		}
	}

	$mol_test({

		'Shift+1 brings every free node into the frame and stays within life size'( $ ) {
			const { pane, inside } = zoom_pane( $ )

			pane.sizes({ [ `${ root }/Near` ]: near, [ `${ root }/Far` ]: far })
			pane.camera_shift( new $mol_vector_2d( 700, 700 ) )
			pane.camera_zoom( 4 )

			const key = stroke( 'Digit1', { key: '!' } )
			$mol_assert_equal( pane.key_down( key ), true )
			$mol_assert_equal( key.prevented, true )

			$mol_assert_equal( inside( near ), true )
			$mol_assert_equal( inside( far ), true )

			pane.sizes({ [ `${ root }/Tiny` ]: tiny })
			pane.key_down( stroke( 'Digit1', { key: '!' } ) )

			$mol_assert_equal( pane.camera_zoom(), 1 )
			$mol_assert_equal( inside( tiny ), true )
		},

		'Shift+2 fills the frame with the pick, past life size up to the zoom limit, and with nothing picked it is not taken'( $ ) {
			const { pane, inside } = zoom_pane( $ )

			pane.sizes({ [ `${ root }/Near` ]: near, [ `${ root }/Far` ]: far, [ `${ root }/Tiny` ]: tiny })
			pane.camera_zoom( 4 )

			const idle = stroke( 'Digit2', { key: '@' } )
			$mol_assert_equal( pane.key_down( idle ), false )
			$mol_assert_equal( idle.prevented, false )
			$mol_assert_equal( pane.camera_zoom(), 4 )

			pane.picked([ 'Far' ])

			const key = stroke( 'Digit2', { key: '@' } )
			$mol_assert_equal( pane.key_down( key ), true )
			$mol_assert_equal( key.prevented, true )

			$mol_assert_equal( pane.camera_zoom(), ( 600 - 48 ) / 200 )
			$mol_assert_equal( inside( far ), true )
			$mol_assert_equal( inside( near ), false )

			const zoom = pane.camera_zoom()
			const shift = pane.camera_shift()
			$mol_assert_equal( Math.round( ( far.x + far.width / 2 ) * zoom + shift[0] ), 300 )
			$mol_assert_equal( Math.round( ( far.y + far.height / 2 ) * zoom + shift[1] ), 250 )

			pane.picked([ 'Tiny' ])
			pane.key_down( stroke( 'Digit2', { key: '@' } ) )

			$mol_assert_equal( pane.camera_zoom(), pane.zoom_max() )
			$mol_assert_equal( inside( tiny ), true )
		},

		'Shift+0 goes to life size and keeps the middle of the canvas where it was'( $ ) {
			const { pane } = zoom_pane( $ )

			pane.camera_shift( new $mol_vector_2d( 123, -45 ) )
			pane.camera_zoom( .3 )

			const [ x, y ] = pane.world_center()

			const key = stroke( 'Digit0', { key: ')' } )
			$mol_assert_equal( pane.key_down( key ), true )
			$mol_assert_equal( key.prevented, true )

			$mol_assert_equal( pane.camera_zoom(), 1 )

			const [ x2, y2 ] = pane.world_center()
			$mol_assert_equal( Math.round( x2 * 1000 ), Math.round( x * 1000 ) )
			$mol_assert_equal( Math.round( y2 * 1000 ), Math.round( y * 1000 ) )
		},

		'a digit without the shift, with a command key, or typed into a field moves no camera'( $ ) {
			const { pane } = zoom_pane( $ )
			const dom = $.$mol_dom_context

			pane.sizes({ [ `${ root }/Near` ]: near, [ `${ root }/Far` ]: far })
			pane.picked([ 'Far' ])
			pane.camera_shift( new $mol_vector_2d( 700, 700 ) )
			pane.camera_zoom( 4 )

			for( const key of [
				stroke( 'Digit1', { shiftKey: false, key: '1' } ),
				stroke( 'Digit0', { shiftKey: false, key: '0' } ),
				stroke( 'Digit2', { metaKey: true } ),
				stroke( 'Digit1', { ctrlKey: true } ),
				stroke( 'Digit0', { altKey: true } ),
				stroke( 'Digit1', { target: dom.document.createElement( 'input' ) } ),
				stroke( 'Digit0', { target: dom.document.createElement( 'textarea' ) } ),
			] ) {
				$mol_assert_equal( pane.key_down( key ), false )
				$mol_assert_equal( key.prevented, false )
			}

			$mol_assert_equal( pane.camera_zoom(), 4 )
			$mol_assert_like( [ ... pane.camera_shift() ], [ 700, 700 ] )
		},

	})

}
