namespace $.$$ {
	$mol_style_define( $bog_vmap_app, {

		Canvas: {
			flex: { grow: 1 },

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

		Pane: {
			flex: { grow: 1 },
			minWidth: '28rem',
		},

		Ghost: {
			position: 'fixed',
			zIndex: 100,
			minHeight: 0,
			pointerEvents: 'none',
			transform: 'translate(.75rem, .75rem)',
			padding: { top: '.25rem', bottom: '.25rem', left: $mol_gap.text, right: $mol_gap.text },
			background: { color: $mol_theme.card },
			border: { radius: $mol_gap.round, width: '1px', style: 'solid', color: $mol_theme.line },
			color: $mol_theme.control,
			font: { family: 'monospace', size: '.8rem' },
			whiteSpace: 'nowrap',
			box: { shadow: [[ 0, '.25rem', '.75rem', 0, $mol_style_func.hsla( 0, 0, 0, .5 ) ]] },

			'::before': {
				display: 'none',
			},

		},

	} )

}
