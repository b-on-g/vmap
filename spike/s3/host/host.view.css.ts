namespace $.$$ {

	$mol_style_define( $bog_vmap_spike_s3_host, {

		flex: { direction: 'row', wrap: 'wrap' },
		gap: $mol_gap.block,
		padding: $mol_gap.block,
		minHeight: '100vh',
		font: { family: 'monospace', size: '12px' },
		color: $mol_theme.text,

		Log: {
			flex: { direction: 'column', grow: 1, basis: '30rem' },
			gap: '2px',
			minWidth: 0,
		},

		Row: {
			display: 'block',
			whiteSpace: 'pre-wrap',
		},

		Stage: {
			flex: { direction: 'column', grow: 1, basis: '24rem' },
			minWidth: 0,
			border: { width: '1px', style: 'solid', color: $mol_theme.line },
		},

		Scene: {
			flex: { grow: 1 },
			minHeight: '24rem',
			background: { color: $mol_theme.back },
		},

		'@': {
			bog_vmap_spike_s3_host_verdict: {
				ok: { color: '#2e7d32' },
				leak: { color: '#c62828', font: { weight: 'bold' } },
				wait: { color: $mol_theme.shade },
				info: { color: $mol_theme.shade },
			},
		},

	} )

}
