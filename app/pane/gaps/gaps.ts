namespace $ {

	export type $bog_vmap_app_pane_gap = {
		readonly axis: $bog_vmap_app_pane_snap_axis
		readonly size: number
		readonly from: number
		readonly to: number
		readonly cross: number
	}

	const slack = 1e-6

	const along = ( box: $bog_vmap_bridge_rect, axis: $bog_vmap_app_pane_snap_axis )=> {
		return axis === 'x'
			? { start: box.x, end: box.x + box.width }
			: { start: box.y, end: box.y + box.height }
	}

	const crossed = (
		box: $bog_vmap_bridge_rect,
		other: $bog_vmap_bridge_rect,
		axis: $bog_vmap_app_pane_snap_axis,
	)=> {

		const cross = axis === 'x' ? 'y' : 'x'

		const mine = along( box, cross )
		const theirs = along( other, cross )

		const start = Math.max( mine.start, theirs.start )
		const end = Math.min( mine.end, theirs.end )

		return end - start > slack ? ( start + end ) / 2 : null
	}

	export function $bog_vmap_app_pane_gaps(
		box: $bog_vmap_bridge_rect,
		others: readonly $bog_vmap_bridge_rect[],
		bounds: $bog_vmap_bridge_rect | null = null,
	): readonly $bog_vmap_app_pane_gap[] {

		const gaps = [] as $bog_vmap_app_pane_gap[]

		for( const axis of [ 'x', 'y' ] as const ) {

			const mine = along( box, axis )

			for( const side of [ 'before', 'after' ] as const ) {

				let edge = null as number | null
				let cross = null as number | null

				const take = ( at: number, middle: number | null )=> {

					if( middle === null ) return

					if( side === 'before' ) {
						if( at > mine.start + slack ) return
						if( edge !== null && at <= edge ) return
					} else {
						if( at < mine.end - slack ) return
						if( edge !== null && at >= edge ) return
					}

					edge = at
					cross = middle
				}

				for( const other of others ) {
					const theirs = along( other, axis )
					take( side === 'before' ? theirs.end : theirs.start, crossed( box, other, axis ) )
				}

				if( bounds ) {
					const wall = along( bounds, axis )
					take( side === 'before' ? wall.start : wall.end, crossed( box, bounds, axis ) )
				}

				if( edge === null || cross === null ) continue

				const from = side === 'before' ? edge : mine.end
				const to = side === 'before' ? mine.start : edge

				gaps.push({
					axis,
					size: Math.max( 0, Math.round( to - from ) ),
					from,
					to,
					cross,
				})

			}

		}

		return gaps
	}

}
