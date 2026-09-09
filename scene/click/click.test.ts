namespace $ {

	/**
	 * The replay of a relayed click, on a fake realm.
	 *
	 * No real DOM is involved on purpose: what a real `$mol_button` inside the
	 * sandbox does with these events is a browser question, this is the contract
	 * the scene keeps towards it — which events, in which order, with what flags.
	 */

	type log = { type: string, init: PointerEventInit }

	/** A constructor that records what it was asked to make. */
	const recorder = ( log: log[] ) => class {
		type = ''
		constructor( type: string, init: PointerEventInit = {} ) {
			log.push({ type, init })
			this.type = type
		}
	} as unknown as new( type: string, init?: PointerEventInit ) => Event

	const element = (
		tabIndex: number,
		parent: $bog_vmap_scene_click_target | null = null,
		isContentEditable = false,
	) => {

		const seen = [] as string[]

		const el = {
			tabIndex,
			isContentEditable,
			parentElement: parent,
			focused: 0,
			focus() { el.focused ++ },
			dispatchEvent( event: Event ) { seen.push( event.type ); return true },
			seen,
		}

		return el
	}

	const mods = { altKey: false, ctrlKey: false, metaKey: true, shiftKey: false }

	$mol_test({

		'a focusable element gets focus and the three events in order'( $ ) {

			const made = [] as log[]
			const el = element( 0 )

			const realm = {
				document: { elementFromPoint: () => el },
				PointerEvent: recorder( made ),
				MouseEvent: recorder( made ),
			}

			const hit = $bog_vmap_scene_click( realm, 40, 50, mods )

			$mol_assert_equal( hit, el )
			$mol_assert_like( el.seen, [ 'pointerdown', 'pointerup', 'click' ] )
			$mol_assert_equal( el.focused, 1 )

		},

		'every event bubbles and carries the point and the modifiers'( $ ) {

			const made = [] as log[]
			const el = element( 0 )

			$bog_vmap_scene_click( {
				document: { elementFromPoint: () => el },
				PointerEvent: recorder( made ),
				MouseEvent: recorder( made ),
			}, 40, 50, mods )

			$mol_assert_equal( made.length, 3 )

			for( const { init } of made ) {
				$mol_assert_equal( init.bubbles, true )
				$mol_assert_equal( init.clientX, 40 )
				$mol_assert_equal( init.clientY, 50 )
				$mol_assert_equal( init.metaKey, true )
				$mol_assert_equal( init.ctrlKey, false )
				$mol_assert_equal( init.button, 0 )
			}

			// The button is held between down and up, and not after.
			$mol_assert_equal( made[0].init.buttons, 1 )
			$mol_assert_equal( made[1].init.buttons, 0 )
			$mol_assert_equal( made[2].init.buttons, 0 )

			// Pointer events are pointer events, the click is a mouse event.
			$mol_assert_equal( made[0].init.pointerType, 'mouse' )
			$mol_assert_equal( made[1].init.pointerType, 'mouse' )
			$mol_assert_equal( made[2].init.pointerType, undefined )

		},

		/** A real click on a label focuses the button around it; so does this one. */
		'focus goes to the nearest focusable ancestor'( $ ) {

			const button = element( 0 )
			const label = element( -1, button )

			$bog_vmap_scene_click( {
				document: { elementFromPoint: () => label },
				MouseEvent: recorder( [] ),
			}, 0, 0, mods )

			$mol_assert_equal( label.focused, 0 )
			$mol_assert_equal( button.focused, 1 )

			// The events still go to the element under the point, they bubble up.
			$mol_assert_like( label.seen, [ 'pointerdown', 'pointerup', 'click' ] )
			$mol_assert_like( button.seen, [] )

		},

		'nothing focusable means nothing focused, events still go'( $ ) {

			const root = element( -1 )
			const leaf = element( -1, root )

			$bog_vmap_scene_click( {
				document: { elementFromPoint: () => leaf },
				MouseEvent: recorder( [] ),
			}, 0, 0, mods )

			$mol_assert_equal( leaf.focused, 0 )
			$mol_assert_equal( root.focused, 0 )
			$mol_assert_equal( leaf.seen.length, 3 )

		},

		/**
		 * A click on bare canvas lands on the root of the scene, which is not
		 * focusable. Nothing is focused and nothing is blurred: the keyboard stays
		 * where it was, with the host, so the host's hotkeys keep working.
		 */
		'a click on the scene root moves the focus nowhere'( $ ) {

			const root = element( -1 )
			let blurred = 0
			const realm = {
				document: {
					elementFromPoint: () => root,
					activeElement: { blur() { blurred ++ } },
				},
				MouseEvent: recorder( [] ),
			}

			$bog_vmap_scene_click( realm, 0, 0, mods )

			$mol_assert_equal( root.focused, 0 )
			$mol_assert_equal( blurred, 0 )
			$mol_assert_equal( root.seen.length, 3 )

		},

		'an editable element counts as focusable'( $ ) {

			const el = element( -1, null, true )

			$bog_vmap_scene_click( {
				document: { elementFromPoint: () => el },
				MouseEvent: recorder( [] ),
			}, 0, 0, mods )

			$mol_assert_equal( el.focused, 1 )

		},

		'nothing under the point dispatches nothing and does not fail'( $ ) {

			const made = [] as log[]

			const hit = $bog_vmap_scene_click( {
				document: { elementFromPoint: () => null },
				PointerEvent: recorder( made ),
				MouseEvent: recorder( made ),
			}, 0, 0, mods )

			$mol_assert_equal( hit, null )
			$mol_assert_equal( made.length, 0 )

		},

		/** An element that cannot take focus at all — no `focus` on it — is not an error. */
		'a target without focus is left alone'( $ ) {

			const seen = [] as string[]
			const el = {
				tabIndex: 0,
				dispatchEvent( event: Event ) { seen.push( event.type ); return true },
			}

			$bog_vmap_scene_click( {
				document: { elementFromPoint: () => el },
				MouseEvent: recorder( [] ),
			}, 0, 0, mods )

			$mol_assert_equal( seen.length, 3 )

		},

	})

}
