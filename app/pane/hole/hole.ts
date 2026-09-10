namespace $ {
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
