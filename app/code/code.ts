namespace $ {

	/**
	 * Slicing of the handwritten sources by property.
	 *
	 * Port of `props_js()`, `props_css()` and the `source_*_prop` family of
	 * `hyoo_studio`. Kept as plain functions with no view around them, because
	 * the whole of stage 4.2 is text in and text out.
	 *
	 * @see ../../ARCHITECTURE.md section 2
	 */

	/** A property of a class body, and the code that declares it. */
	export type $bog_vmap_app_code_props = Map< string, string >

	/**
	 * Class body cut into properties, keyed by property name.
	 *
	 * Counts braces rather than parsing: a body is arbitrary JS, and everything
	 * between the end of the previous property and the opening brace of this one
	 * is where the name lives. Studio does it this way and it holds on real
	 * bodies, comments and nested functions included.
	 */
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

	/**
	 * Styles cut into properties, keyed by the property the rule belongs to.
	 *
	 * The selector of a sub-view is the attribute `[<class>_<prop>]` that $mol
	 * writes on it, so the property name is the tail of the attribute once the
	 * name of the class is taken off. A rule about anything else is skipped.
	 */
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

	/**
	 * The LAST capture of a pattern in a piece of text, or nothing.
	 *
	 * Deviation from studio, which takes the first. Everything the previous
	 * property did not eat is in front of the name — a rule about another class,
	 * a comment with a bracket in it — and the first match would be that instead
	 * of the name. Studio then skips the property, and skipping is what loses it.
	 */
	function $bog_vmap_app_code_last( text: string, pattern: RegExp ) {
		const found = [ ... text.matchAll( pattern ) ]
		return found[ found.length - 1 ]?.[ 1 ]
	}

	/**
	 * Whatever is left after the last recognized property, kept under the empty key.
	 *
	 * Text before a recognized property is already carried by it, because the cut
	 * starts where the previous one ended. The tail has nothing after it to ride
	 * on, and without a place of its own it would vanish the first time a single
	 * property was edited — silently, which is the one thing an editor may not do.
	 * The empty string is not a property name, so nothing ever asks for this slot.
	 */
	function $bog_vmap_app_code_tail( props: $bog_vmap_app_code_props, text: string, from: number ) {
		const tail = text.slice( from ).trim()
		if( tail ) props.set( '', tail )
	}

	/** Sliced properties put back together into one text, in their own order. */
	export function $bog_vmap_app_code_joined( props: $bog_vmap_app_code_props ) {
		return [ ... props.values() ].join( '\n\n' )
	}

	/**
	 * One property replaced in the slicing, with the unrecognized tail kept last.
	 *
	 * A property the text does not carry yet is appended, and the tail is moved
	 * behind it: a `Map` keeps insertion order, so without the move a new property
	 * would land after the leftovers and the two would swap places on every edit.
	 */
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

	/**
	 * Empty method of a property, for when the body declares none yet.
	 *
	 * The signature follows the property: `*` gives a key, `?` gives a next, and
	 * a plain property takes neither. Same rule as `source_js_prop_default` of
	 * studio, which reads them off the property model instead of a signature.
	 */
	export function $bog_vmap_app_code_js_default( name: string, key = false, next = false ) {
		const params = [ ... key ? [ 'key' ] : [], ... next ? [ 'next' ] : [] ].join( ', ' )
		return `${ name }( ${ params } ) {\n\t\n}`
	}

	/** Empty rule of a property, addressed by the attribute $mol writes on its node. */
	export function $bog_vmap_app_code_css_default( name: string, klass: string ) {
		return `[${ $bog_vmap_app_code_attr( klass ) }_${ name.toLowerCase() }] {\n\t\n}`
	}

	/**
	 * Attribute $mol writes for a class: the name without the leading sigil, lower
	 * case. `attr_static()` lowercases the whole thing, so a selector that does not
	 * would simply never match.
	 */
	export function $bog_vmap_app_code_attr( klass: string ) {
		return klass.replace( /\$/g, '' ).toLowerCase()
	}

}
