namespace $ {

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

namespace $ {

	const d = '$'

	const editor = ( $: $mol_ambient_context, klass = `${d}mol_button_minor` )=> {

		const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

		app.part_drop( klass, 100, 200 )

		const code = app.Code() as $$.$bog_vmap_app_code

		return { app, code, name: app.selected()! }
	}

	const stroke = ( code: $$.$bog_vmap_app_code )=> ({
		code: 'KeyZ',
		metaKey: true,
		ctrlKey: false,
		altKey: false,
		shiftKey: false,
		target: code.Tree().Edit().dom_node(),
		preventDefault() {},
	}) as unknown as KeyboardEvent

	const wired = ( $: $mol_ambient_context )=> {

		const one = editor( $ )
		one.code.tree_text( `${ one.name } ${d}mol_button_minor\n\ttitle <= greeting\n` )

		return one
	}

	$mol_test({

		'the declaration of a node written back leaves the document alone'( $ ) {

			const { app, code } = editor( $ )

			const before = app.doc_source()

			code.tree_text( code.tree_text() )

			$mol_assert_equal( app.doc_source(), before )

		},

		'the whole document written back leaves it alone'( $ ) {

			const { app, code } = editor( $ )

			code.whole( true )

			const before = app.doc_source()

			$mol_assert_equal( code.tree_text(), before )

			code.tree_text( code.tree_text() )

			$mol_assert_equal( app.doc_source(), before )

		},

		'the declaration edited in the panel reaches the document'( $ ) {

			const { app, code, name } = editor( $ )

			code.tree_text( `${ name } ${d}mol_string\n\thint \\typed\n` )

			$mol_assert_equal( app.doc_source().includes( 'hint \\typed' ), true )
			$mol_assert_equal( app.doc_source().includes( `${d}mol_string` ), true )

		},

		'a broken declaration is refused, and the document keeps the last good one'( $ ) {

			const { app, code } = editor( $ )

			const before = app.doc_source()

			code.tree_text( 'Broken \\\n\t\t\tnonsense' )

			$mol_assert_equal( app.doc_source(), before )
			$mol_assert_equal( code.note() !== '', true )

			$mol_assert_equal( code.tree_text(), 'Broken \\\n\t\t\tnonsense' )

		},

		'a good text after a broken one clears the refusal and lands'( $ ) {

			const { app, code, name } = editor( $ )

			code.tree_text( 'Broken \\\n\t\t\tnonsense' )
			code.tree_text( `${ name } ${d}mol_string\n` )

			$mol_assert_equal( code.note(), '' )
			$mol_assert_equal( app.doc_source().includes( `${ name } ${d}mol_string` ), true )

		},

		'a part dropped with the mouse shows up in the text'( $ ) {

			const { app, code } = editor( $ )

			code.whole( true )
			const before = code.tree_text()

			app.part_drop( `${d}mol_string`, 300, 400 )

			$mol_assert_equal( code.tree_text() !== before, true )
			$mol_assert_equal( code.tree_text().includes( `${d}mol_string` ), true )

		},

		'a text edit does not stop the panel following the mouse'( $ ) {

			const { app, code, name } = editor( $ )

			code.tree_text( `${ name } ${d}mol_string\n\thint \\typed\n` )

			app.part_drop( `${d}mol_check`, 500, 600 )

			code.whole( true )

			$mol_assert_equal( code.tree_text().includes( 'hint \\typed' ), true )
			$mol_assert_equal( code.tree_text().includes( `${d}mol_check` ), true )

		},

		'a method written for a node lands in the body of its class'( $ ) {

			const { app, code } = wired( $ )

			code.js_text( `greeting() {\n\treturn 'hi'\n}` )

			$mol_assert_equal( app.root_js().includes( `greeting()` ), true )

		},

		'the slice of a node and the whole body agree'( $ ) {

			const { app, code } = wired( $ )

			app.root_js( `greeting() {\n\treturn 'hi'\n}\n\nother() {\n\t\n}` )

			$mol_assert_equal( code.js_text(), `greeting() {\n\treturn 'hi'\n}` )

			code.whole( true )
			$mol_assert_equal( code.js_text(), app.root_js() )

		},

		'editing one property leaves its neighbour byte for byte'( $ ) {

			const { app, code } = wired( $ )

			app.root_js( `greeting() {\n\t\n}\n\nother() {\n\treturn 1\n}` )

			code.js_text( `greeting() {\n\treturn 2\n}` )

			$mol_assert_equal(
				app.root_js(),
				`greeting() {\n\treturn 2\n}\n\nother() {\n\treturn 1\n}`,
			)

		},

		'a method named after the node is never offered'( $ ) {

			const plain = editor( $ )
			$mol_assert_equal( plain.code.js_text().includes( `${ plain.name }(` ), false )

			const one = wired( $ )
			$mol_assert_equal( one.code.js_text().includes( `${ one.name }(` ), false )

		},

		'a node whose declaration asks for nothing has no JS field at all'( $ ) {

			const { code } = editor( $ )

			$mol_assert_equal( code.js_writable(), false )
			$mol_assert_equal( code.source_tabs()[ 1 ], code.Js_idle() )
			$mol_assert_equal( code.js_idle_note() !== '', true )

		},

		'the method the declaration asks for is offered empty'( $ ) {

			const { code } = wired( $ )

			$mol_assert_equal( code.js_writable(), true )
			$mol_assert_equal( code.source_tabs()[ 1 ], code.Js() )
			$mol_assert_equal( code.js_text(), 'greeting(  ) {\n\t\n}' )

		},

		'a binding added to the declaration brings the method with it'( $ ) {

			const { code, name } = editor( $ )

			$mol_assert_equal( code.js_writable(), false )

			code.tree_text( `${ name } ${d}mol_button_minor\n\ttitle <= greeting\n` )

			$mol_assert_equal( code.js_writable(), true )
			$mol_assert_equal( code.js_text(), 'greeting(  ) {\n\t\n}' )

		},

		'a wire the class declares is not offered as a method'( $ ) {

			const { app, code, name } = editor( $ )

			app.node().part_add( 'Motor', `${d}mol_view` )
			app.node().wire_add({ name: 'spin', node: 'Motor', prop: 'sub' })
			code.tree_text( `${ name } ${d}mol_button_minor\n\ttitle <= spin\n` )

			$mol_assert_equal( code.js_writable(), false )

		},

		'a rule written for a node lands in the styles of its class'( $ ) {

			const { app, code, name } = editor( $ )

			const rule = `[${ app.doc_root().slice( 1 ) }_${ name.toLowerCase() }] {\n\tcolor: red;\n}`

			code.css_text( rule )

			$mol_assert_equal( app.root_css(), rule )
			$mol_assert_equal( code.css_text(), rule )

		},

		'a node with no rule of its own is offered an empty one addressed to it'( $ ) {

			const { app, code, name } = editor( $ )

			$mol_assert_equal(
				code.css_text(),
				`[${ app.doc_root().slice( 1 ) }_${ name.toLowerCase() }] {\n\t\n}`,
			)

		},

		'a body with unbalanced braces is reported, not swallowed'( $ ) {

			const { app, code } = editor( $ )

			app.root_js( 'broken() {\n\treturn 1\n' )

			$mol_assert_equal( code.sliceable(), false )
			$mol_assert_equal( code.note() !== '', true )

			code.whole( true )

			$mol_assert_equal( code.js_text(), 'broken() {\n\treturn 1\n' )

		},

		'what the panel writes reaches the scene'( $ ) {

			const { app, code, name } = wired( $ )

			code.js_text( `greeting() {\n\treturn 1\n}` )
			code.css_text( `[${ app.doc_root().slice( 1 ) }_${ name.toLowerCase() }] {\n\tcolor: red;\n}` )

			$mol_assert_equal( app.doc_js()[ app.doc_root() ]?.includes( `greeting()` ), true )
			$mol_assert_equal( app.doc_css().includes( 'color: red' ), true )

		},

		'an untyped parameter is complained about as it is written'( $ ) {

			const { code } = wired( $ )

			$mol_assert_equal( code.complaints().length, 0 )

			code.js_text( `greeting( next ) {\n\treturn next\n}` )

			$mol_assert_equal( code.complaints().length, 1 )
			$mol_assert_equal( code.complaints()[ 0 ].param, 'next' )
			$mol_assert_equal( code.complaints()[ 0 ].method, 'greeting' )

		},

		'a typed parameter is not complained about'( $ ) {

			const { code } = wired( $ )

			code.js_text( `greeting( next?: string ) {\n\treturn next\n}` )

			$mol_assert_equal( code.complaints().length, 0 )

		},

		'the complaint is visible in both modes'( $ ) {

			const { app, code } = wired( $ )

			app.root_js( `greeting( a ) {\n\t\n}\n\nother( b ) {\n\t\n}` )

			$mol_assert_equal( code.complaints().length, 1 )
			$mol_assert_equal( code.complaints()[ 0 ].param, 'a' )
			$mol_assert_equal( code.complaints()[ 0 ].line, 1 )

			code.whole( true )

			$mol_assert_equal( code.complaints().length, 2 )
			$mol_assert_equal( code.complaints()[ 1 ].param, 'b' )
			$mol_assert_equal( code.complaints()[ 1 ].line, 5 )

		},

		'a refused edit does not follow the panel to another node'( $ ) {

			const { app, code, name } = editor( $ )

			app.part_drop( `${d}mol_string`, 300, 400 )
			const second = app.selected()!

			app.selected( name )
			code.tree_text( 'Broken \\\n\t\t\tnonsense' )
			$mol_assert_equal( code.tree_text(), 'Broken \\\n\t\t\tnonsense' )

			app.selected( second )
			$mol_assert_equal( code.tree_text().includes( 'nonsense' ), false )
			$mol_assert_equal( code.tree_text().includes( second ), true )

			app.selected( name )
			$mol_assert_equal( code.tree_text(), 'Broken \\\n\t\t\tnonsense' )

		},

		'a published node carries its method and its rule'( $ ) {

			const { app, code, name } = wired( $ )

			code.js_text( `greeting() {\n\treturn 1\n}` )
			code.css_text( `[${ app.doc_root().slice( 1 ) }_${ name.toLowerCase() }] {\n\tcolor: red;\n}` )

			const publish = app.Publish() as $$.$bog_vmap_app_publish

			$mol_assert_equal( publish.js(), `greeting() {\n\treturn 1\n}` )
			$mol_assert_equal( publish.css().includes( 'color: red' ), true )

		},

		'a press on the strip left of the field puts the caret in the field'( $ ) {

			const dom = $.$mol_dom_context

			const panel = $bog_vmap_app_code.make({
				$,
				klass: ()=> `${d}bog_vmap_app_code_press_page`,
				prop: ()=> '',
				hooks: ()=> [],
				whole: ()=> true,
				source: ( next?: string )=> next ?? `${d}bog_vmap_app_code_press_page ${d}mol_view\n\tsub /\n`,
				node_source: ( next?: string )=> next ?? '',
				js: ( next?: string )=> next ?? '',
				css: ( next?: string )=> next ?? '',
				error: ()=> '',
			}) as $$.$bog_vmap_app_code

			dom.document.body.appendChild( panel.dom_tree() )

			const field = panel.Tree().Edit().dom_node()

			$mol_assert_equal( dom.document.activeElement === field, false )

			panel.tree_press( new dom.Event( 'pointerdown' ) )

			$mol_assert_equal( dom.document.activeElement === field, true )

		},

		'a declaration typed key by key gives the same tree as a block paste'( $ ) {

			const add = `\tPage ${d}mol_view\n\t\tsub / <= Button_minor\n`

			const block = editor( $ )
			block.code.whole( true )
			block.code.tree_text( block.code.tree_text() + add )

			const typed = editor( $ )
			typed.code.whole( true )
			for( const char of add ) typed.code.tree_text( typed.code.tree_text() + char )

			$mol_assert_equal( typed.app.doc_source(), block.app.doc_source() )

		},

		'a field left by focus shows the canonical text again'( $ ) {

			const dom = $.$mol_dom_context
			const { app, code } = editor( $ )

			code.whole( true )
			dom.document.body.appendChild( code.dom_tree() )

			code.tree_text( code.tree_text() + `\tPage ${d}mol_view\n\t\tsub / <= Button_minor\n` )

			$mol_assert_equal( code.tree_text() === app.doc_source(), false )

			code.field_leave( { relatedTarget: dom.document.body } as unknown as Event )

			$mol_assert_equal( code.tree_text(), app.doc_source() )

		},

		'the whole class wiped out is refused and the document stays'( $ ) {

			const { app, code } = editor( $ )

			code.whole( true )

			const before = app.doc_source()

			code.tree_text( '' )

			$mol_assert_equal( app.doc_source(), before )
			$mol_assert_equal( code.note(), $.$bog_vmap_app_code_blank )

		},

		'a node declaration wiped out is refused as well'( $ ) {

			const { app, code } = editor( $ )

			const before = app.doc_source()

			code.tree_text( ' \n\t\n' )

			$mol_assert_equal( app.doc_source(), before )
			$mol_assert_equal( code.note(), $.$bog_vmap_app_code_blank )

		},

		'undo with the caret in a field rolls the typed text back'( $ ) {

			const dom = $.$mol_dom_context
			const { app, code } = editor( $ )

			app.code_showed( true )
			code.whole( true )
			dom.document.body.appendChild( code.dom_tree() )

			code.tree_text( code.tree_text() + `\tPage ${d}mol_view\n\t\tsub / <= Button_minor\n` )

			$mol_assert_equal( code.field_dirty(), true )

			$mol_assert_equal( app.code_undo( stroke( code ) ), true )

			$mol_assert_equal( code.field_dirty(), false )
			$mol_assert_equal( code.tree_text(), app.doc_source() )

		},

		'undo with the caret in an untouched field walks the ring'( $ ) {

			const dom = $.$mol_dom_context
			const { app, code } = editor( $ )

			app.code_showed( true )
			code.whole( true )
			dom.document.body.appendChild( code.dom_tree() )

			const history = app.History() as $$.$bog_vmap_app_history
			const key = history.doc_key()

			history.step_push( key, history.doc_state() )

			const before = app.doc_source()

			code.tree_text( code.tree_text() + `\tPage ${d}mol_view\n\t\tsub / <= Button_minor\n` )
			code.field_undo()

			history.step_push( key, history.doc_state() )

			$mol_assert_equal( code.field_dirty(), false )
			$mol_assert_equal( app.doc_source() === before, false )

			$mol_assert_equal( app.code_undo( stroke( code ) ), true )

			$mol_assert_equal( app.doc_source(), before )

		},

		'a press on a closed tab opens it'( $ ) {

			const { code } = editor( $ )
			const deck = code.Sources()

			deck.Switch().option_checked( '2', true )

			$mol_assert_equal( deck.current(), '2' )

		},

		'a repeated press on the open tab keeps it open'( $ ) {

			const { code } = editor( $ )
			const deck = code.Sources()

			deck.Switch().option_checked( '2', true )
			deck.Switch().option_checked( '2', false )

			$mol_assert_equal( deck.current(), '2' )

		},

	})

}
