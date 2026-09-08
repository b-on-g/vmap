namespace $ {

	/** Canvas places by the property name they occupy on the root class. */
	export type $bog_vmap_app_store_spots = {
		readonly [ name: string ]: { readonly x: number, readonly y: number }
	}

	/**
	 * Persistence of the editor: the documents of a user in Giper Baza.
	 *
	 * This is where the CRUD over `app/doc/` lives. The schema stays pure, so
	 * every operation on it — which land a document is grabbed into, how a text is
	 * cut into nodes and glued back, what «the current document» means — is a
	 * method here, and the views ask this object instead of touching pawns.
	 *
	 * **Every accessor delegating into an atom is a plain method.** An accessor of
	 * that shape under `@ $mol_mem` freezes at the value written through it and
	 * never sees a remote edit again, see the note at `bog_vmap_app_doc_node.source`.
	 * Nothing is lost: `val()` inside the pawn is a wire cell already, so a view
	 * reading through here stays reactive.
	 *
	 * Masters are not named here and `masters()` is not overridden: a module works
	 * against whatever node the application chose.
	 *
	 * @see ../../ARCHITECTURE.md section 9
	 */
	export class $bog_vmap_app_store extends $mol_object {

		/**
		 * Anchor of the documents in the home land of the user.
		 *
		 * The same root pawn the profile lives on, viewed through our dictionary:
		 * fields are keyed by name inside it, so `Docs` sits beside whatever else the
		 * home land carries. Plain method — a Giper Baza object under `@ $mol_mem`
		 * gets destructed on a graph rebuild and drags the yard into a circular
		 * subscription.
		 */
		home() {
			return this.$.$giper_baza_glob.home().land().Data( $bog_vmap_app_doc_home )
		}

		/** Links of every document of the user, in the order they were made. */
		doc_links(): readonly $giper_baza_link[] {
			return this.home().Docs()?.items()?.filter( $mol_guard_defined ) ?? []
		}

		/**
		 * A document by its link.
		 *
		 * Through the glob and not through the home land, because a document is a
		 * land of its own — that is what lets a link to it be shared. Reading any
		 * field of it asks the land to sync on the way (`sand_ordered` does, see
		 * `land.ts`), so nothing has to be done here for a document made elsewhere.
		 */
		doc( link: $giper_baza_link ) {
			return this.$.$giper_baza_glob.Pawn( link, $bog_vmap_app_doc )
		}

		/**
		 * Link of the current document as written in the address, or null.
		 *
		 * The key is `doc`, the value is the link of the document land. In the
		 * fragment, where `$mol_state_arg` lives; the query is taken by the pack
		 * address of the scene frame and is not ours.
		 */
		doc_arg( next?: string | null ) {
			return this.$.$mol_state_arg.value( 'doc', next )
		}

		/**
		 * The document the editor is on.
		 *
		 * An address names one; without an address it is the last one made; with
		 * no documents at all it is null, and the editor works on the draft below
		 * while `boot` makes one in the background.
		 *
		 * A malformed value in the address counts as no address rather than as an
		 * error: a hand edited URL is an ordinary state of a page.
		 */
		doc_current(): $bog_vmap_app_doc | null {

			const arg = this.doc_arg()
			const checked = arg ? $giper_baza_link.check( arg ) : null
			if( checked ) return this.doc( new $giper_baza_link( checked ) )

			const last = this.doc_links().at( -1 )
			return last ? this.doc( last ) : null
		}

		/** Makes the document with this link current, and null goes back to the default. */
		doc_pick( link: $giper_baza_link | null ) {
			this.doc_arg( link?.str ?? null )
		}

		/**
		 * Whether the current document takes our writes.
		 *
		 * A link in the address opens anybody's public document; the land of one
		 * made by somebody else answers our rank as `read`, and a write into it
		 * fails with «Rank too low» deep inside the atom. Asked before every write
		 * so that the failure becomes a state of the editor, not an exception in
		 * the handler that happened to write first.
		 */
		doc_editable() {
			const doc = this.doc_current()
			return doc ? doc.can_change() : true
		}

		/**
		 * What the editor is doing about its document: `ready` to edit, `making`
		 * one in the background, `readonly` on somebody else's document.
		 */
		stage(): 'ready' | 'making' | 'readonly' {
			if( !this.doc_current() ) return 'making'
			if( !this.doc_editable() ) return 'readonly'
			return 'ready'
		}

		/**
		 * Rights of a fresh document land: readable by anybody holding the link.
		 *
		 * Public read is the point, not a default left alone: the address of a
		 * document is its land link, and a link only opens for somebody else if the
		 * land does. A preset with `null` in it also means the land is not encrypted.
		 *
		 * `null` here means «in the home land, no land of its own», which costs no
		 * proof of work. That is what the tests hand in; the editor never does.
		 */
		doc_land_config(): null | $giper_baza_rank_preset {
			return [[ null, this.$.$giper_baza_rank_read ]]
		}

		/** Name for the next document: one more than there are. */
		title_next() {
			return `Сцена ${ this.doc_links().length + 1 }`
		}

		/**
		 * Makes a new document, current from now on.
		 *
		 * **Reach this from a fiber only** — `$mol_wire_async( store ).doc_add( … )`
		 * from a handler, or from inside an event handler, which `$mol_view` already
		 * runs as one. Grabbing the land mines proof of work; the task doing it is
		 * cached per fiber, and outside a fiber every `Promise` thrown on the way
		 * restarts the caller from the top with a fresh proof of work, forever.
		 *
		 * Plain method, not `@ $mol_action`: an action opens a fiber of its own per
		 * call, which is exactly the fresh-task-per-retry this has to avoid.
		 *
		 * `Root` is set to the first class of the text: the page is the class the
		 * document opens with, and the choice has to be recorded, not derived from
		 * the order, so that reordering later does not move it.
		 */
		doc_add( title = '', source = '', spots: $bog_vmap_app_store_spots = {}, pack = '' ) {

			const doc = this.home().Docs( null )!.make( this.doc_land_config() )

			if( title ) doc.title( title )
			if( source ) this.doc_source( doc, source )
			if( pack ) doc.pack( pack )
			if( Object.keys( spots ).length ) this.doc_spots( doc, spots )

			const root = this.nodes( doc )[ 0 ]
			if( root ) doc.Root( null )!.val( root.link() )

			this.doc_pick( doc.link() )

			return doc
		}

		/**
		 * The first document of a user, made from whatever was drafted meanwhile.
		 *
		 * Checked again at the top, and the check is what makes the retries safe:
		 * the fiber restarts this from the beginning on every `Promise` on the way,
		 * and a document that arrived from another device while the proof of work
		 * was being mined must not be pushed aside by ours.
		 *
		 * The check guards against that device and not against our own half made
		 * document, and it cannot confuse the two: a restart replays every read
		 * from the cache of the fiber itself, so the list here reads as it read
		 * when the fiber started — empty. Measured. That is what lets a restart in
		 * the middle of pouring the draft carry the pouring through instead of
		 * walking away from a document with no text in it.
		 */
		doc_first() {

			if( this.doc_current() ) return

			this.doc_add(
				this.title_next(),
				this.draft_source(),
				this.draft_spots(),
				this.draft_pack(),
			)

		}

		/**
		 * The one fiber making the first document, held by a cell of its own.
		 *
		 * A cell that reads nothing and answers with the fiber it made. That is the
		 * shape a `$mol` effect takes — the same one `message_listener` and
		 * `resize_watch` take in `scene/` — and it is what makes one fiber one
		 * fiber: read this again while the proof of work is still being mined and
		 * the same object comes back, so no second document is ever started.
		 *
		 * Reading nothing is the point and not an accident. An invalidation
		 * arriving while a cell computes is dropped on the spot — `absorb` returns
		 * early on a cursor that is still tracking — and the document landing is
		 * exactly such an invalidation. A cell with no dependencies has nothing to
		 * lose that way.
		 *
		 * The fiber is wrapped and not returned as it is: a cell answering with a
		 * promise is a cell that never finished, and every reader of it suspends
		 * for ever.
		 *
		 * **The wrapper deliberately has no `destructor`, so this cell holds the
		 * handle and not the life.** The draft is poured AFTER the document is in
		 * the list, so there is a window in which `boot` already answers `ready`,
		 * the last reader looks away and a cell nobody reads is collected. Owning
		 * the fiber here would end it inside that window, and what would be lost is
		 * the text the user typed, silently. Measured; there is a test. Nothing
		 * leaks by it: a one-shot fiber destructs itself the moment it completes.
		 *
		 * What opens that window is `make()` standing first in `doc_add` and the
		 * pouring standing after it — NOT `doc_pick`, which is last. Without an
		 * address, and there is none on a first run, `doc_current` answers with the
		 * last link of the list, and the link is in the list from `make()` on, with
		 * an empty document behind it.
		 */
		@ $mol_mem
		doc_first_task() {
			return { task: $mol_wire_async( this ).doc_first() }
		}

		/**
		 * Makes sure there is a document, from the start of the session.
		 *
		 * Read from `auto()` of the application. Suspends while the home land loads,
		 * so the decision «there are none» is taken on the loaded list and not on an
		 * empty cache; then asks for the fiber above and answers at once, so that
		 * nothing waits on the proof of work.
		 *
		 * A plain method, deliberately. Under `@ $mol_mem` this answered `making`
		 * for good: with no proof of work to wait on, the document lands while the
		 * cell is still computing, and the invalidation it causes is dropped rather
		 * than remembered. Measured. Read afresh every time there is nothing to go
		 * stale, and the answer follows `doc_current` for free.
		 */
		boot(): 'ready' | 'making' {

			if( this.doc_current() ) return 'ready'

			this.doc_first_task()

			return 'making'
		}

		/**
		 * Text the editor works on before it has a document, and never after: the
		 * background fiber pours it into the first document in one go.
		 */
		@ $mol_mem
		draft_source( next?: string ) {
			return next ?? ''
		}

		@ $mol_mem
		draft_spots( next?: $bog_vmap_app_store_spots ): $bog_vmap_app_store_spots {
			return next ?? {}
		}

		@ $mol_mem
		draft_pack( next?: string ) {
			return next ?? ''
		}

		/**
		 * Nodes of a document, resolved in the document's own land.
		 *
		 * Not `remote_list()`: that resolves through the static glob into a land
		 * instance of its own, which waits on a master. `make( null )` put the nodes
		 * into this very land, so this is correct and not merely convenient.
		 */
		nodes( doc: $bog_vmap_app_doc ) {

			const links = doc.Nodes()?.items()?.filter( $mol_guard_defined ) ?? []
			const land = doc.land()

			return links.map(
				link => land.Pawn( $bog_vmap_app_doc_node ).Head( link.head() )
			)
		}

		/**
		 * Text of a document: its classes in the order of `Nodes`, one `view.tree`.
		 *
		 * One class per node, the whole text per document. Reading glues the node
		 * texts with a newline guaranteed after each; writing cuts the text into
		 * classes with the plain parser — NOT normalized, this is transport and
		 * `lang` is the one that normalizes — and matches them to nodes by class
		 * name, the first token. A name already stored gets its text updated (the
		 * atom skips a write of an equal value), a new name gets a node made in the
		 * same land, a name gone from the text leaves the list. Two classes of one
		 * name are matched in order, so nothing a caller wrote is lost here.
		 *
		 * Byte for byte on a round trip when the text is in canonical `tree2`
		 * formatting, which is what `lang` writes after its first edit; a hand
		 * written file is reformatted on that first edit, as it always was.
		 */
		doc_source( doc: $bog_vmap_app_doc, next?: string ): string {

			const nodes = this.nodes( doc )

			if( next === undefined ) {
				return nodes
					.map( node => node.source() )
					.filter( Boolean )
					.map( text => text.replace( /\n?$/, '\n' ) )
					.join( '' )
			}

			const trees = this.$.$mol_tree2_from_string(
				next.replace( /\n?$/, '\n' ), 'vmap.view.tree',
			).kids

			const spare = new Map< string, $bog_vmap_app_doc_node[] >()
			for( const node of nodes ) {
				const name = $bog_vmap_app_store_class_name( node.source() )
				const same = spare.get( name )
				if( same ) same.push( node )
				else spare.set( name, [ node ] )
			}

			const list = doc.Nodes( null )!
			const links = [] as $giper_baza_link[]

			for( const tree of trees ) {

				const node = spare.get( tree.type )?.shift() ?? list.make( null )

				node.source( tree.toString() )
				links.push( node.link() )

			}

			const prev = list.items().filter( $mol_guard_defined )
			const same = prev.length === links.length
				&& prev.every( ( link, index ) => link.str === links[ index ].str )

			if( !same ) list.items( links )

			return next
		}

		/** Node of a document by the name of the class it declares, or null. */
		node( doc: $bog_vmap_app_doc, name: string ) {
			return this.nodes( doc ).find(
				node => $bog_vmap_app_store_class_name( node.source() ) === name
			) ?? null
		}

		/** Hand written class body of one node, by class name. */
		node_js( doc: $bog_vmap_app_doc, name: string, next?: string ) {
			return this.node( doc, name )?.js( next ) ?? ''
		}

		/** Styles of one node, by class name. */
		node_css( doc: $bog_vmap_app_doc, name: string, next?: string ) {
			return this.node( doc, name )?.css( next ) ?? ''
		}

		/**
		 * Name of the class the document opens with, or empty.
		 *
		 * Read as a raw link, never through `remote()`: the typed getter resolves
		 * through the static glob, and the node is in this very land anyway.
		 */
		doc_root( doc: $bog_vmap_app_doc ) {

			const link = doc.Root()?.val()
			if( !link ) return ''

			const node = doc.land().Pawn( $bog_vmap_app_doc_node ).Head( link.head() )
			return $bog_vmap_app_store_class_name( node.source() )
		}

		/**
		 * Canvas places of a document, as one dictionary in both directions.
		 *
		 * Written whole because that is how the canvas hands it over; a place gone
		 * from the dictionary is cut from the stored one, so a deleted part does not
		 * come back at its old coordinates on reload. Read back with the keys in
		 * name order: the dictionary keeps them in the order of the units, which
		 * nobody chose, and a cell comparing this deep would see a change where the
		 * places are the same.
		 */
		doc_spots( doc: $bog_vmap_app_doc, next?: $bog_vmap_app_store_spots ): $bog_vmap_app_store_spots {

			if( next === undefined ) {

				const dict = doc.Spots()
				const res = {} as { [ name: string ]: { x: number, y: number } }

				const keys = ( dict?.keys() ?? [] )
					.filter( ( key ): key is string => typeof key === 'string' )
					.sort()

				for( const key of keys ) {
					const spot = dict!.key( key )
					if( spot ) res[ key ] = { x: spot.x(), y: spot.y() }
				}

				return res
			}

			const dict = doc.Spots( null )!

			for( const name of Object.keys( next ) ) {
				const spot = dict.key( name, null )!
				spot.x( next[ name ].x )
				spot.y( next[ name ].y )
			}

			for( const key of dict.keys() ) {
				if( typeof key !== 'string' ) continue
				if( !( key in next ) ) dict.has( key, false )
			}

			return next
		}

		/**
		 * Text of the current document.
		 *
		 * With no document yet, the draft: `boot` is making one and will pour the
		 * draft into it. On somebody else's document a write is refused quietly —
		 * the text stays what it was, and `stage` says why — because the atom would
		 * throw «Rank too low» from inside whatever handler wrote first.
		 */
		source( next?: string ): string {

			const doc = this.doc_current()
			if( !doc ) return this.draft_source( next )

			if( next !== undefined && !doc.can_change() ) return this.doc_source( doc )

			return this.doc_source( doc, next )
		}

		/** Canvas places of the current document, the same way as `source`. */
		spots( next?: $bog_vmap_app_store_spots ): $bog_vmap_app_store_spots {

			const doc = this.doc_current()
			if( !doc ) return this.draft_spots( next )

			if( next !== undefined && !doc.can_change() ) return this.doc_spots( doc )

			return this.doc_spots( doc, next )
		}

		/** Human name of the current document. Nothing to name before there is one. */
		title( next?: string ) {

			const doc = this.doc_current()
			if( !doc ) return ''

			if( next !== undefined && !doc.can_change() ) return doc.title()

			return doc.title( next )
		}

		/**
		 * Palette of the current document, stored as the string it is typed as.
		 *
		 * Not parsed here on purpose: today it is one pack address, soon a list of
		 * links separated by commas, and the one who knows what the string means is
		 * the palette, not the store.
		 */
		pack( next?: string ) {

			const doc = this.doc_current()
			if( !doc ) return this.draft_pack( next )

			if( next !== undefined && !doc.can_change() ) return doc.pack()

			return doc.pack( next )
		}

	}

	/**
	 * Name of the class a `view.tree` source declares, or empty when it declares
	 * none. The first token of the text — asked of the text every time, because a
	 * stored copy of it would be the second source of truth for a derivable fact.
	 */
	export function $bog_vmap_app_store_class_name( source: string ) {
		return /^(\S+)/.exec( source.trimStart() )?.[ 1 ] ?? ''
	}

}
