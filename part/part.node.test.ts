namespace $ {

	const d = '$'

	const shelf = [
		'Calc', 'Map', 'Cell', 'Plot',
		'Button_major', 'Button_minor', 'String', 'Textarea', 'Number', 'Check_box',
		'Switch', 'Select', 'Link', 'Image', 'Text', 'Paragraph', 'Labeler',
		'Row', 'Card', 'List', 'Form', 'Form_field',
	]

	function ports( Klass: { prototype: object } ) {

		const names = new Set< string >()

		for(
			let proto = Klass.prototype as object | null;
			proto && proto !== Object.prototype;
			proto = Object.getPrototypeOf( proto )
		) {
			for( const name of Object.getOwnPropertyNames( proto ) ) names.add( name )
		}

		return names
	}

	function ports_own( $: $, Klass: { prototype: object } ) {
		const base = ports( $.$mol_view )
		return [ ... ports( Klass ) ].filter( name => !base.has( name ) ).sort()
	}

	type floor = {
		readonly path: string
		readonly name: string
		readonly own: boolean
	}

	function floors( $: $, view: $mol_view ) {

		const found = [] as floor[]

		const walk = ( host: $mol_view, at: string, deep: number )=> {

			if( deep > 6 ) return

			let kids = [] as readonly unknown[]
			try { kids = host.sub() ?? [] } catch { kids = [] }

			let index = 0

			for( const kid of kids ) {

				if( typeof ( kid as { dom_node?: unknown } | null )?.dom_node !== 'function' ) continue

				const sub = kid as $mol_view
				const owner = $.$mol_owning_get( sub ) as {
					readonly host?: unknown
					readonly task?: { readonly name?: string }
				} | null

				const name = owner?.task?.name?.trim() || String( index ++ )
				const path = `${ at }/${ name }`

				found.push({ path, name, own: owner?.host === view })

				walk( sub, path, deep + 1 )

			}

		}

		walk( view, '', 0 )

		return found
	}

	$mol_test({

		'no layer of a part shares its name with a view of a nested component'( $ ) {

			const parts = [
				$.$bog_vmap_part_calc.make({ $ }),
				$.$bog_vmap_part_cell.make({ $ }),
				$.$bog_vmap_part_map.make({ $ }),
				$.$bog_vmap_part_plot.make({ $, values: ()=> [ 1, 2, 3 ], title: ()=> 'Долг' }),
			] as $mol_view[]

			for( const part of parts ) {

				const found = floors( $, part )

				for( const one of found ) {

					if( !one.own ) continue

					const twin = found.find( other => other.name === one.name && other.path !== one.path )
					if( !twin ) continue

					$mol_fail( new Error(
						`Деталь ${ part.constructor.name }: её слой ${ one.name } (${ one.path })`
						+ ` и одноимённый вид ${ twin.path } живут в одном экземпляре.`
						+ ' Редактор адресует внутренние слои цепочкой имён, а сцена называет сегменты'
						+ ' пути методом-владельцем, поэтому у тёзок рамка на холсте и панель свойств'
						+ ' молча возьмут не тот слой. Чинить одним из двух: переименовать порт детали'
						+ ' либо научить сцену нести класс-объявитель на каждый сегмент замера —'
						+ ' план лежит в PLAN, пункт про остаточную дыру подсветки внутренних слоёв.'
					) )

				}

			}

		},

		'the shelf of the pack is exactly the list of its components'( $ ) {

			$mol_assert_equal(
				ports_own( $, $.$bog_vmap_part ).join( ' ' ),
				[ ... shelf ].sort().join( ' ' ),
			)

		},

		'every component of the shelf hands out a live view'( $ ) {

			const part = $.$bog_vmap_part.make({ $ })

			for( const name of shelf ) {
				const kid = Reflect.get( part, name ).call( part )
				$mol_assert_ok( kid instanceof $.$mol_view )
			}

		},

		'the parts declare the ports the palette wires'( $ ) {

			const calc = ports( $.$bog_vmap_part_calc )
			for( const name of [ 'left', 'right', 'op', 'result', 'result_text', 'sub' ] ) {
				$mol_assert_ok( calc.has( name ) )
			}

			const map = ports( $.$bog_vmap_part_map )
			for( const name of [ 'zoom', 'lat', 'lng', 'marker', 'sub' ] ) {
				$mol_assert_ok( map.has( name ) )
			}

			const cell = ports( $.$bog_vmap_part_cell )
			for( const name of [ 'code', 'auto', 'run', 'result_text', 'result_number', 'sub' ] ) {
				$mol_assert_ok( cell.has( name ) )
			}

			const plot = ports( $.$bog_vmap_part_plot )
			for( const name of [ 'values', 'color', 'title', 'sub' ] ) {
				$mol_assert_ok( plot.has( name ) )
			}

		},

		'the parts stand on the view of mol and nothing deeper'( $ ) {

			for( const Klass of [
				$.$bog_vmap_part_calc,
				$.$bog_vmap_part_cell,
				$.$bog_vmap_part_map,
				$.$bog_vmap_part_plot,
			] ) {
				$mol_assert_ok( Klass.prototype instanceof $.$mol_view )
			}

		},

		'every detail of the shelf declares a floor of its own'( $ ) {

			const doc = $.$mol_dom_context.document
			$mol_assert_ok( doc )

			for( const part of [ 'calc', 'cell', 'map', 'plot' ] ) {

				const el = doc.getElementById( `${d}mol_style_attach:${d}bog_vmap_part_${ part }` )
				$mol_assert_ok( el )

				const own = ( el!.textContent ?? '' ).split( '}' )[ 0 ]
				const floor = /min-width:\s*([^;]+)/.exec( own )?.[ 1 ]?.trim() ?? ''

				$mol_assert_ok( floor )
				$mol_assert_equal( floor === '0' || floor === '0px', false )

			}

		},

	})

}
