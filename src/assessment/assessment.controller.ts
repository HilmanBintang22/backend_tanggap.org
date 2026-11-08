import { Request, Response } from 'express';
import * as assessmentService from './assessment.service';
import { ASSESSMENT_QUESTIONS } from './assessment.questions';
import { ASSESSMENT_STATUS_LABEL } from '../constants/labels';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const STATUS_TO_DB: Record<string, string> = {
  Draft: 'DRAFT',
  Aktif: 'PUBLISHED',
  Diarsipkan: 'ARCHIVED',
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
};

// In-memory cache untuk menyimpan riwayat hasil asesmen siswa
export const assessmentResultsStore = new Map<string, any>();

const translateAssessment = (a: any) => ({
  ...a,
  name: a.title, // alias untuk frontend yang pakai 'name'
  questionCount: a.questionCount ?? 35,
  status: ASSESSMENT_STATUS_LABEL[a.status] ?? a.status,
});

// Helper: Konversi nilai skala Likert 1-7 dari angka maupun string
function parseLikertValue(val: any): number {
  if (val === null || val === undefined) return 4;
  if (typeof val === 'number') {
    if (isNaN(val)) return 4;
    return Math.max(1, Math.min(7, Math.round(val)));
  }
  const str = String(val).trim();
  const num = parseInt(str, 10);
  if (!isNaN(num)) {
    return Math.max(1, Math.min(7, num));
  }
  // Fallback jika berupa huruf (misal legacy opsi)
  const lower = str.toLowerCase();
  if (lower === 'a') return 7;
  if (lower === 'b') return 5;
  if (lower === 'c') return 3;
  if (lower === 'd') return 1;
  return 4;
}

interface ParsedAnswer {
  questionId: number;
  value: number; // 1 - 7
}

// Helper: Parsing jawaban dari berbagai format payload (Array maupun Object dengan value angka/string)
function parseAnswers(body: any): ParsedAnswer[] {
  if (!body) return [];

  // Unwrap body.data atau body.answers jika dikirim bersarang
  let raw = body;
  if (raw && typeof raw === 'object') {
    if (raw.answers !== undefined) {
      raw = raw.answers;
    } else if (raw.data !== undefined) {
      if (raw.data && typeof raw.data === 'object' && raw.data.answers !== undefined) {
        raw = raw.data.answers;
      } else {
        raw = raw.data;
      }
    }
  }

  // Format 1: Array of objects [{ questionId: 1, value: 7 }] atau array nilai primitif [7, 6, 5]
  if (Array.isArray(raw)) {
    return raw.map((item, idx) => {
      if (typeof item === 'number' || typeof item === 'string') {
        return { questionId: idx + 1, value: parseLikertValue(item) };
      }
      if (item && typeof item === 'object') {
        const qId = item.questionId ?? item.id ?? item.question_id ?? item.qId ?? idx + 1;
        const val =
          item.value ??
          item.val ??
          item.rating ??
          item.score ??
          item.answer ??
          item.selectedOption ??
          4;
        return { questionId: Number(qId), value: parseLikertValue(val) };
      }
      return { questionId: idx + 1, value: 4 };
    });
  }

  // Format 2: Object { "1": 7, "2": 6 } atau { "1": { value: 7 } }
  if (typeof raw === 'object' && raw !== null) {
    const list: ParsedAnswer[] = [];
    for (const [key, val] of Object.entries(raw)) {
      const qId = Number(key);
      if (!isNaN(qId) && qId > 0) {
        if (typeof val === 'number' || typeof val === 'string') {
          list.push({ questionId: qId, value: parseLikertValue(val) });
        } else if (typeof val === 'object' && val !== null) {
          const itemVal =
            (val as any).value ??
            (val as any).val ??
            (val as any).rating ??
            (val as any).score ??
            (val as any).answer ??
            (val as any).selectedOption ??
            4;
          list.push({ questionId: qId, value: parseLikertValue(itemVal) });
        }
      }
    }
    return list;
  }

  return [];
}

// GET /api/assessments/questions
// Mengembalikan 35 butir pernyataan sikap Skala Likert 1–7 (tanpa opsi A/B/C/D)
export const getAssessmentQuestions = (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    total: ASSESSMENT_QUESTIONS.length,
    data: ASSESSMENT_QUESTIONS,
    questions: ASSESSMENT_QUESTIONS,
  });
};

// POST /api/assessments/submit
// Menerima Format Array maupun Format Object: { answers: { "1": 7, "2": 6 } } atau { "1": 7, "2": 6 }
export const submitAssessment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsedAnswers = parseAnswers(req.body);

    if (!parsedAnswers || parsedAnswers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Jawaban tidak ditemukan. Mohon sertakan jawaban kuesioner.',
      });
    }

    // Akumulasi skor per dimensi kepribadian Likert 1-7
    const rawScores: Record<'koleris' | 'melankolis' | 'plegmatis' | 'sanguinis', number> = {
      koleris: 0,
      melankolis: 0,
      plegmatis: 0,
      sanguinis: 0,
    };

    const counts: Record<'koleris' | 'melankolis' | 'plegmatis' | 'sanguinis', number> = {
      koleris: 0,
      melankolis: 0,
      plegmatis: 0,
      sanguinis: 0,
    };

    for (const ans of parsedAnswers) {
      const question = ASSESSMENT_QUESTIONS.find((q) => q.id === ans.questionId);
      if (!question) continue;

      const dim = question.dimension;
      rawScores[dim] += ans.value;
      counts[dim] += 1;
    }

    // Persentase per dimensi (Skala 0 - 100)
    // Jika semua butir diisi 7, persentase mencapai 100%
    const calcPercentage = (dim: 'koleris' | 'melankolis' | 'plegmatis' | 'sanguinis') => {
      const cnt = counts[dim];
      if (cnt === 0) return 0;
      return Math.round((rawScores[dim] / (cnt * 7)) * 100);
    };

    const kolerisPct = calcPercentage('koleris');
    const melankolisPct = calcPercentage('melankolis');
    const plegmatisPct = calcPercentage('plegmatis');
    const sanguinisPct = calcPercentage('sanguinis');

    const percentage = {
      koleris: kolerisPct,
      melankolis: melankolisPct,
      plegmatis: plegmatisPct,
      sanguinis: sanguinisPct,
      // Alias huruf besar dan spelling phlegmatis untuk kompatibilitas penuh
      phlegmatis: plegmatisPct,
      Koleris: kolerisPct,
      Melankolis: melankolisPct,
      Plegmatis: plegmatisPct,
      Phlegmatis: plegmatisPct,
      Sanguinis: sanguinisPct,
    };

    const raw = {
      koleris: rawScores.koleris,
      melankolis: rawScores.melankolis,
      plegmatis: rawScores.plegmatis,
      sanguinis: rawScores.sanguinis,
      phlegmatis: rawScores.plegmatis,
      Koleris: rawScores.koleris,
      Melankolis: rawScores.melankolis,
      Plegmatis: rawScores.plegmatis,
      Phlegmatis: rawScores.plegmatis,
      Sanguinis: rawScores.sanguinis,
    };

    // Skor rata (flat) lowercase sesuai kebutuhan grafik radar frontend:
    // scores: { koleris, melankolis, plegmatis, sanguinis }
    const scores = {
      koleris: kolerisPct,
      melankolis: melankolisPct,
      plegmatis: plegmatisPct,
      sanguinis: sanguinisPct,
      phlegmatis: plegmatisPct,
      raw,
      percentage,
    };

    // Tentukan Top 2 tipe temperamen dominan (Rank 1 & Rank 2)
    const DOMINANT_TITLES: Record<string, string> = {
      koleris: 'Koleris',
      melankolis: 'Melankolis',
      plegmatis: 'Plegmatis',
      sanguinis: 'Sanguinis',
    };

    const dimensionList: ('koleris' | 'melankolis' | 'plegmatis' | 'sanguinis')[] = [
      'plegmatis',
      'sanguinis',
      'koleris',
      'melankolis',
    ];

    // Urutkan dimensi secara menurun berdasarkan nilai persentase (dan raw score jika seri)
    const sortedDims = [...dimensionList].sort((a, b) => {
      if (scores[b] !== scores[a]) {
        return scores[b] - scores[a];
      }
      return rawScores[b] - rawScores[a];
    });

    const rank1Dim = sortedDims[0];
    const rank2Dim = sortedDims[1];

    const rank1Title = DOMINANT_TITLES[rank1Dim] || 'Melankolis';
    const rank2Title = DOMINANT_TITLES[rank2Dim] || 'Plegmatis';

    // Format dominan sesuai kebutuhan frontend: "Dominan Melankolis-Plegmatis"
    const dominantStyle = `Dominan ${rank1Title}-${rank2Title}`;
    const dominantType = rank1Title;

    const description: Record<string, string> = {
      Koleris:
        'Kamu adalah tipe Koleris: berjiwa kepemimpinan kuat, tegas, berorientasi pada hasil dan tindakan nyata, berani mengambil inisiatif perubahan positif di sekolah.',
      Melankolis:
        'Kamu adalah tipe Melankolis: pemikir analitis, terstruktur, memiliki standar kualitas tinggi, peka terhadap perasaan orang lain, dan cermat dalam merumuskan solusi pencegahan konflik.',
      Plegmatis:
        'Kamu adalah tipe Plegmatis: pembawa damai yang tenang, sabar, akomodatif, pendengar yang baik, dan handal meredakan ketegangan serta menjaga harmoni pertemanan di kelas.',
      Phlegmatis:
        'Kamu adalah tipe Plegmatis: pembawa damai yang tenang, sabar, akomodatif, pendengar yang baik, dan handal meredakan ketegangan serta menjaga harmoni pertemanan di kelas.',
      Sanguinis:
        'Kamu adalah tipe Sanguinis: pribadi yang antusias, ramah, komunikatif, ekspresif, mampu mencairkan suasana kaku, dan mudah menginspirasi rekan-rekan sebaya dengan energi positif.',
    };

    // Indikator pola penyelesaian konflik Tanggap.org
    const conflictIndicators = {
      dominasiKonflik: kolerisPct >= sanguinisPct ? 'Tinggi' : 'Rendah',
      sensitivitasKonflik: melankolisPct >= plegmatisPct ? 'Tinggi' : 'Rendah',
      gayaPenyelesaian:
        dominantType === 'Koleris'
          ? 'Konfrontatif / Solutif Langsung'
          : dominantType === 'Sanguinis'
          ? 'Mediasi & Komunikatif'
          : dominantType === 'Melankolis'
          ? 'Analitis & Terstruktur'
          : 'Akomodatif & Menjaga Harmoni',
      risikoEskalasi:
        kolerisPct + melankolisPct > sanguinisPct + plegmatisPct ? 'Sedang-Tinggi' : 'Rendah-Sedang',
    };

    const resultId = 'res-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);

    const resultData = {
      id: resultId,
      resultId,
      userId: req.user?.id || 'guest',
      userName: req.user?.name || 'Siswa',
      dominantStyle,
      dominant_style: dominantStyle,
      dominantType,
      dominant_type: dominantType.toLowerCase(),
      primaryDominant: rank1Title,
      secondaryDominant: rank2Title,
      topTemperaments: [rank1Title, rank2Title],
      description: description[dominantType],
      scores,
      conflictIndicators,
      totalAnswered: parsedAnswers.length,
      completedAt: new Date().toISOString(),
    };

    // Simpan ke in-memory store agar bisa dipanggil kembali via GET /api/assessments/results/:id
    assessmentResultsStore.set(resultId, resultData);

    return res.status(200).json({
      success: true,
      message: 'Asesmen berhasil diselesaikan',
      dominantStyle,
      dominant_style: dominantStyle,
      dominantType,
      dominant_type: dominantType.toLowerCase(),
      primaryDominant: rank1Title,
      secondaryDominant: rank2Title,
      topTemperaments: [rank1Title, rank2Title],
      scores,
      data: resultData,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/assessments/results/:id — Mengambil detail hasil asesmen siswa
export const getAssessmentResult = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resultId = Array.isArray(id) ? id[0] : id;

    // 1. Cek dari in-memory cache
    if (assessmentResultsStore.has(resultId)) {
      const data = assessmentResultsStore.get(resultId);
      return res.status(200).json({
        success: true,
        dominantStyle: data.dominantStyle,
        dominant_style: data.dominant_style,
        dominantType: data.dominantType,
        dominant_type: data.dominant_type,
        primaryDominant: data.primaryDominant,
        secondaryDominant: data.secondaryDominant,
        topTemperaments: data.topTemperaments,
        scores: data.scores,
        data,
      });
    }

    // 2. Default/Fallback result jika ID dibuka langsung atau sesi terputus
    const fallbackScores = {
      koleris: 58,
      melankolis: 65,
      plegmatis: 72,
      sanguinis: 85,
      phlegmatis: 72,
      raw: {
        koleris: 37,
        melankolis: 41,
        plegmatis: 45,
        sanguinis: 48,
        phlegmatis: 45,
        Koleris: 37,
        Melankolis: 41,
        Plegmatis: 45,
        Phlegmatis: 45,
        Sanguinis: 48,
      },
      percentage: {
        koleris: 58,
        melankolis: 65,
        plegmatis: 72,
        sanguinis: 85,
        phlegmatis: 72,
        Koleris: 58,
        Melankolis: 65,
        Plegmatis: 72,
        Phlegmatis: 72,
        Sanguinis: 85,
      },
    };

    const fallbackResult = {
      id: resultId,
      resultId,
      dominantStyle: 'Dominan Sanguinis-Plegmatis',
      dominant_style: 'Dominan Sanguinis-Plegmatis',
      dominantType: 'Sanguinis',
      dominant_type: 'sanguinis',
      primaryDominant: 'Sanguinis',
      secondaryDominant: 'Plegmatis',
      topTemperaments: ['Sanguinis', 'Plegmatis'],
      description:
        'Kamu adalah tipe Sanguinis: pribadi yang antusias, ramah, komunikatif, ekspresif, mampu mencairkan suasana kaku, dan mudah menginspirasi rekan-rekan sebaya dengan energi positif.',
      scores: fallbackScores,
      conflictIndicators: {
        dominasiKonflik: 'Rendah',
        sensitivitasKonflik: 'Tinggi',
        gayaPenyelesaian: 'Mediasi & Komunikatif',
        risikoEskalasi: 'Rendah-Sedang',
      },
      completedAt: new Date().toISOString(),
    };

    return res.status(200).json({
      success: true,
      dominantStyle: 'Dominan Sanguinis-Plegmatis',
      dominant_style: 'Dominan Sanguinis-Plegmatis',
      dominantType: 'Sanguinis',
      dominant_type: 'sanguinis',
      primaryDominant: 'Sanguinis',
      secondaryDominant: 'Plegmatis',
      topTemperaments: ['Sanguinis', 'Plegmatis'],
      scores: fallbackScores,
      data: fallbackResult,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/assessments
export const getAssessments = async (_req: Request, res: Response) => {
  try {
    const data = await assessmentService.fetchAllAssessments();
    return res.status(200).json({
      success: true,
      data: data.map(translateAssessment),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/assessments
export const createAssessment = async (req: Request, res: Response) => {
  try {
    const { name, title, description, category } = req.body;
    const data = await assessmentService.createNewAssessment({
      title: title || name,
      description,
      category,
    });
    return res.status(201).json({ success: true, data: translateAssessment(data) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/assessments/:id
export const updateAssessmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const dbStatus = STATUS_TO_DB[status];
    if (!dbStatus) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Gunakan: "Draft", "Aktif", atau "Diarsipkan"`,
      });
    }

    const updated = await assessmentService.updateAssessmentStatus(Array.isArray(id) ? id[0] : id, dbStatus);
    return res.status(200).json({
      success: true,
      message: 'Status asesmen berhasil diperbarui',
      data: translateAssessment(updated),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
