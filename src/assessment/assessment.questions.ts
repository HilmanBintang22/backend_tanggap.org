/**
 * 35 Soal Kuesioner Temperamen Tanggap.org
 *
 * Setiap soal memiliki 4 pilihan yang masing-masing memetakan ke satu tipe temperamen:
 *   S = Sanguinis  (ekspresif, antusias, sosial)
 *   K = Koleris    (dominan, tegas, pemimpin)
 *   M = Melankolis (analitis, perfeksionis, sensitif)
 *   P = Phlegmatis (tenang, sabar, konsisten)
 *
 * Format pilihan: { id: 'a'|'b'|'c'|'d', text: string, type: 'S'|'K'|'M'|'P' }
 */

export interface QuestionOption {
  id: string;
  text: string;
  type: 'S' | 'K' | 'M' | 'P';
}

export interface AssessmentQuestion {
  id: number;
  text: string;
  options: QuestionOption[];
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    text: 'Saat ada masalah di kelompok, kamu biasanya...',
    options: [
      { id: 'a', text: 'Langsung mencairkan suasana dengan cerita atau candaan', type: 'S' },
      { id: 'b', text: 'Mengambil kendali dan mencari solusi cepat', type: 'K' },
      { id: 'c', text: 'Menganalisis situasi dulu sebelum bertindak', type: 'M' },
      { id: 'd', text: 'Menunggu instruksi atau mengikuti keputusan bersama', type: 'P' },
    ],
  },
  {
    id: 2,
    text: 'Ketika berbicara di depan umum, kamu merasa...',
    options: [
      { id: 'a', text: 'Senang dan bersemangat, ini waktu bersinarmu', type: 'S' },
      { id: 'b', text: 'Percaya diri, kamu tahu cara meyakinkan orang', type: 'K' },
      { id: 'c', text: 'Nervous, kamu ingin semua kata-katanya sempurna', type: 'M' },
      { id: 'd', text: 'Biasa saja, tidak terlalu khawatir apapun hasilnya', type: 'P' },
    ],
  },
  {
    id: 3,
    text: 'Kamu lebih suka belajar dengan cara...',
    options: [
      { id: 'a', text: 'Diskusi dan berbagi pendapat dengan teman', type: 'S' },
      { id: 'b', text: 'Langsung praktik dan memimpin proyek nyata', type: 'K' },
      { id: 'c', text: 'Membaca buku atau menonton video penjelasan mendetail', type: 'M' },
      { id: 'd', text: 'Belajar santai dengan tempo sendiri tanpa tekanan', type: 'P' },
    ],
  },
  {
    id: 4,
    text: 'Saat menghadapi konflik dengan teman, sikapmu adalah...',
    options: [
      { id: 'a', text: 'Mengajak ngobrol santai agar suasana kembali cair', type: 'S' },
      { id: 'b', text: 'Langsung mengatakan apa yang menurutmu salah', type: 'K' },
      { id: 'c', text: 'Memikirkan semuanya dulu, lalu menyampaikan dengan hati-hati', type: 'M' },
      { id: 'd', text: 'Menghindari konfrontasi dan berharap masalah selesai sendiri', type: 'P' },
    ],
  },
  {
    id: 5,
    text: 'Teman-teman sering menggambarkanmu sebagai orang yang...',
    options: [
      { id: 'a', text: 'Menyenangkan dan mudah bergaul', type: 'S' },
      { id: 'b', text: 'Tegas dan penuh inisiatif', type: 'K' },
      { id: 'c', text: 'Serius dan penuh pertimbangan', type: 'M' },
      { id: 'd', text: 'Sabar dan mudah diajak kerjasama', type: 'P' },
    ],
  },
  {
    id: 6,
    text: 'Ketika ada tugas kelompok, kamu cenderung...',
    options: [
      { id: 'a', text: 'Menjadi orang yang membangkitkan semangat tim', type: 'S' },
      { id: 'b', text: 'Memastikan semua orang mengerjakan tugasnya dengan benar', type: 'K' },
      { id: 'c', text: 'Fokus pada kualitas dan detail pekerjaanmu sendiri', type: 'M' },
      { id: 'd', text: 'Mengerjakan tugasmu dan membantu orang lain jika diminta', type: 'P' },
    ],
  },
  {
    id: 7,
    text: 'Bagaimana caramu menghabiskan waktu luang?',
    options: [
      { id: 'a', text: 'Hangout dan bertemu orang-orang baru', type: 'S' },
      { id: 'b', text: 'Mengerjakan proyek atau goals yang sudah direncanakan', type: 'K' },
      { id: 'c', text: 'Membaca, menulis jurnal, atau refleksi diri', type: 'M' },
      { id: 'd', text: 'Istirahat dan bersantai tanpa agenda khusus', type: 'P' },
    ],
  },
  {
    id: 8,
    text: 'Ketika mengambil keputusan besar, kamu...',
    options: [
      { id: 'a', text: 'Mengandalkan intuisi dan perasaan saat itu', type: 'S' },
      { id: 'b', text: 'Memutuskan cepat berdasarkan logika dan tujuanmu', type: 'K' },
      { id: 'c', text: 'Mempertimbangkan semua opsi dengan sangat hati-hati', type: 'M' },
      { id: 'd', text: 'Meminta pendapat orang lain sebelum memutuskan', type: 'P' },
    ],
  },
  {
    id: 9,
    text: 'Di lingkungan baru, kamu biasanya...',
    options: [
      { id: 'a', text: 'Langsung memperkenalkan diri ke semua orang', type: 'S' },
      { id: 'b', text: 'Segera mencari tahu siapa yang bisa diajak kerjasama', type: 'K' },
      { id: 'c', text: 'Mengamati dulu sebelum mulai berinteraksi', type: 'M' },
      { id: 'd', text: 'Menunggu sampai ada yang menyapa lebih dulu', type: 'P' },
    ],
  },
  {
    id: 10,
    text: 'Apa yang paling memotivasimu untuk berprestasi?',
    options: [
      { id: 'a', text: 'Pujian dan pengakuan dari orang-orang sekitar', type: 'S' },
      { id: 'b', text: 'Mencapai target dan membuktikan kemampuan diri', type: 'K' },
      { id: 'c', text: 'Melakukan sesuatu dengan benar dan berkualitas tinggi', type: 'M' },
      { id: 'd', text: 'Merasa berguna dan diterima dalam kelompok', type: 'P' },
    ],
  },
  {
    id: 11,
    text: 'Saat kamu membuat kesalahan, reaksimu adalah...',
    options: [
      { id: 'a', text: 'Tertawa dan langsung mencari cara untuk memperbaikinya', type: 'S' },
      { id: 'b', text: 'Langsung mengambil tindakan agar tidak terulang', type: 'K' },
      { id: 'c', text: 'Merasa sangat kecewa pada diri sendiri untuk sementara waktu', type: 'M' },
      { id: 'd', text: 'Menerimanya dan melanjutkan hidup tanpa terlalu memusingkan', type: 'P' },
    ],
  },
  {
    id: 12,
    text: 'Bagaimana kamu mengatasi stres?',
    options: [
      { id: 'a', text: 'Cerita ke teman atau mencari hiburan ramai', type: 'S' },
      { id: 'b', text: 'Berolahraga atau menyelesaikan tugas yang tersisa', type: 'K' },
      { id: 'c', text: 'Menyendiri, menulis, atau merenungkan masalahnya', type: 'M' },
      { id: 'd', text: 'Tidur atau istirahat sampai perasaan membaik', type: 'P' },
    ],
  },
  {
    id: 13,
    text: 'Dalam percakapan sehari-hari, kamu lebih sering...',
    options: [
      { id: 'a', text: 'Banyak bercerita dan melompat dari topik ke topik', type: 'S' },
      { id: 'b', text: 'Langsung ke intinya dan bicara dengan tujuan jelas', type: 'K' },
      { id: 'c', text: 'Berbicara dengan hati-hati dan terukur', type: 'M' },
      { id: 'd', text: 'Lebih banyak mendengar daripada berbicara', type: 'P' },
    ],
  },
  {
    id: 14,
    text: 'Jika temanmu sedang sedih, kamu akan...',
    options: [
      { id: 'a', text: 'Mengajaknya keluar atau menghiburnya dengan cara seru', type: 'S' },
      { id: 'b', text: 'Membantunya mencari solusi dari masalahnya', type: 'K' },
      { id: 'c', text: 'Mendengarkan dengan penuh empati dan sepenuh hati', type: 'M' },
      { id: 'd', text: 'Menemaninya diam dan memastikan dia tidak sendirian', type: 'P' },
    ],
  },
  {
    id: 15,
    text: 'Cara kamu mengatur jadwal dan rencana adalah...',
    options: [
      { id: 'a', text: 'Spontan saja, yang penting seru dan berjalan', type: 'S' },
      { id: 'b', text: 'Terstruktur, dengan target yang jelas dan deadline ketat', type: 'K' },
      { id: 'c', text: 'Sangat detail, termasuk kemungkinan plan B dan C', type: 'M' },
      { id: 'd', text: 'Fleksibel, mengikuti alur situasi yang ada', type: 'P' },
    ],
  },
  {
    id: 16,
    text: 'Ketika kamu tidak setuju dengan pendapat orang lain...',
    options: [
      { id: 'a', text: 'Menyampaikannya dengan humor agar tidak tegang', type: 'S' },
      { id: 'b', text: 'Langsung dan terus terang mengungkapkan ketidaksetujuanmu', type: 'K' },
      { id: 'c', text: 'Menyampaikan argumen dengan data dan bukti yang logis', type: 'M' },
      { id: 'd', text: 'Mencoba melihat dari sudut pandang mereka dulu', type: 'P' },
    ],
  },
  {
    id: 17,
    text: 'Apakah kamu termasuk orang yang mudah bosan?',
    options: [
      { id: 'a', text: 'Ya, sangat. Kamu butuh hal baru terus menerus', type: 'S' },
      { id: 'b', text: 'Hanya jika tidak ada tantangan atau tujuan yang jelas', type: 'K' },
      { id: 'c', text: 'Tidak terlalu, kamu menikmati mendalami satu hal secara mendalam', type: 'M' },
      { id: 'd', text: 'Jarang, kamu bisa menikmati rutinitas dan ketenangan', type: 'P' },
    ],
  },
  {
    id: 18,
    text: 'Apa yang paling membuatmu frustrasi?',
    options: [
      { id: 'a', text: 'Suasana yang kaku dan tidak ada ruang untuk bersenang-senang', type: 'S' },
      { id: 'b', text: 'Orang yang lambat bertindak atau tidak kompeten', type: 'K' },
      { id: 'c', text: 'Pekerjaan yang asal-asalan dan tidak memperhatikan detail', type: 'M' },
      { id: 'd', text: 'Konflik yang tidak perlu dan tekanan yang berlebihan', type: 'P' },
    ],
  },
  {
    id: 19,
    text: 'Kamu merasa paling nyaman ketika...',
    options: [
      { id: 'a', text: 'Dikelilingi banyak orang dan suasana ramai', type: 'S' },
      { id: 'b', text: 'Mengendalikan situasi dan memimpin tim', type: 'K' },
      { id: 'c', text: 'Bekerja sendiri dengan konsentrasi penuh', type: 'M' },
      { id: 'd', text: 'Berada dalam lingkungan yang tenang dan tidak ada konflik', type: 'P' },
    ],
  },
  {
    id: 20,
    text: 'Saat merencanakan liburan bersama teman, kamu...',
    options: [
      { id: 'a', text: 'Langsung mengusulkan banyak ide seru dan mengumpulkan orang', type: 'S' },
      { id: 'b', text: 'Membuat itinerary dan memastikan semua orang setuju', type: 'K' },
      { id: 'c', text: 'Meneliti tempat terbaik dan mempertimbangkan semua detailnya', type: 'M' },
      { id: 'd', text: 'Ikut kemana saja, yang penting bersama dan tidak ribet', type: 'P' },
    ],
  },
  {
    id: 21,
    text: 'Apa pendapatmu tentang aturan dan prosedur?',
    options: [
      { id: 'a', text: 'Sering melanggarnya jika terasa membosankan atau menghambat', type: 'S' },
      { id: 'b', text: 'Mengikutinya jika masuk akal, tapi berani mengubahnya jika tidak', type: 'K' },
      { id: 'c', text: 'Menghormatinya karena ada alasan di balik setiap aturan', type: 'M' },
      { id: 'd', text: 'Mengikutinya tanpa terlalu banyak mempertanyakan', type: 'P' },
    ],
  },
  {
    id: 22,
    text: 'Dalam situasi darurat atau kritis, kamu...',
    options: [
      { id: 'a', text: 'Panik sesaat tapi cepat pulih dan mencoba menenangkan orang', type: 'S' },
      { id: 'b', text: 'Langsung mengambil alih dan mengoordinasikan semua orang', type: 'K' },
      { id: 'c', text: 'Menganalisis situasi dengan tenang sebelum bertindak', type: 'M' },
      { id: 'd', text: 'Tetap tenang dan mengikuti arahan yang ada', type: 'P' },
    ],
  },
  {
    id: 23,
    text: 'Kamu merasa energimu terisi kembali setelah...',
    options: [
      { id: 'a', text: 'Bertemu banyak orang dan bersosialisasi dengan seru', type: 'S' },
      { id: 'b', text: 'Menyelesaikan tugas atau mencapai target tertentu', type: 'K' },
      { id: 'c', text: 'Menyendiri dan merenung dengan tenang', type: 'M' },
      { id: 'd', text: 'Beristirahat total tanpa agenda apapun', type: 'P' },
    ],
  },
  {
    id: 24,
    text: 'Bagaimana kamu merespons kritik dari orang lain?',
    options: [
      { id: 'a', text: 'Terkadang defensif di awal, tapi cepat move on', type: 'S' },
      { id: 'b', text: 'Menerimanya jika logis, menolaknya jika tidak berdasar', type: 'K' },
      { id: 'c', text: 'Merenungkannya dalam-dalam dan cenderung memengaruhi suasana hati', type: 'M' },
      { id: 'd', text: 'Menerimanya dengan tenang dan mencoba memperbaiki diri', type: 'P' },
    ],
  },
  {
    id: 25,
    text: 'Jika ada proyek yang deadline-nya sudah dekat, kamu...',
    options: [
      { id: 'a', text: 'Baru mulai mengerjakan serius di hari-hari terakhir', type: 'S' },
      { id: 'b', text: 'Mendorong semua orang untuk bekerja lebih keras dan cepat', type: 'K' },
      { id: 'c', text: 'Sudah jauh-jauh hari memulai agar hasilnya sempurna', type: 'M' },
      { id: 'd', text: 'Mengerjakan sesuai kemampuan tanpa terlalu stres', type: 'P' },
    ],
  },
  {
    id: 26,
    text: 'Saat berhadapan dengan orang yang sangat berbeda darimu, kamu...',
    options: [
      { id: 'a', text: 'Merasa excited dan penasaran ingin mengenal mereka', type: 'S' },
      { id: 'b', text: 'Menilai apakah mereka bisa diajak kerjasama secara efektif', type: 'K' },
      { id: 'c', text: 'Mengamati dan memahami perbedaan itu dengan penuh rasa ingin tahu', type: 'M' },
      { id: 'd', text: 'Berusaha menemukan kesamaan dan menjaga hubungan tetap harmonis', type: 'P' },
    ],
  },
  {
    id: 27,
    text: 'Apa yang paling sering orang perlukan darimu?',
    options: [
      { id: 'a', text: 'Keceriaan dan semangat yang menular', type: 'S' },
      { id: 'b', text: 'Keputusan cepat dan kepemimpinan yang tegas', type: 'K' },
      { id: 'c', text: 'Analisis mendalam dan pertimbangan yang matang', type: 'M' },
      { id: 'd', text: 'Ketenangan dan rasa aman yang menenangkan', type: 'P' },
    ],
  },
  {
    id: 28,
    text: 'Bagaimana kamu biasanya bersikap terhadap orang baru?',
    options: [
      { id: 'a', text: 'Hangat dan langsung bisa akrab dalam hitungan menit', type: 'S' },
      { id: 'b', text: 'Profesional dan fokus pada apa yang bisa dilakukan bersama', type: 'K' },
      { id: 'c', text: 'Hati-hati dan perlu waktu lebih lama untuk membuka diri', type: 'M' },
      { id: 'd', text: 'Ramah tapi tidak terburu-buru untuk menjadi terlalu dekat', type: 'P' },
    ],
  },
  {
    id: 29,
    text: 'Nilai apa yang paling kamu pegang teguh dalam hidup?',
    options: [
      { id: 'a', text: 'Kebebasan dan kesenangan untuk menikmati setiap momen', type: 'S' },
      { id: 'b', text: 'Pencapaian dan dampak nyata yang bisa dirasakan orang lain', type: 'K' },
      { id: 'c', text: 'Integritas, kedalaman, dan kualitas dalam segala hal', type: 'M' },
      { id: 'd', text: 'Kedamaian, kesetiaan, dan keharmonisan dalam hubungan', type: 'P' },
    ],
  },
  {
    id: 30,
    text: 'Saat bekerja, kamu lebih suka...',
    options: [
      { id: 'a', text: 'Lingkungan yang dinamis, penuh interaksi dan perubahan', type: 'S' },
      { id: 'b', text: 'Memiliki otoritas dan kebebasan untuk mengambil keputusan', type: 'K' },
      { id: 'c', text: 'Standar kualitas yang jelas dan waktu untuk berkonsentrasi', type: 'M' },
      { id: 'd', text: 'Rutinitas yang konsisten dan lingkungan yang harmonis', type: 'P' },
    ],
  },
  {
    id: 31,
    text: 'Bagaimana pandanganmu tentang masa depan?',
    options: [
      { id: 'a', text: 'Penuh dengan kemungkinan seru yang tidak bisa diprediksi', type: 'S' },
      { id: 'b', text: 'Sesuatu yang harus direncanakan dan diperjuangkan dengan target', type: 'K' },
      { id: 'c', text: 'Sesuatu yang perlu dipikirkan matang-matang dengan berbagai pertimbangan', type: 'M' },
      { id: 'd', text: 'Akan baik-baik saja asalkan jalani hari ini dengan baik', type: 'P' },
    ],
  },
  {
    id: 32,
    text: 'Ketika seseorang menyela atau memotong pembicaraanmu, reaksimu...',
    options: [
      { id: 'a', text: 'Tidak terlalu masalah, kamu langsung menyesuaikan diri', type: 'S' },
      { id: 'b', text: 'Merasa tidak dihormati dan langsung menegurnya', type: 'K' },
      { id: 'c', text: 'Merasa terganggu tapi lebih banyak memendam perasaan itu', type: 'M' },
      { id: 'd', text: 'Membiarkannya dan menunggu giliran berbicara lagi', type: 'P' },
    ],
  },
  {
    id: 33,
    text: 'Apa yang membuatmu paling bangga pada dirimu sendiri?',
    options: [
      { id: 'a', text: 'Kemampuanmu membuat orang lain merasa senang dan diterima', type: 'S' },
      { id: 'b', text: 'Kemampuanmu memimpin dan menggerakkan orang menuju tujuan', type: 'K' },
      { id: 'c', text: 'Ketelitian dan dedikasimu dalam menghasilkan karya berkualitas', type: 'M' },
      { id: 'd', text: 'Kemampuanmu menjaga ketenangan dan keseimbangan di tengah tekanan', type: 'P' },
    ],
  },
  {
    id: 34,
    text: 'Jika harus memilih karier impian, kamu akan memilih...',
    options: [
      { id: 'a', text: 'Profesi yang melibatkan banyak orang, panggung, atau media', type: 'S' },
      { id: 'b', text: 'Posisi kepemimpinan, bisnis, atau pengambil keputusan strategis', type: 'K' },
      { id: 'c', text: 'Pekerjaan yang memerlukan riset mendalam, seni, atau kesempurnaan teknis', type: 'M' },
      { id: 'd', text: 'Pekerjaan yang stabil, membantu orang lain, dan tidak terlalu kompetitif', type: 'P' },
    ],
  },
  {
    id: 35,
    text: 'Secara keseluruhan, orang-orang mengenalmu sebagai...',
    options: [
      { id: 'a', text: 'Si penyemangat: energik, lucu, dan selalu bisa membuat suasana hidup', type: 'S' },
      { id: 'b', text: 'Si pemimpin: berani, tegas, dan selalu tahu apa yang harus dilakukan', type: 'K' },
      { id: 'c', text: 'Si pemikir: dalam, penuh pertimbangan, dan selalu mencari makna', type: 'M' },
      { id: 'd', text: 'Si penyeimbang: tenang, setia, dan selalu jadi tempat bersandar', type: 'P' },
    ],
  },
];

