namespace $ {

	/**
	 * Tests of the inspector stand, and only of what does not need a network.
	 *
	 * The row list needs `$bog_vmap_lib`, which fetches a deployed pack, so it is
	 * not touched here: a test that reaches the network is a test that fails on a
	 * train. What IS tested is the thing that used to eat data — a document of
	 * several classes, edited one class at a time.
	 *
	 * The guarantee itself belongs to `$bog_vmap_lang_doc` and is proven there. The
	 * point here is narrower and still worth pinning: that the stand is wired to it
	 * at all, rather than to the class model it looks like it could be wired to.
	 */
	$mol_test({

		'the stand hands the inspector one class of a multi class document'( $ ) {

			const stand = $.$bog_vmap_app_inspect_demo.make({ $ })
			const names = stand.names()

			$mol_assert_equal( names.length, 2 )
			$mol_assert_ok( stand.class_source().startsWith( names[ 0 ] ) )

		},

		'picking a class switches what the stand hands over'( $ ) {

			const stand = $.$bog_vmap_app_inspect_demo.make({ $ })
			const names = stand.names()

			stand.klass( names[ 1 ] )

			$mol_assert_ok( stand.class_source().startsWith( names[ 1 ] ) )

		},

		'an edit through the stand leaves the other class byte for byte'( $ ) {

			const stand = $.$bog_vmap_app_inspect_demo.make({ $ })
			const other = stand.names()[ 1 ]
			const before = stand.Doc().class_source( other )

			stand.class_source( stand.class_source().replace( 'count 24', 'count 42' ) )

			$mol_assert_equal( stand.Doc().class_source( other ), before )
			$mol_assert_ok( stand.class_source().includes( 'count 42' ) )

		},

		/**
		 * The classes the inspector hands to the library: the one being edited plus
		 * its siblings, and never a second copy of itself. The class index of the
		 * library keeps the LAST declaration of a name, so a stale twin among the
		 * peers would quietly shadow the class actually being edited.
		 */
		'the inspected class is not duplicated by its own peers'( $ ) {

			const stand = $.$bog_vmap_app_inspect_demo.make({ $ })
			const types = stand.Inspect().classes().map( tree => tree.type )

			$mol_assert_like( types, stand.names() )

		},

		/**
		 * The layout panel writes into the ordinary `style` dictionary of the node,
		 * so what an artboard is made of is what a hand written document of the
		 * framework would carry, and an export has nothing to learn about artboards.
		 */
		'layout properties land in the style of the node and read back'( $ ) {

			const inspect = inspect_of( $, [
				`${ d }bog_vmap_app_inspect_test_page ${ d }mol_view`,
				'	sub /',
				'',
			].join( '\n' ) )

			$mol_assert_equal( inspect.Flex().direction(), '' )

			inspect.Flex().direction( 'column' )
			inspect.Flex().gap( '1rem' )

			$mol_assert_equal( inspect.Flex().direction(), 'column' )
			$mol_assert_equal( inspect.Flex().gap(), '1rem' )

			$mol_assert_equal(
				inspect.Node().source(),
				[
					`${ d }bog_vmap_app_inspect_test_page ${ d }mol_view`,
					'	sub /',
					'	style *',
					'		^',
					'		flexDirection \\column',
					'		gap \\1rem',
					'',
				].join( '\n' ),
			)

			// Empty takes the key out again, and the dictionary keeps the rest.
			inspect.Flex().gap( '' )
			$mol_assert_equal( inspect.Flex().gap(), '' )
			$mol_assert_equal( inspect.Node().source().includes( 'gap' ), false )
			$mol_assert_equal( inspect.Flex().direction(), 'column' )

		},

		/**
		 * `^` first, always. A dictionary redeclared without it replaces the one of
		 * the base instead of extending it, so a node that grew one layout key would
		 * lose every style its class sets, without a word.
		 */
		'the inherited head of the style dictionary is kept'( $ ) {

			const inspect = inspect_of( $, [
				`${ d }bog_vmap_app_inspect_test_card ${ d }mol_view`,
				'	style *',
				'		^',
				'		padding \\4px',
				'',
			].join( '\n' ) )

			inspect.Flex().across( 'center' )

			$mol_assert_like(
				inspect.style_dict()!.kids.map( kid => kid.type ),
				[ '^', 'padding', 'alignItems' ],
			)

		},

		/**
		 * The style renderer appends `px` to a number, so `flexGrow 1` comes
		 * out as `flex-grow: 1px` — not a length, not a growth factor, dropped, and
		 * the node does not stretch. The document has to carry text.
		 */
		'stretching is written as text, because a number would get px'( $ ) {

			const inspect = inspect_of( $, [
				`${ d }bog_vmap_app_inspect_test_cell ${ d }mol_view`,
				'	sub /',
				'',
			].join( '\n' ) )

			inspect.Flex().grow( true )

			$mol_assert_equal( inspect.Flex().grow(), true )
			$mol_assert_ok( inspect.Node().source().includes( 'flexGrow \\1' ) )

			inspect.Flex().grow( false )
			$mol_assert_equal( inspect.Flex().grow(), false )
			$mol_assert_equal( inspect.Node().source().includes( 'flexGrow' ), false )

		},

		/** The width of the page is the same kind of fact, set through the same key. */
		'the width switch sets the width of the artboard'( $ ) {

			const inspect = inspect_of( $, [
				`${ d }bog_vmap_app_inspect_test_board ${ d }mol_view`,
				'	style * width \\1280px',
				'	sub /',
				'',
			].join( '\n' ) )

			$mol_assert_equal( inspect.Flex().width(), '1280px' )

			inspect.Flex().width( '390px' )

			$mol_assert_equal( inspect.Flex().width(), '390px' )
			$mol_assert_ok( inspect.Node().source().includes( 'width \\390px' ) )

		},

		/**
		 * Typing is not renaming. A rename rewrites the declaration and everything
		 * that points at it, so a write per keystroke would rename the node to every
		 * prefix of what is being typed and drag the whole document along.
		 */
		'the name field renames on submit and not on a keystroke'( $ ) {

			const inspect = inspect_of( $, [
				`${ d }bog_vmap_app_inspect_test_name ${ d }mol_view`,
				'	sub /',
				'',
			].join( '\n' ) )

			$mol_assert_equal( inspect.title_value(), `${ d }bog_vmap_app_inspect_test_name` )

			inspect.title_value( `${ d }bog_vmap_app_inspect_test_hero` )

			// Typed, not committed: the field shows it, the document does not have it.
			$mol_assert_equal( inspect.title_value(), `${ d }bog_vmap_app_inspect_test_hero` )
			$mol_assert_equal( inspect.class_title(), `${ d }bog_vmap_app_inspect_test_name` )

			inspect.title_submit()

			$mol_assert_equal( inspect.class_title(), `${ d }bog_vmap_app_inspect_test_hero` )
			$mol_assert_ok( inspect.Node().source().startsWith( `${ d }bog_vmap_app_inspect_test_hero ` ) )

		},

		/** A draft belongs to the name it started from, so a fresh name starts a fresh draft. */
		'the field follows the name once the rename lands'( $ ) {

			const inspect = inspect_of( $, [
				`${ d }bog_vmap_app_inspect_test_name ${ d }mol_view`,
				'	sub /',
				'',
			].join( '\n' ) )

			inspect.title_value( `${ d }bog_vmap_app_inspect_test_hero` )
			inspect.title_submit()

			$mol_assert_equal( inspect.title_value(), `${ d }bog_vmap_app_inspect_test_hero` )

			// Nothing to commit twice.
			inspect.title_submit()
			$mol_assert_equal( inspect.class_title(), `${ d }bog_vmap_app_inspect_test_hero` )

		},

		/** No refusal, no strip: an empty strip in a panel this narrow reads as a bug. */
		'the refusal strip is there only while there is a refusal'( $ ) {

			const inspect = inspect_of( $, [
				`${ d }bog_vmap_app_inspect_test_name ${ d }mol_view`,
				'	sub /',
				'',
			].join( '\n' ) )

			$mol_assert_equal( inspect.sub().includes( inspect.Note() ), false )

			const refused = $.$bog_vmap_app_inspect.make({
				$,
				source: ()=> `${ d }bog_vmap_app_inspect_test_name ${ d }mol_view\n\tsub /\n`,
				title_note: ()=> 'Имя занято',
			}) as $$.$bog_vmap_app_inspect

			// Right under the head, where the eye already is.
			$mol_assert_equal( refused.sub()[ 1 ], refused.Note() )

		},


		/**
		 * A source with no class in it is a state, not a failure.
		 *
		 * Every cell of this panel derives from one class, so with none they all
		 * fail at once and the panel answers with a wall of red strips. It happened
		 * on the deploy, where a pick outlived the document it was made in.
		 */
		'a source naming no class leaves an invitation, not twenty failures'( $ ) {

			const one = inspect_of( $, '' )

			$mol_assert_equal( one.class_ready(), false )

			// By identity and not by likeness: two live views compared deeply walk
			// into their own machinery, and what comes back says nothing about the
			// panel. Nothing else is even asked here, so nothing else can throw.
			$mol_assert_equal( one.sub().length, 1 )
			$mol_assert_equal( one.sub()[ 0 ], one.Empty() )

			// And a panel over a real class is whole. A SECOND inspector and not a
			// write into this one: the stand hands the source in as a plain closure,
			// so a write through it invalidates no cell and the failed parse would
			// stay cached — an artefact of the stand, not of the panel.
			const two = inspect_of( $, `${d}my_card ${d}mol_view\n\ttitle \\Hi\n` )

			$mol_assert_equal( two.class_ready(), true )
			$mol_assert_ok( two.sub().length > 1 )

		},
	})

	/** `d` keeps `$` out of the literals: mam reads them when building its graph. */
	const d = '$'

	/**
	 * An inspector over one class held in a local variable.
	 *
	 * The library is never touched, so nothing here reaches the network: the layout
	 * panel asks the document what it says and writes back into it, and inherited
	 * ports are somebody else's question.
	 */
	function inspect_of( $: $mol_ambient_context, source: string ) {

		let text = source

		return $.$bog_vmap_app_inspect.make({
			$,
			source: ( next?: string )=> next === undefined ? text : ( text = next ),
		}) as $$.$bog_vmap_app_inspect

	}

}
