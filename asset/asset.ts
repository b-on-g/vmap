namespace $ {

	/**
	 * Files of the editor: a land per asset, and the durable `asset:` address that
	 * points at one from inside a document.
	 *
	 * An asset is a **separate blob land**, not a field of the document. That is
	 * what makes a file shareable by a link of its own and reusable between
	 * documents, and it is why the id in the text is the land link itself: anybody
	 * holding the id can fetch the bytes, no document needed for the lookup.
	 *
	 * The bytes are `$giper_baza_file`, which already is «bytes plus name plus MIME»
	 * and already splits into 32 KB chunks. Writing our own would have been a second
	 * one.
	 *
	 * @see ../ARCHITECTURE.md section 6
	 */

	/** Scheme of the durable address of an asset inside a document. */
	const $bog_vmap_asset_prefix = 'asset:'

	/**
	 * Characters a link may be made of, kept as one place so the scanner and the
	 * validator cannot part ways. The shape itself is checked by
	 * `$giper_baza_link`, whose grammar is the one the database lives by — a
	 * grammar of our own would disagree with it at the first exception, the same
	 * reason the token rule of the language module borrows the compiler's.
	 */
	const $bog_vmap_asset_chars = /[A-Za-zÆæ0-9_]+/

	/** Durable address of an asset, as it is written in a document. */
	export function $bog_vmap_asset_uri( id: string ) {
		return $bog_vmap_asset_prefix + id
	}

	/**
	 * The id inside an `asset:` address, or null when the string is not one.
	 *
	 * Null and not a throw: this is asked of arbitrary text, and a value that
	 * merely is not an asset address is the ordinary case, not a failure.
	 */
	export function $bog_vmap_asset_id( uri: string ) {

		if( !uri.startsWith( $bog_vmap_asset_prefix ) ) return null

		const id = uri.slice( $bog_vmap_asset_prefix.length )

		return id ? $giper_baza_link.check( id ) : null
	}

	/**
	 * Every asset a document addresses, in order of first mention, without repeats.
	 *
	 * **This is the only list of the assets of a document, and there is no field
	 * holding them.** A deviation from the letter of section 6, which says the
	 * document keeps an `atom_link_to` per asset, and taken for the reason section 6
	 * itself gives about wires: the text is the truth, and a second copy of a
	 * derivable fact parts company with it the first time somebody edits the text by
	 * hand in the code editor of stage 4.1. Nothing is lost — the id IS the land
	 * link, so a document does not need a field to reach its files, and export and
	 * prefetch both want exactly this list.
	 */
	export function $bog_vmap_asset_ids( source: string ) {

		const found = new Set< string >()

		for( const [ uri ] of source.matchAll(
			new RegExp( $bog_vmap_asset_prefix + $bog_vmap_asset_chars.source, 'g' )
		) ) {
			const id = $bog_vmap_asset_id( uri )
			if( id ) found.add( id )
		}

		return [ ... found ] as readonly string[]
	}

	/**
	 * Rewrites every `asset:` address into whatever `at` answers for its id.
	 *
	 * One function for both renderers of section 6: the scene passes a `blob:` URL,
	 * the export passes `./assets/<name>`. They differ in the answer and in nothing
	 * else, and having written the replacement twice is how the two would come to
	 * disagree about which addresses count.
	 *
	 * An id `at` has no answer for is **left exactly as it stands**. An asset whose
	 * bytes have not arrived yet is the normal state of a lazy delivery, and
	 * replacing it with a blank would turn «not here yet» into a broken reference
	 * that no later delivery repairs.
	 */
	export function $bog_vmap_asset_swap( source: string, at: ( id: string )=> string | null ) {

		return source.replace(
			new RegExp( $bog_vmap_asset_prefix + $bog_vmap_asset_chars.source, 'g' ),
			uri => {
				const id = $bog_vmap_asset_id( uri )
				if( !id ) return uri
				return at( id ) ?? uri
			},
		)
	}

	/**
	 * Host side of the assets: makes a land per file, and hands bytes to the bridge.
	 *
	 * Lives in the host and nowhere else. The scene has no access to Giper Baza at
	 * all, by section 4, so the bytes reach it over `postMessage` as an
	 * `ArrayBuffer` — a `blob:` URL made here is bound to this origin and is dead in
	 * an opaque one.
	 */
	export class $bog_vmap_asset extends $mol_object {

		/**
		 * File of an asset by its id, or null when the id is not a link.
		 *
		 * Nothing asks the land to sync here: every read of the pawn goes through
		 * `$giper_baza_land.sand_ordered()`, which syncs first, so the bytes of
		 * somebody else's asset arrive by being read. No field to override either,
		 * because there is none: see `$bog_vmap_asset_ids`.
		 */
		file( id: string ) {

			const checked = $giper_baza_link.check( id )
			if( !checked ) return null

			return this.$.$giper_baza_glob.Pawn(
				new $giper_baza_link( checked ),
				$giper_baza_file,
			)
		}

		/** Bytes of an asset, for `asset_put` on the bridge. */
		bytes( id: string ) {
			return this.file( id )?.buffer() ?? null
		}

		/** MIME type of an asset, for `asset_put` on the bridge. */
		mime( id: string ) {
			return this.file( id )?.type() ?? ''
		}

		/** File name of an asset, which the export uses for the path it writes. */
		name( id: string ) {
			return this.file( id )?.name() ?? ''
		}

		/**
		 * Puts bytes into a land of their own and answers with the id.
		 *
		 * **Call this through the async wrapper of the framework and never from plain
		 * async code.** `land_grab` mines proof of work, the task that does it
		 * is cached per fiber, and outside a fiber every `Promise` thrown on the way
		 * restarts the caller from the top — which starts a NEW proof of work, and
		 * then another, forever, with the main thread pinned. The symptom is a log
		 * repeating the same line with no progress, not an error.
		 *
		 * Plain method on purpose, not an action decorator: an action opens a fiber of
		 * its own per call, so calling it from outside a fiber gives every retry a
		 * fresh task and the caching that makes this terminate never happens. One
		 * method, one fiber, every sub-task inside it.
		 *
		 * A land of its own per asset, and read for everyone by default, because a
		 * file has to be shareable on its own — that is the whole reason it is not a
		 * field of the document.
		 */
		put( bytes: Uint8Array< ArrayBuffer >, mime: string, name: string ) {

			const land = this.$.$giper_baza_glob.land_grab()
			const file = land.Data( $giper_baza_file )

			file.buffer( bytes )
			file.type( mime )
			file.name( name )

			return file.link().str
		}

	}

}
