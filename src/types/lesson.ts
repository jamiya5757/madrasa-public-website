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
