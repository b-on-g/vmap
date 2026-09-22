namespace $ {

	let last = null as null | { readonly menu: $mol_object, readonly host: Element }

	const menu_make = ( $: $, over: Partial< $$.$bog_vmap_app_menu > = {} )=> {
		const dom = $.$mol_dom_context

		last?.menu.destructor()
		last?.host.remove()

		const menu = $$.$bog_vmap_app_menu.make({ $, ... over })
		menu.showed( true )

		const host = dom.document.createElement( 'div' )
		host.style.position = 'fixed'
		host.style.left = '-20000px'
		dom.document.body.appendChild( host )
		host.appendChild( menu.dom_tree() )

		last = { menu, host }

		const items = ()=> [ ... host.querySelectorAll( '[bog_vmap_app_menu_item]' ) ]

		const text = ( el: Element, part: string )=> el.querySelector( `[bog_vmap_app_menu_item_${ part }]` )?.textContent ?? null

		const fire = ( el: EventTarget, event: Event )=> {
			el.dispatchEvent( event )
			menu.dom_tree()
			return event
		}

		return {
			menu, host, items,

			titles() {
				return items().map( el => text( el, 'label' ) )
			},

			keys() {
				return items().map( el => text( el, 'keys' ) )
			},

			item( name: string ) {
				const el = host.querySelector( `[bog_vmap_app_menu_${ name }]` )
				if( !el ) return $mol_fail( new Error( `no item ${ name } in the menu` ) )
				return el
			},

			click( el: Element ) {
				return fire( el, new dom.MouseEvent( 'click', { bubbles: true, cancelable: true } ) )
			},

			press( el: Element | Document ) {
				return fire( el, new dom.Event( 'pointerdown', { bubbles: true, cancelable: true } ) )
			},

			roll( el: Element | Document ) {
				return fire( el, new dom.Event( 'wheel', { bubbles: true, cancelable: true } ) )
			},

			point( el: Element ) {
				return fire( el, new dom.MouseEvent( 'contextmenu', { bubbles: true, cancelable: true } ) )
			},

			blur() {
				return fire( dom, new dom.FocusEvent( 'blur' ) )
			},

		}
	}

	const deeds = ()=> {
		const log = [] as string[]

		const deed = ( name: string )=> ( next?: unknown )=> {
			if( next !== undefined ) log.push( name )
			return null
		}

		return {
			log,
			copy: deed( 'copy' ),
			remove: deed( 'remove' ),
			wrap: deed( 'wrap' ),
			parent: deed( 'parent' ),
			enter: deed( 'enter' ),
			board: deed( 'board' ),
			fit: deed( 'fit' ),
		}
	}

	$mol_test({

		'on a node the menu offers copy, delete, wrap, parent and inside, on bare canvas a board and the whole view'( $ ) {
			const node = menu_make( $, { on_node: ()=> true } )
			$mol_assert_like( node.titles(), [ 'Копировать', 'Удалить', 'Сгруппировать', 'Разгруппировать', 'Обернуть в артборд', 'Выделить родителя', 'Внутрь' ] )

			const canvas = menu_make( $, { on_node: ()=> false } )
			$mol_assert_like( canvas.titles(), [ 'Артборд здесь', 'Показать всё' ] )
		},

		'a read only scene keeps only the items that change nothing'( $ ) {
			const node = menu_make( $, { on_node: ()=> true, editable: ()=> false } )
			$mol_assert_like( node.titles(), [ 'Выделить родителя', 'Внутрь' ] )

			const canvas = menu_make( $, { on_node: ()=> false, editable: ()=> false } )
			$mol_assert_like( canvas.titles(), [ 'Показать всё' ] )
		},

		'each item carries its key after the title, the way the platform writes it'( $ ) {
			const mac = menu_make( $, { on_node: ()=> true, apple: ()=> true } )
			$mol_assert_like( mac.keys(), [ '⌘D', '⌫', '⌘G', '⇧⌘G', '⌥⌘G', '', '' ] )
			$mol_assert_like(
				[ ... mac.item( 'copy' ).children ].map( el => el.hasAttribute( 'bog_vmap_app_menu_item_keys' ) ),
				[ false, true ],
			)

			const other = menu_make( $, { on_node: ()=> true, apple: ()=> false } )
			$mol_assert_like( other.keys(), [ 'Ctrl+D', 'Del', 'Ctrl+G', 'Ctrl+Shift+G', 'Ctrl+Alt+G', '', '' ] )

			$mol_assert_like( menu_make( $, { apple: ()=> true } ).keys(), [ '', '⇧1' ] )
			$mol_assert_like( menu_make( $, { apple: ()=> false } ).keys(), [ '', 'Shift+1' ] )
		},

		'the platform is told by the browser it runs in'( $ ) {
			const agent = ( userAgent: string )=> $$.$bog_vmap_app_menu.make({
				$: $.$mol_ambient({
					$mol_dom_context: { navigator: { userAgent } } as unknown as typeof $.$mol_dom_context,
				}),
			}).apple()

			$mol_assert_equal( agent( 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' ), true )
			$mol_assert_equal( agent( 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' ), false )
			$mol_assert_equal( agent( 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' ), false )
		},

		'an item does its own deed once and closes the menu'( $ ) {
			for( const name of [ 'copy', 'remove', 'wrap', 'parent', 'enter', 'board', 'fit' ] ) {
				const ports = deeds()
				const stage = menu_make( $, { ... ports, on_node: ()=> name !== 'board' && name !== 'fit' } )

				stage.click( stage.item( name ) )

				$mol_assert_like( ports.log, [ name ] )
				$mol_assert_equal( stage.menu.showed(), false )
				$mol_assert_equal( stage.items().length, 0 )
			}
		},

		'a disabled item neither does its deed nor closes the menu'( $ ) {
			const ports = deeds()
			const stage = menu_make( $, {
				... ports,
				on_node: ()=> true,
				parent_enabled: ()=> false,
			} )

			$mol_assert_equal( stage.item( 'parent' ).getAttribute( 'disabled' ), 'true' )
			$mol_assert_equal( stage.item( 'enter' ).hasAttribute( 'disabled' ), false )

			stage.click( stage.item( 'parent' ) )

			$mol_assert_like( ports.log, [] )
			$mol_assert_equal( stage.menu.showed(), true )
		},

		'a press, a wheel and a right click on the menu stay in it and keep it open'( $ ) {
			const stage = menu_make( $, { on_node: ()=> true } )

			$mol_assert_equal( stage.press( stage.item( 'copy' ) ).defaultPrevented, true )
			$mol_assert_equal( stage.roll( stage.item( 'wrap' ) ).defaultPrevented, true )
			$mol_assert_equal( stage.point( stage.item( 'enter' ) ).defaultPrevented, true )

			$mol_assert_equal( stage.menu.showed(), true )
			$mol_assert_equal( stage.items().length, 7 )
		},

		'a press or a wheel outside the menu closes it'( $ ) {
			const pressed = menu_make( $ )
			pressed.press( $.$mol_dom_context.document.body )
			$mol_assert_equal( pressed.menu.showed(), false )
			$mol_assert_equal( pressed.items().length, 0 )

			const rolled = menu_make( $ )
			rolled.roll( $.$mol_dom_context.document.body )
			$mol_assert_equal( rolled.menu.showed(), false )
		},

		'the window losing focus closes the menu'( $ ) {
			const stage = menu_make( $ )
			stage.blur()
			$mol_assert_equal( stage.menu.showed(), false )
		},

		'the menu stands at the point it is given'( $ ) {
			const stage = menu_make( $, { left: ()=> '120px', top: ()=> '48px' } )
			const style = ( stage.menu.dom_node() as HTMLElement ).style

			$mol_assert_equal( style.left, '120px' )
			$mol_assert_equal( style.top, '48px' )
		},

	})

}
