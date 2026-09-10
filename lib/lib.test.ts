namespace $ {

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

			$mol_assert_equal(
				[ ... props.keys() ].join( ' ' ),
				'dom_name style event field attr sub title count extra',
			)

			$mol_assert_equal( props.get( 'count' )!.kids[0].type, '1' )

			$mol_assert_equal( props.get( 'title' )!.kids[0].value, 'A' )

		},

		'a malformed pack points at the row of the pack, not of the stub'( $ ) {

			const error = $mol_assert_fail(
				()=> $.$bog_vmap_lib_parse( `${d}q ${d}w\n\t\t\toops \\\n`, 'pack.view.tree' ),
				SyntaxError,
			) as $mol_error_syntax

			$mol_assert_equal( String( error.span ), 'pack.view.tree#2:1/3' )

		},

		'a redeclared port keeps the position of its first declaration'( $ ) {

			const index = $.$bog_vmap_lib_index( $.$bog_vmap_lib_parse( lib_src ) )
			const keys = [ ... $.$bog_vmap_lib_props_map( index, `${d}bog_vmap_lib_test_b` ).keys() ]

			$mol_assert_equal( keys.indexOf( 'title' ), 6 )

		},

		'every port names the class it came from'( $ ) {

			const index = $.$bog_vmap_lib_index( $.$bog_vmap_lib_parse( lib_src ) )
			const owner = $.$bog_vmap_lib_props_owner( index, `${d}bog_vmap_lib_test_b` )

			$mol_assert_equal(
				[ ... owner.keys() ].join( ' ' ),
				[ ... $.$bog_vmap_lib_props_map( index, `${d}bog_vmap_lib_test_b` ).keys() ].join( ' ' ),
			)

			$mol_assert_equal( owner.get( 'sub' ), `${d}mol_view` )
			$mol_assert_equal( owner.get( 'extra' ), `${d}bog_vmap_lib_test_b` )

			$mol_assert_equal( owner.get( 'title' ), `${d}bog_vmap_lib_test_a` )

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

		'a pack address without a trailing slash keeps its last segment'( $ ) {

			const lib = $.$bog_vmap_lib.make({ $ })

			lib.pack( 'https://b-on-g.github.io/gram' )

			$mol_assert_equal( lib.tree_link(), 'https://b-on-g.github.io/gram/web.view.tree' )
			$mol_assert_equal( lib.script_link(), 'https://b-on-g.github.io/gram/web.js' )

			$mol_assert_equal( lib.pack(), 'https://b-on-g.github.io/gram' )
			$mol_assert_equal( lib.pack_base(), 'https://b-on-g.github.io/gram/' )

			lib.pack( 'https://b-on-g.github.io/gram/' )

			$mol_assert_equal( lib.tree_link(), 'https://b-on-g.github.io/gram/web.view.tree' )

		},

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

		'a dead pack is worded with the address that was fetched'( $ ) {

			const note = $.$bog_vmap_lib_pack_note(
				'https://dead.test/web.view.tree',
				new Error( 'Not Found' ),
			)

			$mol_assert_ok( note.includes( 'Not Found' ) )
			$mol_assert_ok( note.includes( 'https://dead.test/web.view.tree' ) )

			const bare = $.$bog_vmap_lib_pack_note( '', new Error( 'Failed to fetch' ) )

			$mol_assert_equal( bare, 'Пак не отвечает: Failed to fetch' )

		},

	})

}
