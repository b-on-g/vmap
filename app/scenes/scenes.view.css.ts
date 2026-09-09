namespace $.$$ {

	$mol_style_define( $bog_vmap_app_scenes, {

		/** A column at the top of the left panel, sized by its own content. */
		flex: { direction: 'column', shrink: 0 },
		gap: $mol_gap.space,
		padding: { bottom: $mol_gap.space },
		background: { color: $mol_theme.back },
		color: $mol_theme.text,
		border: { bottom: { width: '1px', style: 'solid', color: $mol_theme.line } },

		Head: {
			padding: $mol_gap.text,
			font: { weight: 'bold' },
			border: { bottom: { width: '1px', style: 'solid', color: $mol_theme.line } },
		},

		/**
		 * The list never eats the panel: past a handful of scenes it scrolls
		 * instead of pushing the shelf below the fold.
		 */
		List: {
			maxHeight: '12rem',
			overflow: { y: 'auto' },
		},

		/** A name of a document is prose, not a class name of the palette. */
		Scene_row: {
			font: { family: 'inherit', size: '.9rem' },
			minHeight: '1.75rem',
		},

		Title: {
			margin: { left: $mol_gap.space, right: $mol_gap.space },
			background: { color: $mol_theme.field },
		},

		Add: {
			margin: { left: $mol_gap.space, right: $mol_gap.space },
			justify: { content: 'flex-start' },
		},

	} )

}
