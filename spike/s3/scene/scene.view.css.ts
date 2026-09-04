namespace $.$$ {

	$mol_style_define( $bog_vmap_spike_s3_scene, {

		flex: { direction: 'column' },
		gap: $mol_gap.block,
		padding: $mol_gap.block,
		font: { family: 'monospace', size: '12px' },
		color: $mol_theme.text,

		Probes: {
			flex: { direction: 'column' },
			gap: '2px',
		},

		Probe: {
			display: 'block',
			whiteSpace: 'pre-wrap',
		},

		Preview: {
			flex: { direction: 'column' },
			gap: $mol_gap.space,
			border: { width: '1px', style: 'dashed', color: $mol_theme.line },
			padding: $mol_gap.block,
		},

		Shot: {
			width: '96px',
			height: '96px',
		},

		'@': {
			bog_vmap_spike_s3_scene_verdict: {
				ok: { color: '#2e7d32' },
				leak: { color: '#c62828', font: { weight: 'bold' } },
			},
		},

	} )

}
