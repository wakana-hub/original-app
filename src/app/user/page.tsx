'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, CircularProgress, Button, Stack, Paper } from '@mui/material';
import supabase from '@/utils/supabase/supabaseClient';
import { Database } from '../../types/supabase';
import Layout from '@/components/Layout';

type UserRow = Database['public']['Tables']['user']['Row'];

const renderReadOnlyField = (label: string, value?: string) => (
	<Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
		<Typography variant="subtitle2" color="text.secondary">
			{label}
		</Typography>
		<Typography variant="body1">{value || '未設定'}</Typography>
	</Paper>
);

export default function UserPage() {
	const [user, setUser] = useState<UserRow | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const getUserData = async () => {
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession();

			if (error) {
				console.error('ユーザー情報の取得に失敗しました:', error.message);
				return;
			}

			if (session?.user?.id) {
				const { data, error } = await supabase
					.from('user')
					.select('*')
					.eq('id', session.user.id)
					.single();

				if (error) {
					console.error('ユーザーIDの取得に失敗しました:', error.message);
					return;
				}

				if (data) {
					setUser(data);
				}
			}

			setLoading(false);
		};

		getUserData();
	}, []);

	if (loading) {
		return (
			<Layout title="ユーザー情報">
				<Box sx={{ p: 4 }}>
					<CircularProgress />
				</Box>
			</Layout>
		);
	}

	if (!user) {
		return (
			<Layout title="ユーザー情報">
				<Box sx={{ p: 4 }}>
					<Typography>ログインしてください</Typography>
				</Box>
			</Layout>
		);
	}

	return (
		<Layout title="ユーザー情報">
			<Box sx={{ p: 4 }}>
				{renderReadOnlyField('ユーザー名', user.name)}
				{renderReadOnlyField('メールアドレス', user.email)}
				{renderReadOnlyField('ユーザーID', user.auth_id)}

				<Stack direction="row" spacing={2} sx={{ mt: 4 }}>
					<Button
						variant="contained"
						color="primary"
						onClick={() => router.push('/user/edit')}
					>
						編集
					</Button>
					<Button
						variant="outlined"
						color="secondary"
						onClick={() => router.push('/user/change-password')}
					>
						パスワード変更
					</Button>
				</Stack>
			</Box>
		</Layout>
	);
}
