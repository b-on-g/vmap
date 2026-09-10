namespace $ {

	const d = '$'

	function part_lib( $: $ ) {

		const file = $.$mol_file.relative( 'bog/vmap/part/-/web.view.tree' )
		if( !file.exists() ) $mol_fail( new Error( `Пак не собран, нет файла ${ file.path() }` ) )

		const lib = $.$bog_vmap_lib.make({ $ })

		lib.tree = ()=> $.$bog_vmap_lib_parse( file.text(), file.path() )

		return lib
	}

	$mol_test({

		'the pack lists both parts with their ports'( $ ) {

			const lib = part_lib( $ )

			const calc = lib.props_map( `${d}bog_vmap_part_calc` )
			$mol_assert_ok( calc.has( 'result' ) )
			$mol_assert_ok( calc.has( 'left' ) )
			$mol_assert_ok( calc.has( 'right' ) )
			$mol_assert_ok( calc.has( 'op' ) )

			const map = lib.props_map( `${d}bog_vmap_part_map` )
			$mol_assert_ok( map.has( 'zoom' ) )
			$mol_assert_ok( map.has( 'lat' ) )
			$mol_assert_ok( map.has( 'lng' ) )
			$mol_assert_ok( map.has( 'marker' ) )

			$mol_assert_ok( map.has( 'sub' ) )

		},

		'the pack carries the basics of mol beside the parts'( $ ) {

			const lib = part_lib( $ )
			const list = lib.class_list()

			for( const name of [ 'mol_view', 'mol_button', 'mol_button_major', 'mol_string', 'mol_number', 'mol_check_box', 'mol_map_yandex', 'mol_text', 'mol_link', 'mol_image' ] ) {
				$mol_assert_ok( list.includes( d + name ) )
			}

			$mol_assert_ok( list.length > 50 )

			$mol_assert_equal( list.includes( `${d}mol_page` ), false )

		},

		'the pack resolves the chains of both parts down to the stub'( $ ) {

			const lib = part_lib( $ )

			$mol_assert_equal(
				lib.inherit_chain( `${d}bog_vmap_part_calc` ).join( ' ' ),
				`${d}bog_vmap_part_calc ${d}mol_view ${d}mol_object`,
			)

			$mol_assert_equal(
				lib.inherit_chain( `${d}bog_vmap_part_map` ).join( ' ' ),
				`${d}bog_vmap_part_map ${d}mol_view ${d}mol_object`,
			)

		},

		'a document wiring the calculator into the map compiles against the pack'( $ ) {

			const lib = part_lib( $ )

			const doc = $.$mol_tree2_from_string( [
				`${d}bog_vmap_part_test_doc ${d}mol_view`,
				`	Calc ${d}bog_vmap_part_calc`,
				`	calc_result = Calc result`,
				`	Map ${d}bog_vmap_part_map zoom <= calc_result`,
				`	sub /`,
				`		<= Calc`,
				`		<= Map`,
				``,
			].join( '\n' ), 'doc.view.tree' )

			lib.classes = ()=> $.$mol_view_tree2_normalize( doc ).kids

			const ports = lib.props_map( `${d}bog_vmap_part_test_doc` )
			$mol_assert_ok( ports.has( 'Calc' ) )
			$mol_assert_ok( ports.has( 'Map' ) )
			$mol_assert_ok( ports.has( 'calc_result' ) )

			const js = $.$mol_tree2_text_to_string( $.$mol_tree2_js_to_text( $.$mol_view_tree2_to_js( doc ) ) )
			$mol_assert_ok( js.includes( 'this.Calc().result()' ) )
			$mol_assert_ok( js.includes( 'this.calc_result()' ) )

		},

		'every detail of the shelf declares a floor of its own'( $ ) {

			const doc = $.$mol_dom_context.document
			$mol_assert_ok( doc )

			for( const part of [ 'calc', 'cell', 'map', 'plot' ] ) {

				const el = doc.getElementById( `${d}mol_style_attach:${d}bog_vmap_part_${ part }` )
				$mol_assert_ok( el )

				const own = ( el!.textContent ?? '' ).split( '}' )[ 0 ]
				const floor = /min-width:\s*([^;]+)/.exec( own )?.[ 1 ]?.trim() ?? ''

				$mol_assert_ok( floor )
				$mol_assert_equal( floor === '0' || floor === '0px', false )

			}

		},

		'the dev server address of the pack derives both links'( $ ) {

			const lib = $.$bog_vmap_lib.make({ $ })

			lib.pack( 'http://localhost:9080/bog/vmap/part/-/' )
			$mol_assert_equal( lib.tree_link(), 'http://localhost:9080/bog/vmap/part/-/web.view.tree' )
			$mol_assert_equal( lib.script_link(), 'http://localhost:9080/bog/vmap/part/-/web.js' )

			lib.pack( 'http://localhost:9080/bog/vmap/part/-' )
			$mol_assert_equal( lib.tree_link(), 'http://localhost:9080/bog/vmap/part/-/web.view.tree' )

		},

	})

}
