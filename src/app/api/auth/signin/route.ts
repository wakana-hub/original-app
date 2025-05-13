// app/api/auth/signin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../utils/supabaseServer'; // サーバー用クライアントをインポート

// supabaseServerのログを追加
console.log("supabaseServerインスタンス:", supabaseServer);

export async function POST(req: NextRequest) {
  const { authId, password } = await req.json();

  // auth_idからemailを取得
  const { data, error: userError } = await supabaseServer
    .from('user')
    .select('email')
    .eq('auth_id', authId)
    .single();

  if (userError || !data) {
    console.error("ユーザー取得エラー:", userError);
    return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
  }

  console.log("DBから取得したユーザー:", data); // 正しく取得できているか

  
  // 認証
  const { data: sessionData, error: signInError } = await supabaseServer.auth.signInWithPassword({
    email: data.email,
    password,
  });

 // 認証後のレスポンスログ
  console.log("Session Data:", sessionData);
  console.log("SignIn Error:", signInError);

  

  if (signInError) {
     console.error("サインインエラー:", signInError);
    return NextResponse.json({ error: "IDもしくはパスワードが間違っています 。" }, { status: 401 });
  }

  return NextResponse.json({ message: 'ログイン成功', session: sessionData });

}
