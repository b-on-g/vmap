namespace $ {

	export function $bog_vmap_scene_cells(
		Klass: { readonly prototype: object },
		keyed: readonly string[],
		changeable: readonly string[],
	) {

		const proto = Klass.prototype

		for( const name of Object.getOwnPropertyNames( proto ) ) {

			if( name === 'constructor' || name === 'destructor' ) continue

			const descr = Object.getOwnPropertyDescriptor( proto, name )!
			const method = descr.value
			if( typeof method !== 'function' ) continue

			if( keyed.includes( name ) ) { $mol_mem_key( proto, name, descr ); continue }
			if( changeable.includes( name ) ) { $mol_mem( proto, name, descr ); continue }

			if( method.length ) continue
			if( method.constructor !== Function ) continue

			$mol_mem( proto, name, descr )
		}

	}

}
