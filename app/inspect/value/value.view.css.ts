namespace $.$$ {

	$mol_style_define( $bog_vmap_app_inspect_value_area, {
		resize: 'vertical',
	} )

	$mol_style_define( $bog_vmap_app_inspect_value_seq, {

		Items: {
			padding: { left: '.6rem' },
			border: { left: { width: '1px', style: 'solid', color: $mol_theme.line } },
		},

	} )

	$mol_style_define( $bog_vmap_app_inspect_value_item, {

		flex: { wrap: 'wrap' },
		gap: $mol_gap.text,

		Key: {
			flex: { grow: 1, shrink: 1, basis: '6rem' },
			minWidth: '6rem',
		},

		Value: {
			flex: { grow: 999, shrink: 1, basis: '8rem' },
			minWidth: '8rem',
		},

	} )

}
