namespace $.$$ {

	$mol_style_define( $bog_vmap_part_calc, {

		flex: { direction: 'row', wrap: 'wrap' },
		align: { items: 'center' },

		/**
		 * A detail, not a band. Dropped into an artboard the calculator is handed
		 * the width of the page and took all of it: measured at 1280×64 inside a
		 * desktop board, and at a phone width of 390 it ran 434 px past the edge
		 * instead of wrapping. A ceiling of its own fixes both, and `minWidth: 0`
		 * is what lets it shrink at all — a `$mol_view` in a flex row will not go
		 * below the width of its content without it.
		 */
		maxWidth: '22rem',
		minWidth: 0,

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
