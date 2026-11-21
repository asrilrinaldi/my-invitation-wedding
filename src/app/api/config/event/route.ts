import { NextResponse } from 'next/server';
import { getEvent, saveEvent } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const event = await getEvent();
    return NextResponse.json(
      { success: true, data: event },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data acara pernikahan' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.date) {
      return NextResponse.json(
        { success: false, message: 'Tanggal pernikahan diperlukan' },
        { status: 400 }
      );
    }

    const updated = await saveEvent(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan data acara pernikahan' },
      { status: 500 }
    );
  }
}
