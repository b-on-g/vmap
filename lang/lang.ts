namespace $ {

	export type $bog_vmap_lang_wire = {

		readonly name: string

		readonly node: string

		readonly prop: string

		readonly bidi?: boolean

	}

	export type $bog_vmap_lang_link = {
		readonly from: string
		readonly from_prop: string
		readonly to: string
		readonly to_prop: string
		readonly name: string
		readonly bidi: boolean
	}

	export function $bog_vmap_lang_token(
		this: $,
		token: string,
		role: string,
	) {

		const parts = [ ... token.matchAll( $mol_view_tree2_prop_signature ) ][ 0 ]?.groups

		if( !parts || parts.name !== token ) this.$mol_fail(
			new Error( `${ role } must be a bare name, got ${ JSON.stringify( token ) }` )
		)

		return token
	}

	export function $bog_vmap_lang_class_ok( name: string ) {
		return /^\$[a-z][a-z0-9]*(_[a-z0-9]+)+$/.test( name )
	}

	export function $bog_vmap_lang_wire_tree(
		this: $,
		wire: $bog_vmap_lang_wire,
	) {

		const sign = wire.bidi ? '?' : ''

		const name = this.$bog_vmap_lang_token( wire.name, 'Wire name' ) + sign
		const node = this.$bog_vmap_lang_token( wire.node, 'Wire node' )
		const prop = this.$bog_vmap_lang_token( wire.prop, 'Wire prop' ) + sign

		return $mol_tree2.struct( name, [
			$mol_tree2.struct( '=', [
				$mol_tree2.struct( node, [
					$mol_tree2.struct( prop ),
				] ),
			] ),
		] )
	}

	export function $bog_vmap_lang_ref_tree(
		this: $,
		name: string,
	) {
		return $mol_tree2.struct( '<=', [
			$mol_tree2.struct( this.$bog_vmap_lang_token( name, 'Reference' ) ),
		] )
	}

	export function $bog_vmap_lang_part_tree(
		this: $,
		name: string,
		klass: string,
	) {

		const base = $mol_tree2.struct( klass )

		if( ! $mol_view_tree2_class_match( base ) ) this.$mol_fail(
			new Error( `Part class must be a class name, got ${ JSON.stringify( klass ) }` )
		)

		return $mol_tree2.struct( this.$bog_vmap_lang_token( name, 'Part name' ), [ base ] )
	}

	export function $bog_vmap_lang_dict_get(
		dict: $mol_tree2 | null,
		key: string,
	) {

		if( dict?.type !== '*' ) return null

		const found = dict.kids.find( kid => kid.type === key )

		return found?.kids[ 0 ] ?? null
	}

	export function $bog_vmap_lang_dict_set(
		this: $,
		dict: $mol_tree2,
		key: string,
		value: $mol_tree2 | null,
	) {

		const name = this.$bog_vmap_lang_token( key, 'Dictionary key' )

		if( !value ) return dict.clone( dict.kids.filter( kid => kid.type !== name ) )

		const entry = dict.struct( name, [ value ] )

		if( ! dict.kids.some( kid => kid.type === name ) ) {
			return dict.clone([ ... dict.kids, entry ])
		}

		return dict.clone( dict.kids.map( kid => kid.type === name ? entry : kid ) )
	}

	export function $bog_vmap_lang_sorted(
		this: $,
		defs: readonly $mol_tree2[],
	) {

		const by_name = new Map< string, $mol_tree2 >()
		for( const def of defs ) by_name.set( def.type, def )

		const sorted = [] as $mol_tree2[]
		const done = new Set< string >()
		const path = new Set< string >()

		const walk = ( def: $mol_tree2 )=> {

			if( done.has( def.type ) ) return

			if( path.has( def.type ) ) this.$mol_fail(
				new Error( `Circular inheritance around ${ def.type }` )
			)

			path.add( def.type )

			const base = by_name.get( def.kids[ 0 ]?.type ?? '' )
			if( base && base !== def ) walk( base )

			path.delete( def.type )
			done.add( def.type )
			sorted.push( def )

		}

		for( const def of defs ) walk( def )

		return sorted as readonly $mol_tree2[]
	}

	export class $bog_vmap_lang_doc extends $mol_object {

		@ $mol_mem
		source( next?: string ) {
			return next ?? ''
		}

		@ $mol_mem
		trees(): readonly $mol_tree2[] {
			return this.$.$mol_view_tree2_normalize(
				this.$.$mol_tree2_from_string( this.source().replace( /\n?$/, '\n' ) )
			).kids
		}

		@ $mol_mem
		names() {
			return this.trees().map( tree => tree.type )
		}

		class_source( name: string, next?: string ) {

			const trees = this.trees()
			const index = trees.findIndex( tree => tree.type === name )

			if( next === undefined ) return trees[ index ]?.toString() ?? ''

			const parsed = this.$.$mol_view_tree2_normalize(
				this.$.$mol_tree2_from_string( next.replace( /\n?$/, '\n' ) )
			).kids

			const kept = index < 0
				? [ ... trees, ... parsed ]
				: [ ... trees.slice( 0, index ), ... parsed, ... trees.slice( index + 1 ) ]

			this.source( this.$.$mol_tree2.list( kept ).toString() )

			return next
		}

		@ $mol_action
		class_rename( from: string, to: string ) {

			if( from === to ) return

			const trees = this.trees()

			if( !trees.some( tree => tree.type === from ) ) return this.$.$mol_fail(
				new Error( `Class ${ JSON.stringify( from ) } is not declared in the document` )
			)

			if( trees.some( tree => tree.type === to ) ) return this.$.$mol_fail(
				new Error( `Class ${ JSON.stringify( to ) } is already declared in the document` )
			)

			const renamed = ( tree: $mol_tree2 ): $mol_tree2 => {
				const kids = tree.kids.map( renamed )
				return tree.type === from ? tree.struct( to, kids ) : tree.clone( kids )
			}

			this.source( this.$.$mol_tree2.list( trees.map( renamed ) ).toString() )

		}

		@ $mol_mem_key
		node( name: string ) {
			return $bog_vmap_lang_node.make({
				source: ( next?: string )=> this.class_source( name, next ),
			})
		}

	}

	export class $bog_vmap_lang_node extends $mol_object {

		@ $mol_mem
		source( next?: string ) {
			return next ?? ''
		}

		@ $mol_mem
		tree( next?: $mol_tree2 ) {

			const source = this.source( next && next.toString() ).replace( /\n?$/, '\n' )

			const tree = this.$.$mol_view_tree2_normalize(
				this.$.$mol_tree2_from_string( source )
			).kids[ 0 ]

			if( !tree ) return this.$.$mol_fail( new Error( 'No class declared in the source' ) )

			return tree
		}

		@ $mol_mem
		name( next?: string ) {

			const tree = this.tree()
			if( !next ) return tree.type

			this.tree( tree.struct( next, tree.kids ) )

			return next
		}

		@ $mol_mem
		base( next?: string ) {

			const self = this.tree()
			const base = this.$.$mol_view_tree2_class_super( self )
			if( !next ) return base.type

			this.tree( self.clone([ base.struct( next, base.kids ) ]) )

			return next
		}

		@ $mol_mem
		prop_names() {
			return this.$.$mol_view_tree2_class_props( this.tree() )
				.map( tree => this.$.$mol_view_tree2_prop_parts( tree ).name )
		}

		@ $mol_mem
		props_tree() {
			return this.tree().list( this.$.$mol_view_tree2_class_props( this.tree() ) )
		}

		@ $mol_mem_key
		prop_fullname( name: string ) {

			if( /[*?!]/.test( name ) ) return name

			for( const tree of this.props_tree().kids ) {

				const sign = tree?.type ?? ''
				const meta = [ ... sign.matchAll( $mol_view_tree2_prop_signature ) ][ 0 ]?.groups
					?? { name: '', key: '', next: '' }

				if( meta.name === name ) return `${ meta.name }${ meta.key || '' }${ meta.next || '' }`

			}

			return ''
		}

		@ $mol_mem_key
		prop_tree( name: string, next?: $mol_tree2 | null ) {

			const sign = this.prop_fullname( name )

			if( next !== undefined ) {
				this.tree( this.tree().insert( next, this.base(), sign ) )
				return next
			}

			return this.props_tree().select( sign ).kids[ 0 ] ?? null
		}

		@ $mol_action
		prop_add( name: string ) {

			const tree = this.tree()

			this.tree(
				tree.insert(
					tree.struct( name, [ tree.struct( 'null' ) ] ),
					null,
					name,
				)
			)

		}

		@ $mol_action
		prop_drop( name: string ) {
			this.prop_tree( name, null )
		}

		@ $mol_action
		prop_rename( name: string, next: string ) {

			const to = [ ... next.matchAll( $mol_view_tree2_prop_signature ) ][ 0 ]?.groups?.name

			if( !to ) return this.$.$mol_fail(
				new Error( `Bad property signature ${ JSON.stringify( next ) }` )
			)

			if( to !== name && this.prop_names().includes( to ) ) return this.$.$mol_fail(
				new Error( `Property ${ JSON.stringify( to ) } is already declared in ${ this.name() }` )
			)

			const self = this.tree()
			const base = self.kids[ 0 ]
			if( !base ) return

			const refs = ( tree: $mol_tree2 ): $mol_tree2 => {

				const kids = tree.kids.map( refs )
				const head = kids[ 0 ]

				if(
					head?.type === name
					&& ( tree.type === '<=' || tree.type === '<=>' || tree.type === '=' )
				) return tree.clone([ head.struct( to, head.kids ), ... kids.slice( 1 ) ])

				return tree.clone( kids )
			}

			const props = base.kids.map( prop => {
				const meta = [ ... prop.type.matchAll( $mol_view_tree2_prop_signature ) ][ 0 ]?.groups
				return meta?.name === name ? prop.struct( next, prop.kids ) : prop
			} )

			this.tree( self.clone([ base.clone( props.map( refs ) ) ]) )

		}

		@ $mol_mem_key
		property( name: string ) {
			return $bog_vmap_lang_prop.make({
				name: $mol_const( name ),
				tree: next => this.prop_tree( name, next )!,
				node: $mol_const( this ),
			})
		}

		@ $mol_action
		part_add( name: string, klass: string ) {

			const tree = this.tree()

			this.tree(
				tree.insert( this.$.$bog_vmap_lang_part_tree( name, klass ), null, name )
			)

		}

		@ $mol_action
		wire_add( wire: $bog_vmap_lang_wire ) {

			const next = this.$.$bog_vmap_lang_wire_tree( wire )

			if( ! this.prop_names().includes( wire.node ) ) this.$.$mol_fail(
				new Error( `Wire node ${ JSON.stringify( wire.node ) } is not declared in ${ this.name() }` )
			)

			const prev = this.prop_fullname( wire.name )
			if( prev && prev !== next.type ) this.prop_drop( wire.name )

			this.tree( this.tree().insert( next, null, next.type ) )

		}

		@ $mol_mem
		wires(): readonly $bog_vmap_lang_wire[] {

			const wires = [] as $bog_vmap_lang_wire[]

			for( const prop of this.props_tree().kids ) {

				const op = prop.kids[ 0 ]
				if( op?.type !== '=' ) continue

				const node = op.kids[ 0 ]
				const far = node?.kids[ 0 ]
				if( !node || !far ) continue

				const meta = this.$.$mol_view_tree2_prop_parts( prop )

				wires.push({
					name: meta.name,
					node: node.type,
					prop: this.$.$mol_view_tree2_prop_parts( far ).name,
					bidi: Boolean( meta.next ),
				})

			}

			return wires
		}

		part_names() {
			return this.props_tree().kids
				.filter( prop => {
					const val = prop.kids[ 0 ]
					return val && $mol_view_tree2_class_match( val )
				} )
				.map( prop => this.$.$mol_view_tree2_prop_parts( prop ).name )
		}

		@ $mol_mem
		links(): readonly $bog_vmap_lang_link[] {

			const wires = new Map( this.wires().map( wire => [ wire.name, wire ] as const ) )
			const links = [] as $bog_vmap_lang_link[]

			for( const decl of this.props_tree().kids ) {

				const klass = decl.kids[ 0 ]
				if( !klass || !$mol_view_tree2_class_match( klass ) ) continue

				const to = this.$.$mol_view_tree2_prop_parts( decl ).name

				for( const over of klass.kids ) {

					const op = over.kids[ 0 ]
					if( op?.type !== '<=' && op?.type !== '<=>' ) continue

					const ref = op.kids[ 0 ]
					if( !ref || ref.kids.length ) continue

					const wire = wires.get( this.$.$mol_view_tree2_prop_parts( ref ).name )
					if( !wire ) continue

					links.push({
						from: wire.node,
						from_prop: wire.prop,
						to,
						to_prop: this.$.$mol_view_tree2_prop_parts( over ).name,
						name: wire.name,
						bidi: Boolean( wire.bidi ) && op.type === '<=>',
					})

				}

			}

			return links
		}

		link_reaches( from: string, to: string ) {

			const seen = new Set< string >()
			const queue = [ from ]

			while( queue.length ) {
				const at = queue.shift()!
				if( at === to ) return true
				if( seen.has( at ) ) continue
				seen.add( at )
				for( const link of this.links() ) if( link.from === at ) queue.push( link.to )
			}

			return false
		}

		link_name( from: string, prop: string, bidi: boolean ) {

			const base = `${ from.toLowerCase() }_${ prop }`
			const taken = new Set( this.prop_names() )

			for( let i = 1; ; ++i ) {

				const name = i === 1 ? base : `${ base }_${ i }`

				const wire = this.wires().find( wire => wire.name === name )
				if( wire ) {
					if( wire.node === from && wire.prop === prop && wire.bidi === bidi ) return name
					continue
				}

				if( !taken.has( name ) ) return name

			}

		}

		@ $mol_action
		link_add( link: {
			readonly from: string
			readonly from_prop: string
			readonly to: string
			readonly to_prop: string
			readonly bidi?: boolean
		} ) {

			const bidi = Boolean( link.bidi )

			if( link.from === link.to ) this.$.$mol_fail(
				new Error( `Part ${ JSON.stringify( link.to ) } cannot be wired to itself` )
			)

			const parts = new Set( this.part_names() )
			for( const end of [ link.from, link.to ] ) if( !parts.has( end ) ) this.$.$mol_fail(
				new Error( `Part ${ JSON.stringify( end ) } is not declared in ${ this.name() }` )
			)

			if( this.link_reaches( link.to, link.from ) ) this.$.$mol_fail(
				new Error( `Wire ${ link.from } → ${ link.to } closes a loop: ${ link.to } already feeds ${ link.from }` )
			)

			const to_prop = this.$.$bog_vmap_lang_token( link.to_prop, 'Target port' )
			const name = this.link_name( link.from, link.from_prop, bidi )

			this.wire_add({ name, node: link.from, prop: link.from_prop, bidi })

			const ref = bidi
				? $mol_tree2.struct( '<=>', [ $mol_tree2.struct( name + '?' ) ] )
				: this.$.$bog_vmap_lang_ref_tree( name )

			this.link_target( link.to, to_prop, $mol_tree2.struct( to_prop + ( bidi ? '?' : '' ), [ ref ] ) )

			return name
		}

		link_target( to: string, to_prop: string, next: $mol_tree2 | null ) {
			this.over_set( to, to_prop, next )
		}

		@ $mol_action
		link_drop( to: string, to_prop: string ) {

			const link = this.links().find( link => link.to === to && link.to_prop === to_prop )
			if( !link ) return

			this.link_target( to, to_prop, null )

			const used = this.links().some( other => other.name === link.name )
			if( !used ) this.prop_drop( link.name )

		}

		@ $mol_action
		links_drop( node: string ) {

			for( const link of [ ... this.links() ] ) {
				if( link.from !== node && link.to !== node ) continue
				this.link_drop( link.to, link.to_prop )
			}

			for( const wire of [ ... this.wires() ] ) {
				if( wire.node !== node ) continue
				this.prop_drop( wire.name )
			}

		}

		prop_decl( name: string ) {
			const sign = this.prop_fullname( name )
			return sign ? this.props_tree().select( sign ).kids[ 0 ] ?? null : null
		}

		sub_list( owner = '' ) {

			const prop = owner ? this.over_tree( owner, 'sub' ) : this.prop_decl( 'sub' )

			const list = prop?.kids[ 0 ] ?? null

			return list?.type[ 0 ] === '/' ? list : null
		}

		sub_names( owner = '' ): readonly string[] | null {
			const list = this.sub_list( owner )
			return list && list.kids.map( ref => ref.kids[ 0 ]?.type ?? '' )
		}

		sub_holder( name: string ) {

			for( const owner of [ '', ... this.part_names() ] ) {
				if( this.sub_names( owner )?.includes( name ) ) return owner
			}

			return null
		}

		sub_within( owner: string, name: string ) {

			const seen = new Set< string >()
			const queue = [ owner ]

			while( queue.length ) {

				const at = queue.shift()!
				if( at === name ) return true
				if( seen.has( at ) ) continue
				seen.add( at )

				for( const kid of this.sub_names( at ) ?? [] ) if( kid ) queue.push( kid )
			}

			return false
		}

		sub_write( owner: string, list: $mol_tree2 ) {

			const sub = list.struct( 'sub', [ list ] )

			if( owner ) return this.over_set( owner, 'sub', sub )

			this.tree( this.tree().insert( sub, null, this.prop_fullname( 'sub' ) || 'sub' ) )
		}

		@ $mol_action
		sub_open( owner: string ) {
			if( this.sub_list( owner ) ) return
			this.sub_write( owner, this.tree().struct( '/' ) )
		}

		over_tree( owner: string, prop: string ) {

			const klass = this.prop_decl( owner )?.kids[ 0 ]
			if( !klass || !$mol_view_tree2_class_match( klass ) ) return null

			return klass.kids.find(
				over => this.$.$mol_view_tree2_prop_parts( over ).name === prop
			) ?? null
		}

		over_set( owner: string, prop: string, next: $mol_tree2 | null ) {

			const decl = this.prop_decl( owner )
			const klass = decl?.kids[ 0 ]
			if( !decl || !klass || !$mol_view_tree2_class_match( klass ) ) return

			const named = ( over: $mol_tree2 ) => this.$.$mol_view_tree2_prop_parts( over ).name === prop

			const kids = klass.kids.some( named )
				? klass.kids.flatMap( over => named( over ) ? next ? [ next ] : [] : [ over ] )
				: next ? [ ... klass.kids, next ] : klass.kids

			this.prop_tree( owner, decl.clone([ klass.clone( kids ) ]) )

		}

		sub_check( name: string, owner: string ) {

			if( !owner ) return

			if( name === owner ) this.$.$mol_fail(
				new Error( `Node ${ JSON.stringify( name ) } cannot be put inside itself` )
			)

			if( this.sub_within( name, owner ) ) this.$.$mol_fail(
				new Error( `Node ${ JSON.stringify( name ) } cannot be put inside ${ JSON.stringify( owner ) }, which it already holds` )
			)

		}

		@ $mol_action
		sub_insert( name: string, index: number, owner = '' ) {

			const ref = this.$.$bog_vmap_lang_ref_tree( name )

			this.sub_check( name, owner )

			const list = this.sub_list( owner ) ?? ref.struct( '/' )

			const kids = [ ... list.kids ]
			kids.splice( Math.max( 0, Math.min( index, kids.length ) ), 0, ref )

			this.sub_write( owner, list.clone( kids ) )

		}

		@ $mol_action
		sub_move( name: string, index: number, owner = '' ) {

			this.sub_check( name, owner )

			const from = this.sub_holder( name )

			if( from === owner ) {
				const at = this.sub_names( owner )!.indexOf( name )
				if( at >= 0 && at < index ) index -= 1
			}

			if( from !== null ) this.sub_drop( name )

			this.sub_insert( name, index, owner )

		}

		@ $mol_action
		sub_add( name: string ) {
			this.sub_insert( name, Infinity )
		}

		@ $mol_action
		sub_drop( name: string ) {

			const owner = this.sub_holder( name )
			if( owner === null ) return

			const list = this.sub_list( owner )!

			this.sub_write( owner, list.clone(
				list.kids.filter( ref => ref.kids[ 0 ]?.type !== name )
			) )

		}

	}

	export class $bog_vmap_lang_prop extends $mol_object {

		name(): string {
			return this.$.$mol_fail( new Error( 'Not defined' ) )
		}

		node(): $bog_vmap_lang_node {
			return this.$.$mol_fail( new Error( 'Not defined' ) )
		}

		tree( next?: $mol_tree2 ): $mol_tree2 {
			return this.$.$mol_fail( new Error( 'Not defined' ) )
		}

		as< Prop extends typeof $bog_vmap_lang_prop >( Prop: Prop ) {
			return Prop.make({
				name: () => this.name(),
				tree: next => this.tree( next ),
			} as InstanceType< Prop >)
		}

		meta( next?: {
			readonly name?: string
			readonly key?: string
			readonly next?: string
		} ) {

			const tree = this.tree()
			const sign = tree?.type ?? ''

			let meta = [ ... sign.matchAll( $mol_view_tree2_prop_signature ) ][ 0 ]?.groups
				?? { name: '', key: '', next: '' }

			if( next ) {

				const made = { ... meta, ... next }
				const sign = `${ made.name }${ made.key || '' }${ made.next || '' }`

				if( made.name === meta.name ) this.tree( tree.struct( sign, tree.kids ) )
				else this.node().prop_rename( meta.name, sign )

				meta = made

			}

			return meta
		}

		title( next?: string ) {
			return this.meta( next === undefined ? undefined : { name: next } ).name
		}

		key( next?: boolean ) {
			return Boolean(
				this.meta( next === undefined ? undefined : { key: next ? '*' : '' } ).key
			)
		}

		next( next?: boolean ) {
			return Boolean(
				this.meta( next === undefined ? undefined : { next: next ? '?' : '' } ).next
			)
		}

	}

}
