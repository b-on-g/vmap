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
			$mol_assert_ok( text.includes( 'Палитра' ) )
			$mol_assert_ok( text.includes( 'Свойства' ) )
			$mol_assert_ok( text.includes( '100%' ) )
			$mol_assert_ok( text.includes( 'Выберите узел на холсте' ) )

			// The palette offers the classes of the pack, the `$mol_view` stub included.
			const rows = [ ... stage.root.querySelectorAll( '[bog_vmap_app_palette_item]' ) ]
				.map( el => el.textContent )

			$mol_assert_like( rows, [ `${d}mol_view`, button, calc, map ] )

			// Nothing failed to draw except the frame, which stays suspended for
			// ever: jsdom never loads the sandbox page, so its `onload` never fires.
			$mol_assert_like( stage.broken(), [ stage.pane.Scene( 0 ).dom_id() ] )

		},

		/**
		 * A component is carried out of the palette onto the canvas, and a click on
		 * it picks it. Two gestures on purpose: a drop declares the part, and the
		 * pick is a press of its own — nothing is selected by the drop itself.
		 */
		'a class carried from the palette becomes a part, and a click picks it'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )

			// One declaration and one reference, and the placement beside them.
			const source = stage.app.doc_source()
			$mol_assert_ok( source.includes( `Calc ${ calc }` ) )
			$mol_assert_ok( source.includes( '<= Calc' ) )
			$mol_assert_like( stage.app.spots(), { Calc: { x: 200, y: 150 } } )

			// The scene compiles what the document says, byte for byte.
			$mol_assert_equal( stage.scene.last( 'doc_set' )!.src, source )

			// A click on the part picks it and goes on to the live component.
			stage.tap( stage.part_center( 'Calc' ) )

			$mol_assert_equal( stage.app.selected(), 'Calc' )
			$mol_assert_ok( stage.root.querySelector( '[bog_vmap_app_pane_handle]' ) !== null )

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

			stage.type( stage.field( 'Palette().Links()' ), link )

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
		 * The palette field takes a pack and lands together, and refuses a second
		 * pack out loud: the reason is under the field and the frame keeps the pack
		 * it already loaded.
		 */
		'the palette field takes a pack with lands and says why it refuses a second'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			const field = stage.field( 'Palette().Links()' )
			stage.type( field, 'http://pack.test/, AbCdEfGh' )

			$mol_assert_equal( stage.app.pack_link(), 'http://pack.test/' )
			$mol_assert_like( stage.app.lands(), [ 'AbCdEfGh' ] )

			const uri = stage.app.scene_uri()
			$mol_assert_ok( uri.includes( encodeURIComponent( 'http://pack.test/web.js' ) ) )

			stage.type( field, 'http://pack.test/, AbCdEfGh, http://other.test/' )

			// The refusal is on screen, in the user's words, under the field.
			$mol_assert_ok( stage.text().includes( $bog_vmap_lib_links_reason.pack_second ) )
			$mol_assert_ok( stage.text().includes( 'http://other.test/' ) )

			// The frame address is the one it already had: no reload.
			$mol_assert_equal( stage.app.scene_uri(), uri )
			$mol_assert_equal( stage.field( 'Palette().Links()' ).value, 'http://pack.test/, AbCdEfGh, http://other.test/' )

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

	})

}
