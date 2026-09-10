namespace $ {
	export type $bog_vmap_app_pane_screen_box = {
		readonly left: number
		readonly top: number
		readonly width: number
		readonly height: number
	}

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
