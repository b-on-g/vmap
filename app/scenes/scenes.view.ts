namespace $.$$ {

	/**
	 * Switcher of documents for the head bar of the editor.
	 *
	 * Every accessor that writes into the store is a plain method: the values
	 * behind them are atoms, and a `@ $mol_mem` in front of an atom freezes at the
	 * value written through it. The one memoized cell here is read only.
	 *
	 * @see ../../ARCHITECTURE.md section 9
	 */
	export class $bog_vmap_app_scenes extends $.$bog_vmap_app_scenes {

		/**
		 * Titles by link, for the picker.
		 *
		 * Read only, so memoization is safe and worth having: `$mol_select` derives
		 * its option list from this dictionary, and deep comparison in the cell
		 * spares it a rebuild on every unrelated change of the land.
		 */
		@ $mol_mem
		override scene_dict() {

			const store = this.store()
			const dict = {} as { [ link: string ]: string }

			for( const link of store.doc_links() ) {
				dict[ link.str ] = store.doc( link ).title()
			}

			return dict
		}

		/**
		 * The open document, by link. Writing picks; an empty or malformed value
		 * goes back to the default, which is the last document made.
		 */
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

		override title( next?: string ) {
			return this.store().title( next )
		}

		/** Name of the next document, the store's count. */
		add_title() {
			return this.store().title_next()
		}

		/**
		 * Makes a new document and opens it.
		 *
		 * The store method is handed to a fiber of its own, and the name is taken
		 * before it: grabbing a land mines proof of work, the fiber retries on every
		 * `Promise` thrown on the way with its sub-tasks cached, and an argument
		 * computed inside the retry would be recomputed — the list is longer once
		 * the document lands — and would start the work over.
		 */
		override add( next?: Event | null ) {

			const title = this.add_title()
			$mol_wire_async( this.store() ).doc_add( title )

			return null
		}

	}

}
