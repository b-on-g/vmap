namespace $.$$ {
	$mol_style_define( $bog_vmap_app_pane, {
		position: 'relative',
		flex: { grow: 1 },
		overflow: 'hidden',
		background: { color: $mol_theme.back },

		Scene: {
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			border: { style: 'none' },
			background: { color: 'transparent' },
		},

		Overlay: {
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
		},

		Insert: {
			position: 'absolute',
			background: { color: $mol_theme.focus },
			pointerEvents: 'none',
		},

		Band: {
			position: 'absolute',
			outline: '1px solid ' + String( $mol_theme.focus ),
			background: { color: $mol_theme.hover },
			pointerEvents: 'none',
		},

		Marks: {
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			pointerEvents: 'none',
		},

		Mark: {
			position: 'absolute',
			transform: 'translate(-50%, -50%)',
			width: '1rem',
			height: '1rem',
			borderRadius: '50%',
			flex: { direction: 'row' },
			justifyContent: 'center',
			alignItems: 'center',
			background: { color: $mol_theme.focus },
			color: $mol_theme.card,
			font: { size: '.75rem', weight: 'bolder' },
			pointerEvents: 'auto',
		},

	} )

	$mol_style_define( $bog_vmap_app_pane_overlay, {
		pointerEvents: 'auto',

		Frame: {
			position: 'absolute',

			outline: '1px solid ' + String( $mol_theme.focus ),
			outlineOffset: '1px',

			pointerEvents: 'none',

			transition: 'none',

		},

	} )

	$mol_style_define( $bog_vmap_app_pane_handle, {
		position: 'absolute',
		width: '8px',
		height: '8px',
		background: { color: $mol_theme.focus },
		pointerEvents: 'none',
		transition: 'none',

		'@': {
			bog_vmap_app_pane_handle_corner: {
				nw: { left: '-8px', top: '-8px' },
				ne: { right: '-8px', top: '-8px' },
				sw: { left: '-8px', bottom: '-8px' },
				se: { right: '-8px', bottom: '-8px' },
			},
		},

	} )

}
