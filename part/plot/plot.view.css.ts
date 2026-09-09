namespace $.$$ {

	$mol_style_define( $bog_vmap_part_plot, {

		flex: { direction: 'column' },
		width: '24rem',
		height: '14rem',
		maxWidth: '100%',

		/**
		 * The same floor the map carries, and for the same reason: `max-width: 100%`
		 * against the root of a document, which has no width of its own, resolves to
		 * zero, and a minimum of zero lets the box collapse to a strip. A minimum
		 * beats a maximum in CSS, so this is what keeps a chart put down on its own
		 * visible.
		 */
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
