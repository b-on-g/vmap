namespace $ {

	/**
	 * Tests of `$bog_vmap_lang`: round trip, property editing and the wire emitter.
	 *
	 * Nothing here touches the network or the DOM. The wire tests run the emitted
	 * tree through the real `$mol_view_tree2_to_text`, because the five traps of
	 * section 1 all produce a green build and only differ in the generated JS.
	 * Reading the wire by eye proves nothing, which is the whole reason they cost
	 * so much time to find.
	 *
	 * `d` keeps `$` out of the string literals: mam builds its dependency graph by
	 * a regexp over sources, literals included, so a bare `$mol_button` in a
	 * fixture would drag a whole module into the bundle.
	 */
	const d = '$'

	/**
	 * The document of section 1: a free part, a wire from it, and a label buried
	 * two levels deep inside `sub` that reads the wire.
	 *
	 * Already normalized, which is what makes it a byte for byte round trip. See
	 * the lossiness test at the bottom for the form it is normalized FROM.
	 */
	const demo_src = [
		`${d}bog_vmap_lang_test_demo ${d}mol_view`,
		`	Price ${d}mol_view title <= calc_result`,
		`	Hero ${d}mol_view sub / <= Price`,
		`	Calc ${d}bog_vmap_lang_test_calc`,
		`	calc_result = Calc result`,
		`	label \\Total`,
		`	sub / <= Hero`,
		``,
	].join( '\n' )

	/** The same document as a person would write it, with nesting. */
	const nested_src = [
		`${d}bog_vmap_lang_test_demo ${d}mol_view`,
		`	Calc ${d}bog_vmap_lang_test_calc`,
		`	calc_result = Calc result`,
		`	label \\Total`,
		`	sub /`,
		`		<= Hero ${d}mol_view`,
		`			sub /`,
		`				<= Price ${d}mol_view`,
		`					title <= calc_result`,
		``,
	].join( '\n' )

	/** Two parts on the canvas and no wire between them yet. Normalized. */
	const pair_src = [
		`${d}bog_vmap_lang_test_pair ${d}mol_view`,
		`	Calc ${d}bog_vmap_lang_test_calc`,
		`	Price ${d}mol_view`,
		`	sub /`,
		`		<= Calc`,
		`		<= Price`,
		``,
	].join( '\n' )

	/**
	 * A document with an artboard: `Board` carries a `sub` of its own, so its
	 * children are laid out by tree, while `Loose` lies free on the canvas.
	 *
	 * Nothing marks the artboard as one. Section 8 says both are properties of the
	 * same root class, and the only difference in the text is the `sub`.
	 */
	const board_src = [
		`${d}bog_vmap_lang_test_board ${d}mol_view`,
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

	/** Indices of the lines two texts differ at, trailing tail included. */
	function lines_diff( left: string, right: string ) {

		const a = left.split( '\n' )
		const b = right.split( '\n' )

		const diff = [] as number[]

		for( let i = 0; i < Math.max( a.length, b.length ); ++i ) {
			if( a[ i ] !== b[ i ] ) diff.push( i )
		}

		return diff
	}

	function doc( src: string ) {
		const node = $bog_vmap_lang_node.make({})
		node.source( src )
		return node
	}

	/**
	 * A document of two classes, already normalized, so that a neighbour surviving
	 * a write can be asserted byte for byte rather than «close enough».
	 *
	 * Two properties each, and not one, on purpose. `$mol_tree2` writes a chain of
	 * single children inline, so a class of one property comes back as one line
	 * carrying the class, the base, the property and its value. Same tree, parses
	 * back identically, but a fixture standing on it would be testing the
	 * serializer's shorthand instead of the document.
	 */
	function pair_doc() {
		const one = $bog_vmap_lang_doc.make({})
		one.source( [
			`${d}bog_vmap_lang_test_one ${d}mol_view`,
			`	label \\Первая`,
			`	count 1`,
			`${d}bog_vmap_lang_test_two ${d}mol_view`,
			`	caption \\Вторая`,
			`	count 2`,
			``,
		].join( '\n' ) )
		return one
	}

	/** The JS the compiler makes of a node, as a plain string. */
	function js_of( $: $, node: $bog_vmap_lang_node ) {
		const tree = node.tree()
		return $.$mol_tree2_text_to_string( $.$mol_view_tree2_to_text( tree.list([ tree ]) ) )
	}

	$mol_test({

		/**
		 * The main test of the module. Source is the truth, the tree is derived, an
		 * edit lands back as text, and nothing else in the file moves.
		 */
		'round trip: editing one property moves exactly one line'( $ ) {

			const node = doc( demo_src )

			const label = node.prop_tree( 'label' )!
			node.prop_tree( 'label', label.clone([ label.data( 'Sum' ) ]) )

			$mol_assert_like( lines_diff( demo_src, node.source() ), [ 5 ] )
			$mol_assert_equal( node.source().split( '\n' )[ 5 ], '\tlabel \\Sum' )

		},

		'round trip: redrawing a wire moves exactly one line'( $ ) {

			const node = doc( demo_src )

			node.wire_add({ name: 'calc_result', node: 'Calc', prop: 'total' })

			$mol_assert_like( lines_diff( demo_src, node.source() ), [ 4 ] )
			$mol_assert_equal( node.source().split( '\n' )[ 4 ], '\tcalc_result = Calc total' )

		},

		'class name change'( $ ) {

			const node = doc( `${d}name ${d}mol_view\n` )
			$mol_assert_equal( node.name(), `${d}name` )

			node.name( `${d}changed` )
			$mol_assert_equal( node.source(), `${d}changed ${d}mol_view\n` )

		},

		'base class name change'( $ ) {

			const node = doc( `${d}name ${d}mol_view\n` )
			$mol_assert_equal( node.base(), `${d}mol_view` )

			node.base( `${d}mol_object` )
			$mol_assert_equal( node.source(), `${d}name ${d}mol_object\n` )

		},

		'property add'( $ ) {

			const node = doc( `${d}bog_vmap_lang_test_num ${d}mol_view\n\tvalue? NaN\n` )
			node.prop_add( 'items' )

			$mol_assert_equal(
				node.source(),
				`${d}bog_vmap_lang_test_num ${d}mol_view\n\tvalue? NaN\n\titems null\n`,
			)

		},

		/** A lone property folds back onto the class line, which is normal tree format. */
		'property drop'( $ ) {

			const node = doc( `${d}bog_vmap_lang_test_num ${d}mol_view\n\tvalue? NaN\n\titems null\n` )
			node.prop_drop( 'items' )

			$mol_assert_equal( node.source(), `${d}bog_vmap_lang_test_num ${d}mol_view value? NaN\n` )

		},

		'property name list'( $ ) {

			const node = doc( demo_src )

			$mol_assert_like(
				node.prop_names(),
				[ 'Price', 'Hero', 'Calc', 'calc_result', 'label', 'sub' ],
			)

		},

		'signature by bare name'( $ ) {

			const node = doc( `${d}bog_vmap_lang_test_sign ${d}mol_view\n\ta null\n\tb? null\n\tc* null\n\td*? null\n` )

			$mol_assert_equal( node.prop_fullname( 'a' ), 'a' )
			$mol_assert_equal( node.prop_fullname( 'b' ), 'b?' )
			$mol_assert_equal( node.prop_fullname( 'c' ), 'c*' )
			$mol_assert_equal( node.prop_fullname( 'd' ), 'd*?' )

		},

		'free part is declared at class level, without an operator'( $ ) {

			const node = doc( demo_src )
			node.part_add( 'Sum', `${d}bog_vmap_lang_test_calc` )

			$mol_assert_equal(
				node.source(),
				demo_src + `\tSum ${d}bog_vmap_lang_test_calc\n`,
			)

			const part = node.prop_tree( 'Sum' )!
			$mol_assert_equal( part.kids.length, 1 )
			$mol_assert_equal( part.kids[ 0 ].type, `${d}bog_vmap_lang_test_calc` )

		},

		'reference inside sub carries no value'( $ ) {

			const node = doc( demo_src )
			node.sub_add( 'Price' )

			$mol_assert_equal(
				node.source(),
				demo_src.replace( '\tsub / <= Hero\n', '\tsub /\n\t\t<= Hero\n\t\t<= Price\n' ),
			)

			const refs = node.prop_tree( 'sub' )!.kids[ 0 ].kids
			$mol_assert_like( refs.map( ref => ref.type ), [ '<=', '<=' ] )
			$mol_assert_like( refs.map( ref => ref.kids[ 0 ].kids.length ), [ 0, 0 ] )

		},

		/**
		 * Taking a node off the page and undeclaring it are two facts, so the empty
		 * `sub /` has to survive the first one — it is the shape an empty document
		 * starts from, and a class left with no `sub` at all would be a third state
		 * nobody asked for.
		 */
		'dropping the last reference keeps an empty sub'( $ ) {

			const node = doc( demo_src )

			node.sub_drop( 'Hero' )

			$mol_assert_equal(
				node.source(),
				demo_src.replace( '\tsub / <= Hero\n', '\tsub /\n' ),
			)

			$mol_assert_equal( node.prop_tree( 'sub' )!.kids[ 0 ].kids.length, 0 )

			// The declaration is untouched: a part out of `sub` still exists and
			// still has its ports, it just draws nothing.
			$mol_assert_equal( node.prop_names().includes( 'Hero' ), true )

		},

		'dropping one reference leaves the others in order'( $ ) {

			const node = doc( demo_src )

			node.sub_add( 'Price' )
			node.sub_add( 'Calc' )
			node.sub_drop( 'Price' )

			const refs = node.prop_tree( 'sub' )!.kids[ 0 ].kids
			$mol_assert_like( refs.map( ref => ref.kids[ 0 ].type ), [ 'Hero', 'Calc' ] )

		},

		'dropping a reference that is not there changes nothing'( $ ) {

			const node = doc( demo_src )

			node.sub_drop( 'Nope' )

			$mol_assert_equal( node.source(), demo_src )

		},

		/**
		 * The acceptance of the wire, run through the compiler rather than read.
		 * `this.Calc().result()` is the whole point: the middle link is what the
		 * `<=` form loses without a word.
		 */
		'wire compiles to a two link call'( $ ) {

			const js = js_of( $, doc( demo_src ) )

			$mol_assert_equal( js.includes( 'this.Calc().result()' ), true )
			$mol_assert_equal( js.includes( 'this.calc_result()' ), true )

		},

		'two way wire passes next through both ends'( $ ) {

			const node = doc( `${d}bog_vmap_lang_test_bidi ${d}mol_view\n\tField ${d}mol_view\n\tsub / <= Field\n` )
			node.wire_add({ name: 'deep', node: 'Field', prop: 'value', bidi: true })

			$mol_assert_equal(
				node.source(),
				`${d}bog_vmap_lang_test_bidi ${d}mol_view\n\tField ${d}mol_view\n\tsub / <= Field\n\tdeep? = Field value?\n`,
			)

			const js = js_of( $, node )

			$mol_assert_equal( js.includes( 'deep(next){' ), true )
			$mol_assert_equal( js.includes( 'this.Field().value(next)' ), true )

		},

		'wire serializes to two tokens'( $ ) {

			const one = $.$bog_vmap_lang_wire_tree({ name: 'calc_result', node: 'Calc', prop: 'result' })
			$mol_assert_equal( one.toString(), 'calc_result = Calc result\n' )

			const two = $.$bog_vmap_lang_wire_tree({ name: 'deep', node: 'Field', prop: 'value', bidi: true })
			$mol_assert_equal( two.toString(), 'deep? = Field value?\n' )

		},

		/**
		 * Trap one and two of section 1. Both are the middle form of `<=`: a
		 * reference that carries a child. With the node declared the build dies
		 * talking about default values, without it the build is green and the bundle
		 * gets `Calc(){ return result }`.
		 *
		 * A reference takes a token, not a path, so neither is expressible.
		 */
		'trap: a reference with a child is not a wire'( $ ) {

			$mol_assert_fail( ()=> $.$bog_vmap_lang_ref_tree( 'Calc result' ), Error )

			const ref = $.$bog_vmap_lang_ref_tree( 'calc_result' )
			$mol_assert_equal( ref.toString(), '<= calc_result\n' )
			$mol_assert_equal( ref.kids[ 0 ].kids.length, 0 )

		},

		'trap: a wire is never emitted with the `<=` operator'( $ ) {

			const wire = $.$bog_vmap_lang_wire_tree({ name: 'w', node: 'Calc', prop: 'result' })
			$mol_assert_equal( wire.kids[ 0 ].type, '=' )

		},

		/**
		 * Trap two again, from the other side: `=` declares nothing, so a wire to a
		 * node nobody declared compiles green and throws `is not a function` at run
		 * time, at that node only, whenever somebody gets there.
		 */
		'trap: a wire to an undeclared node is refused'( $ ) {

			const node = doc( demo_src )

			$mol_assert_fail( ()=> node.wire_add({ name: 'w', node: 'Nope', prop: 'result' }), Error )
			$mol_assert_equal( node.source(), demo_src )

		},

		/** Trap three: `w = Field value?` throws `ReferenceError: next` on any read. */
		'trap: `?` on the right end only'( $ ) {

			$mol_assert_fail(
				()=> $.$bog_vmap_lang_wire_tree({ name: 'w', node: 'Field', prop: 'value?' }),
				Error,
			)

		},

		/** Trap four: `w? = Field hint` never fails, writes just disappear. */
		'trap: `?` on the left end only'( $ ) {

			$mol_assert_fail(
				()=> $.$bog_vmap_lang_wire_tree({ name: 'w?', node: 'Field', prop: 'hint' }),
				Error,
			)

		},

		/**
		 * Trap five: `w = A B value` compiles to `this.A().B().value()`, but `upper`
		 * hoisted `B` onto the root, so it is not a method of `A`.
		 */
		'trap: more than two tokens'( $ ) {

			$mol_assert_fail(
				()=> $.$bog_vmap_lang_wire_tree({ name: 'w', node: 'A', prop: 'B value' }),
				Error,
			)

			$mol_assert_fail(
				()=> $.$bog_vmap_lang_wire_tree({ name: 'w', node: 'A B', prop: 'value' }),
				Error,
			)

		},

		'trap: a key sign smuggled through a token'( $ ) {

			$mol_assert_fail(
				()=> $.$bog_vmap_lang_wire_tree({ name: 'w', node: 'Field', prop: 'value*' }),
				Error,
			)

		},

		'property signature is edited through the model'( $ ) {

			const node = doc( `${d}bog_vmap_lang_test_prop ${d}mol_view value null\n` )
			const prop = node.property( 'value' )

			$mol_assert_equal( prop.title(), 'value' )
			$mol_assert_equal( prop.key(), false )
			$mol_assert_equal( prop.next(), false )

			prop.next( true )

			$mol_assert_equal( node.source(), `${d}bog_vmap_lang_test_prop ${d}mol_view value? null\n` )
			$mol_assert_equal( node.property( 'value' ).next(), true )

			node.property( 'value' ).key( true )

			$mol_assert_equal( node.source(), `${d}bog_vmap_lang_test_prop ${d}mol_view value*? null\n` )

		},

		/**
		 * `$mol_view_tree2_normalize` runs the `upper` hack, so a nested declaration
		 * comes out as a flat property of the root plus a bare reference in place.
		 * That is why the round trip above is byte for byte only on an already
		 * normalized source, and why the editor keeps documents in that form.
		 *
		 * Pinned here so nobody rediscovers it in stage 4.1 through a mangled file.
		 */
		'normalize hoists nested declarations onto the root'( $ ) {

			$mol_assert_equal( doc( nested_src ).tree().toString(), demo_src )
			$mol_assert_equal( doc( demo_src ).tree().toString(), demo_src )

		},

		'an empty source says so instead of throwing on undefined'( $ ) {

			$mol_assert_fail( ()=> doc( '' ).tree(), Error )

		},

		/**
		 * A base has to be declared before its heir, because `extends` is evaluated
		 * when the class is defined while the generator emits declarations in the
		 * order it received them. Written heir first here on purpose.
		 *
		 * A sub-view reference is NOT a constraint: that one compiles to a call
		 * resolved at call time, so `mid` may keep its place relative to `leaf`.
		 */
		'declarations are sorted base first'( $ ) {

			const of = ( src: string )=> doc( src ).tree()

			const leaf = of( `${d}bog_vmap_lang_test_leaf ${d}mol_view\n\ttitle \\L\n` )
			const top = of( `${d}bog_vmap_lang_test_top ${d}bog_vmap_lang_test_mid\n\ttitle \\T\n` )
			const mid = of( `${d}bog_vmap_lang_test_mid ${d}bog_vmap_lang_test_leaf\n\ttitle \\M\n` )

			$mol_assert_like(
				$.$bog_vmap_lang_sorted([ top, mid, leaf ]).map( def => def.type ),
				[
					`${d}bog_vmap_lang_test_leaf`,
					`${d}bog_vmap_lang_test_mid`,
					`${d}bog_vmap_lang_test_top`,
				],
			)

		},

		'a base the document does not declare is left alone'( $ ) {

			const one = doc( demo_src ).tree()

			$mol_assert_like( $.$bog_vmap_lang_sorted([ one ]).map( def => def.type ), [ one.type ] )

		},

		'a cycle of bases fails instead of hanging'( $ ) {

			const a = doc( `${d}bog_vmap_lang_test_a ${d}bog_vmap_lang_test_b\n\tx \\1\n` ).tree()
			const b = doc( `${d}bog_vmap_lang_test_b ${d}bog_vmap_lang_test_a\n\ty \\2\n` ).tree()

			$mol_assert_fail( ()=> $.$bog_vmap_lang_sorted([ a, b ]), Error )

		},

		/**
		 * The whole reason `$bog_vmap_lang_doc` exists. Before it, this edit left
		 * the source holding one class: the node model writes the class it touched
		 * as the entire text, so every neighbour was dropped without an error.
		 */
		'editing one class leaves its neighbours byte for byte'( $ ) {

			const d1 = pair_doc()
			const before = d1.class_source( `${d}bog_vmap_lang_test_two` )

			d1.node( `${d}bog_vmap_lang_test_one` ).prop_tree(
				'label',
				$mol_tree2.struct( 'label', [ $mol_tree2.data( 'Изменено' ) ] ),
			)

			$mol_assert_equal( d1.class_source( `${d}bog_vmap_lang_test_two` ), before )
			$mol_assert_like( d1.names(), [
				`${d}bog_vmap_lang_test_one`,
				`${d}bog_vmap_lang_test_two`,
			] )

		},

		'the edit itself lands in the class it was made on'( $ ) {

			const d1 = pair_doc()

			d1.node( `${d}bog_vmap_lang_test_one` ).prop_tree(
				'label',
				$mol_tree2.struct( 'label', [ $mol_tree2.data( 'Изменено' ) ] ),
			)

			$mol_assert_equal(
				d1.node( `${d}bog_vmap_lang_test_one` ).prop_tree( 'label' )!.toString().trim(),
				'label \\Изменено',
			)

		},

		/**
		 * The document keeps following its text after a write has been made through
		 * it. A cell that both read and wrote `source` would freeze here, and the
		 * document would go on showing the classes it had before — which is why
		 * `class_source` is a plain method.
		 */
		'a write through a class does not deafen the document to its own text'( $ ) {

			const d1 = pair_doc()

			d1.node( `${d}bog_vmap_lang_test_one` ).prop_tree(
				'label',
				$mol_tree2.struct( 'label', [ $mol_tree2.data( 'Изменено' ) ] ),
			)

			d1.source( `${d}bog_vmap_lang_test_three ${d}mol_view\n\tx \\1\n` )

			$mol_assert_like( d1.names(), [ `${d}bog_vmap_lang_test_three` ] )

		},

		'a node under a name the document lacks appends a class'( $ ) {

			const d1 = pair_doc()

			d1.node( `${d}bog_vmap_lang_test_new` ).source(
				`${d}bog_vmap_lang_test_new ${d}mol_view\n\tz \\9\n`
			)

			$mol_assert_like( d1.names(), [
				`${d}bog_vmap_lang_test_one`,
				`${d}bog_vmap_lang_test_two`,
				`${d}bog_vmap_lang_test_new`,
			] )

		},

		'a class of the document reads back as its own source'( $ ) {

			const d1 = pair_doc()

			$mol_assert_equal(
				d1.class_source( `${d}bog_vmap_lang_test_two` ),
				`${d}bog_vmap_lang_test_two ${d}mol_view\n\tcaption \\Вторая\n\tcount 2\n`,
			)

		},

		/**
		 * What the whole text looks like after a write, pinned rather than assumed:
		 * the classes follow one another with no blank line between them. That is
		 * the canonical form, and the code editor of stage 4.1 will show it, so it
		 * had better be written down somewhere that fails when it changes.
		 */
		'the document glues its classes back with no separator'( $ ) {

			const d1 = pair_doc()

			d1.node( `${d}bog_vmap_lang_test_one` ).prop_tree(
				'count',
				$mol_tree2.struct( 'count', [ $mol_tree2.struct( '7' ) ] ),
			)

			$mol_assert_equal( d1.source(), [
				`${d}bog_vmap_lang_test_one ${d}mol_view`,
				`	label \\Первая`,
				`	count 7`,
				`${d}bog_vmap_lang_test_two ${d}mol_view`,
				`	caption \\Вторая`,
				`	count 2`,
				``,
			].join( '\n' ) )

		},

		/**
		 * The canvas gesture in model terms. Two parts, no wire; after a link there
		 * are exactly two new lines: the wire on the root and the reference in the
		 * target declaration.
		 */
		'a link writes exactly two lines, in canonical form'( $ ) {

			const node = doc( pair_src )
			const name = node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title' })

			$mol_assert_equal( name, 'calc_result' )
			$mol_assert_equal( node.source(), [
				`${d}bog_vmap_lang_test_pair ${d}mol_view`,
				`	Calc ${d}bog_vmap_lang_test_calc`,
				`	Price ${d}mol_view title <= calc_result`,
				`	sub /`,
				`		<= Calc`,
				`		<= Price`,
				`	calc_result = Calc result`,
				``,
			].join( '\n' ) )

			$mol_assert_like( node.links(), [
				{ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title', name: 'calc_result', bidi: false },
			] )

		},

		'a repeated link does not duplicate anything'( $ ) {

			const node = doc( pair_src )

			node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title' })
			const once = node.source()

			node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title' })

			$mol_assert_equal( node.source(), once )
			$mol_assert_equal( node.links().length, 1 )

		},

		'one wire feeds two ports and survives the drop of one of them'( $ ) {

			const node = doc( pair_src )

			node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title' })
			node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'hint' })

			$mol_assert_equal( node.wires().length, 1 )
			$mol_assert_equal( node.links().length, 2 )

			node.link_drop( 'Price', 'hint' )

			$mol_assert_equal( node.wires().length, 1 )
			$mol_assert_equal( node.links().length, 1 )

		},

		'unplugging removes both lines'( $ ) {

			const node = doc( pair_src )

			node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title' })
			node.link_drop( 'Price', 'title' )

			$mol_assert_equal( node.source(), pair_src )
			$mol_assert_equal( node.links().length, 0 )
			$mol_assert_equal( node.wires().length, 0 )

		},

		'unplugging a port that is not wired changes nothing'( $ ) {

			const node = doc( pair_src )
			node.link_drop( 'Price', 'title' )
			$mol_assert_equal( node.source(), pair_src )

		},

		'a two way link puts the sign on both ends of both lines'( $ ) {

			const node = doc( pair_src )
			node.link_add({ from: 'Calc', from_prop: 'value', to: 'Price', to_prop: 'title', bidi: true })

			const lines = node.source().split( '\n' )
			$mol_assert_equal( lines.includes( '\tcalc_value? = Calc value?' ), true )
			$mol_assert_equal( lines.includes( '\tPrice $mol_view title? <=> calc_value?'.replace( '$', d ) ), true )

			$mol_assert_equal( node.links()[ 0 ].bidi, true )

			const js = js_of( $, node )
			$mol_assert_equal( js.includes( 'this.Calc().value(next)' ), true )

		},

		'a link takes a free name when the obvious one is taken'( $ ) {

			const node = doc( pair_src )
			node.prop_add( 'calc_result' )

			const name = node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title' })

			$mol_assert_equal( name, 'calc_result_2' )
			$mol_assert_equal( node.prop_tree( 'calc_result' )!.kids[ 0 ].type, 'null' )

		},

		'a link to an undeclared part is refused and writes nothing'( $ ) {

			const node = doc( pair_src )

			$mol_assert_fail( ()=> node.link_add({ from: 'Calc', from_prop: 'result', to: 'Nope', to_prop: 'title' }), Error )
			$mol_assert_fail( ()=> node.link_add({ from: 'Nope', from_prop: 'result', to: 'Price', to_prop: 'title' }), Error )
			$mol_assert_fail( ()=> node.link_add({ from: 'Calc', from_prop: 'result', to: 'Calc', to_prop: 'title' }), Error )

			$mol_assert_equal( node.source(), pair_src )

		},

		'a loop of wires is refused with the reason'( $ ) {

			const node = doc( pair_src )

			node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title' })
			const before = node.source()

			let message = ''
			try {
				node.link_add({ from: 'Price', from_prop: 'title', to: 'Calc', to_prop: 'hint' })
			} catch( error ) {
				message = ( error as Error ).message
			}

			$mol_assert_equal( /loop/.test( message ), true )
			$mol_assert_equal( node.source(), before )

		},

		/**
		 * The five traps, from the side of the link rather than of the wire: whatever
		 * the ends are, the reference in the target carries a bare name and the wire
		 * is two tokens under `=`.
		 */
		'trap: a link never emits a reference with a child or a sign on one end'( $ ) {

			const node = doc( pair_src )

			$mol_assert_fail( ()=> node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title?' }), Error )
			$mol_assert_fail( ()=> node.link_add({ from: 'Calc', from_prop: 'result?', to: 'Price', to_prop: 'title' }), Error )
			$mol_assert_fail( ()=> node.link_add({ from: 'Calc', from_prop: 'Inner result', to: 'Price', to_prop: 'title' }), Error )
			$mol_assert_fail( ()=> node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'a b' }), Error )
			$mol_assert_equal( node.source(), pair_src )

			node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title' })

			const over = node.prop_tree( 'Price' )!.kids[ 0 ].kids[ 0 ]
			$mol_assert_equal( over.type, 'title' )
			$mol_assert_equal( over.kids[ 0 ].type, '<=' )
			$mol_assert_equal( over.kids[ 0 ].kids[ 0 ].kids.length, 0 )

			const wire = node.prop_tree( 'calc_result' )!
			$mol_assert_equal( wire.kids[ 0 ].type, '=' )
			$mol_assert_equal( wire.kids[ 0 ].kids.length, 1 )
			$mol_assert_equal( wire.kids[ 0 ].kids[ 0 ].kids.length, 1 )
			$mol_assert_equal( wire.kids[ 0 ].kids[ 0 ].kids[ 0 ].kids.length, 0 )

		},

		/**
		 * The artboard fixture is a fixed point of normalization. Everything below
		 * asserts against it, so a fixture the model would reformat on the first
		 * write would make every one of those assertions about the serializer.
		 */
		'a document with an artboard round trips byte for byte'( $ ) {

			$mol_assert_equal( doc( board_src ).source(), board_src )

		},

		'a node with a sub of its own is a container, one without is not'( $ ) {

			const node = doc( board_src )

			$mol_assert_like( node.sub_names(), [ 'Board', 'Loose' ] )
			$mol_assert_like( node.sub_names( 'Board' ), [ 'Head', 'Foot' ] )

			// Not «no children»: no `sub` at all, which is what a free part is.
			$mol_assert_equal( node.sub_names( 'Loose' ), null )
			$mol_assert_equal( node.sub_names( 'Nobody' ), null )

			$mol_assert_equal( node.sub_holder( 'Head' ), 'Board' )
			$mol_assert_equal( node.sub_holder( 'Loose' ), '' )
			$mol_assert_equal( node.sub_holder( 'Nobody' ), null )

		},

		'a node is inserted into sub at the head, in the middle and at the tail'( $ ) {

			const at_head = doc( board_src )
			at_head.sub_insert( 'Loose', 0, 'Board' )
			$mol_assert_like( at_head.sub_names( 'Board' ), [ 'Loose', 'Head', 'Foot' ] )

			const between = doc( board_src )
			between.sub_insert( 'Loose', 1, 'Board' )
			$mol_assert_like( between.sub_names( 'Board' ), [ 'Head', 'Loose', 'Foot' ] )

			const at_tail = doc( board_src )
			at_tail.sub_insert( 'Loose', 2, 'Board' )
			$mol_assert_like( at_tail.sub_names( 'Board' ), [ 'Head', 'Foot', 'Loose' ] )

			// The reference is bare, like every other one in `sub`: a reference with
			// a child under it is the middle form of `<=` and declares a property.
			const refs = between.sub_list( 'Board' )!.kids
			$mol_assert_like( refs.map( ref => ref.type ), [ '<=', '<=', '<=' ] )
			$mol_assert_like( refs.map( ref => ref.kids[ 0 ].kids.length ), [ 0, 0, 0 ] )

		},

		/**
		 * Insertion writes into `sub` and NOWHERE else: the declaration of the
		 * artboard keeps its style, its order and its line, and the node put inside
		 * keeps the declaration it had.
		 */
		'insertion touches the sub and nothing around it'( $ ) {

			const node = doc( board_src )
			node.sub_insert( 'Loose', 1, 'Board' )

			const lines = node.source().split( '\n' )

			$mol_assert_like( lines.slice( 0, 10 ), board_src.split( '\n' ).slice( 0, 10 ) )
			$mol_assert_equal( lines[ 10 ], '\t\t\t<= Loose' )
			$mol_assert_equal( lines.length, board_src.split( '\n' ).length + 1 )
			const style = node.over_tree( 'Board', 'style' )!.kids[ 0 ]
			$mol_assert_like( style.kids.map( kid => kid.type ), [ 'width', 'flexDirection' ] )

		},

		'a node moves from the canvas into an artboard and back'( $ ) {

			const node = doc( board_src )

			node.sub_move( 'Loose', 1, 'Board' )

			$mol_assert_like( node.sub_names(), [ 'Board' ] )
			$mol_assert_like( node.sub_names( 'Board' ), [ 'Head', 'Loose', 'Foot' ] )

			node.sub_move( 'Loose', 0 )

			$mol_assert_like( node.sub_names(), [ 'Loose', 'Board' ] )
			$mol_assert_like( node.sub_names( 'Board' ), [ 'Head', 'Foot' ] )

			// The declaration never moved: what changed is where it is drawn.
			$mol_assert_equal( node.prop_names().includes( 'Loose' ), true )

		},

		/**
		 * The position the user aimed at was read off a list that still held the
		 * node being moved, so moving it down by one has to mean what it looked
		 * like — otherwise a drag one place to the right does nothing at all.
		 */
		'moving inside one parent counts positions on the list the user saw'( $ ) {

			const node = doc( board_src )

			node.sub_move( 'Head', 2, 'Board' )
			$mol_assert_like( node.sub_names( 'Board' ), [ 'Foot', 'Head' ] )

			node.sub_move( 'Head', 0, 'Board' )
			$mol_assert_like( node.sub_names( 'Board' ), [ 'Head', 'Foot' ] )

		},

		'a node cannot be put inside itself or under its own child'( $ ) {

			const node = doc( board_src )

			$mol_assert_fail( ()=> node.sub_insert( 'Board', 0, 'Board' ), Error )
			$mol_assert_fail( ()=> node.sub_move( 'Board', 0, 'Head' ), Error )

			$mol_assert_equal( node.source(), board_src )

		},

		'deleting reaches the sub of an artboard, not only the sub of the class'( $ ) {

			const node = doc( board_src )

			node.sub_drop( 'Head' )

			$mol_assert_like( node.sub_names( 'Board' ), [ 'Foot' ] )
			$mol_assert_like( node.sub_names(), [ 'Board', 'Loose' ] )

			node.prop_drop( 'Head' )
			$mol_assert_equal( node.prop_names().includes( 'Head' ), false )

		},

		/**
		 * A free part becomes an artboard by growing a `sub`, which is the only
		 * difference between the two, and an artboard that already has one is left
		 * alone rather than emptied.
		 */
		'a node is opened into a container by an empty sub'( $ ) {

			const node = doc( board_src )

			node.sub_open( 'Loose' )
			$mol_assert_like( node.sub_names( 'Loose' ), [] )

			node.sub_open( 'Board' )
			$mol_assert_like( node.sub_names( 'Board' ), [ 'Head', 'Foot' ] )

		},

		/**
		 * Layout properties are ordinary keys of the ordinary `style` dictionary, so
		 * an artboard exports as plain $mol and depends on nothing of ours.
		 */
		'a dictionary key is set, replaced where it stands and dropped'( $ ) {

			const node = doc( board_src )
			const style = node.over_tree( 'Board', 'style' )!.kids[ 0 ]

			$mol_assert_equal( $bog_vmap_lang_dict_get( style, 'width' )!.type, '' )
			$mol_assert_equal( $bog_vmap_lang_dict_get( style, 'width' )!.value, '1280px' )
			$mol_assert_equal( $bog_vmap_lang_dict_get( style, 'gap' ), null )

			const narrow = $.$bog_vmap_lang_dict_set( style, 'width', style.data( '390px' ) )
			$mol_assert_like( narrow.kids.map( kid => kid.type ), [ 'width', 'flexDirection' ] )
			$mol_assert_equal( $bog_vmap_lang_dict_get( narrow, 'width' )!.value, '390px' )

			const gapped = $.$bog_vmap_lang_dict_set( style, 'gap', style.data( '1rem' ) )
			$mol_assert_like( gapped.kids.map( kid => kid.type ), [ 'width', 'flexDirection', 'gap' ] )

			const bare = $.$bog_vmap_lang_dict_set( style, 'width', null )
			$mol_assert_like( bare.kids.map( kid => kid.type ), [ 'flexDirection' ] )

			$mol_assert_fail( ()=> $.$bog_vmap_lang_dict_set( style, 'a b', style.data( '1' ) ), Error )

		},

		/**
		 * An inherited dictionary starts with `^`, and `^` has to stay at the head:
		 * a dictionary redeclared without it REPLACES the one of the base instead of
		 * extending it, so a document over `$mol_button` that grew one `style` key
		 * would lose the rest in silence.
		 */
		'a dictionary key never moves the inherited head'( $ ) {

			const dict = $mol_tree2.struct( '*', [ $mol_tree2.struct( '^' ) ] )

			const one = $.$bog_vmap_lang_dict_set( dict, 'flexGrow', dict.data( '1' ) )
			$mol_assert_like( one.kids.map( kid => kid.type ), [ '^', 'flexGrow' ] )

			const two = $.$bog_vmap_lang_dict_set( one, 'flexGrow', dict.data( '2' ) )
			$mol_assert_like( two.kids.map( kid => kid.type ), [ '^', 'flexGrow' ] )
			$mol_assert_equal( $bog_vmap_lang_dict_get( two, 'flexGrow' )!.value, '2' )

		},

		'links are read back from a hand written document'( $ ) {

			const node = doc( demo_src )

			$mol_assert_like( node.links(), [
				{ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title', name: 'calc_result', bidi: false },
			] )

			// A reference to something that is not a wire is not a link.
			$mol_assert_like( doc( `${d}bog_vmap_lang_test_x ${d}mol_view\n\tlabel \\a\n\tP ${d}mol_view title <= label\n` ).links(), [] )

		},

	})

}
