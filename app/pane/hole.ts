namespace $ {

	/** A rectangle in screen pixels of the pane. */
	export type $bog_vmap_app_pane_screen_box = {
		readonly left: number
		readonly top: number
		readonly width: number
		readonly height: number
	}

	/**
	 * A measured box in screen pixels of the pane.
	 *
	 * World to screen is `world * zoom + shift`, the same transform the scene puts
	 * on its stage; this is that transform done on the host, once, so that the
	 * selection ring and the hole in the overlay are cut from the same numbers.
	 */
	export function $bog_vmap_app_pane_screen(
		box: $bog_vmap_bridge_rect,
		zoom: number,
		shift: ArrayLike< number >,
	): $bog_vmap_app_pane_screen_box {
		return {
			left: box.x * zoom + shift[0],
			top: box.y * zoom + shift[1],
			width: box.width * zoom,
			height: box.height * zoom,
		}
	}

	/**
	 * The overlay with a rectangle cut out of it, as a `clip-path` value.
	 *
	 * The editor takes every pointer event on its overlay, so a live component
	 * under it never gets a real one. For the picked part that is undone here: the
	 * overlay is clipped to everything BUT the part's box, and inside the box the
	 * frame is the topmost thing on the page, so hover, scroll, text selection and
	 * dragging inside the component all work for real. Outside the box the overlay
	 * is whole and keeps its gestures; the ring and its handles are drawn around
	 * the hole, not in it, which is what makes them grabbable.
	 *
	 * `evenodd` is what turns the inner rectangle into a hole rather than a second
	 * fill. The outer ring is stated in percentages so that the value does not
	 * have to know how big the pane is and does not go stale when it resizes.
	 *
	 * `none` and not an absent key when nothing is picked: inline styles are
	 * written by `$mol_dom_render_styles`, which sets the keys it is given and
	 * removes nothing, so a key that disappears from the dictionary leaves its last
	 * value on the element.
	 */
	export function $bog_vmap_app_pane_hole( rect: $bog_vmap_app_pane_screen_box | null ) {

		if( !rect ) return 'none'

		const left = rect.left
		const top = rect.top
		const right = rect.left + rect.width
		const bottom = rect.top + rect.height

		return 'polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, '
			+ `${ left }px ${ top }px, ${ right }px ${ top }px, `
			+ `${ right }px ${ bottom }px, ${ left }px ${ bottom }px, ${ left }px ${ top }px)`
	}

}
