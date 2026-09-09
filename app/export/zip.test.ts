namespace $ {

	/**
	 * Tests of the archive.
	 *
	 * A format nobody in the project reads back: the readers are the unpacker of
	 * the operating system and the archiver of the browser, and neither is here.
	 * So the bytes are checked against the specification directly — signatures,
	 * offsets, checksums — and the checksum against a value produced by zlib, which
	 * is a witness of its own rather than this code agreeing with itself.
	 *
	 * `d` keeps `$` out of the string literals: mam builds its dependency graph by
	 * a regexp over sources, literals included.
	 */
	const d = '$'

	/** Little endian integer at a position, the way every zip reader takes one. */
	function number_at( bytes: Uint8Array, at: number, size: number ) {

		let value = 0

		for( let i = size - 1; i >= 0; --i ) value = value * 256 + bytes[ at + i ]

		return value
	}

	function text_at( bytes: Uint8Array, at: number, size: number ) {
		return new TextDecoder().decode( bytes.slice( at, at + size ) )
	}

	/**
	 * Entries as the central directory declares them, which is where a reader
	 * looks. Walking the local headers instead would prove nothing about the
	 * directory, and the directory is what an unpacker trusts.
	 */
	function entries_of( bytes: Uint8Array ) {

		const count = number_at( bytes, bytes.length - 12, 2 )
		let at = number_at( bytes, bytes.length - 6, 4 )

		const out = [] as {
			name: string,
			crc: number,
			size: number,
			offset: number,
			signature: number,
		}[]

		for( let i = 0; i < count; ++i ) {

			const name_size = number_at( bytes, at + 28, 2 )

			out.push({
				signature: number_at( bytes, at, 4 ),
				crc: number_at( bytes, at + 16, 4 ),
				size: number_at( bytes, at + 24, 4 ),
				name: text_at( bytes, at + 46, name_size ),
				offset: number_at( bytes, at + 42, 4 ),
			})

			at += 46 + name_size

		}

		return out
	}

	/** Content of one entry, read through its local header the way an unpacker does. */
	function body_of( bytes: Uint8Array, offset: number ) {

		const name_size = number_at( bytes, offset + 26, 2 )
		const extra_size = number_at( bytes, offset + 28, 2 )
		const size = number_at( bytes, offset + 18, 4 )
		const at = offset + 30 + name_size + extra_size

		return text_at( bytes, at, size )
	}

	const module = {
		path: 'bog/site',
		name: 'site',
		root: `${d}bog_site_page`,
		files: [
			{ name: 'site.view.tree', text: `${d}bog_site_page ${d}mol_view\n\tsub /\n` },
			{ name: 'index.html', text: '<!doctype html>\n' },
		],
	} as $bog_vmap_app_export_module

	$mol_test({

		/**
		 * The checksum against zlib, not against a second implementation of the same
		 * table: a table wrong in the same way twice would pass any self comparison,
		 * and a wrong checksum is exactly what makes an archive refuse to open.
		 */
		'the checksum is the one every reader computes'( $ ) {

			$mol_assert_equal(
				$.$bog_vmap_app_export_crc32( new TextEncoder().encode( 'hello' ) ),
				907060870,
			)

			$mol_assert_equal(
				$.$bog_vmap_app_export_crc32( new TextEncoder().encode( 'привет' ) ),
				779501134,
			)

			// An empty entry is a normal one, and its checksum is not a special case.
			$mol_assert_equal( $.$bog_vmap_app_export_crc32( new Uint8Array( 0 ) ), 0 )

		},

		/** Signatures and counts, so that a reader finds the directory at all. */
		'the archive ends with a directory of every file'( $ ) {

			const bytes = $.$bog_vmap_app_export_zip( module.files )

			$mol_assert_equal( number_at( bytes, 0, 4 ), 0x04034b50 )
			$mol_assert_equal( number_at( bytes, bytes.length - 22, 4 ), 0x06054b50 )
			$mol_assert_equal( number_at( bytes, bytes.length - 12, 2 ), 2 )

			const entries = entries_of( bytes )

			$mol_assert_equal( entries.length, 2 )
			$mol_assert_equal( entries[ 0 ].signature, 0x02014b50 )
			$mol_assert_equal( entries[ 1 ].signature, 0x02014b50 )

		},

		/**
		 * THE POINT OF THE WHOLE FILE: what the directory promises is what lies at
		 * the offset it promises it at. An archive whose offsets are off by a header
		 * opens as empty, or as garbage, and nothing else in the editor would notice.
		 */
		'every entry lies where the directory says it does'( $ ) {

			const bytes = $.$bog_vmap_app_export_zip( module.files )

			for( const entry of entries_of( bytes ) ) {

				$mol_assert_equal( number_at( bytes, entry.offset, 4 ), 0x04034b50 )

				const file = module.files.find( file => file.name === entry.name )!

				$mol_assert_equal( body_of( bytes, entry.offset ), file.text )
				$mol_assert_equal( entry.crc, $.$bog_vmap_app_export_crc32(
					new TextEncoder().encode( file.text )
				) )

			}

		},

		/**
		 * Text is stored in UTF-8, and the size in the header is the size in bytes.
		 * A size counted in characters cuts a russian comment in half, and the
		 * document of a russian speaking author is the ordinary case here.
		 */
		'non ascii text keeps its bytes'( $ ) {

			const bytes = $.$bog_vmap_app_export_zip([
				{ name: 'note.txt', text: 'привет' },
			])

			const entry = entries_of( bytes )[ 0 ]

			$mol_assert_equal( entry.size, 12 )
			$mol_assert_equal( body_of( bytes, entry.offset ), 'привет' )

		},

		/** Bit 11 of the flags, without which a non ascii NAME arrives mojibake. */
		'names are marked as utf-8'( $ ) {

			const bytes = $.$bog_vmap_app_export_zip( module.files )

			$mol_assert_equal( number_at( bytes, 6, 2 ), 0x0800 )

		},

		/**
		 * A date, and a fixed one. Zero shows up as `00-00-1980` and makes unpackers
		 * complain; the wall clock would make one document produce different bytes on
		 * every export, which no test could then pin down.
		 */
		'entries carry a valid date and the same bytes every time'( $ ) {

			const bytes = $.$bog_vmap_app_export_zip( module.files )

			$mol_assert_equal( number_at( bytes, 12, 2 ), 0x0021 )

			const again = $.$bog_vmap_app_export_zip( module.files )

			$mol_assert_equal( bytes.length, again.length )
			$mol_assert_equal( [ ... bytes ].join(), [ ... again ].join() )

		},

		/**
		 * The module folder travels INSIDE the archive, so unpacking at the root of a
		 * checkout puts the module where its class names oblige it to be. Section 10:
		 * a module in the wrong folder builds into `Root package not found` while
		 * looking entirely correct.
		 */
		'the archive carries the module folder'( $ ) {

			const names = entries_of( $.$bog_vmap_app_export_archive( module ) )
				.map( entry => entry.name )

			$mol_assert_equal(
				names.join( ' ' ),
				'bog/site/site.view.tree bog/site/index.html',
			)

		},

		/** An archive of nothing is still an archive: a directory of zero entries. */
		'an empty list makes an empty archive'( $ ) {

			const bytes = $.$bog_vmap_app_export_zip([])

			$mol_assert_equal( bytes.length, 22 )
			$mol_assert_equal( number_at( bytes, 0, 4 ), 0x06054b50 )
			$mol_assert_equal( entries_of( bytes ).length, 0 )

		},

	})

}
