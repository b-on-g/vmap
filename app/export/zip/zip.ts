namespace $ {

	/**
	 * The module as one archive, so that a browser can hand it over in a single
	 * gesture. Nothing in the ecosystem packs files, so the format is written here,
	 * in the stored flavour that needs no compressor.
	 *
	 * Stored and not deflated on purpose: a handful of small text files gain
	 * nothing by compression, while a compressor costs either a library in the
	 * bundle or an async browser API that would drag this whole path into a fiber.
	 *
	 * The alternative not taken — asking the browser for a folder and writing into
	 * it — exists in one browser, asks for a permission of its own, and leaves
	 * every other browser with nothing.
	 *
	 * @see ../../ARCHITECTURE.md section 10
	 */

	/** Table of the CRC32 polynomial, built once. Zip stores a checksum per entry. */
	const crc_table = ( ()=> {

		const table = new Uint32Array( 256 )

		for( let i = 0; i < 256; ++i ) {
			let value = i
			for( let bit = 0; bit < 8; ++bit ) {
				value = value & 1 ? 0xEDB88320 ^ ( value >>> 1 ) : value >>> 1
			}
			table[ i ] = value >>> 0
		}

		return table

	} )()

	/** Checksum zip keeps beside every entry, and the one every reader verifies. */
	export function $bog_vmap_app_export_zip_crc32( bytes: Uint8Array ) {

		let crc = 0xFFFFFFFF

		for( const byte of bytes ) crc = crc_table[ ( crc ^ byte ) & 0xFF ] ^ ( crc >>> 8 )

		return ( crc ^ 0xFFFFFFFF ) >>> 0
	}

	/** Little endian integer of a fixed width, which is how zip writes every number. */
	function number_bytes( value: number, size: number ) {

		const out = new Uint8Array( size )

		for( let i = 0; i < size; ++i ) out[ i ] = ( value >>> ( 8 * i ) ) & 0xFF

		return out
	}

	/**
	 * A date every reader accepts.
	 *
	 * The real time of the export is not written: a zero date shows up as
	 * `00-00-1980` and makes some unpackers complain, and the wall clock would make
	 * the same document produce a different archive every time, which is a thing no
	 * test can pin down. This is the first representable moment instead.
	 */
	const dos_date = 0x0021
	const dos_time = 0

	/** Flag bit 11: names are UTF-8, which is what keeps a non-ascii path readable. */
	const flag_utf8 = 0x0800

	/**
	 * Files as one zip archive, in the stored method.
	 *
	 * Byte for byte deterministic: same files in, same bytes out, so the whole
	 * format is checkable by a test instead of by opening it. Directories are not
	 * written as entries of their own — a name with slashes in it creates them, and
	 * every unpacker does that.
	 */
	export function $bog_vmap_app_export_zip(
		this: $,
		files: readonly $bog_vmap_app_export_file[],
	) {

		const encoder = new TextEncoder()

		const chunks = [] as Uint8Array[]
		const directory = [] as Uint8Array[][]

		let offset = 0

		for( const file of files ) {

			const name = encoder.encode( file.name )
			const body = encoder.encode( file.text )
			const crc = $bog_vmap_app_export_zip_crc32( body )

			const local = [
				number_bytes( 0x04034b50, 4 ),
				number_bytes( 20, 2 ),
				number_bytes( flag_utf8, 2 ),
				number_bytes( 0, 2 ),
				number_bytes( dos_time, 2 ),
				number_bytes( dos_date, 2 ),
				number_bytes( crc, 4 ),
				number_bytes( body.length, 4 ),
				number_bytes( body.length, 4 ),
				number_bytes( name.length, 2 ),
				number_bytes( 0, 2 ),
				name,
			]

			for( const part of local ) chunks.push( part )
			chunks.push( body )

			directory.push([
				number_bytes( 0x02014b50, 4 ),
				number_bytes( 20, 2 ),
				number_bytes( 20, 2 ),
				number_bytes( flag_utf8, 2 ),
				number_bytes( 0, 2 ),
				number_bytes( dos_time, 2 ),
				number_bytes( dos_date, 2 ),
				number_bytes( crc, 4 ),
				number_bytes( body.length, 4 ),
				number_bytes( body.length, 4 ),
				number_bytes( name.length, 2 ),
				number_bytes( 0, 2 ),
				number_bytes( 0, 2 ),
				number_bytes( 0, 2 ),
				number_bytes( 0, 2 ),
				number_bytes( 0, 4 ),
				number_bytes( offset, 4 ),
				name,
			])

			offset += local.reduce( ( sum, part )=> sum + part.length, 0 ) + body.length

		}

		const directory_at = offset
		let directory_size = 0

		for( const record of directory ) {
			for( const part of record ) {
				chunks.push( part )
				directory_size += part.length
			}
		}

		const end = [
			number_bytes( 0x06054b50, 4 ),
			number_bytes( 0, 2 ),
			number_bytes( 0, 2 ),
			number_bytes( directory.length, 2 ),
			number_bytes( directory.length, 2 ),
			number_bytes( directory_size, 4 ),
			number_bytes( directory_at, 4 ),
			number_bytes( 0, 2 ),
		]

		for( const part of end ) chunks.push( part )

		const total = chunks.reduce( ( sum, chunk )=> sum + chunk.length, 0 )
		const out = new Uint8Array( total )

		let at = 0
		for( const chunk of chunks ) {
			out.set( chunk, at )
			at += chunk.length
		}

		return out
	}

	/**
	 * The built module as an archive, with its folder inside.
	 *
	 * Every entry carries the whole module path and not a bare file name, so that
	 * unpacking at the root of a mam checkout puts the module where its own class
	 * names oblige it to be — section 10, where a module in the wrong folder builds
	 * into `Root package not found` while looking entirely correct.
	 */
	export function $bog_vmap_app_export_zip_archive(
		this: $,
		module: $bog_vmap_app_export_module,
	) {

		return this.$bog_vmap_app_export_zip( module.files.map( file => ({
			name: `${ module.path }/${ file.name }`,
			text: file.text,
		}) ) )

	}

}
