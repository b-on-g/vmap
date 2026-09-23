namespace $ {

	export type $bog_vmap_app_pane_ruler_tick = {
		readonly at: number
		readonly label: number
	}

	const ladder = [ 1, 2, 5 ]

	export function $bog_vmap_app_pane_ruler_step( zoom: number, room = 64 ) {

		if( !( zoom > 0 ) || !( room > 0 ) ) return 0

		const want = room / zoom
		const power = Math.floor( Math.log10( want ) )

		for( let order = power; order < power + 3; ++ order ) {
			const base = Math.pow( 10, order )
			for( const step of ladder ) {
				if( step * base >= want ) return step * base
			}
		}

		return Math.pow( 10, power + 3 )
	}

	export function $bog_vmap_app_pane_ruler_ticks(
		from: number,
		to: number,
		step: number,
		zero = 0,
	): readonly $bog_vmap_app_pane_ruler_tick[] {

		if( !( step > 0 ) || !( to > from ) ) return []

		const ticks = [] as $bog_vmap_app_pane_ruler_tick[]

		const first = Math.ceil( ( from - zero ) / step )
		const last = Math.floor( ( to - zero ) / step )

		if( last - first > 1000 ) return []

		for( let turn = first; turn <= last; ++ turn ) {
			const label = turn * step
			ticks.push({ at: zero + label, label: Math.round( label ) + 0 || 0 })
		}

		return ticks
	}

}
