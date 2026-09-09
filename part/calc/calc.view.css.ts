namespace $.$$ {

	$mol_style_define( $bog_vmap_part_calc, {

		flex: { direction: 'row', wrap: 'wrap' },
		align: { items: 'center' },

		/**
		 * A detail, not a band. Handed the width of a page it took all of it, and
		 * on a phone width it ran past the edge instead of wrapping; a ceiling of
		 * its own fixes both.
		 *
		 * The floor is the other half of the same decision. Zero is what lets a view
		 * in a flex row shrink below its content at all, but zero also lets it
		 * shrink to nothing, and a detail put down on its own has to stay visible.
		 * A real floor does both: it still gives way inside a narrow board, down to
		 * a width where the fields are still fields.
		 */
		maxWidth: '22rem',
		minWidth: '12rem',

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
