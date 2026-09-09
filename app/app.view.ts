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
		 * Address of the editor page itself, the origin of every derived address.
		 *
		 * A method rather than a read at each use, so a test can put the editor on
		 * either layout without touching the DOM context. Empty only where there is
		 * no location at all, and then nothing is derived.
		 */
		page_uri() {
			return this.$.$mol_dom_context.location?.href ?? ''
		}

		/**
		 * Bundle of the sandbox, a sibling module of this one, derived from our own
		 * address. This is the only page in the project, so nothing else has one and
		 * there is nothing else to derive.
		 *
		 * Absolute, because the markup of the frame is handed to an opaque origin,
		 * which has no base for a relative path to be resolved against. Derived and
		 * not a constant, because a constant is written in one layout: the dev server
		 * keeps a module in `-/` and a deploy does not.
		 * @see ../ARCHITECTURE.md sections 4 and 7
		 */
		override scene_bundle() {
			const page = this.page_uri()
			return page ? this.$.$bog_vmap_lib_sibling( page, 'scene' ) + 'web.js' : super.scene_bundle()
		}

		/**
		 * The donor pack the scene is told to load, as the address of its bundle.
		 *
		 * Travels down the bridge as `pack_set` and keys the frame on the way: a
		 * realm cannot unload a bundle, so a different pack has to be a different
		 * frame, which is what the frame address used to do by being different.
		 * @see ../ARCHITECTURE.md section 5
		 */
		override pack_script() {
			return this.Lib().script_link()
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
		 * Name of the root class: the first class the document text declares.
		 *
		 * Read off the text with the same first-token rule the store matches classes
		 * to nodes by, NOT by parsing. The rule is a regexp over a string and cannot
		 * throw, which is the property that matters here: `doc_root` is read while
		 * pushing to the scene and while drawing the toolbar, and a throw on either
		 * path takes the editor down over text the scene already reports about.
		 *
		 * Derived and no longer a constant, because the folder an export goes to
		 * follows from the class names — section 10 — so a document whose root
		 * cannot be renamed is a document that can only be unpacked inside the pack
		 * of the editor itself.
		 */
		override doc_root() {
			return this.$.$bog_vmap_app_store_class_name( this.doc_source() )
				|| this.doc_root_default()
		}

		/**
		 * Name the root class of a fresh document gets.
		 *
		 * `my` is the namespace the docs of `mol` use for one's own code: it belongs
		 * to nobody and collides with nothing, and the three segments make a module
		 * path — `my/site/page` — that lands in a folder of the author's own instead
		 * of inside the pack of this editor, which is where a document named after
		 * this pack used to be unpacked.
		 *
		 * The dollar is glued on and not written into the literal: mam reads string
		 * literals when it builds the dependency graph and resolves a dollar name
		 * into a package, and there is no root package `my` — the whole module would
		 * stop building over a default value.
		 */
		doc_root_default() {
			return '$' + 'my_site_page'
		}

		/** Source of an empty page. Everything else arrives from the palette. */
		doc_source_initial() {
			return `${ this.doc_root_default() } $mol_view\n\tsub /\n`
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
		 * The root class as a model over its AST: what the canvas edits.
		 *
		 * Taken from the DOCUMENT model and not made over the whole text. A node
		 * models one class — `tree()` reads the first declaration and a write
		 * serializes that one class as the entire source — so a node over a text
		 * with two classes in it dropped the second on the first edit made anywhere.
		 * Measured on the palette drop: two classes in, one class out, no error.
		 * Through the document the neighbours come back out of their own trees.
		 */
		node() {
			return this.doc_model().node( this.doc_root() )
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

			return this.store_links() || super.links()
		}

		/**
		 * The palette of the open document, or nothing while the document is still
		 * on its way.
		 *
		 * THE SANDBOX MUST NOT WAIT FOR THE DOCUMENT. A document opened by a link
		 * lives in a land of its own, and reading any field of it suspends until
		 * that land syncs — which, with no master reachable, is for ever. This value
		 * feeds `pack_link`, `pack_link` feeds the pack the frame is keyed by: a
		 * suspension here therefore left the frame with NO KEY AT ALL, so the scene
		 * never booted, never said `ready`, and the editor sat on «ожидание сцены…»
		 * for ever. Measured on a document link with no master while the pack still
		 * rode the frame address: frame `src` absent, palette suspended, nothing on
		 * the wire. The pack travels the bridge now, and the key is still derived
		 * from it, so the shape of the failure is unchanged.
		 *
		 * So a suspension is answered with the empty string, which the caller reads
		 * as «no palette of its own» and falls back to the standard one. Nothing is
		 * lost: the subscription is recorded before the throw, so this recomputes
		 * the moment the land arrives, and a document that does carry a palette of
		 * its own then replaces the frame exactly as any change of pack does.
		 * The same shape as `store_boot`, and for the same reason.
		 */
		store_links() {
			try {
				return this.store().pack()
			} catch( error ) {
				if( $mol_promise_like( error ) ) return ''
				return $mol_fail_hidden( error )
			}
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
		override picked( next?: readonly string[] ): readonly string[] {
			return next ?? []
		}

		/**
		 * The primary of the picked, which is the last one taken.
		 *
		 * A projection of `picked()` and not a cell of its own: two cells holding
		 * one fact would have to be kept in step by somebody, and the reading path
		 * would stop being the writing path — which is how a `@ $mol_mem` in front of
		 * another one freezes. Writing a name here is picking exactly that one, which
		 * is what every caller outside the canvas means by it.
		 */
		override selected( next?: string | null ): string | null {

			if( next !== undefined ) {
				this.picked( next ? [ next ] : [] )
				return next
			}

			const picked = this.picked()
			return picked.length ? picked[ picked.length - 1 ] : null
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
		 * The document as a model over the classes it declares.
		 *
		 * The level everything editing goes through: `node()` is one class OF this,
		 * so a write lands in the class it was made on and the neighbours come back
		 * out of their own trees. Owning the text, it is also the only thing that can
		 * answer what classes there are and rename one.
		 */
		@ $mol_mem
		doc_model() {
			return this.$.$bog_vmap_lang_doc.make({
				$: this.$,
				source: ( next?: string )=> this.doc_source( next ),
			})
		}

		/**
		 * Handwritten body of one class of the document, in the document or in the
		 * draft before there is one.
		 *
		 * A plain method, like everything in front of a Giper Baza atom: a cell
		 * there freezes at what was written through it.
		 */
		class_js( klass: string, next?: string ): string {

			const store = this.store()
			const doc = store.doc_current()

			if( !doc ) return this.draft_js( klass, next )
			if( next !== undefined && !doc.can_change() ) return store.node_js( doc, klass )

			return store.node_js( doc, klass, next )
		}

		/** Styles of one class, the same way. */
		class_css( klass: string, next?: string ): string {

			const store = this.store()
			const doc = store.doc_current()

			if( !doc ) return this.draft_css( klass, next )
			if( next !== undefined && !doc.can_change() ) return store.node_css( doc, klass )

			return store.node_css( doc, klass, next )
		}

		/** Body of a class while there is no document to keep it in. */
		@ $mol_mem_key
		draft_js( klass: string, next?: string ) {
			return next ?? ''
		}

		/** Styles of a class while there is no document to keep them in. */
		@ $mol_mem_key
		draft_css( klass: string, next?: string ) {
			return next ?? ''
		}

		override root_js( next?: string ) {
			return this.class_js( this.doc_root(), next )
		}

		override root_css( next?: string ) {
			return this.class_css( this.doc_root(), next )
		}

		/**
		 * Handwritten bodies of the document, by class name, as the scene takes them.
		 *
		 * A class with no body of its own is left out rather than sent empty: the
		 * scene wraps a class only when there is something to put in the wrapper.
		 */
		@ $mol_mem
		override doc_js() {

			const bodies = {} as { [ klass: string ]: string }

			for( const name of this.doc_model().names() ) {
				const js = this.class_js( name )
				if( js ) bodies[ name ] = js
			}

			return bodies
		}

		/**
		 * CSS of the document itself: the only styling an export may ever carry.
		 *
		 * The styles of every class, glued in the order the text declares them.
		 * Nothing about the canvas belongs here, and there is nowhere to put it:
		 * placement travels on `spots` and is turned into rules by the scene.
		 */
		@ $mol_mem
		override doc_css() {
			return this.doc_model().names()
				.map( name => this.class_css( name ) )
				.filter( Boolean )
				.join( '\n\n' )
		}

		/**
		 * Classes of the document as the export takes them: declaration, body, rule.
		 *
		 * Read out of the document model rather than out of the scene, so what is
		 * downloaded is the text the editor holds and not what a preview made of it.
		 */
		export_nodes(): readonly $bog_vmap_app_export_node[] {

			const doc = this.doc_model()

			return doc.names().map( name => ({
				source: doc.class_source( name ),
				js: this.class_js( name ),
				css: this.class_css( name ),
			}) )

		}

		/**
		 * The module the document builds into, or the reason it does not.
		 *
		 * One cell for both, because the export answers both at once and a second
		 * call would parse every class a second time to learn what this one already
		 * knows. A refusal is a value here and not a throw: it has to be readable on
		 * the toolbar, and a throw on the path of the toolbar takes the toolbar down.
		 *
		 * A SUSPENSION IS NOT PASSED ON EITHER, and that is the harder half. The
		 * toolbar is drawn from this, and a document opened by a link lives in a land
		 * that suspends every read until it syncs — so rethrowing here suspended the
		 * whole editor, frame and all, and the sandbox never came up. Measured: the
		 * standing test of that invariant went red the moment this cell was wired to
		 * the toolbar. The subscription is recorded before the throw, so nothing is
		 * lost: this recomputes the moment the text arrives. The same shape as
		 * `store_links`, and for the same reason.
		 */
		@ $mol_mem
		export_state(): {
			readonly module: $bog_vmap_app_export_module | null,
			readonly refusal: string,
		} {

			try {

				return {
					module: this.$.$bog_vmap_app_export_build( this.export_nodes(), this.doc_root() ),
					refusal: '',
				}

			} catch( error: unknown ) {
				// Still on its way: nothing to download and nothing to complain about.
				if( this.$.$mol_promise_like( error ) ) return { module: null, refusal: '' }
				return { module: null, refusal: String( ( error as Error )?.message ?? error ) }
			}

		}

		/** Whether the document can be downloaded at all. */
		override export_ready() {
			return Boolean( this.export_state().module )
		}

		/**
		 * The folder the module goes to, in the title of the button itself.
		 *
		 * Section 10: the folder follows from the class names and is not free, and
		 * mam turns a wrong one into `Root package not found` at build time, far from
		 * the editor. Written where it is read without hovering, because it is a
		 * decision the author is making whether they see it or not.
		 */
		override export_title() {
			const module = this.export_state().module
			return module ? `Скачать ${ module.path }` : 'Скачать'
		}

		override export_file() {
			const module = this.export_state().module
			return `${ module?.name ?? 'vmap' }.zip`
		}

		override export_hint() {

			const state = this.export_state()
			if( state.refusal ) return 'Документ не выгружается. Причина под шапкой'

			const module = state.module
			if( !module ) return 'Документ ещё загружается'

			return `${ module.files.length } файлов модуля ${ module.path }.`
				+ ` Распаковать в корень MAM и собрать «npx mam ${ module.path }»`

		}

		/**
		 * The archive itself. A plain method: it is read once, by the click, and a
		 * cell in front of it would keep the whole file alive for nothing.
		 */
		override export_blob() {

			const state = this.export_state()
			if( !state.module ) return this.$.$mol_fail(
				new Error( state.refusal || 'Документ ещё загружается' )
			)

			return new this.$.$mol_blob(
				[ this.$.$bog_vmap_app_export_zip_archive( state.module ) ],
				{ type: 'application/zip' },
			)

		}

		/**
		 * The refusal, line by line, as the export words it. Each line already names
		 * the class, the line, the method and the fix, so nothing is added here.
		 */
		export_notes(): readonly string[] {
			const refusal = this.export_state().refusal
			return refusal ? refusal.split( '\n' ).filter( Boolean ) : []
		}

		override export_rows() {
			return this.export_notes().map( ( _, index )=> this.Export_row( index ) )
		}

		@ $mol_mem_key
		override export_text( index: number ) {
			return this.export_notes()[ index ] ?? ''
		}

		/** The picked node as the code editor takes it: a name, empty for none. */
		code_prop() {
			return this.selected() ?? ''
		}

		/**
		 * Whether the code panel edits a whole class instead of the picked node.
		 *
		 * Held by the editor and not by the panel, because it decides WHICH class the
		 * three texts of the panel are: only the owner of the document knows that a
		 * picked node is declared with a class the document itself authors.
		 */
		@ $mol_mem
		override code_whole( next?: boolean ) {
			return next ?? false
		}

		/**
		 * The class the picked node is declared with, when the document declares that
		 * class itself; the root class otherwise.
		 *
		 * A node whose class is a class of this document is the only way a second
		 * class is reached at all: it is not on the canvas — the canvas draws nodes,
		 * and a class is not a node — so the pick of the node is the pick of it.
		 * A node declared with a library class has no text of its own, and the class
		 * in scope is then the one that declares the node, which is the root.
		 */
		code_class() {

			const name = this.selected()
			if( !name ) return this.doc_root()

			const klass = this.node().prop_decl( name )?.kids[ 0 ]
			if( !klass || !$mol_view_tree2_class_match( klass ) ) return this.doc_root()

			return this.doc_model().names().includes( klass.type ) ? klass.type : this.doc_root()
		}

		/**
		 * The class the three texts of the panel belong to.
		 *
		 * Two answers, and the difference is not cosmetic. Editing the whole class,
		 * the class is the one above — that is how the body and the styles of a
		 * second class are reached, and until this existed they were reachable by
		 * nothing at all, although the scene compiled them.
		 *
		 * Editing ONE NODE, the class is the one that declares the node, always the
		 * root. The methods the node asks for are methods of its owner (`title <=
		 * greeting` wants `greeting()` on the class that spells it), and the rule the
		 * panel offers is addressed to the attribute `$mol` writes on the sub view of
		 * its owner. Scoping the node mode to the node's own class would write both
		 * into a class that never reads them.
		 */
		code_klass() {
			return this.code_whole() ? this.code_class() : this.doc_root()
		}

		/**
		 * `view.tree` of the class in scope, two way: what the panel shows on its
		 * first tab when it edits a whole class.
		 *
		 * The class and not the whole document, which is what this used to be while
		 * the panel called it «the whole class» in the very same breath. The three
		 * texts of the panel now speak about one class, and that class is named in
		 * the heading over them.
		 *
		 * A SECOND CLASS IS ADDED HERE, by writing one under the one on screen: the
		 * document model replaces the slot with everything the text parses to, so two
		 * declarations typed in place of one become two classes of the document.
		 */
		override code_source( next?: string ) {
			return this.doc_model().class_source( this.code_klass(), next )
		}

		/** Handwritten body of the class in scope, two way. */
		override code_js( next?: string ) {
			return this.class_js( this.code_klass(), next )
		}

		/** Styles of the class in scope, two way. */
		override code_css( next?: string ) {
			return this.class_css( this.code_klass(), next )
		}

		/**
		 * Methods of the class the picked node needs written by hand.
		 *
		 * Every name its declaration refers to with `<=` that the class does not
		 * declare itself. A generated property already has a body — the name of the
		 * node most of all, which compiles to the factory of the sub-view — and a
		 * handwritten method of that name would shadow it and take the node off the
		 * canvas. What has no generated body is exactly what a person opens the JS
		 * tab to write: `title <= greeting` wants `greeting()`.
		 */
		@ $mol_mem
		code_hooks(): readonly string[] {

			const name = this.selected()
			if( !name ) return []

			const node = this.node()
			const decl = node.props_tree().select( node.prop_fullname( name ) ).kids[ 0 ]
			if( !decl ) return []

			const declared = new Set( node.prop_names() )
			const found = [] as string[]

			const walk = ( tree: $mol_tree2 )=> {

				if( tree.type === '<=' ) {
					const ref = tree.kids[ 0 ]
					// A reference with kids is a declaration, not a reference: that is
					// the `upper` hack, and it brings its own generated body with it.
					if( ref && !ref.kids.length && !declared.has( ref.type ) ) {
						if( !found.includes( ref.type ) ) found.push( ref.type )
					}
				}

				for( const kid of tree.kids ) walk( kid )
			}

			walk( decl )

			return found
		}

		/** What the scene said about the picked node last, empty when it said nothing. */
		code_error() {
			const name = this.selected()
			return name ? this.pane().node_error( name ) : ''
		}

		/** Method of the picked node, cut out of the body of its class. */
		node_js() {

			const hooks = this.code_hooks()
			if( !hooks.length ) return ''

			try {
				const props = this.$.$bog_vmap_app_code_props_js( this.root_js() )
				return hooks.map( name => props.get( name ) ).filter( Boolean ).join( '\n\n' )
			} catch( error: unknown ) {
				if( this.$.$mol_promise_like( error ) ) return this.$.$mol_fail_hidden( error )
				return ''
			}

		}

		/** Rule of the picked node, cut out of the styles of its class. */
		node_css() {

			const name = this.selected()
			if( !name ) return ''

			try {
				return this.$.$bog_vmap_app_code_props_css( this.root_css(), this.doc_root() )
					.get( name.toLowerCase() ) ?? ''
			} catch( error: unknown ) {
				if( this.$.$mol_promise_like( error ) ) return this.$.$mol_fail_hidden( error )
				return ''
			}

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
				// Beside the dead button and not inside the code panel: that panel is
				// folded by default and speaks about the picked node, while this is
				// about the document and can name a class nobody has open.
				... this.export_notes().length ? [ this.Export_note() ] : [],
				// Beside the field that caused it, on the same strip as the refusal
				// of the export: both are about the document as a whole.
				... this.root_title_note() ? [ this.Root_note() ] : [],
				this.Body(),
				... this.dragged() ? [ this.Ghost() ] : [],
			] as readonly $mol_view[]
		}

		override body_main() {
			return [
				... this.palette_showed() ? [ this.Side() ] : [],
				this.Pane(),
				... this.inspect_showed() ? [ this.Aside() ] : [],
				... this.code_showed() ? [ this.Code() ] : [],
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

		/** Wires of the document, for the pane to draw. */
		override doc_wires() {
			return this.node().links()
		}

		/**
		 * Wirable ports of the class a part is declared with, through the same
		 * library index the inspector uses. Read off `props_tree()`, the derivation
		 * of the text, and not through `prop_tree()`, the write path.
		 */
		@ $mol_mem_key
		override part_ports( name: string ): readonly $bog_vmap_app_wire_port[] {

			const node = this.node()
			const sign = node.prop_fullname( name )
			if( !sign ) return []

			const klass = node.props_tree().select( sign ).kids[ 0 ]?.kids[ 0 ]
			if( !klass || !$mol_view_tree2_class_match( klass ) ) return []

			return this.$.$bog_vmap_app_wire_ports( this.Lib().props_map( klass.type ) )
		}

		/**
		 * Nodes that carry a `sub` of their own, which is what makes a node an
		 * artboard and its children a tree rather than a heap of coordinates.
		 *
		 * Read off the document and nowhere else: there is no mark, no registry and
		 * no side channel saying which node is a page. Section 8 says both artboards
		 * and free parts are properties of the same root class, and the only
		 * difference between them is in the text.
		 */
		@ $mol_mem
		override doc_containers() {
			const node = this.node()
			return node.prop_names().filter( name => node.sub_names( name ) )
		}

		/**
		 * The `flexDirection` a node declares, empty when it declares none.
		 *
		 * The document states which way a container stacks, and the host owns the
		 * document, so this is a reading and not an inference. The pane falls back to
		 * the geometry of the children only where there is no declaration — and it
		 * has to have somewhere to fall back to, because a container with one child
		 * or none shows nothing at all about its direction.
		 */
		@ $mol_mem_key
		override doc_axis( name: string ) {

			const style = this.node().over_tree( name, 'style' )?.kids[ 0 ] ?? null

			return this.$.$bog_vmap_lang_dict_get( style, 'flexDirection' )?.value ?? ''
		}

		/**
		 * A node dropped inside an artboard goes into the tree of its parent, and
		 * loses its coordinate on the way.
		 *
		 * The coordinate goes because it would stop meaning anything: the placement
		 * rules of the scene position the direct children of the root and nothing
		 * else, so a number left here would be a line of the desk layout that moves
		 * nothing and outlives every drag.
		 */
		override tree_move( next?: $bog_vmap_app_pane_tree_move | null ) {

			if( !next ) return null

			this.node().sub_move( next.name, next.index, next.owner )

			const spots = { ... this.spots() }
			delete spots[ next.name ]
			this.spots( spots )

			return next
		}

		/** A wire drawn on the canvas goes into the document as two lines, see `link_add` of the model. */
		override link_add( next?: $bog_vmap_app_pane_link_new | null ) {
			if( next ) this.node().link_add( next )
			return next ?? null
		}

		override link_drop( next?: $bog_vmap_app_pane_link_end | null ) {
			if( next ) this.node().link_drop( next.to, next.to_prop )
			return next ?? null
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
		 * The donor pack for the frame and for every library, with its slash.
		 *
		 * Derived and never written back into the field: the slash is grown here so
		 * that the address can still be typed character by character.
		 *
		 * A field that names no pack means the standard palette, which is the `part`
		 * module of this very pack — a sibling of the editor, so its address comes
		 * off our own. It used to mean no pack at all, and that state is gone on
		 * purpose: a land library inherits from the `$mol_view` of the loaded pack,
		 * so a palette of lands alone was never the useful reading, while an empty
		 * field on a deploy left the user with no components and nothing to type.
		 */
		override pack_link() {

			const pack = this.links_parsed().pack
			if( pack ) return this.$.$bog_vmap_lib_slashed( pack )

			const page = this.page_uri()
			return page ? this.$.$bog_vmap_lib_sibling( page, 'part' ) : ''
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
		 * Names of every class of the library: the pack and the lands on it.
		 *
		 * NOT read here — this is a binding the shelf pulls, and pulling it fetches
		 * the class tree of the pack. Reading it in the editor would put a dead
		 * address in the way of the whole screen instead of in the way of the one
		 * list that shows what the address brought.
		 */
		override lib_class_list() {
			return this.Lib().class_list()
		}

		/**
		 * Sources of the lands, for the scene.
		 *
		 * Both this and the pack travel the same bridge now, and the split is still
		 * the rule of section 5, only held elsewhere: a second pack cannot be
		 * unloaded from a realm, so the pack is part of the key of the frame and a
		 * pack change replaces the element; a land is compiled into the sandbox like
		 * the document, so a land change recompiles and keeps the frame, its camera
		 * and its live instances.
		 */
		override libs() {
			return this.Lib().parts()
		}

		override error() {
			return this.Pane().error()
		}

		/**
		 * The state of the work in a few words: what the store is doing with the
		 * document, and whether the scene is answering.
		 *
		 * Nothing technical belongs here. A confirmed sandbox is the normal state
		 * and the strip used to announce it, which read as a fault and, standing
		 * before the check below, made «сцена на связи» unreachable code. What can
		 * really be wrong with the frame goes to the error strip through
		 * `Pane().error()`.
		 */
		override status() {
			const note = this.store_note()
			if( note ) return note
			if( this.stalled() ) return 'сцена не отвечает'
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

		/** Shelf methods used here live in $.$$ as well. */
		shelf() {
			return this.Shelf() as $.$$.$bog_vmap_app_shelf
		}

		/**
		 * The piece the pointer is carrying, or nothing while it carries nothing.
		 *
		 * One value for both levels of the panel: a ready made item and a class of
		 * the pack differ in how their source is made and in nothing else by the
		 * time they reach the canvas.
		 */
		dragged() {
			return this.shelf().drag_source()
		}

		ghost_title() {
			return this.shelf().drag_title()
		}

		ghost_left() {
			return this.Shelf().drag_x() + 'px'
		}

		ghost_top() {
			return this.Shelf().drag_y() + 'px'
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

			this.Shelf().drag_x( event.clientX )
			this.Shelf().drag_y( event.clientY )

		}

		/**
		 * Release ends the drag whatever it is over, and only a release over the
		 * canvas adds anything. Clearing first means a drop outside cancels cleanly.
		 */
		drag_end( event?: PointerEvent ) {

			if( !event ) return

			const source = this.dragged()
			if( !source ) return

			this.Shelf().dragged( '' )

			const point = this.canvas_point( event )
			if( !point ) return

			this.preset_drop( source, point[0], point[1] )

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
		 * The short form is the shelf's, because the shelf writes the same name into
		 * the preset it makes out of a class, and two rules for one name would drift
		 * apart at the first fix to either.
		 */
		part_name( klass: string ) {
			return this.name_free( this.$.$bog_vmap_app_shelf_short( klass ) )
		}

		/** The given name, or it with a number, whichever the document does not carry. */
		name_free( head: string ) {

			const taken = new Set( this.node().prop_names() )
			if( !taken.has( head ) ) return head

			for( let i = 2; ; ++i ) {
				const name = `${ head }_${ i }`
				if( !taken.has( name ) ) return name
			}

		}

		/**
		 * Lays a piece of the shelf onto the canvas.
		 *
		 * The model writes what exists — the declarations, their overrides and their
		 * wires — and answers with the names it left loose; where those names go is
		 * this method's half of the work, because only the canvas knows whether the
		 * release happened over an artboard or over open desk.
		 *
		 * A declaration at class level compiles into a lazy memoized property that
		 * creates no DOM at all, which is the free part of section 1; a name gets
		 * drawn only once something references it, and that is what the placement
		 * below writes. Two halves because they are two separate facts: what exists,
		 * and what is on the page.
		 */
		@ $mol_action
		preset_drop( source: string, x: number, y: number ) {

			const node = this.node()
			const slot = this.pane().insert_slot([ x, y ])

			const placed = this.$.$bog_vmap_app_shelf_apply(
				node,
				source,
				( name: string )=> this.name_free( name ),
			)

			// Into the tree of the artboard it was dropped into, or onto the canvas
			// by a coordinate. One gesture, two ways of being laid out, told apart
			// by where the release happened and nowhere else. A piece that leaves
			// several loose names stacks them down and to the right, so that two
			// parts of one item are both visible instead of exactly overlapping.
			placed.forEach( ( name, i )=> {

				if( slot ) return node.sub_insert( name, slot.index + i, slot.owner )

				node.sub_add( name )
				this.spots({ ... this.spots(), [ name ]: { x: x + i * 24, y: y + i * 24 } })

			} )

			// Picked by the drop itself, as a fresh artboard is: a part is put on
			// the canvas in order to be set up, and a click to reach the inspector
			// is friction between the two halves of one intention.
			if( placed[ 0 ] ) this.selected( placed[ 0 ] )

		}

		/**
		 * Drops one class of the library onto the canvas.
		 *
		 * The degenerate piece of the shelf: one declaration, one reference and no
		 * wire. Kept as a method of its own because a class is what the second level
		 * of the panel carries and what the scenarios say.
		 */
		@ $mol_action
		part_drop( klass: string, x: number, y: number ) {
			this.preset_drop( this.$.$bog_vmap_app_shelf_single( klass ), x, y )
		}

		/**
		 * An item of the shelf asked for by a click instead of a drag: it goes to
		 * the middle of the canvas, which is the only place a click can mean.
		 */
		override shelf_place( next?: string ) {

			const source = next && this.shelf().item( next )?.source

			if( source ) {
				const spot = this.canvas_center()
				this.preset_drop( source, spot[0], spot[1] )
			}

			return ''
		}

		/** Layout of a fresh artboard: the page of a desktop, stacked downwards. */
		board_style() {
			return {
				width: '1280px',
				minHeight: '720px',
				flexDirection: 'column',
				background: '#ffffff',
			} as { readonly [ key: string ]: string }
		}

		/**
		 * Puts a page on the canvas: a node with a `sub` of its own.
		 *
		 * A plain `$mol_view` and not a class of ours, so an exported document
		 * depends on nothing of this pack; what makes it a page is the width and the
		 * `sub`, both of them ordinary lines of the document. `flexDirection` is
		 * written out because `[mol_view]` is `display: flex` with no direction at
		 * all, that is to say a ROW: a page that did not say so would lay its first
		 * two blocks side by side.
		 */
		@ $mol_action
		board_add() {

			const node = this.node()
			const name = this.name_free( 'Page' )
			const tree = node.tree()

			node.part_add( name, '$mol_view' )

			node.over_set( name, 'style', tree.struct( 'style', [
				tree.struct( '*', Object.entries( this.board_style() ).map(
					( [ key, value ] )=> tree.struct( key, [ tree.data( value ) ] )
				) ),
			] ) )

			node.sub_open( name )
			node.sub_add( name )

			const spot = this.canvas_center()
			this.spots({ ... this.spots(), [ name ]: { x: spot[0], y: spot[1] } })

			this.selected( name )

		}

		/**
		 * The world point the middle of the canvas is looking at.
		 *
		 * Read off the DOM like `canvas_point`, and for the same reason: `view_rect`
		 * is a watched cell, and a handler that subscribed to it would be re-run by
		 * the layout change its own drop causes.
		 */
		canvas_center() {

			const rect = this.Pane().dom_node().getBoundingClientRect()
			const shift = this.pane().camera_shift()
			const zoom = this.pane().camera_zoom()

			return [
				( rect.width / 2 - shift[0] ) / zoom,
				( rect.height / 2 - shift[1] ) / zoom,
			] as const
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

			const picked = this.picked()
			if( !picked.length ) return

			const node = this.node()

			// An artboard goes with everything laid out inside it. Left behind, its
			// children would stay declared and referenced by nothing — a legitimate
			// state for a free part, and a trap for a page: nothing draws them, so
			// nothing can select them, so nothing can ever take them out again.
			const doomed = [ ... picked ]
			for( const dead of doomed ) for( const kid of node.sub_names( dead ) ?? [] ) {
				if( kid && !doomed.includes( kid ) ) doomed.push( kid )
			}

			// Wires first, and all of them before anything is dropped: a wire left
			// behind names a node the document no longer declares, and the scene
			// compiles that into a call of a property nobody has. Whose end it is
			// makes no difference here — the model unplugs both sides and leaves
			// every wire between the survivors alone.
			for( const dead of doomed ) node.links_drop( dead )

			for( const dead of doomed ) {
				node.sub_drop( dead )
				node.prop_drop( dead )
			}

			const spots = { ... this.spots() }
			for( const dead of doomed ) delete spots[ dead ]
			this.spots( spots )

			// The pane remembers boxes across culling, so a name missing from a
			// report no longer means the node is gone. This is the one place that
			// knows it is.
			for( const dead of doomed ) this.pane().sizes_forget( dead )

			this.selected( null )

		}

		/**
		 * Renames a node: the declaration, everything that spells it, and the editor
		 * state keyed by its name.
		 *
		 * The name of a node is the property it occupies on the root class, so it is
		 * also the key of the placement, of the remembered boxes and of the pick.
		 * Renaming the text alone orphans all three: the node moves to a new name and
		 * `selected()` and `spots()` go on pointing at one nothing declares.
		 *
		 * The document goes first BECAUSE it is the write that can refuse — a name
		 * already declared is rejected there — so a refused rename leaves the editor
		 * state exactly as it was rather than pointing at a rename that never
		 * happened.
		 *
		 * Through the property handle and not through `prop_rename` directly: the
		 * handle composes the new signature out of the current one, so a keyed or a
		 * two way property keeps its signs. Wires are rewritten by the model, NOT
		 * dropped — the mirror of `node_delete`, where `links_drop` cuts them because
		 * the node itself is going.
		 */
		@ $mol_action
		node_rename( name: string, next: string ) {

			if( !next || next === name ) return

			this.node().property( name ).title( next )

			const spots = { ... this.spots() }
			const spot = spots[ name ]

			if( spot ) {
				delete spots[ name ]
				this.spots({ ... spots, [ next ]: spot })
			}

			// The box is remembered under the old name and nothing will ever report
			// it again; the new name gets its own on the next measurement.
			this.pane().sizes_forget( name )

			if( this.selected() === name ) this.selected( next )

		}

		/**
		 * Name of the picked node as the inspector edits it, in both directions.
		 *
		 * Reading is the pick itself: the name of a node IS the property it occupies,
		 * so there is nothing to derive. Writing renames, and the refusal comes back
		 * as words rather than as an exception — a throw out of a `$mol_string`
		 * setter ends up in `setCustomValidity`, which is not where a person looks.
		 *
		 * The taken name is caught here and not left to the model, because only the
		 * message differs: the model refuses in English, at a caller that may not be
		 * a person. The model still refuses on its own and is tested doing so; this
		 * is the same rule spelled for the one who typed it.
		 */
		node_title( next?: string ) {

			const name = this.selected()

			if( next === undefined ) return name ?? ''
			if( !name || !next || next === name ) return name ?? ''

			// The two refusals a person causes just by typing, so they are the two
			// worded here. The model refuses both on its own, in English and at a
			// caller that may not be a person, and goes on doing so untouched.
			//
			// A name is a property name, so `view.tree` allows it latin letters,
			// digits and `_` and nothing else — and this field stands in a Russian
			// interface, where a Russian name is the first thing anybody tries.
			const parts = [ ... next.matchAll( $mol_view_tree2_prop_signature ) ][ 0 ]?.groups

			if( parts?.name !== next ) {
				this.node_title_note_at( name, `Имя «${ next }» не годится:`
					+ ' в имени узла только латинские буквы, цифры и подчёркивание' )
				return name
			}

			if( this.node().prop_names().includes( next ) ) {
				this.node_title_note_at( name, `Имя «${ next }» в этом документе уже занято` )
				return name
			}

			// What is left is what the editor did not foresee, and it still must not
			// vanish: a throw out of a `$mol_string` setter ends up in
			// `setCustomValidity`. Shown in the model's own words rather than
			// translated — a translation here would be a guess at a message nobody
			// has read yet.
			try {
				this.node_rename( name, next )
			} catch( error ) {
				if( this.$.$mol_promise_like( error ) ) return this.$.$mol_fail_hidden( error )
				this.node_title_note_at( name, this.$.$mol_error_message( error ) )
				return name
			}

			return next
		}

		/**
		 * The refusal in words, keyed by the node it is about.
		 *
		 * Keyed, so it clears itself: a rename that lands moves the pick to the new
		 * name and the message is read under a key nobody has written, and picking
		 * another node does the same. A single cell would need clearing from every
		 * path that can make it wrong, which is how a stale message survives.
		 */
		@ $mol_mem_key
		node_title_note_at( name: string, next?: string ) {
			return next ?? ''
		}

		node_title_note() {
			return this.node_title_note_at( this.selected() ?? '' )
		}

		/**
		 * Renames a class of the document with everything the editor keys by its
		 * name: the text, the handwritten body, the styles, and the recorded choice
		 * of which class the document opens with.
		 *
		 * The body and the styles are carried by hand, and that is not decoration.
		 * They are stored per class NAME — a node of the document in Giper Baza is
		 * found by the class its text declares, and a draft keeps them in cells keyed
		 * the same way — so a class that arrives under a new name arrives as a new
		 * node with nothing in it. Read before the write, written after: in between
		 * there is no name that answers for them.
		 *
		 * The text goes through the document model, which rewrites every mention of
		 * the class in its neighbours — the base of an heir, the class of a part —
		 * and refuses a name already taken. Property names are untouched by all of
		 * this, so the pick, the placement, the remembered boxes and the wires, which
		 * are keyed by property and not by class, have nothing to be orphaned by.
		 */
		@ $mol_action
		class_rename( name: string, next: string ) {

			const js = this.class_js( name )
			const css = this.class_css( name )

			this.doc_model().class_rename( name, next )

			if( js ) this.class_js( next, js )
			if( css ) this.class_css( next, css )

			const store = this.store()
			const doc = store.doc_current()

			if( doc && doc.can_change() && store.doc_root( doc ) !== next ) {
				store.doc_root( doc, next )
			}

		}

		/**
		 * What stands in the field of the root name, keyed by the name it started
		 * from.
		 *
		 * A draft, because the rename is committed on Enter and on blur: between the
		 * two the field holds a name the document does not have. Keyed by the current
		 * name so that a rename that lands starts a fresh draft — there is no state
		 * to reset and none to go stale. The same shape as the name of a node in the
		 * inspector, and for the same reason.
		 */
		@ $mol_mem_key
		root_draft_at( name: string, next?: string ) {
			return next ?? name
		}

		override root_draft( next?: string ) {
			return this.root_draft_at( this.doc_root(), next )
		}

		/** Commits the draft, and says nothing when there is nothing to commit. */
		@ $mol_action
		override root_submit( event?: Event ) {

			const draft = this.root_draft()
			if( !draft || draft === this.doc_root() ) return

			this.root_title( draft )
		}

		/**
		 * Name of the root class as the toolbar field commits it, in both directions.
		 *
		 * This is the name the folder of an export is made of — section 10 — so the
		 * field stands beside the download button that spells the folder out. A
		 * refusal comes back as words on the strip below, for the same reason the
		 * node name field does it that way: a throw out of a `$mol_string` setter
		 * ends up in `setCustomValidity`, where nobody looks.
		 */
		root_title( next?: string ) {

			const name = this.doc_root()

			if( next === undefined ) return name
			if( !next || next === name ) return name

			if( !this.$.$bog_vmap_lang_class_ok( next ) ) {
				this.root_title_note( `Имя «${ next }» не годится: имя класса это доллар`
					+ ' и не меньше двух частей через подчёркивание, латиницей в нижнем'
					+ ' регистре — из них и складывается папка модуля' )
				return name
			}

			try {
				this.class_rename( name, next )
			} catch( error ) {
				if( this.$.$mol_promise_like( error ) ) return this.$.$mol_fail_hidden( error )
				this.root_title_note( this.$.$mol_error_message( error ) )
				return name
			}

			this.root_title_note( '' )

			return next
		}

		/** Why the root was not renamed. Empty when it was, or when nobody tried. */
		@ $mol_mem
		override root_title_note( next?: string ) {
			return next ?? ''
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

			// Escape steps back out: out of the node the pointer was let inside of,
			// and out of the pick when it is outside already.
			if( event.key === 'Escape' ) {
				if( this.pane().inside() ) this.pane().entered( null )
				else this.selected( null )
				return
			}

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
