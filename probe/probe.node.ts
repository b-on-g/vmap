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

	export const $bog_vmap_probe_names = [ 'scenes', 'shelf', 'canvas', 'idle' ]

	export const $bog_vmap_probe_zones = [ 'head', 'tools', 'body', 'body_content', 'foot' ]

	export type $bog_vmap_probe_settle = {
		readonly waited: number
		readonly left: number
		readonly max: number
		readonly width: number
		readonly frame: number
	}

	export type $bog_vmap_probe_result = $bog_probe_rects_result & {
		readonly settle: $bog_vmap_probe_settle
		readonly rows: { readonly [ top: string ]: number }
		readonly tools: number
		readonly span: number
		readonly feet: { readonly [ name: string ]: number }
		readonly pages: readonly $bog_probe_rect[]
	}

	export function $bog_vmap_probe_ready() {
		const d = '$'
		return `typeof $ !== 'undefined' && $[ ${ JSON.stringify( d + 'bog_vmap_app' ) } ].Root( 0 ).Pane().warmed()`
	}

	export function $bog_vmap_probe_selectors() {
		const list = [] as string[]
		for( const name of $bog_vmap_probe_names ) {
			list.push( `[bog_vmap_app_${ name }]` )
			for( const zone of $bog_vmap_probe_zones ) list.push( `[bog_vmap_app_${ name }_${ zone }]` )
		}
		list.push( '[bog_vmap_app_pane]', '[bog_vmap_app_pane_scene]' )
		return list
	}

	export function $bog_vmap_probe_script( selectors: readonly string[] ) {
		return `
			const book = document.querySelector( '[bog_vmap_app]' )
			const wait = ms => new Promise( done => setTimeout( done, ms ) )
			let left = -1
			let waited = 0
			while( waited < 10000 ) {
				left = Math.round( book.scrollLeft )
				if( left === book.scrollWidth - book.clientWidth ) break
				await wait( 100 )
				waited += 100
			}
			const base = (()=>{ ${ $bog_probe_rects_script( selectors ) } })()
			const rows = {}
			const tools = document.querySelector( '[bog_vmap_app_canvas_tools]' )
			const kids = tools ? [ ... tools.children ] : []
			let span = 0
			for( const kid of kids ) {
				const box = kid.getBoundingClientRect()
				const top = Math.round( box.top )
				rows[ top ] = ( rows[ top ] || 0 ) + 1
				span += box.width
			}
			const feet = {}
			for( const name of ${ JSON.stringify( $bog_vmap_probe_names ) } ) {
				const foot = document.querySelector( '[bog_vmap_app_' + name + '_foot]' )
				feet[ name ] = foot ? foot.childElementCount : -1
			}
			const pages = [ ... book.children ].map( kid => {
				const box = kid.getBoundingClientRect()
				return {
					left: box.left, top: box.top, width: box.width, height: box.height, right: box.right, bottom: box.bottom,
				}
			} )
			return {
				rects: base.rects,
				viewport: base.viewport,
				scroll: base.scroll,
				settle: { waited, left, max: book.scrollWidth - book.clientWidth, width: book.scrollWidth, frame: book.clientWidth },
				rows,
				tools: kids.length,
				span: Math.round( span ),
				feet,
				pages,
			}
		`
	}

	export async function $bog_vmap_probe_look( root: string, width: number, height: number ) {
		const got = await $bog_probe_run({
			root,
			page: $bog_vmap_probe_page,
			ready: $bog_vmap_probe_ready(),
			width,
			height,
			limit: 150000,
			script: $bog_vmap_probe_script( $bog_vmap_probe_selectors() ),
		})
		if( got === $bog_probe_skip ) return $bog_probe_skip
		return got as $bog_vmap_probe_result
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

	export function $bog_vmap_probe_seen( pages: readonly $bog_probe_rect[], width: number ) {
		return pages.filter( page => page.right > .5 && page.left < width - .5 )
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

		for( const width of [ 1280, 400 ] ) {

			const got = await $bog_vmap_probe_look( root, width, 800 )

			if( got === $bog_probe_skip ) { say( $bog_probe_skip ); return lines.join( '\n' ) }

			const at = `${ width }:`
			const rects = got.rects
			const box = ( selector: string )=> rects[ selector ] ?? null

			say( `${ at } книга ${ got.settle.width } в окне ${ got.settle.frame }, прокрутка ${ got.settle.left } из ${ got.settle.max } за ${ got.settle.waited } мс, страниц ${ got.pages.length }, видно ${ $bog_vmap_probe_seen( got.pages, got.viewport.width ).length }, документ ${ got.scroll.width }×${ got.scroll.height }, вьюпорт ${ got.viewport.width }×${ got.viewport.height }` )

			want(
				$bog_probe_fits( got ),
				`${ at } горизонтальная прокрутка документа ${ got.scroll.width } > ${ got.viewport.width }`,
			)
			want(
				$bog_vmap_probe_close( got.settle.left, got.settle.max ),
				`${ at } книга не доехала до последней страницы: прокрутка ${ got.settle.left } из ${ got.settle.max }`,
			)
			want(
				got.pages.length === $bog_vmap_probe_names.length,
				`${ at } страниц в книге ${ got.pages.length }, а не ${ $bog_vmap_probe_names.length }`,
			)

			const last = got.pages[ got.pages.length - 1 ] ?? null
			must( !!last, `${ at } у книги нет страниц` )
			want(
				$bog_vmap_probe_close( last!.right, got.viewport.width ),
				`${ at } последняя страница обрезана справа: правый край ${ Math.round( last!.right ) } при вьюпорте ${ got.viewport.width }`,
			)

			for( const name of $bog_vmap_probe_names ) {

				const page = box( `[bog_vmap_app_${ name }]` )
				const head = box( `[bog_vmap_app_${ name }_head]` )
				const body = box( `[bog_vmap_app_${ name }_body]` )
				const content = box( `[bog_vmap_app_${ name }_body_content]` )
				const foot = box( `[bog_vmap_app_${ name }_foot]` )
				const tools = box( `[bog_vmap_app_${ name }_tools]` )

				say( `${ at } ${ name } страница ${ $bog_vmap_probe_show( page ) }, шапка ${ $bog_vmap_probe_show( head ) }, полоса кнопок ${ $bog_vmap_probe_show( tools ) }, тело ${ $bog_vmap_probe_show( body ) }, содержимое ${ $bog_vmap_probe_show( content ) }, подвал ${ $bog_vmap_probe_show( foot ) }` )

				must(
					!!page && !!head && !!body && !!content && !!foot && !!tools,
					`${ at } у страницы ${ name } нет всех зон: ${ $bog_vmap_probe_selectors().filter( selector => selector.includes( name ) && !rects[ selector ] ).join( ', ' ) }`,
				)

				want( page!.width > 0 && page!.height > 0, `${ at } страница ${ name } пустая: ${ $bog_vmap_probe_show( page ) }` )
				want(
					$bog_vmap_probe_close( page!.height, got.viewport.height ),
					`${ at } страница ${ name } высотой ${ Math.round( page!.height ) } при вьюпорте ${ got.viewport.height }`,
				)
				want(
					$bog_probe_aligned( head, page, 'top' ),
					`${ at } шапка ${ name } не по верху страницы: ${ Math.round( head!.top ) } против ${ Math.round( page!.top ) }`,
				)
				want(
					$bog_vmap_probe_close( body!.top, head!.bottom ),
					`${ at } тело ${ name } не под шапкой: ${ Math.round( body!.top ) } против ${ Math.round( head!.bottom ) }`,
				)
				want(
					$bog_vmap_probe_close( head!.height + body!.height + foot!.height, page!.height ),
					`${ at } шапка ${ Math.round( head!.height ) } плюс тело ${ Math.round( body!.height ) } плюс подвал ${ Math.round( foot!.height ) } не дают высоту страницы ${ name } ${ Math.round( page!.height ) }`,
				)
				const kids = got.feet[ name ] ?? -1

				if( name === 'canvas' ) {
					want(
						kids === 1,
						`${ at } в подвале Холста ${ kids } узлов вместо одного, статуса`,
					)
					want(
						foot!.height > 0 && foot!.height <= 64,
						`${ at } подвал Холста высотой ${ Math.round( foot!.height ) }, ждали не больше строки: ${ $bog_vmap_probe_show( foot ) }`,
					)
				} else {
					want(
						kids === 0 && foot!.height === 0 && foot!.width === 0,
						`${ at } пустой подвал ${ name } занимает место: ${ kids } узлов, ${ $bog_vmap_probe_show( foot ) }`,
					)
				}
				want(
					$bog_probe_inside( tools, head ),
					`${ at } полоса кнопок ${ name } вылезла из шапки: ${ $bog_vmap_probe_show( tools ) } против ${ $bog_vmap_probe_show( head ) }`,
				)

			}

			for( let index = 1; index < $bog_vmap_probe_names.length; ++ index ) {

				const early = $bog_vmap_probe_names[ index - 1 ]
				const later = $bog_vmap_probe_names[ index ]
				const before = box( `[bog_vmap_app_${ early }]` )
				const after = box( `[bog_vmap_app_${ later }]` )

				want(
					$bog_probe_beside( before, after, 1 ),
					`${ at } страницы ${ early } и ${ later } не стоят в ряд: ${ $bog_vmap_probe_show( before ) } и ${ $bog_vmap_probe_show( after ) }`,
				)
				want(
					$bog_probe_aligned( before, after, 'top' ),
					`${ at } страницы ${ early } и ${ later } разошлись по верху: ${ $bog_vmap_probe_show( before ) } и ${ $bog_vmap_probe_show( after ) }`,
				)

			}

			const hole = box( '[bog_vmap_app_canvas_body_content]' )
			const pane = box( '[bog_vmap_app_pane]' )
			const scene = box( '[bog_vmap_app_pane_scene]' )

			say( `${ at } холст ${ $bog_vmap_probe_show( pane ) }, кадр ${ $bog_vmap_probe_show( scene ) }, тело Холста ${ $bog_vmap_probe_show( hole ) }, шире тела на ${ Math.round( ( pane?.width ?? 0 ) - ( hole?.width ?? 0 ) ) }` )

			must( !!pane && !!scene && !!hole, `${ at } холста, кадра сцены или тела Холста нет в разметке` )

			want(
				$bog_probe_aligned( pane, hole, 'top' ),
				`${ at } холст не начинается с тела своей страницы: ${ Math.round( pane!.top ) } против ${ Math.round( hole!.top ) }`,
			)
			want(
				$bog_vmap_probe_close( pane!.height, hole!.height ),
				`${ at } холст не занимает тело страницы по высоте: ${ Math.round( pane!.height ) } из ${ Math.round( hole!.height ) }`,
			)
			want(
				$bog_probe_inside( scene, pane ),
				`${ at } кадр сцены вылез за холст: ${ $bog_vmap_probe_show( scene ) } против ${ $bog_vmap_probe_show( pane ) }`,
			)

			const rows = $bog_vmap_probe_rows( got.rows )
			const shown = rows.map( row => `${ row[ 0 ] }: ${ row[ 1 ] }` ).join( ', ' )
			const spare = Math.round( got.viewport.width - ( box( '[bog_vmap_app_canvas]' )?.width ?? 0 ) )

			say( `${ at } кнопок Холста ${ got.tools }, строк ${ rows.length } — ${ shown }, полосе нужно ${ got.span }, странице Холста до крышки вьюпорта ${ spare }` )

			if( width === 1280 ) {

				want(
					rows.length === 1,
					`${ at } кнопки Холста легли в ${ rows.length } строк при ${ got.tools } кнопках: ${ shown }, полосе нужно ${ got.span }, запаса до крышки было ${ spare }`,
				)
				want(
					$bog_probe_inside( pane, hole ),
					`${ at } холст вылез за тело своей страницы: ${ $bog_vmap_probe_show( pane ) } против ${ $bog_vmap_probe_show( hole ) }`,
				)

			}

			if( width === 400 ) {
				const seen = $bog_vmap_probe_seen( got.pages, got.viewport.width )
				want( seen.length === 1, `${ at } книга показывает ${ seen.length } страниц вместо одной` )
			}

		}

		if( broken.length ) return $mol_fail( new Error(
			`Проба ровности, поломок ${ broken.length }:\n` + broken.join( '\n' )
		) )

		say( `${ $bog_vmap_probe_ok }, весь прогон ${ Date.now() - began } мс` )

		return lines.join( '\n' )
	}

}
