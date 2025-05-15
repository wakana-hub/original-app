// utils/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

// 環境変数からSupabase URLとAnon Keyを取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);


if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL or Anon Key is missing');
  }

// Supabaseクライアントを作成
export const supabase = createClient(supabaseUrl, supabaseKey);

