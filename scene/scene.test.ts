namespace $ {

	/**
	 * What the scene does with the pack now that the pack arrives by message.
	 *
	 * The frame has no address of its own — it is raised from markup handed to it —
	 * so `pack_set` is the only way a pack is ever named, and there is a real
	 * window, at the start of every frame, in which no pack has been named yet.
	 * These check that the window is spent doing nothing rather than compiling a
	 * document against the wrong `$mol_view`.
	 *
	 * `d` keeps `$` out of the string literals — mam builds its dependency graph by
	 * a regexp over sources, literals included.
	 * @see ../ARCHITECTURE.md sections 4 and 5
	 */
	const d = '$'

	const root = `${d}scene_probe_page`

	/** A document of one class, the smallest thing that compiles. */
	const source = `${root} ${d}mol_view\n\tsub /\n`

	/**
	 * A scene whose pack never leaves the process: `pack_fetch` is the one method
	 * that touches the network, and it is the only thing replaced here.
	 */
	function scene( $: $ ) {

		const loaded = [] as string[]

		const made = $bog_vmap_scene.make({ $ }) as $$.$bog_vmap_scene

		made.pack_fetch = async ( uri: string )=> {
			loaded.push( uri )
			return uri
		}

		return { made, loaded }
	}

	/** A message from the host, delivered the way the frame delivers one. */
	function deliver( $: $, made: $$.$bog_vmap_scene, data: $bog_vmap_bridge_down ) {

		const dom = $.$mol_dom_context
		const event = new dom.MessageEvent( 'message', { data: { ns: $bog_vmap_bridge_ns, ... data } } )
		Object.defineProperty( event, 'source', { value: made.peer() } )

		made.message_receive( event )
	}

	/**
	 * Reads a cell that suspends on the fetch of the pack, from outside a fiber.
	 *
	 * The suspension is a thrown promise and nothing else here is asynchronous, so
	 * the retry is the whole of it: any other failure is rethrown at once rather
	 * than waited out until the limit.
	 */
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

	$mol_test({

		/**
		 * The state every frame starts in: a document is on hand, a pack is not.
		 * Nothing is compiled and nothing throws, and the wait has a face.
		 *
		 * The class is checked for in the sandbox as well as the instance, because
		 * those are two different failures and only one of them shows. A document
		 * compiled here would inherit the `$mol_view` of the SCENE — a class computes
		 * its base once, and no later load of the pack can move it — so the damage is
		 * done at definition time, before anything is instantiated, and it is done
		 * for the life of the frame. Compilation is green, the bridge reports no
		 * error, and half the palette silently draws as text.
		 */
		'a scene with no pack compiles nothing and says what it waits for'( $ ) {

			const { made, loaded } = scene( $ )

			made.doc_root( root )
			made.doc_src( source )

			$mol_assert_equal( made.pack_uri(), '' )
			$mol_assert_equal( made.instance(), null )
			$mol_assert_like( loaded, [] )

			// not merely uninstantiated: never defined
			$mol_assert_equal( Reflect.get( made.sandbox(), root ), undefined )

			$mol_assert_equal( made.pack_note(), 'Ожидание библиотеки компонентов…' )

		},

		/**
		 * The pack lands and the same document compiles. The bundle is pulled into
		 * the realm exactly once, by the address the host named.
		 */
		async 'a scene compiles once the pack has been named'( $ ) {

			const { made, loaded } = scene( $ )

			made.doc_root( root )
			made.doc_src( source )

			deliver( $, made, { kind: 'pack_set', uri: 'https://pack.test/web.js' } )

			$mol_assert_equal( made.pack_uri(), 'https://pack.test/web.js' )
			$mol_assert_ok( await settled( ()=> made.instance() ) )
			$mol_assert_like( loaded, [ 'https://pack.test/web.js' ] )
			$mol_assert_equal( typeof Reflect.get( made.sandbox(), root ), 'function' )
			$mol_assert_equal( made.pack_note(), '' )

		},

		/**
		 * `pack_set` goes through the same reader as everything else, so a window
		 * that is not the host is not heard — the check that kept a stray debug
		 * frame from taking the bridge over on stage 1.
		 */
		'a pack named by a stranger is not heard'( $ ) {

			const { made, loaded } = scene( $ )
			const dom = $.$mol_dom_context

			made.doc_root( root )
			made.doc_src( source )

			const event = new dom.MessageEvent( 'message', {
				data: { ns: $bog_vmap_bridge_ns, kind: 'pack_set', uri: 'https://evil.test/web.js' },
			} )
			Object.defineProperty( event, 'source', { value: {} } )

			made.message_receive( event )

			$mol_assert_equal( made.pack_uri(), '' )
			$mol_assert_like( loaded, [] )
			$mol_assert_equal( made.instance(), null )

		},

	})

}
