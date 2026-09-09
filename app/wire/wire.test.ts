namespace $ {

	/**
	 * The wire layer on numbers: where the dots go, how a wire bends, what hits,
	 * what fits. Nothing here touches the DOM.
	 */
	const box = ( left: number, top: number, width = 100, height = 50 ): $bog_vmap_app_wire_box =>
		({ left, top, width, height })

	const port = ( name: string, kind: $bog_vmap_app_inspect_value_kind, next = false ): $bog_vmap_app_wire_port =>
		({ name, next, kind })

	const dot = (
		over: Partial< $bog_vmap_app_wire_dot > & { x: number, y: number },
	): $bog_vmap_app_wire_dot => ({
		node: 'A',
		port: port( 'value', 'string' ),
		side: 'in',
		lit: true,
		linked: false,
		... over,
	})

	$mol_test({

		/**
		 * The overlay is cut open exactly along the box of the picked part. A dot
		 * inside the box would be clipped away and take no press, so every dot
		 * must lie strictly outside, with its whole radius.
		 */
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

		/** Rows are screen pixels: the same box twice as big on screen gives the same row height. */
		'port rows do not scale with the camera'( $ ) {

			// The same world box at zoom 1 and at zoom 4.
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

		/**
		 * REPRO: two children of one container sit at the same left edge, so the
		 * output of the upper one is to the RIGHT of the input of the lower one.
		 * Horizontal tangents there loop the wire out past the box and back in from
		 * the far side, which reads as a wire that is broken rather than short.
		 */
		'a wire that runs backwards turns its tangents and stays between its ends'( $ ) {

			// Upper child: box left 100, so its output dot is at 100 + 200 + 12.
			// Lower child: same left edge, so its input dot is at 100 - 12.
			const from = [ 312, 20 ] as const
			const to = [ 88, 120 ] as const

			const d = $bog_vmap_app_wire_curve( from, to )

			// Every control point stays within the span of the ends: no loop outside.
			const xs = d.match( /-?\d+(\.\d+)?/g )!.map( Number ).filter( ( _, i )=> i % 2 === 0 )

			$mol_assert_equal( Math.max( ... xs ), from[0] )
			$mol_assert_equal( Math.min( ... xs ), to[0] )

			// The tangents are vertical: the curve steps down and comes in from above.
			$mol_assert_equal( d, 'M 312 20 C 312 70, 88 70, 88 120' )

			// The label rides the curve, not the straight line between the ends.
			$mol_assert_like( $bog_vmap_app_wire_curve_mid( from, to ), [ 200, 70 ] )

		},

		/** A wire that runs forwards is unchanged: ends already point at each other. */
		'a short forward wire keeps a minimal reach'( $ ) {

			$mol_assert_equal( $bog_vmap_app_wire_curve( [ 0, 0 ], [ 10, 0 ] ), 'M 0 0 C 40 0, -30 0, 10 0' )

		},

		'the dot under a point, last one on top'( $ ) {

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

		'compatibility by shape'( $ ) {

			$mol_assert_equal( $bog_vmap_app_wire_fits( 'number', 'number' ), true )
			$mol_assert_equal( $bog_vmap_app_wire_fits( 'string', 'locale' ), true )
			$mol_assert_equal( $bog_vmap_app_wire_fits( 'number', 'string' ), false )
			$mol_assert_equal( $bog_vmap_app_wire_fits( 'list', 'bool' ), false )

			// Unknown shape on either end fits anything.
			$mol_assert_equal( $bog_vmap_app_wire_fits( 'null', 'list' ), true )
			$mol_assert_equal( $bog_vmap_app_wire_fits( 'number', 'get' ), true )
			$mol_assert_equal( $bog_vmap_app_wire_fits( 'bind', 'number' ), true )

		},

		/**
		 * From a class of every shape, the ports one may wire: values and references,
		 * never sub views, dictionaries or keyed properties.
		 */
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
			const ports = $.$bog_vmap_app_wire_ports( props )

			$mol_assert_like(
				ports.map( port => `${ port.name }${ port.next ? '?' : '' }:${ port.kind }` ),
				[ 'title:string', 'count:number', 'enabled:bool', 'click?:null', 'items:list', 'label:locale', 'bound:get', 'both?:bind' ],
			)

		},

	})

}
