namespace $ {

	export class $bog_vmap_app_publish_home extends $giper_baza_dict.with({
		Libs: $giper_baza_list_link.to( ()=> $bog_vmap_lib_land_shelf ),
	}) {}

	export function $bog_vmap_app_publish_bare( node: $mol_tree2 ) {
		return node.type.replace( /[*?!]+$/, '' )
	}

	export class $bog_vmap_app_publish_store extends $mol_object {

		home() {
			return this.$.$giper_baza_glob.home().land().Data( $bog_vmap_app_publish_home )
		}

		shelf_links(): readonly $giper_baza_link[] {
			return this.home().Libs()?.items()?.filter( $mol_guard_defined ) ?? []
		}

		shelf(): $bog_vmap_lib_land_shelf | null {
			const link = this.shelf_links()[ 0 ]
			return link ? this.$.$giper_baza_glob.Pawn( link, $bog_vmap_lib_land_shelf ) : null
		}

		shelf_land_config(): $giper_baza_rank_preset | $giper_baza_land {
			return [[ null, this.$.$giper_baza_rank_read ]]
		}

		shelf_title() {
			return 'Мои компоненты'
		}

		shelf_ensure() {

			const prev = this.shelf()
			if( prev ) return prev

			const shelf = this.home().Libs( null )!.make( this.shelf_land_config() )
			shelf.title( this.shelf_title() )

			return shelf
		}

		link() {
			return this.shelf()?.land().link().str ?? ''
		}

		class_name( part: string ) {
			return '$bog_vmap_pub_' + part.toLowerCase()
		}

		class_source( part: string, source: string ) {

			const tree = this.tree( source )
			if( !tree ) return this.$.$mol_fail( new Error( 'No class declared in the source' ) )

			return tree.struct( this.class_name( part ), tree.kids ).toString()
		}

		tree( source: string ) {
			return this.$.$mol_tree2_from_string(
				source.replace( /\n?$/, '\n' ), 'vmap.view.tree',
			).kids[ 0 ] ?? null
		}

		inlined( source: string, doc: string ) {

			const tree = this.tree( source )
			const root = doc ? this.$.$mol_view_tree2_normalize(
				this.$.$mol_tree2_from_string( doc.replace( /\n?$/, '\n' ), 'vmap.view.tree' )
			).kids[ 0 ] : null

			if( !tree || !root ) return { source, shared: [] as readonly string[] }

			const props = this.$.$mol_view_tree2_class_props( root )
			const name_of = ( prop: $mol_tree2 )=> this.$.$mol_view_tree2_prop_parts( prop ).name

			const nodes = new Map< string, $mol_tree2 >()
			for( const prop of props ) {
				if( $mol_view_tree2_class_match( prop.kids[ 0 ] ) ) nodes.set( name_of( prop ), prop )
			}

			const taken = new Set< string >()

			const walk = ( node: $mol_tree2, path: ReadonlySet< string > ): $mol_tree2 => {

				const ref = node.kids[ 0 ]

				if( ref && !ref.kids.length && ( node.type === '<=' || node.type === '<=>' ) ) {
					const decl = nodes.get( $bog_vmap_app_publish_bare( ref ) )
					if( decl && !path.has( name_of( decl ) ) ) {
						taken.add( name_of( decl ) )
						const deeper = new Set([ ... path, name_of( decl ) ])
						return node.clone([ ref.clone( decl.kids.map( kid => walk( kid, deeper ) ) ) ])
					}
				}

				return node.clone( node.kids.map( kid => walk( kid, path ) ) )
			}

			const full = tree.clone( tree.kids.map( kid => walk( kid, new Set([ tree.type ]) ) ) )

			const shared = new Set< string >()

			const seek = ( node: $mol_tree2 )=> {
				const ref = node.kids[ 0 ]
				if( ref && /^(<=|<=>|=)$/.test( node.type ) ) {
					const name = $bog_vmap_app_publish_bare( ref )
					if( taken.has( name ) ) shared.add( name )
				}
				for( const kid of node.kids ) seek( kid )
			}

			for( const prop of props ) {
				const name = name_of( prop )
				if( name === tree.type || taken.has( name ) ) continue
				seek( prop )
			}

			return { source: full.toString(), shared: [ ... shared ] as readonly string[] }
		}

		bound_names( source: string ) {

			const bare = $bog_vmap_app_publish_bare

			const owned = new Set< string >()
			const refs = new Set< string >()

			const walk = ( node: $mol_tree2 )=> {

				const ref = node.kids[ 0 ]

				if( ref && ( node.type === '<=' || node.type === '<=>' ) ) {
					( ref.kids.length ? owned : refs ).add( bare( ref ) )
				}

				if( ref && node.type === '=' ) refs.add( bare( ref ) )

				for( const kid of node.kids ) walk( kid )
			}

			for( const kid of this.tree( source )?.kids ?? [] ) walk( kid )

			return [ ... refs ].filter( name => !owned.has( name ) )
		}

		refusal( part: string, source: string, classes: readonly string[] = [] ) {

			const base = this.tree( source )?.kids[ 0 ]?.type ?? ''
			if( classes.includes( base ) ) {
				return `деталь ${ part } наследует класс ${ base } документа, выберите базу из библиотеки перед публикацией`
			}

			const bound = this.bound_names( source )
			if( !bound.length ) return ''

			return `деталь ${ part } ссылается на ${ bound.join( ', ' ) } документа, отвяжите провод перед публикацией`
		}

		css_moved( css: string, from: string, to: string ) {

			if( !css || !from || from === to ) return css

			const quoted = from.replace( /[^\w-]/g, char => '\\' + char )

			return css.replace( new RegExp( '\\[' + quoted + '\\]', 'gi' ), ()=> '[' + to + ']' )
		}

		sub_names( source: string ): readonly string[] {

			const names = [] as string[]

			const walk = ( node: $mol_tree2 )=> {

				const ref = node.kids[ 0 ]
				const base = ref?.kids[ 0 ]

				if(
					ref && base && ( node.type === '<=' || node.type === '<=>' )
					&& $mol_view_tree2_class_match( base )
				) {
					const name = $bog_vmap_app_publish_bare( ref )
					if( !names.includes( name ) ) names.push( name )
				}

				for( const kid of node.kids ) walk( kid )
			}

			for( const kid of this.tree( source )?.kids ?? [] ) walk( kid )

			return names
		}

		css_out( css: string, part: string, source: string, root: string ) {

			if( !css || !root ) return ''

			const attr = ( name: string )=> this.$.$bog_vmap_app_code_attr( name )
			const props = this.$.$bog_vmap_app_code_props_css( css, root )
			const prefix = attr( root ) + '_'
			const klass = attr( this.class_name( part ) )

			const rule = ( prop: string, to: string )=> {
				const own = props.get( prop.toLowerCase() )
				return own ? this.css_moved( own, prefix + prop.toLowerCase(), to ) : ''
			}

			return [
				rule( part, klass ),
				... this.sub_names( source ).map( name => rule( name, klass + '_' + name.toLowerCase() ) ),
			].filter( Boolean ).join( '\n\n' )

		}

		part_of( shelf: $bog_vmap_lib_land_shelf, klass: string ) {
			return shelf.parts().find(
				part => $bog_vmap_lib_land_name( part.tree() ) === klass
			) ?? null
		}

		publish( part: string, source: string, js = '', css = '', classes: readonly string[] = [] ) {

			const refusal = this.refusal( part, source, classes )
			if( refusal ) return this.$.$mol_fail( new Error( refusal ) )

			const tree = this.class_source( part, source )
			const klass = this.class_name( part )

			const moved = this.css_out( css, part, source, classes[ 0 ] ?? '' )

			const shelf = this.shelf_ensure()
			const one = this.part_of( shelf, klass ) ?? shelf.Parts( null )!.make( null )

			one.tree( tree )

			if( js || one.js() ) one.js( js )
			if( moved || one.css() ) one.css( moved )

			return shelf.land().link().str
		}

		import_class( source: string, js = '', css = '' ) {

			const klass = this.$.$bog_vmap_lib_land_name( source )

			if( klass[ 0 ] !== '$' ) this.$.$mol_fail( new Error(
				`Объявление начинается с ${ JSON.stringify( klass ) }, а имя класса начинается с доллара`
			) )

			const shelf = this.shelf_ensure()
			const one = this.part_of( shelf, klass ) ?? shelf.Parts( null )!.make( null )

			one.tree( source )

			if( js || one.js() ) one.js( js )
			if( css || one.css() ) one.css( css )

			return shelf.land().link().str
		}

	}

}
