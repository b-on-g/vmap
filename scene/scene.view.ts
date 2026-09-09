namespace $.$$ {

	/** `asset:7f3a…` in the document is swapped for a `blob:` URL of this realm. */
	const asset_ref = /asset:([\w.\-]+)/g

	/** Every style element the scene attaches is prefixed, so a sweep never
	 * touches an element some other part of the page put into `head`. */
	const style_scope = 'bog_vmap_scene:'

	/**
	 * Placement lives under a prefix of its own, and that is load bearing.
	 *
	 * `styles_sweep()` drops everything under `style_scope` on each compile, so a
	 * placement element sharing that prefix would be swept away by the next
	 * keystroke in the document and come back only on the next `spots_set`.
	 * The id is constant besides: there is one document per scene, and
	 * `$mol_style_attach` reuses the element it finds by id.
	 */
	const spots_id = 'bog_vmap_spots:stage'

	/** Styles of the land libraries, one element, same reasoning as `spots_id`. */
	const libs_id = 'bog_vmap_libs:stage'

	/** A part name goes into a CSS selector, so it may be nothing but a name. */
	const spot_name_ok = /^[a-zA-Z_]\w*$/

	/**
	 * Smallest margin around the viewport a culled part is kept alive within.
	 *
	 * A part that has never been drawn has never been measured either, so it is
	 * judged by its placement point alone. The margin has to be wider than a node
	 * for that to be safe, or a wide component whose left edge is just off screen
	 * would be dropped on its first approach and only appear once its POINT came in.
	 */
	const cull_slack_min = 400

	/** A class name is interpolated as a bare identifier into the generated
	 * source, so a malformed one must be rejected with a readable error rather
	 * than a syntax error a hundred lines down. */
	const class_name_ok = /^\$[a-zA-Z][\w$]*$/

	/** One compile round: the live root, the identity it was built under, the failure. */
	type mounted = {
		readonly made: $mol_view | null
		readonly pack: string
		readonly root: string
		readonly supers: { readonly [ klass: string ]: string }
		readonly error: string
		readonly klass: string
	}

	const unmounted: mounted = { made: null, pack: '', root: '', supers: {}, error: '', klass: '' }

	/**
	 * Sandbox application of $bog_vmap.
	 *
	 * Takes a document over the bridge, compiles it, renders it, answers with
	 * measured geometry and errors. It has no network, no Giper Baza and no
	 * access to the user's keys — that is the whole point of the boundary.
	 *
	 * @see ../ARCHITECTURE.md sections 3 and 4
	 */
	export class $bog_vmap_scene extends $.$bog_vmap_scene {

		/** Last failure sent per stage, `null` when the stage is clear. See `error_post()`. */
		error_sent = { compile: null as string | null, runtime: null as string | null }

		/** Document source, view.tree text. Full document, never a patch. */
		@ $mol_mem
		doc_src( next?: string ) {
			return next ?? ''
		}

		/** Name of the class to instantiate. */
		@ $mol_mem
		doc_root( next?: string ) {
			return next ?? ''
		}

		/** Hand written class bodies, methods only, keyed by class name. */
		@ $mol_mem
		doc_js( next?: { readonly [ klass: string ]: string } ): { readonly [ klass: string ]: string } {
			return next ?? {}
		}

		/** Styles. Travel apart from the source, see `css_attach()`. */
		@ $mol_mem
		doc_css( next?: string ) {
			return next ?? ''
		}

		/**
		 * Where free parts sit on the canvas, in world coordinates.
		 *
		 * Editor scaffolding, and a channel of its own for exactly that reason: the
		 * document's own styles never carry a coordinate, so an export cannot pick
		 * one up even by mistake. Not a property of the page being built.
		 * @see ../bridge/bridge.ts, `spots_set`
		 */
		@ $mol_mem
		spots( next?: { readonly [ node: string ]: { readonly x: number, readonly y: number } } ) {
			return next ?? {} as { readonly [ node: string ]: { readonly x: number, readonly y: number } }
		}

		/**
		 * Last measured box of every free part, remembered across culling.
		 *
		 * Merged by `sizes_remember()`, never replaced: a part just culled is not in
		 * the DOM, so its absence from a report is not «no size» but «not drawn», and
		 * taking it for a size would flip the part between shown and hidden forever.
		 */
		@ $mol_mem
		sizes_seen( next?: { readonly [ name: string ]: $bog_vmap_scene_cull_box } ) {
			return next ?? {}
		}

		/**
		 * Viewport of the canvas: the frame's own box, which is the scene's, since
		 * the scene fills the frame. `null` until the first layout — `view_rect()`
		 * refuses to touch the DOM in the middle of a render, and polls after.
		 */
		screen() {
			const rect = this.view_rect()
			return rect && { width: rect.width, height: rect.height }
		}

		/**
		 * Names of the placed parts the canvas has to draw right now. Parts nobody
		 * placed are drawn unconditionally, and so is everything while the viewport
		 * is unknown: culling by a coordinate or a box nobody has is a guess, and a
		 * part hidden on a guess would never be measured out of it.
		 */
		@ $mol_mem
		shown() {

			const spots = this.spots()
			const names = Object.keys( spots )
			if( !names.length ) return new Set< string >()

			const screen = this.screen()
			if( !screen ) return new Set( names )

			const view = this.$.$bog_vmap_scene_cull_viewport( this.camera(), screen )
			const slack = Math.max( cull_slack_min, Math.max( view.width, view.height ) / 2 )

			return this.$.$bog_vmap_scene_cull( spots, this.sizes_seen(), view, slack, names )
		}

		/**
		 * Children of the document root, minus the ones off screen.
		 *
		 * Culling changes what is drawn and never what is stored: nothing here
		 * reaches the document text. A child whose owning property cannot be read
		 * is kept, because a case this does not understand is one it must not hide.
		 */
		sub_shown( kids: readonly $mol_view_content[] ) {

			const spots = this.spots()
			const shown = this.shown()

			return kids.filter( kid => {

				if( !this.view_like( kid ) ) return true

				const prop = this.view_prop( kid )
				if( !prop ) return true
				if( !( prop in spots ) ) return true

				return shown.has( prop )
			} )

		}

		/**
		 * Puts the filter between the document root and the DOM, as `sub_visible()`:
		 * the hook `$mol_view.render()` draws by and `$mol_list` narrows the same way,
		 * so `sub()` stays whole for every other reader — the walks, the seek, the
		 * values. An own property, which the prototype swap of a rebuild leaves be.
		 */
		cull_attach( made: $mol_view ) {

			Object.defineProperty( made, 'sub_visible', {
				configurable: true,
				writable: true,
				value: ()=> this.sub_shown( made.sub() ?? [] ),
			} )

		}

		/** Delivered assets: id to `blob:` URL of this realm. */
		@ $mol_mem
		assets( next?: { readonly [ id: string ]: string } ): { readonly [ id: string ]: string } {
			return next ?? {}
		}

		@ $mol_mem
		camera( next?: $bog_vmap_bridge_camera ): $bog_vmap_bridge_camera {
			return next ?? { x: 0, y: 0, zoom: 1 }
		}

		/**
		 * Pan of the grid, in screen pixels.
		 *
		 * The same numbers `camera_transform()` puts in its `translate`, and they
		 * have to be, or the lines would drift away from the nodes they are behind.
		 * The camera is stated in world units because the host thinks in world units;
		 * a ruler draws in screen pixels, so the conversion happens here and nowhere
		 * else.
		 */
		@ $mol_mem
		grid_shift() {
			const { x, y, zoom } = this.camera()
			return new this.$.$mol_vector_2d( -x * zoom, -y * zoom )
		}

		/** The rulers want a scale per axis, the camera is one isotropic number. */
		@ $mol_mem
		grid_scale() {
			const zoom = this.camera().zoom
			return new this.$.$mol_vector_2d( zoom, zoom )
		}

		override camera_transform() {
			const { x, y, zoom } = this.camera()
			return `translate(${ -x * zoom }px,${ -y * zoom }px) scale(${ zoom })`
		}

		/**
		 * Donor pack of this realm, as the host names it in `pack_set`.
		 *
		 * This frame has no address of its own — it is raised from markup, so there
		 * is no query to read a pack out of. The rule of section 5 still holds and
		 * still holds by construction: a realm cannot unload a bundle, so the host
		 * makes the address of the pack part of the key of the frame, and a second
		 * pack arrives in a frame that has never seen a first one.
		 *
		 * Empty until the message lands, and that is an ORDINARY state now rather
		 * than an impossible one, which is why `instance()` refuses to compile in it.
		 * @see ../ARCHITECTURE.md section 5
		 */
		@ $mol_mem
		pack_uri( next?: string ) {
			return next ?? ''
		}

		/**
		 * The importer of THIS bundle, resolved once. The pack rewrites `$mol_import`
		 * in the global `$` as it lands, and read late-bound after that the name
		 * gives the pack's copy, whose cache is empty — which loads the pack again,
		 * and again, six hundred script tags a second. Measured in headless Chrome.
		 * A record around the class, which a cell would otherwise stamp and own.
		 */
		@ $mol_mem
		importer() {
			const importer = this.$.$mol_import
			return { script: ( uri: string )=> importer.script( uri ) }
		}

		/**
		 * Suspends until the pack bundle is in the realm, then stays resolved.
		 * Everything that compiles reads this first: a class picks its base once, at
		 * definition time, and a document compiled before the pack lands would keep
		 * the scene's own `$mol_view` for good. A cross-origin `<script src>` needs
		 * no permission of its own inside the boundary.
		 */
		@ $mol_mem
		pack_ready() {

			const uri = this.pack_uri()
			if( !uri ) return uri

			this.importer().script( uri )

			// Two copies of `$mol_try_web` now listen on `self`, each calling a
			// `handler` private to its own bundle, so a dispatch from one copy throws
			// `handler is not a function` in the other. Plain try/catch for both.
			this.$.$mol_try = handler => {
				try { return handler() } catch( error ) { return error as Error }
			}

			return uri
		}

		/**
		 * Why the canvas is empty, or an empty string when it is not.
		 *
		 * The suspension is caught here rather than in `stage()` so that the wait
		 * has a face. Catching costs no reactivity: `$mol_wire_fiber.sync()`
		 * promotes the dependency before it throws, so this cell is subscribed to
		 * `pack_ready()` either way and recomputes when the pack lands.
		 */
		@ $mol_mem
		pack_note() {

			const uri = this.pack_uri()
			if( !uri ) return 'Ожидание библиотеки компонентов…'

			try {
				this.pack_ready()
				return ''
			} catch( error: unknown ) {
				if( this.$.$mol_promise_like( error ) ) return `Загрузка библиотеки компонентов… ${ uri }`
				return String( ( error as Error )?.message ?? error )
			}

		}

		/**
		 * One sandbox per document, never recreated.
		 *
		 * Reads nothing reactive, so the cell is computed once and never goes
		 * stale. That is the requirement, not an accident: `$mol_object2` caches
		 * its context in `[$mol_ambient_ref]` at the first read, so a fresh
		 * `Object.create( $ )` would silently cut already built instances off the
		 * classes compiled after it.
		 */
		@ $mol_mem
		sandbox() {

			const host = this.$
			const sandbox: typeof host = Object.create( host )
			Object.defineProperty( sandbox, '$', { value: sandbox, writable: true, configurable: true } )

			return sandbox
		}

		/**
		 * Sources of the land libraries, from the host, compiled before the document.
		 *
		 * Texts and nothing else: the scene has no database and no keys, so a land is
		 * read by the host and arrives here as the three strings of each component.
		 * On the bridge and not in the frame address, unlike the pack — a land is
		 * compiled into the sandbox like the document and inherits the current
		 * `$['$mol_view']`, so a change of the list is a recompile, not a reload.
		 * @see ../ARCHITECTURE.md section 5
		 */
		@ $mol_mem
		libs( next?: readonly $bog_vmap_bridge_part[] ): readonly $bog_vmap_bridge_part[] {
			return next ?? []
		}

		/**
		 * The libraries parsed: every declaration, and the handwritten bodies keyed
		 * by the class each part declares.
		 *
		 * The name of a class is read off its own tree rather than carried beside
		 * it, the same rule the land model lives by: one source of truth for a
		 * derivable fact. A part with no class declares nothing and keys nothing.
		 *
		 * Read inside `code()`, so a malformed library fails on the compile channel
		 * with the name of the file it came from, like a malformed document does.
		 */
		@ $mol_mem
		libs_parsed() {

			const defs = [] as $mol_tree2[]
			const js = {} as { [ klass: string ]: string }

			for( const part of this.libs() ) {

				const src = this.assets_apply( part.tree ).replace( /\n?$/, '\n' )

				const kids = this.$.$mol_view_tree2_normalize(
					this.$.$mol_tree2_from_string( src, 'lib.view.tree' )
				).kids

				defs.push( ... kids )

				const name = kids[ 0 ]?.type
				if( name && part.js ) js[ name ] = part.js

			}

			return { defs: defs as readonly $mol_tree2[], js: js as { readonly [ klass: string ]: string } }
		}

		/**
		 * Normalized declarations of the libraries and the document, in the order
		 * they can be defined in: libraries first, a base before its heir, one
		 * declaration per name. The order is `$bog_vmap_scene_order`, and the sort
		 * inside it is the canonical one from `lang` — the scene used to carry a
		 * copy, and two copies of a sort are one divergence away from `Class
		 * extends value undefined`.
		 */
		@ $mol_mem
		doc_tree() {

			const src = this.assets_apply( this.doc_src() ).replace( /\n?$/, '\n' )

			const defs = this.$.$mol_view_tree2_normalize(
				this.$.$mol_tree2_from_string( src, 'vmap.view.tree' )
			)

			return defs.clone( this.$.$bog_vmap_scene_order( this.libs_parsed().defs, defs.kids ) )
		}

		/**
		 * Base class of every declaration, by name.
		 *
		 * The declarations are already normalized, so the single kid of a class is
		 * its base and nothing else can be there.
		 */
		@ $mol_mem
		supers() {

			const map = {} as { [ klass: string ]: string }
			for( const def of this.doc_tree().kids ) map[ def.type ] = def.kids[0]?.type ?? ''

			return map as { readonly [ klass: string ]: string }
		}

		/**
		 * What each class declares and which of it is keyed, bases folded in.
		 *
		 * The hot swap reads this to tell a property that lost its cell from one
		 * that changed between solo and keyed, and both questions are asked of a
		 * live instance — whose atoms come from the whole chain, not from the last
		 * declaration alone. So a base declared by the document is folded into its
		 * heir, while a base from the pack is left out on purpose: its properties
		 * are not ours to judge and their shape does not change under us.
		 */
		@ $mol_mem
		shapes() {

			const own = {} as { [ klass: string ]: { declared: Set< string >, keyed: Set< string > } }

			for( const def of this.doc_tree().kids ) {

				const declared = new Set< string >()
				const keyed = new Set< string >()

				for( const prop of def.kids[0]?.kids ?? [] ) {
					const parts = this.$.$mol_view_tree2_prop_parts( prop )
					declared.add( parts.name )
					if( parts.key ) keyed.add( parts.name )
				}

				own[ def.type ] = { declared, keyed }

			}

			const supers = this.supers()

			for( const name of Object.keys( own ) ) {

				const seen = new Set< string >([ name ])

				for( let base = supers[ name ]; base && own[ base ] && !seen.has( base ); base = supers[ base ] ) {
					seen.add( base )
					for( const prop of own[ base ].declared ) own[ name ].declared.add( prop )
					for( const prop of own[ base ].keyed ) own[ name ].keyed.add( prop )
				}

			}

			return own as { readonly [ klass: string ]: $bog_vmap_scene_swap_shape }
		}

		/**
		 * The call that makes cells of the handwritten body, emitted right after the
		 * class: a decorator cannot be written into the string handed to
		 * `new Function`. What the tree says is keyed or changeable goes along as
		 * data, the rest `$bog_vmap_scene_cells` reads off the class itself.
		 */
		cells_code( self: $mol_tree2 ) {

			const keyed = [] as string[]
			const changeable = [] as string[]

			for( const prop of self.kids[0]?.kids ?? [] ) {
				const { name, key, next } = this.$.$mol_view_tree2_prop_parts( prop )
				if( key ) keyed.push( name )
				else if( next ) changeable.push( name )
			}

			return `$.$bog_vmap_scene_cells( $[ ${ JSON.stringify( self.type ) } ], ${ JSON.stringify( keyed ) }, ${ JSON.stringify( changeable ) } );`
		}

		/**
		 * Generated source of the whole document.
		 *
		 * Emitted class by class in topological order, and the handwritten body of
		 * a class goes right after its own declaration, before the next class is
		 * declared at all. Generating every declaration first and wrapping them
		 * afterwards would look tidier and be wrong: the wrapper is a NEW class,
		 * so a subclass built earlier keeps the unwrapped base in its prototype
		 * chain and simply loses the handwritten methods of its parent.
		 *
		 * Class name and CSS go in as data through `JSON.stringify`: a user CSS
		 * with a backtick or a `${` would tear the string apart otherwise, and a
		 * name is not a global here at all.
		 */
		@ $mol_mem
		code_parts() {

			const root = this.doc_root()
			if( !class_name_ok.test( root ) ) this.$.$mol_fail(
				new Error( `Root class name ${ JSON.stringify( root ) } is not an identifier` )
			)

			const tree = this.doc_tree()

			if( !tree.kids.some( def => def.type === root ) ) this.$.$mol_fail(
				new Error( `Class ${ root } is not declared by the document` )
			)

			// Library bodies first, document bodies over them: a document class of
			// the same name shadows the library one in the declarations already,
			// and its body has to shadow the library body the same way.
			const bodies = { ... this.libs_parsed().js, ... this.doc_js() }
			const parts = [] as { readonly klass: string, readonly js: string }[]

			for( const def of tree.kids ) {

				const name = def.type
				if( !class_name_ok.test( name ) ) this.$.$mol_fail(
					this.fault_named( new Error( `Class name ${ JSON.stringify( name ) } is not an identifier` ), name )
				)

				try {
					parts.push({ klass: name, js: this.class_code( tree, def, bodies[ name ] ).join( '\n' ) })
				} catch( error: unknown ) {
					// The name of the class travels ON the failure, so that the host
					// can put the message where the text that caused it is being
					// edited. Attached here, where it is known for certain, rather
					// than guessed later out of the wording of a parser.
					this.$.$mol_fail( this.fault_named( error as Error, name ) )
				}

			}

			return parts as readonly { readonly klass: string, readonly js: string }[]
		}

		/**
		 * Generated source of the whole document, one string.
		 *
		 * Kept apart from the pieces because the pieces are what names a failure:
		 * the whole document goes into ONE `new Function`, and a failure there says
		 * nothing about which class caused it.
		 */
		@ $mol_mem
		code() {
			return this.code_parts().map( part => part.js ).join( '\n' )
		}

		/** Marks a failure with the class whose text caused it. */
		fault_named( error: Error, klass: string ) {
			return Object.assign( error, { klass } )
		}

		/**
		 * Generated source of one class: its declaration, then its handwritten body.
		 *
		 * Apart from `code()` so that a failure can be caught around one class and
		 * named by it. The body wraps the declaration in a NEW class, which is why
		 * the two are emitted together and never in two passes over the document.
		 */
		class_code( tree: $mol_tree2, def: $mol_tree2, js: string | undefined ) {

			const name = def.type
			const chunks = [] as string[]

			// Every chunk starts with a semicolon: the generated code opens
			// with a parenthesis, and without one ASI glues it onto the
			// previous line into `$( … )` with `$ is not a function`.
			chunks.push( ';' + this.$.$mol_tree2_text_to_string_mapped_js(
				this.$.$mol_tree2_js_to_text(
					this.$.$mol_view_tree2_to_js( tree.clone([ def ]) )
				)
			) )

			if( !js ) return chunks

			const cls = JSON.stringify( name )

			// The class is named. An anonymous one drops `dom_name()` to
			// `div` and gives every sub view a bare `_echo`, the same one in
			// every document.
			chunks.push(
				`;$[ ${ cls } ] = class ${ name } extends $[ ${ cls } ] {`,
				js,
				'}',
				';' + this.cells_code( def ) + ';',
			)

			return chunks
		}

		/**
		 * Compiles the document into the sandbox, overwriting classes in place.
		 *
		 * Returns a plain record rather than the class itself. A class has a
		 * static `destructor`, so `$mol_wire_atom.put` would take ownership of it
		 * and stamp `Symbol.toStringTag` with the atom id — and `dom_name()` is
		 * `$mol_dom_qname( this.constructor.toString() )`, which reads exactly
		 * that stamp. A plain object has no `destructor` and stays untouched.
		 */
		@ $mol_mem
		build(): { readonly Root: typeof $mol_view } {

			const code = this.code()
			const sandbox = this.sandbox()
			const root = this.doc_root()

			try {
				new Function( '$', code )( sandbox )
			} catch( error: unknown ) {
				this.$.$mol_fail( this.fault_named( error as Error, this.culprit() ) )
			}

			const Root = Reflect.get( sandbox, root ) as typeof $mol_view | undefined
			if( typeof Root !== 'function' ) this.$.$mol_fail(
				new Error( `Class ${ root } is not registered by the compiled code` )
			)

			return { Root: Root! }
		}

		/**
		 * Class whose generated code throws, found by running the document again
		 * class by class.
		 *
		 * The whole document goes into ONE `new Function`, so a failure there — a
		 * base nobody declared, a syntax error in a handwritten body — carries no
		 * name. Splitting the fast path into a call per class to keep that name
		 * would cost every keystroke for the sake of the rare round that fails, so
		 * the search happens only once something already went wrong.
		 *
		 * Into a scratch context and not into the sandbox: the retry must not add
		 * half a generation of classes to the one the living component is using.
		 */
		culprit() {

			const scratch = Object.create( this.sandbox() )
			Object.defineProperty( scratch, '$', { value: scratch, writable: true, configurable: true } )

			for( const part of this.code_parts() ) {
				try {
					new Function( '$', part.js )( scratch )
				} catch {
					return part.klass
				}
			}

			return ''
		}

		/**
		 * May the live instance be moved onto the freshly compiled classes. Three
		 * things it cannot survive: another pack (the context of a live instance is
		 * cached under a symbol private to a bundle), another root class (another
		 * document), a changed base of any class it has ever been compiled with (a
		 * DOM node takes `attr_static()` off its base once). A class it has never
		 * seen takes nothing away. @see ../ARCHITECTURE.md section 3
		 */
		identity_kept( live: mounted, pack: string, root: string, supers: { readonly [ klass: string ]: string } ) {

			if( !live.made ) return false
			if( live.pack !== pack ) return false
			if( live.root !== root ) return false

			for( const name of Object.keys( supers ) ) {
				const was = live.supers[ name ]
				if( was !== undefined && was !== supers[ name ] ) return false
			}

			return true
		}

		/**
		 * The live root instance, the identity it was built under and why the last
		 * compile failed, in one value: one computation, one cell. `instance()` and
		 * `compile_error()` split it so that each moves only its own readers. A plain
		 * record, which `$mol_owning_catch` refuses to stamp or destroy.
		 *
		 * An edit moves the living component onto the new classes instead of
		 * building another one: cells are own fields of an instance, so a prototype
		 * swap keeps every value, every subscription and the DOM node with its caret,
		 * focus and scroll, which no snapshot carries. 6.1 ms against 8.7 ms for a
		 * rebuild on the S2 bench, and flat in the size of the component.
		 *
		 * What it built last time is read off its own cache through `$mol_wire_probe`,
		 * the way `view_rect()` does. A failed rebuild answers with that instance, so
		 * `instance()` keeps its value and the living component stays whole.
		 */
		@ $mol_mem
		mount(): mounted {

			const prev = $mol_wire_probe( ()=> this.mount() ) ?? unmounted

			const src = this.doc_src()
			const root = this.doc_root()

			// No pack, no compile: a document built before the pack lands would
			// inherit OUR `$mol_view`, and a class picks its base once for good.
			const pack = this.pack_uri()

			if( !src.trim() || !root || !pack ) return unmounted

			try {

				// First read of the body, and it suspends — everything below defines
				// classes, and a class picks its base once.
				this.pack_ready()

				const Root = this.build().Root
				const supers = this.supers()

				if( this.identity_kept( prev, pack, root, supers ) ) {

					this.$.$bog_vmap_scene_swap(
						prev.made!,
						name => Reflect.get( this.sandbox(), name ),
						name => this.shapes()[ name ] ?? null,
					)

					// Bases accumulate: a class deleted and declared again with another
					// base would otherwise slip past a round that never saw the name.
					return { ... prev, supers: { ... prev.supers, ... supers }, error: '', klass: '' }
				}

				const made = Root.make({ $: this.sandbox() })

				// Before anything reads `dom_tree()`, so the first paint is already
				// culled and a thousand node document never builds a thousand nodes.
				this.cull_attach( made )

				return { made, pack, root, supers, error: '', klass: '' }

			} catch( error: unknown ) {

				if( this.$.$mol_promise_like( error ) ) return this.$.$mol_fail_hidden( error )

				return {
					... prev,
					error: String( ( error as Error )?.message ?? error ),
					klass: String( ( error as { klass?: unknown } )?.klass ?? '' ),
				}

			}

		}

		/**
		 * The live root instance.
		 *
		 * A cell of its own over `mount()`, so that a failure appearing or clearing
		 * moves the error and nothing else: the value here stays the same object and
		 * no subscriber of the document is woken by a message on the error channel.
		 */
		@ $mol_mem
		instance(): $mol_view | null {
			return this.mount().made
		}

		/**
		 * Why the last compile failed, or an empty string.
		 *
		 * In the graph rather than in a field, so that a reader wakes when it
		 * changes. It used to be a plain field written from inside the cell that
		 * builds the instance, which is the second forbidden case of section 13: not
		 * a projection outwards but a write past the cells, and the label on the node
		 * would light up a round late or not at all.
		 */
		@ $mol_mem
		compile_error() {
			return this.mount().error
		}

		/** Class whose text failed to compile, when the failure names one. */
		@ $mol_mem
		compile_class() {
			return this.mount().klass
		}

		/**
		 * Styles, attached apart from the class.
		 *
		 * This is what keeps a CSS edit cheap: `doc_css()` is read here and
		 * nowhere else, so restyling moves this cell alone while `sandbox()` and
		 * `instance()` stand still together with all the live state.
		 *
		 * Not named `style()`: `$mol_view.style()` already exists and must return
		 * a dictionary of CSS properties for the rendered node.
		 */
		@ $mol_mem
		css_attach() {

			const root = this.doc_root()
			const css = this.assets_apply( this.doc_css() )

			const id = root && style_scope + root
			this.styles_sweep( id )

			if( !id ) return null

			return this.$.$mol_style_attach( id, css )
		}

		/**
		 * Placement of the free parts, hung as a style element of the scene's own.
		 *
		 * Apart from `css_attach()` on purpose, and not merely tidier: the document
		 * CSS is what an export writes out, so a world coordinate that ever lands in
		 * it ships the editor's desk layout into a deployed site. Here it cannot,
		 * because the host sends coordinates and the scene alone turns them into
		 * rules — the document text never sees them at all.
		 *
		 * Absolute positioning is TEMPORARY, scaffolding until artboards of stage 6:
		 * inside an artboard the layout is a plain $mol flex tree and only free parts
		 * lie by coordinates.
		 */
		@ $mol_mem
		spots_attach() {
			return this.$.$mol_style_attach( spots_id, this.spots_css() )
		}

		/**
		 * Styles of the land libraries, as one element of the scene's own.
		 *
		 * Under a constant id outside `style_scope`, like the placement: the sweep
		 * on every compile of the document must not take the library styles with
		 * it, and `$mol_style_attach` reuses the element it finds by id. Read off
		 * the raw parts and not off `libs_parsed()`, so that a library that fails
		 * to parse fails on the compile channel and does not take the styles of its
		 * neighbours down with it.
		 */
		@ $mol_mem
		libs_css_attach() {
			const css = this.libs().map( part => part.css ).filter( Boolean ).join( '\n' )
			return this.$.$mol_style_attach( libs_id, this.assets_apply( css ) )
		}

		/**
		 * The placement rules.
		 *
		 * A sub view of a class carries `[<root without $>_<property lowercased>]`
		 * (`view_names_owned`, `view.tsx:365`), which is how a part is addressed.
		 * World coordinates go into `left`/`top` unchanged: the stage sits under one
		 * `transform` with `transform-origin: 0 0`, so the root class is at world
		 * zero and its offset children are already in world units.
		 *
		 * **`!important` is not laziness here, it is the only thing that works.**
		 * Half the standard library positions itself: `[mol_string]` alone declares
		 * `position: relative`, at the same specificity as a single attribute
		 * selector, so the cascade falls through to source order — and this element
		 * is attached before the pack script has even been fetched, which puts every
		 * pack rule after it. Measured: three components dropped at one x,
		 * `$mol_button_minor` and `$mol_icon_close` landed on it, `$mol_string` came
		 * out 122 px to the right, offset by exactly the width of its in-flow
		 * neighbour, because it stayed `relative` and read `left` as a shift from its
		 * static position. Two of three looked right by luck. The pack is somebody
		 * else's CSS and we do not get to renumber it, so placement wins by
		 * declaration instead of by position.
		 *
		 * Margins are left alone, and a component carrying its own lands offset by
		 * them: `$mol_speck` has `margin: -.5rem -.2rem` and comes out 8 px above and
		 * 4 px left of the point it was aimed at. That is the badge doing what a badge
		 * does, and overriding it would be the editor deciding how somebody else's
		 * component looks.
		 */
		spots_css() {

			const attr = this.doc_root().replace( /^\$/, '' )
			if( !attr || !class_name_ok.test( this.doc_root() ) ) return ''

			const rules = [ `[${ attr }] { position: relative !important; }` ]

			for( const [ name, spot ] of Object.entries( this.spots() ) ) {

				// The name reaches a selector and the numbers reach a declaration, so
				// both are checked rather than trusted: one malformed rule would eat
				// the rules after it, and a silently shifted canvas is a long thing
				// to debug.
				if( !spot_name_ok.test( name ) ) continue
				if( !Number.isFinite( spot?.x ) || !Number.isFinite( spot?.y ) ) continue

				rules.push(
					`[${ attr }] > [${ attr }_${ name.toLowerCase() }] {`
					+ ` position: absolute !important;`
					+ ` left: ${ spot.x }px !important;`
					+ ` top: ${ spot.y }px !important;`
					+ ` }`
				)

			}

			return rules.join( '\n' ) + '\n'
		}

		/**
		 * Drops style elements of the previous compilation.
		 *
		 * `$mol_style_attach` never removes them, and a class renamed while the
		 * user types leaves one behind on every keystroke — hundreds per editing
		 * session. Only elements of this scene are swept, never someone else's,
		 * and never the placement element: it lives under `spots_id`, outside this
		 * prefix, precisely so a document edit cannot take the canvas apart.
		 */
		styles_sweep( keep: string ) {

			const doc = this.$.$mol_dom_context.document
			if( !doc ) return

			const prefix = '$mol_style_attach:' + style_scope
			const kept = keep && '$mol_style_attach:' + keep

			for( const el of Array.from( doc.head.querySelectorAll( `style[id^="${ prefix }"]` ) ) ) {
				if( el.id === kept ) continue
				el.remove()
			}

		}

		/**
		 * Swaps `asset:` for `blob:`. The bytes arrive over the bridge and the URL
		 * is made here: one minted by the host belongs to the host origin and does
		 * not open in an opaque one. An id with no bytes yet is left in place.
		 */
		assets_apply( text: string ) {
			const known = this.assets()
			return text.replace( asset_ref, ( whole, id: string )=> known[ id ] ?? whole )
		}

		/** Every text of the document an address can stand in. */
		texts() {
			return [
				this.doc_src(),
				this.doc_css(),
				... this.libs().flatMap( part => [ part.tree, part.css ] ),
			]
		}

		/** Ids the document mentions and the host has not delivered, in order of mention. */
		@ $mol_mem
		assets_missing() {

			const known = this.assets()
			const missing = new Set< string >()

			for( const text of this.texts() ) {
				for( const [ , id ] of text.matchAll( asset_ref ) ) {
					if( !known[ id ] ) missing.add( id )
				}
			}

			return [ ... missing ]
		}

		/**
		 * Asks the host for one asset. Once, for as long as the id stays missing:
		 * the cell is read by `assets_push()` while it is, swept when it is not, and
		 * made anew — asking again — should the id ever go missing again.
		 */
		@ $mol_mem_key
		asset_ask( id: string ) {
			this.post({ kind: 'asset_want', id })
			return id
		}

		/** Projection of `assets_missing()` onto the wire, read from `auto()`. */
		@ $mol_mem
		assets_push() {
			return this.assets_missing().map( id => this.asset_ask( id ) )
		}

		/**
		 * Mounted content.
		 *
		 * `css_attach()` is read right here, next to the instance, on purpose: a
		 * cell nobody reads during render is swept by `$mol_wire`, and then the
		 * styles would stop updating after the very first attach.
		 */
		@ $mol_mem
		/**
		 * The document, mounted as a DOM node rather than as a sub view.
		 *
		 * `$mol_view.render()` (`view.tsx:307`) decides between "a view" and "a
		 * string" by `child instanceof $mol_view`, and that `$mol_view` is the
		 * class local to its own file, that is the private copy of its bundle.
		 * The document inherits from the `$mol_view` of the donor pack, so the
		 * check is false and the branch falls through to `String( child )`:
		 * compilation stays green, no error reaches the bridge, and the document
		 * is rendered into its own node that simply never enters the DOM.
		 *
		 * An `Element` takes the `instanceof Node` branch instead, and about that
		 * one the second copy of the framework has no opinion. Reactivity of the
		 * document is untouched, it lives entirely inside its own subtree.
		 * @see ../ARCHITECTURE.md section 4, "Два бандла в одном документе"
		 */
		override stage(): readonly $mol_view_content[] {

			this.css_attach()

			// Read here for the same reason as the styles above: a cell nobody
			// reads during render is swept by `$mol_wire` together with its value,
			// and placement would then stop following the canvas after the first
			// attach. Before the early return, because a part may be dropped while
			// the pack is still on its way.
			this.spots_attach()
			this.libs_css_attach()

			// `instance()` is suspended while the pack travels, and a suspended
			// `stage()` would render as nothing at all for 610 ms cold. The note
			// is a state, not a spinner: it also survives as the wording of a
			// pack that never arrived.
			if( this.pack_note() ) return [ this.Wait() ]

			const made = this.instance()
			return made ? [ made.dom_tree() ] : []
		}

		post( message: $bog_vmap_bridge_up ) {
			this.$.$bog_vmap_bridge_send( this.peer(), message )
		}

		/** Wires the host wants labelled: root property names, the whole list each time. */
		@ $mol_mem
		values_wanted( next?: readonly string[] ): readonly string[] {
			return next ?? []
		}

		/** Wall clock of the last `values` sent. A plain field, written from a timer. */
		values_at = 0

		/** Shortest gap between two `values` messages, in ms. */
		values_period() {
			return 250
		}

		/** The clock. A method so that a test can move it by hand. */
		now() {
			return Date.now()
		}

		/**
		 * Labels of the wanted wires, sent to the host no more often than
		 * `values_period()`.
		 *
		 * The values are read here, inside the cell, so the document's own atoms wake
		 * it: the graph is shared with the document, see section 4. Every change
		 * restarts the timer with whatever is left of the period, so a wire that
		 * changes on every frame costs one message per period and a wire that
		 * changes once is reported at once.
		 *
		 * `values_at` is read here and written in the callback, past the graph, and
		 * it wants NO counter cell to prop it up — unlike the similar fields in the
		 * pane. Nothing else writes it, so it only ever changes as a consequence of
		 * this cell's own timer having fired, and at that moment the value has just
		 * been sent and there is nothing to recompute. A wake on it would restart
		 * the timer for a message already on the wire, which is one extra message
		 * per period, not one fewer. Measured in `values.test.ts`, on a hand moved
		 * clock: first send at delay 0, a change 100 ms later waits the remaining 150.
		 */
		@ $mol_mem
		values_task() {

			const names = this.values_wanted()
			if( !names.length ) return null

			const made = this.instance()
			if( !made ) return null

			const values = this.$.$bog_vmap_scene_values( made, names )
			const wait = Math.max( 0, this.values_period() - ( this.now() - this.values_at ) )

			return new this.$.$mol_after_timeout( wait, () => {
				this.values_at = this.now()
				this.post({ kind: 'values', values })
			} )
		}

		/**
		 * The one window the scene talks to.
		 *
		 * A plain field, never a cell: a cross-origin `Window` put through
		 * `$mol_wire_atom.put` is walked by `$mol_compare_deep`, which reads
		 * `location.href` and throws `SecurityError` — and the handler then dies
		 * silently. Identity comparison alone touches no property and is safe.
		 */
		peer() {
			return this.$.$mol_dom_context.parent
		}

		message_receive( event?: MessageEvent ) {

			if( !event ) return

			// The peer is checked even though the scene keeps no secrets: a
			// stray window posting here would make the scene render something
			// the host never sent, and that is a long thing to debug.
			const message = this.$.$bog_vmap_bridge_read< $bog_vmap_bridge_down >( event, this.peer() )
			if( !message ) return

			switch( message.kind ) {

				case 'doc_set': {

					this.doc_root( message.root )
					this.doc_src( message.src )

					// A host older than the `js` field of the contract just sends
					// documents with no handwritten bodies.
					const bodies = message.js
					this.doc_js( bodies && typeof bodies === 'object' ? bodies : {} )

					return
				}

				// First message of every handshake, before the document and the
				// libraries. A host older than this contract never sends it, and the
				// scene then compiles nothing, which is the honest outcome: without a
				// pack every class of the document would inherit our own `$mol_view`.
				case 'pack_set': this.pack_uri( String( message.uri ?? '' ) ); return

				case 'css_set': this.doc_css( message.css ); return

				// The whole list every time. A host older than this message simply
				// never sends it, and the document compiles against the pack alone.
				case 'libs_set': this.libs( Array.isArray( message.parts ) ? message.parts : [] ); return

				case 'spots_set': this.spots( message.spots ); return

				case 'camera_set': this.camera( message.camera ); return

				case 'values_want': this.values_wanted( Array.isArray( message.names ) ? message.names.map( String ) : [] ); return

				case 'click_at': {

					this.click_apply( message.x, message.y, message.mods )

					// A click is a push like any other and owes the host an answer:
					// geometry, which the click may just have changed. Sent at once
					// rather than left to the debounced report, because a click that
					// changes nothing would otherwise be answered by nothing, and the
					// watchdog would read that silence as a stuck scene.
					this.report_send()

					return
				}

				// Answered right here, off the raw message, and deliberately not
				// through any cell: what the host is asking is whether this THREAD is
				// running, and a fiber of document code looping is exactly what would
				// stop this line from being reached. Nothing is read, nothing is
				// computed, so a `pong` cannot be delayed by anything but a real stop.
				case 'ping': this.post({ kind: 'pong', nonce: message.nonce }); return

				case 'asset_put': {

					const stale = this.assets()[ message.id ]
					const uri = URL.createObjectURL( new Blob( [ message.bytes ], { type: message.mime } ) )

					this.assets({ ... this.assets(), [ message.id ]: uri })

					if( stale ) URL.revokeObjectURL( stale )

					return
				}

			}

		}

		/**
		 * Replays a click the host overlay took, on whatever is under that point here.
		 *
		 * The host sends world coordinates and this side owns the same camera the
		 * stage is drawn with, so the point on this window is `(world - camera) *
		 * zoom` — the inverse of what `sizes_of` does to a measured box. The replay
		 * itself lives in `$bog_vmap_scene_click`, which is where it is tested.
		 */
		click_apply( x: number, y: number, mods: $bog_vmap_bridge_mods ) {

			const camera = this.camera()
			const zoom = camera.zoom || 1

			this.$.$bog_vmap_scene_click(
				this.$.$mol_dom_context,
				( x - camera.x ) * zoom,
				( y - camera.y ) * zoom,
				mods,
			)

		}

		@ $mol_mem
		message_listener() {
			return new this.$.$mol_dom_listener(
				this.$.$mol_dom_context,
				'message',
				$mol_wire_async( this ).message_receive,
			)
		}

		@ $mol_mem
		boot() {
			return new this.$.$mol_after_tick( () => this.post({ kind: 'ready' }) )
		}

		/**
		 * Re-reports whenever the layout of the document actually changes.
		 *
		 * The wire graph does not see layout, and that is a whole class of
		 * silent staleness, not one occasion. A frame with no layout at all —
		 * a hidden tab, a collapsed panel — measures 0x0; a late font or a
		 * decoded image resizes the document with nothing in the graph moving.
		 * In every case the host would keep the stale numbers until the next
		 * edit. The observer covers all of them at once, because its very first
		 * delivery happens exactly when the box first exists.
		 *
		 * The wrapper is here to give the observer a `destructor`: a bare
		 * `ResizeObserver` is not ownable, so the atom would leave the previous
		 * one connected on every rebuild.
		 *
		 * The set of watched nodes is not decided here — it is every node the last
		 * report measured, which `resize_sync()` hands over. The root alone is not
		 * enough and stops being enough the moment there is an artboard: a page of
		 * fixed width keeps its own box while everything inside it reflows, so the
		 * one observer that used to be here would never fire and the host would sit
		 * on the boxes of the previous layout.
		 */
		@ $mol_mem
		resize_watch() {

			const observer = new ResizeObserver( () => this.report_send() )

			return { observer, destructor: () => observer.disconnect() }
		}

		/** Nodes the observer is watching right now. */
		resize_seen = new Set< Element >()

		/** Watches exactly the nodes of the last measurement, and nothing else. */
		resize_sync( nodes: readonly Element[] ) {

			this.resize_seen = this.$.$bog_vmap_scene_measure_watch(
				this.resize_watch().observer,
				this.resize_seen,
				nodes,
			)

		}

		/**
		 * Debounced answer to the host.
		 *
		 * `$mol_after_timeout` and not `$mol_after_frame`: the scene lives in an
		 * iframe, and a background tab stops firing animation frames.
		 *
		 * The cell depends on the rendered tree, not only on the sources. The
		 * report reads geometry and failures off the DOM, and a timer started
		 * from a source change alone can easily fire before the frame is
		 * committed — then the sizes are of the previous layout and a render
		 * error is not on the node yet.
		 */
		@ $mol_mem
		report_task() {

			this.doc_src()
			this.doc_root()
			this.doc_js()
			this.doc_css()
			this.libs()
			// Placement MOVES nodes without resizing any of them, and a
			// `ResizeObserver` reports size and never position. So this subscription
			// is not a stand-in for the narrow observer that used to watch the root
			// alone — it stays needed however many nodes are watched.
			this.spots()
			this.assets()
			this.camera()

			const made = this.instance()
			// A failure of the document is read off the DOM in `report_post()`,
			// so here it is only a subscription, never something to rethrow.
			if( made ) try { made.dom_final() } catch {}

			return new this.$.$mol_after_timeout( 120, () => this.report_send() )
		}

		report_send() {
			try {
				this.report_post()
			} catch( error: unknown ) {
				if( this.$.$mol_promise_like( error ) ) return
				this.post({ kind: 'error', at: 'runtime', message: 'report: ' + String( ( error as Error )?.message ?? error ) })
			}
		}

		report_post() {

			const made = this.instance()

			const compiled = this.compile_error()
			this.error_post( 'compile', compiled, compiled && made ? this.class_node( made, this.compile_class() ) : '' )

			const measured = made ? this.sizes_of( made ) : { sizes: {}, nodes: [] }
			const sizes = measured.sizes

			this.resize_sync( measured.nodes )
			this.sizes_remember( sizes )
			this.post({ kind: 'sizes', sizes })

			const failed = made ? this.render_error( made ) : { message: '', node: '' }
			this.error_post( 'runtime', failed.message, failed.node )

		}

		/**
		 * Keeps the boxes of the free parts for the next culling round, merged into
		 * `sizes_seen()`. Only the direct children of the root are kept, the same
		 * set `shown()` judges: one path segment is exactly one free part.
		 */
		sizes_remember( sizes: { readonly [ node: string ]: $bog_vmap_bridge_rect } ) {

			const prefix = this.doc_root() + '/'
			const seen = { ... this.sizes_seen() }

			for( const key of Object.keys( sizes ) ) {
				if( !key.startsWith( prefix ) ) continue
				const name = key.slice( prefix.length )
				if( name.includes( '/' ) ) continue
				seen[ name ] = sizes[ key ]
			}

			this.sizes_seen( seen )
		}

		/**
		 * The failure of the last render, and the node it belongs to.
		 *
		 * The walk goes over the views and not over the DOM, even though a failing
		 * element is a `querySelector` away. The host addresses a node by the path
		 * `sizes` was keyed with, and the attribute the element carries is a
		 * different vocabulary: lowercased and joined by underscores, so `My_box`
		 * and `my/Box` reach the host as one string and neither of them matches. A
		 * label put on the wrong node is worse than no label at all.
		 *
		 * A document whose own render throws is the common case, so the root is
		 * asked first — that is inside the walk, which starts there.
		 */
		render_error( made: $mol_view ) {

			const found = this.$.$bog_vmap_scene_seek(
				made,
				this.walk_of( made ),
				view => this.view_broken( view ) !== '',
			)

			if( !found ) return { message: '', node: '' }

			return { message: this.view_broken( found.view ), node: this.part_of( found.path ) }
		}

		/**
		 * The free part a path falls inside, which is how the host names a node.
		 *
		 * One segment and never the whole path: the host looks a node up by the name
		 * it was given in `sizes`, and there only the direct children of the root are
		 * kept — one path segment is exactly one free part. A deeper path is reported
		 * by the part that CONTAINS it rather than by its own last segment, and that
		 * is not a rounding but the honest answer: the failure really is inside that
		 * part, while a bare last segment would collide with a part of the same name
		 * elsewhere and put the mark on the wrong node, silently.
		 *
		 * The root itself is no node of the canvas, so it comes back empty and the
		 * failure stays in the status line, where a failure of the whole document
		 * belongs.
		 */
		part_of( path: string ) {

			const prefix = this.doc_root() + '/'
			if( !path.startsWith( prefix ) ) return ''

			return path.slice( prefix.length ).split( '/' )[ 0 ] ?? ''
		}

		/**
		 * The failure written on the node of one view, or an empty string.
		 *
		 * A suspension is not a failure: `$mol` writes the same attribute while a
		 * fiber waits, and reporting that would light the node up on every load.
		 */
		view_broken( view: $mol_view ) {

			let node: Element
			// A view whose node cannot even be built is a view with nothing to read
			// a failure off; the failure of its owner is reported instead.
			try { node = view.dom_node() } catch { return '' }

			const broken = node.getAttribute( 'mol_view_error' )
			if( !broken || broken === 'Promise' || broken === '$mol_promise_blocker' ) return ''

			// The attribute holds only the error name; $mol puts the message
			// itself into the text of the node.
			const text = ( node.textContent ?? '' ).replace( /\s+/g, ' ' ).trim().slice( 0, 500 )

			return text ? `${ broken }: ${ text }` : broken
		}

		/**
		 * Node of the first live instance of a class, by the path the host uses.
		 *
		 * This is how a COMPILE failure gets a node. The failure names a class, and
		 * a class is not a node — but the tree still standing on the screen is the
		 * one built from the previous text, so the instance of the class just broken
		 * is exactly the node the user is looking at. When the class has no live
		 * instance, or is the root itself, there is nothing better to say than the
		 * root, and when it is not named at all the answer is empty.
		 */
		class_node( made: $mol_view, klass: string ) {

			if( !klass ) return ''

			// The root class is the document, not a node of the canvas. Naming it
			// would hand the host a class name where it expects a part name, and a
			// name it cannot find is a mark that never appears, with nothing said.
			if( klass === this.doc_root() ) return ''

			const found = this.$.$bog_vmap_scene_seek(
				made,
				this.walk_of( made ),
				view => ( view.constructor as { name?: string } )?.name === klass,
			)

			return found ? this.part_of( found.path ) : ''
		}

		/**
		 * How to walk a rendered document: the three things the walks need to know
		 * about `$mol`, in one place because both of them need the same three and a
		 * second copy would be a second vocabulary.
		 */
		walk_of( made: $mol_view ) {
			return {
				key: this.doc_root(),
				view_of: ( kid: unknown )=> this.view_like( kid ) ? kid : null,
				// A document whose `sub` throws is a document mid-failure, reported on
				// the error channel; here it simply has no children to walk.
				kids_of: ( view: $mol_view )=> { try { return view.sub() ?? [] } catch { return [] } },
				prop_of: ( view: $mol_view )=> this.view_prop( view ),
			}
		}

		/**
		 * Reports a failure only when it changes, and `null` once it is gone.
		 *
		 * Without the explicit clear the host cannot tell a failure that is
		 * still there from one that has just been fixed: the scene would simply
		 * go quiet, and quiet is indistinguishable from broken. Edge triggering
		 * also stops the same message being resent on every report round.
		 *
		 * `null` rather than an empty string, because an empty error text is a
		 * plausible bug and must not read as good news. The two stages clear
		 * independently.
		 */
		error_post( at: 'compile' | 'runtime', message: string, node: string ) {

			const next = message || null

			if( this.error_sent[ at ] === next ) return
			this.error_sent[ at ] = next

			// The field always travels, empty when the failure belongs to nobody, so
			// that the host never has to tell «no node» from «an older scene».
			this.post({ kind: 'error', at, message: next, node })
		}

		/**
		 * Geometry of the document, in world units, and the nodes it was read off.
		 *
		 * The walk itself is `$bog_vmap_scene_measure`, which knows nothing of `$mol`;
		 * what a view is, what its children are and which property holds it are the
		 * three things this class knows and hands over.
		 */
		sizes_of( root: $mol_view ) {

			return this.$.$bog_vmap_scene_measure( root, {
				... this.walk_of( root ),
				zoom: this.camera().zoom,
			} )
		}

		/**
		 * Is this piece of content a view, told by shape rather than by class.
		 *
		 * Not a fix for a break: measured, `instanceof $mol_view` reports all
		 * seven nodes here, pack built ones included. It works by a coincidence
		 * of scope, and the coincidence is worth spelling out because the same
		 * operator does the opposite one file away.
		 *
		 * A bare `$mol_view` written in THIS file compiles to a bare identifier,
		 * and no `class $mol_view` is declared in the emitted closure around it,
		 * so the name goes up the scope chain to the global — which is where the
		 * donor pack puts its own classes, and which is therefore the very class
		 * the document extends. Late binding, check passes. The same text inside
		 * `view.tsx` sits next to the declaration and binds to the file's own
		 * copy early, which is exactly why `render()` refuses a pack built
		 * document and why it is mounted here as a DOM node.
		 *
		 * So the operator holds only while this method stays in a file that does
		 * not declare `$mol_view`, and while the pack is the last writer of the
		 * global. Neither is a property of what is being asked. Shape is.
		 * @see ../ARCHITECTURE.md section 4
		 */
		view_like( kid: unknown ): kid is $mol_view {
			return typeof ( kid as { dom_node?: unknown } | null )?.dom_node === 'function'
		}

		/**
		 * Property the view is held by, taken from the owning atom.
		 *
		 * That is the flat property name of the root class — see section 1 of
		 * the architecture — which is exactly the handle the host addresses a
		 * node with, at any depth of nesting.
		 */
		view_prop( view: $mol_view ) {

			const owner = this.$.$mol_owning_get( view ) as $mol_wire_fiber< unknown, unknown[], unknown > | null

			const name = owner?.task?.name?.trim()
			if( !name ) return ''

			const key = owner!.args?.[0]
			return key === undefined ? name : `${ name }(${ String( key ) })`
		}

		override auto() {
			return [
				... super.auto(),
				this.message_listener(),
				this.resize_watch(),
				this.boot(),
				this.report_task(),
				this.values_task(),
				this.assets_push(),
			]
		}

	}

}
