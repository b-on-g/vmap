namespace $.$$ {

	$mol_style_define( $bog_vmap_app_code, {

		/** Takes the height of whatever holds it, like the inspector. */
		flex: { direction: 'column', grow: 1, shrink: 1 },
		minHeight: 0,
		minWidth: 0,
		background: { color: $mol_theme.back },
		color: $mol_theme.text,

		Head: {
			flex: { shrink: 0 },
		},

		Scope_note: {
			flex: { grow: 1 },
			font: { family: 'monospace', size: '.8rem' },
			color: $mol_theme.shade,
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
		},

		/** The scene spoke about this node: loud, unlike the ordinary hints. */
		Alarm: {
			flex: { shrink: 0 },
			padding: $mol_gap.text,
			background: { color: $mol_theme.back },
			color: $mol_theme.focus,
			font: { size: '.75rem' },
			whiteSpace: 'pre-wrap',
		},

		Refusal: {
			flex: { shrink: 0 },
			padding: $mol_gap.text,
			color: $mol_theme.shade,
			font: { size: '.75rem' },
			whiteSpace: 'pre-wrap',
		},

		/** A warning, not a failure: the document works, the export would not. */
		Typing: {
			flex: { direction: 'column', shrink: 0 },
			gap: '.25rem',
			padding: $mol_gap.text,
			color: $mol_theme.shade,
			font: { size: '.75rem' },
			whiteSpace: 'normal',
		},

		/** The three fields fill what is left; without this the deck sizes to its text. */
		Sources: {
			flex: { direction: 'column', grow: 1, shrink: 1 },
			minHeight: 0,

			/**
			 * The tabs are as wide as their three words and no wider. The switch of
			 * mol is `flex: 1 1 auto`, so in a page it fills a line and that is
			 * right; in a panel of twenty-odd rems it becomes a bar three times the
			 * width of its labels with them huddled at one end. The options
			 * themselves never stretch — a check is `flex: 0 0 auto` — so it is the
			 * bar around them that has to stop.
			 */
			'$mol_switch': {
				alignSelf: 'flex-start',
				flex: { grow: 0 },
			},

		},

	} )

}
