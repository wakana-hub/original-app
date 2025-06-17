'use client';

import { Box, Typography } from '@mui/material';

export default function Footer() {
	return (
		<Box
			component="footer"
			sx={{
				mt: 'auto',
				py: 2,
				px: 2,
				textAlign: 'center',
				bgcolor: 'grey.200',
				borderTop: '1px solid #ccc',
			}}
		>
			<Typography variant="body2" color="textSecondary">
				© 2025 対応履歴管理アプリ for Call
			</Typography>
		</Box>
	);
}
