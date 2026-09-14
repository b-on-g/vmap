namespace $ {

	const d = '$'

	const scene_title = 'Ипотека'

	type value = string | number | boolean

	type part = {
		readonly name: string
		readonly board: string
		readonly shelf: string
		readonly klass: string
		readonly props: readonly string[]
		readonly cells: readonly ( readonly [ string, value ] )[]
	}

	const boards = [
		{ name: 'Loan', x: 40, y: 40, width: 480, height: 720 },
		{ name: 'Compare', x: 600, y: 40, width: 480, height: 720 },
	]

	function parts(): readonly part[] {

		const mol = ( name: string )=> d + 'mol_' + name
		const kit = ( name: string )=> d + 'bog_vmap_part_' + name

		const number = { shelf: 'input_number', klass: mol( 'number' ) }
		const paragraph = { shelf: 'input_paragraph', klass: mol( 'paragraph' ) }
		const link = { shelf: mol( 'link' ), klass: mol( 'link' ) }
		const calc = { shelf: 'calc', klass: kit( 'calc' ) }
		const plot = { shelf: 'plot', klass: kit( 'plot' ) }
		const cell = { shelf: 'cell', klass: kit( 'cell' ) }

		const part = (
			kind: { readonly shelf: string, readonly klass: string },
			name: string,
			board: string,
			props: readonly string[],
			cells: readonly ( readonly [ string, value ] )[] = [],
		)=> ({ ... kind, name, board, props, cells })

		return [
			part(paragraph, 'Title', 'Loan', [ 'title \\Ипотека: платёж и переплата' ] ),
			part(number, 'Amount', 'Loan', [ 'hint \\Сумма кредита, ₽' ], [ [ 'value?', 6000000 ] ] ),
			part(number, 'Rate', 'Loan', [ 'hint \\Ставка, % годовых' ], [ [ 'value?', 18 ] ] ),
			part(number, 'Years', 'Loan', [ 'hint \\Срок, лет' ], [ [ 'value?', 20 ] ] ),
			part(calc, 'Monthly', 'Loan', [], [ [ 'right?', 1200 ], [ 'op?', 'div' ] ] ),
			part(calc, 'Months', 'Loan', [], [ [ 'right?', 12 ], [ 'op?', 'mul' ] ] ),
			part(paragraph, 'Payment', 'Loan', [ 'title <= payment' ] ),
			part(paragraph, 'Overpay', 'Loan', [ 'title <= overpay' ] ),
			part(plot, 'Debt', 'Loan', [ 'title \\Остаток долга по годам, ₽', 'values <= balance' ] ),
			part(cell, 'Year', 'Loan', [], [ [ 'code?', 'return new Date().getFullYear()' ], [ 'auto?', true ] ] ),
			part(calc, 'End', 'Loan', [], [ [ 'op?', 'add' ] ] ),
			part(link, 'Next', 'Loan', [ 'title \\Сравнить с другим вариантом →', 'arg *', '\tpage \\Compare' ] ),
			part(paragraph, 'Title_2', 'Compare', [ 'title \\Сравнение: другая ставка или срок' ] ),
			part(number, 'Amount_2', 'Compare', [ 'hint \\Сумма кредита, ₽' ] ),
			part(number, 'Rate_2', 'Compare', [ 'hint \\Ставка, % годовых' ], [ [ 'value?', 6 ] ] ),
			part(number, 'Years_2', 'Compare', [ 'hint \\Срок, лет' ], [ [ 'value?', 20 ] ] ),
			part(calc, 'Monthly_2', 'Compare', [], [ [ 'right?', 1200 ], [ 'op?', 'div' ] ] ),
			part(calc, 'Months_2', 'Compare', [], [ [ 'right?', 12 ], [ 'op?', 'mul' ] ] ),
			part(paragraph, 'Verdict', 'Compare', [ 'title <= verdict' ] ),
			part(plot, 'Debt_2', 'Compare', [ 'title \\Остаток долга, второй вариант, ₽', 'values <= balance_2' ] ),
			part(link, 'Back', 'Compare', [ 'title \\← К расчёту', 'arg *', '\tpage \\Loan' ] ),
		]
	}

	const wires = [
		{ from: 'Rate', from_prop: 'value', to: 'Monthly', to_prop: 'left', bidi: false },
		{ from: 'Years', from_prop: 'value', to: 'Months', to_prop: 'left', bidi: true },
		{ from: 'Years', from_prop: 'value', to: 'End', to_prop: 'right', bidi: false },
		{ from: 'Year', from_prop: 'result_number', to: 'End', to_prop: 'left', bidi: false },
		{ from: 'Rate_2', from_prop: 'value', to: 'Monthly_2', to_prop: 'left', bidi: false },
		{ from: 'Years_2', from_prop: 'value', to: 'Months_2', to_prop: 'left', bidi: false },
		{ from: 'Amount', from_prop: 'value', to: 'Amount_2', to_prop: 'value', bidi: true },
	]

	const body = [
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

	const style = [
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

	function source( one: part ) {
		return `${ one.name } ${ one.klass }\n` + one.props.map( line => `\t${ line }\n` ).join( '' )
	}

	function literal( one: value ) {
		return typeof one === 'string' ? $mol_tree2.data( one ) : $mol_tree2.struct( String( one ) )
	}

	function ask< Result >( task: ()=> Result ) {
		return $mol_wire_async( task )()
	}

	function seen( check: ()=> boolean ) {
		try {
			return check()
		} catch( error ) {
			if( $mol_promise_like( error ) ) return false
			return $mol_fail_hidden( error )
		}
	}

	async function mortgage( app: $$.$bog_vmap_app ) {

		const pane = app.Pane() as $$.$bog_vmap_app_pane
		const store = app.store()

		const pause = ( ms: number )=> app.$.$mol_wait_timeout_async( ms )

		const until = async ( check: ()=> boolean, limit: number, note: string )=> {
			const started = Date.now()
			while( !seen( check ) ) {
				if( Date.now() - started > limit ) $mol_fail( new Error( `${ note } за ${ limit } мс` ) )
				await pause( 200 )
			}
		}

		const settle = async ()=> {
			let last = ''
			const started = Date.now()
			while( Date.now() - started < 10000 ) {
				const now = JSON.stringify( await ask( ()=> pane.sizes() ) )
				if( now === last ) return
				last = now
				await pause( 400 )
			}
			$mol_fail( new Error( 'размеры узлов сцены не устоялись за 10000 мс' ) )
		}

		const measured = async ( name: string )=> {
			await until( ()=> Boolean( pane.part_size( name ) ), 15000, `сцена не измерила ${ name }` )
			return ( await ask( ()=> pane.part_size( name ) ) )!
		}

		await until( ()=> pane.warmed() && app.doc_key() !== '', 600000, 'сцена не прогрелась или документ не открылся' )

		const titles = await ask( ()=> store.doc_links().map( link => store.doc( link ).title() ) )
		if( titles.includes( scene_title ) ) return

		await $mol_wire_async( store ).doc_add( scene_title )
		await until( ()=> store.doc_current()?.title() === scene_title, 15000, `сцена «${ scene_title }» не стала текущей` )

		const root = d + 'bog_mortgage'
		await ask( ()=> { app.root_draft( root ); app.root_submit() } )
		if( await ask( ()=> app.doc_root() ) !== root ) $mol_fail( new Error( 'корень не принял имя модуля' ) )

		for( const board of boards ) {

			const named = await ask( ()=> {
				app.board_draw({ x: board.x, y: board.y, width: board.width, height: board.height })
				return app.node_title( board.name )
			} )
			if( named !== board.name ) $mol_fail( new Error( `артборд не назвался ${ board.name }` ) )

			const size = await measured( board.name )
			if( size.width !== board.width || size.x !== board.x ) $mol_fail( new Error( `артборд ${ board.name } лёг ${ JSON.stringify( size ) }` ) )

		}

		for( const part of parts() ) {

			await settle()

			const board = await measured( part.board )

			const named = await ask( ()=> {
				const before = app.node().prop_names().length
				app.part_drop( part.shelf, board.x + board.width / 2, board.y + board.height - 12 )
				if( app.node().prop_names().length === before ) $mol_fail( new Error( `деталь ${ part.name } не легла в документ` ) )
				return app.node_title( part.name )
			} )
			if( named !== part.name ) $mol_fail( new Error( `деталь не назвалась ${ part.name }` ) )

			await measured( part.name )

			const order = await ask( ()=> app.node().sub_names( part.board ) ?? [] )
			if( order.at( -1 ) !== part.name ) $mol_fail( new Error( `деталь ${ part.name } легла не последней в ${ part.board }: ${ order.join( ', ' ) }` ) )

		}

		await ask( ()=> { app.selected( null ); app.code_js( body ); app.code_css( style ) } )

		for( const part of parts() ) {
			if( part.props.length ) await ask( ()=> { app.selected( part.name ); app.node_source( source( part ) ) } )
		}

		for( const part of parts() ) {
			for( const [ sign, one ] of part.cells ) {
				const port = sign.replace( /\?$/, '' )
				const cell = await ask( ()=> {
					app.selected( part.name )
					app.node_cell( sign, literal( one ) )
					return app.node().cell_of( part.name, port )
				} )
				if( !cell ) $mol_fail( new Error( `нет ячейки корня за ${ part.name }.${ port }` ) )
			}
		}

		for( const wire of wires ) {
			const laid = await ask( ()=> {
				app.selected( null )
				const count = app.doc_wires().length
				app.link_add( wire )
				return app.doc_wires().length > count
			} )
			if( !laid ) $mol_fail( new Error( `провод ${ wire.from }.${ wire.from_prop } к ${ wire.to }.${ wire.to_prop } не лёг` ) )
		}

		await ask( ()=> app.camera_reset() )

		const alarm = await ask( ()=> app.error() )
		if( alarm ) $mol_fail( new Error( `сцена жалуется на документ: ${ alarm }` ) )

	}

	$mol_test({

		'the editor on its own page lays out the mortgage scene from blocks, and only once'() {
			const app = $mol_view.roots().find( ( view ): view is $$.$bog_vmap_app => view instanceof $$.$bog_vmap_app )
			if( app ) mortgage( app ).catch( $mol_fail_log )
		},

	})

}
