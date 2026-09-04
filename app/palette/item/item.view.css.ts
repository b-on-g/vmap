namespace $.$$ {

	/**
	 * A row of the class list. Exists as a class of its own only so that the
	 * «picked» attribute is part of a declared interface: a style block for a
	 * re-typed `$mol_button_minor` is checked against the ports of
	 * `$mol_button_minor`, and an attribute the button never heard of does not
	 * type check there.
	 */
	$mol_style_define( $bog_vmap_app_palette_item, {

		justify: { content: 'flex-start' },

		// `$mol_button_typed` asks for a 40 px tap target; a palette row is a line
		// of text, and at 40 px a third of the list fits on screen
		minHeight: '1.5rem',
		minWidth: 0,

		padding: { top: '.15rem', bottom: '.15rem', left: $mol_gap.text, right: $mol_gap.text },
		border: { radius: 0 },
		font: { family: 'monospace', size: '.8rem' },
		textAlign: 'left',

		// A press that turns into a drag would otherwise start selecting the name
		userSelect: 'none',
		touchAction: 'none',

		'@': {
			bog_vmap_app_palette_item_current: {
				true: {
					background: { color: $mol_theme.hover },
					color: $mol_theme.current,
					font: { weight: 'bold' },
				},
			},
		},

	} )

}
