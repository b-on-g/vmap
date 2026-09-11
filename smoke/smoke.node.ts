namespace $ {

	export type $bog_vmap_smoke_message = {
		readonly id?: number
		readonly method?: string
		readonly sessionId?: string
		readonly params?: { readonly [ key: string ]: unknown }
		readonly result?: { readonly [ key: string ]: unknown }
	}

	export function $bog_vmap_smoke_pause( ms: number ) {
		return new Promise< void >( done => setTimeout( done, ms ) )
	}

	export function $bog_vmap_smoke_dig( source: unknown, ... path: readonly string[] ): unknown {
		let node: unknown = source
		for( const step of path ) {
			if( !node || typeof node !== 'object' ) return undefined
			node = ( node as { readonly [ key: string ]: unknown } )[ step ]
		}
		return node
	}

	export function $bog_vmap_smoke_chrome_bin() {

		const env = $node.process.env

		const listed = [
			env[ 'CHROME_BIN' ],
			env[ 'CHROME_PATH' ],
			'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
			'/Applications/Chromium.app/Contents/MacOS/Chromium',
			'/usr/bin/google-chrome',
			'/usr/bin/google-chrome-stable',
			'/usr/bin/chromium',
			'/usr/bin/chromium-browser',
			'/opt/google/chrome/chrome',
		]

		for( const bin of listed ) {
			if( bin && $node.fs.existsSync( bin ) ) return String( bin )
		}

		for( const name of [ 'google-chrome', 'google-chrome-stable', 'chromium', 'chrome' ] ) {
			const found = $node.child_process.spawnSync( 'command', [ '-v', name ], { encoding: 'utf8', shell: true } )
			const bin = String( found.stdout ?? '' ).trim().split( '\n' )[ 0 ] ?? ''
			if( bin && $node.fs.existsSync( bin ) ) return bin
		}

		return ''
	}

	export const $bog_vmap_smoke_types: { readonly [ ext: string ]: string } = {
		'.html': 'text/html; charset=utf-8',
		'.js': 'text/javascript; charset=utf-8',
		'.mjs': 'text/javascript; charset=utf-8',
		'.css': 'text/css; charset=utf-8',
		'.json': 'application/json; charset=utf-8',
		'.tree': 'text/plain; charset=utf-8',
		'.map': 'application/json; charset=utf-8',
	}

	export class $bog_vmap_smoke_static {

		port = 0
		server

		constructor( readonly root: string ) {

			this.server = $node.http.createServer( ( req: { readonly url: string }, res: {
				writeHead( code: number, headers?: object ): void
				end( body?: unknown ): void
			} )=> {

				const rel = decodeURIComponent( String( req.url ).split( '?' )[ 0 ] ?? '' )
				const file = String( $node.path.join( this.root, rel ) )

				if( !file.startsWith( this.root ) ) { res.writeHead( 403 ); res.end(); return }

				$node.fs.readFile( file, ( error: unknown, data: unknown )=> {
					if( error ) { res.writeHead( 404 ); res.end( 'нет ' + rel ); return }
					res.writeHead( 200, {
						'content-type': $bog_vmap_smoke_types[ String( $node.path.extname( file ) ) ] ?? 'application/octet-stream',
					} )
					res.end( data )
				} )

			} )

		}

		async open() {
			await new Promise< void >( done => this.server.listen( 0, '127.0.0.1', done ) )
			this.port = Number( this.server.address().port )
			return this
		}

		close() {
			this.server.close()
		}

		uri( path: string ) {
			return `http://127.0.0.1:${ this.port }${ path }`
		}

	}

	export class $bog_vmap_smoke_browser {

		child: { kill( signal?: string ): void } | null = null
		socket: WebSocket | null = null
		seq = 0
		waits = new Map< number, ( reply: $bog_vmap_smoke_message )=> void >()
		fails = new Map< number, ( error: Error )=> void >()
		frames = new Set< string >()
		page = ''
		target = ''
		dropped = ''

		constructor( readonly bin: string, readonly profile: string ) {}

		async open() {

			this.child = $node.child_process.spawn( this.bin, [
				'--headless=new',
				'--remote-debugging-port=0',
				`--user-data-dir=${ this.profile }`,
				'--no-first-run',
				'--no-default-browser-check',
				'--no-sandbox',
				'--disable-dev-shm-usage',
				'--disable-gpu',
				'--disable-extensions',
				'--window-size=1400,900',
				'about:blank',
			], { stdio: 'ignore' } )

			const port = await this.port_of( String( $node.path.join( this.profile, 'DevToolsActivePort' ) ) )

			const version = await ( await fetch( `http://127.0.0.1:${ port }/json/version` ) ).json()
			const socket = new WebSocket( String( version.webSocketDebuggerUrl ) )
			this.socket = socket

			await new Promise< void >( done => { socket.onopen = ()=> done() } )

			socket.onmessage = event => this.accept( JSON.parse( String( event.data ) ) )
			socket.onclose = ()=> this.drop( 'сокет отладки закрыт' )

			const made = await this.send( 'Target.createTarget', { url: 'about:blank' } )
			this.target = String( $bog_vmap_smoke_dig( made, 'result', 'targetId' ) )

			const bound = await this.send( 'Target.attachToTarget', { targetId: this.target, flatten: true } )
			this.page = String( $bog_vmap_smoke_dig( bound, 'result', 'sessionId' ) )

			await this.send( 'Page.enable', {}, this.page )
			await this.send( 'Runtime.enable', {}, this.page )
			await this.send( 'Target.setAutoAttach', {
				autoAttach: true, waitForDebuggerOnStart: false, flatten: true,
			}, this.page )

			return this
		}

		async port_of( stamp: string ) {

			const started = Date.now()

			while( Date.now() - started < 30000 ) {
				if( $node.fs.existsSync( stamp ) ) {
					const line = String( $node.fs.readFileSync( stamp, 'utf8' ) ).split( '\n' )[ 0 ] ?? ''
					if( line.trim() ) return Number( line.trim() )
				}
				await $bog_vmap_smoke_pause( 200 )
			}

			return $mol_fail( new Error( `Chrome не отдал порт отладки за ${ Date.now() - started } мс` ) )
		}

		accept( reply: $bog_vmap_smoke_message ) {

			const id = reply.id

			if( id && this.waits.has( id ) ) {
				const done = this.waits.get( id )!
				this.waits.delete( id )
				this.fails.delete( id )
				done( reply )
				return
			}

			if( reply.method === 'Target.attachedToTarget' ) {
				const session = String( $bog_vmap_smoke_dig( reply, 'params', 'sessionId' ) )
				this.frames.add( session )
				this.send( 'Runtime.enable', {}, session )
				this.send( 'Target.setAutoAttach', {
					autoAttach: true, waitForDebuggerOnStart: false, flatten: true,
				}, session )
				this.send( 'Runtime.runIfWaitingForDebugger', {}, session )
			}

			if( reply.method === 'Target.detachedFromTarget' ) {
				this.frames.delete( String( $bog_vmap_smoke_dig( reply, 'params', 'sessionId' ) ) )
			}

		}

		drop( reason: string ) {
			this.dropped = reason
			const fails = [ ... this.fails.values() ]
			this.waits.clear()
			this.fails.clear()
			for( const fail of fails ) fail( new Error( reason ) )
		}

		send( method: string, params: object = {}, session = '' ) {

			const socket = this.socket
			if( !socket ) return Promise.reject( new Error( 'Браузер не открыт' ) )
			if( this.dropped ) return Promise.reject( new Error( this.dropped ) )

			const id = ++ this.seq

			return new Promise< $bog_vmap_smoke_message >( ( done, fail )=> {
				this.waits.set( id, done )
				this.fails.set( id, fail )
				socket.send( JSON.stringify( session ? { id, method, params, sessionId: session } : { id, method, params } ) )
			} )

		}

		async evaluate( code: string, limit: number, session = this.page ) {

			const asked = this.send( 'Runtime.evaluate', {
				expression: `(async()=>{ ${ code } })()`,
				awaitPromise: true,
				returnByValue: true,
			}, session )

			const late = $bog_vmap_smoke_pause( limit ).then(
				()=> $mol_fail( new Error( `Страница не ответила за ${ limit } мс` ) )
			)

			const reply = await Promise.race([ asked, late ])

			const wrong = $bog_vmap_smoke_dig( reply, 'result', 'exceptionDetails' )

			if( wrong ) return $mol_fail( new Error( 'Страница бросила: ' + String(
				$bog_vmap_smoke_dig( wrong, 'exception', 'description' ) ?? $bog_vmap_smoke_dig( wrong, 'text' )
			) ) )

			return $bog_vmap_smoke_dig( reply, 'result', 'result', 'value' )
		}

		async open_page( uri: string ) {
			await this.send( 'Page.navigate', { url: uri }, this.page )
			await $bog_vmap_smoke_pause( 1500 )
		}

		async press( key: string, code: number ) {
			for( const type of [ 'keyDown', 'keyUp' ] ) {
				await this.send( 'Input.dispatchKeyEvent', {
					type, key, code: key, windowsVirtualKeyCode: code, nativeVirtualKeyCode: code,
				}, this.page )
			}
		}

		async until( code: string, limit: number, step = 300 ) {

			const started = Date.now()

			while( Date.now() - started < limit ) {
				const got = await this.evaluate( `return ${ code }`, Math.min( 15000, limit ) )
				if( got ) return Date.now() - started
				await $bog_vmap_smoke_pause( step )
			}

			return -1
		}

		close() {
			try { this.socket?.close() } catch( error ) {}
			try { this.child?.kill( 'SIGKILL' ) } catch( error ) {}
		}

	}

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

		const bin = $bog_vmap_smoke_chrome_bin()

		if( !bin ) { say( $bog_vmap_smoke_skip ); return lines.join( '\n' ) }

		say( 'браузер ' + bin )

		const site = await new $bog_vmap_smoke_static( root ).open()
		const profile = String( $node.fs.mkdtempSync( $node.path.join( $node.os.tmpdir(), 'vmap-smoke-' ) ) )
		const browser = new $bog_vmap_smoke_browser( bin, profile )

		const app = `$[ ${ JSON.stringify( d + 'bog_vmap_app' ) } ].Root( 0 )`
		const pane = `${ app }.Pane()`
		const warmed = `(()=>{ try { return ${ pane }.warmed() } catch( error ) { return false } })()`

		try {

			await browser.open()

			const began = Date.now()
			await browser.open_page( site.uri( '/app/-/index.html' ) )

			const warm = await browser.until( warmed, 120000 )
			if( warm < 0 ) return $mol_fail( new Error( 'сцена не прогрелась за 120000 мс' ) )
			say( `прогрев ${ warm } мс, порт статики ${ site.port }` )

			const before = Number( await browser.evaluate( `return Object.keys( ${ pane }.sizes() ).length`, 15000 ) )

			await browser.evaluate(
				`${ app }.part_drop( ${ JSON.stringify( d + 'bog_vmap_part_calc' ) }, 320, 220 ); return 1`,
				30000,
			)

			const grew = await browser.until( `Object.keys( ${ pane }.sizes() ).length > ${ before }`, 30000 )
			if( grew < 0 ) return $mol_fail( new Error( `после броска детали sizes остались на ${ before } узлах` ) )

			const after = Number( await browser.evaluate( `return Object.keys( ${ pane }.sizes() ).length`, 15000 ) )
			const name = String( await browser.evaluate( `return ${ app }.selected() || ''`, 15000 ) )
			const source = String( await browser.evaluate( `return ${ app }.doc_source()`, 15000 ) )

			if( !name ) return $mol_fail( new Error( 'брошенная деталь не выделилась' ) )
			if( !source.includes( 'bog_vmap_part_calc' ) ) return $mol_fail( new Error( 'деталь не попала в документ' ) )

			const box = String( await browser.evaluate(
				`return JSON.stringify( ${ pane }.sizes()[ ${ app }.doc_root() + '/' + ${ app }.selected() ] ?? null )`,
				15000,
			) )

			const rect = JSON.parse( box ) as { readonly width?: number, readonly height?: number } | null
			if( !rect || !Number( rect.width ) || !Number( rect.height ) )
				return $mol_fail( new Error( `у брошенной детали нет размеров: ${ box }` ) )

			say( `бросок детали: узлов ${ before } → ${ after } за ${ grew } мс, ${ name } ${ rect.width }×${ rect.height }` )

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
