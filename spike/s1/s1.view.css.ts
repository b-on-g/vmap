namespace $ {

	$mol_style_define( $bog_vmap_spike_s1, {

		flex: { grow: 1 },
		height: '100vh',
		gap: $mol_gap.space,
		padding: $mol_gap.space,
		background: { color: $mol_theme.back },

		Editors: {
			flex: { basis: 0, grow: 3, shrink: 1 },
			background: { color: $mol_theme.card },
			border: { radius: $mol_gap.round },
		},

		Editors_list: {
			flex: { grow: 1 },
			padding: $mol_gap.block,
			gap: $mol_gap.block,
		},

		Head: {
			font: { weight: 'bold' },
		},

		Status: {
			color: $mol_theme.shade,
		},

		Stage: {
			flex: { basis: 0, grow: 2, shrink: 1 },
			background: { color: $mol_theme.card },
			border: { radius: $mol_gap.round },
		},

		Stage_body: {
			flex: { grow: 1, direction: 'column' },
			padding: $mol_gap.block,
		},

	} )

}
