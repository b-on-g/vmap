namespace $ {

	/**
	 * One thing on the shelf: a ready made piece of a document.
	 *
	 * `source` is a whole `view.tree` class whose properties are the parts, their
	 * overrides and their wires. A plain block is one property of it, a calculator
	 * wired to a map is four, and a class picked from the second level of the panel
	 * is a class built on the spot. So the shelf carries one kind of thing and the
	 * canvas takes it one way, whatever the item came from.
	 *
	 * @see ../../ARCHITECTURE.md section 5
	 */
	export type $bog_vmap_app_shelf_item = {

		/** Stable key of the item, for the row and for the drag. */
		readonly id: string

		/** What the row says. */
		readonly title: string

		/** What the row says on hover, one sentence. */
		readonly hint: string

		/** The piece itself, a `view.tree` class. */
		readonly source: string

	}

	/**
	 * Class header a preset is written under.
	 *
	 * The model of a document parses a class, not a loose body, so a preset needs a
	 * header; nothing ever compiles or exports it. The name points at a folder that
	 * does not exist under this module, so the dependency graph of mam, which reads
	 * string literals, resolves it to this very module and pulls nothing new in.
	 */
	const $bog_vmap_app_shelf_head = '$bog_vmap_app_shelf_draft $mol_view'

	/**
	 * Namespace of the pack of parts, spelled in two pieces on purpose.
	 *
	 * The pack is a DEPLOYED donor reached by address: its classes are fetched and
	 * compiled inside the sandbox, never linked here. Written whole, the name would
	 * be read by the dependency graph of mam as an import and would pull the whole
	 * pack into the bundle of the editor, which today mentions it zero times.
	 */
	const $bog_vmap_app_shelf_pack = '$bog_vmap' + '_part'

	/**
	 * Name a part of this class would take: `$mol_button_minor` gives
	 * `Button_minor`.
	 *
	 * The namespace prefix goes because every class of a pack carries the same one,
	 * so it makes the names longer without making them more distinct. Free or taken
	 * is not decided here: the document knows what it already carries.
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
	 * The shelf as it comes out of the box.
	 *
	 * Four items and no more: a person opening the editor has to see things they
	 * recognise, not a catalogue. Everything else arrives by address or by file and
	 * lands in the same list.
	 *
	 * The pair is here because a wire is the point of the tool and is the one thing
	 * nobody guesses on their own: it lies down as ONE node holding both parts, so
	 * that a single gesture leaves a working pair on the canvas rather than two
	 * pieces to arrange.
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
				id: 'calc',
				title: 'Калькулятор',
				hint: 'Два числа, действие и результат. Результат отдаётся проводом',
				source: `${ head }\n\tCalc ${ pack }_calc\n\tsub /\n\t\t<= Calc\n`,
			},

			{
				id: 'map',
				title: 'Карта',
				hint: 'Карта с масштабом, центром и меткой. Каждый порт принимает провод',
				source: head
					+ `\n\tMap ${ pack }_map`
					+ '\n\t\tstyle *'
					+ '\n\t\t\tminWidth \\320px'
					+ '\n\t\t\tminHeight \\240px'
					+ '\n\tsub /'
					+ '\n\t\t<= Map\n',
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
					+ '\n\t\tstyle *'
					+ '\n\t\t\tminWidth \\320px'
					+ '\n\t\t\tminHeight \\240px'
					+ '\n\tPair $mol_view'
					+ '\n\t\tstyle *'
					+ '\n\t\t\tflexDirection \\column'
					+ '\n\t\tsub /'
					+ '\n\t\t\t<= Calc'
					+ '\n\t\t\t<= Map'
					+ '\n\tsub /'
					+ '\n\t\t<= Pair\n',
			},

		]
	}

	/**
	 * Renames references to parts inside an override, wherever they sit.
	 *
	 * A preset names its parts `Calc` and `Map`; the document may already carry
	 * both, so every part is declared under a free name and every reference to it
	 * has to follow. Only the child of a `<=` or `<=>` is touched, which is what a
	 * reference is; data and everything else comes through untouched.
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
	 * Lays a shelf item into a document and answers with the names it left at the
	 * top level, in the order the preset listed them.
	 *
	 * Placement is NOT done here: whether those names go onto the canvas by a
	 * coordinate or into the tree of an artboard is a question about the canvas, and
	 * the canvas answers it. This function knows the document alone.
	 *
	 * Free names come from the caller, one at a time and in order, because every
	 * declaration changes what is taken: the document is asked again after each.
	 *
	 * Wires go in through `link_add` and their consuming overrides are deliberately
	 * NOT copied — `link_add` writes both ends itself, and copying one of them would
	 * mean two ways of writing a wire, drifting apart at the first fix to either.
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

		// Declared first and all of them, so that a name taken by one part cannot be
		// handed to the next, and so that a wire finds both of its ends in place.
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
