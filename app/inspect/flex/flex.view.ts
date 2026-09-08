namespace $.$$ {

	/**
	 * Layout panel of one node: five style keys with names on them.
	 *
	 * It owns nothing. Every control is one key of the `style` dictionary of the
	 * node, read and written through `value()`, so what the panel shows is what the
	 * document says and what it writes is an ordinary line of `view.tree`. The
	 * inspector already has a dictionary editor for the same property; this is the
	 * same facts with the names of the decisions on them.
	 *
	 * @see ../../../ARCHITECTURE.md section 8
	 */
	export class $bog_vmap_app_inspect_flex extends $.$bog_vmap_app_inspect_flex {

		override width( next?: string ) {
			return this.value( 'width', next )
		}

		override direction( next?: string ) {
			return this.value( 'flexDirection', next )
		}

		override across( next?: string ) {
			return this.value( 'alignItems', next )
		}

		override along( next?: string ) {
			return this.value( 'justifyContent', next )
		}

		override gap( next?: string ) {
			return this.value( 'gap', next )
		}

		/**
		 * Stretching, written as the STRING `1` and never as the number.
		 *
		 * `$mol_dom_render_styles` appends `px` to a number, so `flexGrow 1` in the
		 * document comes out as `flex-grow: 1px`, which is not a length and not a
		 * growth factor either: the property is simply dropped and the node does not
		 * stretch. Dimensionless numbers go in as text.
		 */
		override grow( next?: boolean ) {

			if( next === undefined ) return this.value( 'flexGrow' ) === '1'

			this.value( 'flexGrow', next ? '1' : '' )

			return next
		}

	}

}
