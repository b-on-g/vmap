namespace $ {

	/** Modifier keys of the click, named as `MouseEventInit` names them. */
	export type $bog_vmap_scene_click_mods = {
		readonly altKey: boolean
		readonly ctrlKey: boolean
		readonly metaKey: boolean
		readonly shiftKey: boolean
	}

	/**
	 * What is under the point. The shape of a DOM element, and only the part of
	 * it this needs, so a test can hand in a plain object.
	 */
	export type $bog_vmap_scene_click_target = {
		readonly tabIndex?: number
		readonly isContentEditable?: boolean
		readonly parentElement?: $bog_vmap_scene_click_target | null
		focus?(): void
		dispatchEvent( event: Event ): boolean
	}

	/** The window the document lives in, again only as far as this needs it. */
	export type $bog_vmap_scene_click_realm = {
		readonly document: {
			elementFromPoint( x: number, y: number ): $bog_vmap_scene_click_target | null
		}
		readonly PointerEvent?: new( type: string, init?: PointerEventInit ) => Event
		readonly MouseEvent: new( type: string, init?: MouseEventInit ) => Event
	}

	/**
	 * Replays a click the host overlay took on the element under the point.
	 *
	 * The overlay takes every gesture so that the editor's own state — selection,
	 * dragging, the camera — cannot be forged or hidden by document code. The price
	 * is that a real click never reaches the sandbox, and this is where it is paid
	 * back: the host relays the point, the scene finds the element and hands it
	 * `pointerdown`, `pointerup` and `click`, bubbling, so anything listening on the
	 * element or above it fires as it would for a real press.
	 *
	 * Focus is given by hand, because it is the default action of a real
	 * `mousedown` and synthetic events run no default actions. The focus goes to
	 * the nearest focusable ancestor of the target, which is how a real click
	 * focuses a button by its label: `tabIndex` is `-1` on anything not focusable
	 * and `0` or more on anything that is, natively or by attribute. Once the
	 * element is focused, the keyboard follows into the frame on its own.
	 *
	 * Between `pointerdown` and `pointerup`, as in the real sequence. Nothing is
	 * dispatched when the point hits nothing, and that is the only way out.
	 *
	 * @param x client coordinate in the realm's own viewport
	 * @param y client coordinate in the realm's own viewport
	 * @returns the element the events went to, or `null` when there was none
	 */
	export function $bog_vmap_scene_click(
		realm: $bog_vmap_scene_click_realm,
		x: number,
		y: number,
		mods: $bog_vmap_scene_click_mods,
	) {

		const target = realm.document.elementFromPoint( x, y )
		if( !target ) return null

		// A realm with no `PointerEvent` — an old engine, a bare test DOM — still gets
		// the events, as plain mouse events under the pointer names. Every listener
		// that reads `clientX` or a modifier is served either way.
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
