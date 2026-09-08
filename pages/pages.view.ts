namespace $.$$ {

	export class $bog_vmap_pages_hero extends $.$bog_vmap_pages_hero {

		count( next?: number ) {
			return next ?? 7
		}

		greeting() {
			return `Seen ${ this.count() } times`
		}

	}
	;( $mol_mem( $bog_vmap_pages_hero.prototype, "count" ) )

	export class $bog_vmap_pages_app extends $.$bog_vmap_pages_app {

		override sub() {

			const doc = this.Doc()

			switch( this.$.$mol_state_arg.value( 'page' ) ) {
				case "About": return [ doc.About() ]
				default: return [ doc.Home() ]
			}

		}

	}

}
