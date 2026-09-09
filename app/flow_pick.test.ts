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

		/**
		 * The band: a modified sweep over the canvas takes everything it overlaps, and
		 * from then on the whole set is one thing — it travels together and it goes
		 * together.
		 */
		'a band takes several parts, and they move and delete as one'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 100, 100 ]) )
			stage.drop( map, stage.client([ 300, 100 ]) )

			// Only the last dropped one is picked, as a drop leaves it.
			$mol_assert_like( [ ... stage.app.picked() ], [ 'Map' ] )

			// A sweep with the modifier down, from above and left of both to below
			// and right of both.
			const overlay = stage.overlay()
			const mods = { ctrlKey: true }

			stage.press( overlay, stage.client([ 50, 50 ]), mods )
			stage.move( overlay, stage.client([ 450, 200 ]), mods )
			$mol_assert_ok( stage.pane.band() !== null )

			stage.release( overlay, stage.client([ 450, 200 ]), mods )
			stage.redraw()
			stage.scene.flush()

			$mol_assert_like( [ ... stage.app.picked() ], [ 'Calc', 'Map' ] )
			$mol_assert_equal( stage.pane.band(), null )

			// Carried by the body of one of them, both travel by the same offset.
			const from = stage.part_center( 'Calc' )

			stage.press( overlay, from )
			stage.move( overlay, [ from[0] + 40, from[1] + 30 ] )
			stage.release( overlay, [ from[0] + 40, from[1] + 30 ] )
			stage.redraw()

			$mol_assert_like( stage.app.spots(), {
				Calc: { x: 140, y: 130 },
				Map: { x: 340, y: 130 },
			} )

			// And deleted together: out of the document, out of `sub`, out of the desk.
			stage.click( stage.button( 'Удалить' ) )

			const source = stage.app.doc_source()
			$mol_assert_equal( source.includes( 'Calc' ), false )
			$mol_assert_equal( source.includes( 'Map' ), false )
			$mol_assert_like( Object.keys( stage.app.spots() ), [] )
			$mol_assert_like( [ ... stage.app.picked() ], [] )

		},

		/**
		 * REPRO: a drop out of the palette while something is picked carried the
		 * picked node to the point of the drop as well.
		 */
		/**
		 * Inside a part the keys belong to the part, and the strip says so with the
		 * way out. Nothing else on screen would explain why Delete stopped deleting.
		 */
		'the strip says the pointer is inside a part, and how to get out'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 200, 150 ]) )
			$mol_assert_equal( stage.text().includes( 'Внутри' ), false )

			stage.tap( stage.part_center( 'Calc' ) )
			stage.tap( stage.part_center( 'Calc' ) )

			$mol_assert_equal( stage.pane.inside(), true )
			$mol_assert_ok( stage.text().includes( 'Внутри Calc' ) )
			$mol_assert_ok( stage.text().includes( 'Esc' ) )

			const dom = $.$mol_dom_context
			dom.document.dispatchEvent( new dom.KeyboardEvent( 'keydown', { key: 'Escape', bubbles: true } ) )
			stage.redraw()

			$mol_assert_equal( stage.pane.inside(), false )
			$mol_assert_equal( stage.text().includes( 'Внутри' ), false )

		},

		'REPRO a drop from the palette leaves the picked part where it was'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )

			stage.drop( calc, stage.client([ 100, 100 ]) )
			$mol_assert_equal( stage.app.selected(), 'Calc' )

			// Picked by a click, the way a person picks before reaching for the palette.
			stage.tap( stage.part_center( 'Calc' ) )
			$mol_assert_equal( stage.app.selected(), 'Calc' )

			stage.drop( map, stage.client([ 400, 300 ]) )

			$mol_assert_like( stage.app.spots(), {
				Calc: { x: 100, y: 100 },
				Map: { x: 400, y: 300 },
			} )

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
