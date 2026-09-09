namespace $ {

	/**
	 * Culling as the document sees it, and what wakes it.
	 *
	 * `cull.test.ts` proves the arithmetic; these prove where it is wired in: the
	 * filter narrows `sub_visible()` and nothing else, the viewport is the box of
	 * the scene, and a box that arrives late or an asset that goes missing moves
	 * the graph rather than waiting for the next camera message.
	 *
	 * `d` keeps `$` out of the string literals — mam builds its dependency graph by
	 * a regexp over sources, literals included.
	 * @see ../ARCHITECTURE.md section 4, section 13
	 */
	const d = '$'

	const pack = 'https://pack.test/web.js'

	/** A scene whose pack never leaves the process. */
	function scene( $: $ ) {

		const ctx = Object.create( $ ) as $

		Reflect.set( ctx, '$mol_import', class extends $mol_import {
			static override script_async( uri: string ) {
				return Promise.resolve( uri )
			}
		} )

		const made = $bog_vmap_scene.make({ $: ctx }) as $$.$bog_vmap_scene
		made.pack_uri( pack )

		return made
	}

	/** Reads a cell that suspends on the fetch of the pack, from outside a fiber. */
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

	type rect = ReturnType< $mol_view[ 'view_rect' ] >

	/**
	 * A box for the scene, as the frame would give it one — and as a cell, the way
	 * the real `view_rect()` is one, so that a new box wakes whatever read the old.
	 */
	function boxed( made: $$.$bog_vmap_scene ) {

		const box = $mol_wire_atom.solo( {}, function box( next?: rect ): rect { return next ?? null } )
		made.view_rect = ()=> box.sync()

		return ( width: number, height: number )=> {
			box.put({ width, height, left: 0, top: 0, right: width, bottom: height })
		}
	}

	/** A document of two free parts, and the scene compiled up to its root. */
	async function two( $: $ ) {

		const made = scene( $ )
		const root = `${d}visible_page`

		made.doc_root( root )
		made.doc_src(
			`${root} ${d}mol_view\n\tsub /\n\t\t<= Near ${d}mol_view\n\t\t<= Far ${d}mol_view\n`
		)

		const doc = await settled( ()=> made.instance() ) as $mol_view

		return { made, doc, root, sized: boxed( made ) }
	}

	$mol_test({

		/**
		 * The filter narrows what is DRAWN and nothing else. Every other reader of
		 * the document — the walk that measures, the seek that blames a node, the
		 * values sent to the inspector — goes through `sub()`, and a `sub()` that
		 * hid a part would hide it from all of them at once.
		 */
		async 'sub() stays whole while sub_visible() is culled'( $ ) {

			const { made, doc, sized } = await two( $ )

			sized( 1000, 800 )
			made.spots({ Near: { x: 0, y: 0 }, Far: { x: 9000, y: 9000 } })

			$mol_assert_equal( doc.sub()!.length, 2 )
			$mol_assert_equal( doc.sub_visible()!.length, 1 )
			$mol_assert_equal( made.walk_of( doc ).kids_of( doc ).length, 2 )

		},

		/**
		 * The viewport is the box of the scene, read the one way `$mol` reads a box.
		 * Two sizes of the same frame judge the same part differently, which no
		 * number taken off the window could do here.
		 */
		async 'the viewport is the box of the scene'( $ ) {

			const { made, sized } = await two( $ )

			made.spots({ Near: { x: 0, y: 0 }, Far: { x: 600, y: 0 } })

			sized( 100, 100 )
			$mol_assert_equal( made.shown().has( 'Far' ), false )

			sized( 2000, 800 )
			$mol_assert_equal( made.shown().has( 'Far' ), true )

		},

		/**
		 * Before the first layout there is no box to judge by, and a part hidden on
		 * a guess would never be drawn, never be measured, and never stop being a
		 * guess. Unknown means shown, for the viewport as much as for a part.
		 */
		async 'nothing is culled until the scene has a box'( $ ) {

			const { made, doc } = await two( $ )

			made.view_rect = ()=> null
			made.spots({ Near: { x: 0, y: 0 }, Far: { x: 9000, y: 9000 } })

			$mol_assert_equal( doc.sub_visible()!.length, 2 )

		},

		/**
		 * A box that arrives after the decision changes the decision: a part whose
		 * point is off screen but whose body reaches in is drawn as soon as its size
		 * is known, not on the next camera message. The reader is asked, not the
		 * scene: a cache nobody invalidated answers with what it remembers.
		 */
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

		/**
		 * Boxes are merged, never replaced: what a report leaves out is a part that
		 * was not drawn, and forgetting its box would send the rule back to judging
		 * by placement points, which it tolerates only until the first measurement.
		 */
		async 'a report that leaves a part out does not forget its box'( $ ) {

			const { made, root } = await two( $ )

			made.sizes_remember({ [ root + '/Far' ]: { x: 1, y: 2, width: 3, height: 4 } })
			made.sizes_remember({ [ root + '/Near' ]: { x: 5, y: 6, width: 7, height: 8 } })

			$mol_assert_like( Object.keys( made.sizes_seen() ), [ 'Far', 'Near' ] )

		},

		/**
		 * An asset the document mentions and the host has not delivered is asked
		 * for once — not on every report round — and asked for again should it go
		 * missing again. Delivery ends the asking without a message.
		 */
		async 'a missing asset is asked for once, and again once it is missing again'( $ ) {

			const made = scene( $ )
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

			// out of the document and back: the cell that asked was swept in
			// between, so the id is asked for anew
			made.doc_src( src( 'nothing' ) )
			made.assets_push()
			await new Promise( next => setTimeout( next, 10 ) )

			made.doc_src( src( 'asset:xyz' ) )
			made.assets_push()
			$mol_assert_like( asks(), [ 'abc', 'xyz', 'xyz' ] )

		},

		/** Every text an address can stand in is watched, not the source alone. */
		'assets are missed from the styles and the libraries too'( $ ) {

			const made = scene( $ )

			made.doc_css( 'a { background: url(asset:css1) }' )
			made.libs([ { tree: `${d}visible_lib ${d}mol_view\n\turi \\asset:lib1\n`, js: '', css: 'b { background: url(asset:lib2) }' } ])

			$mol_assert_like( made.assets_missing(), [ 'css1', 'lib1', 'lib2' ] )

		},

	})

}
