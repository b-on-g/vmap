namespace $.$$ {

	$mol_style_define( $bog_vmap_app_scenes, {

		/** A row inside the head bar, never taller than the bar and never wrapping it. */
		flex: { direction: 'row', shrink: 0 },
		align: { items: 'center' },
		gap: $mol_gap.text,

		Pick: {
			maxWidth: '16rem',
		},

		Title: {
			minWidth: '10rem',
			background: { color: $mol_theme.field },
		},

	} )

}
