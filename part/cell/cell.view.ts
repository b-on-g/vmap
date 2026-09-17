namespace $.$$ {

	const name_ok = /^[A-Za-z_$][\w$]*$/

	export type $bog_vmap_part_cell_run = {

		readonly ran: boolean

		readonly value: unknown
		readonly spent: number
		readonly error: string

	}

	export class $bog_vmap_part_cell extends $.$bog_vmap_part_cell {

		@ $mol_mem
		code_ran( next?: string ) {
			return next ?? ''
		}

		@ $mol_action
		override run( next?: Event | null ) {
			this.code_ran( this.code() )
			return null
		}

		ins(): readonly unknown[] {
			return [ this.in1(), this.in2(), this.in3(), this.in4(), this.in5(), this.in6() ]
		}

		ins_named() {
			return this.names().split( ',' ).map( name => name.trim() )
		}

		body_call( code: string ) {

			const args = [ '$' ]
			const vals = [ this.$ ] as unknown[]

			const ins = this.ins()

			const take = ( name: string, value: unknown )=> {
				if( !name_ok.test( name ) || args.includes( name ) ) return
				args.push( name )
				vals.push( value )
			}

			ins.forEach( ( value, at )=> take( `in${ at + 1 }`, value ) )
			this.ins_named().forEach( ( name, at )=> take( name, ins[ at ] ?? null ) )

			take( 'ins', ins )

			return new Function( ... args, code )( ... vals )
		}

		@ $mol_mem
		run_result(): $bog_vmap_part_cell_run {

			const code = this.auto() ? this.code() : this.code_ran()

			if( !code.trim() ) return { ran: false, value: null, spent: 0, error: '' }

			const started = Date.now()

			try {
				const value = this.body_call( code )
				return { ran: true, value, spent: Date.now() - started, error: '' }
			} catch( error: unknown ) {
				if( $mol_promise_like( error ) ) return $mol_fail_hidden( error )
				return {
					ran: true,
					value: null,
					spent: Date.now() - started,
					error: String( ( error as Error ).message ?? error ),
				}
			}

		}

		override result_text() {

			const value = this.run_result().value

			if( value === null || value === undefined ) return ''
			if( typeof value === 'object' ) return JSON.stringify( value, null, '\t' )

			return String( value )
		}

		override result_number() {
			const value = this.run_result().value
			return typeof value === 'number' ? value : Number.NaN
		}

		override spent() {
			const run = this.run_result()
			return run.ran ? `${ run.spent } мс` : ''
		}

		override error() {
			return this.run_result().error
		}

	}

}
