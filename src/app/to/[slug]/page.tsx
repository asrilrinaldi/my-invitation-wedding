import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getGuestBySlug, markGuestOpened } from '@/lib/db';
import ClientInvitation from './ClientInvitation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const guest = await getGuestBySlug(params.slug);
  
  if (!guest) {
    return {
      title: 'Undangan Tidak Ditemukan - Asril & Sisi',
      description: 'Tautan undangan tidak terdaftar dalam daftar tamu resmi.',
    };
  }

  return {
    title: `Kepada Yth. ${guest.name} - Undangan Pernikahan Asril & Sisi`,
    description: `Undangan Pernikahan Spesial untuk ${guest.name} - Minggu, 20 Juni 2027 di Bandar Lampung.`,
    openGraph: {
      title: `Kepada Yth. ${guest.name} - Undangan Pernikahan Asril & Sisi`,
      description: `Tanpa mengurangi rasa hormat, kami mengundang ${guest.name} untuk menghadiri pernikahan kami.`,
      images: [
        {
          url: '/foto-pasangan/DSC_0182.jpg',
          width: 600,
          height: 800,
          alt: 'Undangan Pernikahan Asril & Sisi',
        },
      ],
    },
  };
}

export default async function GuestInvitationPage({ params }: PageProps) {
  const guest = await getGuestBySlug(params.slug);

  // STRICT WHITELIST PROTECTION:
  // If the slug is NOT in the database, reject access immediately with 404!
  // No arbitrary names can ever be used or viewed under /to/[slug]
  if (!guest) {
    notFound();
  }

  // Mark guest as opened
  await markGuestOpened(params.slug);

  return (
    <ClientInvitation 
      guestName={guest.name} 
      isVerified={true}
      guestCategory={guest.category}
    />
  );
}
