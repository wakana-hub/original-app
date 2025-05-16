import { NextRequest, NextResponse } from "next/server";// Next.jsの新しい型をインポート
import { createServerClient } from "../../../../utils/supabase/server" 
import bcrypt from 'bcryptjs';

type SignupData={
    name: string;
    email: string;
    password: string;
    auth_id: string;  // 任意のID
}

// POSTリクエストに対応
export async function POST(req:NextRequest){
      // ボディを一度だけ読み取って変数に格納
    const body = await req.json();
    console.log("受信データ：",body)

   const { name, email, password, auth_id } = body as SignupData;

 // 必須項目がすべてあるか確認
if(!name || !email || !password || !auth_id){
    return NextResponse.json(
        {error:`名前、メールアドレス、任意のID、パスワードは必須です。`},
        {status:400}
    );
};
    
const supabase = createServerClient();
try{
// Supabaseでユーザーのサインアップ
    const {error:signUpError} = await supabase.auth.signUp({
        email,
        password,
    });

    if (signUpError) {
        console.error("Supabase signUp error:", signUpError.message);
        console.error("Error details:", signUpError.message);
        return NextResponse.json({error:signUpError.message},{status:400});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
 // サインアップ成功後、Userテーブルに追加のユーザー情報を保存
    const {data:insertData,error:insertError}  = await supabase
    .from('user')   // Userテーブルにデータを挿入
    .insert([
        {
            name,
            email,
            auth_id,// 任意のID（フロントから受け取る）
            password:hashedPassword,    
        },
    ]);

    if(insertError){
        console.error("Supabase insert error:", insertError.message);
        console.error("Error details:", insertError.details); 
        return NextResponse.json({error:insertError.message},
            {status:400});
    }
    return NextResponse.json({message:`サインアップ成功です。`,data:insertData});
} catch(error) {
    return NextResponse.json({error: `サインアップ処理中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}` },{status:500});
}
}