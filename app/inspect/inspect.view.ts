namespace $.$$ {

	/** Signature parts of a token, with the blank studio's callers all repeat. */
	function sign_of( token: string ) {
		return [ ... token.matchAll( $mol_view_tree2_prop_signature ) ][ 0 ]?.groups
			?? { name: token, key: '', next: '' }
	}

	/**
	 * The row list is the ports pane of the palette, over a class of the document
	 * instead of a class of the library, and editable. Both read the same two maps
	 * out of the component library, because both answer the same question: what can
	 * this class do, and which part of that is its own.
	 *
	 * @see ../../ARCHITECTURE.md sections 1 and 5
	 */
	export class $bog_vmap_app_inspect extends $.$bog_vmap_app_inspect {

		/**
		 * The class of the document goes to the library so that the inheritance
		 * chain resolves through it; without it the library would know nothing about
		 * the class being inspected and `props_map` would return nothing.
		 *
		 * Its siblings go in beside it, so that a node typed with another class of
		 * the same document resolves its ports out of the same index and needs no
		 * branch of its own. The inspected class is put first and filtered out of
		 * the peers: the index keeps the LAST declaration of a name, so a stale copy
		 * of this very class arriving among the peers would shadow the live one
		 * being edited.
		 */
		override classes() {
			const own = this.Node().tree()
			return [ own, ... this.peers().filter( tree => tree.type !== own.type ) ]
		}

		/**
		 * Writing renames through the local model, which is all the stand can do and
		 * all it needs. The editor binds this to a rename of its own, which also
		 * carries the pick, the placement and every reference in the document — a
		 * rename is not a fact about one class, and the inspector is handed exactly
		 * one.
		 */
		class_title( next?: string ) {
			return this.Node().name( next )
		}

		/**
		 * A draft, because the commit is on Enter and on blur: between them the
		 * field holds a name the document does not have. Keyed by the current name
		 * so that picking another node, or a rename that lands, starts a fresh draft
		 * — there is no state to reset and none to go stale.
		 */
		@ $mol_mem_key
		title_draft( name: string, next?: string ) {
			return next ?? name
		}

		title_value( next?: string ) {
			return this.title_draft( this.class_title(), next )
		}

		@ $mol_action
		title_submit( event?: Event ) {

			const draft = this.title_value()
			if( !draft || draft === this.class_title() ) return

			this.class_title( draft )
		}

		/**
		 * A list, and never a splice into `super.sub()` by index: an index is a fact
		 * about the order somebody else wrote, so a child added to the tree moves
		 * the refusal to a place nobody chose, silently. The refusal goes under the
		 * head and only when there is one — a strip that is always there but usually
		 * empty is a strip nobody reads.
		 */
		override body() {

			if( !this.class_ready() ) return [ this.Empty() ] as readonly $mol_view[]

			return [
				this.Head(),
				... this.title_note() ? [ this.Note() ] : [],
				this.Flex(),
				this.Body(),
			] as readonly $mol_view[]
		}

		/**
		 * EVERY cell of this panel derives from one class, so a source with none in
		 * it does not fail in one place — it fails in twenty at once, and the panel
		 * answers with a wall of red strips that grows the page. That happens when a
		 * pick outlives the document it was made in.
		 *
		 * Whoever owns the pick should not hand such a source over, and the editor
		 * no longer does; this is the panel refusing to fall apart when somebody
		 * else does. A failure to parse means «no class», which is what it means
		 * here; a suspension is re-thrown, or a document still arriving would be
		 * read as an empty one.
		 */
		class_ready() {
			try {
				return Boolean( this.Node().tree() )
			} catch( error: unknown ) {
				if( $mol_promise_like( error ) ) return $mol_fail_hidden( error )
				return false
			}
		}

		base_title() {
			return this.Node().base()
		}

		@ $mol_mem
		ports() {
			return this.Lib().props_map( this.class_title() )
		}

		/**
		 * Asked about the BASE chain rather than about the class being inspected,
		 * and that is the whole point: this map does not move when the document
		 * declares something. Ask `props_owner` about the document class instead and
		 * every first keystroke on an inherited port makes the port its own, changes
		 * its owner, moves its row up the list — and a row that moves while it is
		 * being typed into is re-inserted into the DOM, which in Chrome blurs the
		 * field, so exactly one character per attempt reaches the source.
		 *
		 * So a port keeps its place for the life of the document, and overriding one
		 * changes only how the row is drawn.
		 */
		@ $mol_mem
		owners() {
			return this.Lib().props_owner( this.base_title() )
		}

		/**
		 * Ports the document invented go first. The palette shows base ports first,
		 * and is right to: it answers «what can I add». An inspector answers «what
		 * does this node set», and the two dozen ports of a bare view are not the
		 * answer to that.
		 *
		 * The split is by where a port COMES FROM, not by who sets it, so that it
		 * cannot move under a cursor — see `owners()`. A port of the base that the
		 * document overrides therefore stays down among the base ports, and says so
		 * with its badge; that it is set here is said by the tools it grows.
		 *
		 * Both halves come out of `ports()` and keep its order, which needs only to
		 * be cut in two, never sorted: `props_map` walks the chain farthest ancestor
		 * first, and a port the document redeclares keeps the position of its
		 * earliest declaration.
		 */
		@ $mol_mem
		port_list() {

			const base = this.owners()
			const names = [ ... this.ports().keys() ]

			return [
				... names.filter( name => !base.has( name ) ),
				... names.filter( name => base.has( name ) ),
			]
		}

		rows() {
			return this.port_list().map( name => this.Row( name ) )
		}

		total() {
			const all = this.port_list().length
			const own = this.Node().prop_names().length
			return `${ all } портов, своих ${ own }`
		}

		/**
		 * The document is asked when the library has nothing, which happens while
		 * the pack is still loading and on a property whose class the library does
		 * not carry. Without the fallback the row of a property the user is looking
		 * at would have no declaration to edit at exactly those two moments.
		 */
		port_node( name: string ) {
			return this.ports().get( name ) ?? this.Node().prop_tree( name ) ?? null
		}

		row_sign( name: string ) {
			return this.port_node( name )?.type ?? name
		}

		/** Empty on a port the document invented. */
		row_owner( name: string ) {
			return this.owners().get( name ) ?? ''
		}

		/**
		 * The document does not declare this port, so what the row shows is the
		 * inherited default and the first edit will declare an override.
		 *
		 * Not the same question as `row_owner`: a port can come from the base AND be
		 * set here, which is the ordinary case of overriding a default and the case
		 * both of them get wrong when they are one flag.
		 */
		row_inherited( name: string ) {
			return !this.Node().prop_names().includes( name )
		}

		/** What a binding may point at. */
		binds() {
			return this.port_list()
		}

		/**
		 * Nodes a wire may start from. A node is a property declared with a class,
		 * free part and sub view alike, which is one list and not two because
		 * `upper` has already made both flat properties of the class.
		 *
		 * Resolving the far end of a wire is the same question the row list answers
		 * about the inspected class, asked about another class, so it is the same
		 * `props_map` over the same index — and the index already holds both the
		 * pack and the classes of the document, so a node typed with a library class
		 * and one typed with the document's own class need no branch.
		 *
		 * `ports` empty means the class is not in the index at all: a class known to
		 * the index always yields at least the ports of its chain. The wire says so
		 * and falls back to a free text field, because a document may legitimately
		 * name a class the loaded pack does not carry.
		 */
		@ $mol_mem
		nodes() {

			const node = this.Node()
			const lib = this.Lib()

			const res = {} as Record< string, { klass: string, ports: readonly string[] } >

			for( const name of node.prop_names() ) {

				const val = node.prop_tree( name )?.kids[ 0 ] ?? null
				if( this.$.$bog_vmap_app_inspect_value_kind_of( val ) !== 'object' ) continue

				const klass = val!.type

				res[ name ] = {
					klass,
					ports: [ ... lib.props_map( klass ).keys() ],
				}

			}

			return res
		}

		/**
		 * The one place an edit enters the document.
		 *
		 * An inherited port has no line of its own yet, so the first edit declares
		 * one. It is declared with the FULL signature of the inherited declaration,
		 * `prop_add( decl.type )` rather than `prop_add( name )`: adding it by bare
		 * name would drop the `*` and the `?`, turning a keyed two way port into a
		 * plain one at the moment somebody typed into it.
		 *
		 * Not memoized on purpose. A cell here would be a cell that this very write
		 * freezes — a write to a memoized cell freezes its dependencies — so the row
		 * would go on showing what was typed after the document moved underneath it.
		 * The derivation is a map lookup over `ports()`, which is a cell already.
		 */
		row_value( name: string, next?: $mol_tree2 ) {

			const decl = this.port_node( name )!

			if( next === undefined ) {

				// A declaration with no kids has no value to edit; it stands for
				// itself and reaches the raw editor, which shows it and leaves it
				// alone.
				const val = decl.kids[ 0 ] ?? decl

				// An inherited DICTIONARY is offered as `* ^`, never as a copy of the
				// entries it inherits. A dictionary redeclared without `^` does not
				// extend the base one, it replaces it, so a document over a button
				// that grew one `attr` key would lose the disabled state, the role
				// and the tooltip at once, in silence. A document over a bare view
				// would lose them too: its attribute dictionary is written in TS and
				// puts real attributes there, whatever the stub says.
				//
				// The alternative, letting the editor copy the inherited entries and
				// write them all out, keeps the behaviour and loses the inheritance:
				// the base could never change them again. `^` says the one true
				// thing — everything of the base, plus what is written below.
				if( this.row_inherited( name ) && val.type === '*' ) {
					return val.clone([ val.struct( '^' ) ])
				}

				return val

			}

			const node = this.Node()

			if( this.row_inherited( name ) ) node.prop_add( decl.type )

			const own = node.prop_tree( name )!
			node.prop_tree( name, own.clone([ next ]) )

			return next
		}

		row_keyed( name: string, next?: boolean ) {

			if( next === undefined ) return Boolean( sign_of( this.row_sign( name ) ).key )

			return this.Node().property( name ).key( next )
		}

		/**
		 * On a wire the `?` is two signs: `?` on the left gives the setter its
		 * `next`, `?` on the right passes it on, and they are independent. Either
		 * one alone is a trap that builds green — `w = Field value?` throws
		 * `ReferenceError: next` on any read, `w? = Field hint` loses every write in
		 * silence. So a wire is rewritten whole, through `wire_add`, whose type has
		 * one flag for both ends and no way to spell either half.
		 *
		 * @see ../../ARCHITECTURE.md section 1, «Капканы с зелёной сборкой»
		 */
		row_changeable( name: string, next?: boolean ) {

			const node = this.Node()

			if( next === undefined ) return Boolean( sign_of( this.row_sign( name ) ).next )

			const value = this.port_node( name )?.kids[ 0 ] ?? null

			if( this.$.$bog_vmap_app_inspect_value_kind_of( value ) === 'wire' ) {

				const origin = value!.kids[ 0 ]

				node.wire_add({
					name,
					node: origin?.type ?? '',
					prop: sign_of( origin?.kids[ 0 ]?.type ?? '' ).name,
					bidi: next,
				})

				return next
			}

			return node.property( name ).next( next )
		}

		row_drop( name: string ) {
			this.Node().prop_drop( name )
		}

		/**
		 * Off `prop_decl`, the derivation of the text, and not through `prop_tree`,
		 * which is the write path below: a read taken from a written cell freezes at
		 * what was written, and the panel would go on showing the value it set after
		 * the document moved underneath it.
		 */
		style_dict() {

			const dict = this.Node().prop_decl( 'style' )?.kids[ 0 ] ?? null

			return dict?.type === '*' ? dict : null
		}

		/**
		 * Empty means the key is not written, and writing empty takes it out again.
		 *
		 * A dictionary the document does not declare yet is started with `^` under
		 * it. A redeclared dictionary REPLACES the one of the base rather than
		 * extending it, so a node over a styled component that grew one `gap` would
		 * lose every style the base sets, in silence; `^` says the one true thing —
		 * everything of the base, plus what is written below.
		 *
		 * Not memoized, for the reason spelled out at `row_value`: this is a write
		 * path, and the read is a lookup over a tree that is a cell already.
		 */
		flex_value( key: string, next?: string ) {

			const node = this.Node()
			const dict = this.style_dict()

			if( next === undefined ) {
				return this.$.$bog_vmap_lang_dict_get( dict, key )?.value ?? ''
			}

			const tree = node.tree()
			const base = dict ?? tree.struct( '*', [ tree.struct( '^' ) ] )

			const written = this.$.$bog_vmap_lang_dict_set(
				base,
				key,
				next ? tree.data( next ) : null,
			)

			if( ! node.prop_names().includes( 'style' ) ) node.prop_add( 'style' )

			node.prop_tree( 'style', node.prop_tree( 'style' )!.clone([ written ]) )

			return next
		}

	}

	/**
	 * Written already normalized — hoisted properties first, `sub` left holding
	 * bare references — because that is the shape the editor holds a document in
	 * and the only shape a round trip is byte for byte on. A nested source here
	 * would be reformatted on the first edit and the stand would look like it lost
	 * the file.
	 *
	 * Class names follow the path of this module, so that the dependency graph,
	 * which mam builds by a regexp over sources and string literals included,
	 * resolves them onto this very folder.
	 *
	 * @see ../../ARCHITECTURE.md section 1, «Канонический вид документа»
	 */
	const demo_source = [
		'$bog_vmap_app_inspect_demo_doc $mol_view',
		'	Price $mol_view title <= calc_result',
		'	Hero $mol_view sub / <= Price',
		// A library class: its ports come out of the pack.
		'	Calc $mol_number',
		// A class of THIS document, declared below. Its ports come out of the
		// document, through the same index and the same call as the pack's.
		'	Card $bog_vmap_app_inspect_demo_doc_card',
		// A class no pack carries and the document does not declare, to keep the
		// honest empty state on the stand rather than only in a comment.
		'	Ghost $bog_vmap_app_inspect_demo_doc_ghost',
		'	calc_result = Card price',
		'	label \\Всего',
		'	count 24',
		'	dense false',
		'	style * padding \\4px',
		'	sub / <= Hero',
		'$bog_vmap_app_inspect_demo_doc_card $mol_view',
		'	caption \\Карточка',
		'	price 0',
		'	sub / <= caption',
		'',
	].join( '\n' )

	export class $bog_vmap_app_inspect_demo extends $.$bog_vmap_app_inspect_demo {

		@ $mol_mem
		override source( next?: string ) {
			return next ?? demo_source
		}

		override names() {
			return this.Doc().names()
		}

		override trees() {
			return this.Doc().trees()
		}

		/** Defaults to the first, which is the root by the convention of the fixture. */
		@ $mol_mem
		override klass( next?: string ) {
			return next ?? this.names()[ 0 ] ?? ''
		}

		/**
		 * The inspector writes one class, the document splices it back, and the
		 * classes around it are untouched.
		 */
		override class_source( next?: string ) {
			return this.Doc().class_source( this.klass(), next )
		}

	}

}
