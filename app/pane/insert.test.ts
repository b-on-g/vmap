namespace $ {

	/**
	 * Tests of where a drop into an artboard lands.
	 *
	 * Pure geometry, so a fixture is a container and a few boxes. What the document
	 * says about the layout never enters: the host does not compile it and has no
	 * layout of its own, and the boxes are all it is told.
	 */

	const box = ( x: number, y: number, width: number, height: number )=> ({ x, y, width, height })

	/** A page of three rows, stacked down the artboard. */
	const column = [ box( 0, 0, 400, 100 ), box( 0, 100, 400, 100 ), box( 0, 200, 400, 100 ) ]

	/** The same three, laid side by side. */
	const row = [ box( 0, 0, 100, 300 ), box( 100, 0, 100, 300 ), box( 200, 0, 100, 300 ) ]

	const board = box( 0, 0, 400, 300 )

	$mol_test({

		'the direction is read off where the children came out'( $ ) {

			$mol_assert_equal( $bog_vmap_app_pane_axis( column ), 'column' )
			$mol_assert_equal( $bog_vmap_app_pane_axis( row ), 'row' )

			// Nothing to read: a page stacks, and that is what an artboard is set to.
			$mol_assert_equal( $bog_vmap_app_pane_axis( [] ), 'column' )
			$mol_assert_equal( $bog_vmap_app_pane_axis( [ column[0] ] ), 'column' )

		},

		/**
		 * The middle of a child decides, not the gap between children: children of a
		 * flex box usually touch, and pointing at the upper half of one plainly means
		 * «above this one».
		 */
		'a point above the middle of a child goes before it'( $ ) {

			const at = ( y: number )=> $bog_vmap_app_pane_slot( 'Board', board, column, [ 200, y ] ).index

			$mol_assert_equal( at( 10 ), 0 )
			$mol_assert_equal( at( 49 ), 0 )
			$mol_assert_equal( at( 51 ), 1 )
			$mol_assert_equal( at( 149 ), 1 )
			$mol_assert_equal( at( 151 ), 2 )
			$mol_assert_equal( at( 290 ), 3 )

		},

		'a row is judged along the other axis'( $ ) {

			const at = ( x: number )=> $bog_vmap_app_pane_slot( 'Board', board, row, [ x, 150 ] ).index

			$mol_assert_equal( at( 10 ), 0 )
			$mol_assert_equal( at( 120 ), 1 )
			$mol_assert_equal( at( 290 ), 3 )

		},

		/** The line lies on the boundary and spans the container, flat across it. */
		'the line is drawn between the children, and at the edge at either end'( $ ) {

			const head = $bog_vmap_app_pane_slot( 'Board', board, column, [ 200, 10 ] )
			$mol_assert_like( head.line, { x: 0, y: 0, width: 400, height: 0 } )

			const between = $bog_vmap_app_pane_slot( 'Board', board, column, [ 200, 120 ] )
			$mol_assert_like( between.line, { x: 0, y: 100, width: 400, height: 0 } )

			const tail = $bog_vmap_app_pane_slot( 'Board', board, column, [ 200, 290 ] )
			$mol_assert_like( tail.line, { x: 0, y: 300, width: 400, height: 0 } )

			const across = $bog_vmap_app_pane_slot( 'Board', board, row, [ 120, 150 ] )
			$mol_assert_like( across.line, { x: 100, y: 0, width: 0, height: 300 } )

		},

		/** An empty artboard takes the drop at its own top edge, at position zero. */
		'an empty container offers the one position it has'( $ ) {

			const slot = $bog_vmap_app_pane_slot( 'Board', box( 40, 60, 400, 300 ), [], [ 200, 200 ] )

			$mol_assert_equal( slot.index, 0 )
			$mol_assert_like( slot.line, { x: 40, y: 60, width: 400, height: 0 } )

		},

		/** A gap between children puts the line in the middle of it, not on a child. */
		'the line splits the gap when there is one'( $ ) {

			const gapped = [ box( 0, 0, 400, 100 ), box( 0, 140, 400, 100 ) ]

			const slot = $bog_vmap_app_pane_slot( 'Board', board, gapped, [ 200, 120 ] )

			$mol_assert_equal( slot.index, 1 )
			$mol_assert_equal( slot.line.y, 120 )

		},

	})

}
