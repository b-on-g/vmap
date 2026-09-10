namespace $.$$ {

	$mol_style_define( $bog_vmap_app_history_snap, {

		flex: { direction: 'column', shrink: 0 },
		padding: $mol_gap.text,
		gap: $mol_gap.text,
		border: { bottom: { width: '1px', style: 'solid', color: $mol_theme.line } },

		Bar: {
			flex: { direction: 'row', shrink: 0 },
			align: { items: 'center' },
			justify: { content: 'space-between' },
			gap: $mol_gap.space,
		},

		Moment: {
			font: { weight: 'bold', size: '.9rem' },
		},

		Author: {
			font: { size: '.8rem' },
			color: $mol_theme.shade,
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap',
		},

		Text: {
			font: { family: 'monospace', size: '.8rem' },
			whiteSpace: 'pre-wrap',
			maxHeight: '8rem',
			overflow: 'hidden',
			color: $mol_theme.shade,
		},

	} )

}
