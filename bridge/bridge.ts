namespace $ {

	/**
	 * Wire protocol between the vmap host and its sandboxed scene.
	 *
	 * The scene lives in an opaque origin, so `postMessage` is the only channel.
	 * Everything here is plain data: it must survive a structured clone.
	 *
	 * Direction is part of the type on purpose. The host owns the document text,
	 * the camera and the geometry; the scene only compiles, renders and measures.
	 * @see ../ARCHITECTURE.md section 4
	 */
	export const $bog_vmap_bridge_ns = 'bog_vmap'

	export type $bog_vmap_bridge_camera = {

		/** World coordinate under the left edge of the viewport. */
		readonly x: number

		/** World coordinate under the top edge of the viewport. */
		readonly y: number

		/** Isotropic zoom, as in Figma. Never per-axis. */
		readonly zoom: number

	}

	export type $bog_vmap_bridge_rect = {
		readonly x: number
		readonly y: number
		readonly width: number
		readonly height: number
	}

	/**
	 * One component of a land library: the three sources a class is built from.
	 * Texts and nothing else, the scene has no way to reach the land itself.
	 */
	export type $bog_vmap_bridge_part = {
		readonly tree: string
		readonly js: string
		readonly css: string
	}

	/** Modifier keys of a relayed click. Named as `MouseEventInit` names them, so they spread straight into one. */
	export type $bog_vmap_bridge_mods = {
		readonly altKey: boolean
		readonly ctrlKey: boolean
		readonly metaKey: boolean
		readonly shiftKey: boolean
	}

	/**
	 * Host to scene.
	 *
	 * `doc_set` carries the whole document, not a patch: the scene holds no
	 * source of truth of its own and must never have to merge.
	 */
	export type $bog_vmap_bridge_down =

		| {
			readonly kind: 'doc_set'

			/**
			 * Full document source in view.tree.
			 *
			 * Declaration order is NOT guaranteed: sorting is the scene's job,
			 * because only the scene knows the whole set of classes going into
			 * one `new Function` — the document's own plus everything its
			 * libraries contribute.
			 */
			readonly src: string

			/**
			 * Bodies of the document classes, as JS source.
			 *
			 * A component is built from three sources, and this is the second.
			 * Without it every property stays undecorated, and an undecorated
			 * property is invisible to the hot swap of stage 4.
			 * Keyed by class name; a class with no handwritten body is absent.
			 */
			readonly js: { readonly [ klass: string ]: string }

			/** Name of the root class to instantiate. */
			readonly root: string
		}

		| {
			readonly kind: 'css_set'
			/** Styles travel apart from the source so that a CSS edit keeps live state. */
			readonly css: string
		}

		| {
			readonly kind: 'camera_set'
			readonly camera: $bog_vmap_bridge_camera
		}

		| {
			/**
			 * Where free details sit on the canvas, in world coordinates.
			 *
			 * A channel of its own, apart from `css_set`, and that is the whole
			 * point: the scene hangs these as its own style element, so the
			 * document's styles never carry them and the export cannot see them
			 * even by accident. Placement is editor state, not site content.
			 *
			 * Scaffolding until artboards (stage 6): inside an artboard layout is
			 * a plain $mol flex tree, and only free details lie by coordinates.
			 * The "everything absolute" model was considered and rejected.
			 */
			readonly kind: 'spots_set'
			readonly spots: { readonly [ node: string ]: { readonly x: number, readonly y: number } }
		}

		| {
			/**
			 * A click that landed on the host overlay and is meant for the document.
			 *
			 * There are no editor modes: the overlay takes every gesture, so a plain
			 * click — press and release without movement — is relayed here, and the
			 * scene replays it on the element under the point as synthetic pointer
			 * and click events, with focus. One click therefore both picks a part
			 * on the host and presses the live component in the sandbox.
			 *
			 * World coordinates, not screen ones: the host resolves its camera the
			 * same way it does for the hit test, and the scene resolves its own,
			 * so neither side has to know the other's pixel geometry.
			 *
			 * Answered like every other push, with `sizes`: a click is the most
			 * likely thing to start a loop in document code, so a scene that takes
			 * one and says nothing back is exactly what the watchdog has to notice.
			 */
			readonly kind: 'click_at'
			readonly x: number
			readonly y: number
			readonly mods: $bog_vmap_bridge_mods
		}

		| {
			/**
			 * Are you alive.
			 *
			 * Штатный трафик уже несёт пульс: всякий толчок хоста сцена обязана
			 * подтвердить `sizes`. Слепая зона одна — код документа завис, когда его
			 * никто не толкал: живой компонент нажат настоящим событием сквозь дыру
			 * в оверлее, хосту толкать нечего, документ не менялся.
			 *
			 * Поэтому пульс идёт всегда, начиная с первого `sizes`.
			 */
			readonly kind: 'ping'
			readonly nonce: number
		}

		| {
			readonly kind: 'asset_put'
			readonly id: string
			readonly mime: string
			/** Bytes, not a blob: URL. A host blob: URL is dead in an opaque origin. */
			readonly bytes: ArrayBuffer
		}

		| {
			/**
			 * Sources of the land libraries attached to the document.
			 *
			 * On the bridge and NOT in the frame address, unlike the pack: a land
			 * arrives as text and is compiled into the same sandbox as the document,
			 * so a change of the list is a recompile, not a reload. The whole list
			 * every time, in the order the classes should be declared — the scene
			 * sorts by inheritance anyway and merges nothing.
			 *
			 * The host reads the lands, because only the host may touch the
			 * database; the scene sees strings.
			 * @see ../ARCHITECTURE.md sections 4 and 5
			 */
			readonly kind: 'libs_set'
			readonly parts: readonly $bog_vmap_bridge_part[]
		}

		| {
			/**
			 * Which wires the host wants values for: the root properties of the
			 * wires drawn on screen right now, and only those. The whole list every
			 * time; an empty list stops the flow. The host knows what is visible,
			 * the scene knows the values, so the question goes down and the answer
			 * comes up as `values`.
			 */
			readonly kind: 'values_want'
			readonly names: readonly string[]
		}

	/** Scene to host. */
	export type $bog_vmap_bridge_up =

		| { readonly kind: 'ready' }

		| {
			/** Ответ на `ping` тем же `nonce`. Живой поток, а не живой кадр. */
			readonly kind: 'pong'
			readonly nonce: number
		}

		| {
			/**
			 * Геометрия узлов, ОТРИСОВАННЫХ в этот раз, а не всех существующих.
			 *
			 * С появлением culling молчание про узел значит «не рисовался», а НЕ
			 * «узла нет». Поэтому хост обязан **мержить**, а не заменять: иначе
			 * коробки всего только что скрытого стираются, и рамка выделения,
			 * которая рисуется ровно из них, мигает на краю холста.
			 *
			 * Раз молчание больше не означает отсутствия, про отсутствие должен
			 * сказать кто-то явно — это делает удаление узла из документа.
			 */
			readonly kind: 'sizes'
			readonly sizes: { readonly [ node: string ]: $bog_vmap_bridge_rect }
		}

		| {
			/**
			 * Current values of the wires the host asked for in `values_want`,
			 * keyed by the root property of the wire, as short text. A read that
			 * throws comes back as the text of the error, so a broken wire is
			 * labelled rather than the scene taken down. Throttled by the scene.
			 */
			readonly kind: 'values'
			readonly values: { readonly [ wire: string ]: string }
		}

		| {
			readonly kind: 'asset_want'
			readonly id: string
		}

		| {
			readonly kind: 'error'

			/** Channel. The two clear independently. */
			readonly at: 'compile' | 'runtime'

			/**
			 * `null` means the channel is clear again.
			 *
			 * Errors are edge-triggered: the scene posts only on change, so a
			 * repeated identical failure stays silent. Without an explicit
			 * "clear" the host cannot tell a fixed document from a still
			 * broken one, because silence means both.
			 *
			 * Null rather than an empty string on purpose: an empty error text
			 * is a plausible bug, and it must not read as good news.
			 */
			readonly message: string | null

			/** Node the failure belongs to, when the scene can attribute it. */
			readonly node?: string
		}

	export type $bog_vmap_bridge_message = $bog_vmap_bridge_down | $bog_vmap_bridge_up

	/** Puts a message on the wire. Target is the peer window. */
	export function $bog_vmap_bridge_send< Message extends $bog_vmap_bridge_message >(
		target: { postMessage( data: unknown, origin: string ): void },
		message: Message,
	) {
		target.postMessage({ ns: $bog_vmap_bridge_ns, ... message }, '*' )
	}

	/**
	 * Takes a message off the wire, or null when it is not ours.
	 *
	 * The channel has no origin to check against, because the scene runs in an
	 * opaque origin, so anything able to reach this window can post here.
	 * Unknown shapes are dropped rather than trusted.
	 *
	 * Always pass `peer` on the host side. Without it any window that posts a
	 * `ready` can take the channel over, and the host will happily talk to it:
	 * seen for real on stage 1, where a stray debug frame stole the bridge and
	 * the host spent an hour posting into a dead window. Identity of the peer
	 * comes from `Scene().dom_node().contentWindow`, never from `event.source`.
	 *
	 * Passing the argument at all turns the check on, so a peer that is not
	 * known yet rejects every message instead of letting everything through.
	 * Omitting it entirely is the only way to opt out, and only the scene may:
	 * it has exactly one correspondent and answers into the same window.
	 */
	export function $bog_vmap_bridge_read< Message extends $bog_vmap_bridge_message >(
		event: { data?: unknown, source?: unknown },
		peer?: unknown,
	): Message | null {

		if( arguments.length > 1 && event.source !== peer ) return null

		const data = event.data
		if( !data || typeof data !== 'object' ) return null

		const record = data as { ns?: unknown, kind?: unknown }
		if( record.ns !== $bog_vmap_bridge_ns ) return null
		if( typeof record.kind !== 'string' ) return null

		return data as Message
	}

}
