namespace $ {

	/**
	 * Anchor of the component library of a user, in the home land.
	 *
	 * A neighbour of `$bog_vmap_app_doc_home` on the same root pawn, not a field on
	 * it: fields are keyed by name inside the pawn, so `Libs` sits beside `Docs`
	 * without the document schema learning about libraries.
	 *
	 * A LIST and not one link, on purpose. A pointer made «when there is none» is
	 * forked by a second device whose cache has not caught up yet, and with one atom
	 * the later write wins and the first library is orphaned with everything in it.
	 * A list merges instead, and the first item is the one everybody publishes to.
	 */
	export class $bog_vmap_app_publish_home extends $giper_baza_dict.with({
		Libs: $giper_baza_list_link.to( ()=> $bog_vmap_lib_land_shelf ),
	}) {}

	/**
	 * Publishing a component of the document into the library of the user.
	 *
	 * The CRUD over the shelf of `lib/land`: which land the library is grabbed
	 * into, how a part of the document becomes a class of the library, how a second
	 * publication of the same class finds the first. The schema stays pure.
	 *
	 * Every accessor delegating into an atom is a plain method, see section 9.
	 *
	 * @see ../../ARCHITECTURE.md sections 5 and 9
	 */
	export class $bog_vmap_app_publish_store extends $mol_object {

		/** Plain method: a Giper Baza object under `@ $mol_mem` is destructed on a rebuild. */
		home() {
			return this.$.$giper_baza_glob.home().land().Data( $bog_vmap_app_publish_home )
		}

		/** Links of every library of the user, merged from every device. */
		shelf_links(): readonly $giper_baza_link[] {
			return this.home().Libs()?.items()?.filter( $mol_guard_defined ) ?? []
		}

		/**
		 * The library, or null before the first publication.
		 *
		 * The first of the list: after a merge every device sees the same first
		 * item, so a fork of the pointer costs at most one stray empty library.
		 */
		shelf(): $bog_vmap_lib_land_shelf | null {
			const link = this.shelf_links()[ 0 ]
			return link ? this.$.$giper_baza_glob.Pawn( link, $bog_vmap_lib_land_shelf ) : null
		}

		/**
		 * Rights of the library land: readable by anybody holding the link, which is
		 * what a link into somebody else's palette needs. A preset with `null` in it
		 * is also an unencrypted land. Tests hand in a land to make an area of,
		 * which costs no proof of work; the editor never does.
		 */
		shelf_land_config(): $giper_baza_rank_preset | $giper_baza_land {
			return [[ null, this.$.$giper_baza_rank_read ]]
		}

		shelf_title() {
			return 'Мои компоненты'
		}

		/**
		 * The library, made on first use. **Reach this from a fiber only**: grabbing
		 * the land mines proof of work, and the task doing it is cached per fiber.
		 * Checked at the top, so a retry of the fiber does not make a second one.
		 */
		shelf_ensure() {

			const prev = this.shelf()
			if( prev ) return prev

			const shelf = this.home().Libs( null )!.make( this.shelf_land_config() )
			shelf.title( this.shelf_title() )

			return shelf
		}

		/**
		 * Link of the library land, as the palette field of another scene takes it,
		 * or empty before the first publication.
		 */
		link() {
			return this.shelf()?.land().link().str ?? ''
		}

		/**
		 * Name of the library class a part of the document is published as.
		 *
		 * A part is a property of the root class, `Button_minor $mol_button_minor`,
		 * and a property name cannot start with `$`, while a class of a library must:
		 * the scene compiles nothing else. So `Button_minor` becomes
		 * `$bog_vmap_pub_button_minor`. Its own prefix, so that a part called `App`
		 * or `Scene` cannot shadow a real module of this pack.
		 */
		class_name( part: string ) {
			return '$bog_vmap_pub_' + part.toLowerCase()
		}

		/**
		 * Declaration of the part as a class of the library: the same tree under the
		 * library name. Only the first token changes, the body is byte for byte.
		 */
		class_source( part: string, source: string ) {

			const tree = this.tree( source )
			if( !tree ) return this.$.$mol_fail( new Error( 'No class declared in the source' ) )

			return tree.struct( this.class_name( part ), tree.kids ).toString()
		}

		/** The declaration of a part parsed, or null for an empty source. */
		tree( source: string ) {
			return this.$.$mol_tree2_from_string(
				source.replace( /\n?$/, '\n' ), 'vmap.view.tree',
			).kids[ 0 ] ?? null
		}

		/**
		 * Properties of the DOCUMENT a part is wired to, by name.
		 *
		 * Every `<=` and `<=>` inside a part compiles to `this.name()` on the ROOT,
		 * see section 1. A reference with kids, `<= Inner $mol_view …`, declares
		 * `Inner` right there through `upper`, so the declaration travels with the
		 * published class and resolves. A bare one, and the node of a `=`, declares
		 * nothing: published alone, the class resolves them against itself, where
		 * nothing has them — a green compile and a hole at run time. Those are the
		 * names here, unless the part declares them itself.
		 */
		bound_names( source: string ) {

			const bare = ( node: $mol_tree2 )=> node.type.replace( /[*?!]+$/, '' )

			const owned = new Set< string >()
			const refs = new Set< string >()

			const walk = ( node: $mol_tree2 )=> {

				const ref = node.kids[ 0 ]

				if( ref && ( node.type === '<=' || node.type === '<=>' ) ) {
					( ref.kids.length ? owned : refs ).add( bare( ref ) )
				}

				if( ref && node.type === '=' ) refs.add( bare( ref ) )

				for( const kid of node.kids ) walk( kid )
			}

			for( const kid of this.tree( source )?.kids ?? [] ) walk( kid )

			return [ ... refs ].filter( name => !owned.has( name ) )
		}

		/**
		 * The refusal in the user's words, or empty when the part may go. `classes`
		 * are the classes the document authors: a part based on one of them takes
		 * its base along nowhere.
		 */
		refusal( part: string, source: string, classes: readonly string[] = [] ) {

			const base = this.tree( source )?.kids[ 0 ]?.type ?? ''
			if( classes.includes( base ) ) {
				return `деталь ${ part } наследует класс ${ base } документа, выберите базу из библиотеки перед публикацией`
			}

			const bound = this.bound_names( source )
			if( !bound.length ) return ''

			return `деталь ${ part } ссылается на ${ bound.join( ', ' ) } документа, отвяжите провод перед публикацией`
		}

		/** The part of the library declaring this class, or null. */
		part_of( shelf: $bog_vmap_lib_land_shelf, klass: string ) {
			return shelf.parts().find(
				part => $bog_vmap_lib_land_name( part.tree() ) === klass
			) ?? null
		}

		/**
		 * Publishes a part of the document: its declaration, body and styles become
		 * one part of the library, or replace the one already declaring this class.
		 *
		 * **From a fiber only**, `$mol_wire_async( store ).publish( … )`, with the
		 * texts taken before the call: the first publication grabs the land, and a
		 * plain method inside one fiber is what lets the proof of work be cached
		 * across the retries. Answers the link of the library.
		 *
		 * A part wired to the document, or based on a class of it, is refused before
		 * anything is written, see `refusal`; the view asks it first and shows it.
		 */
		publish( part: string, source: string, js = '', css = '', classes: readonly string[] = [] ) {

			const refusal = this.refusal( part, source, classes )
			if( refusal ) return this.$.$mol_fail( new Error( refusal ) )

			const tree = this.class_source( part, source )
			const klass = this.class_name( part )

			const shelf = this.shelf_ensure()
			const one = this.part_of( shelf, klass ) ?? shelf.Parts( null )!.make( null )

			one.tree( tree )

			// An empty text is not written into a part that never had one: the
			// atom would be made only to hold nothing.
			if( js || one.js() ) one.js( js )
			if( css || one.css() ) one.css( css )

			return shelf.land().link().str
		}

	}

}
