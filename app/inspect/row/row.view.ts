namespace $.$$ {

	export class $bog_vmap_app_inspect_row extends $.$bog_vmap_app_inspect_row {

		override path() {
			return [ ... this.sign().matchAll( $mol_view_tree2_prop_signature ) ][ 0 ]?.groups?.name ?? this.sign()
		}

		share_here() {
			return this.share_able( this.path() )
		}

		mark_here() {
			return this.share_mark( this.path() )
		}

		@ $mol_action
		share_click( next?: Event | null ) {
			this.share( this.path(), next ?? null )
			return null
		}

		@ $mol_action
		unshare_click( next?: Event | null ) {
			this.share_unshare( this.path(), next ?? null )
			return null
		}

		override mark_sub() {
			return [ this.mark_here() ] as readonly $mol_view_content[]
		}

		override tools() {

			if( this.inherited() ) return [] as readonly $mol_view[]

			return [
				... this.share_here() ? [ this.Share() ] : [],
				... this.mark_here() ? [ this.Unshare() ] : [],
				this.Key(),
				this.Next(),
				this.Drop(),
			] as readonly $mol_view[]
		}

		override content() {
			return [
				this.control(),
				... this.mark_here() ? [ this.Mark() ] : [],
				... this.frozen() ? [ this.Frozen() ] : [],
			] as readonly $mol_view_content[]
		}

	}

}
