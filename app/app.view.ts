namespace $.$$ {

	/**
	 * Editor shell: toolbar, component palette, error strip and the infinite canvas.
	 *
	 * The document is a live `view.tree` class now, not a string constant: dropping
	 * a component off the palette declares a free part on it and references that
	 * part from `sub`. Both edits go through `$bog_vmap_lang_node`, so the text the
	 * scene compiles is the same text an export would write out.
	 *
	 * @see ../ARCHITECTURE.md sections 1 and 5
	 */
	export class $bog_vmap_app extends $.$bog_vmap_app {

		/**
		 * The sandbox page with the donor pack in its query. A new pack is a new
		 * address, so the browser reloads the frame and one pack per frame holds.
		 * @see ../ARCHITECTURE.md section 5
		 */
		override scene_uri() {
			return this.scene_page() + '?' + new URLSearchParams({ pack: this.Lib().script_link() })
		}

		/** A fresh frame in place of the stuck one; the pane owns the frame. */
		override scene_restart() {
			this.pane().scene_restart()
		}

		stalled() {
			return this.Pane().stalled()
		}

		override stall_note() {
			return 'Сцена не отвечает. Скорее всего её остановил код документа: он исполняется'
				+ ' в песочнице и делит с ней поток. Редактор и документ целы.'
		}

		/**
		 * Name of the root class, as a constant rather than as `node().name()`.
		 *
		 * Parsing here would give the host a second way to die on a malformed
		 * document: `doc_root` is read while pushing to the scene, and a throw there
		 * takes down the toolbar as well. Broken text belongs in the scene's compile
		 * error channel, which already reports it. Renaming the root is stage 2.6.
		 */
		override doc_root() {
			return '$bog_vmap_app_page'
		}

		/** Source of an empty page. Everything else arrives from the palette. */
		doc_source_initial() {
			return `${ this.doc_root() } $mol_view\n\tsub /\n`
		}

		/**
		 * Persistence, one for the editor. Made with our `$`, so the store sees the
		 * same context as the editor: the glob, the auth, the address a test hands in.
		 */
		@ $mol_mem
		override store() {
			return this.$.$bog_vmap_app_store.make({ $: this.$ })
		}

		/**
		 * The document text: the atoms of the current document, or the draft of the
		 * store before there is one. `node()` writes here through its delegate, so the
		 * tree and the string the bridge pushes are the same path. A plain method, not
		 * `@ $mol_mem`: a cell in front of a Giper Baza atom freezes after a write.
		 * Empty text is the empty page, the scene needs a root class to compile.
		 */
		doc_source( next?: string ) {

			const store = this.store()
			if( next !== undefined ) return store.source( next )

			return store.source() || this.doc_source_initial()
		}

		/**
		 * The document as a model over its AST.
		 *
		 * `source` is handed in as a delegate instead of being written into after
		 * construction: writing another `@ $mol_mem` from the body of this one is an
		 * invalidation loop, and the node has no other way to be seeded.
		 */
		@ $mol_mem
		node() {
			return this.$.$bog_vmap_lang_node.make({
				$: this.$,
				source: ( next?: string )=> this.doc_source( next ),
			})
		}

		override doc_src() {
			return this.doc_source()
		}

		/**
		 * Where each part sits on the canvas, in world coordinates, keyed by the
		 * property name it occupies on the root class.
		 *
		 * SCAFFOLDING, NOT PART OF THE DOCUMENT. It leaves the host on `spots_set`,
		 * a bridge message of its own, and the scene hangs it as a style element of
		 * its own. So the document text and the document CSS never carry a
		 * coordinate, and the export cannot see the desk layout by construction.
		 * Section 8 says layout inside an artboard is a plain $mol flex tree and only
		 * free parts lie by coordinates; artboards are stage 6, and until they exist
		 * a dropped component has nowhere else to be.
		 *
		 * Stored with the document, in `Spots` of the schema, through the store.
		 * A plain method for the reason given at `doc_source`.
		 */
		override spots( next?: { readonly [ name: string ]: { readonly x: number, readonly y: number } } ) {
			return this.store().spots( next )
		}

		/**
		 * The palette field, stored with the document as the string it is typed as.
		 *
		 * The store keeps it and knows nothing of what it means; the parsing below
		 * is untouched and reads this. Empty in the store is the default of the
		 * field, so a document that never had a palette opens on the standard one.
		 */
		override links( next?: string ) {

			const store = this.store()
			if( next !== undefined ) return store.pack( next ) || super.links()

			return store.pack() || super.links()
		}

		/**
		 * The store in a word for the status line, or empty when there is nothing
		 * to say: the first document being made, or somebody else's document open
		 * by its link, where edits do not stick.
		 */
		store_note() {
			switch( this.store().stage() ) {
				case 'making': return 'заводим сцену…'
				case 'readonly': return 'чужая сцена: только просмотр, правки не сохраняются'
				default: return ''
			}
		}

		/**
		 * Starts the store from `auto()`, so the first document is made in the
		 * background. A suspension is the home land still loading: swallowed here,
		 * because a suspension in `auto()` blanks the whole editor; the subscription
		 * is recorded before the throw, so this runs again once the land is in.
		 */
		store_boot() {
			try {
				return this.store().boot()
			} catch( error ) {
				if( $mol_promise_like( error ) ) return 'loading'
				return $mol_fail_hidden( error )
			}
		}

		/**
		 * The node picked on the canvas, by the property name it occupies on the root
		 * class, and `null` when nothing is picked.
		 *
		 * THE PUBLIC SHAPE OF SELECTION. Anything that wants to follow what is picked
		 * — the inspector first — reads this cell and nothing else, so a pick from the
		 * canvas and a pick from anywhere later are one fact with one owner.
		 *
		 * A property name and not a box, an index or a view: section 1 makes every
		 * named node a flat property of the root class whatever its depth, so this
		 * name is the handle the AST, the placement and the measured geometry are all
		 * already keyed by. `node().prop_tree( selected() )` is the declaration,
		 * `spots()[ selected() ]` is where it sits.
		 *
		 * The truth is here rather than in the pane so that a reader does not have to
		 * reach through the canvas to learn what is picked; the pane writes it back
		 * through a two way binding.
		 */
		@ $mol_mem
		override selected( next?: string | null ): string | null {
			return next ?? null
		}

		/** Whether anything is picked at all, for the views that only need the flag. */
		selection_showed() {
			return Boolean( this.selected() )
		}

		/** The pick as the publish button takes it: a name, empty for none. */
		override publish_part() {
			return this.selected() ?? ''
		}

		/**
		 * CSS of the document itself: the only styling an export may ever carry.
		 *
		 * Empty until the code editor of stage 4. Styles of a node are kept per node
		 * in the model of `app/doc/`, and that is what the export reads. Nothing
		 * about the canvas belongs here, and there is no longer anywhere to put it:
		 * placement travels on `spots` and is turned into rules by the scene.
		 */
		override doc_css() {
			return ''
		}

		/**
		 * The overlay may be cut open under the picked part, except while something
		 * is carried from the palette: that drag has no pointer capture, and a release
		 * over the hole would land in the frame, with the host never hearing of it.
		 */
		override hole_allowed() {
			return !this.dragged()
		}

		@ $mol_mem
		override body() {
			return [
				this.Head(),
				// Above the error strip: a scene that stopped answering makes every
				// error under it stale, and the action that helps is on this one.
				... this.stalled() ? [ this.Stall() ] : [],
				... this.error() ? [ this.Alarm() ] : [],
				this.Body(),
				... this.dragged() ? [ this.Ghost() ] : [],
			] as readonly $mol_view[]
		}

		override body_main() {
			return [
				... this.palette_showed() ? [ this.Side() ] : [],
				this.Pane(),
				... this.inspect_showed() ? [ this.Aside() ] : [],
			] as readonly $mol_view[]
		}

		/**
		 * The inspector, or the invitation to pick something.
		 *
		 * Swapped rather than emptied: `$bog_vmap_app_inspect` derives everything
		 * from the source of one class, and an empty source has no class in it, so
		 * it would put a parse failure where a hint belongs.
		 */
		aside_content() {
			return ( this.selected() ? [ this.Inspect() ] : [ this.Idle() ] ) as readonly $mol_view[]
		}

		/**
		 * Declaration of the picked part, as text, in both directions.
		 *
		 * This is the whole join between canvas and inspector, and it needs no
		 * translation layer because there is nothing to translate: section 1 makes
		 * every named node a flat property of the root class, and a property whose
		 * value is a class name is, in `view.tree`, a class declaration —
		 * `Button_minor $mol_button_minor` parses to a class `Button_minor` based on
		 * `$mol_button_minor`. So the inspector reads the same bytes the document
		 * carries, and what it writes goes back into the document as those bytes.
		 *
		 * NOT memoized, and the read deliberately does not go through
		 * `prop_tree()`. That one is a keyed cell, the write below goes through it,
		 * and a write to a cell freezes its dependencies — a read taken from the
		 * same cell would stop following the document after the first edit made
		 * here. Stale in exactly the node being edited, silent, and looking like
		 * success. `props_tree()` is a plain derivation of the text and stays live.
		 */
		node_source( next?: string ): string {

			const name = this.selected()
			if( !name ) return ''

			const node = this.node()
			const sign = node.prop_fullname( name )
			if( !sign ) return ''

			if( next === undefined ) {
				return node.props_tree().select( sign ).kids[ 0 ]?.toString() ?? ''
			}

			// A class per declaration, so the first tree is the whole edit. Anything
			// the inspector could not have produced is dropped rather than merged:
			// the source it hands back is always the class it was given.
			const parsed = this.$.$mol_tree2_from_string(
				next.replace( /\n?$/, '\n' ), 'vmap.view.tree',
			).kids[ 0 ]

			if( parsed ) node.prop_tree( name, parsed )

			return next
		}

		/**
		 * Classes beside the one being inspected: the lands of the field, then the
		 * root of the document.
		 *
		 * The land classes go in here and not through a second library, because the
		 * inspector already resolves a peer through the same index and the same
		 * `props_map` as a pack class — section 5 says the two are one namespace,
		 * and the inspector has held that since before there was a second source.
		 * The root earns its place too: a part whose base is another class of this
		 * document resolves its ports only if that class is in the index.
		 */
		@ $mol_mem
		node_peers(): readonly $mol_tree2[] {
			return [ ... this.lib_classes(), this.node().tree() ]
		}

		/**
		 * The palette field, parsed. The palette parses the same string for its own
		 * status line; the parse is pure and two calls cost less than a shared cell
		 * across two modules would.
		 */
		@ $mol_mem
		links_parsed() {
			return this.$.$bog_vmap_lib_links_parse( this.links() )
		}

		/**
		 * The donor pack for the frame and for every library, with its slash, or
		 * empty when the field names none.
		 *
		 * Derived and never written back into the field: the slash is grown here so
		 * that the address can still be typed character by character. Empty is a
		 * state — a palette of lands alone — and every address downstream is then
		 * empty too, so the frame loads no pack and compiles against its own
		 * `$mol_view`.
		 */
		override pack_link() {
			const pack = this.links_parsed().pack
			return pack ? this.$.$bog_vmap_lib_slashed( pack ) : ''
		}

		/** Land links of the field, in the order typed. */
		override lands() {
			return this.links_parsed().lands
		}

		/** Classes of the lands, for the palette and the inspector. No stub in them. */
		override lib_classes() {
			return this.Lib().land_trees()
		}

		/**
		 * Sources of the lands, for the scene.
		 *
		 * This travels on the bridge while the pack travels in `scene_uri`, and the
		 * split is the rule of section 5: a second pack cannot be unloaded from a
		 * realm, so a pack change reloads the frame; a land is compiled into the
		 * sandbox like the document, so a land change recompiles and keeps the frame,
		 * its camera and its live instances.
		 */
		override libs() {
			return this.Lib().parts()
		}

		override error() {
			return this.Pane().error()
		}

		override status() {
			const note = this.store_note()
			if( note ) return note
			if( this.stalled() ) return 'сцена не отвечает'
			const isolation = this.Pane().isolation()
			if( isolation ) return isolation
			return this.Pane().ready() ? 'сцена на связи' : 'ожидание сцены…'
		}

		override zoom_title() {
			return Math.round( this.Pane().camera_zoom() * 100 ) + '%'
		}

		override zoom_in() {
			this.pane().zoom_by( 1.25 )
		}

		override zoom_out() {
			this.pane().zoom_by( 1 / 1.25 )
		}

		override camera_reset() {
			this.pane().camera_reset()
		}

		/** Camera controls live in $.$$, so the toolbar needs the derived type. */
		pane() {
			return this.Pane() as $.$$.$bog_vmap_app_pane
		}

		/** Palette methods used here live in $.$$ as well. */
		palette() {
			return this.Palette() as $.$$.$bog_vmap_app_palette
		}

		dragged() {
			return this.Palette().dragged()
		}

		ghost_title() {
			return this.dragged()
		}

		ghost_left() {
			return this.Palette().drag_x() + 'px'
		}

		ghost_top() {
			return this.Palette().drag_y() + 'px'
		}

		/**
		 * Pointer moves and releases anywhere in the window, for the whole life of
		 * the editor.
		 *
		 * On the window rather than on the palette row, and without
		 * `setPointerCapture`: capture retargets the later `click` to the captor,
		 * and a synthetic pointer does not register at all, which would make the
		 * whole gesture untestable here. The overlay of the pane eats pointer events
		 * in the host document, so a move across the canvas reaches this listener —
		 * and the hole under the picked part is closed for the whole drag, see
		 * `hole_allowed()`, so a release over the canvas cannot fall into the frame.
		 */
		@ $mol_mem
		drag_listeners() {
			return [
				new this.$.$mol_dom_listener(
					this.$.$mol_dom_context,
					'pointermove',
					$mol_wire_async( this ).drag_move,
				),
				new this.$.$mol_dom_listener(
					this.$.$mol_dom_context,
					'pointerup',
					$mol_wire_async( this ).drag_end,
				),
			]
		}

		drag_move( event?: PointerEvent ) {

			if( !event ) return
			if( !this.dragged() ) return

			this.Palette().drag_x( event.clientX )
			this.Palette().drag_y( event.clientY )

		}

		/**
		 * Release ends the drag whatever it is over, and only a release over the
		 * canvas adds anything. Clearing first means a drop outside cancels cleanly.
		 */
		drag_end( event?: PointerEvent ) {

			if( !event ) return

			const klass = this.dragged()
			if( !klass ) return

			this.Palette().dragged( '' )

			const point = this.canvas_point( event )
			if( !point ) return

			this.part_drop( klass, point[0], point[1] )

		}

		/**
		 * World coordinates of a pointer event, or `null` if it is not over the canvas.
		 *
		 * The rectangle comes from the DOM and not from `view_rect()` on purpose:
		 * `view_rect` is a watched cell, and a handler that subscribes to it would be
		 * re-run by the very layout change its own drop causes — adding the part a
		 * second time.
		 *
		 * The camera is a screen-pixel shift plus an isotropic zoom, and the scene
		 * puts the stage at `transform-origin: 0 0` inside a frame pinned to the top
		 * left of the pane. So the screen point is `world * zoom + shift`, and this
		 * is that solved for world.
		 */
		canvas_point( event: PointerEvent ) {

			const node = this.Pane().dom_node()
			const rect = node.getBoundingClientRect()

			const x = event.clientX - rect.left
			const y = event.clientY - rect.top

			if( x < 0 || y < 0 || x > rect.width || y > rect.height ) return null

			const shift = this.pane().camera_shift()
			const zoom = this.pane().camera_zoom()

			return [ ( x - shift[0] ) / zoom, ( y - shift[1] ) / zoom ] as const
		}

		/**
		 * A free name for a part of the given class: `$mol_button_minor` becomes
		 * `Button_minor`, and a second one of the same class `Button_minor_2`.
		 *
		 * The namespace prefix goes because every class in a pack carries the same
		 * one and it would only make the names longer, not more distinct.
		 */
		part_name( klass: string ) {

			const short = klass.replace( /^\$/, '' ).replace( /^\w+?_/, '' )
			const head = short.slice( 0, 1 ).toUpperCase() + short.slice( 1 )

			const taken = new Set( this.node().prop_names() )
			if( !taken.has( head ) ) return head

			for( let i = 2; ; ++i ) {
				const name = `${ head }_${ i }`
				if( !taken.has( name ) ) return name
			}

		}

		/**
		 * Drops a component onto the canvas: one declaration and one reference.
		 *
		 * `part_add` writes `Button_minor $mol_button_minor` at class level, which
		 * the compiler turns into a lazy memoized property creating no DOM at all —
		 * that is the free part of section 1. `sub_add` appends `<= Button_minor` to
		 * `sub`, and only then does the node get rendered. Two calls because they are
		 * two separate facts: what exists, and what is on the page.
		 */
		@ $mol_action
		part_drop( klass: string, x: number, y: number ) {

			const node = this.node()
			const name = this.part_name( klass )

			node.part_add( name, klass )
			node.sub_add( name )

			this.spots({ ... this.spots(), [ name ]: { x, y } })

		}

		override delete_hint() {
			const name = this.selected()
			return name ? `Удалить ${ name } (Del)` : 'Удалить выделенный узел (Del)'
		}

		/**
		 * Takes the picked node off the canvas: out of `sub`, out of the class, out
		 * of the placement.
		 *
		 * The mirror of `part_drop`, and split the same way, because they are the
		 * same two facts read backwards: `sub_drop` says it is no longer on the page,
		 * `prop_drop` says it no longer exists. Order matters — the reference goes
		 * first, so the document is never, not even between two writes, a class that
		 * points `<=` at a property it does not declare. That state compiles to a
		 * reference to nothing, and the scene would report it as a real failure.
		 *
		 * Both writes go through `lang`, never through the text: an AST edit
		 * serializes the whole class, so the source the scene compiles and the source
		 * an export would write stay the same string.
		 */
		@ $mol_action
		node_delete() {

			const name = this.selected()
			if( !name ) return

			const node = this.node()

			node.sub_drop( name )
			node.prop_drop( name )

			const spots = { ... this.spots() }
			delete spots[ name ]
			this.spots( spots )

			// The pane remembers boxes across culling, so a name missing from a
			// report no longer means the node is gone. This is the one place that
			// knows it is.
			this.pane().sizes_forget( name )

			this.selected( null )

		}

		/**
		 * Del anywhere in the editor, as long as the keystroke is not somebody's text.
		 *
		 * On the window and not on the canvas: the canvas is an iframe, and a focused
		 * iframe swallows every key, so a listener living on the pane would go quiet
		 * exactly when the user has just clicked a node. That the scene keeps its own
		 * keystrokes is the other half of the same fact and is what makes this safe:
		 * typing into a live component focused through the hole in the overlay cannot
		 * reach here at all, so there is no way for a Backspace meant for a text
		 * field to delete a node.
		 *
		 * Fields of the HOST are a real risk though — the palette search is one — so
		 * a keystroke aimed at an editable target is left alone.
		 */
		@ $mol_mem
		hotkeys() {
			return new this.$.$mol_dom_listener(
				this.$.$mol_dom_context,
				'keydown',
				$mol_wire_async( this ).key_press,
			)
		}

		key_press( event?: KeyboardEvent ) {

			if( !event ) return
			if( event.key !== 'Delete' && event.key !== 'Backspace' ) return
			if( event.metaKey || event.ctrlKey || event.altKey ) return

			const target = event.target as HTMLElement | null
			if( target?.isContentEditable ) return
			if( target && /^(INPUT|TEXTAREA|SELECT)$/.test( target.tagName ) ) return

			if( !this.selected() ) return

			event.preventDefault()

			this.node_delete()

		}

		override auto() {
			return [
				... super.auto(),
				this.drag_listeners(),
				this.hotkeys(),
				this.store_boot(),
			]
		}

	}

}
