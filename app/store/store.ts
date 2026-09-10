namespace $ {

	/** Canvas places by the property name they occupy on the root class. */
	export type $bog_vmap_app_store_spots = {
		readonly [ name: string ]: { readonly x: number, readonly y: number }
	}

	/**
	 * Persistence of the editor: the documents of a user in Giper Baza.
	 *
	 * The CRUD lives here so the schema can stay pure, and the views ask this
	 * object instead of touching pawns.
	 *
	 * **Every accessor delegating into an atom is a plain method**, never a cell:
	 * a cell of that shape freezes at the value written through it and stops
	 * seeing remote edits. Reactivity is not lost by it, the atom is a cell already.
	 *
	 * Masters are not named here: a module works against whatever node the
	 * application chose.
	 *
	 * @see ../../ARCHITECTURE.md section 9
	 */
	export class $bog_vmap_app_store extends $mol_object {

		/**
		 * Anchor of the documents in the home land of the user.
		 *
		 * The root pawn the profile lives on, read through our dictionary, so the
		 * list sits beside whatever else the home land carries. Plain method: a
		 * Giper Baza object held by a cell is destructed on a graph rebuild and
		 * drags the yard into a circular subscription.
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
		 * In the fragment, never the query: the query of this page belongs to the
		 * pack address of the scene frame.
		 */
		doc_arg( next?: string | null ) {
			return this.$.$mol_state_arg.value( 'doc', next )
		}

		/**
		 * The document the editor is on: the addressed one, else the last made,
		 * else none while `boot` makes the first.
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
		 * A link in the address opens anybody's public document, and a write into
		 * one made by somebody else fails deep inside the atom. Asked before every
		 * write, so the refusal is a state of the editor rather than an exception
		 * in whichever handler wrote first.
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
		 * Public read is the point and not a default left alone — the address of a
		 * document IS its land link, and a link opens for somebody else only if the
		 * land does. It also leaves the land unencrypted.
		 *
		 * Answering `null` instead means «in the home land, no land of its own»,
		 * which costs no proof of work: that is what the tests hand in, never the
		 * editor.
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
		 * **Reach this from a fiber only.** Grabbing the land mines proof of work,
		 * and the task doing it is cached per fiber; outside one, every promise
		 * thrown on the way restarts the caller with a fresh proof of work, for
		 * ever. Plain method and not an action for the same reason: an action opens
		 * a fiber per call, which is that fresh task per retry.
		 *
		 * The root is recorded rather than derived from the order, so that
		 * reordering the classes later does not move which one is the page.
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
		 * The check at the top is what makes the retries safe: a document that
		 * arrived from another device while the proof of work was being mined must
		 * not be pushed aside by ours.
		 *
		 * It guards against that device and not against our own half made document,
		 * and cannot confuse the two: a restarted fiber replays its reads from its
		 * own cache, so the list here reads as it read at the start — empty. That
		 * is what carries a pouring interrupted halfway through to the end.
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
		 * A cell that reads NOTHING and answers with the fiber it made. Reading
		 * nothing is the point: an invalidation arriving while a cell computes is
		 * dropped on the spot, and the document landing is exactly such an
		 * invalidation, so a cell with no dependencies has nothing to lose that way.
		 * Reading it again while the proof of work is still mining gives back the
		 * same object, which is what keeps one fiber one fiber.
		 *
		 * The fiber is wrapped rather than returned as it is: a cell answering with
		 * a promise is a cell that never finished, and every reader of it suspends
		 * for ever.
		 *
		 * **The wrapper has no destructor, so this cell holds the handle and not
		 * the life.** The draft is poured after the document is already in the list,
		 * so there is a window where a cell nobody reads gets collected; owning the
		 * fiber would end it inside that window and lose the typed text silently.
		 * Nothing leaks by it — a one-shot fiber destructs itself on completion.
		 */
		@ $mol_mem
		doc_first_task() {
			return { task: $mol_wire_async( this ).doc_first() }
		}

		/**
		 * Makes sure there is a document, from the start of the session.
		 *
		 * Suspends while the home land loads, so «there are none» is decided on the
		 * loaded list and not on an empty cache, then answers at once so that
		 * nothing waits on the proof of work.
		 *
		 * A plain method and not a cell: a cell here answered `making` for good,
		 * because the document lands while it is still computing and the
		 * invalidation that causes is dropped rather than remembered.
		 */
		boot(): 'ready' | 'making' {

			const doc = this.doc_current()

			if( doc ) {
				this.doc_keep( doc )
				return 'ready'
			}

			this.doc_first_task()

			return 'making'
		}

		/**
		 * Asks that the document on screen be kept on disk, whatever the quota says.
		 *
		 * **Keeping a land locally is not a flag but a SHARDING RULE.** The base
		 * answers `persisted()` by comparing the tail of the reader's key with the
		 * tail of the land link, cropped by how full the storage is: at level one
		 * through six a land is kept with a chance of one in two to the power of the
		 * level, and when the browser cannot tell the quota at all the level is
		 * infinite and nothing is kept. What hides this is that a WRITE sets the
		 * flag — the base does it on every broadcast, and a write freezes the
		 * dependencies of the cell, so the rule never runs again for that land. So
		 * the rule only ever bites a land nobody wrote to in this session, which is
		 * exactly a document opened by a link and read.
		 *
		 * Measured 10.09.2026 on the node stand of this module: somebody else's
		 * document, delivered the way the network delivers it and read without a
		 * single edit, left NOTHING on disk under an unknown quota — nine units with
		 * a quota, zero without — and the next session opened an empty editor.
		 *
		 * The request is the same one a write makes, and it is honest rather than a
		 * trick: the sharding rule exists so that lands nobody cares about do not
		 * fill the disk, and the document a person has open is the definition of one
		 * they care about. It covers the addressed document and the last one alike,
		 * because on a second device the user's own document arrives from the master
		 * the same way and is just as unwritten.
		 *
		 * Called from `boot`, which the editor runs out of `auto`: a request to
		 * another object is an effect and belongs where the other effects of the
		 * session start. `giper/baza` is not ours to change, so this is a mitigation
		 * in our own code and not a fix of the rule.
		 */
		doc_keep( doc: $bog_vmap_app_doc ) {
			doc.land().persisted( true )
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
		 * Resolved by hand rather than through the remote list: that one goes out
		 * through the static glob and waits on a master. The nodes were made in
		 * this very land, so reading them here is correct and not merely cheaper.
		 */
		nodes( doc: $bog_vmap_app_doc ) {

			const links = doc.Nodes()?.items()?.filter( $mol_guard_defined ) ?? []
			const land = doc.land()

			return links.map(
				link => land.Pawn( $bog_vmap_app_doc_node ).Head( link.head() )
			)
		}

		/**
		 * Text of a document: its classes, one per node, as one source.
		 *
		 * Classes are matched to nodes BY NAME, which is what makes an edit of one
		 * class one atom on the wire — and what makes a rename arrive as a new node,
		 * so whatever is stored per class name has to be carried by whoever renames.
		 *
		 * Parsed plainly and not normalized: this is transport, and the model above
		 * is the one that decides what canonical looks like. Round trip is byte for
		 * byte on text already in that shape.
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
		 * Name of the class the document opens with, or empty. Writing a class name
		 * makes that class the one it opens with.
		 *
		 * Read as a raw link, never through the typed getter: that one resolves
		 * through the static glob, and the node is in this very land anyway.
		 *
		 * The write is what a rename of the root needs, because a renamed class
		 * arrives as a node of its own. A name the document does not carry is
		 * ignored: a pointer at a node outside the list is the state this exists to
		 * prevent.
		 */
		doc_root( doc: $bog_vmap_app_doc, next?: string ) {

			if( next !== undefined ) {
				const node = this.node( doc, next )
				if( node ) doc.Root( null )!.val( node.link() )
				return next
			}

			const link = doc.Root()?.val()
			if( !link ) return ''

			const node = doc.land().Pawn( $bog_vmap_app_doc_node ).Head( link.head() )
			return $bog_vmap_app_store_class_name( node.source() )
		}

		/**
		 * Canvas places of a document, as one dictionary in both directions.
		 *
		 * Written whole, so a place gone from the dictionary is cut from the stored
		 * one and a deleted part does not come back at its old coordinates. Read
		 * back in name order: the stored order is the order of the units, which
		 * nobody chose, and a reader comparing deep would see a change where the
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
		 * Text of the current document, or the draft while the first one is being
		 * made.
		 *
		 * On somebody else's document a write is refused quietly — the text stays
		 * what it was and the stage says why — because the atom would otherwise
		 * throw from inside whatever handler wrote first.
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
		 * Library of the current document, stored as the string it is typed as.
		 *
		 * Not parsed here on purpose: what the string means is known to the panel
		 * that offers the components, not to the store that keeps it.
		 */
		pack( next?: string ) {

			const doc = this.doc_current()
			if( !doc ) return this.draft_pack( next )

			if( next !== undefined && !doc.can_change() ) return doc.pack()

			return doc.pack( next )
		}

	}

	/**
	 * Name of the class a source declares, or empty when it declares none.
	 *
	 * Asked of the text every time: a stored copy would be a second source of
	 * truth for a fact the text already carries.
	 */
	export function $bog_vmap_app_store_class_name( source: string ) {
		return /^(\S+)/.exec( source.trimStart() )?.[ 1 ] ?? ''
	}

}
