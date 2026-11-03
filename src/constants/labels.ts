// Mapping role database (English) ke bahasa Indonesia untuk response frontend
export const ROLE_LABEL: Record<string, string> = {
  STUDENT: 'Siswa',
  TEACHER_BK: 'Guru BK',
  SCHOOL_ADMIN: 'Admin Sekolah',
  SUPER_ADMIN: 'Super Admin',
};

// Mapping status lead (English) ke bahasa Indonesia
export const LEAD_STATUS_LABEL: Record<string, string> = {
  NEW: 'Menunggu ditinjau',
  CONTACTED: 'Sedang diproses',
  SENT: 'Disetujui',
};

// Mapping status asesmen (English) ke bahasa Indonesia
export const ASSESSMENT_STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Aktif',
  ARCHIVED: 'Diarsipkan',
};

