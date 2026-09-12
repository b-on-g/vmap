namespace $ {

	export const $bog_vmap_border_listed = 'сессии перечислены'

	export const $bog_vmap_border_ok = 'граница держит'

	export const $bog_vmap_border_count = 11

	export const $bog_vmap_border_sandbox = 'allow-scripts'

	export const $bog_vmap_border_opaque = 'null'

	export const $bog_vmap_border_page = 'bog/vmap/app/-/index.html'

	export const $bog_vmap_border_parts = [
		'bog/vmap/app/-/index.html',
		'bog/vmap/app/-/web.js',
		'bog/vmap/scene/-/web.js',
		'bog/vmap/part/-/web.js',
		'bog/vmap/part/-/web.view.tree',
	]

	export function $bog_vmap_border_ready() {
		const d = '$'
		return `typeof $ !== 'undefined' && $[ ${ JSON.stringify( d + 'bog_vmap_app' ) } ].Root( 0 ).Pane().warmed()`
	}

	export function $bog_vmap_border_scene_root() {
		const d = '$'
		return d + 'bog_vmap_scene'
	}

	export type $bog_vmap_border_shell = {
		readonly frames: number
		readonly reachable: number
		readonly srcdoc: number
		readonly sandbox: string
	}

	export type $bog_vmap_border_seat = {
		readonly session: string
		readonly top: boolean
		readonly href: string
		readonly origin: string
		readonly root: string
		readonly note: string
	}

	export function $bog_vmap_border_shell_script() {
		return `
			const frames = Array.from( document.querySelectorAll( 'iframe' ) )
			const reachable = frames.filter( frame => {
				try { return !!frame.contentDocument } catch( error ) { return false }
			} )
			return JSON.stringify({
				frames: frames.length,
				reachable: reachable.length,
				srcdoc: frames.filter( frame => frame.hasAttribute( 'srcdoc' ) ).length,
				sandbox: frames.map( frame => frame.getAttribute( 'sandbox' ) ?? 'нет' ).join( ' / ' ),
			})
		`
	}

	export function $bog_vmap_border_seat_script() {
		return `
			const root = document.querySelector( '[mol_view_root]:not([mol_view_root=""])' )
			return JSON.stringify({
				href: String( location.href ).slice( 0, 140 ),
				origin: String( self.origin ),
				root: root ? String( root.getAttribute( 'mol_view_root' ) ) : '',
			})
		`
	}

	export type $bog_vmap_border_probe = {
		readonly name: string
		readonly want: 'open' | 'shut'
		readonly open: boolean
		readonly note: string
	}

	export type $bog_vmap_border_report = {
		readonly origin: string
		readonly probes: readonly $bog_vmap_border_probe[]
	}

	export function $bog_vmap_border_probe_script() {
		const d = '$'
		const fiber = JSON.stringify( d + 'mol_wire_auto' )
		return `
			const brief = value => {
				if( value === null ) return 'null'
				if( value === undefined ) return 'undefined'
				if( typeof value === 'object' ) return Object.prototype.toString.call( value )
				return String( value ).slice( 0, 80 )
			}
			const probes = [
				{ name: 'кадр вложен в чужое окно', want: 'open', task: ()=> parent !== self },
				{ name: 'свой origin читается', want: 'open', task: ()=> self.origin },
				{ name: 'postMessage наверх', want: 'open', task: ()=> typeof parent.postMessage },
				{ name: 'документ родителя', want: 'shut', task: ()=> parent.document },
				{ name: 'адрес родителя', want: 'shut', task: ()=> parent.location.href },
				{ name: 'указатель фибры родителя', want: 'shut', task: ()=> parent[ ${ fiber } ] },
				{ name: 'хранилище родителя', want: 'shut', task: ()=> parent.localStorage },
				{ name: 'база родителя', want: 'shut', task: ()=> parent.indexedDB },
				{ name: 'своё хранилище', want: 'shut', task: ()=> localStorage.length },
				{ name: 'своя база', want: 'shut', task: ()=> indexedDB.open( 'border' ) },
				{ name: 'свои cookie', want: 'shut', task: ()=> document.cookie },
			]
			return JSON.stringify({
				origin: String( self.origin ),
				probes: probes.map( probe => {
					try {
						return { name: probe.name, want: probe.want, open: true, note: 'вернуло ' + brief( probe.task() ) }
					} catch( error ) {
						return {
							name: probe.name,
							want: probe.want,
							open: false,
							note: String( ( error && error.name ) || 'Error' )
								+ ': ' + String( ( error && error.message ) || error ).slice( 0, 120 ),
						}
					}
				} ),
			})
		`
	}

	export function $bog_vmap_border_held( probe: $bog_vmap_border_probe ) {
		return probe.open === ( probe.want === 'open' )
	}

	export async function $bog_vmap_border_seats( browser: $bog_probe_browser, limit: number ) {

		const seats = [] as $bog_vmap_border_seat[]
		const ids = [ browser.page, ... browser.frames ]
			.filter( ( id, index, all )=> !!id && all.indexOf( id ) === index )

		for( const id of ids ) {
			try {
				const got = await browser.evaluate( $bog_vmap_border_seat_script(), limit, id )
				const seat: { href: string, origin: string, root: string } = JSON.parse( String( got ) )
				seats.push({
					session: id,
					top: id === browser.page,
					href: seat.href,
					origin: seat.origin,
					root: seat.root,
					note: '',
				})
			} catch( error ) {
				seats.push({
					session: id,
					top: id === browser.page,
					href: '',
					origin: '',
					root: '',
					note: 'не ответила: ' + String( error ),
				})
			}
		}

		return seats
	}

	export function $bog_vmap_border_show( seat: $bog_vmap_border_seat ) {
		const whose = seat.top ? 'страница' : 'кадр'
		if( seat.note ) return `${ whose } ${ seat.session }: ${ seat.note }`
		return `${ whose } ${ seat.session }: origin ${ seat.origin }`
			+ `, корень ${ seat.root || 'нет' }, адрес ${ seat.href }`
	}

	export async function $bog_vmap_border_check( root = $node.process.cwd() ) {

		const lines = [] as string[]
		const broken = [] as string[]
		const say = ( line: string )=> { lines.push( line ); $node.fs.writeSync( 1, 'граница: ' + line + '\n' ) }
		const want = ( ok: boolean, note: string )=> { if( !ok ) { broken.push( note ); say( 'ДЫРА ' + note ) } }

		for( const rel of $bog_vmap_border_parts ) {
			if( $node.fs.existsSync( $node.path.join( root, rel ) ) ) continue
			return $mol_fail( new Error( `нет ${ rel }, сперва собери app, scene и part` ) )
		}

		const bin = $bog_probe_chrome_bin()
		if( !bin ) { say( $bog_probe_skip ); return lines.join( '\n' ) }

		const site = await new $bog_probe_static( root ).open()
		const profile = String( $node.fs.mkdtempSync( $node.path.join( $node.os.tmpdir(), 'bog-vmap-border-' ) ) )
		const browser = new $bog_probe_browser( bin, profile )

		try {

			await browser.open()
			await browser.viewport( 1280, 800 )

			const waited = await browser.open_page(
				site.uri( $bog_vmap_border_page ),
				$bog_vmap_border_ready(),
				150000,
			)
			say( `редактор прогрелся за ${ waited } мс` )

			const shell: $bog_vmap_border_shell = JSON.parse( String(
				await browser.evaluate( $bog_vmap_border_shell_script(), 15000 )
			) )
			say(
				`кадров в документе ${ shell.frames }, из них с достижимым документом ${ shell.reachable }`
				+ `, поднято разметкой ${ shell.srcdoc }, атрибут песочницы: ${ shell.sandbox }`
			)

			const seats = await $bog_vmap_border_seats( browser, 15000 )
			say( `подцеплено сессий ${ seats.length }, из них кадров ${ seats.filter( seat => !seat.top ).length }` )
			for( const seat of seats ) say( $bog_vmap_border_show( seat ) )

			const scene = seats.filter( seat => seat.root === $bog_vmap_border_scene_root() )
			say( `сессий с корнем сцены ${ scene.length }` )
			say( $bog_vmap_border_listed )

			if( scene.length !== 1 ) return $mol_fail( new Error(
				`сессий с корнем сцены ${ scene.length }, а нужна одна: без неё критерии не проверить`
			) )

			want(
				shell.sandbox === $bog_vmap_border_sandbox,
				`атрибут песочницы кадра «${ shell.sandbox }», а не «${ $bog_vmap_border_sandbox }»`,
			)
			want(
				shell.reachable === 0,
				`документ кадра достижим из страницы: ${ shell.reachable } из ${ shell.frames }`,
			)

			const report: $bog_vmap_border_report = JSON.parse( String(
				await browser.evaluate( $bog_vmap_border_probe_script(), 15000, scene[ 0 ].session )
			) )

			if( report.probes.length !== $bog_vmap_border_count ) return $mol_fail( new Error(
				`критериев вернулось ${ report.probes.length }, а объявлено ${ $bog_vmap_border_count }`
			) )

			say(
				`origin кадра «${ report.origin }», критериев ${ report.probes.length }`
				+ `, из них закрытых ${ report.probes.filter( probe => probe.want === 'shut' ).length }`
			)

			want(
				report.origin === $bog_vmap_border_opaque,
				`origin кадра «${ report.origin }», а не непрозрачный «${ $bog_vmap_border_opaque }»`,
			)

			for( const probe of report.probes ) {
				const held = $bog_vmap_border_held( probe )
				say( `${ held ? 'держит' : 'ДЫРА' } ${ probe.name } (${ probe.want }): ${ probe.note }` )
				want( held, `${ probe.name }: ждали ${ probe.want }, получили ${ probe.open ? 'open' : 'shut' } — ${ probe.note }` )
			}

			if( broken.length ) return $mol_fail( new Error(
				`граница течёт, дыр ${ broken.length }:\n` + broken.map( note => '- ' + note ).join( '\n' )
			) )

			say( $bog_vmap_border_ok )

			return lines.join( '\n' )

		} finally {
			browser.close()
			site.close()
			try { $node.fs.rmSync( profile, { recursive: true, force: true } ) } catch( error ) {}
		}

	}

}
