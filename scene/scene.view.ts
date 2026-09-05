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

	/** Donor pack address in the query of the scene's own URL, percent encoded. */
	const pack_ref = /[?&]pack=([^&]*)/

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

		/**
		 * Last compile failure. A plain field on purpose: written from inside
		 * `instance()`, and a `@ $mol_mem` cell written from another cell means
		 * infinite invalidation. It also must not invalidate `instance()`, or a
		 * broken source would take the live component down with it.
		 */
		compile_error = ''

		/** Instance kept across a failed rebuild, see `instance()`. */
		instance_live: $mol_view | null = null

		/** Asset ids the document references but the host has not delivered. */
		assets_missing = new Set< string >()

		/** Ids already asked for, so a report round does not re-ask every 120ms. */
		assets_asked = new Set< string >()

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
		 * A plain field, and it is never pruned by measurement: a part that has just
		 * been culled is not in the DOM, so there is nothing to measure, and taking
		 * that for «it has no size» would flip it between shown and hidden forever.
		 * What is remembered is the last truth, not the last observation.
		 */
		sizes_seen: { [ name: string ]: $bog_vmap_scene_box } = {}

		/** Bumped when the frame is resized, so the viewport is a reactive value. */
		@ $mol_mem
		screen_version( next?: number ) {
			return next ?? 0
		}

		/**
		 * The frame's own size, which is the viewport of the canvas.
		 *
		 * Taken from this window rather than sent by the host: the frame is stretched
		 * to the pane, so the two are the same rectangle by construction, and asking
		 * the host would put a message on the wire for something already known here.
		 */
		screen() {
			this.screen_version()
			const win = this.$.$mol_dom_context
			return { width: win.innerWidth || 0, height: win.innerHeight || 0 }
		}

		@ $mol_mem
		screen_listener() {
			return new this.$.$mol_dom_listener(
				this.$.$mol_dom_context,
				'resize',
				() => this.screen_version( this.screen_version() + 1 ),
			)
		}

		/**
		 * Names of the parts the canvas has to draw right now.
		 *
		 * Only parts the host has placed are judged. Anything else — a sub view of a
		 * part, a node the editor never put a coordinate on — is drawn unconditionally,
		 * because culling by a coordinate nobody assigned would be a guess.
		 *
		 * Reading this from `sub()` is what makes the camera move the canvas: the
		 * document's `dom_tree()` subscribes to this cell through its own `sub()`,
		 * and the document shares the reactive graph with the scene, so a camera
		 * message re-renders exactly the root and nothing else.
		 */
		@ $mol_mem
		shown() {

			const spots = this.spots()
			const names = Object.keys( spots )
			if( !names.length ) return new Set< string >()

			const view = this.$.$bog_vmap_scene_viewport( this.camera(), this.screen() )
			const slack = Math.max( cull_slack_min, Math.max( view.width, view.height ) / 2 )

			return this.$.$bog_vmap_scene_shown( spots, this.sizes_seen, view, slack, names )
		}

		/**
		 * Children of the document root, minus the ones off screen.
		 *
		 * **Culling changes what is drawn and never what is stored.** Nothing here
		 * reaches the document text, which lives in the host and is pushed down whole;
		 * this filter sits between the compiled class and the DOM and is undone by
		 * simply not applying it.
		 *
		 * A child whose owning property cannot be read is kept. The name comes from
		 * the atom that holds the view, and a view held by something else is a case
		 * this does not understand — and a case it does not understand is a case it
		 * must not hide.
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
		 * Puts the filter between the document root and the DOM.
		 *
		 * An own property on the instance rather than a wrapper class in `code()`:
		 * compilation stays exactly what the document says, and the hot swap of stage
		 * 4.3 replaces the prototype without touching own properties, so the filter
		 * survives a rebuild instead of having to be re-emitted into it.
		 *
		 * The prototype is looked up at call time, not captured: after a prototype
		 * swap a captured `sub` would be the previous implementation, and the canvas
		 * would keep drawing the old document while every other property followed the
		 * new one.
		 */
		cull_attach( made: $mol_view ) {

			Object.defineProperty( made, 'sub', {
				configurable: true,
				writable: true,
				value: () => this.sub_shown(
					Object.getPrototypeOf( made ).sub.call( made ) ?? []
				),
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

		@ $mol_mem
		override mode( next?: string ) {
			return next ?? super.mode()
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
		 * Donor pack of this frame, taken from our own address.
		 *
		 * Deliberately not a bridge message. The scene has no way to unload a
		 * bundle, and a second pack over the first poisons the palette without a
		 * single signal — 277 of 414 `$mol_*` classes left with a stale base on
		 * the S4 measurement, at a green compile and an empty error channel.
		 *
		 * In the QUERY, and the query is what makes it hold. A different query is
		 * a different document URL, so the browser reloads the frame on its own
		 * and this realm never sees a second pack. A fragment would not: an `src`
		 * differing only after the `#` is a same-document navigation, the frame
		 * keeps its document, its globals and the pack already in them — measured
		 * on the live host, where the pack address changed and no second `ready`
		 * ever came. The fragment is also contested ground, `$mol_state_arg`
		 * lives there.
		 *
		 * A plain method, not a cell: an address change means a new document, so
		 * there is nothing here to subscribe to.
		 * @see ../ARCHITECTURE.md section 5
		 */
		pack_uri() {

			const found = pack_ref.exec( this.$.$mol_dom_context.location?.search ?? '' )
			if( !found ) return ''

			try {
				return decodeURIComponent( found[1] )
			} catch {
				return found[1]
			}

		}

		/**
		 * Pulls the pack bundle into this realm.
		 *
		 * A cross-origin `<script src>` needs no permission of its own inside the
		 * boundary: measured at 463 ms and 812 `$mol_*` globals in a frame where
		 * `localStorage` and `parent.location` both throw.
		 */
		async pack_fetch( uri: string ) {

			const doc = this.$.$mol_dom_context.document
			if( !doc ) return uri

			await new Promise< void >( ( done, fail ) => {

				const el = doc.createElement( 'script' )
				el.setAttribute( 'charset', 'utf-8' )
				el.onload = () => done()
				el.onerror = () => fail( new Error( `Пак не загрузился: ${ uri }` ) )
				el.src = uri

				doc.head.appendChild( el )

			} )

			return uri
		}

		/**
		 * Suspends until the pack is in the realm, then stays resolved.
		 *
		 * Everything that compiles reads this first. A document compiled before
		 * the pack arrives inherits the scene's own `$mol_view`, and there is no
		 * way to move it onto the pack's afterwards: a class computes its base
		 * once, at definition time.
		 */
		@ $mol_mem
		pack_ready() {

			const uri = this.pack_uri()
			if( !uri ) return ''

			return this.$.$mol_wire_sync( this ).pack_fetch( uri )
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
			if( !uri ) return ''

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
		 * Class declarations, base first.
		 *
		 * `class $A extends $[ '$B' ]` resolves its base at definition time, and
		 * `$mol_view_tree2_to_js` emits declarations in source order. A subclass
		 * written above its base would inherit the PREVIOUS version of it, once
		 * per rebuild, without a word.
		 */
		classes_sorted( defs: readonly $mol_tree2[] ): readonly $mol_tree2[] {

			const by_name = new Map< string, $mol_tree2 >()
			for( const def of defs ) by_name.set( def.type, def )

			const sorted = [] as $mol_tree2[]
			const done = new Set< string >()
			const path = new Set< string >()

			const walk = ( def: $mol_tree2 ) => {

				if( done.has( def.type ) ) return
				if( path.has( def.type ) ) this.$.$mol_fail(
					new Error( `Circular inheritance around ${ def.type }` )
				)

				path.add( def.type )

				const base = by_name.get( def.kids[0]?.type ?? '' )
				if( base && base !== def ) walk( base )

				path.delete( def.type )
				done.add( def.type )
				sorted.push( def )

			}

			for( const def of defs ) walk( def )

			return sorted
		}

		/** Normalized and topologically sorted declarations of the document. */
		@ $mol_mem
		doc_tree() {

			const src = this.assets_apply( this.doc_src() ).replace( /\n?$/, '\n' )

			const defs = this.$.$mol_view_tree2_normalize(
				this.$.$mol_tree2_from_string( src, 'vmap.view.tree' )
			)

			return defs.clone( this.classes_sorted( defs.kids ) )
		}

		/**
		 * Applies the decorators studio applies in `source_js_decorators()`.
		 *
		 * A decorator cannot be written inside the string handed to
		 * `new Function`, so it goes as a separate expression after the class.
		 * An undecorated property has no atom, hence no subscribers, hence the
		 * hot swap of stage 4.3 cannot wake anything: the method would return a
		 * new value while the DOM keeps the old one.
		 */
		decorators( self: $mol_tree2, js: string ) {

			const cls = JSON.stringify( self.type )
			const list = [] as string[]

			for( const prop of self.kids[0]?.kids ?? [] ) {

				const { name, key, next } = this.$.$mol_view_tree2_prop_parts( prop )
				if( !key && !next ) continue
				if( !this.js_defines( js, name ) ) continue

				list.push( `( $.$mol_mem${ key ? '_key' : '' }( $[ ${ cls } ].prototype, ${ JSON.stringify( name ) } ) );` )

			}

			return list.join( '\n' )
		}

		/**
		 * Studio asks for an explicit marker comment. A plain method definition
		 * counts here as well, because a body written without markers would lose
		 * memoization silently, and silence is exactly what this must not do.
		 */
		js_defines( js: string, name: string ) {
			if( js.includes( `/${ '*' }${ name }${ '*' }/` ) ) return true
			return new RegExp( `(^|[^\\w.$])${ name }\\s*\\(`, 'm' ).test( js )
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
		code() {

			const root = this.doc_root()
			if( !class_name_ok.test( root ) ) this.$.$mol_fail(
				new Error( `Root class name ${ JSON.stringify( root ) } is not an identifier` )
			)

			const tree = this.doc_tree()

			if( !tree.kids.some( def => def.type === root ) ) this.$.$mol_fail(
				new Error( `Class ${ root } is not declared by the document` )
			)

			const bodies = this.doc_js()
			const chunks = [] as string[]

			for( const def of tree.kids ) {

				const name = def.type
				if( !class_name_ok.test( name ) ) this.$.$mol_fail(
					new Error( `Class name ${ JSON.stringify( name ) } is not an identifier` )
				)

				// Every chunk starts with a semicolon: the generated code opens
				// with a parenthesis, and without one ASI glues it onto the
				// previous line into `$( … )` with `$ is not a function`.
				chunks.push( ';' + this.$.$mol_tree2_text_to_string_mapped_js(
					this.$.$mol_tree2_js_to_text(
						this.$.$mol_view_tree2_to_js( tree.clone([ def ]) )
					)
				) )

				const js = bodies[ name ]
				if( !js ) continue

				const cls = JSON.stringify( name )

				// The class is named. An anonymous one drops `dom_name()` to
				// `div` and gives every sub view a bare `_echo`, the same one in
				// every document.
				chunks.push(
					`;$[ ${ cls } ] = class ${ name } extends $[ ${ cls } ] {`,
					js,
					'}',
					';' + this.decorators( def, js ) + ';',
				)

			}

			return chunks.join( '\n' )
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

			new Function( '$', code )( sandbox )

			const Root = Reflect.get( sandbox, root ) as typeof $mol_view | undefined
			if( typeof Root !== 'function' ) this.$.$mol_fail(
				new Error( `Class ${ root } is not registered by the compiled code` )
			)

			return { Root: Root! }
		}

		/**
		 * The live root instance.
		 *
		 * A failed rebuild returns the previous instance, so the value does not
		 * change, no subscriber is woken and the living component stays whole,
		 * caret and focus included. The failure travels to the host as an
		 * `error` message instead of taking the page down.
		 */
		@ $mol_mem
		instance(): $mol_view | null {

			const src = this.doc_src()
			const root = this.doc_root()

			if( !src.trim() || !root ) {
				this.compile_error = ''
				this.instance_live = null
				return null
			}

			try {

				// First read of the body, and it suspends: an `@ $mol_action`
				// style rule that holds here for the same reason. Everything
				// below defines classes, and a class picks its base once — a
				// document compiled a moment too early inherits the scene's own
				// `$mol_view` and no later load can move it.
				this.pack_ready()

				const Root = this.build().Root
				const made = Root.make({ $: this.sandbox() })

				// Before anything reads `dom_tree()`, so the first paint is already
				// culled and a thousand node document never builds a thousand nodes.
				this.cull_attach( made )

				this.compile_error = ''
				this.instance_live = made

				return made

			} catch( error: unknown ) {

				if( this.$.$mol_promise_like( error ) ) return this.$.$mol_fail_hidden( error )

				this.compile_error = String( ( error as Error )?.message ?? error )

				return this.instance_live
			}

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
		 * Swaps `asset:` for `blob:`.
		 *
		 * The bytes arrive over the bridge and the URL is made here: a `blob:`
		 * URL minted by the host belongs to the host origin and simply does not
		 * open in an opaque one. An id with no bytes yet is left in place and
		 * queued for a lazy request.
		 */
		assets_apply( text: string ) {

			const known = this.assets()

			return text.replace( asset_ref, ( whole, id: string ) => {
				const uri = known[ id ]
				if( uri ) return uri
				this.assets_missing.add( id )
				return whole
			} )

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

				case 'css_set': this.doc_css( message.css ); return

				case 'spots_set': this.spots( message.spots ); return

				case 'camera_set': this.camera( message.camera ); return

				case 'mode_set': this.mode( message.mode ); return

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
					this.assets_missing.delete( message.id )

					if( stale ) URL.revokeObjectURL( stale )

					return
				}

			}

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
		 */
		@ $mol_mem
		resize_watch() {

			const made = this.instance()
			if( !made ) return null

			const observer = new ResizeObserver( () => this.report_send() )
			observer.observe( made.dom_node() )

			return { destructor: () => observer.disconnect() }
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
			// Placement moves nodes without resizing the root, so the observer of
			// `resize_watch()` never fires on it and the host would keep boxes of
			// the previous layout.
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

			for( const id of this.assets_missing ) {
				if( this.assets_asked.has( id ) ) continue
				this.assets_asked.add( id )
				this.post({ kind: 'asset_want', id })
			}

			this.error_post( 'compile', this.compile_error )

			const sizes = made ? this.sizes_of( made ) : {}
			this.sizes_remember( sizes )
			this.post({ kind: 'sizes', sizes })

			this.error_post( 'runtime', made ? this.render_error( made ) : '' )

		}

		/**
		 * Keeps the boxes of the free parts for the next culling round.
		 *
		 * Merged, never replaced: what is missing from a report is not a part without
		 * a size, it is a part that was not drawn, and culling is what did that. A
		 * replacing write would erase the box of everything just culled and the rule
		 * would start judging by placement points alone — which is the very state it
		 * only tolerates until the first measurement.
		 *
		 * Only the direct children of the root are kept, the same set `shown()` judges:
		 * one path segment is exactly one free part.
		 */
		sizes_remember( sizes: { readonly [ node: string ]: $bog_vmap_bridge_rect } ) {

			const prefix = this.doc_root() + '/'

			for( const key of Object.keys( sizes ) ) {
				if( !key.startsWith( prefix ) ) continue
				const name = key.slice( prefix.length )
				if( name.includes( '/' ) ) continue
				this.sizes_seen[ name ] = sizes[ key ]
			}

		}

		/**
		 * The failure of the last render, or an empty string when there is none.
		 *
		 * The root node carries its own failure, and `querySelector` never
		 * matches the element it is called on. A document whose root render
		 * throws is exactly the common case, so it is checked first.
		 */
		render_error( made: $mol_view ) {

			const node = made.dom_node()
			const failed = node.hasAttribute( 'mol_view_error' )
				? node
				: node.querySelector( '[mol_view_error]' )

			const broken = failed?.getAttribute( 'mol_view_error' )
			if( !broken || broken === 'Promise' || broken === '$mol_promise_blocker' ) return ''

			// The attribute holds only the error name; $mol puts the message
			// itself into the text of the node.
			const text = ( failed!.textContent ?? '' ).replace( /\s+/g, ' ' ).trim().slice( 0, 500 )

			return text ? `${ broken }: ${ text }` : broken
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
		error_post( at: 'compile' | 'runtime', message: string ) {

			const next = message || null

			if( this.error_sent[ at ] === next ) return
			this.error_sent[ at ] = next

			this.post({ kind: 'error', at, message: next })
		}

		/**
		 * Geometry of the document, in world units.
		 *
		 * Divided by the zoom, because the host owns the camera and thinks in
		 * world coordinates; the scene only reports what the layout came out to.
		 */
		sizes_of( root: $mol_view ) {

			const sizes = {} as { [ node: string ]: $bog_vmap_bridge_rect }
			const zoom = this.camera().zoom || 1
			const base = root.dom_node().getBoundingClientRect()

			const put = ( key: string, view: $mol_view ) => {

				const node = view.dom_node()
				if( !node.isConnected ) return

				const box = node.getBoundingClientRect()

				sizes[ key ] = {
					x: ( box.left - base.left ) / zoom,
					y: ( box.top - base.top ) / zoom,
					width: box.width / zoom,
					height: box.height / zoom,
				}

			}

			const walk = ( view: $mol_view, path: string, depth: number ) => {

				if( depth > 16 ) return

				let kids = [] as readonly $mol_view_content[]
				try {
					kids = view.sub() ?? []
				} catch {
					return
				}

				let index = 0

				for( const kid of kids ) {

					if( !this.view_like( kid ) ) continue

					const key = path + '/' + ( this.view_prop( kid ) || index )
					index ++

					put( key, kid )
					walk( kid, key, depth + 1 )

				}

			}

			const root_key = this.doc_root()
			put( root_key, root )
			walk( root, root_key, 0 )

			return sizes
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
				this.screen_listener(),
			]
		}

	}

}
