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
		 */
		@ $mol_mem_key
		draft( slot: $bog_vmap_app_code_slot, next?: string | null ) {
			return next ?? null
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

			try {
				write( next )
			} catch( error: unknown ) {
				if( this.$.$mol_promise_like( error ) ) return this.$.$mol_fail_hidden( error )
				this.draft( slot, next )
				this.refusal( String( ( error as Error )?.message ?? error ) )
				return next
			}

			this.draft( slot, null )
			this.refusal( '' )

			return next
		}

		/** `view.tree` of the node, or of the whole document. */
		override tree_text( next?: string ): string {

			if( next === undefined ) {
				return this.draft( 'tree' ) ?? ( this.sliced() ? this.node_source() : this.source() )
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

		override js_text( next?: string ): string {

			if( !this.sliced() ) {
				if( next === undefined ) return this.draft( 'js' ) ?? this.js()
				return this.written( 'js', next, text => this.js( text ) )
			}

			const prop = this.prop()

			if( next === undefined ) {
				return this.draft( 'js' ) ?? this.sliced_read(
					()=> this.props_js().get( prop ),
					()=> this.$.$bog_vmap_app_code_js_default( prop, this.prop_key(), this.prop_next() ),
				)
			}

			return this.written( 'js', next, text => this.js(
				this.$.$bog_vmap_app_code_joined(
					this.$.$bog_vmap_app_code_with( this.props_js(), prop, text )
				)
			) )

		}

		override css_text( next?: string ): string {

			if( !this.sliced() ) {
				if( next === undefined ) return this.draft( 'css' ) ?? this.css()
				return this.written( 'css', next, text => this.css( text ) )
			}

			const prop = this.prop()
			const key = prop.toLowerCase()

			if( next === undefined ) {
				return this.draft( 'css' ) ?? this.sliced_read(
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
		 * While one node is being edited only its own method is complained about:
		 * the neighbours are not on screen, and a line about a method the panel does
		 * not show is a line nobody can act on.
		 */
		@ $mol_mem
		complaints(): readonly $bog_vmap_app_export_complaint[] {

			const all = this.$.$bog_vmap_app_export_untyped( this.js() )
			if( !this.sliced() ) return all

			const prop = this.prop()
			return all.filter( one => one.method === prop )
		}

		override typing_rows() {
			return this.complaints().map( ( _, index )=> this.Typing_row( index ) )
		}

		@ $mol_mem_key
		override typing_text( index: number ) {
			return this.complaints()[ index ]?.text ?? ''
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
