namespace $ {

	const d = '$'

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

	const pair_src = [
		`${d}bog_vmap_lang_test_pair ${d}mol_view`,
		`	Calc ${d}bog_vmap_lang_test_calc`,
		`	Price ${d}mol_view`,
		`	sub /`,
		`		<= Calc`,
		`		<= Price`,
		``,
	].join( '\n' )

	const trio_src = [
		`${d}bog_vmap_lang_test_pair ${d}mol_view`,
		`	Calc ${d}bog_vmap_lang_test_calc`,
		`	Calc_2 ${d}bog_vmap_lang_test_calc`,
		`	Price ${d}mol_view`,
		`	Note ${d}mol_view`,
		`	sub /`,
		`		<= Calc`,
		`		<= Price`,
		``,
	].join( '\n' )

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

	function js_of( $: $, node: $bog_vmap_lang_node ) {
		const tree = node.tree()
		return $.$mol_tree2_text_to_string( $.$mol_view_tree2_to_text( tree.list([ tree ]) ) )
	}

	$mol_test({

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

		'dropping the last reference keeps an empty sub'( $ ) {

			const node = doc( demo_src )

			node.sub_drop( 'Hero' )

			$mol_assert_equal(
				node.source(),
				demo_src.replace( '\tsub / <= Hero\n', '\tsub /\n' ),
			)

			$mol_assert_equal( node.prop_tree( 'sub' )!.kids[ 0 ].kids.length, 0 )

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

		'trap: a wire to an undeclared node is refused'( $ ) {

			const node = doc( demo_src )

			$mol_assert_fail( ()=> node.wire_add({ name: 'w', node: 'Nope', prop: 'result' }), Error )
			$mol_assert_equal( node.source(), demo_src )

		},

		'trap: `?` on the right end only'( $ ) {

			$mol_assert_fail(
				()=> $.$bog_vmap_lang_wire_tree({ name: 'w', node: 'Field', prop: 'value?' }),
				Error,
			)

		},

		'trap: `?` on the left end only'( $ ) {

			$mol_assert_fail(
				()=> $.$bog_vmap_lang_wire_tree({ name: 'w?', node: 'Field', prop: 'hint' }),
				Error,
			)

		},

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

		'normalize hoists nested declarations onto the root'( $ ) {

			$mol_assert_equal( doc( nested_src ).tree().toString(), demo_src )
			$mol_assert_equal( doc( demo_src ).tree().toString(), demo_src )

		},

		'an empty source says so instead of throwing on undefined'( $ ) {

			$mol_assert_fail( ()=> doc( '' ).tree(), Error )

		},

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

		'renaming a class touches the class name alone'( $ ) {

			const d1 = pair_doc()

			d1.class_rename( `${d}bog_vmap_lang_test_one`, `${d}my_site_page` )

			$mol_assert_equal( d1.source(), [
				`${d}my_site_page ${d}mol_view`,
				`	label \\Первая`,
				`	count 1`,
				`${d}bog_vmap_lang_test_two ${d}mol_view`,
				`	caption \\Вторая`,
				`	count 2`,
				``,
			].join( '\n' ) )

		},

		'a rename rewrites the mentions of the class in its neighbours'( $ ) {

			const d1 = $bog_vmap_lang_doc.make({})

			d1.source( [
				`${d}bog_vmap_lang_test_base ${d}mol_view`,
				`	label \\Первая`,
				`${d}bog_vmap_lang_test_heir ${d}bog_vmap_lang_test_base`,
				`	Card ${d}bog_vmap_lang_test_base`,
				`	sub / <= Card`,
				``,
			].join( '\n' ) )

			d1.class_rename( `${d}bog_vmap_lang_test_base`, `${d}bog_vmap_lang_test_root` )

			$mol_assert_equal( d1.source(), [
				`${d}bog_vmap_lang_test_root ${d}mol_view label \\Первая`,
				`${d}bog_vmap_lang_test_heir ${d}bog_vmap_lang_test_root`,
				`	Card ${d}bog_vmap_lang_test_root`,
				`	sub / <= Card`,
				``,
			].join( '\n' ) )

		},

		'a rename does not reach into a string'( $ ) {

			const d1 = $bog_vmap_lang_doc.make({})

			d1.source( `${d}bog_vmap_lang_test_one ${d}mol_view\n\tlabel \\${d}bog_vmap_lang_test_one\n` )

			d1.class_rename( `${d}bog_vmap_lang_test_one`, `${d}bog_vmap_lang_test_four` )

			$mol_assert_equal(
				d1.source(),
				`${d}bog_vmap_lang_test_four ${d}mol_view label \\${d}bog_vmap_lang_test_one\n`,
			)

		},

		'a rename onto a name the document already carries is refused'( $ ) {

			const d1 = pair_doc()

			$mol_assert_fail( ()=> d1.class_rename(
				`${d}bog_vmap_lang_test_one`,
				`${d}bog_vmap_lang_test_two`,
			), Error )

			$mol_assert_like( d1.names(), [
				`${d}bog_vmap_lang_test_one`,
				`${d}bog_vmap_lang_test_two`,
			] )

		},

		'a rename of a class the document lacks is refused'( $ ) {

			const d1 = pair_doc()

			$mol_assert_fail( ()=> d1.class_rename(
				`${d}bog_vmap_lang_test_absent`,
				`${d}bog_vmap_lang_test_four`,
			), Error )

		},

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

		'unwiring a part takes both ends of its own wires and no others'( $ ) {

			const node = doc( trio_src )

			node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title' })
			node.link_add({ from: 'Calc', from_prop: 'result', to: 'Note', to_prop: 'title' })
			node.link_add({ from: 'Calc_2', from_prop: 'result', to: 'Note', to_prop: 'hint' })

			node.links_drop( 'Calc' )

			$mol_assert_like(
				node.links().map( link => [ link.from, link.to, link.to_prop ] ),
				[ [ 'Calc_2', 'Note', 'hint' ] ],
			)
			$mol_assert_like( node.wires().map( wire => wire.name ), [ 'calc_2_result' ] )
			$mol_assert_equal( node.source().includes( 'calc_result' ), false )

			$mol_assert_ok( node.prop_names().includes( 'Calc' ) )

		},

		'unwiring a part takes its wire even when nobody reads it'( $ ) {

			const node = doc( trio_src )
			node.wire_add({ name: 'calc_result', node: 'Calc', prop: 'result', bidi: false })

			$mol_assert_like( node.wires().map( wire => wire.name ), [ 'calc_result' ] )
			$mol_assert_like( node.links(), [] )

			node.links_drop( 'Calc' )

			$mol_assert_like( node.wires(), [] )
			$mol_assert_equal( node.source().includes( 'calc_result' ), false )

		},

		'unwiring a consumer keeps the wire while another consumer holds it'( $ ) {

			const node = doc( trio_src )

			node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title' })
			node.link_add({ from: 'Calc', from_prop: 'result', to: 'Note', to_prop: 'title' })

			node.links_drop( 'Price' )

			$mol_assert_like( node.links().map( link => [ link.from, link.to ] ), [ [ 'Calc', 'Note' ] ] )
			$mol_assert_ok( node.source().includes( '\tcalc_result = Calc result\n' ) )
			$mol_assert_equal( node.source().includes( 'Price ' + `${d}mol_view title` ), false )

			node.links_drop( 'Note' )

			$mol_assert_like( node.links(), [] )
			$mol_assert_equal( node.source().includes( 'calc_result' ), false )

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

		'a document with an artboard round trips byte for byte'( $ ) {

			$mol_assert_equal( doc( board_src ).source(), board_src )

		},

		'a node with a sub of its own is a container, one without is not'( $ ) {

			const node = doc( board_src )

			$mol_assert_like( node.sub_names(), [ 'Board', 'Loose' ] )
			$mol_assert_like( node.sub_names( 'Board' ), [ 'Head', 'Foot' ] )

			$mol_assert_equal( node.sub_names( 'Loose' ), null )
			$mol_assert_equal( node.sub_names( 'Nobody' ), null )

			$mol_assert_equal( node.sub_names( 'sub' ), null )
			$mol_assert_equal( node.over_tree( 'sub', 'sub' ), null )

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

			const refs = between.sub_list( 'Board' )!.kids
			$mol_assert_like( refs.map( ref => ref.type ), [ '<=', '<=', '<=' ] )
			$mol_assert_like( refs.map( ref => ref.kids[ 0 ].kids.length ), [ 0, 0, 0 ] )

		},

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

			$mol_assert_equal( node.prop_names().includes( 'Loose' ), true )

		},

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

		'a node is opened into a container by an empty sub'( $ ) {

			const node = doc( board_src )

			node.sub_open( 'Loose' )
			$mol_assert_like( node.sub_names( 'Loose' ), [] )

			node.sub_open( 'Board' )
			$mol_assert_like( node.sub_names( 'Board' ), [ 'Head', 'Foot' ] )

		},

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

			$mol_assert_like( doc( `${d}bog_vmap_lang_test_x ${d}mol_view\n\tlabel \\a\n\tP ${d}mol_view title <= label\n` ).links(), [] )

		},

		'renaming a node rewrites the wire that reads it'( $ ) {

			const node = doc( demo_src )

			node.property( 'Calc' ).title( 'Motor' )

			$mol_assert_equal( node.source(), demo_src.replace( /Calc(?= |\n)/g, 'Motor' ) )
			$mol_assert_like( node.prop_names(), [ 'Price', 'Hero', 'Motor', 'calc_result', 'label', 'sub' ] )

			$mol_assert_like( node.links(), [
				{ from: 'Motor', from_prop: 'result', to: 'Price', to_prop: 'title', name: 'calc_result', bidi: false },
			] )

		},

		'renaming a node rewrites the sub that draws it'( $ ) {

			const node = doc( demo_src )

			node.property( 'Hero' ).title( 'Stage' )

			$mol_assert_like( node.sub_names(), [ 'Stage' ] )
			$mol_assert_equal( node.sub_holder( 'Stage' ), '' )
			$mol_assert_equal( node.sub_holder( 'Hero' ), null )

			$mol_assert_like( node.sub_names( 'Stage' ), [ 'Price' ] )

		},

		'renaming a wire rewrites the binding that reads it'( $ ) {

			const node = doc( demo_src )

			node.property( 'calc_result' ).title( 'total' )

			$mol_assert_like( node.links(), [
				{ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title', name: 'total', bidi: false },
			] )
			$mol_assert_equal( node.source().includes( 'title <= total' ), true )
			$mol_assert_equal( node.source().includes( 'calc_result' ), false )

		},

		'a reader of the name recomputes on a rename'( $ ) {

			const node = doc( demo_src )

			const reader = $mol_wire_atom.solo( node, function names_reader( this: typeof node ) {
				return this.prop_names().join( ' ' )
			} )

			$mol_assert_equal( reader.sync().includes( 'Calc' ), true )

			node.property( 'Calc' ).title( 'Motor' )

			$mol_assert_equal( reader.sync().includes( 'Motor' ), true )
			$mol_assert_equal( reader.sync().includes( 'Calc' ), false )

			$mol_assert_equal( node.property( 'Calc' ).title(), '' )
			$mol_assert_equal( node.property( 'Motor' ).title(), 'Motor' )

		},

		'a rename onto a name already declared is refused'( $ ) {

			const node = doc( demo_src )

			$mol_assert_fail( ()=> node.property( 'Calc' ).title( 'Price' ), Error )

			$mol_assert_equal( node.source(), demo_src )

		},

		'a rename carries the sign of the property'( $ ) {

			const node = doc( `${d}bog_vmap_lang_test_sign ${d}mol_view value? null\n` )

			node.property( 'value' ).title( 'title' )

			$mol_assert_equal( node.source(), `${d}bog_vmap_lang_test_sign ${d}mol_view title? null\n` )
			$mol_assert_equal( node.property( 'title' ).next(), true )

		},

	})

}
