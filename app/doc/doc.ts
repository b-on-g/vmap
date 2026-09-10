namespace $ {

	export class $bog_vmap_app_doc_node extends $giper_baza_dict.with({

		Tree: $giper_baza_atom_text,

		Js: $giper_baza_atom_text,

		Css: $giper_baza_atom_text,

	}) {

		source( next?: string ) {
			return this.Tree( next )?.val( next ) ?? ''
		}

		js( next?: string ) {
			return this.Js( next )?.val( next ) ?? ''
		}

		css( next?: string ) {
			return this.Css( next )?.val( next ) ?? ''
		}

	}

	export class $bog_vmap_app_doc_snap extends $giper_baza_dict.with({

		Time: $giper_baza_atom_real,

		Author: $giper_baza_atom_text,

		Tree: $giper_baza_atom_text,

		Js: $giper_baza_atom_text,

		Css: $giper_baza_atom_text,

	}) {

		time( next?: number ) {
			return this.Time( next )?.val( next ) ?? 0
		}

		author( next?: string ) {
			return this.Author( next )?.val( next ) ?? ''
		}

		source( next?: string ) {
			return this.Tree( next )?.val( next ) ?? ''
		}

		js( next?: string ) {
			return this.Js( next )?.val( next ) ?? ''
		}

		css( next?: string ) {
			return this.Css( next )?.val( next ) ?? ''
		}

	}

	export class $bog_vmap_app_doc_spot extends $giper_baza_dict.with({
		X: $giper_baza_atom_real,
		Y: $giper_baza_atom_real,
	}) {

		x( next?: number ) {
			return this.X( next )?.val( next ) ?? 0
		}

		y( next?: number ) {
			return this.Y( next )?.val( next ) ?? 0
		}

	}

	export class $bog_vmap_app_doc extends $giper_baza_dict.with({

		Title: $giper_baza_atom_text,

		Nodes: $giper_baza_list_link.to( ()=> $bog_vmap_app_doc_node ),

		Root: $giper_baza_atom_link.to( ()=> $bog_vmap_app_doc_node ),

		Spots: $giper_baza_dict_to( $bog_vmap_app_doc_spot ),

		Pack: $giper_baza_atom_text,

		Snaps: $giper_baza_list_link.to( ()=> $bog_vmap_app_doc_snap ),

	}) {

		pack( next?: string ) {
			return this.Pack( next )?.val( next ) ?? ''
		}

		title( next?: string ) {
			return this.Title( next )?.val( next ) ?? ''
		}

	}

	export class $bog_vmap_app_doc_home extends $giper_baza_dict.with({
		Docs: $giper_baza_list_link.to( ()=> $bog_vmap_app_doc ),
	}) {}

	export const $bog_vmap_app_doc_schema = [
		$bog_vmap_app_doc,
		$bog_vmap_app_doc_node,
		$bog_vmap_app_doc_snap,
		$bog_vmap_app_doc_spot,
		$bog_vmap_app_doc_home,
	] as const

}
