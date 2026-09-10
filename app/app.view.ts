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

		stalled() {
			return this.Pane().stalled()
		}

		override stall_note() {
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

		store_note() {
			switch( this.store().stage() ) {
				case 'making': return 'заводим сцену…'
				case 'readonly': return 'чужая сцена: только просмотр, правки не сохраняются'
				default: return ''
			}
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
			return this.picked_at( this.doc_key(), next )
		}

		doc_key() {
			return this.store().doc_current()?.link().str ?? ''
		}

		@ $mol_mem_key
		picked_at( key: string, next?: readonly string[] ): readonly string[] {
			return next ?? []
		}

		override selected( next?: string | null ): string | null {
			if( next !== undefined ) {
				this.picked( next ? [ next ] : [] )
				return next
			}

			const picked = this.picked()
			return picked.length ? picked[ picked.length - 1 ] : null
		}

		selection_showed() {
			return Boolean( this.selected() )
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

		override export_rows() {
			return this.export_notes().map( ( _, index )=> this.Export_row( index ) )
		}

		@ $mol_mem_key
		override export_text( index: number ) {
			return this.export_notes()[ index ] ?? ''
		}

		code_prop() {
			return this.selected() ?? ''
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
			const name = this.Pane().entered()
			return name ? `Внутри ${ name }: клавиши уходят компоненту. Клик по холсту или Esc — выйти` : ''
		}

		@ $mol_mem
		override body() {
			return [
				this.Head(),
				... this.inside_note() ? [ this.Inside_note() ] : [],
				... this.stalled() ? [ this.Stall() ] : [],
				... this.error() ? [ this.Alarm() ] : [],
				... this.export_notes().length ? [ this.Export_note() ] : [],
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

		override palette_showed( next?: boolean ) {
			return this.$.$mol_state_session.value( 'vmap_palette', next ) ?? true
		}

		override inspect_showed( next?: boolean ) {
			return this.$.$mol_state_session.value( 'vmap_inspect', next ) ?? true
		}

		override code_showed( next?: boolean ) {
			return this.$.$mol_state_session.value( 'vmap_code', next ) ?? false
		}

		aside_content() {
			return ( this.selection_alive() ? [ this.Inspect() ] : [ this.Idle() ] ) as readonly $mol_view[]
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

			return this.$.$bog_vmap_app_wire_ports( this.Lib().props_map( klass.type ) )
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

			this.node().sub_move( next.name, next.index, next.owner )

			const spots = { ... this.spots() }
			delete spots[ next.name ]
			this.spots( spots )

			return next
		}

		override carry_drop( next?: $bog_vmap_app_pane_carry | null ) {
			if( !next ) return null

			const source = this.dragged()
			if( !source ) return null

			this.Shelf().dragged( '' )

			this.preset_apply(
				source,
				next.x,
				next.y,
				next.owner ? { owner: next.owner, index: next.index } : null,
			)

			return next
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
			if( this.stalled() ) return 'сцена не отвечает'
			return this.Pane().ready() ? 'сцена на связи' : 'ожидание сцены…'
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
			const source = next && this.Shelf().item_source( next )

			if( source ) this.preset_place( source )

			return ''
		}

		board_style() {
			return {
				width: '1280px',
				minHeight: '720px',
				flexDirection: 'column',
				background: '#ffffff',
			} as { readonly [ key: string ]: string }
		}

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

			const spot = this.Pane().world_center()
			this.spots({ ... this.spots(), [ name ]: { x: spot[0], y: spot[1] } })

			this.selected( name )

		}

		override delete_hint() {
			const name = this.selected()
			return name ? `Удалить ${ name } (Del)` : 'Удалить выделенный узел (Del)'
		}

		@ $mol_action
		node_delete() {
			const picked = this.picked()
			if( !picked.length ) return

			const node = this.node()

			const doomed = [ ... picked ]
			for( const dead of doomed ) for( const kid of node.sub_names( dead ) ?? [] ) {
				if( kid && !doomed.includes( kid ) ) doomed.push( kid )
			}

			for( const dead of doomed ) node.links_drop( dead )

			for( const dead of doomed ) {
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
			const name = this.selected()

			if( next === undefined ) return name ?? ''
			if( !name || !next || next === name ) return name ?? ''

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
			if( carried.js ) this.class_js( next, carried.js )
			if( carried.css ) this.class_css( next, carried.css )

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
			return new this.$.$mol_dom_listener(
				this.$.$mol_dom_context,
				'keydown',
				$mol_wire_async( this ).key_press,
			)
		}

		key_press( event?: KeyboardEvent ) {
			if( !event ) return

			if( event.key === 'Escape' ) {
				if( this.Pane().inside() ) this.Pane().entered( null )
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
