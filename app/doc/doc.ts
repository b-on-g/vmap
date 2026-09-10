namespace $ {

	/**
	 * Document of the editor in Giper Baza.
	 *
	 * Pure schema. No static action decorator anywhere: on a static the wire method
	 * takes the class itself as the fiber owner, fibers stop deduplicating
	 * consistently, and writes go missing between devices without a single error.
	 * All CRUD lives in the views. There is a test that keeps it that way.
	 *
	 * What is stored here is exactly what nothing else can recompute. Everything
	 * derivable from the source text is deliberately absent, see the note on wires
	 * below.
	 *
	 * @see ../../ARCHITECTURE.md sections 1 and 9
	 */

	/**
	 * One node of the document: a class with its three sources.
	 *
	 * The `view.tree` text is the truth, exactly as in `bog_vmap_lang_node`, and
	 * everything the editor shows is derived from it by parsing. So the tree, the
	 * property list, the class name (which is the first token of the text) and the
	 * compiled class are all absent from the schema on purpose.
	 *
	 * **Wires are absent too, and that is the one decision here worth arguing
	 * about.** A wire is two lines of source: `calc_result = Calc result` on the
	 * root and `<= calc_result` at the target property. Both live in `Tree`.
	 * A separate wire record would be a second source of truth for the very thing
	 * section 1 declares the only one, and the two would part company the first
	 * time somebody edits the text by hand in the code editor of stage 4.1.
	 * The curve on the canvas is drawn from its two ends and has no data of its own.
	 *
	 * One atom per source per node, never one `sand_ordered` over the document:
	 * that one loses text on simultaneous edits and is quadratic on write, 76 ms
	 * per edit at 500 edits. Co-editing is therefore per node, last write wins.
	 */
	export class $bog_vmap_app_doc_node extends $giper_baza_dict.with({

		/** `view.tree` declaration. The truth of this node. */
		Tree: $giper_baza_atom_text,

		/** Hand written class body, applied on top of the generated one. */
		Js: $giper_baza_atom_text,

		/** Styles, attached separately from the class so a CSS edit rebuilds nothing. */
		Css: $giper_baza_atom_text,

	}) {

		/**
		 * `view.tree` text of the node.
		 *
		 * Named after `bog_vmap_lang_node.source()`, which holds the same string, and
		 * NOT after the `Tree` field: `tree()` over there returns the parsed AST, and
		 * two methods of the same name returning text in one model and a tree in the
		 * other would be a trap for the next reader.
		 *
		 * **No `@$mol_mem` here, and that is not an oversight.** Measured: an accessor
		 * of this shape that has been WRITTEN through once freezes at the written
		 * value for good. A remote edit lands in the atom, the atom reports the new
		 * text, and the cell keeps handing out the old one — permanently, a later
		 * local write does not thaw it either. Read-only cells of the same shape track
		 * fine, so the symptom only shows up on the node you edited yourself, which in
		 * a co-editing document is the worst possible place for it.
		 *
		 * Nothing is lost by dropping the decorator: `val()` is already a wire cell
		 * inside the pawn, so a view reading this stays reactive and a `<=>` binding
		 * writes straight through.
		 */
		source( next?: string ) {
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
	 * Place of one item on the canvas.
	 *
	 * Kept apart from the node, and keyed by property name rather than by node,
	 * because a free part takes its class from the library: a property whose base is
	 * a library class has no sources of its own at all, and its whole identity is
	 * the name of the property it occupies on the root class. Coordinates therefore
	 * cannot hang off
	 * `doc_node`, which exists only for classes the document itself authors.
	 *
	 * Coordinates are `atom_real`. `atom_bint` does not survive a write and a read:
	 * you put `3000n` in and get `null` back.
	 */
	export class $bog_vmap_app_doc_spot extends $giper_baza_dict.with({
		X: $giper_baza_atom_real,
		Y: $giper_baza_atom_real,
	}) {

		/** Plain methods, not `@$mol_mem`, for the reason spelled out at `doc_node.source`. */
		x( next?: number ) {
			return this.X( next )?.val( next ) ?? 0
		}

		y( next?: number ) {
			return this.Y( next )?.val( next ) ?? 0
		}

	}

	/**
	 * The document itself.
	 *
	 * `Nodes` are made in the SAME land as the document (`make( null )`), not each
	 * in its own. Section 9 asks for a separate atom per node, which is what gives
	 * per node last-write-wins, and says nothing about separate lands. A land per
	 * node would mean proof of work on every detail dropped onto the canvas, and
	 * per node access rights nobody asked for.
	 *
	 * `Assets` are missing on purpose: an asset is a separate blob land of its own,
	 * addressed by an `asset:` id, and the module that owns them is `bog_vmap_asset`
	 * at stage 5.1. Naming it here, even in a comment, would drag it into our graph
	 * before it exists.
	 */
	export class $bog_vmap_app_doc extends $giper_baza_dict.with({

		/**
		 * Human name of the document. Genuinely stored, nothing derives it.
		 *
		 * Declared here rather than inherited from the entity of the database, which
		 * carries the same field. The entity also carries a memoized `title()`, and
		 * that accessor freezes after a write, see the note at `doc_node.source`.
		 * Overriding it is refused by the type system, because the override helper
		 * presents the base members as properties, so the field is declared here
		 * instead. Same key, same bytes on the wire, plain accessor.
		 */
		Title: $giper_baza_atom_text,

		/** Classes the document authors itself, root included. */
		Nodes: $giper_baza_list_link.to( ()=> $bog_vmap_app_doc_node ),

		/** Which of them is the page. A choice, not a derivation from the order. */
		Root: $giper_baza_atom_link.to( ()=> $bog_vmap_app_doc_node ),

		/** Canvas places, keyed by the property name of the root class. */
		Spots: $giper_baza_dict_to( $bog_vmap_app_doc_spot ),

		/** Deployed MAM module the components come from. Empty means the default. */
		Pack: $giper_baza_atom_text,

	}) {

		pack( next?: string ) {
			return this.Pack( next )?.val( next ) ?? ''
		}

		title( next?: string ) {
			return this.Title( next )?.val( next ) ?? ''
		}

	}

	/**
	 * Anchor of the documents in the home land of a user.
	 *
	 * Without it the types above are unreachable: something has to hold the list a
	 * session starts from. Deliberately nothing more than that list — which land a
	 * document is grabbed into, and with which rights, is a decision of the views,
	 * and masters are chosen by the node, never declared by a module.
	 */
	export class $bog_vmap_app_doc_home extends $giper_baza_dict.with({
		Docs: $giper_baza_list_link.to( ()=> $bog_vmap_app_doc ),
	}) {}

	/** Every schema class of the module, for the purity test. */
	export const $bog_vmap_app_doc_schema = [
		$bog_vmap_app_doc,
		$bog_vmap_app_doc_node,
		$bog_vmap_app_doc_spot,
		$bog_vmap_app_doc_home,
	] as const

}
