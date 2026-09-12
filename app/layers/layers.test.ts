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

	const icons = [ 'root', 'frame', 'image', 'link', 'button', 'field', 'text', 'part' ]

	function layers_stage( $: $ ) {
		const stage = $bog_vmap_app_flow_stage( $ )
		const app = stage.app
		const dom = $.$mol_dom_context

		app.doc_source( sample )
		app.spots({ Page: { x: 0, y: 0 }, Photo: { x: 1400, y: 0 } })
		stage.redraw()

		const moves = [] as $$.$bog_vmap_app_pane_tree_move[]
		const move = app.tree_move.bind( app )

		app.tree_move = ( next?: $$.$bog_vmap_app_pane_tree_move | null )=> {
			if( next ) moves.push( next )
			return move( next )
		}

		const layers = $$.$bog_vmap_app_layers.make({
			$,
			source: ()=> app.doc_src(),
			root: ()=> app.doc_root(),
			picked: ( next?: readonly string[] )=> app.picked( next ),
			node_title: ( next?: string )=> app.node_title( next ),
			node_title_note: ()=> app.node_title_note(),
			tree_move: ( next?: $$.$bog_vmap_app_pane_tree_move | null )=> app.tree_move( next ),
		})

		const panel = layers.dom_tree()
		stage.root.parentNode!.appendChild( panel )

		const redraw = ()=> {
			stage.redraw()
			layers.dom_tree()
		}

		const lines = ()=> {
			redraw()
			return [ ... panel.querySelectorAll( '[bog_vmap_app_layers_line]' ) ]
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

		return { stage, app, layers, panel, moves, lines, line, pick, outline, mouse, field, type, blur, key, drag, history, stepped, redraw }
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

	})

}
