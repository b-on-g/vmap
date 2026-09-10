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

		/**
		 * The throttle keeps its stamp in the graph, and the read of it is a probe.
		 *
		 * Two things at once, because they hold each other up. Nobody subscribes to the
		 * stamp, so it has to survive a tick on which nobody looked at it — a swept
		 * stamp reads as zero, the wait comes out as nothing, and the throttle silently
		 * turns off while every other test stays green. And the write must NOT wake the
		 * task: a subscribing read would recompute the wait to a full period and send
		 * again what has just gone out, once per period for ever.
		 */
		async 'the stamp of the last send lives in the graph and wakes nobody'( $ ) {

			const made = [] as $mol_after_timeout[]
			$.$mol_after_timeout = class extends $mol_after_timeout {
				constructor( delay: number, task: ()=> void ) {
					super( delay, task )
					clearTimeout( this.id )
					made.push( this )
				}
			}

			const posted = [] as { kind: string }[]
			const clock = { now: 1000 }
			const root = { calc_result() { return 7 } }

			const scene = $$.$bog_vmap_scene.make({
				$,
				instance: ()=> root as unknown as $mol_view,
				peer: ()=> ({ postMessage( data: unknown ) { posted.push( data as typeof posted[ number ] ) } }) as unknown as Window,
				now: ()=> clock.now,
			})

			scene.values_wanted([ 'calc_result' ])
			scene.values_task()!.task()

			const sent = posted.filter( m => m.kind === 'values' ).length
			$mol_assert_equal( sent, 1 )

			// the stamp is a cell, and it is the clock reading, not a counter
			$mol_assert_equal( scene.values_at(), 1000 )

			// the write woke nothing: no new timer was built for a message already gone
			const built = made.length
			await new Promise( next => setTimeout( next, 10 ) )
			$mol_assert_equal( made.length, built )
			$mol_assert_equal( posted.filter( m => m.kind === 'values' ).length, 1 )

			// and after a tick nobody watched it, the stamp is still there, so the
			// throttle still knows a message went out 100 ms ago
			clock.now += 100
			scene.values_wanted([ 'calc_result', 'nope' ])
			$mol_assert_equal( scene.values_task()!.delay, 150 )

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
