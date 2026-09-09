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

}
