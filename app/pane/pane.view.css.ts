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

		/**
		 * The insertion line. Placed by the inline style in screen pixels, painted
		 * here, and never in the way: it is drawn over the frame and takes no pointer,
		 * because the gesture it belongs to is the overlay's.
		 */
		Insert: {
			position: 'absolute',
			background: { color: $mol_theme.focus },
			pointerEvents: 'none',
		},

		/**
		 * The band swept over the canvas. Placed by the inline style in screen
		 * pixels, painted here, and takes no pointer: the gesture drawing it is the
		 * overlay's, and a target here would swallow the release that ends it.
		 */
		Band: {
			position: 'absolute',
			outline: '1px solid ' + String( $mol_theme.focus ),
			background: { color: $mol_theme.hover },
			pointerEvents: 'none',
		},

		/** The layer of the marks: a frame of reference, not a box of its own. */
		Marks: {
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			pointerEvents: 'none',
		},

		/**
		 * A badge at the corner of a node the scene complained about. Takes the
		 * pointer, alone on this layer, so that the tooltip can be read at all.
		 */
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

		/**
		 * The overlay eats every pointer event; nothing reaches the scene by itself.
		 *
		 * Said explicitly although it is the default, because it used to be switched
		 * by an editor mode and is now a fixed fact of the layer: a click gets to the
		 * document by being relayed over the bridge, and the picked part alone gets
		 * real events through a hole cut by `clip-path` in the inline style.
		 */
		pointerEvents: 'auto',

		Frame: {

			position: 'absolute',

			/**
			 * `outline` and not `border`: a border would take part in the box the
			 * `width` and `height` above are setting, so the ring would sit a pixel
			 * inside the node on every side. An outline is drawn outside the box and
			 * changes nothing about it.
			 *
			 * Written as one string because a camelCase shorthand takes nothing else,
			 * and `String()` around the token because the focus colour of the theme is
			 * a style function object, not text. Both are TS2322 otherwise — and the WEB
			 * audit passes either way, only the node one catches it.
			 */
			outline: '1px solid ' + String( $mol_theme.focus ),
			outlineOffset: '1px',

			/**
			 * The ring is a picture, never a target. Left hittable it would take the
			 * press meant for the node it is drawn around, and a node once picked
			 * could not be picked again — or dragged.
			 */
			pointerEvents: 'none',

			/**
			 * `[mol_view]` animates `transform` for .2s, and the ring is positioned,
			 * not transformed, so it would not lag by itself. Said out loud because
			 * the camera above IS on a transform: whatever is added here later must
			 * not start animating, or the ring will trail the node it belongs to.
			 */
			transition: 'none',

		},

	} )

	/**
	 * Corner grips of the ring. Fully outside the box, because inside it the overlay
	 * is cut away and a grip drawn there would be clipped to nothing; outside, on
	 * the strip the hit test still counts as the part, they mark where it can be
	 * taken hold of. Sized to that strip.
	 */
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
