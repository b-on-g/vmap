namespace $ {

	const $bog_vmap_asset_mark = '?BAZA:file='

	export function $bog_vmap_asset_link( uri: string ) {

		const pos = uri.indexOf( $bog_vmap_asset_mark )
		if( pos < 0 ) return null

		try {
			var id = $giper_baza_file_query.parse( uri.slice( pos ) ).file[ '=' ]?.[ 0 ][ 0 ]
		} catch {
			return null
		}

		return id ? $giper_baza_link.check( id ) : null
	}

	export function $bog_vmap_asset_links( source: string ) {

		const found = new Set< string >()

		for( const [ uri ] of source.matchAll( /\?BAZA:file=\S*/g ) ) {
			const link = $bog_vmap_asset_link( uri )
			if( link ) found.add( link )
		}

		return [ ... found ] as readonly string[]
	}

	export class $bog_vmap_asset extends $mol_object {

		master() {
			const yard = this.$.$giper_baza_yard
			return yard.masters().find( uri => !yard.masters_default.includes( uri ) ) ?? ''
		}

		uri( file: $giper_baza_file ) {
			const master = this.master()
			return master ? master.replace( /\/$/, '' ) + '/' + file.uri() : ''
		}

		file( uri: string ) {

			const link = $bog_vmap_asset_link( uri )
			if( !link ) return null

			return this.$.$giper_baza_glob.Pawn(
				new $giper_baza_link( link ),
				$giper_baza_file,
			)
		}

		bytes( uri: string ) {
			return this.file( uri )?.buffer() ?? null
		}

		mime( uri: string ) {
			return this.file( uri )?.type() ?? ''
		}

		name( uri: string ) {
			return this.file( uri )?.name() ?? ''
		}

		land() {
			return this.$.$giper_baza_glob.land_grab()
		}

		made( blob: $mol_blob ) {
			const file = this.land().Data( $giper_baza_file )
			file.blob( blob )
			return file
		}

		put( blob: $mol_blob ) {
			return this.uri( this.made( blob ) )
		}

	}

}
