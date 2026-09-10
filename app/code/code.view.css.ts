namespace $.$$ {

	$mol_style_define( $bog_vmap_app_code, {

		flex: { direction: 'column', grow: 1, shrink: 1 },
		minHeight: 0,
		minWidth: 0,
		background: { color: $mol_theme.back },
		color: $mol_theme.text,

		Head: {
			flex: { shrink: 0 },
		},

		Scope_note: {
			flex: { grow: 1 },
			font: { family: 'monospace', size: '.8rem' },
			color: $mol_theme.shade,
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
		},

		Alarm: {
			flex: { shrink: 0 },
			padding: $mol_gap.text,
			background: { color: $mol_theme.back },
			color: $mol_theme.focus,
			font: { size: '.75rem' },
			whiteSpace: 'pre-wrap',
		},

		Refusal: {
			flex: { shrink: 0 },
			padding: $mol_gap.text,
			color: $mol_theme.shade,
			font: { size: '.75rem' },
			whiteSpace: 'pre-wrap',
		},

		Typing: {
			flex: { direction: 'column', shrink: 0 },
			gap: '.25rem',
			padding: $mol_gap.text,
			color: $mol_theme.shade,
			font: { size: '.75rem' },
			whiteSpace: 'normal',
		},

		Sources: {
			flex: { direction: 'column', grow: 1, shrink: 1 },
			minHeight: 0,

			'$mol_switch': {
				alignSelf: 'flex-start',
				flex: { grow: 0 },
			},

		},

	} )

}
