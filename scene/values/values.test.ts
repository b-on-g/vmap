namespace $ {

	/**
	 * The wire labels, on a fake root instance: a plain object whose methods stand
	 * in for the compiled properties of the document class.
	 */
	$mol_test({

		'values are read by name and cut to a line'( $ ) {

			const root = {
				calc_result() { return 42 },
				calc_title() { return '  два\n слова  ' },
				calc_list() { return [ 1, 'a' ] },
				calc_long() { return 'x'.repeat( 100 ) },
			}

			const values = $.$bog_vmap_scene_values( root, [ 'calc_result', 'calc_title', 'calc_list', 'calc_long' ], 10 )

			$mol_assert_like( values, {
				calc_result: '42',
				calc_title: 'два слова',
				calc_list: '[1,"a"]',
				calc_long: 'xxxxxxxxx…',
			} )

		},

		/** One broken wire labels itself and leaves the neighbours alone. */
		'a read that throws becomes the text of the error'( $ ) {

			const root = {
				good() { return 'ok' },
				bad() { throw new Error( 'boom' ) },
			}

			const values = $.$bog_vmap_scene_values( root, [ 'good', 'bad', 'absent' ] )

			$mol_assert_equal( values.good, 'ok' )
			$mol_assert_equal( values.bad, '⚠ boom' )
			$mol_assert_equal( /absent/.test( values.absent ), true )

		},

		'a suspension is not an error and is rethrown'( $ ) {

			const wait = new Promise< void >( ()=> {} )
			const root = { slow() { throw wait } }

			let caught: unknown = null
			try { $.$bog_vmap_scene_values( root, [ 'slow' ] ) } catch( error ) { caught = error }

			$mol_assert_equal( caught, wait )

		},

		/**
		 * The throttle on the scene: the first answer goes at once, a change right
		 * after it waits for what is left of the period, and an empty request stops
		 * the flow.
		 */
		'values go out at once, then no more often than the period'( $ ) {

			const made = [] as $mol_after_timeout[]
			$.$mol_after_timeout = class extends $mol_after_timeout {
				constructor( delay: number, task: ()=> void ) {
					super( delay, task )
					clearTimeout( this.id )
					made.push( this )
				}
			}

			const posted = [] as { kind: string, values?: { [ name: string ]: string } }[]
			const clock = { now: 1000 }
			const root = { calc_result() { return 7 } }

			const scene = $$.$bog_vmap_scene.make({
				$,
				instance: ()=> root as unknown as $mol_view,
				peer: ()=> ({ postMessage( data: unknown ) { posted.push( data as typeof posted[ number ] ) } }) as unknown as Window,
				now: ()=> clock.now,
			})

			$mol_assert_equal( scene.values_task(), null )

			scene.values_wanted([ 'calc_result' ])

			const first = scene.values_task()!
			$mol_assert_equal( first.delay, 0 )
			first.task()

			$mol_assert_like( posted.filter( m => m.kind === 'values' ).map( m => m.values ), [ { calc_result: '7' } ] )

			clock.now += 100
			scene.values_wanted([ 'calc_result', 'nope' ])

			const second = scene.values_task()!
			$mol_assert_equal( second !== first, true )
			$mol_assert_equal( second.delay, 150 )

			scene.values_wanted([])
			$mol_assert_equal( scene.values_task(), null )

		},

		'a view like value is its own id, not a JSON walk'( $ ) {

			const root = {
				view() { return $mol_object.make({}) },
				nil() { return null },
			}

			const values = $.$bog_vmap_scene_values( root, [ 'view', 'nil' ] )

			$mol_assert_equal( typeof values.view, 'string' )
			$mol_assert_equal( values.view.length > 0, true )
			$mol_assert_equal( values.nil, 'null' )

		},

	})

}
