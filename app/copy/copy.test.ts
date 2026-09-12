namespace $ {
	const d = '$'

	const source = [
		`${d}doc ${d}mol_view`,
		`\tCalc ${d}flow_calc`,
		`\t\top \\minus`,
		`\tcalc_result = Calc result`,
		`\tMap ${d}flow_map`,
		`\t\tzoom <= calc_result`,
		`\tButton ${d}flow_button`,
		`\t\ttitle \\Go`,
		`\tPage ${d}mol_view`,
		`\t\tsub /`,
		`\t\t\t<= Button`,
		`\tsub /`,
		`\t\t<= Calc`,
		`\t\t<= Map`,
		`\t\t<= Page`,
		``,
	].join( '\n' )

	const made = ( $: $ )=> {
		const node = $bog_vmap_lang_node.make({ $ })
		node.source( source )
		return node
	}

	const said = ( node: $bog_vmap_lang_node, name: string, prop: string )=> {
		return node.over_tree( name, prop )?.kids[ 0 ]?.value ?? null
	}

	$mol_test({

		'a copy takes the next free number and never the bare name'( $ ) {
			$mol_assert_equal( $bog_vmap_app_copy_name( 'Calc', new Set([ 'Calc' ]) ), 'Calc_2' )
			$mol_assert_equal( $bog_vmap_app_copy_name( 'Calc', new Set([ 'Calc', 'Calc_2' ]) ), 'Calc_3' )
			$mol_assert_equal( $bog_vmap_app_copy_name( 'Calc_2', new Set([ 'Calc', 'Calc_2' ]) ), 'Calc_3' )
			$mol_assert_equal( $bog_vmap_app_copy_name( 'Page_2', new Set([ 'Page_2' ]) ), 'Page_3' )
			$mol_assert_equal( $bog_vmap_app_copy_name( 'H1', new Set([ 'H1' ]) ), 'H1_2' )
		},

		'a copy of a free part stands right after it with the same settings'( $ ) {
			const node = made( $ )

			$mol_assert_equal( $bog_vmap_app_copy( node, 'Calc' ), 'Calc_2' )

			$mol_assert_like( node.sub_names(), [ 'Calc', 'Calc_2', 'Map', 'Page' ] )
			$mol_assert_equal( node.prop_decl( 'Calc_2' )?.kids[ 0 ]?.type, `${d}flow_calc` )
			$mol_assert_equal( said( node, 'Calc_2', 'op' ), 'minus' )
			$mol_assert_equal( said( node, 'Calc', 'op' ), 'minus' )

			$mol_assert_equal( $bog_vmap_app_copy( node, 'Calc' ), 'Calc_3' )
			$mol_assert_equal( $bog_vmap_app_copy( node, 'Calc_2' ), 'Calc_4' )

			$mol_assert_like( node.sub_names(), [ 'Calc', 'Calc_3', 'Calc_2', 'Calc_4', 'Map', 'Page' ] )
		},

		'a copy of a board takes copies of its insides, and the board keeps its own'( $ ) {
			const node = made( $ )

			$mol_assert_equal( $bog_vmap_app_copy( node, 'Page' ), 'Page_2' )

			$mol_assert_like( node.sub_names(), [ 'Calc', 'Map', 'Page', 'Page_2' ] )
			$mol_assert_like( node.sub_names( 'Page' ), [ 'Button' ] )
			$mol_assert_like( node.sub_names( 'Page_2' ), [ 'Button_2' ] )

			$mol_assert_equal( node.prop_decl( 'Button_2' )?.kids[ 0 ]?.type, `${d}flow_button` )
			$mol_assert_equal( said( node, 'Button_2', 'title' ), 'Go' )
			$mol_assert_equal( node.sub_holder( 'Button_2' ), 'Page_2' )
		},

		'a copy of a nested part goes into its owner right after it'( $ ) {
			const node = made( $ )

			$mol_assert_equal( $bog_vmap_app_copy( node, 'Button' ), 'Button_2' )

			$mol_assert_like( node.sub_names( 'Page' ), [ 'Button', 'Button_2' ] )
			$mol_assert_like( node.sub_names(), [ 'Calc', 'Map', 'Page' ] )
		},

		'a copy is fed by the same wire, and feeds nothing itself'( $ ) {
			const node = made( $ )

			$bog_vmap_app_copy( node, 'Map' )
			$bog_vmap_app_copy( node, 'Calc' )

			$mol_assert_like(
				node.links().map( link => `${ link.from }.${ link.from_prop } > ${ link.to }.${ link.to_prop }` ),
				[ 'Calc.result > Map.zoom', 'Calc.result > Map_2.zoom' ],
			)
		},

	})

}
