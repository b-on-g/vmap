namespace $ {

	const d = '$'

	const scene_title = 'Ипотека'

	const scene_building = 'Ипотека (собирается)'

	const scene_limit = 60000

	const scene_root = d + 'bog_mortgage'

	const scene_tree = [
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

	function complete( text: string ) {
		if( !text ) return false

		const have = $bog_vmap_lang_node.make({ source: ()=> text })
		const want = $bog_vmap_lang_node.make({ source: ()=> scene_tree })

		return $mol_compare_deep( [ ... have.prop_names() ].sort(), [ ... want.prop_names() ].sort() )
			&& [ '', ... want.sub_names() ?? [] ].every( owner => $mol_compare_deep( have.sub_names( owner ), want.sub_names( owner ) ) )
			&& have.links().length === want.links().length
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

		const store = app.store()

		const pause = ( ms: number )=> app.$.$mol_wait_timeout_async( ms )

		const until = async ( check: ()=> boolean, limit: number, note: string )=> {
			const started = Date.now()
			while( !seen( check ) ) {
				if( Date.now() - started > limit ) $mol_fail( new Error( `${ note } за ${ limit } мс` ) )
				await pause( 200 )
			}
		}

		await until( ()=> app.doc_key() !== '', 600000, 'документ редактора не открылся' )

		const found = await ask( ()=> store.doc_links()
			.filter( link => [ scene_title, scene_building ].includes( store.doc( link ).title() ) )
			.map( link => ({
				link,
				whole: store.doc( link ).title() === scene_title && complete( store.doc_source( store.doc( link ) ) ),
			}) )
		)

		const broken = found.filter( one => !one.whole ).map( one => one.link )
		if( broken.length ) await ask( ()=> { for( const link of broken ) store.home().Docs( null )!.cut( link ) } )

		if( found.some( one => one.whole ) ) return

		const link = ( await $mol_wire_async( store ).doc_add( scene_building ) ).link()
		await until( ()=> store.doc_current()?.title() === scene_building, scene_limit, `сцена «${ scene_building }» не стала текущей` )

		const whole = await ask( ()=> app.code_whole() )
		await ask( ()=> { app.selected( null ); app.code_whole( true ); app.code_source( scene_tree ) } )
		await ask( ()=> { app.code_js( body ); app.code_css( style ); app.code_whole( whole ) } )

		if( await ask( ()=> app.doc_root() ) !== scene_root ) $mol_fail( new Error( 'корень не принял имя модуля' ) )
		if( !await ask( ()=> complete( app.doc_src() ) ) ) $mol_fail( new Error( `документ сцены «${ scene_building }» записался не целиком` ) )

		await ask( ()=> store.doc( link ).title( scene_title ) )
		await ask( ()=> app.camera_reset() )

	}

	$mol_test({

		'the editor on its own page writes the mortgage scene as one whole class, and only once'() {
			const app = $mol_view.roots().find( ( view ): view is $$.$bog_vmap_app => view instanceof $$.$bog_vmap_app )
			if( app ) mortgage( app ).catch( $mol_fail_log )
		},

	})

}
