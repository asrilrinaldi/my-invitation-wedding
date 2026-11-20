import { NextResponse } from 'next/server';
import { getWishes, saveWish, deleteWish } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const wishes = await getWishes();
    return NextResponse.json(
      { success: true, data: wishes },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch wishes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.message || body.name.trim() === '' || body.message.trim() === '') {
      return NextResponse.json({ success: false, message: 'Nama dan ucapan wajib diisi' }, { status: 400 });
    }

    const wish = await saveWish(body);
    return NextResponse.json({ success: true, data: wish });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to save wish' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID ucapan diperlukan' }, { status: 400 });
    }

    const deleted = await deleteWish(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete wish' }, { status: 500 });
  }
}
