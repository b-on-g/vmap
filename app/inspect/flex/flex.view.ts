namespace $.$$ {

	export class $bog_vmap_app_inspect_flex extends $.$bog_vmap_app_inspect_flex {

		override width( next?: string ) {
			return this.value( 'width', next )
		}

		override direction( next?: string ) {
			return this.value( 'flexDirection', next )
		}

		override across( next?: string ) {
			return this.value( 'alignItems', next )
		}

		override along( next?: string ) {
			return this.value( 'justifyContent', next )
		}

		override gap( next?: string ) {
			return this.value( 'gap', next )
		}

		override grow( next?: boolean ) {

			if( next === undefined ) return this.value( 'flexGrow' ) === '1'

			this.value( 'flexGrow', next ? '1' : '' )

			return next
		}

	}

}
