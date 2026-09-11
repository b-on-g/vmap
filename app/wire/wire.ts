namespace $ {
	export type $bog_vmap_app_wire_box = {
		readonly left: number
		readonly top: number
		readonly width: number
		readonly height: number
	}

	export type $bog_vmap_app_wire_port = {
		readonly name: string
		readonly next: boolean
		readonly own: boolean
		readonly kind: $bog_vmap_app_inspect_value_kind
	}

	export type $bog_vmap_app_wire_side = 'in' | 'out'

	export type $bog_vmap_app_wire_dot = {
		readonly node: string
		readonly port: $bog_vmap_app_wire_port
		readonly side: $bog_vmap_app_wire_side
		readonly x: number
		readonly y: number
		readonly lit: boolean
		readonly linked: boolean
	}

	export type $bog_vmap_app_wire_line = {
		readonly key: string
		readonly geometry: string
		readonly label: string
		readonly label_x: number
		readonly label_y: number
	}

	export const $bog_vmap_app_wire_row = 14

	export const $bog_vmap_app_wire_gap = 12

	export const $bog_vmap_app_wire_radius = 5

	export const $bog_vmap_app_wire_hit = 8

	const wirable = new Set< $bog_vmap_app_inspect_value_kind >([
		'string', 'number', 'bool', 'null', 'locale', 'list', 'get', 'bind',
	])

	export function $bog_vmap_app_wire_ports(
		this: $,
		props: ReadonlyMap< string, $mol_tree2 >,
		owners: ReadonlyMap< string, string >,
		base: string,
	): readonly $bog_vmap_app_wire_port[] {
		const ports = [] as $bog_vmap_app_wire_port[]

		for( const [ name, prop ] of props ) {
			const meta = this.$mol_view_tree2_prop_parts( prop )
			if( meta.key ) continue

			const kind = this.$bog_vmap_app_inspect_value_kind_of( prop.kids[ 0 ] ?? null )
			if( !wirable.has( kind ) ) continue

			ports.push({ name, next: Boolean( meta.next ), own: owners.get( name ) === base, kind })

		}

		return ports
	}

	export function $bog_vmap_app_wire_fits(
		out: $bog_vmap_app_inspect_value_kind,
		into: $bog_vmap_app_inspect_value_kind,
	) {
		const loose = new Set< $bog_vmap_app_inspect_value_kind >([ 'null', 'get', 'bind' ])
		if( loose.has( out ) || loose.has( into ) ) return true

		const norm = ( kind: $bog_vmap_app_inspect_value_kind ) => kind === 'locale' ? 'string' : kind

		return norm( out ) === norm( into )
	}

	export function $bog_vmap_app_wire_port_point(
		box: $bog_vmap_app_wire_box,
		side: $bog_vmap_app_wire_side,
		index: number,
	): readonly [ number, number ] {
		const x = side === 'in'
			? box.left - $bog_vmap_app_wire_gap
			: box.left + box.width + $bog_vmap_app_wire_gap

		const y = box.top + $bog_vmap_app_wire_row / 2 + index * $bog_vmap_app_wire_row

		return [ x, y ]
	}

	export function $bog_vmap_app_wire_side_point(
		box: $bog_vmap_app_wire_box,
		side: $bog_vmap_app_wire_side,
	): readonly [ number, number ] {
		return $bog_vmap_app_wire_port_point( box, side, 0 )
	}

	export function $bog_vmap_app_wire_over(
		box: $bog_vmap_app_wire_box,
		point: readonly [ number, number ],
	) {
		const reach = $bog_vmap_app_wire_gap + $bog_vmap_app_wire_hit

		if( point[0] < box.left - reach ) return false
		if( point[0] > box.left + box.width + reach ) return false
		if( point[1] < box.top ) return false
		if( point[1] > box.top + box.height ) return false

		return true
	}

	function wire_reach( span: number ) {
		return Math.max( 40, Math.abs( span ) / 2 )
	}

	function wire_control(
		from: readonly [ number, number ],
		to: readonly [ number, number ],
	): readonly [ readonly [ number, number ], readonly [ number, number ] ] {
		if( to[0] >= from[0] ) {
			const reach = wire_reach( to[0] - from[0] )
			return [ [ from[0] + reach, from[1] ], [ to[0] - reach, to[1] ] ]
		}

		const reach = wire_reach( to[1] - from[1] )
		const down = to[1] >= from[1] ? 1 : -1

		return [ [ from[0], from[1] + reach * down ], [ to[0], to[1] - reach * down ] ]
	}

	export function $bog_vmap_app_wire_curve(
		from: readonly [ number, number ],
		to: readonly [ number, number ],
	) {
		const [ one, two ] = wire_control( from, to )

		return `M ${ from[0] } ${ from[1] } C ${ one[0] } ${ one[1] }, ${ two[0] } ${ two[1] }, ${ to[0] } ${ to[1] }`
	}

	export function $bog_vmap_app_wire_curve_mid(
		from: readonly [ number, number ],
		to: readonly [ number, number ],
	): readonly [ number, number ] {
		const [ one, two ] = wire_control( from, to )

		return [
			( from[0] + 3 * one[0] + 3 * two[0] + to[0] ) / 8,
			( from[1] + 3 * one[1] + 3 * two[1] + to[1] ) / 8,
		]
	}

	export function $bog_vmap_app_wire_dot_at(
		dots: readonly $bog_vmap_app_wire_dot[],
		point: readonly [ number, number ],
	) {
		let found = null as $bog_vmap_app_wire_dot | null
		let best = Infinity

		for( const dot of dots ) {
			const span = Math.hypot( dot.x - point[0], dot.y - point[1] )
			if( span > $bog_vmap_app_wire_hit ) continue
			if( found && span > best ) continue

			found = dot
			best = span
		}

		return found
	}

}
