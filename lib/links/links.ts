namespace $ {

	export type $bog_vmap_lib_links = {

		readonly pack: string | null

		readonly lands: readonly string[]

		readonly rejected: readonly {
			readonly link: string
			readonly reason: string
		}[]

	}

	const $bog_vmap_lib_links_pack = /^https?:\/\//i

	const $bog_vmap_lib_links_land = /^(([a-zæA-ZÆ0-9]{8})?_){0,3}([a-zæA-ZÆ0-9]{8})?$/
	const $bog_vmap_lib_links_group = /[a-zæA-ZÆ0-9]{8}/

	export const $bog_vmap_lib_links_reason = {

		pack_second: 'второй пак на кадр невозможен, подключайте компоненты ссылкой на ленд',

		unknown: 'не адрес пака (http…) и не ссылка на ленд Гипер Базы',

	} as const

	export function $bog_vmap_lib_links_parse( text: string ): $bog_vmap_lib_links {

		let pack = null as string | null
		const lands = [] as string[]
		const rejected = [] as { link: string, reason: string }[]

		for( const token of text.split( /[,\s]+/ ) ) {

			if( !token ) continue

			if( $bog_vmap_lib_links_pack.test( token ) ) {
				if( pack === null ) pack = token
				else rejected.push({ link: token, reason: $bog_vmap_lib_links_reason.pack_second })
				continue
			}

			if( $bog_vmap_lib_links_land.test( token ) && $bog_vmap_lib_links_group.test( token ) ) {
				if( !lands.includes( token ) ) lands.push( token )
				continue
			}

			rejected.push({ link: token, reason: $bog_vmap_lib_links_reason.unknown })

		}

		return { pack, lands, rejected }
	}

	export function $bog_vmap_lib_links_is_land( token: string ) {
		return $bog_vmap_lib_links_land.test( token ) && $bog_vmap_lib_links_group.test( token )
	}

	export function $bog_vmap_lib_links_note( links: $bog_vmap_lib_links ) {
		return links.rejected.map( item => `${ item.link }: ${ item.reason }` ).join( '\n' )
	}

}
