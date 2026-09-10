namespace $ {

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
