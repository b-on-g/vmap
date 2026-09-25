namespace $.$$ {
	export class $bog_vmap_app extends $.$bog_vmap_app {
		page_uri() {
			return this.$.$mol_dom_context.location?.href ?? ''
		}

		override scene_bundle() {
			const page = this.page_uri()
			return page ? this.$.$bog_vmap_lib_sibling( page, 'scene' ) + 'web.js' : super.scene_bundle()
		}

		override pack_script() {
			return this.Lib().script_link()
		}

		override scene_restart() {
			this.Pane().scene_restart()
		}

		override zoom_title() {
			return this.Pane().zoom_title()
		}

		override zoom_in() {
			this.Pane().zoom_in()
		}

		override zoom_out() {
			this.Pane().zoom_out()
		}

		override camera_reset() {
			this.Pane().camera_reset()
		}

		override zoom_full() {
			return this.Pane().zoom_full()
		}

		@ $mol_action
		override pack_default() {
			this.links( this.links_parsed().lands.join( ', ' ) )
			this.Pane().scene_restart()
			return null
		}

		override pack_stalled() {
			return Boolean( this.Pane().pack_note() )
		}

		@ $mol_mem
		override stall_content() {
			return [
				this.Stall_note(),
				... this.pack_stalled() ? [ this.Stall_pack() ] : [],
				this.Stall_reload(),
			]
		}

		stalled() {
			return this.Pane().stalled()
		}

		override stall_note() {
			const pack = this.Pane().pack_note()

			if( pack ) {
				return `${ pack } — библиотека компонентов так и не ответила.`
					+ ' Адрес взят из поля полки. Если он остался от локального стенда,'
					+ ' верните пак по умолчанию: он лежит рядом со страницей редактора.'
			}

			if( !this.Pane().warmed() ) {
				return 'Сцена не запустилась. Если код в панели уже исправлен — нажмите'
					+ ' «Перезагрузить сцену» ещё раз. Если нет — сначала исправьте код:'
					+ ' он исполнится снова в любом новом кадре и после перезагрузки страницы.'
			}

			return 'Сцена не отвечает. Скорее всего её остановил код документа: он исполняется'
				+ ' в песочнице и делит с ней поток. Редактор и документ целы.'
		}

		override doc_root() {
			return this.$.$bog_vmap_app_store_class_name( this.doc_source() )
				|| this.doc_root_default()
		}

		doc_root_default() {
			return '$' + 'my_site_page'
		}

		doc_source_initial() {
			return `${ this.doc_root_default() } $mol_view\n\tsub /\n`
		}

		demo_host() {
			try {
				return new URL( this.page_uri() ).hostname
			} catch( error: unknown ) {
				return ''
			}
		}

		demo_local() {

			const host = this.demo_host()
			if( !host ) return false

			if( [ 'localhost', '127.0.0.1', '::1', '[::1]' ].includes( host ) ) return true
			if( host.endsWith( '.local' ) ) return true

			return /^(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.|198\.1[89]\.)/.test( host )
		}

		demo_wanted( store: $bog_vmap_app_store ) {
			return this.demo_local() && store.doc_links().length === 0
		}

		@ $mol_action
		demo_first( store: $bog_vmap_app_store ) {

			if( store.doc_current() ) return

			if( !this.demo_wanted( store ) ) {
				store.doc_add( store.title_next(), store.draft_source(), store.draft_spots(), store.draft_pack() )
				return
			}

			const doc = store.doc_add( this.$.$bog_vmap_app_demo_title, this.$.$bog_vmap_app_demo_source )

			store.node_js( doc, this.$.$bog_vmap_app_demo_root, this.$.$bog_vmap_app_demo_js )
			store.node_css( doc, this.$.$bog_vmap_app_demo_root, this.$.$bog_vmap_app_demo_css )

		}

		@ $mol_mem
		override store() {

			const store: $bog_vmap_app_store = this.$.$bog_vmap_app_store.make({
				$: this.$,
				doc_first: ()=> this.demo_first( store ),
			})

			return store
		}

		doc_source( next?: string ) {
			const store = this.store()
			if( next !== undefined ) return store.source( next )

			return store.source() || this.doc_source_initial()
		}

		node() {
			return this.doc_model().node( this.doc_root() )
		}

		override doc_src() {
			return this.doc_source()
		}

		override spots( next?: { readonly [ name: string ]: { readonly x: number, readonly y: number } } ) {
			return this.store().spots( next )
		}

		override links( next?: string ) {
			const store = this.store()
			if( next !== undefined ) return store.pack( next ) || super.links()

			return this.store_links() || super.links()
		}

		store_links() {
			try {
				return this.store().pack()
			} catch( error ) {
				if( $mol_promise_like( error ) ) return ''
				return $mol_fail_hidden( error )
			}
		}

		store_stage() {
			try {
				return this.store().stage()
			} catch( error ) {
				if( $mol_promise_like( error ) ) return 'loading'
				return $mol_fail_hidden( error )
			}
		}

		override doc_pending() {
			const stage = this.store_stage()
			return stage === 'loading' || stage === 'making'
		}

		override doc_readonly() {
			return this.store_stage() === 'readonly'
		}

		override editable() {
			return !this.doc_readonly()
		}

		override readonly_badge() {
			return this.doc_readonly() ? this.Readonly() : null
		}

		override head() {
			return super.head().filter( Boolean )
		}

		store_note() {
			if( this.doc_pending() ) return 'Документ загружается…'
			return this.doc_readonly() ? 'чужая сцена: только просмотр, правки не сохраняются' : ''
		}

		store_boot() {
			try {
				return this.store().boot()
			} catch( error ) {
				if( $mol_promise_like( error ) ) return 'loading'
				return $mol_fail_hidden( error )
			}
		}

		override picked( next?: readonly string[] ): readonly string[] {
			const key = this.doc_key()
			if( next !== undefined && !$mol_compare_deep( next, this.picked_at( key ) ) ) {
				this.entered( null )
				this.inner( '' )
			}
			return this.picked_at( key, next )
		}

		override inner( next?: string ): string {
			const now = this.inner_in_doc()
			return next === undefined ? now : this.inner_in_doc( next )
		}

		@ $mol_mem
		inner_in_doc( next?: string ) {
			this.doc_key()
			return next ?? ''
		}

		inner_node() {
			const inner = this.inner()
			return inner.slice( 0, inner.indexOf( '/' ) )
		}

		inner_prop() {
			const inner = this.inner()
			return inner.slice( inner.lastIndexOf( '/' ) + 1 )
		}

		node_class( name: string ) {
			const value = name ? this.node().prop_decl( name )?.kids[ 0 ] : null
			return value && $mol_view_tree2_class_match( value ) ? value.type : ''
		}

		@ $mol_mem_key
		override inner_kids( key: string ): readonly string[] {
			try {
				return this.Lib().inner_kids( key )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return []
			}
		}

		@ $mol_mem_key
		override inner_class( key: string ) {
			try {
				return this.Lib().inner_class( key )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return ''
			}
		}

		@ $mol_mem_key
		override inner_alien( key: string ) {
			try {
				return this.Lib().inner_alien( key )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return false
			}
		}

		inner_route() {
			const chain = this.inner().split( '/' )
			return [ this.node_class( chain[ 0 ] ), ... chain.slice( 1 ) ].join( '/' )
		}

		inner_foreign() {
			return Boolean( this.inner() ) && this.inner_alien( this.inner_route() )
		}

		inner_step() {
			return this.Lib().inner_step( this.inner_route() )
		}

		inner_decl() {

			const step = this.inner_step()
			const decl = step ? this.Lib().props_map( step.declared ).get( step.prop ) ?? null : null

			if( !decl ) return this.$.$mol_fail(
				new Error( `Внутренний слой ${ this.inner() } не найден в классе детали` )
			)

			return decl
		}

		node_editable() {
			return this.editable() && !this.inner_foreign()
		}

		inner_foreign_note() {

			const step = this.inner_step()
			if( !step ) return ''

			return `Слой ${ step.prop } пришёл из вложенного компонента ${ step.declared }.`
				+ ` Отсюда он только виден: правится он у своего класса, а деталь его не объявляет,`
				+ ` поэтому переопределить его из документа нельзя.`
		}

		inner_name() {
			const node = this.node()
			return node.inner_ref( this.inner_node(), this.inner_prop() )
				|| node.inner_name( this.inner_node(), this.inner_prop() )
		}

		@ $mol_action
		inner_held() {
			const node = this.node()
			return node.inner_ref( this.inner_node(), this.inner_prop() )
				|| node.inner_bind( this.inner_node(), this.inner_prop(), this.inner_decl() )
		}

		inner_source( next?: string ): string {

			if( this.inner_foreign() ) {
				if( next !== undefined ) return this.$.$mol_fail( new Error( this.inner_foreign_note() ) )
				return this.inner_decl().toString()
			}

			const node = this.node()
			const held = node.inner_ref( this.inner_node(), this.inner_prop() )

			if( next === undefined ) {

				if( !held ) return this.$.$bog_vmap_lang_inner_tree(
					this.inner_node(), this.inner_name(), this.inner_decl(),
				).toString()

				return node.props_tree().select( node.prop_fullname( held ) ).kids[ 0 ]?.toString() ?? ''
			}

			const parsed = this.$.$mol_tree2_from_string(
				next.replace( /\n?$/, '\n' ), 'vmap.view.tree',
			).kids[ 0 ]

			if( parsed ) node.prop_tree( this.inner_held(), parsed )

			return next
		}

		override doc_key() {
			return this.store().doc_current()?.link().str ?? ''
		}

		@ $mol_mem_key
		picked_at( key: string, next?: readonly string[] ): readonly string[] {
			return next ?? []
		}

		override entered( next?: string | null ) {
			const now = this.entered_in_doc()
			return next === undefined ? now : this.entered_in_doc( next )
		}

		@ $mol_mem
		entered_in_doc( next?: string | null ) {
			this.doc_key()
			return next ?? null
		}

		override selected( next?: string | null ): string | null {
			if( next !== undefined ) {
				this.picked( next ? [ next ] : [] )
				return next
			}

			const picked = this.picked()
			return picked.length ? picked[ picked.length - 1 ] : null
		}

		override delete_enabled() {
			return this.editable() && !this.inner() && Boolean( this.selected() )
		}

		override publish_part() {
			return this.selected() ?? ''
		}

		@ $mol_mem
		doc_model() {
			return this.$.$bog_vmap_lang_doc.make({
				$: this.$,
				source: ( next?: string )=> this.doc_source( next ),
			})
		}

		class_js( klass: string, next?: string ): string {
			const store = this.store()
			const doc = store.doc_current()

			if( !doc ) return this.draft_js( klass, next )
			if( next !== undefined && !doc.can_change() ) return store.node_js( doc, klass )

			return store.node_js( doc, klass, next )
		}

		class_css( klass: string, next?: string ): string {
			const store = this.store()
			const doc = store.doc_current()

			if( !doc ) return this.draft_css( klass, next )
			if( next !== undefined && !doc.can_change() ) return store.node_css( doc, klass )

			return store.node_css( doc, klass, next )
		}

		@ $mol_mem_key
		draft_js( klass: string, next?: string ) {
			return next ?? ''
		}

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

		@ $mol_mem
		override doc_js() {
			const bodies = {} as { [ klass: string ]: string }

			for( const name of this.doc_model().names() ) {
				const js = this.class_js( name )
				if( js ) bodies[ name ] = js
			}

			return bodies
		}

		@ $mol_mem
		override doc_css() {
			return this.doc_model().names()
				.map( name => this.class_css( name ) )
				.filter( Boolean )
				.join( '\n\n' )
		}

		export_nodes(): readonly $bog_vmap_app_export_node[] {
			const doc = this.doc_model()

			return doc.names().map( name => ({
				source: doc.class_source( name ),
				js: this.class_js( name ),
				css: this.class_css( name ),
			}) )

		}

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
				if( this.$.$mol_promise_like( error ) ) return { module: null, refusal: '' }
				return { module: null, refusal: String( ( error as Error )?.message ?? error ) }
			}

		}

		assets_pending() {
			return this.store().assets_pending()
		}

		assets_note() {

			try {
				var pending = this.assets_pending().length
			} catch( error: unknown ) {
				if( this.$.$mol_promise_like( error ) ) return ''
				return $mol_fail( error )
			}

			if( !pending ) return ''

			const total = this.store().asset_links().length

			return `ассеты ещё уходят на сервер: ${ total - pending } из ${ total }`
		}

		override export_ready() {
			return Boolean( this.export_state().module )
		}

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

			const note = this.assets_note()
			if( note ) return `Скачать можно, но ${ note }`

			return `${ module.files.length } файлов модуля ${ module.path }.`
				+ ` Распаковать в корень MAM и собрать «npx mam ${ module.path }»`

		}

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

		export_notes(): readonly string[] {
			const refusal = this.export_state().refusal
			return refusal ? refusal.split( '\n' ).filter( Boolean ) : []
		}

		export_rows() {
			return this.export_notes().map( ( _, index )=> this.Export_row( index ) )
		}

		@ $mol_mem_key
		override export_text( index: number ) {
			return this.export_notes()[ index ] ?? ''
		}

		code_prop() {
			if( this.inner_foreign() ) return this.inner_prop()
			if( this.inner() ) return this.inner_name()
			return this.selected() ?? ''
		}

		code_node_note() {

			const inner = this.inner()
			if( !inner ) return ''

			if( this.inner_foreign() ) return this.inner_foreign_note()

			if( this.node().inner_ref( this.inner_node(), this.inner_prop() ) ) return ''

			return `Слой ${ this.inner_prop() } взят из класса детали ${ this.inner_node() },`
				+ ` в документе его ещё нет. Правка заведёт узел ${ this.inner_name() }`
				+ ` и сошлётся на него из блока детали; класс детали останется как был.`
		}

		@ $mol_mem
		override code_whole( next?: boolean ) {
			return next ?? false
		}

		code_class() {
			const name = this.selected()
			if( !name ) return this.doc_root()

			const klass = this.node().prop_decl( name )?.kids[ 0 ]
			if( !klass || !$mol_view_tree2_class_match( klass ) ) return this.doc_root()

			return this.doc_model().names().includes( klass.type ) ? klass.type : this.doc_root()
		}

		code_klass() {
			return this.code_whole() ? this.code_class() : this.doc_root()
		}

		override code_source( next?: string ) {
			const doc = this.doc_model()
			const klass = this.code_klass()

			if( next === undefined ) return doc.class_source( klass )

			const before = doc.names()
			const after = this.class_names_after( klass, next )

			const gone = before.filter( name => !after.includes( name ) )
			const born = after.filter( name => !before.includes( name ) )

			const renamed = gone.length === 1 && born.length === 1
			const carried = renamed ? this.class_stored( gone[ 0 ] ) : null

			doc.class_source( klass, next )

			if( carried ) this.class_carry( gone[ 0 ], born[ 0 ], carried )

			return next
		}

		class_names_after( klass: string, next: string ) {
			const names = this.doc_model().names()
			const parsed = this.$.$mol_tree2_from_string(
				next.replace( /\n?$/, '\n' ), 'vmap.view.tree',
			).kids.map( tree => tree.type )

			const at = names.indexOf( klass )

			return at < 0
				? [ ... names, ... parsed ]
				: [ ... names.slice( 0, at ), ... parsed, ... names.slice( at + 1 ) ]
		}

		override code_js( next?: string ) {
			return this.class_js( this.code_klass(), next )
		}

		override code_css( next?: string ) {
			return this.class_css( this.code_klass(), next )
		}

		@ $mol_mem
		code_hooks(): readonly string[] {
			const name = this.code_prop()
			if( !name ) return []

			const node = this.node()
			const decl = node.props_tree().select( node.prop_fullname( name ) ).kids[ 0 ]
			if( !decl ) return []

			const declared = new Set( node.prop_names() )
			const found = [] as string[]

			const walk = ( tree: $mol_tree2 )=> {
				if( tree.type === '<=' ) {
					const ref = tree.kids[ 0 ]
					if( ref && !ref.kids.length && !declared.has( ref.type ) ) {
						if( !found.includes( ref.type ) ) found.push( ref.type )
					}
				}

				for( const kid of tree.kids ) walk( kid )
			}

			walk( decl )

			return found
		}

		code_error() {
			const name = this.selected()
			return name ? this.Pane().node_error( name ) : ''
		}

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

		override carrying() {
			return Boolean( this.dragged() )
		}

		inside_note() {
			const pane = this.Pane()
			return pane.inside() ? `Внутри ${ pane.entered() }: клавиши уходят компоненту. Клик по холсту или Esc — выйти` : ''
		}

		@ $mol_mem
		override notes() {
			return [
				... this.inside_note() ? [ this.Inside_note() ] : [],
				... this.stalled() ? [ this.Stall() ] : [],
				... this.error() ? [ this.Alarm() ] : [],
				... this.export_rows(),
				... this.root_title_note() ? [ this.Root_note() ] : [],
				this.Status(),
				this.Zoom_chip(),
			] as readonly $mol_view[]
		}

		override canvas_foot() {
			return [ this.Foot_bar() ]
		}

		override main() {
			return [
				... this.left_showed() ? [ this.Left() ] : [],
				this.Canvas(),
				... this.right_showed() ? [ this.Right() ] : [],
			] as readonly $mol_view[]
		}

		override left_panel() {
			return this.left_tab() === 'layers' ? this.Layers() : this.Shelf()
		}

		right_content() {
			return [
				... this.picked().length > 1 ? [ this.Align() ] : [],
				this.Right_tabs(),
				this.right_panel(),
			] as readonly $mol_view[]
		}

		@ $mol_mem
		align_group() {

			const picked = this.picked()
			if( picked.length < 2 ) return { kind: 'none', names: picked, owner: '' }

			const node = this.node()
			const owners = picked.map( name => node.sub_holder( name ) )

			if( owners.every( one => one === '' ) ) return { kind: 'free', names: picked, owner: '' }

			const first = owners[ 0 ]
			if( first && owners.every( one => one === first ) ) {
				return { kind: 'kin', names: picked, owner: first }
			}

			return { kind: 'mixed', names: picked, owner: '' }
		}

		override align_enabled( kind: string ) {

			if( !this.editable() ) return false

			const group = this.align_group()

			if( group.kind === 'free' ) return true
			if( group.kind === 'kin' ) return !kind.startsWith( 'spread' )

			return false
		}

		override align_note() {

			const group = this.align_group()

			if( group.kind === 'mixed' ) {
				return 'Выделены и свободные детали, и вложенные узлы:'
					+ ' вместе их не выровнять, потому что свободные стоят по своим местам,'
					+ ' а вложенные ставит раскладка родителя. Оставьте в выделении что-то одно.'
			}

			if( group.kind === 'kin' ) {
				return `Разложить равномерно нельзя: расстояние между соседями задаёт «Зазор»`
					+ ` в разделе раскладки «Дизайна» у узла ${ group.owner }.`
			}

			return ''
		}

		@ $mol_action
		override align_act( kind: string, next?: Event | null ) {

			if( !next ) return null
			if( !this.align_enabled( kind ) ) return null

			const group = this.align_group()

			if( group.kind === 'free' ) this.align_spots( kind, group.names )
			if( group.kind === 'kin' ) this.align_kin( kind, group.owner )

			return null
		}

		align_boxes( names: readonly string[] ) {

			const pane = this.Pane() as $bog_vmap_app_pane

			return names
				.map( name => ({ name, box: pane.spot_box( name ) }) )
				.filter( ( one ): one is { name: string, box: $bog_vmap_bridge_rect } => Boolean( one.box ) )
		}

		align_spots( kind: string, names: readonly string[] ) {

			const boxes = this.align_boxes( names )
			if( boxes.length < 2 ) return

			const across = kind === 'top' || kind === 'center_y' || kind === 'bottom' || kind === 'spread_y'

			const start = ( one: $bog_vmap_bridge_rect )=> across ? one.y : one.x
			const size = ( one: $bog_vmap_bridge_rect )=> across ? one.height : one.width

			const edge = Math.min( ... boxes.map( one => start( one.box ) ) )
			const far = Math.max( ... boxes.map( one => start( one.box ) + size( one.box ) ) )

			const placed = {} as { [ name: string ]: number }

			if( kind === 'spread_x' || kind === 'spread_y' ) {

				const sorted = [ ... boxes ].sort( ( one, other )=> start( one.box ) - start( other.box ) )
				const used = sorted.reduce( ( sum, one )=> sum + size( one.box ), 0 )
				const gap = ( far - edge - used ) / ( sorted.length - 1 )

				let at = edge

				for( const one of sorted ) {
					placed[ one.name ] = Math.round( at )
					at += size( one.box ) + gap
				}

			} else {

				for( const one of boxes ) {
					placed[ one.name ] = Math.round(
						kind === 'left' || kind === 'top' ? edge
						: kind === 'right' || kind === 'bottom' ? far - size( one.box )
						: ( edge + far ) / 2 - size( one.box ) / 2
					)
				}

			}

			const spots = { ... this.spots() }

			for( const one of boxes ) {
				const spot = spots[ one.name ] ?? { x: one.box.x, y: one.box.y }
				spots[ one.name ] = across
					? { x: spot.x, y: placed[ one.name ] }
					: { x: placed[ one.name ], y: spot.y }
			}

			this.spots( spots )

		}

		align_kin( kind: string, owner: string ) {

			const node = this.node()
			const tree = node.tree()

			const column = this.doc_axis( owner ) === 'column'
			const horizontal = kind === 'left' || kind === 'center_x' || kind === 'right'

			const key = horizontal === column ? 'alignItems' : 'justifyContent'

			const value = kind === 'left' || kind === 'top' ? 'flex-start'
				: kind === 'right' || kind === 'bottom' ? 'flex-end'
				: 'center'

			const style = node.over_tree( owner, 'style' )?.kids[ 0 ]
				?? tree.struct( '*', [ tree.struct( '^' ) ] )

			node.over_set( owner, 'style', tree.struct( 'style', [
				this.$.$bog_vmap_lang_dict_set( style, key, tree.data( value ) ),
			] ) )

		}

		override right_panel() {
			switch( this.right_tab() ) {
				case 'code': return this.Code()
				case 'history': return this.History()
				default: return this.selection_alive() ? this.Inspect() : this.Idle()
			}
		}

		override floats() {
			return ( this.dragged() ? [ this.Ghost() ] : [] ) as readonly $mol_view[]
		}

		override lights( next?: boolean ) {
			const kept = this.$.$mol_state_local.value< boolean >( `${ this }.lights()`, next )
			return kept ?? Boolean( this.$.$mol_lights() )
		}

		override theme_name() {
			return this.lights() ? '$mol_theme_light' : '$mol_theme_dark'
		}

		columns_wide() {
			return this.$.$mol_window.size().width >= 960
		}

		override left_showed( next?: boolean ) {
			return this.$.$mol_state_session.value( 'vmap_left', next ) ?? this.columns_wide()
		}

		override right_showed( next?: boolean ) {
			return this.$.$mol_state_session.value( 'vmap_right', next ) ?? this.columns_wide()
		}

		override left_tab( next?: string ) {
			return this.$.$mol_state_session.value( 'vmap_left_tab', next || undefined ) ?? 'layers'
		}

		override right_tab( next?: string ) {
			return this.$.$mol_state_session.value( 'vmap_right_tab', next || undefined ) ?? 'design'
		}

		override code_showed( next?: boolean ) {
			return this.tab_showed( 'code', next )
		}

		override history_showed( next?: boolean ) {
			return this.tab_showed( 'history', next )
		}

		tab_showed( tab: string, next?: boolean ) {

			if( next === true ) {
				this.right_showed( true )
				this.right_tab( tab )
			}

			if( next === false && this.right_tab() === tab ) this.right_tab( 'design' )

			return this.right_showed() && this.right_tab() === tab
		}

		columns_toggle() {
			const shown = this.left_showed() || this.right_showed()
			this.left_showed( !shown )
			this.right_showed( !shown )
		}

		override history_state( next?: $bog_vmap_app_store_state ): $bog_vmap_app_store_state {

			const store = this.store()
			const doc = store.doc_current()

			if( !doc ) return this.draft_state( next )

			if( next !== undefined && !doc.can_change() ) return store.doc_state( doc )

			return store.doc_state( doc, next )
		}

		draft_state( next?: $bog_vmap_app_store_state ): $bog_vmap_app_store_state {

			if( next !== undefined ) {

				this.doc_source( next.source )

				for( const name of this.doc_model().names() ) {
					this.class_js( name, next.js[ name ] ?? '' )
					this.class_css( name, next.css[ name ] ?? '' )
				}

				this.spots( next.spots )

				return next
			}

			const js = {} as { [ klass: string ]: string }
			const css = {} as { [ klass: string ]: string }

			for( const name of this.doc_model().names() ) {
				const body = this.class_js( name )
				if( body ) js[ name ] = body
				const style = this.class_css( name )
				if( style ) css[ name ] = style
			}

			return { source: this.doc_source(), js, css, spots: this.spots() }
		}

		selection_alive() {
			const name = this.selected()
			if( !name ) return false

			try {
				return this.node().prop_names().includes( name )
			} catch( error ) {
				if( $mol_promise_like( error ) ) return $mol_fail_hidden( error )
				return false
			}

		}

		node_source( next?: string ): string {
			if( this.inner() ) return this.inner_source( next )

			const name = this.selected()
			if( !name ) return ''

			const node = this.node()
			const sign = node.prop_fullname( name )
			if( !sign ) return ''

			if( next === undefined ) {
				return node.props_tree().select( sign ).kids[ 0 ]?.toString() ?? ''
			}

			const parsed = this.$.$mol_tree2_from_string(
				next.replace( /\n?$/, '\n' ), 'vmap.view.tree',
			).kids[ 0 ]

			if( parsed ) node.prop_tree( name, parsed )

			return next
		}

		override node_cell( sign: string, next?: $mol_tree2 | null ): $mol_tree2 | null {

			if( this.inner_foreign() ) {
				if( next === undefined ) return null
				return this.$.$mol_fail( new Error( this.inner_foreign_note() ) )
			}

			if( this.inner() ) {
				const node = this.node()
				const held = next === undefined
					? node.inner_ref( this.inner_node(), this.inner_prop() )
					: this.inner_held()

				return held ? node.cell_value( held, sign, next ) : null
			}

			const name = this.selected()
			if( !name ) return null
			return this.node().cell_value( name, sign, next )
		}

		node_renamable() {
			return this.editable() && !this.inner()
		}

		@ $mol_mem
		node_peers(): readonly $mol_tree2[] {
			return [ ... this.lib_classes(), this.node().tree() ]
		}

		override doc_wires() {
			return this.node().links()
		}

		@ $mol_mem_key
		override part_ports( name: string ): readonly $bog_vmap_app_wire_port[] {
			const node = this.node()
			const sign = node.prop_fullname( name )
			if( !sign ) return []

			const klass = node.props_tree().select( sign ).kids[ 0 ]?.kids[ 0 ]
			if( !klass || !$mol_view_tree2_class_match( klass ) ) return []

			const ports = this.$.$bog_vmap_app_wire_ports(
				this.Lib().props_map( klass.type ),
				this.Lib().props_owner( klass.type ),
				klass.type,
			)

			return $bog_vmap_app_wire_labelled( ports, this.part_labels( name ) )
		}

		@ $mol_mem
		override doc_paths(): readonly string[] {

			const node = this.node()
			const paths = [] as string[]
			const seen = new Set< string >()

			const walk = ( owner: string, path: string )=> {

				if( seen.has( owner ) ) return
				seen.add( owner )

				for( const kid of node.sub_names( owner ) ?? [] ) {

					if( !kid ) continue

					const next = path ? path + '/' + kid : kid

					paths.push( next )
					walk( kid, next )

				}

			}

			walk( '', '' )

			return paths
		}

		@ $mol_mem_key
		part_labels( name: string ): readonly string[] {

			const held = this.node().over_tree( name, $bog_vmap_app_wire_slots )?.kids[ 0 ] ?? null
			if( !held || held.type !== '' ) return []

			return held.value.split( ',' ).map( label => label.trim() )
		}

		@ $mol_mem_key
		override part_overs( name: string ): readonly string[] {
			const node = this.node()
			const sign = node.prop_fullname( name )
			if( !sign ) return []

			const klass = node.props_tree().select( sign ).kids[ 0 ]?.kids[ 0 ]
			if( !klass || !$mol_view_tree2_class_match( klass ) ) return []

			return klass.kids.map( over => this.$.$mol_view_tree2_prop_parts( over ).name )
		}

		@ $mol_mem
		override doc_names() {
			return this.node().prop_names()
		}

		@ $mol_mem
		override doc_containers() {
			const node = this.node()
			return node.prop_names().filter( name => node.sub_names( name ) )
		}

		@ $mol_mem_key
		override doc_axis( name: string ) {
			const style = this.node().over_tree( name, 'style' )?.kids[ 0 ] ?? null

			return this.$.$bog_vmap_lang_dict_get( style, 'flexDirection' )?.value ?? ''
		}

		boxed_order( names: readonly string[] ) {

			const pane = this.Pane()
			const place = ( name: string )=> pane.part_size( name ) ?? { x: 0, y: 0 }

			return [ ... names ].sort( ( one, two )=> place( one ).y - place( two ).y || place( one ).x - place( two ).x )
		}

		override tree_move( next?: $bog_vmap_app_pane_tree_move | null ) {
			if( !next ) return null

			const pane = this.Pane()
			const names = this.boxed_order( next.names )
			if( !names.length ) return null

			const boxes = new Map( names.map( name => [ name, pane.part_size( name ) ] as const ) )

			const draft = this.doc_draft()
			const node = draft.node( this.doc_root() )
			const spots = { ... this.spots() }

			names.forEach( ( name, at )=> {

				node.sub_move( name, next.index + at, next.owner )

				if( next.owner ) {
					delete spots[ name ]
					return
				}

				if( spots[ name ] ) return

				const box = boxes.get( name )
				const [ x, y ] = box ? [ box.x, box.y ] : pane.free_spot()
				spots[ name ] = { x, y }

			} )

			this.node().tree( node.tree() )
			this.spots( spots )

			return next
		}

		carry_guess() {
			return { width: 192, height: 152 }
		}

		carry_size( source: string ): { readonly width: number, readonly height: number } {
			const preset = this.$.$bog_vmap_lang_node.make({ $: this.$, source: ()=> source })
			const top = preset.sub_names( '' )?.find( Boolean )
			const decl = top ? preset.prop_decl( top )?.kids[ 0 ]?.toString() : ''

			const node = this.node()

			if( decl ) for( const name of node.sub_names( '' ) ?? [] ) {
				if( !name ) continue
				if( node.prop_decl( name )?.kids[ 0 ]?.toString() !== decl ) continue

				const box = this.Pane().part_size( name )
				if( box ) return box
			}

			return this.carry_guess()
		}

		override carry_drop( next?: $bog_vmap_app_pane_carry | null ) {
			if( !next || !this.editable() ) return null

			const source = this.dragged()
			if( !source ) return null

			this.Shelf().dragged( '' )

			const size = next.owner ? null : this.carry_size( source )

			this.preset_apply(
				source,
				next.x - ( size?.width ?? 0 ) / 2,
				next.y - ( size?.height ?? 0 ) / 2,
				next.owner ? { owner: next.owner, index: next.index } : null,
			)

			return next
		}

		override files_drop( next?: $bog_vmap_app_pane_files | null ) {

			if( !next || !this.editable() ) return null

			next.files.forEach( ( file, i )=> this.file_place(
				file,
				next.x + i * 24,
				next.y + i * 24,
				next.owner ? { owner: next.owner, index: next.index + i } : null,
			) )

			return next
		}

		file_place(
			file: File,
			x: number,
			y: number,
			slot: { readonly owner: string, readonly index: number } | null,
		) {

			const uri = this.store().asset_put( file )
			if( !uri ) return ''

			const node = this.node()
			const tree = node.tree()

			const image = file.type.startsWith( 'image/' )
			const name = this.name_free( image ? 'Image' : 'File' )

			node.part_add( name, image ? '$mol_image' : '$mol_link' )
			node.over_set( name, 'uri', tree.struct( 'uri', [ tree.data( uri ) ] ) )

			if( !image ) node.over_set(
				name,
				'title',
				tree.struct( 'title', [ tree.data( file.name ) ] ),
			)

			if( slot ) node.sub_insert( name, slot.index, slot.owner )
			else {
				node.sub_add( name )
				this.spots({ ... this.spots(), [ name ]: { x, y } })
			}

			this.selected( name )

			return name
		}

		override link_add( next?: $bog_vmap_app_pane_link_new | null ) {
			if( next ) {
				const taken = this.doc_wires().some( link => link.to === next.to && link.to_prop === next.to_prop )
				if( taken ) this.node().link_drop( next.to, next.to_prop )
				this.node().link_add( next )
			}

			return next ?? null
		}

		override link_drop( next?: $bog_vmap_app_pane_link_end | null ) {
			if( next ) this.node().link_drop( next.to, next.to_prop )
			return next ?? null
		}

		@ $mol_mem
		links_parsed() {
			return this.$.$bog_vmap_lib_links_parse( this.links() )
		}

		override scene_theme() {
			return this.Theme().theme()
		}

		override pack_link() {
			const pack = this.links_parsed().pack
			if( pack ) return this.$.$bog_vmap_lib_slashed( pack )

			const page = this.page_uri()
			return page ? this.$.$bog_vmap_lib_sibling( page, 'part' ) : ''
		}

		override lands() {
			return this.links_parsed().lands
		}

		override lib_classes() {
			return this.Lib().land_trees()
		}

		override lib_class_list() {
			return this.Lib().class_list()
		}

		override libs() {
			return this.Lib().parts()
		}

		override error() {
			return this.Pane().error()
		}

		pack_lost() {
			try {
				this.Lib().tree()
				return ''
			} catch( error: unknown ) {
				if( this.$.$mol_promise_like( error ) ) return ''
				return this.Lib().tree_link()
			}
		}

		lost_cure() {
			return 'перезагрузите страницу с очисткой кеша при живом дев-сервере'
		}

		lost_note() {
			const pack = this.pack_lost()
			if( pack ) return `Не загрузилось дерево пака деталей ${ pack } — ${ this.lost_cure() }`

			const scene = this.Pane().scene_lost()
			if( scene ) return `Не загрузился бандл сцены ${ scene } — ${ this.lost_cure() }`

			return ''
		}

		override status() {
			const lost = this.lost_note()
			if( lost ) return lost

			const note = this.store_note()
			if( note ) return note

			const assets = this.assets_note()
			if( assets ) return assets

			if( this.stalled() ) return 'сцена не отвечает'

			const group = this.group_note()
			if( group ) return group

			const reset = this.reset_note()
			if( reset ) return reset

			const base = this.base_note()
			if( base ) return base

			if( this.Pane().warmed() ) return 'сцена на связи'
			return this.Pane().pack_note() || 'ожидание сцены…'
		}

		dragged() {
			return this.Shelf().drag_source()
		}

		ghost_title() {
			return this.Shelf().drag_title()
		}

		ghost_left() {
			return this.Shelf().drag_x() + 'px'
		}

		ghost_top() {
			return this.Shelf().drag_y() + 'px'
		}

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

		drag_end( event?: PointerEvent ) {
			if( !event ) return
			if( !this.dragged() ) return

			this.Shelf().dragged( '' )
		}


		part_name( klass: string ) {
			return this.name_free( this.$.$bog_vmap_app_shelf_short( klass ) )
		}

		name_free( head: string ) {
			const taken = new Set( this.node().prop_names() )
			if( !taken.has( head ) ) return head

			for( let i = 2; ; ++i ) {
				const name = `${ head }_${ i }`
				if( !taken.has( name ) ) return name
			}

		}

		@ $mol_action
		preset_place( source: string ) {
			const spot = this.Pane().free_spot()
			this.preset_apply( source, spot[0], spot[1], null )
		}

		@ $mol_action
		preset_apply(
			source: string,
			x: number,
			y: number,
			slot: { readonly owner: string, readonly index: number } | null,
		) {
			const node = this.node()

			const placed = this.$.$bog_vmap_app_shelf_apply(
				node,
				source,
				( name: string )=> this.name_free( name ),
			)

			placed.forEach( ( name, i )=> {
				if( slot ) return node.sub_insert( name, slot.index + i, slot.owner )

				node.sub_add( name )
				this.spots({ ... this.spots(), [ name ]: { x: x + i * 24, y: y + i * 24 } })

			} )

			if( placed[ 0 ] ) this.selected( placed[ 0 ] )

		}

		@ $mol_action
		part_drop( klass: string, x: number, y: number ) {
			this.Shelf().dragged( klass )
			this.Pane().carry_at({ x, y })
		}

		override shelf_place( next?: string ) {
			const source = next && this.editable() && this.Shelf().item_source( next )

			if( source ) this.preset_place( source )

			return ''
		}

		board_size() {
			return { width: 1280, height: 720 }
		}

		board_style( size: { readonly width: number, readonly height: number } ) {
			return {
				width: `${ size.width }px`,
				minHeight: `${ size.height }px`,
				flexDirection: 'column',
				background: 'var(--mol_theme_back)',
				color: 'var(--mol_theme_text)',
			} as { readonly [ key: string ]: string }
		}

		board_new( size: { readonly width: number, readonly height: number } ) {
			const node = this.node()
			const name = this.name_free( 'Page' )
			const tree = node.tree()

			node.part_add( name, '$mol_view' )

			node.over_set( name, 'style', tree.struct( 'style', [
				tree.struct( '*', Object.entries( this.board_style( size ) ).map(
					( [ key, value ] )=> tree.struct( key, [ tree.data( value ) ] )
				) ),
			] ) )

			node.sub_open( name )

			return name
		}

		@ $mol_mem_key
		override node_text( name: string ) {

			const value = this.node().over_tree( name, 'title' )?.kids[ 0 ] ?? null

			return value && !value.type ? value.value : ''
		}

		@ $mol_mem_key
		override node_text_kind( name: string ) {

			const node = this.node()
			const value = node.over_tree( name, 'title' )?.kids[ 0 ] ?? null

			if( value && [ '<=', '<=>', '=' ].includes( value.type ) ) {

				const ref = value.kids[ 0 ]
				const named = ref ? this.$.$mol_view_tree2_prop_parts( ref ).name : ''

				if( value.type === '=' ) return named

				const wire = node.wires().find( one => one.name === named )

				return wire ? wire.node : named
			}

			const klass = this.node_class( name )
			if( !klass ) return ''

			try {
				return this.Lib().shows( `${ klass }/title` ) ? 'own' : ''
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return ''
			}

		}

		@ $mol_action
		override node_text_write( next?: { readonly name: string, readonly text: string } | null ) {

			if( !next || !this.editable() ) return null

			const node = this.node()
			const tree = node.tree()

			node.over_set( next.name, 'title', tree.struct( 'title', [ tree.data( next.text ) ] ) )

			return next
		}

		size_key( name: string ) {

			const style = this.node().over_tree( name, 'style' )?.kids[ 0 ] ?? null

			if( this.$.$bog_vmap_lang_dict_get( style, 'minHeight' ) ) return 'minHeight'
			if( this.$.$bog_vmap_lang_dict_get( style, 'height' ) ) return 'height'

			return this.node().sub_holder( name ) ? 'height' : 'minHeight'
		}

		@ $mol_action
		override node_resize( next?: $bog_vmap_app_pane_size | null ) {

			if( !next || !this.editable() ) return null

			const node = this.node()
			const tree = node.tree()

			const style = node.over_tree( next.name, 'style' )?.kids[ 0 ]
				?? tree.struct( '*', [ tree.struct( '^' ) ] )

			const width = this.$.$bog_vmap_lang_dict_set(
				style, 'width', tree.data( `${ next.width }px` ),
			)

			const both = this.$.$bog_vmap_lang_dict_set(
				width, this.size_key( next.name ), tree.data( `${ next.height }px` ),
			)

			node.over_set( next.name, 'style', tree.struct( 'style', [ both ] ) )

			return next
		}

		@ $mol_action
		override board_draw( next?: $bog_vmap_bridge_rect | null ) {
			if( !next || !this.editable() ) return null

			const size = next.width || next.height ? next : this.board_size()

			const name = this.board_new( size )
			this.node().sub_add( name )

			this.spots({ ... this.spots(), [ name ]: { x: next.x, y: next.y } })

			this.selected( name )

			return next
		}

		pack_plan( picked: readonly string[] ) {

			const node = this.node()
			const pane = this.Pane()

			const boxes = new Map< string, $bog_vmap_bridge_rect | null >(
				picked.map( name => [ name, pane.part_size( name ) ] )
			)
			const place = ( name: string )=> boxes.get( name ) ?? { x: 0, y: 0 }

			const tops = picked
				.filter( name => !picked.some( up => up !== name && node.sub_within( up, name ) ) )
				.sort( ( one, two )=> place( one ).y - place( two ).y || place( one ).x - place( two ).x )

			const holders = new Set( tops.map( name => node.sub_holder( name ) ) )
			const holder = holders.size === 1 ? [ ... holders ][ 0 ] ?? '' : ''
			const kids = node.sub_names( holder ) ?? []
			const index = Math.min( Infinity, ... tops.map( name => kids.indexOf( name ) ).filter( at => at >= 0 ) )

			const found = tops.flatMap( name => boxes.get( name ) ?? [] )
			const left = Math.min( ... found.map( box => box.x ) )
			const upper = Math.min( ... found.map( box => box.y ) )
			const width = Math.max( ... found.map( box => box.x + box.width ) ) - left
			const height = Math.max( ... found.map( box => box.y + box.height ) ) - upper

			return {
				tops,
				holder,
				index,
				found,
				box: { x: left, y: upper, width, height },
			}
		}

		doc_draft() {

			let text = this.doc_source()

			return this.$.$bog_vmap_lang_doc.make({
				$: this.$,
				source: ( next?: string )=> next === undefined ? text : ( text = next ),
			})
		}

		@ $mol_action
		override node_wrap() {
			const picked = this.picked()
			if( !picked.length || !this.editable() ) return null

			const node = this.node()
			const pane = this.Pane()

			const plan = this.pack_plan( picked )
			const { tops, holder, index, found } = plan

			const spots = { ... this.spots() }
			const spot = found.length ? { x: plan.box.x, y: plan.box.y } : spots[ tops[ 0 ] ]
			const [ x, y ] = spot ? [ spot.x, spot.y ] : pane.free_spot()

			const name = this.board_new( found.length
				? { width: Math.round( plan.box.width ), height: Math.round( plan.box.height ) }
				: this.board_size()
			)

			node.sub_insert( name, index, holder )
			if( !holder ) spots[ name ] = { x: Math.round( x ), y: Math.round( y ) }

			tops.forEach( ( kid, at )=> {
				node.sub_move( kid, at, name )
				delete spots[ kid ]
			} )

			this.spots( spots )
			this.picked([ name ])

			return null
		}

		@ $mol_action
		override node_group() {

			const picked = this.picked()
			if( !picked.length || !this.editable() ) return null

			const plan = this.pack_plan( picked )
			if( !plan.tops.length ) return null

			const name = this.name_free( 'Group' )
			const draft = this.doc_draft()
			const node = draft.node( this.doc_root() )
			const tree = node.tree()

			node.part_add( name, '$mol_view' )

			if( plan.found.length && plan.box.height > plan.box.width ) node.over_set(
				name,
				'style',
				tree.struct( 'style', [
					tree.struct( '*', [ tree.struct( 'flexDirection', [ tree.data( 'column' ) ] ) ] ),
				] ),
			)

			node.sub_open( name )
			node.sub_insert( name, plan.index, plan.holder )

			plan.tops.forEach( ( kid, at )=> node.sub_move( kid, at, name ) )

			const spots = { ... this.spots() }
			const kept = spots[ plan.tops[ 0 ] ]

			for( const kid of plan.tops ) delete spots[ kid ]

			if( !plan.holder ) {
				const spot = plan.found.length ? plan.box : kept
				const [ x, y ] = spot ? [ spot.x, spot.y ] : this.Pane().free_spot()
				spots[ name ] = { x: Math.round( x ), y: Math.round( y ) }
			}

			const places = {} as { [ kid: string ]: { readonly x: number, readonly y: number } }

			for( const kid of plan.tops ) {
				const box = this.Pane().part_size( kid )
				if( box ) places[ kid ] = { x: box.x, y: box.y }
			}

			this.node().tree( node.tree() )
			this.spots( spots )
			this.picked([ name ])

			this.group_made({ source: this.doc_source(), name, places })

			return null
		}

		@ $mol_mem
		group_made( next?: {
			readonly source: string
			readonly name: string
			readonly places: { readonly [ kid: string ]: { readonly x: number, readonly y: number } }
		} | null ) {
			return next ?? null
		}

		group_moved() {

			const made = this.group_made()
			if( !made ) return false
			if( this.doc_source() !== made.source ) return false

			const pane = this.Pane()

			return Object.keys( made.places ).some( kid => {
				const place = made.places[ kid ]
				const box = pane.part_size( kid )
				if( !box || !place ) return false
				return Math.abs( box.x - place.x ) >= 1 || Math.abs( box.y - place.y ) >= 1
			} )
		}

		group_note() {
			if( !this.group_moved() ) return ''

			const made = this.group_made()!
			const lined = this.doc_axis( made.name ) === 'column' ? 'в колонку' : 'в ряд'
			const keys = ( this.Pane() as $bog_vmap_app_pane ).menu_view().apple() ? 'Cmd+Z' : 'Ctrl+Z'

			return `Группа раскладывает содержимое, поэтому детей выстроило ${ lined }. ${ keys } вернёт как было`
		}

		text_class() {
			return '$' + 'mol_paragraph'
		}

		override text_enabled() {
			if( !this.editable() ) return false

			const props = this.class_props( this.text_class() )
			return Boolean( props?.has( 'title' ) )
		}

		@ $mol_action
		override text_draw( next?: $bog_vmap_app_text_born | null ) {

			if( !next || !next.text || !this.text_enabled() ) return null

			const draft = this.doc_draft()
			const node = draft.node( this.doc_root() )
			const tree = node.tree()

			const name = this.name_free( 'Text' )

			node.part_add( name, this.text_class() )
			node.over_set( name, 'title', tree.struct( 'title', [ tree.data( next.text ) ] ) )

			if( next.width ) node.over_set( name, 'style', tree.struct( 'style', [
				tree.struct( '*', [
					tree.struct( 'width', [ tree.data( Math.round( next.width ) + 'px' ) ] ),
				] ),
			] ) )

			node.sub_add( name )

			this.node().tree( node.tree() )
			this.spots({ ... this.spots(), [ name ]: { x: Math.round( next.x ), y: Math.round( next.y ) } })
			this.picked([ name ])

			return name
		}

		class_props( klass: string ) {
			if( !klass ) return null

			try {
				return this.Lib().props_map( klass )
			} catch( error: unknown ) {
				if( $mol_promise_like( error ) ) return null
				$mol_fail_log( error )
				return null
			}
		}

		over_name( sign: string ) {
			return sign.replace( /[?*]+$/, '' )
		}

		class_knows( klass: string, prop: string ) {
			const props = this.class_props( klass )
			if( !props ) return false

			return props.has( prop ) || props.has( prop + '?' ) || props.has( prop + '*' )
		}

		over_known( part: string, prop: string ) {
			return this.class_knows( this.node_class( part ), prop )
		}

		over_wired( part: string, prop: string ) {
			return this.node().links().some( link =>
				( link.to === part && link.to_prop === prop )
				|| ( link.from === part && link.from_prop === prop )
			)
		}

		over_names( part: string ) {
			const klass = this.node().prop_decl( part )?.kids[ 0 ]
			if( !klass || !$mol_view_tree2_class_match( klass ) ) return [] as readonly string[]

			return klass.kids.map( over => this.$.$mol_view_tree2_prop_parts( over ).name )
		}

		over_resettable( part: string, prop: string ) {
			if( !this.node_editable() ) return false
			if( !prop || !part ) return false
			if( this.over_wired( part, prop ) ) return false

			return this.over_known( part, prop ) && this.over_names( part ).includes( prop )
		}

		override node_resettable( sign: string ) {
			if( this.inner() ) return false
			return this.over_resettable( this.selected() ?? '', this.over_name( sign ) )
		}

		reset_one( node: $bog_vmap_lang_node, part: string, prop: string ) {

			const inner = node.inner_ref( part, prop )

			node.over_set( part, prop, null )

			if( inner ) this.tree_drop( node, inner )
			else node.cell_tidy( node.cell_of( part, prop ) )

		}

		tree_drop( node: $bog_vmap_lang_node, name: string ) {

			if( !name ) return false
			if( node.ref_names().includes( name ) ) return false

			const doomed = [ name ]

			for( const dead of doomed ) for( const kid of node.sub_names( dead ) ?? [] ) {
				if( kid && !doomed.includes( kid ) ) doomed.push( kid )
			}

			for( const dead of doomed ) node.links_drop( dead )

			for( const dead of doomed ) {
				node.cells_drop( dead )
				node.sub_drop( dead )
				node.prop_drop( dead )
			}

			return true
		}

		@ $mol_action
		override node_reset( sign: string, next?: Event | null ) {

			const part = this.selected() ?? ''
			const prop = this.over_name( sign )
			if( !this.over_resettable( part, prop ) ) return null

			const draft = this.doc_draft()
			const node = draft.node( this.doc_root() )

			this.reset_one( node, part, prop )
			this.node().tree( node.tree() )

			return null
		}

		reset_names() {
			return this.picked().filter( part => this.over_names( part ).some(
				prop => this.over_resettable( part, prop )
			) )
		}

		override reset_enabled() {
			return this.reset_names().length > 0
		}

		@ $mol_action
		override node_reset_all( next?: Event | null ) {

			const parts = this.reset_names()
			if( !parts.length ) return null

			const draft = this.doc_draft()
			const node = draft.node( this.doc_root() )

			let done = 0
			let kept = 0

			for( const part of parts ) for( const prop of this.over_names( part ) ) {

				if( !this.over_resettable( part, prop ) ) {
					++ kept
					continue
				}

				this.reset_one( node, part, prop )
				++ done

			}

			this.node().tree( node.tree() )
			this.reset_made({ source: this.doc_source(), done, kept })

			return null
		}

		@ $mol_mem
		reset_made( next?: { readonly source: string, readonly done: number, readonly kept: number } | null ) {
			return next ?? null
		}

		reset_note() {
			const made = this.reset_made()
			if( !made || !made.kept ) return ''
			if( this.doc_source() !== made.source ) return ''

			return 'Провода и свои свойства остались, сброс вернул только то, что предлагает деталь'
		}

		base_offers(): readonly { readonly klass: string, readonly title: string }[] {
			try {
				return this.Shelf().class_offers()
			} catch( error: unknown ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return []
			}
		}

		override node_bases() {
			return this.base_offers().map( offer => offer.klass )
		}

		override node_base_titles() {

			const titles = {} as { [ klass: string ]: string }

			for( const offer of this.base_offers() ) titles[ offer.klass ] = offer.title

			return titles
		}

		base_listed( klass: string ) {
			try {
				return this.Lib().class_list().includes( klass )
			} catch( error: unknown ) {
				if( $mol_promise_like( error ) ) return $mol_fail_hidden( error )
				$mol_fail_log( error )
				return false
			}
		}

		base_plan( part: string, klass: string ) {

			const node = this.node()

			const kept = [] as string[]
			const dropped = [] as string[]
			const wires_in = [] as string[]
			const wires_out = [] as string[]

			for( const prop of this.over_names( part ) ) {

				if( prop === 'sub' ) { kept.push( prop ); continue }
				if( this.class_knows( klass, prop ) ) { kept.push( prop ); continue }
				if( !this.over_known( part, prop ) ) { kept.push( prop ); continue }
				if( this.over_wired( part, prop ) ) continue

				dropped.push( prop )
			}

			for( const link of node.links() ) {
				if( link.to !== part ) continue
				if( this.class_knows( klass, link.to_prop ) ) continue
				wires_in.push( link.to_prop )
			}

			for( const wire of node.wires() ) {
				if( wire.node !== part ) continue
				if( this.class_knows( klass, wire.prop ) ) continue
				wires_out.push( wire.prop )
			}

			return { kept, dropped, wires_in, wires_out }
		}

		base_wires_note( part: string, klass: string, plan: ReturnType< $bog_vmap_app[ 'base_plan' ] > ) {

			const node = this.node()
			const bits = [] as string[]

			for( const prop of plan.wires_in ) {
				const link = node.links().find( one => one.to === part && one.to_prop === prop )
				const from = link ? `${ link.from }.${ link.from_prop }` : 'другого узла'
				bits.push( `входящий в «${ prop }» от ${ from }` )
			}

			for( const prop of plan.wires_out ) {
				bits.push( `исходящий из «${ prop }»` )
			}

			return `Класс ${ klass } не знает свойств, на которых висят провода: ${ bits.join( ', ' ) }.`
				+ ' Отсоедините их и повторите замену'
		}

		base_few( names: readonly string[], shown = 3 ) {
			if( names.length <= shown ) return names.join( ', ' )
			return `${ names.slice( 0, shown ).join( ', ' ) } и ещё ${ names.length - shown }`
		}

		@ $mol_mem
		base_made( next?: { readonly source: string, readonly klass: string, readonly dropped: readonly string[] } | null ) {
			return next ?? null
		}

		base_note() {

			const made = this.base_made()
			if( !made ) return ''
			if( this.doc_source() !== made.source ) return ''

			if( !made.dropped.length ) return `Класс заменён на ${ made.klass }, переопределения сохранены`

			return `Класс заменён на ${ made.klass }, снято переопределений: ${ made.dropped.length }`
				+ ` (${ this.base_few( made.dropped ) })`
		}

		@ $mol_mem_key
		node_base_note_at( name: string, next?: string ) {
			return next ?? ''
		}

		override node_base( next?: string ) {

			const part = this.selected()
			if( this.inner() || !part ) return ''

			const node = this.node()
			const klass = node.part_class( part )

			if( next === undefined || !next || next === klass ) return klass
			if( !this.editable() ) return klass

			if( !this.base_listed( next ) ) {
				this.node_base_note_at( part, `Класса «${ next }» нет в паке деталей ${ this.pack_link() }` )
				return klass
			}

			const plan = this.base_plan( part, next )

			if( plan.wires_in.length || plan.wires_out.length ) {
				this.node_base_note_at( part, this.base_wires_note( part, next, plan ) )
				return klass
			}

			this.base_swap( part, next, plan.dropped )

			this.node_base_note_at( part, '' )
			this.base_made({ source: this.doc_source(), klass: next, dropped: plan.dropped })

			return next
		}

		@ $mol_action
		base_swap( part: string, klass: string, dropped: readonly string[] ) {

			const draft = this.doc_draft()
			const node = draft.node( this.doc_root() )

			node.part_class( part, klass )

			for( const prop of dropped ) this.reset_one( node, part, prop )

			this.node().tree( node.tree() )

		}

		group_names() {
			const node = this.node()
			return this.picked().filter( name => ( node.sub_names( name ) ?? [] ).length > 0 )
		}

		group_ready( name: string ) {
			if( this.node().sub_holder( name ) ) return true

			const pane = this.Pane()
			return ( this.node().sub_names( name ) ?? [] ).every( kid => Boolean( kid && pane.part_size( kid ) ) )
		}

		override ungroup_enabled() {
			if( !this.editable() ) return false

			const names = this.group_names()
			return names.length > 0 && names.every( name => this.group_ready( name ) )
		}

		@ $mol_action
		override node_ungroup() {

			if( !this.ungroup_enabled() ) return null

			const live = this.node()
			const pane = this.Pane()
			const names = this.group_names()

			const boxes = new Map< string, $bog_vmap_bridge_rect >()

			for( const name of names ) {
				if( live.sub_holder( name ) ) continue
				for( const kid of live.sub_names( name ) ?? [] ) {
					const box = kid && pane.part_size( kid )
					if( kid && box ) boxes.set( kid, box )
				}
			}

			const draft = this.doc_draft()
			const node = draft.node( this.doc_root() )

			const spots = { ... this.spots() }
			const freed = [] as string[]

			for( const name of names ) {

				const holder = node.sub_holder( name ) ?? ''
				const kids = ( node.sub_names( name ) ?? [] ).filter( ( kid ): kid is string => Boolean( kid ) )
				const at = ( node.sub_names( holder ) ?? [] ).indexOf( name )

				kids.forEach( ( kid, shift )=> node.sub_move( kid, at + shift, holder ) )

				if( !holder ) for( const kid of kids ) {
					const box = boxes.get( kid )
					if( box ) spots[ kid ] = { x: Math.round( box.x ), y: Math.round( box.y ) }
				}

				node.links_drop( name )
				node.cells_drop( name )
				node.sub_drop( name )
				node.prop_drop( name )

				delete spots[ name ]
				freed.push( ... kids )

			}

			this.node().tree( node.tree() )
			this.spots( spots )
			this.picked( freed )

			return null
		}

		@ $mol_action
		override node_copy() {
			const picked = this.picked()
			if( !picked.length || !this.editable() ) return null

			const node = this.node()
			const pane = this.Pane()

			const tops = picked.filter( name => !picked.some( up => up !== name && node.sub_within( up, name ) ) )
			const spots = { ... this.spots() }

			const made = tops.map( name => {
				const copy = this.$.$bog_vmap_app_copy( node, name )
				const spot = pane.copy_spot( name )
				if( spot ) spots[ copy ] = spot
				return copy
			} )

			this.spots( spots )
			this.picked( made )

			return null
		}

		@ $mol_action
		override node_clone( next?: $bog_vmap_app_pane_clone | null ) {

			if( !next || !this.editable() ) return null

			const live = this.node()
			const names = next.names
			if( !names.length ) return null

			const tops = this.boxed_order(
				names.filter( name => !names.some( up => up !== name && live.sub_within( up, name ) ) )
			)

			const draft = this.doc_draft()
			const node = draft.node( this.doc_root() )

			const spots = { ... this.spots() }
			const made = [] as string[]

			for( const name of tops ) {

				const copy = this.$.$bog_vmap_app_copy( node, name )
				made.push( copy )

				if( next.owner !== undefined ) {
					node.sub_move( copy, ( next.index ?? 0 ) + made.length - 1, next.owner )
					delete spots[ copy ]
					continue
				}

				const spot = next.spots?.[ name ]

				if( spot ) spots[ copy ] = { x: Math.round( spot.x ), y: Math.round( spot.y ) }
				else delete spots[ copy ]

			}

			this.node().tree( node.tree() )
			this.spots( spots )
			this.picked( made )

			return null
		}

		override delete_hint() {
			const name = this.selected()
			return name ? `Удалить ${ name } (Del)` : 'Удалить выделенный узел (Del)'
		}

		@ $mol_action
		node_delete() {
			const picked = this.picked()
			if( !picked.length || !this.editable() ) return

			const node = this.node()

			const doomed = [ ... picked ]
			for( const dead of doomed ) for( const kid of node.sub_names( dead ) ?? [] ) {
				if( kid && !doomed.includes( kid ) ) doomed.push( kid )
			}

			for( const dead of doomed ) node.links_drop( dead )

			for( const dead of doomed ) {
				node.cells_drop( dead )
				node.sub_drop( dead )
				node.prop_drop( dead )
			}

			const spots = { ... this.spots() }
			for( const dead of doomed ) delete spots[ dead ]
			this.spots( spots )

			this.selected( null )

		}

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

			if( this.selected() === name ) this.selected( next )

		}

		node_title( next?: string ) {
			if( this.inner_foreign() ) return this.inner_prop()
			if( this.inner() ) return this.inner_name()

			const name = this.selected()

			if( next === undefined ) return name ?? ''
			if( !name || !next || next === name ) return name ?? ''

			const parts = [ ... next.matchAll( $mol_view_tree2_prop_signature ) ][ 0 ]?.groups

			if( parts?.name !== next ) {
				this.node_title_note_at( name, `Имя «${ next }» не годится:`
					+ ' в имени узла только латинские буквы, цифры и подчёркивание' )
				return name
			}

			if( /^[0-9]/.test( next ) ) {
				this.node_title_note_at( name, `Имя «${ next }» не годится:`
					+ ' имя узла становится именем метода, а оно не начинается с цифры' )
				return name
			}

			if( this.node().prop_names().includes( next ) ) {
				this.node_title_note_at( name, `Имя «${ next }» в этом документе уже занято` )
				return name
			}

			try {
				this.node_rename( name, next )
			} catch( error ) {
				if( this.$.$mol_promise_like( error ) ) return this.$.$mol_fail_hidden( error )
				this.node_title_note_at( name, this.$.$mol_error_message( error ) )
				return name
			}

			return next
		}

		@ $mol_mem_key
		node_title_note_at( name: string, next?: string ) {
			return next ?? ''
		}

		node_title_note() {

			if( this.inner_foreign() ) return this.inner_foreign_note()

			const name = this.selected() ?? ''

			const base = this.node_base_note_at( name )
			if( base ) return base

			const note = this.node_title_note_at( name )

			return note ? `${ note }. Узел по-прежнему называется «${ name }»` : ''
		}

		@ $mol_action
		class_rename( name: string, next: string ) {
			const carried = this.class_stored( name )

			this.doc_model().class_rename( name, next )

			this.class_carry( name, next, carried )

		}

		class_stored( name: string ) {
			return {
				js: this.class_js( name ),
				css: this.class_css( name ),
				rooted: this.store().doc_current() ? this.store().doc_root( this.store().doc_current()! ) === name : false,
			}
		}

		@ $mol_action
		class_carry(
			name: string,
			next: string,
			carried: { js: string, css: string, rooted: boolean },
		) {
			if( carried.js ) this.class_js( next, this.$.$bog_vmap_lang_js_rename( carried.js, name, next ) )
			if( carried.css ) this.class_css( next, this.$.$bog_vmap_lang_css_rename( carried.css, name, next ) )

			const store = this.store()
			const doc = store.doc_current()

			if( carried.rooted && doc && doc.can_change() ) store.doc_root( doc, next )

		}

		@ $mol_mem_key
		root_draft_at( name: string, next?: string ) {
			return next ?? name
		}

		override root_draft( next?: string ) {
			return this.root_draft_at( this.doc_root(), next )
		}

		@ $mol_action
		override root_submit( event?: Event ) {
			const draft = this.root_draft()
			if( !draft || draft === this.doc_root() ) return

			this.root_title( draft )
		}

		root_title( next?: string ) {
			const name = this.doc_root()

			if( next === undefined ) return name
			if( !next || next === name ) return name

			if( !this.$.$bog_vmap_lang_class_ok( next ) ) {
				this.root_title_refusal( `Имя «${ next }» не годится: имя класса это доллар`
					+ ' и не меньше двух частей через подчёркивание, латиницей в нижнем'
					+ ' регистре — из них и складывается папка модуля' )
				return name
			}

			try {
				this.class_rename( name, next )
			} catch( error ) {
				if( this.$.$mol_promise_like( error ) ) return this.$.$mol_fail_hidden( error )
				this.root_title_refusal( this.$.$mol_error_message( error ) )
				return name
			}

			this.root_title_refusal( '' )

			return next
		}

		@ $mol_mem
		root_title_refusal( next?: string ) {
			return next ?? ''
		}

		override root_title_note() {
			const note = this.root_title_refusal()

			return note ? `${ note }. Корневой класс по-прежнему «${ this.doc_root() }»` : ''
		}

		@ $mol_mem
		hotkeys() {
			const dom = this.$.$mol_dom_context

			return [
				new this.$.$mol_dom_listener( dom, 'keydown', $mol_wire_async( this ).key_press, { passive: false } ),
				new this.$.$mol_dom_listener( dom, 'keyup', $mol_wire_async( this ).key_release ),
				new this.$.$mol_dom_listener( dom, 'blur', $mol_wire_async( this ).key_lost ),
			]
		}

		code_undo( event: KeyboardEvent ) {

			if( event.code !== 'KeyZ' ) return false
			if( !event.metaKey && !event.ctrlKey ) return false
			if( event.altKey ) return false
			if( !this.code_showed() ) return false

			const target = event.target as Node | null
			if( !target ) return false
			if( !this.Code().dom_node().contains( target ) ) return false

			event.preventDefault()

			if( !event.shiftKey && this.Code().field_undo() ) return true

			if( event.shiftKey ) this.History().redo()
			else this.History().undo()

			return true
		}

		typing( event: Event ) {
			return this.Pane().key_field( event.target )
		}

		columns_key( event: KeyboardEvent ) {
			if( event.code !== 'Backslash' || !event.shiftKey ) return false
			if( event.metaKey || event.ctrlKey || event.altKey ) return false
			return !this.typing( event )
		}

		key_press( event?: KeyboardEvent ) {
			if( !event ) return

			if( this.columns_key( event ) ) {
				event.preventDefault()
				this.columns_toggle()
				return
			}

			if( this.doc_pending() ) return

			if( this.editable() ) {
				if( this.code_undo( event ) ) return
				if( this.History().press( event ) ) return
			}

			this.Pane().key_down( event )

		}

		key_release( event?: KeyboardEvent ) {
			if( !event ) return
			this.Pane().key_up( event )
		}

		key_lost() {
			this.Pane().grip( false )
		}

		override chrome_click( event?: MouseEvent ) {
			if( !event?.detail ) return null
			if( this.typing( event ) ) return null

			const control = ( event.target as Element | null )?.closest( '[mol_button], a[href]' )
			if( !control || control.closest( '[mol_pop]' ) ) return null

			const active = this.$.$mol_dom_context.document.activeElement as HTMLElement | null
			if( !active || !control.contains( active ) ) return null

			active.blur()

			const selection = this.$.$mol_view_selection
			if( control.contains( selection.focused()[ 0 ] ?? null ) ) selection.focused( [], 'notify' )

			return null
		}

		override auto() {
			return [
				... super.auto(),
				this.drag_listeners(),
				this.hotkeys(),
				this.store_boot(),
				this.History().live(),
			]
		}

	}

}

