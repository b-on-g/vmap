namespace $ {
	export type $bog_vmap_app_pane_slot = {
		readonly owner: string

		readonly index: number

		readonly line: $bog_vmap_bridge_rect

	}

	export function $bog_vmap_app_pane_slot_axis(
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

	export function $bog_vmap_app_pane_slot(
		owner: string,
		box: $bog_vmap_bridge_rect,
		kids: readonly $bog_vmap_bridge_rect[],
		point: readonly [ number, number ],
		declared = '',
	): $bog_vmap_app_pane_slot {
		const row = $bog_vmap_app_pane_slot_axis( kids, declared ) === 'row'

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
