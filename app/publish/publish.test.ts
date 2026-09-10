namespace $ {

	const d = '$'

	const src_button = `Button_minor ${d}mol_view\n\ttitle \\Hi\n\tminimal true\n`
	const src_calc = `Calc ${d}mol_view\n\tresult 42\n`
	const pack_src = `${d}mol_view ${d}mol_object\n\tpack_port \\\n\tsub /\n`

	const klass_button = `${d}bog_vmap_pub_button_minor`
	const klass_calc = `${d}bog_vmap_pub_calc`

	function store( $: $ ) {
		return $bog_vmap_app_publish_store.make({
			$,
			shelf_land_config: ()=> $.$giper_baza_glob.home().land(),
		})
	}

	function view( $: $, s: $bog_vmap_app_publish_store, part: string, source: string, classes: readonly string[] = [], doc = '' ) {
		return $bog_vmap_app_publish.make({
			$,
			store: ()=> s,
			part: ()=> part,
			source: ()=> source,
			classes: ()=> classes,
			doc: ()=> doc,
		}) as $$.$bog_vmap_app_publish
	}

	function click( $: $, node: Element ) {
		const event = $.$mol_dom_context.document.createEvent( 'mouseevent' )
		event.initEvent( 'click', true, true )
		node.dispatchEvent( event )
	}

	const doc_nested = [
		`${d}bog_vmap_app_page ${d}mol_view`,
		`\tPrice ${d}mol_text`,
		`\t\ttitle \\Hi`,
		`\tHero ${d}mol_view`,
		`\t\tsub / <= Price`,
		`\tCard ${d}mol_view`,
		`\t\tsub / <= Hero`,
		`\tsub / <= Card`,
		``,
	].join( '\n' )

	const src_card = `Card ${d}mol_view\n\tsub / <= Hero\n`
	const klass_card = `${d}bog_vmap_pub_card`

	const root_class = `${d}my_site_page`

	const doc_card = doc_nested.replace( `${d}bog_vmap_app_page`, root_class )

	const css_doc = [
		'[my_site_page_card] {\n\tpadding: 1rem;\n}',
		'[my_site_page_hero] {\n\tcolor: red;\n}',
		'[my_site_page_price] {\n\tfont-weight: bold;\n}',
		'[my_site_page_aside] {\n\tcolor: green;\n}',
	].join( '\n\n' )

	const css_button = '[my_site_page_button_minor] {\n\tcolor: red;\n}'
	const css_button_out = '[bog_vmap_pub_button_minor] {\n\tcolor: red;\n}'

	$mol_test({

		'nothing published: no library, no link'( $ ) {

			const s = store( $ )

			$mol_assert_equal( s.shelf(), null )
			$mol_assert_equal( s.link(), '' )
			$mol_assert_like( s.shelf_links(), [] )

		},

		async 'the rule of a part is re-addressed to the class it goes out as'( $ ) {

			const s = store( $ )

			await $mol_wire_async( s ).publish( 'Button_minor', src_button, '', css_button, [ root_class ] )

			$mol_assert_equal( s.shelf()!.parts()[ 0 ].css(), css_button_out )

		},

		async 'a part carries the rules of its sub-views, each re-addressed'( $ ) {

			const s = store( $ )
			const inlined = s.inlined( src_card, doc_card )

			await $mol_wire_async( s ).publish( 'Card', inlined.source, '', css_doc, [ root_class ] )

			$mol_assert_equal(
				s.shelf()!.parts()[ 0 ].css(),
				[
					'[bog_vmap_pub_card] {\n\tpadding: 1rem;\n}',
					'[bog_vmap_pub_card_hero] {\n\tcolor: red;\n}',
					'[bog_vmap_pub_card_price] {\n\tfont-weight: bold;\n}',
				].join( '\n\n' ),
			)

		},

		'sub-views of the copy are the declarations the published tree carries'( $ ) {

			const s = store( $ )

			$mol_assert_like( s.sub_names( s.inlined( src_card, doc_card ).source ), [ 'Hero', 'Price' ] )

			$mol_assert_like( s.sub_names( src_card ), [] )

		},

		'a part of the pack takes no rule of the document with it'( $ ) {

			const s = store( $ )
			const source = `Calc ${d}bog_vmap_part_calc\n`

			$mol_assert_like( s.sub_names( source ), [] )
			$mol_assert_equal( s.css_out( css_doc, 'Calc', source, root_class ), '' )

		},

		'the move matches the whole attribute, not the beginning of it'( $ ) {

			const s = store( $ )
			const css = '[my_site_page_card] {\n\tcolor: red;\n}\n\n[my_site_page_card_note] {\n\tcolor: blue;\n}'

			$mol_assert_equal(
				s.css_moved( css, 'my_site_page_card', 'bog_vmap_pub_card' ),
				'[bog_vmap_pub_card] {\n\tcolor: red;\n}\n\n[my_site_page_card_note] {\n\tcolor: blue;\n}',
			)

			$mol_assert_equal(
				s.css_out( css, 'Card', `Card ${d}mol_view\n`, root_class ),
				'[bog_vmap_pub_card] {\n\tcolor: red;\n}',
			)

		},

		'a rule written with a capital in the name is re-addressed too'( $ ) {

			const s = store( $ )

			$mol_assert_equal(
				s.css_moved( '[my_site_page_Card] {\n\tcolor: red;\n}', 'my_site_page_card', 'bog_vmap_pub_card' ),
				'[bog_vmap_pub_card] {\n\tcolor: red;\n}',
			)

			$mol_assert_equal(
				s.css_out(
					'[my_site_page_Card] {\n\tcolor: red;\n}\n\n[my_site_page_Hero] {\n\tcolor: blue;\n}',
					'Card',
					s.inlined( src_card, doc_card ).source,
					root_class,
				),
				'[bog_vmap_pub_card] {\n\tcolor: red;\n}\n\n[bog_vmap_pub_card_hero] {\n\tcolor: blue;\n}',
			)

		},

		'a part of the pack goes out as an heir, with nothing copied'( $ ) {

			const s = store( $ )
			const source = `Calc ${d}bog_vmap_part_calc\n`

			$mol_assert_equal(
				s.class_source( 'Calc', source ),
				`${ klass_calc } ${d}bog_vmap_part_calc\n`,
			)

			$mol_assert_equal( s.css_moved( '', 'my_site_page_calc', 'bog_vmap_pub_calc' ), '' )
			$mol_assert_equal( s.css_out( '', 'Calc', source, root_class ), '' )

		},

		async 'a part of the document becomes a class of the library, body and styles with it'( $ ) {

			const s = store( $ )

			const link = await $mol_wire_async( s ).publish(
				'Button_minor', src_button, 'title(){ return 1 }', css_button, [ root_class ],
			)

			const shelf = s.shelf()!
			$mol_assert_ok( shelf )
			$mol_assert_equal( shelf.title(), 'Мои компоненты' )

			const parts = shelf.parts()
			$mol_assert_equal( parts.length, 1 )
			$mol_assert_equal( parts[ 0 ].tree(), `${ klass_button } ${d}mol_view\n\ttitle \\Hi\n\tminimal true\n` )
			$mol_assert_equal( parts[ 0 ].js(), 'title(){ return 1 }' )
			$mol_assert_equal( parts[ 0 ].css(), css_button_out )

			$mol_assert_ok( link )
			$mol_assert_equal( link, s.link() )
			$mol_assert_equal( link, shelf.land().link().str )
			$mol_assert_equal( shelf.land().Data( $bog_vmap_lib_land_shelf ).parts().length, 1 )

		},

		async 'publishing the same part again updates its part and the list does not grow'( $ ) {

			const s = store( $ )

			await $mol_wire_async( s ).publish( 'Button_minor', src_button, 'title(){ return 1 }' )
			const before = s.shelf()!.parts()[ 0 ]

			const edited = src_button.replace( 'Hi', 'Bye' )
			await $mol_wire_async( s ).publish( 'Button_minor', edited, 'title(){ return 2 }' )

			const parts = s.shelf()!.parts()
			$mol_assert_equal( parts.length, 1 )
			$mol_assert_equal( parts[ 0 ].link().str, before.link().str )
			$mol_assert_equal( parts[ 0 ].tree(), `${ klass_button } ${d}mol_view\n\ttitle \\Bye\n\tminimal true\n` )
			$mol_assert_equal( parts[ 0 ].js(), 'title(){ return 2 }' )

			await $mol_wire_async( s ).publish( 'Button_minor', edited )
			$mol_assert_equal( s.shelf()!.parts()[ 0 ].js(), '' )
			$mol_assert_equal( s.shelf()!.parts().length, 1 )

		},

		async 'a second part is a second class of the same library'( $ ) {

			const s = store( $ )

			const first = await $mol_wire_async( s ).publish( 'Button_minor', src_button )
			const second = await $mol_wire_async( s ).publish( 'Calc', src_calc )

			$mol_assert_equal( first, second )
			$mol_assert_equal( s.shelf_links().length, 1 )

			$mol_assert_like(
				s.shelf()!.parts().map( part => $bog_vmap_lib_land_name( part.tree() ) ),
				[ klass_button, klass_calc ],
			)

		},

		async 'the published library reads through the stack as a pack would'( $ ) {

			const s = store( $ )
			const link = await $mol_wire_async( s ).publish(
				'Button_minor', src_button, 'title(){ return 1 }', css_button, [ root_class ],
			)

			const stack = $bog_vmap_lib_land_stack.make({
				$,
				tree: ()=> $.$bog_vmap_lib_parse( pack_src ),
				lands: ()=> [ link ],
			})

			$mol_assert_like( stack.class_list(), [ `${d}mol_view`, klass_button ] )
			$mol_assert_like(
				stack.inherit_chain( klass_button ),
				[ klass_button, `${d}mol_view`, `${d}mol_object` ],
			)

			const ports = [ ... stack.props_map( klass_button ).keys() ]
			$mol_assert_ok( ports.includes( 'title' ) )
			$mol_assert_ok( ports.includes( 'minimal' ) )
			$mol_assert_ok( ports.includes( 'pack_port' ) )

			$mol_assert_like( stack.parts(), [{
				tree: `${ klass_button } ${d}mol_view\n\ttitle \\Hi\n\tminimal true\n`,
				js: 'title(){ return 1 }',
				css: css_button_out,
			}] )

		},

		async 'the link passes the palette field as a land and nothing else'( $ ) {

			const s = store( $ )
			const link = await $mol_wire_async( s ).publish( 'Calc', src_calc )

			const parsed = $bog_vmap_lib_links_parse( link )

			$mol_assert_equal( parsed.pack, null )
			$mol_assert_like( parsed.lands, [ link ] )
			$mol_assert_like( parsed.rejected, [] )

			$mol_assert_like(
				$bog_vmap_lib_links_parse( `https://mol.hyoo.ru, ${ link }` ).lands,
				[ link ],
			)

		},

		async 'the library is found again through the home land'( $ ) {

			const first = store( $ )
			const link = await $mol_wire_async( first ).publish( 'Button_minor', src_button )

			const again = store( $ )

			$mol_assert_equal( again.link(), link )
			$mol_assert_equal( again.shelf()!.parts().length, 1 )

			await $mol_wire_async( again ).publish( 'Calc', src_calc )

			$mol_assert_equal( again.shelf_links().length, 1 )
			$mol_assert_equal( first.shelf()!.parts().length, 2 )

		},

		'the class name is the part name under the prefix of the pack'( $ ) {

			const s = store( $ )

			$mol_assert_equal( s.class_name( 'Button_minor' ), klass_button )
			$mol_assert_equal( s.class_name( 'Calc_2' ), `${d}bog_vmap_pub_calc_2` )

			$mol_assert_equal(
				s.class_source( 'Button_minor', src_button ),
				`${ klass_button } ${d}mol_view\n\ttitle \\Hi\n\tminimal true\n`,
			)

		},

		'a part wired to the document is refused and names the wire'( $ ) {

			const s = store( $ )

			const one_way = `Label ${d}mol_view\n\tsub / <= calc_result\n`
			const two_way = `Field ${d}mol_string\n\tvalue? <=> field_value?\n`
			const chain = `Label ${d}mol_view\n\tsum = Calc result\n`
			const many = `Label ${d}mol_view\n\tsub / <= calc_result\n\tvalue? <=> field_value?\n\tsum = Calc result\n`

			$mol_assert_like( s.bound_names( one_way ), [ 'calc_result' ] )
			$mol_assert_like( s.bound_names( two_way ), [ 'field_value' ] )
			$mol_assert_like( s.bound_names( chain ), [ 'Calc' ] )
			$mol_assert_like( s.bound_names( many ), [ 'calc_result', 'field_value', 'Calc' ] )
			$mol_assert_like( s.bound_names( src_button ), [] )

			$mol_assert_equal(
				s.refusal( 'Label', one_way ),
				'деталь Label ссылается на calc_result документа, отвяжите провод перед публикацией',
			)
			$mol_assert_equal(
				s.refusal( 'Field', two_way ),
				'деталь Field ссылается на field_value документа, отвяжите провод перед публикацией',
			)
			$mol_assert_equal(
				s.refusal( 'Label', many ),
				'деталь Label ссылается на calc_result, field_value, Calc документа, отвяжите провод перед публикацией',
			)
			$mol_assert_equal( s.refusal( 'Button_minor', src_button ), '' )

			$mol_assert_fail( ()=> s.publish( 'Label', one_way ), s.refusal( 'Label', one_way ) )
			$mol_assert_fail( ()=> s.publish( 'Field', two_way ), s.refusal( 'Field', two_way ) )
			$mol_assert_fail(
				()=> s.publish( 'Label', chain ),
				'деталь Label ссылается на Calc документа, отвяжите провод перед публикацией',
			)
			$mol_assert_equal( s.shelf(), null )

		},

		'a reference to a name the part only overrides is still a wire to the document'( $ ) {

			const s = store( $ )
			const free = `Label ${d}mol_view\n\tsub / <= title\n\ttitle \\Hi\n`

			$mol_assert_like( s.bound_names( free ), [ 'title' ] )
			$mol_assert_ok( s.refusal( 'Label', free ).includes( 'title' ) )

		},

		async 'a part with a sub-view of its own is published, a wire inside the sub-view is not'( $ ) {

			const s = store( $ )

			const nested = `Card ${d}mol_view\n\tsub /\n\t\t<= Inner ${d}mol_view\n\t\t\ttitle \\Hi\n\t\t<= Inner\n`
			const nested_wired = `Card ${d}mol_view\n\tsub /\n\t\t<= Inner ${d}mol_view\n\t\t\ttitle <= root_title\n`

			$mol_assert_like( s.bound_names( nested ), [] )
			$mol_assert_equal( s.refusal( 'Card', nested ), '' )

			$mol_assert_like( s.bound_names( nested_wired ), [ 'root_title' ] )
			$mol_assert_fail(
				()=> s.publish( 'Card', nested_wired ),
				'деталь Card ссылается на root_title документа, отвяжите провод перед публикацией',
			)
			$mol_assert_equal( s.shelf(), null )

			await $mol_wire_async( s ).publish( 'Card', nested )

			const parts = s.shelf()!.parts()
			$mol_assert_equal( parts.length, 1 )
			$mol_assert_equal( $bog_vmap_lib_land_name( parts[ 0 ].tree() ), `${d}bog_vmap_pub_card` )

		},

		async 'hoisted sub-views are put back into the part two levels down and the class carries them'( $ ) {

			const s = store( $ )

			const { source, shared } = s.inlined( src_card, doc_nested )
			$mol_assert_like( shared, [] )
			$mol_assert_like( s.bound_names( source ), [] )
			$mol_assert_equal( s.refusal( 'Card', source ), '' )

			const tree = s.tree( source )!
			const hero = tree.select( `${d}mol_view`, 'sub', '/', '<=', 'Hero', `${d}mol_view` )
			$mol_assert_equal( hero.kids.length, 1 )
			$mol_assert_equal(
				hero.select( `${d}mol_view`, 'sub', '/', '<=', 'Price', `${d}mol_text`, 'title', null ).kids[ 0 ].value,
				'Hi',
			)

			$mol_assert_like( s.bound_names( src_card ), [ 'Hero' ] )

			$mol_assert_equal( s.inlined( src_card, '' ).source, src_card )

			const link = await $mol_wire_async( s ).publish( 'Card', source )

			const stack = $bog_vmap_lib_land_stack.make({
				$,
				tree: ()=> $.$bog_vmap_lib_parse( pack_src ),
				lands: ()=> [ link ],
			})

			$mol_assert_like( stack.class_list(), [ `${d}mol_view`, klass_card ] )
			const ports = [ ... stack.props_map( klass_card ).keys() ]
			$mol_assert_ok( ports.includes( 'Hero' ) )
			$mol_assert_ok( ports.includes( 'Price' ) )
			$mol_assert_ok( ports.includes( 'sub' ) )

		},

		async 'a sub-view the document reads too goes out as a copy and the note names it'( $ ) {

			const s = store( $ )
			const doc = doc_nested.replace( 'sub / <= Card', 'sub /\n\t\t<= Card\n\t\t<= Hero' )

			const { shared } = s.inlined( src_card, doc )
			$mol_assert_like( shared, [ 'Hero' ] )

			const wired = doc_nested.replace( 'sub / <= Card', 'hero_sub = Hero sub\n\tsub / <= Card' )
			$mol_assert_like( s.inlined( src_card, wired ).shared, [ 'Hero' ] )

			const v = view( $, s, 'Card', src_card, [], doc )
			await $mol_wire_async( v ).publish()

			$mol_assert_equal( v.published(), klass_card )
			$mol_assert_like( v.shared(), [ 'Hero' ] )
			$mol_assert_equal( v.note(), `опубликовано ${ klass_card }, под-виды Hero ушли копией, документ читает их и сам:` )
			$mol_assert_equal( s.shelf()!.parts().length, 1 )

			const plain = view( $, s, 'Card', src_card, [], doc_nested )
			await $mol_wire_async( plain ).publish()
			$mol_assert_equal( plain.note(), `опубликовано ${ klass_card }:` )

		},

		'a value of the root and a loop of sub-views are still refused after inlining'( $ ) {

			const s = store( $ )

			const doc_values = [
				`${d}bog_vmap_app_page ${d}mol_view`,
				`\ttitle \\Hi`,
				`\tCalc ${d}mol_view`,
				`\t\tresult 42`,
				`\tcalc_result = Calc result`,
				`\tLabel ${d}mol_view`,
				`\t\tsub / <= calc_result`,
				`\t\thint <= title`,
				`\tsub / <= Label`,
				``,
			].join( '\n' )

			const label = `Label ${d}mol_view\n\tsub / <= calc_result\n\thint <= title\n`
			const { source } = s.inlined( label, doc_values )
			$mol_assert_equal( source, label )
			$mol_assert_like( s.bound_names( source ), [ 'calc_result', 'title' ] )

			const doc_loop = [
				`${d}bog_vmap_app_page ${d}mol_view`,
				`\tA ${d}mol_view`,
				`\t\tsub / <= B`,
				`\tB ${d}mol_view`,
				`\t\tsub / <= A`,
				`\tsub / <= A`,
				``,
			].join( '\n' )

			const loop = s.inlined( `A ${d}mol_view\n\tsub / <= B\n`, doc_loop )
			$mol_assert_like( s.bound_names( loop.source ), [ 'A' ] )
			$mol_assert_equal(
				s.refusal( 'A', loop.source ),
				'деталь A ссылается на A документа, отвяжите провод перед публикацией',
			)

		},

		'a part based on a class of the document is refused'( $ ) {

			const s = store( $ )
			const classes = [ `${d}bog_vmap_app_page`, `${d}bog_vmap_app_card` ]
			const heir = `Promo ${d}bog_vmap_app_card\n\ttitle \\Hi\n`

			$mol_assert_equal(
				s.refusal( 'Promo', heir, classes ),
				`деталь Promo наследует класс ${d}bog_vmap_app_card документа, выберите базу из библиотеки перед публикацией`,
			)
			$mol_assert_equal( s.refusal( 'Promo', heir ), '' )
			$mol_assert_equal( s.refusal( 'Button_minor', src_button, classes ), '' )

			$mol_assert_fail( ()=> s.publish( 'Promo', heir, '', '', classes ), s.refusal( 'Promo', heir, classes ) )
			$mol_assert_equal( s.shelf(), null )

		},

		'the click on a wired part shows the refusal and publishes nothing'( $ ) {

			const s = store( $ )
			const wired = `Label ${d}mol_view\n\tsub / <= calc_result\n`

			const v = view( $, s, 'Label', wired )
			$mol_assert_equal( v.enabled(), true )

			$mol_assert_equal( v.publish(), null )
			$mol_assert_ok( v.note().includes( 'calc_result' ) )
			$mol_assert_ok( v.note().includes( 'Label' ) )
			$mol_assert_equal( v.published(), '' )
			$mol_assert_equal( v.lib_link(), '' )
			$mol_assert_equal( s.shelf(), null )
			$mol_assert_like( v.content(), [ v.Publish(), v.Note() ] )
			$mol_assert_like( v.Note().sub(), [ v.note() ] )

			const heir = view( $, s, 'Promo', `Promo ${d}bog_vmap_app_page\n`, [ `${d}bog_vmap_app_page` ] )
			$mol_assert_equal( heir.publish(), null )
			$mol_assert_ok( heir.note().includes( `${d}bog_vmap_app_page` ) )
			$mol_assert_equal( s.shelf(), null )

		},

		async 'a click on the rendered button puts the refusal on the screen'( $ ) {

			const s = store( $ )
			const v = view( $, s, 'Label', `Label ${d}mol_view\n\tsub / <= calc_result\n` )

			const root = v.dom_tree()
			$mol_assert_equal( root.textContent!.includes( 'calc_result' ), false )

			click( $, v.Publish().dom_tree() )
			v.dom_tree()

			$mol_assert_ok( root.textContent!.includes(
				'деталь Label ссылается на calc_result документа, отвяжите провод перед публикацией'
			) )
			$mol_assert_equal( s.shelf(), null )

			await Promise.resolve()
			$mol_assert_equal( v.Publish().error(), '' )

		},

		async 'a click on a part the document does not declare is refused in words'( $ ) {

			const s = store( $ )
			const v = view( $, s, 'Option(mul)', '' )
			$mol_assert_equal( v.enabled(), true )

			const root = v.dom_tree()
			click( $, v.Publish().dom_tree() )
			v.dom_tree()

			$mol_assert_ok( root.textContent!.includes(
				'деталь Option(mul) не объявлена в документе, выберите деталь верхнего уровня'
			) )
			$mol_assert_equal( s.shelf(), null )

			await Promise.resolve()
			$mol_assert_equal( v.Publish().error(), '' )

		},

		async 'an error while reading the part is words on the bar, a suspension passes through'( $ ) {

			const s = store( $ )
			const v = view( $, s, 'Label', '' )
			v.source = ()=> $.$mol_fail( new Error( 'boom' ) )

			const root = v.dom_tree()
			click( $, v.Publish().dom_tree() )
			v.dom_tree()

			$mol_assert_ok( root.textContent!.includes( 'не удалось опубликовать Label: boom' ) )
			$mol_assert_equal( s.shelf(), null )

			await Promise.resolve()
			$mol_assert_equal( v.Publish().error(), '' )

			const wait = new Promise< string >( ()=> {} )
			v.source = ()=> { throw wait }

			let caught: unknown = null
			try { v.publish() } catch( error: unknown ) { caught = error }

			$mol_assert_equal( caught, wait )
			$mol_assert_equal( v.note(), 'не удалось опубликовать Label: boom' )

		},

		async 'a refusal is cleared by the next successful click'( $ ) {

			const s = store( $ )
			let source = `Label ${d}mol_view\n\tsub / <= calc_result\n`

			const v = view( $, s, 'Label', '' )
			v.source = ()=> source

			v.publish()
			$mol_assert_ok( v.note().includes( 'calc_result' ) )

			source = `Label ${d}mol_view\n\ttitle \\Hi\n`
			await $mol_wire_async( v ).publish()

			$mol_assert_equal( v.note(), `опубликовано ${d}bog_vmap_pub_label:` )
			$mol_assert_equal( s.shelf()!.parts().length, 1 )

		},

		'the button is off without a pick and says so'( $ ) {

			const s = store( $ )
			const v = view( $, s, '', '' )

			$mol_assert_equal( v.enabled(), false )
			$mol_assert_equal( v.class_name(), '' )
			$mol_assert_equal( v.lib_link(), '' )
			$mol_assert_equal( v.note(), '' )
			$mol_assert_like( v.content(), [ v.Publish() ] )

			$mol_assert_equal( v.publish(), null )
			$mol_assert_equal( s.shelf(), null )

		},

		async 'the click publishes the pick and shows the link'( $ ) {

			const s = store( $ )
			const v = view( $, s, 'Button_minor', src_button )

			$mol_assert_equal( v.enabled(), true )
			$mol_assert_equal( v.class_name(), klass_button )
			$mol_assert_ok( v.publish_hint().includes( klass_button ) )

			await $mol_wire_async( v ).publish()

			$mol_assert_equal( v.published(), klass_button )
			$mol_assert_equal( v.note(), `опубликовано ${ klass_button }:` )
			$mol_assert_equal( v.lib_link(), s.link() )
			$mol_assert_ok( v.lib_link() )
			$mol_assert_like( v.content(), [ v.Publish(), v.Note(), v.Copy() ] )
			$mol_assert_equal( v.Copy().text(), s.link() )

			$mol_assert_equal( s.shelf()!.parts().length, 1 )

		},

	})

}
