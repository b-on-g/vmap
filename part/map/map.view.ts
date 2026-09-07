namespace $.$$ {

	/**
	 * Map part of vmap over the Yandex map of mol. Zoom is clamped into the
	 * range the map accepts, the center travels as two numbers, and a mark
	 * appears at the center as soon as it has a title.
	 */
	export class $bog_vmap_part_map extends $.$bog_vmap_part_map {

		/** Zoom for the map: whole, inside the range, the default when not a number. */
		zoom_clamp( val: number ) {
			if( !Number.isFinite( val ) ) return super.zoom_limited()
			return Math.min( this.zoom_max(), Math.max( this.zoom_min(), Math.round( val ) ) )
		}

		/** Clamped on both ways, as `value_limited` of the number field does. */
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
