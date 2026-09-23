namespace $ {

	const d = '$'

	const scene_title = $bog_vmap_app_demo_title

	const scene_building = 'Ипотека (собирается)'

	const root_limit = 10000

	const doc_limit = 15000

	const step = 200

	const scene_root = $bog_vmap_app_demo_root

	const scene_tree = $bog_vmap_app_demo_source

	const body = $bog_vmap_app_demo_js

	const style = $bog_vmap_app_demo_css

	const complete = $bog_vmap_app_demo_whole

	function ask< Result >( task: ()=> Result ) {
		return $mol_wire_async( task )()
	}

	function seen( check: ()=> boolean ) {
		try {
			return check()
		} catch( error ) {
			if( $mol_promise_like( error ) ) return false
			return $mol_fail_hidden( error )
		}
	}

	async function waited( check: ()=> boolean, limit: number, note: string ) {

		const started = Date.now()

		while( !seen( check ) ) {
			if( Date.now() - started > limit ) $mol_fail( new Error( `${ note } за ${ limit } мс` ) )
			await $$.$mol_wait_timeout_async( step )
		}

	}

	async function mortgage( app: $$.$bog_vmap_app ) {

		const store = app.store()

		await waited( ()=> app.doc_key() !== '', doc_limit, 'документ редактора не открылся' )

		const found = await ask( ()=> {

			const list = [] as { readonly link: $giper_baza_link, readonly whole: boolean }[]

			for( const link of store.doc_links() ) {

				const doc = store.doc( link )
				const title = doc.title()
				if( title !== scene_title && title !== scene_building ) continue

				list.push({ link, whole: title === scene_title && complete( store.doc_source( doc ) ) })

			}

			return list
		} )

		const stray = found.filter( one => !one.whole ).map( one => one.link )

		if( found.some( one => one.whole ) ) {
			if( stray.length ) await ask( ()=> { for( const link of stray ) store.home().Docs( null )!.cut( link ) } )
			return
		}

		const whole = await ask( ()=> {
			for( const link of stray ) store.home().Docs( null )!.cut( link )
			return app.code_whole()
		} )

		const link = ( await $mol_wire_async( store ).doc_add( scene_building ) ).link()

		await ask( ()=> {

			if( store.doc_current()?.link().str !== link.str ) {
				$mol_fail( new Error( `сцена «${ scene_building }» не стала текущей` ) )
			}

			app.selected( null )
			app.code_whole( true )
			app.code_source( scene_tree )
			app.code_js( body )
			app.code_css( style )
			app.code_whole( whole )

		} )

		await ask( ()=> {

			if( app.doc_root() !== scene_root ) $mol_fail( new Error( 'корень не принял имя модуля' ) )
			if( !complete( app.doc_src() ) ) $mol_fail( new Error( `документ сцены «${ scene_building }» записался не целиком` ) )

			store.doc( link ).title( scene_title )
			app.camera_reset()

		} )

	}

	function editor() {
		return $mol_view.roots().find( ( view ): view is $$.$bog_vmap_app => view instanceof $$.$bog_vmap_app ) ?? null
	}

	async function built() {

		const started = Date.now()

		while( Date.now() - started <= root_limit ) {

			const app = editor()
			if( app ) return await mortgage( app )

			await $$.$mol_wait_timeout_async( step )

		}

		$mol_fail( new Error( `корень редактора не появился за ${ root_limit } мс` ) )

	}

	function aborted() {

		let running = ''

		for( let at = 0; at < $mol_test_all.length; ++ at ) {

			const test = $mol_test_all[ at ]
			const named = ( context: $ )=> { running = test.name; return test( context ) }

			Object.defineProperty( named, 'name', { value: test.name } )

			$mol_test_all[ at ] = named

		}

		$mol_dom_context.addEventListener( 'unhandledrejection', event => {
			const reason = ( event as PromiseRejectionEvent ).reason
			console.error(
				`Прогон тестов оборван на «${ running }», остальные не исполнялись:`,
				( reason as Error )?.message ?? reason,
			)
		} )

	}

	$mol_test({

		'the builder and the demo share one text, not a copy'() {

			$mol_assert_equal( scene_tree, $bog_vmap_app_demo_source )
			$mol_assert_equal( body, $bog_vmap_app_demo_js )
			$mol_assert_equal( style, $bog_vmap_app_demo_css )
			$mol_assert_equal( scene_title, $bog_vmap_app_demo_title )
			$mol_assert_equal( scene_root, $bog_vmap_app_demo_root )

		},

		async 'a whole mortgage scene survives the next pass untouched'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )
			const store = stage.store

			const doc = store.doc_add( scene_title, scene_tree )
			const link = doc.link()

			const docs = store.doc_links().map( one => one.str )
			const source = store.doc_source( store.doc( link ) )

			await mortgage( stage.app )

			$mol_assert_like( store.doc_links().map( one => one.str ), docs )
			$mol_assert_equal( store.doc( link ).title(), scene_title )
			$mol_assert_equal( store.doc_source( store.doc( link ) ), source )

		},

		async 'a stray unfinished scene is swept while the whole one stays'( $ ) {

			const stage = $bog_vmap_app_flow_stage( $ )
			const store = stage.store

			const link = store.doc_add( scene_title, scene_tree ).link()
			const stray = store.doc_add( scene_building ).link()

			await mortgage( stage.app )

			const links = store.doc_links().map( one => one.str )

			$mol_assert_equal( links.includes( link.str ), true )
			$mol_assert_equal( links.includes( stray.str ), false )
			$mol_assert_equal( store.doc( link ).title(), scene_title )

		},

	})

	if( typeof $mol_dom_context !== 'undefined' && $mol_dom_context.document ) {
		$$.$mol_wait_timeout_async( 0 ).then( aborted )
		built().catch( $mol_fail_log )
	}

}
