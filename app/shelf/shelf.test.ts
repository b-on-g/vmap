namespace $ {

	const d = '$'

	const root_src = `${d}bog_vmap_app_shelf_test_page ${d}mol_view\n\tsub /\n`

	function doc( $: $, src = root_src ) {
		const node = $bog_vmap_lang_node.make({ $ })
		node.source( src )
		return node
	}

	function freer( node: $bog_vmap_lang_node ) {
		return ( head: string )=> {
			const taken = new Set( node.prop_names() )
			if( !taken.has( head ) ) return head
			for( let i = 2; ; ++i ) {
				const name = `${ head }_${ i }`
				if( !taken.has( name ) ) return name
			}
		}
	}

	function preset( id: string ) {
		return $bog_vmap_app_shelf_presets().find( item => item.id === id )!.source
	}

	$mol_test({

		'the field is stored as typed and what was refused is said under it'( $ ) {

			const shelf = $bog_vmap_app_shelf.make({ $ }) as $$.$bog_vmap_app_shelf

			shelf.links( 'https://mol.hyoo.ru, https://b-on-g.github.io/gram/' )

			$mol_assert_equal( shelf.links(), 'https://mol.hyoo.ru, https://b-on-g.github.io/gram/' )

			$mol_assert_equal(
				shelf.rejected_note(),
				'https://b-on-g.github.io/gram/: ' + $bog_vmap_lib_links_reason.pack_second,
			)
			$mol_assert_equal( shelf.source_content().includes( shelf.Note() ), true )

			shelf.links( 'https://mol.hyoo.ru' )
			$mol_assert_equal( shelf.source_content().includes( shelf.Note() ), false )

		},

		'the objects of the application are its own classes, mol left out'( $ ) {

			const d = '$'

			const shelf = $bog_vmap_app_shelf.make({
				$,
				class_list: ()=> [ `${d}mol_view`, `${d}mol_button_minor`, `${d}bog_gram`, `${d}bog_gram_chat` ],
			}) as $$.$bog_vmap_app_shelf

			$mol_assert_like( shelf.app_list(), [ `${d}bog_gram`, `${d}bog_gram_chat` ] )
			$mol_assert_equal( shelf.apps_title(), 'Объекты приложения' )

			$mol_assert_equal( shelf.item_title( `${d}bog_gram_chat` ), 'Gram_chat' )
			$mol_assert_ok( shelf.item( `${d}bog_gram_chat` )!.source.includes( `${d}bog_gram_chat` ) )

		},

		'a dead address takes down its own list and says why'( $ ) {

			const shelf = $bog_vmap_app_shelf.make({
				$,
				pack_link: ()=> 'http://dead.test/',
				class_list: ()=> $mol_fail( new Error( 'Not Found' ) ),
			}) as $$.$bog_vmap_app_shelf

			$mol_assert_like( shelf.app_list(), [] )
			$mol_assert_equal( shelf.apps_title(), 'Приложение не отвечает' )
			$mol_assert_ok( shelf.app_error().includes( 'Not Found' ) )
			$mol_assert_ok( shelf.app_error().includes( 'http://dead.test/web.view.tree' ) )
			$mol_assert_equal( shelf.apps_content().includes( shelf.Apps_note() ), true )
			$mol_assert_equal( shelf.apps_content().includes( shelf.App_list() ), false )

			$mol_assert_ok( shelf.items().length > 4 )
			$mol_assert_ok( shelf.stack_content().includes( shelf.Items() ) )

		},

		'nothing connected is a state and not a failure'( $ ) {

			const shelf = $bog_vmap_app_shelf.make({ $ }) as $$.$bog_vmap_app_shelf

			$mol_assert_like( shelf.app_list(), [] )
			$mol_assert_equal( shelf.apps_title(), 'Приложение не подключено' )

			$mol_assert_ok( shelf.items().length > 4 )

		},

		'the shelf is cut down to what the pack at hand can build'( $ ) {

			const shelf = ( classes: readonly string[] )=> $$.$bog_vmap_app_shelf.make({
				$,
				pack_link: ()=> 'https://pack.test/',
				pack_classes: ()=> classes,
			})

			const ids = ( one: $$.$bog_vmap_app_shelf )=> one.items().map( item => item.id )

			const rich = ids( shelf([
				`${d}mol_view`, `${d}mol_string`, `${d}mol_number`,
				`${d}bog_vmap_part_calc`, `${d}bog_vmap_part_map`,
			]) )

			const poor = ids( shelf([ `${d}mol_view`, `${d}mol_string` ]) )

			$mol_assert_equal( rich.includes( 'calc' ), true )
			$mol_assert_equal( rich.includes( 'pair' ), true )
			$mol_assert_equal( rich.includes( 'input_number' ), true )

			$mol_assert_equal( poor.includes( 'calc' ), false )
			$mol_assert_equal( poor.includes( 'pair' ), false )
			$mol_assert_equal( poor.includes( 'input_number' ), false )

			$mol_assert_equal( poor.includes( 'block' ), true )
			$mol_assert_equal( poor.includes( 'input_string' ), true )

		},

		'until the pack answers the shelf keeps offering everything'( $ ) {

			const shelf = $$.$bog_vmap_app_shelf.make({
				$,
				pack_link: ()=> 'https://pack.test/',
				pack_classes: ()=> $mol_fail( new Error( 'Not Found' ) ),
			})

			$mol_assert_equal( shelf.items().length, $bog_vmap_app_shelf_presets().length )

		},

		'a preset asks for every class its source names but its own head'( $ ) {

			$mol_assert_like(
				$.$bog_vmap_app_shelf_needs( preset( 'calc' ) ),
				[ `${d}mol_view`, `${d}bog_vmap_part_calc` ],
			)

		},

		'files of a module give one source per class, as their author wrote them'( $ ) {

			const text = [
				`${d}my_card ${d}mol_view`,
				`\tprice 0`,
				`${d}my_price ${d}my_card`,
				`\tprice 42`,
				``,
			].join( '\n' )

			const taken = $.$bog_vmap_app_shelf_intake([
				{ name: 'card.view.tree', text },
				{ name: 'card.view.css', text: '[my_card] { color: red }' },
			])

			$mol_assert_equal( taken.classes.length, 2 )
			$mol_assert_ok( taken.classes[ 0 ].tree.startsWith( `${d}my_card ${d}mol_view` ) )
			$mol_assert_ok( taken.classes[ 1 ].tree.includes( `${d}my_price ${d}my_card` ) )
			$mol_assert_like( taken.refused, [] )

			$mol_assert_equal( taken.classes[ 0 ].css, '[my_card] { color: red }' )
			$mol_assert_equal( taken.classes[ 1 ].css, '' )

		},

		'what cannot be taken is refused by name, with the reason on screen'( $ ) {

			const taken = $.$bog_vmap_app_shelf_intake([
				{ name: 'card.view.ts', text: 'namespace $ {}' },
				{ name: 'web.view.tree', text: `${d}mol_view ${d}mol_object\n` },
				{ name: 'empty.view.tree', text: '- just a comment\n' },
				{ name: 'card.view.css.ts', text: 'namespace $ {}' },
			])

			$mol_assert_like( taken.classes, [] )
			$mol_assert_like(
				taken.refused.map( item => item.reason ),
				[
					$bog_vmap_app_shelf_refuse.kind,
					$bog_vmap_app_shelf_refuse.built,
					$bog_vmap_app_shelf_refuse.empty,
					$bog_vmap_app_shelf_refuse.kind,
				],
			)

			$mol_assert_ok( $bog_vmap_app_shelf_intake_note( taken ).includes( 'card.view.ts' ) )

		},

		async 'a class brought from a file keeps the name it came with'( $ ) {

			const store = $bog_vmap_app_publish_store.make({
				$,
				shelf_land_config: ()=> $.$giper_baza_glob.home().land(),
			})

			const source = `${d}my_card ${d}mol_view\n\tprice 0\n`

			const link = await $mol_wire_async( store ).import_class( source )

			const shelf = store.shelf()!

			$mol_assert_equal( link, shelf.land().link().str )
			$mol_assert_equal( shelf.parts().length, 1 )

			$mol_assert_equal( shelf.parts()[ 0 ].tree(), source )

			await $mol_wire_async( store ).import_class( `${d}my_card ${d}mol_view\n\tprice 42\n` )

			$mol_assert_equal( shelf.parts().length, 1 )
			$mol_assert_ok( shelf.parts()[ 0 ].tree().includes( 'price 42' ) )

		},

		async 'files brought to the panel end up in the library, whose link joins the field'( $ ) {

			const shelf = $bog_vmap_app_shelf.make({
				$,
				Store: ()=> $bog_vmap_app_publish_store.make({
					$,
					shelf_land_config: ()=> $.$giper_baza_glob.home().land(),
				}),
			}) as $$.$bog_vmap_app_shelf

			const source = `${d}my_card ${d}mol_view\n\tprice 0\n`

			await $mol_wire_async( shelf ).intake([
				{ name: 'card.view.tree', text: async ()=> source },
				{ name: 'card.view.css', text: async ()=> '[my_card] { color: red }' },
				{ name: 'card.view.ts', text: async ()=> 'namespace $ {}' },
			])

			const parts = shelf.Store().shelf()!.parts()
			$mol_assert_equal( parts.length, 1 )
			$mol_assert_equal( parts[ 0 ].tree(), `${d}my_card ${d}mol_view price 0\n` )
			$mol_assert_equal( parts[ 0 ].css(), '[my_card] { color: red }' )

			$mol_assert_equal( shelf.links(), shelf.Store().link() )

			$mol_assert_ok( shelf.import_note().includes( 'card.view.ts' ) )
			$mol_assert_ok( shelf.source_content().includes( shelf.Import_note() ) )

		},

		'a declaration that names no class is refused before anything is written'( $ ) {

			const store = $bog_vmap_app_publish_store.make({
				$,
				shelf_land_config: ()=> $.$giper_baza_glob.home().land(),
			})

			$mol_assert_fail(
				()=> store.import_class( `card ${d}mol_view\n` ),
				'Объявление начинается с "card", а имя класса начинается с доллара',
			)
			$mol_assert_equal( store.shelf(), null )

		},

		'the shelf offers ready made things and every one of them is a class'( $ ) {

			const items = $bog_vmap_app_shelf_presets()

			$mol_assert_like(
				items.map( item => item.id ),
				[
					'block', 'cell', 'plot', 'calc', 'map', 'pair',
					'input_string', 'input_number', 'input_select',
					'input_switch', 'input_check_box', 'input_paragraph',
				],
			)

			for( const item of items ) {
				$mol_assert_ok( item.title )
				$mol_assert_ok( item.hint )
				$mol_assert_ok( $bog_vmap_lang_node.make({ $, source: ()=> item.source }).tree() )
			}

		},

		'a one part item leaves a declaration and a name to place'( $ ) {

			const node = doc( $ )
			const placed = $.$bog_vmap_app_shelf_apply( node, preset( 'calc' ), freer( node ) )

			$mol_assert_like( placed, [ 'Calc' ] )
			$mol_assert_like( node.part_names(), [ 'Calc' ] )

			$mol_assert_like( node.sub_names( '' ), [] )

		},

		'overrides of a part come across'( $ ) {

			const node = doc( $ )
			$.$bog_vmap_app_shelf_apply( node, preset( 'block' ), freer( node ) )

			const style = node.over_tree( 'Block', 'style' )

			$mol_assert_equal( Boolean( style ), true )
			$mol_assert_equal( style!.toString().includes( '160px' ), true )

		},

		'the pair lands as one node holding both parts, wired'( $ ) {

			const node = doc( $ )
			const placed = $.$bog_vmap_app_shelf_apply( node, preset( 'pair' ), freer( node ) )

			$mol_assert_like( placed, [ 'Pair' ] )
			$mol_assert_like( node.sub_names( 'Pair' ), [ 'Calc', 'Map' ] )

			const links = node.links()

			$mol_assert_equal( links.length, 1 )
			$mol_assert_equal( links[ 0 ].from, 'Calc' )
			$mol_assert_equal( links[ 0 ].from_prop, 'result' )
			$mol_assert_equal( links[ 0 ].to, 'Map' )
			$mol_assert_equal( links[ 0 ].to_prop, 'zoom' )

		},

		'a second copy takes free names, and its wire and its tree follow them'( $ ) {

			const node = doc( $ )

			$.$bog_vmap_app_shelf_apply( node, preset( 'pair' ), freer( node ) )
			const placed = $.$bog_vmap_app_shelf_apply( node, preset( 'pair' ), freer( node ) )

			$mol_assert_like( placed, [ 'Pair_2' ] )

			$mol_assert_like( node.sub_names( 'Pair_2' ), [ 'Calc_2', 'Map_2' ] )

			const links = node.links()

			$mol_assert_equal( links.length, 2 )
			$mol_assert_like(
				links.map( link => [ link.from, link.to ] ),
				[ [ 'Calc', 'Map' ], [ 'Calc_2', 'Map_2' ] ],
			)

		},

		'a class of the library lays down under a name of its own'( $ ) {

			const node = doc( $ )
			const source = $bog_vmap_app_shelf_single( `${d}mol_button_minor` )

			const placed = $.$bog_vmap_app_shelf_apply( node, source, freer( node ) )

			$mol_assert_like( placed, [ 'Button_minor' ] )
			$mol_assert_equal(
				node.prop_decl( 'Button_minor' )?.kids[ 0 ]?.type,
				`${d}mol_button_minor`,
			)

		},

		'the wire is written once, by the model, and not copied as an override'( $ ) {

			const node = doc( $ )
			$.$bog_vmap_app_shelf_apply( node, preset( 'pair' ), freer( node ) )

			$mol_assert_equal( node.wires().length, 1 )

			const zoom = node.over_tree( 'Map', 'zoom' )
			$mol_assert_equal( zoom?.kids[ 0 ]?.type, '<=' )
			$mol_assert_equal( zoom?.kids[ 0 ]?.kids[ 0 ]?.type, node.wires()[ 0 ].name )

		},

		'the second level replaces the shelf instead of stacking under it'( $ ) {

			const shelf = $bog_vmap_app_shelf.make({ $ }) as $$.$bog_vmap_app_shelf

			const own_scrolls = ()=> shelf.body().filter( view => view instanceof $mol_scroll ).length

			$mol_assert_equal( shelf.classes_showed(), false )
			$mol_assert_equal( shelf.body().includes( shelf.Stack() ), true )
			$mol_assert_equal( shelf.body().includes( shelf.Palette() ), false )
			$mol_assert_equal( own_scrolls(), 1 )

			shelf.classes_showed( true )

			$mol_assert_equal( shelf.body().includes( shelf.Stack() ), false )
			$mol_assert_equal( shelf.body().includes( shelf.Palette() ), true )
			$mol_assert_equal( own_scrolls(), 0 )

		},

		'swapping the pack keeps the lands and drops only the old address'( $ ) {

			const swap = $bog_vmap_app_shelf_pack_swap
			const one = 'https://one.pack/'
			const two = 'https://two.pack/'
			const land = 'aaaaaaaa_bbbbbbbb'

			$mol_assert_equal( swap( '', one ), one )
			$mol_assert_equal( swap( one, two ), two )
			$mol_assert_equal( swap( `${ one }, ${ land }`, two ), `${ two }, ${ land }` )
			$mol_assert_equal( swap( `${ land }, ${ one }`, two ), `${ two }, ${ land }` )
			$mol_assert_equal( swap( `${ one }, ${ land }`, '' ), land )
			$mol_assert_equal( swap( land, '' ), land )

		},

		'every pack the shelf offers names itself and points at a folder'( $ ) {

			const offers = $bog_vmap_app_shelf_packs()

			$mol_assert_equal( offers.length, new Set( offers.map( one => one.id ) ).size )

			for( const offer of offers ) {
				$mol_assert_ok( offer.title )
				$mol_assert_ok( offer.hint )
				if( offer.link ) $mol_assert_equal( offer.link.endsWith( '/' ), true )
			}

		},

	})

}
