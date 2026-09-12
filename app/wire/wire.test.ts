namespace $ {
	const box = ( left: number, top: number, width = 100, height = 50 ): $bog_vmap_app_wire_box =>
		({ left, top, width, height })

	const port = ( name: string, kind: $bog_vmap_app_inspect_value_kind, next = false ): $bog_vmap_app_wire_port =>
		({ name, next, own: true, kind })

	const dot = (
		over: Partial< $bog_vmap_app_wire_dot > & { x: number, y: number },
	): $bog_vmap_app_wire_dot => ({
		node: 'A',
		port: port( 'value', 'string' ),
		side: 'in',
		lit: true,
		linked: false,
		hint: '',
		... over,
	})

	$mol_test({
		'ports sit outside the box on both sides, one row each'( $ ) {
			const b = box( 100, 200, 60, 30 )

			for( let i = 0; i < 5; ++i ) {
				const [ ix, iy ] = $bog_vmap_app_wire_port_point( b, 'in', i )
				const [ ox, oy ] = $bog_vmap_app_wire_port_point( b, 'out', i )

				$mol_assert_equal( ix + $bog_vmap_app_wire_radius < b.left, true )
				$mol_assert_equal( ox - $bog_vmap_app_wire_radius > b.left + b.width, true )
				$mol_assert_equal( iy, oy )
				$mol_assert_equal( iy, b.top + $bog_vmap_app_wire_row / 2 + i * $bog_vmap_app_wire_row )

			}

		},

		'port rows do not scale with the camera'( $ ) {
			const small = $bog_vmap_app_wire_port_point( box( 0, 0, 10, 10 ), 'out', 1 )
			const big = $bog_vmap_app_wire_port_point( box( 0, 0, 40, 40 ), 'out', 1 )

			$mol_assert_equal( small[1], big[1] )
			$mol_assert_equal( big[0] - small[0], 30 )

		},

		'a wire is one cubic Bezier from end to end'( $ ) {
			const d = $bog_vmap_app_wire_curve( [ 0, 0 ], [ 200, 100 ] )

			$mol_assert_equal( d, 'M 0 0 C 100 0, 100 100, 200 100' )

			const mid = $bog_vmap_app_wire_curve_mid( [ 0, 0 ], [ 200, 100 ] )
			$mol_assert_like( mid, [ 100, 50 ] )

		},

		'a wire that runs backwards turns its tangents and stays between its ends'( $ ) {
			const from = [ 312, 20 ] as const
			const to = [ 88, 120 ] as const

			const d = $bog_vmap_app_wire_curve( from, to )

			const xs = d.match( /-?\d+(\.\d+)?/g )!.map( Number ).filter( ( _, i )=> i % 2 === 0 )

			$mol_assert_equal( Math.max( ... xs ), from[0] )
			$mol_assert_equal( Math.min( ... xs ), to[0] )

			$mol_assert_equal( d, 'M 312 20 C 312 70, 88 70, 88 120' )

			$mol_assert_like( $bog_vmap_app_wire_curve_mid( from, to ), [ 200, 70 ] )

		},

		'a short forward wire keeps a minimal reach'( $ ) {
			$mol_assert_equal( $bog_vmap_app_wire_curve( [ 0, 0 ], [ 10, 0 ] ), 'M 0 0 C 40 0, -30 0, 10 0' )

		},

		'the dot under a point, the nearest one, and on a tie the one on top'( $ ) {
			const dots = [
				dot({ x: 10, y: 10, node: 'A' }),
				dot({ x: 14, y: 10, node: 'B' }),
				dot({ x: 100, y: 100, node: 'C' }),
			]

			$mol_assert_equal( $bog_vmap_app_wire_dot_at( dots, [ 12, 10 ] )?.node, 'B' )
			$mol_assert_equal( $bog_vmap_app_wire_dot_at( dots, [ 5, 10 ] )?.node, 'A' )
			$mol_assert_equal( $bog_vmap_app_wire_dot_at( dots, [ 100, 100 + $bog_vmap_app_wire_hit ] )?.node, 'C' )
			$mol_assert_equal( $bog_vmap_app_wire_dot_at( dots, [ 100, 100 + $bog_vmap_app_wire_hit + 1 ] ), null )
			$mol_assert_equal( $bog_vmap_app_wire_dot_at( dots, [ 50, 50 ] ), null )

		},

		'a point inside the reach of two dots goes to the nearer, not the later'( $ ) {
			const dots = [
				dot({ x: 10, y: 10, node: 'A', port: port( 'near', 'number' ) }),
				dot({ x: 15, y: 10, node: 'B', port: port( 'far', 'number' ) }),
			]

			$mol_assert_equal( $bog_vmap_app_wire_dot_at( dots, [ 11, 10 ] )?.node, 'A' )
			$mol_assert_equal( $bog_vmap_app_wire_dot_at( dots, [ 14, 10 ] )?.node, 'B' )

		},

		'a column of a short part does not reach into the part below it'( $ ) {
			const height = 17

			const above = box( 0, 0, 200, height )
			const below = box( 0, height, 200, height )

			const own = $bog_vmap_app_wire_side_point( above, 'in' )
			const next = $bog_vmap_app_wire_side_point( below, 'in' )

			$mol_assert_equal( own[0], next[0] )
			$mol_assert_equal( Math.abs( own[1] - next[1] ) > $bog_vmap_app_wire_hit, true )

			$mol_assert_like( own, [ 0 - $bog_vmap_app_wire_gap, $bog_vmap_app_wire_row / 2 ] )

		},

		'opening the column leaves the point of the first port where it was'( $ ) {
			for( const b of [ box( 0, 0, 200, 17 ), box( 100, 200, 60, 30 ), box( -40, -10, 1280, 720 ) ] ) {
				for( const side of [ 'in', 'out' ] as const ) {

					$mol_assert_like(
						$bog_vmap_app_wire_side_point( b, side ),
						$bog_vmap_app_wire_port_point( b, side, 0 ),
					)

				}
			}

		},

		'a point on the dot column counts as over the part, a point a row above does not'( $ ) {
			const b = box( 100, 200, 60, 30 )

			const [ x, y ] = $bog_vmap_app_wire_side_point( b, 'in' )

			$mol_assert_equal( $bog_vmap_app_wire_over( b, [ x, y ] ), true )
			$mol_assert_equal( $bog_vmap_app_wire_over( b, [ b.left + 10, b.top + 1 ] ), true )
			$mol_assert_equal( $bog_vmap_app_wire_over( b, [ x, b.top - 1 ] ), false )
			$mol_assert_equal( $bog_vmap_app_wire_over( b, [ x - $bog_vmap_app_wire_hit - 1, y ] ), false )

		},

		'compatibility by shape'( $ ) {
			$mol_assert_equal( $bog_vmap_app_wire_fits( 'number', 'number' ), true )
			$mol_assert_equal( $bog_vmap_app_wire_fits( 'string', 'locale' ), true )
			$mol_assert_equal( $bog_vmap_app_wire_fits( 'number', 'string' ), false )
			$mol_assert_equal( $bog_vmap_app_wire_fits( 'list', 'bool' ), false )

			$mol_assert_equal( $bog_vmap_app_wire_fits( 'null', 'list' ), true )
			$mol_assert_equal( $bog_vmap_app_wire_fits( 'number', 'get' ), true )
			$mol_assert_equal( $bog_vmap_app_wire_fits( 'bind', 'number' ), true )

		},

		'a two way wire takes only a port declared with a sign'( $ ) {
			const signed = port( 'value', 'number', true )
			const plain = port( 'result', 'number' )

			$mol_assert_equal( $bog_vmap_app_wire_takes( 'number', signed, false ), true )
			$mol_assert_equal( $bog_vmap_app_wire_takes( 'number', plain, false ), true )

			$mol_assert_equal( $bog_vmap_app_wire_takes( 'number', signed, true ), true )
			$mol_assert_equal( $bog_vmap_app_wire_takes( 'number', plain, true ), false )

		},

		'an unfitting shape is refused whichever way the wire runs'( $ ) {
			const signed = port( 'value', 'string', true )

			$mol_assert_equal( $bog_vmap_app_wire_takes( 'number', signed, false ), false )
			$mol_assert_equal( $bog_vmap_app_wire_takes( 'number', signed, true ), false )

			$mol_assert_equal( $bog_vmap_app_wire_takes( 'locale', signed, true ), true )

		},

		'the label of a two way wire carries the sign, of a one way one only the value'( $ ) {
			$mol_assert_equal( $bog_vmap_app_wire_label({ label: '42', bidi: false }), '42' )
			$mol_assert_equal( $bog_vmap_app_wire_label({ label: '42', bidi: true }), '⇄ 42' )

			$mol_assert_equal( $bog_vmap_app_wire_label({ label: '', bidi: false }), '' )
			$mol_assert_equal( $bog_vmap_app_wire_label({ label: '', bidi: true }), '⇄' )

		},

		'the name at a dot carries the sign of the port and, when given, the hint'( $ ) {
			$mol_assert_equal( $bog_vmap_app_wire_name( dot({ x: 0, y: 0 }) ), 'value' )

			$mol_assert_equal(
				$bog_vmap_app_wire_name( dot({ x: 0, y: 0, port: port( 'value', 'string', true ) }) ),
				'value?',
			)

			$mol_assert_equal(
				$bog_vmap_app_wire_name( dot({
					x: 0, y: 0,
					port: port( 'value', 'string', true ),
					hint: $bog_vmap_app_wire_hint,
				}) ),
				'value? · Shift — двусторонний',
			)

		},

		'ports are the value shaped, unkeyed properties of the class'( $ ) {
			const d = '$'
			const tree = $.$mol_tree2_from_string( [
				`title \\Hi`,
				`count 3`,
				`enabled true`,
				`click? null`,
				`items /`,
				`label @ \\Loc`,
				`Icon ${d}mol_view`,
				`attr *`,
				`Item* ${d}mol_view`,
				`Row* null`,
				`bound <= other`,
				`both? <=> other?`,
				`wired = Calc result`,
				``,
			].join( '\n' ) )

			const props = new Map( tree.kids.map( prop => [ $.$mol_view_tree2_prop_parts( prop ).name, prop ] as const ) )
			const owners = new Map( [ ... props.keys() ].map( name => [ name, `${d}my_part` ] as const ) )
			const ports = $.$bog_vmap_app_wire_ports( props, owners, `${d}my_part` )

			$mol_assert_like(
				ports.map( port => `${ port.name }${ port.next ? '?' : '' }:${ port.kind }` ),
				[ 'title:string', 'count:number', 'enabled:bool', 'click?:null', 'items:list', 'label:locale', 'bound:get', 'both?:bind' ],
			)

			$mol_assert_equal( ports.every( port => port.own ), true )

		},

		'a port inherited from the base class is not the part own'( $ ) {
			const d = '$'
			const tree = $.$mol_tree2_from_string( [ `title \\Hi`, `count 3`, `` ].join( '\n' ) )

			const props = new Map( tree.kids.map( prop => [ $.$mol_view_tree2_prop_parts( prop ).name, prop ] as const ) )

			const owners = new Map( [
				[ 'title', `${d}mol_view` ],
				[ 'count', `${d}my_part` ],
			] as const )

			const ports = $.$bog_vmap_app_wire_ports( props, owners, `${d}my_part` )

			$mol_assert_like(
				ports.map( port => `${ port.name }:${ port.own }` ),
				[ 'title:false', 'count:true' ],
			)

		},

	})

}
