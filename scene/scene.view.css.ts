namespace $.$$ {

	$mol_style_define( $bog_vmap_scene, {

		flex: { direction: 'column' },
		align: { items: 'flex-start' },
		background: { color: 'transparent' },

		Stage: {
			flex: { direction: 'column' },
			align: { items: 'flex-start' },
			transformOrigin: '0 0',

			// `[mol_view]` animates `transform` over .2s, and a camera that
			// lags a fifth of a second behind the pointer is not a camera.
			transition: 'none',
		},

		// The page of the scene is deliberately transparent, so this note has no
		// ground of its own and lies straight on the grid of the host. It needs a
		// card and full contrast text: `$mol_theme.shade` was measured on screen
		// and came out unreadable over the canvas.
		Wait: {
			padding: $mol_gap.block,
			maxWidth: '22rem',
			color: $mol_theme.text,
			background: { color: $mol_theme.card },
			border: { radius: $mol_gap.round },
			boxShadow: '0 .125rem .75rem rgba(0,0,0,.2)',
			whiteSpace: 'normal',
			overflowWrap: 'anywhere',
		},

	} )

}
