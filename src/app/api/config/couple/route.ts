import { NextResponse } from 'next/server';
import { getCouple, saveCouple } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const couple = await getCouple();
    return NextResponse.json(
      { success: true, data: couple },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data pengantin' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.groom || !body.bride) {
      return NextResponse.json(
        { success: false, message: 'Data pengantin pria dan wanita diperlukan' },
        { status: 400 }
      );
    }

    const updated = await saveCouple(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan data pengantin' },
      { status: 500 }
    );
  }
}
