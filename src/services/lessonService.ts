/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from '../lib/supabase';
import { Lesson, MadrasaInfo, DailyLessonRecord } from '../types/lesson';

const MOCK_MADRASA_INFO: MadrasaInfo = {
  name: 'জামিয়া আরাবিয়া মদিনাতুল উলুম রাখালিয়াচালা মাদ্রাসা',
  tagline: 'সহজ পদ্ধতিতে বিশুদ্ধ কুরআন শিক্ষা ও দ্বীনি চরিত্র গঠন',
  establishedYear: '২০১৩',
  boardAffiliation: 'নূরানী তালীমুল কুরআন বোর্ড বাংলাদেশ অনুমোদিত',
  address: 'রাখালিয়াচালা, মৌচাক, কালিয়াকৈর, গাজীপুর',
  primaryPhone: '০১৭১১-২৩৪৫৬৭',
  secondaryPhone: '০১৮২২-৩৩৪৫৫৬',
  whatsappNumber: '+8801711234567',
  email: 'info@darululoom-noorani.edu.bd',
  classTiming: 'সকাল ৮:৩০ – দুপুর ১২:৩০ (শনিবার থেকে বৃহস্পতিবার)',
  parentConsultationHours: 'প্রতিদিন আসর থেকে মাগরিব পর্যন্ত',
};

function formatBengaliDate(isoDate: string): string {
  try {
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const year = parts[0];
      const monthNames = [
        'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
        'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
      ];
      const month = monthNames[monthIdx] || 'অক্টোবর';
      const toBnDigits = (str: number | string) =>
        String(str).replace(/\d/g, (w) => '০১২৩৪৫৬৭৮৯'[parseInt(w, 10)]);

      return `${toBnDigits(day)} ${month} ${toBnDigits(year)}`;
    }
  } catch {
    // Fallback
  }
  return '৮ অক্টোবর ২০২৬';
}

function getBengaliDayName(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    return days[d.getDay()] || 'বৃহস্পতিবার';
  } catch {
    return 'বৃহস্পতিবার';
  }
}

function mapRecordToLesson(record: DailyLessonRecord): Lesson {
  const items = record.lesson_items || [];
  const madrasahItems = items
    .filter((i) => i.section_type === 'madrasah')
    .sort((a, b) => a.item_order - b.item_order);
  const homeItems = items
    .filter((i) => i.section_type === 'home')
    .sort((a, b) => a.item_order - b.item_order);

  const qaida = madrasahItems[0]?.lesson_text || '';
  const ampara = madrasahItems[1]?.lesson_text;
  const duaOrHadith = madrasahItems[2]?.lesson_text;
  const homework = homeItems.map((h) => h.lesson_text).join('\n') || '';

  const teacherName = items.find((i) => i.teacher_name && i.teacher_name.trim() !== '')?.teacher_name || '';

  return {
    id: record.id,
    date: formatBengaliDate(record.lesson_date),
    isoDate: record.lesson_date,
    hijriDate: '১৫ রবিউস সানি ১৪৪৮ হিজরি',
    dayName: getBengaliDayName(record.lesson_date),
    className: record.category === 'noorani' ? 'নূরানী' : record.category,
    classLevel: record.class_level || 'shishu',
    section: 'শাখা: আল-ফালাহ',
    lessonTitle: 'মুরাক্কাব হরফের মাশক ও সূরা নাস তিলাওয়াত',
    qaida,
    ampara,
    duaOrHadith,
    homework,
    teacherName,
    lessonItems: items,
    createdAt: record.created_at || new Date().toISOString(),
    updatedAt: record.updated_at || new Date().toISOString(),
  };
}

/**
 * Service API methods.
 * Fetches published lessons directly from Supabase.
 * If no published lesson exists for the requested class, it returns null/empty results.
 */
export const lessonService = {
  /**
   * Retrieves today's published lesson for a category and class level.
   * Default: category='noorani', classLevel='shishu'
   */
  async getTodaysLesson(
    category = 'noorani',
    classLevel = 'shishu'
  ): Promise<Lesson | null> {
    try {
      let query = supabase
        .from('daily_lessons')
        .select(`
          id,
          lesson_date,
          category,
          class_level,
          published,
          created_at,
          updated_at,
          lesson_items (
            id,
            daily_lesson_id,
            section_type,
            item_order,
            lesson_text,
            book_name,
            teacher_name
          )
        `)
        .eq('category', category)
        .eq('published', true)
        .order('lesson_date', { ascending: false });

      if (classLevel) {
        query = query.eq('class_level', classLevel);
      }

      const { data, error } = await query.limit(1);

      if (error) {
        console.error('Supabase error while fetching today\'s lesson:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return null;
      }

      return mapRecordToLesson(data[0] as unknown as DailyLessonRecord);
    } catch (err) {
      console.error('Failed to fetch today\'s published lesson from Supabase:', err);
      throw err;
    }
  },

  /**
   * Retrieves all previous published lessons.
   */
  async getPreviousLessons(category = 'noorani', classLevel?: string): Promise<Lesson[]> {
    try {
      let query = supabase
        .from('daily_lessons')
        .select(`
          id,
          lesson_date,
          category,
          class_level,
          published,
          created_at,
          updated_at,
          lesson_items (
            id,
            daily_lesson_id,
            section_type,
            item_order,
            lesson_text,
            book_name,
            teacher_name
          )
        `)
        .eq('category', category)
        .eq('published', true)
        .order('lesson_date', { ascending: false });

      if (classLevel) {
        query = query.eq('class_level', classLevel);
      }

      const { data, error } = await query.range(1, 20);

      if (error) {
        console.error('Supabase error while fetching previous lessons:', error);
        throw error;
      }

      if (!data) {
        return [];
      }

      return data.map((record) => mapRecordToLesson(record as unknown as DailyLessonRecord));
    } catch (err) {
      console.error('Failed to fetch previous published lessons from Supabase:', err);
      throw err;
    }
  },

  /**
   * Retrieves Madrasa profile and contact information.
   */
  async getMadrasaInfo(): Promise<MadrasaInfo> {
    return MOCK_MADRASA_INFO;
  },
};
