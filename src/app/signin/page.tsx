'use client';

import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../utils/supabase/supabaseClient"
import Header from "../../components/Header";

export default function SigninPage(){
    const[authId,setAuthId]=useState("");
    const[password,setPassword]=useState("");
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError(null); // 送信前にエラークリア

    // auth_idからemailを取得
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('email')
      .eq('auth_id', authId)
      .single();

    if (userError || !userData?.email) {
      setError('ユーザーが見つかりません');
      return;
    }

    // パスワード認証
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: password,
    });

    console.log('ログイン成功:', data.session);

    if (signInError) {
      setError("IDもしくはパスワードが間違っています");
      return;
    }

    // ログイン成功後はダッシュボードに遷移
    router.push("/dashboard");
  };

    const handleSignup = () => {
      router.push("/signup");
    }

    return(
            <>
            <Header/>    
            <Container maxWidth="sm" >
            <Paper elevation={3} sx={{padding:4, my:5}}>
            <Typography 
            variant="h4"
            gutterBottom
            align="center"
            sx={{color: 'primary.main', fontWeight: 'bold'}}>
                ログイン
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit}>
            <TextField
                label="ID"
                fullWidth
                margin="normal"
                value={authId}
                onChange={(e) => setAuthId(e.target.value)}
                required
                autoComplete="username"
                />
                <TextField
                label="パスワード"
                type="password"
                autoComplete="current-password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                />
                {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                {error} {/* エラーメッセージを表示 */}
                 </Typography> 
                 )}
                <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 3 }}
                >
                ログイン
                </Button>
                <Button
                color="primary"
                fullWidth
                sx={{ mt: 3 }}
                onClick={handleSignup}
                >
                新規登録
                </Button>
            </Box>
        </Paper>
        </Container>
        </>
    )
}