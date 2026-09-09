namespace $.$$ {

	/**
	 * The shelf of ready made things, with the palette of classes under it.
	 *
	 * Holds the drag for both levels: an item and a class differ only in how their
	 * source is made, and by the time the pointer is carrying something the canvas
	 * has to see one kind of thing. Where the drag ends is a canvas question and is
	 * answered by whoever owns the canvas.
	 *
	 * @see ../../ARCHITECTURE.md section 5
	 */
	export class $bog_vmap_app_shelf extends $.$bog_vmap_app_shelf {

		/**
		 * Shelf first, then the switch of the second level, then the level itself
		 * while it is open.
		 *
		 * Folded away it is not rendered at all, and that is the point of the
		 * branch: the palette fetches the class tree of the pack the moment it is
		 * drawn, and a panel nobody opened should not pay for it.
		 */
		override body() {
			return [
				this.Title(),
				this.Items(),
				this.Level(),
				... this.classes_showed() ? [ this.Palette() ] : [],
			] as readonly $mol_view[]
		}

		/** Everything the shelf offers, in the order it offers it. */
		items(): readonly $bog_vmap_app_shelf_item[] {
			return this.$.$bog_vmap_app_shelf_presets()
		}

		/**
		 * An item by id, including one that is not on the shelf at all.
		 *
		 * A class dragged out of the second level has its class name for an id and
		 * becomes an item on the spot, so the canvas is handed the same thing
		 * whichever level the gesture started on.
		 */
		item( id: string ): $bog_vmap_app_shelf_item | null {

			if( !id ) return null

			if( id[ 0 ] === '$' ) return {
				id,
				title: this.$.$bog_vmap_app_shelf_short( id ),
				hint: id,
				source: this.$.$bog_vmap_app_shelf_single( id ),
			}

			return this.items().find( item => item.id === id ) ?? null
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

		/** The piece the pointer is carrying, or nothing while it carries nothing. */
		drag_source() {
			return this.item( this.dragged() )?.source ?? ''
		}

		/** What the ghost at the pointer says. */
		drag_title() {
			return this.item( this.dragged() )?.title ?? ''
		}

		/**
		 * A press on a row starts carrying it.
		 *
		 * The pointer position is taken here and moved by the owner of the canvas:
		 * the shelf knows when a drag begins and nothing about where it ends.
		 */
		@ $mol_action
		item_drag( id: string, event?: PointerEvent | null ) {

			if( !event ) return

			this.drag_x( event.clientX )
			this.drag_y( event.clientY )
			this.dragged( id )

		}

		/** A click without a drag asks for the item in the middle of the canvas. */
		@ $mol_action
		item_click( id: string, event?: Event | null ) {
			this.place( id )
		}

	}

}
