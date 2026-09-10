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

		Owner: {
			flex: { shrink: 0 },
			padding: { left: '.4rem', right: '.4rem' },
			border: { radius: $mol_gap.round },
			background: { color: $mol_theme.hover },
			color: $mol_theme.shade,
			font: { size: '.7rem' },
		},

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
