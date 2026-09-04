// S4 probe. Loaded into `a.html`, `b.html` or the shipping scene page itself
// with a `<script src>`; everything it needs is on `window.S4`.
//
// The scene page, opened at the top level, is its own `parent`, and `parent` is
// exactly the peer the scene's bridge answers to. So `window.postMessage` here
// is indistinguishable from the host talking through an iframe, and no scene
// code has to be touched to measure it.
;( function () {

	const S4 = window.S4 = window.S4 || {}

	S4.pack = 'https://mol.hyoo.ru'

	S4.send = message => window.postMessage( { ns: 'bog_vmap', ... message }, '*' )

	S4.errors = []
	window.addEventListener( 'message', event => {
		const data = event.data
		if( data && data.ns === 'bog_vmap' && data.kind === 'error' ) {
			S4.errors.push( data.at + ': ' + data.message )
		}
	} )

	S4.wait = ms => new Promise( done => setTimeout( done, ms ) )

	// Everything a second bundle can overwrite. Identity before and after the
	// load is the whole measurement: a kept identity means one copy, a new one
	// means the old objects are now talking to a stranger.
	S4.snap = () => ( {
		view: window.$mol_view,
		object2: window.$mol_object2,
		fiber: window.$mol_wire_fiber,
		atom: window.$mol_wire_atom,
		planning: window.$mol_wire_fiber.planning,
		owning: window.$mol_owning_map,
		ambient: window.$mol_ambient_ref,
		auto: window.$mol_wire_auto,
		mem: window.$mol_mem,
		after_tick: window.$mol_after_tick,
	} )

	S4.scene = () => window.$bog_vmap_scene.Root( 0 )
	S4.stage = () => document.querySelector( '[bog_vmap_scene_stage]' )

	// Names are glued, never written whole: mam parses string literals too, and
	// a literal `$mol_string` in a file of this pack would drag the module into
	// the dependency graph — which is the very thing being measured here.
	const N = name => '$' + name

	S4.doc_plain_root = N( 'bog_vmap_spike_s4_demo' )
	S4.doc_plain = [
		S4.doc_plain_root + ' ' + N( 'mol_view' ),
		'\tnote \\plain doc, needs nothing but the view class',
		'\tsub /',
		'\t\t<= Note ' + N( 'mol_view' ),
		'\t\t\tsub / <= note',
	].join( '\n' )

	S4.doc_rich_root = N( 'bog_vmap_spike_s4_rich' )
	S4.doc_rich = [
		S4.doc_rich_root + ' ' + N( 'mol_view' ),
		'\tsub /',
		'\t\t<= Field ' + N( 'mol_string' ),
		'\t\t\thint \\type me',
		'\t\t\tvalue? <=> echo? \\',
		'\t\t<= Echo ' + N( 'mol_view' ),
		'\t\t\tsub / <= echo',
		'\t\t<= Press ' + N( 'mol_button_minor' ),
		'\t\t\ttitle \\Press me',
		'\t\t\tclick? <=> beat? null',
	].join( '\n' )

	S4.pack_load = () => new Promise( ( done, fail ) => {
		const el = document.createElement( 'script' )
		el.src = new URL( 'web.js', S4.pack ).toString()
		el.charset = 'utf-8'
		el.onload = done
		el.onerror = fail
		document.head.appendChild( el )
	} )

	/** Message → cell → render → DOM, on the scene's own state. */
	S4.scene_reactive = async zoom => {
		const before = S4.stage()?.style.transform
		S4.send( { kind: 'camera_set', camera: { x: 10, y: 20, zoom } } )
		await S4.wait( 400 )
		return { before, after: S4.stage()?.style.transform }
	}

	S4.doc_set = async ( which ) => {
		const root = which === 'rich' ? S4.doc_rich_root : S4.doc_plain_root
		const src = which === 'rich' ? S4.doc_rich : S4.doc_plain
		S4.send( { kind: 'doc_set', root, src, js: {} } )
		await S4.wait( 700 )
		return S4.state()
	}

	S4.state = () => {
		const stage = S4.stage()
		const scene = S4.scene()
		let inst = null
		try { inst = scene.instance() } catch ( error ) { return { instance_error: String( error ) } }
		return {
			compile_error: scene.compile_error,
			errors: S4.errors.slice( -4 ),
			instance: inst && inst.constructor.name,
			// The whole story of variant A lives in this pair.
			instance_of_global_view: inst instanceof window.$mol_view,
			mounted: stage ? [ ... stage.querySelectorAll( '*' ) ].map( n => n.tagName.toLowerCase() ) : null,
			stage_text: stage && stage.textContent.slice( 0, 120 ),
		}
	}

	/** Mounts by DOM node instead of by `sub()`, the proposed scene fix. */
	S4.mount_by_node = () => {
		const el = S4.scene().instance().dom_tree()
		const stage = S4.stage()
		stage.textContent = ''
		stage.appendChild( el )
		return [ ... stage.querySelectorAll( '*' ) ].map( n => n.tagName.toLowerCase() )
	}

	/** Does the rendered document actually take input and clicks. */
	S4.interact = async () => {
		const inst = S4.scene().instance()
		const stage = S4.stage()
		const input = stage.querySelector( 'input' )
		const button = stage.querySelector( 'mol_button_minor' )
		const out = { echo_before: inst.echo(), beat_before: String( inst.beat() ) }
		input.focus()
		input.value = 'hello pack'
		input.dispatchEvent( new Event( 'input', { bubbles: true } ) )
		await S4.wait( 300 )
		out.echo_after = inst.echo()
		out.echo_rendered = stage.querySelector( 'mol_view' )?.textContent
		button.dispatchEvent( new MouseEvent( 'click', { bubbles: true, cancelable: true } ) )
		await S4.wait( 300 )
		out.beat_after = String( inst.beat()?.type )
		out.focus_kept = document.activeElement === input
		out.caret = input.selectionStart
		return out
	}

} )()
