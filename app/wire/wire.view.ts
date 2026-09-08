namespace $.$$ {

	/**
	 * Draws what the pane computed: a path and a label per wire, a dot and a name
	 * per port, one path for the wire in hand. Sub views are keyed by the stable
	 * key of each thing, so a wire keeps its element while the camera moves.
	 */
	export class $bog_vmap_app_wire extends $.$bog_vmap_app_wire {

		@ $mol_mem
		override shapes() {

			const shapes = [] as $mol_view[]

			for( const line of this.lines() ) {
				shapes.push( this.Line( line.key ) )
				if( line.label ) shapes.push( this.Label( line.key ) )
			}

			for( const dot of this.dots() ) {
				const key = this.dot_key( dot )
				shapes.push( this.Dot( key ), this.Name( key ) )
			}

			if( this.drag_geometry() ) shapes.push( this.Drag() )

			return shapes
		}

		@ $mol_mem
		lines_map() {
			return new Map( this.lines().map( line => [ line.key, line ] as const ) )
		}

		line_of( key: string ) {
			return this.lines_map().get( key ) ?? null
		}

		override line_geometry( key: string ) {
			return this.line_of( key )?.geometry ?? ''
		}

		override label_pos( key: string ) {
			const line = this.line_of( key )
			return line ? [ line.label_x, line.label_y ] : [ 0, 0 ]
		}

		override label_text( key: string ) {
			return this.line_of( key )?.label ?? ''
		}

		dot_key( dot: $bog_vmap_app_wire_dot ) {
			return `${ dot.side }:${ dot.node }.${ dot.port.name }`
		}

		@ $mol_mem
		dots_map() {
			return new Map( this.dots().map( dot => [ this.dot_key( dot ), dot ] as const ) )
		}

		dot_of( key: string ) {
			return this.dots_map().get( key ) ?? null
		}

		override dot_pos( key: string ) {
			const dot = this.dot_of( key )
			return dot ? [ dot.x, dot.y ] : [ 0, 0 ]
		}

		override dot_side( key: string ) {
			return this.dot_of( key )?.side ?? ''
		}

		override dot_lit( key: string ) {
			return this.dot_of( key )?.lit ?? true
		}

		override dot_linked( key: string ) {
			return this.dot_of( key )?.linked ?? false
		}

		/** The name stands off the dot, away from the box: left of an input, right of an output. */
		override name_pos( key: string ) {
			const dot = this.dot_of( key )
			if( !dot ) return [ 0, 0 ]
			const off = $bog_vmap_app_wire_radius + 4
			return [ dot.side === 'in' ? dot.x - off : dot.x + off, dot.y + 3 ]
		}

		override name_align( key: string ) {
			return this.dot_of( key )?.side === 'in' ? 'end' : 'start'
		}

		override name_text( key: string ) {
			const dot = this.dot_of( key )
			return dot ? dot.port.name + ( dot.port.next ? '?' : '' ) : ''
		}

	}

}
