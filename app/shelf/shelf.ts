namespace $ {

	/**
	 * A ready made piece of a document, as the text of a `view.tree` class.
	 *
	 * ONE kind of thing, so the canvas takes them all one way: a plain block, a
	 * wired pair and a class picked from the second level of the panel differ only
	 * in how many properties the text has.
	 *
	 * @see ../../ARCHITECTURE.md section 5
	 */
	export type $bog_vmap_app_shelf_item = {

		/** Stable key, for the row and for the drag. */
		readonly id: string

		readonly title: string

		readonly hint: string

		readonly source: string

	}

	/**
	 * Class header a preset is written under: the document model parses a class,
	 * not a loose body. Nothing ever compiles or exports it.
	 */
	const $bog_vmap_app_shelf_head = '$bog_vmap_app_shelf_draft $mol_view'

	/**
	 * Spelled in two pieces on purpose. The pack is a DEPLOYED donor reached by
	 * address and compiled inside the sandbox; written whole, the name would be
	 * read as an import by the dependency graph of mam, which parses string
	 * literals, and would pull the whole pack into the bundle of the editor.
	 */
	const $bog_vmap_app_shelf_pack = '$bog_vmap' + '_part'

	/**
	 * Name a part of this class would take: a button of mol gives `Button_minor`.
	 * The namespace prefix goes because every class of a pack carries the same one.
	 * Free or taken is not decided here: the document knows what it already carries.
	 */
	export function $bog_vmap_app_shelf_short( klass: string ) {
		const short = klass.replace( /^\$/, '' ).replace( /^\w+?_/, '' )
		return short.slice( 0, 1 ).toUpperCase() + short.slice( 1 )
	}

	/** A preset made of one class of the library, as the second level hands it over. */
	export function $bog_vmap_app_shelf_single( klass: string ) {
		const name = $bog_vmap_app_shelf_short( klass )
		return `${ $bog_vmap_app_shelf_head }\n\t${ name } ${ klass }\n\tsub /\n\t\t<= ${ name }\n`
	}

	/**
	 * Widgets of input, each with a port a wire can take. Classes of mol and
	 * nothing of ours, so the pack does not grow by them; names split for the
	 * reason given at the pack above.
	 */
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

	/**
	 * A handful of things a person recognises, not a catalogue, and the order is a
	 * choice. The code cell first, because it is what a board is built out of and
	 * without it a shelf is a display case. The pair, because a wire is the point
	 * of the editor and the one thing nobody guesses on their own — it lies down as
	 * ONE node holding both parts, so a single gesture leaves a working pair rather
	 * than two pieces to arrange. The inputs last, because they drive everything
	 * above them.
	 */
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

	/** A file brought from the disk. */
	export type $bog_vmap_app_shelf_file = {
		readonly name: string
		readonly text: string
	}

	/** What the files gave, and what was refused with the reason in the user's words. */
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

	/**
	 * In one place so the tests and the panel agree.
	 *
	 * A module is two kinds of text and only one of them can be taken: the
	 * declarations compile in the sandbox as they are, while the behaviour is
	 * TypeScript and what runs a component's body there is JavaScript. There is no
	 * compiler in the page, and pretending otherwise would mean a component that
	 * arrives looking whole and does nothing.
	 */
	export const $bog_vmap_app_shelf_refuse = {

		kind: 'принимаем только .view.tree. Поведение модуля — TypeScript, а песочница'
			+ ' исполняет JavaScript: компонент с кодом приезжает адресом приложения',

		built: 'это дерево классов собранного пака целиком. Подключите его адресом,'
			+ ' тогда приедет и поведение',

		empty: 'ни одного класса: объявление начинается с имени на доллар',

	} as const

	/**
	 * ONE component per class, and not one per file, because a component of a
	 * library is one class and the library resolves neighbours by name. A whole
	 * module folder goes in at once for the same reason: every declaration lands in
	 * one library, which is one namespace, so a component still inherits its
	 * neighbour.
	 *
	 * A plain `.view.css` beside a tree comes along, because it is a stylesheet and
	 * not a program; a `.view.css.ts` is refused like any other program.
	 *
	 * Declarations go out as their author wrote them: what a person brought from
	 * their own module is theirs, and the editor normalizes a document only when
	 * the document is edited.
	 */
	export function $bog_vmap_app_shelf_intake(
		this: $,
		files: readonly $bog_vmap_app_shelf_file[],
	): $bog_vmap_app_shelf_intake {

		const classes = [] as { tree: string, css: string }[]
		const refused = [] as { name: string, reason: string }[]

		// Styles first, so one is found whatever order the files came in.
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

			// To the FIRST class of the file: a stylesheet belongs to a module, a
			// module names itself by its main class, and splitting one between
			// classes would take guessing.
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

	/**
	 * A preset names its parts itself and the document may already carry those
	 * names, so every part is declared under a free one and every reference has to
	 * follow. Only the child of a binding operator is touched, which is what a
	 * reference is; data comes through untouched.
	 */
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

	/**
	 * Lays a shelf item into a document and answers with the names it left loose.
	 * Placement is NOT done here: whether those names go onto the canvas by a
	 * coordinate or into the tree of an artboard is a question about the canvas,
	 * and the canvas answers it. This function knows the document alone.
	 *
	 * Free names come from the caller one at a time, because every declaration
	 * changes what is taken.
	 *
	 * Wires go in through the model's own `link_add`, and the overrides that
	 * consume them are deliberately NOT copied: that method writes both ends
	 * itself, and copying one would leave two ways of writing a wire to drift
	 * apart at the first fix to either.
	 */
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

		// All of them first, so a name taken by one part cannot be handed to the
		// next and a wire finds both of its ends in place.
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
