namespace $ {

	/**
	 * Tests of the shelf model: what a ready made item leaves in the document.
	 *
	 * No DOM and no network here. The wire of the pair is checked through
	 * `links()` of the document itself rather than by reading the text, because a
	 * wire written the wrong way still reads plausibly — the five traps of section
	 * 1 all look like a wire and all build green.
	 *
	 * `d` keeps `$` out of the fixtures: mam builds its dependency graph by a
	 * regexp over sources, string literals included.
	 */
	const d = '$'

	const root_src = `${d}bog_vmap_app_shelf_test_page ${d}mol_view\n\tsub /\n`

	function doc( $: $, src = root_src ) {
		const node = $bog_vmap_lang_node.make({ $ })
		node.source( src )
		return node
	}

	/** The same free name rule the editor uses: the name, or the name with a number. */
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

			// Stored exactly as typed: growing a slash here would make an address
			// impossible to finish typing.
			$mol_assert_equal( shelf.links(), 'https://mol.hyoo.ru, https://b-on-g.github.io/gram/' )

			// One pack per frame, so the second is refused rather than dropped in
			// silence, and the refusal is on screen under the field.
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

			// What the author of the application wrote, and nothing of the framework
			// their pack carries in its bundle.
			$mol_assert_like( shelf.app_list(), [ `${d}bog_gram`, `${d}bog_gram_chat` ] )
			$mol_assert_equal( shelf.apps_title(), 'Объекты приложения' )

			// Each of them is an item like any other, and lays down the same way.
			$mol_assert_equal( shelf.item_title( `${d}bog_gram_chat` ), 'Gram_chat' )
			$mol_assert_ok( shelf.item( `${d}bog_gram_chat` )!.source.includes( `${d}bog_gram_chat` ) )

		},

		'nothing connected is a state and not a failure'( $ ) {

			const shelf = $bog_vmap_app_shelf.make({ $ }) as $$.$bog_vmap_app_shelf

			$mol_assert_like( shelf.app_list(), [] )
			$mol_assert_equal( shelf.apps_title(), 'Приложение не подключено' )

			// The shelf itself stands whatever the address does.
			$mol_assert_equal( shelf.items().length, 4 )

		},

		'the shelf offers ready made things and every one of them is a class'( $ ) {

			const items = $bog_vmap_app_shelf_presets()

			$mol_assert_like(
				items.map( item => item.id ),
				[ 'block', 'calc', 'map', 'pair' ],
			)

			for( const item of items ) {
				$mol_assert_ok( item.title )
				$mol_assert_ok( item.hint )
				// Parses as a class, or the item could never be laid down.
				$mol_assert_ok( $bog_vmap_lang_node.make({ $, source: ()=> item.source }).tree() )
			}

		},

		'a one part item leaves a declaration and a name to place'( $ ) {

			const node = doc( $ )
			const placed = $.$bog_vmap_app_shelf_apply( node, preset( 'calc' ), freer( node ) )

			$mol_assert_like( placed, [ 'Calc' ] )
			$mol_assert_like( node.part_names(), [ 'Calc' ] )

			// Placement is the canvas's business, so `sub` is untouched here.
			$mol_assert_like( node.sub_names( '' ), [] )

		},

		'overrides of a part come across'( $ ) {

			const node = doc( $ )
			$.$bog_vmap_app_shelf_apply( node, preset( 'map' ), freer( node ) )

			const style = node.over_tree( 'Map', 'style' )

			$mol_assert_equal( Boolean( style ), true )
			$mol_assert_equal( style!.toString().includes( '320px' ), true )

		},

		'the pair lands as one node holding both parts, wired'( $ ) {

			const node = doc( $ )
			const placed = $.$bog_vmap_app_shelf_apply( node, preset( 'pair' ), freer( node ) )

			// One name to place: the wrapper. Both parts hang inside it by tree.
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

			// The wrapper of the second copy holds the parts of the second copy and
			// not the first: a reference that did not follow the rename would be the
			// silent kind of wrong, drawing one calculator inside two boxes.
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

			// Exactly one property carries the `=` operator, and the far end of the
			// wire reads it. Two wires for one link, or an override left behind by
			// the copy, would show up as a second one here.
			$mol_assert_equal( node.wires().length, 1 )

			const zoom = node.over_tree( 'Map', 'zoom' )
			$mol_assert_equal( zoom?.kids[ 0 ]?.type, '<=' )
			$mol_assert_equal( zoom?.kids[ 0 ]?.kids[ 0 ]?.type, node.wires()[ 0 ].name )

		},

	})

}
