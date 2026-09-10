namespace $ {

	/**
	 * Document model over a `view.tree` AST.
	 *
	 * A vmap document is one `view.tree` class, so the source text is the truth and
	 * the tree is derived from it. Every edit goes through the tree and is written
	 * straight back as text, which is what makes source export free.
	 *
	 * Port of the component and property models of studio, plus the wire emitter,
	 * which studio has no equivalent of. Deviations are marked at their place.
	 *
	 * Pure model: knows nothing about DOM, compiles nothing, executes nothing.
	 * @see ../ARCHITECTURE.md sections 1 and 2
	 */

	/**
	 * Serializes to exactly `name = Node prop`, an `=` operator over exactly two
	 * tokens. The shape of this type is the whole safety story: there is no field
	 * for the operator, no field for a third token, and one flag for both ends, so
	 * none of the five traps of section 1 is even expressible.
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
	 * A wire with its consumer: `from.from_prop` feeds `to.to_prop` through the
	 * root property `name`. Two lines of the class and nothing else.
	 */
	export type $bog_vmap_lang_link = {
		readonly from: string
		readonly from_prop: string
		readonly to: string
		readonly to_prop: string
		readonly name: string
		readonly bidi: boolean
	}

	/**
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
	 * The grammar is the stock signature regexp itself rather than one of our own,
	 * so a token this accepts is a token the compiler accepts.
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
	 * Stricter than the compiler on purpose. The stock class match takes anything
	 * starting with a dollar or a capital, generics and quotes included, because it
	 * also has to recognize the classes of somebody else's code; a class
	 * WE write has to survive one more step, and that step is mam resolving the
	 * name into a folder. Every underscore is a level of folders, so the name is a
	 * dollar and at least two lowercase segments, and nothing else fits in a path.
	 *
	 * A refusal here is a message to a person, so this answers yes or no and leaves
	 * the wording to the caller, who knows in what language to say it.
	 */
	export function $bog_vmap_lang_class_ok( name: string ) {
		return /^\$[a-z][a-z0-9]*(_[a-z0-9]+)+$/.test( name )
	}

	/**
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
	 * A bare reference `<= name`, the form that goes into `sub`. Bare means
	 * childless: a reference with a child is the middle of the three forms of `<=`,
	 * the only dangerous one, and the guard against it is that this takes a token
	 * instead of a path.
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
	 * A free part is a name and a class at class level, with no operator between
	 * them: a plain property of the root class, so the compiler makes it a lazy
	 * memoized singleton and it creates no DOM, because it is not in `sub`. That is
	 * the whole mechanism behind a detail lying free on the canvas.
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

	/** Value of one key of a `*` dictionary, or `null` when the key is not there. */
	export function $bog_vmap_lang_dict_get(
		dict: $mol_tree2 | null,
		key: string,
	) {

		if( dict?.type !== '*' ) return null

		const found = dict.kids.find( kid => kid.type === key )

		return found?.kids[ 0 ] ?? null
	}

	/**
	 * A key already there is replaced where it stands, so `^` keeps the head of the
	 * dictionary it has to keep: a redeclared dictionary REPLACES the one of the
	 * base instead of extending it, and `^` is the line that undoes that. Writing a
	 * key must never be able to move it, and appending is the only other option.
	 */
	export function $bog_vmap_lang_dict_set(
		this: $,
		dict: $mol_tree2,
		key: string,
		value: $mol_tree2 | null,
	) {

		const name = this.$bog_vmap_lang_token( key, 'Dictionary key' )

		if( !value ) return dict.clone( dict.kids.filter( kid => kid.type !== name ) )

		const entry = dict.struct( name, [ value ] )

		if( ! dict.kids.some( kid => kid.type === name ) ) {
			return dict.clone([ ... dict.kids, entry ])
		}

		return dict.clone( dict.kids.map( kid => kid.type === name ? entry : kid ) )
	}

	/**
	 * Class declarations reordered so that a base always precedes its heir. A
	 * generated class resolves its base at definition time, and the generator emits
	 * declarations in the order it received them. A heir written above its base
	 * therefore inherits the PREVIOUS version of it, or `undefined` on a first run,
	 * and says nothing about it.
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
	 * The node model below models one CLASS, and rightly so — but a document is not
	 * one class, and using the node as if it were silently eats the others: its
	 * read takes the first kid and its write serializes that one tree over the
	 * whole source, so editing one property of the first class drops the second
	 * from the text. No error, no warning.
	 *
	 * This level owns the text, cuts it into classes for reading, and puts one back
	 * without reserializing its neighbours from anything but their own trees. It
	 * hands out nodes whose `source` is a slice of it, so everything already
	 * written against the node model keeps working unchanged — that is the point of
	 * adding a level instead of widening the one below.
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
	 *   which is real.
	 *
	 * @see ../ARCHITECTURE.md section 1
	 */
	export class $bog_vmap_lang_doc extends $mol_object {

		/** The truth. */
		@ $mol_mem
		source( next?: string ) {
			return next ?? ''
		}

		/**
		 * Read only, and that is deliberate. A cell that both reads and writes
		 * `source` would be a cell frozen by its own write — a write to a memoized
		 * cell freezes its dependencies — and the document would stop following the
		 * text after the first edit made through it, which is the one failure that
		 * looks exactly like success.
		 */
		@ $mol_mem
		trees(): readonly $mol_tree2[] {
			return this.$.$mol_view_tree2_normalize(
				this.$.$mol_tree2_from_string( this.source().replace( /\n?$/, '\n' ) )
			).kids
		}

		@ $mol_mem
		names() {
			return this.trees().map( tree => tree.type )
		}

		/**
		 * Writing rebuilds the text from the trees of all the classes with this one
		 * replaced, so a neighbour comes back out of its own tree and nothing else.
		 * On an already normalized document that is byte for byte; the first write
		 * to a hand written one normalizes the whole text at once, which is the same
		 * lossy step the node model has always taken, now taken over the document
		 * rather than over one class.
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
		 * A class name is spelled in more places than its own declaration: it is the
		 * base of an heir (`site_card site_page`, both with a leading dollar) and the
		 * value of a part declared with it (`Card site_card`, same). Retyping the
		 * declaration alone leaves those
		 * spelling a class nobody declares, which compiles into `Class extends value
		 * undefined` or into a part of a class that is not there — so the mentions
		 * are rewritten in the SAME write, over every class of the document.
		 *
		 * A mention is any tree node typed exactly with the old name. Only structural
		 * tokens carry a type in `tree2`; a literal is a data node, so a class name
		 * written inside a string is not touched and cannot be.
		 *
		 * A name already declared is refused, like the rename of a property: two
		 * classes of one name is a document that disagrees with itself about which is
		 * real, and the class index of a library keeps the last of such a pair.
		 *
		 * Whoever holds a `node( from )` has to ask for `node( to )` afterwards; the
		 * old handle addresses a class the document no longer carries, exactly as the
		 * property handle does after `prop_rename`.
		 */
		@ $mol_action
		class_rename( from: string, to: string ) {

			if( from === to ) return

			const trees = this.trees()

			if( !trees.some( tree => tree.type === from ) ) return this.$.$mol_fail(
				new Error( `Class ${ JSON.stringify( from ) } is not declared in the document` )
			)

			if( trees.some( tree => tree.type === to ) ) return this.$.$mol_fail(
				new Error( `Class ${ JSON.stringify( to ) } is already declared in the document` )
			)

			const renamed = ( tree: $mol_tree2 ): $mol_tree2 => {
				const kids = tree.kids.map( renamed )
				return tree.type === from ? tree.struct( to, kids ) : tree.clone( kids )
			}

			this.source( this.$.$mol_tree2.list( trees.map( renamed ) ).toString() )

		}

		/**
		 * `source` is replaced with a slice of the document on the instance itself.
		 * Everything else of the node model — the tree, the property list, the wire
		 * emitter — is derived from `source` and so needs no changes at all: the
		 * node cannot tell that its text is a part of a larger one.
		 */
		@ $mol_mem_key
		node( name: string ) {
			return $bog_vmap_lang_node.make({
				source: ( next?: string )=> this.class_source( name, next ),
			})
		}

	}

	/** One node of the document: a single `view.tree` class. */
	export class $bog_vmap_lang_node extends $mol_object {

		/** The truth. Everything else is derived from it. */
		@ $mol_mem
		source( next?: string ) {
			return next ?? ''
		}

		/**
		 * Normalization is lossy: it runs the `upper` hack, so a named sub view
		 * nested in `sub` comes out as a flat property of the root plus a bare
		 * reference left in place. Hoisted properties land BEFORE the ones already
		 * at the top, because they are added during the traversal rather than in the
		 * final loop.
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

		/** Writing `null` drops the property. */
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

		/**
		 * `next` is a whole signature, `d*?` and not `d`, because a rename and a
		 * change of sign arrive together from the inspector and two writes would
		 * leave the document renamed but unsigned in between.
		 *
		 * **A reference is rewritten, never dropped.** A node is named by the
		 * property it occupies, so a rename moves the name every `sub` list, every
		 * wire end and every binding spells. Dropping them instead — which is what
		 * `links_drop` does for a delete — would silently cut the wires of a node
		 * that is still there; the two operations are opposites and must not share
		 * a path. Anything of the shape `<= name`, `<=> name` or `= name prop` at
		 * any depth is such a reference.
		 *
		 * The declaration is retyped IN PLACE, among the kids of the base, and only
		 * there: an override of the same name under a part is a port of that part
		 * and none of our business. In place also keeps the property where it was —
		 * dropping it and inserting it back moved it to the end of the class, which
		 * reorders the canvas for a rename that should not move anything.
		 *
		 * A name already taken is refused rather than merged: two properties of one
		 * name is a document nothing can address afterwards.
		 */
		@ $mol_action
		prop_rename( name: string, next: string ) {

			const to = [ ... next.matchAll( $mol_view_tree2_prop_signature ) ][ 0 ]?.groups?.name

			if( !to ) return this.$.$mol_fail(
				new Error( `Bad property signature ${ JSON.stringify( next ) }` )
			)

			if( to !== name && this.prop_names().includes( to ) ) return this.$.$mol_fail(
				new Error( `Property ${ JSON.stringify( to ) } is already declared in ${ this.name() }` )
			)

			const self = this.tree()
			const base = self.kids[ 0 ]
			if( !base ) return

			const refs = ( tree: $mol_tree2 ): $mol_tree2 => {

				const kids = tree.kids.map( refs )
				const head = kids[ 0 ]

				if(
					head?.type === name
					&& ( tree.type === '<=' || tree.type === '<=>' || tree.type === '=' )
				) return tree.clone([ head.struct( to, head.kids ), ... kids.slice( 1 ) ])

				return tree.clone( kids )
			}

			const props = base.kids.map( prop => {
				const meta = [ ... prop.type.matchAll( $mol_view_tree2_prop_signature ) ][ 0 ]?.groups
				return meta?.name === name ? prop.struct( next, prop.kids ) : prop
			} )

			this.tree( self.clone([ base.clone( props.map( refs ) ) ]) )

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
		 * Deviation from studio, which has no free parts: the write goes through the
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
		 * The node end has to be declared already, as a free part or as a sub-view.
		 * `=` declares nothing, that is exactly why it has no collision with `upper`,
		 * so a wire to an undeclared node compiles green and throws `is not a
		 * function` at run time. Refusing here is the only place it can be caught.
		 *
		 * The far end, `wire.prop`, is NOT checked: whether the node's class has such
		 * a port is known only to the component library, and this module knows
		 * nothing of libraries, deliberately. The inspector draws wires from the port
		 * list, so the question does not arise there either.
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

		/**
		 * Wires declared by the class: every property whose value is the `=`
		 * operator. `bidi` is read off the left end alone, because the emitter never
		 * writes the two signs apart; a hand written wire with one sign is reported
		 * as it is and left for the compiler to complain about.
		 */
		@ $mol_mem
		wires(): readonly $bog_vmap_lang_wire[] {

			const wires = [] as $bog_vmap_lang_wire[]

			for( const prop of this.props_tree().kids ) {

				const op = prop.kids[ 0 ]
				if( op?.type !== '=' ) continue

				const node = op.kids[ 0 ]
				const far = node?.kids[ 0 ]
				if( !node || !far ) continue

				const meta = this.$.$mol_view_tree2_prop_parts( prop )

				wires.push({
					name: meta.name,
					node: node.type,
					prop: this.$.$mol_view_tree2_prop_parts( far ).name,
					bidi: Boolean( meta.next ),
				})

			}

			return wires
		}

		/**
		 * Properties whose value is a class name, with the overrides written under
		 * it. That is where a consumer of a wire lives: a part declaration with a
		 * port bound to the name of the wire.
		 */
		part_names() {
			return this.props_tree().kids
				.filter( prop => {
					const val = prop.kids[ 0 ]
					return val && $mol_view_tree2_class_match( val )
				} )
				.map( prop => this.$.$mol_view_tree2_prop_parts( prop ).name )
		}

		/**
		 * Wires together with who reads them. A wire nobody reads is not a link,
		 * and a reference to a name that is not a wire is a plain binding of the
		 * part and none of this module's business.
		 */
		@ $mol_mem
		links(): readonly $bog_vmap_lang_link[] {

			const wires = new Map( this.wires().map( wire => [ wire.name, wire ] as const ) )
			const links = [] as $bog_vmap_lang_link[]

			// Off `props_tree()` and not through `prop_tree()`: the latter is the
			// write path of `link_target`, and a cell read through a written cell
			// freezes at what was written.
			for( const decl of this.props_tree().kids ) {

				const klass = decl.kids[ 0 ]
				if( !klass || !$mol_view_tree2_class_match( klass ) ) continue

				const to = this.$.$mol_view_tree2_prop_parts( decl ).name

				for( const over of klass.kids ) {

					const op = over.kids[ 0 ]
					if( op?.type !== '<=' && op?.type !== '<=>' ) continue

					const ref = op.kids[ 0 ]
					if( !ref || ref.kids.length ) continue

					const wire = wires.get( this.$.$mol_view_tree2_prop_parts( ref ).name )
					if( !wire ) continue

					links.push({
						from: wire.node,
						from_prop: wire.prop,
						to,
						to_prop: this.$.$mol_view_tree2_prop_parts( over ).name,
						name: wire.name,
						bidi: Boolean( wire.bidi ) && op.type === '<=>',
					})

				}

			}

			return links
		}

		/** Whether `to` is already fed, directly or through others, by `from`. */
		link_reaches( from: string, to: string ) {

			const seen = new Set< string >()
			const queue = [ from ]

			while( queue.length ) {
				const at = queue.shift()!
				if( at === to ) return true
				if( seen.has( at ) ) continue
				seen.add( at )
				for( const link of this.links() ) if( link.from === at ) queue.push( link.to )
			}

			return false
		}

		/**
		 * An existing wire to the same end is reused, an unrelated property of the
		 * same name is stepped around with a suffix.
		 */
		link_name( from: string, prop: string, bidi: boolean ) {

			const base = `${ from.toLowerCase() }_${ prop }`
			const taken = new Set( this.prop_names() )

			for( let i = 1; ; ++i ) {

				const name = i === 1 ? base : `${ base }_${ i }`

				const wire = this.wires().find( wire => wire.name === name )
				if( wire ) {
					if( wire.node === from && wire.prop === prop && wire.bidi === bidi ) return name
					continue
				}

				if( !taken.has( name ) ) return name

			}

		}

		/**
		 * Two lines and no more. The wire `name = From prop` goes through `wire_add`
		 * with every guard it has, and the consumer is a bare reference in the
		 * declaration of the target part, `to_prop <= name`, or `to_prop? <=> name?`
		 * for a two way wire. The reference is built by the bare reference emitter,
		 * so it can carry nothing under the name and never turns into the middle
		 * form of `<=`.
		 *
		 * Refused, with nothing written: a part wired to itself, an undeclared end,
		 * and a target the source already depends on, because a loop of wires is a
		 * loop of fibers and the scene would hang on the first read.
		 */
		@ $mol_action
		link_add( link: {
			readonly from: string
			readonly from_prop: string
			readonly to: string
			readonly to_prop: string
			readonly bidi?: boolean
		} ) {

			const bidi = Boolean( link.bidi )

			if( link.from === link.to ) this.$.$mol_fail(
				new Error( `Part ${ JSON.stringify( link.to ) } cannot be wired to itself` )
			)

			const parts = new Set( this.part_names() )
			for( const end of [ link.from, link.to ] ) if( !parts.has( end ) ) this.$.$mol_fail(
				new Error( `Part ${ JSON.stringify( end ) } is not declared in ${ this.name() }` )
			)

			if( this.link_reaches( link.to, link.from ) ) this.$.$mol_fail(
				new Error( `Wire ${ link.from } → ${ link.to } closes a loop: ${ link.to } already feeds ${ link.from }` )
			)

			const to_prop = this.$.$bog_vmap_lang_token( link.to_prop, 'Target port' )
			const name = this.link_name( link.from, link.from_prop, bidi )

			this.wire_add({ name, node: link.from, prop: link.from_prop, bidi })

			const ref = bidi
				? $mol_tree2.struct( '<=>', [ $mol_tree2.struct( name + '?' ) ] )
				: this.$.$bog_vmap_lang_ref_tree( name )

			this.link_target( link.to, to_prop, $mol_tree2.struct( to_prop + ( bidi ? '?' : '' ), [ ref ] ) )

			return name
		}

		/**
		 * One override of one part, which is what `over_set` is; a wire has no
		 * special way of writing its end and must not grow one, or the two would
		 * drift apart on the first fix to either.
		 */
		link_target( to: string, to_prop: string, next: $mol_tree2 | null ) {
			this.over_set( to, to_prop, next )
		}

		/**
		 * Unplugs a port: the reference goes from the target, and the wire goes from
		 * the class when nobody else reads it. Both lines, or the first alone when
		 * the second is still in use.
		 */
		@ $mol_action
		link_drop( to: string, to_prop: string ) {

			const link = this.links().find( link => link.to === to && link.to_prop === to_prop )
			if( !link ) return

			this.link_target( to, to_prop, null )

			const used = this.links().some( other => other.name === link.name )
			if( !used ) this.prop_drop( link.name )

		}

		/**
		 * Unplugs every wire with an end on a part: the ones it feeds and the ones
		 * it reads. What a delete of that part has to do before it takes the part
		 * out, or the document keeps a wire to a node that is no longer declared —
		 * which compiles into a call of a property nobody declares.
		 *
		 * Through `link_drop`, so a wire read by somebody else keeps its line
		 * exactly as it does when a port is unplugged by hand; a wire from this part
		 * that nobody reads has no consumer to unplug and goes in the second pass.
		 * Both ends of every OTHER wire are left alone.
		 */
		@ $mol_action
		links_drop( node: string ) {

			for( const link of [ ... this.links() ] ) {
				if( link.from !== node && link.to !== node ) continue
				this.link_drop( link.to, link.to_prop )
			}

			for( const wire of [ ... this.wires() ] ) {
				if( wire.node !== node ) continue
				this.prop_drop( wire.name )
			}

		}

		/**
		 * Not through `prop_tree()`: that one is a keyed cell the writes below go
		 * through, and a read taken from a written cell freezes at what was written.
		 * `props_tree()` is a plain derivation of the source and stays live.
		 */
		prop_decl( name: string ) {
			const sign = this.prop_fullname( name )
			return sign ? this.props_tree().select( sign ).kids[ 0 ] ?? null : null
		}

		/**
		 * The empty owner is the class, a named one is a part. Both are one shape
		 * because `upper` has already flattened them: the class carries `sub` as a
		 * property, a part carries it as an override under its class name, and under
		 * either sits the same list of bare references.
		 */
		sub_list( owner = '' ) {

			const prop = owner ? this.over_tree( owner, 'sub' ) : this.prop_decl( 'sub' )

			const list = prop?.kids[ 0 ] ?? null

			return list?.type[ 0 ] === '/' ? list : null
		}

		/**
		 * `null` when the node declares no `sub` and so is not a container.
		 *
		 * A node WITH a `sub` is an artboard: children of it are laid out by tree,
		 * by ordinary flex, while everything else lies free by coordinates. That is
		 * the whole difference between the two, and it is a difference in the text
		 * rather than a mark on the side, see section 8.
		 *
		 * Content that is not a bare reference — a literal string in `sub` — takes
		 * its place in the list as an empty name, so that an index here is an index
		 * there.
		 */
		sub_names( owner = '' ): readonly string[] | null {
			const list = this.sub_list( owner )
			return list && list.kids.map( ref => ref.kids[ 0 ]?.type ?? '' )
		}

		/** Whose `sub` references this name: a part, `''` for the class, `null` for nobody. */
		sub_holder( name: string ) {

			for( const owner of [ '', ... this.part_names() ] ) {
				if( this.sub_names( owner )?.includes( name ) ) return owner
			}

			return null
		}

		/** Whether `name` is `owner` itself or lies somewhere under it. */
		sub_within( owner: string, name: string ) {

			const seen = new Set< string >()
			const queue = [ owner ]

			while( queue.length ) {

				const at = queue.shift()!
				if( at === name ) return true
				if( seen.has( at ) ) continue
				seen.add( at )

				for( const kid of this.sub_names( at ) ?? [] ) if( kid ) queue.push( kid )
			}

			return false
		}

		/**
		 * An override already there is replaced where it stands, never dropped and
		 * appended: the order of the lines under a part is text the user reads, and
		 * a `sub` that jumped to the bottom on every insertion would rewrite the
		 * declaration around an edit that changed one child.
		 */
		sub_write( owner: string, list: $mol_tree2 ) {

			const sub = list.struct( 'sub', [ list ] )

			if( owner ) return this.over_set( owner, 'sub', sub )

			this.tree( this.tree().insert( sub, null, this.prop_fullname( 'sub' ) || 'sub' ) )
		}

		/** Makes a node a container by giving it an empty `sub`, if it has none. */
		@ $mol_action
		sub_open( owner: string ) {
			if( this.sub_list( owner ) ) return
			this.sub_write( owner, this.tree().struct( '/' ) )
		}

		/**
		 * Only under a PART: a property whose value is a class name. Under anything
		 * else the children are not overrides at all — under `sub` they are bare
		 * `<=` references — and reading them as property signatures fails on the
		 * first one, which is how every property of the document gets asked whether
		 * it is an artboard.
		 */
		over_tree( owner: string, prop: string ) {

			const klass = this.prop_decl( owner )?.kids[ 0 ]
			if( !klass || !$mol_view_tree2_class_match( klass ) ) return null

			return klass.kids.find(
				over => this.$.$mol_view_tree2_prop_parts( over ).name === prop
			) ?? null
		}

		/**
		 * In place, because the order of the lines under a part is text the user
		 * reads: an override that jumped to the bottom every time its value changed
		 * would rewrite the declaration around an edit that changed one line.
		 */
		over_set( owner: string, prop: string, next: $mol_tree2 | null ) {

			const decl = this.prop_decl( owner )
			const klass = decl?.kids[ 0 ]
			if( !decl || !klass || !$mol_view_tree2_class_match( klass ) ) return

			const named = ( over: $mol_tree2 ) => this.$.$mol_view_tree2_prop_parts( over ).name === prop

			const kids = klass.kids.some( named )
				? klass.kids.flatMap( over => named( over ) ? next ? [ next ] : [] : [ over ] )
				: next ? [ ... klass.kids, next ] : klass.kids

			this.prop_tree( owner, decl.clone([ klass.clone( kids ) ]) )

		}

		/**
		 * A cycle in `sub` is not a badly drawn document, it is a class whose
		 * `dom_tree()` never returns: the scene would hang on the first render, and
		 * the document that hangs it is the one that got saved.
		 */
		sub_check( name: string, owner: string ) {

			if( !owner ) return

			if( name === owner ) this.$.$mol_fail(
				new Error( `Node ${ JSON.stringify( name ) } cannot be put inside itself` )
			)

			if( this.sub_within( name, owner ) ) this.$.$mol_fail(
				new Error( `Node ${ JSON.stringify( name ) } cannot be put inside ${ JSON.stringify( owner ) }, which it already holds` )
			)

		}

		/**
		 * The position is where the insertion line was drawn, so it is clamped
		 * rather than checked: a drop at the end of a list the document has since
		 * shortened is an ordinary race of a gesture against a document, and landing
		 * at the end is the answer to it.
		 */
		@ $mol_action
		sub_insert( name: string, index: number, owner = '' ) {

			const ref = this.$.$bog_vmap_lang_ref_tree( name )

			this.sub_check( name, owner )

			const list = this.sub_list( owner ) ?? ref.struct( '/' )

			const kids = [ ... list.kids ]
			kids.splice( Math.max( 0, Math.min( index, kids.length ) ), 0, ref )

			this.sub_write( owner, list.clone( kids ) )

		}

		/**
		 * Taken out first and put back after, so reparenting and reordering are one
		 * operation with one shape. Within one parent the index is corrected for the
		 * hole the node itself leaves, because the position the user aimed at was
		 * read off a list that still had it.
		 *
		 * The refusal is checked BEFORE the node is taken out, not left to the
		 * insertion: a move that fails halfway is a document with the node gone from
		 * the page and nothing in its place, written and saved.
		 */
		@ $mol_action
		sub_move( name: string, index: number, owner = '' ) {

			this.sub_check( name, owner )

			const from = this.sub_holder( name )

			if( from === owner ) {
				const at = this.sub_names( owner )!.indexOf( name )
				if( at >= 0 && at < index ) index -= 1
			}

			if( from !== null ) this.sub_drop( name )

			this.sub_insert( name, index, owner )

		}

		@ $mol_action
		sub_add( name: string ) {
			this.sub_insert( name, Infinity )
		}

		/**
		 * The empty list is kept rather than the whole property dropped: `sub /` with
		 * nothing under it is the shape an empty document starts from, so deleting
		 * the last node returns the source to exactly that, instead of to a class
		 * with no `sub` at all.
		 *
		 * Only the reference goes. Dropping the declaration as well is two facts, so
		 * it is two calls — the same split as `part_add` plus `sub_add` on the way
		 * in. A node taken out of `sub` but still declared is a free part that draws
		 * nothing and keeps its ports, which is a legitimate state, not a leftover.
		 *
		 * The reference is looked for wherever it is, the class and every part of it
		 * alike. A node inside an artboard is referenced by that artboard and not by
		 * the class, and deleting it has to reach there too — otherwise the document
		 * keeps drawing a node nothing declares any more.
		 */
		@ $mol_action
		sub_drop( name: string ) {

			const owner = this.sub_holder( name )
			if( owner === null ) return

			const list = this.sub_list( owner )!

			this.sub_write( owner, list.clone(
				list.kids.filter( ref => ref.kids[ 0 ]?.type !== name )
			) )

		}

	}

	/**
	 * One property of a node, with its signature. `name`, `tree` and `node` are
	 * handed in by the owner through `make`.
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
		 * A rename goes to the node, because it is not a fact about this property
		 * alone: everything that spells the old name has to be rewritten in the same
		 * write. A change of sign is local and is written here.
		 *
		 * Deviation from studio: this handle is NOT patched to follow the rename.
		 * Studio overwrites the `name` method of the live property object, which
		 * leaves an object addressing one name and reading another past the graph;
		 * here the handle simply stops addressing anything, and the caller asks the
		 * node for the property under its new name — a keyed cell, so that is one
		 * read and no state.
		 *
		 * **Plain method, and so are the three below.** Every accessor here only
		 * delegates into `tree()`, which is a cell already, and an accessor of that
		 * shape under a memoizing decorator freezes at the value written THROUGH it:
		 * after a rename the handle goes on reporting the new name although it
		 * addresses a property no longer under it, which is the very
		 * object-past-the-graph the patching above was dropped for. There is a test.
		 */
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

				const made = { ... meta, ... next }
				const sign = `${ made.name }${ made.key || '' }${ made.next || '' }`

				if( made.name === meta.name ) this.tree( tree.struct( sign, tree.kids ) )
				else this.node().prop_rename( meta.name, sign )

				meta = made

			}

			return meta
		}

		title( next?: string ) {
			return this.meta( next === undefined ? undefined : { name: next } ).name
		}

		key( next?: boolean ) {
			return Boolean(
				this.meta( next === undefined ? undefined : { key: next ? '*' : '' } ).key
			)
		}

		next( next?: boolean ) {
			return Boolean(
				this.meta( next === undefined ? undefined : { next: next ? '?' : '' } ).next
			)
		}

	}

}
