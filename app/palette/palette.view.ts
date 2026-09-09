namespace $.$$ {

	/**
	 * Palette of a component library: every class of a deployed pack, searchable,
	 * with the ports of whichever class is picked.
	 *
	 * Shows, searches and announces the start of a drag. Where the dragged class
	 * lands is a canvas question and is answered by whoever owns the canvas.
	 *
	 * @see ../../ARCHITECTURE.md section 5
	 */
	export class $bog_vmap_app_palette extends $.$bog_vmap_app_palette {

		/**
		 * Header first, then either both panes or just the list.
		 *
		 * The compact layout drops the ports pane instead of squeezing it: at panel
		 * width the signature column alone eats the row.
		 */
		override body() {
			return [
				this.Head(),
				this.Body(),
			] as readonly $mol_view[]
		}

		override body_content() {
			return (
				this.compact()
					? [ this.Classes() ]
					: [ this.Classes(), this.Ports() ]
			) as readonly $mol_view[]
		}

		/**
		 * A press on a class row starts carrying it.
		 *
		 * Selection stays on `click`: a press that turns into a drag never becomes a
		 * click, so the two do not fight, and a press that ends where it began picks
		 * the class for the ports pane as before.
		 */
		@ $mol_action
		class_drag( name: string, event?: PointerEvent | null ) {

			if( !event ) return

			this.drag_x( event.clientX )
			this.drag_y( event.clientY )
			this.dragged( name )

		}

		/**
		 * Classes matching the query, or all of them for an empty query —
		 * `$mol_match_text` of nothing matches everything, so no branch is needed.
		 *
		 * Suspends while the pack is loading and throws when the pack is dead.
		 * Both are meant to reach the views that read it: `$mol_view` turns the
		 * first into its waiting state and the second into an error strip, and a
		 * try/catch here would replace both with a silently empty palette.
		 */
		@ $mol_mem
		class_list() {
			return this.Lib().class_search( this.query() )
		}

		class_rows() {
			return this.class_list().map( name => this.Class_row( name ) )
		}

		class_title( name: string ) {
			return name
		}

		class_current( name: string ) {
			return this.selected() === name
		}

		@ $mol_action
		class_click( name: string ) {
			this.selected( name )
		}

		total() {
			const found = this.class_list().length
			const all = this.Lib().class_list().length
			return found === all ? `${ all } классов` : `${ found } из ${ all }`
		}

		selected_title() {
			return this.selected() || 'Выберите класс слева'
		}

		/** Where the ports come from, nearest base first. */
		chain_title() {
			const cl = this.selected()
			if( !cl ) return ''
			return this.Lib().inherit_chain( cl ).join( ' → ' )
		}

		/**
		 * Ports of the selected class in the order `props_map` gives them, which is
		 * the order of first declaration up the chain: the base ports of
		 * `$mol_view` first, everything the class added itself last.
		 */
		@ $mol_mem
		port_list() {
			const cl = this.selected()
			if( !cl ) return []
			return [ ... this.Lib().props_map( cl ).keys() ]
		}

		port_rows() {
			return this.port_list().map( name => this.Port_row( name ) )
		}

		/** Declaration of a port, or `null` between a click and the next redraw. */
		port_node( name: string ) {
			const cl = this.selected()
			return cl ? this.Lib().props_map( cl ).get( name ) ?? null : null
		}

		/**
		 * Name of the port as it is written in the source, suffixes included, so
		 * `click?` is visibly a two-way port and `Menu_option*` visibly a keyed one.
		 */
		port_sign( name: string ) {
			return this.port_node( name )?.type ?? name
		}

		/**
		 * First line of the declaration. A port can carry a whole sub tree under it
		 * and the rest of that tree is of no use in a one line row.
		 */
		port_body( name: string ) {
			const node = this.port_node( name )
			if( !node ) return ''
			return node.toString().split( '\n' )[0].replace( /^\S*\s?/, '' ).trim()
		}

		port_owner( name: string ) {
			const cl = this.selected()
			if( !cl ) return ''
			const owner = this.Lib().props_owner( cl ).get( name ) ?? ''
			return owner === cl ? '' : owner
		}

		port_inherited( name: string ) {
			return Boolean( this.port_owner( name ) )
		}

	}

}
