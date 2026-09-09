namespace $.$$ {

	$mol_style_define( $bog_vmap_app_inspect, {

		/**
		 * Grows into whatever holds it instead of claiming the viewport: on the
		 * stand that is the full height, in the editor it is a side panel.
		 */
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

		/**
		 * A field that reads as the heading it replaced until it is touched: the
		 * name is the first thing the panel says, and a heavy input at the top of a
		 * narrow panel would make it the loudest.
		 */
		Title: {
			font: { family: 'monospace', weight: 'bold' },
			background: { color: 'transparent' },
			padding: 0,
		},

		/** The refusal, where the eye already is: right under the name it is about. */
		Note: {
			color: '#c0392b',
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

		Rows: {
			flex: { direction: 'column' },

			/**
			 * While the pack is loading `$mol_view` marks the node and paints its
			 * waiting animation but leaves it empty, and an empty pulsing rectangle
			 * says nothing to a person waiting 600 ms. `::before`, not `::after`: a
			 * suspended view keeps the children of its last successful render, and
			 * anything placed at the end of a long list is far below the fold.
			 */
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

		/**
		 * Below the width the two panes need, they stack instead of shrinking. Side
		 * by side is the point of the stand — the edit and the line it moves in one
		 * glance — but at half the width neither pane is readable, and stacked they
		 * both still are.
		 */
		'@media': {
			'(max-width: 60rem)': {
				flexDirection: 'column',
				Source: {
					width: 'auto',
					borderRight: 'none',
					border: { bottom: { width: '1px', style: 'solid', color: $mol_theme.line } },
				},
				// The source is the reference here, not the work surface, so stacked
				// it gives the inspector the screen and keeps a few lines for itself.
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
