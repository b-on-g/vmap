namespace $.$$ {

	export class $bog_vmap_app_scenes extends $.$bog_vmap_app_scenes {

		@ $mol_mem
		scene_links(): readonly string[] {
			return this.store().doc_links().map( link => link.str )
		}

		scene_rows() {
			return this.scene_links().map( link => this.Scene_row( link ) )
		}

		scene_link( link: string ) {
			return this.store().doc_links().find( item => item.str === link ) ?? null
		}

		scene_title( link: string ) {
			const found = this.scene_link( link )
			return found ? this.store().doc( found ).title() : ''
		}

		scene_current( link: string ) {
			return link === this.current()
		}

		@ $mol_action
		scene_click( link: string, event?: Event | null ) {
			this.current( link )
		}

		@ $mol_mem
		menu( next?: { readonly link: string, readonly spot: readonly [ number, number ] } | null ) {
			return next ?? null
		}

		@ $mol_mem
		menu_asking( next?: boolean ) {
			return next ?? false
		}

		menu_link() {
			return this.menu()?.link ?? ''
		}

		override menu_showed( next?: boolean ) {
			if( next === false ) this.menu( null )
			return Boolean( this.menu() )
		}

		override menu_left() {
			return ( this.menu()?.spot[0] ?? 0 ) + 'px'
		}

		override menu_top() {
			return ( this.menu()?.spot[1] ?? 0 ) + 'px'
		}

		override menu_items(): readonly $mol_view[] {
			if( !this.menu() ) return []

			return this.menu_asking()
				? [ this.Drop_note(), this.Drop_yes(), this.Drop_no() ]
				: [ this.Drop() ]
		}

		override drop_note() {
			return `Удалить «${ this.scene_title( this.menu_link() ) }»? Ссылка на сцену продолжит работать`
		}

		@ $mol_action
		override menu_close() {
			this.menu_asking( false )
			this.menu( null )
			return null
		}

		@ $mol_action
		override scene_menu( link: string, event?: Event | null ) {

			const mouse = event as MouseEvent | null | undefined
			if( !mouse ) return null

			mouse.preventDefault()

			const rect = this.view_rect()

			this.menu_asking( false )
			this.menu({
				link,
				spot: [ mouse.clientX - ( rect?.left ?? 0 ), mouse.clientY - ( rect?.top ?? 0 ) ],
			})

			return null
		}

		@ $mol_action
		override drop_ask() {
			this.menu_asking( true )
			return null
		}

		@ $mol_action
		override drop() {

			const link = this.scene_link( this.menu_link() )
			if( link ) this.store().doc_drop( link )

			return null
		}

		override current( next?: string ) {

			const store = this.store()

			if( next !== undefined ) {
				const checked = next ? $giper_baza_link.check( next ) : null
				store.doc_pick( checked )
			}

			return store.doc_current()?.link().str ?? ''
		}

		override current_exists() {
			return Boolean( this.store().doc_current() )
		}

		override doc_title( next?: string ) {
			return this.store().title( next )
		}

		add_title() {
			return this.store().title_next()
		}

		override add( next?: Event | null ) {

			const title = this.add_title()
			$mol_wire_async( this.store() ).doc_add( title )

			return null
		}

	}

}
