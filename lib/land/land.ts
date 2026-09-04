namespace $ {

	/**
	 * Component library published as a land of Giper Baza, sources and all.
	 *
	 * The second source of section 5, and the one that needs no deploy: publish a
	 * component, hand out the link, and it is in somebody else's palette. The first
	 * source, a deployed pack, arrives as a built `web.js` plus the `web.view.tree`
	 * beside it; this one arrives as the three texts a component is made of, and is
	 * compiled by the scene into the same sandbox.
	 *
	 * **From the outside it is the same library as a pack** — `class_list`,
	 * `props_map`, `united`, all of it — because it derives from
	 * `$bog_vmap_lib_any` and overrides one method. Nothing downstream of `tree()`
	 * ever knew where the classes came from, and now nothing has to learn.
	 *
	 * A separate module from `lib/` on purpose: this one drags the whole of Giper
	 * Baza into any bundle that touches it, and the palette and the inspector, which
	 * need only the pack library, should not pay for a feature they do not use. The
	 * dependency runs one way, `lib/land` onto `lib/`, which is also what the
	 * namespace path already says.
	 *
	 * @see ../../ARCHITECTURE.md section 5
	 */

	/**
	 * One component of a library: the three sources a class is built from.
	 *
	 * Same shape as a node of a document, deliberately not shared with it: `app/doc`
	 * belongs to the application and this is a leaf model, so the dependency would
	 * run the wrong way. The duplication is three field declarations; the coupling
	 * would be permanent.
	 *
	 * The class name is NOT a field. It is the first token of `Tree` and storing it
	 * beside would be a second source of truth for a derivable fact — the same
	 * argument section 6 makes about wires, and it bites the same way: rename the
	 * class in the text and the copy is stale.
	 */
	export class $bog_vmap_lib_land_part extends $giper_baza_dict.with({

		/** `view.tree` declaration. The truth of this component. */
		Tree: $giper_baza_atom_text,

		/** Handwritten class body, applied on top of the generated one. */
		Js: $giper_baza_atom_text,

		/** Styles, attached apart from the class so a CSS edit rebuilds nothing. */
		Css: $giper_baza_atom_text,

	}) {

		/**
		 * **Plain methods, never `@ $mol_mem`.** An accessor of this shape that has
		 * been written through once freezes at what was written: the atom takes a
		 * remote edit, reports the new text, and the cell goes on handing out the
		 * old one for the rest of the session. It shows up only on the component you
		 * edited yourself, which in a shared library is the worst possible place.
		 *
		 * Nothing is lost: `val()` is a wire cell inside the pawn already, so a
		 * reader stays reactive and a two way binding writes straight through. There
		 * is a test named for this, and it is the reason it exists.
		 */
		tree( next?: string ) {
			return this.Tree( next )?.val( next ) ?? ''
		}

		js( next?: string ) {
			return this.Js( next )?.val( next ) ?? ''
		}

		css( next?: string ) {
			return this.Css( next )?.val( next ) ?? ''
		}

	}

	/**
	 * A published library: a name and its components.
	 *
	 * `Parts` live in the SAME land as the shelf, made with `make( null )`. A land
	 * per component would mean proof of work for every class published and per
	 * component access rights nobody asked for; a library is shared by one link, so
	 * one land is also the unit somebody actually grants access to.
	 */
	export class $bog_vmap_lib_land_shelf extends $giper_baza_dict.with({

		/** Human name of the library. */
		Title: $giper_baza_atom_text,

		/** Components, in the order they should be declared. */
		Parts: $giper_baza_list_link.to( ()=> $bog_vmap_lib_land_part ),

	}) {

		/** Plain method, for the reason spelled out at `land_part.tree`. */
		title( next?: string ) {
			return this.Title( next )?.val( next ) ?? ''
		}

		/**
		 * Components of the library.
		 *
		 * Resolved through the shelf's OWN land and not through `remote_list()`,
		 * which would be the obvious call and is a trap: it resolves every link
		 * through the static `$giper_baza_glob.Land`, a different land instance that
		 * waits for a master to sync with. Under a test, where there is no master,
		 * that wait never ends and the run dies in silence — no error, no output, and
		 * every build that runs the tests hangs with it.
		 *
		 * Going through `land.Pawn( … ).Head( link.head() )` is correct here and not
		 * merely convenient, because `make( null )` puts the parts in this very land.
		 * The storage decision that suits the domain is the one that is testable.
		 */
		parts() {

			const links = this.Parts()?.items()?.filter( $mol_guard_defined ) ?? []
			const land = this.land()

			return links.map(
				link => land.Pawn( $bog_vmap_lib_land_part ).Head( link.head() )
			)
		}

	}

	/**
	 * Library backed by a land of sources.
	 *
	 * Only `tree()` differs from a pack, and it differs by where the text comes
	 * from — not by what is done with it: the same `$bog_vmap_lib_parse`, the same
	 * `$mol_view` stub, the same normalization. A tree built here and a tree fetched
	 * from `web.view.tree` are indistinguishable downstream, which is the whole
	 * requirement.
	 */
	export class $bog_vmap_lib_land extends $bog_vmap_lib_any {

		/**
		 * The published library. Supplied by the owner, absent until one is opened.
		 *
		 * Absent is a state and not a failure — the palette of a document with no
		 * library attached is empty, not broken — so this answers null rather than
		 * throwing, and `tree()` above degrades into the empty library.
		 */
		shelf(): $bog_vmap_lib_land_shelf | null {
			return null
		}

		/**
		 * Components of the shelf, with their land asked to sync on the way.
		 *
		 * A land reached by a link alone does not sync itself — the `.sync()` in
		 * `land.ts` is commented out — so a library published by somebody else would
		 * read as empty forever. A `Promise` means the sync went off in the
		 * background, which is what was wanted, so it is swallowed and only a real
		 * error is rethrown.
		 */
		@ $mol_mem
		parts(): readonly $bog_vmap_lib_land_part[] {

			const shelf = this.shelf()
			if( !shelf ) return []

			try {
				shelf.land().sync()
			} catch( error ) {
				if( !( error instanceof Promise ) ) $mol_fail_hidden( error )
			}

			return shelf.parts()
		}

		/**
		 * Declarations of every component, in one text.
		 *
		 * Glued rather than parsed one by one because a library is one namespace:
		 * a component inheriting another component of the same library has to
		 * resolve, and it only can if both are in the same tree.
		 */
		@ $mol_mem
		source() {
			return this.parts().map( part => part.tree().replace( /\n?$/, '\n' ) ).join( '' )
		}

		@ $mol_mem
		override tree() {
			return this.$.$bog_vmap_lib_parse( this.source(), 'land' )
		}

		/**
		 * Classes of the library WITHOUT the `$mol_view` stub, for composing this
		 * library into another one through its `classes()`.
		 *
		 * The stub has to go: it is a stand-in for a class the pack really carries,
		 * and `$bog_vmap_lib_index` keeps the last declaration of a name, so handing
		 * it over would let the stand-in shadow the real thing. `tree()` keeps it,
		 * because standing alone this library has no other `$mol_view` at all.
		 */
		@ $mol_mem
		class_trees(): readonly $mol_tree2[] {
			return this.$.$mol_view_tree2_normalize(
				this.$.$mol_tree2_from_string( this.source(), 'land' )
			).kids
		}

		/**
		 * Handwritten bodies by class name, the second of the three sources.
		 *
		 * Built here and handed to the scene by somebody else: compiling a library
		 * inside the sandbox is a task of its own, and this is the shape it will
		 * want — the same `{ [ klass ]: js }` the bridge already carries for a
		 * document.
		 */
		@ $mol_mem
		js(): { readonly [ klass: string ]: string } {

			const res = {} as { [ klass: string ]: string }

			for( const part of this.parts() ) {

				const body = part.js()
				if( !body ) continue

				const name = this.$.$bog_vmap_lib_land_name( part.tree() )
				if( name ) res[ name ] = body

			}

			return res
		}

		/** Styles of every component, in one text, as the scene attaches them. */
		@ $mol_mem
		css() {
			return this.parts().map( part => part.css() ).filter( Boolean ).join( '\n' )
		}

	}

	/**
	 * Name of the class a `view.tree` source declares, or empty when it declares
	 * none.
	 *
	 * The first token of the first line, and asked of the text every time rather
	 * than stored beside it — see the note on `land_part`. Blank instead of a throw
	 * because a half typed component is an ordinary state of an editor.
	 */
	export function $bog_vmap_lib_land_name( source: string ) {
		return /^([^\s]+)/.exec( source.trimStart() )?.[ 1 ] ?? ''
	}

}
