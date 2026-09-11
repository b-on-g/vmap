namespace $.$$ {

	const style_scope = 'bog_vmap_scene:'

	const spots_id = 'bog_vmap_spots:stage'

	const libs_id = 'bog_vmap_libs:stage'

	const spot_name_ok = /^[a-zA-Z_]\w*$/

	const cull_slack_min = 400

	const class_name_ok = /^\$[a-zA-Z][\w$]*$/

	type mounted = {
		readonly made: $mol_view | null
		readonly pack: string
		readonly root: string
		readonly supers: { readonly [ klass: string ]: string }
		readonly error: string
		readonly klass: string
	}

	const unmounted: mounted = { made: null, pack: '', root: '', supers: {}, error: '', klass: '' }

	export class $bog_vmap_scene extends $.$bog_vmap_scene {

		@ $mol_mem_key
		error_sent( at: 'compile' | 'runtime' | 'pack', next?: string | null ): string | null {
			return next === undefined ? null : next
		}

		@ $mol_mem
		doc_src( next?: string ) {
			return next ?? ''
		}

		@ $mol_mem
		doc_root( next?: string ) {
			return next ?? ''
		}

		@ $mol_mem
		doc_js( next?: { readonly [ klass: string ]: string } ): { readonly [ klass: string ]: string } {
			return next ?? {}
		}

		@ $mol_mem
		doc_css( next?: string ) {
			return next ?? ''
		}

		@ $mol_mem
		spots( next?: { readonly [ node: string ]: { readonly x: number, readonly y: number } } ) {
			return next ?? {} as { readonly [ node: string ]: { readonly x: number, readonly y: number } }
		}

		@ $mol_mem
		sizes_seen( next?: { readonly [ name: string ]: $bog_vmap_scene_cull_box } ) {
			return next ?? {}
		}

		screen() {
			const rect = this.view_rect()
			return rect && { width: rect.width, height: rect.height }
		}

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

		cull_attach( made: $mol_view ) {

			Object.defineProperty( made, 'sub_visible', {
				configurable: true,
				writable: true,
				value: ()=> this.sub_shown( made.sub() ?? [] ),
			} )

		}

		@ $mol_mem
		camera( next?: $bog_vmap_bridge_camera ): $bog_vmap_bridge_camera {
			return next ?? { x: 0, y: 0, zoom: 1 }
		}

		@ $mol_mem
		grid_shift() {
			const { x, y, zoom } = this.camera()
			return new this.$.$mol_vector_2d( -x * zoom, -y * zoom )
		}

		@ $mol_mem
		grid_scale() {
			const zoom = this.camera().zoom
			return new this.$.$mol_vector_2d( zoom, zoom )
		}

		override camera_transform() {
			const { x, y, zoom } = this.camera()
			return `translate(${ -x * zoom }px,${ -y * zoom }px) scale(${ zoom })`
		}

		@ $mol_mem
		pack_uri( next?: string ) {
			return next ?? ''
		}

		@ $mol_mem
		importer() {
			const importer = this.$.$mol_import
			return { script: ( uri: string )=> importer.script( uri ) }
		}

		@ $mol_mem
		pack_ready() {

			const uri = this.pack_uri()
			if( !uri ) return uri

			this.importer().script( uri )

			this.$.$mol_try = handler => {
				try { return handler() } catch( error ) { return error as Error }
			}

			return uri
		}

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

		@ $mol_mem
		pack_task() {
			const note = this.pack_note()
			return new this.$.$mol_after_timeout( 60, ()=> this.error_post( 'pack', note, '' ) )
		}

		@ $mol_mem
		sandbox() {

			const host = this.$
			const sandbox: typeof host = Object.create( host )
			Object.defineProperty( sandbox, '$', { value: sandbox, writable: true, configurable: true } )

			return sandbox
		}

		@ $mol_mem
		libs( next?: readonly $bog_vmap_bridge_part[] ): readonly $bog_vmap_bridge_part[] {
			return next ?? []
		}

		@ $mol_mem
		libs_parsed() {

			const defs = [] as $mol_tree2[]
			const js = {} as { [ klass: string ]: string }

			for( const part of this.libs() ) {

				const src = part.tree.replace( /\n?$/, '\n' )

				const kids = this.$.$mol_view_tree2_normalize(
					this.$.$mol_tree2_from_string( src, 'lib.view.tree' )
				).kids

				defs.push( ... kids )

				const name = kids[ 0 ]?.type
				if( name && part.js ) js[ name ] = part.js

			}

			return { defs: defs as readonly $mol_tree2[], js: js as { readonly [ klass: string ]: string } }
		}

		@ $mol_mem
		doc_tree() {

			const src = this.doc_src().replace( /\n?$/, '\n' )

			const defs = this.$.$mol_view_tree2_normalize(
				this.$.$mol_tree2_from_string( src, 'vmap.view.tree' )
			)

			return defs.clone( this.$.$bog_vmap_scene_order( this.libs_parsed().defs, defs.kids ) )
		}

		@ $mol_mem
		supers() {

			const map = {} as { [ klass: string ]: string }
			for( const def of this.doc_tree().kids ) map[ def.type ] = def.kids[0]?.type ?? ''

			return map as { readonly [ klass: string ]: string }
		}

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
					this.$.$mol_fail( this.fault_named( error as Error, name ) )
				}

			}

			return parts as readonly { readonly klass: string, readonly js: string }[]
		}

		@ $mol_mem
		code() {
			return this.code_parts().map( part => part.js ).join( '\n' )
		}

		fault_named( error: Error, klass: string ) {
			return Object.assign( error, { klass } )
		}

		class_code( tree: $mol_tree2, def: $mol_tree2, js: string | undefined ) {

			const name = def.type
			const chunks = [] as string[]

			chunks.push( ';' + this.$.$mol_tree2_text_to_string_mapped_js(
				this.$.$mol_tree2_js_to_text(
					this.$.$mol_view_tree2_to_js( tree.clone([ def ]) )
				)
			) )

			if( !js ) return chunks

			const cls = JSON.stringify( name )

			chunks.push(
				`;$[ ${ cls } ] = class ${ name } extends $[ ${ cls } ] {`,
				js,
				'}',
				';' + this.cells_code( def ) + ';',
			)

			return chunks
		}

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

		@ $mol_mem
		mount(): mounted {

			const prev = $mol_wire_probe( ()=> this.mount() ) ?? unmounted

			const src = this.doc_src()
			const root = this.doc_root()

			const pack = this.pack_uri()

			if( !src.trim() || !root || !pack ) return unmounted

			try {

				this.pack_ready()

				const Root = this.build().Root
				const supers = this.supers()

				if( this.identity_kept( prev, pack, root, supers ) ) {

					this.$.$bog_vmap_scene_swap(
						prev.made!,
						name => Reflect.get( this.sandbox(), name ),
						name => this.shapes()[ name ] ?? null,
					)

					return { ... prev, supers: { ... prev.supers, ... supers }, error: '', klass: '' }
				}

				const made = Root.make({ $: this.sandbox() })

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

		@ $mol_mem
		instance(): $mol_view | null {
			return this.mount().made
		}

		@ $mol_mem
		compile_error() {
			return this.mount().error
		}

		@ $mol_mem
		compile_class() {
			return this.mount().klass
		}

		@ $mol_mem
		css_attach() {

			const root = this.doc_root()
			const css = this.doc_css()

			const id = root && style_scope + root
			this.styles_sweep( id )

			if( !id ) return null

			return this.$.$mol_style_attach( id, css )
		}

		@ $mol_mem
		spots_attach() {
			return this.$.$mol_style_attach( spots_id, this.spots_css() )
		}

		@ $mol_mem
		libs_css_attach() {
			const css = this.libs().map( part => part.css ).filter( Boolean ).join( '\n' )
			return this.$.$mol_style_attach( libs_id, css )
		}

		spots_css() {

			const attr = this.doc_root().replace( /^\$/, '' )
			if( !attr || !class_name_ok.test( this.doc_root() ) ) return ''

			const rules = [ `[${ attr }] { position: relative !important; }` ]

			for( const [ name, spot ] of Object.entries( this.spots() ) ) {

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

		@ $mol_mem
		override theme( next?: string | null ): string | null {
			return next ?? null
		}

		scheme() {
			return this.theme()?.includes( 'light' ) ? 'light' : 'dark'
		}

		@ $mol_mem
		scheme_attach() {
			const scheme = this.scheme()
			this.$.$mol_dom_context.document.documentElement.style.colorScheme = scheme
			return scheme
		}

		@ $mol_mem
		override stage(): readonly $mol_view_content[] {

			this.css_attach()

			this.spots_attach()
			this.libs_css_attach()

			if( this.pack_note() ) return [ this.Wait() ]

			const made = this.instance()
			return made ? [ made.dom_tree() ] : []
		}

		post( message: $bog_vmap_bridge_up ) {
			this.$.$bog_vmap_bridge_send( this.peer(), message )
		}

		@ $mol_mem
		values_wanted( next?: readonly string[] ): readonly string[] {
			return next ?? []
		}

		@ $mol_mem
		values_at( next?: number ) {
			return next ?? 0
		}

		values_period() {
			return 250
		}

		now() {
			return Date.now()
		}

		@ $mol_mem
		values_task() {

			const names = this.values_wanted()
			if( !names.length ) return null

			const made = this.instance()
			if( !made ) return null

			const values = this.$.$bog_vmap_scene_values( made, names )
			const sent_at = $mol_wire_probe( ()=> this.values_at() ) ?? 0
			const wait = Math.max( 0, this.values_period() - ( this.now() - sent_at ) )

			return new this.$.$mol_after_timeout( wait, () => {
				this.values_at( this.now() )
				this.post({ kind: 'values', values })
			} )
		}

		peer() {
			return this.$.$mol_dom_context.parent
		}

		message_receive( event?: MessageEvent ) {

			if( !event ) return

			const message = this.$.$bog_vmap_bridge_read< $bog_vmap_bridge_down >( event, this.peer() )
			if( !message ) return

			switch( message.kind ) {

				case 'doc_set': {

					this.doc_root( message.root )
					this.doc_src( message.src )

					const bodies = message.js
					this.doc_js( bodies && typeof bodies === 'object' ? bodies : {} )

					return
				}

				case 'pack_set': this.pack_uri( String( message.uri ?? '' ) ); return

				case 'theme_set': this.theme( String( message.theme ?? '' ) ); return

				case 'css_set': this.doc_css( message.css ); return

				case 'libs_set': this.libs( Array.isArray( message.parts ) ? message.parts : [] ); return

				case 'spots_set': this.spots( message.spots ); return

				case 'camera_set': this.camera( message.camera ); return

				case 'values_want': this.values_wanted( Array.isArray( message.names ) ? message.names.map( String ) : [] ); return

				case 'click_at': {

					this.click_apply( message.x, message.y, message.mods )

					this.report_send()

					return
				}

				case 'ping': this.post({ kind: 'pong', nonce: message.nonce }); return

			}

		}

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

		@ $mol_mem
		key_listener() {
			return new this.$.$mol_dom_listener(
				this.$.$mol_dom_context,
				'keydown',
				$mol_wire_async( this ).key_relay,
			)
		}

		key_relay( event?: KeyboardEvent ) {
			if( event?.key !== 'Escape' ) return
			this.post({ kind: 'key', key: 'Escape' })
		}

		@ $mol_mem
		resize_watch() {

			const observer = new ResizeObserver( () => this.report_send() )

			return { observer, destructor: () => observer.disconnect() }
		}

		resize_seen = new Set< Element >()

		resize_sync( nodes: readonly Element[] ) {

			this.resize_seen = this.$.$bog_vmap_scene_measure_watch(
				this.resize_watch().observer,
				this.resize_seen,
				nodes,
			)

		}

		@ $mol_mem
		report_task() {

			this.doc_src()
			this.doc_root()
			this.doc_js()
			this.doc_css()
			this.libs()
			this.spots()
			this.camera()

			const made = this.instance()
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

		render_error( made: $mol_view ) {

			const found = this.$.$bog_vmap_scene_seek(
				made,
				this.walk_of( made ),
				view => this.view_broken( view ) !== '',
			)

			if( !found ) return { message: '', node: '' }

			return { message: this.view_broken( found.view ), node: this.part_of( found.path ) }
		}

		part_of( path: string ) {

			const prefix = this.doc_root() + '/'
			if( !path.startsWith( prefix ) ) return ''

			return path.slice( prefix.length ).split( '/' )[ 0 ] ?? ''
		}

		view_broken( view: $mol_view ) {

			let node: Element
			try { node = view.dom_node() } catch { return '' }

			const broken = node.getAttribute( 'mol_view_error' )
			if( !broken || broken === 'Promise' || broken === '$mol_promise_blocker' ) return ''

			const text = ( node.textContent ?? '' ).replace( /\s+/g, ' ' ).trim().slice( 0, 500 )

			return text ? `${ broken }: ${ text }` : broken
		}

		class_node( made: $mol_view, klass: string ) {

			if( !klass ) return ''

			if( klass === this.doc_root() ) return ''

			const found = this.$.$bog_vmap_scene_seek(
				made,
				this.walk_of( made ),
				view => ( view.constructor as { name?: string } )?.name === klass,
			)

			return found ? this.part_of( found.path ) : ''
		}

		walk_of( made: $mol_view ) {
			return {
				key: this.doc_root(),
				view_of: ( kid: unknown )=> this.view_like( kid ) ? kid : null,
				kids_of: ( view: $mol_view )=> { try { return view.sub() ?? [] } catch { return [] } },
				prop_of: ( view: $mol_view )=> this.view_prop( view ),
			}
		}

		error_post( at: 'compile' | 'runtime' | 'pack', message: string, node: string ) {

			const next = message || null

			if( ( $mol_wire_probe( ()=> this.error_sent( at ) ) ?? null ) === next ) return
			this.error_sent( at, next )

			this.post({ kind: 'error', at, message: next, node })
		}

		sizes_of( root: $mol_view ) {

			return this.$.$bog_vmap_scene_measure( root, {
				... this.walk_of( root ),
				zoom: this.camera().zoom,
			} )
		}

		view_like( kid: unknown ): kid is $mol_view {
			return typeof ( kid as { dom_node?: unknown } | null )?.dom_node === 'function'
		}

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
				this.key_listener(),
				this.resize_watch(),
				this.boot(),
				this.pack_task(),
				this.report_task(),
				this.values_task(),
				this.scheme_attach(),
			]
		}

	}

}
