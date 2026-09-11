// S6. Повтор спина, который даёт CDP-клавиатура без поля text.
//
//   node spike/s6/keys.js [порт] [сколько нажатий]
//   DOG_KEYS=0  node spike/s6/keys.js 9406     контроль: ни одного нажатия
//   DOG_FLAGS=min node spike/s6/keys.js 9407 3 минимальный набор флагов
//
// Скрипт сам поднимает Chrome на временном профиле, открывает about:blank,
// шлёт Enter через Input.dispatchKeyEvent БЕЗ поля text, отключает клиента и
// меряет CPU головного процесса браузера и его детей через top -l 2 — берётся
// второй проход, потому что первый печатает среднее за жизнь процесса.
//
// Приложения в замере нет вовсе: мерится сам приём, а не редактор. Замер 11.09
// на Chrome 153.0.8010.37, macOS: контроль 0–0.3 %, три нажатия 49–61 % с
// ростом памяти до сотен мегабайт. У соседа по смене на той же машине и том же
// билде те же события дают ноль; причина расхождения не найдена, поэтому в
// тестах правило записано как приём — полю text быть обязательно.
const { spawn, execSync } = require( 'node:child_process' )
const fs = require( 'node:fs' )
const os = require( 'node:os' )
const path = require( 'node:path' )

const PORT = process.argv[ 2 ] || '9401'
const HITS = process.env.DOG_KEYS === undefined ? Number( process.argv[ 3 ] || 3 ) : Number( process.env.DOG_KEYS )
const BIN = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const sleep = ms => new Promise( r => setTimeout( r, ms ) )

const cpu_of = pids => {
	const args = pids.map( p => `-pid ${ p }` ).join( ' ' )
	const out = execSync( `top -l 2 -n 20 -stats pid,cpu,rsize ${ args } 2>/dev/null | tail -8`, { encoding: 'utf8' } )
	const rows = out.split( '\n' ).map( l => l.trim().split( /\s+/ ) ).filter( r => /^\d+$/.test( r[ 0 ] ) )
	return rows.map( r => ({ pid: Number( r[ 0 ] ), cpu: Number( r[ 1 ] ), mem: r[ 2 ] }) )
}

const kids_of = head => {
	const out = execSync( `pgrep -P ${ head } || true`, { encoding: 'utf8' } ).trim()
	return out ? out.split( '\n' ).map( Number ) : []
}

const main = async ()=> {

	const profile = fs.mkdtempSync( path.join( os.tmpdir(), 'repro-keys-' ) )

	const flags = process.env.DOG_FLAGS === 'min'
		? [ '--headless=new', `--remote-debugging-port=${ PORT }`, `--user-data-dir=${ profile }`, '--no-first-run', 'about:blank' ]
		: [
			'--headless=new',
			`--remote-debugging-port=${ PORT }`,
			`--user-data-dir=${ profile }`,
			'--no-first-run', '--no-default-browser-check', '--no-sandbox',
			'--disable-dev-shm-usage', '--disable-gpu', '--disable-extensions',
			'--window-size=1600,1000',
			'about:blank',
		]

	const child = spawn( BIN, flags, { stdio: 'ignore' } )

	let version = null
	for( let i = 0; i < 30 && !version; i ++ ) {
		await sleep( 1000 )
		try { version = await ( await fetch( `http://127.0.0.1:${ PORT }/json/version` ) ).json() } catch( e ) {}
	}
	if( !version ) { console.log( 'Chrome не поднялся' ); child.kill( 'SIGKILL' ); return }

	console.log( 'браузер', version.Browser, '| флаги', process.env.DOG_FLAGS === 'min' ? 'минимальные' : 'мои обычные' )
	console.log( 'нажатий будет', HITS, '(0 значит контрольный прогон)' )

	const head = child.pid
	const watch = [ head, ... kids_of( head ) ]

	await sleep( 12000 )
	const before = cpu_of( watch )
	console.log( 'до:', before.map( r => `${ r.pid } ${ r.cpu }% ${ r.mem }` ).join( '  ' ) )

	if( HITS > 0 ) {
		const ws = new WebSocket( version.webSocketDebuggerUrl )
		await new Promise( ( ok, no )=> { ws.onopen = ok; ws.onerror = no } )
		let id = 0
		const waits = new Map
		ws.onmessage = e => { const m = JSON.parse( e.data ); if( m.id && waits.has( m.id ) ) { waits.get( m.id )( m ); waits.delete( m.id ) } }
		const send = ( method, params = {}, sessionId )=> new Promise( ok => {
			const i = ++ id
			waits.set( i, ok )
			ws.send( JSON.stringify( sessionId ? { id: i, method, params, sessionId } : { id: i, method, params } ) )
		} )

		const page = ( await send( 'Target.getTargets' ) ).result.targetInfos.find( t => t.type === 'page' )
		const { sessionId } = ( await send( 'Target.attachToTarget', { targetId: page.targetId, flatten: true } ) ).result

		const base = { key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 }
		for( let i = 0; i < HITS; i ++ ) {
			await send( 'Input.dispatchKeyEvent', { type: 'keyDown', ... base }, sessionId )
			await send( 'Input.dispatchKeyEvent', { type: 'keyUp', ... base }, sessionId )
			await sleep( 200 )
		}
		ws.close()
		console.log( 'нажатия посланы, клиент отключён' )
	}

	for( const wait of [ 5000, 15000, 20000 ] ) {
		await sleep( wait )
		const now = cpu_of( watch )
		const top = now.find( r => r.pid === head )
		console.log( `+${ Math.round( ( 12000 + wait ) / 1000 ) }с головной ${ top ? top.cpu + '% ' + top.mem : '?' }  |  все: ` + now.map( r => `${ r.pid } ${ r.cpu }%` ).join( ' ' ) )
	}

	child.kill( 'SIGKILL' )
	try { fs.rmSync( profile, { recursive: true, force: true } ) } catch( e ) {}
}

main().catch( e => { console.error( e ); process.exit( 1 ) } )
