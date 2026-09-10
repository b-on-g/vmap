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

		/**
		 * SHRINKS — a flex child refuses to go below its content without being told
		 * it may, and the panel then grows the page instead of scrolling.
		 *
		 * And a FLOOR, which the second level below has too. Both halves shrink, so
		 * flex divides the squeeze between them by content instead of starving one;
		 * the floors make that independent of how much content either happens to
		 * hold. Together they are about twenty rems with the heading and the switch,
		 * which fits any window an editor is used in.
		 */
		Stack: {
			flex: { grow: 1, shrink: 1 },
			minHeight: '6rem',
		},

		/**
		 * A hand's width under the last row, so the bottom of the list clears the
		 * switch pinned below the stack instead of ending flush against it.
		 */
		Stack_body: {
			flex: { direction: 'column' },
			padding: { bottom: '2.5rem' },
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

		/**
		 * ONE SCROLL IN THE PANEL, and it is the stack above. Two scrolls one inside
		 * the other trap what is between them: the inner one runs out of travel
		 * while the outer is not at the bottom yet, and the last rows stay under the
		 * switch of the second level unreachable. So this list is as tall as it is
		 * and the stack scrolls it, because there is one thing that moves.
		 */
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

		/** A caption of a section, not a heading of the panel. */
		Apps_head: {
			padding: { left: $mol_gap.text, right: $mol_gap.text },
			color: $mol_theme.shade,
			font: { size: '.8rem' },
		},

		/**
		 * The height the scroll of the second level gets to work in: a list of mol
		 * virtualizes by the height of the scroll around it, so a level squeezed to
		 * nothing renders nothing and scrolls nowhere.
		 */
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
