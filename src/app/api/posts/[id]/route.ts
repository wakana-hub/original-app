import { NextResponse } from 'next/server';
import { createServerClient } from '../../../../utils/supabase/server'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient()

  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('post')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase =  createServerClient();

  const { id } = params;

  const { data, error } = await supabase
  .from('post')
  .select(`
    *,
    user:userId (
      name
    )
  `)
  .eq('id', id)
  .single()


  if (error || !data) {
    return NextResponse.json({ error: '投稿が見つかりません' }, { status: 404 });
  }

  return NextResponse.json(data);
}


