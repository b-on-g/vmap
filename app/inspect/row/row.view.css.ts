namespace $.$$ {

	$mol_style_define( $bog_vmap_app_inspect_row, {

		flex: { direction: 'column', shrink: 0 },
		gap: '.15rem',
		minWidth: 0,
		padding: { top: '.35rem', bottom: '.35rem', left: $mol_gap.text, right: $mol_gap.text },
		border: { bottom: { width: '1px', style: 'solid', color: $mol_theme.line } },

		Head: {
			flex: { direction: 'row', shrink: 0, wrap: 'nowrap' },
			align: { items: 'baseline' },
			gap: '.4rem',
			minWidth: 0,
		},

		Sign: {
			flex: { shrink: 1 },
			minWidth: 0,
			color: $mol_theme.current,
			font: { family: 'monospace', size: '.8rem', weight: 'bold' },
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap',
		},

		Owner: {
			flex: { shrink: 0 },
			padding: { left: '.4rem', right: '.4rem' },
			border: { radius: $mol_gap.round },
			background: { color: $mol_theme.hover },
			color: $mol_theme.shade,
			font: { family: 'monospace', size: '.7rem' },
		},

		Tools: {
			flex: { direction: 'row', shrink: 0, grow: 1 },
			justify: { content: 'flex-end' },
			gap: '.1rem',
		},

		Key: {
			minHeight: '1.25rem',
			minWidth: '1.25rem',
			padding: { top: 0, bottom: 0, left: '.3rem', right: '.3rem' },
			color: $mol_theme.shade,
			font: { family: 'monospace', size: '.8rem' },
		},

		Next: {
			minHeight: '1.25rem',
			minWidth: '1.25rem',
			padding: { top: 0, bottom: 0, left: '.3rem', right: '.3rem' },
			color: $mol_theme.shade,
			font: { family: 'monospace', size: '.8rem' },
		},

		Drop: {
			minHeight: '1.25rem',
			minWidth: '1.25rem',
			padding: { top: 0, bottom: 0, left: '.3rem', right: '.3rem' },
			color: $mol_theme.shade,
			font: { size: '.7rem' },
		},

		'@': {
			bog_vmap_app_inspect_row_inherited: {
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
