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

const translateAssessment = (a: any) => ({
  ...a,
  name: a.title, // alias untuk frontend yang pakai 'name'
  questionCount: a.questionCount ?? 35,
  status: ASSESSMENT_STATUS_LABEL[a.status] ?? a.status,
});

// GET /api/assessments/questions
export const getAssessmentQuestions = (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    total: ASSESSMENT_QUESTIONS.length,
    data: ASSESSMENT_QUESTIONS,
  });
};

// POST /api/assessments/submit
// Body: { answers: [{ questionId: 1, selectedOption: 'a' }, ...] }
export const submitAssessment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { answers } = req.body as { answers: { questionId: number; selectedOption: string }[] };

    if (!answers || !Array.isArray(answers) || answers.length !== 35) {
      return res.status(400).json({
        success: false,
        message: `Jawaban tidak lengkap. Harus ada tepat 35 jawaban, diterima: ${answers?.length ?? 0}`,
      });
    }

    // Hitung skor per tipe temperamen
    const score: Record<string, number> = { S: 0, K: 0, M: 0, P: 0 };

    for (const answer of answers) {
      const question = ASSESSMENT_QUESTIONS.find((q) => q.id === answer.questionId);
      if (!question) continue;
      const option = question.options.find((o) => o.id === answer.selectedOption);
      if (option) {
        score[option.type] = (score[option.type] || 0) + 1;
      }
    }

    const total = Object.values(score).reduce((a, b) => a + b, 0);
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

    // Indikator konflik (berdasarkan kombinasi skor)
    const conflictIndicators = {
      dominasiKonflik: score.K > score.S ? 'Tinggi' : 'Rendah',
      sensitivitasKonflik: score.M > score.P ? 'Tinggi' : 'Rendah',
      gayaPenyelesaian: dominantType === 'Koleris' ? 'Konfrontatif' :
        dominantType === 'Sanguinis' ? 'Mediasi' :
        dominantType === 'Melankolis' ? 'Analitis' : 'Menghindar',
      risikoEskalasi: (score.K + score.M) > (score.S + score.P) ? 'Sedang-Tinggi' : 'Rendah-Sedang',
    };

    return res.status(200).json({
      success: true,
      message: 'Asesmen berhasil diselesaikan',
      data: {
        userId: req.user?.id,
        dominantType,
        description: description[dominantType],
        scores: {
          raw: { Sanguinis: score.S, Koleris: score.K, Melankolis: score.M, Phlegmatis: score.P },
          percentage,
        },
        conflictIndicators,
        completedAt: new Date().toISOString(),
      },
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
      title: title || name, // support kedua field
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
