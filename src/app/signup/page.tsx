'use client';
import Header from '../../components/Header';
import { Box, Button, Container, Paper, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';
import { Alert } from '@mui/material';

const SignupSchema = z.object({
	name: z.string().min(1, '名前は必須です'),
	email: z.string().email('正しいメールアドレスを入力してください'),
	password: z
		.string()
		.min(8, 'パスワードは8文字以上で入力してください')
		.max(16, 'パスワードは16文字以内で入力してください')
		.regex(/^[a-zA-Z0-9]+$/, 'パスワードは英数字のみ使用できます'),
	auth_id: z.string().min(1, 'IDは必須です'),
});

export default function SignupPage() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [authId, setAuthId] = useState('');
	const [messages, setMessages] = useState<{
		type: 'success' | 'error';
		text: string | string[];
	} | null>(null);

	const router = useRouter();

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		const formData = {
			name,
			email,
			password,
			auth_id: authId,
		};

		const result = SignupSchema.safeParse(formData);
		if (!result.success) {
			const errorMessages = result.error.errors.map((err) => err.message);
			setMessages({ type: 'error', text: errorMessages });
			return;
		}

		console.log(messages);

		const response = await fetch('/api/auth/signup', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(formData),
		});

		console.log(formData);
		console.log({ name, email, password, authId });

		const data = await response.json();

		if (response.ok) {
			setMessages({
				type: 'success',
				text: '新規登録が完了しました。3秒後にログイン画面へ移動します。',
			});
			setTimeout(() => {
				router.push('/signin');
			}, 3000);
		} else {
			setMessages({ type: 'error', text: data.error ?? '登録に失敗しました' });
		}
	};

	return (
		<>
			<Header />
			<Container maxWidth="sm">
				<Paper elevation={3} sx={{ padding: 4, mt: 5 }}>
					<Typography
						variant="h4"
						gutterBottom
						align="center"
						sx={{ color: 'primary.main', fontWeight: 'bold' }}
					>
						新規登録
					</Typography>
					<Box component="form" onSubmit={handleSubmit} noValidate>
						<TextField
							label="名前"
							fullWidth
							margin="normal"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
						<TextField
							label="メールアドレス"
							type="email"
							fullWidth
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
						<TextField
							label="パスワード"
							type="password"
							fullWidth
							margin="normal"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							inputProps={{ maxLength: 16 }}
							required
						/>
						<TextField
							label="ID"
							fullWidth
							margin="normal"
							value={authId}
							onChange={(e) => setAuthId(e.target.value)}
							required
						/>
						{messages && (
							<Alert severity={messages.type} sx={{ mt: 2, whiteSpace: 'pre-line' }}>
								{Array.isArray(messages.text) ? (
									<ul style={{ margin: 0, paddingLeft: '1.5em' }}>
										{messages.text.map((msg, i) => (
											<li key={i}>{msg}</li>
										))}
									</ul>
								) : (
									messages.text
								)}
							</Alert>
						)}
						<Button
							type="submit"
							variant="contained"
							color="primary"
							fullWidth
							sx={{ mt: 3 }}
						>
							新規登録
						</Button>
					</Box>
				</Paper>
			</Container>
		</>
	);
}
