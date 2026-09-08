namespace $.$$ {

	// Outside the literal the strings widen to `string`, which the guard rejects for lengths.
	const label = {
		fill: String( $mol_theme.text ),
		font: { family: 'monospace', size: '10px' as const },
		paintOrder: 'stroke',
		stroke: String( $mol_theme.back ),
		strokeWidth: '3px',
		strokeLinejoin: 'round',
	}

	$mol_style_define( $bog_vmap_app_wire, {

		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		overflow: 'visible',

		/** A picture, never a target: the press a dot marks goes to the overlay and is resolved by geometry. */
		pointerEvents: 'none',

		Line: {
			fill: 'none',
			stroke: String( $mol_theme.focus ),
			strokeWidth: '1.5px',
		},

		Drag: {
			fill: 'none',
			stroke: String( $mol_theme.current ),
			strokeWidth: '1.5px',
			strokeDasharray: '6 4',
		},

		Label: label,

		Name: label,

		Dot: {

			fill: String( $mol_theme.card ),
			stroke: String( $mol_theme.focus ),
			strokeWidth: '1.5px',

			'[bog_vmap_app_wire_dot_linked]': {
				true: {
					fill: String( $mol_theme.focus ),
				},
			},

			'[bog_vmap_app_wire_dot_lit]': {
				false: {
					opacity: .25,
				},
			},

		},

	} )

}
