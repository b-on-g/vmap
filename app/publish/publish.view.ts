namespace $.$$ {

	/**
	 * The publish button of the head bar and the link it produces.
	 *
	 * Every value read from the store is a plain method: the values behind them are
	 * atoms, and a `@ $mol_mem` in front of an atom freezes at what was written
	 * through it. The one memoized cell here is what was published this session.
	 *
	 * @see ../../ARCHITECTURE.md sections 5 and 9
	 */
	export class $bog_vmap_app_publish extends $.$bog_vmap_app_publish {

		override enabled() {
			return Boolean( this.part() )
		}

		/** Library class the picked part would be published as, or empty. */
		class_name() {
			const part = this.part()
			return part ? this.store().class_name( part ) : ''
		}

		override publish_hint() {
			const klass = this.class_name()
			return klass
				? `Опубликовать ${ this.part() } в библиотеку как ${ klass }`
				: 'Выберите деталь на холсте, чтобы опубликовать её в библиотеку'
		}

		override lib_link() {
			return this.store().link()
		}

		/** Class published this session, last. Empty until the first click. */
		@ $mol_mem
		published( next?: string ) {
			return next ?? ''
		}

		/** Why the last click did nothing, in the user's words. Empty when it did. */
		@ $mol_mem
		refused( next?: string ) {
			return next ?? ''
		}

		/** Sub-views that went out as a copy because the document reads them too. */
		@ $mol_mem
		shared( next?: readonly string[] ) {
			return next ?? [] as readonly string[]
		}

		override note() {

			const refused = this.refused()
			if( refused ) return refused

			const klass = this.published()
			if( !klass ) return ''

			const shared = this.shared()
			const copied = shared.length
				? `, под-виды ${ shared.join( ', ' ) } ушли копией, документ читает их и сам`
				: ''

			return `опубликовано ${ klass }${ copied }:`
		}

		/**
		 * Publishes the picked part.
		 *
		 * The handler is a fiber already, and the store method runs inside it: the
		 * first publication grabs a land, and the proof of work is cached for the
		 * retries of this very fiber. The texts are read before the write. A part
		 * wired to the document is refused with the reason on the bar, nothing written.
		 */
		override publish( next?: Event | null ) {

			const part = this.part()
			if( !part ) return null

			const klass = this.store().class_name( part )
			const { source, shared } = this.store().inlined( this.source(), this.doc() )

			// A wired part is a state of the bar, not an exception on the button: a
			// throw out of the handler goes to the fiber, and the user sees nothing.
			const refusal = this.store().refusal( part, source, this.classes() )
			this.refused( refusal )
			if( refusal ) return null

			this.store().publish( part, source, this.js(), this.css(), this.classes() )
			this.published( klass )
			this.shared( shared )

			return null
		}

		/** The button always; the link once there is one; the note once something went out. */
		override content() {
			return [
				this.Publish(),
				... this.note() ? [ this.Note() ] : [],
				... this.lib_link() ? [ this.Copy() ] : [],
			] as readonly $mol_view[]
		}

	}

}
