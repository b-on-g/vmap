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
	 * Which way the children of a container are stacked: what the node DECLARES,
	 * else what its children came out as, else a column.
	 *
	 * The declaration comes first because it is not a guess about CSS — it is a
	 * line of the document, which the host owns and reads directly. Geometry is the
	 * fallback and not the source: it degenerates on nought or one child, where
	 * there is nothing to read a direction off at all.
	 *
	 * A direction the document states in some other way — `row-reverse` and its
	 * kind — falls through to the geometry rather than being taken at its word: the
	 * children of a reversed box come out in the opposite order from the one `sub`
	 * lists them in, and a position counted along the boxes would be the mirror of
	 * the position written into the tree. Guessing from where things are is then
	 * strictly better than trusting a word we do not act on.
	 *
	 * The last resort is a column, the way a page stacks and what the artboard
	 * preset sets. It has to be set: `[mol_view]` is `display: flex` with no
	 * direction at all, which is a ROW.
	 */
	export function $bog_vmap_app_pane_axis(
		boxes: readonly $bog_vmap_bridge_rect[],
		declared = '',
	) {

		if( declared === 'row' ) return 'row' as const
		if( declared === 'column' ) return 'column' as const

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
		declared = '',
	): $bog_vmap_app_pane_slot {

		const row = $bog_vmap_app_pane_axis( kids, declared ) === 'row'

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
