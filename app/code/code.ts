namespace $ {

	export type $bog_vmap_app_code_props = Map< string, string >

	export const $bog_vmap_app_code_blank = 'Пустой текст документ не стирает.'
		+ ' Уберите объявление узла, если он больше не нужен, а чтобы начать с чистого листа —'
		+ ' заведите новую сцену'

	export function $bog_vmap_app_code_props_js( this: $, body: string ) {

		const props: $bog_vmap_app_code_props = new Map

		let code_start = 0
		let body_start = 0
		let depth = 0

		for( let i = 0; i < body.length; ++i ) {

			const char = body[ i ]

			if( char === '}' ) {

				--depth
				if( depth !== 0 ) continue

				const name = $bog_vmap_app_code_last(
					body.slice( code_start, body_start ), /([\w]+)[\s]*\(/g,
				)
				if( !name ) continue

				props.set( name, body.slice( code_start, i + 1 ).trim() )
				code_start = i + 1

			} else if( char === '{' ) {

				if( depth === 0 ) body_start = i
				++depth

			}

		}

		if( depth !== 0 ) return this.$mol_fail( new Error( 'Curly braces is not balanced' ) )

		$bog_vmap_app_code_tail( props, body, code_start )

		return props
	}

	export function $bog_vmap_app_code_props_css( this: $, css: string, klass: string ) {

		const props: $bog_vmap_app_code_props = new Map
		const prefix = $bog_vmap_app_code_attr( klass ) + '_'

		let code_start = 0
		let body_start = 0
		let depth = 0

		for( let i = 0; i < css.length; ++i ) {

			const char = css[ i ]

			if( char === '}' ) {

				--depth
				if( depth !== 0 ) continue

				const attr = $bog_vmap_app_code_last(
					css.slice( code_start, body_start ), /\[([\w]+)\]/g,
				)?.toLowerCase()

				const name = attr?.startsWith( prefix ) ? attr.slice( prefix.length ) : ''

				if( name ) {
					props.set( name, css.slice( code_start, i + 1 ).trim() )
					code_start = i + 1
				}

			} else if( char === '{' ) {

				if( depth === 0 ) body_start = i
				++depth

			}

		}

		if( depth !== 0 ) return this.$mol_fail( new Error( 'Curly braces is not balanced' ) )

		$bog_vmap_app_code_tail( props, css, code_start )

		return props
	}

	function $bog_vmap_app_code_last( text: string, pattern: RegExp ) {
		const found = [ ... text.matchAll( pattern ) ]
		return found[ found.length - 1 ]?.[ 1 ]
	}

	function $bog_vmap_app_code_tail( props: $bog_vmap_app_code_props, text: string, from: number ) {
		const tail = text.slice( from ).trim()
		if( tail ) props.set( '', tail )
	}

	export function $bog_vmap_app_code_joined( props: $bog_vmap_app_code_props ) {
		return [ ... props.values() ].join( '\n\n' )
	}

	export function $bog_vmap_app_code_with(
		props: $bog_vmap_app_code_props,
		name: string,
		code: string,
	) {

		const tail = props.get( '' )

		props.set( name, code )

		if( tail !== undefined && name !== '' ) {
			props.delete( '' )
			props.set( '', tail )
		}

		return props
	}

	export function $bog_vmap_app_code_js_default( name: string, key = false, next = false ) {
		const params = [ ... key ? [ 'key' ] : [], ... next ? [ 'next' ] : [] ].join( ', ' )
		return `${ name }( ${ params } ) {\n\t\n}`
	}

	export function $bog_vmap_app_code_css_default( name: string, klass: string ) {
		return `[${ $bog_vmap_app_code_attr( klass ) }_${ name.toLowerCase() }] {\n\t\n}`
	}

	export function $bog_vmap_app_code_attr( klass: string ) {
		return klass.replace( /\$/g, '' ).toLowerCase()
	}

}
