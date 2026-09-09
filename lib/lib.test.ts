namespace $ {

	/**
	 * Tests of the pure half of `$bog_vmap_lib`: parsing, the `$mol_view` stub,
	 * the inheritance walk and the united namespace.
	 *
	 * Nothing here touches the network. CI runs `node.test.js` and a live fetch
	 * would make the build depend on a third party host being up.
	 *
	 * `d` keeps `$` out of the string literals: mam builds its dependency graph by
	 * a regexp over sources, literals included, so a bare `$mol_button` in a
	 * fixture would drag a whole module into the bundle.
	 */
	const d = '$'

	const lib_src = [
		`${d}bog_vmap_lib_test_a ${d}mol_view`,
		`	title \\A`,
		`	count 0`,
		``,
		`${d}bog_vmap_lib_test_b ${d}bog_vmap_lib_test_a`,
		`	count 1`,
		`	extra \\x`,
		``,
	].join( '\n' )

	const doc_src = [
		`${d}bog_vmap_lib_test_doc ${d}bog_vmap_lib_test_b`,
		`	own \\z`,
		``,
	].join( '\n' )

	$mol_test({

		'predef gives $mol_view its own ports'( $ ) {

			const tree = $.$bog_vmap_lib_parse( '' )
			const index = $.$bog_vmap_lib_index( tree )

			$mol_assert_equal( index.has( `${d}mol_view` ), true )

			const props = $.$bog_vmap_lib_props_map( index, `${d}mol_view` )

			$mol_assert_equal(
				[ ... props.keys() ].join( ' ' ),
				'dom_name style event field attr sub title',
			)

		},

		'pack classes land next to the stub'( $ ) {

			const index = $.$bog_vmap_lib_index( $.$bog_vmap_lib_parse( lib_src ) )

			$mol_assert_equal(
				[ ... index.keys() ].join( ' ' ),
				`${d}mol_view ${d}bog_vmap_lib_test_a ${d}bog_vmap_lib_test_b`,
			)

			$mol_assert_equal( index.get( `${d}bog_vmap_lib_test_b` )!.type, `${d}bog_vmap_lib_test_a` )

		},

		'inheritance chain ends at the first undeclared name'( $ ) {

			const index = $.$bog_vmap_lib_index( $.$bog_vmap_lib_parse( lib_src ) )

			$mol_assert_equal(
				$.$bog_vmap_lib_chain( index, `${d}bog_vmap_lib_test_b` ).join( ' ' ),
				`${d}bog_vmap_lib_test_b ${d}bog_vmap_lib_test_a ${d}mol_view ${d}mol_object`,
			)

			$mol_assert_equal(
				$.$bog_vmap_lib_chain( index, `${d}nowhere` ).join( ' ' ),
				`${d}nowhere`,
			)

		},

		'props_map carries inherited ports and the most derived value'( $ ) {

			const index = $.$bog_vmap_lib_index( $.$bog_vmap_lib_parse( lib_src ) )
			const props = $.$bog_vmap_lib_props_map( index, `${d}bog_vmap_lib_test_b` )

			// seven from $mol_view, then title redeclared, then count and extra
			$mol_assert_equal(
				[ ... props.keys() ].join( ' ' ),
				'dom_name style event field attr sub title count extra',
			)

			// redeclared in the subclass, so the subclass node wins
			$mol_assert_equal( props.get( 'count' )!.kids[0].type, '1' )

			// declared once in the middle of the chain
			$mol_assert_equal( props.get( 'title' )!.kids[0].value, 'A' )

		},

		'a malformed pack points at the row of the pack, not of the stub'( $ ) {

			// `$mol_error_syntax` itself does not fit the `typeof Error` parameter,
			// its constructor takes three arguments
			const error = $mol_assert_fail(
				()=> $.$bog_vmap_lib_parse( `${d}q ${d}w\n\t\t\toops \\\n`, 'pack.view.tree' ),
				SyntaxError,
			) as $mol_error_syntax

			// gluing the stub in front of the source, the way studio does, reports
			// this very row as `#10`, eight below where the user has to look
			$mol_assert_equal( String( error.span ), 'pack.view.tree#2:1/3' )

		},

		'a redeclared port keeps the position of its first declaration'( $ ) {

			const index = $.$bog_vmap_lib_index( $.$bog_vmap_lib_parse( lib_src ) )
			const keys = [ ... $.$bog_vmap_lib_props_map( index, `${d}bog_vmap_lib_test_b` ).keys() ]

			// `title` comes from $mol_view and is redeclared by _test_a
			$mol_assert_equal( keys.indexOf( 'title' ), 6 )

		},

		'every port names the class it came from'( $ ) {

			const index = $.$bog_vmap_lib_index( $.$bog_vmap_lib_parse( lib_src ) )
			const owner = $.$bog_vmap_lib_props_owner( index, `${d}bog_vmap_lib_test_b` )

			// the same keys as props_map, so «inherited» is one comparison away
			$mol_assert_equal(
				[ ... owner.keys() ].join( ' ' ),
				[ ... $.$bog_vmap_lib_props_map( index, `${d}bog_vmap_lib_test_b` ).keys() ].join( ' ' ),
			)

			$mol_assert_equal( owner.get( 'sub' ), `${d}mol_view` )
			$mol_assert_equal( owner.get( 'extra' ), `${d}bog_vmap_lib_test_b` )

			// `title` is declared twice, the nearer declaration owns it
			$mol_assert_equal( owner.get( 'title' ), `${d}bog_vmap_lib_test_a` )

			// `count` is declared in both classes, so the nearer one is the owner
			$mol_assert_equal( owner.get( 'count' ), `${d}bog_vmap_lib_test_b` )

		},

		'a cycle in the namespace does not hang'( $ ) {

			const src = [
				`${d}bog_vmap_lib_test_x ${d}bog_vmap_lib_test_y`,
				`	left \\`,
				``,
				`${d}bog_vmap_lib_test_y ${d}bog_vmap_lib_test_x`,
				`	right \\`,
				``,
			].join( '\n' )

			const index = $.$bog_vmap_lib_index( $.$bog_vmap_lib_parse( src ) )

			$mol_assert_equal(
				$.$bog_vmap_lib_chain( index, `${d}bog_vmap_lib_test_x` ).join( ' ' ),
				`${d}bog_vmap_lib_test_x ${d}bog_vmap_lib_test_y`,
			)

			$mol_assert_equal(
				[ ... $.$bog_vmap_lib_props_map( index, `${d}bog_vmap_lib_test_x` ).keys() ].join( ' ' ),
				'right left',
			)

		},

		'united resolves document classes against the library'( $ ) {

			const lib = $.$bog_vmap_lib_parse( lib_src )
			const doc = $.$bog_vmap_lib_parse( doc_src )

			// the stub is part of every parse, drop it from the document side
			const doc_kids = doc.kids.filter( cl => cl.type !== `${d}mol_view` )

			const index = $.$bog_vmap_lib_index( $.$bog_vmap_lib_united( lib, doc_kids ) )
			const props = $.$bog_vmap_lib_props_map( index, `${d}bog_vmap_lib_test_doc` )

			$mol_assert_equal(
				[ ... props.keys() ].join( ' ' ),
				'dom_name style event field attr sub title count extra own',
			)

		},

		'a document class shadows a library class of the same name'( $ ) {

			const lib = $.$bog_vmap_lib_parse( lib_src )

			const own = $.$bog_vmap_lib_parse( [
				`${d}bog_vmap_lib_test_a ${d}mol_view`,
				`	mine \\`,
				``,
			].join( '\n' ) ).kids.filter( cl => cl.type !== `${d}mol_view` )

			const index = $.$bog_vmap_lib_index( $.$bog_vmap_lib_united( lib, own ) )
			const props = $.$bog_vmap_lib_props_map( index, `${d}bog_vmap_lib_test_a` )

			// the library declaration of _test_a is gone, only the document one is left
			$mol_assert_equal( props.has( 'mine' ), true )
			$mol_assert_equal( props.has( 'count' ), false )

		},

		'united of nothing is the library itself'( $ ) {
			const lib = $.$bog_vmap_lib_parse( lib_src )
			$mol_assert_equal( $.$bog_vmap_lib_united( lib, [] ), lib )
		},

		'lists and search over a namespace'( $ ) {

			const lib = $.$bog_vmap_lib.make({
				$,
				tree: ()=> $.$bog_vmap_lib_parse( lib_src ),
			})

			$mol_assert_equal(
				lib.class_list().join( ' ' ),
				`${d}mol_view ${d}bog_vmap_lib_test_a ${d}bog_vmap_lib_test_b`,
			)

			$mol_assert_equal(
				lib.base_options().join( ' ' ),
				`${d}bog_vmap_lib_test_b ${d}bog_vmap_lib_test_a ${d}mol_view`,
			)

			$mol_assert_equal( lib.class_search( 'test_b' ).join( ' ' ), `${d}bog_vmap_lib_test_b` )
			$mol_assert_equal( lib.class_search( '' ).length, 3 )

			$mol_assert_equal( lib.inherit_chain( `${d}bog_vmap_lib_test_a` ).length, 3 )
			$mol_assert_equal( lib.props_map( `${d}bog_vmap_lib_test_a` ).size, 8 )

			// props_of is the same set as a tree, most derived first
			$mol_assert_equal( lib.props_of( `${d}bog_vmap_lib_test_b` ).kids[0].type, 'extra' )

		},

		'the pack address drives both links'( $ ) {

			const lib = $.$bog_vmap_lib.make({ $ })

			$mol_assert_equal( lib.tree_link(), 'https://mol.hyoo.ru/web.view.tree' )
			$mol_assert_equal( lib.script_link(), 'https://mol.hyoo.ru/web.js' )

			lib.pack( 'https://example.org/app/' )

			$mol_assert_equal( lib.tree_link(), 'https://example.org/app/web.view.tree' )
			$mol_assert_equal( lib.script_link(), 'https://example.org/app/web.js' )

		},

		/**
		 * A pack served from a sub path is the normal case: every app of ours sits
		 * at `<user>.github.io/<repo>/`. Without the trailing slash `new URL` would
		 * take `<repo>` for a file name and drop it.
		 */
		'a pack address without a trailing slash keeps its last segment'( $ ) {

			const lib = $.$bog_vmap_lib.make({ $ })

			lib.pack( 'https://b-on-g.github.io/gram' )

			$mol_assert_equal( lib.tree_link(), 'https://b-on-g.github.io/gram/web.view.tree' )
			$mol_assert_equal( lib.script_link(), 'https://b-on-g.github.io/gram/web.js' )

			// the address the user typed is left alone, only the derived base grows
			$mol_assert_equal( lib.pack(), 'https://b-on-g.github.io/gram' )
			$mol_assert_equal( lib.pack_base(), 'https://b-on-g.github.io/gram/' )

			lib.pack( 'https://b-on-g.github.io/gram/' )

			$mol_assert_equal( lib.tree_link(), 'https://b-on-g.github.io/gram/web.view.tree' )

		},

		/**
		 * The dev server keeps a module in `<pack>/<module>/-/`, so a sibling of the
		 * page keeps the `-` as well. Both entry pages of a module live there, and
		 * the editor is developed on `test.html`.
		 */
		'a sibling module on the dev server keeps the build folder'( $ ) {

			const page = 'http://localhost:9080/bog/vmap/app/-/test.html'

			$mol_assert_equal(
				$bog_vmap_lib_sibling( page, 'scene' ),
				'http://localhost:9080/bog/vmap/scene/-/',
			)

			$mol_assert_equal(
				$bog_vmap_lib_sibling( page, 'part' ),
				'http://localhost:9080/bog/vmap/part/-/',
			)

			$mol_assert_equal(
				$bog_vmap_lib_sibling( 'http://localhost:9080/bog/vmap/app/-/index.html', 'scene' ),
				'http://localhost:9080/bog/vmap/scene/-/',
			)

		},

		/**
		 * A deploy publishes the editor at the root of the site and every other
		 * module as a folder beneath it, so a sibling is a folder INSIDE the one the
		 * editor is served from. The address of the pack is then `<site>/part/`,
		 * which is where `web.view.tree` is, and the bundle of the sandbox is
		 * `<site>/scene/web.js` — neither of them a page.
		 */
		'a sibling module on a deploy is a folder under the editor'( $ ) {

			$mol_assert_equal(
				$bog_vmap_lib_sibling( 'https://b-on-g.github.io/vmap/', 'scene' ),
				'https://b-on-g.github.io/vmap/scene/',
			)

			$mol_assert_equal(
				$bog_vmap_lib_sibling( 'https://b-on-g.github.io/vmap/', 'part' ),
				'https://b-on-g.github.io/vmap/part/',
			)

			$mol_assert_equal(
				$bog_vmap_lib_sibling( 'https://b-on-g.github.io/vmap/index.html', 'part' ),
				'https://b-on-g.github.io/vmap/part/',
			)

		},

		/**
		 * A folder address without its slash reads the same: a last segment with no
		 * dot in it is a folder, not a page file. GitHub Pages answers both.
		 */
		'a page address without a trailing slash reads as a folder'( $ ) {

			$mol_assert_equal(
				$bog_vmap_lib_sibling( 'https://b-on-g.github.io/vmap', 'part' ),
				'https://b-on-g.github.io/vmap/part/',
			)

			$mol_assert_equal(
				$bog_vmap_lib_sibling( 'https://b-on-g.github.io/vmap?x=1#y', 'scene' ),
				'https://b-on-g.github.io/vmap/scene/',
			)

		},

		/**
		 * A dot in a FOLDER name does not make it a page. A versioned deploy is the
		 * ordinary way to get one, and taking `v1.2` for a page would eat the
		 * segment and point both addresses a level above where they live.
		 */
		'a dot in a folder name is not a page file'( $ ) {

			$mol_assert_equal(
				$bog_vmap_lib_sibling( 'https://b-on-g.github.io/vmap/v1.2/', 'part' ),
				'https://b-on-g.github.io/vmap/v1.2/part/',
			)

			$mol_assert_equal(
				$bog_vmap_lib_sibling( 'https://b-on-g.github.io/vmap/v1.2/index.html', 'scene' ),
				'https://b-on-g.github.io/vmap/v1.2/scene/',
			)

		},

		/**
		 * The editor on a domain of its own is served from the root itself, so the
		 * siblings are the first segment there. Nothing is eaten and no address
		 * climbs above the root, which is the one thing that must never happen here.
		 */
		'an editor served from the root of a site keeps its siblings under it'( $ ) {

			$mol_assert_equal(
				$bog_vmap_lib_sibling( 'https://vmap.example/', 'part' ),
				'https://vmap.example/part/',
			)

			$mol_assert_equal(
				$bog_vmap_lib_sibling( 'https://vmap.example/index.html', 'scene' ),
				'https://vmap.example/scene/',
			)

			$mol_assert_equal(
				$bog_vmap_lib_sibling( 'https://vmap.example', 'part' ),
				'https://vmap.example/part/',
			)

		},

		/**
		 * A `data:` address keeps the fetch offline while still going through the
		 * real `$mol_fetch`, so `tree()` is covered end to end and CI stays free of
		 * a third party host.
		 */
		async 'a pack is fetched and parsed'( $ ) {

			const lib = $.$bog_vmap_lib.make({
				$,
				tree_link: ()=> 'data:text/plain,' + encodeURIComponent( lib_src ),
			})

			$mol_assert_equal(
				( await $.$mol_wire_async( lib ).class_list() ).join( ' ' ),
				`${d}mol_view ${d}bog_vmap_lib_test_a ${d}bog_vmap_lib_test_b`,
			)

		},

		/**
		 * The one behaviour a try/catch inside `tree()` would quietly destroy: a
		 * dead pack has to reach the view as an error, not as an empty palette.
		 */
		async 'an unreachable pack fails instead of emptying the palette'( $ ) {

			const lib = $.$bog_vmap_lib.make({ $, tree_link: ()=> 'data:' })

			let failed = ''

			try {
				await $.$mol_wire_async( lib ).class_list()
			} catch( error: any ) {
				failed = error.constructor.name
			}

			$mol_assert_equal( failed, '$mol_error_mix' )

		},

		/**
		 * The wording of a dead pack. A status line alone — «Not Found» — is true
		 * and useless: it names neither the file that was missing nor the field to
		 * correct, and that is exactly what reached the screen.
		 */
		'a dead pack is worded with the address that was fetched'( $ ) {

			const note = $.$bog_vmap_lib_pack_note(
				'https://dead.test/web.view.tree',
				new Error( 'Not Found' ),
			)

			$mol_assert_ok( note.includes( 'Not Found' ) )
			$mol_assert_ok( note.includes( 'https://dead.test/web.view.tree' ) )

			// With no address to name — a library of lands alone — it says the one
			// thing it knows rather than an empty «Ожидался ».
			const bare = $.$bog_vmap_lib_pack_note( '', new Error( 'Failed to fetch' ) )

			$mol_assert_equal( bare, 'Пак не отвечает: Failed to fetch' )

		},

	})

}
