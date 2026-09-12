namespace $ {

	$mol_test({

		'the address handed in reaches the library, slash and all'( $ ) {

			const palette = $bog_vmap_app_palette.make({
				$,
				pack_link: ()=> 'https://b-on-g.github.io/gram/',
			}) as $$.$bog_vmap_app_palette

			$mol_assert_equal( palette.Lib().pack(), 'https://b-on-g.github.io/gram/' )
			$mol_assert_equal( palette.Lib().script_link(), 'https://b-on-g.github.io/gram/web.js' )

		},

		'no address gives an empty library, not a failure'( $ ) {

			const palette = $bog_vmap_app_palette.make({ $ }) as $$.$bog_vmap_app_palette

			$mol_assert_equal( palette.Lib().script_link(), '' )
			$mol_assert_like( palette.Lib().class_list(), [ '$' + 'mol_view' ] )

		},

		'a pack that does not answer says so, and says what was looked for'( $ ) {

			const palette = $bog_vmap_app_palette.make({
				$,
				pack_link: ()=> 'http://dead.test/',
				Lib: ()=> $bog_vmap_lib.make({
					$,
					pack: ()=> 'http://dead.test/',
					tree: ()=> $mol_fail( new Error( 'Not Found' ) ),
				}),
			}) as $$.$bog_vmap_app_palette

			$mol_assert_like( palette.class_list(), [] )

			const note = palette.total()
			$mol_assert_ok( note.includes( 'Not Found' ) )
			$mol_assert_ok( note.includes( 'http://dead.test/web.view.tree' ) )

		},

		'classes of the lands join the list'( $ ) {

			const d = '$'

			const palette = $bog_vmap_app_palette.make({
				$,
				land_classes: ()=> $.$mol_tree2_from_string( `${d}my_card ${d}mol_view\n\tprice 0\n` ).kids,
			}) as $$.$bog_vmap_app_palette

			$mol_assert_like( palette.Lib().class_list(), [ `${d}mol_view`, `${d}my_card` ] )
			$mol_assert_ok( [ ... palette.Lib().props_map( `${d}my_card` ).keys() ].includes( 'sub' ) )

		},

		'the list of classes is a field whose bid counts what is shown'( $ ) {

			const palette = $bog_vmap_app_palette.make({ $, compact: ()=> true }) as $$.$bog_vmap_app_palette

			const dom = palette.dom_tree()

			const classes = dom.querySelector( '[bog_vmap_app_palette_classes]' )!

			$mol_assert_ok( classes.matches( '[mol_form_field]' ) )
			$mol_assert_ok( classes.textContent!.includes( 'Классы пака' ) )
			$mol_assert_ok(
				classes.querySelector( '[mol_form_field_bid]' )!.textContent!.includes( 'классов' ),
			)
			$mol_assert_ok( classes.querySelector( '[bog_vmap_app_palette_class_row]' ) )

			$mol_assert_equal( dom.querySelector( '[bog_vmap_app_palette_ports]' ), null )

		},

		'every port is a field with its name, its declaration and the class it came from'( $ ) {

			const d = '$'

			const palette = $bog_vmap_app_palette.make({
				$,
				land_classes: ()=> $.$mol_tree2_from_string( `${d}my_card ${d}mol_view\n\tprice 0\n` ).kids,
				selected: ()=> `${d}my_card`,
			}) as $$.$bog_vmap_app_palette

			const dom = palette.dom_tree()

			const ports = [ ... dom.querySelectorAll( '[bog_vmap_app_palette_port]' ) ]

			$mol_assert_ok( ports.length > 1 )

			for( const port of ports ) $mol_assert_ok( port.matches( '[mol_form_field]' ) )

			const bid = ( el: Element )=> el.querySelector( '[mol_form_field_bid]' )!.textContent

			const own = ports.find( el => el.textContent!.includes( 'price' ) )!

			$mol_assert_ok( own )
			$mol_assert_equal( bid( own ), '' )
			$mol_assert_ok( own.textContent!.includes( '0' ) )

			const sub = ports.find( el => el.textContent!.includes( 'sub' ) )!

			$mol_assert_ok( sub )
			$mol_assert_ok( bid( sub )!.includes( `${d}mol_view` ) )

		},

	})

}
