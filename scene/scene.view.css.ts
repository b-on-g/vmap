namespace $.$$ {

	$mol_style_define( $bog_vmap_scene, {

		position: 'relative',
		width: '100%',
		height: '100%',
		overflow: 'hidden',
		background: { color: $mol_theme.back },

		flex: { direction: 'column' },
		align: { items: 'flex-start' },

		Grid: {
			position: 'absolute',
			top: 0,
			left: 0,
			zIndex: 0,
			width: '100%',
			height: '100%',
			fill: 'none',
			stroke: String( $mol_theme.line ),
			strokeWidth: '1px',
			pointerEvents: 'none',
		},

		Stage: {
			position: 'relative',
			zIndex: 1,
			flex: { direction: 'column' },
			align: { items: 'flex-start' },
			transformOrigin: '0 0',

			transition: 'none',
		},

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
