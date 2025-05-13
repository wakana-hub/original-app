'use client';

import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SigninPage(){
    const[authId,setAuthId]=useState("");
    const[password,setPassword]=useState("");
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    const handleSubmit =async(event:React.FormEvent)=>{
        event.preventDefault();

        console.log("フォーム送信:", authId, password);

        try {
            const res = await fetch('/api/auth/signin', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ authId, password }),
            });
        
            const result = await res.json();
            console.log("API結果:", result);
        
            if (!res.ok) {
              setError(result?.error || 'ログインに失敗しました');
              return;
            }

       // ログイン成功時にアクセストークンとユーザー情報をlocalStorageに保存
       console.log("hoge",result.session.session.access_token)
      if (result.session.session.access_token && result.session.user){
        localStorage.setItem('access_token', result.session.access_token);
        // 必要に応じてユーザー情報も保存
        localStorage.setItem('user', JSON.stringify(result.session.user));
         router.push('/dashboard')
      }
        else {
          setError('セッション情報が不正です');
          }
       
          } catch (error) {
            console.error("認証中のエラー:", error);
            setError('通信エラーが発生しました');
          }
        };

    const handleSignup = () => {
      router.push("/signup");
    }
    
    

    return(
            <Container maxWidth="sm" >
            <Paper elevation={3} sx={{padding:4, mt:5}}>
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
                />
                <TextField
                label="パスワード"
                type="password"
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
    )
}