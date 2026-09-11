namespace $ {

	const d = '$'

	const page = [
		`${d}bog_site_page ${d}mol_view`,
		`	Hero ${d}bog_site_hero`,
		`	greeting = Hero title`,
		`	sub / <= Hero`,
		``,
	].join( '\n' )

	const hero = `${d}bog_site_hero ${d}mol_view\n\ttitle \\Hi\n\tcount? 0\n\tplain \\x\n`

	const pages = [
		`${d}bog_site_page ${d}mol_view`,
		`	Head ${d}mol_view`,
		`	Loose ${d}mol_view`,
		`	Home ${d}mol_view sub / <= Head`,
		`	About ${d}mol_view sub /`,
		`	sub /`,
		`		<= Home`,
		`		<= About`,
		`		<= Loose`,
		``,
	].join( '\n' )

	function file_of( module: $bog_vmap_app_export_module, suffix: string ) {
		return module.files.find( file => file.name.endsWith( suffix ) )?.text ?? ''
	}

	const theme = `\tplugins /\n\t\t<= Theme ${d}mol_theme_auto\n`

	$mol_test({

		'module path comes from the class names'( $ ) {

			$mol_assert_equal(
				$.$bog_vmap_app_export_path([ `${d}bog_site_page`, `${d}bog_site_hero` ]),
				'bog/site',
			)

			$mol_assert_equal(
				$.$bog_vmap_app_export_path([ `${d}bog_site_page` ]),
				'bog/site/page',
			)

			$mol_assert_equal(
				$.$bog_vmap_app_export_path([ `${d}bog_site_page`, `${d}bog_site_page_hero` ]),
				'bog/site/page',
			)

		},

		'classes of different packs cannot be one module'( $ ) {

			$mol_assert_fail(
				()=> $.$bog_vmap_app_export_path([ `${d}bog_site_page`, `${d}hyoo_other_page` ]),
				Error,
			)

			$mol_assert_fail(
				()=> $.$bog_vmap_app_export_path([ `${d}bog_one`, `${d}bog_two` ]),
				Error,
			)

			$mol_assert_fail( ()=> $.$bog_vmap_app_export_path([]), Error )

		},

		'a base is declared before its heir'( $ ) {

			const own = `${d}bog_site_hero_big ${d}bog_site_hero\n\ttitle \\Big\n`
			const module = $.$bog_vmap_app_export_build([
				{ source: own },
				{ source: page },
				{ source: hero },
			], `${d}bog_site_page` )

			const tree = file_of( module, '.view.tree' )

			$mol_assert_equal( tree.indexOf( `${d}bog_site_hero ` ) < tree.indexOf( `${d}bog_site_hero_big ` ), true )

		},

		'the emitted declaration parses back into the same classes'( $ ) {

			const module = $.$bog_vmap_app_export_build([ { source: page }, { source: hero } ])

			const back = $.$mol_view_tree2_normalize(
				$.$mol_tree2_from_string( file_of( module, '.view.tree' ), 'export' )
			)

			$mol_assert_like(
				back.kids.map( cl => cl.type ),
				[ `${d}bog_site_page`, `${d}bog_site_hero` ],
			)

		},

		'a hand written body carries its decorators'( $ ) {

			const module = $.$bog_vmap_app_export_build([
				{ source: page },
				{ source: hero, js: 'count( next?: number ) {\n\treturn next ?? 7\n}\n' },
			])

			const ts = file_of( module, '.view.ts' )

			$mol_assert_equal( ts.includes( `export class ${d}bog_site_hero extends $.${d}bog_site_hero {` ), true )

			$mol_assert_equal( ts.includes( `\t\t@ ${d}mol_mem\n\t\tcount( next?: number ) {` ), true )
			$mol_assert_equal( ts.includes( '.prototype' ), false )

			$mol_assert_equal( ts.includes( '"title"' ), false )
			$mol_assert_equal( ts.includes( '"plain"' ), false )

		},

		'the decorated body slices back into the same properties'( $ ) {

			const module = $.$bog_vmap_app_export_build([
				{ source: page },
				{ source: hero, js: 'count( next?: number ) {\n\treturn next ?? 7\n}\n' },
			])

			const ts = file_of( module, '.view.ts' )
			const body = ts.slice(
				ts.indexOf( '{', ts.indexOf( 'export class' ) ) + 1,
				ts.lastIndexOf( '\t}' ),
			)

			$mol_assert_like( [ ... $.$bog_vmap_app_code_props_js( body ).keys() ], [ 'count' ] )

		},

		'a documented method keeps its comment over the decorator'( $ ) {

			const module = $.$bog_vmap_app_export_build([
				{ source: page },
				{
					source: hero,
					js: '/** How many. */\ncount( next?: number ) {\n\treturn next ?? 7\n}\n',
				},
			])

			$mol_assert_equal(
				file_of( module, '.view.ts' ).includes(
					`\t\t/** How many. */\n\t\t@ ${d}mol_mem\n\t\tcount( next?: number ) {`
				),
				true,
			)

		},

		'a body that cannot be sliced keeps the decorators after the class'( $ ) {

			const module = $.$bog_vmap_app_export_build([
				{ source: page },
				{ source: hero, js: 'count( next?: number ) {\n\treturn next ?? "}"\n}\n' },
			])

			const ts = file_of( module, '.view.ts' )

			$mol_assert_equal( ts.includes( `;( ${d}mol_mem( ${d}bog_site_hero.prototype, "count" ) )` ), true )

		},

		'a class without a body gets no file of its own at all'( $ ) {

			const module = $.$bog_vmap_app_export_build([ { source: page }, { source: hero } ])

			$mol_assert_equal( module.files.some( file => file.name.endsWith( '.view.ts' ) ), false )
			$mol_assert_equal( module.files.some( file => file.name.endsWith( '.view.css' ) ), false )

		},

		'a stylesheet is a stylesheet, verbatim'( $ ) {

			const css = '[bog_site_hero]{ content: "` ' + '${x}' + '" }'

			const module = $.$bog_vmap_app_export_build([
				{ source: page },
				{ source: hero, css },
			])

			$mol_assert_equal( file_of( module, '.view.css' ), css + '\n' )
			$mol_assert_equal( module.files.some( file => file.name.endsWith( '.view.css.ts' ) ), false )

		},

		'index.html instantiates the root class'( $ ) {

			const module = $.$bog_vmap_app_export_build([ { source: page }, { source: hero } ], `${d}bog_site_page` )

			$mol_assert_equal( module.root, `${d}bog_site_page` )
			$mol_assert_equal(
				file_of( module, 'index.html' ).includes( `mol_view_root="${d}bog_site_page"` ),
				true,
			)

		},

		'the exported root follows the scheme of the system'( $ ) {

			const module = $.$bog_vmap_app_export_build([ { source: page }, { source: hero } ])
			const tree = file_of( module, '.view.tree' )

			$mol_assert_equal( tree, page + theme + hero )

			$mol_assert_equal( tree.split( 'plugins /' ).length, 2 )

		},

		'the theme plugin lands on the router, not on the page under it'( $ ) {

			const module = $.$bog_vmap_app_export_build([ { source: pages }, { source: hero } ])
			const tree = file_of( module, '.view.tree' )

			$mol_assert_equal( module.root, `${d}bog_site_app` )

			$mol_assert_ok( tree.endsWith(
				`${d}bog_site_app ${d}mol_view\n${ theme }\tDoc ${d}bog_site_page\n`
			) )

			$mol_assert_equal( tree.split( 'plugins /' ).length, 2 )

		},

		'a document that plugs something in itself is left alone'( $ ) {

			const own = [
				`${d}bog_site_page ${d}mol_view`,
				`	plugins /`,
				`		<= Hotkey ${d}mol_hotkey`,
				`	sub /`,
				``,
			].join( '\n' )

			const tree = file_of(
				$.$bog_vmap_app_export_build([ { source: own } ]),
				'.view.tree',
			)

			$mol_assert_equal( tree.split( 'plugins /' ).length, 2 )
			$mol_assert_equal( tree.includes( `${d}mol_theme_auto` ), false )
			$mol_assert_ok( tree.includes( `Hotkey ${d}mol_hotkey` ) )

		},

		'a root with a name of its own gets the next free one'( $ ) {

			const own = [
				`${d}bog_site_page ${d}mol_view`,
				`	Theme ${d}mol_view`,
				`	sub /`,
				``,
			].join( '\n' )

			const tree = file_of(
				$.$bog_vmap_app_export_build([ { source: own } ]),
				'.view.tree',
			)

			$mol_assert_ok( tree.includes( `\t\t<= Theme2 ${d}mol_theme_auto\n` ) )

		},

		'the workflow builds the module by the stock action and nothing by hand'( $ ) {

			const module = $.$bog_vmap_app_export_build([ { source: page }, { source: hero } ])
			const yml = file_of( module, '.github/workflows/deploy.yml' )

			$mol_assert_ok( yml.includes( 'uses: hyoo-ru/mam_build@master2' ) )
			$mol_assert_ok( yml.includes( `package: '${ module.path }'` ) )
			$mol_assert_ok( yml.includes( `folder: '${ module.path }/-'` ) )

			$mol_assert_equal( yml.includes( 'git clone' ), false )
			$mol_assert_equal( yml.includes( 'npm start' ), false )
			$mol_assert_equal( yml.includes( 'bog/vmap' ), false )

			$mol_assert_equal( file_of( module, '.gitattributes' ), '*\t-text\n' )
			$mol_assert_ok( file_of( module, '.gitignore' ).startsWith( '-*' ) )

		},

		'the readme names the module path, not the editor'( $ ) {

			const module = $.$bog_vmap_app_export_build([ { source: page }, { source: hero } ])
			const readme = file_of( module, 'README.md' )

			$mol_assert_ok( readme.startsWith( `# ${ module.name }\n` ) )
			$mol_assert_ok( readme.includes( `npm start ${ module.path }` ) )
			$mol_assert_equal( readme.includes( 'bog/vmap' ), false )

		},

		'the module is the files a person would have written'( $ ) {

			const module = $.$bog_vmap_app_export_build([ { source: page }, { source: hero } ])

			$mol_assert_equal( module.path, 'bog/site' )
			$mol_assert_equal( module.name, 'site' )

			$mol_assert_like(
				module.files.map( file => file.name ),
				[
					'site.view.tree',
					'site.meta.tree',
					'index.html',
					'README.md',
					'.gitattributes',
					'.gitignore',
					'.github/workflows/deploy.yml',
				],
			)

			const full = $.$bog_vmap_app_export_build([
				{ source: page },
				{ source: hero, js: 'count( next?: number ) {\n\treturn next ?? 7\n}\n', css: '[bog_site_hero]{}' },
			])

			$mol_assert_like(
				full.files.map( file => file.name ),
				[
					'site.view.tree',
					'site.view.ts',
					'site.view.css',
					'site.meta.tree',
					'index.html',
					'README.md',
					'.gitattributes',
					'.gitignore',
					'.github/workflows/deploy.yml',
				],
			)

		},

		'a root outside the document is refused'( $ ) {

			$mol_assert_fail(
				()=> $.$bog_vmap_app_export_build([ { source: page }, { source: hero } ], `${d}bog_site_nope` ),
				Error,
			)

		},

		'a class declared twice is refused'( $ ) {

			$mol_assert_fail(
				()=> $.$bog_vmap_app_export_build([ { source: hero }, { source: hero } ]),
				Error,
			)

		},

		'an artboard exports as the tree it shows, with no coordinate in it'( $ ) {

			const board = [
				`${d}bog_site_page ${d}mol_view`,
				`	Head ${d}mol_view`,
				`	Foot ${d}mol_view`,
				`	Loose ${d}mol_view`,
				`	Board ${d}mol_view`,
				`		style *`,
				`			width \\1280px`,
				`			flexDirection \\column`,
				`		sub /`,
				`			<= Head`,
				`			<= Foot`,
				`	sub /`,
				`		<= Board`,
				`		<= Loose`,
				``,
			].join( '\n' )

			const tree = file_of( $.$bog_vmap_app_export_build([ { source: board } ]), '.view.tree' )

			$mol_assert_equal( tree, board + theme )

			const css = file_of( $.$bog_vmap_app_export_build([ { source: board } ]), '.view.css' )
			$mol_assert_equal( /\bleft\b|\btop\b|position/.test( css ), false )

		},

		'a document of two artboards exports with a router over them'( $ ) {

			const module = $.$bog_vmap_app_export_build([ { source: pages }, { source: hero } ])

			const tree = file_of( module, '.view.tree' )
			const ts = file_of( module, '.view.ts' )

			$mol_assert_equal( tree, pages + hero + `${d}bog_site_app ${d}mol_view\n` + theme + `\tDoc ${d}bog_site_page\n` )

			$mol_assert_equal( tree.indexOf( `${d}bog_site_page ` ) < tree.indexOf( `${d}bog_site_app ` ), true )

			$mol_assert_equal( ts.includes( `switch( this.$.${d}mol_state_arg.value( 'page' ) ) {` ), true )
			$mol_assert_equal( ts.includes( `case "About": return [ doc.About() ]` ), true )
			$mol_assert_equal( ts.includes( `default: return [ doc.Home() ]` ), true )

			$mol_assert_equal( ts.includes( 'Loose' ), false )

			$mol_assert_equal( ts.includes( 'const doc = this.Doc()' ), true )

			$mol_assert_equal( module.root, `${d}bog_site_app` )
			$mol_assert_equal( file_of( module, 'index.html' ).includes( `mol_view_root="${d}bog_site_app"` ), true )

		},

		'a routed document ships no placement'( $ ) {

			const module = $.$bog_vmap_app_export_build([ { source: pages }, { source: hero } ])

			$mol_assert_equal( /\bleft\b|\btop\b|position/.test( file_of( module, '.view.css' ) ), false )
			$mol_assert_equal( /\bx\b|\by\b|spot/.test( file_of( module, '.view.ts' ) ), false )

		},

		'a document of one artboard gets no router'( $ ) {

			const one = [
				`${d}bog_site_page ${d}mol_view`,
				`	Head ${d}mol_view`,
				`	Home ${d}mol_view sub / <= Head`,
				`	sub / <= Home`,
				``,
			].join( '\n' )

			const module = $.$bog_vmap_app_export_build([ { source: one } ])

			$mol_assert_equal( file_of( module, '.view.tree' ), one + theme )
			$mol_assert_equal( module.root, `${d}bog_site_page` )
			$mol_assert_like(
				module.files.map( file => file.name ),
				[
					'page.view.tree',
					'page.meta.tree',
					'index.html',
					'README.md',
					'.gitattributes',
					'.gitignore',
					'.github/workflows/deploy.yml',
				],
			)

		},

		'the router leaves the module where the document put it'( $ ) {

			const module = $.$bog_vmap_app_export_build([ { source: pages }, { source: hero } ])

			$mol_assert_equal( module.path, 'bog/site' )
			$mol_assert_equal( module.root, `${d}bog_site_app` )
			$mol_assert_equal(
				$.$bog_vmap_app_export_path([ `${d}bog_site_page`, `${d}bog_site_hero`, module.root ]),
				'bog/site',
			)

			const deep = $.$bog_vmap_app_export_build([ { source: pages } ])

			$mol_assert_equal( deep.path, 'bog/site/page' )
			$mol_assert_equal( deep.root, `${d}bog_site_page_app` )
			$mol_assert_equal(
				$.$bog_vmap_app_export_path([ `${d}bog_site_page`, deep.root ]),
				'bog/site/page',
			)

		},

		'a router named by the document takes the next free name'( $ ) {

			const module = $.$bog_vmap_app_export_build([
				{ source: pages },
				{ source: `${d}bog_site_app ${d}mol_view\n\ttitle \\Taken\n` },
			], `${d}bog_site_page` )

			$mol_assert_equal( module.root, `${d}bog_site_app2` )
			$mol_assert_equal( file_of( module, '.view.tree' ).includes( `${d}bog_site_app2 ${d}mol_view` ), true )

		},

		'a body that would not pass strict is named before the export'( $ ) {

			const notes = $.$bog_vmap_app_export_untyped( 'count( next ) {\n\treturn next ?? 7\n}\n' )

			$mol_assert_equal( notes.length, 1 )
			$mol_assert_equal( notes[0].method, 'count' )
			$mol_assert_equal( notes[0].param, 'next' )
			$mol_assert_equal( notes[0].line, 1 )

			const error = $mol_assert_fail(
				()=> $.$bog_vmap_app_export_build([
					{ source: page },
					{ source: hero, js: 'title() {\n\treturn "hi"\n}\n\ncount( next ) {\n\treturn next ?? 7\n}\n' },
				]),
				Error,
			)

			$mol_assert_equal( error.message.includes( `${d}bog_site_hero` ), true )
			$mol_assert_equal( error.message.includes( 'строка 5' ), true )
			$mol_assert_equal( error.message.includes( 'count' ), true )
			$mol_assert_equal( error.message.includes( 'next' ), true )

		},

		'a typed body passes untouched'( $ ) {

			const js = [
				`@ ${d}mol_mem`,
				'count( next?: number ) {',
				'	return next ?? 7',
				'}',
				'',
				'sum( rest = 0 ) {',
				'	return this.items().map( item => item.value() ).reduce( ( a: number, b: number )=> a + b, rest )',
				'}',
				'',
				'title() {',
				'	if( this.count() ) return "many"',
				'	for( const item of this.items() ) return "one"',
				'	return ""',
				'}',
				'',
			].join( '\n' )

			$mol_assert_like( $.$bog_vmap_app_export_untyped( js ), [] )

			const module = $.$bog_vmap_app_export_build([ { source: page }, { source: hero, js } ])

			$mol_assert_equal( file_of( module, '.view.ts' ).includes( 'count( next?: number )' ), true )

		},

		'the check keeps quiet on everything it is not sure of'( $ ) {

			const quiet = ( js: string )=> $mol_assert_like( $.$bog_vmap_app_export_untyped( js ), [] )

			quiet( 'render( { head, foot } ) {\n\treturn [ head, foot ]\n}\n' )

			quiet( 'handler = ( event )=> event.type\n' )

			quiet( 'pick( this: $, id: string ) {\n\treturn id\n}\n' )

			quiet( 'first< Item >( list: Item[] ) {\n\treturn list[0]\n}\n' )

			quiet( 'plus( a ): number\nplus( a: number ) {\n\treturn a\n}\n' )

			quiet( 'join( a?: string, ... rest: string[] ) {\n\treturn [ a, ... rest ]\n}\n' )

			quiet( 'sample() {\n\treturn `\ncount( next ) {\n`\n}\n' )

			quiet( 'sample() {\n\treturn 1\n}\n// count( next ) {\n' )
			quiet( 'sample() {\n\treturn 1\n}\n/*\ncount( next ) {\n*/\n' )

			quiet( 'config() {\n\treturn {\n\t\topen( next ) { return next },\n\t}\n}\n' )

			quiet( 'run() {\n\tsuper( next )\n\tthis.compute( x )\n}\n' )

		},

		'the check does say the parameter it is sure about'( $ ) {

			const first = ( js: string )=> $.$bog_vmap_app_export_untyped( js )[0]

			const beside = $.$bog_vmap_app_export_untyped( 'pick( this: $, id ) {\n\treturn id\n}\n' )
			$mol_assert_equal( beside.length, 1 )
			$mol_assert_equal( beside[0].param, 'id' )

			$mol_assert_equal( first( 'first< Item >( list ) {\n\treturn list[0]\n}\n' ).param, 'list' )

			const rest = first( 'join( ... parts ) {\n\treturn parts\n}\n' )
			$mol_assert_equal( rest.param, 'parts' )
			$mol_assert_equal( rest.text.includes( '... parts: number[]' ), true )

			$mol_assert_equal( first( 'load( id? ) {\n\treturn id\n}\n' ).param, 'id' )

			$mol_assert_equal( first( 'set title( next ) {\n\treturn next\n}\n' ).method, 'title' )
			$mol_assert_equal( first( 'async load( id ) {\n\treturn id\n}\n' ).method, 'load' )

			const split = first( 'sum(\n\ta: number,\n\tb,\n) {\n\treturn a + b\n}\n' )
			$mol_assert_equal( split.param, 'b' )
			$mol_assert_equal( split.line, 1 )

			const inset = first( '\tcount( next ) {\n\t\treturn next\n\t}\n' )
			$mol_assert_equal( inset.param, 'next' )

			$mol_assert_equal(
				first( 'count( next ) {\n\treturn next\n}\n' ).text.includes( 'count( next?: number )' ),
				true,
			)

		},

		'a name only the hand written body answers is declared for it'( $ ) {

			const source = [
				`${d}bog_site_page ${d}mol_view`,
				`	Hero ${d}bog_site_hero title <= greeting`,
				`	sub / <= Hero`,
				``,
			].join( '\n' )

			const js = 'greeting(): string {\n\treturn \'Hi\'\n}'

			const module = $.$bog_vmap_app_export_build(
				[ { source, js }, { source: hero } ],
				`${d}bog_site_page`,
			)

			const tree = file_of( module, '.view.tree' )

			$mol_assert_equal( tree.includes( '\tgreeting null\n' ), true )

			$mol_assert_equal( tree.includes( `\tHero ${d}bog_site_hero title <= greeting\n` ), true )

		},

		'a name the body does not answer is left alone'( $ ) {

			const source = [
				`${d}bog_site_page ${d}mol_view`,
				`	Hero ${d}bog_site_hero title <= greeting`,
				`	Note ${d}mol_view sub / <= title`,
				`	title \\Hi`,
				`	sub / <= Hero`,
				``,
			].join( '\n' )

			const js = 'greeting(): string {\n\treturn \'Hi\'\n}'

			const model = $bog_vmap_lang_node.make({ $ })
			model.source( source )

			$mol_assert_like( $.$bog_vmap_app_export_hooks( model.tree(), js ), [ 'greeting' ] )

			const module = $.$bog_vmap_app_export_build( [ { source, js }, { source: hero } ] )
			$mol_assert_equal( file_of( module, '.view.tree' ).includes( 'title null' ), false )

		},

		'a document without hand written code is written out unchanged'( $ ) {

			const module = $.$bog_vmap_app_export_build([ { source: page }, { source: hero } ])

			$mol_assert_equal( file_of( module, '.view.tree' ).includes( 'null' ), false )

		},

		'a cycle of bases is refused rather than hung'( $ ) {

			$mol_assert_fail(
				()=> $.$bog_vmap_app_export_build([
					{ source: `${d}bog_site_a ${d}bog_site_b\n\tx \\1\n` },
					{ source: `${d}bog_site_b ${d}bog_site_a\n\ty \\2\n` },
				]),
				Error,
			)

		},

		'the address of an asset leaves the export exactly as it entered'( $ ) {

			const uri = 'https://baza.test/?BAZA:file=TQzejQsT_m3PFV7J3;name=logo.png'

			const module = $.$bog_vmap_app_export_build([
				{ source: `${d}bog_site_page ${d}mol_view\n\tLogo ${d}mol_image uri \\${ uri }\n\tsub / <= Logo\n` },
			])

			const tree = file_of( module, '.view.tree' )

			$mol_assert_ok( tree.includes( `uri \\${ uri }` ) )
			$mol_assert_equal( module.files.some( file => file.name.startsWith( 'assets/' ) ), false )

		},

	})

}
