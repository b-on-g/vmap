namespace $ {
	const d = '$'

	const sample = [
		`${d}layers_doc ${d}mol_view`,
		`\tcaption \\Подпись`,
		`\tTitle ${d}mol_paragraph title \\Привет`,
		`\tPrice ${d}mol_paragraph title \\0`,
		`\tCard ${d}mol_view`,
		`\t\tsub /`,
		`\t\t\t<= Price`,
		`\t\t\t<= caption`,
		`\tPage ${d}mol_view`,
		`\t\tstyle * width \\1280px`,
		`\t\tsub /`,
		`\t\t\t<= Title`,
		`\t\t\t<= Card`,
		`\tPhoto ${d}mol_image uri \\photo.png`,
		`\tGo ${d}mol_button_minor title \\Дальше`,
		`\tName ${d}mol_string`,
		`\tSite ${d}mol_link`,
		`\tCalc ${d}bog_vmap_part_calc`,
		`\tsub /`,
		`\t\t<= Page`,
		`\t\t<= Photo`,
		`\t\t<= Go`,
		`\t\t<= Name`,
		`\t\t<= Site`,
		`\t\t<= Calc`,
		``,
	].join( '\n' )

	const sample_spots = { Page: { x: 0, y: 0 }, Photo: { x: 1400, y: 0 } }

	const lost = [
		`${d}layers_lost ${d}mol_view`,
		`\tcaption \\Подпись`,
		`\tnote \\Заметка`,
		`\tTitle ${d}mol_paragraph title \\Привет`,
		`\tCard ${d}mol_view`,
		`\t\tsub /`,
		`\t\t\t<= caption`,
		`\tPage ${d}mol_view`,
		`\t\tstyle * width \\1280px`,
		`\t\tsub /`,
		`\t\t\t<= Title`,
		`\t\t\t<= Card`,
		`\tLost ${d}mol_paragraph title \\Потерян`,
		`\tDeep ${d}mol_paragraph title \\Глубоко`,
		`\tBox ${d}mol_view`,
		`\t\tsub /`,
		`\t\t\t<= Deep`,
		`\tNear ${d}mol_image uri \\photo.png`,
		`\tlost_title = Lost title`,
		`\tsub /`,
		`\t\t<= Page`,
		``,
	].join( '\n' )

	const lost_spots = { Page: { x: 0, y: 0 }, Near: { x: 600, y: 40 } }

	const ring = [
		`${d}layers_ring ${d}mol_view`,
		`\tPage ${d}mol_view`,
		`\t\tsub /`,
		`\tRing ${d}mol_view`,
		`\t\tsub /`,
		`\t\t\t<= Loop`,
		`\tLoop ${d}mol_view`,
		`\t\tsub /`,
		`\t\t\t<= Ring`,
		`\tsub /`,
		`\t\t<= Page`,
		``,
	].join( '\n' )

	const icons = [ 'root', 'frame', 'image', 'link', 'button', 'field', 'text', 'part' ]

	function layers_stage(
		$: $,
		over: $bog_vmap_app_flow_over = {},
		source = sample,
		spots: { readonly [ name: string ]: { readonly x: number, readonly y: number } } = sample_spots,
	) {
		const stage = $bog_vmap_app_flow_stage( $, over )
		const app = stage.app
		const dom = $.$mol_dom_context

		app.doc_source( source )
		app.spots( spots )
		stage.redraw()

		const moves = [] as $$.$bog_vmap_app_pane_tree_move[]
		const move = app.tree_move.bind( app )

		app.tree_move = ( next?: $$.$bog_vmap_app_pane_tree_move | null )=> {
			if( next ) moves.push( next )
			return move( next )
		}

		const layers = app.Layers() as $$.$bog_vmap_app_layers
		const panel = layers.dom_node() as Element

		$mol_assert_ok( stage.root.contains( panel ) )

		const redraw = ()=> stage.redraw()

		const shown = ()=> app.Layers().dom_node() as Element

		const lines = ()=> {
			redraw()
			return [ ... shown().querySelectorAll( '[bog_vmap_app_layers_line]' ) ]
		}

		const title_of = ( line: Element )=> line.querySelector( '[bog_vmap_app_layers_pick]' )?.textContent ?? ''

		const line = ( title: string )=> {
			const found = lines().find( el => title_of( el ) === title )
			if( !found ) $mol_fail( new Error( `no layer row ${ title }` ) )
			return found!
		}

		const pick = ( title: string )=> line( title ).querySelector( '[bog_vmap_app_layers_pick]' )!

		const outline = ()=> lines().map( el => {
			const expand = el.querySelector( '[bog_vmap_app_layers_expand]' ) as HTMLElement
			const level = parseFloat( expand.style.paddingLeft || '0' )
			const icon = icons.find( kind => el.querySelector( `[bog_vmap_app_layers_${ kind }_icon]` ) ) ?? '?'
			return '  '.repeat( level ) + title_of( el ) + ' ' + icon
		} )

		const mouse = ( el: Element, type: string, over: object = {} )=> {
			el.dispatchEvent( new dom.MouseEvent( type, { bubbles: true, cancelable: true, ... over } ) )
			redraw()
		}

		const field = ()=> panel.querySelector( '[bog_vmap_app_layers_edit]' ) as HTMLInputElement | null

		const type = ( value: string )=> {
			const el = field()!
			el.value = value
			el.dispatchEvent( new dom.Event( 'input', { bubbles: true } ) )
			redraw()
		}

		const blur = ()=> {
			field()!.dispatchEvent( new dom.Event( 'blur', { bubbles: true } ) )
			redraw()
		}

		const key = ( value: string )=> {
			field()!.dispatchEvent( new dom.KeyboardEvent( 'keydown', { key: value, bubbles: true, cancelable: true } ) )
			redraw()
		}

		const drag = ( name: string, onto: string, share: number )=> {
			const el = line( onto )
			const top = 100
			const height = 20

			el.getBoundingClientRect = ()=> ({ top, height, left: 0, width: 200, right: 200, bottom: top + height }) as DOMRect

			const transfer = {
				dropEffect: 'none',
				getData: ( kind: string )=> kind === 'text/plain' ? name : '',
			}

			for( const kind of [ 'dragenter', 'dragover', 'drop' ] ) {
				const event = new dom.MouseEvent( kind, { bubbles: true, cancelable: true, clientY: top + height * share } )
				Object.defineProperty( event, 'dataTransfer', { value: transfer } )
				el.dispatchEvent( event )
			}

			redraw()
		}

		const history = app.History() as $$.$bog_vmap_app_history

		const stepped = async ()=> {
			const source = app.doc_source()
			const taken = ()=> history.ring( history.doc_key() ).at( -1 )?.source === source

			for( let i = 0; i < 10 && !taken(); ++i ) {
				stage.timers.filter( timer => timer.delay === history.step_delay() ).at( -1 )?.task()
				await $bog_vmap_app_flow_settle( taken, 30 )
				redraw()
			}

			$mol_assert_equal( taken(), true )
		}

		const group = ()=> {
			redraw()
			return shown().querySelector( '[bog_vmap_app_layers_outside]' )
		}

		const grouped = ()=> {
			const head = group()
			if( !head ) return []

			return lines()
				.filter( el => head.compareDocumentPosition( el ) & dom.Node.DOCUMENT_POSITION_FOLLOWING )
				.map( title_of )
		}

		const press = ( title: string, value: string )=> {
			pick( title ).dispatchEvent( new dom.KeyboardEvent( 'keydown', { key: value, bubbles: true, cancelable: true } ) )
			redraw()
		}

		return { stage, app, layers, panel, moves, lines, line, pick, outline, mouse, field, type, blur, key, drag, history, stepped, redraw, group, grouped, press }
	}

	$mol_test({

		'the layers are the tree of the document by its sub lists'( $ ) {
			const { outline } = layers_stage( $ )

			$mol_assert_like( outline(), [
				`${d}layers_doc root`,
				'  Page frame',
				'    Title text',
				'    Card frame',
				'      Price text',
				'      caption text',
				'  Photo image',
				'  Go button',
				'  Name field',
				'  Site link',
				'  Calc part',
			] )
		},

		'a row names the class of its node and every row but the root is dragged'( $ ) {
			const { line, pick } = layers_stage( $ )

			$mol_assert_equal( pick( 'Photo' ).getAttribute( 'title' ), `${d}mol_image` )
			$mol_assert_equal( pick( 'caption' ).getAttribute( 'title' ), '' )

			$mol_assert_equal( line( 'Photo' ).getAttribute( 'draggable' ), 'true' )
			$mol_assert_equal( line( `${d}layers_doc` ).getAttribute( 'draggable' ), null )
		},

		'a collapsed branch hides its rows and opens back'( $ ) {
			const { outline, line, mouse } = layers_stage( $ )

			mouse( line( 'Card' ).querySelector( '[bog_vmap_app_layers_expand]' )!, 'click' )

			$mol_assert_like( outline().slice( 0, 5 ), [
				`${d}layers_doc root`,
				'  Page frame',
				'    Title text',
				'    Card frame',
				'  Photo image',
			] )

			mouse( line( 'Card' ).querySelector( '[bog_vmap_app_layers_expand]' )!, 'click' )

			$mol_assert_equal( outline()[ 4 ], '      Price text' )
		},

		'a click on a row picks its node at the host'( $ ) {
			const { app, pick, mouse } = layers_stage( $ )

			mouse( pick( 'Title' ), 'click' )
			$mol_assert_equal( app.selected(), 'Title' )

			mouse( pick( 'Photo' ), 'click', { metaKey: true } )
			$mol_assert_like( app.picked(), [ 'Title', 'Photo' ] )

			mouse( pick( 'Photo' ), 'click', { metaKey: true } )
			$mol_assert_like( app.picked(), [ 'Title' ] )

			mouse( pick( `${d}layers_doc` ), 'click' )
			$mol_assert_like( app.picked(), [] )
		},

		'the node picked at the host lights its row'( $ ) {
			const { app, pick, line, mouse, redraw } = layers_stage( $ )

			const lit = ( title: string )=> pick( title ).getAttribute( 'mol_check_checked' ) === 'true'

			app.selected( 'Card' )
			redraw()

			$mol_assert_equal( lit( 'Card' ), true )
			$mol_assert_equal( lit( 'Title' ), false )
			$mol_assert_equal( lit( 'Page' ), false )

			mouse( line( 'Page' ).querySelector( '[bog_vmap_app_layers_expand]' )!, 'click' )

			$mol_assert_equal( lit( 'Page' ), true )
		},

		'a double click renames the node the way the design tab does'( $ ) {
			const { app, pick, mouse, field, type, blur, outline } = layers_stage( $ )

			app.spots({ ... app.spots(), Title: { x: 5, y: 5 } })

			mouse( pick( 'Title' ), 'dblclick' )
			$mol_assert_ok( field() )
			$mol_assert_equal( field()!.closest( '[bog_vmap_app_layers_line]' )!.getAttribute( 'draggable' ), null )

			type( 'Heading' )
			blur()

			$mol_assert_like( app.node().sub_names( 'Page' ), [ 'Heading', 'Card' ] )
			$mol_assert_equal( app.doc_source().includes( 'Title' ), false )
			$mol_assert_equal( app.selected(), 'Heading' )
			$mol_assert_like( app.spots().Heading, { x: 5, y: 5 } )
			$mol_assert_equal( field(), null )
			$mol_assert_equal( outline()[ 2 ], '    Heading text' )
		},

		'a name from a digit is refused in words and the source stays'( $ ) {
			const { app, pick, mouse, field, type, blur, panel } = layers_stage( $ )

			const before = app.doc_source()

			mouse( pick( 'Title' ), 'dblclick' )
			type( '2abc' )
			blur()

			$mol_assert_equal( app.doc_source(), before )
			$mol_assert_ok( panel.textContent!.includes( 'не начинается с цифры' ) )
			$mol_assert_ok( field() )
		},

		'escape leaves the rename without a write and keeps the pick'( $ ) {
			const { app, pick, mouse, field, type, key } = layers_stage( $ )

			const before = app.doc_source()

			mouse( pick( 'Title' ), 'dblclick' )
			type( 'Other' )
			key( 'Escape' )

			$mol_assert_equal( field(), null )
			$mol_assert_equal( app.doc_source(), before )
			$mol_assert_equal( app.selected(), 'Title' )
		},

		'a row dropped on the upper half of another lands before it'( $ ) {
			const { app, drag } = layers_stage( $ )

			drag( 'Card', 'Title', .1 )

			$mol_assert_like( app.node().sub_names( 'Page' ), [ 'Card', 'Title' ] )
		},

		'a row dropped on the lower half of a frame lands inside at the end'( $ ) {
			const { app, drag } = layers_stage( $ )

			drag( 'Title', 'Card', .9 )

			$mol_assert_like( app.node().sub_names( 'Card' ), [ 'Price', 'caption', 'Title' ] )
			$mol_assert_like( app.node().sub_names( 'Page' ), [ 'Card' ] )
		},

		'rows reordered at the root keep their places on the canvas'( $ ) {
			const { app, stage, drag } = layers_stage( $ )

			stage.scene.flush()
			$mol_assert_ok( stage.pane.part_size( 'Photo' ) )

			drag( 'Photo', 'Page', .1 )

			$mol_assert_like( app.node().sub_names( '' )!.slice( 0, 2 ), [ 'Photo', 'Page' ] )
			$mol_assert_like( app.spots().Photo, { x: 1400, y: 0 } )
		},

		'a row reordered at the root before the scene measured it keeps its place'( $ ) {
			const { app, stage, drag } = layers_stage( $, { mute: true } )

			$mol_assert_equal( stage.pane.part_size( 'Photo' ), null )

			drag( 'Photo', 'Page', .1 )

			$mol_assert_like( app.node().sub_names( '' )!.slice( 0, 2 ), [ 'Photo', 'Page' ] )
			$mol_assert_like( app.spots().Photo, { x: 1400, y: 0 } )
		},

		'a row taken out of a frame to the root stays where it was drawn'( $ ) {
			const { app, stage, drag, line } = layers_stage( $ )

			app.spots({ ... app.spots(), Page: { x: 40, y: 60 } })
			stage.redraw()
			stage.scene.flush()

			const drawn = stage.pane.part_size( 'Card' )!

			drag( 'Card', `${d}layers_doc`, .5 )

			$mol_assert_like( app.node().sub_names( 'Page' ), [ 'Title' ] )
			$mol_assert_equal( app.node().sub_names( '' )!.at( -1 ), 'Card' )
			$mol_assert_like( app.spots().Card, { x: drawn.x, y: drawn.y } )
			$mol_assert_like( [ drawn.x, drawn.y ], [ 140, 60 ] )
			$mol_assert_ok( line( 'Card' ) )
		},

		'a frame dropped into its own insides asks the host for nothing'( $ ) {
			const { app, drag, moves } = layers_stage( $ )

			const before = app.doc_source()

			drag( 'Page', 'Card', .9 )
			drag( 'Page', 'Price', .1 )

			$mol_assert_equal( moves.length, 0 )
			$mol_assert_equal( app.doc_source(), before )
		},

		'a drop that changes nothing asks the host for nothing'( $ ) {
			const { app, drag, moves } = layers_stage( $ )

			const before = app.doc_source()

			drag( 'Title', 'Card', .1 )
			drag( 'Card', 'Page', .9 )
			drag( 'Nope', 'Title', .1 )

			$mol_assert_equal( moves.length, 0 )
			$mol_assert_equal( app.doc_source(), before )
		},

		async 'one undo takes back a rename from the layers'( $ ) {
			const { app, pick, mouse, type, blur, history, stepped } = layers_stage( $ )

			await stepped()
			const before = app.doc_source()

			mouse( pick( 'Title' ), 'dblclick' )
			type( 'Heading' )
			blur()

			await stepped()
			history.undo()

			$mol_assert_equal( app.doc_source(), before )
		},

		async 'one undo takes back a move from the layers'( $ ) {
			const { app, drag, history, stepped } = layers_stage( $ )

			await stepped()
			const before = app.doc_source()

			drag( 'Card', 'Title', .1 )

			await stepped()
			history.undo()

			$mol_assert_equal( app.doc_source(), before )
		},

		'a document with every node on the page has no outside group'( $ ) {
			const { group } = layers_stage( $ )

			$mol_assert_equal( group(), null )
		},

		'nodes outside every sub list are a group at the end of the layers'( $ ) {
			const { layers, panel, group, grouped, outline } = layers_stage( $, {}, lost, lost_spots )

			$mol_assert_like( outline(), [
				`${d}layers_lost root`,
				'  Page frame',
				'    Title text',
				'    Card frame',
				'      caption text',
				'  Lost text',
				'  Box frame',
				'    Deep text',
				'  Near image',
			] )

			const head = group()!
			$mol_assert_equal( head.textContent, 'Вне страницы' )
			$mol_assert_equal( head.parentElement, layers.Rows().dom_node() )
			$mol_assert_equal( [ ... head.parentElement!.children ].indexOf( head ), 5 )
			$mol_assert_like( grouped(), [ 'Lost', 'Box', 'Deep', 'Near' ] )
			$mol_assert_equal( panel.textContent!.includes( 'note' ), false )
			$mol_assert_equal( panel.textContent!.includes( 'lost_title' ), false )
		},

		'the outside group folds and opens back'( $ ) {
			const { group, grouped, outline, mouse } = layers_stage( $, {}, lost, lost_spots )

			mouse( group()!, 'click' )

			$mol_assert_ok( group() )
			$mol_assert_like( grouped(), [] )
			$mol_assert_equal( outline().length, 5 )

			mouse( group()!, 'click' )

			$mol_assert_like( grouped(), [ 'Lost', 'Box', 'Deep', 'Near' ] )
		},

		'a folded branch and the folded outside group stay folded after a trip to the assets and back'( $ ) {
			const { stage, app, line, mouse, outline, group, grouped } = layers_stage( $, {}, lost, lost_spots )

			const folded = [
				`${d}layers_lost root`,
				'  Page frame',
				'    Title text',
				'    Card frame',
				'  Lost text',
				'  Box frame',
				'  Near image',
			]

			mouse( line( 'Card' ).querySelector( '[bog_vmap_app_layers_expand]' )!, 'click' )
			mouse( line( 'Box' ).querySelector( '[bog_vmap_app_layers_expand]' )!, 'click' )

			$mol_assert_like( outline(), folded )

			stage.assets()
			$mol_assert_equal( app.left_tab(), 'assets' )
			$mol_wire_fiber.sync()

			stage.click( stage.check( 'Слои' ) )
			$mol_assert_like( outline(), folded )

			mouse( group()!, 'click' )
			$mol_assert_like( grouped(), [] )

			stage.assets()
			$mol_wire_fiber.sync()

			stage.click( stage.check( 'Слои' ) )
			$mol_assert_ok( group() )
			$mol_assert_like( grouped(), [] )
		},

		'a click on an outside row picks its node, and the host pick lights it'( $ ) {
			const { app, pick, line, mouse, redraw } = layers_stage( $, {}, lost, lost_spots )

			const lit = ( title: string )=> pick( title ).getAttribute( 'mol_check_checked' ) === 'true'

			mouse( pick( 'Lost' ), 'click' )
			$mol_assert_like( app.picked(), [ 'Lost' ] )
			$mol_assert_equal( lit( 'Lost' ), true )

			app.selected( 'Deep' )
			redraw()

			$mol_assert_equal( lit( 'Deep' ), true )
			$mol_assert_equal( lit( 'Lost' ), false )
			$mol_assert_equal( lit( 'Box' ), false )

			mouse( line( 'Box' ).querySelector( '[bog_vmap_app_layers_expand]' )!, 'click' )

			$mol_assert_equal( lit( 'Box' ), true )
		},

		'a double click renames an outside node and its row stays in the group'( $ ) {
			const { app, pick, mouse, field, type, blur, grouped } = layers_stage( $, {}, lost, lost_spots )

			mouse( pick( 'Lost' ), 'dblclick' )
			$mol_assert_ok( field() )

			type( 'Gone' )
			blur()

			$mol_assert_equal( app.node().prop_names().includes( 'Gone' ), true )
			$mol_assert_equal( app.node().prop_names().includes( 'Lost' ), false )
			$mol_assert_equal( app.selected(), 'Gone' )
			$mol_assert_equal( field(), null )
			$mol_assert_like( grouped(), [ 'Gone', 'Box', 'Deep', 'Near' ] )
		},

		'the Delete key takes a picked outside node out with its insides'( $ ) {
			const { app, pick, mouse, press, grouped, lines } = layers_stage( $, {}, lost, lost_spots )

			mouse( pick( 'Box' ), 'click' )
			press( 'Box', 'Delete' )

			const names = app.node().prop_names()

			$mol_assert_equal( names.includes( 'Box' ), false )
			$mol_assert_equal( names.includes( 'Deep' ), false )
			$mol_assert_equal( names.includes( 'Lost' ), true )
			$mol_assert_equal( app.selected(), null )
			$mol_assert_like( grouped(), [ 'Lost', 'Near' ] )
			$mol_assert_equal( lines().length, 7 )
		},

		'an outside row dropped on the lower half of a frame lands inside and the canvas measures it'( $ ) {
			const { app, stage, drag, grouped, moves } = layers_stage( $, {}, lost, lost_spots )

			stage.scene.flush()
			$mol_assert_equal( stage.pane.part_size( 'Lost' ), null )

			drag( 'Lost', 'Card', .9 )

			$mol_assert_like( moves, [ { name: 'Lost', owner: 'Card', index: 1 } ] )
			$mol_assert_like( app.node().sub_names( 'Card' ), [ 'caption', 'Lost' ] )
			$mol_assert_equal( app.spots().Lost, undefined )
			$mol_assert_like( grouped(), [ 'Box', 'Deep', 'Near' ] )

			stage.scene.flush()
			$mol_assert_ok( stage.pane.part_size( 'Lost' ) )
		},

		'an outside row dropped on the upper half of a page row lands before it'( $ ) {
			const { app, drag, grouped } = layers_stage( $, {}, lost, lost_spots )

			drag( 'Box', 'Title', .1 )

			$mol_assert_like( app.node().sub_names( 'Page' ), [ 'Box', 'Title', 'Card' ] )
			$mol_assert_like( app.node().sub_names( 'Box' ), [ 'Deep' ] )
			$mol_assert_like( grouped(), [ 'Lost', 'Near' ] )
		},

		'an outside node with a place dropped on the root stays where it was put'( $ ) {
			const { app, drag, grouped } = layers_stage( $, {}, lost, lost_spots )

			drag( 'Near', `${d}layers_lost`, .5 )

			$mol_assert_like( app.node().sub_names( '' ), [ 'Page', 'Near' ] )
			$mol_assert_like( app.spots().Near, { x: 600, y: 40 } )
			$mol_assert_like( grouped(), [ 'Lost', 'Box', 'Deep' ] )
		},

		'nothing is dropped into the outside group, rows only leave it'( $ ) {
			const { app, drag, line, moves } = layers_stage( $, {}, lost, lost_spots )

			const before = app.doc_source()
			const zone = ( title: string )=> line( title ).getAttribute( 'bog_vmap_app_layers_line_zone' )

			drag( 'Title', 'Lost', .1 )
			$mol_assert_equal( zone( 'Lost' ), '' )

			drag( 'Title', 'Box', .9 )
			$mol_assert_equal( zone( 'Box' ), '' )

			drag( 'Title', 'Deep', .1 )
			$mol_assert_equal( zone( 'Deep' ), '' )

			drag( 'Lost', 'Box', .9 )
			drag( 'Near', 'Deep', .1 )

			$mol_assert_equal( moves.length, 0 )
			$mol_assert_equal( app.doc_source(), before )
		},

		'nodes holding each other off the page are both in the group and come back together'( $ ) {
			const { app, drag, grouped, outline } = layers_stage( $, {}, ring, { Page: { x: 0, y: 0 } } )

			$mol_assert_like( grouped(), [ 'Ring', 'Loop' ] )
			$mol_assert_like( outline().slice( -2 ), [ '  Ring frame', '    Loop frame' ] )

			drag( 'Ring', 'Page', .9 )

			$mol_assert_like( app.node().sub_names( 'Page' ), [ 'Ring' ] )
			$mol_assert_like( app.node().sub_names( 'Ring' ), [ 'Loop' ] )
			$mol_assert_like( app.node().sub_names( 'Loop' ), [] )
			$mol_assert_like( grouped(), [] )
		},

		async 'one undo takes back a move out of the outside group'( $ ) {
			const { app, drag, history, stepped, grouped } = layers_stage( $, {}, lost, lost_spots )

			await stepped()
			const before = app.doc_source()

			drag( 'Lost', 'Card', .9 )

			await stepped()
			history.undo()

			$mol_assert_equal( app.doc_source(), before )
			$mol_assert_like( grouped(), [ 'Lost', 'Box', 'Deep', 'Near' ] )
		},

	})

}
