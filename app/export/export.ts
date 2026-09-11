namespace $ {

	export type $bog_vmap_app_export_node = {

		readonly source: string

		readonly js?: string

		readonly css?: string

	}

	export type $bog_vmap_app_export_file = {
		readonly name: string
		readonly text: string
	}

	export type $bog_vmap_app_export_module = {

		readonly path: string

		readonly name: string

		readonly root: string

		readonly files: readonly $bog_vmap_app_export_file[]

	}

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

	export function $bog_vmap_app_export_defines( js: string, name: string ) {
		if( js.includes( `/${ '*' }${ name }${ '*' }/` ) ) return true
		return new RegExp( `(^|[^\\w.$])${ name }\\s*\\(`, 'm' ).test( js )
	}

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

	function theme_plug( name: string ) {
		return `\tplugins /\n\t\t<= ${ name } $mol_theme_auto\n`
	}

	export function $bog_vmap_app_export_themed(
		this: $,
		tree: $mol_tree2,
	) {

		if( !tree.kids[ 0 ] ) return ''

		const taken = new Set(
			this.$mol_view_tree2_class_props( tree ).map(
				prop => this.$mol_view_tree2_prop_parts( prop ).name
			)
		)

		if( taken.has( 'plugins' ) ) return ''

		let name = 'Theme'
		for( let i = 2; taken.has( name ); ++i ) name = 'Theme' + i

		return theme_plug( name )
	}

	export type $bog_vmap_app_export_complaint = {

		readonly line: number

		readonly method: string
		readonly param: string

		readonly text: string

	}

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

		const keywords = [
			'if', 'for', 'while', 'switch', 'catch', 'return', 'do', 'else', 'with',
			'function', 'typeof', 'await', 'yield', 'new', 'delete', 'void', 'super',
			'this', 'case', 'throw', 'try', 'finally',
		]

		for( const head of clean.matchAll( heads ) ) {

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

	function base_indent( js: string ) {

		let base = Infinity

		for( const line of js.split( '\n' ) ) {
			if( !line.trim() ) continue
			base = Math.min( base, /^[ \t]*/.exec( line )![ 0 ].length )
		}

		return base === Infinity ? 0 : base
	}

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

	export function $bog_vmap_app_export_indent( text: string, depth = 2 ) {
		const pad = '\t'.repeat( depth )
		return text.replace( /\n?$/, '' ).split( '\n' )
			.map( line => line.trim() ? pad + line : '' )
			.join( '\n' )
	}

	export function $bog_vmap_app_export_build(
		this: $,
		nodes: readonly $bog_vmap_app_export_node[],
		root?: string,
	): $bog_vmap_app_export_module {

		if( !nodes.length ) this.$mol_fail( new Error( 'Nothing to export' ) )

		const parsed = nodes.map( node => {

			const model = this.$bog_vmap_lang_node.make({})
			model.source( node.source )

			const tree = $bog_vmap_app_export_hooked.call( this, model.tree(), node.js ?? '' )

			return { node, model, tree, name: model.name() }
		} )

		const names = parsed.map( item => item.name )

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

		const router = pages.length > 1 ? router_name( path, names ) : ''

		const body = view_ts.call( this, sorted, router, pages )
		const style = view_css( sorted )

		const files = [
			{
				name: `${ name }.view.tree`,
				text: sorted.map( item => item.tree.toString() + (
					router || item.name !== entry
						? ''
						: $bog_vmap_app_export_themed.call( this, item.tree )
				) ).join( '' )
					+ ( router ? router_tree( router, entry ) : '' ),
			},
			... body.includes( 'export class' ) ? [ { name: `${ name }.view.ts`, text: body } ] : [],
			... style ? [ { name: `${ name }.view.css`, text: style } ] : [],
			{ name: `${ name }.meta.tree`, text: 'include \\/mol/theme/auto\n' },
			{ name: 'index.html', text: index_html( router || entry ) },
			{ name: 'README.md', text: readme_md( path, name ) },
			{ name: '.gitattributes', text: '*\t-text\n' },
			{ name: '.gitignore', text: '-*\n.DS_Store\n' },
			{ name: '.github/workflows/deploy.yml', text: deploy_yml( path ) },
		]

		return { path, name, root: router || entry, files }
	}

	export function $bog_vmap_app_export_pages( model: $bog_vmap_lang_node ) {
		return ( model.sub_names() ?? [] ).filter( name => name && model.sub_names( name ) )
	}

	function router_name( path: string, taken: readonly string[] ) {

		const base = '$' + path.replace( /\//g, '_' ) + '_app'

		let name = base
		for( let i = 2; taken.includes( name ); ++i ) name = base + i

		return name
	}

	function router_tree( router: string, doc: string ) {
		return `${ router } $mol_view\n${ theme_plug( 'Theme' ) }\tDoc ${ doc }\n`
	}

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

	function readme_md( path: string, name: string ) {
		return [
			`# ${ name }`,
			'',
			'Приложение, собранное в редакторе vmap и выгруженное паком MAM.',
			'',
			'Сборка: клонировать https://github.com/hyoo-ru/mam, положить этот репозиторий'
				+ ` в \`${ path }\` и выполнить \`npm start ${ path }\`.`
				+ ` Страница ложится в \`${ path }/-/index.html\`.`,
			'',
			'Публикация: прогон `.github/workflows/deploy.yml` на ветке `main` кладёт сборку'
				+ ' в ветку `gh-pages`. Настройки репозитория, Pages, Deploy from a branch,'
				+ ' ветка `gh-pages`, папка `/ (root)`.',
			'',
		].join( '\n' )
	}

	function deploy_yml( path: string ) {
		return [
			`name: ${ '$' + path.replace( /\//g, '_' ) }`,
			'',
			'permissions: write-all',
			'',
			'on:',
			'  workflow_dispatch:',
			'  push:',
			'    branches: [ main ]',
			'',
			'concurrency:',
			'  group: deploy-${{ github.ref }}',
			'  cancel-in-progress: true',
			'',
			'jobs:',
			'',
			'  build:',
			'    runs-on: ubuntu-latest',
			'',
			'    steps:',
			'',
			'    - uses: hyoo-ru/mam_build@master2',
			'      with:',
			`        package: '${ path }'`,
			'',
			'    - name: Audits',
			'      run: |',
			'        set -euo pipefail',
			`        grep -q 'Audit passed' ${ path }/-/web.audit.js`,
			`        grep -q 'Audit passed' ${ path }/-/node.audit.js`,
			'',
			'    - name: Cache-bust the bundle',
			'      run: |',
			'        set -euo pipefail',
			'        sed -i "s|src=\\"web.js\\"|src=\\"web.js?v=${GITHUB_SHA::7}\\"|"'
				+ ` ${ path }/-/index.html`,
			`        grep -q "web.js?v=\${GITHUB_SHA::7}" ${ path }/-/index.html`,
			'',
			'    - uses: hyoo-ru/gh-deploy@v4.4.1',
			'      with:',
			`        folder: '${ path }/-'`,
			'',
			'    - name: URL',
			'      run: |',
			'        set -euo pipefail',
			'        echo "- https://${{ github.repository_owner }}.github.io/'
				+ '${{ github.event.repository.name }}/" >> "$GITHUB_STEP_SUMMARY"',
			'',
		].join( '\n' )
	}

}
