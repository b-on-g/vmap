namespace $ {

	/** A box in screen pixels of the pane. */
	export type $bog_vmap_app_wire_box = {
		readonly left: number
		readonly top: number
		readonly width: number
		readonly height: number
	}

	/** A port of a part's class: name, `?` in the signature, shape of the default value. */
	export type $bog_vmap_app_wire_port = {
		readonly name: string
		readonly next: boolean
		readonly kind: $bog_vmap_app_inspect_value_kind
	}

	/** Inputs are drawn on the left edge of a part, outputs on the right. */
	export type $bog_vmap_app_wire_side = 'in' | 'out'

	/** A port dot on screen. `lit` — may take the wire in hand; `linked` — an input with a wire already. */
	export type $bog_vmap_app_wire_dot = {
		readonly node: string
		readonly port: $bog_vmap_app_wire_port
		readonly side: $bog_vmap_app_wire_side
		readonly x: number
		readonly y: number
		readonly lit: boolean
		readonly linked: boolean
	}

	/** A drawn wire: its path and the label at its middle. */
	export type $bog_vmap_app_wire_line = {
		readonly key: string
		readonly geometry: string
		readonly label: string
		readonly label_x: number
		readonly label_y: number
	}

	/** Height of one port row, in screen pixels whatever the zoom. */
	export const $bog_vmap_app_wire_row = 14

	/**
	 * Distance from the edge of the box to the centre of a dot, in screen pixels.
	 * Strictly outside the box: under the picked part the overlay is cut open along
	 * the box, and a dot inside it would take no press. The radius stays under this.
	 */
	export const $bog_vmap_app_wire_gap = 12

	export const $bog_vmap_app_wire_radius = 5

	/** Radius within which a point counts as over a dot. Wider than the dot. */
	export const $bog_vmap_app_wire_hit = 8

	/** Shapes a port carries as a wire: values and references, never sub views or dictionaries. */
	const wirable = new Set< $bog_vmap_app_inspect_value_kind >([
		'string', 'number', 'bool', 'null', 'locale', 'list', 'get', 'bind',
	])

	/** Ports of a class fit for wiring, from its `props_map`, in its order: bases first. */
	export function $bog_vmap_app_wire_ports(
		this: $,
		props: ReadonlyMap< string, $mol_tree2 >,
	): readonly $bog_vmap_app_wire_port[] {

		const ports = [] as $bog_vmap_app_wire_port[]

		for( const [ name, prop ] of props ) {

			const meta = this.$mol_view_tree2_prop_parts( prop )
			if( meta.key ) continue

			const kind = this.$bog_vmap_app_inspect_value_kind_of( prop.kids[ 0 ] ?? null )
			if( !wirable.has( kind ) ) continue

			ports.push({ name, next: Boolean( meta.next ), kind })

		}

		return ports
	}

	/**
	 * Whether a value of one shape may feed a port of another: equal shapes fit,
	 * `null` and a reference say nothing about the shape and fit anything, a
	 * localized string is a string.
	 */
	export function $bog_vmap_app_wire_fits(
		out: $bog_vmap_app_inspect_value_kind,
		into: $bog_vmap_app_inspect_value_kind,
	) {

		const loose = new Set< $bog_vmap_app_inspect_value_kind >([ 'null', 'get', 'bind' ])
		if( loose.has( out ) || loose.has( into ) ) return true

		const norm = ( kind: $bog_vmap_app_inspect_value_kind ) => kind === 'locale' ? 'string' : kind

		return norm( out ) === norm( into )
	}

	/** Centre of the dot of the `index`th port on a side of a box. Rows run down from the top. */
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

	/** Reach of the horizontal tangents, so short wires still bend. */
	function wire_reach( from: readonly [ number, number ], to: readonly [ number, number ] ) {
		return Math.max( 40, Math.abs( to[0] - from[0] ) / 2 )
	}

	/** A cubic Bezier from an output to an input with horizontal tangents, as an SVG path. */
	export function $bog_vmap_app_wire_curve(
		from: readonly [ number, number ],
		to: readonly [ number, number ],
	) {

		const reach = wire_reach( from, to )

		return `M ${ from[0] } ${ from[1] } C ${ from[0] + reach } ${ from[1] }, ${ to[0] - reach } ${ to[1] }, ${ to[0] } ${ to[1] }`
	}

	/** The point of the curve at t = 1/2, where the label goes. */
	export function $bog_vmap_app_wire_curve_mid(
		from: readonly [ number, number ],
		to: readonly [ number, number ],
	): readonly [ number, number ] {

		const reach = wire_reach( from, to )

		return [
			( from[0] + 3 * ( from[0] + reach ) + 3 * ( to[0] - reach ) + to[0] ) / 8,
			( from[1] + to[1] ) / 2,
		]
	}

	/** The dot under a point, or `null`. The last one wins: what is drawn later is on top. */
	export function $bog_vmap_app_wire_dot_at(
		dots: readonly $bog_vmap_app_wire_dot[],
		point: readonly [ number, number ],
	) {

		let found = null as $bog_vmap_app_wire_dot | null

		for( const dot of dots ) {
			if( Math.hypot( dot.x - point[0], dot.y - point[1] ) > $bog_vmap_app_wire_hit ) continue
			found = dot
		}

		return found
	}

}
