namespace $.$$ {

	export class $bog_vmap_app_inspect_row extends $.$bog_vmap_app_inspect_row {

		override tools() {
			return (
				this.inherited()
					? []
					: [ this.Key(), this.Next(), this.Drop() ]
			) as readonly $mol_view[]
		}

	}

}
