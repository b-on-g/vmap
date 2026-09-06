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
