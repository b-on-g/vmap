namespace $.$$ {
	const grab_slack = 8

	const click_slack = 4

	const scene_root = '$' + 'bog_vmap_scene'

	export type $bog_vmap_app_pane_link_new = Pick< $bog_vmap_lang_link, 'from' | 'from_prop' | 'to' | 'to_prop' >

	export type $bog_vmap_app_pane_link_end = Pick< $bog_vmap_lang_link, 'to' | 'to_prop' >

	export type $bog_vmap_app_pane_tree_move = {
		readonly name: string
		readonly owner: string
		readonly index: number
	}

	export type $bog_vmap_app_pane_carry = {
		readonly x: number
		readonly y: number
		readonly owner: string
		readonly index: number
	}

	export type $bog_vmap_app_pane_peer = {
		postMessage( data: unknown, origin: string ): void
		readonly origin: string
	}

	export class $bog_vmap_app_pane extends $.$bog_vmap_app_pane {
		override doc_js(): { readonly [ klass: string ]: string } {
			return {}
		}

		zoom_min() { return .05 }
		zoom_max() { return 16 }

		@ $mol_mem
		override camera_zoom( next?: number ) {
			const zoom = next ?? 1
			return Math.min( this.zoom_max(), Math.max( this.zoom_min(), zoom ) )
		}

		camera(): $bog_vmap_bridge_camera {
			const shift = this.camera_shift()
			const zoom = this.camera_zoom()
			return { x: -shift[0] / zoom, y: -shift[1] / zoom, zoom }
		}

		@ $mol_action
		override camera_reset() {
			this.camera_zoom( 1 )
			this.camera_shift( new this.$.$mol_vector_2d( 0, 0 ) )
		}

		override zoom_title() {
			return Math.round( this.camera_zoom() * 100 ) + '%'
		}

		override zoom_in() {
			this.zoom_by( 1.25 )
		}

		override zoom_out() {
			this.zoom_by( 1 / 1.25 )
		}

		zoom_by( mult: number ) {
			const zoom_prev = this.camera_zoom()
			const zoom_next = this.camera_zoom( zoom_prev * mult )
			const real = zoom_next / zoom_prev

			const rect = this.pane_rect()
			const center = new this.$.$mol_vector_2d( rect.width / 2, rect.height / 2 )

			this.camera_shift(
				this.camera_shift().multed0( real ).added1( center.multed0( 1 - real ) )
			)

		}

		override error() {
			return [ this.isolation(), this.error_at( 'compile' ), this.error_at( 'runtime' ) ]
				.filter( Boolean )
				.join( '\n' )
		}

		@ $mol_mem
		errors(): { readonly [ node: string ]: string } {
			const res = {} as { [ node: string ]: string }

			for( const at of [ 'compile', 'runtime' ] as const ) {
				const node = this.error_node( at )
				const text = this.error_at( at )
				if( !node || !text ) continue

				res[ node ] = res[ node ] ? res[ node ] + '\n' + text : text

			}

			return res
		}

		override node_error( name: string ) {
			return this.errors()[ name ] ?? ''
		}

		@ $mol_mem
		override error_marks() {
			return Object.keys( this.errors() )
				.filter( name => this.part_box( name ) )
				.map( name => this.Mark( name ) )
		}

		@ $mol_mem_key
		override mark_hint( name: string ) {
			return this.node_error( name )
		}

		@ $mol_mem_key
		override mark_style( name: string ): { readonly [ prop: string ]: string } {
			const rect = this.part_box( name )
			if( !rect ) return {}

			return {
				left: rect.left + 'px',
				top: rect.top + 'px',
			}
		}

		scene_key() {
			return this.scene_generation() + ' ' + this.pack_uri()
		}

		override scene_html() {
			return [
				'<!doctype html>',
				'<html lang="en" mol_view_root style="height:100%;width:100%;color-scheme:dark">',
				'<head><meta charset="utf-8" />',
				'<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1" />',
				'</head>',
				'<body mol_view_root style="padding:0;margin:0;height:100%;width:100%">',
				`<div mol_view_root="${ scene_root }"></div>`,
				`<script src="${ this.scene_bundle() }" charset="utf-8"></script>`,
				'</body></html>',
			].join( '' )
		}

		scene_peer(): $bog_vmap_app_pane_peer | null {
			return ( this.Scene( this.scene_key() ).dom_node() as HTMLIFrameElement ).contentWindow
		}

		override sub() {
			return [
				... this.scene_shown() ? [ this.Scene( this.scene_key() ) ] : [],
				this.Overlay(),
				this.Wire(),
				this.Marks(),
				... this.slot() ? [ this.Insert() ] : [],
				... this.band() ? [ this.Band() ] : [],
				this.Camera(),
			] as readonly $mol_view[]
		}

		@ $mol_mem
		scene_shown( next?: boolean ) {
			return next ?? true
		}

		remount_delay() {
			return 500
		}

		@ $mol_action
		override scene_restart() {
			this.restart_tries( 0 )
			this.scene_relaunch()
		}

		@ $mol_action
		scene_relaunch() {
			this.scene_generation( this.scene_generation() + 1 )
			this.warmed( false )
			this.stalled( false )
			this.scene_shown( false )

			new this.$.$mol_after_timeout( this.remount_delay(), ()=> this.scene_shown( true ) )
		}

		@ $mol_mem_key
		override handshake( key: string, next?: number ) {
			return next ?? 0
		}

		override ready() {
			return this.handshake( this.scene_key() ) > 0
		}

		target() {
			return this.ready() ? this.scene_peer() : null
		}

		poke_at = 0

		@ $mol_mem
		answer_at( next?: number ) {
			return next ?? 0
		}

		stamp_last = 0

		stamp() {
			return ++ this.stamp_last
		}

		@ $mol_mem
		poke_direct( next?: number ) {
			return next ?? 0
		}

		@ $mol_mem
		override warmed( next?: boolean ) {
			return next ?? false
		}

		answer_limit() {
			return 8000
		}

		cold_limit() {
			return 30000
		}

		@ $mol_mem
		override stalled( next?: boolean ) {
			return next ?? false
		}

		ping_period() {
			return 2000
		}

		@ $mol_mem
		heartbeat() {
			if( !this.warmed() ) return null

			const target = this.target()
			if( !target ) return null

			this.answer_at()

			return new this.$.$mol_after_timeout( this.ping_period(), () => {
				const nonce = this.stamp()
				this.poke_direct( this.post( target, { kind: 'ping', nonce } ) )
			} )
		}

		@ $mol_mem
		watchdog() {
			this.pack_push()
			this.doc_push()
			this.css_push()
			this.libs_push()
			this.spots_push()
			this.camera_push()

			this.poke_direct()

			if( this.poke_at <= this.answer_at() ) return null

			const limit = this.warmed() ? this.answer_limit() : this.cold_limit()

			return new this.$.$mol_after_timeout( limit, () => {

				if( !this.warmed() && this.restart_tries() < this.restart_tries_max() ) {
					this.restart_tries( this.restart_tries() + 1 )
					this.scene_relaunch()
					return
				}

				this.stalled( true )
			} )
		}

		@ $mol_mem
		restart_tries( next?: number ) {
			return next ?? 0
		}

		restart_tries_max() {
			return 1
		}

		@ $mol_mem
		sizes( next?: { readonly [ node: string ]: $bog_vmap_bridge_rect } ) {
			return next ?? {}
		}

		sizes_merged( fresh: { readonly [ node: string ]: $bog_vmap_bridge_rect } ) {
			const prefix = this.doc_root() + '/'
			const leaf = ( key: string )=> key.slice( prefix.length ).split( '/' ).pop() ?? ''

			const moved = new Set( Object.keys( fresh ).map( leaf ) )
			const kept = {} as { [ node: string ]: $bog_vmap_bridge_rect }

			const sizes = this.sizes()

			for( const key of Object.keys( sizes ) ) {
				if( !( key in fresh ) && moved.has( leaf( key ) ) ) continue
				kept[ key ] = sizes[ key ]
			}

			return { ... kept, ... fresh }
		}

		@ $mol_mem
		nodes_measured() {
			const prefix = this.doc_root() + '/'
			const known = new Set( this.doc_names() )
			const nodes = [] as { name: string, path: readonly string[], box: $bog_vmap_bridge_rect }[]

			for( const key of Object.keys( this.sizes() ) ) {
				if( !key.startsWith( prefix ) ) continue

				const path = key.slice( prefix.length ).split( '/' )

				if( path.some( step => !known.has( step ) ) ) continue

				nodes.push({ name: path[ path.length - 1 ], path, box: this.sizes()[ key ] })
			}

			return nodes
		}

		part_size( name: string ) {
			let found = null as $bog_vmap_bridge_rect | null

			for( const node of this.nodes_measured() ) if( node.name === name ) found = node.box

			return found
		}

		part_names() {
			return this.nodes_measured().map( node => node.name )
		}

		free_names() {
			return this.nodes_measured().filter( node => node.path.length === 1 ).map( node => node.name )
		}

		override world_center(): readonly number[] {
			const rect = this.pane_rect()
			const shift = this.camera_shift()
			const zoom = this.camera_zoom()

			return [
				( rect.width / 2 - shift[0] ) / zoom,
				( rect.height / 2 - shift[1] ) / zoom,
			]
		}

		override free_spot(): readonly number[] {
			const [ x, start ] = this.world_center()
			const boxes = this.nodes_measured().map( node => node.box )

			const covers = ( box: $bog_vmap_bridge_rect, y: number )=> {
				return x >= box.x && x <= box.x + box.width
					&& y >= box.y && y <= box.y + box.height
			}

			let y = start

			for( let step = 0; step <= boxes.length; ++step ) {
				const hit = boxes.find( box => covers( box, y ) )
				if( !hit ) break

				y = hit.y + hit.height + 24
			}

			return [ x, y ]
		}

		node_path( name: string ): readonly string[] {
			for( const node of this.nodes_measured() ) {
				if( node.name === name ) return node.path.slice( 0, -1 )
			}

			return []
		}

		@ $mol_mem
		drag( next?: {
			name: string,
			spots: { readonly [ name: string ]: { readonly x: number, readonly y: number } },
			grab: readonly [ number, number ],
			sizes: { readonly [ node: string ]: $bog_vmap_bridge_rect },
			nested: boolean,
		} | null ) {
			return next ?? null
		}

		@ $mol_mem
		press( next?: {
			screen: readonly [ number, number ],
			world: readonly [ number, number ],
			moved: boolean,
			entering: boolean,
			name: string | null,
		} | null ) {
			return next ?? null
		}

		@ $mol_mem
		override entered( next?: string | null ) {
			return next ?? null
		}

		primary() {
			const picked = this.picked()
			return picked.length ? picked[ picked.length - 1 ] : null
		}

		override inside() {
			const name = this.primary()
			return Boolean( name ) && this.entered() === name
		}

		@ $mol_action
		override leave() {
			const was = this.inside()
			this.entered( null )
			if( was ) this.focused( true )
			return null
		}

		pane_rect(): $bog_vmap_app_pane_screen_box {
			const rect = this.view_rect()
			if( !rect ) return { left: 0, top: 0, width: 0, height: 0 }
			return { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
		}

		screen_point( event: PointerEvent ) {
			const rect = this.pane_rect()
			return [ event.clientX - rect.left, event.clientY - rect.top ] as const
		}

		world_point( event: PointerEvent ) {
			const screen = this.screen_point( event )
			const shift = this.camera_shift()
			const zoom = this.camera_zoom()

			return [
				( screen[0] - shift[0] ) / zoom,
				( screen[1] - shift[1] ) / zoom,
			] as const
		}

		node_at( point: readonly [ number, number ] ) {
			const slack = grab_slack / this.camera_zoom()

			let found = null as string | null
			let depth = 0

			for( const node of this.nodes_measured() ) {
				const box = node.box

				if( point[0] < box.x - slack ) continue
				if( point[1] < box.y - slack ) continue
				if( point[0] > box.x + box.width + slack ) continue
				if( point[1] > box.y + box.height + slack ) continue

				if( node.path.length < depth ) continue

				found = node.name
				depth = node.path.length

			}

			return found
		}

		node_kids( owner: string ) {
			return this.nodes_measured()
				.filter( node => node.path[ node.path.length - 2 ] === owner )
				.map( node => node.box )
		}

		container_at( point: readonly [ number, number ], moving = '' ) {
			const containers = new Set( this.containers() )

			let found = null as string | null
			let depth = 0

			for( const node of this.nodes_measured() ) {
				if( !containers.has( node.name ) ) continue
				if( node.path.length < depth ) continue

				if( moving && node.path.includes( moving ) ) continue

				const box = node.box
				if( point[0] < box.x || point[0] > box.x + box.width ) continue
				if( point[1] < box.y || point[1] > box.y + box.height ) continue

				found = node.name
				depth = node.path.length

			}

			return found
		}

		insert_slot( point: readonly [ number, number ], moving = '' ) {
			const owner = this.container_at( point, moving )
			if( !owner ) return null

			const box = this.part_size( owner )
			if( !box ) return null

			return this.$.$bog_vmap_app_pane_slot(
				owner,
				box,
				this.node_kids( owner ),
				point,
				this.axis( owner ),
			)
		}

		@ $mol_mem
		slot( next?: $bog_vmap_app_pane_slot | null ) {
			return next ?? null
		}

		override tree_move( next?: $bog_vmap_app_pane_tree_move | null ) {
			return next ?? null
		}

		override carry_drop( next?: $bog_vmap_app_pane_carry | null ) {
			return next ?? null
		}

		@ $mol_action
		override carry_at( next?: { readonly x: number, readonly y: number } | null ) {
			if( !next ) return null

			const slot = this.insert_slot([ next.x, next.y ])

			this.carry_drop({
				x: next.x,
				y: next.y,
				owner: slot?.owner ?? '',
				index: slot?.index ?? -1,
			})

			return next
		}

		@ $mol_mem
		band( next?: { readonly from: readonly [ number, number ], readonly to: readonly [ number, number ] } | null ) {
			return next ?? null
		}

		band_wanted( event: PointerEvent ) {
			return Boolean( event.ctrlKey || event.metaKey )
		}

		band_box() {
			const band = this.band()
			if( !band ) return null

			return {
				x: Math.min( band.from[0], band.to[0] ),
				y: Math.min( band.from[1], band.to[1] ),
				width: Math.abs( band.to[0] - band.from[0] ),
				height: Math.abs( band.to[1] - band.from[1] ),
			}
		}

		nodes_covered( box: $bog_vmap_bridge_rect ) {
			const hit = this.nodes_measured().filter( node => {
				const own = node.box
				if( own.x + own.width < box.x ) return false
				if( own.y + own.height < box.y ) return false
				if( own.x > box.x + box.width ) return false
				if( own.y > box.y + box.height ) return false
				return true
			} )

			const names = new Set( hit.map( node => node.name ) )

			return hit
				.filter( node => !node.path.slice( 0, -1 ).some( up => names.has( up ) ) )
				.map( node => node.name )
		}

		node_press( event?: PointerEvent ) {
			if( !event ) return
			if( event.button !== 0 ) return

			if( this.carrying() ) return

			const dot = $bog_vmap_app_wire_dot_at( this.wire_dots(), this.screen_point( event ) )
			if( dot ) return this.wire_press( dot, event )

			const point = this.world_point( event )

			if( this.band_wanted( event ) ) {
				event.preventDefault()
				this.band({ from: point, to: point })
				this.press({ screen: [ event.clientX, event.clientY ], world: point, moved: false, entering: false, name: null })
				return
			}

			const name = this.node_at( point )

			const already = Boolean( name ) && this.picked().includes( name! )
			const entering = already && this.picked().length === 1

			if( !already ) this.picked( name ? [ name ] : [] )
			if( !entering ) this.leave()

			this.press({
				screen: [ event.clientX, event.clientY ],
				world: point,
				moved: false,
				entering,
				name,
			})

			if( !name ) return

			event.preventDefault()

			const spots = {} as { [ node: string ]: { readonly x: number, readonly y: number } }
			for( const picked of this.picked() ) {
				if( this.node_path( picked ).length ) continue
				spots[ picked ] = this.spots()[ picked ] ?? { x: 0, y: 0 }
			}

			this.drag({
				name,
				spots,
				grab: point,
				sizes: this.sizes(),
				nested: this.node_path( name ).length > 0,
			})

			try {
				this.Overlay().dom_node().setPointerCapture( event.pointerId )
			} catch {}

		}

		press_track( event: PointerEvent ) {
			const press = this.press()
			if( !press || press.moved ) return

			const dx = event.clientX - press.screen[0]
			const dy = event.clientY - press.screen[1]

			if( Math.hypot( dx, dy ) > click_slack ) this.press({ ... press, moved: true })
		}

		node_move( event?: PointerEvent ) {
			if( !event ) return
			if( this.carrying() ) return

			this.press_track( event )

			if( this.wire_drag() ) {
				if( !event.buttons ) return this.node_release( event )
				event.preventDefault()
				this.wire_point( this.screen_point( event ) )
				return
			}

			const band = this.band()
			if( band ) {
				if( !event.buttons ) return this.node_release( event )
				event.preventDefault()
				this.band({ from: band.from, to: this.world_point( event ) })
				return
			}

			const drag = this.drag()
			if( !drag ) return

			if( !event.buttons ) return this.node_release( event )

			event.preventDefault()

			const point = this.world_point( event )

			const slot = this.insert_slot( point, drag.name )
			this.slot( slot )

			if( slot || drag.nested ) return

			const next = { ... this.spots() }

			for( const name of Object.keys( drag.spots ) ) {
				next[ name ] = {
					x: drag.spots[ name ].x + point[0] - drag.grab[0],
					y: drag.spots[ name ].y + point[1] - drag.grab[1],
				}
			}

			this.spots( next )

		}

		node_release( event?: PointerEvent ) {
			if( !event ) return

			if( this.carrying() ) {
				const point = this.world_point( event )
				this.carry_at({ x: point[0], y: point[1] })
				return
			}

			const press = this.press()
			this.press( null )

			const moved = press
				? press.moved || press.name !== this.node_at( this.world_point( event ) )
				: false

			if( this.wire_drag() ) return this.wire_release( event )

			const box = this.band_box()
			if( box ) {
				this.band( null )
				if( !moved ) return

				this.leave()
				this.picked( this.nodes_covered( box ) )

				return
			}

			if( this.drag() ) {
				const drag = this.drag()
				const slot = this.slot()

				this.slot( null )

				if( drag && slot ) this.tree_move({ name: drag.name, owner: slot.owner, index: slot.index })

				this.drag( null )

				try {
					this.Overlay().dom_node().releasePointerCapture( event.pointerId )
				} catch {}

			}

			if( !press ) return
			if( event.button !== 0 ) return
			if( moved ) return

			if( press.name && this.picked().length > 1 ) return this.picked([ press.name ])

			if( !press.entering ) return

			this.entered( this.primary() )

			try {
				( this.Scene( this.scene_key() ).dom_node() as HTMLElement ).focus()
			} catch {}

			this.click_send( press.world, event )

		}

		click_send( point: readonly [ number, number ], event: PointerEvent ) {
			const target = this.target()
			if( !target ) return

			this.poke_direct( this.post( target, {
				kind: 'click_at',
				x: point[0],
				y: point[1],
				mods: {
					altKey: Boolean( event.altKey ),
					ctrlKey: Boolean( event.ctrlKey ),
					metaKey: Boolean( event.metaKey ),
					shiftKey: Boolean( event.shiftKey ),
				},
			} ) )

		}

		override frames() {
			return this.picked().filter( name => this.part_box( name ) )
		}

		frame_showed() {
			return this.frames().length > 0
		}

		frame_box(): $bog_vmap_app_pane_screen_box | null {
			const name = this.primary()
			return name ? this.part_box( name ) : null
		}

		@ $mol_mem_key
		part_box( name: string ): $bog_vmap_app_pane_screen_box | null {
			const box = this.part_size( name )
			if( !box ) return null

			const drag = this.drag()
			const spot = this.spots()[ name ]
			const start = drag?.spots[ name ]

			const live = start && spot && this.sizes() === drag!.sizes
			const dx = live ? spot.x - start.x : 0
			const dy = live ? spot.y - start.y : 0

			return this.$.$bog_vmap_app_pane_screen(
				{ x: box.x + dx, y: box.y + dy, width: box.width, height: box.height },
				this.camera_zoom(),
				this.camera_shift(),
			)
		}

		@ $mol_mem
		override insert_style(): { readonly [ prop: string ]: string } {
			const slot = this.slot()
			if( !slot ) return {}

			const rect = this.$.$bog_vmap_app_pane_screen(
				slot.line,
				this.camera_zoom(),
				this.camera_shift(),
			)

			return {
				left: rect.left + 'px',
				top: rect.top + 'px',
				width: Math.max( rect.width, 2 ) + 'px',
				height: Math.max( rect.height, 2 ) + 'px',
			}
		}

		@ $mol_mem
		override band_style(): { readonly [ prop: string ]: string } {
			const box = this.band_box()
			if( !box ) return {}

			const rect = this.$.$bog_vmap_app_pane_screen(
				box,
				this.camera_zoom(),
				this.camera_shift(),
			)

			return {
				left: rect.left + 'px',
				top: rect.top + 'px',
				width: rect.width + 'px',
				height: rect.height + 'px',
			}
		}

		@ $mol_mem_key
		override frame_style( name: string ): { readonly [ prop: string ]: string } {
			const rect = this.part_box( name )
			if( !rect ) return {}

			return {
				left: rect.left + 'px',
				top: rect.top + 'px',
				width: rect.width + 'px',
				height: rect.height + 'px',
			}
		}

		@ $mol_mem
		override overlay_style(): { readonly [ prop: string ]: string } {
			const rect = !this.carrying() && this.inside() ? this.frame_box() : null
			return { clipPath: this.$.$bog_vmap_app_pane_hole( rect ) }
		}

		override link_add( next?: $bog_vmap_app_pane_link_new | null ) {
			return next ?? null
		}

		override link_drop( next?: $bog_vmap_app_pane_link_end | null ) {
			return next ?? null
		}

		@ $mol_mem
		wire_drag( next?: { from: string, from_prop: string, kind: $bog_vmap_app_inspect_value_kind } | null ) {
			return next ?? null
		}

		@ $mol_mem
		wire_point( next?: readonly [ number, number ] ) {
			return next ?? [ 0, 0 ] as const
		}

		port_index( name: string, port: string ) {
			return Math.max( 0, this.part_ports( name ).findIndex( known => known.name === port ) )
		}

		port_point( name: string, port: string, side: $bog_vmap_app_wire_side ) {
			const box = this.part_box( name )
			return box && $bog_vmap_app_wire_port_point( box, side, this.port_index( name, port ) )
		}

		@ $mol_mem
		override wire_lines(): readonly $bog_vmap_app_wire_line[] {
			const values = this.values()
			const lines = [] as $bog_vmap_app_wire_line[]

			for( const link of this.wires() ) {
				const from = this.port_point( link.from, link.from_prop, 'out' )
				const to = this.port_point( link.to, link.to_prop, 'in' )
				if( !from || !to ) continue

				const mid = $bog_vmap_app_wire_curve_mid( from, to )

				lines.push({
					key: `${ link.to }.${ link.to_prop }`,
					geometry: $bog_vmap_app_wire_curve( from, to ),
					label: String( values[ link.name ] ?? '' ),
					label_x: mid[0],
					label_y: mid[1],
				})

			}

			return lines
		}

		@ $mol_mem
		override wire_dots(): readonly $bog_vmap_app_wire_dot[] {
			const linked = new Set( this.wires().map( link => `${ link.to }.${ link.to_prop }` ) )
			const dots = [] as $bog_vmap_app_wire_dot[]

			const add = (
				node: string,
				side: $bog_vmap_app_wire_side,
				lit: ( port: $bog_vmap_app_wire_port )=> boolean,
			)=> {
				const box = this.part_box( node )
				if( !box ) return

				this.part_ports( node ).forEach( ( port, index )=> {
					const [ x, y ] = $bog_vmap_app_wire_port_point( box, side, index )
					dots.push({
						node, port, side, x, y,
						lit: lit( port ),
						linked: side === 'in' && linked.has( `${ node }.${ port.name }` ),
					})
				} )

			}

			const drag = this.wire_drag()

			if( drag ) {
				for( const name of this.part_names() ) {
					if( name === drag.from ) continue
					add( name, 'in', port => $bog_vmap_app_wire_fits( drag.kind, port.kind ) )
				}
				return dots
			}

			const name = this.primary()
			if( name ) {
				add( name, 'in', ()=> true )
				add( name, 'out', ()=> true )
			}

			return dots
		}

		override wire_drag_geometry() {
			const drag = this.wire_drag()
			if( !drag ) return ''

			const from = this.port_point( drag.from, drag.from_prop, 'out' )
			if( !from ) return ''

			return $bog_vmap_app_wire_curve( from, this.wire_point() )
		}

		wire_press( dot: $bog_vmap_app_wire_dot, event: PointerEvent ) {
			event.preventDefault()
			this.press( null )

			let source = { from: dot.node, from_prop: dot.port.name, kind: dot.port.kind }

			if( dot.side === 'in' ) {
				const link = this.wires().find( link => link.to === dot.node && link.to_prop === dot.port.name )
				if( !link ) return

				const port = this.part_ports( link.from ).find( port => port.name === link.from_prop )
				source = { from: link.from, from_prop: link.from_prop, kind: port?.kind ?? 'null' }

				this.link_drop({ to: link.to, to_prop: link.to_prop })

			}

			this.wire_point( this.screen_point( event ) )
			this.wire_drag( source )

			try {
				this.Overlay().dom_node().setPointerCapture( event.pointerId )
			} catch {}

		}

		wire_release( event: PointerEvent ) {
			const drag = this.wire_drag()!
			const dot = $bog_vmap_app_wire_dot_at( this.wire_dots(), this.screen_point( event ) )

			this.wire_drag( null )

			try {
				this.Overlay().dom_node().releasePointerCapture( event.pointerId )
			} catch {}

			if( !dot || !dot.lit ) return

			this.link_add({ from: drag.from, from_prop: drag.from_prop, to: dot.node, to_prop: dot.port.name })

		}

		@ $mol_mem
		wires_visible(): readonly string[] {
			const rect = this.pane_rect()
			const names = new Set< string >()

			for( const link of this.wires() ) {
				const from = this.port_point( link.from, link.from_prop, 'out' )
				const to = this.port_point( link.to, link.to_prop, 'in' )
				if( !from || !to ) continue

				if( Math.max( from[0], to[0] ) < 0 ) continue
				if( Math.max( from[1], to[1] ) < 0 ) continue
				if( Math.min( from[0], to[0] ) > rect.width ) continue
				if( Math.min( from[1], to[1] ) > rect.height ) continue

				names.add( link.name )

			}

			return [ ... names ]
		}

		@ $mol_mem
		values_push() {
			const target = this.target()
			const names = this.wires_visible()
			if( !target ) return names

			this.$.$bog_vmap_bridge_send( target, { kind: 'values_want', names } )

			return names
		}

		post( target: { postMessage( data: unknown, origin: string ): void }, message: $bog_vmap_bridge_down ) {
			this.$.$bog_vmap_bridge_send( target, message )
			return this.poke_at = this.stamp()
		}

		@ $mol_mem
		pack_push() {
			const target = this.target()
			const uri = this.pack_uri()
			if( !target ) return uri

			this.post( target, { kind: 'pack_set', uri } )

			return uri
		}

		@ $mol_mem
		doc_push() {
			const target = this.target()
			const src = this.doc_src()
			if( !target ) return src

			this.post( target, {
				kind: 'doc_set',
				src,
				js: this.doc_js(),
				root: this.doc_root(),
			} )

			return src
		}

		@ $mol_mem
		css_push() {
			const target = this.target()
			const css = this.doc_css()
			if( !target ) return css

			this.post( target, { kind: 'css_set', css } )

			return css
		}

		@ $mol_mem
		spots_push() {
			const target = this.target()
			const spots = this.spots()
			if( !target ) return spots

			this.post( target, { kind: 'spots_set', spots } )

			return spots
		}

		@ $mol_mem
		libs_push() {
			const target = this.target()
			const parts = this.libs()
			if( !target ) return parts

			this.post( target, { kind: 'libs_set', parts } )

			return parts
		}

		@ $mol_mem
		camera_push() {
			const target = this.target()
			const camera = this.camera()
			if( !target ) return camera

			this.post( target, { kind: 'camera_set', camera } )

			return camera
		}

		@ $mol_mem
		override isolation() {
			if( !this.ready() ) return ''

			const peer = this.scene_peer()
			if( !peer ) return 'Кадра сцены нет — рисовать документ негде'

			try {
				const origin = peer.origin
				return `Песочница не работает: кадр сцены живёт на origin ${ origin }, то есть код документа исполняется наравне с редактором`
			} catch {
				return ''
			}

		}

		message_receive( event?: MessageEvent ) {
			if( !event ) return

			const peer = this.scene_peer()
			if( !peer ) return

			const message = this.$.$bog_vmap_bridge_read< $bog_vmap_bridge_up >( event, peer )
			if( !message ) return

			this.answer_at( this.stamp() )
			this.stalled( false )

			if( message.kind === 'ready' ) {
				this.error_at( 'compile', '' )
				this.error_at( 'runtime', '' )

				this.warmed( false )

				const key = this.scene_key()
				this.handshake( key, this.handshake( key ) + 1 )
				return
			}

			if( message.kind === 'error' ) {
				const at = message.at === 'compile' ? 'compile' : 'runtime'

				if( message.message === null ) {
					this.error_at( at, '' )
					return
				}

				const label = at === 'compile' ? 'компиляция' : 'исполнение'
				const node = message.node ? ` — ${ message.node }` : ''
				this.error_at( at, `${ label }${ node }: ${ message.message }` )
				this.error_node( at, message.node ?? '' )
				return
			}

			if( message.kind === 'key' ) {
				if( this.inside() ) this.leave()
				else this.picked([])

				return
			}

			if( message.kind === 'values' ) {
				this.values( message.values )
				return
			}

			if( message.kind === 'sizes' ) {
				this.sizes( this.sizes_merged( message.sizes ) )
				this.warmed( true )
				this.restart_tries( 0 )
				return
			}

		}

		@ $mol_mem
		message_listener() {
			return new this.$.$mol_dom_listener(
				this.$.$mol_dom_context,
				'message',
				$mol_wire_async( this ).message_receive,
			)
		}

		override auto() {
			return [
				... super.auto(),
				this.view_rect(),
				this.message_listener(),
				this.pack_push(),
				this.doc_push(),
				this.css_push(),
				this.libs_push(),
				this.spots_push(),
				this.camera_push(),
				this.values_push(),
				this.heartbeat(),
				this.watchdog(),
			]
		}

	}

	export class $bog_vmap_app_pane_overlay extends $.$bog_vmap_app_pane_overlay {
		override sub() {
			return this.frames().map( name => this.Frame( name ) )
		}

	}

}
