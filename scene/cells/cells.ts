namespace $ {

	/**
	 * Makes a cell of every method a handwritten body defines: keyed and
	 * changeable ones as the tree says, the way studio's `source_js_decorators()`
	 * does, and every zero argument method besides, whatever the tree says. The
	 * generated code calls it right after the class, since a decorator cannot be
	 * written into a string for `new Function`, and it reads the class rather
	 * than the text, so a nested `if( x ) {` cannot pass for a method.
	 *
	 * Without an atom the hot swap has nothing to wake when the text of a method
	 * changes: its callers keep the old value and the DOM keeps the old text.
	 */
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

			// A method with arguments is no cell: the first one would be taken for a
			// write. An async one answers a promise, which a cell would wait on.
			if( method.length ) continue
			if( method.constructor !== Function ) continue

			$mol_mem( proto, name, descr )
		}

	}

}
