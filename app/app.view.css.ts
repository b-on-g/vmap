namespace $.$$ {

	$mol_style_define( $bog_vmap_app, {

		Root_name: {
			flex: { grow: 1, shrink: 1, basis: '12rem' },
			maxWidth: '24rem',
			margin: { left: 'auto', right: 'auto' },
		},

		Main: {
			position: 'relative',
			flex: { grow: 1, shrink: 1, basis: 0 },
			minHeight: 0,
		},

		Left: {
			width: '15rem',
			maxWidth: '100%',
			display: 'grid',
			gridTemplateRows: 'fit-content(40%) auto minmax(0, 1fr)',
			gridTemplateColumns: 'minmax(0, 1fr)',
			background: { color: $mol_theme.card },
		},

		Scenes: {
			minHeight: 0,
		},

		Right: {
			width: '17rem',
			maxWidth: '100%',
			display: 'grid',
			gridTemplateRows: 'auto minmax(0, 1fr)',
			gridTemplateColumns: 'minmax(0, 1fr)',
			background: { color: $mol_theme.card },
		},

		Canvas: {
			flex: { grow: 1, shrink: 1, basis: 0 },
			minWidth: 0,

			Body: {
				align: { items: 'stretch' },
			},

			Body_content: {
				padding: 0,
			},

			Foot: {
				flex: { direction: 'column' },
				gap: $mol_gap.text,
			},

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

		'@media': {
			'(max-width: 60rem)': {

				Left: {
					position: 'absolute',
					zIndex: 3,
					top: 0,
					bottom: 0,
					left: 0,
				},

				Right: {
					position: 'absolute',
					zIndex: 3,
					top: 0,
					bottom: 0,
					right: 0,
				},

			},
		},

	} )

}
