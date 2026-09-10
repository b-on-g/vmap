namespace $.$$ {

	$mol_style_define( $bog_vmap_app_shelf, {

		flex: { direction: 'column', grow: 1, shrink: 1 },
		minHeight: 0,
		background: { color: $mol_theme.back },
		color: $mol_theme.text,

		Title: {
			flex: { shrink: 0 },
			padding: $mol_gap.text,
			font: { weight: 'bold' },
			border: { bottom: { width: '1px', style: 'solid', color: $mol_theme.line } },
		},

		Stack: {
			flex: { grow: 1, shrink: 1 },
			minHeight: '6rem',
		},

		Stack_body: {
			flex: { direction: 'column' },
			padding: { bottom: '2.5rem' },
		},

		Items: {
			flex: { shrink: 0 },
			padding: { top: $mol_gap.space, bottom: $mol_gap.space },
			gap: $mol_gap.space,
		},

		Item_row: {
			minHeight: '2rem',
			margin: { left: $mol_gap.space, right: $mol_gap.space },
			padding: $mol_gap.text,
			font: { family: 'inherit', size: '.9rem' },
			border: {
				radius: $mol_gap.round,
				width: '1px',
				style: 'solid',
				color: $mol_theme.line,
			},
			background: { color: $mol_theme.card },
		},

		Source: {
			flex: { direction: 'column', shrink: 0 },
			padding: { left: $mol_gap.space, right: $mol_gap.space },
			gap: $mol_gap.space,
		},

		Links: {
			background: { color: $mol_theme.field },
			font: { family: 'monospace', size: '.8rem' },
		},

		Note: {
			color: $mol_theme.focus,
			font: { family: 'monospace', size: '.75rem' },
			whiteSpace: 'pre-wrap',
		},

		Import: {
			flex: { direction: 'row', shrink: 0 },
			align: { items: 'center' },
			gap: $mol_gap.text,
		},

		Import_title: {
			color: $mol_theme.shade,
			font: { size: '.8rem' },
		},

		Import_note: {
			color: $mol_theme.focus,
			font: { size: '.75rem' },
			whiteSpace: 'pre-wrap',
		},

		Apps: {
			flex: { direction: 'column', shrink: 0 },
			padding: { top: $mol_gap.space, bottom: $mol_gap.space },
			gap: $mol_gap.space,
		},

		Apps_note: {
			padding: { left: $mol_gap.text, right: $mol_gap.text },
			color: $mol_theme.focus,
			font: { size: '.75rem' },
			whiteSpace: 'pre-wrap',
		},

		Apps_head: {
			padding: { left: $mol_gap.text, right: $mol_gap.text },
			color: $mol_theme.shade,
			font: { size: '.8rem' },
		},

		Palette: {
			flex: { grow: 1, shrink: 1 },
			minHeight: '10rem',
		},

		Level: {
			flex: { shrink: 0 },
			padding: $mol_gap.text,
			border: {
				top: { width: '1px', style: 'solid', color: $mol_theme.line },
				radius: 0,
			},
		},

	} )

}
