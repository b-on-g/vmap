namespace $.$$ {

	const hints: { readonly [ kind: string ]: string } = {
		left: 'По левому краю',
		center_x: 'По центру, по горизонтали',
		right: 'По правому краю',
		top: 'По верхнему краю',
		center_y: 'По центру, по вертикали',
		bottom: 'По нижнему краю',
		spread_x: 'Разложить равномерно по горизонтали',
		spread_y: 'Разложить равномерно по вертикали',
	}

	export class $bog_vmap_app_align extends $.$bog_vmap_app_align {

		kinds() {
			return Object.keys( hints )
		}

		buttons() {
			return this.kinds().map( kind => this.Button( kind ) )
		}

		override rows() {
			return [
				this.Bar(),
				... this.note() ? [ this.Note() ] : [],
			] as readonly $mol_view[]
		}

		override button_hint( kind: string ) {
			return hints[ kind ] ?? kind
		}

		override Icon( kind: string ) {
			switch( kind ) {
				case 'center_x': return this.Icon_center_x()
				case 'right': return this.Icon_right()
				case 'top': return this.Icon_top()
				case 'center_y': return this.Icon_center_y()
				case 'bottom': return this.Icon_bottom()
				case 'spread_x': return this.Icon_spread_x()
				case 'spread_y': return this.Icon_spread_y()
				default: return this.Icon_left()
			}
		}

	}

}
