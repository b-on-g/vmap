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

		/**
		 * Three sources, in this order and for this reason: what the node declares is
		 * a line of the document rather than a guess; the boxes of the children are
		 * the fallback and say nothing when there are fewer than two of them; a
		 * column is the last resort and what a page is set to.
		 */
		'the declared direction wins, then the geometry, then a column'( $ ) {

			// Declared, and the children say the opposite. The declaration is right:
			// the boxes of a box that has just been re-declared are the old layout.
			$mol_assert_equal( $bog_vmap_app_pane_slot_axis( column, 'row' ), 'row' )
			$mol_assert_equal( $bog_vmap_app_pane_slot_axis( row, 'column' ), 'column' )

			// Nothing declared: read off where the children came out.
			$mol_assert_equal( $bog_vmap_app_pane_slot_axis( column ), 'column' )
			$mol_assert_equal( $bog_vmap_app_pane_slot_axis( row ), 'row' )
			$mol_assert_equal( $bog_vmap_app_pane_slot_axis( column, '' ), 'column' )

			// Neither: a column. One child is exactly as silent as none, which is why
			// the declaration has to come first at all.
			$mol_assert_equal( $bog_vmap_app_pane_slot_axis( [] ), 'column' )
			$mol_assert_equal( $bog_vmap_app_pane_slot_axis( [ column[0] ] ), 'column' )
			$mol_assert_equal( $bog_vmap_app_pane_slot_axis( [ column[0] ], 'row' ), 'row' )

			// A direction we do not act on is not taken at its word: a reversed box
			// lays its children out backwards from the order `sub` lists them, so a
			// position counted along the boxes would be the mirror of the one written.
			$mol_assert_equal( $bog_vmap_app_pane_slot_axis( row, 'row-reverse' ), 'row' )
			$mol_assert_equal( $bog_vmap_app_pane_slot_axis( column, 'row-reverse' ), 'column' )

		},

		/** One child and a declared row: the position is counted across, not down. */
		'a declared direction decides where a lone child is passed'( $ ) {

			const one = [ box( 0, 0, 100, 300 ) ]

			const before = $bog_vmap_app_pane_slot( 'Board', board, one, [ 20, 150 ], 'row' )
			const after = $bog_vmap_app_pane_slot( 'Board', board, one, [ 80, 150 ], 'row' )

			$mol_assert_equal( before.index, 0 )
			$mol_assert_equal( after.index, 1 )

			// Undeclared, the same lone child is judged down the column instead, so
			// the very same point lands on the other side of it.
			$mol_assert_equal( $bog_vmap_app_pane_slot( 'Board', board, one, [ 20, 200 ] ).index, 1 )
			$mol_assert_equal( $bog_vmap_app_pane_slot( 'Board', board, one, [ 80, 200 ], 'row' ).index, 1 )
			$mol_assert_equal( $bog_vmap_app_pane_slot( 'Board', board, one, [ 20, 200 ], 'row' ).index, 0 )

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
