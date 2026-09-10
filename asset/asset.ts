namespace $ {

	const $bog_vmap_asset_prefix = 'asset:'

	const $bog_vmap_asset_chars = /[A-Za-zÆæ0-9_]+/

	export function $bog_vmap_asset_uri( id: string ) {
		return $bog_vmap_asset_prefix + id
	}

	export function $bog_vmap_asset_id( uri: string ) {

		if( !uri.startsWith( $bog_vmap_asset_prefix ) ) return null

		const id = uri.slice( $bog_vmap_asset_prefix.length )

		return id ? $giper_baza_link.check( id ) : null
	}

	export function $bog_vmap_asset_ids( source: string ) {

		const found = new Set< string >()

		for( const [ uri ] of source.matchAll(
			new RegExp( $bog_vmap_asset_prefix + $bog_vmap_asset_chars.source, 'g' )
		) ) {
			const id = $bog_vmap_asset_id( uri )
			if( id ) found.add( id )
		}

		return [ ... found ] as readonly string[]
	}

	export function $bog_vmap_asset_swap( source: string, at: ( id: string )=> string | null ) {

		return source.replace(
			new RegExp( $bog_vmap_asset_prefix + $bog_vmap_asset_chars.source, 'g' ),
			uri => {
				const id = $bog_vmap_asset_id( uri )
				if( !id ) return uri
				return at( id ) ?? uri
			},
		)
	}

	export class $bog_vmap_asset extends $mol_object {

		file( id: string ) {

			const checked = $giper_baza_link.check( id )
			if( !checked ) return null

			return this.$.$giper_baza_glob.Pawn(
				new $giper_baza_link( checked ),
				$giper_baza_file,
			)
		}

		bytes( id: string ) {
			return this.file( id )?.buffer() ?? null
		}

		mime( id: string ) {
			return this.file( id )?.type() ?? ''
		}

		name( id: string ) {
			return this.file( id )?.name() ?? ''
		}

		put( bytes: Uint8Array< ArrayBuffer >, mime: string, name: string ) {

			const land = this.$.$giper_baza_glob.land_grab()
			const file = land.Data( $giper_baza_file )

			file.buffer( bytes )
			file.type( mime )
			file.name( name )

			return file.link().str
		}

	}

}
