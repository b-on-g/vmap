namespace $.$$ {

	$mol_style_define( $bog_vmap_app_history, {

		flex: { direction: 'column', grow: 0, shrink: 1, basis: '18rem' },
		minWidth: '14rem',
		maxWidth: '22rem',
		minHeight: 0,
		background: { color: $mol_theme.back },
		color: $mol_theme.text,
		border: { left: { width: '1px', style: 'solid', color: $mol_theme.line } },

		Head: {
			padding: $mol_gap.text,
			font: { weight: 'bold' },
			border: { bottom: { width: '1px', style: 'solid', color: $mol_theme.line } },
		},

		Steps: {
			flex: { direction: 'row', shrink: 0 },
			gap: $mol_gap.space,
			padding: $mol_gap.block,
		},

		List: {
			flex: { grow: 1, shrink: 1 },
			minHeight: 0,
			overflow: { y: 'auto' },
		},

	} )

}
