import { NextResponse } from 'next/server';
import { getMusic, saveMusic, getAvailableMusicTracks } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const current = await getMusic();
    const tracks = getAvailableMusicTracks();
    return NextResponse.json(
      { success: true, data: current, options: tracks },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil konfigurasi musik' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.url) {
      return NextResponse.json(
        { success: false, message: 'URL musik wajib disediakan' },
        { status: 400 }
      );
    }

    const updated = await saveMusic({
      url: body.url,
      title: body.title || 'Wedding Romantic Music',
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan konfigurasi musik' },
      { status: 500 }
    );
  }
}
