namespace $ {

	$mol_test({

		'the stand hands the inspector one class of a multi class document'( $ ) {

			const stand = $.$bog_vmap_app_inspect_demo.make({ $ })
			const names = stand.names()

			$mol_assert_equal( names.length, 2 )
			$mol_assert_ok( stand.class_source().startsWith( names[ 0 ] ) )

		},

		'picking a class switches what the stand hands over'( $ ) {

			const stand = $.$bog_vmap_app_inspect_demo.make({ $ })
			const names = stand.names()

			stand.klass( names[ 1 ] )

			$mol_assert_ok( stand.class_source().startsWith( names[ 1 ] ) )

		},

		'an edit through the stand leaves the other class byte for byte'( $ ) {

			const stand = $.$bog_vmap_app_inspect_demo.make({ $ })
			const other = stand.names()[ 1 ]
			const before = stand.Doc().class_source( other )

			stand.class_source( stand.class_source().replace( 'count 24', 'count 42' ) )

			$mol_assert_equal( stand.Doc().class_source( other ), before )
			$mol_assert_ok( stand.class_source().includes( 'count 42' ) )

		},

		'the inspected class is not duplicated by its own peers'( $ ) {

			const stand = $.$bog_vmap_app_inspect_demo.make({ $ })
			const types = stand.Inspect().classes().map( tree => tree.type )

			$mol_assert_like( types, stand.names() )

		},

		'layout properties land in the style of the node and read back'( $ ) {

			const inspect = inspect_of( $, [
				`${ d }bog_vmap_app_inspect_test_page ${ d }mol_view`,
				'	sub /',
				'',
			].join( '\n' ) )

			$mol_assert_equal( inspect.Flex().direction(), '' )

			inspect.Flex().direction( 'column' )
			inspect.Flex().gap( '1rem' )

			$mol_assert_equal( inspect.Flex().direction(), 'column' )
			$mol_assert_equal( inspect.Flex().gap(), '1rem' )

			$mol_assert_equal(
				inspect.Node().source(),
				[
					`${ d }bog_vmap_app_inspect_test_page ${ d }mol_view`,
					'	sub /',
					'	style *',
					'		^',
					'		flexDirection \\column',
					'		gap \\1rem',
					'',
				].join( '\n' ),
			)

			inspect.Flex().gap( '' )
			$mol_assert_equal( inspect.Flex().gap(), '' )
			$mol_assert_equal( inspect.Node().source().includes( 'gap' ), false )
			$mol_assert_equal( inspect.Flex().direction(), 'column' )

		},

		'the inherited head of the style dictionary is kept'( $ ) {

			const inspect = inspect_of( $, [
				`${ d }bog_vmap_app_inspect_test_card ${ d }mol_view`,
				'	style *',
				'		^',
				'		padding \\4px',
				'',
			].join( '\n' ) )

			inspect.Flex().across( 'center' )

			$mol_assert_like(
				inspect.style_dict()!.kids.map( kid => kid.type ),
				[ '^', 'padding', 'alignItems' ],
			)

		},

		'stretching is written as text, because a number would get px'( $ ) {

			const inspect = inspect_of( $, [
				`${ d }bog_vmap_app_inspect_test_cell ${ d }mol_view`,
				'	sub /',
				'',
			].join( '\n' ) )

			inspect.Flex().grow( true )

			$mol_assert_equal( inspect.Flex().grow(), true )
			$mol_assert_ok( inspect.Node().source().includes( 'flexGrow \\1' ) )

			inspect.Flex().grow( false )
			$mol_assert_equal( inspect.Flex().grow(), false )
			$mol_assert_equal( inspect.Node().source().includes( 'flexGrow' ), false )

		},

		'the width switch sets the width of the artboard'( $ ) {

			const inspect = inspect_of( $, [
				`${ d }bog_vmap_app_inspect_test_board ${ d }mol_view`,
				'	style * width \\1280px',
				'	sub /',
				'',
			].join( '\n' ) )

			$mol_assert_equal( inspect.Flex().width(), '1280px' )

			inspect.Flex().width( '390px' )

			$mol_assert_equal( inspect.Flex().width(), '390px' )
			$mol_assert_ok( inspect.Node().source().includes( 'width \\390px' ) )

		},

		'the name field renames on submit and not on a keystroke'( $ ) {

			const inspect = inspect_of( $, [
				`${ d }bog_vmap_app_inspect_test_name ${ d }mol_view`,
				'	sub /',
				'',
			].join( '\n' ) )

			$mol_assert_equal( inspect.title_value(), `${ d }bog_vmap_app_inspect_test_name` )

			inspect.title_value( `${ d }bog_vmap_app_inspect_test_hero` )

			$mol_assert_equal( inspect.title_value(), `${ d }bog_vmap_app_inspect_test_hero` )
			$mol_assert_equal( inspect.class_title(), `${ d }bog_vmap_app_inspect_test_name` )

			inspect.title_submit()

			$mol_assert_equal( inspect.class_title(), `${ d }bog_vmap_app_inspect_test_hero` )
			$mol_assert_ok( inspect.Node().source().startsWith( `${ d }bog_vmap_app_inspect_test_hero ` ) )

		},

		'the field follows the name once the rename lands'( $ ) {

			const inspect = inspect_of( $, [
				`${ d }bog_vmap_app_inspect_test_name ${ d }mol_view`,
				'	sub /',
				'',
			].join( '\n' ) )

			inspect.title_value( `${ d }bog_vmap_app_inspect_test_hero` )
			inspect.title_submit()

			$mol_assert_equal( inspect.title_value(), `${ d }bog_vmap_app_inspect_test_hero` )

			inspect.title_submit()
			$mol_assert_equal( inspect.class_title(), `${ d }bog_vmap_app_inspect_test_hero` )

		},

		'the refusal strip is there only while there is a refusal'( $ ) {

			const inspect = inspect_of( $, [
				`${ d }bog_vmap_app_inspect_test_name ${ d }mol_view`,
				'	sub /',
				'',
			].join( '\n' ) )

			$mol_assert_equal( inspect.sub().includes( inspect.Note() ), false )

			const refused = $.$bog_vmap_app_inspect.make({
				$,
				source: ()=> `${ d }bog_vmap_app_inspect_test_name ${ d }mol_view\n\tsub /\n`,
				title_note: ()=> 'Имя занято',
			}) as $$.$bog_vmap_app_inspect

			$mol_assert_equal( refused.sub()[ 1 ], refused.Note() )

		},

		'a source naming no class leaves an invitation, not twenty failures'( $ ) {

			const one = inspect_of( $, '' )

			$mol_assert_equal( one.class_ready(), false )

			$mol_assert_equal( one.sub().length, 1 )
			$mol_assert_equal( one.sub()[ 0 ], one.Empty() )

			const two = inspect_of( $, `${d}my_card ${d}mol_view\n\ttitle \\Hi\n` )

			$mol_assert_equal( two.class_ready(), true )
			$mol_assert_ok( two.sub().length > 1 )

		},

		'everything that can grow is inside the one scroll of the panel'( $ ) {

			const one = inspect_of( $, `${d}my_card ${d}mol_view\n\ttitle \\Hi\n` )

			const body = one.body()

			$mol_assert_equal( body.filter( view => view instanceof $mol_scroll ).length, 1 )
			$mol_assert_equal( body.includes( one.Body() ), true )

			$mol_assert_equal( body.includes( one.Flex() ), false )
			$mol_assert_equal( body.includes( one.Rows() ), false )

			$mol_assert_equal( one.body_content().includes( one.Flex() ), true )
			$mol_assert_equal( one.body_content().includes( one.Rows() ), true )

		},
	})

	const d = '$'

	function inspect_of( $: $mol_ambient_context, source: string ) {

		let text = source

		return $.$bog_vmap_app_inspect.make({
			$,
			source: ( next?: string )=> next === undefined ? text : ( text = next ),
		}) as $$.$bog_vmap_app_inspect

	}

}
