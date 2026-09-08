namespace $ {

	/**
	 * Tests of the slicing by property.
	 *
	 * Text in, text out, no view anywhere: the round trip of stage 4.2 is a
	 * property of the strings alone.
	 */

	const klass = 'bog_vmap_app_page'

	const body = [
		'title() {',
		'\treturn \'hi\'',
		'}',
		'',
		'rows( key, next ) {',
		'\tif( next ) return { a: 1 }',
		'\treturn []',
		'}',
	].join( '\n' )

	const styles = [
		'[bog_vmap_app_page_calc] {',
		'\tcolor: red;',
		'}',
		'',
		'[bog_vmap_app_page_hero] {',
		'\tflex: 1;',
		'}',
	].join( '\n' )

	$mol_test({

		'a class body is cut into its properties'( $ ) {

			const props = $.$bog_vmap_app_code_props_js( body )

			$mol_assert_equal( [ ... props.keys() ].join( ' ' ), 'title rows' )
			$mol_assert_equal( props.get( 'title' ), 'title() {\n\treturn \'hi\'\n}' )

		},

		'a body with braces inside a property stays one property'( $ ) {

			const props = $.$bog_vmap_app_code_props_js( body )

			$mol_assert_equal(
				props.get( 'rows' ),
				'rows( key, next ) {\n\tif( next ) return { a: 1 }\n\treturn []\n}',
			)

		},

		'slicing a body and joining it back gives the same text'( $ ) {

			const props = $.$bog_vmap_app_code_props_js( body )

			$mol_assert_equal( $.$bog_vmap_app_code_joined( props ), body )

		},

		'one property edited leaves the others byte for byte'( $ ) {

			const props = $.$bog_vmap_app_code_props_js( body )
			const next = 'title() {\n\treturn \'bye\'\n}'

			$.$bog_vmap_app_code_with( props, 'title', next )

			$mol_assert_equal(
				$.$bog_vmap_app_code_joined( props ),
				next + '\n\n' + props.get( 'rows' ),
			)

		},

		'an unbalanced body fails instead of returning half a slicing'( $ ) {

			$mol_assert_fail(
				()=> $.$bog_vmap_app_code_props_js( 'title() {\n\treturn 1\n' ),
				'Curly braces is not balanced',
			)

		},

		'text after the last property is kept and comes back on join'( $ ) {

			const src = body + '\n\n// a note nobody parses'
			const props = $.$bog_vmap_app_code_props_js( src )

			$mol_assert_equal( props.get( '' ), '// a note nobody parses' )
			$mol_assert_equal( $.$bog_vmap_app_code_joined( props ), src )

		},

		'a new property is appended before the leftovers, not after'( $ ) {

			const props = $.$bog_vmap_app_code_props_js( body + '\n\n// note' )

			$.$bog_vmap_app_code_with( props, 'extra', 'extra() {\n\t\n}' )

			$mol_assert_equal( [ ... props.keys() ].join( ' ' ), 'title rows extra ' )

		},

		'styles are cut by the attribute of the node'( $ ) {

			const props = $.$bog_vmap_app_code_props_css( styles, klass )

			$mol_assert_equal( [ ... props.keys() ].join( ' ' ), 'calc hero' )
			$mol_assert_equal( props.get( 'calc' ), '[bog_vmap_app_page_calc] {\n\tcolor: red;\n}' )

		},

		'slicing styles and joining them back gives the same text'( $ ) {

			const props = $.$bog_vmap_app_code_props_css( styles, klass )

			$mol_assert_equal( $.$bog_vmap_app_code_joined( props ), styles )

		},

		'the leading sigil of a class name is not part of its attribute'( $ ) {

			const props = $.$bog_vmap_app_code_props_css( styles, '$' + klass )

			$mol_assert_equal( [ ... props.keys() ].join( ' ' ), 'calc hero' )

		},

		'a rule about another class rides with the one after it'( $ ) {

			const src = '[mol_view] {\n\tcolor: red;\n}\n\n' + styles
			const props = $.$bog_vmap_app_code_props_css( src, klass )

			$mol_assert_equal( [ ... props.keys() ].join( ' ' ), 'calc hero' )
			$mol_assert_equal( $.$bog_vmap_app_code_joined( props ), src )

		},

		'unbalanced styles fail instead of returning half a slicing'( $ ) {

			$mol_assert_fail(
				()=> $.$bog_vmap_app_code_props_css( '[bog_vmap_app_page_calc] {\n', klass ),
				'Curly braces is not balanced',
			)

		},

		'the default method of a property follows its signature'( $ ) {

			$mol_assert_equal( $.$bog_vmap_app_code_js_default( 'title' ), 'title(  ) {\n\t\n}' )
			$mol_assert_equal( $.$bog_vmap_app_code_js_default( 'rows', true ), 'rows( key ) {\n\t\n}' )
			$mol_assert_equal(
				$.$bog_vmap_app_code_js_default( 'rows', true, true ),
				'rows( key, next ) {\n\t\n}',
			)

		},

		'the default rule of a property addresses the node of that property'( $ ) {

			$mol_assert_equal(
				$.$bog_vmap_app_code_css_default( 'Calc', '$' + klass ),
				'[bog_vmap_app_page_calc] {\n\t\n}',
			)

		},

	})

}
