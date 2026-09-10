namespace $.$$ {

	$mol_style_define( $bog_vmap_part_plot, {

		flex: { direction: 'column' },
		width: '24rem',
		height: '14rem',
		maxWidth: '100%',

		minWidth: '12rem',
		padding: $mol_gap.block,
		background: { color: $mol_theme.card },
		border: { radius: $mol_gap.round },
		boxShadow: `0 0 0 1px ${ $mol_theme.line }`,

		Title: {
			flex: { shrink: 0 },
			font: { weight: 'bold' },
		},

		Chart: {
			flex: { grow: 1 },
			minHeight: 0,
		},

	} )

}
