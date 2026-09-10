namespace $ {

	const d = '$'

	$mol_test_mocks.push( $=> {
		class $mol_state_arg_mock extends $.$mol_state_arg {}
		$.$mol_state_arg = $mol_state_arg_mock
	} )

	const src_page = `${d}bog_vmap_app_store_test_page ${d}mol_view\n\tCalc ${d}bog_vmap_app_store_test_calc\n\tcalc_result = Calc result\n\tsub / <= Calc\n`
	const src_calc = `${d}bog_vmap_app_store_test_calc ${d}mol_view\n\tresult 42\n\tstep 1\n`
	const src_hero = `${d}bog_vmap_app_store_test_hero ${d}mol_view\n\ttitle \\Hi\n\tsub / <= title\n`

	function store( $: $ ) {
		return $bog_vmap_app_store.make({
			$,
			doc_land_config: ()=> null,
		})
	}

	type $bog_vmap_app_store_test_kept = {
		readonly bin: ArrayBuffer
		readonly ball: Uint8Array< ArrayBuffer > | null
	}

	type $bog_vmap_app_store_test_disk = Map< string, Map< string, $bog_vmap_app_store_test_kept > >

	function $bog_vmap_app_store_test_mine( disk: $bog_vmap_app_store_test_disk ) {

		return class extends $giper_baza_mine_temp {

			override units_save( diff: $giper_baza_mine_diff ) {

				const key = this.land().str
				let kept = disk.get( key )
				if( !kept ) disk.set( key, kept = new Map )

				for( const unit of diff.del ) kept.delete( unit.path() )

				for( const unit of diff.ins ) {

					const ball = unit instanceof $giper_baza_unit_sand && unit.big()
						? unit.ball()
						: null

					kept.set( unit.path(), {
						bin: unit.buffer.slice( unit.byteOffset, unit.byteOffset + unit.byteLength ),
						ball: ball && new Uint8Array( ball.buffer.slice(
							ball.byteOffset, ball.byteOffset + ball.byteLength,
						) ),
					} )

					this.units_persisted.add( unit )

				}

			}

			override units_load() {

				const kept = disk.get( this.land().str )
				if( !kept ) return []

				const units = [ ... kept.values() ].map( one => $giper_baza_unit_base.narrow( one.bin ) )
				for( const unit of units ) this.units_persisted.add( unit )

				return units as readonly $giper_baza_unit[]
			}

			override ball_load( sand: $giper_baza_unit_sand ) {
				return disk.get( this.land().str )?.get( sand.path() )?.ball
					?? new Uint8Array()
			}

		}
	}

	$mol_test({

		'no documents, no address: nothing is current and the text is empty'( $ ) {

			const s = store( $ )

			$mol_assert_equal( s.doc_current(), null )
			$mol_assert_equal( s.source(), '' )
			$mol_assert_like( s.spots(), {} )
			$mol_assert_equal( s.title(), '' )
			$mol_assert_like( s.doc_links(), [] )
			$mol_assert_equal( s.stage(), 'making' )

		},

		'one class survives the round trip'( $ ) {

			const s = store( $ )

			s.doc_add( 'Landing' )
			s.source( src_page )

			$mol_assert_equal( s.source(), src_page )
			$mol_assert_equal( s.nodes( s.doc_current()! ).length, 1 )
			$mol_assert_equal( s.stage(), 'ready' )

		},

		'a document of several classes survives the round trip, one node per class'( $ ) {

			const s = store( $ )
			const doc = s.doc_add( 'Landing' )

			s.source( src_page + src_calc )

			$mol_assert_equal( s.source(), src_page + src_calc )

			const nodes = s.nodes( doc )
			$mol_assert_equal( nodes.length, 2 )
			$mol_assert_equal( nodes[ 0 ].source(), src_page )
			$mol_assert_equal( nodes[ 1 ].source(), src_calc )

		},

		'editing one class leaves the other node alone'( $ ) {

			const s = store( $ )
			const doc = s.doc_add( 'Landing' )

			s.source( src_page + src_calc )
			const calc_before = s.nodes( doc )[ 1 ]

			const edited = src_page.replace( 'result', 'total' )
			s.source( edited + src_calc )

			const nodes = s.nodes( doc )
			$mol_assert_equal( nodes.length, 2 )
			$mol_assert_equal( nodes[ 0 ].source(), edited )
			$mol_assert_equal( nodes[ 1 ].link().str, calc_before.link().str )
			$mol_assert_equal( nodes[ 1 ].source(), src_calc )

		},

		'a class gone from the text leaves the document, a new one joins it in order'( $ ) {

			const s = store( $ )
			const doc = s.doc_add( 'Landing' )

			s.source( src_page + src_calc )

			s.source( src_hero + src_calc )

			$mol_assert_equal( s.source(), src_hero + src_calc )
			$mol_assert_equal( s.nodes( doc ).length, 2 )

			s.source( src_calc )

			$mol_assert_equal( s.source(), src_calc )
			$mol_assert_equal( s.nodes( doc ).length, 1 )

		},

		'the root is the class the document was made with'( $ ) {

			const s = store( $ )
			const doc = s.doc_add( 'Landing', src_page + src_calc )

			$mol_assert_equal( s.doc_root( doc ), `${d}bog_vmap_app_store_test_page` )
			$mol_assert_equal( s.source(), src_page + src_calc )

		},

		'a class renamed in the text arrives as an empty node and the old one leaves'( $ ) {

			const s = store( $ )
			const doc = s.doc_add( 'Landing', src_page + src_calc )

			s.node( doc, `${d}bog_vmap_app_store_test_calc` )!.js( 'result(){ return 42 }' )

			const renamed = src_calc.replace( '_calc ', '_total ' )
			s.source( src_page + renamed )

			$mol_assert_equal( s.nodes( doc ).length, 2 )
			$mol_assert_equal( s.node( doc, `${d}bog_vmap_app_store_test_calc` ), null )

			$mol_assert_equal( s.node_js( doc, `${d}bog_vmap_app_store_test_total` ), '' )

		},

		async 'a document written in one session comes back in the next'( $ ) {

			const disk: $bog_vmap_app_store_test_disk = new Map

			const mine = $bog_vmap_app_store_test_mine( disk )

			const session = ()=> {

				const ctx = Object.create( $ ) as typeof $

				ctx.$giper_baza_land = class extends $$.$giper_baza_land {} as any
				ctx.$giper_baza_mine = class extends mine {} as any

				const glob = class extends $.$giper_baza_glob {
					static override lands_touched = new $mol_wire_set< string >()
				}
				glob.$ = ctx
				ctx.$giper_baza_glob = glob as any

				ctx.$mol_state_arg = class extends $.$mol_state_arg {} as any

				ctx.$mol_storage = class extends $.$mol_storage {
					static override total() { return 1e9 }
					static override used() { return 0 }
				} as any

				const store = $bog_vmap_app_store.make({
					$: ctx,
					doc_land_config: ()=> [[ null, $giper_baza_rank_read ]] as $giper_baza_rank_preset,
				})

				const eye = new $mol_wire_atom( 'eye', ()=> {
					try {
						return store.doc_links().length + ':' + store.source().length
					} catch( error ) {
						if( $mol_promise_like( error ) ) return $mol_fail_hidden( error )
						return -1
					}
				} )

				const look = ()=> { try { eye.fresh() } catch( error ) {} }

				return { store, look }
			}

			const read = < Name extends keyof $bog_vmap_app_store >(
				store: $bog_vmap_app_store,
				name: Name,
				... args: any[]
			)=> ( $mol_wire_async( store )[ name ] as any )( ... args )

			const one = session()
			one.look()

			const made = await read( one.store, 'doc_add', 'Сцена 1', src_page ) as $bog_vmap_app_doc
			const link = made.link().str
			one.look()

			await $mol_wire_async( one.store.home().land() ).units_saving()
			await $mol_wire_async( made.land() ).units_saving()

			const two = session()
			two.look()

			$mol_assert_equal( ( await read( two.store, 'doc_links' ) ).length, 1 )
			$mol_assert_equal( await read( two.store, 'title' ), 'Сцена 1' )
			$mol_assert_equal( await read( two.store, 'source' ), src_page )

			const three = session()
			await read( three.store, 'doc_arg', link )
			three.look()

			const current = await read( three.store, 'doc_current' ) as $bog_vmap_app_doc
			$mol_assert_equal( current.link().str, link )
			$mol_assert_equal( await read( three.store, 'source' ), src_page )

		},

		async 'a document opened by a link survives a restart with the quota unknown'( $ ) {

			const disk: $bog_vmap_app_store_test_disk = new Map

			const mine = $bog_vmap_app_store_test_mine( disk )

			const owner = await $.$giper_baza_auth.grab()
			const theirs = $giper_baza_land.make({ $, auth: ()=> owner })
			const their_doc = theirs.Data( $bog_vmap_app_doc )

			their_doc.title( 'Theirs' )
			store( $ ).doc_source( their_doc, src_hero )

			const link = their_doc.link()

			const session = ()=> {

				const ctx = Object.create( $ ) as typeof $

				ctx.$giper_baza_land = class extends $$.$giper_baza_land {} as any
				ctx.$giper_baza_mine = class extends mine {} as any

				const glob = class extends $.$giper_baza_glob {
					static override lands_touched = new $mol_wire_set< string >()
				}
				glob.$ = ctx
				ctx.$giper_baza_glob = glob as any

				ctx.$mol_state_arg = class extends $.$mol_state_arg {} as any

				ctx.$mol_storage = class extends $.$mol_storage {
					static override total() { return 0 }
					static override used() { return 0 }
					static override portion() { return 1 }
				} as any

				const store = $bog_vmap_app_store.make({
					$: ctx,
					doc_land_config: ()=> null,
				})

				const eye = new $mol_wire_atom( 'eye', ()=> {
					try {
						return store.source().length
					} catch( error ) {
						if( $mol_promise_like( error ) ) return $mol_fail_hidden( error )
						return -1
					}
				} )

				return { store, look: ()=> { try { eye.fresh() } catch( error ) {} } }
			}

			const read = < Name extends keyof $bog_vmap_app_store >(
				store: $bog_vmap_app_store,
				name: Name,
				... args: any[]
			)=> ( $mol_wire_async( store )[ name ] as any )( ... args )

			const one = session()

			one.store.doc_pick( link )

			one.look()

			$mol_assert_equal( one.store.boot(), 'ready' )

			await $mol_wire_async( one.store.doc( link ).land() ).units_steal( theirs )
			one.look()

			$mol_assert_equal( await read( one.store, 'source' ), src_hero )

			await $mol_wire_async( one.store.doc( link ).land() ).units_saving()

			$mol_assert_equal( ( disk.get( link.land().str )?.size ?? 0 ) > 0, true )

			const two = session()
			two.store.doc_pick( link )
			two.look()

			$mol_assert_equal( await read( two.store, 'source' ), src_hero )
			$mol_assert_equal( await read( two.store, 'title' ), 'Theirs' )

		},

		'the root can be pointed at another class of the document'( $ ) {

			const s = store( $ )
			const doc = s.doc_add( 'Landing', src_page + src_calc )

			s.doc_root( doc, `${d}bog_vmap_app_store_test_calc` )

			$mol_assert_equal( s.doc_root( doc ), `${d}bog_vmap_app_store_test_calc` )

			s.doc_root( doc, `${d}bog_vmap_app_store_test_absent` )

			$mol_assert_equal( s.doc_root( doc ), `${d}bog_vmap_app_store_test_calc` )

		},

		'two documents are independent'( $ ) {

			const s = store( $ )

			const first = s.doc_add( 'First', src_page )
			const second = s.doc_add( 'Second', src_hero )

			$mol_assert_equal( s.source(), src_hero )

			s.source( src_hero + src_calc )

			$mol_assert_equal( s.doc_source( first ), src_page )
			$mol_assert_equal( s.doc_source( second ), src_hero + src_calc )

		},

		'picking a document changes the text'( $ ) {

			const s = store( $ )

			const first = s.doc_add( 'First', src_page )
			const second = s.doc_add( 'Second', src_hero )

			$mol_assert_equal( s.source(), src_hero )

			s.doc_pick( first.link() )
			$mol_assert_equal( s.doc_current()!.link().str, first.link().str )
			$mol_assert_equal( s.source(), src_page )
			$mol_assert_equal( s.title(), 'First' )

			s.doc_pick( second.link() )
			$mol_assert_equal( s.source(), src_hero )
			$mol_assert_equal( s.title(), 'Second' )

			s.doc_pick( null )
			$mol_assert_equal( s.doc_arg(), null )
			$mol_assert_equal( s.source(), src_hero )

		},

		'a malformed address counts as none'( $ ) {

			const s = store( $ )
			s.doc_add( 'First', src_page )

			s.doc_arg( 'not a link at all' )

			$mol_assert_equal( s.source(), src_page )

		},

		'title, pack and places survive a write and a read'( $ ) {

			const s = store( $ )
			s.doc_add( 'Landing' )

			s.title( 'Renamed' )
			$mol_assert_equal( s.title(), 'Renamed' )

			s.pack( 'https://mol.hyoo.ru, aaaaaaaa_bbbbbbbb' )
			$mol_assert_equal( s.pack(), 'https://mol.hyoo.ru, aaaaaaaa_bbbbbbbb' )

			s.spots({ Hero: { x: 0, y: 0 }, Calc: { x: 100, y: -20.5 } })
			$mol_assert_like( s.spots(), { Calc: { x: 100, y: -20.5 }, Hero: { x: 0, y: 0 } } )

			s.spots({ Calc: { x: 110, y: -20.5 } })
			$mol_assert_like( s.spots(), { Calc: { x: 110, y: -20.5 } } )

		},

		'class body and styles are kept per node'( $ ) {

			const s = store( $ )
			const doc = s.doc_add( 'Landing', src_page + src_calc )

			s.node_js( doc, `${d}bog_vmap_app_store_test_calc`, 'result(){ return 42 }' )
			s.node_css( doc, `${d}bog_vmap_app_store_test_calc`, '[calc]{ color: red }' )

			$mol_assert_equal( s.node_js( doc, `${d}bog_vmap_app_store_test_calc` ), 'result(){ return 42 }' )
			$mol_assert_equal( s.node_css( doc, `${d}bog_vmap_app_store_test_calc` ), '[calc]{ color: red }' )
			$mol_assert_equal( s.node_js( doc, `${d}bog_vmap_app_store_test_page` ), '' )
			$mol_assert_equal( s.node_js( doc, `${d}bog_vmap_app_store_test_none` ), '' )

			$mol_assert_equal( s.source(), src_page + src_calc )

		},

		'the list in the home land grows with every document'( $ ) {

			const s = store( $ )

			$mol_assert_equal( s.doc_links().length, 0 )
			$mol_assert_equal( s.title_next(), 'Сцена 1' )

			const first = s.doc_add( 'First' )
			$mol_assert_equal( s.doc_links().length, 1 )

			const second = s.doc_add( 'Second' )
			$mol_assert_equal( s.doc_links().length, 2 )
			$mol_assert_equal( s.title_next(), 'Сцена 3' )

			$mol_assert_like(
				s.doc_links().map( link => link.str ),
				[ first.link().str, second.link().str ],
			)

			$mol_assert_like(
				s.doc_links().map( link => s.doc( link ).title() ),
				[ 'First', 'Second' ],
			)

		},

		'the draft becomes the first document whole'( $ ) {

			const s = store( $ )

			s.source( src_page )
			s.spots({ Calc: { x: 10, y: 20 } })
			s.pack( 'https://mol.hyoo.ru' )

			$mol_assert_equal( s.doc_links().length, 0 )
			$mol_assert_equal( s.source(), src_page )

			s.doc_first()

			$mol_assert_equal( s.doc_links().length, 1 )
			$mol_assert_equal( s.doc_arg(), s.doc_current()!.link().str )
			$mol_assert_equal( s.source(), src_page )
			$mol_assert_like( s.spots(), { Calc: { x: 10, y: 20 } } )
			$mol_assert_equal( s.pack(), 'https://mol.hyoo.ru' )
			$mol_assert_equal( s.title(), 'Сцена 1' )
			$mol_assert_equal( s.doc_root( s.doc_current()! ), `${d}bog_vmap_app_store_test_page` )

			s.doc_first()
			$mol_assert_equal( s.doc_links().length, 1 )

		},

		async 'boot makes the first document and then reports it'( $ ) {

			const s = store( $ )

			$mol_assert_equal( s.boot(), 'making' )

			const held = s.doc_first_task()
			$mol_assert_equal( s.doc_first_task().task === held.task, true )

			await held.task

			$mol_assert_equal( s.doc_links().length, 1 )
			$mol_assert_equal( s.boot(), 'ready' )
			$mol_assert_equal( s.stage(), 'ready' )

			$mol_assert_equal( s.doc_first_task().task === held.task, true )
			$mol_assert_equal( s.doc_links().length, 1 )

		},

		'boot reports the document it just made, in the same breath'( $ ) {

			const s = store( $ )

			$mol_assert_equal( s.boot(), 'making' )

			$mol_assert_equal( s.doc_links().length, 1 )
			$mol_assert_equal( s.boot(), 'ready' )
			$mol_assert_equal( s.stage(), 'ready' )

		},

		'boot leaves an existing document alone'( $ ) {

			const s = store( $ )
			s.doc_add( 'First', src_page )

			$mol_assert_equal( s.boot(), 'ready' )
			$mol_assert_equal( s.doc_links().length, 1 )

			$mol_assert_equal( $mol_wire_probe( ()=> s.doc_first_task() ), undefined )

		},

		async 'the draft goes whole into the document boot makes'( $ ) {

			const s = store( $ )

			s.source( src_page )
			s.spots({ Calc: { x: 10, y: 20 } })
			s.pack( 'https://mol.hyoo.ru' )

			$mol_assert_equal( s.boot(), 'making' )
			await s.doc_first_task().task

			$mol_assert_equal( s.doc_links().length, 1 )
			$mol_assert_equal( s.source(), src_page )
			$mol_assert_like( s.spots(), { Calc: { x: 10, y: 20 } } )
			$mol_assert_equal( s.pack(), 'https://mol.hyoo.ru' )
			$mol_assert_equal( s.title(), 'Сцена 1' )

		},

		async 'a suspended land does not leave the reader on making for ever'( $ ) {

			let open = ()=> {}
			const gate = new Promise< void >( done => { open = ()=> done() } )
			let held = true

			class store_slow extends $bog_vmap_app_store {
				override doc_first() {
					if( held ) return $mol_fail_hidden( gate )
					return super.doc_first()
				}
			}

			const s = store_slow.make({ $, doc_land_config: ()=> null })

			$mol_assert_equal( s.boot(), 'making' )
			$mol_assert_equal( s.doc_links().length, 0 )

			const task = s.doc_first_task()

			$mol_assert_equal( s.boot(), 'making' )
			$mol_assert_equal( s.doc_first_task().task === task.task, true )
			$mol_assert_equal( s.doc_links().length, 0 )

			held = false
			open()
			await task.task

			$mol_assert_equal( s.doc_links().length, 1 )
			$mol_assert_equal( s.boot(), 'ready' )
			$mol_assert_equal( s.stage(), 'ready' )

		},

		async 'the draft survives a suspension after the document is already listed'( $ ) {

			let open = ()=> {}
			const gate = new Promise< void >( done => { open = ()=> done() } )
			let held = true

			class store_late extends $bog_vmap_app_store {
				override doc_source( doc: $bog_vmap_app_doc, next?: string ): string {
					if( next !== undefined && held ) return $mol_fail_hidden( gate )
					return super.doc_source( doc, next )
				}
			}

			const s = store_late.make({ $, doc_land_config: ()=> null })
			s.source( src_page )

			$mol_assert_equal( s.boot(), 'making' )

			$mol_assert_equal( s.doc_links().length, 1 )
			$mol_assert_equal( s.doc_source( s.doc_current()! ), '' )

			$mol_assert_equal( s.boot(), 'ready' )

			held = false
			open()
			await s.doc_first_task().task

			$mol_assert_equal( s.doc_links().length, 1 )
			$mol_assert_equal( s.source(), src_page )

		},

		async 'a reader that looks away does not take the fiber with it'( $ ) {

			let open = ()=> {}
			const gate = new Promise< void >( done => { open = ()=> done() } )
			let held = true

			class store_late extends $bog_vmap_app_store {
				override doc_source( doc: $bog_vmap_app_doc, next?: string ): string {
					if( next !== undefined && held ) return $mol_fail_hidden( gate )
					return super.doc_source( doc, next )
				}
			}

			const s = store_late.make({ $, doc_land_config: ()=> null })
			s.source( src_page )

			const reader = $mol_wire_atom.solo( s, function boot_reader( this: typeof s ) {
				return this.boot()
			} )

			$mol_assert_equal( reader.sync(), 'making' )
			$mol_assert_equal( s.doc_links().length, 1 )

			reader.refresh()
			$mol_assert_equal( reader.sync(), 'ready' )

			await new Promise( done => new $mol_after_tick( ()=> done( null ) ) )

			held = false
			open()
			await new Promise( done => new $mol_after_tick( ()=> done( null ) ) )
			await new Promise( done => new $mol_after_tick( ()=> done( null ) ) )

			$mol_assert_equal( s.doc_links().length, 1 )
			$mol_assert_equal( s.source(), src_page )

		},

		async 'a document of somebody else reads, refuses writes and says why'( $ ) {

			const owner = await $.$giper_baza_auth.grab()
			const theirs = $giper_baza_land.make({ $, auth: ()=> owner })
			const helper = store( $ )

			const their_doc = theirs.Data( $bog_vmap_app_doc )
			their_doc.title( 'Theirs' )
			helper.doc_source( their_doc, src_hero )
			helper.doc_spots( their_doc, { Hero: { x: 5, y: 6 } } )

			const s = store( $ )
			const link = their_doc.link()

			await $mol_wire_async( s.doc( link ).land() ).units_steal( theirs )

			s.doc_pick( link )

			$mol_assert_equal( s.source(), src_hero )
			$mol_assert_equal( s.title(), 'Theirs' )
			$mol_assert_like( s.spots(), { Hero: { x: 5, y: 6 } } )
			$mol_assert_equal( s.doc_editable(), false )
			$mol_assert_equal( s.stage(), 'readonly' )

			s.source( src_page )
			s.title( 'Mine now' )
			s.spots({ Hero: { x: 0, y: 0 } })
			s.pack( 'https://example.org' )

			$mol_assert_equal( s.source(), src_hero )
			$mol_assert_equal( s.title(), 'Theirs' )
			$mol_assert_like( s.spots(), { Hero: { x: 5, y: 6 } } )
			$mol_assert_equal( s.pack(), '' )

			$mol_assert_equal( s.doc_links().length, 0 )

		},

		'a node edited through the store still sees a write past it'( $ ) {

			const s = store( $ )
			const doc = s.doc_add( 'Landing' )

			s.source( src_page )
			$mol_assert_equal( s.source(), src_page )

			s.nodes( doc )[ 0 ].Tree( null )!.val( src_hero )

			$mol_assert_equal( s.source(), src_hero )
			$mol_assert_equal( s.nodes( doc ).length, 1 )

		},

		async 'a node edited through the store still sees a merged remote edit'( $ ) {

			const s = store( $ )
			const doc = s.doc_add( 'Landing' )

			s.source( src_page )

			const head = s.nodes( doc )[ 0 ].head()
			const home = s.home().land()

			const peer = $giper_baza_land.make({ $ })
			const last = home.tick().time_tick
			while( peer.tick().time_tick <= last );
			peer.Pawn( $bog_vmap_app_doc_node ).Head( head ).Tree( null )!.val( src_hero )

			await $mol_wire_async( home ).units_steal( peer )

			$mol_assert_equal( s.nodes( doc )[ 0 ].Tree()!.val(), src_hero )
			$mol_assert_equal( s.source(), src_hero )

		},

	})

}
