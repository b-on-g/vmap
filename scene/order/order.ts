namespace $ {

	/**
	 * Order of the declarations going into one `new Function`: the libraries, then
	 * the document, every base before its heir, and one declaration per name.
	 *
	 * Libraries first because the document is written against them, and a stable
	 * sort keeps that unless a library class inherits a document class — legal,
	 * odd, and then the base still comes first. The sort itself is the canonical
	 * `$bog_vmap_lang_sorted`: ordering declarations is a property of the language,
	 * and the scene's own copy of it was the second one too many.
	 *
	 * A name declared twice keeps the LAST declaration and drops the earlier one,
	 * which is the rule the class index of the library model already lives by and the rule the
	 * sandbox enforces on its own: two declarations of one class in one source
	 * would define the second over the first anyway, only with the first still
	 * having been extended by anyone declared in between. Dropping it up front makes
	 * «the document shadows the library» hold for heirs as well.
	 *
	 * No class name is spelled out in this comment on purpose: mam reads doc
	 * comments for dependencies, and a one segment name here failed the build of
	 * the scene with «Root package not found».
	 *
	 * Bases the list does not declare — the classes of the pack, already in the
	 * sandbox — are left alone, as the sort leaves them.
	 */
	export function $bog_vmap_scene_order(
		this: $,
		libs: readonly $mol_tree2[],
		doc: readonly $mol_tree2[],
	): readonly $mol_tree2[] {

		const all = [ ... libs, ... doc ]

		const last = new Map< string, number >()
		all.forEach( ( def, index )=> last.set( def.type, index ) )

		const unique = all.filter( ( def, index )=> last.get( def.type ) === index )

		return this.$bog_vmap_lang_sorted( unique )
	}

}
