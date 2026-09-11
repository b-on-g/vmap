namespace $.$$ {

	export type $bog_vmap_app_history_tape = {
		readonly states: readonly $bog_vmap_app_store_state[]
		readonly pos: number
	}

	export type $bog_vmap_app_history_stroke = {
		readonly code: string
		readonly command: boolean
		readonly shift: boolean
		readonly alt: boolean
		readonly tag: string
		readonly editable: boolean
	}

	export class $bog_vmap_app_history extends $.$bog_vmap_app_history {

		doc_key() {
			try {
				return this.store().doc_current()?.link().str ?? ''
			} catch( error ) {
				if( $mol_promise_like( error ) ) return ''
				return $mol_fail_hidden( error )
			}
		}

		step_limit() {
			return 100
		}

		step_delay() {
			return 1000
		}

		doc_state(): $bog_vmap_app_store_state {
			const raw = this.state()
			return {
				source: raw.source ?? '',
				js: raw.js ?? {},
				css: raw.css ?? {},
				spots: raw.spots ?? {},
			}
		}

		state_apply( state: $bog_vmap_app_store_state ) {
			this.state( state )
		}

		state_slug( state: $bog_vmap_app_store_state ) {
			return JSON.stringify([ state.source, state.js, state.css, state.spots ])
		}

		@ $mol_mem
		slug() {
			return this.doc_key() + '\t' + this.state_slug( this.doc_state() )
		}

		@ $mol_mem_key
		tape( key: string, next?: $bog_vmap_app_history_tape ): $bog_vmap_app_history_tape {
			return next ?? { states: [], pos: 0 }
		}

		ring( key: string ) {
			return this.tape( key ).states
		}

		pos( key: string ) {
			return this.tape( key ).pos
		}

		override live() {

			const slug = this.slug()
			const tape = this.tape( this.doc_key() )

			return [ this.step_task( slug ), this.snap_task( slug ), tape.states.length + ':' + tape.pos ]
		}

		@ $mol_mem_key
		step_task( slug: string ) {
			if( !slug ) return slug

			$mol_wire_async( this ).step( slug )

			return slug
		}

		step( slug: string ) {

			const key = this.doc_key()

			if( this.ring( key ).length ) this.$.$mol_wait_timeout( this.step_delay() )

			if( $mol_wire_probe( ()=> this.slug() ) !== slug ) return

			const state = $mol_wire_probe( ()=> this.doc_state() )
			if( !state ) return

			this.step_push( key, state )

		}

		step_push( key: string, state: $bog_vmap_app_store_state ) {

			const tape = this.tape( key )
			const slug = this.state_slug( state )

			if( tape.states.length && this.state_slug( tape.states[ tape.pos ] ) === slug ) return

			const states = [ ... tape.states.slice( 0, tape.pos + 1 ), state ].slice( - this.step_limit() )

			this.tape( key, { states, pos: states.length - 1 } )

		}

		step_move( shift: number ) {

			const key = this.doc_key()
			const tape = this.tape( key )
			const pos = tape.pos + shift

			if( pos < 0 || pos >= tape.states.length ) return

			this.tape( key, { states: tape.states, pos } )

			this.state_apply( tape.states[ pos ] )

		}

		override undoable() {
			return this.pos( this.doc_key() ) > 0
		}

		override redoable() {
			const key = this.doc_key()
			return this.pos( key ) < this.ring( key ).length - 1
		}

		@ $mol_action
		override undo( next?: Event | null ) {
			this.step_move( -1 )
			return null
		}

		@ $mol_action
		override redo( next?: Event | null ) {
			this.step_move( 1 )
			return null
		}

		now() {
			return Date.now()
		}

		snap_delay() {
			return 5000
		}

		preview_limit() {
			return 20
		}

		override editable() {
			try {
				return this.store().doc_editable()
			} catch( error ) {
				if( $mol_promise_like( error ) ) return false
				return $mol_fail_hidden( error )
			}
		}

		snaps(): readonly $bog_vmap_app_doc_snap[] {
			const doc = this.store().doc_current()
			return doc ? this.store().snaps( doc ) : []
		}

		@ $mol_mem
		snap_links(): readonly string[] {
			return this.snaps().map( snap => snap.link().str ).reverse()
		}

		override snap_rows() {
			return this.snap_links().map( link => this.Snap_row( link ) )
		}

		snap_at( link: string ) {
			return this.snaps().find( snap => snap.link().str === link ) ?? null
		}

		@ $mol_mem_key
		override snap_moment( link: string ) {
			const snap = this.snap_at( link )
			if( !snap ) return ''

			return new this.$.$mol_time_moment(
				new Date( snap.time() )
			).toString( 'YYYY-MM-DD hh:mm:ss' )
		}

		@ $mol_mem_key
		override snap_author( link: string ) {
			return this.snap_at( link )?.author() ?? ''
		}

		@ $mol_mem_key
		override snap_preview( link: string ) {

			const snap = this.snap_at( link )
			if( !snap ) return ''

			const lines = snap.source().split( '\n' )
			const limit = this.preview_limit()

			return lines.length > limit
				? lines.slice( 0, limit ).join( '\n' ) + '\n…'
				: lines.join( '\n' )
		}

		snap_newest() {
			return this.snaps().at( -1 ) ?? null
		}

		snap_make( time: number ) {

			const store = this.store()

			const doc = store.doc_current()
			if( !doc ) return null
			if( !doc.can_change() ) return null

			const state = this.doc_state()
			const newest = this.snap_newest()

			if( newest && this.state_slug( store.snap_state( newest ) ) === this.state_slug( state ) ) return null

			return store.snap_add( doc, state, time )
		}

		@ $mol_mem_key
		snap_task( slug: string ) {
			if( !slug ) return slug

			$mol_wire_async( this ).snap_step( slug )

			return slug
		}

		snap_step( slug: string ) {

			this.$.$mol_wait_timeout( this.snap_delay() )

			if( $mol_wire_probe( ()=> this.slug() ) !== slug ) return

			this.snap_make( this.now() )

		}

		@ $mol_mem_key
		note_at( slug: string, next?: string ) {
			return next ?? ''
		}

		override note( next?: string ) {
			return this.note_at( this.slug(), next )
		}

		override content() {
			return [
				this.Head(),
				this.Steps(),
				... this.note() ? [ this.Note() ] : [],
				this.List(),
			] as readonly $mol_view[]
		}

		snap_press() {

			const doc = this.store().doc_current()
			if( !doc ) return this.note( 'Сцена ещё заводится, снимать нечего' )
			if( !doc.can_change() ) return this.note( 'Чужая сцена: снимок в неё не пишется' )

			this.note( this.snap_make( this.now() ) ? '' : 'Изменений с прошлого снимка нет' )

		}

		override snap_take( next?: Event | null ) {
			$mol_wire_async( this ).snap_press()
			return null
		}

		@ $mol_mem_key
		override snap_change( link: string ) {

			const snaps = this.snaps()
			const index = snaps.findIndex( snap => snap.link().str === link )
			if( index < 0 ) return ''

			const store = this.store()

			return this.$.$bog_vmap_app_history_change(
				index > 0 ? store.snap_state( snaps[ index - 1 ] ) : null,
				store.snap_state( snaps[ index ] ),
			)

		}

		snap_revert( link: string ) {

			const snap = this.snap_at( link )
			if( !snap ) return

			const state = this.store().snap_state( snap )

			this.snap_make( this.now() )

			this.state_apply( state )

		}

		override snap_back( link: string, next?: Event | null ) {
			$mol_wire_async( this ).snap_revert( link )
			return null
		}

		stroke_kind( stroke: $bog_vmap_app_history_stroke ) {

			if( stroke.code !== 'KeyZ' ) return null
			if( !stroke.command ) return null
			if( stroke.alt ) return null
			if( stroke.editable ) return null
			if( /^(INPUT|TEXTAREA|SELECT|IFRAME)$/.test( stroke.tag ) ) return null

			return stroke.shift ? 'redo' as const : 'undo' as const
		}

		hotkey_kind( event: KeyboardEvent ) {

			const target = event.target as HTMLElement | null

			return this.stroke_kind({
				code: event.code,
				command: event.metaKey || event.ctrlKey,
				shift: event.shiftKey,
				alt: event.altKey,
				tag: target?.tagName ?? '',
				editable: Boolean( target?.isContentEditable ),
			})

		}

		override press( event?: KeyboardEvent | null ) {

			if( !event ) return false

			const kind = this.hotkey_kind( event )
			if( !kind ) return false

			event.preventDefault()

			if( kind === 'undo' ) this.undo()
			else this.redo()

			return true
		}

	}

}
