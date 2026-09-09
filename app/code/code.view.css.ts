namespace $.$$ {

	/**
	 * Code does not wrap. Ever.
	 *
	 * `$mol_textarea` is `white-space: pre-wrap` with `word-break: break-word`,
	 * which is right for prose and wrong for a declaration: in the panel at 1440
	 * with all three open a line holds about 35 characters, and
	 * `Map $bog_vmap_part_map zoom <= calc_result` broke across two — a break that
	 * looks like a second property. So the panel scrolls sideways instead.
	 *
	 * Through `$mol_style_attach` and scoped under this panel, NOT
	 * `$mol_style_define` on `$mol_textarea`: that one would repaint every textarea
	 * of the pack, the document's own included. And through raw text because the
	 * two layers that have to agree — the highlighted view and the real `textarea`
	 * over it — are sub-views of a foreign class, not classes of their own, so the
	 * typed form has no key for them.
	 *
	 * BOTH layers or neither: they overlay each other pixel for pixel, and a caret
	 * that wraps over a view that does not is a caret in the wrong place. The view
	 * and the edit both take `white-space: inherit` from the box, so the first rule
	 * moves them together; the second gives the edit the full scrolled width, or it
	 * would stay the width of the box and slide out from under the text.
	 */
	$mol_style_attach( '$bog_vmap_app_code', `
		[bog_vmap_app_code] [mol_textarea] {
			white-space: pre;
			word-break: normal;
			overflow-x: auto;
		}
		[bog_vmap_app_code] [mol_textarea_edit] {
			min-width: 100%;
			width: max-content;
		}
	` )

	$mol_style_define( $bog_vmap_app_code, {

		/** A side panel like the inspector: takes the height of whatever holds it. */
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
			 * The tabs are as wide as their three words and no wider.
			 *
			 * `$mol_check_list` is `flex: 1 1 auto`, so in a page it fills a line and
			 * that is right; in a panel of twenty-odd rems it became a bar of 280 to
			 * 370 px with «view.tree JS CSS» huddled at one end of it. Measured on
			 * the deploy. The options themselves never stretched — `$mol_check` is
			 * `flex: 0 0 auto` — so it is the bar around them that has to stop.
			 */
			'$mol_switch': {
				alignSelf: 'flex-start',
				flex: { grow: 0 },
			},

		},

	} )

}
