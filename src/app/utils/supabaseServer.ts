// utils/supabaseServer.ts ← サーバーサイド専用
// utils/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';

export const supabaseServer = createClient(
  process.env.SUPABASE_URL!,  // .env.local に設定されている Supabase URL
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // サーバー側の API キー
);


