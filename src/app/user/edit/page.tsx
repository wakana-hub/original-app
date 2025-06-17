'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
	Box,
	Typography,
	CircularProgress,
	Button,
	Stack,
	TextField,
	Paper,
	Alert,
} from '@mui/material';
import supabase from '@/utils/supabase/supabaseClient';
import { Database } from '../../../types/supabase';
import Layout from '@/components/Layout';

type UserRow = Database['public']['Tables']['user']['Row'];

export default function UserEditPage() {
	const [user, setUser] = useState<UserRow | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const router = useRouter();
	const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(
		null
	);

	console.log(email);

	useEffect(() => {
		const fetchUser = async () => {
			const {
				data: { session },
				error: sessionError,
			} = await supabase.auth.getSession();

			if (sessionError) {
				console.error('セッション取得エラー:', sessionError.message);
				setLoading(false);
				return;
			}

			if (!session?.user?.id) {
				setLoading(false);
				return;
			}

			const { data, error } = await supabase
				.from('user')
				.select('*')
				.eq('id', session.user.id)
				.single();

			if (error) {
				console.error('ユーザー取得エラー:', error.message);
			} else if (data) {
				setUser(data);
				setName(data.name || '');
				setEmail(data.email || '');
			}

			setLoading(false);
		};

		fetchUser();
	}, []);

	const handleSave = async () => {
		if (!user) return;

		if (!name.trim()) {
			setMessage({ type: 'error', text: 'ユーザー名を入力してください。' });
			return;
		}
		setSaving(true);
		setMessage(null);

		const { error } = await supabase
			.from('user')
			.update({
				name,
			})
			.eq('id', user.id);

		if (error) {
			setMessage({ type: 'error', text: '更新に失敗しました: ' + error.message });
		} else {
			setMessage({ type: 'success', text: 'ユーザー情報を更新しました' });
			setTimeout(() => {
				router.push('/user');
			}, 1500);
		}

		setSaving(false);
	};

	if (loading) {
		return (
			<Layout title="ユーザー編集">
				<Box sx={{ p: 4 }}>
					<CircularProgress />
				</Box>
			</Layout>
		);
	}

	if (!user) {
		return (
			<Layout title="ユーザー編集">
				<Box sx={{ p: 4 }}>
					<Typography>ログインしてください</Typography>
				</Box>
			</Layout>
		);
	}

	return (
		<Layout title="ユーザー編集">
			<Box sx={{ p: 4, maxWidth: 600, margin: '0 auto' }}>
				<Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
					<Typography variant="subtitle2" color="text.secondary">
						ユーザーID（編集不可）
					</Typography>
					<Typography variant="body1">{user.auth_id || '未設定'}</Typography>
				</Paper>
				<Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
					<Typography variant="subtitle2" color="text.secondary">
						メールアドレス（編集不可）
					</Typography>
					<Typography variant="body1">{user.email || '未設定'}</Typography>
				</Paper>

				<TextField
					label="ユーザー名"
					fullWidth
					margin="normal"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
				/>
				{message && (
					<Alert severity={message.type} sx={{ mt: 2 }}>
						{message.text}
					</Alert>
				)}
				<Stack direction="row" spacing={2} sx={{ mt: 4 }}>
					<Button
						variant="contained"
						color="primary"
						onClick={handleSave}
						disabled={saving}
					>
						{saving ? '保存中...' : '保存'}
					</Button>
					<Button
						variant="outlined"
						color="secondary"
						onClick={() => router.push('/user')}
					>
						キャンセル
					</Button>
				</Stack>
			</Box>
		</Layout>
	);
}
