namespace $.$$ {

	export class $bog_vmap_app_shelf extends $.$bog_vmap_app_shelf {

		override body() {
			return [
				this.Title(),
				this.Source(),
				... this.classes_showed() ? [] : [ this.Stack() ],
				this.Level(),
				... this.classes_showed() ? [ this.Palette() ] : [],
			] as readonly $mol_view[]
		}

		stack_content() {
			return [
				this.Items(),
				this.Apps(),
			] as readonly $mol_view[]
		}

		packs() {
			return this.$.$bog_vmap_app_shelf_packs()
		}

		pack_offer( id: string ) {
			return this.packs().find( offer => offer.id === id ) ?? null
		}

		pack_rows() {
			return this.packs().map( offer => this.Pack_row( offer.id ) )
		}

		override pack_title( id: string ) {
			return this.pack_offer( id )?.title ?? ''
		}

		override pack_hint( id: string ) {
			return this.pack_offer( id )?.hint ?? ''
		}

		override pack_current( id: string ) {
			const link = this.pack_offer( id )?.link ?? ''
			if( !link ) return !this.links_parsed().pack

			return this.$.$bog_vmap_lib_slashed( link ) === this.pack_link()
		}

		@ $mol_action
		override pack_click( id: string ) {
			this.links( this.$.$bog_vmap_app_shelf_pack_swap( this.links(), this.pack_offer( id )?.link ?? '' ) )
			return null
		}

		source_content() {
			return [
				this.Packs(),
				this.Links(),
				... this.rejected_note() ? [ this.Note() ] : [],
				this.Import(),
				... this.import_note() ? [ this.Import_note() ] : [],
			] as readonly $mol_view[]
		}

		override files( next?: readonly File[] ) {

			if( next?.length ) $mol_wire_async( this ).intake( next )

			return [] as readonly File[]
		}

		intake( files: readonly { readonly name: string, text(): Promise< string > }[] ) {

			const brought = files.map( file => ({
				name: file.name,
				text: $mol_wire_sync( file ).text(),
			}) )

			const taken = this.$.$bog_vmap_app_shelf_intake( brought )

			this.import_note( this.$.$bog_vmap_app_shelf_intake_note( taken ) )

			if( !taken.classes.length ) return

			let link = ''
			for( const one of taken.classes ) link = this.Store().import_class( one.tree, '', one.css )

			this.link_attach( link )

		}

		link_attach( link: string ) {

			if( !link ) return

			const links = this.links()
			if( links.split( /[,\s]+/ ).includes( link ) ) return

			this.links( links ? `${ links }, ${ link }` : link )

		}

		@ $mol_mem
		links_parsed() {
			return this.$.$bog_vmap_lib_links_parse( this.links() )
		}

		rejected_note() {
			return this.$.$bog_vmap_lib_links_note( this.links_parsed() )
		}

		@ $mol_mem
		app_state(): { readonly list: readonly string[], readonly error: string } {

			try {
				return {
					list: this.class_list().filter( name => !name.startsWith( '$mol_' ) ),
					error: '',
				}
			} catch( error: unknown ) {

				if( $mol_promise_like( error ) ) return $mol_fail_hidden( error )

				return {
					list: [],
					error: this.$.$bog_vmap_lib_pack_note( this.pack_tree_link(), error ),
				}
			}

		}

		pack_tree_link() {
			return this.Palette().Lib().tree_link()
		}

		app_list() {
			return this.app_state().list
		}

		app_rows() {
			return this.app_list().map( name => this.Item_row( name ) )
		}

		app_error() {
			return this.app_state().error
		}

		apps_content() {
			return [
				this.Apps_head(),
				... this.app_error() ? [ this.Apps_note() ] : [ this.App_list() ],
			] as readonly $mol_view[]
		}

		apps_title() {
			if( this.app_error() ) return 'Приложение не отвечает'
			return this.app_list().length ? 'Объекты приложения' : 'Приложение не подключено'
		}

		items(): readonly $bog_vmap_app_shelf_item[] {
			return this.$.$bog_vmap_app_shelf_presets()
		}

		item( id: string ): $bog_vmap_app_shelf_item | null {

			if( !id ) return null

			const own = this.items().find( item => item.id === id )
			if( own ) return own

			if( id[ 0 ] !== '$' ) return null

			return {
				id,
				title: this.$.$bog_vmap_app_shelf_short( id ),
				hint: id,
				source: this.$.$bog_vmap_app_shelf_single( id ),
			}

		}

		item_rows() {
			return this.items().map( item => this.Item_row( item.id ) )
		}

		item_title( id: string ) {
			return this.item( id )?.title ?? id
		}

		item_hint( id: string ) {
			return this.item( id )?.hint ?? ''
		}

		override item_source( id: string ) {
			return this.item( id )?.source ?? ''
		}

		override drag_source() {
			return this.item_source( this.dragged() )
		}

		override drag_title() {
			return this.item( this.dragged() )?.title ?? ''
		}

		@ $mol_action
		item_drag( id: string, event?: PointerEvent | null ) {

			if( !event ) return

			this.drag_x( event.clientX )
			this.drag_y( event.clientY )
			this.dragged( id )

		}

		@ $mol_action
		item_click( id: string, event?: Event | null ) {
			this.place( id )
		}

	}

}
