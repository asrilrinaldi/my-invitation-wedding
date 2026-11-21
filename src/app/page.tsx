import { notFound, redirect } from 'next/navigation';
import { getGuestBySlug } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams?: {
    to?: string;
    guest?: string;
  };
}

export default async function HomePage({ searchParams }: PageProps) {
  const rawParam = searchParams?.to || searchParams?.guest;

  if (rawParam) {
    const guest = await getGuestBySlug(rawParam);
    if (guest) {
      redirect(`/to/${guest.slug}`);
    }
  }

  // URL tanpa nama tamu -> Tampilkan Not Found / URL Invalid
  notFound();
}
