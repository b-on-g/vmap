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

		yard() {
			return this.$.$giper_baza_glob.yard()
		}

		master() {

			const kind = this.$.$giper_baza_yard

			const all = kind.masters()
			const from = this.yard().master_cursor()
			const tried = [ ... all.slice( from ), ... all.slice( 0, from ) ]

			return tried.find( uri => !kind.masters_default.includes( uri ) ) ?? ''
		}

		uri( file: $giper_baza_file ) {
			const master = this.master()
			return master ? master.replace( /\/$/, '' ) + '/' + file.uri() : ''
		}

		pawn( link: string ) {
			return this.$.$giper_baza_glob.Pawn(
				new $giper_baza_link( link ),
				$giper_baza_file,
			)
		}

		file( uri: string ) {

			const link = $bog_vmap_asset_link( uri )
			if( !link ) return null

			return this.pawn( link )
		}

		ports() {
			return this.yard().masters()
		}

		filled( link: string ) {
			return this.pawn( link ).filled()
		}

		sent( link: string ) {

			const land = this.pawn( link ).land()
			const yard = this.yard()

			return this.ports().some( port => {

				const mirror = yard.face_port_land([ port, land.link() ])
				if( !mirror ) return false

				for( const [ peer, face ] of land.faces ) {

					const seen = mirror.get( peer )
					if( !seen ) return false
					if( seen.time_tick < face.time_tick ) return false
					if( seen.summ < face.summ ) return false

				}

				return true
			} )

		}

		ready( link: string ) {
			return this.filled( link ) && this.sent( link )
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
			const land = this.land()
			const file = land.Data( $giper_baza_file )
			file.blob( blob )
			this.yard().sync_land( land.link() )
			return file
		}

		put( blob: $mol_blob ) {
			return this.uri( this.made( blob ) )
		}

	}

}
