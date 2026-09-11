namespace $ {

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

	/** Texts and nothing else: the scene has no way to reach the land itself. */
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

	export type $bog_vmap_bridge_down =

		| {
			readonly kind: 'doc_set'

			readonly src: string

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
			readonly kind: 'spots_set'
			readonly spots: { readonly [ node: string ]: { readonly x: number, readonly y: number } }
		}

		| {
			readonly kind: 'click_at'
			readonly x: number
			readonly y: number
			readonly mods: $bog_vmap_bridge_mods
		}

		| {
			readonly kind: 'ping'
			readonly nonce: number
		}

		| {
			readonly kind: 'libs_set'
			readonly parts: readonly $bog_vmap_bridge_part[]
		}

		| {
			readonly kind: 'pack_set'
			readonly uri: string
		}

		| {
			readonly kind: 'values_want'

			/** Either a property of the root class, or `Part.port` of a part of it. */
			readonly names: readonly string[]
		}

	/** Scene to host. */
	export type $bog_vmap_bridge_up =

		| { readonly kind: 'ready' }

		| {
			/** Answers `ping` with the same nonce: a live thread, not a live frame. */
			readonly kind: 'pong'
			readonly nonce: number
		}

		| {
			readonly kind: 'sizes'
			readonly sizes: { readonly [ node: string ]: $bog_vmap_bridge_rect }
		}

		| {
			readonly kind: 'values'

			/** One line per value; a table comes as rows split by newline and cells by tab, the first row naming the columns. */
			readonly values: { readonly [ name: string ]: string }
		}

		| {
			readonly kind: 'key'
			readonly key: 'Escape'
		}

		| {
			readonly kind: 'error'

			/** Channel. The two clear independently. */
			readonly at: 'compile' | 'runtime'

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
