namespace $ {

	export function $bog_vmap_scene_value_text( val: unknown, limit = 40 ) {

		let text: string

		if( val === undefined ) text = 'undefined'
		else if( val === null ) text = 'null'
		else if( typeof val !== 'object' ) text = String( val )
		else if( Array.isArray( val ) || Object.getPrototypeOf( val ) === Object.prototype ) {
			try { text = JSON.stringify( val ) } catch { text = String( val ) }
		}
		else text = String( val )

		text = text.replace( /\s+/g, ' ' ).trim()

		return text.length > limit ? text.slice( 0, limit - 1 ) + '…' : text
	}

	export function $bog_vmap_scene_values(
		this: $,
		root: object,
		names: readonly string[],
		limit = 40,
	) {

		const values = {} as { [ name: string ]: string }

		for( const name of names ) {

			const method = Reflect.get( root, name ) as unknown

			if( typeof method !== 'function' ) {
				values[ name ] = '⚠ нет свойства ' + name
				continue
			}

			try {
				values[ name ] = $bog_vmap_scene_value_text( method.call( root ), limit )
			} catch( error: unknown ) {
				if( this.$mol_promise_like( error ) ) return this.$mol_fail_hidden( error )
				values[ name ] = '⚠ ' + String( ( error as Error )?.message ?? error )
			}

		}

		return values as { readonly [ name: string ]: string }
	}

}
