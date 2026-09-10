namespace $ {

	/**
	 * Tests of the wire protocol: what goes in through `send` comes out of `read`,
	 * and what is not ours does not. A fake `postMessage` stands in for the window.
	 */
	$mol_test({

		'libs_set survives the wire'( $ ) {

			const parts = [
				{ tree: 'my_card mol_view\n\tprice 0\n', js: 'price(){ return 1 }', css: '' },
				{ tree: 'my_badge my_card\n', js: '', css: '[my_badge] { color: red }' },
			]

			const sent = [] as unknown[]
			$bog_vmap_bridge_send( { postMessage: ( data: unknown )=> { sent.push( data ) } }, { kind: 'libs_set', parts } )

			$mol_assert_equal( sent.length, 1 )

			const message = $bog_vmap_bridge_read< $bog_vmap_bridge_down >( { data: sent[ 0 ] } )

			$mol_assert_equal( message?.kind, 'libs_set' )
			if( message?.kind !== 'libs_set' ) return

			$mol_assert_like( message.parts, parts )

		},

		/** The question goes down as a list of names, the answer comes up keyed by them. */
		'values_want and values survive the wire'( $ ) {

			const sent = [] as unknown[]
			const target = { postMessage: ( data: unknown )=> { sent.push( data ) } }

			$bog_vmap_bridge_send( target, { kind: 'values_want', names: [ 'calc_result', 'calc_value' ] } )
			$bog_vmap_bridge_send( target, { kind: 'values', values: { calc_result: '42', calc_value: 'Error: boom' } } )

			const want = $bog_vmap_bridge_read< $bog_vmap_bridge_down >( { data: sent[ 0 ] } )
			$mol_assert_equal( want?.kind, 'values_want' )
			if( want?.kind !== 'values_want' ) return
			$mol_assert_like( want.names, [ 'calc_result', 'calc_value' ] )

			const got = $bog_vmap_bridge_read< $bog_vmap_bridge_up >( { data: sent[ 1 ] } )
			$mol_assert_equal( got?.kind, 'values' )
			if( got?.kind !== 'values' ) return
			$mol_assert_like( got.values, { calc_result: '42', calc_value: 'Error: boom' } )

		},

		'a message from another namespace is not ours'( $ ) {

			$mol_assert_equal(
				$bog_vmap_bridge_read( { data: { ns: 'somebody_else', kind: 'libs_set', parts: [] } } ),
				null,
			)

			$mol_assert_equal( $bog_vmap_bridge_read( { data: 'text' } ), null )
			$mol_assert_equal( $bog_vmap_bridge_read( { data: { ns: $bog_vmap_bridge_ns } } ), null )

		},

		/** Passing a peer at all turns the check on: an unknown source is refused. */
		'a message from a window other than the peer is dropped'( $ ) {

			const peer = {}
			const stranger = {}
			const data = { ns: $bog_vmap_bridge_ns, kind: 'ready' }

			$mol_assert_equal( $bog_vmap_bridge_read( { data, source: stranger }, peer ), null )
			$mol_assert_equal( $bog_vmap_bridge_read( { data, source: peer }, peer )?.kind, 'ready' )
			$mol_assert_equal( $bog_vmap_bridge_read( { data, source: stranger }, null ), null )

		},

	})

}

namespace $ {

	/**
	 * `click_at` on the wire: the relayed click keeps its point and its modifiers,
	 * and comes in only from the peer, like every other message.
	 */
	$mol_test({

		'click_at survives the wire with its point and modifiers'( $ ) {

			const posted = [] as unknown[]
			const target = { postMessage( data: unknown ) { posted.push( data ) } }

			const mods = { altKey: false, ctrlKey: true, metaKey: false, shiftKey: false }

			$bog_vmap_bridge_send( target, { kind: 'click_at', x: 12.5, y: -3, mods } )

			$mol_assert_equal( posted.length, 1 )

			const read = $bog_vmap_bridge_read< $bog_vmap_bridge_down >( { data: posted[0], source: target }, target )

			$mol_assert_equal( read?.kind, 'click_at' )
			if( read?.kind !== 'click_at' ) return

			$mol_assert_equal( read.x, 12.5 )
			$mol_assert_equal( read.y, -3 )
			$mol_assert_like( read.mods, mods )

		},

		'a click_at from a stranger is dropped'( $ ) {

			const peer = {}
			const stranger = {}

			const data = { ns: $bog_vmap_bridge_ns, kind: 'click_at', x: 1, y: 2, mods: {} }

			$mol_assert_equal( $bog_vmap_bridge_read( { data, source: stranger }, peer ), null )
			$mol_assert_equal( $bog_vmap_bridge_read( { data, source: peer }, peer )?.kind, 'click_at' )

		},

	})

}
