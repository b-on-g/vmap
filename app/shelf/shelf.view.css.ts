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
