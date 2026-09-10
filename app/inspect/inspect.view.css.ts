namespace $.$$ {

	$mol_style_define( $bog_vmap_app_inspect, {

		flex: { direction: 'column', grow: 1, shrink: 1 },
		minHeight: 0,
		minWidth: 0,
		background: { color: $mol_theme.back },
		color: $mol_theme.text,

		Head: {
			flex: { direction: 'column', shrink: 0 },
			gap: '.15rem',
			padding: $mol_gap.text,
			background: { color: $mol_theme.card },
			border: { bottom: { width: '1px', style: 'solid', color: $mol_theme.line } },
		},

		Title: {
			font: { family: 'monospace', weight: 'bold' },
			background: { color: 'transparent' },
			padding: 0,
		},

		Note: {
			color: $mol_theme.focus,
			font: { size: '.75rem' },
			whiteSpace: 'normal',
		},

		Base: {
			color: $mol_theme.shade,
			font: { family: 'monospace', size: '.75rem' },
		},

		Total: {
			color: $mol_theme.shade,
			font: { size: '.75rem' },
		},

		Body: {
			flex: { grow: 1, shrink: 1 },
			minHeight: 0,
		},

		Stack: {
			flex: { direction: 'column' },
		},

		Rows: {
			flex: { direction: 'column' },

			'@': {
				mol_view_error: {
					Promise: {
						color: $mol_theme.shade,
						'::before': {
							content: '"Загружаю порты пака…"',
							padding: $mol_gap.text,
						},
					},
				},
			},
		},

	} )

	$mol_style_define( $bog_vmap_app_inspect_demo, {

		flex: { direction: 'row', grow: 1 },
		align: { items: 'stretch' },
		minHeight: '100vh',

		Source: {
			flex: { direction: 'column', shrink: 0 },
			width: '32rem',
			gap: '.25rem',
			padding: $mol_gap.text,
			background: { color: $mol_theme.card },
			border: { right: { width: '1px', style: 'solid', color: $mol_theme.line } },
		},

		'@media': {
			'(max-width: 60rem)': {
				flexDirection: 'column',
				Source: {
					width: 'auto',
					borderRight: 'none',
					border: { bottom: { width: '1px', style: 'solid', color: $mol_theme.line } },
				},
				Source_text: {
					minHeight: '8rem',
					maxHeight: '12rem',
				},
			},
		},

		Source_head: {
			flex: { direction: 'row', shrink: 0, wrap: 'nowrap' },
			align: { items: 'center' },
			gap: '.5rem',
			minWidth: 0,
		},

		Source_title: {
			flex: { shrink: 0 },
			font: { weight: 'bold' },
			color: $mol_theme.text,
		},

		Class_pick: {
			flex: { grow: 1 },
			minWidth: 0,
			minHeight: '1.5rem',
			background: { color: $mol_theme.field },
			color: $mol_theme.current,
			font: { family: 'monospace', size: '.8rem', weight: 'bold' },
		},

		Source_text: {
			flex: { grow: 1 },
			minHeight: '20rem',
		},

	} )

}
