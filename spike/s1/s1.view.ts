namespace $.$$ {

	// Стартовая декларация. Поле, эхо от него ( критерий 2 ) и две отчётные
	// строки про мемоизацию ( критерий 3 ). Свойство heavy объявлено изменяемым:
	// только таким studio дописывает декоратор, plain остаётся контролем.
	//
	// Имя демо-класса намеренно продолжает путь модуля. Строковые литералы тоже
	// попадают в граф зависимостей mam, и имя вроде $vmap_demo увело бы сборку
	// искать несуществующий пак vmap.
	//
	// Провод это оператор `=` на корне: `field_value? = Field value?`. Он даёт
	// `field_value(next){ return this.Field().value(next) }` - чтение и запись
	// в одну строку, не трогая объявление узла-источника.
	//
	// Форма `title <= Field value` не работает ни в каком виде: `<=` проходит
	// через хак `upper` и регистрируется как ОБЪЯВЛЕНИЕ свойства `Field` со
	// значением `value`. Объявлен Field рядом - сборка падает на "Need an equal
	// default values", не объявлен - зелёная сборка с `Field(){ return value }`
	// и потерянным вторым звеном.
	//
	// Знак `?` обязан стоять либо на обоих концах, либо ни на одном. Иначе снова
	// зелёная сборка: без `?` слева тело ссылается на необъявленный `next` и
	// падает на любом чтении, без `?` справа запись молча проглатывается.
	const demo_tree = [
		'$bog_vmap_spike_s1_demo $mol_view',
		'\theavy? \\',
		'\tplain \\',
		'\tfield_value? = Field value?',
		'\tsub /',
		'\t\t<= Field $mol_string',
		'\t\t\thint \\Type here, Echo follows',
		'\t\t<= Echo $mol_paragraph',
		'\t\t\ttitle <= field_value',
		'\t\t<= Memo_report $mol_paragraph',
		'\t\t\ttitle <= memo_report \\',
		'\t\t<= Plain_report $mol_paragraph',
		'\t\t\ttitle <= plain_report \\',
	].join( '\n' )

	// Тело класса. Маркер с именем свойства включает декоратор, ровно как в studio.
	const demo_js = [
		'/*heavy*/',
		'heavy( next ) {',
		'\tif( next !== undefined ) return next',
		'\tthis.heavy_runs = ( this.heavy_runs || 0 ) + 1',
		"\treturn 'memoized: ' + this.field_value()",
		'}',
		'',
		'plain() {',
		'\tthis.plain_runs = ( this.plain_runs || 0 ) + 1',
		"\treturn 'plain: ' + this.field_value()",
		'}',
		'',
		'memo_report() {',
		'\tthis.heavy_runs = 0',
		'\tfor( let i = 0; i < 5; i ++ ) this.heavy()',
		"\treturn 'heavy() decorated: read 5x, body ran ' + this.heavy_runs + 'x'",
		'}',
		'',
		'plain_report() {',
		'\tthis.plain_runs = 0',
		'\tfor( let i = 0; i < 5; i ++ ) this.plain()',
		"\treturn 'plain() undecorated: read 5x, body ran ' + this.plain_runs + 'x'",
		'}',
	].join( '\n' )

	// Атрибуты рисуются по именам классов: корень даёт [bog_vmap_spike_s1_demo],
	// под-вид Echo даёт [bog_vmap_spike_s1_demo_echo].
	const demo_css = [
		'[bog_vmap_spike_s1_demo] {',
		'\tflex-direction: column;',
		'\tgap: .75rem;',
		'\tpadding: 1rem;',
		'\tbackground: var(--mol_theme_card);',
		'\tborder: 1px solid var(--mol_theme_line);',
		'\tborder-radius: .5rem;',
		'}',
		'',
		'[bog_vmap_spike_s1_demo_echo] {',
		'\tcolor: var(--mol_theme_special);',
		'\tfont-weight: bold;',
		'}',
	].join( '\n' )

	export class $bog_vmap_spike_s1 extends $.$bog_vmap_spike_s1 {

		@ $mol_mem
		source_tree( next?: string ): string {
			return next ?? demo_tree
		}

		@ $mol_mem
		source_js( next?: string ): string {
			return next ?? demo_js
		}

		@ $mol_mem
		source_css( next?: string ): string {
			return next ?? demo_css
		}

		// Текст в AST. Нормализация поднимает под-виды в свойства класса.
		@ $mol_mem
		tree(): $mol_tree2 {

			const source = this.source_tree().replace( /\n?$/, '\n' )

			return this.$.$mol_view_tree2_normalize(
				this.$.$mol_tree2_from_string( source )
			).kids[0]

		}

		class_name(): string {
			return this.tree().type
		}

		// Свойства класса после нормализации: у класса ровно один ребёнок - база,
		// а её дети и есть свойства.
		props(): readonly $mol_tree2[] {
			return this.tree().kids[0]?.kids ?? []
		}

		// Декоратор внутри new Function не написать, поэтому studio дописывает его
		// отдельным выражением после определения класса. Условие то же: свойство
		// изменяемое либо ключевое, и в теле стоит маркер с его именем.
		@ $mol_mem
		source_js_decorators(): string {

			const js = this.source_js()
			const cls = JSON.stringify( this.class_name() )
			const list = [] as string[]

			for( const prop of this.props() ) {

				const { name, key, next } = this.$.$mol_view_tree2_prop_parts( prop )
				if( !key && !next ) continue
				if( !js.includes( `/${ '*' }${ name }${ '*' }/` ) ) continue

				list.push( `( $.$mol_mem${ key ? '_key' : '' }( $[ ${ cls } ].prototype, ${ JSON.stringify( name ) } ) );` )

			}

			return list.join( '\n' )

		}

		// Порт self_code() из studio. Отличий два: строка про wire_auto из
		// родительского окна не нужна, потому что мы в том же реалме, а стили и имя
		// класса передаются данными, а не глобальными идентификаторами: в
		// производном контексте глобалей нет.
		@ $mol_mem
		self_code(): string {

			const tree = this.tree()

			const base_js = this.$.$mol_tree2_text_to_string_mapped_js(
				this.$.$mol_tree2_js_to_text(
					this.$.$mol_view_tree2_to_js(
						tree.list([ tree ])
					)
				)
			)

			const name = tree.type
			const cls = JSON.stringify( name )

			return [
				base_js,
				`$[ ${ cls } ] = class ${ name } extends $[ ${ cls } ] {`,
				this.source_js(),
				`}`,
				`;${ this.source_js_decorators() };`,
				`$.$mol_style_attach( ${ cls }, ${ JSON.stringify( this.source_css() ) } )`,
			].join( '\n' )

		}

		// Производный контекст: классы регистрируются в нём, а не в глобальном,
		// поэтому пересборка не портит хост. Цепочка прототипов ведёт к базовому
		// контексту, так что библиотека разрешается штатно.
		@ $mol_mem
		sandbox() {

			const code = this.self_code()
			const host = this.$

			const sandbox: typeof host = Object.create( host )
			Object.defineProperty( sandbox, '$', { value: sandbox, writable: true, configurable: true } )

			new Function( '$', code )( sandbox )

			return sandbox

		}

		// Экземпляр обязан возвращаться из ячейки: объект, созданный внутри неё и
		// не возвращённый, будет уничтожен при следующем пересчёте.
		@ $mol_mem
		instance(): $mol_view {

			const sandbox = this.sandbox()
			const name = this.class_name()

			const Klass = Reflect.get( sandbox, name ) as typeof $mol_view | undefined
			if( !Klass ) return this.$.$mol_fail( new Error( `Class ${ name } is not registered` ) )

			return Klass.make({ $: sandbox })

		}

		@ $mol_mem
		stage(): readonly $mol_view[] {
			return [ this.instance() ]
		}

		status(): string {
			const decorators = this.source_js_decorators().split( '\n' ).filter( Boolean ).length
			return `class ${ this.class_name() } · generated JS ${ this.self_code().length } chars · decorators applied: ${ decorators }`
		}

	}

}
