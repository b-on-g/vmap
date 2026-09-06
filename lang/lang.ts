namespace $ {

	/**
	 * Document model over a `view.tree` AST.
	 *
	 * A vmap document is one `view.tree` class, so the source text is the truth and
	 * the tree is derived from it. Every edit goes through the tree and is written
	 * straight back as text, which is what makes source export free.
	 *
	 * Port of `hyoo_studio_component` and `hyoo_studio_property`, plus the wire
	 * emitter, which studio has no equivalent of. Deviations are marked at their
	 * place.
	 *
	 * Pure model: knows nothing about DOM, compiles nothing, executes nothing.
	 * @see ../ARCHITECTURE.md sections 1 and 2
	 */

	/**
	 * A wire between two nodes of the document.
	 *
	 * Serializes to exactly `name = Node prop`, an `=` operator over exactly two
	 * tokens. The shape of this type is the whole safety story: there is no field
	 * for the operator, no field for a third token, and one flag for both ends, so
	 * none of the five traps of section 1 is even expressible.
	 *
	 * @see $bog_vmap_lang_wire_tree
	 */
	export type $bog_vmap_lang_wire = {

		/** Property of the class the wire lands in, bare name. */
		readonly name: string

		/** Property holding the source node, bare name. Must be declared. */
		readonly node: string

		/** Property of that node, bare name. */
		readonly prop: string

		/** Two-way. Puts `?` on BOTH ends, never on one. */
		readonly bidi?: boolean

	}

	/**
	 * Checks that a token is a bare property name and returns it.
	 *
	 * Bare means: no `*`, no `?`, no `!`, no spaces, nothing but a name. Signs are
	 * never carried by a token, they are produced from `bidi`. That single rule
	 * kills three of the five traps at once, because every one of them is a token
	 * that smuggles something in:
	 *
	 * - `value?` as the right token gives `w = Field value?`, which compiles to
	 *   `value(next)` with no `next` in scope, so the wire throws `ReferenceError`
	 *   on ANY read;
	 * - `w?` as the left token gives `w? = Field hint`, which compiles to a setter
	 *   whose right end ignores it, so writes vanish with no error at all;
	 * - `B value` as a token gives `w = A B value`, which compiles to
	 *   `this.A().B().value()`, and `B` was hoisted onto the root by `upper`, so it
	 *   is not a method of `A` and never will be.
	 *
	 * The grammar is `$mol_view_tree2_prop_signature` itself rather than a regexp of
	 * our own, so a token this accepts is a token the compiler accepts.
	 */
	export function $bog_vmap_lang_token(
		this: $,
		token: string,
		role: string,
	) {

		const parts = [ ... token.matchAll( $mol_view_tree2_prop_signature ) ][ 0 ]?.groups

		if( !parts || parts.name !== token ) this.$mol_fail(
			new Error( `${ role } must be a bare name, got ${ JSON.stringify( token ) }` )
		)

		return token
	}

	/**
	 * Builds the tree of a wire: `name = Node prop`.
	 *
	 * The operator is `=` and nothing else. `<= Node prop` looks like the same thing
	 * and is not: it goes through the `upper` hack, which takes the kids of the
	 * reference as default values, so it declares a property `Node` valued `prop`
	 * and silently drops the `.prop()` link from the generated call. Either the
	 * build dies with a message about default values, or the build is green and the
	 * bundle carries `Node(){ return prop }`, a bare identifier that throws at the
	 * one node the wire was drawn to, whenever somebody gets there.
	 *
	 * @see ../ARCHITECTURE.md section 1
	 */
	export function $bog_vmap_lang_wire_tree(
		this: $,
		wire: $bog_vmap_lang_wire,
	) {

		const sign = wire.bidi ? '?' : ''

		const name = this.$bog_vmap_lang_token( wire.name, 'Wire name' ) + sign
		const node = this.$bog_vmap_lang_token( wire.node, 'Wire node' )
		const prop = this.$bog_vmap_lang_token( wire.prop, 'Wire prop' ) + sign

		return $mol_tree2.struct( name, [
			$mol_tree2.struct( '=', [
				$mol_tree2.struct( node, [
					$mol_tree2.struct( prop ),
				] ),
			] ),
		] )
	}

	/**
	 * Builds a bare reference `<= name`, the form that goes into `sub`.
	 *
	 * Bare means childless. A reference with a child is the middle of the three
	 * forms of `<=`, the only dangerous one, and the guard against it is that this
	 * takes a token instead of a path.
	 */
	export function $bog_vmap_lang_ref_tree(
		this: $,
		name: string,
	) {
		return $mol_tree2.struct( '<=', [
			$mol_tree2.struct( this.$bog_vmap_lang_token( name, 'Reference' ) ),
		] )
	}

	/**
	 * Builds a free part: `Calc $bog_vmap_lang_calc` at class level, no operator.
	 *
	 * A part declared this way is a plain property of the root class, so the
	 * compiler makes it a lazy memoized singleton and it creates no DOM, because it
	 * is not in `sub`. That is the whole mechanism behind a detail lying free on the
	 * canvas.
	 */
	export function $bog_vmap_lang_part_tree(
		this: $,
		name: string,
		klass: string,
	) {

		const base = $mol_tree2.struct( klass )

		if( ! $mol_view_tree2_class_match( base ) ) this.$mol_fail(
			new Error( `Part class must be a class name, got ${ JSON.stringify( klass ) }` )
		)

		return $mol_tree2.struct( this.$bog_vmap_lang_token( name, 'Part name' ), [ base ] )
	}

	/**
	 * Class declarations reordered so that a base always precedes its heir.
	 *
	 * `class $A extends $[ '$B' ]` resolves its base at definition time, and
	 * `$mol_view_tree2_to_js` emits declarations in the order it received them. A
	 * heir written above its base therefore inherits the PREVIOUS version of it, or
	 * `undefined` on a first run, and says nothing about it.
	 *
	 * Bases the list does not declare — anything from a library — are left alone:
	 * they are already in the namespace before our code runs.
	 *
	 * The scene carries an equivalent of this for the same reason. The two should
	 * become one, and this is the side to keep: sorting declarations is a property
	 * of the language, not of whoever happens to compile them.
	 */
	export function $bog_vmap_lang_sorted(
		this: $,
		defs: readonly $mol_tree2[],
	) {

		const by_name = new Map< string, $mol_tree2 >()
		for( const def of defs ) by_name.set( def.type, def )

		const sorted = [] as $mol_tree2[]
		const done = new Set< string >()
		const path = new Set< string >()

		const walk = ( def: $mol_tree2 )=> {

			if( done.has( def.type ) ) return

			if( path.has( def.type ) ) this.$mol_fail(
				new Error( `Circular inheritance around ${ def.type }` )
			)

			path.add( def.type )

			const base = by_name.get( def.kids[ 0 ]?.type ?? '' )
			if( base && base !== def ) walk( base )

			path.delete( def.type )
			done.add( def.type )
			sorted.push( def )

		}

		for( const def of defs ) walk( def )

		return sorted as readonly $mol_tree2[]
	}

	/**
	 * A document: several `view.tree` classes in one text.
	 *
	 * `$bog_vmap_lang_node` models one CLASS, and rightly so — but a document is
	 * not one class, and using the node as if it were silently eats the others.
	 * Measured: two classes in the source, one property of the first edited, the
	 * second gone from the text entirely. `tree()` there reads `kids[ 0 ]` and
	 * `tree( next )` writes `source( next.toString() )`, so every write replaces
	 * the whole document with the single class it touched. No error, no warning.
	 *
	 * This level owns the text, cuts it into classes for reading, and puts one back
	 * without reserializing its neighbours from anything but their own trees. It
	 * hands out `$bog_vmap_lang_node`s whose `source` is a slice of it, so
	 * everything already written against the node model keeps working unchanged —
	 * that is the point of adding a level instead of widening the one below.
	 *
	 * A class is addressed BY NAME, which is what the editor speaks and what
	 * survives reordering. Two things follow, both real:
	 *
	 * - renaming a class through its node writes under the OLD name, which is
	 *   correct — the slot is found and replaced — but the caller then holds a stale
	 *   key and has to re-read `names()`;
	 * - two classes of one name are one class here, the first. That is already
	 *   broken further down: the class index of the library model keeps the LAST of
	 *   a duplicate pair, so a document with two would disagree with itself about
	 *   which is real. (The index is not named here: mam reads doc comments for
	 *   dependencies, and its name dragged the whole library module into the scene.)
	 *
	 * @see ../ARCHITECTURE.md section 1
	 */
	export class $bog_vmap_lang_doc extends $mol_object {

		/** Text of the whole document. The truth. */
		@ $mol_mem
		source( next?: string ) {
			return next ?? ''
		}

		/**
		 * Classes of the document, in the order the text declares them.
		 *
		 * Read only, and that is deliberate. A cell that both reads and writes
		 * `source` would be a cell frozen by its own write — writing to a
		 * `@$mol_mem` freezes its dependencies — and the document would stop
		 * following the text after the first edit made through it, which is the
		 * one failure that looks exactly like success.
		 */
		@ $mol_mem
		trees(): readonly $mol_tree2[] {
			return this.$.$mol_view_tree2_normalize(
				this.$.$mol_tree2_from_string( this.source().replace( /\n?$/, '\n' ) )
			).kids
		}

		/** Names of the classes, in the order of the text. */
		@ $mol_mem
		names() {
			return this.trees().map( tree => tree.type )
		}

		/**
		 * Source of one class, cut out of the document and written back into it.
		 *
		 * Writing rebuilds the text from the trees of all the classes with this one
		 * replaced, so a neighbour comes back out of its own tree and nothing else.
		 * On an already normalized document that is byte for byte; the first write
		 * to a hand written one normalizes the whole text at once, which is the same
		 * lossy step `$bog_vmap_lang_node` has always taken, now taken over the
		 * document rather than over one class.
		 *
		 * A name the document does not carry appends, so that handing a node a
		 * source is also how a class is added.
		 *
		 * NOT memoized, for the reason spelled out at `trees`: this is the write
		 * path, and a cell on a write path freezes at what was written. The read is
		 * two lookups over `trees()`, which is a cell already, so there is nothing
		 * to gain either.
		 */
		class_source( name: string, next?: string ) {

			const trees = this.trees()
			const index = trees.findIndex( tree => tree.type === name )

			if( next === undefined ) return trees[ index ]?.toString() ?? ''

			const parsed = this.$.$mol_view_tree2_normalize(
				this.$.$mol_tree2_from_string( next.replace( /\n?$/, '\n' ) )
			).kids

			const kept = index < 0
				? [ ... trees, ... parsed ]
				: [ ... trees.slice( 0, index ), ... parsed, ... trees.slice( index + 1 ) ]

			this.source( this.$.$mol_tree2.list( kept ).toString() )

			return next
		}

		/**
		 * One class of the document as a node model.
		 *
		 * `source` is replaced with a slice of the document on the instance itself.
		 * Everything else of `$bog_vmap_lang_node` — the tree, the property list,
		 * the wire emitter — is derived from `source` and so needs no changes at
		 * all: the node cannot tell that its text is a part of a larger one.
		 */
		@ $mol_mem_key
		node( name: string ) {
			return $bog_vmap_lang_node.make({
				source: ( next?: string )=> this.class_source( name, next ),
			})
		}

	}

	/**
	 * One node of the document: a single `view.tree` class.
	 *
	 * Port of `hyoo_studio_component`.
	 */
	export class $bog_vmap_lang_node extends $mol_object {

		/** Source text. The truth. Everything else is derived from it. */
		@ $mol_mem
		source( next?: string ) {
			return next ?? ''
		}

		/**
		 * Class tree, derived from the source. Writing a tree serializes it back.
		 *
		 * `$mol_view_tree2_normalize` is lossy: it runs the `upper` hack, so
		 * `<= Hero $mol_view …` nested in `sub` comes out as a flat property `Hero`
		 * of the root plus a bare `<= Hero` left in place. Hoisted properties land
		 * BEFORE the ones already at the top, because `add_inner` fires for them
		 * during the traversal rather than in the final loop.
		 *
		 * That flat form is the canonical shape of a document, not a compromise: it
		 * is the model of section 1 spelled out in the text itself. Round trip is
		 * therefore byte for byte only on a normalized source, which is what the
		 * editor holds, because every write serializes the whole class.
		 *
		 * @see ../ARCHITECTURE.md section 1, «Канонический вид документа»
		 *
		 * Deviation from studio: an empty or classless source fails with a message
		 * instead of `Cannot read properties of undefined`. In an editor an empty
		 * buffer is a normal transient state and has to say so.
		 */
		@ $mol_mem
		tree( next?: $mol_tree2 ) {

			const source = this.source( next && next.toString() ).replace( /\n?$/, '\n' )

			const tree = this.$.$mol_view_tree2_normalize(
				this.$.$mol_tree2_from_string( source )
			).kids[ 0 ]

			if( !tree ) return this.$.$mol_fail( new Error( 'No class declared in the source' ) )

			return tree
		}

		@ $mol_mem
		name( next?: string ) {

			const tree = this.tree()
			if( !next ) return tree.type

			this.tree( tree.struct( next, tree.kids ) )

			return next
		}

		@ $mol_mem
		base( next?: string ) {

			const self = this.tree()
			const base = this.$.$mol_view_tree2_class_super( self )
			if( !next ) return base.type

			this.tree( self.clone([ base.struct( next, base.kids ) ]) )

			return next
		}

		@ $mol_mem
		prop_names() {
			return this.$.$mol_view_tree2_class_props( this.tree() )
				.map( tree => this.$.$mol_view_tree2_prop_parts( tree ).name )
		}

		/** Own properties of the class as a list node. */
		@ $mol_mem
		props_tree() {
			return this.tree().list( this.$.$mol_view_tree2_class_props( this.tree() ) )
		}

		/**
		 * Full signature of a property by its bare name: `d` gives back `d*?`.
		 *
		 * Deviation from studio: the early exit is spelled as a test for any sign
		 * instead of `name.indexOf('*') + name.indexOf('?') + name.indexOf('!') > -3`,
		 * which is the same condition written as arithmetic on three `-1`s.
		 */
		@ $mol_mem_key
		prop_fullname( name: string ) {

			if( /[*?!]/.test( name ) ) return name

			for( const tree of this.props_tree().kids ) {

				const sign = tree?.type ?? ''
				const meta = [ ... sign.matchAll( $mol_view_tree2_prop_signature ) ][ 0 ]?.groups
					?? { name: '', key: '', next: '' }

				if( meta.name === name ) return `${ meta.name }${ meta.key || '' }${ meta.next || '' }`

			}

			return ''
		}

		/** Tree of one property. Writing `null` drops it. */
		@ $mol_mem_key
		prop_tree( name: string, next?: $mol_tree2 | null ) {

			const sign = this.prop_fullname( name )

			if( next !== undefined ) {
				this.tree( this.tree().insert( next, this.base(), sign ) )
				return next
			}

			return this.props_tree().select( sign ).kids[ 0 ] ?? null
		}

		@ $mol_action
		prop_add( name: string ) {

			const tree = this.tree()

			this.tree(
				tree.insert(
					tree.struct( name, [ tree.struct( 'null' ) ] ),
					null,
					name,
				)
			)

		}

		@ $mol_action
		prop_drop( name: string ) {
			this.prop_tree( name, null )
		}

		@ $mol_mem_key
		property( name: string ) {
			return $bog_vmap_lang_prop.make({
				name: $mol_const( name ),
				tree: next => this.prop_tree( name, next )!,
				node: $mol_const( this ),
			})
		}

		/**
		 * Declares a free part: `Calc $bog_vmap_lang_calc`.
		 *
		 * Deviation from studio, which has no such thing: the write goes through the
		 * `null` step of the path instead of `base()`, so it lands in the class body
		 * whatever the base is currently called. Same reason `prop_add` does it.
		 */
		@ $mol_action
		part_add( name: string, klass: string ) {

			const tree = this.tree()

			this.tree(
				tree.insert( this.$.$bog_vmap_lang_part_tree( name, klass ), null, name )
			)

		}

		/**
		 * Draws a wire: `name = Node prop`.
		 *
		 * The node end has to be declared already, as a free part or as a sub-view.
		 * `=` declares nothing, that is exactly why it has no collision with `upper`,
		 * so a wire to an undeclared node compiles green and throws `is not a
		 * function` at run time. Refusing here is the only place it can be caught.
		 *
		 * The far end, `wire.prop`, is NOT checked: whether the node's class has such
		 * a port is known only to `bog_vmap_lib.props_map`, and this module knows
		 * nothing of libraries, deliberately: naming it even in a comment would drag
		 * the whole fetching module into our graph. Stage 3.1 draws wires from the
		 * port list, so the question does not arise there either.
		 */
		@ $mol_action
		wire_add( wire: $bog_vmap_lang_wire ) {

			const next = this.$.$bog_vmap_lang_wire_tree( wire )

			if( ! this.prop_names().includes( wire.node ) ) this.$.$mol_fail(
				new Error( `Wire node ${ JSON.stringify( wire.node ) } is not declared in ${ this.name() }` )
			)

			const prev = this.prop_fullname( wire.name )
			if( prev && prev !== next.type ) this.prop_drop( wire.name )

			this.tree( this.tree().insert( next, null, next.type ) )

		}

		/** Appends a bare reference `<= name` to the own `sub` of the class. */
		@ $mol_action
		sub_add( name: string ) {

			const ref = this.$.$bog_vmap_lang_ref_tree( name )

			const prev = this.prop_tree( 'sub' )
			const list = prev?.kids[ 0 ] ?? ref.struct( '/' )

			const sub = ( prev ?? ref.struct( 'sub' ) ).clone([
				list.clone([ ... list.kids, ref ])
			])

			this.tree( this.tree().insert( sub, null, sub.type ) )

		}

		/**
		 * Removes the bare reference `<= name` from the own `sub` of the class.
		 *
		 * The empty list is kept rather than the whole property dropped: `sub /` with
		 * nothing under it is the shape an empty document starts from, so deleting
		 * the last node returns the source to exactly that, instead of to a class
		 * with no `sub` at all.
		 *
		 * Only the reference goes. Dropping the declaration as well is two facts, so
		 * it is two calls — the same split as `part_add` plus `sub_add` on the way
		 * in. A node taken out of `sub` but still declared is a free part that draws
		 * nothing and keeps its ports, which is a legitimate state, not a leftover.
		 */
		@ $mol_action
		sub_drop( name: string ) {

			const prev = this.prop_tree( 'sub' )
			if( !prev ) return

			const list = prev.kids[ 0 ]
			if( !list ) return

			const kids = list.kids.filter( ref => ref.kids[ 0 ]?.type !== name )
			if( kids.length === list.kids.length ) return

			this.tree(
				this.tree().insert( prev.clone([ list.clone( kids ) ]), null, prev.type )
			)

		}

	}

	/**
	 * One property of a node, with its signature.
	 *
	 * Port of `hyoo_studio_property`. `name`, `tree` and `node` are handed in by the
	 * owner through `make`.
	 */
	export class $bog_vmap_lang_prop extends $mol_object {

		name(): string {
			return this.$.$mol_fail( new Error( 'Not defined' ) )
		}

		node(): $bog_vmap_lang_node {
			return this.$.$mol_fail( new Error( 'Not defined' ) )
		}

		tree( next?: $mol_tree2 ): $mol_tree2 {
			return this.$.$mol_fail( new Error( 'Not defined' ) )
		}

		/** Re-binds the same property to another model class. */
		as< Prop extends typeof $bog_vmap_lang_prop >( Prop: Prop ) {
			return Prop.make({
				name: () => this.name(),
				tree: next => this.tree( next ),
			} as InstanceType< Prop >)
		}

		/**
		 * Signature parts: bare `name`, `key` (`*`) and `next` (`?`).
		 *
		 * Deviation from studio: renaming drops the old property BEFORE the instance
		 * method is overwritten, so a failure in the drop leaves the model pointing at
		 * a property that still exists. Studio does it the other way round and ends up
		 * with a live `hyoo_studio_property` addressing a name nothing declares.
		 */
		@ $mol_mem
		meta( next?: {
			readonly name?: string
			readonly key?: string
			readonly next?: string
		} ) {

			const tree = this.tree()
			const sign = tree?.type ?? ''

			let meta = [ ... sign.matchAll( $mol_view_tree2_prop_signature ) ][ 0 ]?.groups
				?? { name: '', key: '', next: '' }

			if( next ) {

				if( next.name ) {
					this.node().prop_drop( meta.name )
					this.name = ()=> next.name!
				}

				meta = { ... meta, ... next }

				this.tree( tree.struct( `${ meta.name }${ meta.key || '' }${ meta.next || '' }`, tree.kids ) )

			}

			return meta
		}

		@ $mol_mem
		title( next?: string ) {
			return this.meta( next === undefined ? undefined : { name: next } ).name
		}

		@ $mol_mem
		key( next?: boolean ) {
			return Boolean(
				this.meta( next === undefined ? undefined : { key: next ? '*' : '' } ).key
			)
		}

		@ $mol_mem
		next( next?: boolean ) {
			return Boolean(
				this.meta( next === undefined ? undefined : { next: next ? '?' : '' } ).next
			)
		}

	}

}
