namespace $ {

	export type $bog_vmap_scene_click_mods = {
		readonly altKey: boolean
		readonly ctrlKey: boolean
		readonly metaKey: boolean
		readonly shiftKey: boolean
	}

	export type $bog_vmap_scene_click_target = {
		readonly tabIndex?: number
		readonly isContentEditable?: boolean
		readonly parentElement?: $bog_vmap_scene_click_target | null
		focus?(): void
		dispatchEvent( event: Event ): boolean
	}

	export type $bog_vmap_scene_click_realm = {
		readonly document: {
			elementFromPoint( x: number, y: number ): $bog_vmap_scene_click_target | null
		}
		readonly PointerEvent?: new( type: string, init?: PointerEventInit ) => Event
		readonly MouseEvent: new( type: string, init?: MouseEventInit ) => Event
	}

	export function $bog_vmap_scene_click(
		realm: $bog_vmap_scene_click_realm,
		x: number,
		y: number,
		mods: $bog_vmap_scene_click_mods,
	) {

		const target = realm.document.elementFromPoint( x, y )
		if( !target ) return null

		const Pointer = realm.PointerEvent ?? realm.MouseEvent

		const common: MouseEventInit = {
			bubbles: true,
			cancelable: true,
			composed: true,
			clientX: x,
			clientY: y,
			button: 0,
			... mods,
		}

		const pointer: PointerEventInit = {
			... common,
			pointerId: 1,
			pointerType: 'mouse',
			isPrimary: true,
		}

		target.dispatchEvent( new Pointer( 'pointerdown', { ... pointer, buttons: 1 } ) )

		for( let el: $bog_vmap_scene_click_target | null | undefined = target; el; el = el.parentElement ) {
			if( ( el.tabIndex ?? -1 ) < 0 && !el.isContentEditable ) continue
			el.focus?.()
			break
		}

		target.dispatchEvent( new Pointer( 'pointerup', { ... pointer, buttons: 0 } ) )
		target.dispatchEvent( new realm.MouseEvent( 'click', { ... common, buttons: 0, detail: 1 } ) )

		return target
	}

}
