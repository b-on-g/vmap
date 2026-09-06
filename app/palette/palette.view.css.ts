namespace $.$$ {

	$mol_style_define( $bog_vmap_app_palette, {

		/**
		 * Grows into whatever holds it instead of claiming the viewport: on its own
		 * page that is the full height, in the editor it is a side panel. `100vh`
		 * would have made the panel taller than the window it lives in.
		 */
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

		Links: {
			flex: { grow: 1 },
			minWidth: '14rem',
			background: { color: $mol_theme.field },
			font: { family: 'monospace', size: '.8rem' },
		},

		/**
		 * Refused links under the field. Rendered only while there is something to
		 * say, so it never takes room from the list on a clean field.
		 */
		Note: {
			flex: { shrink: 0 },
			padding: { top: '.25rem', bottom: '.25rem', left: $mol_gap.text, right: $mol_gap.text },
			color: $mol_theme.focus,
			font: { family: 'monospace', size: '.75rem' },
			whiteSpace: 'pre-wrap',
			border: { bottom: { width: '1px', style: 'solid', color: $mol_theme.line } },
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
			whiteSpace: 'nowrap',
		},

		/**
		 * `shrink: 1` is not decoration. `[mol_view]` ships `flex-shrink: 0`, so with
		 * `grow` alone this row keeps the height of its own content — 449 rows, about
		 * 11000 px — and `minHeight: 0` cannot help, because there is nothing shrinking
		 * for it to release. The scroll then never scrolls and the whole page grows a
		 * scrollbar instead.
		 */
		Body: {
			flex: { direction: 'row', grow: 1, shrink: 1 },
			minHeight: 0,
		},

		Classes: {
			flex: { shrink: 0 },
			width: '22rem',
			border: { right: { width: '1px', style: 'solid', color: $mol_theme.line } },
		},

		/**
		 * While the pack is loading `$mol_view` marks the node `mol_view_error` and
		 * paints its waiting animation, but leaves it empty, and an empty pulsing
		 * rectangle says nothing to a person waiting 600 ms. The label goes in a
		 * pseudo element so the suspension itself stays untouched.
		 */
		Class_list: {
			flex: { direction: 'column' },
			minHeight: '6rem',
			padding: { top: $mol_gap.text, bottom: $mol_gap.text },

			'@': {
				mol_view_error: {
					Promise: {
						color: $mol_theme.shade,

						/**
						 * `::before`, not `::after`: a suspended view keeps the children
						 * of its last successful render, and 449 of them push anything
						 * placed at the end far below the fold. As the first flex item
						 * the label is on screen both on a cold start and on a change of
						 * pack. Centering it is no good either, that would drag the
						 * stale rows along and read as the list breaking.
						 */
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

		/**
		 * Side panel of the editor. The header stacks, the fields lose their minimum
		 * widths, and the class list takes the whole width because the ports pane is
		 * not rendered at all in this mode.
		 */
		'@': {
			bog_vmap_app_palette_compact: {
				true: {

					Head: {
						flex: { direction: 'column', wrap: 'nowrap' },
						align: { items: 'stretch' },
						gap: '.25rem',
					},

					Links: { minWidth: 0 },
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
