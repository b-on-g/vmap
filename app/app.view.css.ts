namespace $.$$ {

	$mol_style_define( $bog_vmap_app, {

		flex: { direction: 'column' },
		height: '100vh',
		background: { color: $mol_theme.back },
		color: $mol_theme.text,

		Head: {
			flex: { direction: 'row', shrink: 0, wrap: 'wrap' },
			align: { items: 'center' },
			gap: $mol_gap.text,
			padding: $mol_gap.text,
			background: { color: $mol_theme.card },
			border: { bottom: { width: '1px', style: 'solid', color: $mol_theme.line } },
		},

		Brand: {
			font: { weight: 'bold' },
			padding: { right: $mol_gap.text },
		},

		Zoom_title: {
			minWidth: '3.5rem',
			justify: { content: 'center' },
			color: $mol_theme.shade,
		},

		/**
		 * A class name is long and is read as a whole: cut in the middle it says
		 * nothing about the folder it chooses. Wide enough for a name of three
		 * segments, and no growing — the toolbar wraps instead.
		 */
		Root_name: {
			minWidth: '14rem',
			flex: { grow: 0, shrink: 1 },
		},

		Status: {
			flex: { grow: 1 },
			justify: { content: 'flex-end' },
			color: $mol_theme.shade,
			font: { size: '.75rem' },
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
		},

		/**
		 * Everything under the toolbar, and the only row allowed to grow.
		 *
		 * Both properties are load bearing. `[mol_view]` is `display: flex` with
		 * `flex-shrink: 0`, so an unstyled row sizes itself by its tallest child and
		 * refuses to give the height back: with the palette inside, the page measured
		 * 11110 px tall behind a viewport that looked perfectly correct, and the only
		 * visible symptom was a scrollbar nobody expected.
		 */
		Body: {
			flex: { grow: 1, shrink: 1 },
			minHeight: 0,
		},

		/** Panel of the palette. Fixed width, so the canvas takes the rest. */
		Side: {
			flex: { direction: 'column', shrink: 0 },
			width: '20rem',
			minHeight: 0,
			border: { right: { width: '1px', style: 'solid', color: $mol_theme.line } },
		},

		/** Panel of the inspector. Mirror of `Side`, on the far edge. */
		Aside: {
			flex: { direction: 'column', shrink: 0 },
			width: '22rem',
			minHeight: 0,
			border: { left: { width: '1px', style: 'solid', color: $mol_theme.line } },
		},

		/** Wider than the inspector: this one holds code, and code wraps badly. */
		Code: {
			flex: { direction: 'column', shrink: 0 },
			width: '28rem',
			minHeight: 0,
			border: { left: { width: '1px', style: 'solid', color: $mol_theme.line } },
		},

		Idle: {
			padding: $mol_gap.block,
			color: $mol_theme.shade,
			font: { size: '.8rem' },
			whiteSpace: 'normal',
		},

		/**
		 * The class the pointer is carrying, drawn at the pointer.
		 *
		 * `fixed`, because the coordinates it is given are the raw `clientX`/`clientY`
		 * of the event. `pointer-events: none`, because it sits exactly under the
		 * pointer and would otherwise become the target of the moves that drive it —
		 * and, worse, of the `pointerup` that ends the drag. Offset down and right by
		 * a constant `transform` rather than by an offset in the coordinates: the
		 * world point of the drop must stay the point the person aimed at.
		 */
		Ghost: {
			position: 'fixed',
			zIndex: 100,
			pointerEvents: 'none',
			transform: 'translate(.75rem, .75rem)',
			padding: { top: '.25rem', bottom: '.25rem', left: $mol_gap.text, right: $mol_gap.text },
			background: { color: $mol_theme.card },
			border: { radius: $mol_gap.round, width: '1px', style: 'solid', color: $mol_theme.line },
			color: $mol_theme.control,
			font: { family: 'monospace', size: '.8rem' },
			whiteSpace: 'nowrap',
			box: { shadow: [[ 0, '.25rem', '.75rem', 0, $mol_style_func.hsla( 0, 0, 0, .5 ) ]] },
		},

		Alarm: {
			flex: { shrink: 0 },
			padding: $mol_gap.text,
			background: { color: '#c62828' },
			color: 'white',
			font: { family: 'monospace', size: '.8rem' },
			whiteSpace: 'pre-wrap',
		},

		/**
		 * Amber and not the red of `Alarm`, because it is not the same kind of news.
		 * Red says the document is wrong; this says the preview stopped and offers
		 * the one thing that helps.
		 */
		Stall: {
			flex: { direction: 'row', shrink: 0, wrap: 'wrap' },
			align: { items: 'center' },
			gap: $mol_gap.text,
			padding: $mol_gap.text,
			background: { color: '#8d6e00' },
			color: 'white',
		},

		Stall_note: {
			flex: { grow: 1, shrink: 1 },
			minWidth: 0,
			font: { size: '.8rem' },
			whiteSpace: 'normal',
		},

		/**
		 * Amber like `Stall` and not red like `Alarm`, because it is the same kind of
		 * news as the stall: the document itself works, and one thing about it does
		 * not. Wraps, unlike the error strip: these are sentences, not a stack.
		 */
		Export_note: {
			flex: { direction: 'column', shrink: 0 },
			gap: '.25rem',
			padding: $mol_gap.text,
			background: { color: '#8d6e00' },
			color: 'white',
			font: { size: '.8rem' },
			whiteSpace: 'normal',
		},

		Stall_reload: {
			flex: { shrink: 0 },
			color: 'white',
			background: { color: '#00000033' },
		},

	} )

}
