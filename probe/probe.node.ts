namespace $ {

	export const $bog_vmap_probe_ok = 'вёрстка редактора в порядке'

	export const $bog_vmap_probe_page = 'bog/vmap/app/-/index.html'

	export const $bog_vmap_probe_parts = [
		'bog/vmap/app/-/index.html',
		'bog/vmap/app/-/web.js',
		'bog/vmap/scene/-/web.js',
		'bog/vmap/part/-/web.js',
		'bog/vmap/part/-/web.view.tree',
	]

	export const $bog_vmap_probe_panels = [ 'scenes', 'shelf', 'idle' ]

	export const $bog_vmap_probe_zones = [ 'head', 'tools', 'body', 'body_content', 'foot' ]

	export const $bog_vmap_probe_frame = [
		'head', 'root_name', 'main', 'left', 'left_tabs', 'layers', 'right', 'right_tabs',
		'canvas', 'canvas_head', 'canvas_body', 'canvas_body_content', 'canvas_foot',
		'pane', 'pane_scene',
	]

	export const $bog_vmap_probe_columns = [ 'left', 'canvas', 'right' ]

	export const $bog_vmap_probe_seam = 'right_grip'

	export const $bog_vmap_probe_left = [ 'scenes', 'left_tabs', 'layers', 'shelf' ]

	export type $bog_vmap_probe_mode = 'plain' | 'open' | 'long' | 'assets'

	export const $bog_vmap_probe_passes: readonly { readonly width: number, readonly mode: $bog_vmap_probe_mode, readonly note: string }[] = [
		{ width: 1280, mode: 'plain', note: '' },
		{ width: 1280, mode: 'long', note: ' с длинным списком сцен' },
		{ width: 1280, mode: 'assets', note: ' на вкладке «Детали»' },
		{ width: 400, mode: 'plain', note: '' },
		{ width: 400, mode: 'open', note: ' с открытыми колонками' },
	]

	export type $bog_vmap_probe_result = $bog_probe_rects_result & {
		readonly waited: number
		readonly settled: boolean
		readonly root: { readonly scroll: number, readonly client: number }
		readonly rows: { readonly [ top: string ]: number }
		readonly items: number
		readonly span: number
		readonly feet: { readonly [ name: string ]: number }
		readonly lines: { readonly [ name: string ]: number }
		readonly order: readonly string[]
		readonly stack: readonly string[]
	}

	export function $bog_vmap_probe_selectors() {
		const list = [ '[bog_vmap_app]' ] as string[]
		for( const name of $bog_vmap_probe_frame ) list.push( `[bog_vmap_app_${ name }]` )
		for( const name of $bog_vmap_probe_panels ) {
			list.push( `[bog_vmap_app_${ name }]` )
			for( const zone of $bog_vmap_probe_zones ) list.push( `[bog_vmap_app_${ name }_${ zone }]` )
		}
		return list
	}

	export function $bog_vmap_probe_script( selectors: readonly string[], mode: $bog_vmap_probe_mode ) {
		const d = '$'
		return `
			const root = document.querySelector( '[bog_vmap_app]' )
			const app = $[ ${ JSON.stringify( d + 'bog_vmap_app' ) } ].Root( 0 )
			const wait = ms => new Promise( done => setTimeout( done, ms ) )
			const mode = ${ JSON.stringify( mode ) }
			if( mode === 'open' ) {
				app.left_showed( true )
				app.right_showed( true )
			}
			if( mode === 'assets' ) app.left_tab( 'assets' )
			if( mode === 'long' ) {
				const style = document.createElement( 'style' )
				style.textContent = '[bog_vmap_app_scenes_body_content] { min-height: 2000px }'
				document.head.appendChild( style )
			}
			const shape = ()=> ${ JSON.stringify( $bog_vmap_probe_columns.concat( 'main' ) ) }.map( name => {
				const node = document.querySelector( '[bog_vmap_app_' + name + ']' )
				if( !node ) return name + ' none'
				const box = node.getBoundingClientRect()
				return name + ' ' + [ box.left, box.top, box.width, box.height ].map( Math.round ).join( ',' )
			} ).join( '; ' )
			const solid = ()=> [ 'main', 'canvas' ].every( name => {
				const node = document.querySelector( '[bog_vmap_app_' + name + ']' )
				if( !node ) return false
				const box = node.getBoundingClientRect()
				return box.width > 0 && box.height > 0
			} )
			let waited = 0
			let settled = false
			let last = shape()
			while( waited < 3000 ) {
				await wait( 100 )
				waited += 100
				const now = shape()
				if( now === last && waited >= 300 && solid() ) { settled = true; break }
				last = now
			}
			const base = (()=>{ ${ $bog_probe_rects_script( selectors ) } })()
			const head = document.querySelector( '[bog_vmap_app_head]' )
			const kids = head ? [ ... head.children ].flatMap(
				kid => kid.matches( '[bog_vmap_app_instruments], [bog_vmap_app_tools]' ) ? [ ... kid.children ] : [ kid ]
			) : []
			const rows = {}
			let span = 0
			for( const kid of kids ) {
				const box = kid.getBoundingClientRect()
				const top = Math.round( box.top )
				rows[ top ] = ( rows[ top ] || 0 ) + 1
				if( !kid.hasAttribute( 'bog_vmap_app_root_name' ) ) span += box.width
			}
			const feet = {}
			for( const name of ${ JSON.stringify( [ ... $bog_vmap_probe_panels, 'canvas' ] ) } ) {
				const foot = document.querySelector( '[bog_vmap_app_' + name + '_foot]' )
				feet[ name ] = foot ? foot.childElementCount : -1
			}
			const lines = {}
			for( const name of ${ JSON.stringify( $bog_vmap_probe_panels ) } ) {
				const top = document.querySelector( '[bog_vmap_app_' + name + '_head]' )
				const items = top ? [ ... top.children ].flatMap( kid => kid.hasAttribute( 'mol_page_tools' ) ? [ ... kid.children ] : [ kid ] ) : []
				lines[ name ] = new Set( items.map( kid => Math.round( kid.getBoundingClientRect().top ) ) ).size
			}
			const main = document.querySelector( '[bog_vmap_app_main]' )
			const order = main ? [ ... main.children ].map(
				kid => ${ JSON.stringify( $bog_vmap_probe_columns.concat( $bog_vmap_probe_seam ) ) }.find( name => kid.hasAttribute( 'bog_vmap_app_' + name ) ) || '?'
			) : []
			const left = document.querySelector( '[bog_vmap_app_left]' )
			const stack = left ? [ ... left.children ].map(
				kid => ${ JSON.stringify( $bog_vmap_probe_left ) }.find( name => kid.hasAttribute( 'bog_vmap_app_' + name ) ) || '?'
			) : []
			return {
				rects: base.rects,
				viewport: base.viewport,
				scroll: base.scroll,
				waited,
				settled,
				root: { scroll: root.scrollWidth, client: root.clientWidth },
				rows,
				items: kids.length,
				span: Math.round( span ),
				feet,
				lines,
				order,
				stack,
			}
		`
	}

	export async function $bog_vmap_probe_look( root: string, width: number, height: number, mode: $bog_vmap_probe_mode ) {
		const got = await $bog_probe_run({
			root,
			page: $bog_vmap_probe_page,
			ready: $bog_vmap_blank_ready(),
			width,
			height,
			limit: 150000,
			script: $bog_vmap_probe_script( $bog_vmap_probe_selectors(), mode ),
		})
		if( got === $bog_probe_skip ) return $bog_probe_skip
		return got as $bog_vmap_probe_result
	}

	export const $bog_vmap_probe_contrast_min = 1.2

	export const $bog_vmap_probe_board = { x: 60, y: 60, width: 320, height: 200 }

	export type $bog_vmap_probe_rgb = readonly [ number, number, number ]

	export function $bog_vmap_probe_paeth( left: number, up: number, corner: number ) {
		const guess = left + up - corner
		const far_left = Math.abs( guess - left )
		const far_up = Math.abs( guess - up )
		const far_corner = Math.abs( guess - corner )
		if( far_left <= far_up && far_left <= far_corner ) return left
		return far_up <= far_corner ? up : corner
	}

	export function $bog_vmap_probe_png( png: Uint8Array ) {

		const view = new DataView( png.buffer, png.byteOffset, png.byteLength )
		const packed = [] as Uint8Array[]
		let width = 0
		let height = 0
		let channels = 4

		for( let at = 8; at < png.length; ) {
			const size = view.getUint32( at )
			const kind = String.fromCharCode( ... png.subarray( at + 4, at + 8 ) )
			if( kind === 'IHDR' ) {
				width = view.getUint32( at + 8 )
				height = view.getUint32( at + 12 )
				channels = png[ at + 17 ] === 6 ? 4 : 3
			}
			if( kind === 'IDAT' ) packed.push( png.subarray( at + 8, at + 8 + size ) )
			at += size + 12
		}

		const raw = new Uint8Array( $node.zlib.inflateSync( Buffer.concat( packed ) ) )
		const stride = width * channels
		const out = new Uint8Array( stride * height )

		for( let y = 0; y < height; ++ y ) {
			const filter = raw[ y * ( stride + 1 ) ]
			for( let x = 0; x < stride; ++ x ) {
				const left = x < channels ? 0 : out[ y * stride + x - channels ]
				const up = y ? out[ ( y - 1 ) * stride + x ] : 0
				const corner = x < channels || !y ? 0 : out[ ( y - 1 ) * stride + x - channels ]
				const guess = [ 0, left, up, ( left + up ) >> 1, $bog_vmap_probe_paeth( left, up, corner ) ][ filter ]
				out[ y * stride + x ] = ( raw[ y * ( stride + 1 ) + 1 + x ] + guess ) & 255
			}
		}

		const pixels = [] as $bog_vmap_probe_rgb[]
		for( let at = 0; at < out.length; at += channels ) pixels.push([ out[ at ], out[ at + 1 ], out[ at + 2 ] ])
		return pixels
	}

	export function $bog_vmap_probe_hex( rgb: $bog_vmap_probe_rgb ) {
		return '#' + rgb.map( byte => byte.toString( 16 ).padStart( 2, '0' ) ).join( '' )
	}

	export function $bog_vmap_probe_luma( rgb: $bog_vmap_probe_rgb ) {
		const [ red, green, blue ] = rgb.map( byte => {
			const part = byte / 255
			return part <= .04045 ? part / 12.92 : ( ( part + .055 ) / 1.055 ) ** 2.4
		} )
		return .2126 * red + .7152 * green + .0722 * blue
	}

	export function $bog_vmap_probe_contrast( one: $bog_vmap_probe_rgb, two: $bog_vmap_probe_rgb ) {
		const [ dark, light ] = [ $bog_vmap_probe_luma( one ), $bog_vmap_probe_luma( two ) ].sort( ( a, b )=> a - b )
		return ( light + .05 ) / ( dark + .05 )
	}

	export function $bog_vmap_probe_spot( pixels: readonly $bog_vmap_probe_rgb[] ) {
		const count = new Map< string, { rgb: $bog_vmap_probe_rgb, times: number } >()
		for( const rgb of pixels ) {
			const hex = $bog_vmap_probe_hex( rgb )
			count.set( hex, { rgb, times: ( count.get( hex )?.times ?? 0 ) + 1 } )
		}
		const [ hex, { rgb, times } ] = [ ... count ].sort( ( a, b )=> b[ 1 ].times - a[ 1 ].times )[ 0 ]
		return { hex, rgb, share: times / pixels.length }
	}

	export async function $bog_vmap_probe_paint(
		root: string,
		say: ( line: string )=> void,
		want: ( ok: boolean, note: string )=> void,
	) {

		const bin = $bog_probe_chrome_bin()
		if( !bin ) return

		const d = '$'
		const app = `$[ ${ JSON.stringify( d + 'bog_vmap_app' ) } ].Root( 0 )`
		const site = await new $bog_probe_static( root ).open()
		const profile = String( $node.fs.mkdtempSync( $node.path.join( $node.os.tmpdir(), 'vmap-paint-' ) ) )
		const browser = new $bog_probe_browser( bin, profile )
		const repaint = 'await new Promise( done => requestAnimationFrame( ()=> requestAnimationFrame( done ) ) )'
		const themes = new Set< string >()

		const sample = async ( x: number, y: number )=> {
			const shot = await browser.send( 'Page.captureScreenshot', {
				format: 'png',
				clip: { x: Math.round( x ) - 3, y: Math.round( y ) - 3, width: 7, height: 7, scale: 1 },
			}, browser.page )
			const data = $bog_probe_dig( shot, 'result', 'data' )
			if( typeof data !== 'string' ) return $mol_fail( new Error( `цвет: скриншот не снялся, ${ JSON.stringify( $bog_probe_dig( shot, 'error' ) ) }` ) )
			return $bog_vmap_probe_spot( $bog_vmap_probe_png( Buffer.from( data, 'base64' ) ) )
		}

		try {

			await browser.open()
			await browser.viewport( 1280, 800 )
			await browser.open_page( site.uri( $bog_vmap_probe_page ), $bog_vmap_blank_ready(), 150000 )
			const part_name = String( await browser.evaluate( `
				const app = ${ app }
				return await $[ ${ JSON.stringify( d + 'mol_wire_async' ) } ]( ()=> {
					app.board_draw( ${ JSON.stringify( $bog_vmap_probe_board ) } )
					const name = app.selected()
					app.selected( null )
					return name
				} )()
			`, 15000 ) )
			const measured = await browser.until( `!!${ app }.Pane().part_box( ${ JSON.stringify( part_name ) } )`, 15000 )
			if( measured < 0 ) return $mol_fail( new Error( `цвет: сцена не измерила артборд ${ part_name } за 15000 мс` ) )

			let scene = ''
			for( const session of browser.frames ) {
				try {
					if( await browser.evaluate( `return !!document.querySelector( '[bog_vmap_scene]' )`, 5000, session ) ) scene = session
				} catch( error ) {}
			}
			if( !scene ) return $mol_fail( new Error( 'цвет: не нашёл сессию кадра сцены' ) )

			for( const [ theme, light ] of [ [ 'тёмная', false ], [ 'светлая', true ] ] as const ) {

				const at = `1280, ${ theme } тема:`

				const host = await browser.evaluate( `
					const app = ${ app }
					const root = document.querySelector( '[bog_vmap_app]' )
					app.lights( ${ light } )
					for( let step = 0; step < 50 && root.getAttribute( 'mol_theme' ) !== app.theme_name(); ++ step ) {
						await new Promise( done => setTimeout( done, 100 ) )
					}
					${ repaint }
					const paint = name => getComputedStyle( document.querySelector( '[bog_vmap_app_' + name + ']' ) ).backgroundColor
					const box = name => {
						const rect = document.querySelector( '[bog_vmap_app_' + name + ']' ).getBoundingClientRect()
						return { left: rect.left, top: rect.top, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom }
					}
					const pane = box( 'pane' )
					const field = app.Pane().pane_rect()
					const part = app.Pane().part_box( ${ JSON.stringify( part_name ) } )
					const spot = side => {
						const column = box( side )
						const x = ( column.left + column.right ) / 2
						const y = column.bottom - 16
						const over = []
						for( let node = document.elementFromPoint( x, y ); node && !node.hasAttribute( 'bog_vmap_app_' + side ); node = node.parentElement ) {
							if( getComputedStyle( node ).backgroundColor !== 'rgba(0, 0, 0, 0)' ) over.push( node.tagName.toLowerCase() )
						}
						return { x, y, over: over.join( ' ' ) }
					}
					return {
						theme: root.getAttribute( 'mol_theme' ),
						wanted: app.theme_name(),
						pane: paint( 'pane' ),
						left: paint( 'left' ),
						right: paint( 'right' ),
						spots: { left: spot( 'left' ), right: spot( 'right' ) },
						boxes: { pane, frame: box( 'pane_scene' ) },
						board: part && { x: field.left + part.left + part.width / 2, y: field.top + part.top + part.height / 2 },
					}
				`, 15000 ) as {
					theme: string, wanted: string, pane: string, left: string, right: string,
					spots: { [ side in 'left' | 'right' ]: { x: number, y: number, over: string } },
					boxes: { [ name in 'pane' | 'frame' ]: $bog_probe_rect },
					board: { x: number, y: number } | null,
				}

				themes.add( host.theme )
				want( host.theme === host.wanted, `${ at } корень редактора в теме ${ host.theme }, ждали ${ host.wanted }` )

				const board = host.board
				if( !board ) return $mol_fail( new Error( `${ at } артборд не заведён или не измерен` ) )

				const look = `
					${ repaint }
					const scene = document.querySelector( '[bog_vmap_scene]' )
					const board = document.elementFromPoint( ${ board.x - host.boxes.frame.left }, ${ board.y - host.boxes.frame.top } )
					return {
						theme: scene.getAttribute( 'mol_theme' ),
						scene: getComputedStyle( scene ).backgroundColor,
						board: board && board !== scene ? getComputedStyle( board ).backgroundColor : 'на месте артборда корень сцены',
					}
				`

				const since = Date.now()
				let frame = await browser.evaluate( look, 5000, scene ) as { theme: string, scene: string, board: string }
				while( frame.theme !== host.theme && Date.now() - since < 10000 ) {
					await $bog_probe_pause( 200 )
					frame = await browser.evaluate( look, 5000, scene ) as typeof frame
				}

				want( frame.theme === host.theme, `${ at } тема кадра ${ frame.theme } не догнала тему хоста ${ host.theme } за ${ Date.now() - since } мс` )

				await browser.evaluate( `${ repaint }; return true`, 5000 )

				const canvas = await sample( host.boxes.pane.right - 16, host.boxes.pane.bottom - 16 )
				const artboard = await sample( board.x, board.y )
				const left = await sample( host.spots.left.x, host.spots.left.y )
				const right = await sample( host.spots.right.x, host.spots.right.y )

				for( const [ side, spot ] of [ [ 'левой', host.spots.left ], [ 'правой', host.spots.right ] ] as const ) want(
					!spot.over,
					`${ at } точку замера ${ side } колонки закрывает узел со своим фоном: ${ spot.over }`,
				)

				const pairs = [
					[ 'артборд', 'с артбордом', artboard ],
					[ 'левая колонка', 'с левой колонкой', left ],
					[ 'правая колонка', 'с правой колонкой', right ],
				] as const

				const contrast = ( spot: { readonly rgb: $bog_vmap_probe_rgb } )=> $bog_vmap_probe_contrast( canvas.rgb, spot.rgb )
				const shown = pairs.map( ( [ , versus, spot ] )=> `${ versus } ${ contrast( spot ).toFixed( 3 ) }` ).join( ', ' )

				say( `${ at } холст ${ canvas.hex }, артборд ${ artboard.hex }, колонки ${ left.hex } и ${ right.hex }; контраст холста ${ shown }, порог ${ $bog_vmap_probe_contrast_min }; computed: холст в кадре ${ frame.scene }, в пейне ${ host.pane }, артборд ${ frame.board }, колонки ${ host.left } и ${ host.right }` )

				for( const [ name, spot ] of [ [ 'холст', canvas ], [ 'артборд', artboard ], [ 'левая колонка', left ], [ 'правая колонка', right ] ] as const ) want(
					spot.share >= .5,
					`${ at } пятно «${ name }» пёстрое: ${ spot.hex } только на ${ Math.round( spot.share * 100 ) } % пикселей, замер попал не туда`,
				)

				for( const [ name, , spot ] of pairs ) want(
					contrast( spot ) >= $bog_vmap_probe_contrast_min,
					`${ at } холст ${ canvas.hex } и ${ name } ${ spot.hex } почти одного цвета: контраст ${ contrast( spot ).toFixed( 3 ) } меньше ${ $bog_vmap_probe_contrast_min }`,
				)

				want(
					frame.scene === host.pane,
					`${ at } холст в кадре ${ frame.scene } и в пейне ${ host.pane } разного цвета: до отрисовки кадра холст мигнёт`,
				)

			}

			want( themes.size === 2, `цвет: оба захода прошли в теме ${ [ ... themes ].join( ' и ' ) }, свет не переключился` )

		} finally {
			browser.close()
			site.close()
			try { $node.fs.rmSync( profile, { recursive: true, force: true } ) } catch( error ) {}
		}

	}

	export const $bog_vmap_probe_tip_ink = .8

	export const $bog_vmap_probe_placed = [
		'pane_label', 'pane_insert', 'pane_band', 'pane_draft', 'pane_values', 'pane_marks', 'pane_mark',
		'pane_overlay', 'pane_overlay_frame', 'pane_handle', 'pane_scene', 'wire', 'ghost',
	]

	export async function $bog_vmap_probe_tips(
		root: string,
		say: ( line: string )=> void,
		want: ( ok: boolean, note: string )=> void,
	) {

		const bin = $bog_probe_chrome_bin()
		if( !bin ) return

		const d = '$'
		const app = `$[ ${ JSON.stringify( d + 'bog_vmap_app' ) } ].Root( 0 )`
		const site = await new $bog_probe_static( root ).open()
		const profile = String( $node.fs.mkdtempSync( $node.path.join( $node.os.tmpdir(), 'vmap-tips-' ) ) )
		const browser = new $bog_probe_browser( bin, profile )
		const at = '1280, подсказки:'

		const mouse = ( x: number, y: number )=> browser.send( 'Input.dispatchMouseEvent', {
			type: 'mouseMoved', x, y, button: 'none', buttons: 0,
		}, browser.page )

		const shot = async ( clip: { x: number, y: number, width: number, height: number } )=> {
			const reply = await browser.send( 'Page.captureScreenshot', { format: 'png', clip: { ... clip, scale: 1 } }, browser.page )
			const data = $bog_probe_dig( reply, 'result', 'data' )
			if( typeof data !== 'string' ) return $mol_fail( new Error( `${ at } скриншот не снялся, ${ JSON.stringify( $bog_probe_dig( reply, 'error' ) ) }` ) )
			return $bog_vmap_probe_png( Buffer.from( data, 'base64' ) ).map( pixel => $bog_vmap_probe_hex( pixel ) )
		}

		const placed = async ( ids: readonly string[] | null )=> await browser.evaluate( `
			const ids = ${ JSON.stringify( ids ) }
			const nodes = ids ? ids.map( id => document.getElementById( id ) ).filter( Boolean ) : [ ... document.querySelectorAll( '*' ) ].filter(
				node => node.id && [ 'absolute', 'fixed', 'sticky' ].includes( getComputedStyle( node ).position )
			)
			const out = {}
			for( const node of nodes ) {
				const box = node.getBoundingClientRect()
				out[ node.id ] = getComputedStyle( node ).position + ' ' + [ box.left, box.top, box.width, box.height ].map( Math.round ).join( ',' )
			}
			return out
		`, 15000 ) as { [ id: string ]: string }

		const short = ( id: string )=> id.replace( /^.*Root\(0\)\./, '' ).replace( /\(\)$/, '' )

		const tip_box = async ( id: string )=> {
			const found = await browser.send( 'Runtime.evaluate', { expression: `document.getElementById( ${ JSON.stringify( id ) } )` }, browser.page )
			const object = $bog_probe_dig( found, 'result', 'result', 'objectId' )
			if( typeof object !== 'string' ) return null
			const node = await browser.send( 'DOM.describeNode', { objectId: object }, browser.page )
			const pseudos = ( $bog_probe_dig( node, 'result', 'node', 'pseudoElements' ) ?? [] ) as readonly { readonly pseudoType: string, readonly backendNodeId: number }[]
			const pseudo = pseudos.find( one => one.pseudoType === 'after' )
			if( !pseudo ) return null
			const model = await browser.send( 'DOM.getBoxModel', { backendNodeId: pseudo.backendNodeId }, browser.page )
			const quad = $bog_probe_dig( model, 'result', 'model', 'border' ) as readonly number[] | undefined
			if( !quad || quad.length < 8 ) return null
			const xs = [ quad[ 0 ], quad[ 2 ], quad[ 4 ], quad[ 6 ] ].map( Number )
			const ys = [ quad[ 1 ], quad[ 3 ], quad[ 5 ], quad[ 7 ] ].map( Number )
			return { left: Math.min( ... xs ), top: Math.min( ... ys ), right: Math.max( ... xs ), bottom: Math.max( ... ys ) }
		}

		const beyond = ( box: { left: number, top: number, right: number, bottom: number }, width: number, height: number )=> Math.round(
			Math.max( 0, - box.left ) + Math.max( 0, box.right - width ) + Math.max( 0, - box.top ) + Math.max( 0, box.bottom - height )
		)

		const inner = ( box: { left: number, top: number, right: number, bottom: number }, width: number, height: number )=> {
			const x = Math.max( 0, Math.round( box.left ) ) + 2
			const y = Math.max( 0, Math.round( box.top ) ) + 2
			const w = Math.min( width, Math.round( box.right ) ) - 2 - x
			const h = Math.min( height, Math.round( box.bottom ) ) - 2 - y
			return w > 0 && h > 0 ? { x, y, width: w, height: h } : null
		}

		try {

			await browser.open()
			await browser.viewport( 1280, 800 )
			await browser.open_page( site.uri( $bog_vmap_probe_page ), $bog_vmap_blank_ready(), 150000 )

			const part_name = String( await browser.evaluate( `
				const app = ${ app }
				return await $[ ${ JSON.stringify( d + 'mol_wire_async' ) } ]( ()=> {
					app.board_draw( ${ JSON.stringify( $bog_vmap_probe_board ) } )
					return app.selected()
				} )()
			`, 15000 ) )
			if( await browser.until( `!!${ app }.Pane().part_box( ${ JSON.stringify( part_name ) } )`, 15000 ) < 0 ) {
				return $mol_fail( new Error( `${ at } сцена не измерила артборд ${ part_name } за 15000 мс` ) )
			}

			const order = await browser.evaluate( `
				const styles = [ ... document.head.querySelectorAll( 'style' ) ]
				const ids = styles.map( style => style.id )
				const pack = styles.find( style => style.id.endsWith( 'bog/tooltip/tooltip.view.css' ) )
				if( pack ) {
					const copy = document.createElement( 'style' )
					copy.textContent = [ ... pack.sheet.cssRules ].flatMap( rule => rule.media ? [ ... rule.cssRules ].map( inner => inner.cssText ) : [] ).join( '\\n' )
					pack.after( copy )
				}
				return {
					pack: ids.findIndex( id => id.endsWith( 'bog/tooltip/tooltip.view.css' ) ),
					own: ids.findIndex( id => id.includes( 'bog_vmap_' ) ),
					all: ids.length,
					media: matchMedia( '(hover: hover) and (pointer: fine)' ).matches,
				}
			`, 15000 ) as { pack: number, own: number, all: number, media: boolean }

			want( order.pack >= 0, `${ at } стиля пака подсказок нет в head: плагин не подключён` )

			const flips = await browser.evaluate( `
				const pane = document.querySelector( '[bog_vmap_app_pane]' )
				const nodes = ${ JSON.stringify( $bog_vmap_probe_placed ) }.map( name => {
					const node = document.createElement( 'div' )
					node.setAttribute( 'bog_vmap_app_' + name, '' )
					pane.appendChild( node )
					return node
				} )
				const real = [ ... document.querySelectorAll( '*' ) ].filter( node => [ 'absolute', 'fixed', 'sticky' ].includes( getComputedStyle( node ).position )
					&& [ ... node.attributes ].some( attr => attr.name.startsWith( 'bog_vmap_' ) ) )
				const out = []
				for( const node of new Set([ ... nodes, ... real ]) ) {
					const plain = getComputedStyle( node ).position
					const had = node.getAttribute( 'data-mol-tip' )
					node.setAttribute( 'data-mol-tip', 'проба' )
					const tipped = getComputedStyle( node ).position
					if( had === null ) node.removeAttribute( 'data-mol-tip' )
					else node.setAttribute( 'data-mol-tip', had )
					if( plain !== tipped && plain !== 'static' ) out.push( [ ... node.attributes ].map( attr => attr.name ).find( name => name.startsWith( 'bog_vmap_' ) ) + ' ' + plain + '→' + tipped )
				}
				for( const node of nodes ) node.remove()
				return out
			`, 15000 ) as string[]

			want( !flips.length, `${ at } с атрибутом подсказки узел холста теряет своё позиционирование: ${ flips.join( ', ' ) }` )

			await browser.evaluate( `
				const pane = ${ app }.Pane()
				return await $[ ${ JSON.stringify( d + 'mol_wire_async' ) } ]( ()=> {
					pane.error_node( 'runtime', ${ JSON.stringify( part_name ) } )
					pane.error_at( 'runtime', 'проба подсказок' )
					return true
				} )()
			`, 15000 )
			if( await browser.until( `!!document.querySelector( '[bog_vmap_app_pane_mark]' )`, 5000 ) < 0 ) {
				return $mol_fail( new Error( `${ at } метка ошибки на ${ part_name } не поднялась` ) )
			}

			const before = await placed( null )

			const away = await browser.evaluate( `
				const box = document.querySelector( '[bog_vmap_app_pane]' ).getBoundingClientRect()
				return [ box.right - 24, box.bottom - 24 ]
			`, 15000 ) as [ number, number ]

			const targets = await browser.evaluate( `
				return [ ... document.querySelectorAll( '[bog_vmap_app_head] [title], [bog_vmap_app_pane_mark][title]' ) ].map( node => {
					const box = node.getBoundingClientRect()
					return { id: node.id, title: node.getAttribute( 'title' ), x: box.left + box.width / 2, y: box.top + box.height / 2 }
				} )
			`, 15000 ) as { id: string, title: string, x: number, y: number }[]

			want( targets.some( target => target.id.includes( 'Mark(' ) ), `${ at } у метки ошибки нет подсказки` )

			await mouse( ... away )
			await $bog_probe_pause( 150 )
			const wide = Number( await browser.evaluate( `return document.scrollingElement.scrollWidth`, 5000 ) )

			const inks = [] as number[]
			const cuts = [] as number[]
			const spills = [] as number[]
			let scroll = 0
			let wrapped = 0

			for( const target of targets ) {

				await mouse( ... away )
				await $bog_probe_pause( 150 )
				const position = await browser.evaluate( `return getComputedStyle( document.getElementById( ${ JSON.stringify( target.id ) } ) ).position`, 5000 )

				await mouse( target.x, target.y )
				await $bog_probe_pause( 250 )

				const box = await tip_box( target.id )

				const state = await browser.evaluate( `
					const node = document.getElementById( ${ JSON.stringify( target.id ) } )
					const tip = getComputedStyle( node, '::after' )
					const copy = document.createElement( 'div' )
					for( const name of tip ) copy.style.setProperty( name, tip.getPropertyValue( name ) )
					copy.style.position = 'fixed'
					copy.style.left = '-20000px'
					copy.style.top = '0px'
					copy.style.transform = 'none'
					copy.style.animation = 'none'
					copy.style.visibility = 'hidden'
					copy.textContent = node.getAttribute( 'data-mol-tip' ) || ''
					document.body.appendChild( copy )
					const spill = copy.scrollWidth - copy.clientWidth
					const lines = Math.round( ( copy.clientHeight - parseFloat( tip.paddingTop ) - parseFloat( tip.paddingBottom ) ) / ( parseFloat( tip.lineHeight ) || 1 ) )
					copy.remove()
					return {
						title: node.getAttribute( 'title' ),
						tip: node.getAttribute( 'data-mol-tip' ),
						position: getComputedStyle( node ).position,
						view: [ document.documentElement.clientWidth, document.documentElement.clientHeight ],
						spill,
						lines,
						scroll: document.scrollingElement.scrollWidth,
					}
				`, 15000 ) as {
					title: string | null, tip: string | null, position: string,
					view: [ number, number ], spill: number, lines: number, scroll: number,
				}

				const name = short( target.id )
				const [ view_width, view_height ] = state.view
				const shown = box ? [ box.left, box.top, box.right, box.bottom ].map( Math.round ).join( ',' ) : 'не нарисована'
				const cut = box ? beyond( box, view_width, view_height ) : 0
				const clip = box ? inner( box, view_width, view_height ) : null
				const tipped = clip ? await shot( clip ) : []
				await mouse( ... away )
				await $bog_probe_pause( 150 )
				const plain = clip ? await shot( clip ) : []
				const ink = plain.length ? plain.filter( ( pixel, index )=> pixel !== tipped[ index ] ).length / plain.length : 0

				inks.push( ink )
				cuts.push( cut )
				spills.push( state.spill )
				scroll = Math.max( scroll, state.scroll )
				if( state.lines > 1 ) wrapped ++

				want(
					state.tip === target.title && state.title === null,
					`${ at } у ${ name } подсказка не переехала из title: title ${ JSON.stringify( state.title ) }, data-mol-tip ${ JSON.stringify( state.tip ) }`,
				)
				want(
					ink >= $bog_vmap_probe_tip_ink,
					`${ at } подсказки ${ name } не видно: в её прямоугольнике ${ JSON.stringify( clip ) } сменилось ${ Math.round( ink * 100 ) } % пикселей, ждали не меньше ${ $bog_vmap_probe_tip_ink * 100 } %`,
				)
				want(
					state.position === position,
					`${ at } наведение сменило позиционирование ${ name }: ${ position } → ${ state.position }`,
				)
				want(
					!!box && cut === 0,
					`${ at } подсказка ${ name } вылезла за окно ${ view_width }×${ view_height } на ${ cut } px: ${ shown }`,
				)
				want(
					state.spill <= 0,
					`${ at } текст подсказки ${ name } вылез за подложку на ${ state.spill } px`,
				)
				want(
					state.scroll <= wide,
					`${ at } наведение на ${ name } раздуло документ до ${ state.scroll } px из ${ wide }`,
				)

			}

			const after = await placed( Object.keys( before ) )
			const moved = Object.keys( before ).filter( id => after[ id ] && after[ id ] !== before[ id ] )

			want( !moved.length, `${ at } наведение сдвинуло абсолютные узлы: ${ moved.map( id => `${ short( id ) } ${ before[ id ] } → ${ after[ id ] }` ).join( '; ' ) }` )

			await browser.evaluate( `
				const style = document.createElement( 'style' )
				style.id = 'bog_vmap_probe_freeze'
				style.innerHTML = '*::after { animation-play-state: paused !important }'
				document.head.appendChild( style )
				return true
			`, 5000 )

			const halves = [] as number[]
			let half_scroll = 0
			let frozen = 0

			const halted = async ( id: string )=> await browser.evaluate( `
				const node = document.getElementById( ${ JSON.stringify( id ) } )
				const mine = ()=> node.getAnimations( { subtree: true } )
					.filter( one => one.effect?.target === node && one.effect?.pseudoElement === '::after' )

				let own = mine()
				for( let step = 0; step < 30 && !own.length; ++ step ) {
					await new Promise( done => requestAnimationFrame( done ) )
					own = mine()
				}

				if( !own.length ) return 'анимации нет'

				for( const one of own ) {
					one.pause()
					one.currentTime = Number( one.effect.getComputedTiming().duration ) / 2
				}

				await Promise.all( own.map( one => one.ready.catch( ()=> null ) ) )
				await new Promise( done => requestAnimationFrame( ()=> requestAnimationFrame( done ) ) )

				const stuck = own.filter( one => one.playState !== 'paused' )
				return stuck.length ? stuck.map( one => one.playState ).join( ', ' ) : 'на паузе'
			`, 5000 ) as string

			for( const target of targets ) {

				let stop = 'анимации нет'

				for( let attempt = 1; attempt <= 3 && stop !== 'на паузе'; ++ attempt ) {
					await mouse( ... away )
					await $bog_probe_pause( 150 )
					await mouse( target.x, target.y )
					await $bog_probe_pause( 150 )
					stop = await halted( target.id )
				}

				const box = await tip_box( target.id )

				const state = await browser.evaluate( `
					const node = document.getElementById( ${ JSON.stringify( target.id ) } )
					return {
						view: [ document.documentElement.clientWidth, document.documentElement.clientHeight ],
						scroll: document.scrollingElement.scrollWidth,
						named: getComputedStyle( node, '::after' ).animationName !== 'none',
					}
				`, 5000 ) as { view: [ number, number ], scroll: number, named: boolean }

				const name = short( target.id )
				const [ view_width, view_height ] = state.view
				const shown = box ? [ box.left, box.top, box.right, box.bottom ].map( Math.round ).join( ',' ) : 'не нарисована'
				const cut = box ? beyond( box, view_width, view_height ) : 0

				halves.push( cut )
				half_scroll = Math.max( half_scroll, state.scroll )
				if( stop === 'на паузе' ) frozen ++

				want(
					!state.named || stop === 'на паузе',
					`${ at } анимацию появления подсказки ${ name } не удалось остановить на середине за три наведения: ${ stop }`,
				)
				want(
					!!box && cut === 0,
					`${ at } на середине анимации появления подсказка ${ name } вылезла за окно ${ view_width }×${ view_height } на ${ cut } px: ${ shown }`,
				)
				want(
					state.scroll <= wide,
					`${ at } на середине анимации появления наведение на ${ name } раздуло документ до ${ state.scroll } px из ${ wide }`,
				)

			}

			await mouse( ... away )

			say( `${ at } верхняя панель и метка ошибки — наведено на ${ targets.length }, в прямоугольнике подсказки сменилось от ${ Math.round( Math.min( ... inks ) * 100 ) } до ${ Math.round( Math.max( ... inks ) * 100 ) } % пикселей; абсолютных узлов ${ Object.keys( before ).length }, после наведения сдвинулось ${ moved.length }; стиль пака ${ order.pack }-й из ${ order.all } в head, первый стиль vmap ${ order.own }-й; медиа (hover: hover) and (pointer: fine) здесь ${ order.media ? 'истинна' : 'ложна' }, правила пака из-под неё продублированы без условия сразу за его стилем` )
			say( `${ at } верхняя панель и метка ошибки — прямоугольник подсказки из отладчика: за краем окна до ${ Math.max( ... cuts ) } px, текст за подложкой до ${ Math.max( ... spills ) } px, ширина документа при наведении до ${ scroll } из ${ wide }, в несколько строк ${ wrapped } из ${ targets.length }; на середине анимации появления остановлено ${ frozen } из ${ targets.length }, за краем окна до ${ Math.max( ... halves ) } px, ширина документа до ${ half_scroll }` )

		} finally {
			browser.close()
			site.close()
			try { $node.fs.rmSync( profile, { recursive: true, force: true } ) } catch( error ) {}
		}

	}

	export const $bog_vmap_probe_early_rate = 20

	export const $bog_vmap_probe_early_blocked = [ 'main', 'instruments', 'root_name', 'publish' ]

	export const $bog_vmap_probe_early_reached = [ 'кнопка «Артборд»', 'строка колонок' ]

	export type $bog_vmap_probe_early_look = {
		readonly pending: boolean
		readonly inert: readonly string[]
		readonly tool: string
		readonly spots: string
		readonly status: string
	}

	export async function $bog_vmap_probe_early(
		root: string,
		say: ( line: string )=> void,
		want: ( ok: boolean, note: string )=> void,
	) {

		const bin = $bog_probe_chrome_bin()
		if( !bin ) return

		const d = '$'
		const app = `$[ ${ JSON.stringify( d + 'bog_vmap_app' ) } ].Root( 0 )`
		const at = `1280, до документа, замедление ${ $bog_vmap_probe_early_rate }:`
		const site = await new $bog_probe_static( root ).open()

		const visible = `(()=>{
			const overlay = document.querySelector( '[bog_vmap_app_pane_overlay]' )
			const tool = document.querySelector( '[bog_vmap_app_tool_board]' )
			return !!overlay && !!tool && overlay.getBoundingClientRect().width > 0
		})()`

		const look = `
			const app = ${ app }
			const read = ( get, busy )=> { try { return get() } catch( error ) { return busy } }
			return {
				pending: read( ()=> app.store().stage() === 'making', true ),
				inert: ${ JSON.stringify( $bog_vmap_probe_early_blocked ) }.filter( name => document.querySelector( '[bog_vmap_app_' + name + ']' )?.hasAttribute( 'inert' ) ),
				tool: app.Pane().tool(),
				spots: read( ()=> Object.keys( app.spots() ).join(), 'ждёт' ),
				status: read( ()=> app.status(), 'ждёт' ),
			}
		`

		const hits_catch = `
			window.vmap_early_hits = []
			document.addEventListener( 'pointerdown', event => {
				const target = event.target
				window.vmap_early_hits.push(
					target.closest( '[bog_vmap_app_tool_board]' ) ? ${ JSON.stringify( $bog_vmap_probe_early_reached[ 0 ] ) }
					: target.closest( '[bog_vmap_app_main]' ) ? ${ JSON.stringify( $bog_vmap_probe_early_reached[ 1 ] ) }
					: target.tagName.toLowerCase()
				)
			}, { capture: true } )
			return true
		`

		const places = `
			const tool = document.querySelector( '[bog_vmap_app_tool_board]' ).getBoundingClientRect()
			const overlay = document.querySelector( '[bog_vmap_app_pane_overlay]' ).getBoundingClientRect()
			return { tool: [ tool.left + tool.width / 2, tool.top + tool.height / 2 ], canvas: [ overlay.left + 200, overlay.top + 150 ] }
		`

		let tries = 0

		try {

			while( tries < 3 ) {

				++ tries

				const profile = String( $node.fs.mkdtempSync( $node.path.join( $node.os.tmpdir(), 'vmap-early-' ) ) )
				const browser = new $bog_probe_browser( bin, profile )

				const click = async ( [ x, y ]: readonly [ number, number ] )=> {
					for( const type of [ 'mouseMoved', 'mousePressed', 'mouseReleased' ] ) await browser.send( 'Input.dispatchMouseEvent', {
						type, x, y,
						button: type === 'mouseMoved' ? 'none' : 'left',
						buttons: type === 'mousePressed' ? 1 : 0,
						clickCount: type === 'mouseMoved' ? 0 : 1,
					}, browser.page )
				}

				try {

					await browser.open()
					await browser.viewport( 1280, 800 )
					await browser.send( 'Emulation.setCPUThrottlingRate', { rate: $bog_vmap_probe_early_rate }, browser.page )

					const began = Date.now()
					await browser.send( 'Page.navigate', { url: site.uri( $bog_vmap_probe_page ) }, browser.page )
					if( await browser.until( visible, 60000, 20 ) < 0 ) return $mol_fail( new Error( `${ at } интерфейс не появился за 60000 мс` ) )
					const shown = Date.now() - began

					const spots = await browser.evaluate( places, 15000 ) as { tool: [ number, number ], canvas: [ number, number ] }
					const before = await browser.evaluate( look, 15000 ) as $bog_vmap_probe_early_look
					await browser.evaluate( hits_catch, 15000 )
					await click( spots.tool )
					await click( spots.canvas )
					const after = await browser.evaluate( look, 15000 ) as $bog_vmap_probe_early_look
					const hits = await browser.evaluate( 'return window.vmap_early_hits.splice( 0 )', 15000 ) as string[]

					if( !before.pending || !after.pending ) {
						say( `${ at } попытка ${ tries }: клики не уложились в окно до документа, стадия ждала до кликов ${ before.pending }, после ${ after.pending }` )
						continue
					}

					want(
						before.inert.length === $bog_vmap_probe_early_blocked.length,
						`${ at } пока документа нет, inert только у ${ before.inert.join( ', ' ) || 'никого' } из ${ $bog_vmap_probe_early_blocked.join( ', ' ) }`,
					)
					want( before.status === 'Документ загружается…', `${ at } пока документа нет, статус «${ before.status }»` )
					want(
						hits.length === 2 && !hits.some( hit => $bog_vmap_probe_early_reached.includes( hit ) ),
						`${ at } клик до документа дошёл до ${ hits.join( ', ' ) || 'никуда' }`,
					)

					await browser.send( 'Emulation.setCPUThrottlingRate', { rate: 1 }, browser.page )
					const waited = await browser.until( `${ app }.store().stage() === 'ready' && ${ app }.doc_key() !== ''`, 60000 )
					if( waited < 0 ) return $mol_fail( new Error( `${ at } документ не завёлся за 60000 мс` ) )

					const open = await browser.evaluate( look, 15000 ) as $bog_vmap_probe_early_look

					want( !open.inert.length, `${ at } документ заведён, а inert остался у ${ open.inert.join( ', ' ) }` )
					want( !open.spots, `${ at } клик до документа всё же завёл узел: места [${ open.spots }]` )

					await click( spots.tool )
					await click( spots.canvas )
					const made = await browser.until( `Object.keys( ${ app }.spots() ).length > 0`, 15000 )
					await $bog_probe_pause( 3000 )
					const kept = await browser.evaluate( `return { spots: Object.keys( ${ app }.spots() ).join(), source: ${ app }.doc_source() }`, 15000 ) as { spots: string, source: string }
					const name = kept.spots.split( ',' )[ 0 ] ?? ''

					want(
						made >= 0 && !!name && kept.source.includes( name ),
						`${ at } клик после документа не завёл артборд или он пропал за 3 с: места [${ kept.spots }]`,
					)

					say( `${ at } интерфейс на ${ shown } мс, попытка ${ tries }; пока документа нет, колонки и кнопки правки inert (${ before.inert.join( ', ' ) }), статус «${ before.status }», клики по «Артборд» и по холсту пришли в ${ hits.join( ' и ' ) }, мимо кнопки и строки колонок; документ заведён через ${ waited } мс после снятия замедления, inert снят, тот же клик завёл ${ name }, через 3 с он в документе` )

					return

				} finally {
					browser.close()
					try { $node.fs.rmSync( profile, { recursive: true, force: true } ) } catch( error ) {}
				}

			}

			want( false, `${ at } окно до документа не поймано за ${ tries } попытки: клики опоздали` )

		} finally {
			site.close()
		}

	}

	export function $bog_vmap_probe_foreign_script() {
		const d = '$'
		const take = ( name: string )=> `$[ ${ JSON.stringify( d + name ) } ]`
		return `
			const app = ${ take( 'bog_vmap_app' ) }.Root( 0 )
			const store = app.store()
			const fiber = task => ${ take( 'mol_wire_async' ) }( task )()
			await fiber( ()=> app.board_draw( ${ JSON.stringify( $bog_vmap_probe_board ) } ) )
			const source = await fiber( ()=> app.doc_source() )
			const spots = await fiber( ()=> app.spots() )
			const mate = await fiber( ()=> ${ take( 'giper_baza_auth' ) }.grab() )
			const land = ${ take( 'giper_baza_land' ) }.make({ $, auth: ()=> mate })
			const link = await fiber( ()=> {
				const doc = land.Data( ${ take( 'bog_vmap_app_doc' ) } )
				doc.title( 'Чужая сцена' )
				store.doc_source( doc, source )
				store.doc_spots( doc, spots )
				const first = store.nodes( doc )[ 0 ]
				if( first ) doc.Root( null ).val( first.link() )
				return doc.link().str
			} )
			await fiber( ()=> ${ take( 'giper_baza_glob' ) }.Land( land.link() ).units_steal( land ) )
			await fiber( ()=> store.doc_pick( new ( ${ take( 'giper_baza_link' ) } )( link ) ) )
			return link
		`
	}

	export async function $bog_vmap_probe_foreign(
		root: string,
		say: ( line: string )=> void,
		want: ( ok: boolean, note: string )=> void,
	) {

		const d = '$'
		const app = `$[ ${ JSON.stringify( d + 'bog_vmap_app' ) } ].Root( 0 )`
		const at = '1280, чужая сцена:'

		await $bog_vmap_probe_drive( root, at, async ( browser, { point, mouse } )=> {

			await browser.evaluate( $bog_vmap_probe_foreign_script(), 30000 )

			if( await browser.until( `${ app }.store().stage() === 'readonly' && !!${ app }.Pane().part_box( 'Page' )`, 15000 ) < 0 ) {
				return $mol_fail( new Error( `${ at } чужая сцена не открылась только для чтения или артборд не измерен` ) )
			}

			const head = await browser.evaluate( `
				const node = name => document.querySelector( '[bog_vmap_app_' + name + ']' )
				return {
					badge: node( 'readonly' )?.textContent ?? '',
					board: node( 'tool_board' ).hasAttribute( 'disabled' ),
					remove: node( 'delete' ).hasAttribute( 'disabled' ),
					name: node( 'root_name' ).disabled,
				}
			`, 15000 ) as { badge: string, board: boolean, remove: boolean, name: boolean }

			want( head.badge === 'Только просмотр', `${ at } в верхней панели нет плашки «Только просмотр»: «${ head.badge }»` )
			want( head.board && head.remove && head.name, `${ at } органы правки верхней панели живы: «Артборд» ${ !head.board }, «Удалить» ${ !head.remove }, имя корня ${ !head.name }` )

			const board = await browser.evaluate( `
				const box = document.querySelector( '[bog_vmap_app_tool_board]' ).getBoundingClientRect()
				return [ box.left + box.width / 2, box.top + box.height / 2 ]
			`, 15000 ) as [ number, number ]
			for( const type of [ 'mouseMoved', 'mousePressed', 'mouseReleased' ] ) await mouse( type, board )
			const tool = String( await browser.evaluate( `return ${ app }.Pane().tool()`, 15000 ) )
			want( tool === 'select', `${ at } клик по «Артборд» включил инструмент ${ tool }` )

			const spots = await browser.evaluate( `
				const pane = ${ app }.Pane()
				const rect = pane.pane_rect()
				const box = pane.part_box( 'Page' )
				return {
					empty: [ rect.left + rect.width - 40, rect.top + rect.height - 40 ],
					page: [ rect.left + box.left + box.width / 2, rect.top + box.top + box.height / 2 ],
				}
			`, 15000 ) as { empty: [ number, number ], page: [ number, number ] }

			for( const type of [ 'mouseMoved', 'mousePressed', 'mouseReleased' ] ) await mouse( type, spots.empty )
			const phantom = await browser.evaluate( `return ${ app }.selected()`, 15000 )
			want( phantom === null, `${ at } клик по пустому холсту выделил ${ JSON.stringify( phantom ) }` )

			for( const type of [ 'mouseMoved', 'mousePressed', 'mouseReleased' ] ) await mouse( type, spots.page )
			const picked = await browser.evaluate( `return ${ app }.selected()`, 15000 )
			want( picked === 'Page', `${ at } клик по артборду не выделил его: ${ JSON.stringify( picked ) }` )

			await browser.until( `!!document.querySelector( '[bog_vmap_app_inspect]' )`, 15000 )
			const fields = await browser.evaluate( `
				const inspect = document.querySelector( '[bog_vmap_app_inspect]' )
				const all = inspect ? [ ... inspect.querySelectorAll( 'input, textarea, [mol_button]' ) ].filter( node => !node.closest( '[mol_check_expand]' ) ) : []
				return { all: all.length, live: all.filter( node => !( node.disabled || node.hasAttribute( 'disabled' ) ) ).map( node => node.id.replace( /^.*Inspect\\(\\)\\./, '' ) ) }
			`, 15000 ) as { all: number, live: string[] }

			want( fields.all > 0 && !fields.live.length, `${ at } в Инспекторе живые поля: ${ fields.live.join( ', ' ) || 'полей нет вовсе' }` )

			await browser.press( 'Delete', 46 )
			await $bog_probe_pause( 500 )
			const kept = await browser.evaluate( `return ${ app }.doc_source().includes( 'Page' ) && !!${ app }.spots().Page`, 15000 )
			want( kept === true, `${ at } Delete удалил артборд из чужой сцены` )

			const row = await point( `[ ... document.querySelectorAll( '[bog_vmap_app_layers_pick]' ) ].find( node => node.textContent === 'Page' )` )
			if( !row ) return $mol_fail( new Error( `${ at } в «Слоях» нет строки Page` ) )
			for( const count of [ 1, 2 ] ) for( const type of [ 'mousePressed', 'mouseReleased' ] ) await browser.send( 'Input.dispatchMouseEvent', {
				type, x: row[ 0 ], y: row[ 1 ], button: 'left', buttons: type === 'mousePressed' ? 1 : 0, clickCount: count,
			}, browser.page )
			const layers = await browser.evaluate( `
				const line = [ ... document.querySelectorAll( '[bog_vmap_app_layers_line]' ) ].find( node => node.textContent.includes( 'Page' ) )
				return { edit: !!document.querySelector( '[bog_vmap_app_layers_edit]' ), draggable: line ? line.closest( '[draggable]' ) !== null : null }
			`, 15000 ) as { edit: boolean, draggable: boolean | null }

			want( !layers.edit, `${ at } двойной клик в «Слоях» открыл поле имени` )
			want( layers.draggable === false, `${ at } строка «Слоёв» тянется: draggable ${ layers.draggable }` )

			say( `${ at } верхняя панель с плашкой «${ head.badge }», «Артборд», «Удалить» и имя корня выключены; клик «Артборд» оставил инструмент ${ tool }, клик по пустому холсту выделил ${ JSON.stringify( phantom ) }, клик по артборду выделил ${ picked }; в Инспекторе ${ fields.all } полей и кнопок, живых ${ fields.live.length }; Delete артборд не тронул; двойной клик в «Слоях» поля имени не открыл, строка не тянется` )

		} )

	}

	export const $bog_vmap_probe_reload_rate = 4

	export async function $bog_vmap_probe_reload(
		root: string,
		say: ( line: string )=> void,
		want: ( ok: boolean, note: string )=> void,
	) {

		const d = '$'
		const app = `$[ ${ JSON.stringify( d + 'bog_vmap_app' ) } ].Root( 0 )`
		const at = `1280, перезагрузка своего документа, замедление ${ $bog_vmap_probe_reload_rate }:`

		await $bog_vmap_probe_drive( root, at, async browser => {

			await $bog_probe_pause( 1500 )
			await browser.send( 'Emulation.setCPUThrottlingRate', { rate: $bog_vmap_probe_reload_rate }, browser.page )
			await browser.send( 'Page.reload', {}, browser.page )

			if( await browser.until( `!!document.querySelector( '[bog_vmap_app_pane_overlay]' )`, 60000, 10 ) < 0 ) {
				return $mol_fail( new Error( `${ at } интерфейс не вернулся за 60000 мс` ) )
			}

			const seen = await browser.evaluate( `
				const began = performance.now()
				const seen = []
				const stage = ()=> { try { return ${ app }.store().stage() } catch( error ) { return 'loading' } }
				while( performance.now() - began < 5000 ) {
					const now = stage()
					if( seen.at( -1 ) !== now ) seen.push( now )
					if( now === 'ready' ) break
					await new Promise( done => setTimeout( done, 5 ) )
				}
				return seen
			`, 20000 ) as string[]

			await browser.send( 'Emulation.setCPUThrottlingRate', { rate: 1 }, browser.page )

			want( !seen.includes( 'readonly' ), `${ at } свой документ побывал «только для чтения»: ${ seen.join( ' → ' ) }` )
			want( seen.at( -1 ) === 'ready', `${ at } свой документ не стал готовым за 5 с: ${ seen.join( ' → ' ) }` )

			say( `${ at } стадии хранилища ${ seen.join( ' → ' ) }, холст ни разу не был «только для чтения»` )

		} )

	}

	export const $bog_vmap_probe_key_min = 56

	export async function $bog_vmap_probe_panel(
		root: string,
		say: ( line: string )=> void,
		want: ( ok: boolean, note: string )=> void,
	) {

		const d = '$'
		const app = `$[ ${ JSON.stringify( d + 'bog_vmap_app' ) } ].Root( 0 )`
		const at = '1280, правая панель:'

		const must = ( ok: boolean, note: string )=> { if( !ok ) $mol_fail( new Error( note ) ) }

		await $bog_vmap_probe_drive( root, at, async ( browser, { mouse } )=> {

			const drawn = String( await browser.evaluate( `
				const app = ${ app }
				await $.$mol_wire_async( ()=> app.board_draw({ x: 40, y: 40, width: 400, height: 300 }) )()
				await $.$mol_wire_async( ()=> app.node().part_names() )()
				return app.selected() ?? ''
			`, 60000 ) )

			must( Boolean( drawn ), `${ at } артборд не завёлся, выделено «${ drawn }»` )

			if( await browser.until( `${ app }.right_tab() === 'design'`, 15000 ) < 0 ) {
				return $mol_fail( new Error( `${ at } вкладка «Дизайн» не открылась` ) )
			}

			const shape = async ()=> await browser.evaluate( `
				const panel = document.querySelector( '[bog_vmap_app_right]' )
				const box = panel.getBoundingClientRect()

				const rows = [ ... document.querySelectorAll( '[bog_vmap_app_inspect_value_item]' ) ]

				const keys = []
				const spill = []

				for( const row of rows ) {
					const key = row.querySelector( 'input' )
					if( key ) keys.push( Math.round( key.getBoundingClientRect().width ) )
					for( const el of row.querySelectorAll( '*' ) ) {
						const one = el.getBoundingClientRect()
						if( one.width && one.right > box.right + 1 ) spill.push( Math.round( one.right - box.right ) )
					}
				}

				return {
					width: Math.round( box.width ),
					cut: panel.scrollWidth - panel.clientWidth,
					rows: rows.length,
					keys,
					spill,
				}
			`, 30000 ) as { width: number, cut: number, rows: number, keys: number[], spill: number[] }

			const cold = await browser.evaluate( `
				const panel = document.querySelector( '[bog_vmap_app_right]' )
				const box = panel.getBoundingClientRect()

				const first = document.querySelector( '[bog_vmap_app_inspect_row]' )
				const top = first ? Math.round( first.getBoundingClientRect().top ) : -1
				const bottom = first ? Math.round( first.getBoundingClientRect().bottom ) : -1

				return {
					ширина: Math.round( box.width ),
					низ: Math.round( Math.min( box.bottom, innerHeight ) ),
					верх_строки: top,
					низ_строки: bottom,
					записей: document.querySelectorAll( '[bog_vmap_app_inspect_value_item]' ).length,
					прокручено: panel.querySelector( '[mol_scroll]' )?.scrollTop ?? 0,
				}
			`, 30000 ) as { ширина: number, низ: number, верх_строки: number, низ_строки: number, записей: number, прокручено: number }

			must( cold.верх_строки >= 0, `${ at } в «Дизайне» нет ни одной строки свойства` )
			must( cold.прокручено === 0, `${ at } панель уже прокручена на ${ cold.прокручено } px, замер без прокрутки не честен` )

			want(
				cold.верх_строки < cold.низ,
				`${ at } первая строка свойства начинается за нижней кромкой при ширине ${ cold.ширина }:`
					+ ` строка с ${ cold.верх_строки }, панель до ${ cold.низ }`,
			)

			want(
				cold.записей > 0,
				`${ at } без прокрутки при ширине ${ cold.ширина } не видно ни одной записи словаря`,
			)

			say( `${ at } без прокрутки при ширине ${ cold.ширина } первая строка свойства начинается на ${ cold.верх_строки }`
				+ ` при нижней кромке ${ cold.низ }, записей словаря видно ${ cold.записей }` )

			const reach = async ()=> await browser.evaluate( `
				const app = ${ app }
				const row = app.Inspect().rows().find( one => one.sign() === 'style' )
				if( !row ) return -1

				row.dom_node().scrollIntoView({ block: 'center' })
				await new Promise( done => requestAnimationFrame( ()=> requestAnimationFrame( done ) ) )

				return Math.round( row.dom_node().getBoundingClientRect().top )
			`, 30000 )

			const settled = async ()=> {

				const began = Date.now()

				let last = -1

				for( ;; ) {
					await reach()
					const got = await shape()
					if( got.rows > 0 && got.rows === last ) return got
					if( Date.now() - began > 30000 ) return got
					last = got.rows
					await $bog_probe_pause( 200 )
				}

			}

			const before = await settled()

			if( !before.rows ) {

				const why = await browser.evaluate( `
					const app = ${ app }
					return {
						выделено: app.selected() ?? '',
						вкладка: app.right_tab(),
						строк: document.querySelectorAll( '[bog_vmap_app_inspect_row]' ).length,
						записей: document.querySelectorAll( '[bog_vmap_app_inspect_value_item]' ).length,
					}
				`, 15000 )

				must( false, `${ at } в «Дизайне» нет ни одной записи словаря за 30 с: ${ JSON.stringify( why ) }` )
			}
			want( before.spill.length === 0, `${ at } из панели торчит ${ before.spill.length } узлов, дальше края на ${ before.spill.join( ', ' ) } px` )

			const narrow = before.keys.filter( one => one < $bog_vmap_probe_key_min )
			want( narrow.length === 0, `${ at } поля имён ужаты: ${ narrow.join( ', ' ) } px при пороге ${ $bog_vmap_probe_key_min }` )

			const grip = await browser.evaluate( `
				const box = document.querySelector( '[bog_vmap_app_right_grip]' ).getBoundingClientRect()
				return [ box.left + box.width / 2, box.top + box.height / 2 ]
			`, 15000 ) as [ number, number ]

			await mouse( 'mouseMoved', grip )
			await mouse( 'mousePressed', grip )
			await mouse( 'mouseMoved', [ grip[ 0 ] - 60, grip[ 1 ] ], true )
			await mouse( 'mouseMoved', [ grip[ 0 ] - 120, grip[ 1 ] ], true )
			await mouse( 'mouseReleased', [ grip[ 0 ] - 120, grip[ 1 ] ] )

			if( await browser.until(
				`Math.round( document.querySelector( '[bog_vmap_app_right]' ).getBoundingClientRect().width ) === ${ app }.right_width()`,
				5000,
			) < 0 ) {
				return $mol_fail( new Error( `${ at } панель не догнала свою ширину за 5 с` ) )
			}

			const after = await shape()

			want( after.width > before.width, `${ at } тяга за ручку не расширила панель: было ${ before.width }, стало ${ after.width }` )

			say( `${ at } ширина ${ before.width } → ${ after.width } px за тягу ручки;`
				+ ` измерено записей словаря ${ before.rows }, самое узкое поле имени ${ Math.min( ... before.keys ) } px при пороге ${ $bog_vmap_probe_key_min };`
				+ ` за край панели не торчит ничего, обрезано ${ before.cut } px` )

		} )

	}

	export function $bog_vmap_probe_show( rect: $bog_probe_rect | null ) {
		if( !rect ) return 'null'
		return `${ Math.round( rect.width ) }×${ Math.round( rect.height ) } @${ Math.round( rect.left ) },${ Math.round( rect.top ) }`
	}

	export function $bog_vmap_probe_rows( rows: { readonly [ top: string ]: number } ) {
		return Object.keys( rows )
			.map( top => [ Number( top ), rows[ top ] ?? 0 ] as const )
			.sort( ( a, b )=> a[ 0 ] - b[ 0 ] )
	}

	export function $bog_vmap_probe_close( a: number, b: number, tolerance = 1 ) {
		return Math.abs( a - b ) <= tolerance
	}

	export const $bog_vmap_probe_folds = [
		{ name: 'source', title: 'Пак компонентов' },
		{ name: 'parts', title: 'Готовые детали' },
	]

	export function $bog_vmap_probe_mouse( browser: $bog_probe_browser, at: string ) {

		const point = async ( find: string )=> await browser.evaluate( `
			const node = ${ find }
			if( !node ) return null
			node.scrollIntoView({ block: 'nearest' })
			const box = node.getBoundingClientRect()
			const x = box.left + box.width / 2
			const y = box.top + box.height / 2
			return node.contains( document.elementFromPoint( x, y ) ) ? [ x, y ] : null
		`, 15000 ) as [ number, number ] | null

		const mouse = ( type: string, [ x, y ]: readonly [ number, number ], held = false )=> browser.send( 'Input.dispatchMouseEvent', {
			type, x, y,
			button: type === 'mouseMoved' && !held ? 'none' : 'left',
			buttons: type === 'mousePressed' || held ? 1 : 0,
			clickCount: type === 'mouseMoved' ? 0 : 1,
		}, browser.page )

		const click = async ( find: string, note: string )=> {
			const spot = await point( find )
			if( !spot ) return $mol_fail( new Error( `${ at } в центре ${ note } не она сама, клик уйдёт мимо` ) )
			await mouse( 'mouseMoved', spot )
			await mouse( 'mousePressed', spot )
			await mouse( 'mouseReleased', spot )
		}

		const away = async ()=> {
			const spot = await point( `document.querySelector( '[bog_vmap_app_canvas_foot]' )` )
			if( !spot ) return $mol_fail( new Error( `${ at } подвал Холста перекрыт, указатель увести некуда` ) )
			await mouse( 'mouseMoved', spot )
		}

		const tab = async ( label: string )=> await click(
			`[ ... document.querySelectorAll( '[bog_vmap_app_left_tabs_option]' ) ].find( node => node.textContent.includes( ${ JSON.stringify( label ) } ) )`,
			`вкладки «${ label }»`,
		)

		return { point, mouse, click, away, tab }
	}

	export async function $bog_vmap_probe_drive(
		root: string,
		at: string,
		act: ( browser: $bog_probe_browser, hand: ReturnType< typeof $bog_vmap_probe_mouse > )=> Promise< unknown >,
	) {

		const bin = $bog_probe_chrome_bin()
		if( !bin ) return

		const site = await new $bog_probe_static( root ).open()
		const profile = String( $node.fs.mkdtempSync( $node.path.join( $node.os.tmpdir(), 'vmap-drive-' ) ) )
		const browser = new $bog_probe_browser( bin, profile )

		try {

			await browser.open()
			await browser.viewport( 1280, 800 )
			await browser.open_page( site.uri( $bog_vmap_probe_page ), $bog_vmap_blank_ready(), 150000 )

			await $bog_vmap_blank( browser, site.uri( $bog_vmap_probe_page ), at )

			await act( browser, $bog_vmap_probe_mouse( browser, at ) )

		} finally {
			browser.close()
			site.close()
			try { $node.fs.rmSync( profile, { recursive: true, force: true } ) } catch( error ) {}
		}

	}

	export async function $bog_vmap_probe_fold(
		root: string,
		say: ( line: string )=> void,
		want: ( ok: boolean, note: string )=> void,
	) {

		const at = '1280, «Детали», клик мышью:'

		const trigger = ( name: string )=> `document.querySelector( '[bog_vmap_app_shelf_${ name }_trigger]' )`
		const content = ( name: string )=> `!!document.querySelector( '[bog_vmap_app_shelf_${ name }_content]' )`
		const paint = ( name: string )=> `(()=>{ const style = getComputedStyle( ${ trigger( name ) } ); return style.backgroundColor + ' / ' + style.boxShadow })()`

		await $bog_vmap_probe_drive( root, at, async ( browser, { click, away, tab } )=> {

			const painted = async ( name: string )=> String( await browser.evaluate( `return ${ paint( name ) }`, 15000 ) )

			await tab( 'Детали' )
			if( await browser.until( `!!document.querySelector( '[bog_vmap_app_shelf]' )`, 15000 ) < 0 ) {
				return $mol_fail( new Error( `${ at } вкладка «Детали» не открыла Полку` ) )
			}

			await away()

			for( const { name, title } of $bog_vmap_probe_folds ) {

				const start = await painted( name )
				want( Boolean( await browser.evaluate( `return ${ content( name ) }`, 15000 ) ), `${ at } у «${ title }» нет содержимого до клика` )

				await click( trigger( name ), `галки «${ title }»` )
				const folded = await browser.until( `!${ content( name ) }`, 5000 )
				const under = await painted( name )
				await away()
				const cleared = await browser.until( `${ paint( name ) } === ${ JSON.stringify( start ) }`, 3000 )
				const after = await painted( name )

				want( folded >= 0, `${ at } клик по галке «${ title }» не убрал содержимое за 5000 мс` )
				want( under !== start, `${ at } под указателем фон галки «${ title }» тот же, что до клика (${ start }): замер фона ничего не видит` )
				want( cleared >= 0, `${ at } фон галки «${ title }» после отпускания и ухода указателя ${ after }, до клика ${ start }` )

				await click( trigger( name ), `галки «${ title }»` )
				const unfolded = await browser.until( content( name ), 5000 )
				await away()
				const again = await browser.until( `${ paint( name ) } === ${ JSON.stringify( start ) }`, 3000 )

				want( unfolded >= 0, `${ at } второй клик по галке «${ title }» не вернул содержимое за 5000 мс` )
				want( again >= 0, `${ at } фон галки «${ title }» после второго клика ${ await painted( name ) }, до клика ${ start }` )

				say( `${ at } «${ title }» свернулась за ${ folded } мс, развернулась за ${ unfolded } мс; фон галки до клика ${ start }, под указателем ${ under }, после ухода ${ after }` )

			}

		} )

	}

	export async function $bog_vmap_probe_focus(
		root: string,
		say: ( line: string )=> void,
		want: ( ok: boolean, note: string )=> void,
	) {

		const d = '$'
		const at = '1280, фокус, клик мышью:'
		const app = `$[ ${ JSON.stringify( d + 'bog_vmap_app' ) } ].Root( 0 )`
		const focus = `(()=>{ const node = document.activeElement; return !node || node === document.body ? 'body' : node.tagName.toLowerCase() + ( node.matches( ':focus-visible' ) ? ':focus-visible' : '' ) })()`
		const tool = ( name: string )=> `document.querySelector( '[bog_vmap_app_tool_${ name }]' )`

		await $bog_vmap_probe_drive( root, at, async ( browser, { point, mouse, click, away, tab } )=> {

			const read = async ( code: string )=> String( await browser.evaluate( `return ${ code }`, 15000 ) )
			const facts = [] as string[]

			await browser.evaluate( `window.vmap_drags = 0; document.addEventListener( 'dragstart', ()=> ++ window.vmap_drags, true ); return 1`, 15000 )

			await away()
			await browser.press( 'Shift', 16 )
			await click( tool( 'hand' ), 'кнопки «Рука»' )
			await away()
			const clicked = await read( focus )
			await browser.press( 'Enter', 13 )
			const kept = await read( `${ app }.Pane().tool()` )

			want( clicked === 'body', `${ at } после Shift и клика по «Руке» фокус ${ clicked }, ждали body` )
			want( kept === 'hand', `${ at } Enter после клика по «Руке» нажал её снова: инструмент ${ kept }` )
			facts.push( `после Shift клик по «Руке» оставил фокус ${ clicked }, Enter — инструмент ${ kept }` )

			await browser.press( 'v', 86 )
			await tab( 'Детали' )

			const trigger = `document.querySelector( '[bog_vmap_app_shelf_source_trigger]' )`
			const shade = `getComputedStyle( ${ trigger } ).boxShadow`

			await away()
			const start = await read( shade )
			await browser.press( 'Shift', 16 )
			await click( trigger, 'галки «Пак компонентов»' )
			await click( trigger, 'галки «Пак компонентов»' )
			await away()
			const cleared = await browser.until( `${ shade } === ${ JSON.stringify( start ) }`, 3000 )

			want( cleared >= 0, `${ at } тень галки после Shift и клика ${ await read( shade ) }, до клика ${ start }` )
			facts.push( `тень галки после Shift и клика ${ await read( shade ) }` )

			await browser.press( 'Tab', 9 )
			const tabbed = await read( `(()=>{ const node = document.activeElement; return !!node && node.matches( '[mol_button]:focus-visible' ) && getComputedStyle( node ).boxShadow !== 'none' })()` )

			want( tabbed === 'true', `${ at } Tab не показал фокус кнопки с тенью: ${ await read( focus ) }` )
			facts.push( `Tab дал ${ await read( focus ) }` )

			await browser.evaluate( `${ app }.part_drop( ${ JSON.stringify( d + 'bog_vmap_part_calc' ) }, 320, 220 ); return 1`, 30000 )
			const name = await read( `${ app }.selected() || ''` )
			await tab( 'Слои' )

			const row = await point( `[ ... document.querySelectorAll( '[bog_vmap_app_layers_row]' ) ].find( node => node.textContent.includes( ${ JSON.stringify( name ) } ) )` )
			if( !row ) return $mol_fail( new Error( `${ at } в «Слоях» нет строки брошенной детали ${ name }` ) )

			await mouse( 'mouseMoved', row )
			await mouse( 'mousePressed', row )
			for( let step = 1; step <= 8; ++ step ) await mouse( 'mouseMoved', [ row[ 0 ], row[ 1 ] + step * 6 ], true )
			await mouse( 'mouseReleased', [ row[ 0 ], row[ 1 ] + 48 ] )
			const drags = Number( await read( 'window.vmap_drags' ) )

			want( drags > 0, `${ at } тяга строки «Слоёв» не началась: dragstart ${ drags }` )
			facts.push( `тяга строки «Слоёв» дала dragstart ${ drags }` )

			await browser.evaluate( `${ app }.Pane().picked([ ${ JSON.stringify( name ) } ]); ${ app }.Pane().entered( ${ JSON.stringify( name ) } ); return 1`, 15000 )
			if( await browser.until( `${ app }.Pane().inside()`, 15000 ) < 0 ) return $mol_fail( new Error( `${ at } вход в деталь ${ name } не состоялся` ) )
			if( await browser.until( `${ app }.Pane().frame_box()?.width > 0`, 15000 ) < 0 ) return $mol_fail( new Error( `${ at } у детали ${ name } за 15000 мс нет рамки: ${ await read( `JSON.stringify( ${ app }.Pane().frame_box() )` ) }` ) )

			const hole = await browser.evaluate( `
				const pane = ${ app }.Pane()
				const box = pane.frame_box()
				const rect = pane.pane_rect()
				return box ? [ rect.left + box.left + box.width / 2, rect.top + box.top + box.height / 2 ] : null
			`, 15000 ) as [ number, number ] | null
			if( !hole ) return $mol_fail( new Error( `${ at } над деталью ${ name } нет выреза` ) )

			await mouse( 'mouseMoved', hole )
			await mouse( 'mousePressed', hole )
			await mouse( 'mouseReleased', hole )
			const framed = await read( focus )
			await click( `document.querySelector( '[bog_vmap_app_zoom_in]' )`, 'кнопки «+»' )
			const freed = await read( focus )
			await browser.press( 'h', 72 )
			const handed = await read( `${ app }.Pane().tool()` )

			want( framed.startsWith( 'iframe' ), `${ at } клик в вырез не отдал фокус кадру сцены: ${ framed }` )
			want( freed === 'body', `${ at } клик по «+» не вывел фокус из кадра сцены: ${ freed }` )
			want( handed === 'hand', `${ at } клавиша H после клика по «+» не дошла до оболочки: инструмент ${ handed }` )
			facts.push( `кадр сцены: фокус ${ framed }, после «+» ${ freed }, H включила ${ handed }` )

			await browser.evaluate( `
				const select = $[ ${ JSON.stringify( d + 'mol_select' ) } ].make({ dictionary: ()=> ({ one: 'Один', two: 'Два' }) })
				const node = select.dom_tree()
				node.style.position = 'fixed'
				node.style.left = '600px'
				node.style.top = '300px'
				document.body.appendChild( node )
				window.vmap_select = select
				return 1
			`, 15000 )

			const opened = `( window.vmap_select.dom_tree(), window.vmap_select.showed() )`
			const pick = `window.vmap_select.Trigger().dom_node()`

			await click( pick, 'выпадашки' )
			const shown = await read( opened )
			await click( `document.querySelector( '[bog_vmap_app_canvas_foot]' )`, 'подвала Холста' )
			const missed = await read( opened )
			await click( pick, 'выпадашки' )
			await click( tool( 'board' ), 'кнопки «Артборд»' )
			const switched = await read( opened )

			want( shown === 'true', `${ at } выпадашка мола не открылась кликом` )
			want( missed === 'false', `${ at } выпадашка мола не закрылась кликом мимо` )
			want( switched === 'false', `${ at } выпадашка мола не закрылась кликом по «Артборду»` )
			facts.push( `выпадашка открыта ${ shown }, после клика мимо ${ missed }, после «Артборда» ${ switched }` )

			say( `${ at } ${ facts.join( '; ' ) }` )

		} )

	}

	/** Пункты, без которых меню узла бессмысленно. Новые пункты гейт не ломают, пропажа известного — ломает. */
	export const $bog_vmap_probe_menu_node = [ 'Копировать', 'Удалить', 'Обернуть в артборд', 'Выделить родителя', 'Внутрь' ]

	/** То же для меню на голом холсте. */
	export const $bog_vmap_probe_menu_bare = [ 'Артборд здесь', 'Показать всё' ]

	export type $bog_vmap_probe_bubble = {
		readonly left: number
		readonly top: number
		readonly right: number
		readonly bottom: number
		readonly items: number
		readonly labels: readonly string[]
		readonly keys: readonly number[]
		readonly view: readonly [ number, number ]
		readonly transform: string
	}

	export async function $bog_vmap_probe_menu(
		root: string,
		say: ( line: string )=> void,
		want: ( ok: boolean, note: string )=> void,
	) {

		const bin = $bog_probe_chrome_bin()
		if( !bin ) return

		const d = '$'
		const app = `$[ ${ JSON.stringify( d + 'bog_vmap_app' ) } ].Root( 0 )`
		const site = await new $bog_probe_static( root ).open()
		const profile = String( $node.fs.mkdtempSync( $node.path.join( $node.os.tmpdir(), 'vmap-menu-' ) ) )
		const browser = new $bog_probe_browser( bin, profile )

		const mouse = ( type: string, [ x, y ]: readonly [ number, number ] )=> browser.send( 'Input.dispatchMouseEvent', {
			type, x, y,
			button: type === 'mouseMoved' ? 'none' : 'right',
			buttons: type === 'mousePressed' ? 2 : 0,
			clickCount: type === 'mouseMoved' ? 0 : 1,
		}, browser.page )

		const shape = `(()=>{
			const bubble = document.querySelector( '[bog_vmap_app_menu] [mol_pop_bubble]' )
			if( !bubble ) return null
			const box = bubble.getBoundingClientRect()
			const items = [ ... bubble.querySelectorAll( '[bog_vmap_app_menu_item]' ) ]
			const keys = items.flatMap( item => {
				const label = item.querySelector( '[bog_vmap_app_menu_item_label]' ).getBoundingClientRect()
				const key = item.querySelector( '[bog_vmap_app_menu_item_keys]' ).getBoundingClientRect()
				return key.width ? [ key.left - label.right ] : []
			} )
			const labels = items.map(
				item => item.querySelector( '[bog_vmap_app_menu_item_label]' ).textContent.trim()
			)
			return {
				left: box.left, top: box.top, right: box.right, bottom: box.bottom,
				items: items.length, labels, keys,
				view: [ innerWidth, innerHeight ],
				transform: getComputedStyle( bubble ).transform,
			}
		})()`

		const settled = async ()=> {
			let last = ''
			for( let step = 0; step < 40; ++ step ) {
				const now = await browser.evaluate( `
					await new Promise( done => requestAnimationFrame( ()=> requestAnimationFrame( done ) ) )
					return ${ shape }
				`, 15000 ) as $bog_vmap_probe_bubble | null
				const mark = JSON.stringify( now )
				if( now && now.items && !now.transform.startsWith( 'matrix(0' ) && mark === last ) return now
				last = mark
			}
			return null
		}

		const show = ( got: $bog_vmap_probe_bubble )=> `${ Math.round( got.right - got.left ) }×${ Math.round( got.bottom - got.top ) } @${ Math.round( got.left ) },${ Math.round( got.top ) }`

		try {

			await browser.open()

			for( const width of [ 1280, 400 ] ) {

				await browser.viewport( width, 800 )
				await browser.open_page( site.uri( $bog_vmap_probe_page ), $bog_vmap_blank_ready(), 150000 )

				await $bog_vmap_blank( browser, site.uri( $bog_vmap_probe_page ), `${ width }, меню у угла холста:` )

				const pane = await browser.evaluate( `
					const rect = ${ app }.Pane().pane_rect()
					return [ rect.left, rect.top, rect.left + rect.width, rect.top + rect.height ]
				`, 15000 ) as readonly [ number, number, number, number ]

				const inset = 12

				const corners = [
					{ name: 'левый верхний', x: pane[0] + inset, y: pane[1] + inset },
					{ name: 'правый верхний', x: pane[2] - inset, y: pane[1] + inset },
					{ name: 'левый нижний', x: pane[0] + inset, y: pane[3] - inset },
					{ name: 'правый нижний', x: pane[2] - inset, y: pane[3] - inset },
				]

				for( const { name, x, y } of corners ) {

					const at = `${ width }, меню у угла холста ${ name } (${ Math.round( x ) },${ Math.round( y ) }):`

					for( const node of [ false, true ] ) {

						const kind = node ? 'узла' : 'холста'

						if( node ) await browser.evaluate( `
							const pane = ${ app }.Pane()
							pane.menu({
								screen: pane.screen_point({ clientX: ${ x }, clientY: ${ y } }),
								world: [ 0, 0 ],
								name: 'probe',
							})
						`, 15000 )
						else {
							await mouse( 'mouseMoved', [ x, y ] )
							await mouse( 'mousePressed', [ x, y ] )
							await mouse( 'mouseReleased', [ x, y ] )
						}

						const got = await settled()

						if( !got ) {
							want( false, `${ at } меню ${ kind } не открылось или не устоялось` )
							continue
						}

						const [ view_width, view_height ] = got.view
						const inside = got.left >= 0 && got.top >= 0 && got.right <= view_width && got.bottom <= view_height
						const right = x > view_width / 2
						const low = y > view_height / 2
						const away = ( right ? got.right <= x + 1 : got.left >= x - 1 )
							&& ( low ? got.bottom <= y + 1 : got.top >= y - 1 )

						say( `${ at } меню ${ kind }, пунктов ${ got.items } (${ got.labels.join( ', ' ) }), пузырь ${ show( got ) } во вьюпорте ${ view_width }×${ view_height }; от подписи до клавиши ${ got.keys.map( Math.round ).join( ', ' ) || 'клавиш нет' }` )

						const must = node ? $bog_vmap_probe_menu_node : $bog_vmap_probe_menu_bare
						const lost = must.filter( one => !got.labels.includes( one ) )

						want( !lost.length, `${ at } в меню ${ kind } пропали пункты: ${ lost.join( ', ' ) }; на месте ${ got.labels.join( ', ' ) || 'ничего' }` )
						want( inside, `${ at } меню ${ kind } вылезло за вьюпорт: ${ show( got ) } при ${ view_width }×${ view_height }` )
						want( away, `${ at } меню ${ kind } не развернулось от края: ${ show( got ) } при точке ${ Math.round( x ) },${ Math.round( y ) }` )
						want( got.keys.every( gap => gap >= 0 ), `${ at } клавиша наехала на подпись: ${ got.keys.join( ', ' ) }` )

						await browser.press( 'Escape', 27 )
						const closed = await browser.until( `!document.querySelector( '[bog_vmap_app_menu]' )`, 3000 )
						want( closed >= 0, `${ at } Esc не закрыл меню ${ kind } за 3000 мс` )

					}

				}

			}

		} finally {
			browser.close()
			site.close()
			try { $node.fs.rmSync( profile, { recursive: true, force: true } ) } catch( error ) {}
		}

	}

	export async function $bog_vmap_probe_check( root = $node.process.cwd() ) {

		const lines = [] as string[]
		const broken = [] as string[]
		const say = ( line: string )=> { lines.push( line ); $node.fs.writeSync( 1, 'проба: ' + line + '\n' ) }
		const must = ( ok: boolean, note: string )=> { if( !ok ) $mol_fail( new Error( note ) ) }
		const want = ( ok: boolean, note: string )=> { if( !ok ) { broken.push( note ); say( 'КРИВО ' + note ) } }

		for( const rel of $bog_vmap_probe_parts ) {
			if( $node.fs.existsSync( $node.path.join( root, rel ) ) ) continue
			return $mol_fail( new Error( `нет ${ rel }, сперва собери app, scene и part` ) )
		}

		const began = Date.now()

		await $bog_vmap_probe_paint( root, say, want )
		await $bog_vmap_probe_tips( root, say, want )
		await $bog_vmap_probe_early( root, say, want )
		await $bog_vmap_probe_foreign( root, say, want )
		await $bog_vmap_probe_reload( root, say, want )
		await $bog_vmap_probe_panel( root, say, want )

		let widths = [ -1, -1 ]

		for( const { width, mode, note } of $bog_vmap_probe_passes ) {

			const got = await $bog_vmap_probe_look( root, width, 800, mode )

			if( got === $bog_probe_skip ) { say( $bog_probe_skip ); return lines.join( '\n' ) }

			const wide = width === 1280
			const open = mode === 'open'
			const lower = mode === 'assets' ? 'shelf' : 'layers'
			const panels = $bog_vmap_probe_panels.filter( name => name !== 'shelf' || lower === 'shelf' )
			const at = `${ width }${ note }:`
			const rects = got.rects
			const box = ( name: string )=> rects[ `[bog_vmap_app_${ name }]` ] ?? null
			const view = got.viewport

			const head = box( 'head' )
			const main = box( 'main' )
			const left = box( 'left' )
			const right = box( 'right' )
			const canvas = box( 'canvas' )
			const body = box( 'canvas_body' )
			const content = box( 'canvas_body_content' )
			const foot = box( 'canvas_foot' )
			const pane = box( 'pane' )
			const scene = box( 'pane_scene' )

			say( `${ at } колонки ${ got.order.join( ' | ' ) }: левая ${ $bog_vmap_probe_show( left ) }, холст ${ $bog_vmap_probe_show( canvas ) }, правая ${ $bog_vmap_probe_show( right ) }; вьюпорт ${ view.width }×${ view.height }, документ ${ got.scroll.width }×${ got.scroll.height }, корень ${ got.root.scroll } из ${ got.root.client }, устоялось за ${ got.waited } мс` )

			const needed = [ 'head', 'main', 'canvas', 'canvas_body', 'canvas_body_content', 'canvas_foot', 'pane', 'pane_scene' ]

			must(
				needed.every( name => box( name ) ),
				`${ at } нет в разметке: ${ needed.filter( name => !box( name ) ).join( ', ' ) }`,
			)

			want(
				got.settled,
				`${ at } вёрстка не устоялась за ${ got.waited } мс: колонки менялись или строка с холстом нулевая`,
			)

			want(
				$bog_probe_fits( got ),
				`${ at } горизонтальная прокрутка документа ${ got.scroll.width } > ${ view.width }`,
			)
			want(
				got.root.scroll === got.root.client,
				`${ at } горизонтальная прокрутка редактора: ${ got.root.scroll } при ширине ${ got.root.client }`,
			)

			const rows = $bog_vmap_probe_rows( got.rows )
			const shown = rows.map( row => `${ row[ 0 ] }: ${ row[ 1 ] }` ).join( ', ' )
			const absorber = box( 'root_name' )

			say( `${ at } верхняя панель ${ $bog_vmap_probe_show( head ) }, кнопок ${ got.items }, строк ${ rows.length } — ${ shown }, кнопкам без имени корня нужно ${ got.span } из ${ Math.round( head!.width ) }, имени корня досталось ${ Math.round( absorber?.width ?? -1 ) }` )

			want(
				$bog_vmap_probe_close( head!.top, 0 ) && $bog_vmap_probe_close( head!.left, 0 ) && $bog_vmap_probe_close( head!.width, view.width ),
				`${ at } верхняя панель не на всю ширину сверху: ${ $bog_vmap_probe_show( head ) }`,
			)
			if( wide ) want(
				rows.length === 1,
				`${ at } кнопки верхней панели легли в ${ rows.length } строк: ${ shown }, кнопкам нужно ${ got.span }`,
			)

			want(
				$bog_vmap_probe_close( main!.top, head!.bottom ) && $bog_vmap_probe_close( main!.bottom, view.height ),
				`${ at } строка колонок не от панели до низа окна: ${ $bog_vmap_probe_show( main ) } под панелью ${ $bog_vmap_probe_show( head ) }`,
			)
			want(
				$bog_vmap_probe_close( main!.left, 0 ) && $bog_vmap_probe_close( main!.width, view.width ),
				`${ at } строка колонок не во всю ширину: ${ $bog_vmap_probe_show( main ) }`,
			)

			const columns = width === 400 && !open
				? [ 'canvas' ]
				: [ 'left', 'canvas', $bog_vmap_probe_seam, 'right' ]

			want(
				got.order.join() === columns.join(),
				`${ at } в строке колонок ${ got.order.join( ' | ' ) } вместо ${ columns.join( ' | ' ) }`,
			)

			if( width === 400 && !open ) {
				want( !left && !right, `${ at } колонки на узком окне не спрятаны: левая ${ $bog_vmap_probe_show( left ) }, правая ${ $bog_vmap_probe_show( right ) }` )
			} else {
				must( !!left && !!right, `${ at } колонки не открылись: левая ${ $bog_vmap_probe_show( left ) }, правая ${ $bog_vmap_probe_show( right ) }` )
				want(
					$bog_probe_inside( left, main ) && $bog_probe_inside( right, main ),
					`${ at } колонка вылезла из окна: левая ${ $bog_vmap_probe_show( left ) }, правая ${ $bog_vmap_probe_show( right ) }, строка ${ $bog_vmap_probe_show( main ) }`,
				)
				want(
					$bog_vmap_probe_close( left!.left, 0 ) && $bog_vmap_probe_close( right!.right, view.width ),
					`${ at } колонки не у краёв окна: левая ${ $bog_vmap_probe_show( left ) }, правая ${ $bog_vmap_probe_show( right ) }`,
				)
				for( const [ side, column ] of [ [ 'левая', left ], [ 'правая', right ] ] as const ) want(
					$bog_probe_aligned( column, main, 'top' ) && $bog_vmap_probe_close( column!.height, main!.height ),
					`${ at } ${ side } колонка не во всю высоту строки: ${ $bog_vmap_probe_show( column ) } против ${ $bog_vmap_probe_show( main ) }`,
				)
				if( wide ) widths = [ left!.width, right!.width ]
				else want(
					$bog_vmap_probe_close( left!.width, widths[ 0 ] ) && $bog_vmap_probe_close( right!.width, widths[ 1 ] ),
					`${ at } открытые колонки не своей ширины: левая ${ Math.round( left!.width ) } и правая ${ Math.round( right!.width ) } против ${ widths.map( Math.round ).join( ' и ' ) } на широком окне`,
				)
			}

			if( wide ) {
				want(
					$bog_probe_beside( left, canvas, 1 ) && $bog_probe_beside( canvas, right, 1 ),
					`${ at } колонки не стоят в ряд без щелей: ${ $bog_vmap_probe_show( left ) }, ${ $bog_vmap_probe_show( canvas ) }, ${ $bog_vmap_probe_show( right ) }`,
				)
				const rest = view.width - left!.width - right!.width
				say( `${ at } холсту остаток ${ Math.round( rest ) }, досталось ${ Math.round( canvas!.width ) }` )
				want(
					canvas!.width >= rest - 2,
					`${ at } холст уже остатка между колонками: ${ Math.round( canvas!.width ) } из ${ Math.round( rest ) }`,
				)
			} else {
				want(
					$bog_vmap_probe_close( canvas!.left, 0 ) && $bog_vmap_probe_close( canvas!.width, view.width ),
					`${ at } холст не во всю ширину окна: ${ $bog_vmap_probe_show( canvas ) }`,
				)
			}

			want(
				$bog_probe_aligned( canvas, main, 'top' ) && $bog_vmap_probe_close( canvas!.height, main!.height ),
				`${ at } холст не во всю высоту строки: ${ $bog_vmap_probe_show( canvas ) } против ${ $bog_vmap_probe_show( main ) }`,
			)
			want( !box( 'canvas_head' ), `${ at } у Холста своя шапка: ${ $bog_vmap_probe_show( box( 'canvas_head' ) ) }` )
			want(
				$bog_probe_aligned( body, canvas, 'top' ) && $bog_vmap_probe_close( body!.height + foot!.height, canvas!.height ),
				`${ at } тело ${ Math.round( body!.height ) } и подвал ${ Math.round( foot!.height ) } Холста не дают его высоту ${ Math.round( canvas!.height ) } от верха`,
			)
			want(
				got.feet.canvas === 1 && foot!.height > 0 && foot!.height <= 64,
				`${ at } в подвале Холста ${ got.feet.canvas } узлов высотой ${ Math.round( foot!.height ) }, ждали один статус не выше строки`,
			)

			say( `${ at } пейн ${ $bog_vmap_probe_show( pane ) }, кадр ${ $bog_vmap_probe_show( scene ) }, тело Холста ${ $bog_vmap_probe_show( content ) }, подвал ${ $bog_vmap_probe_show( foot ) }` )

			want(
				$bog_probe_aligned( pane, content, 'top' ) && $bog_vmap_probe_close( pane!.height, content!.height ),
				`${ at } пейн не занимает тело Холста по высоте: ${ $bog_vmap_probe_show( pane ) } против ${ $bog_vmap_probe_show( content ) }`,
			)
			want(
				$bog_probe_inside( pane, body ),
				`${ at } пейн вылез за тело Холста: ${ $bog_vmap_probe_show( pane ) } против ${ $bog_vmap_probe_show( body ) }`,
			)
			want(
				$bog_probe_inside( scene, pane ),
				`${ at } кадр сцены вылез за пейн: ${ $bog_vmap_probe_show( scene ) } против ${ $bog_vmap_probe_show( pane ) }`,
			)

			if( !wide ) continue

			const scenes = box( 'scenes' )
			const under = box( lower )

			if( mode === 'long' ) want(
				!!scenes && !!under && scenes.height <= left!.height * .4 + 1 && under.height >= left!.height / 2,
				`${ at } длинный список сцен выжал ${ lower }: Сцены ${ $bog_vmap_probe_show( scenes ) }, ${ lower } ${ $bog_vmap_probe_show( under ) }, колонка ${ $bog_vmap_probe_show( left ) }`,
			)

			const stack: [ string, readonly string[] ][] = [
				[ 'left', [ 'scenes', 'left_tabs', lower ] ],
				[ 'right', [ 'right_tabs', 'idle' ] ],
			]

			want(
				got.stack.join() === stack[ 0 ][ 1 ].join(),
				`${ at } в левой колонке ${ got.stack.join( ' | ' ) } вместо ${ stack[ 0 ][ 1 ].join( ' | ' ) }`,
			)

			for( const [ column, names ] of stack ) {

				const outer = box( column )
				const boxes = names.map( name => box( name ) )

				say( `${ at } ${ column }: ${ names.map( ( name, index )=> `${ name } ${ $bog_vmap_probe_show( boxes[ index ] ) }` ).join( ', ' ) }` )

				must( boxes.every( Boolean ), `${ at } в колонке ${ column } нет ${ names.filter( ( name, index )=> !boxes[ index ] ).join( ', ' ) }` )

				const tabs = box( `${ column }_tabs` )

				want(
					tabs!.height > 0 && tabs!.height <= 64,
					`${ at } полоса вкладок ${ column } высотой ${ Math.round( tabs!.height ) }, ждали не больше строки`,
				)

				want(
					$bog_probe_aligned( boxes[ 0 ], outer, 'top' ),
					`${ at } ${ names[ 0 ] } не у верха колонки ${ column }: ${ $bog_vmap_probe_show( boxes[ 0 ] ) } против ${ $bog_vmap_probe_show( outer ) }`,
				)
				for( let index = 1; index < boxes.length; ++ index ) want(
					$bog_vmap_probe_close( boxes[ index ]!.top, boxes[ index - 1 ]!.bottom ),
					`${ at } ${ names[ index ] } не встык под ${ names[ index - 1 ] }: ${ $bog_vmap_probe_show( boxes[ index ] ) } под ${ $bog_vmap_probe_show( boxes[ index - 1 ] ) }`,
				)
				want(
					$bog_probe_aligned( boxes[ boxes.length - 1 ], outer, 'bottom' ),
					`${ at } ${ names[ names.length - 1 ] } не дотянулась до низа колонки ${ column }: ${ $bog_vmap_probe_show( boxes[ boxes.length - 1 ] ) } против ${ $bog_vmap_probe_show( outer ) }`,
				)
				for( let index = 0; index < boxes.length; ++ index ) want(
					$bog_probe_inside( boxes[ index ], outer ),
					`${ at } ${ names[ index ] } вылезла из колонки ${ column }: ${ $bog_vmap_probe_show( boxes[ index ] ) } против ${ $bog_vmap_probe_show( outer ) }`,
				)

			}

			for( const name of panels ) {

				const page = box( name )
				const zone = ( part: string )=> box( `${ name }_${ part }` )
				const [ top, tools, trunk, inner, feet ] = $bog_vmap_probe_zones.map( zone )

				say( `${ at } ${ name } страница ${ $bog_vmap_probe_show( page ) }, шапка ${ $bog_vmap_probe_show( top ) }, полоса кнопок ${ $bog_vmap_probe_show( tools ) }, тело ${ $bog_vmap_probe_show( trunk ) }, содержимое ${ $bog_vmap_probe_show( inner ) }, подвал ${ $bog_vmap_probe_show( feet ) }` )

				must(
					!!page && !!top && !!tools && !!trunk && !!inner && !!feet,
					`${ at } у страницы ${ name } нет всех зон: ${ $bog_vmap_probe_zones.filter( part => !zone( part ) ).join( ', ' ) }`,
				)

				want( page!.width > 0 && page!.height > 0, `${ at } страница ${ name } пустая: ${ $bog_vmap_probe_show( page ) }` )
				want(
					$bog_probe_aligned( top, page, 'top' ),
					`${ at } шапка ${ name } не по верху страницы: ${ Math.round( top!.top ) } против ${ Math.round( page!.top ) }`,
				)
				want(
					$bog_vmap_probe_close( trunk!.top, top!.bottom ),
					`${ at } тело ${ name } не под шапкой: ${ Math.round( trunk!.top ) } против ${ Math.round( top!.bottom ) }`,
				)
				want(
					$bog_vmap_probe_close( top!.height + trunk!.height + feet!.height, page!.height ),
					`${ at } шапка ${ Math.round( top!.height ) } плюс тело ${ Math.round( trunk!.height ) } плюс подвал ${ Math.round( feet!.height ) } не дают высоту страницы ${ name } ${ Math.round( page!.height ) }`,
				)
				want(
					got.feet[ name ] === 0 && feet!.height === 0 && feet!.width === 0,
					`${ at } пустой подвал ${ name } занимает место: ${ got.feet[ name ] } узлов, ${ $bog_vmap_probe_show( feet ) }`,
				)
				want(
					$bog_probe_inside( tools, top ),
					`${ at } полоса кнопок ${ name } вылезла из шапки: ${ $bog_vmap_probe_show( tools ) } против ${ $bog_vmap_probe_show( top ) }`,
				)

			}

			const head_of = ( name: string )=> Math.round( box( `${ name }_head` )?.height ?? -1 )
			const heads = panels.map( name => `${ name } ${ head_of( name ) }, строк ${ got.lines[ name ] }` ).join( '; ' )
			const first = head_of( panels[ 0 ] ?? '' )

			say( `${ at } шапки панелей ${ heads }` )

			want(
				panels.every( name => got.lines[ name ] === 1 ),
				`${ at } шапка панели легла не в одну строку: ${ heads }`,
			)
			want(
				panels.every( name => $bog_vmap_probe_close( head_of( name ), first, 16 ) ),
				`${ at } шапки панелей разной высоты: ${ heads }`,
			)

		}

		await $bog_vmap_probe_fold( root, say, want )
		await $bog_vmap_probe_menu( root, say, want )
		await $bog_vmap_probe_focus( root, say, want )

		if( broken.length ) return $mol_fail( new Error(
			`Проба ровности, поломок ${ broken.length }:\n` + broken.join( '\n' )
		) )

		say( `${ $bog_vmap_probe_ok }, весь прогон ${ Date.now() - began } мс` )

		return lines.join( '\n' )
	}

}
