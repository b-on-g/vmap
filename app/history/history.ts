namespace $ {

	export function $bog_vmap_app_history_classes( source: string ) {

		const blocks = new Map< string, string >()

		let name = ''
		let lines = [] as string[]

		for( const line of source.split( '\n' ) ) {

			if( line && !/^[\t ]/.test( line ) ) {
				if( name ) blocks.set( name, lines.join( '\n' ) )
				name = line.split( /\s/ )[ 0 ]
				lines = [ line ]
				continue
			}

			if( name ) lines.push( line )

		}

		if( name ) blocks.set( name, lines.join( '\n' ) )

		return blocks
	}

	export function $bog_vmap_app_history_delta( was: string, now: string ) {

		const rest = new Map< string, number >()

		for( const line of was ? was.split( '\n' ) : [] ) {
			rest.set( line, ( rest.get( line ) ?? 0 ) + 1 )
		}

		let added = 0

		for( const line of now ? now.split( '\n' ) : [] ) {
			const count = rest.get( line ) ?? 0
			if( count ) rest.set( line, count - 1 )
			else ++added
		}

		let gone = 0
		for( const count of rest.values() ) gone += count

		const parts = [ ... added ? [ `+${ added }` ] : [], ... gone ? [ `−${ gone }` ] : [] ]

		return parts.join( ' ' ) || 'правка'
	}

	export function $bog_vmap_app_history_spot( was: string, now: string ) {

		const left = was.split( '\n' )
		const right = now.split( '\n' )

		for( let i = 0; i < Math.max( left.length, right.length ); ++i ) {

			if( left[ i ] === right[ i ] ) continue

			for( let back = i; back >= 0; --back ) {
				const name = /^\t([A-Z]\w*)/.exec( right[ back ] ?? left[ back ] ?? '' )?.[ 1 ]
				if( name ) return name
			}

			return ''
		}

		return ''
	}

	export function $bog_vmap_app_history_named( klass: string ) {
		return klass.replace( /^\$/, '' )
	}

	function $bog_vmap_app_history_body(
		was: $bog_vmap_app_store_parts,
		now: $bog_vmap_app_store_parts,
		role: string,
	) {

		for( const klass of Object.keys( now ) ) {
			if( was[ klass ] === now[ klass ] ) continue
			return `${ $bog_vmap_app_history_named( klass ) } ${ role }`
				+ ` ${ $bog_vmap_app_history_delta( was[ klass ] ?? '', now[ klass ] ) }`
		}

		for( const klass of Object.keys( was ) ) {
			if( klass in now ) continue
			return `${ $bog_vmap_app_history_named( klass ) } ${ role } убран`
		}

		return ''
	}

	export function $bog_vmap_app_history_change(
		was: $bog_vmap_app_store_state | null,
		now: $bog_vmap_app_store_state,
	): string {

		if( !was ) return 'первый снимок'

		const left = $bog_vmap_app_history_classes( was.source )
		const right = $bog_vmap_app_history_classes( now.source )

		for( const [ klass, text ] of right ) {

			const before = left.get( klass )
			if( before === text ) continue

			const named = $bog_vmap_app_history_named( klass )
			if( before === undefined ) return `${ named } заведён`

			const spot = $bog_vmap_app_history_spot( before, text )

			return [ named, spot, $bog_vmap_app_history_delta( before, text ) ]
				.filter( Boolean ).join( ' ' )
		}

		for( const klass of left.keys() ) {
			if( !right.has( klass ) ) return `${ $bog_vmap_app_history_named( klass ) } убран`
		}

		const js = $bog_vmap_app_history_body( was.js, now.js, 'тело' )
		if( js ) return js

		const css = $bog_vmap_app_history_body( was.css, now.css, 'стиль' )
		if( css ) return css

		for( const name of Object.keys( now.spots ) ) {
			const before = was.spots[ name ]
			const after = now.spots[ name ]
			if( before && before.x === after.x && before.y === after.y ) continue
			return `${ name } передвинут`
		}

		return 'без изменений'
	}

}
