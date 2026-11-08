/**
 * 35 Butir Pernyataan Sikap Skala Likert 1–7 Tanggap.org
 * Mengukur 4 dimensi temperamen & profil kepribadian:
 *   - koleris    (Tegas, Solutif, Berorientasi Hasil & Tindakan)
 *   - melankolis (Analitis, Perfeksionis, Terstruktur, Reflektif)
 *   - plegmatis  (Tenang, Sabar, Harmonis, Akomodatif)
 *   - sanguinis  (Antusias, Sosial, Ekspresif, Membangun Semangat)
 */

export interface LikertQuestion {
  id: number;
  statement: string;
  text: string;
  category: 'koleris' | 'melankolis' | 'plegmatis' | 'sanguinis';
  dimension: 'koleris' | 'melankolis' | 'plegmatis' | 'sanguinis';
  scale: {
    min: number;
    max: number;
    minLabel: string;
    maxLabel: string;
  };
}

const DEFAULT_SCALE = {
  min: 1,
  max: 7,
  minLabel: 'Sangat Tidak Setuju',
  maxLabel: 'Sangat Setuju',
};

export const ASSESSMENT_QUESTIONS: LikertQuestion[] = [
  // 1 - 5
  {
    id: 1,
    statement: 'Saya memposisikan diri di kelas sebagai pembimbing yang mendampingi siswa.',
    text: 'Saya memposisikan diri di kelas sebagai pembimbing yang mendampingi siswa.',
    category: 'koleris',
    dimension: 'koleris',
    scale: DEFAULT_SCALE,
  },
  {
    id: 2,
    statement: 'Saya selalu merencanakan jadwal kegiatan belajar dan tugas dengan sangat rinci dan terstruktur.',
    text: 'Saya selalu merencanakan jadwal kegiatan belajar dan tugas dengan sangat rinci dan terstruktur.',
    category: 'melankolis',
    dimension: 'melankolis',
    scale: DEFAULT_SCALE,
  },
  {
    id: 3,
    statement: 'Saya berusaha menjaga keharmonisan kelompok dan sebisa mungkin menghindari pertengkaran atau konfrontasi terbuka.',
    text: 'Saya berusaha menjaga keharmonisan kelompok dan sebisa mungkin menghindari pertengkaran atau konfrontasi terbuka.',
    category: 'plegmatis',
    dimension: 'plegmatis',
    scale: DEFAULT_SCALE,
  },
  {
    id: 4,
    statement: 'Saya mudah bergaul, bersemangat menjalin pertemanan baru, dan antusias menyapa rekan-rekan di sekolah.',
    text: 'Saya mudah bergaul, bersemangat menjalin pertemanan baru, dan antusias menyapa rekan-rekan di sekolah.',
    category: 'sanguinis',
    dimension: 'sanguinis',
    scale: DEFAULT_SCALE,
  },
  {
    id: 5,
    statement: 'Ketika terjadi perbedaan pendapat atau konflik di sekolah, saya cenderung mengambil inisiatif untuk segera mencari solusi konkret.',
    text: 'Ketika terjadi perbedaan pendapat atau konflik di sekolah, saya cenderung mengambil inisiatif untuk segera mencari solusi konkret.',
    category: 'koleris',
    dimension: 'koleris',
    scale: DEFAULT_SCALE,
  },

  // 6 - 10
  {
    id: 6,
    statement: 'Sebelum mengambil keputusan penting, saya mengumpulkan informasi lengkap dan menganalisis dampaknya secara mendalam.',
    text: 'Sebelum mengambil keputusan penting, saya mengumpulkan informasi lengkap dan menganalisis dampaknya secara mendalam.',
    category: 'melankolis',
    dimension: 'melankolis',
    scale: DEFAULT_SCALE,
  },
  {
    id: 7,
    statement: 'Saya tetap dapat bersikap tenang, sabar, dan tidak mudah panik saat menghadapi tekanan atau beban kerja tinggi.',
    text: 'Saya tetap dapat bersikap tenang, sabar, dan tidak mudah panik saat menghadapi tekanan atau beban kerja tinggi.',
    category: 'plegmatis',
    dimension: 'plegmatis',
    scale: DEFAULT_SCALE,
  },
  {
    id: 8,
    statement: 'Saya senang mencairkan suasana yang kaku dengan humor, cerita menarik, atau antusiasme positif.',
    text: 'Saya senang mencairkan suasana yang kaku dengan humor, cerita menarik, atau antusiasme positif.',
    category: 'sanguinis',
    dimension: 'sanguinis',
    scale: DEFAULT_SCALE,
  },
  {
    id: 9,
    statement: 'Saya lebih menyukai tindakan cepat dan penyelesaian tugas tepat waktu dibandingkan terlalu lama berdiskusi tanpa arah.',
    text: 'Saya lebih menyukai tindakan cepat dan penyelesaian tugas tepat waktu dibandingkan terlalu lama berdiskusi tanpa arah.',
    category: 'koleris',
    dimension: 'koleris',
    scale: DEFAULT_SCALE,
  },
  {
    id: 10,
    statement: 'Saya menuntut standar kualitas yang tinggi pada setiap hasil karya dan tugas yang saya kerjakan.',
    text: 'Saya menuntut standar kualitas yang tinggi pada setiap hasil karya dan tugas yang saya kerjakan.',
    category: 'melankolis',
    dimension: 'melankolis',
    scale: DEFAULT_SCALE,
  },

  // 11 - 15
  {
    id: 11,
    statement: 'Rekan-rekan sering merasa nyaman mencurahkan keluh kesah karena saya dapat menjadi pendengar yang baik tanpa menghakimi.',
    text: 'Rekan-rekan sering merasa nyaman mencurahkan keluh kesah karena saya dapat menjadi pendengar yang baik tanpa menghakimi.',
    category: 'plegmatis',
    dimension: 'plegmatis',
    scale: DEFAULT_SCALE,
  },
  {
    id: 12,
    statement: 'Saya termotivasi ketika bekerja dalam lingkungan yang dinamis, interaktif, dan penuh ruang berekspresi.',
    text: 'Saya termotivasi ketika bekerja dalam lingkungan yang dinamis, interaktif, dan penuh ruang berekspresi.',
    category: 'sanguinis',
    dimension: 'sanguinis',
    scale: DEFAULT_SCALE,
  },
  {
    id: 13,
    statement: 'Saya merasa nyaman memimpin kelompok dan mengarahkan rekan lain untuk mencapai target bersama.',
    text: 'Saya merasa nyaman memimpin kelompok dan mengarahkan rekan lain untuk mencapai target bersama.',
    category: 'koleris',
    dimension: 'koleris',
    scale: DEFAULT_SCALE,
  },
  {
    id: 14,
    statement: 'Saya cenderung peka terhadap perasaan orang lain dan memperhatikan detail yang sering luput dari perhatian rekan lain.',
    text: 'Saya cenderung peka terhadap perasaan orang lain dan memperhatikan detail yang sering luput dari perhatian rekan lain.',
    category: 'melankolis',
    dimension: 'melankolis',
    scale: DEFAULT_SCALE,
  },
  {
    id: 15,
    statement: 'Saya mudah beradaptasi dengan ritme kerja rekan lain dan fleksibel menerima perubahan situasi.',
    text: 'Saya mudah beradaptasi dengan ritme kerja rekan lain dan fleksibel menerima perubahan situasi.',
    category: 'plegmatis',
    dimension: 'plegmatis',
    scale: DEFAULT_SCALE,
  },

  // 16 - 20
  {
    id: 16,
    statement: 'Saya mudah terinspirasi oleh ide-ide kreatif dan bersemangat mengajak orang lain mencoba hal baru.',
    text: 'Saya mudah terinspirasi oleh ide-ide kreatif dan bersemangat mengajak orang lain mencoba hal baru.',
    category: 'sanguinis',
    dimension: 'sanguinis',
    scale: DEFAULT_SCALE,
  },
  {
    id: 17,
    statement: 'Saya berani menyampaikan kritik dan koreksi secara langsung demi kebaikan dan efektivitas tim.',
    text: 'Saya berani menyampaikan kritik dan koreksi secara langsung demi kebaikan dan efektivitas tim.',
    category: 'koleris',
    dimension: 'koleris',
    scale: DEFAULT_SCALE,
  },
  {
    id: 18,
    statement: 'Saya membutuhkan waktu untuk merenung dan berpikir tenang sebelum menyampaikan pendapat di forum umum.',
    text: 'Saya membutuhkan waktu untuk merenung dan berpikir tenang sebelum menyampaikan pendapat di forum umum.',
    category: 'melankolis',
    dimension: 'melankolis',
    scale: DEFAULT_SCALE,
  },
  {
    id: 19,
    statement: 'Saya lebih memilih peran pendukung di belakang layar yang memastikan semua proses berjalan lancar dan damai.',
    text: 'Saya lebih memilih peran pendukung di belakang layar yang memastikan semua proses berjalan lancar dan damai.',
    category: 'plegmatis',
    dimension: 'plegmatis',
    scale: DEFAULT_SCALE,
  },
  {
    id: 20,
    statement: 'Saya senang berbicara di depan banyak orang dan mampu mengomunikasikan gagasan dengan penuh energi.',
    text: 'Saya senang berbicara di depan banyak orang dan mampu mengomunikasikan gagasan dengan penuh energi.',
    category: 'sanguinis',
    dimension: 'sanguinis',
    scale: DEFAULT_SCALE,
  },

  // 21 - 25
  {
    id: 21,
    statement: 'Dalam situasi krisis atau darurat di lingkungan sekolah, saya terdorong untuk segera mengambil kendali keadaan.',
    text: 'Dalam situasi krisis atau darurat di lingkungan sekolah, saya terdorong untuk segera mengambil kendali keadaan.',
    category: 'koleris',
    dimension: 'koleris',
    scale: DEFAULT_SCALE,
  },
  {
    id: 22,
    statement: 'Ketidakteraturan, kecerobohan, dan janji yang tidak ditepati sangat mengganggu kenyamanan saya.',
    text: 'Ketidakteraturan, kecerobohan, dan janji yang tidak ditepati sangat mengganggu kenyamanan saya.',
    category: 'melankolis',
    dimension: 'melankolis',
    scale: DEFAULT_SCALE,
  },
  {
    id: 23,
    statement: 'Saya jarang menunjukkan kemarahan secara meledak-ledak dan lebih memilih menyelesaikan masalah dengan kepala dingin.',
    text: 'Saya jarang menunjukkan kemarahan secara meledak-ledak dan lebih memilih menyelesaikan masalah dengan kepala dingin.',
    category: 'plegmatis',
    dimension: 'plegmatis',
    scale: DEFAULT_SCALE,
  },
  {
    id: 24,
    statement: 'Saya cepat memaafkan, melupakan rasa kesal, dan fokus menikmati momen kebersamaan hari ini.',
    text: 'Saya cepat memaafkan, melupakan rasa kesal, dan fokus menikmati momen kebersamaan hari ini.',
    category: 'sanguinis',
    dimension: 'sanguinis',
    scale: DEFAULT_SCALE,
  },
  {
    id: 25,
    statement: 'Saya termotivasi oleh tantangan sulit dan target pencapaian yang menuntut ketegasan sikap.',
    text: 'Saya termotivasi oleh tantangan sulit dan target pencapaian yang menuntut ketegasan sikap.',
    category: 'koleris',
    dimension: 'koleris',
    scale: DEFAULT_SCALE,
  },

  // 26 - 30
  {
    id: 26,
    statement: 'Saya senang menyusun catatan, bagan, atau dokumentasi sistematis untuk mempermudah pemahaman tim.',
    text: 'Saya senang menyusun catatan, bagan, atau dokumentasi sistematis untuk mempermudah pemahaman tim.',
    category: 'melankolis',
    dimension: 'melankolis',
    scale: DEFAULT_SCALE,
  },
  {
    id: 27,
    statement: 'Saya menghargai kestabilan, rutinitas yang teratur, dan lingkungan belajar yang damai tanpa tensi tinggi.',
    text: 'Saya menghargai kestabilan, rutinitas yang teratur, dan lingkungan belajar yang damai tanpa tensi tinggi.',
    category: 'plegmatis',
    dimension: 'plegmatis',
    scale: DEFAULT_SCALE,
  },
  {
    id: 28,
    statement: 'Saya dapat menularkan semangat optimis dan kehangatan kepada rekan-rekan yang sedang merasa jenuh atau sedih.',
    text: 'Saya dapat menularkan semangat optimis dan kehangatan kepada rekan-rekan yang sedang merasa jenuh atau sedih.',
    category: 'sanguinis',
    dimension: 'sanguinis',
    scale: DEFAULT_SCALE,
  },
  {
    id: 29,
    statement: 'Saya mengutamakan hasil kerja yang nyata dan produktivitas tinggi dalam setiap kegiatan.',
    text: 'Saya mengutamakan hasil kerja yang nyata dan produktivitas tinggi dalam setiap kegiatan.',
    category: 'koleris',
    dimension: 'koleris',
    scale: DEFAULT_SCALE,
  },
  {
    id: 30,
    statement: 'Saya bersikap hati-hati dalam menjalin pertemanan baru dan menghargai loyalitas yang mendalam.',
    text: 'Saya bersikap hati-hati dalam menjalin pertemanan baru dan menghargai loyalitas yang mendalam.',
    category: 'melankolis',
    dimension: 'melankolis',
    scale: DEFAULT_SCALE,
  },

  // 31 - 35
  {
    id: 31,
    statement: 'Saya bersedia mengalah demi kepentingan bersama dan menjaga hubungan baik jangka panjang.',
    text: 'Saya bersedia mengalah demi kepentingan bersama dan menjaga hubungan baik jangka panjang.',
    category: 'plegmatis',
    dimension: 'plegmatis',
    scale: DEFAULT_SCALE,
  },
  {
    id: 32,
    statement: 'Saya menyukai variasi aktivitas dan fleksibilitas dalam belajar daripada rutinitas yang monoton.',
    text: 'Saya menyukai variasi aktivitas dan fleksibilitas dalam belajar daripada rutinitas yang monoton.',
    category: 'sanguinis',
    dimension: 'sanguinis',
    scale: DEFAULT_SCALE,
  },
  {
    id: 33,
    statement: 'Saya gigih mempertahankan prinsip dan keyakinan saya ketika meyakini bahwa langkah tersebut benar.',
    text: 'Saya gigih mempertahankan prinsip dan keyakinan saya ketika meyakini bahwa langkah tersebut benar.',
    category: 'koleris',
    dimension: 'koleris',
    scale: DEFAULT_SCALE,
  },
  {
    id: 34,
    statement: 'Saya kritis terhadap ide-ide baru dan selalu memikirkan potensi risiko atau kelemahan yang mungkin timbul.',
    text: 'Saya kritis terhadap ide-ide baru dan selalu memikirkan potensi risiko atau kelemahan yang mungkin timbul.',
    category: 'melankolis',
    dimension: 'melankolis',
    scale: DEFAULT_SCALE,
  },
  {
    id: 35,
    statement: 'Saya dapat bekerja sama dengan berbagai tipe kepribadian orang lain secara kooperatif dan tanpa prasangka.',
    text: 'Saya dapat bekerja sama dengan berbagai tipe kepribadian orang lain secara kooperatif dan tanpa prasangka.',
    category: 'plegmatis',
    dimension: 'plegmatis',
    scale: DEFAULT_SCALE,
  },
];
