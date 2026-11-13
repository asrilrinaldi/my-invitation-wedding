import { WeddingData } from './types';

export const weddingConfig: WeddingData = {
  couple: {
    heroPhoto: "/foto-pasangan/DSC_0228-2.jpg",
    groom: {
      fullName: "Asril Rinaldi",
      nickname: "Asril",
      father: "Bpk. Nowendri",
      mother: "Ibu Surastini",
      photo: "/foto-pasangan/foto-pria.jpg",
      instagram: "asril_rinaldi",
    },
    bride: {
      fullName: "Sisi Dian Yuriska",
      nickname: "Sisi",
      father: "Bpk. Sistarudin",
      mother: "Ibu Dian",
      photo: "/foto-pasangan/foto-wanita.jpg",
      instagram: "sisi_dian",
    },
  },
  event: {
    date: "2027-06-20T08:00:00+07:00",
    displayDate: "Minggu, 20 Juni 2027",
    akadTime: "08:00 - 10:00 WIB",
    resepsiTime: "11:00 - 17:00 WIB",
    locationName: "Kediaman Mempelai",
    address: "Jalan Dipangga Satya, Gg Mandiri V No.12, Pramuka, Rajabasa, Bandar Lampung",
    gmapsUrl: "https://maps.app.goo.gl/FSQsgALZbZJLTy6R7",
    gmapsEmbedUrl: "https://maps.google.com/maps?q=Jalan%20Dipangga%20Satya%2C%20Gg%20Mandiri%20V%20No.12%2C%20Pramuka%2C%20Rajabasa%2C%20Bandar%20Lampung&t=&z=16&ie=UTF8&iwloc=&output=embed",
  },
  bank: {
    bankName: "Bank Central Asia (BCA)",
    accountNumber: "123456789",
    accountName: "Asril Rinaldi",
    qrisUrl: "/images/qris-template.svg",
  },
  music: {
    url: "/music/music001.mp3",
    title: "Romantic Wedding Melody",
  },
};

export const loveStories = [
  {
    year: "2021",
    title: "Awal Pertemuan",
    description: "Pertama kali kami dipertemukan dalam sebuah lingkaran persahabatan di Bandar Lampung. Percakapan sederhana yang berujung pada rasa nyaman yang tak terduga.",
  },
  {
    year: "2023",
    title: "Komitmen Bersama",
    description: "Setelah melewati berbagai cerita, suka, dan duka bersama, kami menyadari bahwa langkah kami memiliki satu arah dan tujuan yang sama.",
  },
  {
    year: "2026",
    title: "Lamaran & Menuju Pelaminan",
    description: "Dengan restu kedua keluarga besar, kami memutuskan untuk mengikat janji suci pernikahan, melangkah bersama menyempurnakan ibadah seumur hidup.",
  },
];
