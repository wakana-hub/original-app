// utils/supabaseServerClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // サーバー用キー（秘密）

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase URL or Service Role Key is missing');
}

const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey);

export default supabaseServer;
