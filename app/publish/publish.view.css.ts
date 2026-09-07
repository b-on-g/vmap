namespace $.$$ {

	$mol_style_define( $bog_vmap_app_publish, {

		/** A row inside the head bar, never taller than the bar. */
		flex: { direction: 'row', shrink: 0 },
		align: { items: 'center' },
		gap: $mol_gap.text,

		Note: {
			color: $mol_theme.shade,
			font: { size: '.75rem' },
			whiteSpace: 'nowrap',
		},

		/** The link is the caption: monospace, and never wrapped across the bar. */
		Copy: {
			font: { family: 'monospace', size: '.8rem' },
			whiteSpace: 'nowrap',
		},

	} )

}
