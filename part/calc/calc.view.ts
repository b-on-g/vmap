namespace $.$$ {

	export class $bog_vmap_part_calc extends $.$bog_vmap_part_calc {

		@ $mol_mem
		override result() {

			const left = this.left()
			const right = this.right()

			switch( this.op() ) {
				case 'add': return left + right
				case 'sub': return left - right
				case 'mul': return left * right
				case 'div': return right === 0 ? NaN : left / right
			}

			return NaN
		}

		override result_text() {

			const result = this.result()
			if( !Number.isNaN( result ) ) return String( result )

			if( this.op() === 'div' && this.right() === 0 ) return this.zero_note()

			return this.empty_note()
		}

	}

}
