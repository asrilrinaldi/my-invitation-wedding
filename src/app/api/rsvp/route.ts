import { NextResponse } from 'next/server';
import { getRSVPs, saveRSVP } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const rsvps = await getRSVPs();
    return NextResponse.json(
      { success: true, data: rsvps },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch RSVPs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.guestName || !body.attendance) {
      return NextResponse.json({ success: false, message: 'Nama dan status kehadiran wajib diisi' }, { status: 400 });
    }

    const rsvp = await saveRSVP(body);
    return NextResponse.json({ success: true, data: rsvp });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to save RSVP' }, { status: 500 });
  }
}
