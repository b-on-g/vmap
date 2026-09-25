namespace $.$$ {
	$mol_style_define( $bog_vmap_app_pane, {
		position: 'relative',
		flex: { grow: 1 },
		overflow: 'hidden',
		'--bog_vmap_board': `color-mix( in oklch, ${ $mol_theme.back }, ${ $mol_theme.shade } 25% )`,
		background: { color: $mol_style_func.vary( '--bog_vmap_board' ) },

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

		Draft: {
			position: 'absolute',
			outline: '1px solid ' + String( $mol_theme.focus ),
			pointerEvents: 'none',
			transition: 'none',
		},

		Guide: {
			position: 'absolute',
			background: { color: $mol_theme.special },
			pointerEvents: 'none',
			transition: 'none',
		},

		Ruler: {
			position: 'absolute',
			overflow: 'hidden',
			background: { color: $mol_theme.back },
			color: $mol_theme.shade,
			font: { size: '.625rem' },
			pointerEvents: 'none',
			transition: 'none',
			zIndex: 2,
		},

		Tick: {
			position: 'absolute',
			padding: [ 0, '.125rem' ],
			whiteSpace: 'pre',
			transition: 'none',
		},

		Span: {
			position: 'absolute',
			background: { color: $mol_theme.focus },
			opacity: .35,
			transition: 'none',
		},

		Gap: {
			position: 'absolute',
			padding: [ 0, '.25rem' ],
			font: { size: '.75rem' },
			lineHeight: '1rem' as const,
			color: $mol_theme.back,
			background: { color: $mol_theme.special },
			borderRadius: String( $mol_gap.round ),
			pointerEvents: 'none',
			transition: 'none',
			transform: 'translate(-50%, -50%)',
			whiteSpace: 'pre',
		},

		Ghost: {
			position: 'absolute',
			outline: '1px dashed ' + String( $mol_theme.focus ),
			outlineOffset: '1px',
			background: { color: $mol_theme.hover },
			pointerEvents: 'none',
			transition: 'none',
		},

		'@': {
			bog_vmap_app_pane_tool: {
				board: { cursor: 'crosshair' },
			},
			bog_vmap_app_pane_hand: {
				true: { cursor: 'grab' },
			},
		},

		Values: {
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			pointerEvents: 'none',
		},

		Names: {
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			pointerEvents: 'none',
		},

		Name: {
			position: 'absolute',
			transform: 'translateY(-100%)',
			transition: 'none',
			maxWidth: '20rem',
			padding: { bottom: '.125rem', right: '.5rem' },
			color: $mol_theme.shade,
			font: { size: '.75rem' },
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			cursor: 'default',
			pointerEvents: 'auto',

			'@': {
				bog_vmap_app_pane_name_picked: {
					true: { color: $mol_theme.focus },
				},
			},

		},

		Name_field: {
			position: 'absolute',
			transform: 'translateY(-100%)',
			transition: 'none',
			width: '10rem',
			font: { size: '.75rem' },
			pointerEvents: 'auto',
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

		Text_new: {
			position: 'absolute',

			background: { color: $mol_theme.card },
			outline: '1px solid ' + String( $mol_theme.focus ),

			padding: { left: '0px', right: '0px', top: '0px', bottom: '0px' },

			transition: 'none',
			zIndex: 3,
		},

		Text_field: {
			position: 'absolute',

			background: { color: $mol_theme.card },
			outline: '1px solid ' + String( $mol_theme.focus ),

			padding: { left: '0px', right: '0px', top: '0px', bottom: '0px' },

			transition: 'none',
			zIndex: 3,
		},

		Say: {
			position: 'absolute',

			padding: { left: '6px', right: '6px', top: '2px', bottom: '2px' },
			margin: { top: '8px' },

			maxWidth: '320px',

			background: { color: $mol_theme.card },
			color: $mol_theme.text,
			border: { radius: '4px' },
			box: { shadow: [ { x: 0, y: '2px', blur: '8px', spread: 0, color: $mol_theme.shade } ] },

			font: { size: '12px' },

			pointerEvents: 'none',
			transition: 'none',
			zIndex: 3,
		},

		Sizing: {
			position: 'absolute',

			padding: { left: '6px', right: '6px', top: '2px', bottom: '2px' },
			margin: { left: '8px', top: '8px' },

			background: { color: $mol_theme.focus },
			color: $mol_theme.card,

			font: { size: '12px' },
			whiteSpace: 'nowrap',

			pointerEvents: 'none',
			transition: 'none',
			zIndex: 3,
		},

	} )

	$mol_style_define( $bog_vmap_app_pane_label, {
		position: 'absolute',
		maxWidth: '20rem',
		margin: { top: '.25rem' },
		padding: { top: '.125rem', right: '.25rem', bottom: '.125rem', left: '.25rem' },
		borderRadius: String( $mol_gap.round ),
		background: { color: $mol_theme.card },
		color: $mol_theme.text,
		font: { size: '.6875rem', family: 'monospace' },
		pointerEvents: 'none',
		overflow: 'hidden',

		Row: {
			flex: { direction: 'row' },
			gap: '.5rem',
			whiteSpace: 'nowrap',
		},

		Cell: {
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			color: $mol_theme.shade,
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

		Inner: {
			position: 'absolute',

			outline: '1px dashed ' + String( $mol_theme.focus ),
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
		pointerEvents: 'auto',
		transition: 'none',

		'@': {
			bog_vmap_app_pane_handle_corner: {
				nw: { left: '-8px', top: '-8px', cursor: 'nwse-resize' },
				n: { left: '50%', top: '-8px', marginLeft: '-4px', cursor: 'ns-resize' },
				ne: { right: '-8px', top: '-8px', cursor: 'nesw-resize' },
				e: { right: '-8px', top: '50%', marginTop: '-4px', cursor: 'ew-resize' },
				se: { right: '-8px', bottom: '-8px', cursor: 'nwse-resize' },
				s: { left: '50%', bottom: '-8px', marginLeft: '-4px', cursor: 'ns-resize' },
				sw: { left: '-8px', bottom: '-8px', cursor: 'nesw-resize' },
				w: { left: '-8px', top: '50%', marginTop: '-4px', cursor: 'ew-resize' },
			},
		},

	} )

}
