namespace $.$$ {

	$mol_style_define( $bog_vmap_app_inspect_flex, {

		flex: { direction: 'column' },
		padding: { top: $mol_gap.space, bottom: $mol_gap.space },
		gap: $mol_gap.space,

	} )

	$mol_style_define( $bog_vmap_app_inspect_flex_row, {

		flex: { direction: 'row' },
		align: { items: 'center' },
		gap: $mol_gap.space,

		Title: {
			flex: { basis: '6rem', shrink: 0 },
			color: $mol_theme.shade,
		},

		Field: {
			flex: { grow: 1 },
			// A panel of controls sits in a narrow column, and a $mol component
			// embedded in someone else's layout keeps its content width unless it is
			// told it may shrink.
			minWidth: 0,
		},

	} )

}
