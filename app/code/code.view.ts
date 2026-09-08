namespace $.$$ {

	/** Which of the three texts a draft belongs to. */
	export type $bog_vmap_app_code_slot = 'tree' | 'js' | 'css'

	/**
	 * Editor of the three sources of a node.
	 *
	 * Every text goes through one pair of plain methods, read and write on the same
	 * path: none of them is a `@ $mol_mem`, because writing to a cell freezes its
	 * dependencies and the field would stop following the document after the first
	 * edit made in it. What the cells here hold is only what nothing else can
	 * recompute — the text that failed to parse, and why.
	 *
	 * @see ../../ARCHITECTURE.md sections 1 and 2
	 */
	export class $bog_vmap_app_code extends $.$bog_vmap_app_code {

		/** Whether one node is being edited rather than the class it belongs to. */
		sliced() {
			return Boolean( this.prop() ) && !this.whole()
		}

		override scope_note() {
			const prop = this.prop()
			if( !prop ) return `Весь класс ${ this.klass() }`
			return this.whole() ? `Весь класс ${ this.klass() }` : `Узел ${ prop }`
		}

		/**
		 * Text typed into a field that the document refused, or `null`.
		 *
		 * Kept so that a broken `view.tree` can be fixed where it was written
		 * instead of vanishing on the next redraw. Cleared by the write that parses.
		 *
		 * Keyed by the tab AND by what is being edited in it. Keyed by the tab alone
		 * it would follow the panel rather than the text: a refused edit made on one
		 * node would show up under the name of the next node picked, and correcting
		 * it there would write it into that other node.
		 */
		@ $mol_mem_key
		draft( id: string, next?: string | null ) {
			return next ?? null
		}

		/** Address of a draft: the tab, plus the node when one is being edited. */
		draft_id( slot: $bog_vmap_app_code_slot ) {
			return this.sliced() ? slot + ' ' + this.prop() : slot
		}

		/** Why the last edit was not written into the document. Empty when it was. */
		@ $mol_mem
		override refusal( next?: string ) {
			return next ?? ''
		}

		/**
		 * Writes a text through, keeping it in the field when it is refused.
		 *
		 * A throw out of a setter of `$mol_string` goes into `setCustomValidity`,
		 * which outside a form is nowhere at all, so the message is put on a channel
		 * of our own before anything is thrown. A suspended read passes through
		 * untouched — swallowing it would turn a wait into an error.
		 */
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

		/** `view.tree` of the node, or of the whole document. */
		override tree_text( next?: string ): string {

			if( next === undefined ) {
				return this.draft( this.draft_id( 'tree' ) ) ?? ( this.sliced() ? this.node_source() : this.source() )
			}

			return this.written( 'tree', next, text => {
				if( this.sliced() ) this.node_source( text )
				else this.source( text )
			} )

		}

		/** Properties of the class body, or the reason it could not be cut into them. */
		props_js() {
			return this.$.$bog_vmap_app_code_props_js( this.js() )
		}

		/** Properties of the class styles, the same way. */
		props_css() {
			return this.$.$bog_vmap_app_code_props_css( this.css(), this.klass() )
		}

		/**
		 * Body of the node, which is the methods its declaration asks for.
		 *
		 * NOT one method named after the node. That name belongs to the factory of
		 * the sub-view in the generated class, so a handwritten method of that name
		 * shadows the factory and the node leaves the canvas — measured on the
		 * generator, which emits `Calc(){ const obj = new this.$.$mol_view(); … }`
		 * for a node called `Calc`. What a person opens this tab to write is the
		 * other side of a binding: `title <= greeting` wants `greeting()`.
		 */
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

			// Merged into the body method by method, never written over it: what is
			// on screen is a few methods of a class that has others, and this tab
			// must not be able to delete a method it never showed. A method renamed
			// here leaves the old one behind, and that is the safe half of the trade.
			return this.written( 'js', next, text => {

				const all = this.props_js()

				for( const [ name, code ] of this.$.$bog_vmap_app_code_props_js( text ) ) {
					if( !name ) continue
					this.$.$bog_vmap_app_code_with( all, name, code )
				}

				this.js( this.$.$bog_vmap_app_code_joined( all ) )

			} )

		}

		/** Whether the JS tab has anything for this node to edit at all. */
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

		/** The JS tab: the field when there is something to write in it, the reason when not. */
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

		/**
		 * The slice of one property, or the empty one when the text has no such
		 * property and when it cannot be cut at all.
		 *
		 * A text that does not slice is a state of the panel, not an exception: the
		 * class is still there, still compiles for all we know, and the way out is
		 * the switch to the whole class, which the message names.
		 */
		sliced_read( read: ()=> string | undefined, empty: ()=> string ) {
			try {
				return read() ?? empty()
			} catch( error: unknown ) {
				if( this.$.$mol_promise_like( error ) ) return this.$.$mol_fail_hidden( error )
				return empty()
			}
		}

		/**
		 * Whether the class texts can be cut by property at all.
		 *
		 * A pure derivation, so it is a cell: it reads the two texts and nothing
		 * else, and says the same thing the read path silently works around.
		 */
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

		/**
		 * Untyped parameters of the body, as the export names them.
		 *
		 * The same check the export refuses on, called here so that the author reads
		 * the complaint where the mistake was made rather than at the outbound gate.
		 * A body in the scene goes through `new Function`, which takes any JS, so
		 * nothing else in the editor would ever say a word about this.
		 *
		 * Checked on the text the tab is SHOWING, not on the whole class. That is
		 * what makes the line number true in both modes, and it removes the filter
		 * this used to carry: filtering by the name of the node hid every complaint
		 * a person could actually make, because the one method they must never write
		 * is the one named after the node.
		 */
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

		/** The refusal, or the standing reason the slicing is off. */
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
