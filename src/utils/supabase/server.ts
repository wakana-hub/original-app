import { cookies } from 'next/headers';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

// createPagesServerClient は pages 用の API 型を要求するため、モックを用意
export const createServerClient = () => {
  const cookieStore = cookies();
  const cookieObj: { [key: string]: string } = {};

  cookieStore.getAll().forEach(({ name, value }) => {
    cookieObj[name] = value;
  });

  // NextApiRequest の構造をモック
  const req = {
    cookies: cookieObj,
  } as unknown as NextApiRequest;

  const res = {
    getHeader() {},
    setHeader() {},
  } as unknown as NextApiResponse;

  return createPagesServerClient({ req, res }, {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });
};
