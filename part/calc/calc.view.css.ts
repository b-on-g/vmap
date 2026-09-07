namespace $.$$ {

	$mol_style_define( $bog_vmap_part_calc, {

		flex: { direction: 'row', wrap: 'wrap' },
		align: { items: 'center' },
		gap: $mol_gap.space,
		padding: $mol_gap.block,
		background: { color: $mol_theme.card },
		border: { radius: $mol_gap.round },
		boxShadow: `0 0 0 1px ${ $mol_theme.line }`,

		Left: { width: '6rem' },
		Right: { width: '6rem' },

		Result: {
			padding: { left: $mol_gap.text, right: $mol_gap.text },
			font: { weight: 'bold', family: 'monospace' },
			whiteSpace: 'nowrap',
		},

	} )

}
