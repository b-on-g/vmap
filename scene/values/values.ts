namespace $ {

	export function $bog_vmap_scene_value_text( val: unknown, limit = 40 ) {

		let text: string

		if( val === undefined ) text = 'undefined'
		else if( val === null ) text = 'null'
		else if( typeof val === 'function' ) text = 'function'
		else if( typeof val !== 'object' ) text = String( val )
		else if( Array.isArray( val ) || Object.getPrototypeOf( val ) === Object.prototype ) {
			try { text = JSON.stringify( val ) } catch { text = String( val ) }
		}
		else text = String( val )

		text = text.replace( /\s+/g, ' ' ).trim()

		return text.length > limit ? text.slice( 0, limit - 1 ) + '…' : text
	}

	export function $bog_vmap_scene_values_columns( list: readonly object[] ) {

		const columns = [] as string[]

		for( const item of list ) {
			for( const key of Object.keys( item ) ) if( !columns.includes( key ) ) columns.push( key )
		}

		return columns
	}

	export function $bog_vmap_scene_values_table( val: unknown, rows = 3, limit = 40 ) {

		if( !Array.isArray( val ) || !val.length ) return null

		const plain = ( item: unknown )=> Boolean( item )
			&& typeof item === 'object'
			&& !Array.isArray( item )
			&& Object.getPrototypeOf( item ) === Object.prototype

		if( !val.every( plain ) ) return null

		const shown = val.slice( 0, rows ) as readonly Record< string, unknown >[]
		const columns = $bog_vmap_scene_values_columns( shown )
		if( !columns.length ) return null

		const lines = [ columns.join( '\t' ) ]

		for( const item of shown ) {
			lines.push( columns.map(
				column => column in item ? $bog_vmap_scene_value_text( item[ column ], limit ) : ''
			).join( '\t' ) )
		}

		if( val.length > shown.length ) lines.push( '… ещё ' + ( val.length - shown.length ) )

		return lines.join( '\n' )
	}

	export function $bog_vmap_scene_values_show( val: unknown, limit = 40, rows = 3 ) {
		return $bog_vmap_scene_values_table( val, rows, limit ) ?? $bog_vmap_scene_value_text( val, limit )
	}

	export function $bog_vmap_scene_values_pick( root: object, name: string ) {

		let host = root as unknown

		for( const step of name.split( '.' ) ) {

			if( !host || ( typeof host !== 'object' && typeof host !== 'function' ) ) {
				throw new Error( 'нет свойства ' + name )
			}

			const method = Reflect.get( host, step ) as unknown
			if( typeof method !== 'function' ) throw new Error( 'нет свойства ' + name )

			host = method.call( host )
		}

		return host
	}

	export function $bog_vmap_scene_values(
		this: $,
		root: object,
		names: readonly string[],
		limit = 40,
		rows = 3,
	) {

		const values = {} as { [ name: string ]: string }

		for( const name of names ) {

			try {
				values[ name ] = $bog_vmap_scene_values_show( $bog_vmap_scene_values_pick( root, name ), limit, rows )
			} catch( error: unknown ) {
				if( this.$mol_promise_like( error ) ) return this.$mol_fail_hidden( error )
				values[ name ] = '⚠ ' + $bog_vmap_scene_value_text(
					String( ( error as Error )?.message ?? error ), limit,
				)
			}

		}

		return values as { readonly [ name: string ]: string }
	}

}
