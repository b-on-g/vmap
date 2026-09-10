namespace $ {

	const d = '$'

	function number_at( bytes: Uint8Array, at: number, size: number ) {

		let value = 0

		for( let i = size - 1; i >= 0; --i ) value = value * 256 + bytes[ at + i ]

		return value
	}

	function text_at( bytes: Uint8Array, at: number, size: number ) {
		return new TextDecoder().decode( bytes.slice( at, at + size ) )
	}

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

		'the checksum is the one every reader computes'( $ ) {

			$mol_assert_equal(
				$.$bog_vmap_app_export_zip_crc32( new TextEncoder().encode( 'hello' ) ),
				907060870,
			)

			$mol_assert_equal(
				$.$bog_vmap_app_export_zip_crc32( new TextEncoder().encode( 'привет' ) ),
				779501134,
			)

			$mol_assert_equal( $.$bog_vmap_app_export_zip_crc32( new Uint8Array( 0 ) ), 0 )

		},

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

		'every entry lies where the directory says it does'( $ ) {

			const bytes = $.$bog_vmap_app_export_zip( module.files )

			for( const entry of entries_of( bytes ) ) {

				$mol_assert_equal( number_at( bytes, entry.offset, 4 ), 0x04034b50 )

				const file = module.files.find( file => file.name === entry.name )!

				$mol_assert_equal( body_of( bytes, entry.offset ), file.text )
				$mol_assert_equal( entry.crc, $.$bog_vmap_app_export_zip_crc32(
					new TextEncoder().encode( file.text )
				) )

			}

		},

		'non ascii text keeps its bytes'( $ ) {

			const bytes = $.$bog_vmap_app_export_zip([
				{ name: 'note.txt', text: 'привет' },
			])

			const entry = entries_of( bytes )[ 0 ]

			$mol_assert_equal( entry.size, 12 )
			$mol_assert_equal( body_of( bytes, entry.offset ), 'привет' )

		},

		'names are marked as utf-8'( $ ) {

			const bytes = $.$bog_vmap_app_export_zip( module.files )

			$mol_assert_equal( number_at( bytes, 6, 2 ), 0x0800 )

		},

		'entries carry a valid date and the same bytes every time'( $ ) {

			const bytes = $.$bog_vmap_app_export_zip( module.files )

			$mol_assert_equal( number_at( bytes, 12, 2 ), 0x0021 )

			const again = $.$bog_vmap_app_export_zip( module.files )

			$mol_assert_equal( bytes.length, again.length )
			$mol_assert_equal( [ ... bytes ].join(), [ ... again ].join() )

		},

		'the archive carries the module folder'( $ ) {

			const names = entries_of( $.$bog_vmap_app_export_zip_archive( module ) )
				.map( entry => entry.name )

			$mol_assert_equal(
				names.join( ' ' ),
				'bog/site/site.view.tree bog/site/index.html',
			)

		},

		'an empty list makes an empty archive'( $ ) {

			const bytes = $.$bog_vmap_app_export_zip([])

			$mol_assert_equal( bytes.length, 22 )
			$mol_assert_equal( number_at( bytes, 0, 4 ), 0x06054b50 )
			$mol_assert_equal( entries_of( bytes ).length, 0 )

		},

	})

}
