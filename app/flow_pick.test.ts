namespace $ {

	/**
	 * What a person does with a part right after putting it on the canvas: carry it,
	 * click into it, delete it. Every one of the three was reported broken, and none
	 * of them is broken in the model — the overlay used to be cut open under the
	 * picked part, so the frame took the presses and the focus.
	 *
	 * `d` keeps `$` out of the string literals — mam builds its dependency graph by
	 * a regexp over sources, literals included.
	 */
	const d = '$'

	const calc = `${d}flow_calc`
	const map = `${d}flow_map`

	$mol_test({

		'a dropped part is carried by a drag across its body'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			$mol_assert_like( stage.app.spots(), { Calc: { x: 200, y: 150 } } )

			// The overlay is whole: the body of the part just dropped is the handle.
			$mol_assert_equal( stage.pane.overlay_style().clipPath, 'none' )

			const overlay = stage.overlay()
			const from = stage.part_center( 'Calc' )

			stage.press( overlay, from )
			stage.move( overlay, [ from[0] + 60, from[1] + 40 ] )
			stage.release( overlay, [ from[0] + 60, from[1] + 40 ] )
			stage.redraw()

			$mol_assert_like( stage.app.spots(), { Calc: { x: 260, y: 190 } } )

		},

		'the second click lets the pointer inside the part, Escape takes it back out'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			stage.drop( map, stage.client([ 400, 150 ]) )

			// The first click on another part only picks it, and no click reaches the scene.
			const before = stage.scene.sent( 'click_at' ).length
			stage.tap( stage.part_center( 'Calc' ) )

			$mol_assert_equal( stage.app.selected(), 'Calc' )
			$mol_assert_equal( stage.pane.inside(), false )
			$mol_assert_equal( stage.pane.overlay_style().clipPath, 'none' )
			$mol_assert_equal( stage.scene.sent( 'click_at' ).length, before )

			// The second one lets the pointer inside, and the click goes on to the component.
			stage.tap( stage.part_center( 'Calc' ) )

			$mol_assert_equal( stage.pane.inside(), true )
			$mol_assert_ok( stage.pane.overlay_style().clipPath.includes( '200px 150px' ) )
			$mol_assert_equal( stage.scene.sent( 'click_at' ).length, before + 1 )

			const dom = $.$mol_dom_context
			dom.document.dispatchEvent( new dom.KeyboardEvent( 'keydown', { key: 'Escape', bubbles: true } ) )
			stage.redraw()

			$mol_assert_equal( stage.pane.inside(), false )
			$mol_assert_equal( stage.app.selected(), 'Calc' )

		},

		'the Delete key takes the picked part out of the document'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 100, 100 ]) )
			stage.drop( map, stage.client([ 300, 100 ]) )
			stage.tap( stage.part_center( 'Calc' ) )

			$mol_assert_equal( stage.app.selected(), 'Calc' )

			const dom = $.$mol_dom_context
			dom.document.dispatchEvent( new dom.KeyboardEvent( 'keydown', { key: 'Delete', bubbles: true } ) )
			stage.redraw()

			$mol_assert_equal( stage.app.doc_source().includes( 'Calc' ), false )
			$mol_assert_equal( stage.app.selected(), null )

		},

		'a part inside a page is carried to another position in its tree'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.click( stage.button( 'Артборд' ) )

			const page = stage.pane.part_box( 'Page' )!

			stage.drop( calc, stage.client([ page.left + 200, page.top + 40 ]) )
			stage.drop( map, stage.client([ page.left + 200, page.top + 250 ]) )

			const node = stage.app.node()
			$mol_assert_like( node.sub_names( 'Page' ), [ 'Calc', 'Map' ] )

			// Carry the second one above the first: press on it, drag up, release.
			const overlay = stage.overlay()
			const from = stage.part_center( 'Map' )
			const to = stage.client([ page.left + 200, page.top + 5 ])

			stage.press( overlay, from )
			stage.move( overlay, to )
			stage.release( overlay, to )
			stage.redraw()
			stage.scene.flush()

			$mol_assert_like( node.sub_names( 'Page' ), [ 'Map', 'Calc' ] )

		},

	})

}
