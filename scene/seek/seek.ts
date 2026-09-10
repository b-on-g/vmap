namespace $ {

	export type $bog_vmap_scene_found< View > = {
		readonly path: string
		readonly view: View
	}

	export function $bog_vmap_scene_seek< View >(
		root: View,
		how: {
			readonly key: string
			readonly view_of: ( kid: unknown )=> View | null
			readonly kids_of: ( view: View )=> readonly unknown[]
			readonly prop_of: ( view: View )=> string
		},
		probe: ( view: View )=> boolean,
	): $bog_vmap_scene_found< View > | null {

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
