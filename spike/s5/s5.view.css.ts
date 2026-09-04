namespace $.$$ {

	$mol_style_define( $bog_vmap_spike_s5, {
		flex: { direction: 'column' },
		gap: '.25rem',
		padding: '1rem',
		font: { family: 'monospace' },

		L1: { color: $mol_theme.shade, padding: { top: '.5rem' } },
		L2: { color: $mol_theme.shade, padding: { top: '.5rem' } },
		L3: { color: $mol_theme.shade, padding: { top: '.5rem' } },
		L4: { color: $mol_theme.shade, padding: { top: '.5rem' } },

		Chains: { flex: { direction: 'column' }, gap: '.25rem' },
	} )

	$mol_style_define( $bog_vmap_spike_s5_base, {
		font: { weight: 'bold' },
		color: $mol_theme.current,
	} )

}
