namespace $ {

	export function $bog_vmap_app_copy_name( name: string, taken: ReadonlySet< string > ) {
		const head = name.replace( /_\d+$/, '' )

		for( let index = 2; ; ++index ) {
			const next = `${ head }_${ index }`
			if( !taken.has( next ) ) return next
		}
	}

	export function $bog_vmap_app_copy_refs(
		tree: $mol_tree2,
		names: ReadonlyMap< string, string >,
	): $mol_tree2 {

		if( tree.type === '<=' || tree.type === '<=>' ) {

			const ref = tree.kids[ 0 ]
			const next = ref && !ref.kids.length ? names.get( ref.type ) : undefined

			if( ref && next ) return tree.clone([ ref.struct( next, [] ) ])

		}

		return tree.clone( tree.kids.map( kid => $bog_vmap_app_copy_refs( kid, names ) ) )
	}

	export function $bog_vmap_app_copy( node: $bog_vmap_lang_node, name: string ) {

		const taken = new Set( node.prop_names() )
		const names = new Map< string, string >()

		const walk = ( at: string )=> {
			if( names.has( at ) ) return

			const next = $bog_vmap_app_copy_name( at, taken )
			taken.add( next )
			names.set( at, next )

			for( const kid of node.sub_names( at ) ?? [] ) if( kid ) walk( kid )
		}

		walk( name )

		const copies = [ ... names ].flatMap( ([ from, to ])=> {
			const decl = node.prop_decl( from )
			if( !decl ) return []

			const sign = to + decl.type.slice( from.length )
			return [ decl.struct( sign, decl.kids.map( kid => $bog_vmap_app_copy_refs( kid, names ) ) ) ]
		} )

		for( const copy of copies ) node.tree( node.tree().insert( copy, null, copy.type ) )

		const copied = names.get( name )!

		const owner = node.sub_holder( name )
		if( owner !== null ) {
			const index = node.sub_names( owner )!.indexOf( name )
			node.sub_insert( copied, index + 1, owner )
		}

		return copied
	}

}
