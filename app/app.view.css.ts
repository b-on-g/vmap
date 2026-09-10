namespace $.$$ {
	$mol_style_define( $bog_vmap_app, {
		flex: { direction: 'column' },
		height: '100vh',

		overflow: 'hidden',

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

		Root_name: {
			minWidth: '14rem',
			flex: { grow: 0, shrink: 1 },
		},

		Status: {
			flex: { grow: 1 },
			justify: { content: 'flex-end' },
			color: $mol_theme.shade,
			font: { size: '.75rem' },
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
		},

		Body: {
			flex: { grow: 1, shrink: 1 },
			minHeight: 0,
		},

		Side: {
			flex: { direction: 'column', grow: 0, shrink: 1, basis: '20rem' },
			minWidth: '12rem',
			maxWidth: '20rem',
			minHeight: 0,
			border: { right: { width: '1px', style: 'solid', color: $mol_theme.line } },
		},

		Aside: {
			flex: { direction: 'column', grow: 0, shrink: 1, basis: '22rem' },
			minWidth: '13rem',
			maxWidth: '22rem',
			minHeight: 0,
			border: { left: { width: '1px', style: 'solid', color: $mol_theme.line } },
		},

		Code: {
			flex: { direction: 'column', grow: 0, shrink: 1, basis: '28rem' },
			minWidth: '22rem',
			maxWidth: '28rem',
			minHeight: 0,
			border: { left: { width: '1px', style: 'solid', color: $mol_theme.line } },
		},

		Pane: {
			flex: { grow: 1, shrink: 1 },
			minWidth: '28rem',
		},

		Idle: {
			padding: $mol_gap.block,
			color: $mol_theme.shade,
			font: { size: '.8rem' },
			whiteSpace: 'normal',
		},

		Ghost: {
			position: 'fixed',
			zIndex: 100,
			pointerEvents: 'none',
			transform: 'translate(.75rem, .75rem)',
			padding: { top: '.25rem', bottom: '.25rem', left: $mol_gap.text, right: $mol_gap.text },
			background: { color: $mol_theme.card },
			border: { radius: $mol_gap.round, width: '1px', style: 'solid', color: $mol_theme.line },
			color: $mol_theme.control,
			font: { family: 'monospace', size: '.8rem' },
			whiteSpace: 'nowrap',
			box: { shadow: [[ 0, '.25rem', '.75rem', 0, $mol_style_func.hsla( 0, 0, 0, .5 ) ]] },
		},

		Alarm: {
			flex: { shrink: 0 },
			padding: $mol_gap.text,
			background: { color: $mol_theme.focus },
			color: $mol_theme.back,
			font: { family: 'monospace', size: '.8rem' },
			whiteSpace: 'pre-wrap',
		},

		Stall: {
			flex: { direction: 'row', shrink: 0, wrap: 'wrap' },
			align: { items: 'center' },
			gap: $mol_gap.text,
			padding: $mol_gap.text,
			background: { color: $mol_theme.special },
			color: $mol_theme.back,
		},

		Stall_note: {
			flex: { grow: 1, shrink: 1 },
			minWidth: 0,
			font: { size: '.8rem' },
			whiteSpace: 'normal',
		},

		Export_note: {
			flex: { direction: 'column', shrink: 0 },
			gap: '.25rem',
			padding: $mol_gap.text,
			background: { color: $mol_theme.special },
			color: $mol_theme.back,
			font: { size: '.8rem' },
			whiteSpace: 'normal',
		},

		Stall_reload: {
			flex: { shrink: 0 },
			color: $mol_theme.back,
		},

	} )

}
