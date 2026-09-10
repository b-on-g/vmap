namespace $.$$ {

	$mol_style_define( $bog_vmap_scene, {

		/**
		 * The frame paints its own ground now.
		 *
		 * It used to be transparent so the host grid showed through, and that is
		 * what could not be kept: a frame with no `color-scheme` is transparent only
		 * until something inside it takes a compositing layer — the camera transform
		 * on `Stage` does — and from then on the browser fills it with a pale base of
		 * its own. Measured in a live window, not under automation. Declaring the
		 * scheme in `index.html` settles the base; painting the theme colour here
		 * makes the canvas the same tone as the editor around it instead of whatever
		 * the browser picked.
		 */
		position: 'relative',
		width: '100%',
		height: '100%',
		overflow: 'hidden',
		background: { color: $mol_theme.back },

		flex: { direction: 'column' },
		align: { items: 'flex-start' },

		/**
		 * Under the document, and said with a number rather than left to chance:
		 * `Grid` is positioned and `Stage` is transformed, so both paint in the same
		 * layer and DOM order alone would decide. Figma keeps its grid beneath the
		 * content and so do we — the whole point of moving the grid in here was to
		 * keep that order, not to invert it.
		 */
		Grid: {
			position: 'absolute',
			top: 0,
			left: 0,
			zIndex: 0,
			width: '100%',
			height: '100%',
			fill: 'none',
			// `stroke` comes from CSSStyleDeclaration and is plain `string` there.
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

			// `[mol_view]` animates `transform` over .2s, and a camera that
			// lags a fifth of a second behind the pointer is not a camera.
			transition: 'none',
		},

		// The note lies over the canvas and its grid, so it needs a ground of its
		// own and full contrast text: the shade token of the theme was measured on
		// screen and came out unreadable over the canvas.
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
