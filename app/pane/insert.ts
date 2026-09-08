namespace $ {

	/** Where a dragged node would go: into whose `sub`, at what position. */
	export type $bog_vmap_app_pane_slot = {

		/** Property name of the container. */
		readonly owner: string

		/** Position among the children of that container. */
		readonly index: number

		/** The insertion line, in world units. Flat: one of the sides is zero. */
		readonly line: $bog_vmap_bridge_rect

	}

	/**
	 * Which way the children of a container are stacked, read off their boxes.
	 *
	 * Geometry and not CSS on purpose: the host does not compile the document and
	 * has no layout of its own, so the only honest source of the direction is where
	 * the children came out. Asking the scene would put a message on the wire for
	 * something already measured.
	 *
	 * Fewer than two children says nothing at all, and the answer is then a column:
	 * that is the way a page stacks, and it is what an artboard is set to. Note the
	 * default of `$mol_view` itself is a ROW — `[mol_view]` is `display: flex` with
	 * no direction — which is why an artboard has to say `flexDirection` out loud
	 * and why the inspector offers it.
	 */
	export function $bog_vmap_app_pane_axis( boxes: readonly $bog_vmap_bridge_rect[] ) {

		if( boxes.length < 2 ) return 'column' as const

		const mid_x = boxes.map( box => box.x + box.width / 2 )
		const mid_y = boxes.map( box => box.y + box.height / 2 )

		const spread = ( mids: readonly number[] )=> Math.max( ... mids ) - Math.min( ... mids )

		return spread( mid_x ) > spread( mid_y ) ? 'row' as const : 'column' as const
	}

	/**
	 * Position a point aims at among the children of a container, and the line to
	 * draw for it.
	 *
	 * The position is decided by the MIDDLE of each child, not by the gaps between
	 * them: children of a flex box usually touch, so a rule that only fired between
	 * boxes would have nowhere to fire, and pointing at the upper half of a child
	 * plainly means «above this one».
	 *
	 * The line is drawn on the boundary rather than on the child: at the middle of
	 * the gap when there is one, on the outer edge at either end. In world units,
	 * because the host draws it with the same transform it draws the selection ring
	 * with, and turning world into screen is done once, for both.
	 */
	export function $bog_vmap_app_pane_slot(
		owner: string,
		box: $bog_vmap_bridge_rect,
		kids: readonly $bog_vmap_bridge_rect[],
		point: readonly [ number, number ],
	): $bog_vmap_app_pane_slot {

		const row = $bog_vmap_app_pane_axis( kids ) === 'row'

		const start = ( kid: $bog_vmap_bridge_rect )=> row ? kid.x : kid.y
		const end = ( kid: $bog_vmap_bridge_rect )=> row ? kid.x + kid.width : kid.y + kid.height
		const at = point[ row ? 0 : 1 ]

		const index = kids.filter( kid => ( start( kid ) + end( kid ) ) / 2 < at ).length

		const before = kids[ index - 1 ]
		const after = kids[ index ]

		const bound = before && after ? ( end( before ) + start( after ) ) / 2
			: before ? end( before )
			: after ? start( after )
			: row ? box.x : box.y

		const line = row
			? { x: bound, y: box.y, width: 0, height: box.height }
			: { x: box.x, y: bound, width: box.width, height: 0 }

		return { owner, index, line }
	}

}
