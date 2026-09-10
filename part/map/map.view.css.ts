namespace $.$$ {

	$mol_style_define( $bog_vmap_part_map, {

		// A fixed box: a map without a size is a map nobody sees on the canvas
		width: '20rem',
		height: '14rem',

		// And never wider than what holds it: inside an artboard narrower than the
		// box the fixed width would run past the edge of the page.
		maxWidth: '100%',

		/**
		 * A FLOOR OF ITS OWN, and a floor of `0` is the whole of the defect: a free
		 * part is placed absolutely inside the root of the document, whose own width
		 * is nothing, so the ceiling above resolves to zero and the map comes out
		 * full height and no width at all. A minimum of zero has nothing to stop it,
		 * while a real minimum wins over any maximum by the rules of CSS.
		 *
		 * A detail carries its own floor rather than borrowing one: inside a
		 * container it takes the floor of the container and looks fine, which is why
		 * this shows up only on a part put down on its own.
		 */
		minWidth: '12rem',

		border: { radius: $mol_gap.round },
		boxShadow: `0 0 0 1px ${ $mol_theme.line }`,
		overflow: 'hidden',

	} )

}
