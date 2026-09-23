namespace $ {

	export const $bog_vmap_showcase_ok = 'приложение собрано из блоков и выгружено'

	export const $bog_vmap_showcase_site_ok = 'собранное приложение считает и ходит по страницам'

	export const $bog_vmap_showcase_page = 'bog/vmap/app/-/index.html'

	export const $bog_vmap_showcase_parts = [
		'bog/vmap/app/-/index.html',
		'bog/vmap/app/-/web.js',
		'bog/vmap/scene/-/web.js',
		'bog/vmap/part/-/web.js',
		'bog/vmap/part/-/web.view.tree',
	]

	export const $bog_vmap_showcase_out = 'bog/vmap/showcase/-'

	export const $bog_vmap_showcase_module = 'bog/mortgage'

	export const $bog_vmap_showcase_zip = 'mortgage.zip'

	export const $bog_vmap_showcase_files = [
		'.gitattributes',
		'.github/workflows/deploy.yml',
		'.gitignore',
		'README.md',
		'index.html',
		'mortgage.meta.tree',
		'mortgage.view.css',
		'mortgage.view.tree',
		'mortgage.view.ts',
	]

	export function $bog_vmap_showcase_root( part = '' ) {
		const d = '$'
		return d + 'bog_mortgage' + ( part ? '_' + part : '' )
	}

	export function $bog_vmap_showcase_attr( name: string ) {
		return `[bog_mortgage_${ name.toLowerCase() }]`
	}

	export type $bog_vmap_showcase_rect = {
		readonly x: number
		readonly y: number
		readonly width: number
		readonly height: number
	}

	export type $bog_vmap_showcase_board = {
		readonly name: string
		readonly x: number
		readonly y: number
		readonly width: number
		readonly height: number
		readonly gesture: boolean
	}

	export type $bog_vmap_showcase_value = string | number | boolean

	export type $bog_vmap_showcase_block = {
		readonly name: string
		readonly board: string
		readonly shelf: string
		readonly klass: string
		readonly props: readonly string[]
		readonly cells: readonly ( readonly [ string, $bog_vmap_showcase_value ] )[]
		readonly gesture: boolean
	}

	export type $bog_vmap_showcase_wire = {
		readonly from: string
		readonly from_prop: string
		readonly to: string
		readonly to_prop: string
		readonly bidi: boolean
		readonly gesture: boolean
	}

	export const $bog_vmap_showcase_boards: readonly $bog_vmap_showcase_board[] = [
		{ name: 'Loan', x: 40, y: 40, width: 480, height: 720, gesture: true },
		{ name: 'Compare', x: 600, y: 40, width: 480, height: 720, gesture: false },
	]

	export function $bog_vmap_showcase_blocks(): readonly $bog_vmap_showcase_block[] {

		const d = '$'
		const mol = ( name: string )=> d + 'mol_' + name
		const kit = ( name: string )=> d + 'bog_vmap_part_' + name

		const number = { shelf: 'input_number', klass: mol( 'number' ) }
		const paragraph = { shelf: 'input_paragraph', klass: mol( 'paragraph' ) }
		const link = { shelf: mol( 'link' ), klass: mol( 'link' ) }
		const calc = { shelf: 'calc', klass: kit( 'calc' ) }
		const plot = { shelf: 'plot', klass: kit( 'plot' ) }
		const cell = { shelf: 'cell', klass: kit( 'cell' ) }

		const block = (
			kind: { readonly shelf: string, readonly klass: string },
			name: string,
			board: string,
			props: readonly string[],
			cells: readonly ( readonly [ string, $bog_vmap_showcase_value ] )[] = [],
			gesture = false,
		)=> ({ ... kind, name, board, props, cells, gesture })

		return [
			block( paragraph, 'Title', 'Loan', [ 'title \\Ипотека: платёж и переплата' ] ),
			block( number, 'Amount', 'Loan', [ 'hint \\Сумма кредита, ₽' ], [ [ 'value?', 6000000 ] ], true ),
			block( number, 'Rate', 'Loan', [ 'hint \\Ставка, % годовых' ], [ [ 'value?', 18 ] ] ),
			block( number, 'Years', 'Loan', [ 'hint \\Срок, лет' ], [ [ 'value?', 20 ] ] ),
			block( calc, 'Monthly', 'Loan', [], [ [ 'right?', 1200 ], [ 'op?', 'div' ] ] ),
			block( calc, 'Months', 'Loan', [], [ [ 'right?', 12 ], [ 'op?', 'mul' ] ] ),
			block( paragraph, 'Payment', 'Loan', [ 'title <= payment' ] ),
			block( paragraph, 'Overpay', 'Loan', [ 'title <= overpay' ] ),
			block( plot, 'Debt', 'Loan', [ 'title \\Остаток долга по годам, ₽', 'values <= balance' ] ),
			block( cell, 'Year', 'Loan', [], [ [ 'code?', 'return new Date().getFullYear()' ], [ 'auto?', true ] ] ),
			block( calc, 'End', 'Loan', [], [ [ 'op?', 'add' ] ] ),
			block( link, 'Next', 'Loan', [ 'title \\Сравнить с другим вариантом →', 'arg *', '\tpage \\Compare' ] ),
			block( paragraph, 'Title_2', 'Compare', [ 'title \\Сравнение: другая ставка или срок' ] ),
			block( number, 'Amount_2', 'Compare', [ 'hint \\Сумма кредита, ₽' ] ),
			block( number, 'Rate_2', 'Compare', [ 'hint \\Ставка, % годовых' ], [ [ 'value?', 6 ] ] ),
			block( number, 'Years_2', 'Compare', [ 'hint \\Срок, лет' ], [ [ 'value?', 20 ] ] ),
			block( calc, 'Monthly_2', 'Compare', [], [ [ 'right?', 1200 ], [ 'op?', 'div' ] ] ),
			block( calc, 'Months_2', 'Compare', [], [ [ 'right?', 12 ], [ 'op?', 'mul' ] ] ),
			block( paragraph, 'Verdict', 'Compare', [ 'title <= verdict' ] ),
			block( plot, 'Debt_2', 'Compare', [ 'title \\Остаток долга, второй вариант, ₽', 'values <= balance_2' ] ),
			block( link, 'Back', 'Compare', [ 'title \\← К расчёту', 'arg *', '\tpage \\Loan' ] ),
		]
	}

	export const $bog_vmap_showcase_wires: readonly $bog_vmap_showcase_wire[] = [
		{ from: 'Rate', from_prop: 'value', to: 'Monthly', to_prop: 'left', bidi: false, gesture: true },
		{ from: 'Years', from_prop: 'value', to: 'Months', to_prop: 'left', bidi: true, gesture: true },
		{ from: 'Years', from_prop: 'value', to: 'End', to_prop: 'right', bidi: false, gesture: false },
		{ from: 'Year', from_prop: 'result_number', to: 'End', to_prop: 'left', bidi: false, gesture: false },
		{ from: 'Rate_2', from_prop: 'value', to: 'Monthly_2', to_prop: 'left', bidi: false, gesture: false },
		{ from: 'Years_2', from_prop: 'value', to: 'Months_2', to_prop: 'left', bidi: false, gesture: false },
		{ from: 'Amount', from_prop: 'value', to: 'Amount_2', to_prop: 'value', bidi: true, gesture: false },
	]

	export const $bog_vmap_showcase_hooks = [ 'payment', 'overpay', 'balance', 'balance_2', 'verdict' ]

	export const $bog_vmap_showcase_js = [
		'annuity( sum = 0, rate = 0, months = 0 ) {',
		'	if( !( sum > 0 ) || !( months > 0 ) ) return NaN',
		'	if( !( rate > 0 ) ) return sum / months',
		'	return sum * rate / ( 1 - Math.pow( 1 + rate, -months ) )',
		'}',
		'',
		'schedule( sum = 0, rate = 0, months = 0 ) {',
		'	const pay = this.annuity( sum, rate, months )',
		'	if( !Number.isFinite( pay ) ) return [ 0 ]',
		'	const out = [ Math.round( sum ) ]',
		'	let debt = sum',
		'	for( let month = 1; month <= months; month += 1 ) {',
		'		debt = debt * ( 1 + rate ) - pay',
		'		if( month % 12 === 0 ) out.push( Math.max( 0, Math.round( debt ) ) )',
		'	}',
		'	return out',
		'}',
		'',
		'rub( value = 0 ) {',
		'	return Math.round( value ).toLocaleString( \'ru-RU\' ) + \' ₽\'',
		'}',
		'',
		'payment() {',
		'	const pay = this.annuity( this.Amount().value(), this.Monthly().result(), this.Months().result() )',
		'	if( !Number.isFinite( pay ) ) return \'Заполните сумму, ставку и срок\'',
		'	return \'Платёж \' + this.rub( pay ) + \' в месяц\'',
		'}',
		'',
		'overpay() {',
		'	const sum = this.Amount().value()',
		'	const months = this.Months().result()',
		'	const pay = this.annuity( sum, this.Monthly().result(), months )',
		'	if( !Number.isFinite( pay ) ) return \'\'',
		'	return \'Переплата \' + this.rub( pay * months - sum ) + \' за \' + months + \' мес.\'',
		'}',
		'',
		'balance() {',
		'	return this.schedule( this.Amount().value(), this.Monthly().result(), this.Months().result() )',
		'}',
		'',
		'balance_2() {',
		'	return this.schedule( this.Amount_2().value(), this.Monthly_2().result(), this.Months_2().result() )',
		'}',
		'',
		'verdict() {',
		'	const sum = this.Amount_2().value()',
		'	const first = this.annuity( sum, this.Monthly().result(), this.Months().result() ) * this.Months().result() - sum',
		'	const pay = this.annuity( sum, this.Monthly_2().result(), this.Months_2().result() )',
		'	const second = pay * this.Months_2().result() - sum',
		'	if( !Number.isFinite( first ) || !Number.isFinite( second ) ) return \'Заполните оба варианта\'',
		'	const side = second < first ? \'меньше\' : \'больше\'',
		'	return \'Платёж \' + this.rub( pay ) + \', переплата \' + this.rub( second ) + \' — на \' + this.rub( Math.abs( first - second ) ) + \' \' + side + \', чем в первом варианте\'',
		'}',
		'',
	].join( '\n' )

	export const $bog_vmap_showcase_css = [
		'[bog_mortgage_loan],',
		'[bog_mortgage_compare] {',
		'	padding: 1.5rem;',
		'	gap: .75rem;',
		'}',
		'',
		'[bog_mortgage_payment],',
		'[bog_mortgage_verdict] {',
		'	font-size: 1.25rem;',
		'	font-weight: bold;',
		'}',
		'',
	].join( '\n' )

	export function $bog_vmap_showcase_annuity( sum: number, rate: number, months: number ) {
		if( !( sum > 0 ) || !( months > 0 ) ) return NaN
		if( !( rate > 0 ) ) return sum / months
		return sum * rate / ( 1 - Math.pow( 1 + rate, -months ) )
	}

	export function $bog_vmap_showcase_expect( sum: number, divisor = 1200 ) {

		const first_rate = 18 / divisor
		const second_rate = 6 / 1200
		const months = 20 * 12

		const pay = $bog_vmap_showcase_annuity( sum, first_rate, months )
		const other = $bog_vmap_showcase_annuity( sum, second_rate, months )

		const first = pay * months - sum
		const second = other * months - sum

		return {
			payment: String( Math.round( pay ) ),
			overpay: String( Math.round( pay * months - sum ) ) + String( months ),
			verdict: String( Math.round( other ) ) + String( Math.round( second ) ) + String( Math.round( Math.abs( first - second ) ) ),
		}
	}

	export function $bog_vmap_showcase_source( block: $bog_vmap_showcase_block ) {
		return `${ block.name } ${ block.klass }\n` + block.props.map( line => `\t${ line }\n` ).join( '' )
	}

	export function $bog_vmap_showcase_hand( browser: $bog_probe_browser ) {

		const mouse = ( type: string, [ x, y ]: readonly number[], held = false, modifiers = 0, count = 1 )=> browser.send( 'Input.dispatchMouseEvent', {
			type, x, y, modifiers,
			button: type === 'mouseMoved' && !held ? 'none' : 'left',
			buttons: type === 'mousePressed' || held ? 1 : 0,
			clickCount: type === 'mouseMoved' ? 0 : count,
		}, browser.page )

		const spot = async ( find: string, note: string )=> {
			const got = await browser.evaluate( `
				const node = ${ find }
				if( !node ) return null
				node.scrollIntoView({ block: 'nearest' })
				const box = node.getBoundingClientRect()
				const x = box.left + box.width / 2
				const y = box.top + box.height / 2
				return node.contains( document.elementFromPoint( x, y ) ) ? [ x, y ] : null
			`, 15000 ) as number[] | null
			if( !got ) return $mol_fail( new Error( `${ note }: узла нет или центр его перекрыт, клик уйдёт мимо` ) )
			return got
		}

		const click = async ( find: string, note: string, count = 1 )=> {
			const at = await spot( find, note )
			await mouse( 'mouseMoved', at )
			for( let one = 1; one <= count; ++ one ) {
				await mouse( 'mousePressed', at, false, 0, one )
				await mouse( 'mouseReleased', at, false, 0, one )
			}
		}

		const glide = async ( from: readonly number[], to: readonly number[], modifiers = 0, steps = 10 )=> {
			for( let step = 1; step <= steps; ++ step ) await mouse( 'mouseMoved', [
				from[ 0 ] + ( to[ 0 ] - from[ 0 ] ) * step / steps,
				from[ 1 ] + ( to[ 1 ] - from[ 1 ] ) * step / steps,
			], true, modifiers )
		}

		const drag = async ( from: readonly number[], to: readonly number[] )=> {
			await mouse( 'mouseMoved', from )
			await mouse( 'mousePressed', from )
			await glide( from, to )
			await mouse( 'mouseReleased', to )
		}

		const type = async ( find: string, note: string, text: string )=> {
			await click( find, note, 3 )
			await browser.send( 'Input.insertText', { text }, browser.page )
		}

		return { mouse, spot, click, glide, drag, type }
	}

	export async function $bog_vmap_showcase_frame( browser: $bog_probe_browser ) {
		for( const session of browser.frames ) {
			try {
				if( await browser.evaluate( `return !!document.querySelector( '[bog_vmap_scene]' )`, 5000, session ) ) return session
			} catch( error ) {}
		}
		return ''
	}

	export async function $bog_vmap_showcase_until( browser: $bog_probe_browser, code: string, limit: number, session = browser.page ) {
		const started = Date.now()
		const guarded = `return (()=>{ try { return ( ${ code } ) } catch( error ) { return false } })()`
		while( Date.now() - started < limit ) {
			if( await browser.evaluate( guarded, 15000, session ) ) return Date.now() - started
			await $bog_probe_pause( 200 )
		}
		return -1
	}

	export const $bog_vmap_showcase_fields = [ 'Amount', 'Rate', 'Years', 'Amount_2', 'Rate_2', 'Years_2' ]

	export const $bog_vmap_showcase_points = 10

	export type $bog_vmap_showcase_seen = { readonly [ key: string ]: string | number | null }

	export function $bog_vmap_showcase_matches( read: string, want: $bog_vmap_showcase_seen ) {
		return `(()=>{
			const got = JSON.parse( (()=>{ ${ read } })() )
			const want = ${ JSON.stringify( want ) }
			return Object.keys( want ).every( key => typeof want[ key ] === 'number' ? got[ key ] >= want[ key ] : got[ key ] === want[ key ] )
		})()`
	}

	export function $bog_vmap_showcase_wrong( got: $bog_vmap_showcase_seen, want: $bog_vmap_showcase_seen ) {
		return Object.keys( want )
			.filter( key => typeof want[ key ] === 'number' ? !( Number( got[ key ] ) >= Number( want[ key ] ) ) : got[ key ] !== want[ key ] )
			.map( key => `${ key } ${ JSON.stringify( got[ key ] ) } вместо ${ typeof want[ key ] === 'number' ? 'не меньше ' : '' }${ want[ key ] }` )
	}

	export function $bog_vmap_showcase_read() {
		const attr = $bog_vmap_showcase_attr
		const texts = $bog_vmap_showcase_fields.map( name => `${ JSON.stringify( name ) }: text( ${ JSON.stringify( attr( name ) ) } )` )
		return `
			const text = sel => {
				const node = document.querySelector( sel )
				if( !node ) return null
				const field = node.querySelector( 'input' )
				return field ? field.value : node.textContent
			}
			const digits = sel => ( text( sel ) ?? '' ).replace( /\\D/g, '' )
			const points = sel => {
				const line = document.querySelector( sel + ' [bog_vmap_part_plot_line]' )
				return line ? ( ( line.getAttribute( 'd' ) ?? '' ).split( 'L' )[ 1 ] ?? '' ).split( ' ' ).filter( pair => pair.includes( ',' ) ).length : 0
			}
			return JSON.stringify({
				${ texts.join( ',\n' ) },
				months: text( ${ JSON.stringify( attr( 'Months' ) + ' [bog_vmap_part_calc_result]' ) } ),
				monthly: text( ${ JSON.stringify( attr( 'Monthly' ) + ' [bog_vmap_part_calc_result]' ) } ),
				months_2: text( ${ JSON.stringify( attr( 'Months_2' ) + ' [bog_vmap_part_calc_result]' ) } ),
				monthly_2: text( ${ JSON.stringify( attr( 'Monthly_2' ) + ' [bog_vmap_part_calc_result]' ) } ),
				end: text( ${ JSON.stringify( attr( 'End' ) + ' [bog_vmap_part_calc_result]' ) } ),
				year: text( ${ JSON.stringify( attr( 'Year' ) + ' [bog_vmap_part_cell_result]' ) } ),
				payment: digits( ${ JSON.stringify( attr( 'Payment' ) ) } ),
				overpay: digits( ${ JSON.stringify( attr( 'Overpay' ) ) } ),
				verdict: digits( ${ JSON.stringify( attr( 'Verdict' ) ) } ),
				debt: points( ${ JSON.stringify( attr( 'Debt' ) ) } ),
				debt_2: points( ${ JSON.stringify( attr( 'Debt_2' ) ) } ),
			})
		`
	}

	export async function $bog_vmap_showcase_check( root = String( $node.process.cwd() ) ) {

		const d = '$'
		const lines = [] as string[]
		const say = ( line: string )=> { lines.push( line ); $node.fs.writeSync( 1, 'витрина: ' + line + '\n' ) }

		for( const rel of $bog_vmap_showcase_parts ) {
			if( $node.fs.existsSync( $node.path.join( root, rel ) ) ) continue
			return $mol_fail( new Error( `нет ${ rel }, сперва собери app, scene и part` ) )
		}

		const bin = $bog_probe_chrome_bin()
		if( !bin ) { say( $bog_probe_skip ); return lines.join( '\n' ) }

		const out = String( $node.path.join( root, $bog_vmap_showcase_out ) )
		const top = $bog_vmap_showcase_module.split( '/' )[ 0 ]

		const site = await new $bog_probe_static( root ).open()
		const profile = String( $node.fs.mkdtempSync( $node.path.join( $node.os.tmpdir(), 'vmap-showcase-' ) ) )
		const stage = String( $node.fs.mkdtempSync( $node.path.join( $node.os.tmpdir(), 'vmap-showcase-out-' ) ) )
		const browser = new $bog_probe_browser( bin, profile )

		const zip = String( $node.path.join( stage, $bog_vmap_showcase_zip ) )
		const unpacked = String( $node.path.join( stage, $bog_vmap_showcase_module ) )

		const app = `$[ ${ JSON.stringify( d + 'bog_vmap_app' ) } ].Root( 0 )`
		const pane = `${ app }.Pane()`
		const ready = `typeof $ !== 'undefined' && ${ pane }.warmed() && ${ app }.doc_key() !== ''`
		const root_class = $bog_vmap_showcase_root()

		const ask = async ( code: string )=> await browser.evaluate( `const app = ${ app }; return ${ code }`, 15000 )
		const act = async ( body: string )=> await browser.evaluate( `
			const app = ${ app }
			return await $[ ${ JSON.stringify( d + 'mol_wire_async' ) } ]( ()=> { ${ body } } )()
		`, 30000 )
		const until = async ( code: string, limit: number, note: string )=> {
			const waited = await browser.until( code, limit )
			if( waited < 0 ) return $mol_fail( new Error( `${ note } за ${ limit } мс` ) )
			return waited
		}
		const settle = async ()=> {
			let last = ''
			const started = Date.now()
			while( Date.now() - started < 10000 ) {
				const now = String( await ask( 'JSON.stringify( app.Pane().sizes() )' ) )
				if( now === last ) return Date.now() - started
				last = now
				await $bog_probe_pause( 400 )
			}
			return $mol_fail( new Error( 'размеры узлов сцены не устоялись за 10000 мс' ) )
		}
		const box = async ( name: string )=> JSON.parse( String( await ask( `JSON.stringify( app.Pane().part_size( ${ JSON.stringify( name ) } ) )` ) ) ) as $bog_vmap_showcase_rect
		const screen = async ( x: number, y: number )=> JSON.parse( String( await ask( `JSON.stringify( (()=>{
			const pane = app.Pane()
			const rect = pane.pane_rect()
			const zoom = pane.camera_zoom()
			const shift = pane.camera_shift()
			return [ rect.left + shift[ 0 ] + ${ x } * zoom, rect.top + shift[ 1 ] + ${ y } * zoom ]
		})() )` ) ) ) as number[]
		const dots = async ()=> JSON.parse( String( await ask( `JSON.stringify( (()=>{
			const pane = app.Pane()
			const rect = pane.pane_rect()
			return pane.wire_dots().map( dot => ({ node: dot.node, port: dot.port.name, side: dot.side, lit: dot.lit, x: rect.left + dot.x, y: rect.top + dot.y }) )
		})() )` ) ) ) as { node: string, port: string, side: string, lit: boolean, x: number, y: number }[]

		try {

			await browser.open()
			await browser.viewport( 1920, 1200 )

			const began = Date.now()
			const warm = await browser.open_page( site.uri( $bog_vmap_showcase_page ), ready, 150000 )
			say( `прогрев и документ ${ warm } мс, порт статики ${ site.port }` )

			await $bog_vmap_blank( browser, site.uri( $bog_vmap_showcase_page ), 'витрина:' )

			const hand = $bog_vmap_showcase_hand( browser )

			await hand.type( `document.querySelector( '[bog_vmap_app_root_name]' )`, 'поле имени корня', root_class )
			await browser.press( 'Enter', 13 )
			await until( `${ app }.doc_root() === ${ JSON.stringify( root_class ) }`, 5000, `корень не стал ${ root_class } после набора и Enter` )
			say( `жестом: имя корня набрано в поле и принято Enter, модуль ${ await ask( 'app.export_title()' ) }` )

			for( const board of $bog_vmap_showcase_boards ) {

				if( board.gesture ) {
					await hand.click( `document.querySelector( '[bog_vmap_app_tool_board]' )`, 'кнопка «Артборд»' )
					await hand.drag(
						await screen( board.x, board.y ),
						await screen( board.x + board.width, board.y + board.height ),
					)
				} else {
					await act( `app.board_draw( ${ JSON.stringify({ x: board.x, y: board.y, width: board.width, height: board.height }) } ); return 1` )
				}

				const drawn = String( await ask( 'app.selected() ?? ""' ) )
				if( !drawn ) return $mol_fail( new Error( `артборд ${ board.name } не выделился после ${ board.gesture ? 'тяги' : 'board_draw' }` ) )

				await act( `app.node_title( ${ JSON.stringify( board.name ) } ); return 1` )
				await until( `!!${ pane }.part_size( ${ JSON.stringify( board.name ) } )`, 15000, `сцена не измерила артборд ${ board.name }` )

				const size = await box( board.name )
				if( size.width !== board.width || size.x !== board.x ) return $mol_fail( new Error(
					`артборд ${ board.name } лёг ${ JSON.stringify( size ) }, а тянули ${ JSON.stringify( board ) }`
				) )

				say( `${ board.gesture ? 'жестом' : 'портом board_draw' }: артборд ${ board.name } ${ size.width }×${ size.height } в ${ size.x }, ${ size.y }` )

			}

			await hand.click( `[ ... document.querySelectorAll( '[bog_vmap_app_left_tabs_option]' ) ].find( node => node.textContent.includes( 'Ассеты' ) )`, 'вкладка «Ассеты»' )
			await until( `${ app }.left_tab() === 'assets'`, 5000, 'вкладка «Ассеты» не открылась' )

			let gestured = 0

			for( const block of $bog_vmap_showcase_blocks() ) {

				await settle()

				const board = await box( block.board )
				const x = board.x + board.width / 2
				const y = board.y + board.height - 12
				const before = String( await ask( 'app.doc_source()' ) )

				if( block.gesture ) {
					const title = String( await ask( `app.Shelf().item( ${ JSON.stringify( block.shelf ) } )?.title ?? ''` ) )
					const row = await hand.spot(
						`[ ... document.querySelectorAll( '[bog_vmap_app_shelf_item_row]' ) ].find( node => node.textContent.trim() === ${ JSON.stringify( title ) } )`,
						`строка полки «${ title }»`,
					)
					await hand.drag( row, await screen( x, y ) )
					++ gestured
				} else {
					await act( `app.part_drop( ${ JSON.stringify( block.shelf ) }, ${ x }, ${ y } ); return 1` )
				}

				await until( `${ app }.doc_source() !== ${ JSON.stringify( before ) }`, 5000, `деталь ${ block.name } не легла в документ` )
				const dropped = String( await ask( 'app.selected() ?? ""' ) )

				await act( `app.node_title( ${ JSON.stringify( block.name ) } ); return 1` )
				const names = String( await ask( 'app.node().prop_names().join( " " )' ) ).split( ' ' )
				if( !names.includes( block.name ) ) return $mol_fail( new Error( `деталь ${ dropped } не переименовалась в ${ block.name }` ) )

				await until( `!!${ pane }.part_size( ${ JSON.stringify( block.name ) } )`, 15000, `сцена не измерила брошенную деталь ${ block.name }` )

				const order = JSON.parse( String( await ask( `JSON.stringify( app.node().sub_names( ${ JSON.stringify( block.board ) } ) ?? [] )` ) ) ) as string[]
				if( order[ order.length - 1 ] !== block.name ) return $mol_fail( new Error(
					`деталь ${ block.name } легла не последней в ${ block.board }: ${ order.join( ', ' ) }`
				) )

			}

			const blocks = $bog_vmap_showcase_blocks()
			say( `деталей ${ blocks.length }: жестом с полки ${ gestured } (${ blocks.filter( block => block.gesture ).map( block => block.name ).join( ', ' ) }), портом part_drop ${ blocks.length - gestured }` )

			await act( `app.selected( null ); app.code_js( ${ JSON.stringify( $bog_vmap_showcase_js ) } ); app.code_css( ${ JSON.stringify( $bog_vmap_showcase_css ) } ); return 1` )

			for( const block of blocks ) {
				if( !block.props.length ) continue
				await act( `app.selected( ${ JSON.stringify( block.name ) } ); app.node_source( ${ JSON.stringify( $bog_vmap_showcase_source( block ) ) } ); return 1` )
			}

			const tree2 = `$[ ${ JSON.stringify( d + 'mol_tree2' ) } ]`
			const cells = [] as { readonly part: string, readonly port: string, readonly value: $bog_vmap_showcase_value, readonly cell: string }[]

			for( const block of blocks ) {
				for( const [ sign, value ] of block.cells ) {

					const literal = typeof value === 'string' ? `${ tree2 }.data( ${ JSON.stringify( value ) } )` : `${ tree2 }.struct( ${ JSON.stringify( String( value ) ) } )`
					await act( `app.selected( ${ JSON.stringify( block.name ) } ); app.node_cell( ${ JSON.stringify( sign ) }, ${ literal } ); return 1` )

					const port = sign.replace( /\?$/, '' )
					const cell = String( await ask( `app.node().cell_of( ${ JSON.stringify( block.name ) }, ${ JSON.stringify( port ) } )` ) )
					if( !cell ) return $mol_fail( new Error( `node_cell не завёл ячейку корня за ${ block.name }.${ sign }: ${ await ask( `app.node_source()` ) }` ) )

					cells.push({ part: block.name, port, value, cell })

				}
			}

			await act( 'app.selected( null ); return 1' )
			say( `портом панели кода: тело корня ${ $bog_vmap_showcase_js.split( '\n' ).length } строк, стили ${ $bog_vmap_showcase_css.split( '\n' ).length } строк; портом node_source: подписи, ссылки и хуки ${ blocks.filter( block => block.props.length ).length } деталей; портом node_cell, как пишет инспектор: ячеек корня ${ cells.length } (${ cells.map( one => one.cell ).join( ', ' ) })` )

			for( const wire of $bog_vmap_showcase_wires ) {

				const count = Number( await ask( 'app.doc_wires().length' ) )

				if( wire.gesture ) {

					await until( `!!${ pane }.part_box( ${ JSON.stringify( wire.from ) } ) && !!${ pane }.part_box( ${ JSON.stringify( wire.to ) } )`, 15000, `концы провода ${ wire.from } → ${ wire.to } не измерены` )
					await settle()

					const from = await box( wire.from )
					const pick = await screen( from.x + from.width / 2, from.y + Math.min( from.height / 2, 12 ) )
					await hand.mouse( 'mouseMoved', pick )
					await hand.mouse( 'mousePressed', pick )
					await hand.mouse( 'mouseReleased', pick )
					if( await browser.until( `${ pane }.picked().join() === ${ JSON.stringify( wire.from ) }`, 5000 ) < 0 ) return $mol_fail( new Error(
						`клик в ${ pick.map( Math.round ) } не выделил ${ wire.from }: ${ await ask( `JSON.stringify({
							picked: app.Pane().picked(),
							inside: app.Pane().inside(),
							under: document.elementFromPoint( ${ pick[ 0 ] }, ${ pick[ 1 ] } )?.tagName,
							box: app.Pane().part_box( ${ JSON.stringify( wire.from ) } ),
							rect: app.Pane().pane_rect(),
							camera: [ app.Pane().camera_zoom(), app.Pane().camera_shift() ],
							order: app.node().sub_names( ${ JSON.stringify( $bog_vmap_showcase_blocks().find( block => block.name === wire.from )?.board ?? '' ) } ),
						})` ) }`
					) )

					const start = ( await dots() ).find( dot => dot.node === wire.from && dot.port === wire.from_prop && dot.side === 'out' )
					if( !start ) return $mol_fail( new Error( `у выделенного ${ wire.from } нет точки выхода ${ wire.from_prop }` ) )

					const shift = wire.bidi ? 8 : 0
					const to = await box( wire.to )
					const over = await screen( to.x + to.width / 2, to.y + Math.min( to.height / 2, 12 ) )

					await hand.mouse( 'mouseMoved', [ start.x, start.y ], false, shift )
					await hand.mouse( 'mousePressed', [ start.x, start.y ], false, shift )
					await hand.glide( [ start.x, start.y ], over, shift )

					const end = ( await dots() ).find( dot => dot.node === wire.to && dot.port === wire.to_prop && dot.side === 'in' )
					if( !end || !end.lit ) return $mol_fail( new Error( `во время тяги у ${ wire.to } нет горящей точки входа ${ wire.to_prop }: ${ JSON.stringify( end ) }` ) )

					await hand.glide( over, [ end.x, end.y ], shift, 4 )
					await hand.mouse( 'mouseReleased', [ end.x, end.y ], false, shift )

				} else {
					await act( `app.link_add( ${ JSON.stringify({ from: wire.from, from_prop: wire.from_prop, to: wire.to, to_prop: wire.to_prop, bidi: wire.bidi }) } ); return 1` )
				}

				await until( `${ app }.doc_wires().length > ${ count }`, 5000, `провод ${ wire.from }.${ wire.from_prop } → ${ wire.to }.${ wire.to_prop } не лёг` )

			}

			const links = JSON.parse( String( await ask( 'JSON.stringify( app.doc_wires() )' ) ) ) as ( $bog_vmap_showcase_wire & { readonly name: string } )[]

			for( const wire of $bog_vmap_showcase_wires ) {
				const found = links.find( link => link.from === wire.from && link.from_prop === wire.from_prop && link.to === wire.to && link.to_prop === wire.to_prop )
				if( !found ) return $mol_fail( new Error( `в документе нет провода ${ wire.from }.${ wire.from_prop } → ${ wire.to }.${ wire.to_prop }: ${ JSON.stringify( links ) }` ) )
				if( found.bidi !== wire.bidi ) return $mol_fail( new Error( `провод ${ wire.from } → ${ wire.to } ${ found.bidi ? 'двусторонний' : 'односторонний' }, а тянули ${ wire.bidi ? 'с Shift' : 'без Shift' }` ) )
			}

			const hands = $bog_vmap_showcase_wires.filter( wire => wire.gesture )
			say( `проводов ${ links.length }: жестом ${ hands.length } (${ hands.map( wire => `${ wire.from }.${ wire.from_prop } ${ wire.bidi ? '⇄' : '→' } ${ wire.to }.${ wire.to_prop }` ).join( ', ' ) }), портом link_add ${ links.length - hands.length }` )

			const alarm = String( await ask( 'app.error() ?? ""' ) )
			if( alarm ) return $mol_fail( new Error( `сцена жалуется на документ: ${ alarm }` ) )

			const frame = await $bog_vmap_showcase_frame( browser )
			if( !frame ) return $mol_fail( new Error( 'не нашёл сессию песочного кадра сцены' ) )

			const year = new Date().getFullYear()
			const want = $bog_vmap_showcase_expect( 6000000 )
			const expected = {
				Amount: '6000000', Amount_2: '6000000', Rate: '18', Years: '20', Rate_2: '6', Years_2: '20',
				months: '240', monthly: '0.015', months_2: '240', monthly_2: '0.005',
				end: String( year + 20 ), year: String( year ),
				payment: want.payment, overpay: want.overpay, verdict: want.verdict,
				debt: $bog_vmap_showcase_points, debt_2: $bog_vmap_showcase_points,
			}

			const read = $bog_vmap_showcase_read()
			const shown = await $bog_vmap_showcase_until( browser, $bog_vmap_showcase_matches( read, expected ), 30000, frame )
			const seen = JSON.parse( String( await browser.evaluate( read, 15000, frame ) ) ) as $bog_vmap_showcase_seen

			if( shown < 0 ) return $mol_fail( new Error(
				`превью в песочном кадре не сошлось за 30000 мс: ${ $bog_vmap_showcase_wrong( seen, expected ).join( '; ' ) }`
			) )

			say( `превью в песочном кадре за ${ shown } мс: Months ${ seen.months }, Monthly ${ seen.monthly }, End ${ seen.end }, платёж ${ seen.payment }, Amount_2 ${ seen.Amount_2 } по проводу ⇄, точек графиков ${ seen.debt } и ${ seen.debt_2 }` )

			await until( `${ app }.export_ready()`, 15000, 'кнопка «Скачать» не включилась' )

			await browser.send( 'Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: stage, eventsEnabled: true } )
			await hand.click( `document.querySelector( '[bog_vmap_app_download]' )`, 'кнопка «Скачать»' )

			const fetched = Date.now()
			while( !$node.fs.existsSync( zip ) && Date.now() - fetched < 30000 ) await $bog_probe_pause( 200 )
			if( !$node.fs.existsSync( zip ) ) return $mol_fail( new Error( `клик по «Скачать» не положил ${ zip } за 30000 мс` ) )

			const bytes = $node.fs.statSync( zip ).size
			say( `жестом: «Скачать» положил ${ $bog_vmap_showcase_zip } в каталог загрузок прогона, ${ bytes } байт за ${ Date.now() - fetched } мс` )

			const module = JSON.parse( String( await ask( 'JSON.stringify( app.export_state().module )' ) ) ) as {
				readonly path: string
				readonly files: readonly { readonly name: string, readonly text: string }[]
			}

			if( module.path !== $bog_vmap_showcase_module ) return $mol_fail( new Error( `модуль выгрузки ${ module.path }, а ждали ${ $bog_vmap_showcase_module }` ) )

			const unzip = $node[ 'child_process' ].spawnSync( 'unzip', [ '-o', zip, '-d', stage ], { encoding: 'utf8' } )
			if( unzip.status !== 0 ) return $mol_fail( new Error( `unzip не открыл архив: ${ unzip.stderr || unzip.error }` ) )

			const listed = [] as string[]
			const walk = ( dir: string, prefix: string )=> {
				for( const entry of $node.fs.readdirSync( dir, { withFileTypes: true } ) ) {
					const rel = prefix + entry.name
					if( entry.isDirectory() ) walk( String( $node.path.join( dir, entry.name ) ), rel + '/' )
					else listed.push( rel )
				}
			}
			walk( unpacked, '' )
			listed.sort()

			if( listed.join( '\n' ) !== $bog_vmap_showcase_files.join( '\n' ) ) return $mol_fail( new Error(
				`в архиве ${ listed.join( ', ' ) }, а ждали ${ $bog_vmap_showcase_files.join( ', ' ) }`
			) )

			for( const file of module.files ) {
				const text = String( $node.fs.readFileSync( $node.path.join( unpacked, file.name ), 'utf8' ) )
				if( text !== file.text ) return $mol_fail( new Error( `${ file.name } в архиве не равен выгрузке оболочки` ) )
			}

			const tree = String( $node.fs.readFileSync( $node.path.join( unpacked, 'mortgage.view.tree' ), 'utf8' ) )
			const code = String( $node.fs.readFileSync( $node.path.join( unpacked, 'mortgage.view.ts' ), 'utf8' ) )
			const page = String( $node.fs.readFileSync( $node.path.join( unpacked, 'index.html' ), 'utf8' ) )

			const router = $bog_vmap_showcase_root( 'app' )
			const missing = [
				[ tree, `${ router } ${ d }mol_view` ],
				[ tree, `Doc ${ root_class }` ],
				... $bog_vmap_showcase_hooks.map( hook => [ tree, `\t${ hook } null\n` ] ),
				... links.map( link => [ tree, link.bidi ? `${ link.to_prop }? <=> ${ link.name }?` : `${ link.to_prop } <= ${ link.name }` ] ),
				... cells.map( one => [ tree, `\n\t${ one.cell }? ${ typeof one.value === 'string' ? '\\' + one.value : String( one.value ) }\n` ] ),
				... cells.map( one => [ tree, `\t${ one.port }? <=> ${ one.cell }?\n` ] ),
				[ code, `case "Compare": return [ doc.Compare() ]` ],
				[ code, `default: return [ doc.Loan() ]` ],
				[ page, `mol_view_root="${ router }"` ],
			].filter( ( [ text, line ] )=> !text.includes( line ) ).map( ( [ , line ] )=> line )

			if( missing.length ) return $mol_fail( new Error( `в выгрузке нет: ${ missing.join( ' | ' ) }` ) )

			say( `архив цел: unzip открыл ${ listed.length } файлов, байт в байт равны выгрузке оболочки; роутер ${ router }, хуков ${ $bog_vmap_showcase_hooks.length }, проводов ${ links.length }, ячеек корня ${ cells.length }` )

			const shelf_zip = String( $node.path.join( out, $bog_vmap_showcase_zip ) )
			const shelf_module = String( $node.path.join( out, $bog_vmap_showcase_module ) )

			$node.fs.mkdirSync( out, { recursive: true } )
			$node.fs.rmSync( shelf_zip, { force: true } )
			$node.fs.rmSync( String( $node.path.join( out, top ) ), { recursive: true, force: true } )
			$node.fs.cpSync( zip, shelf_zip )
			$node.fs.cpSync( String( $node.path.join( stage, top ) ), String( $node.path.join( out, top ) ), { recursive: true } )

			say( `архив ${ shelf_zip }, модуль ${ shelf_module }` )
			say( `${ $bog_vmap_showcase_ok } за ${ Date.now() - began } мс; собрать: cp -R ${ shelf_module } ${ $bog_vmap_showcase_module } && npx mam ${ $bog_vmap_showcase_module }` )

			return lines.join( '\n' )

		} finally {
			browser.close()
			site.close()
			try { $node.fs.rmSync( profile, { recursive: true, force: true } ) } catch( error ) {}
			try { $node.fs.rmSync( stage, { recursive: true, force: true } ) } catch( error ) {}
		}

	}

	export async function $bog_vmap_showcase_site( root = String( $node.process.cwd() ) ) {

		const lines = [] as string[]
		const say = ( line: string )=> { lines.push( line ); $node.fs.writeSync( 1, 'сайт: ' + line + '\n' ) }

		const built = `${ $bog_vmap_showcase_module }/-`

		for( const rel of [ `${ built }/index.html`, `${ built }/web.js` ] ) {
			if( $node.fs.existsSync( $node.path.join( root, rel ) ) ) continue
			return $mol_fail( new Error( `нет ${ rel }: сперва положи выгрузку в ${ $bog_vmap_showcase_module } и собери npx mam ${ $bog_vmap_showcase_module }` ) )
		}

		const bin = $bog_probe_chrome_bin()
		if( !bin ) { say( $bog_probe_skip ); return lines.join( '\n' ) }

		const site = await new $bog_probe_static( root ).open()
		const profile = String( $node.fs.mkdtempSync( $node.path.join( $node.os.tmpdir(), 'vmap-showcase-site-' ) ) )
		const browser = new $bog_probe_browser( bin, profile )

		const attr = $bog_vmap_showcase_attr
		const read = $bog_vmap_showcase_read()
		const seen = async ()=> JSON.parse( String( await browser.evaluate( read, 15000 ) ) ) as $bog_vmap_showcase_seen

		const expect = async ( want: $bog_vmap_showcase_seen, note: string )=> {
			const waited = await browser.until( $bog_vmap_showcase_matches( read, want ), 10000 )
			if( waited < 0 ) return $mol_fail( new Error( `${ note }: ${ $bog_vmap_showcase_wrong( await seen(), want ).join( '; ' ) }` ) )
			return waited
		}

		const shown = ( page: string )=> `!!document.querySelector( ${ JSON.stringify( attr( page ) ) } )`
		const phrase = async ( name: string )=> String( await browser.evaluate(
			`return ( document.querySelector( ${ JSON.stringify( attr( name ) ) } )?.textContent ?? '' ).replace( /\\s+/g, ' ' )`, 15000,
		) )

		try {

			await browser.open()
			await browser.viewport( 1280, 900 )

			const began = Date.now()
			const warm = await browser.open_page( site.uri( `${ built }/index.html` ), `typeof $ !== 'undefined' && ${ shown( 'Payment' ) }`, 30000 )
			say( `страница ${ built }/index.html за ${ warm } мс` )

			const hand = $bog_vmap_showcase_hand( browser )
			const year = new Date().getFullYear()

			const six = $bog_vmap_showcase_expect( 6000000 )
			await expect( {
				Amount: '6000000', Rate: '18', Years: '20', months: '240', monthly: '0.015',
				end: String( year + 20 ), year: String( year ),
				payment: six.payment, overpay: six.overpay, debt: $bog_vmap_showcase_points,
			}, 'первая страница без правок считает не то' )
			if( await browser.evaluate( `return ${ shown( 'Compare' ) }`, 15000 ) ) return $mol_fail( new Error( 'без адреса страницы открылись обе страницы' ) )
			say( `без адреса открыта Loan: «${ await phrase( 'Payment' ) }», «${ await phrase( 'Overpay' ) }», Months 240, End ${ year + 20 }` )

			const five = $bog_vmap_showcase_expect( 5000000 )
			await hand.type( `document.querySelector( ${ JSON.stringify( attr( 'Amount' ) + ' input' ) } )`, 'поле суммы', '5000000' )
			const typed = await expect( { Amount: '5000000', payment: five.payment, overpay: five.overpay }, 'набранная сумма не пересчитала платёж' )
			say( `набор 5000000 в поле суммы пересчитал за ${ typed } мс: «${ await phrase( 'Payment' ) }»` )

			await hand.click( `document.querySelector( ${ JSON.stringify( attr( 'Next' ) ) } )`, 'ссылка на сравнение' )
			const moved = await browser.until( `${ shown( 'Compare' ) } && !${ shown( 'Loan' ) } && location.hash.includes( 'page=Compare' )`, 10000 )
			if( moved < 0 ) return $mol_fail( new Error( `клик по ссылке не открыл Compare: ${ await browser.evaluate( 'return location.hash', 15000 ) }` ) )

			await expect( { Amount_2: '5000000', Rate_2: '6', Years_2: '20', months_2: '240', monthly_2: '0.005', verdict: five.verdict, debt_2: $bog_vmap_showcase_points }, 'на второй странице сумма не та, что набрана на первой' )
			say( `ссылка открыла Compare за ${ moved } мс, сумма 5000000 доехала проводом ⇄: «${ await phrase( 'Verdict' ) }»` )

			const four = $bog_vmap_showcase_expect( 4000000 )
			await hand.type( `document.querySelector( ${ JSON.stringify( attr( 'Amount_2' ) + ' input' ) } )`, 'поле суммы второй страницы', '4000000' )
			await expect( { Amount_2: '4000000', verdict: four.verdict }, 'правка суммы на второй странице не пересчитала итог' )

			await hand.click( `document.querySelector( ${ JSON.stringify( attr( 'Back' ) ) } )`, 'ссылка назад' )
			const back = await browser.until( `${ shown( 'Loan' ) } && !${ shown( 'Compare' ) } && location.hash.includes( 'page=Loan' )`, 10000 )
			if( back < 0 ) return $mol_fail( new Error( `клик по ссылке назад не открыл Loan: ${ await browser.evaluate( 'return location.hash', 15000 ) }` ) )

			await expect( { Amount: '4000000', payment: four.payment }, 'правка на второй странице не вернулась проводом ⇄ на первую' )
			say( `правка 4000000 на Compare вернулась на Loan по проводу ⇄: «${ await phrase( 'Payment' ) }»` )

			const halved = $bog_vmap_showcase_expect( 4000000, 600 )
			await hand.type( `document.querySelector( ${ JSON.stringify( attr( 'Monthly' ) + ' [bog_vmap_part_calc_right] input' ) } )`, 'правое поле калькулятора ставки', '600' )
			await expect( { monthly: '0.03', payment: halved.payment }, 'набор в правое поле калькулятора «ставка ÷ 1200» не пересчитал платёж' )
			say( `набор 600 в правое поле калькулятора «ставка ÷ 1200» дал 0.03 в месяц и «${ await phrase( 'Payment' ) }»` )

			say( `${ $bog_vmap_showcase_site_ok } за ${ Date.now() - began } мс` )

			return lines.join( '\n' )

		} finally {
			browser.close()
			site.close()
			try { $node.fs.rmSync( profile, { recursive: true, force: true } ) } catch( error ) {}
		}

	}

}
