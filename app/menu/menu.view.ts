namespace $.$$ {
	export class $bog_vmap_app_menu extends $.$bog_vmap_app_menu {

		override items() {
			const edits = this.editable()
			return this.on_node()
				? [ ... edits ? [ this.Copy(), this.Remove(), this.Wrap() ] : [], this.Parent(), this.Enter() ]
				: [ ... edits ? [ this.Board() ] : [], this.Fit() ]
		}

		override apple() {
			return /Mac|iPhone|iPad/.test( this.$.$mol_dom_context.navigator?.userAgent ?? '' )
		}

		override copy_keys() {
			return this.apple() ? '⌘D' : 'Ctrl+D'
		}

		override remove_keys() {
			return this.apple() ? '⌫' : 'Del'
		}

		override wrap_keys() {
			return this.apple() ? '⌥⌘G' : 'Ctrl+Alt+G'
		}

		override fit_keys() {
			return this.apple() ? '⇧1' : 'Shift+1'
		}

		override close() {
			this.showed( false )
			return null
		}

		override hold( event?: Event ) {
			event?.preventDefault()
			return null
		}

		outside( event?: Event ) {
			const target = event?.target
			const bubble = this.Bubble().dom_node()

			if( target instanceof this.$.$mol_dom_context.Node && bubble.contains( target ) ) return

			this.close()
		}

		@ $mol_mem
		listeners() {
			if( !this.showed() ) return []

			const win = this.$.$mol_dom_context
			const outside = $mol_wire_async( this ).outside

			return [
				new this.$.$mol_dom_listener( win, 'pointerdown', outside ),
				new this.$.$mol_dom_listener( win, 'wheel', outside ),
				new this.$.$mol_dom_listener( win, 'blur', $mol_wire_async( this ).close ),
			]
		}

		override auto() {
			return [
				... super.auto(),
				this.listeners(),
			]
		}

	}
}
