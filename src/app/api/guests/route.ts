import { NextResponse } from 'next/server';
import { getGuests, saveGuest, deleteGuest, markGuestOpened } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const guests = getGuests();
    return NextResponse.json(
      { success: true, data: guests },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch guests' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json({ success: false, message: 'Nama tamu wajib diisi' }, { status: 400 });
    }

    const guest = saveGuest(body);
    return NextResponse.json({ success: true, data: guest });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to save guest' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const identifier = body.slug || body.name || body.id;
    if (!identifier) {
      return NextResponse.json({ success: false, message: 'Identifier diperlukan' }, { status: 400 });
    }

    const updated = markGuestOpened(identifier);
    return NextResponse.json({ success: true, updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal memperbarui status buka' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID tamu diperlukan' }, { status: 400 });
    }

    const deleted = deleteGuest(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete guest' }, { status: 500 });
  }
}
