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
