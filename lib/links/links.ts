namespace $ {

	/**
	 * The palette field, parsed: a list of links separated by commas into a donor
	 * pack, the lands of Giper Baza to compile on top of it, and what was refused.
	 *
	 * Pure. Knows no network, no database and no view, so it can sit in `lib/` and
	 * be shared by the palette and the host without either paying for the other.
	 *
	 * @see ../../ARCHITECTURE.md section 5
	 */
	export type $bog_vmap_lib_links = {

		/**
		 * The donor pack, EXACTLY as typed, or null when no http(s) link was given.
		 *
		 * Not normalized here on purpose: the field is edited by hand, and a slash
		 * appended while typing would make the address impossible to finish. The
		 * derived address grows the slash, see `$bog_vmap_lib_slashed`.
		 */
		readonly pack: string | null

		/** Land links, in the order typed, without repeats. */
		readonly lands: readonly string[]

		/** Every token that was neither, with the reason in the user's words. */
		readonly rejected: readonly {
			readonly link: string
			readonly reason: string
		}[]

	}

	/** A deployed pack is addressed by http(s) and by nothing else. */
	const $bog_vmap_lib_links_pack = /^https?:\/\//i

	/**
	 * Grammar of a Giper Baza link: up to four groups of eight, joined by `_`.
	 *
	 * COPIED from the constructor of the link class of Giper Baza, and a copy is the
	 * lesser evil here. Naming that class — even in this comment, mam reads doc
	 * comments for dependencies, measured: 21 mentions of the database in this
	 * bundle from one name here — would pull the database into `lib/`, whose bundle
	 * has zero mentions of it by measurement, and the palette pays for that bundle.
	 * The copy is guarded by a test in `lib/land`, which lives on the database side
	 * and checks a sample of tokens against the original.
	 *
	 * The original also accepts the empty string and bare underscores; a token has
	 * to carry at least one group to be a link to anything, hence the second test.
	 */
	const $bog_vmap_lib_links_land = /^(([a-zæA-ZÆ0-9]{8})?_){0,3}([a-zæA-ZÆ0-9]{8})?$/
	const $bog_vmap_lib_links_group = /[a-zæA-ZÆ0-9]{8}/

	/** Wording of the refusals, kept in one place so the tests and the field agree. */
	export const $bog_vmap_lib_links_reason = {

		/** @see ../../ARCHITECTURE.md section 5, «Донорский пак ровно один на кадр» */
		pack_second: 'второй пак на кадр невозможен, подключайте компоненты ссылкой на ленд',

		unknown: 'не адрес пака (http…) и не ссылка на ленд Гипер Базы',

	} as const

	/**
	 * Splits the field into the pack, the lands and the refused.
	 *
	 * Commas separate; whitespace, including line breaks, separates as well, so a
	 * list pasted one link per line reads the same as one typed with commas. Empty
	 * tokens, and with them trailing commas and doubled separators, are nothing and
	 * are not even reported.
	 *
	 * The FIRST http(s) link is the pack, wherever it stands in the list. The second
	 * one is refused, and refused with the reason a user can act on, rather than
	 * silently dropped: the second pack over the first poisons the palette without a
	 * signal, which is exactly why it must not reach the frame — and exactly why the
	 * person typing it has to be told.
	 */
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

	/**
	 * Is this token a land link by the grammar above. Exposed for the guard test on
	 * the database side; the palette needs only `parse`.
	 */
	export function $bog_vmap_lib_links_is_land( token: string ) {
		return $bog_vmap_lib_links_land.test( token ) && $bog_vmap_lib_links_group.test( token )
	}

	/**
	 * The refusals as one text for a status line, one refusal per line, or an empty
	 * string when there is nothing to say. An empty string and not a placeholder,
	 * so that a view can hide the line by testing the text.
	 */
	export function $bog_vmap_lib_links_note( links: $bog_vmap_lib_links ) {
		return links.rejected.map( item => `${ item.link }: ${ item.reason }` ).join( '\n' )
	}

}
