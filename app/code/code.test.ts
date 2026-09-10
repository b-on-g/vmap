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

namespace $ {

	/**
	 * Tests of a failure of the scene finding its way onto the node.
	 *
	 * The strip says something is wrong somewhere; the mark says which node. Stage
	 * 4.4 is the second sentence, and this file is about the host half of it: what
	 * the bridge carries in `node` has to come out on that node and nowhere else.
	 *
	 * `d` keeps `$` out of the string literals — mam reads them for dependencies.
	 */
	const d = '$'

	const root = `${d}bog_vmap_app_page`

	/** A pane with a peer that answers, and a way to speak to it as the scene. */
	const pane_make = ( $: $mol_ambient_context )=> {

		const peer = { origin: 'null', postMessage() {} }

		const pane = $$.$bog_vmap_app_pane.make({
			$,
			doc_root: ()=> root,
			// The one node these scenarios are about. The canvas only knows the nodes
			// the document declares, and a mark stands on a node of the document.
			doc_names: ()=> [ 'Calc' ],
			pane_rect: ()=> ({ left: 0, top: 0, width: 1000, height: 800 }),
			scene_peer: ()=> peer,
		})

		pane.handshake( pane.scene_key(), 1 )

		const answer = ( data: object )=> pane.message_receive(
			{ data: { ns: $bog_vmap_bridge_ns, ... data }, source: peer } as unknown as MessageEvent
		)

		return { pane, answer }
	}

	$mol_test({

		'a failure the scene attributes lands on that node'( $ ) {

			const { pane, answer } = pane_make( $ )

			answer({ kind: 'error', at: 'runtime', message: 'boom', node: 'Calc' })

			$mol_assert_equal( pane.node_error( 'Calc' ), 'исполнение — Calc: boom' )
			$mol_assert_equal( pane.node_error( 'Hero' ), '' )

		},

		/** A guess would be worse than nothing: an unattributed failure stays on the strip. */
		'a failure with no node stays off every node'( $ ) {

			const { pane, answer } = pane_make( $ )

			answer({ kind: 'error', at: 'compile', message: 'boom' })

			$mol_assert_equal( Object.keys( pane.errors() ).length, 0 )
			$mol_assert_equal( pane.error().includes( 'boom' ), true )

		},

		'the two channels of one node are both shown on it'( $ ) {

			const { pane, answer } = pane_make( $ )

			answer({ kind: 'error', at: 'compile', message: 'first', node: 'Calc' })
			answer({ kind: 'error', at: 'runtime', message: 'second', node: 'Calc' })

			$mol_assert_equal(
				pane.node_error( 'Calc' ),
				'компиляция — Calc: first\nисполнение — Calc: second',
			)

		},

		/** The channel clears with `null`, and the node has to clear with it. */
		'a cleared channel takes the mark off the node'( $ ) {

			const { pane, answer } = pane_make( $ )

			answer({ kind: 'error', at: 'runtime', message: 'boom', node: 'Calc' })
			answer({ kind: 'error', at: 'runtime', message: null, node: 'Calc' })

			$mol_assert_equal( pane.node_error( 'Calc' ), '' )

		},

		'a fresh scene starts with no failure on any node'( $ ) {

			const { pane, answer } = pane_make( $ )

			answer({ kind: 'error', at: 'compile', message: 'boom', node: 'Calc' })
			answer({ kind: 'ready' })

			$mol_assert_equal( pane.node_error( 'Calc' ), '' )

		},

		/** A node nobody has measured has no corner to put a mark at. */
		'a mark is drawn only where the node has been measured'( $ ) {

			const { pane, answer } = pane_make( $ )

			answer({ kind: 'error', at: 'runtime', message: 'boom', node: 'Calc' })

			$mol_assert_equal( pane.error_marks().length, 0 )

			answer({
				kind: 'sizes',
				sizes: { [ `${ root }/Calc` ]: { x: 10, y: 20, width: 100, height: 50 } },
			})

			$mol_assert_equal( pane.error_marks().length, 1 )
			$mol_assert_equal( pane.mark_hint( 'Calc' ), 'исполнение — Calc: boom' )

		},

		/**
		 * The case the marks exist for: code is written, it breaks, and the node
		 * stops being drawn. Nothing is measured any more, so the mark has to stand
		 * on the last box the node was seen at — otherwise it disappears exactly
		 * when it is needed.
		 */
		'a node that stops being drawn keeps its mark where it was'( $ ) {

			const { pane, answer } = pane_make( $ )

			answer({
				kind: 'sizes',
				sizes: { [ `${ root }/Calc` ]: { x: 10, y: 20, width: 100, height: 50 } },
			})

			// It broke: the scene draws it no more, so it measures it no more, and
			// the report simply stops mentioning it.
			answer({ kind: 'sizes', sizes: {} })
			answer({ kind: 'error', at: 'runtime', message: 'boom', node: 'Calc' })

			$mol_assert_equal( pane.error_marks().length, 1 )
			$mol_assert_equal( pane.mark_style( 'Calc' ).left, '10px' )
			$mol_assert_equal( pane.mark_style( 'Calc' ).top, '20px' )

		},

		/**
		 * A node that never drew has no corner to point at, and pointing at a made
		 * up one would be the false mark. The text is not conditional on geometry,
		 * so the panel of that node says it anyway.
		 */
		'a node never drawn gets no mark, and is still told about'( $ ) {

			const { pane, answer } = pane_make( $ )

			answer({ kind: 'error', at: 'compile', message: 'boom', node: 'Calc' })

			$mol_assert_equal( pane.error_marks().length, 0 )
			$mol_assert_equal( pane.node_error( 'Calc' ), 'компиляция — Calc: boom' )

		},

		/** What the panel of the picked node shows is what the pane knows about it. */
		'the code panel shows the failure of the node it is editing'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )

			const name = app.selected()!
			const pane = app.pane()

			pane.error_at( 'runtime', 'исполнение: boom' )
			pane.error_node( 'runtime', name )

			$mol_assert_equal( app.code_error(), 'исполнение: boom' )

			app.selected( null )
			$mol_assert_equal( app.code_error(), '' )

		},

	})

}

namespace $ {

	/**
	 * Tests of the code editor against the live document.
	 *
	 * The round trip is the whole point of stage 4.1: what the panel shows, written
	 * back unchanged, has to leave the document byte for byte as it was, and what
	 * the mouse does on the canvas has to show up in the text without anybody
	 * pushing it there.
	 *
	 * `d` keeps `$` out of the string literals — mam reads them for dependencies.
	 */
	const d = '$'

	/** An editor with one part on the canvas, picked, and its code panel. */
	const editor = ( $: $mol_ambient_context, klass = `${d}mol_button_minor` )=> {

		const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

		app.part_drop( klass, 100, 200 )

		const code = app.Code() as $$.$bog_vmap_app_code

		return { app, code, name: app.selected()! }
	}

	/**
	 * The same, with the node bound to a name the class does not declare.
	 *
	 * That binding is the only thing that gives a node a method of its own to
	 * write: `title <= greeting` asks for `greeting()`, and nothing generates it.
	 */
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

		/**
		 * The one failure that would look like success: a broken text swallowed, the
		 * document left holding something the user never wrote.
		 */
		'a broken declaration is refused, and the document keeps the last good one'( $ ) {

			const { app, code } = editor( $ )

			const before = app.doc_source()

			code.tree_text( 'Broken \\\n\t\t\tnonsense' )

			$mol_assert_equal( app.doc_source(), before )
			$mol_assert_equal( code.note() !== '', true )

			// And what was typed is still in the field, where it can be fixed.
			$mol_assert_equal( code.tree_text(), 'Broken \\\n\t\t\tnonsense' )

		},

		'a good text after a broken one clears the refusal and lands'( $ ) {

			const { app, code, name } = editor( $ )

			code.tree_text( 'Broken \\\n\t\t\tnonsense' )
			code.tree_text( `${ name } ${d}mol_string\n` )

			$mol_assert_equal( code.note(), '' )
			$mol_assert_equal( app.doc_source().includes( `${ name } ${d}mol_string` ), true )

		},

		/**
		 * The other half of 4.1: the canvas and the panel are one text, so a drop
		 * shows up in the panel with no path of its own.
		 */
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

		/** The whole point of 4.2: one property and the whole text say the same thing. */
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

		/**
		 * THE TRAP THIS WHOLE SHAPE EXISTS TO AVOID. The name of a node is the name
		 * of the factory of its sub-view in the generated class, so a handwritten
		 * method of that name shadows the factory and the node leaves the canvas.
		 * The panel must never put that name in front of a person as a suggestion.
		 */
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

		/** The declaration is what decides, so a binding added later opens the field. */
		'a binding added to the declaration brings the method with it'( $ ) {

			const { code, name } = editor( $ )

			$mol_assert_equal( code.js_writable(), false )

			code.tree_text( `${ name } ${d}mol_button_minor\n\ttitle <= greeting\n` )

			$mol_assert_equal( code.js_writable(), true )
			$mol_assert_equal( code.js_text(), 'greeting(  ) {\n\t\n}' )

		},

		/** A method the class already generates is not something to write by hand. */
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

		/**
		 * A body that cannot be cut is a state of the panel, not a lost document:
		 * the text stays whole, the panel says so, and the switch is the way out.
		 */
		'a body with unbalanced braces is reported, not swallowed'( $ ) {

			const { app, code } = editor( $ )

			app.root_js( 'broken() {\n\treturn 1\n' )

			$mol_assert_equal( code.sliceable(), false )
			$mol_assert_equal( code.note() !== '', true )

			code.whole( true )

			$mol_assert_equal( code.js_text(), 'broken() {\n\treturn 1\n' )

		},

		/** The scene compiles what the panel writes, so the two texts have to travel. */
		'what the panel writes reaches the scene'( $ ) {

			const { app, code, name } = wired( $ )

			code.js_text( `greeting() {\n\treturn 1\n}` )
			code.css_text( `[${ app.doc_root().slice( 1 ) }_${ name.toLowerCase() }] {\n\tcolor: red;\n}` )

			$mol_assert_equal( app.doc_js()[ app.doc_root() ]?.includes( `greeting()` ), true )
			$mol_assert_equal( app.doc_css().includes( 'color: red' ), true )

		},

		/**
		 * The divergence of section 10 shown where the mistake is made: the body runs
		 * in the scene through `new Function` and would fail the export on `strict`.
		 */
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

		/**
		 * The complaint used to be filtered by the name of the node, which hid every
		 * one a person could make: the method they must never write is the one named
		 * after the node. It is checked on the text on screen now, so it shows in
		 * both modes and its line number counts in the text the reader is looking at.
		 */
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

		/**
		 * A draft belongs to the text, not to the tab. Keyed by the tab alone, a
		 * refused edit made on one node showed up under the name of the next node
		 * picked — and correcting it there wrote it into that other node.
		 */
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

			// And it is still there when the node it was typed on comes back.
			app.selected( name )
			$mol_assert_equal( code.tree_text(), 'Broken \\\n\t\t\tnonsense' )

		},

		/** A published component without its behaviour is a picture of a component. */
		'a published node carries its method and its rule'( $ ) {

			const { app, code, name } = wired( $ )

			code.js_text( `greeting() {\n\treturn 1\n}` )
			code.css_text( `[${ app.doc_root().slice( 1 ) }_${ name.toLowerCase() }] {\n\tcolor: red;\n}` )

			const publish = app.Publish() as $$.$bog_vmap_app_publish

			$mol_assert_equal( publish.js(), `greeting() {\n\treturn 1\n}` )
			$mol_assert_equal( publish.css().includes( 'color: red' ), true )

		},

	})

}
