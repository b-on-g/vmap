namespace $.$$ {

	/**
	 * The shelf of ready made things, with the palette of classes under it.
	 *
	 * Holds the drag for both levels: an item and a class differ only in how their
	 * source is made, and by the time the pointer is carrying something the canvas
	 * has to see one kind of thing. Where the drag ends is a canvas question and is
	 * answered by whoever owns the canvas.
	 *
	 * @see ../../ARCHITECTURE.md section 5
	 */
	export class $bog_vmap_app_shelf extends $.$bog_vmap_app_shelf {

		/**
		 * Shelf first, then the switch of the second level, then the level itself
		 * while it is open.
		 *
		 * Folded away it is not rendered at all, and that is the point of the
		 * branch: the palette fetches the class tree of the pack the moment it is
		 * drawn, and a panel nobody opened should not pay for it.
		 */
		override body() {
			return [
				this.Title(),
				this.Stack(),
				this.Level(),
				... this.classes_showed() ? [ this.Palette() ] : [],
			] as readonly $mol_view[]
		}

		/**
		 * What scrolls: the shelf, the address and the objects of the application.
		 *
		 * The heading and the switch of the second level stay put, because they are
		 * how a person gets back out of a long list; the second level scrolls inside
		 * itself and must not be nested in this one, or its own list would render
		 * all four hundred rows into an unbounded height.
		 */
		stack_content() {
			return [
				this.Items(),
				this.Source(),
				this.Apps(),
			] as readonly $mol_view[]
		}

		/** The field, the button, and under them whatever was refused. */
		source_content() {
			return [
				this.Links(),
				... this.rejected_note() ? [ this.Note() ] : [],
				this.Import(),
				... this.import_note() ? [ this.Import_note() ] : [],
			] as readonly $mol_view[]
		}

		/**
		 * Files picked in the dialog. Answers empty: what came of them is in the
		 * library and in the note, and the panel keeps no list of files.
		 *
		 * The work goes to a fiber of its own, because all of it is asynchronous:
		 * reading a file is a promise, and making the library land mines proof of
		 * work.
		 */
		override files( next?: readonly File[] ) {

			if( next?.length ) $mol_wire_async( this ).intake( next )

			return [] as readonly File[]
		}

		/**
		 * Reads the files and puts what they declare into the library of the user.
		 *
		 * **From a fiber only.** Every read goes through `$mol_wire_sync`, so the
		 * fiber suspends on each file and picks up where it left off; a retry
		 * replays the reads from its own cache and writes the same classes again,
		 * which lands on the same components because a class already in the library
		 * is replaced rather than added.
		 *
		 * The link of the library is appended to the field afterwards and not
		 * before: the field is what the scene loads, and there is nothing to load
		 * until something is written.
		 *
		 * Files are taken by their shape — a name and a text — rather than by the
		 * type `File`, so a test hands in two strings instead of forging a browser
		 * object with a cast.
		 */
		intake( files: readonly { readonly name: string, text(): Promise< string > }[] ) {

			const brought = files.map( file => ({
				name: file.name,
				text: $mol_wire_sync( file ).text(),
			}) )

			const taken = this.$.$bog_vmap_app_shelf_intake( brought )

			this.import_note( this.$.$bog_vmap_app_shelf_intake_note( taken ) )

			if( !taken.classes.length ) return

			let link = ''
			for( const one of taken.classes ) link = this.Store().import_class( one.tree, '', one.css )

			this.link_attach( link )

		}

		/** Adds a land link to the field, unless the field already names it. */
		link_attach( link: string ) {

			if( !link ) return

			const links = this.links()
			if( links.split( /[,\s]+/ ).includes( link ) ) return

			this.links( links ? `${ links }, ${ link }` : link )

		}

		/**
		 * The field, parsed. The editor parses the same string for its own needs,
		 * and that is fine: the parse is pure and costs nothing next to a cell
		 * shared across two modules.
		 */
		@ $mol_mem
		links_parsed() {
			return this.$.$bog_vmap_lib_links_parse( this.links() )
		}

		/** Refused links with their reasons, one per line; empty hides the strip. */
		rejected_note() {
			return this.$.$bog_vmap_lib_links_note( this.links_parsed() )
		}

		/**
		 * Classes of the connected application, as items.
		 *
		 * Everything the library holds except mol itself: a pack carries the whole
		 * framework in its bundle, and the framework is what the second level is
		 * for. What is left is what the application's author wrote, plus the
		 * components of any land attached, which are somebody's own just the same.
		 *
		 * Suspends while the pack is loading and throws when the pack is dead. Both
		 * are meant to reach the view that reads it, and the view that reads it is
		 * `Apps` alone.
		 */
		@ $mol_mem
		app_state(): { readonly list: readonly string[], readonly error: string } {

			try {
				return {
					list: this.class_list().filter( name => !name.startsWith( '$mol_' ) ),
					error: '',
				}
			} catch( error: unknown ) {

				// A suspension is not an answer: the pack is still on its way and
				// the panel has to keep waiting, not report a dead address.
				if( $mol_promise_like( error ) ) return $mol_fail_hidden( error )

				return {
					list: [],
					error: this.$.$bog_vmap_lib_pack_note( this.pack_tree_link(), error ),
				}
			}

		}

		/**
		 * The address that was actually fetched, for the complaint to name.
		 *
		 * Asked of the palette's library rather than built here: the rule that
		 * grows `web.view.tree` onto a pack address lives there, and a second copy
		 * of it would word the complaint about a file we never asked for.
		 */
		pack_tree_link() {
			return this.Palette().Lib().tree_link()
		}

		app_list() {
			return this.app_state().list
		}

		app_rows() {
			return this.app_list().map( name => this.Item_row( name ) )
		}

		/** Why there are no objects, when the reason is a dead address. */
		app_error() {
			return this.app_state().error
		}

		/** The caption, then either the objects or the reason there are none. */
		apps_content() {
			return [
				this.Apps_head(),
				... this.app_error() ? [ this.Apps_note() ] : [ this.App_list() ],
			] as readonly $mol_view[]
		}

		apps_title() {
			if( this.app_error() ) return 'Приложение не отвечает'
			return this.app_list().length ? 'Объекты приложения' : 'Приложение не подключено'
		}

		/** Everything the shelf offers, in the order it offers it. */
		items(): readonly $bog_vmap_app_shelf_item[] {
			return this.$.$bog_vmap_app_shelf_presets()
		}

		/**
		 * An item by id, including one that is not on the shelf at all.
		 *
		 * A class dragged out of the second level has its class name for an id and
		 * becomes an item on the spot, so the canvas is handed the same thing
		 * whichever level the gesture started on.
		 */
		item( id: string ): $bog_vmap_app_shelf_item | null {

			if( !id ) return null

			// The shelf answers first: an item of its own says what it is in the
			// words the shelf chose, even when its id happens to be a class name.
			const own = this.items().find( item => item.id === id )
			if( own ) return own

			if( id[ 0 ] !== '$' ) return null

			return {
				id,
				title: this.$.$bog_vmap_app_shelf_short( id ),
				hint: id,
				source: this.$.$bog_vmap_app_shelf_single( id ),
			}

		}

		item_rows() {
			return this.items().map( item => this.Item_row( item.id ) )
		}

		item_title( id: string ) {
			return this.item( id )?.title ?? id
		}

		item_hint( id: string ) {
			return this.item( id )?.hint ?? ''
		}

		/** The piece the pointer is carrying, or nothing while it carries nothing. */
		drag_source() {
			return this.item( this.dragged() )?.source ?? ''
		}

		/** What the ghost at the pointer says. */
		drag_title() {
			return this.item( this.dragged() )?.title ?? ''
		}

		/**
		 * A press on a row starts carrying it.
		 *
		 * The pointer position is taken here and moved by the owner of the canvas:
		 * the shelf knows when a drag begins and nothing about where it ends.
		 */
		@ $mol_action
		item_drag( id: string, event?: PointerEvent | null ) {

			if( !event ) return

			this.drag_x( event.clientX )
			this.drag_y( event.clientY )
			this.dragged( id )

		}

		/** A click without a drag asks for the item in the middle of the canvas. */
		@ $mol_action
		item_click( id: string, event?: Event | null ) {
			this.place( id )
		}

	}

}
