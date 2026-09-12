namespace $.$$ {

	$mol_style_define( $bog_vmap_app_palette_item, {

		justify: { content: 'flex-start' },
		textAlign: 'left',
		font: { family: 'monospace', size: '.8rem' },

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
