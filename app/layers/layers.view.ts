namespace $.$$ {

	type layer = {
		readonly owner: string | null
		readonly level: number
		readonly kids: readonly string[] | null
	}

	type flags = { readonly [ name: string ]: boolean }

	const kinds: { readonly [ word: string ]: string } = {
		image: 'image',
		link: 'link',
		button: 'button',
		string: 'field',
		number: 'field',
		textarea: 'field',
		select: 'field',
		switch: 'field',
		check: 'field',
		search: 'field',
		paragraph: 'text',
		text: 'text',
		status: 'text',
		label: 'text',
		title: 'text',
	}

	export class $bog_vmap_app_layers extends $.$bog_vmap_app_layers {

		override root() {
			return super.root() || this.Doc().names()[ 0 ] || ''
		}

		node() {
			return this.Doc().node( this.root() )
		}

		@ $mol_mem
		layers() {
			const node = this.node()
			const known = new Set( node.prop_names() )
			const found = new Map< string, layer >()

			const walk = ( name: string, owner: string | null, level: number )=> {
				const list = node.sub_names( name )
				const kids = list && list.filter( kid => known.has( kid ) && !found.has( kid ) )

				found.set( name, { owner, level, kids } )

				for( const kid of kids ?? [] ) if( !found.has( kid ) ) walk( kid, name, level + 1 )
			}

			walk( '', null, 1 )

			const parts = node.part_names()
			const held = new Set( [ '', ... parts ].flatMap( owner => node.sub_names( owner ) ?? [] ) )
			const inner = new Set( parts.flatMap( part => node.inner_refs( part ) ) )

			for( const name of parts ) {
				if( !found.has( name ) && !held.has( name ) && !inner.has( name ) ) walk( name, null, 2 )
			}
			for( const name of parts ) if( !found.has( name ) && !inner.has( name ) ) walk( name, null, 2 )

			return found
		}

		override row_inner( name: string ) {
			return name.includes( '/' )
		}

		inner_owner( name: string ) {
			return name.slice( 0, name.indexOf( '/' ) )
		}

		inner_prop( name: string ) {
			return name.slice( name.indexOf( '/' ) + 1 )
		}

		inner_key( name: string ) {
			return `${ this.row_class( this.inner_owner( name ) ) }/${ this.inner_prop( name ) }`
		}

		@ $mol_mem_key
		inner_layers( part: string ) {

			const found = new Map< string, layer >()
			const klass = this.row_class( part )
			if( !klass ) return found

			const level = this.row_level( part )

			const walk = ( key: string, owner: string | null, deep: number ): readonly string[] => {

				const born = [] as string[]

				for( const kid of this.inner_kids( key ) ) {
					const path = `${ part }/${ kid }`
					if( found.has( path ) ) continue
					found.set( path, { owner, level: deep, kids: [] } )
					born.push( path )
				}

				for( const path of born ) {
					const kids = walk( `${ klass }/${ this.inner_prop( path ) }`, path, deep + 1 )
					found.set( path, { owner, level: deep, kids } )
				}

				return born
			}

			walk( klass, null, level + 1 )

			return found
		}

		inner_roots( part: string ) {
			return [ ... this.inner_layers( part ) ]
				.filter( ([ , layer ])=> layer.owner === null )
				.map( ([ path ])=> path )
		}

		@ $mol_mem
		outside() {
			return [ ... this.layers() ]
				.filter( ([ name, layer ])=> name && layer.owner === null )
				.map( ([ name ])=> name )
		}

		row_kids( name: string ): readonly string[] {

			if( this.row_inner( name ) ) {
				return this.inner_layers( this.inner_owner( name ) ).get( name )?.kids ?? []
			}

			const kids = this.layers().get( name )?.kids ?? []
			if( kids.length ) return kids

			return this.inner_roots( name )
		}

		row_holder( name: string ): string | null {

			if( this.row_inner( name ) ) {
				const owner = this.inner_layers( this.inner_owner( name ) ).get( name )?.owner
				return owner === undefined ? null : owner ?? this.inner_owner( name )
			}

			return this.layers().get( name )?.owner ?? null
		}

		row_within( owner: string, name: string ) {
			for( let at = this.row_holder( name ); at !== null; at = this.row_holder( at ) ) {
				if( at === owner ) return true
			}
			return false
		}

		@ $mol_mem
		override rows() {
			const outside = this.outside()
			if( !outside.length ) return this.branch_rows( '' )

			return [
				... this.branch_rows( '' ),
				this.Outside(),
				... this.outside_expanded() ? outside.flatMap( name => this.branch_rows( name ) ) : [],
			]
		}

		branch_rows( name: string ): $mol_view[] {
			const rows = [ this.Row( name ) ] as $mol_view[]
			if( this.row_editing( name ) && this.node_title_note() ) rows.push( this.Note() )
			if( this.row_open( name ) ) for( const kid of this.row_kids( name ) ) rows.push( ... this.branch_rows( kid ) )
			return rows
		}

		override row_level( name: string ): number {

			if( this.row_inner( name ) ) {
				return this.inner_layers( this.inner_owner( name ) ).get( name )?.level ?? 1
			}

			return this.layers().get( name )?.level ?? 1
		}

		override row_expanded( name: string, next?: boolean ) {
			return this.row_open( name, next )!
		}

		row_open( name: string, next?: boolean ) {
			const kids = this.row_kids( name )
			if( !kids.length ) return null
			return this.expanded_at( name, next, !kids.some( kid => this.row_inner( kid ) ) )
		}

		expanded_at( name: string, next?: boolean, fallback = true ) {
			const key = this.fold_key( 'open' )
			const open: flags = this.$.$mol_state_session.value< flags | null >( key ) ?? {}
			if( next === undefined ) return open[ name ] ?? fallback

			this.$.$mol_state_session.value( key, { ... open, [ name ]: next } )
			return next
		}

		override outside_expanded( next?: boolean ) {
			return this.$.$mol_state_session.value( this.fold_key( 'outside' ), next ) ?? super.outside_expanded()
		}

		fold_key( kind: string ) {
			return `vmap_layers_${ kind } ${ this.doc_key() }`
		}

		override row_name( name: string ) {
			return name
		}

		override row_title( name: string ) {
			if( this.row_inner( name ) ) return this.inner_prop( name )
			return name || this.root()
		}

		row_class( name: string ): string {

			if( this.row_inner( name ) ) return this.inner_class( this.inner_key( name ) )

			const value = name ? this.node().prop_decl( name )?.kids[ 0 ] : null
			return value && $mol_view_tree2_class_match( value ) ? value.type : ''
		}

		override row_hint( name: string ) {
			return this.row_class( name )
		}

		row_kind( name: string ) {
			if( !name ) return 'root'
			if( this.row_inner( name ) ) return this.row_kids( name ).length ? 'frame' : this.class_kind( name )
			if( this.layers().get( name )?.kids ) return 'frame'

			return this.class_kind( name )
		}

		class_kind( name: string ) {

			const klass = this.row_class( name )
			if( !klass ) return 'text'

			for( const word of klass.split( '_' ).reverse() ) {
				const kind = kinds[ word ]
				if( kind ) return kind
			}

			return 'part'
		}

		override row_icon( name: string ) {
			switch( this.row_kind( name ) ) {
				case 'root': return this.Root_icon()
				case 'frame': return this.Frame_icon( name )
				case 'image': return this.Image_icon( name )
				case 'link': return this.Link_icon( name )
				case 'button': return this.Button_icon( name )
				case 'field': return this.Field_icon( name )
				case 'text': return this.Text_icon( name )
				default: return this.Part_icon( name )
			}
		}

		selected() {
			const picked = this.picked()
			return picked.length ? picked[ picked.length - 1 ] : null
		}

		override row_picked( name: string ) {

			if( this.row_inner( name ) ) return this.inner() === name

			const picked = this.picked()
			if( picked.includes( name ) ) return true
			if( this.row_open( name ) !== false ) return false
			return picked.some( one => this.row_within( name, one ) )
		}

		@ $mol_action
		override row_pick( name: string, event?: MouseEvent ) {
			if( !event ) return null

			if( this.row_inner( name ) ) {
				this.picked([ this.inner_owner( name ) ])
				this.inner( name )
				this.node_show( name )
				return null
			}

			this.inner( '' )

			if( !name ) {
				this.picked( [] )
				return null
			}

			const picked = this.picked()

			if( event.metaKey || event.ctrlKey || event.shiftKey ) {
				this.picked( picked.includes( name ) ? picked.filter( one => one !== name ) : [ ... picked, name ] )
			} else {
				this.picked( [ name ] )
			}

			if( this.picked().includes( name ) ) this.node_show( name )

			return null
		}

		@ $mol_mem
		editing( next?: string | null ) {
			return next ?? null
		}

		row_editing( name: string ) {
			return Boolean( name ) && this.editing() === name && this.selected() === name
		}

		override row_draggable( name: string ) {
			if( this.row_inner( name ) ) return false
			return this.editable() && Boolean( name ) && !this.row_editing( name )
		}

		override row_content( name: string ) {
			return [
				this.Expand( name ),
				this.row_editing( name ) ? this.Edit( name ) : this.Pick( name ),
			]
		}

		@ $mol_action
		override row_edit( name: string, event?: Event ) {
			if( !name || !event || !this.editable() || this.row_inner( name ) ) return null

			this.picked( [ name ] )
			this.row_draft( name, name )
			this.editing( name )

			const field = this.Edit( name )
			field.selection( [ 0, name.length ] )
			field.bring()

			return null
		}

		@ $mol_mem_key
		override row_draft( name: string, next?: string ) {
			return next ?? name
		}

		@ $mol_action
		override row_submit( name: string, event?: Event ) {
			if( !this.row_editing( name ) ) return null

			const draft = this.row_draft( name )

			if( !draft || draft === name ) {
				this.editing( null )
				return null
			}

			if( this.node_title( draft ) === draft ) this.editing( null )

			return null
		}

		@ $mol_action
		override row_key( name: string, event?: KeyboardEvent ) {
			if( event?.key !== 'Escape' ) return null

			event.stopPropagation()

			this.row_draft( name, name )
			this.editing( null )

			return null
		}

		override row_adopt( transfer?: DataTransfer ) {
			if( !this.editable() ) return null
			const name = transfer?.getData( 'text/plain' ) ?? ''
			return name && this.layers().has( name ) ? name : null
		}

		@ $mol_action
		override row_over( name: string, event?: DragEvent ) {
			if( !event ) return null

			const box = ( event.currentTarget as Element | null )?.getBoundingClientRect()
			const share = box?.height ? ( event.clientY - box.top ) / box.height : 0

			this.row_zone( name, this.zone_at( name, share ) )

			return null
		}

		zone_at( name: string, share: number ) {
			if( this.row_inner( name ) ) return ''
			if( !name ) return 'inside'
			if( !this.row_within( '', name ) ) return ''
			if( this.layers().get( name )?.kids && share >= .5 ) return 'inside'
			return 'before'
		}

		@ $mol_action
		override row_receive( anchor: string, dropped?: string | null ) {
			if( !dropped ) return null

			const move = this.move_to( anchor, dropped, this.row_zone( anchor ) )
			if( move ) this.tree_move( move )

			return null
		}

		move_to( anchor: string, name: string, zone: string ): $bog_vmap_app_pane_tree_move | null {
			if( !name || name === anchor ) return null
			if( this.row_inner( name ) || this.row_inner( anchor ) ) return null

			const into = !anchor || zone === 'inside'
			const owner = into ? anchor : this.row_holder( anchor )
			if( owner === null ) return null
			if( owner && !this.row_within( '', owner ) ) return null

			if( owner && ( owner === name || this.row_within( name, owner ) ) ) return null

			const list = this.node().sub_names( owner ) ?? []
			const index = into ? list.length : list.indexOf( anchor )
			if( index < 0 ) return null

			if( this.row_holder( name ) === owner ) {
				const at = list.indexOf( name )
				if( index === at || index === at + 1 ) return null
			}

			return { name, owner, index }
		}

	}

}
