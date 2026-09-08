namespace $ {

	/**
	 * Tests of publishing, on lands built in place.
	 *
	 * No master and no proof of work: `shelf_land_config` hands in the home land,
	 * so the library becomes an AREA of it — a land of its own with the shelf at
	 * its root, exactly the shape a grabbed land has, minus the mining. That is what
	 * lets the link be looked up by the stack the way another scene would.
	 *
	 * Publishing is called through `$mol_wire_async`, as the click does: making the
	 * area encodes units, which is asynchronous, and outside a fiber that is a
	 * `Promise` thrown at the caller.
	 *
	 * NOT covered, deliberately: grabbing the library land, which is proof of work,
	 * seconds against the one second a test is given.
	 *
	 * `d` keeps `$` out of the string literals: mam builds its dependency graph by
	 * a regexp over sources, literals included.
	 */
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

	function view( $: $, s: $bog_vmap_app_publish_store, part: string, source: string, classes: readonly string[] = [] ) {
		return $bog_vmap_app_publish.make({
			$,
			store: ()=> s,
			part: ()=> part,
			source: ()=> source,
			classes: ()=> classes,
		}) as $$.$bog_vmap_app_publish
	}

	$mol_test({

		'nothing published: no library, no link'( $ ) {

			const s = store( $ )

			$mol_assert_equal( s.shelf(), null )
			$mol_assert_equal( s.link(), '' )
			$mol_assert_like( s.shelf_links(), [] )

		},

		async 'a part of the document becomes a class of the library, body and styles with it'( $ ) {

			const s = store( $ )

			const link = await $mol_wire_async( s ).publish( 'Button_minor', src_button, 'title(){ return 1 }', '[x]{ color: red }' )

			const shelf = s.shelf()!
			$mol_assert_ok( shelf )
			$mol_assert_equal( shelf.title(), 'Мои компоненты' )

			const parts = shelf.parts()
			$mol_assert_equal( parts.length, 1 )
			$mol_assert_equal( parts[ 0 ].tree(), `${ klass_button } ${d}mol_view\n\ttitle \\Hi\n\tminimal true\n` )
			$mol_assert_equal( parts[ 0 ].js(), 'title(){ return 1 }' )
			$mol_assert_equal( parts[ 0 ].css(), '[x]{ color: red }' )

			// The link is the land of the shelf, and the shelf sits at its root.
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

			// A body gone from the part is gone from the library too.
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

		/**
		 * The other side of the circle: the link is what another scene pastes into
		 * its palette field, and the stack of W3 looks the land up by it. The class
		 * comes back with its own ports and the ones of the pack class it extends.
		 */
		async 'the published library reads through the stack as a pack would'( $ ) {

			const s = store( $ )
			const link = await $mol_wire_async( s ).publish( 'Button_minor', src_button, 'title(){ return 1 }', '[x]{ color: red }' )

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

			// What the scene is sent: the three texts.
			$mol_assert_like( stack.parts(), [{
				tree: `${ klass_button } ${d}mol_view\n\ttitle \\Hi\n\tminimal true\n`,
				js: 'title(){ return 1 }',
				css: '[x]{ color: red }',
			}] )

		},

		async 'the link passes the palette field as a land and nothing else'( $ ) {

			const s = store( $ )
			const link = await $mol_wire_async( s ).publish( 'Calc', src_calc )

			const parsed = $bog_vmap_lib_links_parse( link )

			$mol_assert_equal( parsed.pack, null )
			$mol_assert_like( parsed.lands, [ link ] )
			$mol_assert_like( parsed.rejected, [] )

			// Beside a pack, as the field of the other scene will have it.
			$mol_assert_like(
				$bog_vmap_lib_links_parse( `https://mol.hyoo.ru, ${ link }` ).lands,
				[ link ],
			)

		},

		/**
		 * The pointer survives the session: a second store over the same home land,
		 * as the next page load has, finds the library and publishes into it rather
		 * than making another.
		 */
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

			// Only the first token changes.
			$mol_assert_equal(
				s.class_source( 'Button_minor', src_button ),
				`${ klass_button } ${d}mol_view\n\ttitle \\Hi\n\tminimal true\n`,
			)

		},

		/**
		 * A bare `<=`, a `<=>` or a `=` inside a part points at the document, and
		 * the library has no document: the part is refused with the names it hangs
		 * on, and nothing is made — no library, no land.
		 */
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

		/**
		 * `<= title` inside a part reads `title` of the ROOT, whatever the part
		 * overrides under the same name: published, the same line would read the
		 * class itself and mean something else. Refused as a wire, by name.
		 */
		'a reference to a name the part only overrides is still a wire to the document'( $ ) {

			const s = store( $ )
			const free = `Label ${d}mol_view\n\tsub / <= title\n\ttitle \\Hi\n`

			$mol_assert_like( s.bound_names( free ), [ 'title' ] )
			$mol_assert_ok( s.refusal( 'Label', free ).includes( 'title' ) )

		},

		/**
		 * A reference WITH kids declares its name where it stands, through `upper`:
		 * `<= Inner $mol_view …` travels with the class and resolves there. Not a
		 * wire, so the part goes out. A wire inside that sub-view is still a wire.
		 */
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

		/** A base the document itself declares stays in the document. */
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

		/**
		 * The click on a wired part: the reason lands on the bar as the note, with
		 * the name of the wire in it, and the library is not even made. A throw out
		 * of the handler would go to the fiber and never reach the user.
		 */
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

		/** After a refusal a clean part goes out, and the note follows. */
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

		/**
		 * The click, as a fiber: publishes the picked part and shows the link with a
		 * note of what went out. The link stays on the bar after the note is stale.
		 */
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
