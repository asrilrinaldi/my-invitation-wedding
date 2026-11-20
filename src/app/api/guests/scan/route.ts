import { NextResponse } from 'next/server';
import { getGuests, checkInGuest, undoCheckInGuest } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const guests = await getGuests();
    const checkedInGuests = guests.filter((g) => g.isCheckedIn);
    const totalGuests = guests.length;
    const checkedInCount = checkedInGuests.length;
    const remainingCount = totalGuests - checkedInCount;

    return NextResponse.json(
      {
        success: true,
        data: {
          totalGuests,
          checkedInCount,
          remainingCount,
          recentCheckIns: checkedInGuests.slice(0, 15),
        },
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data statistik scan' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, pax } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Kode QR atau nama tamu diperlukan' },
        { status: 400 }
      );
    }

    const result = await checkInGuest(code, pax);

    return NextResponse.json(result, {
      status: result.success ? 200 : 404,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat memproses scan' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID tamu diperlukan' },
        { status: 400 }
      );
    }

    const undone = await undoCheckInGuest(id);
    return NextResponse.json({ success: undone });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal membatalkan check-in' },
      { status: 500 }
    );
  }
}
