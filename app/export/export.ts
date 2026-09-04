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

			return { node, tree: model.tree(), name: model.name() }
		} )

		const names = parsed.map( item => item.name )

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

		const files = [
			{ name: `${ name }.view.tree`, text: sorted.map( item => item.tree.toString() ).join( '' ) },
			{ name: `${ name }.view.ts`, text: view_ts.call( this, sorted ) },
			{ name: `${ name }.view.css.ts`, text: view_css_ts.call( this, sorted ) },
			{ name: `${ name }.meta.tree`, text: 'include \\/mol/theme/auto\n' },
			{ name: 'index.html', text: index_html( entry ) },
		]

		return { path, name, root: entry, files }
	}

	type Parsed = {
		readonly node: $bog_vmap_app_export_node
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
	function view_ts( this: $, items: readonly Parsed[] ) {

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
