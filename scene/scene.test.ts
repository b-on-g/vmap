namespace $ {

	const d = '$'

	const pack = 'https://pack.test/web.js'

	function scene( $: $, uri = pack ) {

		const loaded = [] as string[]
		const ctx = Object.create( $ ) as $

		Reflect.set( ctx, '$mol_import', class extends $mol_import {
			static override script_async( uri: string ) {
				loaded.push( uri )
				return Promise.resolve( uri )
			}
		} )

		const made = $bog_vmap_scene.make({ $: ctx }) as $$.$bog_vmap_scene
		if( uri ) made.pack_uri( uri )

		return { made, loaded, ctx }
	}

	function deliver( $: $, made: $$.$bog_vmap_scene, data: $bog_vmap_bridge_down ) {

		const dom = $.$mol_dom_context
		const event = new dom.MessageEvent( 'message', { data: { ns: $bog_vmap_bridge_ns, ... data } } )
		Object.defineProperty( event, 'source', { value: made.peer() } )

		made.message_receive( event )
	}

	async function settled< Value >( read: ()=> Value, limit = 300 ) {

		const till = Date.now() + limit

		for( ;; ) {

			try {
				return read()
			} catch( error: unknown ) {

				if( !$mol_promise_like( error ) ) return $mol_fail( error as Error )
				if( Date.now() > till ) return $mol_fail( new Error( 'the pack never landed' ) )

				await new Promise( next => setTimeout( next, 2 ) )
			}

		}

	}

	function wired( made: $$.$bog_vmap_scene ) {

		const sent = [] as $bog_vmap_bridge_up[]
		made.post = ( message: $bog_vmap_bridge_up )=> { sent.push( message ) }

		const observer = { observe: ()=> {}, unobserve: ()=> {}, disconnect: ()=> {} }
		made.resize_watch = ()=> ({ observer: observer as unknown as ResizeObserver, destructor: ()=> {} })

		return sent
	}

	function failure( sent: readonly $bog_vmap_bridge_up[], at: 'compile' | 'runtime' ) {
		const errors = sent.filter( m => m.kind === 'error' && m.at === at )
		return errors[ errors.length - 1 ] as undefined | { message: string | null, node?: string }
	}

	async function grown( made: $$.$bog_vmap_scene, root: string, src: string ) {
		made.doc_root( root )
		made.doc_src( src )
		return await settled( ()=> made.instance() ) as any
	}

	type rect = ReturnType< $mol_view[ 'view_rect' ] >

	function boxed( made: $$.$bog_vmap_scene ) {

		const box = $mol_wire_atom.solo( {}, function box( next?: rect ): rect { return next ?? null } )
		made.view_rect = ()=> box.sync()

		return ( width: number, height: number )=> {
			box.put({ width, height, left: 0, top: 0, right: width, bottom: height })
		}
	}

	async function two( $: $ ) {

		const { made } = scene( $ )
		const root = `${d}visible_page`

		const doc = await grown(
			made, root,
			`${root} ${d}mol_view\n\tsub /\n\t\t<= Near ${d}mol_view\n\t\t<= Far ${d}mol_view\n`,
		) as $mol_view

		return { made, doc, root, sized: boxed( made ) }
	}

	$mol_test({

		'a scene with no pack compiles nothing and says what it waits for'( $ ) {

			const { made, loaded } = scene( $, '' )
			const root = `${d}scene_probe_page`

			made.doc_root( root )
			made.doc_src( `${root} ${d}mol_view\n\tsub /\n` )

			$mol_assert_equal( made.pack_uri(), '' )
			$mol_assert_equal( made.instance(), null )
			$mol_assert_like( loaded, [] )

			$mol_assert_equal( Reflect.get( made.sandbox(), root ), undefined )

			$mol_assert_equal( made.pack_note(), 'Ожидание библиотеки компонентов…' )

		},

		async 'a scene compiles once the pack has been named'( $ ) {

			const { made, loaded } = scene( $, '' )
			const root = `${d}scene_probe_page`

			made.doc_root( root )
			made.doc_src( `${root} ${d}mol_view\n\tsub /\n` )

			deliver( $, made, { kind: 'pack_set', uri: pack } )

			$mol_assert_equal( made.pack_uri(), pack )
			$mol_assert_ok( await settled( ()=> made.instance() ) )
			$mol_assert_like( loaded, [ pack ] )
			$mol_assert_equal( typeof Reflect.get( made.sandbox(), root ), 'function' )
			$mol_assert_equal( made.pack_note(), '' )

		},

		'a pack named by a stranger is not heard'( $ ) {

			const { made, loaded } = scene( $, '' )
			const dom = $.$mol_dom_context
			const root = `${d}scene_probe_page`

			made.doc_root( root )
			made.doc_src( `${root} ${d}mol_view\n\tsub /\n` )

			const event = new dom.MessageEvent( 'message', {
				data: { ns: $bog_vmap_bridge_ns, kind: 'pack_set', uri: 'https://evil.test/web.js' },
			} )
			Object.defineProperty( event, 'source', { value: {} } )

			made.message_receive( event )

			$mol_assert_equal( made.pack_uri(), '' )
			$mol_assert_like( loaded, [] )
			$mol_assert_equal( made.instance(), null )

		},

		async 'the pack is imported once, whatever the pack does to the importer'( $ ) {

			const { made, loaded, ctx } = scene( $, '' )
			const root = `${d}scene_import_page`

			Reflect.set( ctx, '$mol_import', class extends $mol_import {
				static override script_async( uri: string ) {
					loaded.push( 'first:' + uri )
					Reflect.set( ctx, '$mol_import', class extends $mol_import {
						static override script_async( uri: string ) {
							loaded.push( 'second:' + uri )
							return Promise.resolve( uri )
						}
					} )
					return Promise.resolve( uri )
				}
			} )

			made.pack_uri( pack )
			await grown( made, root, `${root} ${d}mol_view\n\tsub /\n` )

			$mol_assert_like( loaded, [ 'first:' + pack ] )

		},

		async 'escape pressed inside the frame is relayed, other keys are not'( $ ) {

			const { made } = scene( $ )
			const sent = wired( made )
			const dom = $.$mol_dom_context

			made.key_listener()

			dom.dispatchEvent( new dom.KeyboardEvent( 'keydown', { key: 'a' } ) )
			dom.dispatchEvent( new dom.KeyboardEvent( 'keydown', { key: 'Escape' } ) )
			await new Promise( next => setTimeout( next, 10 ) )

			$mol_assert_like( sent.filter( m => m.kind === 'key' ), [ { kind: 'key', key: 'Escape' } ] )

		},

		async 'a failure of the document raises no second failure of the scene'( $ ) {

			const { made, ctx } = scene( $, '' )
			const root = `${d}scene_try_page`

			let dispatched = 0
			Reflect.set( ctx, '$mol_try', ( handler: ()=> unknown )=> { dispatched ++; return handler() } )

			made.pack_uri( pack )
			await grown( made, root, `${root} ${d}mol_view\n\tsub /\n` )

			const boom = new Error( 'bang' )
			$mol_assert_equal( made.$.$mol_try( ()=> { throw boom } ), boom )
			$mol_assert_equal( made.$.$mol_try( ()=> 'ok' ), 'ok' )
			$mol_assert_equal( dispatched, 0 )

		},

		async 'an edit of one class leaves the instances of its neighbour alone'( $ ) {

			const { made } = scene( $ )
			const root = `${d}hot_two_page`

			const src = ( tag: string )=>
				`${root} ${d}mol_view\n`
				+ `\tsub /\n\t\t<= Kid ${d}hot_two_kid\n\t\t<= Tail ${d}hot_two_tail\n`
				+ `${d}hot_two_kid ${d}mol_view\n\tnote? \\\n`
				+ `${d}hot_two_tail ${d}mol_view\n\ttag \\${ tag }\n`

			const first = await grown( made, root, src( 'one' ) )

			const kid = first.Kid()
			const tail = first.Tail()

			kid.note( 'typed by hand' )

			const second = await grown( made, root, src( 'two' ) )

			$mol_assert_equal( second, first )
			$mol_assert_equal( second.Kid(), kid )
			$mol_assert_equal( second.Tail(), tail )

			$mol_assert_equal( kid.note(), 'typed by hand' )

			$mol_assert_equal( tail.tag(), 'two' )

		},

		async 'an heir declared above its base follows an edit of that base'( $ ) {

			const { made } = scene( $ )
			const root = `${d}hot_heir_page`

			const src = ( tag: string )=>
				`${root} ${d}mol_view\n\tsub /\n\t\t<= Kid ${d}hot_heir_kid\n`
				+ `${d}hot_heir_kid ${d}hot_heir_base\n`
				+ `${d}hot_heir_base ${d}mol_view\n\ttag \\${ tag }\n`

			const first = await grown( made, root, src( 'one' ) )
			$mol_assert_equal( first.Kid().tag(), 'one' )

			const second = await grown( made, root, src( 'two' ) )

			$mol_assert_equal( second, first )
			$mol_assert_equal( second.Kid().tag(), 'two' )

		},

		async 'the sandbox is one per document and holds the fresh classes'( $ ) {

			const { made } = scene( $ )
			const root = `${d}hot_box_page`

			const src = ( tag: string )=>
				`${root} ${d}mol_view\n\tsub /\n\t\t<= Kid ${d}hot_box_kid\n`
				+ `${d}hot_box_kid ${d}mol_view\n\ttag \\${ tag }\n`

			const first = await grown( made, root, src( 'one' ) )
			const box = made.sandbox()
			const kid = first.Kid()

			await grown( made, root, src( 'two' ) )

			$mol_assert_equal( made.sandbox(), box )
			$mol_assert_equal( ( kid as any ).$, box )

			$mol_assert_equal( Reflect.get( box, `${d}hot_box_kid` ), kid.constructor )

		},

		async 'written values survive a recompile'( $ ) {

			const { made } = scene( $ )
			const root = `${d}hot_state_page`

			const src = ( tag: string )=>
				`${root} ${d}mol_view\n`
				+ `\ttag \\${ tag }\n`
				+ `\tcount? 0\n`
				+ `\tslot*id? \\\n`
				+ `\ttext? \\\n`

			const first = await grown( made, root, src( 'one' ) )

			first.count( 7 )
			first.slot( 'left', 'held' )
			first.text( 'typed by hand' )

			const second = await grown( made, root, src( 'two' ) )

			$mol_assert_equal( second, first )
			$mol_assert_equal( second.tag(), 'two' )
			$mol_assert_equal( second.count(), 7 )
			$mol_assert_equal( second.slot( 'left' ), 'held' )
			$mol_assert_equal( second.text(), 'typed by hand' )

		},

		async 'a changed base rebuilds instead of swapping'( $ ) {

			const { made } = scene( $ )
			const root = `${d}hot_base_page`

			const src = ( base: string )=>
				`${root} ${d}mol_view\n\tsub /\n\t\t<= Kid ${d}hot_base_kid\n`
				+ `${d}hot_base_kid ${d}hot_base_${ base }\n`
				+ `${d}hot_base_one ${d}mol_view\n\ttag \\one\n`
				+ `${d}hot_base_two ${d}mol_view\n\ttag \\two\n`

			const first = await grown( made, root, src( 'one' ) )
			$mol_assert_equal( first.Kid().tag(), 'one' )

			const second = await grown( made, root, src( 'two' ) )

			$mol_assert_equal( second === first, false )
			$mol_assert_equal( second.Kid().tag(), 'two' )

		},

		async 'a changed pack rebuilds instead of swapping'( $ ) {

			const { made } = scene( $ )
			const root = `${d}hot_pack_page`
			const src = `${root} ${d}mol_view\n\ttag \\one\n`

			const first = await grown( made, root, src )

			made.pack_uri( 'https://other.test/web.js' )

			const second = await settled( ()=> made.instance() ) as any

			$mol_assert_equal( second === first, false )

		},

		async 'a property that turns keyed leaves no atom of the old shape'( $ ) {

			const { made } = scene( $ )
			const root = `${d}hot_shape_page`

			const solo = `${root} ${d}mol_view\n\tnote? \\\n`
			const keyed = `${root} ${d}mol_view\n\tnote*id? \\\n`

			const first = await grown( made, root, solo )

			first.note( 'written' )
			$mol_assert_equal( first.note(), 'written' )
			$mol_assert_ok( Reflect.get( first, 'note()' ) )

			const second = await grown( made, root, keyed )

			$mol_assert_equal( second, first )
			$mol_assert_equal( made.compile_error(), '' )

			$mol_assert_equal( Reflect.get( second, 'note()' ), undefined )

			$mol_assert_equal( second.note( 'a' ), '' )
			$mol_assert_equal( second.note( 'a', 'again' ), 'again' )
			$mol_assert_ok( Reflect.get( second, 'note()' ) instanceof Map )

		},

		'the scene orders declarations by the sort of the language'( $ ) {

			const asked = [] as number[]

			const ctx = Object.create( $ ) as $
			Reflect.set( ctx, '$bog_vmap_lang_sorted', ( defs: readonly $mol_tree2[] )=> {
				asked.push( defs.length )
				return [ ... defs ].reverse()
			} )

			const defs = $.$mol_tree2_from_string( `${d}hot_sort_a ${d}mol_view\n${d}hot_sort_b ${d}mol_view\n` ).kids

			const out = ctx.$bog_vmap_scene_order( [], defs )

			$mol_assert_like( asked, [ 2 ] )
			$mol_assert_like( out.map( def => def.type ), [ `${d}hot_sort_b`, `${d}hot_sort_a` ] )

		},

		async 'a compile failure leaves the living instance whole'( $ ) {

			const { made } = scene( $ )
			const root = `${d}hot_fail_page`

			const src = ( tag: string )=> `${root} ${d}mol_view\n\ttag \\${ tag }\n\tnote? \\\n`

			const first = await grown( made, root, src( 'one' ) )
			first.note( 'typed by hand' )

			const broken = await grown(
				made, root,
				src( 'one' ) + `${d}hot_fail_kid ${d}hot_fail_ghost\n`,
			)

			$mol_assert_equal( broken, first )
			$mol_assert_ok( made.compile_error() )
			$mol_assert_equal( first.note(), 'typed by hand' )

			const fixed = await grown( made, root, src( 'two' ) )

			$mol_assert_equal( fixed, first )
			$mol_assert_equal( made.compile_error(), '' )
			$mol_assert_equal( fixed.tag(), 'two' )
			$mol_assert_equal( fixed.note(), 'typed by hand' )

		},

		async 'a runtime failure names the node it belongs to'( $ ) {

			const { made } = scene( $ )
			const sent = wired( made )
			const root = `${d}hot_blame_page`

			const first = await grown(
				made, root,
				`${root} ${d}mol_view\n\tsub /\n\t\t<= Tail ${d}hot_blame_tail\n`
				+ `${d}hot_blame_tail ${d}mol_view\n\tsub /\n\t\t<= Deep ${d}hot_blame_deep\n`
				+ `${d}hot_blame_deep ${d}mol_view\n\tsub /\n\t\t<= boom \\\n`,
			)

			made.doc_js({ [ `${d}hot_blame_deep` ]: 'boom() { throw new Error( "bang" ) }' })

			await settled( ()=> made.instance() )
			try { first.dom_tree() } catch {}

			$mol_assert_equal( made.render_error( first ).node, 'Tail' )
			$mol_assert_ok( made.render_error( first ).message )

			made.report_send()

			const failed = failure( sent, 'runtime' )

			$mol_assert_equal( failed?.node, 'Tail' )
			$mol_assert_ok( failed?.message )

		},

		async 'a failure with no node to blame reports an empty one'( $ ) {

			const { made } = scene( $ )
			const sent = wired( made )
			const root = `${d}hot_blank_page`

			await grown( made, root, `${root} ${d}mol_view\n\ttag \\one\n` )

			made.error_post( 'runtime', 'something nobody owns', '' )

			const failed = failure( sent, 'runtime' )

			$mol_assert_equal( failed?.message, 'something nobody owns' )
			$mol_assert_equal( failed?.node, '' )

		},

		async 'the last failure sent is a cell, and it wakes its reader'( $ ) {

			const { made } = scene( $ )
			wired( made )
			const root = `${d}hot_edge_page`

			await grown( made, root, `${root} ${d}mol_view\n\ttag \\one\n` )

			const seen = {} as object
			const atom = $mol_wire_atom.solo( seen, function watcher() { return made.error_sent( 'runtime' ) } )

			$mol_assert_equal( atom.sync(), null )

			made.error_post( 'runtime', 'first', '' )

			$mol_assert_equal( atom.sync(), 'first' )

			$mol_assert_equal( made.error_sent( 'compile' ), null )

			made.error_post( 'runtime', '', '' )
			$mol_assert_equal( atom.sync(), null )

		},

		async 'a compile failure names the node of the class that broke'( $ ) {

			const { made } = scene( $ )
			const sent = wired( made )
			const root = `${d}hot_guilt_page`

			const src = ( kid: string )=>
				`${root} ${d}mol_view\n\tsub /\n\t\t<= Kid ${d}hot_guilt_kid\n`
				+ `${d}hot_guilt_kid ${kid}\n\ttag \\one\n`

			const first = await grown( made, root, src( `${d}mol_view` ) )
			$mol_assert_ok( first.Kid() )

			await grown( made, root, src( `${d}hot_guilt_ghost` ) )

			$mol_assert_ok( made.compile_error() )
			$mol_assert_equal( made.compile_class(), `${d}hot_guilt_kid` )

			made.report_send()

			$mol_assert_equal( failure( sent, 'compile' )?.node, 'Kid' )

		},

		async 'a reader of the compile failure is woken when it changes'( $ ) {

			const { made } = scene( $ )
			const root = `${d}hot_wake_page`
			const src = ( tag: string )=> `${root} ${d}mol_view\n\ttag \\${ tag }\n`

			await grown( made, root, src( 'one' ) )

			const seen = {} as object
			const atom = $mol_wire_atom.solo( seen, function watcher() { return made.compile_error() } )

			$mol_assert_equal( atom.sync(), '' )

			await grown( made, root, src( 'one' ) + `${d}hot_wake_kid ${d}hot_wake_ghost\n` )

			$mol_assert_ok( atom.sync() )
			$mol_assert_equal( atom.sync(), made.compile_error() )

		},

		async 'the reported node is a part name, not a path and not a class'( $ ) {

			const { made } = scene( $ )
			const root = `${d}hot_shape_name_page`

			const first = await grown(
				made, root,
				`${root} ${d}mol_view\n\tsub /\n\t\t<= Tail ${d}hot_shape_name_tail\n`
				+ `${d}hot_shape_name_tail ${d}mol_view\n\tsub /\n\t\t<= Deep ${d}hot_shape_name_deep\n`
				+ `${d}hot_shape_name_deep ${d}mol_view\n\tsub /\n\t\t<= boom \\\n`,
			)

			made.doc_js({ [ `${d}hot_shape_name_deep` ]: 'boom() { throw new Error( "bang" ) }' })

			await settled( ()=> made.instance() )
			try { first.dom_tree() } catch {}

			const node = made.render_error( first ).node

			$mol_assert_equal( node.includes( '/' ), false )
			$mol_assert_equal( node.startsWith( '$' ), false )

			const walk = made.walk_of( first )
			const parts = walk.kids_of( first )
				.map( kid => walk.view_of( kid ) )
				.filter( Boolean )
				.map( view => walk.prop_of( view! ) )

			$mol_assert_equal( parts.includes( node ), true )

		},

		async 'a failure of the root itself is reported with no node'( $ ) {

			const { made } = scene( $ )
			const root = `${d}hot_top_page`

			const first = await grown( made, root, `${root} ${d}mol_view\n\tsub /\n\t\t<= boom \\\n` )

			made.doc_js({ [ root ]: 'boom() { throw new Error( "bang" ) }' })

			await settled( ()=> made.instance() )
			try { first.dom_tree() } catch {}

			const failed = made.render_error( first )

			$mol_assert_ok( failed.message )
			$mol_assert_equal( failed.node, '' )

		},

		async 'a property memoized twice keeps its state across an edit'( $ ) {

			const { made } = scene( $ )
			const root = `${d}hot_twice_page`
			const src = ( tag: string )=> `${root} ${d}mol_view\n\ttag \\${ tag }\n\tnote? \\\n`

			made.doc_root( root )
			made.doc_src( src( 'one' ) )
			made.doc_js({ [ root ]: 'note( next ) { return next ?? "from body" }' })

			const first = await settled( ()=> made.instance() ) as any

			$mol_assert_equal( first.note(), 'from body' )

			$mol_assert_like( Object.getOwnPropertyNames( first ).filter( key => key.endsWith( '()' ) ), [ 'note ()' ] )

			first.note( 'typed by hand' )

			const second = await grown( made, root, src( 'two' ) )

			$mol_assert_equal( second, first )
			$mol_assert_equal( second.tag(), 'two' )
			$mol_assert_equal( second.note(), 'typed by hand' )
			$mol_assert_equal( made.compile_error(), '' )

		},

		async 'an edit of a handwritten body reaches the rendered text'( $ ) {

			const { made } = scene( $ )
			const root = `${d}hot_paint_page`
			const kid = `${d}hot_paint_kid`

			made.doc_js({ [ kid ]: 'greeting() { return "Живая" }' })

			const first = await grown(
				made, root,
				`${root} ${d}mol_view\n\tsub /\n\t\t<= Knopka ${kid}\n`
				+ `${kid} ${d}mol_view\n\tsub /\n\t\t<= greeting \\\n`,
			)

			first.dom_tree()
			$mol_assert_equal( first.Knopka().dom_node().textContent, 'Живая' )

			made.doc_js({ [ kid ]: 'greeting() { return "Ожила" }' })
			$mol_assert_equal( await settled( ()=> made.instance() ), first )

			first.dom_tree()
			$mol_assert_equal( first.Knopka().dom_node().textContent, 'Ожила' )

		},

		async 'a method that appears heals the node that failed for want of it'( $ ) {

			const { made } = scene( $ )
			const root = `${d}hot_heal_page`
			const kid = `${d}hot_heal_kid`

			made.doc_js({ [ kid ]: 'title() { return this.greeting() }' })

			const first = await grown(
				made, root,
				`${root} ${d}mol_view\n\tsub /\n\t\t<= Knopka ${kid}\n`
				+ `${kid} ${d}mol_view\n\tsub /\n\t\t<= title \\\n`,
			)

			first.dom_tree()

			const node = first.Knopka().dom_node() as Element
			$mol_assert_equal( node.getAttribute( 'mol_view_error' ), 'TypeError' )

			made.doc_js({ [ kid ]: 'title() { return this.greeting() }\ngreeting() { return "Живая" }' })
			$mol_assert_equal( await settled( ()=> made.instance() ), first )

			first.dom_tree()
			$mol_assert_equal( node.getAttribute( 'mol_view_error' ), null )
			$mol_assert_equal( node.textContent, 'Живая' )

		},

		async 'sub() stays whole while sub_visible() is culled'( $ ) {

			const { made, doc, sized } = await two( $ )

			sized( 1000, 800 )
			made.spots({ Near: { x: 0, y: 0 }, Far: { x: 9000, y: 9000 } })

			$mol_assert_equal( doc.sub()!.length, 2 )
			$mol_assert_equal( doc.sub_visible()!.length, 1 )
			$mol_assert_equal( made.walk_of( doc ).kids_of( doc ).length, 2 )

		},

		async 'the viewport is the box of the scene'( $ ) {

			const { made, sized } = await two( $ )

			made.spots({ Near: { x: 0, y: 0 }, Far: { x: 600, y: 0 } })

			sized( 100, 100 )
			$mol_assert_equal( made.shown().has( 'Far' ), false )

			sized( 2000, 800 )
			$mol_assert_equal( made.shown().has( 'Far' ), true )

		},

		async 'nothing is culled until the scene has a box'( $ ) {

			const { made, doc } = await two( $ )

			made.view_rect = ()=> null
			made.spots({ Near: { x: 0, y: 0 }, Far: { x: 9000, y: 9000 } })

			$mol_assert_equal( doc.sub_visible()!.length, 2 )

		},

		async 'a box that arrives wakes the culling'( $ ) {

			const { made, root, sized } = await two( $ )

			sized( 1000, 800 )
			made.spots({ Near: { x: 0, y: 0 }, Far: { x: -700, y: 0 } })

			const seen = {} as object
			const atom = $mol_wire_atom.solo( seen, function watcher() { return made.shown().has( 'Far' ) } )

			$mol_assert_equal( atom.sync(), false )

			made.sizes_remember({ [ root + '/Far' ]: { x: -700, y: 0, width: 400, height: 40 } })

			$mol_assert_equal( atom.sync(), true )

		},

		async 'a report that leaves a part out does not forget its box'( $ ) {

			const { made, root } = await two( $ )

			made.sizes_remember({ [ root + '/Far' ]: { x: 1, y: 2, width: 3, height: 4 } })
			made.sizes_remember({ [ root + '/Near' ]: { x: 5, y: 6, width: 7, height: 8 } })

			$mol_assert_like( Object.keys( made.sizes_seen() ), [ 'Far', 'Near' ] )

		},

		async 'a missing asset is asked for once, and again once it is missing again'( $ ) {

			const { made } = scene( $ )
			const sent = [] as $bog_vmap_bridge_up[]
			made.post = ( message: $bog_vmap_bridge_up )=> { sent.push( message ) }

			const asks = ()=> sent.filter( m => m.kind === 'asset_want' ).map( m => ( m as { id: string } ).id )

			const src = ( uri: string )=> `${d}visible_asset ${d}mol_view\n\ttitle \\${ uri }\n`

			made.doc_root( `${d}visible_asset` )
			made.doc_src( src( 'asset:abc' ) )

			made.assets_push()
			made.assets_push()
			$mol_assert_like( asks(), [ 'abc' ] )

			made.assets({ abc: 'blob:null/1' })
			made.assets_push()
			$mol_assert_like( made.assets_missing(), [] )
			$mol_assert_like( asks(), [ 'abc' ] )

			made.doc_src( src( 'asset:xyz' ) )
			made.assets_push()
			$mol_assert_like( asks(), [ 'abc', 'xyz' ] )

			made.doc_src( src( 'nothing' ) )
			made.assets_push()
			await new Promise( next => setTimeout( next, 10 ) )

			made.doc_src( src( 'asset:xyz' ) )
			made.assets_push()
			$mol_assert_like( asks(), [ 'abc', 'xyz', 'xyz' ] )

		},

		'assets are missed from the styles and the libraries too'( $ ) {

			const { made } = scene( $ )

			made.doc_css( 'a { background: url(asset:css1) }' )
			made.libs([ { tree: `${d}visible_lib ${d}mol_view\n\turi \\asset:lib1\n`, js: '', css: 'b { background: url(asset:lib2) }' } ])

			$mol_assert_like( made.assets_missing(), [ 'css1', 'lib1', 'lib2' ] )

		},

	})

}
