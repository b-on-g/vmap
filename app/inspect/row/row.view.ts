namespace $.$$ {

	export class $bog_vmap_app_inspect_row extends $.$bog_vmap_app_inspect_row {

		/**
		 * Nothing on an inherited port. Hiding them with CSS instead would keep the
		 * checkboxes rendered, and rendering one means reading its state, which for
		 * an inherited port means asking the document about a property it does not
		 * declare.
		 */
		override tools() {
			return (
				this.inherited()
					? []
					: [ this.Key(), this.Next(), this.Drop() ]
			) as readonly $mol_view[]
		}

	}

}
