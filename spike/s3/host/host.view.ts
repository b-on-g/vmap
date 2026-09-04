namespace $.$$ {

	const bridge_ns = 'bog_vmap_spike_s3'
	const host_secret = 'host-secret-42'

	type Probe = {
		name: string
		open: boolean
		want: 'blocked' | 'open'
		note: string
	}

	type Sizes = {
		width: number
		height: number
		kids: readonly { tag: string, width: number, height: number }[]
		image: { width: number, height: number, uri: string }
	}

	type Line = { text: string, verdict: string }

	/** Host side of the S3 spike. Keeps the secrets, embeds the sandboxed scene, talks by postMessage. */
	export class $bog_vmap_spike_s3_host extends $.$bog_vmap_spike_s3_host {

		/** Plants host-side secrets so that every "blocked" verdict is about real data, not about an empty store. */
		static {
			const ctx = $mol_dom_context

			try {
				ctx.localStorage.setItem( 'bog_vmap_spike_s3_secret', host_secret )
			} catch( error ) {
				console.warn( error )
			}

			try {
				ctx.document.cookie = `bog_vmap_spike_s3_secret=${ host_secret }; path=/`
			} catch( error ) {
				console.warn( error )
			}

			try {
				const request = ctx.indexedDB.open( 'bog_vmap_spike_s3_secret', 1 )
				request.onupgradeneeded = ()=> request.result.createObjectStore( 'secrets' )
				request.onsuccess = ()=> {
					const deal = request.result.transaction( 'secrets', 'readwrite' )
					deal.objectStore( 'secrets' ).put( host_secret, 'key' )
				}
			} catch( error ) {
				console.warn( error )
			}
		}

		error_log = [] as string[]

		override scene_uri() {
			const href = this.$.$mol_dom_context.location.href
			return href.replace( /\/host\/.*$/, '/scene/-/index.html' )
		}

		/**
		 * Untrusted document: two classes, a wire from a free-standing detail into
		 * a node inside the tree, and an asset reference.
		 * `wired_text = Calc result` is the chain operator, it compiles to
		 * `this.Calc().result()`. `<=` walks one level only.
		 */
		doc_src() {
			return [
				'$bog_vmap_spike_s3_doc_calc $mol_view',
				'\tresult \\6 * 7 = 42',
				'',
				'$bog_vmap_spike_s3_doc $mol_view',
				'\tCalc $bog_vmap_spike_s3_doc_calc',
				'\twired_text = Calc result',
				'\tsub /',
				'\t\t<= Head $mol_view',
				'\t\t\tsub /',
				'\t\t\t\t<= head_text \\compiled inside the sandbox',
				'\t\t<= Wired $mol_view',
				'\t\t\tsub /',
				'\t\t\t\t<= wired_text',
				'\t\t<= Shot $mol_image',
				'\t\t\turi \\asset:demo',
				'\t\t\ttitle \\asset bytes over postMessage',
				'',
			].join( '\n' )
		}

		doc_class() {
			return '$bog_vmap_spike_s3_doc'
		}

		/** Freshly encoded PNG. Recomputed per send, because the buffer is transferred away. */
		asset_bytes() {

			const doc = this.$.$mol_dom_context.document
			const canvas = doc.createElement( 'canvas' )
			canvas.width = 96
			canvas.height = 96

			const paint = canvas.getContext( '2d' )!
			paint.fillStyle = '#1e88e5'
			paint.fillRect( 0, 0, 96, 96 )
			paint.fillStyle = '#ffeb3b'
			paint.beginPath()
			paint.arc( 48, 48, 32, 0, Math.PI * 2 )
			paint.fill()

			const base = canvas.toDataURL( 'image/png' ).split( ',' )[1]
			const text = atob( base )
			const bytes = new Uint8Array( text.length )
			for( let i = 0; i < text.length; ++ i ) bytes[i] = text.charCodeAt( i )

			return bytes.buffer
		}

		@ $mol_mem
		handshake( next?: boolean ) {
			return next ?? false
		}

		@ $mol_mem
		probes( next?: readonly Probe[] ) {
			return next ?? []
		}

		@ $mol_mem
		sizes( next?: Sizes ) {
			return next ?? null
		}

		@ $mol_mem
		error_version( next?: number ) {
			return next ?? 0
		}

		@ $mol_mem
		lines(): readonly Line[] {

			const out = [] as Line[]

			out.push({ text: `scene src: ${ this.scene_uri() }`, verdict: 'info' })
			out.push({
				text: `[${ this.handshake() ? 'ok' : '..' }] handshake from sandbox`,
				verdict: this.handshake() ? 'ok' : 'wait',
			})

			for( const probe of this.probes() ) {
				const ok = probe.open === ( probe.want === 'open' )
				out.push({
					text: `[${ ok ? 'ok' : 'LEAK' }] ${ probe.name } -> ${ probe.note }`,
					verdict: ok ? 'ok' : 'leak',
				})
			}

			const sizes = this.sizes()

			if( !sizes ) {
				out.push({ text: '[..] sizes not measured yet', verdict: 'wait' })
			} else {
				out.push({ text: `[ok] sizes back: root ${ sizes.width }x${ sizes.height }`, verdict: 'ok' })
				for( const kid of sizes.kids ) {
					out.push({ text: `     kid <${ kid.tag }> ${ kid.width }x${ kid.height }`, verdict: 'info' })
				}
				out.push({
					text: `[${ sizes.image.width ? 'ok' : 'FAIL' }] blob image decoded in scene:`
						+ ` ${ sizes.image.width }x${ sizes.image.height } from "${ sizes.image.uri }"`,
					verdict: sizes.image.width ? 'ok' : 'leak',
				})
			}

			this.error_version()
			for( const message of this.error_log ) {
				out.push({ text: `[ERR] ${ message }`, verdict: 'leak' })
			}

			return out
		}

		line_ids() {
			return this.lines().map( ( _, index )=> String( index ) )
		}

		override log_rows() {
			return this.line_ids().map( id => this.Row( id ) )
		}

		line( id: string ) {
			return this.lines()[ Number( id ) ]
		}

		override row_text( id: string ) {
			return this.line( id )?.text ?? ''
		}

		override row_verdict( id: string ) {
			return this.line( id )?.verdict ?? ''
		}

		feed( target: Window ) {

			target.postMessage(
				{ ns: bridge_ns, kind: 'doc_set', self: this.doc_class(), src: this.doc_src() },
				'*',
			)

			const bytes = this.asset_bytes()
			target.postMessage(
				{ ns: bridge_ns, kind: 'asset_put', mime: 'image/png', bytes },
				'*',
				[ bytes ],
			)

		}

		message_receive( event?: MessageEvent ) {

			if( !event ) return
			const data = event.data as Record< string, unknown > | null
			if( !data || typeof data !== 'object' ) return
			if( data.ns !== bridge_ns ) return

			if( data.kind === 'probes' ) this.probes( data.probes as readonly Probe[] )

			if( data.kind === 'sizes' ) this.sizes( data.sizes as Sizes )

			if( data.kind === 'error' ) {
				this.error_log.push( String( data.message ) )
				this.error_version( this.error_log.length )
			}

			if( data.kind === 'ready' ) {
				this.handshake( true )
				const source = event.source as Window | null
				if( source ) this.feed( source )
			}

		}

		@ $mol_mem
		message_listener() {
			return new this.$.$mol_dom_listener(
				this.$.$mol_dom_context,
				'message',
				$mol_wire_async( this ).message_receive,
			)
		}

		override auto() {
			return [
				... super.auto(),
				this.message_listener(),
			]
		}

	}

}
