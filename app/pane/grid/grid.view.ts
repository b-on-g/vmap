namespace $.$$ {

	/**
	 * Infinite background grid. Feeds two $mol_plot_ruler instances the same way
	 * $mol_plot_pane feeds its graphs, and renders only their curves.
	 * @see ../../../ARCHITECTURE.md section 8
	 */
	export class $bog_vmap_app_pane_grid extends $.$bog_vmap_app_pane_grid {

		@ $mol_mem
		size_real() {
			const rect = this.view_rect()
			if( !rect ) return new this.$.$mol_vector_2d( 1, 1 )
			return new this.$.$mol_vector_2d( rect.width, rect.height )
		}

		override view_box() {
			const size = this.size_real()
			return `0 0 ${ size.x } ${ size.y }`
		}

		viewport() {
			const size = this.size_real()
			return new this.$.$mol_vector_2d(
				new this.$.$mol_vector_range( 0, size.x ),
				new this.$.$mol_vector_range( 0, size.y ),
			)
		}

		gap() {
			return new this.$.$mol_vector_2d(
				new this.$.$mol_vector_range( 0, 0 ),
				new this.$.$mol_vector_range( 0, 0 ),
			)
		}

		/** Viewport in world coordinates, by the formula from $mol_plot_pane. */
		@ $mol_mem
		dimensions_viewport() {
			const shift = this.shift().multed0( -1 )
			const scale = this.scale().powered0( -1 )
			return this.viewport().map(
				( range, index )=> range.added0( shift[ index ] ).multed0( scale[ index ] ).sort( ( a, b )=> a - b )
			)
		}

		@ $mol_mem
		override rulers() {

			const rulers = [ this.Ruler_hor(), this.Ruler_vert() ] as $mol_plot_ruler[]

			for( const ruler of rulers ) {
				ruler.shift = ()=> this.shift()
				ruler.scale = ()=> this.scale()
				ruler.size_real = ()=> this.size_real()
				ruler.viewport = ()=> this.viewport()
				ruler.gap = ()=> this.gap()
				ruler.dimensions_pane = ()=> this.dimensions_viewport()
			}

			return rulers.flatMap( ruler => ruler.back() )
		}

	}

	/** Base clamps its lines to 1000px tall. The canvas is whatever the window is. */
	export class $bog_vmap_app_pane_grid_hor extends $.$bog_vmap_app_pane_grid_hor {

		override curve() {

			const [ shift ] = this.shift()
			const [ scale ] = this.scale()
			const height = Math.ceil( this.size_real()[1] )

			return this.axis_points().map( point => {
				const pos = Math.round( point * scale + shift )
				return `M ${ pos } ${ height } V 0`
			} ).join( ' ' )

		}

	}

	/** Same story, base clamps its lines to 2000px wide. */
	export class $bog_vmap_app_pane_grid_vert extends $.$bog_vmap_app_pane_grid_vert {

		override curve() {

			const [ , shift ] = this.shift()
			const [ , scale ] = this.scale()
			const width = Math.ceil( this.size_real()[0] )

			return this.axis_points().map( point => {
				const pos = Math.round( point * scale + shift )
				return `M 0 ${ pos } H ${ width }`
			} ).join( ' ' )

		}

	}

}
