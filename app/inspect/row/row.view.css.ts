namespace $.$$ {

	$mol_style_define( $bog_vmap_app_inspect_row, {

		flex: { direction: 'column', shrink: 0 },
		gap: '.15rem',
		minWidth: 0,
		padding: { top: '.35rem', bottom: '.35rem', left: $mol_gap.text, right: $mol_gap.text },
		border: { bottom: { width: '1px', style: 'solid', color: $mol_theme.line } },

		Head: {
			flex: { direction: 'row', shrink: 0, wrap: 'nowrap' },
			align: { items: 'baseline' },
			gap: '.4rem',
			minWidth: 0,
		},

		Sign: {
			flex: { shrink: 1 },
			minWidth: 0,
			color: $mol_theme.current,
			font: { family: 'monospace', size: '.8rem', weight: 'bold' },
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap',
		},

		/**
		 * Which class declared the port. Empty on an own property, so the badge is
		 * the marker: the eye finds the few own properties among two dozen without
		 * reading a single name.
		 */
		Owner: {
			flex: { shrink: 0 },
			padding: { left: '.4rem', right: '.4rem' },
			border: { radius: $mol_gap.round },
			background: { color: $mol_theme.hover },
			color: $mol_theme.shade,
			font: { family: 'monospace', size: '.7rem' },
		},

		Tools: {
			flex: { direction: 'row', shrink: 0, grow: 1 },
			justify: { content: 'flex-end' },
			gap: '.1rem',
		},

		Key: {
			minHeight: '1.25rem',
			minWidth: '1.25rem',
			padding: { top: 0, bottom: 0, left: '.3rem', right: '.3rem' },
			color: $mol_theme.shade,
			font: { family: 'monospace', size: '.8rem' },
		},

		Next: {
			minHeight: '1.25rem',
			minWidth: '1.25rem',
			padding: { top: 0, bottom: 0, left: '.3rem', right: '.3rem' },
			color: $mol_theme.shade,
			font: { family: 'monospace', size: '.8rem' },
		},

		Drop: {
			minHeight: '1.25rem',
			minWidth: '1.25rem',
			padding: { top: 0, bottom: 0, left: '.3rem', right: '.3rem' },
			color: $mol_theme.shade,
			font: { size: '.7rem' },
		},

		/**
		 * `false` renders no attribute at all, `$mol_dom_render_attributes` drops
		 * it, so an own property is the plain state and only the inherited one is
		 * selectable. Written the other way round the rule would never match.
		 */
		'@': {
			bog_vmap_app_inspect_row_inherited: {
				true: {
					Sign: {
						color: $mol_theme.text,
						font: { weight: 'normal' },
					},
				},
			},
		},

	} )

}
