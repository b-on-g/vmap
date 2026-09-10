namespace $ {

	export type $bog_vmap_scene_swap_shape = {
		readonly declared: ReadonlySet< string >
		readonly keyed: ReadonlySet< string >
	}

	export type $bog_vmap_scene_swap_report = {
		swapped: number
		moved: number
		stale: number
		dropped: number
		failed: number
	}

	type Atom = $mol_wire_atom< unknown, readonly unknown[], unknown >

	function atoms_of( holder: unknown ): readonly Atom[] {
		if( holder instanceof Map ) return [ ... holder.values() ] as Atom[]
		if( holder && typeof holder === 'object' ) return [ holder as Atom ]
		return []
	}

	function view_like( value: unknown ): value is object {
		return typeof ( value as { dom_node?: unknown } | null )?.dom_node === 'function'
	}

	export function $bog_vmap_scene_swap(
		this: $,
		root: object,
		klass_of: ( name: string )=> unknown,
		shape_of: ( name: string )=> $bog_vmap_scene_swap_shape | null,
	): $bog_vmap_scene_swap_report {

		const report = { swapped: 0, moved: 0, stale: 0, dropped: 0, failed: 0 }

		const seen = new Set< object >()
		const queue = [ root ]

		while( queue.length ) {

			const inst = queue.pop()!
			if( seen.has( inst ) ) continue
			seen.add( inst )

			const name = ( inst.constructor as { name?: string } )?.name ?? ''
			const shape = name ? shape_of( name ) : null

			if( shape ) {

				const klass = klass_of( name )

				if( typeof klass === 'function' && klass.prototype !== Object.getPrototypeOf( inst ) ) {
					Object.setPrototypeOf( inst, klass.prototype )
					report.swapped += 1
				}

			}

			for( const field of Object.getOwnPropertyNames( inst ) ) {

				if( !field.endsWith( '()' ) ) continue

				const holder = Reflect.get( inst, field )
				const atoms = atoms_of( holder )
				if( !atoms.length ) continue

				const prop = field.slice( 0, -2 ).trim()

				for( const atom of atoms ) {

					for( const kid of kids_of( atom ) ) queue.push( kid )

					if( !( atom.cache instanceof Error ) ) continue
					Reflect.set( atom, 'cursor', $mol_wire_cursor.stale )
					atom.emit()
					report.failed += 1

				}

				if( !shape ) continue

				retarget( inst, field, prop, atoms, shape, report )

			}

		}

		return report
	}

	function kids_of( atom: Atom ): readonly object[] {

		const value = atom.result()

		if( view_like( value ) ) return [ value ]

		if( Array.isArray( value ) ) return value.filter( view_like )

		return []
	}

	function retarget(
		inst: object,
		field: string,
		prop: string,
		atoms: readonly Atom[],
		shape: $bog_vmap_scene_swap_shape,
		report: $bog_vmap_scene_swap_report,
	) {

		const wrapper = Reflect.get( inst, prop )
		const next = typeof wrapper === 'function' ? Reflect.get( wrapper, 'orig' ) : null
		const decorated = typeof next === 'function'

		const keyed_was = Reflect.get( inst, field ) instanceof Map
		const keyed_now = shape.keyed.has( prop )

		const broken = shape.declared.has( prop )
			? ( !decorated || keyed_was !== keyed_now )
			: ( !decorated && !( prop in inst ) )

		if( broken ) {

			for( const atom of atoms ) {
				atom.emit()
				atom.destructor()
			}

			Reflect.deleteProperty( inst, field )
			report.dropped += atoms.length

			return
		}

		if( !decorated ) return

		for( const atom of atoms ) {

			const prev = atom.task
			if( prev === next ) continue

			Reflect.set( atom, 'task', next )
			report.moved += 1

			if( String( prev ) === String( next ) ) continue

			Reflect.set( atom, 'cursor', $mol_wire_cursor.stale )
			atom.emit()
			report.stale += 1

		}

	}

}
