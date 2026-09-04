namespace $ {

	/** A rectangle in world units. Same shape the bridge reports geometry in. */
	export type $bog_vmap_scene_box = {
		readonly x: number
		readonly y: number
		readonly width: number
		readonly height: number
	}

	/**
	 * Which free parts the scene has to draw for a given viewport.
	 *
	 * Pure arithmetic, deliberately kept out of the view: this is the whole of the
	 * culling decision, and a decision worth testing is worth being able to test
	 * without a DOM, a camera or a compiled document.
	 *
	 * **Culling decides what is DRAWN and never what is STORED.** Nothing here
	 * touches the document, and nothing it returns is written back anywhere: the
	 * source of a document must not depend on where the camera happens to point,
	 * not by a byte. That is the first invariant of the feature and the reason this
	 * function takes geometry and returns names, rather than taking a document.
	 *
	 * @param spots where the host placed each part, world coordinates
	 * @param sizes last measured box of each part, by the same names
	 * @param view world rectangle currently on screen
	 * @param slack world units added to every side of the viewport
	 */
	export function $bog_vmap_scene_shown(
		spots: { readonly [ name: string ]: { readonly x: number, readonly y: number } },
		sizes: { readonly [ name: string ]: $bog_vmap_scene_box },
		view: $bog_vmap_scene_box,
		slack: number,
		names: readonly string[],
	) {

		const left = view.x - slack
		const top = view.y - slack
		const right = view.x + view.width + slack
		const bottom = view.y + view.height + slack

		const shown = new Set< string >()

		for( const name of names ) {

			const size = sizes[ name ]
			const spot = spots[ name ]

			// Nothing is known about it, so nothing may be concluded. A part hidden
			// on a guess would never be drawn, never be measured, and so never stop
			// being a guess — the one failure this function must not be able to
			// produce. Unknown means shown.
			if( !size && !spot ) {
				shown.add( name )
				continue
			}

			// A placed part that has never been measured counts as a point. It is
			// drawn as soon as it comes near, gets measured there, and from the next
			// round on is judged by its real box — which is why `slack` has to be
			// wider than a node, not merely non-zero.
			const x = spot ? spot.x : size!.x
			const y = spot ? spot.y : size!.y
			const width = size ? size.width : 0
			const height = size ? size.height : 0

			if( x > right ) continue
			if( y > bottom ) continue
			if( x + width < left ) continue
			if( y + height < top ) continue

			shown.add( name )

		}

		return shown
	}

	/**
	 * The world rectangle a viewport covers under a camera.
	 *
	 * The camera is the world point at the top left plus an isotropic zoom, so the
	 * world is `screen / zoom` wide. A zoom of zero would make that infinite, and
	 * the host clamps it well away from there, but a division that can produce
	 * `Infinity` on a message from outside is not worth leaving open.
	 */
	export function $bog_vmap_scene_viewport(
		camera: { readonly x: number, readonly y: number, readonly zoom: number },
		screen: { readonly width: number, readonly height: number },
	): $bog_vmap_scene_box {

		const zoom = camera.zoom > 0 ? camera.zoom : 1

		return {
			x: camera.x,
			y: camera.y,
			width: screen.width / zoom,
			height: screen.height / zoom,
		}
	}

}
