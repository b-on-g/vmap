namespace $.$$ {

	$mol_style_define( $bog_vmap_spike_s2, {

		flex: {
			direction: 'row',
		},

		Left: {
			flex: {
				basis: '32rem',
				grow: 0,
				shrink: 0,
			},
			border: {
				right: {
					width: '1px',
					style: 'solid',
					color: $mol_theme.line,
				},
			},
		},

		Panel: {
			flex: {
				direction: 'column',
			},
			padding: $mol_gap.block,
			gap: $mol_gap.block,
		},

		Report: {
			font: {
				family: 'monospace',
				size: '0.75rem',
			},
			overflow: 'auto',
		},

		Tree_edit: {
			flex: {
				basis: '18rem',
				grow: 0,
				shrink: 0,
			},
		},

		Js_edit: {
			flex: {
				basis: '18rem',
				grow: 0,
				shrink: 0,
			},
		},

		Right: {
			flex: {
				grow: 1,
			},
		},

		Stage: {
			flex: {
				direction: 'column',
				grow: 1,
			},
			padding: $mol_gap.block,
		},

	} )

}
