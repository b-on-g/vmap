namespace $.$$ {

	$mol_style_define( $bog_vmap_app_menu_item, {
		justify: { content: 'space-between' },
		color: $mol_theme.text,

		'@': {
			disabled: {
				true: {
					color: $mol_theme.shade,
				},
			},
		},

		Keys: {
			color: $mol_theme.shade,
			padding: { left: '2rem' },
		},

	} )

}
