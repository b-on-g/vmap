namespace $ {
	export type $bog_vmap_app_pane_snap_axis = 'x' | 'y'

	export type $bog_vmap_app_pane_snap_line = {
		readonly axis: $bog_vmap_app_pane_snap_axis
		readonly at: number
		readonly from: number
		readonly to: number
	}

	export type $bog_vmap_app_pane_snap = {
		readonly dx: number
		readonly dy: number
		readonly lines: readonly $bog_vmap_app_pane_snap_line[]
	}

	export type $bog_vmap_app_pane_rail = {
		readonly axis: $bog_vmap_app_pane_snap_axis
		readonly at: number
	}

	export type $bog_vmap_app_pane_guide_drag = $bog_vmap_app_pane_rail & {
		readonly id: string
		readonly born: boolean
		readonly off: boolean
	}

	export function $bog_vmap_app_pane_rail_stops(
		rails: readonly $bog_vmap_app_pane_rail[],
		axis: $bog_vmap_app_pane_snap_axis,
	) {
		return rails.filter( rail => rail.axis === axis ).map( rail => rail.at )
	}

	export function $bog_vmap_app_pane_snap_stops( box: $bog_vmap_bridge_rect, axis: $bog_vmap_app_pane_snap_axis ) {
		const start = axis === 'x' ? box.x : box.y
		const size = axis === 'x' ? box.width : box.height
		return [ start, start + size / 2, start + size ]
	}

	export function $bog_vmap_app_pane_snap_gap(
		mine: readonly number[],
		theirs: readonly number[],
		slack: number,
	) {
		let best = null as number | null

		for( const from of mine ) for( const to of theirs ) {
			const gap = to - from
			if( Math.abs( gap ) > slack ) continue
			if( best !== null && Math.abs( gap ) >= Math.abs( best ) ) continue
			best = gap
		}

		return best ?? 0
	}

	export function $bog_vmap_app_pane_snap(
		moving: $bog_vmap_bridge_rect,
		others: readonly $bog_vmap_bridge_rect[],
		slack: number,
		rails: readonly $bog_vmap_app_pane_rail[] = [],
	): $bog_vmap_app_pane_snap {
		const stops = $bog_vmap_app_pane_snap_stops

		const dx = $bog_vmap_app_pane_snap_gap(
			stops( moving, 'x' ),
			[ ... others.flatMap( box => stops( box, 'x' ) ), ... $bog_vmap_app_pane_rail_stops( rails, 'x' ) ],
			slack,
		)

		const dy = $bog_vmap_app_pane_snap_gap(
			stops( moving, 'y' ),
			[ ... others.flatMap( box => stops( box, 'y' ) ), ... $bog_vmap_app_pane_rail_stops( rails, 'y' ) ],
			slack,
		)

		const placed = { x: moving.x + dx, y: moving.y + dy, width: moving.width, height: moving.height }

		const lines = new Map< string, $bog_vmap_app_pane_snap_line >()

		const touch = ( axis: $bog_vmap_app_pane_snap_axis, at: number, from: number, to: number )=> {
			const key = axis + ' ' + at
			const was = lines.get( key )
			lines.set( key, {
				axis,
				at,
				from: Math.min( from, was?.from ?? from ),
				to: Math.max( to, was?.to ?? to ),
			} )
		}

		const near = ( a: number, b: number )=> Math.abs( a - b ) < 1e-6

		for( const other of others ) {
			for( const axis of [ 'x', 'y' ] as const ) {
				const cross = axis === 'x' ? 'y' : 'x'
				const mine = stops( placed, axis )

				for( const at of stops( other, axis ) ) {
					if( !mine.some( stop => near( stop, at ) ) ) continue

					const span = [ ... stops( placed, cross ), ... stops( other, cross ) ]
					touch( axis, at, Math.min( ... span ), Math.max( ... span ) )
				}
			}
		}

		return { dx, dy, lines: [ ... lines.values() ] }
	}

}
