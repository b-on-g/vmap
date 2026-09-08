namespace $ {

	/**
	 * Tests of a failure of the scene finding its way onto the node.
	 *
	 * The strip says something is wrong somewhere; the mark says which node. Stage
	 * 4.4 is the second sentence, and this file is about the host half of it: what
	 * the bridge carries in `node` has to come out on that node and nowhere else.
	 *
	 * `d` keeps `$` out of the string literals — mam reads them for dependencies.
	 */
	const d = '$'

	const root = `${d}bog_vmap_app_page`

	/** A pane with a peer that answers, and a way to speak to it as the scene. */
	const pane_make = ( $: $mol_ambient_context )=> {

		const peer = { origin: 'null', postMessage() {} }

		const pane = $$.$bog_vmap_app_pane.make({
			$,
			doc_root: ()=> root,
			pane_rect: ()=> ({ left: 0, top: 0, width: 1000, height: 800 }),
			scene_peer: ()=> peer,
		})

		pane.handshake( pane.scene_key(), 1 )

		const answer = ( data: object )=> pane.message_receive(
			{ data: { ns: $bog_vmap_bridge_ns, ... data }, source: peer } as unknown as MessageEvent
		)

		return { pane, answer }
	}

	$mol_test({

		'a failure the scene attributes lands on that node'( $ ) {

			const { pane, answer } = pane_make( $ )

			answer({ kind: 'error', at: 'runtime', message: 'boom', node: 'Calc' })

			$mol_assert_equal( pane.node_error( 'Calc' ), 'исполнение — Calc: boom' )
			$mol_assert_equal( pane.node_error( 'Hero' ), '' )

		},

		/** A guess would be worse than nothing: an unattributed failure stays on the strip. */
		'a failure with no node stays off every node'( $ ) {

			const { pane, answer } = pane_make( $ )

			answer({ kind: 'error', at: 'compile', message: 'boom' })

			$mol_assert_equal( Object.keys( pane.errors() ).length, 0 )
			$mol_assert_equal( pane.error().includes( 'boom' ), true )

		},

		'the two channels of one node are both shown on it'( $ ) {

			const { pane, answer } = pane_make( $ )

			answer({ kind: 'error', at: 'compile', message: 'first', node: 'Calc' })
			answer({ kind: 'error', at: 'runtime', message: 'second', node: 'Calc' })

			$mol_assert_equal(
				pane.node_error( 'Calc' ),
				'компиляция — Calc: first\nисполнение — Calc: second',
			)

		},

		/** The channel clears with `null`, and the node has to clear with it. */
		'a cleared channel takes the mark off the node'( $ ) {

			const { pane, answer } = pane_make( $ )

			answer({ kind: 'error', at: 'runtime', message: 'boom', node: 'Calc' })
			answer({ kind: 'error', at: 'runtime', message: null, node: 'Calc' })

			$mol_assert_equal( pane.node_error( 'Calc' ), '' )

		},

		'a fresh scene starts with no failure on any node'( $ ) {

			const { pane, answer } = pane_make( $ )

			answer({ kind: 'error', at: 'compile', message: 'boom', node: 'Calc' })
			answer({ kind: 'ready' })

			$mol_assert_equal( pane.node_error( 'Calc' ), '' )

		},

		/** A node nobody has measured has no corner to put a mark at. */
		'a mark is drawn only where the node has been measured'( $ ) {

			const { pane, answer } = pane_make( $ )

			answer({ kind: 'error', at: 'runtime', message: 'boom', node: 'Calc' })

			$mol_assert_equal( pane.error_marks().length, 0 )

			answer({
				kind: 'sizes',
				sizes: { [ `${ root }/Calc` ]: { x: 10, y: 20, width: 100, height: 50 } },
			})

			$mol_assert_equal( pane.error_marks().length, 1 )
			$mol_assert_equal( pane.mark_hint( 'Calc' ), 'исполнение — Calc: boom' )

		},

		/** What the panel of the picked node shows is what the pane knows about it. */
		'the code panel shows the failure of the node it is editing'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )

			const name = app.selected()!
			const pane = app.pane()

			pane.error_at( 'runtime', 'исполнение: boom' )
			pane.error_node( 'runtime', name )

			$mol_assert_equal( app.code_error(), 'исполнение: boom' )

			app.selected( null )
			$mol_assert_equal( app.code_error(), '' )

		},

	})

}
