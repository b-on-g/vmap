namespace $.$$ {

	/** What one run of the code left behind. */
	export type $bog_vmap_part_cell_run = {

		/** Whether there was a run at all: an empty cell has not run, and 0 ms has. */
		readonly ran: boolean

		readonly value: unknown
		readonly spent: number
		readonly error: string

	}

	/**
	 * The code runs inside the sandbox and nowhere else — this class is compiled
	 * into it like any other part of the pack — so it is exactly as trusted as the
	 * document around it and no more.
	 *
	 * @see ../../ARCHITECTURE.md sections 3 and 4
	 */
	export class $bog_vmap_part_cell extends $.$bog_vmap_part_cell {

		/**
		 * The manual mode is this cell and the reactive mode is `code()` itself, so
		 * the difference between the two is which text the run depends on and
		 * nothing else. No timer, no flag outside the graph, no re-entry.
		 */
		@ $mol_mem
		code_ran( next?: string ) {
			return next ?? ''
		}

		@ $mol_action
		override run( next?: Event | null ) {
			this.code_ran( this.code() )
			return null
		}

		/**
		 * What the run returned, what it cost and what it complained about, as ONE
		 * value. One and not three cells, because a cell may not write into its
		 * neighbours: three cells would mean a computation writing twice on the
		 * side, which is an invalidation loop dressed as bookkeeping. The three
		 * readings below take this apart, and a reader of the time is not woken by
		 * a value that happens to be equal.
		 */
		@ $mol_mem
		run_result(): $bog_vmap_part_cell_run {

			const code = this.auto() ? this.code() : this.code_ran()

			if( !code.trim() ) return { ran: false, value: null, spent: 0, error: '' }

			const started = Date.now()

			try {
				const value = new Function( '$', code )( this.$ )
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

		/**
		 * The answer as text. An object comes out as JSON, because a cell that
		 * answers `[object Object]` tells its author nothing about what it made.
		 */
		override result_text() {

			const value = this.run_result().value

			if( value === null || value === undefined ) return ''
			if( typeof value === 'object' ) return JSON.stringify( value, null, '\t' )

			return String( value )
		}

		/** The answer as a number, `NaN` when it is not one. */
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
