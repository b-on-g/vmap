namespace $.$$ {

	$mol_style_define( $bog_vmap_app, {

		flex: { direction: 'column' },
		height: '100vh',

		/**
		 * The PAGE never scrolls; the panels scroll inside themselves.
		 *
		 * Without this a panel taller than the window pushed the document past
		 * `100vh`, the wheel over it moved the whole page, and the head bar — every
		 * button of the editor — went off the top of the screen. Seen on the deploy
		 * 09.09.2026 with the shelf open on a short window.
		 */
		overflow: 'hidden',

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

		/**
		 * THE CANVAS COMES FIRST WHEN THE ROOM RUNS OUT, and the three panels give
		 * way to it. Fixed widths did the opposite: 20, 22 and 28 rem never yielded,
		 * so with all three open on a 1440 px screen the canvas — the thing the
		 * editor is for — was left about 160 px. Measured on the deploy 09.09.2026.
		 *
		 * What gives the canvas its width is a floor on the canvas plus shrink on
		 * the panels. The floor makes the row ASK for more than the window has, and
		 * the overflow is then taken from whoever may shrink; each panel keeps a
		 * minimum of its own, so «yields» never becomes «vanishes».
		 *
		 * Below about 1200 px with all three panels open the floors no longer fit
		 * and the last panel is clipped: 12 plus 13 plus 22 rem of panels and 28 of
		 * canvas. That is the honest end of the trade, and the head bar folds any of
		 * the three away in one click. It was ~1090 until the code panel got a floor
		 * of 22 rem instead of 15 — code that does not wrap has to be readable
		 * without scrolling on a short line.
		 */
		Side: {
			flex: { direction: 'column', grow: 0, shrink: 1, basis: '20rem' },
			minWidth: '12rem',
			maxWidth: '20rem',
			minHeight: 0,
			border: { right: { width: '1px', style: 'solid', color: $mol_theme.line } },
		},

		/** Panel of the inspector. Mirror of `Side`, on the far edge. */
		Aside: {
			flex: { direction: 'column', grow: 0, shrink: 1, basis: '22rem' },
			minWidth: '13rem',
			maxWidth: '22rem',
			minHeight: 0,
			border: { left: { width: '1px', style: 'solid', color: $mol_theme.line } },
		},

		/**
		 * Wider than the inspector, and with a floor of its own: this one holds
		 * code, and code does not wrap — it scrolls sideways. A panel narrow enough
		 * to need scrolling on an ordinary declaration is a panel nobody reads in,
		 * so 22 rem, which holds the short ones whole.
		 */
		Code: {
			flex: { direction: 'column', grow: 0, shrink: 1, basis: '28rem' },
			minWidth: '22rem',
			maxWidth: '28rem',
			minHeight: 0,
			border: { left: { width: '1px', style: 'solid', color: $mol_theme.line } },
		},

		/**
		 * The canvas: takes everything left, and asks for a floor of its own so that
		 * there is something to take. Without the floor the row fits exactly, no
		 * panel is asked to shrink, and the canvas gets the remainder — which is how
		 * it came to 160 px.
		 */
		Pane: {
			flex: { grow: 1, shrink: 1 },
			minWidth: '28rem',
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

		/**
		 * The attention colour of the theme, filled, with the page colour for text.
		 * A red of our own stayed the same red in a light theme and in a dark one,
		 * and said nothing to a reader who had moved the hue.
		 */
		Alarm: {
			flex: { shrink: 0 },
			padding: $mol_gap.text,
			background: { color: $mol_theme.focus },
			color: $mol_theme.back,
			font: { family: 'monospace', size: '.8rem' },
			whiteSpace: 'pre-wrap',
		},

		/**
		 * The OTHER accent of the theme, not the one the error strip uses, because
		 * this is not the same kind of news: the error says the document is wrong,
		 * this says the preview stopped and offers the one thing that helps. Two
		 * accents the theme already carries keep them apart without inventing a
		 * colour that ignores it.
		 */
		Stall: {
			flex: { direction: 'row', shrink: 0, wrap: 'wrap' },
			align: { items: 'center' },
			gap: $mol_gap.text,
			padding: $mol_gap.text,
			background: { color: $mol_theme.special },
			color: $mol_theme.back,
		},

		Stall_note: {
			flex: { grow: 1, shrink: 1 },
			minWidth: 0,
			font: { size: '.8rem' },
			whiteSpace: 'normal',
		},

		/**
		 * The accent of the stall and not of the error, because it is the same kind
		 * of news: the document works, and one thing about it does not. Wraps,
		 * unlike the error strip: these are sentences, not a stack.
		 */
		Export_note: {
			flex: { direction: 'column', shrink: 0 },
			gap: '.25rem',
			padding: $mol_gap.text,
			background: { color: $mol_theme.special },
			color: $mol_theme.back,
			font: { size: '.8rem' },
			whiteSpace: 'normal',
		},

		/**
		 * Only the text colour, so the button reads on the filled strip it stands on.
		 * Its own surface is left to the theme: a button already lights up on hover
		 * by itself, and a wash of our own painted over that.
		 */
		Stall_reload: {
			flex: { shrink: 0 },
			color: $mol_theme.back,
		},

	} )

}
