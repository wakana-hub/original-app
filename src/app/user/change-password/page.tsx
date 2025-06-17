'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import supabase from '@/utils/supabase/supabaseClient';
import Layout from '@/components/Layout';

export default function ChangePasswordPage() {
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(
		null
	);

	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setMessage(null);

		const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

		if (!passwordRegex.test(newPassword)) {
			setMessage({
				type: 'error',
				text: 'パスワードは英数字8文字以上16文字以内で入力してください。',
			});
			return;
		}
		if (newPassword !== confirmPassword) {
			setMessage({
				type: 'error',
				text: '新しいパスワードと確認用パスワードが一致しません。',
			});
			return;
		}

		setLoading(true);

		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user?.email) {
				setMessage({ type: 'error', text: 'ユーザー情報が取得できませんでした。' });
				setLoading(false);
				return;
			}

			const { error: signInError } = await supabase.auth.signInWithPassword({
				email: user.email,
				password: currentPassword,
			});

			if (signInError) {
				setMessage({ type: 'error', text: '現在のパスワードが正しくありません。' });
				setLoading(false);
				return;
			}

			const { error: updateError } = await supabase.auth.updateUser({
				password: newPassword,
			});

			if (updateError) {
				setMessage({
					type: 'error',
					text: `パスワード変更に失敗しました: ${updateError.message}`,
				});
			} else {
				setMessage({ type: 'success', text: 'パスワードを変更しました。' });
				setTimeout(() => {
					router.push('/user');
				}, 1500);
			}
		} catch (error: unknown) {
			if (error instanceof Error) {
				setMessage({
					type: 'error',
					text: `予期せぬエラーが発生しました: ${error.message}`,
				});
			} else {
				setMessage({ type: 'error', text: '予期せぬエラーが発生しました。' });
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<Layout title="パスワード変更">
			<Box component="form" sx={{ maxWidth: 400, mx: 'auto', mt: 4 }} onSubmit={handleSubmit}>
				<Typography variant="h6" gutterBottom>
					パスワードを変更する
				</Typography>

				<TextField
					label="現在のパスワード"
					type="password"
					fullWidth
					margin="normal"
					value={currentPassword}
					onChange={(e) => setCurrentPassword(e.target.value)}
					required
				/>

				<TextField
					label="新しいパスワード"
					type="password"
					fullWidth
					margin="normal"
					value={newPassword}
					onChange={(e) => setNewPassword(e.target.value)}
					required
					inputProps={{ minLength: 8, maxLength: 16 }}
					helperText="英数字8文字以上16文字以内で入力してください"
				/>

				<TextField
					label="新しいパスワード（確認用）"
					type="password"
					fullWidth
					margin="normal"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					required
				/>

				{message && (
					<Alert severity={message.type} sx={{ mt: 2 }}>
						{message.text}
					</Alert>
				)}

				<Box sx={{ mt: 3, position: 'relative' }}>
					<Button type="submit" variant="contained" fullWidth disabled={loading}>
						パスワードを変更する
					</Button>
					{loading && (
						<CircularProgress
							size={24}
							sx={{
								color: 'primary.main',
								position: 'absolute',
								top: '50%',
								left: '50%',
								marginTop: '-12px',
								marginLeft: '-12px',
							}}
						/>
					)}
				</Box>
			</Box>
		</Layout>
	);
}
