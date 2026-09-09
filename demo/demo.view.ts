namespace $.$$ {

	export class $bog_vmap_demo_calc extends $.$bog_vmap_demo_calc {

		@ $mol_mem
		sum( next?: number ) {
			return next ?? 42
		}

		result() {
			return `Sum is ${ this.sum() }`
		}

	}

}
