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

			const inspect = panel( $, [
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

			const inspect = panel( $, [
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

			const inspect = panel( $, [
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

			const inspect = panel( $, [
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

		'every layout row is a form field with a stock control'( $ ) {

			const inspect = panel( $, [
				`${ d }bog_vmap_app_inspect_test_board ${ d }mol_view`,
				'	sub /',
				'',
			].join( '\n' ) )

			const flex = inspect.Flex()

			flex.dom_tree()

			$mol_assert_equal( flex.Width().dom_node().hasAttribute( 'mol_form_field' ), true )
			$mol_assert_equal( flex.Width().name(), 'Ширина' )
			$mol_assert_equal( flex.Width().control(), flex.Width_pick() )
			$mol_assert_equal( flex.Gap().control(), flex.Gap_field() )

			$mol_assert_ok( flex.Width_pick().dom_node().hasAttribute( 'mol_switch' ) )
			$mol_assert_ok( flex.Gap_field().dom_node().hasAttribute( 'mol_string' ) )

		},

		'the name field renames on submit and not on a keystroke'( $ ) {

			const inspect = panel( $, [
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

			const inspect = panel( $, [
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

		'the head of the panel is the head of a page'( $ ) {

			const inspect = panel( $, [
				`${ d }bog_vmap_app_inspect_test_name ${ d }mol_view`,
				'	sub /',
				'',
			].join( '\n' ) )

			const root = inspect.dom_tree()

			$mol_assert_ok( root.querySelector( '[mol_page_head]' ) )
			$mol_assert_equal( inspect.Name().dom_node().hasAttribute( 'mol_string' ), true )
			$mol_assert_equal( root.contains( inspect.Name().dom_node() ), true )
			$mol_assert_equal( inspect.Name().value(), `${ d }bog_vmap_app_inspect_test_name` )
			$mol_assert_equal(
				inspect.Name().dom_node().getAttribute( 'id' )!.endsWith( 'Name()' ),
				true,
			)

		},

		'the refusal strip is there only while there is a refusal'( $ ) {

			const inspect = panel( $, [
				`${ d }bog_vmap_app_inspect_test_name ${ d }mol_view`,
				'	sub /',
				'',
			].join( '\n' ) )

			$mol_assert_equal( inspect.tools().includes( inspect.Note() ), false )

			const refused = $.$bog_vmap_app_inspect.make({
				$,
				source: ()=> `${ d }bog_vmap_app_inspect_test_name ${ d }mol_view\n\tsub /\n`,
				pack: ()=> '',
				title_note: ()=> 'Имя занято',
			}) as $$.$bog_vmap_app_inspect

			$mol_assert_equal( refused.tools().includes( refused.Note() ), true )
			$mol_assert_equal( refused.Note().message(), 'Имя занято' )

		},

		'a source naming no class leaves an invitation, not twenty failures'( $ ) {

			const one = panel( $, '' )

			$mol_assert_equal( one.class_ready(), false )

			$mol_assert_equal( one.body().length, 1 )
			$mol_assert_equal( one.body()[ 0 ], one.Empty() )

			const two = panel( $, `${ d }my_card ${ d }mol_view\n\ttitle \\Hi\n` )

			$mol_assert_equal( two.class_ready(), true )
			$mol_assert_ok( two.body().length > 1 )

		},

		'everything that can grow is inside the one scroll of the page'( $ ) {

			const one = panel( $, `${ d }my_card ${ d }mol_view\n\ttitle \\Hi\n` )

			$mol_assert_equal( one.Body() instanceof $mol_scroll, true )
			$mol_assert_equal( one.body_content().length, 1 )
			$mol_assert_equal( one.body_content()[ 0 ], one.Body_content() )

			const body = one.body()

			$mol_assert_equal( body.includes( one.Flex() ), true )
			$mol_assert_equal( body.includes( one.Rows() ), true )
			$mol_assert_equal( body.includes( one.Inherited() ), true )

		},

		'every property row is a form field labelled by the signature'( $ ) {

			const one = panel( $, [
				`${ d }bog_vmap_app_inspect_test_card ${ d }mol_view`,
				'	title \\Hi',
				'	count 24',
				'',
			].join( '\n' ) )

			one.dom_tree()

			const row = one.Row( 'title' )

			$mol_assert_equal( row.dom_node().hasAttribute( 'mol_form_field' ), true )
			$mol_assert_equal( row.name(), 'title' )
			$mol_assert_equal( one.Rows().dom_node().contains( row.dom_node() ), true )
			$mol_assert_equal( row.control(), row.Value() )

		},

		'the field of a row is the stock one for the kind of the value'( $ ) {

			const one = panel( $, [
				`${ d }bog_vmap_app_inspect_test_card ${ d }mol_view`,
				'	title \\Hi',
				'	count 24',
				'	dense false',
				'	style * padding \\4px',
				'	sub / <= Hero',
				`	Hero ${ d }mol_view`,
				'	calc = Hero title',
				'',
			].join( '\n' ) )

			one.dom_tree()

			const value = ( name: string )=>
				one.Row( name ).Value() as $$.$bog_vmap_app_inspect_value

			$mol_assert_equal( value( 'title' ).Editor(), value( 'title' ).String() )
			$mol_assert_equal( value( 'count' ).Editor(), value( 'count' ).Num() )
			$mol_assert_equal( value( 'dense' ).Editor(), value( 'dense' ).Flag() )
			$mol_assert_equal( value( 'style' ).Editor(), value( 'style' ).Seq() )
			$mol_assert_equal( value( 'sub' ).Editor(), value( 'sub' ).Seq() )
			$mol_assert_equal( value( 'calc' ).Editor(), value( 'calc' ).Wire() )

			$mol_assert_equal(
				value( 'title' ).String().Text().dom_node().hasAttribute( 'mol_string' ),
				true,
			)
			$mol_assert_equal( value( 'count' ).Num().dom_node().hasAttribute( 'mol_string' ), true )
			$mol_assert_equal( value( 'dense' ).Flag().dom_node().hasAttribute( 'mol_check' ), true )
			$mol_assert_equal( value( 'style' ).Seq().dom_node().hasAttribute( 'mol_list' ), true )
			$mol_assert_equal(
				value( 'calc' ).Wire().Origin().dom_node().hasAttribute( 'mol_select' ),
				true,
			)

		},

		'an edit in the field of a row reaches the document'( $ ) {

			const one = panel( $, [
				`${ d }bog_vmap_app_inspect_test_card ${ d }mol_view`,
				'	title \\Hi',
				'',
			].join( '\n' ) )

			one.dom_tree()

			const field = ( one.Row( 'title' ).Value() as $$.$bog_vmap_app_inspect_value )
				.String().Text()

			$mol_assert_equal( field.value(), 'Hi' )

			field.value( 'Hey' )

			$mol_assert_equal( one.row_value( 'title' ).text(), 'Hey' )
			$mol_assert_ok( one.Node().source().includes( 'title \\Hey' ) )

		},

		'a number keeps the literal the document holds'( $ ) {

			const one = panel( $, [
				`${ d }bog_vmap_app_inspect_test_card ${ d }mol_view`,
				'	ratio 1e3',
				'',
			].join( '\n' ) )

			one.dom_tree()

			const value = one.Row( 'ratio' ).Value() as $$.$bog_vmap_app_inspect_value

			$mol_assert_equal( value.Editor(), value.Num() )
			$mol_assert_equal( value.num(), '1e3' )

			value.num( '2e4' )

			$mol_assert_ok( one.Node().source().includes( 'ratio 2e4' ) )

		},

		'inherited rows live in the expander and own rows do not'( $ ) {

			const one = pair( $, [
				`${ d }bog_vmap_app_inspect_test_card ${ d }mol_view`,
				'	caption \\Карточка',
				`${ d }bog_vmap_app_inspect_test_hero ${ d }bog_vmap_app_inspect_test_card`,
				'	title \\Hi',
				'',
			].join( '\n' ), `${ d }bog_vmap_app_inspect_test_hero` )

			$mol_assert_equal( one.row_inherited( 'caption' ), true )
			$mol_assert_equal( one.row_inherited( 'title' ), false )

			$mol_assert_like( one.own_ports(), [ 'title' ] )
			$mol_assert_ok( one.inherited_ports().includes( 'caption' ) )
			$mol_assert_equal( one.inherited_ports().includes( 'title' ), false )

			$mol_assert_equal( one.Inherited().expanded(), true )

			one.dom_tree()

			$mol_assert_equal( one.Inherited().dom_node().hasAttribute( 'mol_expander' ), true )
			$mol_assert_equal(
				one.Inherited().dom_node().contains( one.Row( 'caption' ).dom_node() ),
				true,
			)
			$mol_assert_equal(
				one.Inherited().dom_node().contains( one.Row( 'title' ).dom_node() ),
				false,
			)
			$mol_assert_equal( one.Rows().dom_node().contains( one.Row( 'title' ).dom_node() ), true )

		},

		'an inherited row offers no tools'( $ ) {

			const one = pair( $, [
				`${ d }bog_vmap_app_inspect_test_card ${ d }mol_view`,
				'	caption \\Карточка',
				`${ d }bog_vmap_app_inspect_test_hero ${ d }bog_vmap_app_inspect_test_card`,
				'	title \\Hi',
				'',
			].join( '\n' ), `${ d }bog_vmap_app_inspect_test_hero` )

			$mol_assert_equal( one.Row( 'caption' ).tools().length, 0 )
			$mol_assert_equal( one.Row( 'title' ).tools().length, 3 )
			$mol_assert_equal( one.Row( 'caption' ).bid(), `${ d }bog_vmap_app_inspect_test_card` )

		},

		'the inherited group opens by default and closing it hides the rows'( $ ) {

			const one = pair( $, [
				`${ d }bog_vmap_app_inspect_test_card ${ d }mol_view`,
				'	caption \\Карточка',
				`${ d }bog_vmap_app_inspect_test_hero ${ d }bog_vmap_app_inspect_test_card`,
				'	title \\Hi',
				'',
			].join( '\n' ), `${ d }bog_vmap_app_inspect_test_hero` )

			$mol_assert_equal( one.inherited_shown(), true )

			one.dom_tree()

			$mol_assert_ok( one.Inherited().dom_node().querySelector( '[mol_form_field]' ) )

			one.inherited_shown( false )
			one.dom_tree()

			$mol_assert_equal( one.Inherited().dom_node().querySelector( '[mol_form_field]' ), null )

		},
	})

	const d = '$'

	function browser_gaps( $: $mol_ambient_context ) {

		const dom = $.$mol_dom_context

		Object.assign( globalThis, {
			ShadowRoot: globalThis.ShadowRoot ?? dom.ShadowRoot,
			PointerEvent: globalThis.PointerEvent ?? dom.PointerEvent,
		} )

	}

	function panel(
		$: $mol_ambient_context,
		source: string,
		peers: readonly $mol_tree2[] = [],
	) {

		browser_gaps( $ )

		let text = source

		return $.$bog_vmap_app_inspect.make({
			$,
			source: ( next?: string )=> next === undefined ? text : ( text = next ),
			peers: ()=> peers,
			pack: ()=> '',
		}) as $$.$bog_vmap_app_inspect

	}

	function pair( $: $mol_ambient_context, source: string, klass: string ) {

		browser_gaps( $ )

		let text = source

		const doc = $.$bog_vmap_lang_doc.make({
			$,
			source: ( next?: string )=> next === undefined ? text : ( text = next ),
		}) as $bog_vmap_lang_doc

		return $.$bog_vmap_app_inspect.make({
			$,
			source: ( next?: string )=> doc.class_source( klass, next ),
			peers: ()=> doc.trees(),
			pack: ()=> '',
		}) as $$.$bog_vmap_app_inspect

	}

}
