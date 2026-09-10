namespace $.$$ {

	$mol_style_define( $bog_vmap_app_scenes, {

		flex: { direction: 'column', shrink: 0 },
		gap: $mol_gap.space,
		padding: { bottom: $mol_gap.space },
		background: { color: $mol_theme.back },
		color: $mol_theme.text,
		border: { bottom: { width: '1px', style: 'solid', color: $mol_theme.line } },

		Head: {
			padding: $mol_gap.text,
			font: { weight: 'bold' },
			border: { bottom: { width: '1px', style: 'solid', color: $mol_theme.line } },
		},

		List: {
			maxHeight: '12rem',
			overflow: { y: 'auto' },
		},

		Scene_row: {
			font: { family: 'inherit', size: '.9rem' },
			minHeight: '1.75rem',
		},

		Title: {
			margin: { left: $mol_gap.space, right: $mol_gap.space },
			background: { color: $mol_theme.field },
		},

		Add: {
			margin: { left: $mol_gap.space, right: $mol_gap.space },
			justify: { content: 'flex-start' },
		},

	} )

}
