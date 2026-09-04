namespace $.$$ {

	$mol_style_define( $bog_vmap_app_pane, {

		position: 'relative',
		flex: { grow: 1 },
		overflow: 'hidden',
		background: { color: $mol_theme.back },

		Grid: {
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			fill: 'none',
			// `stroke` comes from CSSStyleDeclaration and is plain `string` there.
			stroke: String( $mol_theme.line ),
			strokeWidth: '1px',
			pointerEvents: 'none',
		},

		Scene: {
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			border: { style: 'none' },
			background: { color: 'transparent' },
		},

		Overlay: {
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
		},

	} )

	$mol_style_define( $bog_vmap_app_pane_overlay, {

		'@': {
			bog_vmap_app_pane_mode: {

				/** Edit: the host eats every pointer event, nothing reaches the scene. */
				edit: { pointerEvents: 'auto' },

				/** Run: events fall through into the sandbox, the component is alive. */
				run: { pointerEvents: 'none' },

			},
		},

		Frame: {

			position: 'absolute',

			/**
			 * `outline` and not `border`: a border would take part in the box the
			 * `width` and `height` above are setting, so the ring would sit a pixel
			 * inside the node on every side. An outline is drawn outside the box and
			 * changes nothing about it.
			 *
			 * Written as one string because a camelCase shorthand takes nothing else,
			 * and `String()` around the token because `$mol_theme.focus` is a
			 * `$mol_style_func`, not text. Both are TS2322 otherwise — and the WEB
			 * audit passes either way, only the node one catches it.
			 */
			outline: '1px solid ' + String( $mol_theme.focus ),
			outlineOffset: '1px',

			/**
			 * The ring is a picture, never a target. Left hittable it would take the
			 * press meant for the node it is drawn around, and a node once picked
			 * could not be picked again — or dragged.
			 */
			pointerEvents: 'none',

			/**
			 * `[mol_view]` animates `transform` for .2s, and the ring is positioned,
			 * not transformed, so it would not lag by itself. Said out loud because
			 * the camera above IS on a transform: whatever is added here later must
			 * not start animating, or the ring will trail the node it belongs to.
			 */
			transition: 'none',

		},

	} )

}
