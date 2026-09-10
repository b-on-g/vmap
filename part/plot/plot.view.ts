namespace $.$$ {

	/**
	 * The receiver of a board — a code cell counts something, the wire carries the
	 * numbers here, the line moves. That is the shape the whole idea of wiring is
	 * for, and it is the one thing the stock chart cannot be given directly.
	 */
	export class $bog_vmap_part_plot extends $.$bog_vmap_part_plot {

		/**
		 * Derived and not a port of its own. A chart fed from a wire has a series of
		 * numbers and no second series to pair it with; asking for one would mean
		 * two wires to draw one line, and the second would exist only to count from
		 * zero.
		 */
		override series_x() {
			return this.values().map( ( _, i )=> i )
		}

	}

}
