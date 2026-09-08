namespace $ {

	/** Shape of one recompiled class: what it declares and what of that is keyed. */
	export type $bog_vmap_scene_shape = {
		readonly declared: ReadonlySet< string >
		readonly keyed: ReadonlySet< string >
	}

	/** Counters of one hot swap, for tests and for the log. */
	export type $bog_vmap_scene_swap_report = {
		/** Instances whose prototype was moved onto the freshly compiled class. */
		swapped: number
		/** Atoms whose implementation was redirected onto the new one. */
		moved: number
		/** Atoms whose implementation actually changed, so subscribers were woken. */
		stale: number
		/** Atoms dropped because the property changed shape or stopped being a cell. */
		dropped: number
	}

	type Atom = $mol_wire_atom< unknown, readonly unknown[], unknown >

	/** Atoms behind one own field: a solo one, or every value of a keyed dictionary. */
	function atoms_of( holder: unknown ): readonly Atom[] {
		if( holder instanceof Map ) return [ ... holder.values() ] as Atom[]
		if( holder && typeof holder === 'object' ) return [ holder as Atom ]
		return []
	}

	/** Told by shape, like everywhere else on this side of the boundary. */
	function view_like( value: unknown ): value is object {
		return typeof ( value as { dom_node?: unknown } | null )?.dom_node === 'function'
	}

	/**
	 * Moves a live component onto the freshly compiled classes, keeping its state.
	 *
	 * A cell lives as an OWN field of the instance, so replacing the prototype
	 * touches no value, no subscription and no DOM node — caret, focus and scroll
	 * position included. The one thing the prototype does not reach is the
	 * implementation a fiber captured in its constructor, and that is what is
	 * redirected here, taking the new one off the wrapper the decorator left it on.
	 *
	 * The walk goes over the atom caches and never over `sub()`: free parts are not
	 * in `sub` at all, `sub()` of a generated class is not memoized, so calling it
	 * would run user code and could create children that do not exist yet, and a
	 * child temporarily out of `sub` is still a live instance.
	 *
	 * Instances of classes the document does not declare — components of the donor
	 * pack — keep their prototype and are only walked through, because a document
	 * class may well sit inside one.
	 * @see ../ARCHITECTURE.md section 3, spike/S2.md
	 */
	export function $bog_vmap_scene_swap(
		this: $,
		root: object,
		klass_of: ( name: string )=> unknown,
		shape_of: ( name: string )=> $bog_vmap_scene_shape | null,
	): $bog_vmap_scene_swap_report {

		const report = { swapped: 0, moved: 0, stale: 0, dropped: 0 }

		const seen = new Set< object >()
		const queue = [ root ]

		while( queue.length ) {

			const inst = queue.pop()!
			if( seen.has( inst ) ) continue
			seen.add( inst )

			// The plain name, never the lookup helper of mol: the helper scans the
			// whole ambient for a class it cannot find, and every class here is
			// named by construction — an unnamed one is a defect on its own.
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

				// The field is not simply `name()`: a property decorated both in the
				// generated base and in the handwritten body carries a trailing space,
				// because the decorator copies the name off the base wrapper.
				const prop = field.slice( 0, -2 ).trim()

				for( const atom of atoms ) {
					for( const kid of kids_of( atom ) ) queue.push( kid )
				}

				if( !shape ) continue

				retarget( inst, field, prop, atoms, shape, report )

			}

		}

		return report
	}

	/** Views held by one atom, whether it holds one or a list of them. */
	function kids_of( atom: Atom ): readonly object[] {

		const value = atom.result()

		if( view_like( value ) ) return [ value ]

		if( Array.isArray( value ) ) return value.filter( view_like )

		return []
	}

	/**
	 * Points the atoms of one property at the new implementation, or drops them.
	 *
	 * Only the atoms whose implementation actually changed are woken, and that is
	 * the whole economy of the strategy: a class is generated anew in full, so every
	 * function object is new, while the TEXT differs only for what was edited.
	 */
	function retarget(
		inst: object,
		field: string,
		prop: string,
		atoms: readonly Atom[],
		shape: $bog_vmap_scene_shape,
		report: $bog_vmap_scene_swap_report,
	) {

		const wrapper = Reflect.get( inst, prop )
		const next = typeof wrapper === 'function' ? Reflect.get( wrapper, 'orig' ) : null
		const decorated = typeof next === 'function'

		const keyed_was = Reflect.get( inst, field ) instanceof Map
		const keyed_now = shape.keyed.has( prop )

		// A property the class no longer declares is judged by whether anything
		// answers to its name at all; one it does declare must still be a cell of
		// the same shape, or the atoms behind it mean nothing.
		const broken = shape.declared.has( prop )
			? ( !decorated || keyed_was !== keyed_now )
			: ( !decorated && !( prop in inst ) )

		if( broken ) {

			// `destructor()` only unsubscribes, it does not mark anyone stale, so
			// dependants would silently keep serving the value of a property that
			// no longer exists.
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

			// Invalidation, not a recompute: waking the graph from inside the cell
			// that owns the instance would run document code in the middle of our
			// own computation. The value is read back a moment later by `stage()`,
			// in the same pass.
			Reflect.set( atom, 'cursor', $mol_wire_cursor.stale )
			atom.emit()
			report.stale += 1

		}

	}

}
