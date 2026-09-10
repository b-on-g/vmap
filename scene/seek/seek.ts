namespace $ {

	/** A node of the document, by the path the host addresses it with. */
	export type $bog_vmap_scene_found< View > = {
		readonly path: string
		readonly view: View
	}

	/**
	 * First node of a rendered document the probe accepts, and its path.
	 *
	 * The path is built exactly as the measuring walk builds it, and that is
	 * the whole reason this exists as a walk of its own rather than as a read of the
	 * DOM. A failing element does carry an attribute naming it, but that attribute
	 * is lowercased and joined by underscores, so `My_box` and `my/Box` arrive as the
	 * same string and neither matches the key the host was given in `sizes`. A label
	 * placed by a name that does not match is worse than no label.
	 *
	 * Pure, and out of the view for the reason the measurement is: everything that
	 * knows about the framework is handed in, so the walk itself knows only paths.
	 *
	 * @param key path of the root, which every deeper path is built onto
	 */
	export function $bog_vmap_scene_seek< View >(
		root: View,
		how: {
			readonly key: string
			/** The kid as a view, or `null` when it is not one. */
			readonly view_of: ( kid: unknown )=> View | null
			/** Children of a view, or none when they cannot be read. */
			readonly kids_of: ( view: View )=> readonly unknown[]
			/** Property the view is held by, empty when it is held by nothing named. */
			readonly prop_of: ( view: View )=> string
		},
		probe: ( view: View )=> boolean,
	): $bog_vmap_scene_found< View > | null {

		// The root is asked first: a document whose own render throws is the common
		// case, and a walk that started with the children would answer with a child
		// that merely inherited the failure.
		if( probe( root ) ) return { path: how.key, view: root }

		const walk = ( view: View, path: string, depth: number ): $bog_vmap_scene_found< View > | null => {

			if( depth > 16 ) return null

			let index = 0

			for( const kid of how.kids_of( view ) ) {

				const sub = how.view_of( kid )
				if( !sub ) continue

				const key = path + '/' + ( how.prop_of( sub ) || index )
				index ++

				if( probe( sub ) ) return { path: key, view: sub }

				const deeper = walk( sub, key, depth + 1 )
				if( deeper ) return deeper

			}

			return null
		}

		return walk( root, how.key, 0 )
	}

}
