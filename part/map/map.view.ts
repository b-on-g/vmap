namespace $.$$ {

	export class $bog_vmap_part_map extends $.$bog_vmap_part_map {

		zoom_clamp( val: number ) {
			if( !Number.isFinite( val ) ) return super.zoom_limited()
			return Math.min( this.zoom_max(), Math.max( this.zoom_min(), Math.round( val ) ) )
		}

		override zoom_limited( next?: number ) {
			if( next !== undefined ) return this.zoom( this.zoom_clamp( next ) )
			return this.zoom_clamp( this.zoom() )
		}

		override center( next?: $mol_vector_2d< number > ) {

			if( next !== undefined ) {
				this.lat( next[0] )
				this.lng( next[1] )
			}

			return new $mol_vector_2d( this.lat(), this.lng() )
		}

		override objects() {
			return this.marker() ? [ this.Mark() ] : []
		}

	}

}
