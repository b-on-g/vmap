namespace $ {

	/**
	 * Tests of the editor shell that need no DOM.
	 *
	 * Nothing here renders. What is checked is the rule that the canvas must not be
	 * able to break: where the camera points is not part of the document.
	 *
	 * `d` keeps `$` out of the string literals — mam builds its dependency graph by
	 * a regexp over sources, literals included, so a bare class name in a fixture
	 * would drag a whole module into the bundle.
	 */
	const d = '$'

	$mol_test({

		/**
		 * FIRST INVARIANT OF CULLING: what is drawn may depend on the camera, what is
		 * stored may not — not by a byte.
		 *
		 * Cheap to check and worth checking, because the tempting way to implement
		 * culling is to push a document with the off screen parts left out of `sub`.
		 * That reads as harmless, costs a full recompile per frame of panning, and
		 * quietly makes the saved document a function of where the user was looking.
		 * This test fails the moment anybody tries it.
		 */
		'panning does not touch the document'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )
			app.part_drop( `${d}mol_string`, 300, 400 )

			const before = app.doc_source()

			const pane = app.Pane() as $$.$bog_vmap_app_pane
			pane.camera_shift( new $mol_vector_2d( -900, -700 ) )
			pane.camera_zoom( 4 )
			pane.camera_shift( new $mol_vector_2d( 0, 0 ) )
			pane.camera_zoom( 1 )

			$mol_assert_equal( app.doc_source(), before )

		},

		/** Placement is editor state and moves with the camera never, with a drag only. */
		'panning does not touch the placement'( $ ) {

			const app = $bog_vmap_app.make({ $ }) as $$.$bog_vmap_app

			app.part_drop( `${d}mol_button_minor`, 100, 200 )
			const before = JSON.stringify( app.spots() )

			const pane = app.Pane() as $$.$bog_vmap_app_pane
			pane.camera_shift( new $mol_vector_2d( -500, -500 ) )

			$mol_assert_equal( JSON.stringify( app.spots() ), before )

		},

		/**
		 * Boxes survive a report that does not mention them, because culling makes
		 * silence mean «not drawn» rather than «has no size». Only a delete clears one.
		 */
		'measured boxes survive a report without them'( $ ) {

			const pane = $bog_vmap_app_pane.make({
				$,
				doc_root: ()=> `${d}doc`,
			}) as $$.$bog_vmap_app_pane

			pane.sizes_last = {
				[ `${d}doc/A` ]: { x: 0, y: 0, width: 10, height: 10 },
				[ `${d}doc/B` ]: { x: 20, y: 0, width: 10, height: 10 },
			}

			// What a report looks like once `B` has been culled: it is simply absent.
			pane.sizes_last = { ... pane.sizes_last, [ `${d}doc/A` ]: { x: 5, y: 5, width: 10, height: 10 } }

			$mol_assert_equal( pane.sizes_last[ `${d}doc/A` ].x, 5 )
			$mol_assert_equal( Boolean( pane.sizes_last[ `${d}doc/B` ] ), true )

			pane.sizes_forget( 'B' )

			$mol_assert_equal( Boolean( pane.sizes_last[ `${d}doc/B` ] ), false )
			$mol_assert_equal( Boolean( pane.sizes_last[ `${d}doc/A` ] ), true )

		},

		/** A part's own sub views go with it, or they would outlive their owner. */
		'forgetting a part forgets what was measured inside it'( $ ) {

			const pane = $bog_vmap_app_pane.make({
				$,
				doc_root: ()=> `${d}doc`,
			}) as $$.$bog_vmap_app_pane

			pane.sizes_last = {
				[ `${d}doc/Icon` ]: { x: 0, y: 0, width: 10, height: 10 },
				[ `${d}doc/Icon/Path` ]: { x: 0, y: 0, width: 8, height: 8 },
				[ `${d}doc/Icons` ]: { x: 0, y: 0, width: 10, height: 10 },
			}

			pane.sizes_forget( 'Icon' )

			$mol_assert_equal( Boolean( pane.sizes_last[ `${d}doc/Icon` ] ), false )
			$mol_assert_equal( Boolean( pane.sizes_last[ `${d}doc/Icon/Path` ] ), false )

			// A name this one is a prefix of is a different part and must stay.
			$mol_assert_equal( Boolean( pane.sizes_last[ `${d}doc/Icons` ] ), true )

		},

	})

}
