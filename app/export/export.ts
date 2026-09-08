namespace $ {

	/**
	 * Export of a document as a real MAM module.
	 *
	 * Not an abstract «project»: the output is a folder that drops into `bog/` and
	 * builds with `npx mam` untouched. That is the acceptance criterion of the
	 * stage, and it is also what closes the circle of section 5 — a built module is
	 * a donor pack, so anything assembled here becomes a component library for the
	 * next document.
	 *
	 * Pure functions over text. Knows nothing of Giper Baza and nothing of the DOM,
	 * so the caller maps its stored nodes onto `doc_export_node` and gets files back.
	 *
	 * @see ../../ARCHITECTURE.md section 10
	 */

	/** One class of the document, as the three sources the editor keeps. */
	export type $bog_vmap_app_export_node = {

		/** `view.tree` declaration. Carries the class name in its first token. */
		readonly source: string

		/** Hand written class body: method definitions, no wrapping class. */
		readonly js?: string

		/** Raw CSS. */
		readonly css?: string

	}

	/**
	 * One file of the module.
	 *
	 * Text only for now. Assets arrive at stage 5.1 as separate blob lands, and
	 * they will need a binary sibling of this type plus an `assets/` prefix in the
	 * name — the shape is a flat list of named files precisely so that adding them
	 * appends entries instead of reworking the result.
	 */
	export type $bog_vmap_app_export_file = {
		readonly name: string
		readonly text: string
	}

	export type $bog_vmap_app_export_module = {

		/** Folder the module must be placed at, relative to the MAM root. */
		readonly path: string

		/** Last segment of the path, and the base name of every source file. */
		readonly name: string

		/** Class instantiated by `index.html`. */
		readonly root: string

		readonly files: readonly $bog_vmap_app_export_file[]

	}

	/**
	 * Folder the classes of a document oblige it to live in.
	 *
	 * Section 10 says the export is a MAM module and says nothing about where it
	 * goes, but the two are not independent: mam turns a class name into a path by
	 * replacing every underscore with a slash, so a document placed anywhere else
	 * fails to build while looking perfectly correct. The document therefore names
	 * its own folder, by the longest common prefix of its class names.
	 *
	 * A lone `bog_site_page` gives `bog/site/page`; together with `bog_site_hero`
	 * it gives `bog/site`. Both resolve, because a missing last segment collapses
	 * onto the longest existing prefix — the same rule that makes demo classes safe
	 * to name after their own module.
	 *
	 * A prefix shorter than two segments means classes from different packs, or a
	 * module at the root of a pack. Refused: renaming the user's classes to fit
	 * would break «byte for byte from the editor», and emitting them as they are
	 * would produce a folder that does not build.
	 *
	 * **What this cannot check: whether the root pack exists.** Only the machine
	 * doing the build knows that, and we run in a browser. Classes named
	 * `my_doc_page` give a perfectly well formed `my/doc/page`, and mam then fails
	 * with `Root package "my" not found` — the length test above does not catch it,
	 * because nothing is wrong with the shape. The export UI has to say out loud
	 * which folder the module is going to, so that the first segment is a decision
	 * the author sees rather than one made for them.
	 */
	export function $bog_vmap_app_export_path(
		this: $,
		names: readonly string[],
	) {

		if( !names.length ) this.$mol_fail( new Error( 'Nothing to export' ) )

		const parts = names.map( name => {

			if( name[0] !== '$' ) this.$mol_fail(
				new Error( `Class name must start with $, got ${ JSON.stringify( name ) }` )
			)

			return name.slice( 1 ).split( '_' )
		} )

		const common = [] as string[]

		for( let i = 0; i < parts[0].length; ++i ) {
			const segment = parts[0][ i ]
			if( ! parts.every( part => part[ i ] === segment ) ) break
			common.push( segment )
		}

		if( common.length < 2 ) this.$mol_fail( new Error(
			`Classes ${ names.join( ', ' ) } share no module path.`
			+ ` A document must name its classes after one module,`
			+ ` so that they agree on at least two leading segments.`
		) )

		return common.join( '/' )
	}

	/**
	 * Whether a hand written body defines a method of this name.
	 *
	 * Deliberately the same test the scene applies before decorating, so that a
	 * property memoized in the preview is memoized in the export and the two cannot
	 * drift. A property decorated in the generated base but overridden here without
	 * a decorator loses its atom outright, and nothing reports it: the method just
	 * returns a fresh value while the DOM keeps the old one.
	 */
	export function $bog_vmap_app_export_defines( js: string, name: string ) {
		if( js.includes( `/${ '*' }${ name }${ '*' }/` ) ) return true
		return new RegExp( `(^|[^\\w.$])${ name }\\s*\\(`, 'm' ).test( js )
	}

	/** One reason a hand written body would not survive the export. */
	export type $bog_vmap_app_export_complaint = {

		/** 1-based, counted inside the body the editor shows. */
		readonly line: number

		readonly method: string
		readonly param: string

		/** Ready to show, in the language of the editor. */
		readonly text: string

	}

	/**
	 * Parameters of methods that carry no type.
	 *
	 * The divergence of section 10: in the scene a body goes through `new Function`,
	 * where any JS runs, and in the export the same body is compiled by TypeScript
	 * with `strict` and `noImplicitAny`. An untyped parameter is the whole of that
	 * divergence in practice — it works in the preview and fails the build, and the
	 * author learns about it neither where nor when the mistake was made.
	 *
	 * Not a type checker and not pretending to be one: a real `tsc` in the browser
	 * costs megabytes in the bundle of an editor that would use it for one class of
	 * error. What is not caught here is what needs types to catch — an unknown
	 * member, a wrong type — and those stay a build failure.
	 *
	 * **The cost of the two mistakes is not the same, so the check is built to miss
	 * rather than to lie.** A complaint refuses the export, and a false one locks
	 * the author inside the editor with no way out; a missed one costs a build
	 * failure with a message of its own. Everything doubtful is therefore passed
	 * over in silence:
	 *
	 * - strings and comments are blanked before anything is read, so a signature
	 *   quoted inside a template literal is not a signature;
	 * - a head is only a head at the indent of the body itself and only when a `{`
	 *   follows, which is what separates a definition from a call and from an
	 *   overload signature;
	 * - only a plain identifier is reported. A destructured parameter is an error
	 *   of the same kind, but naming it sensibly is beyond this, and half a name in
	 *   a refusal is worse than no refusal;
	 * - a default value is a type, an arrow is typed by its context, and a
	 *   parameter list holding brackets of its own is left alone.
	 */
	export function $bog_vmap_app_export_untyped( js: string ) {

		const out = [] as $bog_vmap_app_export_complaint[]

		const clean = $bog_vmap_app_export_blanked( js )
		const base = base_indent( clean )

		const heads = new RegExp(
			'(?:^|\\n)([ \\t]*)'
			+ '((?:(?:async|static|override|public|private|protected|get|set)[ \\t]+)*)'
			+ '(\\*[ \\t]*)?([A-Za-z_$][\\w$]*)[ \\t]*'
			+ '(?:<[^<>()\\n]*>[ \\t]*)?'
			+ '\\(([^()]*)\\)[ \\t]*(?::[^\\n{;]*)?\\{',
			'g',
		)

		// Words that begin a statement and would otherwise read as a method name.
		const keywords = [
			'if', 'for', 'while', 'switch', 'catch', 'return', 'do', 'else', 'with',
			'function', 'typeof', 'await', 'yield', 'new', 'delete', 'void', 'super',
			'this', 'case', 'throw', 'try', 'finally',
		]

		for( const head of clean.matchAll( heads ) ) {

			// At the indent of the body and nowhere deeper: what stands inside a
			// method is a statement, however much it looks like a signature.
			if( head[ 1 ].length !== base ) continue

			const method = head[ 4 ]
			if( keywords.includes( method ) ) continue

			const at = ( head.index ?? 0 ) + ( head[ 0 ][ 0 ] === '\n' ? 1 : 0 )
			const line = clean.slice( 0, at ).split( '\n' ).length

			for( const param of params_of( head[ 5 ] ) ) {

				const sample = param.rest ? `... ${ param.name }: number[]` : `${ param.name }?: number`

				out.push({
					line,
					method,
					param: param.name,
					text: `У метода «${ method }» параметр «${ param.name }» без типа.`
						+ ` В превью это работает, а выгрузка компилируется TypeScript'ом со strict и упадёт на noImplicitAny.`
						+ ` Допишите тип, например «${ method }( ${ sample } )».`,
				})

			}

		}

		return out as readonly $bog_vmap_app_export_complaint[]
	}

	/**
	 * The same text with every string and comment replaced by spaces.
	 *
	 * Length and line breaks are kept, so a position in the result is the same
	 * position in the source and the line of a complaint stays true. Without this a
	 * signature quoted inside a template literal reads as a signature, and that is
	 * a refusal over text that is not code at all.
	 *
	 * A regular expression literal is not understood, deliberately: telling one
	 * from a division needs a parser. An apostrophe inside one blanks more than it
	 * should, and the whole cost of that is a complaint not raised.
	 */
	export function $bog_vmap_app_export_blanked( js: string ) {

		const blank = ( text: string )=> text.replace( /[^\n]/g, ' ' )

		let out = ''
		let i = 0

		while( i < js.length ) {

			const char = js[ i ]

			if( char === '/' && js[ i + 1 ] === '/' ) {
				const end = js.indexOf( '\n', i )
				const stop = end < 0 ? js.length : end
				out += blank( js.slice( i, stop ) )
				i = stop
				continue
			}

			if( char === '/' && js[ i + 1 ] === '*' ) {
				const end = js.indexOf( '*/', i + 2 )
				const stop = end < 0 ? js.length : end + 2
				out += blank( js.slice( i, stop ) )
				i = stop
				continue
			}

			if( char === '"' || char === "'" || char === '`' ) {

				let j = i + 1

				while( j < js.length ) {
					if( js[ j ] === '\\' ) { j += 2; continue }
					if( js[ j ] === char ) { ++j; break }
					if( char !== '`' && js[ j ] === '\n' ) break
					++j
				}

				out += blank( js.slice( i, j ) )
				i = j
				continue
			}

			out += char
			++i
		}

		return out
	}

	/** Indent the body itself stands at, which is the indent its methods stand at. */
	function base_indent( js: string ) {

		let base = Infinity

		for( const line of js.split( '\n' ) ) {
			if( !line.trim() ) continue
			base = Math.min( base, /^[ \t]*/.exec( line )![ 0 ].length )
		}

		return base === Infinity ? 0 : base
	}

	/**
	 * Parameters that carry neither a type nor a default value, by name.
	 *
	 * Anything that is not a plain identifier — a destructuring, a parameter whose
	 * own brackets confuse the split — leaves without a word said, see the rule
	 * above.
	 */
	function params_of( list: string ) {

		const out = [] as { name: string, rest: boolean }[]

		let depth = 0
		let typed = false
		let text = ''

		const close = ()=> {

			const written = text.trim()
			text = ''
			const was_typed = typed
			typed = false

			if( !written || was_typed ) return

			const parts = /^(\.\.\.[ \t]*)?([A-Za-z_$][\w$]*)\??$/.exec( written )
			if( !parts ) return

			out.push({ name: parts[ 2 ], rest: Boolean( parts[ 1 ] ) })
		}

		for( const char of list ) {

			if( '<{(['.includes( char ) ) ++depth
			if( '>})]'.includes( char ) && depth > 0 ) --depth

			if( depth === 0 && ( char === ':' || char === '=' ) ) typed = true
			if( depth === 0 && char === ',' ) { close(); continue }

			if( !typed ) text += char
		}

		close()

		return out
	}

	/** Indents a hand written body into a class declaration. */
	export function $bog_vmap_app_export_indent( text: string, depth = 2 ) {
		const pad = '\t'.repeat( depth )
		return text.replace( /\n?$/, '' ).split( '\n' )
			.map( line => line.trim() ? pad + line : '' )
			.join( '\n' )
	}

	/**
	 * Builds the module.
	 *
	 * @param nodes classes of the document, in any order
	 * @param root class `index.html` instantiates; defaults to the first node
	 */
	export function $bog_vmap_app_export_build(
		this: $,
		nodes: readonly $bog_vmap_app_export_node[],
		root?: string,
	): $bog_vmap_app_export_module {

		if( !nodes.length ) this.$mol_fail( new Error( 'Nothing to export' ) )

		/**
		 * Parsed through the same model the editor edits with, so the export sees
		 * exactly the classes the editor sees, reformatting included.
		 *
		 * This is also where the `asset:` rewrite of stage 5.1 belongs: one place,
		 * before anything reads the text.
		 */
		const parsed = nodes.map( node => {

			const model = this.$bog_vmap_lang_node.make({})
			model.source( node.source )

			return { node, model, tree: model.tree(), name: model.name() }
		} )

		const names = parsed.map( item => item.name )

		/**
		 * Bodies are checked before anything is written, so that the answer names the
		 * mistake instead of leaving a module that only fails on the build machine.
		 * Section 10: the preview forgives what the export does not.
		 */
		const complaints = parsed.flatMap( item => {
			const js = item.node.js?.trim()
			return js
				? this.$bog_vmap_app_export_untyped( js ).map( note => `${ item.name }, строка ${ note.line }: ${ note.text }` )
				: []
		} )

		if( complaints.length ) this.$mol_fail( new Error(
			`Код узлов не переживёт выгрузку:\n${ complaints.join( '\n' ) }`
		) )

		const twice = names.filter( ( name, i )=> names.indexOf( name ) !== i )
		if( twice.length ) this.$mol_fail(
			new Error( `Class ${ twice[0] } is declared twice` )
		)

		const path = this.$bog_vmap_app_export_path( names )
		const name = path.slice( path.lastIndexOf( '/' ) + 1 )

		const entry = root ?? names[0]
		if( ! names.includes( entry ) ) this.$mol_fail(
			new Error( `Root class ${ JSON.stringify( entry ) } is not among the document classes` )
		)

		const order = this.$bog_vmap_lang_sorted( parsed.map( item => item.tree ) )
		const by_tree = new Map( parsed.map( item => [ item.tree, item ] ) )
		const sorted = order.map( tree => by_tree.get( tree )! )

		const pages = $bog_vmap_app_export_pages( parsed.find( item => item.name === entry )!.model )

		/**
		 * Two pages or more get a router, one page gets nothing at all.
		 *
		 * A single page document stays exactly what it was: the same five files and
		 * the document itself at the root. A router over one page would be a class
		 * that always answers the same thing, and an address key that always holds
		 * the same value.
		 */
		const router = pages.length > 1 ? router_name( path, names ) : ''

		const files = [
			{
				name: `${ name }.view.tree`,
				text: sorted.map( item => item.tree.toString() ).join( '' )
					+ ( router ? router_tree( router, entry ) : '' ),
			},
			{ name: `${ name }.view.ts`, text: view_ts.call( this, sorted, router, pages ) },
			{ name: `${ name }.view.css.ts`, text: view_css_ts.call( this, sorted ) },
			{ name: `${ name }.meta.tree`, text: 'include \\/mol/theme/auto\n' },
			{ name: 'index.html', text: index_html( router || entry ) },
		]

		return { path, name, root: router || entry, files }
	}

	/**
	 * Pages of a document: the artboards its root class draws.
	 *
	 * An artboard is a node with a `sub` of its own, and that is the only mark it
	 * has — the same reading the canvas does in `doc_containers`, and section 8
	 * says there is no other. A free part carries no `sub`, so it is not a page and
	 * the router never shows it, which is also why the desk coordinates have
	 * nothing to leak into here.
	 */
	export function $bog_vmap_app_export_pages( model: $bog_vmap_lang_node ) {
		return ( model.sub_names() ?? [] ).filter( name => name && model.sub_names( name ) )
	}

	/**
	 * Name of the router class, free of collisions.
	 *
	 * Built out of the module path rather than out of the root class, so that it
	 * adds no segment to the longest common prefix and the module stays in the
	 * folder the document already chose: `bog/site` gives `$bog_site_app`,
	 * `bog/site/page` gives `$bog_site_page_app`. A document that already holds
	 * that name gets the next free one instead of a class declared twice.
	 */
	function router_name( path: string, taken: readonly string[] ) {

		const base = '$' + path.replace( /\//g, '_' ) + '_app'

		let name = base
		for( let i = 2; taken.includes( name ); ++i ) name = base + i

		return name
	}

	/**
	 * Declaration of the router.
	 *
	 * `$mol_view` and not the document class, although inheriting would be shorter:
	 * an heir declared in the SAME `.view.tree` silently loses the hand written body
	 * of its base, because the generated file of the whole tree is ordered before
	 * the single `.view.ts` of the module, where the wrapper overwrites the
	 * generated class rather than extending it. The document therefore lies inside
	 * the router as `Doc`.
	 *
	 * `Doc` is declared and never put into `sub`, so it costs one lazy memoized
	 * instance and no DOM — the free part of section 1. Its artboards are flat
	 * properties of it thanks to `upper`, which is what lets the router reach a page
	 * by name at all.
	 *
	 * No `sub` here: an empty list in the tree would be generated as a method
	 * returning `never[]`, and an override widening that is a type error. The list
	 * belongs to the body, where it is picked by the address anyway.
	 */
	function router_tree( router: string, doc: string ) {
		return `${ router } $mol_view\n\tDoc ${ doc }\n`
	}

	/**
	 * Body of the router: one page, named by the address.
	 *
	 * `$mol_state_arg` and nothing of our own, because that is the standard address
	 * of $mol: a link from page to page is an ordinary `$mol_link` with
	 * `arg * page \Page_1` written in the document itself, and it works without a
	 * line of code from us. The first artboard is the default, so the bare address
	 * opens the site rather than an empty screen, and an unknown page name lands
	 * there as well instead of showing nothing.
	 *
	 * A `switch` over literal names rather than a lookup by string: a property read
	 * by a computed name would need a cast, and the export must compile under
	 * `strict` with no `as any` anywhere in it.
	 */
	function router_ts( router: string, pages: readonly string[] ) {

		const rest = pages.slice( 1 ).map(
			page => `\t\t\t\tcase ${ JSON.stringify( page ) }: return [ doc.${ page }() ]\n`
		)

		return ''
			+ `\n\texport class ${ router } extends $.${ router } {\n\n`
			+ `\t\toverride sub() {\n\n`
			+ `\t\t\tconst doc = this.Doc()\n\n`
			+ `\t\t\tswitch( this.$.$mol_state_arg.value( 'page' ) ) {\n`
			+ rest.join( '' )
			+ `\t\t\t\tdefault: return [ doc.${ pages[ 0 ] }() ]\n`
			+ `\t\t\t}\n\n`
			+ `\t\t}\n\n`
			+ `\t}\n`
	}

	type Parsed = {
		readonly node: $bog_vmap_app_export_node
		readonly model: $bog_vmap_lang_node
		readonly tree: $mol_tree2
		readonly name: string
	}

	/**
	 * Hand written bodies, one subclass per class that has one.
	 *
	 * Decorators go as separate expressions after the class, the way studio applies
	 * them in `source_js_decorators()`. Writing `@ $mol_mem` into the user's text
	 * would mean finding where each method starts, and getting that wrong produces
	 * a file that does not compile.
	 *
	 * The leading `;` is not decoration. A generated line starting with `(` and no
	 * semicolon above it gets glued to the previous expression by ASI, and the
	 * result is `$( … )` and a `TypeError` at load.
	 */
	function view_ts(
		this: $,
		items: readonly Parsed[],
		router: string,
		pages: readonly string[],
	) {

		const out = [ 'namespace $.$$ {\n' ]

		for( const item of items ) {

			const js = item.node.js?.trim()
			if( !js ) continue

			const decorators = [] as string[]

			for( const prop of item.tree.kids[ 0 ]?.kids ?? [] ) {

				const { name, key, next } = this.$mol_view_tree2_prop_parts( prop )
				if( !key && !next ) continue
				if( ! this.$bog_vmap_app_export_defines( js, name ) ) continue

				decorators.push(
					`\t;( $mol_mem${ key ? '_key' : '' }( ${ item.name }.prototype, ${ JSON.stringify( name ) } ) )\n`
				)

			}

			out.push( `\n\texport class ${ item.name } extends $.${ item.name } {\n\n` )
			out.push( this.$bog_vmap_app_export_indent( js ) + '\n' )
			out.push( '\n\t}\n' )
			out.push( ... decorators )

		}

		if( router ) out.push( router_ts( router, pages ) )

		out.push( '\n}\n' )

		return out.join( '' )
	}

	/**
	 * Styles.
	 *
	 * `$mol_style_attach` rather than `$mol_style_define`, because what the editor
	 * holds is raw CSS text and not a dictionary of properties. Name and CSS both
	 * go in through `JSON.stringify`: a stylesheet containing a backtick or a `${`
	 * would tear a template literal apart, and that is user text.
	 */
	function view_css_ts( this: $, items: readonly Parsed[] ) {

		const out = [ 'namespace $.$$ {\n' ]

		for( const item of items ) {

			const css = item.node.css?.trim()
			if( !css ) continue

			out.push( `\n\t$mol_style_attach( ${ JSON.stringify( item.name ) }, ${ JSON.stringify( css ) } )\n` )

		}

		out.push( '\n}\n' )

		return out.join( '' )
	}

	function index_html( root: string ) {
		return [
			'<!doctype html>',
			'<html mol_view_root>',
			'\t<head>',
			'\t\t<meta charset="utf-8" />',
			'\t\t<meta name="viewport" content="width=device-width, initial-scale=1" />',
			'\t</head>',
			'\t<body mol_view_root>',
			`\t\t<div mol_view_root="${ root }"></div>`,
			'\t\t<script src="web.js"></script>',
			'\t</body>',
			'</html>',
			'',
		].join( '\n' )
	}

}
