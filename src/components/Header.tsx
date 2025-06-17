'use client';

import { AppBar, Toolbar, Typography, Box } from '@mui/material';

export default function Header() {
	return (
		<AppBar position="static" color="primary" sx={{ mb: 4 }}>
			<Toolbar>
				<Box sx={{ flexGrow: 1, textAlign: 'center' }}>
					<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
						対応履歴管理アプリ for Call
					</Typography>
				</Box>
			</Toolbar>
		</AppBar>
	);
}
