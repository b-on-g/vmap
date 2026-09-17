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

	const mortgage = [
		`${d}bog_mortgage ${d}mol_view`,
		`\tmonths_2_op? \\mul`,
		`\tmonths_2_right? 12`,
		`\tmonthly_2_op? \\div`,
		`\tmonthly_2_right? 1200`,
		`\tyears_2_value? 20`,
		`\trate_2_value? 6`,
		`\tend_op? \\add`,
		`\tyear_auto? true`,
		`\tyear_code? \\return new Date().getFullYear()`,
		`\tmonths_op? \\mul`,
		`\tmonths_right? 12`,
		`\tmonthly_op? \\div`,
		`\tmonthly_right? 1200`,
		`\tyears_value? 20`,
		`\trate_value? 18`,
		`\tamount_value? 6000000`,
		`\tsub /`,
		`\t\t<= Loan`,
		`\t\t<= Compare`,
		`\tLoan ${d}mol_view`,
		`\t\tstyle *`,
		`\t\t\twidth \\480px`,
		`\t\t\tminHeight \\720px`,
		`\t\t\tflexDirection \\column`,
		`\t\t\tbackground \\var(--mol_theme_back)`,
		`\t\t\tcolor \\var(--mol_theme_text)`,
		`\t\tsub /`,
		`\t\t\t<= Title`,
		`\t\t\t<= Amount`,
		`\t\t\t<= Rate`,
		`\t\t\t<= Years`,
		`\t\t\t<= Monthly`,
		`\t\t\t<= Months`,
		`\t\t\t<= Payment`,
		`\t\t\t<= Overpay`,
		`\t\t\t<= Debt`,
		`\t\t\t<= Year`,
		`\t\t\t<= End`,
		`\t\t\t<= Next`,
		`\tCompare ${d}mol_view`,
		`\t\tstyle *`,
		`\t\t\twidth \\480px`,
		`\t\t\tminHeight \\720px`,
		`\t\t\tflexDirection \\column`,
		`\t\t\tbackground \\var(--mol_theme_back)`,
		`\t\t\tcolor \\var(--mol_theme_text)`,
		`\t\tsub /`,
		`\t\t\t<= Title_2`,
		`\t\t\t<= Amount_2`,
		`\t\t\t<= Rate_2`,
		`\t\t\t<= Years_2`,
		`\t\t\t<= Monthly_2`,
		`\t\t\t<= Months_2`,
		`\t\t\t<= Verdict`,
		`\t\t\t<= Debt_2`,
		`\t\t\t<= Back`,
		`\tTitle ${d}mol_paragraph title \\Ипотека: платёж и переплата`,
		`\tAmount ${d}mol_number`,
		`\t\thint \\Сумма кредита, ₽`,
		`\t\tvalue? <=> amount_value?`,
		`\tRate ${d}mol_number`,
		`\t\thint \\Ставка, % годовых`,
		`\t\tvalue? <=> rate_value?`,
		`\tYears ${d}mol_number`,
		`\t\thint \\Срок, лет`,
		`\t\tvalue? <=> years_value?`,
		`\tMonthly ${d}bog_vmap_part_calc`,
		`\t\tright? <=> monthly_right?`,
		`\t\top? <=> monthly_op?`,
		`\t\tleft <= rate_value_2`,
		`\tMonths ${d}bog_vmap_part_calc`,
		`\t\tright? <=> months_right?`,
		`\t\top? <=> months_op?`,
		`\t\tleft? <=> years_value_2?`,
		`\tPayment ${d}mol_paragraph title <= payment`,
		`\tOverpay ${d}mol_paragraph title <= overpay`,
		`\tDebt ${d}bog_vmap_part_plot`,
		`\t\ttitle \\Остаток долга по годам, ₽`,
		`\t\tvalues <= balance`,
		`\tYear ${d}bog_vmap_part_cell`,
		`\t\tcode? <=> year_code?`,
		`\t\tauto? <=> year_auto?`,
		`\tEnd ${d}bog_vmap_part_calc`,
		`\t\top? <=> end_op?`,
		`\t\tright <= years_value_3`,
		`\t\tleft <= year_result_number`,
		`\tNext ${d}mol_link`,
		`\t\ttitle \\Сравнить с другим вариантом →`,
		`\t\targ * page \\Compare`,
		`\tTitle_2 ${d}mol_paragraph title \\Сравнение: другая ставка или срок`,
		`\tAmount_2 ${d}mol_number`,
		`\t\thint \\Сумма кредита, ₽`,
		`\t\tvalue? <=> amount_value_2?`,
		`\tRate_2 ${d}mol_number`,
		`\t\thint \\Ставка, % годовых`,
		`\t\tvalue? <=> rate_2_value?`,
		`\tYears_2 ${d}mol_number`,
		`\t\thint \\Срок, лет`,
		`\t\tvalue? <=> years_2_value?`,
		`\tMonthly_2 ${d}bog_vmap_part_calc`,
		`\t\tright? <=> monthly_2_right?`,
		`\t\top? <=> monthly_2_op?`,
		`\t\tleft <= rate_2_value_2`,
		`\tMonths_2 ${d}bog_vmap_part_calc`,
		`\t\tright? <=> months_2_right?`,
		`\t\top? <=> months_2_op?`,
		`\t\tleft <= years_2_value_2`,
		`\tVerdict ${d}mol_paragraph title <= verdict`,
		`\tDebt_2 ${d}bog_vmap_part_plot`,
		`\t\ttitle \\Остаток долга, второй вариант, ₽`,
		`\t\tvalues <= balance_2`,
		`\tBack ${d}mol_link`,
		`\t\ttitle \\← К расчёту`,
		`\t\targ * page \\Loan`,
		`\trate_value_2 = Rate value`,
		`\tyears_value_2? = Years value?`,
		`\tyears_value_3 = Years value`,
		`\tyear_result_number = Year result_number`,
		`\trate_2_value_2 = Rate_2 value`,
		`\tyears_2_value_2 = Years_2 value`,
		`\tamount_value_2? = Amount value?`,
		`\tpayment null`,
		`\toverpay null`,
		`\tbalance null`,
		`\tverdict null`,
		`\tbalance_2 null`,
		``,
	].join( '\n' )

	const mortgage_spots = { Loan: { x: 40, y: 40 }, Compare: { x: 600, y: 40 } }

	const icons = [ 'root', 'frame', 'image', 'link', 'button', 'field', 'text', 'part' ]

	const inner_doc = [
		`${d}layers_inner ${d}mol_view`,
		`	Page ${d}mol_view`,
		`		sub /`,
		`			<= Debt`,
		`	Debt ${d}bog_vmap_part_plot`,
		`		title \\Долг`,
		`	sub /`,
		`		<= Page`,
		``,
	].join( '\n' )

	const inner_over = [
		`${d}layers_inner ${d}mol_view`,
		`	Page ${d}mol_view`,
		`		sub /`,
		`			<= Debt`,
		`	Debt ${d}bog_vmap_part_plot`,
		`		title \\Долг`,
		`		Line <= Debt_Line`,
		`	Debt_Line ${d}mol_plot_line`,
		`		series_y = Debt values`,
		`		color \\red`,
		`	sub /`,
		`		<= Page`,
		``,
	].join( '\n' )

	const inner_kids: { readonly [ key: string ]: readonly string[] } = {
		[ `${d}bog_vmap_part_plot` ]: [ 'Title', 'Chart' ],
		[ `${d}bog_vmap_part_plot/Chart` ]: [ 'Line' ],
	}

	const inner_classes: { readonly [ key: string ]: string } = {
		[ `${d}bog_vmap_part_plot/Title` ]: `${d}mol_paragraph`,
		[ `${d}bog_vmap_part_plot/Chart` ]: `${d}mol_chart`,
		[ `${d}bog_vmap_part_plot/Line` ]: `${d}mol_plot_line`,
	}

	function inner_stage( $: $, key: string, source = inner_doc ) {

		const dom = $.$mol_dom_context

		let picked = [] as readonly string[]
		let inner = ''

		const layers = $$.$bog_vmap_app_layers.make({
			$,
			source: ()=> source,
			root: ()=> `${d}layers_inner`,
			doc_key: ()=> key,
			picked: ( next?: readonly string[] )=> next === undefined ? picked : ( picked = next ),
			inner: ( next?: string )=> next === undefined ? inner : ( inner = next ),
			inner_kids: ( key: string )=> inner_kids[ key ] ?? [],
			inner_class: ( key: string )=> inner_classes[ key ] ?? '',
		})

		return {
			layers,
			picked: ()=> picked,
			inner: ()=> inner,
			click: ( type = 'click' )=> new dom.MouseEvent( type, { bubbles: true, cancelable: true } ),
			outline: ( names: readonly string[] )=> {

				$mol_assert_equal( layers.rows().length, names.length )

				return names.map( ( name, at )=> {
					$mol_assert_equal( layers.rows()[ at ], layers.Row( name ) )
					return '  '.repeat( layers.row_level( name ) - 1 )
						+ layers.row_title( name ) + ' ' + layers.row_kind( name )
				} )
			},
		}
	}

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

		'a root folded in one scene leaves the mortgage scene open with both pages and every part'( $ ) {
			const store = $bog_vmap_app_store.make({ $, doc_land_config: ()=> null })
			const loan = store.doc_add( 'Ипотека', mortgage, mortgage_spots )
			const other = store.doc_add( 'Сцена 2' )

			const { outline, line, mouse, redraw } = layers_stage( $, { store } )

			mouse( line( `${d}layers_doc` ).querySelector( '[bog_vmap_app_layers_expand]' )!, 'click' )
			$mol_assert_like( outline(), [ `${d}layers_doc root` ] )

			store.doc_pick( loan.link() )
			redraw()

			$mol_assert_like( outline(), [
				`${d}bog_mortgage root`,
				'  Loan frame',
				'    Title text',
				'    Amount field',
				'    Rate field',
				'    Years field',
				'    Monthly part',
				'    Months part',
				'    Payment text',
				'    Overpay text',
				'    Debt part',
				'    Year part',
				'    End part',
				'    Next link',
				'  Compare frame',
				'    Title_2 text',
				'    Amount_2 field',
				'    Rate_2 field',
				'    Years_2 field',
				'    Monthly_2 part',
				'    Months_2 part',
				'    Verdict text',
				'    Debt_2 part',
				'    Back link',
			] )

			store.doc_pick( other.link() )
			$mol_assert_like( outline(), [ `${d}layers_doc root` ] )
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

		'a click on a row brings its node to the middle of the canvas at the same zoom'( $ ) {
			const { stage, pick, mouse } = layers_stage( $ )
			const rect = $bog_vmap_app_flow_rect

			stage.scene.flush()
			stage.pane.camera_zoom( 2 )
			stage.pane.camera_shift( new $mol_vector_2d( 40, 30 ) )

			mouse( pick( 'Photo' ), 'click' )

			const box = stage.pane.part_box( 'Photo' )!
			$mol_assert_equal( stage.pane.camera_zoom(), 2 )
			$mol_assert_equal( box.left + box.width / 2, rect.width / 2 )
			$mol_assert_equal( box.top + box.height / 2, rect.height / 2 )
		},

		'a click on a row of a node larger than the canvas zooms out just to fit it'( $ ) {
			const { stage, pick, mouse } = layers_stage( $ )
			const rect = $bog_vmap_app_flow_rect
			const gap = stage.pane.fit_gap()

			stage.scene.flush()
			stage.pane.camera_zoom( 3 )

			mouse( pick( 'Page' ), 'click' )

			const box = stage.pane.part_box( 'Page' )!
			$mol_assert_equal( Math.round( box.width ), rect.width - gap * 2 )
			$mol_assert_ok( box.height <= rect.height - gap * 2 )
			$mol_assert_equal( Math.round( box.left + box.width / 2 ), rect.width / 2 )
			$mol_assert_equal( Math.round( box.top + box.height / 2 ), rect.height / 2 )
		},

		'a row taken out of the pick with a modifier leaves the camera where it was'( $ ) {
			const { app, stage, pick, mouse } = layers_stage( $ )

			stage.scene.flush()
			mouse( pick( 'Photo' ), 'click' )
			stage.pane.camera_shift( new $mol_vector_2d( 40, 30 ) )

			mouse( pick( 'Photo' ), 'click', { metaKey: true } )

			$mol_assert_like( app.picked(), [] )
			$mol_assert_like( [ ... stage.pane.camera_shift() ], [ 40, 30 ] )
		},

		'a pick on the canvas leaves the camera where it was'( $ ) {
			const { app, stage } = layers_stage( $ )

			stage.scene.flush()
			stage.pane.camera_zoom( 1 )
			stage.pane.camera_shift( new $mol_vector_2d( -1300, 100 ) )
			stage.redraw()

			stage.tap( stage.part_center( 'Photo' ) )

			$mol_assert_equal( app.selected(), 'Photo' )
			$mol_assert_equal( stage.pane.camera_zoom(), 1 )
			$mol_assert_like( [ ... stage.pane.camera_shift() ], [ -1300, 100 ] )
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

		'a read only scene lets the rows be picked and opened, not renamed or moved'( $ ) {
			const dom = $.$mol_dom_context
			let picked = [] as readonly string[]

			const layers = $$.$bog_vmap_app_layers.make({
				$,
				source: ()=> sample,
				root: ()=> `${d}layers_doc`,
				picked: ( next?: readonly string[] )=> next ? picked = next : picked,
				editable: ()=> false,
			})

			const click = ( type: string )=> new dom.MouseEvent( type, { bubbles: true, cancelable: true } )

			layers.row_pick( 'Title', click( 'click' ) )
			$mol_assert_like( picked, [ 'Title' ] )

			$mol_assert_equal( layers.row_expanded( 'Page', false ), false )

			layers.row_edit( 'Photo', click( 'dblclick' ) )
			$mol_assert_equal( layers.editing(), null )
			$mol_assert_like( picked, [ 'Title' ] )

			$mol_assert_equal( layers.row_draggable( 'Photo' ), false )
			$mol_assert_equal( layers.Row( 'Photo' ).dom_node_actual().hasAttribute( 'draggable' ), false )

			const transfer = { getData: ( kind: string )=> kind === 'text/plain' ? 'Photo' : '' } as unknown as DataTransfer
			$mol_assert_equal( layers.row_adopt( transfer ), null )
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

		'a part shows the inner layers of its class, one namespace deep as the class nests them'( $ ) {

			const { layers, outline } = inner_stage( $, 'inner_shown' )

			$mol_assert_equal( layers.row_open( 'Debt' ), false )

			layers.row_expanded( 'Debt', true )
			layers.row_expanded( 'Debt/Chart', true )

			$mol_assert_like( layers.row_kids( 'Debt' ), [ 'Debt/Title', 'Debt/Chart' ] )
			$mol_assert_like( layers.row_kids( 'Debt/Chart' ), [ 'Debt/Line' ] )
			$mol_assert_like( layers.row_kids( 'Debt/Title' ), [] )

			$mol_assert_like(
				outline([ '', 'Page', 'Debt', 'Debt/Title', 'Debt/Chart', 'Debt/Line' ]),
				[
					`${d}layers_inner root`,
					'  Page frame',
					'    Debt part',
					'      Title text',
					'      Chart frame',
					'        Line part',
				],
			)

			$mol_assert_equal( layers.row_title( 'Debt/Line' ), 'Line' )
			$mol_assert_equal( layers.row_hint( 'Debt/Line' ), `${d}mol_plot_line` )
			$mol_assert_equal( layers.row_level( 'Debt/Line' ), layers.row_level( 'Debt' ) + 2 )

		},

		'inner rows are dimmed and the rows of the document are not'( $ ) {

			const { layers } = inner_stage( $, 'inner_dim' )

			layers.row_expanded( 'Debt', true )

			const dim = ( name: string )=> layers.Line( name ).dom_node_actual()
				.getAttribute( 'bog_vmap_app_layers_line_inner' )

			$mol_assert_equal( dim( 'Debt/Title' ), 'true' )
			$mol_assert_equal( dim( 'Debt' ), null )

		},

		'a click on an inner layer picks it and keeps the part selected'( $ ) {

			const { layers, picked, inner, click } = inner_stage( $, 'inner_pick' )

			layers.row_expanded( 'Debt', true )
			layers.row_pick( 'Debt/Title', click() )

			$mol_assert_like( picked(), [ 'Debt' ] )
			$mol_assert_equal( inner(), 'Debt/Title' )
			$mol_assert_equal( layers.row_picked( 'Debt/Title' ), true )
			$mol_assert_equal( layers.row_picked( 'Debt/Chart' ), false )

			layers.row_pick( 'Page', click() )

			$mol_assert_like( picked(), [ 'Page' ] )
			$mol_assert_equal( inner(), '' )

		},

		'the make up of a part is read only: no drag, no drop, no rename'( $ ) {

			const { layers, click } = inner_stage( $, 'inner_ban' )

			layers.row_expanded( 'Debt', true )

			$mol_assert_equal( layers.row_draggable( 'Debt/Title' ), false )
			$mol_assert_equal(
				layers.Row( 'Debt/Title' ).dom_node_actual().hasAttribute( 'draggable' ),
				false,
			)

			layers.row_edit( 'Debt/Title', click( 'dblclick' ) )
			$mol_assert_equal( layers.editing(), null )

			$mol_assert_equal( layers.zone_at( 'Debt/Title', .9 ), '' )
			$mol_assert_equal( layers.move_to( 'Debt/Title', 'Page', 'inside' ), null )
			$mol_assert_equal( layers.move_to( 'Page', 'Debt/Title', 'before' ), null )

			const transfer = {
				getData: ( kind: string )=> kind === 'text/plain' ? 'Debt/Title' : '',
			} as unknown as DataTransfer

			$mol_assert_equal( layers.row_adopt( transfer ), null )

		},

		'an overridden inner layer keeps its place under the part instead of the outside group'( $ ) {

			const { layers, outline } = inner_stage( $, 'inner_over', inner_over )

			layers.row_expanded( 'Debt', true )

			$mol_assert_like( layers.outside(), [] )
			$mol_assert_like(
				outline([ '', 'Page', 'Debt', 'Debt/Title', 'Debt/Chart' ]),
				[
					`${d}layers_inner root`,
					'  Page frame',
					'    Debt part',
					'      Title text',
					'      Chart frame',
				],
			)

		},

	})

}
