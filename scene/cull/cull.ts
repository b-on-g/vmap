namespace $ {

	export type $bog_vmap_scene_cull_box = {
		readonly x: number
		readonly y: number
		readonly width: number
		readonly height: number
	}

	export function $bog_vmap_scene_cull(
		spots: { readonly [ name: string ]: { readonly x: number, readonly y: number } },
		sizes: { readonly [ name: string ]: $bog_vmap_scene_cull_box },
		view: $bog_vmap_scene_cull_box,
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

			if( !size && !spot ) {
				shown.add( name )
				continue
			}

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

	export function $bog_vmap_scene_cull_viewport(
		camera: { readonly x: number, readonly y: number, readonly zoom: number },
		screen: { readonly width: number, readonly height: number },
	): $bog_vmap_scene_cull_box {

		const zoom = camera.zoom > 0 ? camera.zoom : 1

		return {
			x: camera.x,
			y: camera.y,
			width: screen.width / zoom,
			height: screen.height / zoom,
		}
	}

}
