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

		override current( next?: string ) {

			const store = this.store()

			if( next !== undefined ) {
				const checked = next ? $giper_baza_link.check( next ) : null
				store.doc_pick( checked ? new $giper_baza_link( checked ) : null )
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
