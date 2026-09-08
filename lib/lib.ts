namespace $ {

	/**
	 * Component library of a vmap document.
	 *
	 * A library is a deployed MAM module: the build drops `web.view.tree` next to
	 * `web.js`, and that file is the whole class tree of the bundle with bases and
	 * properties. Any deployed $mol app in the world is therefore a component
	 * source, with no cooperation from us.
	 *
	 * Port of `hyoo_studio_library` plus the `library()`, `united()`,
	 * `props_map()`, `props_of()`, `class_list()` and `base_options()` methods of
	 * `hyoo_studio`. Deviations are marked at their place.
	 *
	 * Pure model: knows nothing about DOM and renders nothing.
	 * @see ../ARCHITECTURE.md section 5
	 */

	/**
	 * Stub declaration of `$mol_view`, prepended to every fetched pack tree.
	 *
	 * Own properties of `$mol_view` (`sub`, `attr`, `style`, `event`, `field`,
	 * `dom_name`, `title`) never reach `web.view.tree`, because `$mol_view` is
	 * written in TS and the build only dumps what came from `.view.tree` sources.
	 * Without the stub every class in the palette silently loses its base ports,
	 * and nothing anywhere reports it.
	 *
	 * Copied verbatim from `hyoo_studio_library.tree()`.
	 */
	export const $bog_vmap_lib_predef = '$mol_view $mol_object\n\tdom_name \\\n\tstyle *\n\tevent *\n\tfield *\n\tattr *\n\tsub /\n\ttitle \\\n'

	/**
	 * Parses a pack tree into a normalized class tree.
	 *
	 * Deviation from studio: the stub is parsed as its own source instead of being
	 * string-glued in front of the fetched text. Studio hands `predef + str` to the
	 * parser, so every span in a malformed pack points eight rows above its real
	 * place. We show those spans to the user in an error strip, so they have to be
	 * honest. The stub content itself is byte for byte the same.
	 */
	export function $bog_vmap_lib_parse(
		this: $,
		src: string,
		uri = 'web.view.tree',
	) {

		const predef = this.$mol_tree2_from_string( $bog_vmap_lib_predef, '$bog_vmap_lib_predef' )
		const tree = this.$mol_tree2_from_string( src, uri )

		return this.$mol_view_tree2_normalize( tree.clone([ ... predef.kids, ... tree.kids ]) )
	}

	/**
	 * The address with a trailing slash, whatever it was typed with.
	 *
	 * `new URL( 'web.js', base )` drops the last segment of a base that does not end
	 * with one, so `https://b-on-g.github.io/gram` would resolve to
	 * `https://b-on-g.github.io/web.js`. The default `https://mol.hyoo.ru` survives
	 * that only by accident, being an origin root.
	 *
	 * A function and not a step inside the field, because the field is edited by
	 * hand: appending the slash on every keystroke would fight the typing. Typed is
	 * stored as is, derived is normalized — the rule for every field a person types.
	 * @see ../ARCHITECTURE.md section 5, «Адрес пака нормализовать до слэша»
	 */
	export function $bog_vmap_lib_slashed( uri: string ) {
		return uri.replace( /\/?$/, '/' )
	}

	/**
	 * Base address of a sibling module of the pack, derived from the address of the
	 * page asking. Always ends with a slash, so `new URL` keeps its last segment.
	 *
	 * The two layouts are told apart by a trailing `-`, and they are not two
	 * spellings of one rule but two different places, so the code says so.
	 *
	 * The dev server serves every module of a pack out of `<pack>/<module>/-/`, so
	 * the modules are siblings there in the plain sense: the segment naming ours is
	 * replaced by the one asked for, and the `-` goes back on.
	 *
	 * A deploy has only ONE page in the whole project — the editor, published at
	 * the root of the site — and the other modules are published as folders beneath
	 * it, `web.js` and `web.view.tree` without a page of their own. So there is
	 * nothing to replace: the module asked for is a folder inside the one the
	 * editor is served from.
	 *
	 * A last segment ending in `.html` is the page file — `index.html`, `test.html`
	 * are the only two a module has — and is dropped first. Anything else is a
	 * folder, which is how `https://b-on-g.github.io/vmap` reads the same as the
	 * same address with its slash.
	 *
	 * The test is the extension and not merely a dot in the name, because a folder
	 * may carry one: a deploy versioned as `/vmap/v1.2/` is ordinary, and on a dot
	 * the segment `v1.2` would be taken for a page and eaten.
	 *
	 * @see ../ARCHITECTURE.md sections 5 and 7
	 */
	export function $bog_vmap_lib_sibling( page: string, module: string ) {

		const url = new URL( page )
		const path = url.pathname.split( '/' ).filter( Boolean )

		if( /\.html?$/i.test( path[ path.length - 1 ] ?? '' ) ) path.pop()

		// on the dev server the modules stand side by side, each in its own `-`
		if( path[ path.length - 1 ] === '-' ) {
			path.pop()
			path.pop()
			path.push( module, '-' )
		} else {
			path.push( module )
		}

		return `${ url.origin }/${ path.join( '/' ) }/`
	}

	/**
	 * Glues the library tree with the classes of the document into one namespace.
	 *
	 * Both sides end up in the same `$` sandbox at run time, so resolution has to
	 * see them as one list — that is the whole point of `united()` in studio.
	 */
	export function $bog_vmap_lib_united(
		lib: $mol_tree2,
		kids: readonly $mol_tree2[],
	) {
		if( !kids.length ) return lib
		return lib.clone([ ... lib.kids, ... kids ])
	}

	/**
	 * Class name to its super node. The kids of that node are the own properties
	 * of the class, which is how `$mol_view_tree2_normalize` shapes a class.
	 *
	 * Deviation from studio: studio walks the kids linearly on every lookup
	 * (`lib.select( cl, null ).kids[0]`), which is O(classes) per inheritance step
	 * against a tree of ~450 classes. Same answer, built once.
	 *
	 * Second deviation, and the one that matters: a later declaration wins, while
	 * `select` takes the first. Document classes are appended after the library, so
	 * studio's order would let a library class shadow a document class of the same
	 * name. The scene compiles document classes into the sandbox *after* the pack's
	 * `web.js` has filled it, so at run time the document wins. The palette has to
	 * agree with what actually runs.
	 */
	export function $bog_vmap_lib_index( united: $mol_tree2 ) {

		const index = new Map< string, $mol_tree2 >()

		for( const cl of united.kids ) {
			const sup = cl.kids[0]
			if( !sup ) continue
			index.set( cl.type, sup )
		}

		return index
	}

	/**
	 * Inheritance chain of a class, nearest first, ending at the first name that
	 * the namespace does not declare (`$mol_object` for anything from a pack).
	 *
	 * Deviation from studio: a visited set. Studio edits exactly one class, so a
	 * cycle cannot occur there. Here the united namespace carries user authored
	 * classes, and two of them declared as each other's base is one keystroke
	 * away — without the guard it hangs the editor with no error at all.
	 */
	export function $bog_vmap_lib_chain(
		index: Map< string, $mol_tree2 >,
		base: string,
	) {

		const chain = [] as string[]
		const seen = new Set< string >()

		let cl = base

		while( cl && !seen.has( cl ) ) {
			seen.add( cl )
			chain.push( cl )
			cl = index.get( cl )?.type ?? ''
		}

		return chain
	}

	/**
	 * All ports of a class, own and inherited, keyed by property name.
	 *
	 * Ancestors are collected first, so a redefined property keeps the position of
	 * its earliest declaration but carries the most derived node. Same order and
	 * same overriding as `props_map()` in studio, which recurses into the super
	 * before adding its own kids.
	 *
	 * This is what stage 3 grows wire ports out of.
	 */
	export function $bog_vmap_lib_props_map(
		this: $,
		index: Map< string, $mol_tree2 >,
		base: string,
	) {

		const all = new Map< string, $mol_tree2 >()
		const chain = $bog_vmap_lib_chain( index, base )

		for( let i = chain.length - 1; i >= 0; --i ) {

			const sup = index.get( chain[ i ] )
			if( !sup ) continue

			for( const prop of sup.kids ) {
				all.set( this.$mol_view_tree2_prop_parts( prop ).name, prop )
			}

		}

		return all
	}

	/**
	 * Port name to the class that declared the winning version of it.
	 *
	 * Walks the chain exactly as `$bog_vmap_lib_props_map` does, farthest ancestor
	 * first, overwriting on every redeclaration. `Map.set` on a key that is already
	 * there keeps its position and replaces the value, so the last write wins the
	 * value — the nearest declaration, the one whose node `props_map` returned —
	 * while the key order stays identical to `props_map`. The two maps can then be
	 * read side by side by key.
	 *
	 * A port is inherited exactly when its owner is not the class being asked
	 * about. Walking nearest first and keeping the first answer would give the same
	 * owners in a different order, and a consumer that trusted the two orders to
	 * agree would silently mislabel every row.
	 *
	 * Not in studio: it shows one class at a time and has no notion of a port
	 * coming from somewhere else.
	 */
	export function $bog_vmap_lib_props_owner(
		this: $,
		index: Map< string, $mol_tree2 >,
		base: string,
	) {

		const owner = new Map< string, string >()
		const chain = $bog_vmap_lib_chain( index, base )

		for( let i = chain.length - 1; i >= 0; --i ) {

			const sup = index.get( chain[ i ] )
			if( !sup ) continue

			for( const prop of sup.kids ) {
				owner.set( this.$mol_view_tree2_prop_parts( prop ).name, chain[ i ] )
			}

		}

		return owner
	}

	/**
	 * A component library, whatever its classes came from.
	 *
	 * Everything below `tree()` is source agnostic and always was: `united`,
	 * `index`, `props_map` and the rest only ever see a normalized class tree. The
	 * split just makes that visible, so a second source — a land of sources, with
	 * no deploy behind it — is a subclass overriding one method rather than a
	 * parallel implementation of nine.
	 *
	 * The default is the empty library: the `$mol_view` stub and nothing else. A
	 * throw would have been the other option and it is worse, because an empty
	 * library is a real state — a land with no components published yet — and not
	 * an error.
	 *
	 * @see ../ARCHITECTURE.md section 5
	 */
	export class $bog_vmap_lib_any extends $mol_object {

		/** Class tree of the library. Where it comes from is the subclass's business. */
		@ $mol_mem
		tree(): $mol_tree2 {
			return this.$.$bog_vmap_lib_parse( '' )
		}

		/**
		 * Classes of the document, to be resolved alongside the library.
		 * Overridden by the owner; empty until a document is open.
		 *
		 * This is also where a land library rides when it is used ON TOP of a pack
		 * rather than instead of one, which section 5 says is the normal case: land
		 * libraries compile into the same sandbox and inherit from the pack's
		 * `$mol_view`. Composition therefore needs no machinery — the classes of a
		 * land go in beside the document's, and `index` already lets a later
		 * declaration win.
		 */
		classes(): readonly $mol_tree2[] {
			return []
		}

		@ $mol_mem
		united() {
			return this.$.$bog_vmap_lib_united( this.tree(), this.classes() )
		}

		@ $mol_mem
		index() {
			return this.$.$bog_vmap_lib_index( this.united() )
		}

		/** Every class name of the namespace, in declaration order, deduped. */
		@ $mol_mem
		class_list() {
			return [ ... this.index().keys() ]
		}

		/** Same list, most recently declared first, for a base class picker. */
		@ $mol_mem
		base_options() {
			return [ ... this.class_list() ].reverse()
		}

		/**
		 * Palette search by class name. Deliberately not memoized by key: a cell per
		 * typed query would accumulate one dead cell per keystroke, and the filter
		 * over a few hundred names is cheaper than the cell.
		 */
		class_search( query: string ) {
			return this.class_list().filter(
				this.$.$mol_match_text( query, ( name: string )=> [ name ] )
			)
		}

		@ $mol_mem_key
		inherit_chain( cl: string ) {
			return this.$.$bog_vmap_lib_chain( this.index(), cl )
		}

		@ $mol_mem_key
		props_map( base: string ) {
			return this.$.$bog_vmap_lib_props_map( this.index(), base )
		}

		/** Which class each port of `base` came from. */
		@ $mol_mem_key
		props_owner( base: string ) {
			return this.$.$bog_vmap_lib_props_owner( this.index(), base )
		}

		/** Same ports as a tree node, most derived first, as in studio. */
		@ $mol_mem_key
		props_of( base: string ) {
			return this.united().list( [ ... this.props_map( base ).values() ].reverse() )
		}

	}

	/**
	 * Library from a deployed MAM module.
	 *
	 * The name and the interface are unchanged from before the split, because the
	 * palette and the inspector both declare it and neither should have to care
	 * that a second kind of library now exists.
	 */
	export class $bog_vmap_lib extends $bog_vmap_lib_any {

		/**
		 * Deployed MAM module the components come from.
		 *
		 * Empty means no pack at all, and that is a state rather than a failure: a
		 * palette fed by lands alone has nothing deployed behind it. Every address
		 * below is then empty too, and `tree()` is the stub on its own.
		 */
		@ $mol_mem
		pack( next?: string ) {
			return next ?? 'https://mol.hyoo.ru'
		}

		/** Same address, guaranteed to end with a slash. See `$bog_vmap_lib_slashed`. */
		@ $mol_mem
		pack_base() {
			const pack = this.pack()
			return pack ? $bog_vmap_lib_slashed( pack ) : ''
		}

		/** Behaviour of the classes. Loaded by the scene, not by us. */
		@ $mol_mem
		script_link() {
			const base = this.pack_base()
			return base ? new URL( 'web.js', base ).toString() : ''
		}

		/** Declarations of the classes. */
		@ $mol_mem
		tree_link() {
			const base = this.pack_base()
			return base ? new URL( 'web.view.tree', base ).toString() : ''
		}

		/**
		 * Class tree of the pack.
		 *
		 * No try/catch on purpose: `$mol_fetch` throws on any non-2xx and the wire
		 * suspends through exceptions, so catching here would both swallow a dead
		 * pack into an empty palette and break suspension. An unreachable pack has
		 * to reach the view as an error.
		 */
		@ $mol_mem
		override tree() {
			const uri = this.tree_link()
			if( !uri ) return this.$.$bog_vmap_lib_parse( '' )
			return this.$.$bog_vmap_lib_parse( this.$.$mol_fetch.text( uri ), uri )
		}

	}

}
