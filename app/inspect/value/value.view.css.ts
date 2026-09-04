namespace $.$$ {

	$mol_style_define( $bog_vmap_app_inspect_value, {
		flex: { direction: 'column', grow: 1, shrink: 1 },
		minWidth: 0,

		/**
		 * The reason an edit was refused, under the field that refused it. Rendered
		 * only while there is one, so the row does not carry an empty strip: an
		 * inspector is two dozen rows tall and a reserved line in each of them
		 * doubles its height for nothing.
		 */
		Alarm: {
			padding: { top: '.15rem', left: '.4rem', right: '.4rem' },
			color: $mol_theme.focus,
			font: { size: '.7rem' },
		},
	} )

	/**
	 * A text area sized by its content instead of by the browser default of two
	 * rows: in a property list a one line value has to take one line.
	 */
	$mol_style_define( $bog_vmap_app_inspect_value_area, {
		flex: { grow: 1 },
		minWidth: 0,
		minHeight: '1.5rem',
		padding: { top: '.2rem', bottom: '.2rem', left: '.4rem', right: '.4rem' },
		background: { color: $mol_theme.field },
		font: { family: 'monospace', size: '.8rem' },
		resize: 'vertical',
	} )

	$mol_style_define( $bog_vmap_app_inspect_value_string, {
		flex: { direction: 'row', grow: 1 },
		align: { items: 'flex-start' },
		gap: '.25rem',
		minWidth: 0,

		Locale: {
			flex: { shrink: 0 },
			minHeight: '1.5rem',
			minWidth: '1.5rem',
			padding: { top: 0, bottom: 0, left: '.3rem', right: '.3rem' },
			font: { family: 'monospace', size: '.8rem' },
		},
	} )

	$mol_style_define( $bog_vmap_app_inspect_value_number, {
		flex: { direction: 'row', grow: 1 },
		minWidth: 0,

		Num: {
			flex: { grow: 1 },
			minWidth: 0,
			minHeight: '1.5rem',
			padding: { top: '.2rem', bottom: '.2rem', left: '.4rem', right: '.4rem' },
			background: { color: $mol_theme.field },
			font: { family: 'monospace', size: '.8rem' },
		},
	} )

	$mol_style_define( $bog_vmap_app_inspect_value_bool, {
		flex: { direction: 'row', grow: 1 },

		Flag: {
			minHeight: '1.5rem',
			padding: { top: 0, bottom: 0, left: '.4rem', right: '.4rem' },
			font: { family: 'monospace', size: '.8rem' },
		},
	} )

	/**
	 * A shape with no editor. Dimmed, because the point of the colour is to say
	 * that this one is shown and not offered for editing.
	 */
	$mol_style_define( $bog_vmap_app_inspect_value_raw, {
		flex: { direction: 'row', grow: 1 },
		align: { items: 'center' },
		minHeight: '1.5rem',
		padding: { top: '.2rem', bottom: '.2rem', left: '.4rem', right: '.4rem' },
		color: $mol_theme.shade,
		font: { family: 'monospace', size: '.8rem' },
		whiteSpace: 'pre',
		overflow: 'auto',
	} )

	$mol_style_define( $bog_vmap_app_inspect_value_seq, {
		flex: { direction: 'column', grow: 1 },
		align: { items: 'flex-start' },
		gap: '.15rem',
		minWidth: 0,

		Class_name: {
			flex: { grow: 1 },
			alignSelf: 'stretch',
			minWidth: 0,
			minHeight: '1.5rem',
			padding: { top: '.2rem', bottom: '.2rem', left: '.4rem', right: '.4rem' },
			background: { color: $mol_theme.field },
			color: $mol_theme.current,
			font: { family: 'monospace', size: '.8rem', weight: 'bold' },
		},

		Items: {
			flex: { direction: 'column', grow: 1 },
			alignSelf: 'stretch',
			gap: '.15rem',
			minWidth: 0,
			// The step that makes nesting readable: without it a list inside a
			// dictionary inside an object is a flat wall of fields.
			padding: { left: '.6rem' },
			border: { left: { width: '1px', style: 'solid', color: $mol_theme.line } },
		},

		Add: {
			flex: { shrink: 0 },
			minHeight: '1.25rem',
			padding: { top: 0, bottom: 0, left: '.4rem', right: '.4rem' },
			color: $mol_theme.shade,
			font: { size: '.7rem' },
		},
	} )

	$mol_style_define( $bog_vmap_app_inspect_value_item, {
		flex: { direction: 'row', grow: 1, wrap: 'nowrap' },
		align: { items: 'flex-start' },
		gap: '.25rem',
		minWidth: 0,

		Key: {
			flex: { shrink: 0 },
			width: '7rem',
			minHeight: '1.5rem',
			padding: { top: '.2rem', bottom: '.2rem', left: '.4rem', right: '.4rem' },
			background: { color: $mol_theme.field },
			font: { family: 'monospace', size: '.8rem' },
		},

		Drop: {
			flex: { shrink: 0 },
			minHeight: '1.5rem',
			minWidth: '1.5rem',
			padding: { top: 0, bottom: 0, left: '.3rem', right: '.3rem' },
			color: $mol_theme.shade,
			font: { size: '.7rem' },
		},
	} )

	$mol_style_define( $bog_vmap_app_inspect_value_bind, {
		flex: { direction: 'row', grow: 1, wrap: 'nowrap' },
		align: { items: 'flex-start' },
		gap: '.25rem',
		minWidth: 0,

		Op: {
			flex: { shrink: 0 },
			align: { items: 'center' },
			minHeight: '1.5rem',
			padding: { left: '.2rem', right: '.2rem' },
			color: $mol_theme.shade,
			font: { family: 'monospace', size: '.8rem', weight: 'bold' },
		},

		Target: {
			flex: { grow: 1 },
			minWidth: '4rem',
			minHeight: '1.5rem',
			background: { color: $mol_theme.field },
			color: $mol_theme.current,
			font: { family: 'monospace', size: '.8rem' },
		},
	} )

	$mol_style_define( $bog_vmap_app_inspect_value_wire, {
		flex: { direction: 'column', grow: 1 },
		minWidth: 0,

		Row: {
			flex: { direction: 'row', grow: 1, wrap: 'nowrap' },
			align: { items: 'center' },
			gap: '.15rem',
			minWidth: 0,
		},

		/**
		 * Both pickers are sized like the fields they replaced, so that swapping a
		 * text field for a list does not move the row it sits in.
		 */
		Origin: {
			flex: { grow: 1 },
			minWidth: '3rem',
			minHeight: '1.5rem',
			background: { color: $mol_theme.field },
			color: $mol_theme.current,
			font: { family: 'monospace', size: '.8rem', weight: 'bold' },
		},

		Port_pick: {
			flex: { grow: 1 },
			minWidth: '3rem',
			minHeight: '1.5rem',
			background: { color: $mol_theme.field },
			font: { family: 'monospace', size: '.8rem' },
		},

		Note: {
			padding: { top: '.15rem', left: '.4rem', right: '.4rem' },
			color: $mol_theme.shade,
			font: { size: '.7rem' },
		},

		Op: {
			flex: { shrink: 0 },
			padding: { left: '.2rem', right: '.2rem' },
			color: $mol_theme.shade,
			font: { family: 'monospace', size: '.8rem', weight: 'bold' },
		},

		Dot: {
			flex: { shrink: 0 },
			color: $mol_theme.shade,
			font: { family: 'monospace', size: '.8rem' },
		},

		Port_free: {
			flex: { grow: 1 },
			minWidth: '3rem',
			minHeight: '1.5rem',
			padding: { top: '.2rem', bottom: '.2rem', left: '.4rem', right: '.4rem' },
			background: { color: $mol_theme.field },
			font: { family: 'monospace', size: '.8rem' },
		},
	} )

}
