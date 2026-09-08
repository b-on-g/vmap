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

			const { app, code, name } = editor( $ )

			code.js_text( `${ name }_title() {\n\treturn 'hi'\n}` )

			$mol_assert_equal( app.root_js().includes( `${ name }_title()` ), true )

		},

		/** The whole point of 4.2: one property and the whole text say the same thing. */
		'the slice of a node and the whole body agree'( $ ) {

			const { app, code, name } = editor( $ )

			app.root_js( `${ name }( next ) {\n\treturn next\n}\n\nother() {\n\t\n}` )

			$mol_assert_equal( code.js_text(), `${ name }( next ) {\n\treturn next\n}` )

			code.whole( true )
			$mol_assert_equal( code.js_text(), app.root_js() )

		},

		'editing one property leaves its neighbour byte for byte'( $ ) {

			const { app, code, name } = editor( $ )

			app.root_js( `${ name }() {\n\t\n}\n\nother() {\n\treturn 1\n}` )

			code.js_text( `${ name }() {\n\treturn 2\n}` )

			$mol_assert_equal(
				app.root_js(),
				`${ name }() {\n\treturn 2\n}\n\nother() {\n\treturn 1\n}`,
			)

		},

		'a node with no method of its own is offered an empty one'( $ ) {

			const { code, name } = editor( $ )

			$mol_assert_equal( code.js_text(), `${ name }(  ) {\n\t\n}` )

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

			const { app, code, name } = editor( $ )

			code.js_text( `${ name }() {\n\treturn 1\n}` )
			code.css_text( `[${ app.doc_root().slice( 1 ) }_${ name.toLowerCase() }] {\n\tcolor: red;\n}` )

			$mol_assert_equal( app.doc_js()[ app.doc_root() ]?.includes( `${ name }()` ), true )
			$mol_assert_equal( app.doc_css().includes( 'color: red' ), true )

		},

		/**
		 * The divergence of section 10 shown where the mistake is made: the body runs
		 * in the scene through `new Function` and would fail the export on `strict`.
		 */
		'an untyped parameter is complained about as it is written'( $ ) {

			const { code, name } = editor( $ )

			$mol_assert_equal( code.complaints().length, 0 )

			code.js_text( `${ name }( next ) {\n\treturn next\n}` )

			$mol_assert_equal( code.complaints().length, 1 )
			$mol_assert_equal( code.complaints()[ 0 ].param, 'next' )
			$mol_assert_equal( code.complaints()[ 0 ].method, name )

		},

		'a typed parameter is not complained about'( $ ) {

			const { code, name } = editor( $ )

			code.js_text( `${ name }( next?: string ) {\n\treturn next\n}` )

			$mol_assert_equal( code.complaints().length, 0 )

		},

		/** A line about a method the panel does not show is a line nobody can act on. */
		'only the method of the picked node is complained about'( $ ) {

			const { app, code, name } = editor( $ )

			app.root_js( `${ name }( a ) {\n\t\n}\n\nother( b ) {\n\t\n}` )

			$mol_assert_equal( code.complaints().length, 1 )
			$mol_assert_equal( code.complaints()[ 0 ].param, 'a' )

			code.whole( true )
			$mol_assert_equal( code.complaints().length, 2 )

		},

		/** A published component without its behaviour is a picture of a component. */
		'a published node carries its method and its rule'( $ ) {

			const { app, code, name } = editor( $ )

			code.js_text( `${ name }() {\n\treturn 1\n}` )
			code.css_text( `[${ app.doc_root().slice( 1 ) }_${ name.toLowerCase() }] {\n\tcolor: red;\n}` )

			const publish = app.Publish() as $$.$bog_vmap_app_publish

			$mol_assert_equal( publish.js(), `${ name }() {\n\treturn 1\n}` )
			$mol_assert_equal( publish.css().includes( 'color: red' ), true )

		},

	})

}
