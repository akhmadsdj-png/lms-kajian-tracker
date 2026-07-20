import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.userProgress.deleteMany();
  await prisma.video.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.tutor.deleteMany();

  // Create tutor
  const tutor = await prisma.tutor.create({
    data: {
      name: "Ustadz Firanda Andirja",
      slug: "ustadz-firanda-andirja",
      bio: "Ustadz Dr. Firanda Andirja, Lc., M.A. — Pengajar di Masjid Nabawi, Madinah",
    },
  });

  console.log(`✅ Created tutor: ${tutor.name}`);

  // ─── Playlist 1: Asmaul Husna ───
  const playlist1 = await prisma.playlist.create({
    data: {
      tutorId: tutor.id,
      slug: "asmaul-husna",
      title: "Asmaul Husna",
      description:
        "Kajian mengenai nama-nama indah Allah SWT beserta makna dan pengaruhnya dalam kehidupan.",
      orderIndex: 1,
    },
  });

  // Sample videos for Asmaul Husna
  // NOTE: Replace youtubeVideoId with actual YouTube video IDs from the playlist
  const asmaulHusnaVideos = [
    { title: "Asmaul Husna #1 - Pengantar Asmaul Husna", youtubeVideoId: "szB0XpAmsVY" },
    { title: "Asmaul Husna #2 - Ar-Rahman & Ar-Rahim", youtubeVideoId: "qwz_2Tz5CDk" },
    { title: "Asmaul Husna #3 - Al-Malik & Al-Quddus", youtubeVideoId: "UREtI023rVI" },
    { title: "Asmaul Husna #4 - As-Salam & Al-Mu'min", youtubeVideoId: "O7uyhnVHHR8" },
    { title: "Asmaul Husna #5 - Al-Muhaimin & Al-Aziz", youtubeVideoId: "19xbRXPl-s8" },
    { title: "Asmaul Husna #6 - Al-Jabbar & Al-Mutakabbir", youtubeVideoId: "cmDCDCrq0aI" },
    { title: "Asmaul Husna #7 - Al-Khaliq, Al-Bari' & Al-Mushawwir", youtubeVideoId: "pmkG5pl62kg" },
    { title: "Asmaul Husna #8 - Al-Ghaffar & Al-Qahhar", youtubeVideoId: "Sq_GwcNkuN0" },
  ];

  for (let i = 0; i < asmaulHusnaVideos.length; i++) {
    await prisma.video.create({
      data: {
        playlistId: playlist1.id,
        title: asmaulHusnaVideos[i].title,
        youtubeVideoId: asmaulHusnaVideos[i].youtubeVideoId,
        orderIndex: i + 1,
      },
    });
  }

  console.log(`✅ Created playlist: ${playlist1.title} (${asmaulHusnaVideos.length} videos)`);

  // ─── Playlist 2: Kitab Thaharah ───
  const playlist2 = await prisma.playlist.create({
    data: {
      tutorId: tutor.id,
      slug: "kitab-thaharah",
      title: "Kitab Thaharah",
      description:
        "Pembahasan lengkap mengenai fiqih bersuci (thaharah) meliputi wudhu, tayammum, mandi junub, dan hukum-hukumnya.",
      orderIndex: 2,
    },
  });

  const kitabThaharahVideos = [
    { title: "Kitab Thaharah #1 - Pengantar Kitab Thaharah", youtubeVideoId: "WxxFHC9Twx4" },
    { title: "Kitab Thaharah #2 - Macam-macam Air", youtubeVideoId: "WxxFHC9Twx4" },
    { title: "Kitab Thaharah #3 - Hukum Bejana & Kulit Bangkai", youtubeVideoId: "T1It95tACR8" },
    { title: "Kitab Thaharah #4 - Sunnah-sunnah Fitrah", youtubeVideoId: "xui2zfLAAMI" },
    { title: "Kitab Thaharah #5 - Adab Buang Hajat", youtubeVideoId: "yMiJnaBsYyc" },
    { title: "Kitab Thaharah #6 - Tata Cara Wudhu", youtubeVideoId: "QxwD48idbsQ" },
  ];

  for (let i = 0; i < kitabThaharahVideos.length; i++) {
    await prisma.video.create({
      data: {
        playlistId: playlist2.id,
        title: kitabThaharahVideos[i].title,
        youtubeVideoId: kitabThaharahVideos[i].youtubeVideoId,
        orderIndex: i + 1,
      },
    });
  }

  console.log(`✅ Created playlist: ${playlist2.title} (${kitabThaharahVideos.length} videos)`);

  // ─── Playlist 3: Tafsir Ayat-Ayat Pilihan ───
  const playlist3 = await prisma.playlist.create({
    data: {
      tutorId: tutor.id,
      slug: "tafsir-ayat-ayat-pilihan",
      title: "Tafsir Ayat-Ayat Pilihan",
      description:
        "Tafsir dan penjelasan mendalam terhadap ayat-ayat Al-Quran pilihan yang relevan dengan kehidupan sehari-hari.",
      orderIndex: 3,
    },
  });

  const tafsirVideos = [
    { title: "Tafsir #1 - Surat Al-Fatihah (Bagian 1)", youtubeVideoId: "OLO_yylIhZU" },
    { title: "Tafsir #2 - Surat Al-Fatihah (Bagian 2)", youtubeVideoId: "eshbexpGMpk" },
    { title: "Tafsir #3 - Ayat Kursi (Al-Baqarah: 255)", youtubeVideoId: "xwn_E7ol2r4" },
    { title: "Tafsir #4 - Surat Al-Ikhlas", youtubeVideoId: "lbPrVtAIRAA" },
    { title: "Tafsir #5 - Surat Al-Falaq & An-Nas", youtubeVideoId: "aYqz2xtqITs" },
  ];

  for (let i = 0; i < tafsirVideos.length; i++) {
    await prisma.video.create({
      data: {
        playlistId: playlist3.id,
        title: tafsirVideos[i].title,
        youtubeVideoId: tafsirVideos[i].youtubeVideoId,
        orderIndex: i + 1,
      },
    });
  }

  console.log(`✅ Created playlist: ${playlist3.title} (${tafsirVideos.length} videos)`);

  console.log("\n🎉 Seeding complete!");
  console.log("📝 IMPORTANT: Replace PLACEHOLDER video IDs with real YouTube video IDs.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
