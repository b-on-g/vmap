namespace $.$$ {

	export class $bog_vmap_spike_s5_base extends $.$bog_vmap_spike_s5_base {
		override greet() {
			return 'ТЕЛО ИЗ .view.ts БАЗЫ'
		}
	}

	function chain_of( name: string, klass: any ) {
		const names = [] as string[]
		for( let p = klass; p && p.name; p = Object.getPrototypeOf( p ) ) names.push( p.name )
		return `${ name }: ${ names.join( ' → ' ) }`
	}

	export class $bog_vmap_spike_s5 extends $.$bog_vmap_spike_s5 {

		override chains() {
			return [
				chain_of( 'near ', this.$.$bog_vmap_spike_s5_near ),
				chain_of( 'apart', this.$.$bog_vmap_spike_s5_apart ),
				chain_of( 'base ', this.$.$bog_vmap_spike_s5_base ),
			]
		}

	}

}
