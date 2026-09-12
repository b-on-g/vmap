namespace $ {

	$mol_test({

		'an heir from a neighbour module extends the class of the hand written body'( $ ) {

			$mol_assert_equal(
				Object.getPrototypeOf( $bog_vmap_spike_s5_apart ) === $bog_vmap_spike_s5_base,
				true,
			)

		},

		'an heir from the same tree file extends the generated base beside it'( $ ) {

			$mol_assert_equal(
				Object.getPrototypeOf( $bog_vmap_spike_s5_near ) === $bog_vmap_spike_s5_base,
				false,
			)

			$mol_assert_equal(
				Object.getPrototypeOf( $bog_vmap_spike_s5_near )
					=== Object.getPrototypeOf( $bog_vmap_spike_s5_base ),
				true,
			)

		},

		'only the heir from a neighbour module inherits the hand written body'( $ ) {

			const body = $bog_vmap_spike_s5_base.make({ $ }).greet()

			$mol_assert_equal( $bog_vmap_spike_s5_apart.make({ $ }).greet(), body )
			$mol_assert_unique( $bog_vmap_spike_s5_near.make({ $ }).greet(), body )

		},

	})

}
