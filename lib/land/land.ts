namespace $ {

	export class $bog_vmap_lib_land_part extends $giper_baza_dict.with({

		Tree: $giper_baza_atom_text,

		Js: $giper_baza_atom_text,

		Css: $giper_baza_atom_text,

	}) {

		tree( next?: string ) {
			return this.Tree( next )?.val( next ) ?? ''
		}

		js( next?: string ) {
			return this.Js( next )?.val( next ) ?? ''
		}

		css( next?: string ) {
			return this.Css( next )?.val( next ) ?? ''
		}

	}

	export class $bog_vmap_lib_land_shelf extends $giper_baza_dict.with({

		Title: $giper_baza_atom_text,

		Parts: $giper_baza_list_link.to( ()=> $bog_vmap_lib_land_part ),

	}) {

		title( next?: string ) {
			return this.Title( next )?.val( next ) ?? ''
		}

		parts() {

			const links = this.Parts()?.items()?.filter( $mol_guard_defined ) ?? []
			const land = this.land()

			return links.map(
				link => land.Pawn( $bog_vmap_lib_land_part ).Head( link.head() )
			)
		}

	}

	export class $bog_vmap_lib_land extends $bog_vmap_lib_any {

		shelf(): $bog_vmap_lib_land_shelf | null {
			return null
		}

		@ $mol_mem
		parts(): readonly $bog_vmap_lib_land_part[] {
			return this.shelf()?.parts() ?? []
		}

		@ $mol_mem
		source() {
			return this.parts().map( part => part.tree().replace( /\n?$/, '\n' ) ).join( '' )
		}

		@ $mol_mem
		override tree() {
			return this.$.$bog_vmap_lib_parse( this.source(), 'land' )
		}

		@ $mol_mem
		class_trees(): readonly $mol_tree2[] {
			return this.$.$mol_view_tree2_normalize(
				this.$.$mol_tree2_from_string( this.source(), 'land' )
			).kids
		}

		@ $mol_mem
		js(): { readonly [ klass: string ]: string } {

			const res = {} as { [ klass: string ]: string }

			for( const part of this.parts() ) {

				const body = part.js()
				if( !body ) continue

				const name = this.$.$bog_vmap_lib_land_name( part.tree() )
				if( name ) res[ name ] = body

			}

			return res
		}

		@ $mol_mem
		css() {
			return this.parts().map( part => part.css() ).filter( Boolean ).join( '\n' )
		}

	}

	export type $bog_vmap_lib_land_text = {
		readonly tree: string
		readonly js: string
		readonly css: string
	}

	export class $bog_vmap_lib_land_stack extends $bog_vmap_lib {

		lands(): readonly string[] {
			return []
		}

		@ $mol_mem_key
		land( link: string ): $bog_vmap_lib_land {
			return $bog_vmap_lib_land.make({
				$: this.$,
				shelf: ()=> this.$.$giper_baza_glob
					.Land( new $giper_baza_link( link ).land() )
					.Data( $bog_vmap_lib_land_shelf ),
			})
		}

		@ $mol_mem
		libs() {
			return this.lands().map( link => this.land( link ) )
		}

		@ $mol_mem
		land_trees(): readonly $mol_tree2[] {
			return this.libs().flatMap( lib => lib.class_trees() )
		}

		override classes() {
			return this.land_trees()
		}

		@ $mol_mem
		parts(): readonly $bog_vmap_lib_land_text[] {
			return this.libs().flatMap( lib => lib.parts().map( part => ({
				tree: part.tree(),
				js: part.js(),
				css: part.css(),
			}) ) )
		}

	}

	export function $bog_vmap_lib_land_name( source: string ) {
		return /^([^\s]+)/.exec( source.trimStart() )?.[ 1 ] ?? ''
	}

}
