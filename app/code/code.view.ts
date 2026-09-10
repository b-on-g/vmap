namespace $.$$ {

	export type $bog_vmap_app_code_slot = 'tree' | 'js' | 'css'

	export class $bog_vmap_app_code extends $.$bog_vmap_app_code {

		sliced() {
			return Boolean( this.prop() ) && !this.whole()
		}

		override scope_note() {
			const prop = this.prop()
			if( !prop ) return `Весь класс ${ this.klass() }`
			return this.whole() ? `Весь класс ${ this.klass() }` : `Узел ${ prop }`
		}

		@ $mol_mem_key
		draft( id: string, next?: string | null ) {
			return next ?? null
		}

		draft_id( slot: $bog_vmap_app_code_slot ) {
			return this.sliced() ? slot + ' ' + this.prop() : slot
		}

		@ $mol_mem
		override refusal( next?: string ) {
			return next ?? ''
		}

		written( slot: $bog_vmap_app_code_slot, next: string, write: ( next: string )=> void ) {

			const id = this.draft_id( slot )

			try {
				write( next )
			} catch( error: unknown ) {
				if( this.$.$mol_promise_like( error ) ) return this.$.$mol_fail_hidden( error )
				this.draft( id, next )
				this.refusal( String( ( error as Error )?.message ?? error ) )
				return next
			}

			this.draft( id, null )
			this.refusal( '' )

			return next
		}

		override tree_text( next?: string ): string {

			if( next === undefined ) {
				return this.draft( this.draft_id( 'tree' ) ) ?? ( this.sliced() ? this.node_source() : this.source() )
			}

			return this.written( 'tree', next, text => {
				if( this.sliced() ) this.node_source( text )
				else this.source( text )
			} )

		}

		props_js() {
			return this.$.$bog_vmap_app_code_props_js( this.js() )
		}

		props_css() {
			return this.$.$bog_vmap_app_code_props_css( this.css(), this.klass() )
		}

		override js_text( next?: string ): string {

			if( !this.sliced() ) {
				if( next === undefined ) return this.draft( this.draft_id( 'js' ) ) ?? this.js()
				return this.written( 'js', next, text => this.js( text ) )
			}

			const hooks = this.hooks()

			if( next === undefined ) {
				return this.draft( this.draft_id( 'js' ) ) ?? this.sliced_read(
					()=> {
						const props = this.props_js()
						return hooks
							.map( name => props.get( name ) ?? this.$.$bog_vmap_app_code_js_default( name ) )
							.join( '\n\n' )
					},
					()=> hooks.map( name => this.$.$bog_vmap_app_code_js_default( name ) ).join( '\n\n' ),
				)
			}

			return this.written( 'js', next, text => {

				const all = this.props_js()

				for( const [ name, code ] of this.$.$bog_vmap_app_code_props_js( text ) ) {
					if( !name ) continue
					this.$.$bog_vmap_app_code_with( all, name, code )
				}

				this.js( this.$.$bog_vmap_app_code_joined( all ) )

			} )

		}

		js_writable() {
			return !this.sliced() || this.hooks().length > 0
		}

		override js_idle_note() {
			return `У узла ${ this.prop() } нет своего метода: всё, что он делает, задано`
				+ ` объявлением, а тело под его именем перебило бы фабрику под-вида и`
				+ ` убрало бы узел с холста. Метод появится здесь, как только объявление`
				+ ` на него сошлётся: например «title <= greeting» просит написать`
				+ ` «greeting()». Общие методы класса правятся в режиме «Весь класс».`
		}

		override source_tabs() {
			return [
				this.Tree(),
				this.js_writable() ? this.Js() : this.Js_idle(),
				this.Css(),
			] as readonly $mol_view[]
		}

		override css_text( next?: string ): string {

			if( !this.sliced() ) {
				if( next === undefined ) return this.draft( this.draft_id( 'css' ) ) ?? this.css()
				return this.written( 'css', next, text => this.css( text ) )
			}

			const prop = this.prop()
			const key = prop.toLowerCase()

			if( next === undefined ) {
				return this.draft( this.draft_id( 'css' ) ) ?? this.sliced_read(
					()=> this.props_css().get( key ),
					()=> this.$.$bog_vmap_app_code_css_default( prop, this.klass() ),
				)
			}

			return this.written( 'css', next, text => this.css(
				this.$.$bog_vmap_app_code_joined(
					this.$.$bog_vmap_app_code_with( this.props_css(), key, text )
				)
			) )

		}

		sliced_read( read: ()=> string | undefined, empty: ()=> string ) {
			try {
				return read() ?? empty()
			} catch( error: unknown ) {
				if( this.$.$mol_promise_like( error ) ) return this.$.$mol_fail_hidden( error )
				return empty()
			}
		}

		@ $mol_mem
		sliceable() {
			try {
				this.props_js()
				this.props_css()
				return true
			} catch( error: unknown ) {
				if( this.$.$mol_promise_like( error ) ) return this.$.$mol_fail_hidden( error )
				return false
			}
		}

		@ $mol_mem
		complaints(): readonly $bog_vmap_app_export_complaint[] {
			return this.$.$bog_vmap_app_export_untyped( this.js_text() )
		}

		override typing_rows() {
			return this.complaints().map( ( _, index )=> this.Typing_row( index ) )
		}

		@ $mol_mem_key
		override typing_text( index: number ) {
			const one = this.complaints()[ index ]
			return one ? `Строка ${ one.line }. ${ one.text }` : ''
		}

		override head_content() {
			return [
				this.Scope_note(),
				... this.prop() ? [ this.Scope() ] : [],
			] as readonly $mol_view[]
		}

		override content() {
			return [
				this.Head(),
				... this.error() ? [ this.Alarm() ] : [],
				... this.note() ? [ this.Refusal() ] : [],
				... this.complaints().length ? [ this.Typing() ] : [],
				this.Sources(),
			] as readonly $mol_view[]
		}

		area_focus( area: $.$mol_textarea ) {
			const node = area.Edit().dom_node() as HTMLElement
			if( node !== this.$.$mol_dom_context.document.activeElement ) node.focus()
			return null
		}

		@ $mol_action
		tree_press( next?: Event | null ) {
			return this.area_focus( this.Tree() )
		}

		@ $mol_action
		js_press( next?: Event | null ) {
			return this.area_focus( this.Js() )
		}

		@ $mol_action
		css_press( next?: Event | null ) {
			return this.area_focus( this.Css() )
		}

		override note() {

			const refusal = this.refusal()
			if( refusal ) return refusal

			if( this.sliced() && !this.sliceable() ) {
				return 'Тексты класса не разобрать по свойствам: скобки не сбалансированы. Включите «Весь класс»'
			}

			return ''
		}

	}

}
