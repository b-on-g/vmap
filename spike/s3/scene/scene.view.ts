namespace $.$$ {

	const bridge_ns = 'bog_vmap_spike_s3'

	type Probe = {
		name: string
		open: boolean
		want: 'blocked' | 'open'
		note: string
	}

	/** Sandbox side of the S3 spike. Runs untrusted code, talks to the host only by postMessage. */
	export class $bog_vmap_spike_s3_scene extends $.$bog_vmap_spike_s3_scene {

		compile_error = ''

		/** Source of the document class, as delivered by the host. */
		@ $mol_mem
		doc_src( next?: string ) {
			return next ?? ''
		}

		/** Name of the root class inside the delivered source. */
		@ $mol_mem
		doc_class( next?: string ) {
			return next ?? ''
		}

		@ $mol_mem
		override image_uri( next?: string ) {
			return next ?? ''
		}

		@ $mol_mem
		probes( next?: readonly Probe[] ) {
			return next ?? []
		}

		override shot_rows() {
			return this.image_uri() ? [ this.Shot() ] : []
		}

		probe_ids() {
			return this.probes().map( ( _, index ) => String( index ) )
		}

		override probe_rows() {
			return this.probe_ids().map( id => this.Probe( id ) )
		}

		probe( id: string ) {
			return this.probes()[ Number( id ) ]
		}

		override probe_verdict( id: string ) {
			const probe = this.probe( id )
			if( !probe ) return ''
			return probe.open === ( probe.want === 'open' ) ? 'ok' : 'leak'
		}

		override probe_text( id: string ) {
			const probe = this.probe( id )
			if( !probe ) return ''
			const mark = this.probe_verdict( id ) === 'ok' ? '[ok]' : '[LEAK]'
			return `${ mark } ${ probe.name } -> ${ probe.note }`
		}

		/** Compiled document instance, owned by this cell. */
		@ $mol_mem
		override preview(): readonly $mol_view[] {

			const src = this.doc_src()
			const self = this.doc_class()
			if( !src || !self ) return []

			try {
				const made = this.compile( src, self )
				this.compile_error = ''
				return [ made ]
			} catch( error: any ) {
				if( error instanceof Promise ) return $mol_fail_hidden( error )
				this.compile_error = String( error?.message ?? error )
				return []
			}

		}

		/** view.tree text -> live class -> live instance, all inside this document. */
		compile( src: string, self: string ) {

			const wired = src.split( 'asset:demo' ).join( this.image_uri() )

			const ast = this.$.$mol_tree2_from_string( wired, 'doc.view.tree' )
			const js = this.$.$mol_tree2_text_to_string( this.$.$mol_view_tree2_to_text( ast ) )

			const sandbox = Object.create( this.$ ) as $
			;( sandbox as { $: $ } ).$ = sandbox

			new Function( '$', js )( sandbox )

			const Class = ( sandbox as unknown as Record< string, typeof $mol_view > )[ self ]
			if( !Class ) throw new Error( `Class ${ self } is not defined by the source` )

			return Class.make({ $: sandbox })
		}

		post( message: Record< string, unknown > ) {
			const ctx = this.$.$mol_dom_context as unknown as { parent: Window }
			ctx.parent.postMessage({ ns: bridge_ns, ... message }, '*' )
		}

		brief( value: unknown ) {
			if( value === null ) return 'null'
			if( value === undefined ) return 'undefined'
			if( typeof value === 'object' ) return Object.prototype.toString.call( value )
			return String( value ).slice( 0, 80 )
		}

		probe_list(): readonly Probe[] {

			const ctx = this.$.$mol_dom_context as any
			const list = [] as Probe[]

			const check = ( name: string, want: 'blocked' | 'open', task: ()=> unknown ) => {
				try {
					list.push({ name, want, open: true, note: 'returned ' + this.brief( task() ) })
				} catch( error: any ) {
					list.push({
						name,
						want,
						open: false,
						note: `${ error?.name ?? 'Error' }: ${ String( error?.message ?? error ).slice( 0, 160 ) }`,
					})
				}
			}

			check( 'framed', 'open', ()=> ctx.parent !== ctx.self )
			check( 'own origin', 'open', ()=> ctx.origin )

			check( 'parent.document', 'blocked', ()=> ctx.parent.document )
			check( 'parent.location.href', 'blocked', ()=> ctx.parent.location.href )
			check( 'parent.$mol_wire_auto', 'blocked', ()=> ctx.parent.$mol_wire_auto )
			check( 'parent.localStorage', 'blocked', ()=> ctx.parent.localStorage )
			check( 'parent.indexedDB', 'blocked', ()=> ctx.parent.indexedDB )

			check( 'own localStorage', 'blocked', ()=> ctx.localStorage.getItem( 'bog_vmap_spike_s3_secret' ) )
			check( 'own indexedDB.open', 'blocked', ()=> ctx.indexedDB.open( 'bog_vmap_spike_s3_secret' ) )
			check( 'own document.cookie', 'blocked', ()=> ctx.document.cookie )

			check( 'parent.postMessage', 'open', ()=> typeof ctx.parent.postMessage )

			return list
		}

		@ $mol_action
		report_ready() {
			const probes = this.probe_list()
			this.probes( probes )
			this.post({ kind: 'probes', probes })
			this.post({ kind: 'ready' })
		}

		@ $mol_mem
		boot() {
			return new this.$.$mol_after_tick( ()=> this.report_ready() )
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
		measure_task() {
			this.doc_src()
			this.image_uri()
			return new this.$.$mol_after_timeout( 250, ()=> this.measure_send() )
		}

		/** The blob image decodes asynchronously, so the measurement is redone once it lands. */
		@ $mol_action
		override shot_load( next?: Event ) {
			this.measure_send()
			return null
		}

		measure_send() {
			try {
				this.measure_post()
			} catch( error: any ) {
				if( error instanceof Promise ) return
				this.post({ kind: 'error', message: 'measure: ' + String( error?.message ?? error ) })
			}
		}

		measure_post() {

			const node = this.Preview().dom_node()
			const rect = node.getBoundingClientRect()

			const kids = Array.from( node.children ).map( kid => {
				const box = kid.getBoundingClientRect()
				return {
					tag: kid.tagName.toLowerCase(),
					width: Math.round( box.width ),
					height: Math.round( box.height ),
				}
			} )

			const uri = this.image_uri()
			const shot = uri ? this.Shot().dom_node() as HTMLImageElement : null

			this.post({
				kind: 'sizes',
				sizes: {
					width: Math.round( rect.width ),
					height: Math.round( rect.height ),
					kids,
					image: {
						uri: uri.slice( 0, 34 ),
						width: shot?.naturalWidth ?? 0,
						height: shot?.naturalHeight ?? 0,
					},
				},
			})

			if( this.compile_error ) this.post({ kind: 'error', message: 'compile: ' + this.compile_error })

			const broken = node.querySelector( '[mol_view_error]' )?.getAttribute( 'mol_view_error' )
			if( broken && broken !== 'Promise' ) this.post({ kind: 'error', message: 'render: ' + broken })

		}

		message_receive( event?: MessageEvent ) {

			if( !event ) return
			const data = event.data as Record< string, unknown > | null
			if( !data || typeof data !== 'object' ) return
			if( data.ns !== bridge_ns ) return

			if( data.kind === 'doc_set' ) {
				this.doc_class( String( data.self ) )
				this.doc_src( String( data.src ) )
			}

			if( data.kind === 'asset_put' ) {
				const blob = new Blob( [ data.bytes as ArrayBuffer ], { type: String( data.mime ) } )
				this.image_uri( URL.createObjectURL( blob ) )
			}

		}

		override auto() {
			return [
				... super.auto(),
				this.message_listener(),
				this.boot(),
				this.measure_task(),
			]
		}

	}

}
