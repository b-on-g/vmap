namespace $.$$ {

	$mol_style_define( $bog_vmap_app_palette_port, {

		flex: { direction: 'row', shrink: 0, wrap: 'nowrap' },
		align: { items: 'baseline' },
		gap: $mol_gap.text,
		padding: { top: '.25rem', bottom: '.25rem', left: $mol_gap.text, right: $mol_gap.text },
		border: { bottom: { width: '1px', style: 'solid', color: $mol_theme.line } },
		font: { family: 'monospace', size: '.8rem' },

		Sign: {
			flex: { shrink: 0 },
			minWidth: '11rem',
			font: { weight: 'bold' },
			color: $mol_theme.current,
		},

		Body: {
			flex: { grow: 1 },
			color: $mol_theme.shade,
			whiteSpace: 'pre',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
		},

		/**
		 * Which class declared the port. Empty on an own port, so the badge itself
		 * is the marker: the eye finds the few own ports of a class among two dozen
		 * without reading a single name.
		 */
		Owner: {
			flex: { shrink: 0 },
			padding: { left: '.4rem', right: '.4rem' },
			border: { radius: $mol_gap.round },
			background: { color: $mol_theme.hover },
			color: $mol_theme.shade,
			font: { size: '.7rem' },
		},

		/**
		 * `false` renders no attribute at all, `$mol_dom_render_attributes` drops
		 * it, so an own port is the plain state and only the inherited one is
		 * selectable. Written the other way round the rule would never match.
		 */
		'@': {
			bog_vmap_app_palette_port_inherited: {
				true: {
					Sign: {
						color: $mol_theme.text,
						font: { weight: 'normal' },
					},
				},
			},
		},

	} )

}
