namespace $ {

	/**
	 * Hot recompilation: an edit moves the living component onto the new classes
	 * instead of building another one.
	 *
	 * Everything here is checked on a document of SEVERAL classes, because that is
	 * the mode the editor works in and the one the S2 bench never ran. Two failures
	 * of this are silent rather than loud, so both have a test of their own: a
	 * recreated sandbox would cut live instances off the fresh classes, and
	 * unsorted declarations would let an heir inherit the previous version of its
	 * base with no error anywhere.
	 *
	 * `d` keeps `$` out of the string literals — mam builds its dependency graph by
	 * a regexp over sources, literals included.
	 * @see ../ARCHITECTURE.md section 3, ../spike/S2.md
	 */
	const d = '$'

	const pack = 'https://pack.test/web.js'

	/** A scene whose pack never leaves the process. */
	function scene( $: $ ) {

		const made = $bog_vmap_scene.make({ $ }) as $$.$bog_vmap_scene

		made.pack_fetch = async ( uri: string )=> uri
		made.pack_uri( pack )

		return made
	}

	/**
	 * Reads a cell that suspends on the fetch of the pack, from outside a fiber.
	 * Any other failure is rethrown at once rather than waited out.
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

	/**
	 * Collects what the scene puts on the wire, in order.
	 *
	 * `ResizeObserver` is stubbed along the way: node has none, and without it a
	 * report round dies on the resize step before it ever reaches the error it was
	 * called to send. Nothing about attribution is replaced, only a browser API.
	 */
	function wired( made: $$.$bog_vmap_scene ) {

		const sent = [] as $bog_vmap_bridge_up[]
		made.post = ( message: $bog_vmap_bridge_up )=> { sent.push( message ) }

		const observer = { observe: ()=> {}, unobserve: ()=> {}, disconnect: ()=> {} }
		made.resize_watch = ()=> ({ observer: observer as unknown as ResizeObserver, destructor: ()=> {} })

		return sent
	}

	/** The last failure the scene reported on one channel. */
	function failure( sent: readonly $bog_vmap_bridge_up[], at: 'compile' | 'runtime' ) {
		const errors = sent.filter( m => m.kind === 'error' && m.at === at )
		return errors[ errors.length - 1 ] as undefined | { message: string | null, node?: string }
	}

	/** Compiles a source and hands back the live root. */
	async function grown( made: $$.$bog_vmap_scene, root: string, src: string ) {
		made.doc_root( root )
		made.doc_src( src )
		return await settled( ()=> made.instance() ) as any
	}

	$mol_test({

		/**
		 * The whole point of the stage, on the shape a document actually has.
		 *
		 * An edit of one class leaves the instances of its neighbour untouched —
		 * the same objects, with the same values — while the edited class picks
		 * the new code up. Instance identity is asserted and not merely the
		 * values, because a rebuild that restored the values would also lose
		 * the caret, the focus and the scroll of the real thing.
		 */
		async 'an edit of one class leaves the instances of its neighbour alone'( $ ) {

			const made = scene( $ )
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

			// the untouched neighbour keeps what was written into it
			$mol_assert_equal( kid.note(), 'typed by hand' )

			// and the edited class serves the new code, on the same object
			$mol_assert_equal( tail.tag(), 'two' )

		},

		/**
		 * An heir written ABOVE its base, which is the order that breaks silently.
		 *
		 * A class computes its base at definition time, and the generator emits
		 * declarations in the order it got them. Unsorted, the second compile finds
		 * the previous version of the base already in the sandbox and inherits THAT:
		 * no error, no failure on the bridge, the edit simply does not arrive.
		 * Measured before this test was written, on this very source.
		 */
		async 'an heir declared above its base follows an edit of that base'( $ ) {

			const made = scene( $ )
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

		/**
		 * One sandbox per document, and a live instance still reaches through it.
		 *
		 * A fresh `Object.create` on every compile would be invisible from the
		 * outside: the context of an instance is cached at its first read and never
		 * looked up again, so an old child would keep resolving names in the sandbox
		 * of the previous round while the new classes went into another one.
		 */
		async 'the sandbox is one per document and holds the fresh classes'( $ ) {

			const made = scene( $ )
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

			// the class in the sandbox is the one the live child now answers by
			$mol_assert_equal( Reflect.get( box, `${d}hot_box_kid` ), kid.constructor )

		},

		/**
		 * What has to survive an edit, in the three forms a cell takes.
		 *
		 * A written solo value, a written keyed value and the text of a field are
		 * one mechanism — an own field of the instance holding an atom — so all
		 * three are asserted together. The caret, the focus and the scroll position
		 * are NOT here: they live in the DOM alone and a node run has no layout to
		 * put them in. They were measured on the S2 bench in a browser.
		 */
		async 'written values survive a recompile'( $ ) {

			const made = scene( $ )
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

		/**
		 * A changed base is the case the swap must refuse.
		 *
		 * State would survive it, and that is exactly the trap: the DOM node was
		 * built by the old base and carries ITS `attr_static()`, which nothing
		 * recomputes. The component would read as the new base and behave as the
		 * old one. Checked on a NESTED class, because a base changes far more often
		 * away from the root than at it.
		 */
		async 'a changed base rebuilds instead of swapping'( $ ) {

			const made = scene( $ )
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

		/**
		 * A changed pack is the other case it must refuse.
		 *
		 * The context of a live instance is cached under a symbol private to a
		 * bundle, and the getter falls back to the global one the moment another
		 * bundle defines its own. Measured on S4: the same instance, the same living
		 * DOM, nothing on the error channel, and the sandbox simply gone.
		 */
		async 'a changed pack rebuilds instead of swapping'( $ ) {

			const made = scene( $ )
			const root = `${d}hot_pack_page`
			const src = `${root} ${d}mol_view\n\ttag \\one\n`

			const first = await grown( made, root, src )

			made.pack_uri( 'https://other.test/web.js' )

			const second = await settled( ()=> made.instance() ) as any

			$mol_assert_equal( second === first, false )

		},

		/**
		 * A property that changes between solo and keyed cannot keep its value,
		 * and must not leave the atom of the other shape behind either.
		 *
		 * A keyed read looks for a dictionary in the field a solo atom is sitting
		 * in, so the stale one is not merely useless, it throws `dict.get is not a
		 * function`.
		 *
		 * The `emit()` the atom gets before it is dropped is NOT isolated here, and
		 * cannot be by a test of this shape: waking dependants matters because
		 * unsubscribing marks nobody stale, but every dependant of a property that
		 * changes shape has its own code changed by the same edit, so it would
		 * recompute either way. It is asserted where it can be — the property is
		 * gone in its old shape and answers in the new one, on the same instance.
		 */
		async 'a property that turns keyed leaves no atom of the old shape'( $ ) {

			const made = scene( $ )
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

			// the solo atom is gone rather than left for a keyed read to trip over
			$mol_assert_equal( Reflect.get( second, 'note()' ), undefined )

			// and the keyed property answers, on the same instance
			$mol_assert_equal( second.note( 'a' ), '' )
			$mol_assert_equal( second.note( 'a', 'again' ), 'again' )
			$mol_assert_ok( Reflect.get( second, 'note()' ) instanceof Map )

		},

		/**
		 * The sort is the language's, not the scene's.
		 *
		 * Two copies of it would be one divergence away from an heir inheriting the
		 * previous version of its base, and the divergence would show as nothing at
		 * all. So the scene is asked to order declarations while the canonical sort
		 * is replaced: an answer that follows the replacement is proof there is no
		 * second copy.
		 */
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

		/**
		 * A broken source must cost nothing but a message.
		 *
		 * The failure is reported, the living component keeps its state and its
		 * node, and a fixed source lands back on the very same instance rather than
		 * on a replacement of it.
		 */
		async 'a compile failure leaves the living instance whole'( $ ) {

			const made = scene( $ )
			const root = `${d}hot_fail_page`

			const src = ( tag: string )=> `${root} ${d}mol_view\n\ttag \\${ tag }\n\tnote? \\\n`

			const first = await grown( made, root, src( 'one' ) )
			first.note( 'typed by hand' )

			// an heir of a class nobody declared: the generated code throws
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

		/**
		 * A failure of a nested node arrives named by that node.
		 *
		 * The name is the path `sizes` is keyed with, and it has to be, or the host
		 * looks the label up in a dictionary that does not have it. The element that
		 * failed does carry an attribute of its own, but that one is lowercased and
		 * joined by underscores — a different vocabulary, and a silently wrong one.
		 */
		async 'a runtime failure names the node it belongs to'( $ ) {

			const made = scene( $ )
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

			// the attribution itself: the free part the failure is inside, which is
			// the only name the host can find a box by
			$mol_assert_equal( made.render_error( first ).node, 'Tail' )
			$mol_assert_ok( made.render_error( first ).message )

			// and the same thing as the host sees it
			made.report_send()

			const failed = failure( sent, 'runtime' )

			$mol_assert_equal( failed?.node, 'Tail' )
			$mol_assert_ok( failed?.message )

		},

		/**
		 * A failure nobody can be blamed for still travels, with an empty node.
		 *
		 * Empty and not absent: the host must not have to tell «this scene found no
		 * node» from «this scene is older than the field».
		 */
		async 'a failure with no node to blame reports an empty one'( $ ) {

			const made = scene( $ )
			const sent = wired( made )
			const root = `${d}hot_blank_page`

			await grown( made, root, `${root} ${d}mol_view\n\ttag \\one\n` )

			made.error_post( 'runtime', 'something nobody owns', '' )

			const failed = failure( sent, 'runtime' )

			$mol_assert_equal( failed?.message, 'something nobody owns' )
			$mol_assert_equal( failed?.node, '' )

		},

		/**
		 * A COMPILE failure names a class, and a class is not a node. The tree still
		 * on the screen was built from the previous text, so the live instance of
		 * the class just broken is the node the user is looking at.
		 */
		async 'a compile failure names the node of the class that broke'( $ ) {

			const made = scene( $ )
			const sent = wired( made )
			const root = `${d}hot_guilt_page`

			const src = ( kid: string )=>
				`${root} ${d}mol_view\n\tsub /\n\t\t<= Kid ${d}hot_guilt_kid\n`
				+ `${d}hot_guilt_kid ${kid}\n\ttag \\one\n`

			const first = await grown( made, root, src( `${d}mol_view` ) )
			$mol_assert_ok( first.Kid() )

			// the child now inherits a class nobody declared: the generated code throws
			await grown( made, root, src( `${d}hot_guilt_ghost` ) )

			$mol_assert_ok( made.compile_error() )
			$mol_assert_equal( made.compile_class(), `${d}hot_guilt_kid` )

			made.report_send()

			$mol_assert_equal( failure( sent, 'compile' )?.node, 'Kid' )

		},

		/**
		 * The error state lives in the graph, not in a field beside it.
		 *
		 * It used to be a plain field written from inside the cell that builds the
		 * instance, and a reader of a field is woken by nothing: the label on the
		 * node would light up a round late, or not until something else moved. So
		 * what is asserted is not the value but the waking — a subscriber that has
		 * read the failure answers with the new one without the scene being asked
		 * again — a cached atom nobody invalidated answers with what it remembers,
		 * which is precisely what a field beside the graph produces.
		 */
		async 'a reader of the compile failure is woken when it changes'( $ ) {

			const made = scene( $ )
			const root = `${d}hot_wake_page`
			const src = ( tag: string )=> `${root} ${d}mol_view\n\ttag \\${ tag }\n`

			await grown( made, root, src( 'one' ) )

			const seen = {} as object
			const atom = $mol_wire_atom.solo( seen, function watcher() { return made.compile_error() } )

			$mol_assert_equal( atom.sync(), '' )

			// an heir of a class nobody declared: the generated code throws
			await grown( made, root, src( 'one' ) + `${d}hot_wake_kid ${d}hot_wake_ghost\n` )

			// The subscriber is asked, not the scene. A cached atom nobody
			// invalidated answers with what it remembers, and that is exactly the
			// symptom of a failure kept in a field beside the graph.
			$mol_assert_ok( atom.sync() )
			$mol_assert_equal( atom.sync(), made.compile_error() )

		},

		/**
		 * The FORM of the name, which is what the two halves stick together by.
		 *
		 * The host finds the box of a node by a name out of `sizes`, and there only
		 * the direct children of the root are kept. A path, a class name or anything
		 * with a slash in it finds no box, so no mark appears — with no error, no log
		 * and nothing to notice. Hence a test on the shape of the string and not only
		 * on which node it points at.
		 */
		async 'the reported node is a part name, not a path and not a class'( $ ) {

			const made = scene( $ )
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

			// and it is one of the names the host is given for a box, not merely a
			// string without a slash. Taken off the walk and not off `sizes`: a node
			// run has no layout, so nothing is connected and nothing is measured.
			const walk = made.walk_of( first )
			const parts = walk.kids_of( first )
				.map( kid => walk.view_of( kid ) )
				.filter( Boolean )
				.map( view => walk.prop_of( view! ) )

			$mol_assert_equal( parts.includes( node ), true )

		},

		/**
		 * A failure of the document itself belongs to no node of the canvas.
		 *
		 * Naming the root class here would hand the host a class name where it
		 * expects a part name — a mark that silently never appears. An empty node
		 * says the same thing honestly, and the text still reaches the status line.
		 */
		async 'a failure of the root itself is reported with no node'( $ ) {

			const made = scene( $ )
			const root = `${d}hot_top_page`

			const first = await grown( made, root, `${root} ${d}mol_view\n\tsub /\n\t\t<= boom \\\n` )

			made.doc_js({ [ root ]: 'boom() { throw new Error( "bang" ) }' })

			await settled( ()=> made.instance() )
			try { first.dom_tree() } catch {}

			const failed = made.render_error( first )

			$mol_assert_ok( failed.message )
			$mol_assert_equal( failed.node, '' )

		},

		/**
		 * A property declared AND written by hand keeps its state too, and its atom
		 * does not sit in the field its name suggests.
		 *
		 * The decorator copies the name off the base wrapper when the base was
		 * decorated already, and the copy carries a trailing space, so a property
		 * memoized both by the generator and by the body lives in `note ()` rather
		 * than in `note()`. That is exactly the shape the code editor produces, and
		 * a swap that built the field name by gluing `name + '()'` would find
		 * nothing, retarget nothing and lose what the user typed — silently, on
		 * every edit.
		 */
		async 'a property memoized twice keeps its state across an edit'( $ ) {

			const made = scene( $ )
			const root = `${d}hot_twice_page`
			const src = ( tag: string )=> `${root} ${d}mol_view\n\ttag \\${ tag }\n\tnote? \\\n`

			made.doc_root( root )
			made.doc_src( src( 'one' ) )
			made.doc_js({ [ root ]: 'note( next ) { return next ?? "from body" }' })

			const first = await settled( ()=> made.instance() ) as any

			$mol_assert_equal( first.note(), 'from body' )

			// the atom is where the double decoration put it, not where the name says
			$mol_assert_like( Object.getOwnPropertyNames( first ).filter( key => key.endsWith( '()' ) ), [ 'note ()' ] )

			first.note( 'typed by hand' )

			const second = await grown( made, root, src( 'two' ) )

			$mol_assert_equal( second, first )
			$mol_assert_equal( second.tag(), 'two' )
			$mol_assert_equal( second.note(), 'typed by hand' )
			$mol_assert_equal( made.compile_error(), '' )

		},

	})

}
