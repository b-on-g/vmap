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
		 * Publishes the picked part. The handler is a fiber already, and the store
		 * method runs inside it: the first publication grabs a land, and the proof
		 * of work is cached for the retries of this very fiber.
		 *
		 * Nothing leaves here but a suspension. A throw out of a click handler is a
		 * speck on the button and a promise nobody awaits, which on the screen is
		 * nothing: measured on the deploy, where a node picked inside another part
		 * has no text of its own and the click died with words nobody saw. So an
		 * error is words on the bar as well, and a suspension is let through — it
		 * is how the fiber waits for the land, and a retry starts over from here.
		 */
		override publish( next?: Event | null ) {

			const part = this.part()
			if( !part ) return null

			let note = ''

			try {
				note = this.attempt( part )
			} catch( error: unknown ) {
				if( this.$.$mol_promise_like( error ) ) return this.$.$mol_fail_hidden( error )
				note = `не удалось опубликовать ${ part }: ${ this.$.$mol_error_message( error ) }`
			}

			this.refused( note )

			return null
		}

		/**
		 * One try at publishing the part, texts read before the write. Answers the
		 * refusal in the user's words, empty once the part went out. A part the
		 * document does not declare — a node picked inside another part — has no
		 * text, and is refused before the store could throw over it.
		 */
		attempt( part: string ) {

			const source = this.source()
			if( !source ) return `деталь ${ part } не объявлена в документе, выберите деталь верхнего уровня`

			const klass = this.store().class_name( part )
			const inlined = this.store().inlined( source, this.doc() )

			const refusal = this.store().refusal( part, inlined.source, this.classes() )
			if( refusal ) return refusal

			this.store().publish( part, inlined.source, this.js(), this.css(), this.classes() )
			this.published( klass )
			this.shared( inlined.shared )

			return ''
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
