namespace $ {

	/**
	 * The editor from the user's side: real clicks on real elements of a rendered
	 * DOM, one scenario per test.
	 *
	 * These are not tests of methods. Every step is what a person does — press a
	 * palette row, drag onto the canvas, type into a field, click a button — and
	 * what is checked is where it leaves the document, the panels and the scene.
	 * The stand and everything it fakes are in `flow_stage.test.ts`.
	 *
	 * `d` keeps `$` out of the string literals — mam builds its dependency graph by
	 * a regexp over sources, literals included.
	 */
	const d = '$'

	const calc = `${d}flow_calc`
	const map = `${d}flow_map`
	const button = `${d}flow_button`

	$mol_test({

		/**
		 * The editor opens: the head bar, the palette of the pack, the canvas and
		 * the invitation in the properties panel. The pack is a fixture and the
		 * network is fenced off — a fetch of anything else throws by name.
		 */
		'the editor opens with its bar, its palette and its canvas'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			// The bar: everything the scenarios below press.
			stage.button( 'Новая сцена' )
			stage.button( '−' )
			stage.button( '+' )
			stage.button( 'Сбросить вид' )
			stage.button( 'Удалить' )
			stage.button( 'В библиотеку' )

			const text = stage.text()
			$mol_assert_ok( text.includes( 'Полка' ) )
			$mol_assert_ok( text.includes( 'Свойства' ) )
			$mol_assert_ok( text.includes( '100%' ) )
			$mol_assert_ok( text.includes( 'Выберите узел на холсте' ) )

			// The panel opens on ready made things, not on a catalogue of classes.
			const shelf = [ ... stage.root.querySelectorAll(
				'[bog_vmap_app_shelf_items] [bog_vmap_app_shelf_item_row]',
			) ].map( el => el.textContent )

			$mol_assert_like( shelf, [ 'Блок', 'Калькулятор', 'Карта', 'Калькулятор и карта' ] )

			// Under them, the objects of the connected application: what its author
			// declared, by their own names and without a line of mol among them.
			const apps = [ ... stage.root.querySelectorAll(
				'[bog_vmap_app_shelf_app_list] [bog_vmap_app_shelf_item_row]',
			) ].map( el => el.textContent )

			$mol_assert_like( apps, [ 'Button', 'Calc', 'Map' ] )

			// The classes of the pack are a level down, folded away until asked for,
			// and then they are all there, the `$mol_view` stub included.
			$mol_assert_equal( stage.root.querySelector( '[bog_vmap_app_palette_class_row]' ), null )

			stage.classes_open()

			const rows = [ ... stage.root.querySelectorAll( '[bog_vmap_app_palette_class_row]' ) ]
				.map( el => el.textContent )

			$mol_assert_like( rows, [ `${d}mol_view`, button, calc, map ] )

			// Nothing failed to draw except the frame, which stays suspended for
			// ever: jsdom never loads the sandbox page, so its `onload` never fires.
			$mol_assert_like( stage.broken(), [ stage.pane.Scene( stage.pane.scene_key() ).dom_id() ] )

		},

		/**
		 * The point of the shelf: a wired pair arrives whole, by one gesture.
		 *
		 * A wire is the thing nobody guesses on their own, so the shelf carries an
		 * example of one already drawn. What lands is checked in the DOCUMENT and
		 * not by eye: a wire written the wrong way still reads plausibly, and all
		 * five traps of section 1 build green.
		 */
		'a ready made pair lands wired, by one click on the shelf'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.click( stage.shelf_row( 'Калькулятор и карта' ) )

			const node = stage.app.node()

			// Both parts and the box holding them, and the box is what lies on the
			// canvas: one thing to move, not two.
			$mol_assert_like( node.sub_names( '' ), [ 'Pair' ] )
			$mol_assert_like( node.sub_names( 'Pair' ), [ 'Calc', 'Map' ] )
			$mol_assert_like( Object.keys( stage.app.spots() ), [ 'Pair' ] )

			// The wire, from the result of the calculator into the zoom of the map.
			const links = node.links()
			$mol_assert_equal( links.length, 1 )
			$mol_assert_like(
				[ links[ 0 ].from, links[ 0 ].from_prop, links[ 0 ].to, links[ 0 ].to_prop ],
				[ 'Calc', 'result', 'Map', 'zoom' ],
			)

			// The scene compiles what the document says, byte for byte.
			$mol_assert_equal( stage.scene.last( 'doc_set' )!.src, stage.app.doc_source() )

			// Picked by the drop itself, as a dragged part is.
			$mol_assert_equal( stage.app.selected(), 'Pair' )

		},

		/**
		 * An application is added by its address, and its own objects are on the
		 * shelf right after.
		 *
		 * Nothing is asked of whoever deployed it: a mol module carries the tree of
		 * its classes beside its bundle, so any deployed application is a library
		 * already. What the shelf shows is what its author wrote, without the
		 * framework the bundle carries along.
		 */
		'an application added by its address puts its objects on the shelf'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.type( stage.field( 'Shelf().Links()' ), $bog_vmap_app_flow_other )

			// The frame is a new one — a realm cannot unload a bundle — and it boots.
			stage.scene.hello()

			const apps = [ ... stage.root.querySelectorAll(
				'[bog_vmap_app_shelf_app_list] [bog_vmap_app_shelf_item_row]',
			) ].map( el => el.textContent )

			$mol_assert_like( apps, [ 'Basket' ] )

			// And an object of somebody else's application lies down like any other.
			stage.click( stage.shelf_row( 'Basket' ) )

			$mol_assert_ok( stage.app.doc_source().includes( `Basket ${d}shop_basket` ) )
			$mol_assert_equal( stage.app.selected(), 'Basket' )

		},

		/**
		 * A component is carried out of the palette onto the canvas: it is declared,
		 * placed, picked on the spot — the properties panel is open on it without a
		 * second gesture — and a click on it goes on to the live component as well.
		 */
		'a class carried from the palette becomes a part, picked and ready to press'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )

			// One declaration and one reference, and the placement beside them.
			const source = stage.app.doc_source()
			$mol_assert_ok( source.includes( `Calc ${ calc }` ) )
			$mol_assert_ok( source.includes( '<= Calc' ) )
			$mol_assert_like( stage.app.spots(), { Calc: { x: 200, y: 150 } } )

			// The scene compiles what the document says, byte for byte.
			$mol_assert_equal( stage.scene.last( 'doc_set' )!.src, source )

			// Picked by the drop itself: the ring is on the canvas and the inspector
			// is on the part, with the ports of its class in it.
			$mol_assert_equal( stage.app.selected(), 'Calc' )
			$mol_assert_ok( stage.root.querySelector( '[bog_vmap_app_pane_handle]' ) !== null )
			stage.field( "Row('result').Value().Number().Num()" )

			// A click on the part keeps the pick and goes on to the live component.
			stage.tap( stage.part_center( 'Calc' ) )

			$mol_assert_equal( stage.app.selected(), 'Calc' )

			const click = stage.scene.last( 'click_at' )!
			$mol_assert_equal( click.x, 250 )
			$mol_assert_equal( click.y, 175 )

		},

		/**
		 * A property typed into the inspector lands in the document as the line of
		 * that property, and the scene is handed the document again.
		 */
		'a value typed into the inspector goes into the document and to the scene'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			stage.tap( stage.part_center( 'Calc' ) )

			const before = stage.scene.sent( 'doc_set' ).length

			stage.type( stage.field( "Row('result').Value().Number().Num()" ), '42' )

			const source = stage.app.doc_source()
			$mol_assert_ok( source.includes( `Calc ${ calc } result 42` ) )

			// The neighbouring lines are untouched: one property moved, not the class.
			$mol_assert_ok( source.includes( '<= Calc' ) )

			$mol_assert_ok( stage.scene.sent( 'doc_set' ).length > before )
			$mol_assert_equal( stage.scene.last( 'doc_set' )!.src, source )

		},

		/**
		 * A wire drawn by hand: from the output dot of one part to the input dot of
		 * another. Two lines go into the document, unplugging takes both away, and
		 * the value the scene reports is shown on the wire.
		 */
		'a wire drawn between two parts is written, labelled and unplugged'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 100, 100 ]) )
			stage.drop( map, stage.client([ 400, 100 ]) )
			stage.tap( stage.part_center( 'Calc' ) )

			const overlay = stage.overlay()
			const out = stage.port_dot( 'Calc', 'result', 'out' )
			const into = stage.port_dot( 'Map', 'zoom', 'in' )

			stage.press( overlay, out )
			stage.move( overlay, into )
			stage.release( overlay, into )
			stage.redraw()

			const source = stage.app.doc_source()
			$mol_assert_ok( source.includes( '\tcalc_result = Calc result\n' ) )
			$mol_assert_ok( source.includes( 'zoom <= calc_result' ) )

			// The host asks the scene for the value of the wire it now draws.
			stage.scene.flush()
			$mol_assert_like( stage.scene.last( 'values_want' )!.names, [ 'calc_result' ] )

			stage.scene.values({ calc_result: '42' })
			$mol_assert_like(
				stage.pane.wire_lines().map( line => [ line.key, line.label ] ),
				[ [ 'Map.zoom', '42' ] ],
			)

			// A press on the wired input pulls the wire out; let go over bare canvas
			// and both lines are gone from the document.
			stage.tap( stage.part_center( 'Map' ) )
			stage.press( overlay, stage.port_dot( 'Map', 'zoom', 'in' ) )
			stage.release( overlay, stage.client([ 550, 450 ]) )
			stage.redraw()

			const after = stage.app.doc_source()
			$mol_assert_equal( after.includes( 'calc_result' ), false )
			$mol_assert_like( stage.app.doc_wires(), [] )

		},

		/**
		 * The whole point of publishing: a part goes out as a class of the library,
		 * its link goes into the palette field of a scene, and it is a component
		 * again — droppable like any other.
		 *
		 * The library land is the home land here, so no proof of work, as in
		 * `publish/publish.test.ts`. The link is resolved by the real stack through
		 * the real database.
		 */
		async 'a published part comes back through the palette field'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			const library = $bog_vmap_app_publish_store.make({
				$,
				shelf_land_config: ()=> $.$giper_baza_glob.home().land(),
			})
			stage.app.Publish().store = ()=> library

			stage.drop( button, stage.client([ 200, 150 ]) )
			stage.tap( stage.part_center( 'Button' ) )

			stage.click( stage.button( 'В библиотеку' ) )

			// Publishing encodes units, which is asynchronous even without the proof
			// of work; the click hands it to a fiber and answers at once.
			const link = await $bog_vmap_app_flow_settle( ()=> library.link() )
			stage.redraw()

			$mol_assert_ok( link )
			$mol_assert_ok( stage.text().includes( 'опубликовано' ) )
			$mol_assert_ok( stage.text().includes( link ) )

			stage.type( stage.field( 'Shelf().Links()' ), link )

			$mol_assert_like( stage.app.lands(), [ link ] )
			$mol_assert_like(
				stage.app.lib_classes().map( tree => tree.type ),
				[ `${d}bog_vmap_pub_button` ],
			)

			// In the palette beside the classes of the pack, and it drops like them.
			stage.drop( `${d}bog_vmap_pub_button`, stage.client([ 400, 300 ]) )

			$mol_assert_ok( stage.app.doc_source().includes( ` ${d}bog_vmap_pub_button\n` ) )
			$mol_assert_equal( Object.keys( stage.app.spots() ).length, 2 )

		},

		/**
		 * A second scene is a document of its own: made from the bar, it opens
		 * empty, and going back brings the first one with everything on it.
		 */
		async 'a second scene is a document of its own and the first one comes back'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			const first = stage.store.doc_current()!.link().str
			const source = stage.app.doc_source()

			stage.click( stage.button( 'Новая сцена' ) )

			// The store makes the document in a fiber of its own, as the click does.
			await $bog_vmap_app_flow_settle( ()=> stage.store.doc_links().length > 1 )
			stage.redraw()

			$mol_assert_equal( stage.store.doc_links().length, 2 )
			$mol_assert_ok( stage.store.doc_current()!.link().str !== first )
			$mol_assert_equal( stage.app.doc_source(), `${ stage.app.doc_root() } ${d}mol_view\n\tsub /\n` )
			$mol_assert_like( stage.app.spots(), {} )

			// Back to the first one, by the same value the picker of the bar writes.
			const scenes = stage.app.Scenes() as $$.$bog_vmap_app_scenes
			scenes.current( first )
			stage.redraw()

			$mol_assert_equal( stage.app.doc_source(), source )
			$mol_assert_like( stage.app.spots(), { Calc: { x: 200, y: 150 } } )

		},

		/**
		 * The sandbox is raised from markup, not from an address: there is exactly
		 * one page in the project and the sandbox is not it.
		 *
		 * What the markup has to carry is checked here rather than argued: the
		 * isolation, the absence of any address, and an ABSOLUTE address of the
		 * bundle — an opaque origin has no base to resolve a relative one against.
		 */
		'the frame is raised from markup and carries no address'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )
			const frame = stage.frame()

			$mol_assert_equal( frame.getAttribute( 'sandbox' ), 'allow-scripts' )
			$mol_assert_equal( frame.hasAttribute( 'src' ), false )

			const html = frame.getAttribute( 'srcdoc' ) ?? ''
			const bundle = stage.app.scene_bundle()

			$mol_assert_ok( bundle.endsWith( '/scene/web.js' ) )
			$mol_assert_ok( html.includes( `src="${ bundle }"` ) )

			// the frame paints its own ground, see `scene_html()`
			$mol_assert_ok( html.includes( 'color-scheme:dark' ) )

		},

		/**
		 * The pack travels the bridge, and it travels FIRST.
		 *
		 * The scene compiles nothing until it has been told a pack, because a class
		 * picks its base once and a document built a moment early would inherit the
		 * sandbox's own `$mol_view` for good. So the order of the first three
		 * messages of a handshake is part of the contract, not an accident of how
		 * the cells happen to be listed.
		 */
		'the pack goes down the wire before the document and the libraries'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			const kinds = stage.scene.posted.map( message => message.kind )
			const pack = kinds.indexOf( 'pack_set' )

			$mol_assert_ok( pack >= 0 )
			$mol_assert_ok( pack < kinds.indexOf( 'doc_set' ) )
			$mol_assert_ok( pack < kinds.indexOf( 'libs_set' ) )

			$mol_assert_equal( stage.scene.last( 'pack_set' )?.uri, stage.app.pack_script() )

		},

		/**
		 * One pack per frame, held by construction now that no address holds it: the
		 * pack is part of the key of the frame, so naming another one gives a new
		 * element and a realm that has never seen the first bundle. A land is
		 * compiled into the sandbox instead, so a change of lands must not cost the
		 * frame, its camera or its live instances.
		 * @see ../ARCHITECTURE.md section 5
		 */
		'a new pack gives a new frame, a new land keeps the old one'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )
			const field = stage.field( 'Shelf().Links()' )

			const before = stage.frame()

			stage.type( field, 'http://pack.test/, AbCdEfGh' )
			$mol_assert_ok( stage.frame() !== before )
			$mol_assert_like( stage.app.lands(), [ 'AbCdEfGh' ] )

			// the fresh frame has proved nothing yet, so nothing is pushed at it
			$mol_assert_equal( stage.pane.ready(), false )

			// it boots and gets the new pack first, exactly as the first one did
			const seen = stage.scene.posted.length
			stage.scene.hello()

			$mol_assert_equal( stage.pane.ready(), true )
			$mol_assert_equal( stage.scene.posted[ seen ]?.kind, 'pack_set' )
			$mol_assert_equal( stage.scene.last( 'pack_set' )?.uri, 'http://pack.test/web.js' )

			// a land rides the bridge, so the frame stands
			const kept = stage.frame()
			stage.type( field, 'http://pack.test/, AbCdEfGh, ZyXwVuTs' )

			$mol_assert_equal( stage.frame(), kept )
			$mol_assert_like( stage.app.lands(), [ 'AbCdEfGh', 'ZyXwVuTs' ] )

		},

		/**
		 * A change of pack must not be mistaken for a scene that died.
		 *
		 * The frame is replaced, and the new one then spends the whole cold load of
		 * the pack saying nothing — 610 ms in the measurement of section 4, and much
		 * worse on a slow line, against a watchdog limit of eight seconds. Two things
		 * therefore have to hold across the swap, and they are checked apart because
		 * they fail apart.
		 *
		 * NOTHING IS PUSHED at a window that has not booted. A push into a frame
		 * still loading is lost silently, and the host would never learn that the
		 * document it thinks it sent was never received.
		 *
		 * THE WATCH DOES NOT ARM. `warmed` is still true from the frame that just
		 * went, so an armed watch here would accuse a perfectly healthy scene of
		 * being stuck and offer to reload the very thing that is loading. This is
		 * held by the handshake being kept per frame, not per pane.
		 */
		'a change of pack raises no false alarm about the scene'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )
			const watch = ()=> stage.timers.filter( timer => timer.delay === stage.pane.answer_limit() ).length

			// real traffic first, so the scene has proved itself and the pulse is on
			stage.drop( calc, stage.client([ 200, 150 ]) )
			$mol_assert_equal( stage.pane.warmed(), true )

			const sent = stage.scene.posted.length
			const armed = watch()

			stage.type( stage.field( 'Shelf().Links()' ), 'http://pack.test/' )

			// a frame that has said nothing, and nothing said to it
			$mol_assert_equal( stage.pane.ready(), false )
			$mol_assert_equal( stage.scene.posted.length, sent )

			// and no claim made about its silence
			$mol_assert_equal( stage.pane.watchdog(), null )
			$mol_assert_equal( watch(), armed )
			$mol_assert_equal( stage.pane.stalled(), false )
			$mol_assert_equal( stage.text().includes( 'Сцена не отвечает' ), false )

			// it boots, and only then does anything go out — the pack first
			stage.scene.hello()

			$mol_assert_equal( stage.pane.ready(), true )
			$mol_assert_equal( stage.scene.posted[ sent ]?.kind, 'pack_set' )
			$mol_assert_equal( stage.scene.posted[ sent ]?.uri, 'http://pack.test/web.js' )

		},

		/**
		 * The palette field takes a pack and lands together, and refuses a second
		 * pack out loud: the reason is under the field and the frame keeps the pack
		 * it already loaded.
		 */
		'the palette field takes a pack with lands and says why it refuses a second'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			const field = stage.field( 'Shelf().Links()' )
			stage.type( field, 'http://pack.test/, AbCdEfGh' )

			$mol_assert_equal( stage.app.pack_link(), 'http://pack.test/' )
			$mol_assert_like( stage.app.lands(), [ 'AbCdEfGh' ] )

			const key = stage.pane.scene_key()
			$mol_assert_equal( stage.pane.pack_uri(), 'http://pack.test/web.js' )

			stage.type( field, 'http://pack.test/, AbCdEfGh, http://other.test/' )

			// The refusal is on screen, in the user's words, under the field.
			$mol_assert_ok( stage.text().includes( $bog_vmap_lib_links_reason.pack_second ) )
			$mol_assert_ok( stage.text().includes( 'http://other.test/' ) )

			// The frame is the one it already was: no reload.
			$mol_assert_equal( stage.pane.scene_key(), key )
			$mol_assert_equal( stage.field( 'Shelf().Links()' ).value, 'http://pack.test/, AbCdEfGh, http://other.test/' )

		},

		/**
		 * The delete button takes the picked part out of the document, and the
		 * camera cannot touch the document at all: panning and zooming leave the
		 * text byte for byte where it was.
		 */
		'delete takes the part out, and the camera leaves the document alone'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 100, 100 ]) )
			stage.drop( map, stage.client([ 300, 100 ]) )
			stage.tap( stage.part_center( 'Calc' ) )

			stage.click( stage.button( 'Удалить' ) )

			const source = stage.app.doc_source()
			$mol_assert_equal( source.includes( 'Calc' ), false )
			$mol_assert_ok( source.includes( `Map ${ map }` ) )
			$mol_assert_equal( stage.app.selected(), null )
			$mol_assert_like( Object.keys( stage.app.spots() ), [ 'Map' ] )

			// A drag over bare canvas is a pan…
			const overlay = stage.overlay()
			stage.press( overlay, stage.client([ 450, 400 ]) )
			stage.move( overlay, stage.client([ 500, 430 ]) )
			stage.release( overlay, stage.client([ 500, 430 ]) )
			stage.redraw()

			$mol_assert_like( [ ... stage.pane.camera_shift() ], [ 50, 30 ] )

			// …and the buttons of the bar are the zoom.
			stage.click( stage.button( '+' ) )
			$mol_assert_ok( stage.text().includes( '125%' ) )

			stage.click( stage.button( 'Сбросить вид' ) )
			$mol_assert_ok( stage.text().includes( '100%' ) )
			$mol_assert_like( [ ... stage.pane.camera_shift() ], [ 0, 0 ] )

			$mol_assert_equal( stage.app.doc_source(), source )

		},

		/**
		 * The artboard from the user's side: a page is put on the canvas, two parts
		 * are dropped INTO it and go into its tree instead of onto the desk, and the
		 * direction switch of the inspector decides how they stack — including where
		 * the next drop goes in.
		 */
		'a page takes the parts dropped into it and stacks them the way it is set'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.click( stage.button( 'Артборд' ) )

			// Nothing marks a page as one: it is a view with a `sub` of its own.
			$mol_assert_equal( stage.app.selected(), 'Page' )

			const node = stage.app.node()
			$mol_assert_like( node.sub_names( 'Page' ), [] )

			const page = stage.pane.part_box( 'Page' )!
			$mol_assert_ok( page )

			// Dropped inside the page, both go into its tree and neither takes a
			// coordinate: on the desk only the page itself lies.
			stage.drop( calc, stage.client([ page.left + 200, page.top + 40 ]) )
			stage.drop( map, stage.client([ page.left + 200, page.top + 250 ]) )

			$mol_assert_like( node.sub_names( 'Page' ), [ 'Calc', 'Map' ] )
			$mol_assert_like( Object.keys( stage.app.spots() ), [ 'Page' ] )
			$mol_assert_equal( stage.app.doc_source().includes( '\t\tsub /\n\t\t\t<= Calc\n\t\t\t<= Map\n' ), true )

			// The page is picked again by a click on the empty part of it.
			stage.tap( stage.client([ page.left + 200, page.top + 250 ]) )
			$mol_assert_equal( stage.app.selected(), 'Page' )

			// The layout panel of the inspector turns the column into a row.
			stage.click( stage.check( 'рядом' ) )

			$mol_assert_ok( stage.app.doc_source().includes( 'flexDirection \\row' ) )
			$mol_assert_equal( stage.scene.last( 'doc_set' )!.src, stage.app.doc_source() )

			const first = stage.pane.part_box( 'Calc' )!
			const second = stage.pane.part_box( 'Map' )!
			$mol_assert_equal( first.top, second.top )
			$mol_assert_ok( second.left > first.left )

			// And the next drop is aimed by the same row: to the left of both is first.
			stage.drop( button, stage.client([ page.left + 20, page.top + 20 ]) )
			$mol_assert_like( node.sub_names( 'Page' ), [ 'Button', 'Calc', 'Map' ] )

		},

		/**
		 * A document opened by a link lives in a land of its own, and until that
		 * land arrives every read of it suspends. THE SANDBOX MUST COME UP ANYWAY:
		 * the markup of the frame is not the document's business, and an editor that
		 * waits for the text before it raises the frame waits for ever on a document
		 * whose master is not reachable — which is what «ожидание сцены…» was.
		 */
		'the sandbox comes up while the document of the address is still on its way'( $ ) {

			// Every read of the open document suspends, as an unsynced land does.
			const waiting = new Promise( ()=> {} )
			const store = $bog_vmap_app_store.make({
				$,
				doc_land_config: ()=> null,
				source: ()=> { throw waiting },
				spots: ()=> { throw waiting },
				pack: ()=> { throw waiting },
			})

			const stage = $bog_vmap_app_flow_stage( $, { store } )

			// The frame has its markup, so the scene boots and answers.
			$mol_assert_ok( stage.frame().getAttribute( 'srcdoc' ) )
			$mol_assert_equal( stage.pane.ready(), true )

			// The complaint itself: the head bar no longer says it is waiting.
			$mol_assert_equal( stage.text().includes( 'ожидание сцены' ), false )

			// The palette of the document is unknown, so the standard one stands in
			// and is on screen rather than suspended.
			$mol_assert_equal( stage.app.links(), '' )
			stage.classes_open()
			stage.class_row( calc )

		},

		/**
		 * A scene that stopped answering is called out on a strip of its own, and
		 * the button on it replaces the frame rather than talking to the stuck one.
		 *
		 * Time is the test's own: the timers of the stand never fire by themselves,
		 * so the watchdog is asked to fire the moment its limit would have run out.
		 */
		'a silent scene raises the strip and the button gives a fresh frame'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			$mol_assert_equal( stage.pane.stalled(), false )

			const frame = stage.frame()

			stage.scene.silence()

			// Something is pushed and never answered.
			stage.click( stage.button( '+' ) )

			const watch = stage.timers.filter( timer => timer.delay === stage.pane.answer_limit() ).at( -1 )!
			$mol_assert_ok( watch )

			watch.task()
			stage.redraw()

			$mol_assert_equal( stage.pane.stalled(), true )
			$mol_assert_ok( stage.text().includes( 'Сцена не отвечает' ) )

			stage.click( stage.button( 'Перезагрузить сцену' ) )

			$mol_assert_equal( stage.pane.stalled(), false )
			$mol_assert_equal( stage.pane.ready(), false )
			$mol_assert_equal( stage.text().includes( 'Сцена не отвечает' ), false )

			// A frame element of its own, so the stuck document is gone with it.
			$mol_assert_ok( stage.frame() !== frame )

		},

		/**
		 * Deleting a wired part takes its wires with it, from either end. A wire
		 * left behind would name a node the document no longer declares, and the
		 * scene compiles that into a call of a property nobody has.
		 */
		'deleting a wired part leaves no wire to a node that is gone'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 100, 100 ]) )
			stage.drop( map, stage.client([ 400, 100 ]) )
			stage.tap( stage.part_center( 'Calc' ) )

			const overlay = stage.overlay()
			stage.press( overlay, stage.port_dot( 'Calc', 'result', 'out' ) )
			stage.move( overlay, stage.port_dot( 'Map', 'zoom', 'in' ) )
			stage.release( overlay, stage.port_dot( 'Map', 'zoom', 'in' ) )
			stage.redraw()

			$mol_assert_equal( stage.app.doc_wires().length, 1 )

			// The source of the wire goes.
			stage.tap( stage.part_center( 'Calc' ) )
			stage.click( stage.button( 'Удалить' ) )

			$mol_assert_equal( stage.app.doc_source().includes( 'calc_result' ), false )
			$mol_assert_like( stage.app.doc_wires(), [] )
			$mol_assert_ok( stage.app.doc_source().includes( `Map ${ map }` ) )

			// And the same from the other end: a wire drawn again and the consumer
			// deleted leaves the source part standing and no wire behind. The name
			// of the deleted part is free again, so the new one takes it.
			stage.drop( calc, stage.client([ 100, 300 ]) )
			$mol_assert_equal( stage.app.selected(), 'Calc' )

			stage.press( overlay, stage.port_dot( 'Calc', 'result', 'out' ) )
			stage.move( overlay, stage.port_dot( 'Map', 'zoom', 'in' ) )
			stage.release( overlay, stage.port_dot( 'Map', 'zoom', 'in' ) )
			stage.redraw()

			$mol_assert_equal( stage.app.doc_wires().length, 1 )

			stage.tap( stage.part_center( 'Map' ) )
			stage.click( stage.button( 'Удалить' ) )

			$mol_assert_like( stage.app.doc_wires(), [] )
			$mol_assert_equal( stage.app.doc_source().includes( 'calc_result' ), false )
			$mol_assert_ok( stage.app.doc_source().includes( `Calc ${ calc }` ) )
			$mol_assert_equal( stage.app.doc_source().includes( `Map ${ map }` ), false )

		},

	})

}
