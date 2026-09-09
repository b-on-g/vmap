namespace $ {

	/**
	 * Tests of the store, on the home land built in place.
	 *
	 * No master, no network, no proof of work: `doc_land_config` answers `null`, so
	 * a document is made in the home land itself instead of grabbing a land of its
	 * own. Everything else is the real path — the glob, the list, the atoms.
	 *
	 * NOT covered, deliberately: grabbing a land per document. That is proof of
	 * work, seconds against the one second a mol test is given, and a hanging test
	 * is indistinguishable from a failed assertion — silence — and hangs every
	 * build that runs the tests.
	 *
	 * `d` keeps `$` out of the string literals: mam builds its dependency graph by
	 * a regexp over sources, literals included.
	 */
	const d = '$'

	/**
	 * The address is a static cell and would leak a `doc=` from one test into the
	 * next. A subclass per test gets a cache of its own, the way the glob mock does.
	 */
	$mol_test_mocks.push( $=> {
		class $mol_state_arg_mock extends $.$mol_state_arg {}
		$.$mol_state_arg = $mol_state_arg_mock
	} )

	/**
	 * Fixtures in canonical `tree2` formatting, the fixed point of the serializer:
	 * a node with one child is written on one line. The store promises a byte for
	 * byte round trip on exactly this shape, which is the shape `lang` writes.
	 */
	const src_page = `${d}bog_vmap_app_store_test_page ${d}mol_view\n\tCalc ${d}bog_vmap_app_store_test_calc\n\tcalc_result = Calc result\n\tsub / <= Calc\n`
	const src_calc = `${d}bog_vmap_app_store_test_calc ${d}mol_view\n\tresult 42\n\tstep 1\n`
	const src_hero = `${d}bog_vmap_app_store_test_hero ${d}mol_view\n\ttitle \\Hi\n\tsub / <= title\n`

	/** Documents in the home land: the same code path minus the proof of work. */
	function store( $: $ ) {
		return $bog_vmap_app_store.make({
			$,
			doc_land_config: ()=> null,
		})
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

		/** Byte for byte, on the canonical formatting `lang` writes. */
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

		/**
		 * The payoff of per node storage: editing one class rewrites one atom. The
		 * neighbour keeps its node — the same link — and its text is untouched.
		 */
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

		/**
		 * WHY A RENAME HAS TO CARRY THE BODY AND THE STYLES BY HAND, measured at the
		 * level where it happens.
		 *
		 * Classes are matched to nodes by NAME, so a class renamed in the text has no
		 * match: a node is made for the new name with nothing in it, and the old one
		 * leaves the list taking its `Js` and `Css` with it. Everything the editor
		 * keeps about a class outside its text therefore has to be read BEFORE the
		 * text is written and put back after — there is no name in between that
		 * answers for it.
		 */
		'a class renamed in the text arrives as an empty node and the old one leaves'( $ ) {

			const s = store( $ )
			const doc = s.doc_add( 'Landing', src_page + src_calc )

			s.node( doc, `${d}bog_vmap_app_store_test_calc` )!.js( 'result(){ return 42 }' )

			const renamed = src_calc.replace( '_calc ', '_total ' )
			s.source( src_page + renamed )

			$mol_assert_equal( s.nodes( doc ).length, 2 )
			$mol_assert_equal( s.node( doc, `${d}bog_vmap_app_store_test_calc` ), null )

			// The new name is a new node, and it is empty. This is the loss the editor
			// closes above it, not a defect of the store: the text is the truth, and
			// the text says there is no such class any more.
			$mol_assert_equal( s.node_js( doc, `${d}bog_vmap_app_store_test_total` ), '' )

		},

		/**
		 * THE PROMISE OF STAGE 1: a reload comes back to the same scene.
		 *
		 * Nothing else in the pack says a word about it, and nothing could: the
		 * standing mocks switch persistence off on BOTH sides — `$giper_baza_land
		 * .sync()`, the one method that loads and saves, is stubbed to a no-op, and
		 * the mine is replaced by the empty base, whose `units_load` answers with
		 * nothing. Both are put back here.
		 *
		 * The mine below keeps units in memory, in the shape the IndexedDB driver
		 * uses in a browser: one record per unit, and the payload of a big one in a
		 * store of its own. What is NOT covered is that driver itself, which needs a
		 * browser; everything between the store and it is the product path exactly.
		 *
		 * A SESSION IS A SET OF CLASSES WITH FRESH CACHES and the same identity —
		 * what a reloaded page has, its key restored out of local storage.
		 *
		 * **Each session keeps a live reader, and without one this test lies:** the
		 * graph sweeps a cell nobody reads, the land object goes with it and comes
		 * back empty, which looks exactly like the loss under test. Measured on the
		 * stand this grew out of, where the first version reported a loss that was
		 * its own doing.
		 *
		 * **Balls are half of what is being checked.** A text longer than a unit
		 * holds inline lives in a ball beside it, and a mine that keeps units but
		 * forgets balls gives back a document list with titles and documents with no
		 * text at all — measured here by leaving `ball_load` out, and it is the same
		 * picture the editor showed on a reloaded page of the deploy.
		 */
		async 'a document written in one session comes back in the next'( $ ) {

			type Kept = { bin: ArrayBuffer, ball: Uint8Array< ArrayBuffer > | null }

			/** The disk, shared by the sessions and by nothing else. */
			const disk = new Map< string, Map< string, Kept > >()

			class mine extends $giper_baza_mine_temp {

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

			const session = ()=> {

				const ctx = Object.create( $ ) as typeof $

				// The real land, whose `sync()` loads and saves.
				ctx.$giper_baza_land = class extends $$.$giper_baza_land {} as any
				ctx.$giper_baza_mine = class extends mine {} as any

				const glob = class extends $.$giper_baza_glob {
					static override lands_touched = new $mol_wire_set< string >()
				}
				glob.$ = ctx
				ctx.$giper_baza_glob = glob as any

				ctx.$mol_state_arg = class extends $.$mol_state_arg {} as any

				// A browser answers with a quota; the base class answers zero, and
				// zero reads as «storage full» to the sharding rule of `persisted()`.
				ctx.$mol_storage = class extends $.$mol_storage {
					static override total() { return 1e9 }
					static override used() { return 0 }
				} as any

				const store = $bog_vmap_app_store.make({
					$: ctx,
					doc_land_config: ()=> [[ null, $giper_baza_rank_read ]] as $giper_baza_rank_preset,
				})

				// What a view does: read, and stay subscribed.
				const eye = new $mol_wire_atom( 'eye', ()=> {
					try {
						return store.doc_links().length + ':' + store.source().length
					} catch( error ) {
						if( $mol_promise_like( error ) ) return $mol_fail_hidden( error )
						return -1
					}
				} )

				/** A frame drawn. Suspends while a land loads, like any first frame. */
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

			// Saving is driven by the yard, which has no master here, so it is asked
			// for directly: what this checks is the round trip, not the timer.
			await $mol_wire_async( one.store.home().land() ).units_saving()
			await $mol_wire_async( made.land() ).units_saving()

			// A reload: same identity, same disk, every cache new.
			const two = session()
			two.look()

			$mol_assert_equal( ( await read( two.store, 'doc_links' ) ).length, 1 )
			$mol_assert_equal( await read( two.store, 'title' ), 'Сцена 1' )
			$mol_assert_equal( await read( two.store, 'source' ), src_page )

			// And by the address, which is how a shared link opens.
			const three = session()
			await read( three.store, 'doc_arg', link )
			three.look()

			const current = await read( three.store, 'doc_current' ) as $bog_vmap_app_doc
			$mol_assert_equal( current.link().str, link )
			$mol_assert_equal( await read( three.store, 'source' ), src_page )

		},

		/**
		 * The recorded choice can be moved, and that is what a rename of the root
		 * needs: classes are matched to nodes by NAME, so a renamed class arrives as
		 * a node of its own and nothing would move the pointer to it otherwise.
		 */
		'the root can be pointed at another class of the document'( $ ) {

			const s = store( $ )
			const doc = s.doc_add( 'Landing', src_page + src_calc )

			s.doc_root( doc, `${d}bog_vmap_app_store_test_calc` )

			$mol_assert_equal( s.doc_root( doc ), `${d}bog_vmap_app_store_test_calc` )

			// A name the document does not carry is ignored: a pointer at a node
			// outside the list is the state this exists to prevent.
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

			// No address means the last one made.
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

			// Stored as typed. What the string means is the palette's business.
			s.pack( 'https://mol.hyoo.ru, aaaaaaaa_bbbbbbbb' )
			$mol_assert_equal( s.pack(), 'https://mol.hyoo.ru, aaaaaaaa_bbbbbbbb' )

			s.spots({ Hero: { x: 0, y: 0 }, Calc: { x: 100, y: -20.5 } })
			$mol_assert_like( s.spots(), { Calc: { x: 100, y: -20.5 }, Hero: { x: 0, y: 0 } } )

			// A place gone from the dictionary is gone from the store too.
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

			// The sources are not disturbed by it.
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

			// Same list, read back as documents.
			$mol_assert_like(
				s.doc_links().map( link => s.doc( link ).title() ),
				[ 'First', 'Second' ],
			)

		},

		/**
		 * Before there is a document the editor works on a draft, and the first
		 * document is made out of it in one go: text, places and palette together,
		 * so that nothing typed while the land was being grabbed is lost.
		 */
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

			// Made once. A second call with a document in place does nothing.
			s.doc_first()
			$mol_assert_equal( s.doc_links().length, 1 )

		},

		/**
		 * `boot` answers at once and hands the making to one fiber; the answer
		 * follows the document afterwards. Read again and it is the same fiber, so
		 * a second document is never started.
		 */
		async 'boot makes the first document and then reports it'( $ ) {

			const s = store( $ )

			$mol_assert_equal( s.boot(), 'making' )

			const held = s.doc_first_task()
			$mol_assert_equal( s.doc_first_task().task === held.task, true )

			await held.task

			$mol_assert_equal( s.doc_links().length, 1 )
			$mol_assert_equal( s.boot(), 'ready' )
			$mol_assert_equal( s.stage(), 'ready' )

			// Still the one fiber, and still the one document.
			$mol_assert_equal( s.doc_first_task().task === held.task, true )
			$mol_assert_equal( s.doc_links().length, 1 )

		},

		/**
		 * The answer of `boot` is read afresh every time and cannot go stale: under
		 * `@ $mol_mem` this is the case that answered «making» for the rest of the
		 * session, the document having landed while the cell was still computing.
		 */
		'boot reports the document it just made, in the same breath'( $ ) {

			const s = store( $ )

			$mol_assert_equal( s.boot(), 'making' )

			// Nothing awaited: with no proof of work the document is already there.
			$mol_assert_equal( s.doc_links().length, 1 )
			$mol_assert_equal( s.boot(), 'ready' )
			$mol_assert_equal( s.stage(), 'ready' )

		},

		'boot leaves an existing document alone'( $ ) {

			const s = store( $ )
			s.doc_add( 'First', src_page )

			$mol_assert_equal( s.boot(), 'ready' )
			$mol_assert_equal( s.doc_links().length, 1 )

			// No fiber was ever asked for: the cell holding it is untouched.
			$mol_assert_equal( $mol_wire_probe( ()=> s.doc_first_task() ), undefined )

		},

		/** The draft goes into the document `boot` makes, the same as into `doc_first`. */
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

		/**
		 * A land still on its way suspends the fiber, which is what mining the
		 * proof of work does in the editor. The reader is told «making» and is not
		 * left on it: the moment the document lands, `boot` says `ready`. Repeated
		 * reads while it waits get the same fiber and make no second document.
		 */
		async 'a suspended land does not leave the reader on making for ever'( $ ) {

			let open = ()=> {}
			const gate = new Promise< void >( done => { open = ()=> done() } )
			let held = true

			/** Suspends once on the way in, the way a land grab does. */
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

		/**
		 * The draft is poured AFTER the document is already in the list, so there is
		 * a window in which `boot` answers `ready` while the fiber still has work to
		 * do. Whoever is reading `boot` — the application, every render — must not
		 * end that fiber by looking away: the loss would be silent and would be the
		 * text the user had typed.
		 */
		async 'the draft survives a suspension after the document is already listed'( $ ) {

			let open = ()=> {}
			const gate = new Promise< void >( done => { open = ()=> done() } )
			let held = true

			/** Suspends once while pouring, the way signing a unit does. */
			class store_late extends $bog_vmap_app_store {
				override doc_source( doc: $bog_vmap_app_doc, next?: string ): string {
					if( next !== undefined && held ) return $mol_fail_hidden( gate )
					return super.doc_source( doc, next )
				}
			}

			const s = store_late.make({ $, doc_land_config: ()=> null })
			s.source( src_page )

			$mol_assert_equal( s.boot(), 'making' )

			// The document is listed, the draft is not in it yet.
			$mol_assert_equal( s.doc_links().length, 1 )
			$mol_assert_equal( s.doc_source( s.doc_current()! ), '' )

			// The application reads `boot` again on that very change and is told
			// `ready`, so it stops asking for the fiber.
			$mol_assert_equal( s.boot(), 'ready' )

			held = false
			open()
			await s.doc_first_task().task

			$mol_assert_equal( s.doc_links().length, 1 )
			$mol_assert_equal( s.source(), src_page )

		},

		/**
		 * The same window, with a reader that subscribes and then looks away — the
		 * application, whose `auto()` reads `boot` from a cell. A cell nobody reads
		 * is collected together with what it owns, so the fiber must not hang on
		 * being read: it is held while it has work, and the draft lands whole.
		 */
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

			/** Stands for `auto()` of the application: a cell, and the only reader. */
			const reader = $mol_wire_atom.solo( s, function boot_reader( this: typeof s ) {
				return this.boot()
			} )

			$mol_assert_equal( reader.sync(), 'making' )
			$mol_assert_equal( s.doc_links().length, 1 )

			// It runs again — a render, an edit, anything — and is told `ready`.
			reader.refresh()
			$mol_assert_equal( reader.sync(), 'ready' )

			// The tick on which the graph collects whatever nobody reads any more.
			await new Promise( done => new $mol_after_tick( ()=> done( null ) ) )

			held = false
			open()
			await new Promise( done => new $mol_after_tick( ()=> done( null ) ) )
			await new Promise( done => new $mol_after_tick( ()=> done( null ) ) )

			$mol_assert_equal( s.doc_links().length, 1 )
			$mol_assert_equal( s.source(), src_page )

		},

		/**
		 * A link in the address opens somebody else's public document: it reads,
		 * it says so, and a write into it changes nothing and throws nothing. The
		 * owner is a second key; their land is copied into the reader's glob the way
		 * the network would deliver it.
		 */
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

			// Our own list is untouched by looking at theirs.
			$mol_assert_equal( s.doc_links().length, 0 )

		},

		/**
		 * A write straight into the atom, past the store, is what a remote edit
		 * looks like once it has landed. The store, having written this very node
		 * itself, must hand out the new text: this is the regression an accessor
		 * under `@ $mol_mem` fails, for the rest of the session.
		 */
		'a node edited through the store still sees a write past it'( $ ) {

			const s = store( $ )
			const doc = s.doc_add( 'Landing' )

			s.source( src_page )
			$mol_assert_equal( s.source(), src_page )

			s.nodes( doc )[ 0 ].Tree( null )!.val( src_hero )

			$mol_assert_equal( s.source(), src_hero )
			$mol_assert_equal( s.nodes( doc ).length, 1 )

		},

		/**
		 * The same, with the edit arriving from another peer by merge, the way the
		 * network delivers it. Two lands of the same link; the second writes later
		 * and wins, per node last-write-wins being the choice of section 9.
		 */
		async 'a node edited through the store still sees a merged remote edit'( $ ) {

			const s = store( $ )
			const doc = s.doc_add( 'Landing' )

			s.source( src_page )

			const head = s.nodes( doc )[ 0 ].head()
			const home = s.home().land()

			// The peer writes LATER. The home land ticked once per unit it holds by
			// now, and a single tick of a fresh land is behind all of them.
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
