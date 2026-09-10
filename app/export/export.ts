namespace $ {

	/**
	 * Export of a document as a real MAM module.
	 *
	 * Not an abstract «project»: the output is a folder that builds untouched.
	 * That closes the circle of section 5 as well — a built module is a donor pack,
	 * so what is assembled here is a component library for the next document.
	 *
	 * Pure functions over text, with no storage and no DOM behind them: the caller
	 * hands over the sources of its classes and gets files back.
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
	 * One file of the module. Text only.
	 *
	 * A flat list of named files precisely so that assets can be appended to it
	 * later instead of reworking the shape of the result.
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
	 * The folder is not free: mam turns a class name into a path by replacing every
	 * underscore with a slash, so a module placed anywhere else fails to build
	 * while looking perfectly correct. The document therefore names its own folder,
	 * by the longest common prefix of its class names.
	 *
	 * A prefix shorter than two segments means classes from different packs.
	 * Refused: renaming the author's classes to fit would break «byte for byte from
	 * the editor», and emitting them as they are would produce a folder that does
	 * not build.
	 *
	 * **What this cannot check is whether the root pack exists** — only the machine
	 * doing the build knows that, and this runs in a browser. A well shaped path
	 * into a pack nobody has still fails there. Hence the rule for the interface:
	 * the folder is written where the author reads it, so the first segment is a
	 * decision they see rather than one made for them.
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
	 * Deliberately the same test the scene applies before decorating, so a property
	 * memoized in the preview is memoized in the export and the two cannot drift.
	 * An override of a memoized property left undecorated loses its atom outright,
	 * and nothing reports it: the method returns a fresh value while the DOM keeps
	 * the old one.
	 */
	export function $bog_vmap_app_export_defines( js: string, name: string ) {
		if( js.includes( `/${ '*' }${ name }${ '*' }/` ) ) return true
		return new RegExp( `(^|[^\\w.$])${ name }\\s*\\(`, 'm' ).test( js )
	}

	/**
	 * References of a class that only the hand written body answers.
	 *
	 * `title <= greeting` compiles to `this.greeting()` on the class, and section 1
	 * says writing `greeting()` by hand is the normal thing to do: it is exactly
	 * what the class does not generate. The scene is happy with that, because a body
	 * there goes through a run time compile with no types in sight.
	 *
	 * **The export is not**, and this is where the two forms parted. The generated
	 * declaration file states the type of every binding — `ReturnType< Klass['greeting'] >`
	 * — against the GENERATED class, which declares nothing of the kind, and the
	 * whole module stops on `TS2339: Property 'greeting' does not exist`. Measured
	 * 10.09.2026 on a document exported into a real folder: three files right, no
	 * bundle.
	 *
	 * So the declaration is written out for it, `greeting null`, and the answer is
	 * the reference AS WRITTEN, signs included, so that a two way or a keyed hook
	 * comes out with the signature it is used with. `null` and not a guessed value:
	 * it types as `any`, and the body in the subclass narrows it to whatever it
	 * really returns instead of being checked against a type nobody stated.
	 *
	 * Only what the BODY defines. A bare reference the body does not answer either
	 * is a property of the base class or a plain mistake, and declaring it here
	 * would shadow the first with `any` and hide the second behind a method that
	 * silently returns nothing.
	 */
	export function $bog_vmap_app_export_hooks(
		this: $,
		tree: $mol_tree2,
		js: string,
	): readonly string[] {

		if( !js.trim() || !tree.kids[ 0 ] ) return []

		const declared = new Set(
			this.$mol_view_tree2_class_props( tree ).map(
				prop => this.$mol_view_tree2_prop_parts( prop ).name
			)
		)

		const found = [] as string[]

		const walk = ( node: $mol_tree2 )=> {

			const ref = node.kids[ 0 ]

			if( ref && !ref.kids.length && ( node.type === '<=' || node.type === '<=>' ) ) {

				const name = ref.type.replace( /[*?!]+$/, '' )

				if(
					name && !declared.has( name )
					&& $bog_vmap_app_export_defines( js, name )
					&& !found.includes( ref.type )
				) found.push( ref.type )

			}

			for( const kid of node.kids ) walk( kid )
		}

		walk( tree )

		return found
	}

	/**
	 * The declaration of a class with those hooks written into it.
	 *
	 * The one place the exported text is not the text of the editor, and it is
	 * additive: nothing written is changed, a line is appended for a property the
	 * document uses and never declares. The alternative was refusing to export a
	 * document the editor itself invites people to write.
	 */
	export function $bog_vmap_app_export_hooked(
		this: $,
		tree: $mol_tree2,
		js: string,
	) {

		const hooks = $bog_vmap_app_export_hooks.call( this, tree, js )
		if( !hooks.length ) return tree

		const base = tree.kids[ 0 ]!

		return tree.clone([ base.clone([
			... base.kids,
			... hooks.map( type => base.struct( type, [ base.struct( 'null', [] ) ] ) ),
		]) ])
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
	 * The divergence of section 10: in the scene a body runs as plain JS, in the
	 * export the same body is compiled with `strict` and `noImplicitAny`. An
	 * untyped parameter is that divergence in practice — it works in the preview
	 * and fails the build, where the author is not.
	 *
	 * Not a type checker: a real compiler in the browser costs megabytes for one
	 * class of error. What needs types to catch — an unknown member, a wrong
	 * type — stays a build failure.
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
	 * position in the source and the line of a complaint stays true. Without it a
	 * signature quoted inside a literal reads as a signature, and that is a refusal
	 * over text that is not code.
	 *
	 * A regular expression literal is not understood, deliberately: telling one
	 * from a division needs a parser, and the whole cost of getting it wrong is a
	 * complaint not raised.
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
		 * exactly the classes the editor sees, reformatting included. One place, and
		 * the place where a rewrite of asset links belongs when it arrives.
		 */
		const parsed = nodes.map( node => {

			const model = this.$bog_vmap_lang_node.make({})
			model.source( node.source )

			// The hooks go in here and not at the writing of the file: everything
			// downstream — the sorting, the decorators, the text — is then talking
			// about the class the module will actually declare.
			const tree = $bog_vmap_app_export_hooked.call( this, model.tree(), node.js ?? '' )

			return { node, model, tree, name: model.name() }
		} )

		const names = parsed.map( item => item.name )

		/**
		 * Bodies are checked before anything is written, so the answer names the
		 * mistake instead of leaving a module that fails on a machine the author
		 * never sees.
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
		 * Two pages or more get a router, one page gets nothing at all: a router
		 * over one page would be a class that always answers the same thing, and an
		 * address key that always holds the same value.
		 */
		const router = pages.length > 1 ? router_name( path, names ) : ''

		/**
		 * A file with nothing in it is not written at all, because a module written
		 * by a person does not carry one: no class has a body, there is no
		 * `.view.ts`; nobody styled anything, there is no stylesheet.
		 */
		const body = view_ts.call( this, sorted, router, pages )
		const style = view_css( sorted )

		const files = [
			{
				name: `${ name }.view.tree`,
				text: sorted.map( item => item.tree.toString() ).join( '' )
					+ ( router ? router_tree( router, entry ) : '' ),
			},
			... body.includes( 'export class' ) ? [ { name: `${ name }.view.ts`, text: body } ] : [],
			... style ? [ { name: `${ name }.view.css`, text: style } ] : [],
			{ name: `${ name }.meta.tree`, text: 'include \\/mol/theme/auto\n' },
			{ name: 'index.html', text: index_html( router || entry ) },
		]

		return { path, name, root: router || entry, files }
	}

	/**
	 * Pages of a document: the artboards its root class draws.
	 *
	 * A node with a `sub` of its own is an artboard, and that is the only mark it
	 * has — the same reading the canvas takes, see section 8. A free part carries
	 * no `sub`, so the router never shows it, and the desk coordinates have nothing
	 * to leak into here.
	 */
	export function $bog_vmap_app_export_pages( model: $bog_vmap_lang_node ) {
		return ( model.sub_names() ?? [] ).filter( name => name && model.sub_names( name ) )
	}

	/**
	 * Name of the router class, free of collisions.
	 *
	 * Built out of the module path and not out of the root class, so it adds no
	 * segment to the longest common prefix and the module stays in the folder the
	 * document already chose. A document already holding that name gets the next
	 * free one instead of a class declared twice.
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
	 * A plain view and not an heir of the document, although inheriting would be
	 * shorter: an heir declared in the SAME declaration file silently loses the hand
	 * written body of its base. The document therefore lies INSIDE the router,
	 * declared and never put into `sub` — one lazy instance and no DOM, the free
	 * part of section 1 — and its artboards are flat properties of it, which is what
	 * lets the router reach a page by name.
	 *
	 * No `sub` in the declaration: an empty list is generated as a method returning
	 * `never[]`, and an override widening that is a type error. The list belongs to
	 * the body, where the address picks from it anyway.
	 */
	function router_tree( router: string, doc: string ) {
		return `${ router } $mol_view\n\tDoc ${ doc }\n`
	}

	/**
	 * Body of the router: one page, named by the address.
	 *
	 * The standard address of mol and nothing of our own, so a link from page to
	 * page is an ordinary link written in the document itself and works without a
	 * line of code from here. The first artboard is the default, so a bare address
	 * opens the site, and an unknown page name lands there rather than on nothing.
	 *
	 * A `switch` over literal names and not a lookup by string: a property read by
	 * a computed name needs a cast, and what goes out has to compile under `strict`
	 * with no casts in it.
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
	 * A hand written body with the memoizing decorator written above the methods
	 * that need it.
	 *
	 * The decorator over the method is how a person writes it, and what comes out of
	 * here has to read like a module somebody wrote by hand. The expression after
	 * the class is what the SCENE has to do, because a decorator cannot be written
	 * into a string handed to a compiler at run time; a file has no such excuse.
	 *
	 * Where a method starts is not guessed: the body is cut by the same function the
	 * code panel cuts it with, so the two agree about the start of a property by
	 * construction rather than by two implementations happening to match. The
	 * decorator lands under whatever comment belongs to the method and over the
	 * method itself, where a reader looks for it.
	 *
	 * **A body the slicer cannot cut keeps the expression form.** Braces are counted
	 * rather than parsed, so a `}` inside a string is enough to defeat it — and a
	 * body that loses its decorators loses its atoms silently, which is the one
	 * outcome worth an ugly file.
	 */
	export function $bog_vmap_app_export_decorated(
		this: $,
		js: string,
		klass: string,
		memos: ReadonlyMap< string, string >,
	): { readonly body: string, readonly after: readonly string[] } {

		const after = ()=> [ ... memos ].map(
			( [ name, mem ] )=> `\t;( ${ mem }( ${ klass }.prototype, ${ JSON.stringify( name ) } ) )\n`
		)

		if( !memos.size ) return { body: js, after: [] }

		let props: $bog_vmap_app_code_props

		try {
			props = this.$bog_vmap_app_code_props_js( js )
		} catch( error: unknown ) {
			if( this.$mol_promise_like( error ) ) return this.$mol_fail_hidden( error )
			return { body: js, after: after() }
		}

		const decorated = new Map( props )

		for( const [ name, mem ] of memos ) {

			const code = props.get( name )
			if( code === undefined ) continue

			const at = code.search( new RegExp( `(^|[^\\w.$])${ name }\\s*\\(`, 'm' ) )
			if( at < 0 ) continue

			const line = code.lastIndexOf( '\n', at ) + 1

			decorated.set( name, code.slice( 0, line ) + `@ ${ mem }\n` + code.slice( line ) )

		}

		return { body: this.$bog_vmap_app_code_joined( decorated ), after: [] }
	}

	/**
	 * Hand written bodies, one subclass per class that has one.
	 *
	 * The leading `;` of the fallback form is not decoration. A generated line
	 * starting with `(` and no semicolon above it gets glued to the previous
	 * expression by ASI, and the result is `$( … )` and a `TypeError` at load.
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

			const memos = new Map< string, string >()

			for( const prop of item.tree.kids[ 0 ]?.kids ?? [] ) {

				const { name, key, next } = this.$mol_view_tree2_prop_parts( prop )
				if( !key && !next ) continue
				if( ! this.$bog_vmap_app_export_defines( js, name ) ) continue

				memos.set( name, `$mol_mem${ key ? '_key' : '' }` )

			}

			const made = this.$bog_vmap_app_export_decorated( js, item.name, memos )

			out.push( `\n\texport class ${ item.name } extends $.${ item.name } {\n\n` )
			out.push( this.$bog_vmap_app_export_indent( made.body ) + '\n' )
			out.push( '\n\t}\n' )
			out.push( ... made.after )

		}

		if( router ) out.push( router_ts( router, pages ) )

		out.push( '\n}\n' )

		return out.join( '' )
	}

	/**
	 * Styles, as a stylesheet and not as a program that attaches one.
	 *
	 * What the editor holds is raw CSS text, and mam compiles the stylesheet of a
	 * module into the bundle itself, the way the stylesheets of mol travel — so the
	 * page needs no link and no attaching code.
	 *
	 * It also takes user text out of a JavaScript literal, where a backtick tore
	 * the string apart and had to be escaped. A stylesheet has nothing to escape
	 * into.
	 */
	function view_css( items: readonly Parsed[] ) {

		const out = [] as string[]

		for( const item of items ) {

			const css = item.node.css?.trim()
			if( !css ) continue

			out.push( css + '\n' )

		}

		return out.join( '\n' )
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
