namespace $.$$ {

	$mol_style_define( $bog_vmap_app_palette, {

		flex: { direction: 'column', grow: 1, shrink: 1 },
		minHeight: 0,
		background: { color: $mol_theme.back },
		color: $mol_theme.text,

		Head: {
			flex: { direction: 'row', shrink: 0, wrap: 'wrap' },
			align: { items: 'center' },
			gap: $mol_gap.text,
			padding: $mol_gap.text,
			background: { color: $mol_theme.card },
			border: { bottom: { width: '1px', style: 'solid', color: $mol_theme.line } },
		},

		Brand: {
			font: { weight: 'bold' },
			padding: { right: $mol_gap.text },
		},

		Query: {
			flex: { grow: 1 },
			minWidth: '10rem',
			background: { color: $mol_theme.field },
		},

		Total: {
			flex: { shrink: 0 },
			color: $mol_theme.shade,
			font: { size: '.8rem' },
			whiteSpace: 'pre-wrap',
		},

		Body: {
			flex: { direction: 'row', grow: 1, shrink: 1 },
			minHeight: 0,
		},

		Classes: {
			flex: { shrink: 0 },
			width: '22rem',
			border: { right: { width: '1px', style: 'solid', color: $mol_theme.line } },
		},

		Class_list: {
			flex: { direction: 'column' },
			minHeight: '6rem',
			padding: { top: $mol_gap.text, bottom: $mol_gap.text },

			'@': {
				mol_view_error: {
					Promise: {
						color: $mol_theme.shade,

						'::before': {
							content: '"Загружаю компоненты пака…"',
							padding: $mol_gap.text,
						},
					},
				},
			},

		},

		Ports: {
			flex: { direction: 'column', grow: 1 },
			minWidth: 0,
		},

		Ports_head: {
			flex: { direction: 'column', shrink: 0 },
			gap: '.25rem',
			padding: $mol_gap.text,
			background: { color: $mol_theme.card },
			border: { bottom: { width: '1px', style: 'solid', color: $mol_theme.line } },
		},

		Selected: {
			font: { family: 'monospace', weight: 'bold' },
		},

		Chain: {
			color: $mol_theme.shade,
			font: { family: 'monospace', size: '.75rem' },
			whiteSpace: 'normal',
		},

		Port_list: {
			flex: { direction: 'column' },
			minHeight: '4rem',
		},

		'@': {
			bog_vmap_app_palette_compact: {
				true: {

					Head: {
						flex: { direction: 'column', wrap: 'nowrap' },
						align: { items: 'stretch' },
						gap: '.25rem',
					},

					Query: { minWidth: 0 },

					Total: {
						alignSelf: 'flex-end',
					},

					Classes: {
						flex: { grow: 1, shrink: 1 },
						width: 'auto',
						border: { right: { style: 'none' } },
					},

				},
			},
		},

	} )

}
