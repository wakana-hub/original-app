// src/app/api/posts/route.ts
import { NextResponse } from 'next/server';
import supabase from '@/utils/supabase/supabaseClient';

export async function GET() {
  const { data, error } = await supabase
    .from('post')
    .select(`
      id,
      startTime,
      status,
      inquiryType,
      category,
      message,
      user (
        name
      )
    `);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
