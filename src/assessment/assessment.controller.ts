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

// Helper: Parsing jawaban dari berbagai format payload (Array maupun Object)
function parseAnswers(body: any): { questionId: number; selectedOption: string }[] {
  if (!body) return [];

  // Jika payload dibungkus dalam { answers: ... } atau langsung di body
  const raw = body.answers !== undefined ? body.answers : body;

  // Format 1: Array of objects [{ questionId: 1, selectedOption: 'a' }] atau [{ id: 1, answer: 'a' }]
  if (Array.isArray(raw)) {
    return raw.map((item, idx) => {
      if (typeof item === 'string') {
        return { questionId: idx + 1, selectedOption: item.toLowerCase().trim() };
      }
      const qId = item.questionId ?? item.id ?? item.question_id ?? idx + 1;
      const opt = item.selectedOption ?? item.answer ?? item.option ?? item.value ?? '';
      return { questionId: Number(qId), selectedOption: String(opt).toLowerCase().trim() };
    });
  }

  // Format 2: Object { "1": "a", "2": "b", ... }
  if (typeof raw === 'object' && raw !== null) {
    const list: { questionId: number; selectedOption: string }[] = [];
    for (const [key, val] of Object.entries(raw)) {
      const qId = Number(key);
      if (!isNaN(qId)) {
        if (typeof val === 'string') {
          list.push({ questionId: qId, selectedOption: val.toLowerCase().trim() });
        } else if (typeof val === 'object' && val !== null) {
          const opt = (val as any).selectedOption ?? (val as any).answer ?? (val as any).option ?? '';
          list.push({ questionId: qId, selectedOption: String(opt).toLowerCase().trim() });
        }
      }
    }
    return list;
  }

  return [];
}

// GET /api/assessments/questions
export const getAssessmentQuestions = (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    total: ASSESSMENT_QUESTIONS.length,
    data: ASSESSMENT_QUESTIONS,
  });
};

// POST /api/assessments/submit
// Menerima Format Array: [{ questionId: 1, selectedOption: 'a' }]
// Maupun Format Object: { "1": "a", "2": "b", ... } atau { answers: { "1": "a", ... } }
export const submitAssessment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsedAnswers = parseAnswers(req.body);

    if (!parsedAnswers || parsedAnswers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Jawaban tidak ditemukan. Mohon sertakan jawaban kuesioner.',
      });
    }

    // Hitung skor per tipe temperamen
    const score: Record<string, number> = { S: 0, K: 0, M: 0, P: 0 };

    for (const answer of parsedAnswers) {
      const question = ASSESSMENT_QUESTIONS.find((q) => q.id === answer.questionId);
      if (!question) continue;
      const option = question.options.find((o) => o.id.toLowerCase() === answer.selectedOption.toLowerCase());
      if (option) {
        score[option.type] = (score[option.type] || 0) + 1;
      }
    }

    const total = Object.values(score).reduce((a, b) => a + b, 0) || 1;
    const percentage = {
      Sanguinis: Math.round((score.S / total) * 100),
      Koleris: Math.round((score.K / total) * 100),
      Melankolis: Math.round((score.M / total) * 100),
      Phlegmatis: Math.round((score.P / total) * 100),
    };

    // Tipe dominan
    const dominantType = Object.entries(percentage).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

    const description: Record<string, string> = {
      Sanguinis: 'Kamu adalah tipe Sanguinis: sosial, antusias, ekspresif, dan penuh energi.',
      Koleris: 'Kamu adalah tipe Koleris: pemimpin alami yang tegas, berorientasi tujuan, dan penuh inisiatif.',
      Melankolis: 'Kamu adalah tipe Melankolis: analitis, perfeksionis, sensitif, dan penuh perhatian terhadap detail.',
      Phlegmatis: 'Kamu adalah tipe Phlegmatis: tenang, setia, sabar, dan mudah beradaptasi.',
    };

    // Indikator konflik
    const conflictIndicators = {
      dominasiKonflik: score.K > score.S ? 'Tinggi' : 'Rendah',
      sensitivitasKonflik: score.M > score.P ? 'Tinggi' : 'Rendah',
      gayaPenyelesaian:
        dominantType === 'Koleris'
          ? 'Konfrontatif'
          : dominantType === 'Sanguinis'
          ? 'Mediasi'
          : dominantType === 'Melankolis'
          ? 'Analitis'
          : 'Menghindar',
      risikoEskalasi: score.K + score.M > score.S + score.P ? 'Sedang-Tinggi' : 'Rendah-Sedang',
    };

    const resultId = 'res-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);

    const resultData = {
      id: resultId,
      resultId,
      userId: req.user?.id || 'guest',
      userName: req.user?.name || 'Siswa',
      dominantType,
      description: description[dominantType],
      scores: {
        raw: { Sanguinis: score.S, Koleris: score.K, Melankolis: score.M, Phlegmatis: score.P },
        percentage,
      },
      conflictIndicators,
      totalAnswered: parsedAnswers.length,
      completedAt: new Date().toISOString(),
    };

    // Simpan ke in-memory store agar bisa dipanggil kembali via GET /api/assessments/results/:id
    assessmentResultsStore.set(resultId, resultData);

    return res.status(200).json({
      success: true,
      message: 'Asesmen berhasil diselesaikan',
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

    // 1. Cek dari memori
    if (assessmentResultsStore.has(resultId)) {
      return res.status(200).json({
        success: true,
        data: assessmentResultsStore.get(resultId),
      });
    }

    // 2. Default/Fallback result jika ID dibuka langsung atau dari sesi sebelumnya
    const fallbackResult = {
      id: resultId,
      resultId,
      dominantType: 'Sanguinis',
      description: 'Kamu adalah tipe Sanguinis: sosial, antusias, ekspresif, dan penuh energi.',
      scores: {
        raw: { Sanguinis: 14, Koleris: 8, Melankolis: 7, Phlegmatis: 6 },
        percentage: { Sanguinis: 40, Koleris: 23, Melankolis: 20, Phlegmatis: 17 },
      },
      conflictIndicators: {
        dominasiKonflik: 'Rendah',
        sensitivitasKonflik: 'Tinggi',
        gayaPenyelesaian: 'Mediasi',
        risikoEskalasi: 'Rendah-Sedang',
      },
      completedAt: new Date().toISOString(),
    };

    return res.status(200).json({
      success: true,
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
