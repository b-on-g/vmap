namespace $ {

	const d = '$'

	const src_root = `${d}bog_vmap_app_doc_test_page ${d}mol_view\n\tCalc ${d}bog_vmap_app_doc_test_calc\n\tcalc_result = Calc result\n\tsub / <= Calc\n`
	const src_hero = `${d}bog_vmap_app_doc_test_hero ${d}mol_view title \\Hi\n`

	const head_root = new $giper_baza_link( '11111111' )
	const head_hero = new $giper_baza_link( '22222222' )

	function wired( value: unknown ) {
		return typeof value === 'function' && 'orig' in value
	}

	function statics_own( Klass: Function ) {
		return Object.getOwnPropertyNames( Klass )
			.filter( name => ![ 'length', 'name', 'prototype' ].includes( name ) )
			.map( name => ({ name, value: Object.getOwnPropertyDescriptor( Klass, name )?.value }) )
	}

	$mol_test({

		'three sources of a node survive a write and a read'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const node = land.Pawn( $bog_vmap_app_doc_node ).Head( head_root )

			$mol_assert_equal( node.source(), '' )
			$mol_assert_equal( node.js(), '' )
			$mol_assert_equal( node.css(), '' )

			node.source( src_root )
			node.js( 'result(){ return 42 }' )
			node.css( '[bog_vmap_app_doc_test_page]{ color: red }' )

			$mol_assert_equal( node.source(), src_root )
			$mol_assert_equal( node.js(), 'result(){ return 42 }' )
			$mol_assert_equal( node.css(), '[bog_vmap_app_doc_test_page]{ color: red }' )

		},

		'canvas coordinates survive a write and a read'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const doc = land.Pawn( $bog_vmap_app_doc ).Data()

			const spot = doc.Spots( null )!.key( 'Calc', null )!

			$mol_assert_equal( spot.x(), 0 )
			$mol_assert_equal( spot.y(), 0 )

			spot.x( 3000 )
			spot.y( -12.5 )

			$mol_assert_equal( spot.x(), 3000 )
			$mol_assert_equal( spot.y(), -12.5 )

			$mol_assert_equal( doc.Spots()!.key( 'Calc' )!.x(), 3000 )

		},

		async 'edits to different nodes merge without loss'( $ ) {

			const land1 = $giper_baza_land.make({ $ })
			const land2 = $giper_baza_land.make({ $ })

			land1.Pawn( $bog_vmap_app_doc_node ).Head( head_root ).source( src_root )

			land2.tick()
			land2.Pawn( $bog_vmap_app_doc_node ).Head( head_hero ).source( src_hero )

			await $mol_wire_async( land1 ).units_steal( land2 )

			$mol_assert_equal( land1.Pawn( $bog_vmap_app_doc_node ).Head( head_root ).source(), src_root )
			$mol_assert_equal( land1.Pawn( $bog_vmap_app_doc_node ).Head( head_hero ).source(), src_hero )

		},

		async 'edits to one node are last write wins'( $ ) {

			const land1 = $giper_baza_land.make({ $ })
			const land2 = $giper_baza_land.make({ $ })

			land1.Pawn( $bog_vmap_app_doc_node ).Head( head_root ).source( src_root )

			land2.tick()
			land2.Pawn( $bog_vmap_app_doc_node ).Head( head_root ).source( src_hero )

			await $mol_wire_async( land1 ).units_steal( land2 )

			$mol_assert_equal( land1.Pawn( $bog_vmap_app_doc_node ).Head( head_root ).source(), src_hero )

		},

		async 'a locally edited node still sees a remote edit'( $ ) {

			const land1 = $giper_baza_land.make({ $ })
			const land2 = $giper_baza_land.make({ $ })

			const node1 = land1.Pawn( $bog_vmap_app_doc_node ).Head( head_root )
			node1.source( src_root )
			$mol_assert_equal( node1.source(), src_root )

			land2.tick()
			land2.Pawn( $bog_vmap_app_doc_node ).Head( head_root ).Tree( null )!.val( src_hero )

			await $mol_wire_async( land1 ).units_steal( land2 )

			$mol_assert_equal( node1.Tree()!.val(), src_hero )
			$mol_assert_equal( node1.source(), src_hero )

		},

		'a document titles itself and points at its root'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const doc = land.Pawn( $bog_vmap_app_doc ).Data()

			doc.title( 'Landing' )
			$mol_assert_equal( doc.title(), 'Landing' )

			$mol_assert_equal( doc.pack(), '' )
			doc.pack( 'https://mol.hyoo.ru' )
			$mol_assert_equal( doc.pack(), 'https://mol.hyoo.ru' )

			const root = land.Pawn( $bog_vmap_app_doc_node ).Head( head_root )
			root.source( src_root )

			doc.Root( null )!.remote( root )

			$mol_assert_equal( doc.Root()!.val()!.str, root.link().str )

		},

		'nothing derivable is stored'( $ ) {

			$mol_assert_like(
				Object.keys( $bog_vmap_app_doc_node.schema ),
				[ 'Tree', 'Js', 'Css' ],
			)

			$mol_assert_like(
				Object.keys( $bog_vmap_app_doc_snap.schema ),
				[ 'Time', 'Author', 'Tree', 'Js', 'Css', 'Places' ],
			)

			$mol_assert_like(
				Object.keys( $bog_vmap_app_doc_spot.schema ),
				[ 'X', 'Y' ],
			)

			$mol_assert_like(
				Object.keys( $bog_vmap_app_doc.schema ),
				[ 'Title', 'Nodes', 'Root', 'Spots', 'Pack', 'Snaps' ],
			)

			$mol_assert_like(
				Object.keys( $bog_vmap_app_doc_home.schema ),
				[ 'Docs' ],
			)

		},

		'schema carries no static wire methods'( $ ) {

			for( const Klass of $bog_vmap_app_doc_schema ) {

				const wired_names = statics_own( Klass )
					.filter( prop => wired( prop.value ) )
					.map( prop => prop.name )

				$mol_assert_like( wired_names, [] )

			}

		},

	})

}
