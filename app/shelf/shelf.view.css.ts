namespace $.$$ {

	$mol_style_define( $bog_vmap_app_shelf, {

		/**
		 * A column that grows into the panel holding it and never claims the
		 * viewport: `100vh` would make the panel taller than the window.
		 */
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

		/** The shelf itself takes the room it needs and no more; the rest is below. */
		Items: {
			flex: { shrink: 0 },
			padding: { top: $mol_gap.space, bottom: $mol_gap.space },
			gap: $mol_gap.space,
		},

		/**
		 * A card, not a line of text: the shelf holds a handful of things a person
		 * picks by name, while the class list below holds hundreds and is read as a
		 * list. Hence a normal font and a tap target instead of the monospace row
		 * the second level inherits from the palette.
		 */
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

		/**
		 * Refused links under the field. Rendered only while there is something to
		 * say, so it never takes room from the lists on a clean field.
		 */
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

		/** Why a file was not taken. Same voice and same place as the refusals above. */
		Import_note: {
			color: $mol_theme.focus,
			font: { size: '.75rem' },
			whiteSpace: 'pre-wrap',
		},

		/** The objects of the application, sized by their own number. */
		Apps: {
			flex: { direction: 'column', shrink: 0 },
			maxHeight: '14rem',
			overflow: { y: 'auto' },
			padding: { top: $mol_gap.space, bottom: $mol_gap.space },
			gap: $mol_gap.space,
		},

		/** Why an address brought nothing. Same voice as the refusals of the field. */
		Apps_note: {
			padding: { left: $mol_gap.text, right: $mol_gap.text },
			color: $mol_theme.focus,
			font: { size: '.75rem' },
			whiteSpace: 'pre-wrap',
		},

		/** A caption of a section, not a heading of the panel. */
		Apps_head: {
			padding: { left: $mol_gap.text, right: $mol_gap.text },
			color: $mol_theme.shade,
			font: { size: '.8rem' },
		},

		/** The switch of the second level, on the line between the two. */
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
