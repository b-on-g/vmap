namespace $ {

	export const $bog_vmap_smoke_skip = 'Chrome не найден, дымовой тест пропущен'

	export const $bog_vmap_smoke_parts = [
		'app/-/index.html',
		'app/-/web.js',
		'scene/-/web.js',
		'part/-/web.js',
		'part/-/web.view.tree',
	]

	export async function $bog_vmap_smoke_check( root = String( $node.path.resolve( 'bog/vmap' ) ) ) {

		const d = '$'
		const lines = [] as string[]
		const say = ( line: string )=> { lines.push( line ); $node.fs.writeSync( 1, 'дым: ' + line + '\n' ) }

		for( const rel of $bog_vmap_smoke_parts ) {
			if( $node.fs.existsSync( $node.path.join( root, rel ) ) ) continue
			return $mol_fail( new Error( `нет bog/vmap/${ rel }, сперва собери app, scene и part` ) )
		}

		const bin = $bog_probe_chrome_bin()

		if( !bin ) { say( $bog_vmap_smoke_skip ); return lines.join( '\n' ) }

		say( 'браузер ' + bin )

		const site = await new $bog_probe_static( root ).open()
		const profile = String( $node.fs.mkdtempSync( $node.path.join( $node.os.tmpdir(), 'vmap-smoke-' ) ) )
		const browser = new $bog_probe_browser( bin, profile )

		const app = `$[ ${ JSON.stringify( d + 'bog_vmap_app' ) } ].Root( 0 )`
		const pane = `${ app }.Pane()`
		const warmed = `(()=>{ try { return ${ pane }.warmed() } catch( error ) { return false } })()`
		const ready = `(()=>{ try { return ${ pane }.warmed() && ${ app }.doc_key() !== '' } catch( error ) { return false } })()`

		try {

			await browser.open()

			const began = Date.now()
			const warm = await browser.open_page( site.uri( '/app/-/index.html' ), ready, 120000 )

			say( `прогрев и документ ${ warm } мс, порт статики ${ site.port }` )

			const before = Number( await browser.evaluate( `return Object.keys( ${ pane }.sizes() ).length`, 15000 ) )

			await browser.evaluate(
				`await $[ ${ JSON.stringify( d + 'mol_wire_async' ) } ]( ${ app } ).part_drop( ${ JSON.stringify( d + 'bog_vmap_part_calc' ) }, 320, 220 ); return 1`,
				30000,
			)

			const part = `${ pane }.sizes()[ ${ app }.doc_root() + '/' + ${ app }.selected() ]`
			const measured = await browser.until( `${ part }.width > 0 && ${ part }.height > 0`, 30000 )

			const after = Number( await browser.evaluate( `return Object.keys( ${ pane }.sizes() ).length`, 15000 ) )
			const name = String( await browser.evaluate( `return ${ app }.selected() || ''`, 15000 ) )
			const source = String( await browser.evaluate( `return ${ app }.doc_source()`, 15000 ) )

			if( !name ) return $mol_fail( new Error( 'брошенная деталь не выделилась' ) )
			if( !source.includes( 'bog_vmap_part_calc' ) ) return $mol_fail( new Error( 'деталь не попала в документ' ) )

			const box = String( await browser.evaluate( `return JSON.stringify( ${ part } ?? null )`, 15000 ) )

			const rect = JSON.parse( box ) as { readonly width?: number, readonly height?: number } | null
			if( measured < 0 || !rect || !Number( rect.width ) || !Number( rect.height ) )
				return $mol_fail( new Error( `у брошенной детали нет размеров за 30000 мс: ${ box }, узлов ${ before } → ${ after }` ) )

			say( `бросок детали: узлов ${ before } → ${ after }, размер детали за ${ measured } мс, ${ name } ${ rect.width }×${ rect.height }` )

			await browser.evaluate( `${ pane }.picked([ ${ JSON.stringify( name ) } ]); ${ pane }.entered( ${ JSON.stringify( name ) } ); return 1`, 15000 )

			const entered = await browser.until( `${ pane }.inside()`, 15000 )
			if( entered < 0 ) return $mol_fail( new Error( 'вход в деталь не состоялся' ) )

			await browser.press( 'Escape', 27 )

			const left = await browser.until( `${ pane }.inside() === false`, 15000 )
			if( left < 0 ) return $mol_fail( new Error( 'Esc не вывел из детали' ) )

			say( `вход в деталь ${ entered } мс, выход по Esc ${ left } мс` )

			const wedge = d + 'smoke_wedge'
			const view = d + 'mol_view'

			await browser.evaluate( `
				const ns = $[ ${ JSON.stringify( d + 'bog_vmap_bridge_ns' ) } ]
				const peer = ${ pane }.scene_peer()
				const root = ${ JSON.stringify( wedge ) }
				peer.postMessage({
					ns,
					kind: 'doc_set',
					root,
					src: root + ' ' + ${ JSON.stringify( view ) } + '\\n\\tsub /\\n\\t\\t<= wedge \\\\\\n',
					js: { [ root ]: 'wedge() { for( ;; ) {} }' },
				}, '*' )
				return 1
			`, 15000 )

			const stalled = await browser.until( `${ pane }.stalled()`, 60000 )
			if( stalled < 0 ) return $mol_fail( new Error( 'подвешенная сцена не признана мёртвой за 60000 мс' ) )

			const generation = Number( await browser.evaluate( `return ${ pane }.scene_generation()`, 15000 ) )

			await browser.evaluate( `${ app }.scene_restart(); return 1`, 15000 )

			const back = await browser.until(
				`${ pane }.scene_generation() > ${ generation } && ${ pane }.stalled() === false && ${ warmed }`,
				120000,
			)
			if( back < 0 ) return $mol_fail( new Error( 'сцена не вернулась после одного нажатия' ) )

			say( `зависание замечено за ${ stalled } мс, перезапуск одним нажатием ${ back } мс` )

			const kept = String( await browser.evaluate( `return ${ app }.doc_source()`, 15000 ) )
			if( !kept.includes( 'bog_vmap_part_calc' ) ) return $mol_fail( new Error( 'после перезапуска документ потерял деталь' ) )

			const nodes = Number( await browser.evaluate( `return Object.keys( ${ pane }.sizes() ).length`, 15000 ) )
			say( `документ цел, узлов ${ nodes }, весь прогон ${ Date.now() - began } мс` )

			return lines.join( '\n' )

		} finally {
			browser.close()
			site.close()
			try { $node.fs.rmSync( profile, { recursive: true, force: true } ) } catch( error ) {}
		}

	}

}
