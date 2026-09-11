namespace $ {

	export type $bog_vmap_app_shelf_item = {

		readonly id: string

		readonly title: string

		readonly hint: string

		readonly source: string

	}

	const $bog_vmap_app_shelf_head = '$bog_vmap_app_shelf_draft $mol_view'

	const $bog_vmap_app_shelf_pack = '$bog_vmap' + '_part'

	export function $bog_vmap_app_shelf_short( klass: string ) {
		const short = klass.replace( /^\$/, '' ).replace( /^\w+?_/, '' )
		return short.slice( 0, 1 ).toUpperCase() + short.slice( 1 )
	}

	export function $bog_vmap_app_shelf_needs( source: string ) {
		const draft = $bog_vmap_app_shelf_head.split( ' ' )[ 0 ]
		return [ ... new Set( source.match( /\$[a-z][\w]*/g ) ?? [] ) ].filter( name => name !== draft )
	}

	export function $bog_vmap_app_shelf_single( klass: string ) {
		const name = $bog_vmap_app_shelf_short( klass )
		return `${ $bog_vmap_app_shelf_head }\n\t${ name } ${ klass }\n\tsub /\n\t\t<= ${ name }\n`
	}

	function $bog_vmap_app_shelf_inputs(): readonly $bog_vmap_app_shelf_item[] {

		const mol = '$mol' + '_'

		return ( [
			[ 'string', 'Поле', 'Строка. Порт `value` отдаёт набранное' ],
			[ 'number', 'Число', 'Число. Порт `value` отдаёт его как число' ],
			[ 'select', 'Выбор', 'Список вариантов, порт `value` отдаёт выбранный' ],
			[ 'switch', 'Переключатель', 'Несколько вариантов в ряд, порт `value`' ],
			[ 'check_box', 'Флажок', 'Да или нет, порт `checked`' ],
			[ 'paragraph', 'Текст', 'Абзац текста, порт `title` принимает провод' ],
		] as const ).map( ( [ name, title, hint ] )=> ({
			id: 'input_' + name,
			title,
			hint,
			source: $bog_vmap_app_shelf_single( mol + name ),
		}) )

	}

	export type $bog_vmap_app_shelf_pack_offer = {

		readonly id: string

		readonly title: string

		readonly hint: string

		readonly link: string

	}

	export function $bog_vmap_app_shelf_packs(): readonly $bog_vmap_app_shelf_pack_offer[] {
		return [

			{
				id: 'part',
				title: 'Детали vmap',
				hint: 'Пак этого редактора: калькулятор, карта, ячейка, график и примитивы под ними',
				link: '',
			},

			{
				id: 'builderui',
				title: 'Builderui',
				hint: 'Набор интерфейсных компонентов: карточки, кнопки, диалоги, вкладки, график',
				link: 'https://b-on-g.github.io/builderui/',
			},

		]
	}

	export function $bog_vmap_app_shelf_pack_swap( links: string, link: string ) {

		const stale = $bog_vmap_lib_links_parse( links ).pack
		const rest = links.split( /[,\s]+/ ).filter( token => token && token !== stale )

		return [ ... link ? [ link ] : [], ... rest ].join( ', ' )
	}

	export function $bog_vmap_app_shelf_presets(): readonly $bog_vmap_app_shelf_item[] {

		const pack = $bog_vmap_app_shelf_pack
		const head = $bog_vmap_app_shelf_head

		return [

			{
				id: 'block',
				title: 'Блок',
				hint: 'Пустой прямоугольник. Внутрь него кладутся другие детали',
				source: head
					+ '\n\tBlock $mol_view'
					+ '\n\t\tstyle *'
					+ '\n\t\t\tminWidth \\160px'
					+ '\n\t\t\tminHeight \\96px'
					+ '\n\t\t\tbackground \\#ffffff'
					+ '\n\t\tsub /'
					+ '\n\tsub /'
					+ '\n\t\t<= Block\n',
			},

			{
				id: 'cell',
				title: 'Ячейка кода',
				hint: 'Тело функции, кнопка «Выполнить» и время. Ответ уходит проводом',
				source: `${ head }\n\tCell ${ pack }_cell\n\tsub /\n\t\t<= Cell\n`,
			},

			{
				id: 'plot',
				title: 'График',
				hint: 'Приёмник: числа приходят проводом, линия рисуется по ним',
				source: `${ head }\n\tPlot ${ pack }_plot\n\tsub /\n\t\t<= Plot\n`,
			},

			{
				id: 'calc',
				title: 'Калькулятор',
				hint: 'Два числа, действие и результат. Результат отдаётся проводом',
				source: `${ head }\n\tCalc ${ pack }_calc\n\tsub /\n\t\t<= Calc\n`,
			},

			{
				id: 'map',
				title: 'Карта',
				hint: 'Карта с масштабом, центром и меткой. Каждый порт принимает провод',
				source: `${ head }\n\tMap ${ pack }_map\n\tsub /\n\t\t<= Map\n`,
			},

			{
				id: 'pair',
				title: 'Калькулятор и карта',
				hint: 'Пример связи: результат калькулятора управляет масштабом карты',
				source: head
					+ '\n\tzoom_of_calc = Calc result'
					+ `\n\tCalc ${ pack }_calc`
					+ `\n\tMap ${ pack }_map`
					+ '\n\t\tzoom <= zoom_of_calc'
					+ '\n\tPair $mol_view'
					+ '\n\t\tstyle *'
					+ '\n\t\t\tflexDirection \\column'
					+ '\n\t\tsub /'
					+ '\n\t\t\t<= Calc'
					+ '\n\t\t\t<= Map'
					+ '\n\tsub /'
					+ '\n\t\t<= Pair\n',
			},

			... $bog_vmap_app_shelf_inputs(),

		]
	}

	export type $bog_vmap_app_shelf_file = {
		readonly name: string
		readonly text: string
	}

	export type $bog_vmap_app_shelf_intake = {

		readonly classes: readonly {
			readonly tree: string
			readonly css: string
		}[]

		readonly refused: readonly {
			readonly name: string
			readonly reason: string
		}[]

	}

	export const $bog_vmap_app_shelf_refuse = {

		kind: 'принимаем только .view.tree. Поведение модуля — TypeScript, а песочница'
			+ ' исполняет JavaScript: компонент с кодом приезжает адресом приложения',

		built: 'это дерево классов собранного пака целиком. Подключите его адресом,'
			+ ' тогда приедет и поведение',

		empty: 'ни одного класса: объявление начинается с имени на доллар',

	} as const

	export function $bog_vmap_app_shelf_intake(
		this: $,
		files: readonly $bog_vmap_app_shelf_file[],
	): $bog_vmap_app_shelf_intake {

		const classes = [] as { tree: string, css: string }[]
		const refused = [] as { name: string, reason: string }[]

		const styles = new Map< string, string >()

		for( const file of files ) {
			const base = /^(.*)\.view\.css$/.exec( file.name )?.[ 1 ]
			if( base ) styles.set( base, file.text )
		}

		for( const file of files ) {

			if( /\.view\.css$/.test( file.name ) ) continue

			if( /(^|\/)web\.view\.tree$/.test( file.name ) ) {
				refused.push({ name: file.name, reason: $bog_vmap_app_shelf_refuse.built })
				continue
			}

			if( !/\.view\.tree$/.test( file.name ) ) {
				refused.push({ name: file.name, reason: $bog_vmap_app_shelf_refuse.kind })
				continue
			}

			const kids = this.$mol_tree2_from_string(
				file.text.replace( /\n?$/, '\n' ), file.name,
			).kids.filter( kid => kid.type[ 0 ] === '$' )

			if( !kids.length ) {
				refused.push({ name: file.name, reason: $bog_vmap_app_shelf_refuse.empty })
				continue
			}

			const css = styles.get( file.name.replace( /\.view\.tree$/, '' ) ) ?? ''

			kids.forEach( ( kid, i )=> classes.push({
				tree: kid.toString(),
				css: i ? '' : css,
			}) )

		}

		return { classes, refused }
	}

	export function $bog_vmap_app_shelf_intake_note( taken: $bog_vmap_app_shelf_intake ) {
		return taken.refused.map( item => `${ item.name }: ${ item.reason }` ).join( '\n' )
	}

	export function $bog_vmap_app_shelf_refs(
		tree: $mol_tree2,
		names: ReadonlyMap< string, string >,
	): $mol_tree2 {

		if( tree.type === '<=' || tree.type === '<=>' ) {

			const ref = tree.kids[ 0 ]
			const next = ref && names.get( ref.type )

			if( ref && next ) return tree.clone([ ref.struct( next, ref.kids ) ])

		}

		return tree.clone( tree.kids.map( kid => $bog_vmap_app_shelf_refs( kid, names ) ) )
	}

	export function $bog_vmap_app_shelf_apply(
		this: $,
		node: $bog_vmap_lang_node,
		source: string,
		free: ( name: string )=> string,
	): readonly string[] {

		const preset = $bog_vmap_lang_node.make({
			$: this,
			source: ()=> source,
		})

		const names = new Map< string, string >()

		for( const part of preset.part_names() ) {

			const klass = preset.prop_decl( part )?.kids[ 0 ]
			if( !klass ) continue

			const name = free( part )
			names.set( part, name )

			node.part_add( name, klass.type )

		}

		const wired = new Set( preset.wires().map( wire => wire.name ) )

		for( const [ part, name ] of names ) {

			const klass = preset.prop_decl( part )?.kids[ 0 ]
			if( !klass ) continue

			for( const over of klass.kids ) {

				const op = over.kids[ 0 ]
				const ref = op?.kids[ 0 ]

				const feeds = ( op?.type === '<=' || op?.type === '<=>' )
					&& Boolean( ref )
					&& !ref!.kids.length
					&& wired.has( this.$mol_view_tree2_prop_parts( ref! ).name )

				if( feeds ) continue

				node.over_set(
					name,
					this.$mol_view_tree2_prop_parts( over ).name,
					$bog_vmap_app_shelf_refs( over, names ),
				)

			}

		}

		for( const link of preset.links() ) {

			const from = names.get( link.from )
			const to = names.get( link.to )
			if( !from || !to ) continue

			node.link_add({
				from,
				from_prop: link.from_prop,
				to,
				to_prop: link.to_prop,
				bidi: link.bidi,
			})

		}

		return ( preset.sub_names( '' ) ?? [] )
			.map( ref => names.get( ref ) ?? '' )
			.filter( Boolean )
	}

}
