namespace $.$$ {

	$mol_style_define( $bog_vmap_part_cell, {

		flex: { direction: 'column' },
		gap: $mol_gap.space,
		padding: $mol_gap.block,
		maxWidth: '28rem',

		minWidth: '12rem',
		background: { color: $mol_theme.card },
		border: { radius: $mol_gap.round },
		boxShadow: `0 0 0 1px ${ $mol_theme.line }`,

		Code: {
			minHeight: '4.5rem',
			background: { color: $mol_theme.field },
		},

		Bar: {
			flex: { direction: 'row' },
			align: { items: 'center' },
			gap: $mol_gap.text,
		},

		Spent: {
			color: $mol_theme.shade,
			font: { size: '.8rem' },
			whiteSpace: 'nowrap',
		},

		Result: {
			font: { family: 'monospace' },
			whiteSpace: 'pre-wrap',
		},

		Error: {
			color: $mol_theme.focus,
			font: { family: 'monospace', size: '.8rem' },
			whiteSpace: 'pre-wrap',
		},

	} )

}
