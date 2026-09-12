namespace $ {

	export const $bog_vmap_border_listed = 'сессии перечислены'

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
		const say = ( line: string )=> { lines.push( line ); $node.fs.writeSync( 1, 'граница: ' + line + '\n' ) }

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

			return lines.join( '\n' )

		} finally {
			browser.close()
			site.close()
			try { $node.fs.rmSync( profile, { recursive: true, force: true } ) } catch( error ) {}
		}

	}

}
