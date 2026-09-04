namespace $.$$ {

	/** Живой атом $mol_wire, лежащий собственным полем на экземпляре. */
	type Atom = $mol_wire_atom< unknown, readonly unknown[], unknown >

	/** Снимок наблюдаемого состояния стенда. */
	type Probe_state = {
		text: string
		caret: number
		focused: boolean
		counter: number
		note: string
		scroll: number
		node: Element | null
		error: string
	}

	/** Отчёт об одной пересборке. */
	type Round = {
		strategy: string
		ms_parse: number
		ms_eval: number
		ms_apply: number
		ms_sync: number
		atoms: string
		before: Probe_state
		after: Probe_state
	}

	const source_tree_default = `$bog_vmap_spike_s2_probe $mol_view
	title \\Стенд
	greeting \\Привет
	counter? 0
	step 1
	tags /
	item_note*? \\
	Item* $mol_text text <= item_note*
	sub /
		<= Head $mol_row sub /
			<= Caption $mol_text text <= caption \\
			<= Count $mol_text text <= counter_str \\
		<= Field $mol_string
			hint \\Печатай сюда
			value? <=> text? \\
		<= Echo $mol_text text <= echo \\
		<= Bump $mol_button_major
			title \\+1
			click? <=> bump? null
		<= Rows $mol_list rows <= items /
		<= Deep $mol_scroll sub /
			<= Filler $mol_text text <= filler \\
		<= Foot $mol_row sub /
			<= Note $mol_text text <= note \\
			<= Extra $mol_text text <= extra \\
`

	const source_js_default = `caption() {
	return this.greeting() + ', ' + this.title()
}

counter_str() {
	return 'счётчик: ' + this.counter()
}

echo() {
	return this.text() ? 'эхо: ' + this.text() : '( пусто )'
}

bump( event ) {
	this.counter( this.counter() + this.step() )
}

tags() {
	return [ 'alpha', 'beta', 'gamma' ]
}

items() {
	return this.tags().map( id => this.Item( id ) )
}

filler() {
	return Array.from( { length: 40 }, ( _, i ) => 'строка ' + i ).join( '\\n\\n' )
}

note() {
	return 'заметка v1'
}

extra() {
	return 'доп v1'
}
`

	const source_css_default = `[bog_vmap_spike_s2_probe] {
	flex: 1 1 auto;
	flex-direction: column;
	gap: 0.5rem;
	padding: 0.5rem;
	background: var(--mol_theme_card);
}

[bog_vmap_spike_s2_probe_deep] {
	flex: 0 0 12rem;
	max-height: 12rem;
	overflow: auto;
	background: var(--mol_theme_back);
}
`

	function plain( value: unknown ): value is string | number | boolean | null {
		if( value === null ) return true
		const type = typeof value
		return type === 'string' || type === 'number' || type === 'boolean'
	}

	function atoms_of( holder: unknown ): Atom[] {
		if( holder instanceof Map ) return [ ... holder.values() ] as Atom[]
		if( holder ) return [ holder as Atom ]
		return []
	}

	/**
	 * S2. Горячая подмена класса.
	 * Стенд сравнивает три стратегии сохранения состояния при перекомпиляции.
	 */
	export class $bog_vmap_spike_s2 extends $.$bog_vmap_spike_s2 {

		/** Песочница живёт всю сессию: имена классов перезаписываются на месте,
		 *  поэтому this.$ старого экземпляра указывает на свежие классы. */
		box_cache = null as null | $

		/** Живой экземпляр стенда. Обычное поле, а не ячейка: его нельзя терять. */
		probe = null as null | $mol_view

		/** Журнал пересборок, снизу вверх. */
		rounds = [] as Round[]

		/** Текст ошибки последней сборки. */
		fail = ''

		/** Мемоизировать ли рукописное тело класса. Выключается для демонстрации
		 *  того, что без ячейки правка свойства не доезжает до DOM. */
		mem_body = true

		/** Имена свойств рукописного тела: верхнеуровневые `имя( … ) {`. */
		body_props( js_src: string ) {
			const names = [] as string[]
			for( const hit of js_src.matchAll( /^(\w+)\s*\(/gm ) ) names.push( hit[ 1 ] )
			return names
		}

		box() {
			if( this.box_cache ) return this.box_cache
			const box = Object.create( this.$ ) as $
			Reflect.set( box, '$', box )
			return this.box_cache = box
		}

		strategy_options() {
			return {
				raw: 'raw: голый setPrototypeOf',
				swap: 'swap: прототип + ретаргет атомов',
				snap: 'snap: снимок и восстановление',
				fresh: 'fresh: заново',
			}
		}

		@ $mol_mem
		source_tree( next?: string ): string {
			if( next !== undefined ) return next
			return source_tree_default
		}

		@ $mol_mem
		source_js( next?: string ): string {
			if( next !== undefined ) return next
			return source_js_default
		}

		/** Пересборки считаются вручную, чтобы правка текста не роняла экземпляр. */
		@ $mol_mem
		generation( next?: number ): number {
			if( next !== undefined ) return next
			return 0
		}

		@ $mol_mem
		stage(): readonly $mol_view_content[] {
			this.generation()
			if( !this.probe ) this.mount()
			return this.probe ? [ this.probe ] : []
		}

		// ---------------------------------------------------------------- сборка

		/** Парсит исходники и определяет класс в песочнице. Возвращает замеры. */
		compile() {

			const tree_src = this.source_tree()
			const js_src = this.source_js()

			const t0 = performance.now()

			const ast = this.$.$mol_view_tree2_normalize(
				this.$.$mol_tree2_from_string( tree_src, 's2.view.tree' )
			)

			const classes = this.$.$mol_view_tree2_classes( ast )
			const name = classes.kids[0].type

			const declared = new Set< string >()
			const keyed = new Set< string >()
			const writable = new Set< string >()

			for( const prop of this.$.$mol_view_tree2_class_props( classes.kids[0] ) ) {
				const parts = this.$.$mol_view_tree2_prop_parts( prop )
				declared.add( parts.name )
				if( parts.key ) keyed.add( parts.name )
				if( parts.next ) writable.add( parts.name )
			}

			const js = this.$.$mol_tree2_text_to_string(
				this.$.$mol_view_tree2_to_text( ast )
			)

			const t1 = performance.now()

			const quoted = JSON.stringify( name )

			// $mol_mem в сгенерированном коде это свободная переменная: в бандле её
			// разрешает namespace, а внутри new Function приходится вносить руками.
			// Точка с запятой обязательна: сгенерированный код начинается со скобки,
			// и без неё ASI склеивает строки в вызов $( ... ).
			// Рукописное тело кладём под @$mol_mem поимённо. Без ячейки у свойства
			// нет подписчиков, и правка его кода никого не будит: горячая подмена
			// такое свойство не увидит в принципе. Декоратор в теле new Function
			// не написать, поэтому вызываем его отдельными выражениями, как studio.
			const body = this.mem_body
				? this.body_props( js_src ).map(
					n => `;$mol_mem${ keyed.has( n ) ? '_key' : '' }( $[ ${ quoted } ].prototype, ${ JSON.stringify( n ) } )`
				).join( '\n' )
				: ''

			const code = `const { $mol_mem, $mol_mem_key, $mol_style_attach } = $;\n`
				+ js
				+ `\n;$[ ${ quoted } ] = class ${ name } extends $[ ${ quoted } ] {\n`
				+ js_src
				+ `\n}\n`
				+ body
				+ `\n;$mol_style_attach( ${ quoted }, ${ JSON.stringify( source_css_default ) } )\n`

			new Function( '$', code )( this.box() )

			const klass = Reflect.get( this.box(), name )
			if( typeof klass !== 'function' ) this.$.$mol_fail( new Error( `Класс ${ name } не собрался` ) )

			const t2 = performance.now()

			return {
				name,
				klass: klass as typeof $mol_view,
				declared: declared as ReadonlySet< string >,
				keyed: keyed as ReadonlySet< string >,
				writable: writable as ReadonlySet< string >,
				ms_parse: t1 - t0,
				ms_eval: t2 - t1,
			}
		}

		/** Первичная сборка: класса ещё нет, экземпляра тоже. */
		mount() {
			try {
				const build = this.compile()
				this.probe = build.klass.make( { $: this.box() } )
				this.fail = ''
			} catch( error ) {
				if( this.$.$mol_promise_like( error ) ) $mol_fail_hidden( error )
				this.fail = String( error )
			}
		}

		// ------------------------------------------------------------ стратегии

		/**
		 * Стратегия 1a. Голая подмена прототипа, больше ничего.
		 * Состояние цело, но уже созданные атомы держат СТАРУЮ реализацию:
		 * $mol_wire_fiber запоминает task в конструкторе.
		 */
		apply_raw( klass: typeof $mol_view ) {
			Object.setPrototypeOf( this.probe!, klass.prototype )
			return 'прототип подменён, атомы не тронуты'
		}

		/**
		 * Стратегия 1b. Подмена прототипа с ретаргетом атомов.
		 * Атом лежит собственным полем `имя()` на экземпляре и хранит ссылку на
		 * реализацию. Перенаправляем её на новую и пересчитываем только те
		 * свойства, у которых изменился текст функции.
		 */
		apply_swap(
			klass: typeof $mol_view,
			declared: ReadonlySet< string >,
			keyed: ReadonlySet< string >,
		) {

			const inst = this.probe!
			Object.setPrototypeOf( inst, klass.prototype )

			const stale = [] as Atom[]
			let kept = 0
			let moved = 0
			let dropped = 0

			for( const field of Object.getOwnPropertyNames( inst ) ) {

				if( !field.endsWith( '()' ) ) continue

				// имя атома нормализовано декоратором и может нести хвостовой пробел
				const name = field.slice( 0, -2 ).trim()
				const holder = Reflect.get( inst, field )
				const atoms = atoms_of( holder )
				if( atoms.length === 0 ) continue

				const wrapper = Reflect.get( inst, name )
				const task_next = typeof wrapper === 'function' ? Reflect.get( wrapper, 'orig' ) : null
				const decorated = typeof task_next === 'function'

				const shape_was = holder instanceof Map
				const shape_now = keyed.has( name )

				// свойство пропало из класса, перестало быть мемоизированным
				// или сменило форму сигнатуры solo <-> keyed
				const broken = declared.has( name )
					? ( !decorated || shape_was !== shape_now )
					: !decorated && !( name in inst )

				if( broken ) {
					// destructor() только отцепляет подписчиков, но не помечает их
					// протухшими, поэтому будим их вручную перед сносом.
					for( const atom of atoms ) {
						atom.emit()
						atom.destructor()
					}
					Reflect.deleteProperty( inst, field )
					dropped += atoms.length
					continue
				}

				if( !decorated ) {
					kept += atoms.length
					continue
				}

				for( const atom of atoms ) {
					const task_prev = atom.task
					if( task_prev === task_next ) {
						kept ++
						continue
					}
					Reflect.set( atom, 'task', task_next )
					moved ++
					if( String( task_prev ) !== String( task_next ) ) stale.push( atom )
				}

			}

			for( const atom of stale ) atom.refresh()

			return `сохранено ${ kept }, перенаправлено ${ moved }, пересчитано ${ stale.length }, уничтожено ${ dropped }`
		}

		/**
		 * Стратегия 2. Снимок записываемых свойств, новый экземпляр, заливка назад.
		 * Снимаем только материализованные атомы и только скалярные значения:
		 * подвид или массив видов обратно записать нельзя.
		 */
		apply_snap(
			klass: typeof $mol_view,
			writable: ReadonlySet< string >,
			keyed: ReadonlySet< string >,
		) {

			const prev = this.probe!
			const shot = [] as { name: string, key: unknown, value: unknown }[]
			let skipped = 0

			// Поле атома это НЕ просто `имя()`: декоратор наследует имя от базы и
			// оставляет хвостовой пробел, если базовый класс уже был декорирован.
			// Поэтому идём по собственным полям экземпляра, а не по именам свойств.
			for( const field of Object.getOwnPropertyNames( prev ) ) {

				if( !field.endsWith( '()' ) ) continue

				const name = field.slice( 0, -2 ).trim()
				if( !writable.has( name ) ) continue

				const atoms = atoms_of( Reflect.get( prev, field ) )

				for( const atom of atoms ) {
					const value = atom.result()
					if( !plain( value ) ) {
						skipped ++
						continue
					}
					shot.push( {
						name,
						key: keyed.has( name ) ? atom.args[ 0 ] : undefined,
						value,
					} )
				}

			}

			const next = klass.make( { $: this.box() } )
			let restored = 0
			let failed = 0

			for( const item of shot ) {
				const method = Reflect.get( next, item.name )
				if( typeof method !== 'function' ) {
					failed ++
					continue
				}
				try {
					Reflect.apply(
						method,
						next,
						item.key === undefined ? [ item.value ] : [ item.key, item.value ],
					)
					restored ++
				} catch( error ) {
					if( this.$.$mol_promise_like( error ) ) $mol_fail_hidden( error )
					failed ++
				}
			}

			prev.destructor()
			this.probe = next

			return `снято ${ shot.length }, восстановлено ${ restored }, не влезло ${ skipped }, отказ ${ failed }`
		}

		/** Стратегия 3. Экземпляр начисто, состояние теряется полностью. */
		apply_fresh( klass: typeof $mol_view ) {
			this.probe!.destructor()
			this.probe = klass.make( { $: this.box() } )
			return 'экземпляр создан заново'
		}

		// -------------------------------------------------------------- измерения

		dom_of( host: unknown ): Element | null {
			if( !host || typeof host !== 'object' ) return null
			const method = Reflect.get( host, 'dom_node' )
			if( typeof method !== 'function' ) return null
			const node = Reflect.apply( method, host, [] )
			return node instanceof Element ? node : null
		}

		read( name: string, ... args: unknown[] ) {
			const inst = this.probe
			if( !inst ) return undefined
			const method = Reflect.get( inst, name )
			if( typeof method !== 'function' ) return undefined
			return Reflect.apply( method, inst, args )
		}

		observe(): Probe_state {

			const empty: Probe_state = {
				text: '', caret: -1, focused: false, counter: NaN,
				note: '', scroll: -1, node: null, error: '',
			}

			if( !this.probe ) return empty

			const node = this.dom_of( this.probe )
			const field = node ? node.querySelector( 'input' ) : null
			const deep = this.dom_of( this.read( 'Deep' ) )

			const state = {
				... empty,
				node,
				caret: field ? ( field.selectionStart ?? -1 ) : -1,
				focused: !!field && this.$.$mol_dom_context.document.activeElement === field,
				scroll: deep ? deep.scrollTop : -1,
			}

			try {
				state.text = String( this.read( 'text' ) ?? '' )
				state.counter = Number( this.read( 'counter' ) ?? NaN )
				state.note = String( this.read( 'item_note', 'alpha' ) ?? '' )
			} catch( error ) {
				if( this.$.$mol_promise_like( error ) ) $mol_fail_hidden( error )
				state.error = String( error instanceof Error ? error.message : error )
			}

			return state
		}

		// -------------------------------------------------------------- действия

		@ $mol_action
		recompile( event?: Event ) {
			this.round()
		}

		round() {

			if( !this.probe ) {
				this.mount()
				return
			}

			const strategy = this.strategy()
			const before = this.observe()

			let atoms = ''
			let ms_parse = NaN
			let ms_eval = NaN
			let ms_apply = NaN
			let ms_sync = NaN

			try {

				const build = this.compile()
				ms_parse = build.ms_parse
				ms_eval = build.ms_eval

				const t0 = performance.now()

				if( strategy === 'raw' ) atoms = this.apply_raw( build.klass )
				else if( strategy === 'swap' ) atoms = this.apply_swap( build.klass, build.declared, build.keyed )
				else if( strategy === 'snap' ) atoms = this.apply_snap( build.klass, build.writable, build.keyed )
				else atoms = this.apply_fresh( build.klass )

				ms_apply = performance.now() - t0
				this.fail = ''

			} catch( error ) {
				if( this.$.$mol_promise_like( error ) ) $mol_fail_hidden( error )
				this.fail = String( error )
				atoms = 'сборка упала'
			}

			this.generation( this.generation() + 1 )

			const t1 = performance.now()
			try {
				this.$.$mol_wire_fiber.sync()
			} catch( error ) {
				if( this.$.$mol_promise_like( error ) ) $mol_fail_hidden( error )
			}
			ms_sync = performance.now() - t1

			const after = this.observe()

			this.rounds = [
				{ strategy, ms_parse, ms_eval, ms_apply, ms_sync, atoms, before, after },
				... this.rounds,
			].slice( 0, 12 )

			// второй раз: журнал заполнен только сейчас, а report() читает его
			this.generation( this.generation() + 1 )

		}

		@ $mol_action
		bench( event?: Event ) {

			const base = this.source_js()
			const times = [] as number[]

			for( let i = 0; i < 20; ++i ) {
				this.source_js( base.replace( /'заметка v\d+'/, `'заметка v${ i + 2 }'` ) )
				const t0 = performance.now()
				this.round()
				times.push( performance.now() - t0 )
			}

			times.sort( ( a, b ) => a - b )
			const sum = times.reduce( ( a, b ) => a + b, 0 )

			this.fail = `бенч ×20 (${ this.strategy() }): min ${ times[ 0 ].toFixed( 1 ) }, med ${ times[ 10 ].toFixed( 1 ) }, max ${ times[ 19 ].toFixed( 1 ) }, avg ${ ( sum / 20 ).toFixed( 1 ) } мс`

		}

		@ $mol_action
		reset( event?: Event ) {
			if( this.probe ) this.probe.destructor()
			this.probe = null
			this.rounds = []
			this.fail = ''
			this.source_tree( source_tree_default )
			this.source_js( source_js_default )
			this.generation( this.generation() + 1 )
		}

		@ $mol_action
		break_touch( event?: Event ) {
			const src = this.source_js()
			const hit = /'заметка v(\d+)'/.exec( src )
			const num = hit ? Number( hit[ 1 ] ) + 1 : 2
			this.source_js( src.replace( /'заметка v\d+'/, `'заметка v${ num }'` ) )
			this.round()
		}

		@ $mol_action
		break_key( event?: Event ) {
			this.source_tree( this.source_tree().replace( 'counter? 0', 'counter*? 0' ) )
			this.source_js( this.source_js().replace( 'this.counter() + this.step()', 'this.counter( 0 ) + this.step()' ) )
			this.round()
		}

		@ $mol_action
		break_drop( event?: Event ) {
			this.source_tree(
				this.source_tree().replace( /\n\t\t\t<= Extra \$mol_text text <= extra \\\\?\n/, '\n' )
			)
			this.source_js( this.source_js().replace( /extra\(\) \{[^}]*\}\n/, '' ) )
			this.round()
		}

		@ $mol_action
		break_base( event?: Event ) {
			this.source_tree( this.source_tree().replace( '_probe $mol_view', '_probe $mol_scroll' ) )
			this.round()
		}

		// ---------------------------------------------------------------- отчёт

		@ $mol_mem
		report(): string {

			this.generation()

			const lines = [] as string[]

			if( this.fail ) lines.push( '**' + this.fail + '**', '' )

			const flow = ( was: unknown, now: unknown ) => `${ was === '' ? '∅' : was } → ${ now === '' ? '∅' : now }`

			for( const round of this.rounds ) {

				const a = round.after
				const b = round.before

				lines.push(
					`**${ round.strategy }** · parse ${ round.ms_parse.toFixed( 1 ) }`
					+ ` · eval ${ round.ms_eval.toFixed( 1 ) }`
					+ ` · apply ${ round.ms_apply.toFixed( 1 ) }`
					+ ` · sync ${ round.ms_sync.toFixed( 1 ) } мс`
				)
				lines.push(
					`текст ${ flow( b.text, a.text ) }`
					+ ` · каретка ${ flow( b.caret, a.caret ) }`
					+ ` · фокус ${ flow( b.focused ? '+' : '−', a.focused ? '+' : '−' ) }`
				)
				lines.push(
					`счётчик ${ flow( b.counter, a.counter ) }`
					+ ` · заметка ${ flow( b.note, a.note ) }`
					+ ` · скролл ${ flow( b.scroll, a.scroll ) }`
					+ ` · узел ${ a.node === b.node && a.node ? 'тот же' : 'новый' }`
				)
				lines.push( round.atoms )
				if( a.error || b.error ) lines.push( 'ошибка: ' + ( a.error || b.error ) )
				lines.push( '' )

			}

			return lines.join( '\n' )
		}

	}

}
