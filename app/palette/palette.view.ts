namespace $.$$ {

	export class $bog_vmap_app_palette extends $.$bog_vmap_app_palette {

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

		@ $mol_action
		class_drag( name: string, event?: PointerEvent | null ) {

			if( !event ) return

			this.drag_x( event.clientX )
			this.drag_y( event.clientY )
			this.dragged( name )

		}

		@ $mol_mem
		class_state(): { readonly list: readonly string[], readonly error: string } {

			try {
				return { list: this.Lib().class_search( this.query() ), error: '' }
			} catch( error: unknown ) {
				if( $mol_promise_like( error ) ) return $mol_fail_hidden( error )
				return { list: [], error: this.$.$bog_vmap_lib_pack_note( this.Lib().tree_link(), error ) }
			}

		}

		class_list() {
			return this.class_state().list
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

			const error = this.class_state().error
			if( error ) return error

			const found = this.class_list().length
			const all = this.Lib().class_list().length

			return found === all ? `${ all } классов` : `${ found } из ${ all }`
		}

		selected_title() {
			return this.selected() || 'Выберите класс слева'
		}

		chain_title() {
			const cl = this.selected()
			if( !cl ) return ''
			return this.Lib().inherit_chain( cl ).join( ' → ' )
		}

		@ $mol_mem
		port_list() {
			const cl = this.selected()
			if( !cl ) return []
			return [ ... this.Lib().props_map( cl ).keys() ]
		}

		port_rows() {
			return this.port_list().map( name => this.Port_row( name ) )
		}

		port_node( name: string ) {
			const cl = this.selected()
			return cl ? this.Lib().props_map( cl ).get( name ) ?? null : null
		}

		port_sign( name: string ) {
			return this.port_node( name )?.type ?? name
		}

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
