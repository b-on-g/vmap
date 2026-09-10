namespace $ {

	$mol_test_mocks.push( $=> {
		class $mol_state_arg_mock extends $.$mol_state_arg {}
		$.$mol_state_arg = $mol_state_arg_mock
	} )

	class $bog_vmap_app_history_test_doc extends $mol_object {

		@ $mol_mem
		state( next?: $bog_vmap_app_store_state ): $bog_vmap_app_store_state {
			return next ?? { source: '', js: {}, css: {} }
		}

		source( next?: string ) {
			const state = this.state()
			if( next === undefined ) return state.source
			this.state({ source: next, js: state.js, css: state.css })
			return next
		}

		css( klass: string, next: string ) {
			const state = this.state()
			this.state({ source: state.source, js: state.js, css: { ... state.css, [ klass ]: next } })
		}

	}

	function $bog_vmap_app_history_test_pair( $: $, delay = 0 ) {

		const doc = $bog_vmap_app_history_test_doc.make({ $ })

		const one = $$.$bog_vmap_app_history.make({
			$,
			doc_key: ()=> 'doc',
			step_delay: ()=> delay,
			state: ( next?: $bog_vmap_app_store_state )=> doc.state( next ),
		})

		const eye = new $mol_wire_atom( 'history_tape', ()=> {
			const tape = one.tape( 'doc' )
			return tape.states.length + ':' + tape.pos
		} )

		eye.fresh()

		const commit = async ()=> {
			await $mol_wire_async( one ).step( one.slug() )
			eye.fresh()
		}

		return { doc, one, commit }
	}

	const d = '$'

	const src_one = `${d}bog_vmap_app_history_test_page ${d}mol_view\n\ttitle \\One\n\tsub / <= title\n`

	const src_two = `${d}bog_vmap_app_history_test_page ${d}mol_view\n\ttitle \\Two\n\tsub / <= title\n`

	function $bog_vmap_app_history_test_land( $: $ ) {

		const store = $bog_vmap_app_store.make({ $, doc_land_config: ()=> null })
		const doc = store.doc_add( 'Landing' )

		const one = $$.$bog_vmap_app_history.make({
			$,
			store: ()=> store,
			step_delay: ()=> 0,
			snap_delay: ()=> 0,
			state: ( next?: $bog_vmap_app_store_state )=> store.doc_state( doc, next ),
		})

		return { store, doc, one }
	}

	function $bog_vmap_app_history_test_stroke(
		next: Partial< $$.$bog_vmap_app_history_stroke >,
	): $$.$bog_vmap_app_history_stroke {
		return {
			code: 'KeyZ',
			command: true,
			shift: false,
			alt: false,
			tag: 'DIV',
			editable: false,
			... next,
		}
	}

	$mol_test({

		async 'three edits and two undos give the state of the first edit'( $ ) {

			const { doc, one, commit } = $bog_vmap_app_history_test_pair( $ )

			await commit()

			doc.source( 'one' )
			await commit()

			doc.source( 'two' )
			await commit()

			doc.source( 'three' )
			await commit()

			one.undo()
			one.undo()

			$mol_assert_equal( doc.source(), 'one' )

		},

		async 'redo after two undos gives the state of the second edit'( $ ) {

			const { doc, one, commit } = $bog_vmap_app_history_test_pair( $ )

			await commit()

			doc.source( 'one' )
			await commit()

			doc.source( 'two' )
			await commit()

			doc.source( 'three' )
			await commit()

			one.undo()
			one.undo()
			one.redo()

			$mol_assert_equal( doc.source(), 'two' )

		},

		async 'an edit after an undo cuts the tail off'( $ ) {

			const { doc, one, commit } = $bog_vmap_app_history_test_pair( $ )

			await commit()

			doc.source( 'one' )
			await commit()

			doc.source( 'two' )
			await commit()

			one.undo()

			$mol_assert_equal( doc.source(), 'one' )
			$mol_assert_equal( one.redoable(), true )

			doc.source( 'other' )
			await commit()

			$mol_assert_equal( one.redoable(), false )

			one.undo()

			$mol_assert_equal( doc.source(), 'one' )

		},

		async 'the ring starts from the state at hand'( $ ) {

			const { doc, one, commit } = $bog_vmap_app_history_test_pair( $ )

			doc.source( 'typed at once' )

			await commit()

			$mol_assert_equal( one.ring( 'doc' ).length, 1 )
			$mol_assert_equal( one.ring( 'doc' )[ 0 ].source, 'typed at once' )
			$mol_assert_equal( one.undoable(), false )

		},

		async 'a step whose text has already moved on is dropped'( $ ) {

			const { doc, one, commit } = $bog_vmap_app_history_test_pair( $ )

			await commit()

			doc.source( 'o' )
			const stale = one.slug()

			doc.source( 'one' )
			one.slug()

			await $mol_wire_async( one ).step( stale )

			$mol_assert_equal( one.ring( 'doc' ).length, 1 )
			$mol_assert_equal( one.undoable(), false )

		},

		async 'the same state twice adds no step'( $ ) {

			const { doc, one, commit } = $bog_vmap_app_history_test_pair( $ )

			await commit()

			doc.source( 'one' )
			await commit()
			await commit()
			await commit()

			$mol_assert_equal( one.ring( 'doc' ).length, 2 )
			$mol_assert_equal( one.undoable(), true )

			one.undo()

			$mol_assert_equal( doc.source(), '' )
			$mol_assert_equal( one.undoable(), false )

		},

		async 'a style is part of the step and comes back with it'( $ ) {

			const { doc, one, commit } = $bog_vmap_app_history_test_pair( $ )

			doc.source( 'page' )
			await commit()

			doc.css( 'page', 'color: red' )
			await commit()

			$mol_assert_equal( one.ring( 'doc' ).length, 2 )

			one.undo()

			$mol_assert_equal( Object.keys( doc.state().css ).length, 0 )
			$mol_assert_equal( doc.source(), 'page' )

		},

		async 'undo at the oldest step and redo at the newest change nothing'( $ ) {

			const { doc, one, commit } = $bog_vmap_app_history_test_pair( $ )

			await commit()

			doc.source( 'one' )
			await commit()

			one.redo()
			$mol_assert_equal( doc.source(), 'one' )

			one.undo()
			one.undo()

			$mol_assert_equal( doc.source(), '' )

		},

		'a stroke of Z with a command key means undo, with shift means redo'( $ ) {

			const one = $$.$bog_vmap_app_history.make({ $ })

			$mol_assert_equal(
				one.stroke_kind( $bog_vmap_app_history_test_stroke({}) ),
				'undo',
			)

			$mol_assert_equal(
				one.stroke_kind( $bog_vmap_app_history_test_stroke({ shift: true }) ),
				'redo',
			)

		},

		'a stroke without a command key or with alt is not ours'( $ ) {

			const one = $$.$bog_vmap_app_history.make({ $ })

			$mol_assert_equal(
				one.stroke_kind( $bog_vmap_app_history_test_stroke({ command: false }) ),
				null,
			)

			$mol_assert_equal(
				one.stroke_kind( $bog_vmap_app_history_test_stroke({ alt: true }) ),
				null,
			)

			$mol_assert_equal(
				one.stroke_kind( $bog_vmap_app_history_test_stroke({ code: 'KeyY' }) ),
				null,
			)

		},

		'a stroke typed into a field or into the scene frame is left alone'( $ ) {

			const one = $$.$bog_vmap_app_history.make({ $ })

			for( const tag of [ 'INPUT', 'TEXTAREA', 'SELECT', 'IFRAME' ] ) {
				$mol_assert_equal(
					one.stroke_kind( $bog_vmap_app_history_test_stroke({ tag }) ),
					null,
				)
			}

			$mol_assert_equal(
				one.stroke_kind( $bog_vmap_app_history_test_stroke({ editable: true }) ),
				null,
			)

		},

		'a snapshot of an unchanged document is not written twice'( $ ) {

			const { store, doc, one } = $bog_vmap_app_history_test_land( $ )

			store.source( src_one )

			one.snap_make( 100 )
			$mol_assert_equal( store.snaps( doc ).length, 1 )

			one.snap_make( 200 )
			$mol_assert_equal( store.snaps( doc ).length, 1 )

			store.source( src_two )

			one.snap_make( 300 )
			$mol_assert_equal( store.snaps( doc ).length, 2 )

		},

		'restoring a snapshot puts the current state into the history first'( $ ) {

			const { store, doc, one } = $bog_vmap_app_history_test_land( $ )

			store.source( src_one )
			one.snap_make( 100 )

			store.source( src_two )

			one.snap_revert( store.snaps( doc )[ 0 ].link().str )

			$mol_assert_equal( store.source(), src_one )
			$mol_assert_equal( store.snaps( doc ).length, 2 )
			$mol_assert_equal( store.snap_state( store.snaps( doc )[ 1 ] ).source, src_two )

		},

		async 'a pause in editing leaves a snapshot'( $ ) {

			const { store, doc, one } = $bog_vmap_app_history_test_land( $ )

			store.source( src_one )

			await $mol_wire_async( one ).snap_step( one.slug() )

			$mol_assert_equal( store.snaps( doc ).length, 1 )
			$mol_assert_equal( store.snap_state( store.snaps( doc )[ 0 ] ).source, src_one )

		},

		'the newest snapshot comes first and every row shows its own moment'( $ ) {

			const { store, doc, one } = $bog_vmap_app_history_test_land( $ )

			store.source( src_one )
			one.snap_make( 1757000000000 )

			store.source( src_two )
			one.snap_make( 1757000060000 )

			const links = one.snap_links()

			$mol_assert_equal( links.length, 2 )
			$mol_assert_equal( one.snap_preview( links[ 0 ] ), src_two )
			$mol_assert_equal( one.snap_preview( links[ 1 ] ), src_one )
			$mol_assert_equal( one.snap_moment( links[ 0 ] ) === one.snap_moment( links[ 1 ] ), false )
			$mol_assert_equal( one.snap_author( links[ 0 ] ), doc.land().auth().pass().lord().str )

		},

		'a long snapshot is previewed trimmed'( $ ) {

			const { store, one } = $bog_vmap_app_history_test_land( $ )

			const long = src_one.replace( /\n$/, '' )
				+ Array.from( { length: 40 }, ( _, index )=> `\n\tItem${ index } ${d}mol_view` ).join( '' )
				+ '\n'

			store.source( long )
			one.snap_make( 1 )

			const preview = one.snap_preview( one.snap_links()[ 0 ] )

			$mol_assert_equal( preview.split( '\n' ).length, one.preview_limit() + 1 )
			$mol_assert_equal( preview.endsWith( '…' ), true )

		},

	})

}
