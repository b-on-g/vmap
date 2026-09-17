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

		@ $mol_mem
		override store() {
			return this.$.$bog_vmap_app_store.make({ $: this.$ })
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

		inner_decl() {

			const klass = this.node_class( this.inner_node() )
			const decl = klass ? this.Lib().props_map( klass ).get( this.inner_prop() ) ?? null : null

			if( !decl ) return this.$.$mol_fail(
				new Error( `Внутренний слой ${ this.inner() } не найден в классе детали` )
			)

			return decl
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
			if( this.inner() ) return this.inner_name()
			return this.selected() ?? ''
		}

		code_node_note() {

			const inner = this.inner()
			if( !inner ) return ''

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
			] as readonly $mol_view[]
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

		override tree_move( next?: $bog_vmap_app_pane_tree_move | null ) {
			if( !next ) return null

			const box = this.Pane().part_size( next.name )

			this.node().sub_move( next.name, next.index, next.owner )

			const spots = { ... this.spots() }

			if( next.owner ) delete spots[ next.name ]
			else if( !spots[ next.name ] ) {
				const [ x, y ] = box ? [ box.x, box.y ] : this.Pane().free_spot()
				spots[ next.name ] = { x, y }
			}

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

		override status() {
			const note = this.store_note()
			if( note ) return note

			const assets = this.assets_note()
			if( assets ) return assets

			if( this.stalled() ) return 'сцена не отвечает'
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

		@ $mol_action
		override node_wrap() {
			const picked = this.picked()
			if( !picked.length || !this.editable() ) return null

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

			const spots = { ... this.spots() }
			const spot = found.length ? { x: left, y: upper } : spots[ tops[ 0 ] ]
			const [ x, y ] = spot ? [ spot.x, spot.y ] : pane.free_spot()

			const name = this.board_new( found.length
				? { width: Math.round( width ), height: Math.round( height ) }
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
			const name = this.selected() ?? ''
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
