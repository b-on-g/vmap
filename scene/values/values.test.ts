namespace $ {

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

			$mol_assert_equal( scene.values_at(), 1000 )

			const built = made.length
			await new Promise( next => setTimeout( next, 10 ) )
			$mol_assert_equal( made.length, built )
			$mol_assert_equal( posted.filter( m => m.kind === 'values' ).length, 1 )

			clock.now += 100
			scene.values_wanted([ 'calc_result', 'nope' ])
			$mol_assert_equal( scene.values_task()!.delay, 150 )

		},

		'a dotted name walks from the root through the part to its port'( $ ) {

			const part = {
				result() { return 42 },
				title() { return 'сумма' },
			}

			const root = {
				Calc() { return part },
				calc_result() { return 1 },
			}

			$mol_assert_like(
				$.$bog_vmap_scene_values( root, [ 'Calc.result', 'Calc.title', 'calc_result' ] ),
				{ 'Calc.result': '42', 'Calc.title': 'сумма', calc_result: '1' },
			)

		},

		'a dotted name that leads nowhere names itself in the error'( $ ) {

			const root = {
				Calc() { return { result() { return 1 } } },
				flat() { return 5 },
			}

			const values = $.$bog_vmap_scene_values( root, [ 'Calc.absent', 'Nope.result', 'flat.result' ] )

			$mol_assert_equal( values[ 'Calc.absent' ], '⚠ нет свойства Calc.absent' )
			$mol_assert_equal( values[ 'Nope.result' ], '⚠ нет свойства Nope.result' )
			$mol_assert_equal( values[ 'flat.result' ], '⚠ нет свойства flat.result' )

		},

		'a list of records becomes a table of columns and the first rows'( $ ) {

			const root = {
				rows() {
					return [
						{ city: 'Москва', sum: 7 },
						{ city: 'Питер', sum: 9 },
						{ city: 'Казань', sum: 3 },
						{ city: 'Пермь', sum: 1 },
					]
				},
			}

			const values = $.$bog_vmap_scene_values( root, [ 'rows' ] )

			$mol_assert_like( values.rows.split( '\n' ).map( line => line.split( '\t' ) ), [
				[ 'city', 'sum' ],
				[ 'Москва', '7' ],
				[ 'Питер', '9' ],
				[ 'Казань', '3' ],
				[ '… ещё 1' ],
			] )

		},

		'a wider record widens the table, and a long cell is cut'( $ ) {

			const root = {
				rows() {
					return [
						{ name: 'x'.repeat( 20 ) },
						{ name: 'y', note: 'z' },
					]
				},
			}

			const values = $.$bog_vmap_scene_values( root, [ 'rows' ], 10 )

			$mol_assert_like( values.rows.split( '\n' ).map( line => line.split( '\t' ) ), [
				[ 'name', 'note' ],
				[ 'xxxxxxxxx…', '' ],
				[ 'y', 'z' ],
			] )

		},

		'a plain value stays on one line, so a newline can only mean a table'( $ ) {

			const root = {
				text() { return 'два\nслова' },
				list() { return [ 1, 2 ] },
				empty() { return [] },
				mixed() { return [ { a: 1 }, 2 ] },
				deep() { return { a: { b: 'раз\nдва' } } },
				bad(): string { throw new Error( 'сломалось\nи вот почему' ) },
				absent: 1,
			}

			const names = [ 'text', 'list', 'empty', 'mixed', 'deep', 'bad', 'absent', 'nope' ]
			const values = $.$bog_vmap_scene_values( root, names )

			$mol_assert_equal( values.text, 'два слова' )
			$mol_assert_equal( values.list, '[1,2]' )
			$mol_assert_equal( values.empty, '[]' )
			$mol_assert_equal( values.mixed, '[{"a":1},2]' )
			$mol_assert_equal( values.bad, '⚠ сломалось и вот почему' )

			for( const name of names ) {
				$mol_assert_equal( values[ name ].includes( '\n' ), false )
				$mol_assert_equal( values[ name ].includes( '\t' ), false )
			}

		},

		'a function value is the name of its type, not its source'( $ ) {

			const root = { hook() { return ( a: number )=> a + 1 } }

			$mol_assert_equal( $.$bog_vmap_scene_values( root, [ 'hook' ] ).hook, 'function' )

		},

		'a view or a list with a view in it is not a value and is not sent'( $ ) {

			const view = $mol_view.make({ $ })

			const board = {
				sub() { return [ 'заголовок', view ] },
				Head() { return view },
				rows() { return [ [ view ] ] },
				title() { return 'Ипотека' },
				result() { return 42 },
				list() { return [ 1, 2 ] },
			}

			const root = { Board() { return board } }

			const names = [ 'Board.sub', 'Board.Head', 'Board.rows', 'Board.title', 'Board.result', 'Board.list' ]

			$mol_assert_like( $.$bog_vmap_scene_values( root, names ), {
				'Board.title': 'Ипотека',
				'Board.result': '42',
				'Board.list': '[1,2]',
			} )

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

		'a number that is not a number is a dash, and an empty field stays empty'( $ ) {

			const root = {
				count() { return NaN },
				sum() { return 0 },
				note() { return '' },
				rows() { return [ { sum: NaN }, { sum: 3 } ] },
			}

			const values = $.$bog_vmap_scene_values( root, [ 'count', 'sum', 'note', 'rows' ] )

			$mol_assert_equal( values.count, '—' )
			$mol_assert_equal( values.sum, '0' )
			$mol_assert_equal( values.note, '' )
			$mol_assert_like( values.rows.split( '\n' ), [ 'sum', '—', '3' ] )

		},

	})

}
