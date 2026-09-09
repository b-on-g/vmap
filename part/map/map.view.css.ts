namespace $.$$ {

	$mol_style_define( $bog_vmap_part_map, {

		// A fixed box: a map without a size is a map nobody sees on the canvas
		width: '20rem',
		height: '14rem',

		// And never wider than what holds it: inside an artboard narrower than the
		// box the fixed width would run past the edge of the page.
		maxWidth: '100%',
		minWidth: 0,

		border: { radius: $mol_gap.round },
		boxShadow: `0 0 0 1px ${ $mol_theme.line }`,
		overflow: 'hidden',

	} )

}
