namespace $.$$ {

	export class $bog_vmap_app_publish extends $.$bog_vmap_app_publish {

		override enabled() {
			return Boolean( this.part() )
		}

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

		@ $mol_mem
		published( next?: string ) {
			return next ?? ''
		}

		@ $mol_mem
		refused( next?: string ) {
			return next ?? ''
		}

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

		override content() {
			return [
				this.Publish(),
				... this.note() ? [ this.Note() ] : [],
				... this.lib_link() ? [ this.Copy() ] : [],
			] as readonly $mol_view[]
		}

	}

}
