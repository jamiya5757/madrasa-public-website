/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Lesson {
  id: string;
  date: string;          // e.g., "৮ অক্টোবর ২০২৬"
  isoDate: string;       // e.g., "2026-10-08"
  hijriDate?: string;    // e.g., "১৫ রবিউস সানি ১৪৪৮ হিজরি"
  dayName: string;       // e.g., "বৃহস্পতিবার"
  className: string;     // e.g., "নূরানী"
  classLevel?: string;   // "shishu" | "first"
  section?: string;      // e.g., "শাখা: আল-ফালাহ"
  lessonTitle: string;   // Main subject topic
  qaida: string;         // Qaida & page information
  ampara?: string;       // Quran / Ampara lesson
  duaOrHadith?: string;  // Daily Dua, Hadith or Kalima
  homework: string;      // Homework details
  note?: string;         // Important note for parents
  teacherName?: string;  // Mu'allim / Teacher name
  lessonItems?: LessonItemRecord[]; // Raw items array from Supabase with book_name & teacher_name
  createdAt: string;
  updatedAt: string;
}

export interface MadrasaInfo {
  name: string;
  tagline: string;
  establishedYear: string;
  boardAffiliation: string;
  address: string;
  primaryPhone: string;
  secondaryPhone?: string;
  whatsappNumber: string;
  email: string;
  classTiming: string;
  parentConsultationHours: string;
}

/**
 * Database schema representations for Supabase tables
 */
export interface LessonItemRecord {
  id: string;
  daily_lesson_id: string;
  section_type: 'madrasah' | 'home';
  item_order: number;
  lesson_text: string;
  book_name?: string;
  teacher_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DailyLessonRecord {
  id: string;
  lesson_date: string; // YYYY-MM-DD
  category: string;    // 'noorani' | 'najera' | 'hifz' | 'kitab'
  class_level?: string; // 'shishu' | 'first'
  published: boolean;
  created_at?: string;
  updated_at?: string;
  lesson_items?: LessonItemRecord[];
}

export interface HifzDailyLog {
  id?: string;
  weekly_record_id?: string;
  day_index: number; // 0: শনিবার, 1: রবিবার, 2: সোমবার, 3: মঙ্গলবার, 4: বুধবার, 5: বৃহস্পতিবার, 6:শুক্রবার
  day_name: string;
  sabak_para?: string | null;
  sabak_page?: string | null;
  sabat_sabak_para?: string | null;
  sabat_sabak_page?: string | null;
  sabat_sabak_amount?: string | null;
  sabat_sabak_mistakes?: number;
  amukhta_para?: string | null;
  amukhta_page?: string | null;
  amukhta_amount?: string | null;
  amukhta_mistakes?: number;
  tilawat_details?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface HifzStudentItem {
  id: string;
  name: string;
  admission_form_no?: string | null;
  student_id?: string | null;
  photo_url?: string | null;
  has_published_records?: boolean;
}

export interface HifzWeeklyRecord {
  id: string;
  student_id: string;
  student_name: string;
  student_form_no?: string | null;
  student_roll_no?: string | null;
  photo_url?: string | null;
  year: number;
  month: number; // 1 to 12
  week: string; // '১ম' | '২য়' | '৩য়' | '৪র্থ' | '৫ম'
  shabina_total?: string | null;
  paras_read?: string | null;
  total_lokma: number;
  is_published: boolean;
  daily_logs?: HifzDailyLog[];
  created_at?: string;
  updated_at?: string;
}
