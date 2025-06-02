'use client'
import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react"
import { z } from "zod";

const SignupSchema = z.object({
    name: z.string().min(1, "名前は必須です"),
    email: z.string().email("正しいメールアドレスを入力してください"),
    password: z.string()
      .min(8, "パスワードは8文字以上で入力してください")
      .max(16, "パスワードは16文字以内で入力してください")
      .regex(/^[a-zA-Z0-9]+$/, "パスワードは英数字のみ使用できます"),
    auth_id: z.string().min(1, "IDは必須です"),
  });

export default function SignupPage () {
    const[name,setName]=useState("");
    const[email,setEmail]=useState("");
    const[password,setPassword]=useState("");
    const[authId,setAuthId]=useState("")

    const router = useRouter();

    const handleSubmit = async(event:React.FormEvent) =>{
        event.preventDefault();

        const formData = {
            name,
            email,
            password,
            auth_id: authId
          };
        
          const result = SignupSchema.safeParse(formData);
          if (!result.success) {
            alert(result.error.errors[0].message); // 最初のエラーを表示
            return;
          }

        const response =await fetch('/api/auth/signup',{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
            },
            body:JSON.stringify(formData) 
        });
        console.log(formData)
        console.log({ name, email, password, authId });

        const data = await response.json();

        if(response.ok){
            alert('サインアップ成功');
            router.push('/signin')
        }else{
            alert(`エラー:${data.error}`)
        }
            
        }

    return (
        <>
        <Container maxWidth="sm" >
        <Paper elevation={3} sx={{padding:4, mt:5}}>
            <Typography 
            variant="h4"
            gutterBottom
            align="center"
            sx={{color: 'primary.main', fontWeight: 'bold'}}>
                新規登録
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                 label="名前"
                 fullWidth
                 margin="normal"
                 value={name}
                 onChange={(e)=>setName(e.target.value)}
                 required
                 />
                <TextField
                label="メールアドレス"
                type="email"
                fullWidth
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
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
    )
}