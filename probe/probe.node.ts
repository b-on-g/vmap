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

	export const $bog_vmap_probe_left = [ 'scenes', 'left_tabs', 'layers', 'shelf' ]

	export type $bog_vmap_probe_mode = 'plain' | 'open' | 'long' | 'assets'

	export const $bog_vmap_probe_passes: readonly { readonly width: number, readonly mode: $bog_vmap_probe_mode, readonly note: string }[] = [
		{ width: 1280, mode: 'plain', note: '' },
		{ width: 1280, mode: 'long', note: ' с длинным списком сцен' },
		{ width: 1280, mode: 'assets', note: ' на вкладке «Ассеты»' },
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

	export function $bog_vmap_probe_ready() {
		const d = '$'
		return `typeof $ !== 'undefined' && $[ ${ JSON.stringify( d + 'bog_vmap_app' ) } ].Root( 0 ).Pane().warmed()`
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
				kid => ${ JSON.stringify( $bog_vmap_probe_columns ) }.find( name => kid.hasAttribute( 'bog_vmap_app_' + name ) ) || '?'
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
			ready: $bog_vmap_probe_ready(),
			width,
			height,
			limit: 150000,
			script: $bog_vmap_probe_script( $bog_vmap_probe_selectors(), mode ),
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

			const columns = width === 400 && !open ? [ 'canvas' ] : $bog_vmap_probe_columns

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

		if( broken.length ) return $mol_fail( new Error(
			`Проба ровности, поломок ${ broken.length }:\n` + broken.join( '\n' )
		) )

		say( `${ $bog_vmap_probe_ok }, весь прогон ${ Date.now() - began } мс` )

		return lines.join( '\n' )
	}

}
