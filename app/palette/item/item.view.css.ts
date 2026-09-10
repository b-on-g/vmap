namespace $.$$ {

	$mol_style_define( $bog_vmap_app_palette_item, {

		justify: { content: 'flex-start' },

		minHeight: '1.5rem',
		minWidth: 0,

		padding: { top: '.15rem', bottom: '.15rem', left: $mol_gap.text, right: $mol_gap.text },
		border: { radius: 0 },
		font: { family: 'monospace', size: '.8rem' },
		textAlign: 'left',

		userSelect: 'none',
		touchAction: 'none',

		'@': {
			bog_vmap_app_palette_item_current: {
				true: {
					background: { color: $mol_theme.hover },
					color: $mol_theme.current,
					font: { weight: 'bold' },
				},
			},
		},

	} )

}
