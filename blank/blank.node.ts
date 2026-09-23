namespace $ {

	/** Выражение готовности редактора: сцена прогрета и документ выбран. */
	export function $bog_vmap_blank_ready() {
		const d = '$'
		const app = `$[ ${ JSON.stringify( d + 'bog_vmap_app' ) } ].Root( 0 )`
		return `typeof $ !== 'undefined' && ${ app }.Pane().warmed() && ${ app }.doc_key() !== ''`
	}

	/** Скрипт для страницы: завести свежую сцену и снять все прочие из списка. */
	export function $bog_vmap_blank_script() {
		return `
			const app = [ ... $.$mol_view.roots() ].find( view => view instanceof $.$$.$bog_vmap_app )
			const store = app.store()

			const links = ()=> $.$mol_wire_async( ()=> store.doc_links().map( link => link.str ) )()

			const old = await links()

			const doc = await $.$mol_wire_async( store ).doc_add( 'Проба' )
			const kept = doc.link().str

			for( const link of await links() ) {
				if( link === kept ) continue
				await $.$mol_wire_async( store ).doc_drop( $.$giper_baza_link.check( link ) )
			}

			const titles = await $.$mol_wire_async( ()=> store.doc_links().map( link => store.doc( link ).title() ) )()

			return { было: old.length, осталось: titles }
		`
	}

	/** Гейт начинает с чистой сцены, а не с чужого документа. */
	export async function $bog_vmap_blank( browser: $bog_probe_browser, uri: string, at: string ) {

		const cut = await browser.evaluate( $bog_vmap_blank_script(), 60000 ) as { было: number, осталось: string[] }

		if( cut.осталось.length !== 1 ) $mol_fail( new Error(
			`${ at } ждали одну пустую сцену, из ${ cut.было } осталось ${ cut.осталось.length }: ${ JSON.stringify( cut.осталось ) }`
		) )

		await browser.open_page( uri, $bog_vmap_blank_ready(), 150000 )

		const left = await browser.evaluate( `
			const app = [ ... $.$mol_view.roots() ].find( view => view instanceof $.$$.$bog_vmap_app )
			const root = app.doc_root()
			return {
				сцена: app.store().doc_current()?.title() ?? '',
				корень: root,
				узлы: app.node().part_names(),
				размеры: Object.keys( app.Pane().sizes() ).filter( key => key !== root ),
			}
		`, 60000 ) as { сцена: string, корень: string, узлы: string[], размеры: string[] }

		const few = ( list: string[] )=> `${ list.length }${ list.length ? ' (' + list.slice( 0, 5 ).join( ', ' ) + ( list.length > 5 ? ', …' : '' ) + ')' : '' }`

		if( left.узлы.length || left.размеры.length ) $mol_fail( new Error(
			`${ at } ждали пустую сцену, получили «${ left.сцена }» с корнем ${ left.корень }:`
			+ ` деталей ${ few( left.узлы ) }, измеренных узлов ${ few( left.размеры ) }`
		) )

	}

}
