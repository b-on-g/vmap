namespace $.$$ {

	const { px } = $mol_style_unit

	$mol_style_define( $bog_vmap_app_layers, {

		Pick: {
			flex: {
				grow: 1,
				shrink: 1,
			},
			'@': {
				mol_check_checked: {
					true: {
						color: $mol_theme.current,
						textShadow: '0 0',
					},
				},
			},
		},

		Line: {
			'@': {
				bog_vmap_app_layers_line_shade: {
					inner: {
						opacity: .6,
					},
					alien: {
						opacity: .35,
					},
				},
			},
			'[mol_drop_status]': {
				drag: {
					'[bog_vmap_app_layers_line_zone]': {
						before: {
							box: {
								shadow: [{
									inset: true,
									x: 0,
									y: px( 1 ),
									blur: 0,
									spread: 0,
									color: $mol_theme.focus,
								}],
							},
						},
						inside: {
							box: {
								shadow: [{
									inset: true,
									x: 0,
									y: 0,
									blur: 0,
									spread: px( 1 ),
									color: $mol_theme.focus,
								}],
							},
						},
					},
				},
			},
		},

	} )

}
