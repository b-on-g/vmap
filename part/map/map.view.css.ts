namespace $.$$ {

	$mol_style_define( $bog_vmap_part_map, {

		// A fixed box: a map without a size is a map nobody sees on the canvas
		width: '20rem',
		height: '14rem',

		// And never wider than what holds it: inside an artboard narrower than the
		// box the fixed width would run past the edge of the page.
		maxWidth: '100%',

		/**
		 * A FLOOR OF ITS OWN, and `0` here was the whole of the defect: dropped free
		 * on the canvas the map came out 0 wide and 224 tall — the height applied,
		 * the width collapsed. A free part is placed absolutely inside the root of
		 * the document, whose own width is nothing, so `max-width: 100%` resolves to
		 * zero; and a minimum of zero has nothing to stop it, while a real minimum
		 * wins over any maximum by the rules of CSS.
		 *
		 * A detail carries its own floor rather than borrowing one: inside a
		 * container it had `min-width: 320px` from the container and looked fine,
		 * which is exactly why nobody saw this until one was put down on its own.
		 */
		minWidth: '12rem',

		border: { radius: $mol_gap.round },
		boxShadow: `0 0 0 1px ${ $mol_theme.line }`,
		overflow: 'hidden',

	} )

}
