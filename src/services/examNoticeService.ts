/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from '../lib/supabase';
import { ExamNotice, ClassInfo, ExamNoticeCategoryMeta } from '../types/examNotice';

export const EXAM_CATEGORY_META: Record<string, ExamNoticeCategoryMeta> = {
  fee: {
    id: 'fee',
    label: 'বেতন/ফি সংক্রান্ত নোটিশ',
    shortLabel: 'ফি নোটিশ',
    badgeBg: 'bg-amber-50 text-amber-900 border-amber-200/80',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-200/80',
  },
  routine: {
    id: 'routine',
    label: 'পরীক্ষার রুটিন',
    shortLabel: 'রুটিন',
    badgeBg: 'bg-emerald-50 text-[#073D28] border-emerald-200/80',
    badgeText: 'text-[#073D28]',
    badgeBorder: 'border-emerald-200/80',
  },
  result: {
    id: 'result',
    label: 'পরীক্ষার ফলাফল',
    shortLabel: 'ফলাফল',
    badgeBg: 'bg-blue-50 text-blue-900 border-blue-200/80',
    badgeText: 'text-blue-900',
    badgeBorder: 'border-blue-200/80',
  },
  holiday: {
    id: 'holiday',
    label: 'ছুটির নোটিশ',
    shortLabel: 'ছুটি',
    badgeBg: 'bg-purple-50 text-purple-900 border-purple-200/80',
    badgeText: 'text-purple-900',
    badgeBorder: 'border-purple-200/80',
  },
  vacation: {
    id: 'holiday',
    label: 'ছুটির নোটিশ',
    shortLabel: 'ছুটি',
    badgeBg: 'bg-purple-50 text-purple-900 border-purple-200/80',
    badgeText: 'text-purple-900',
    badgeBorder: 'border-purple-200/80',
  },
};

export function getCategoryMeta(catKey?: string | null): ExamNoticeCategoryMeta {
  if (!catKey) {
    return {
      id: 'general',
      label: 'সাধারণ নোটিশ',
      shortLabel: 'নোটিশ',
      badgeBg: 'bg-stone-100 text-stone-800 border-stone-200',
      badgeText: 'text-stone-800',
      badgeBorder: 'border-stone-200',
    };
  }
  const key = catKey.toLowerCase().trim();
  return (
    EXAM_CATEGORY_META[key] || {
      id: key,
      label: 'সাধারণ নোটিশ',
      shortLabel: 'নোটিশ',
      badgeBg: 'bg-stone-100 text-stone-800 border-stone-200',
      badgeText: 'text-stone-800',
      badgeBorder: 'border-stone-200',
    }
  );
}

/**
 * Returns a valid public download/view URL for an exam notice PDF.
 * Uses file_url if available. If empty, derives public URL from file_path via Storage API.
 */
export function getNoticeFileUrl(notice: Partial<ExamNotice>): string {
  if (notice.file_url && notice.file_url.trim() !== '') {
    return notice.file_url.trim();
  }
  if (notice.file_path && notice.file_path.trim() !== '') {
    const { data } = supabase.storage
      .from('exam_notices')
      .getPublicUrl(notice.file_path.trim());
    return data?.publicUrl || '';
  }
  return '';
}

/**
 * Converts ISO/date string to readable Bengali format (e.g. "২৪ অক্টোবর ২০২৬").
 */
export function formatBengaliDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  try {
    const cleanStr = dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`;
    const d = new Date(cleanStr);
    if (isNaN(d.getTime())) return dateStr;

    const day = d.getDate();
    const monthIdx = d.getMonth();
    const year = d.getFullYear();

    const monthNames = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];

    const toBnDigits = (num: number | string) =>
      String(num).replace(/\d/g, (w) => '০১২৩৪৫৬৭৮৯'[parseInt(w, 10)]);

    return `${toBnDigits(day)} ${monthNames[monthIdx]} ${toBnDigits(year)}`;
  } catch {
    return dateStr;
  }
}

/**
 * Formats file size in bytes to Bengali KB/MB.
 */
export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return '';
  const toBnDigits = (num: number | string) =>
    String(num).replace(/\d/g, (w) => '০১২৩৪৫৬৭৮৯'[parseInt(w, 10)]);

  if (bytes < 1024 * 1024) {
    const kb = (bytes / 1024).toFixed(1);
    return `${toBnDigits(kb)} KB`;
  }
  const mb = (bytes / (1024 * 1024)).toFixed(1);
  return `${toBnDigits(mb)} MB`;
}

/**
 * Service to fetch active published exam notices from public.exam_notices.
 */
export const examNoticeService = {
  async getPublishedExamNotices(categoryFilter?: string): Promise<ExamNotice[]> {
    let query = supabase
      .from('exam_notices')
      .select('*')
      .eq('is_active', true)
      .eq('status', 'published')
      .order('notice_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (categoryFilter && categoryFilter !== 'all') {
      if (categoryFilter === 'holiday' || categoryFilter === 'vacation') {
        query = query.in('category', ['holiday', 'vacation']);
      } else {
        query = query.eq('category', categoryFilter);
      }
    }

    const { data: notices, error: noticesErr } = await query;

    if (noticesErr) {
      console.error('Failed to fetch exam notices from Supabase:', noticesErr);
      throw new Error(`পরীক্ষার নোটিশ লোড করতে সমস্যা হয়েছে (${noticesErr.message})`);
    }

    if (!notices || notices.length === 0) {
      return [];
    }

    const noticeIds = notices.map((n) => n.id);

    // Fetch associated classes via exam_notice_classes & classes
    let noticeClassesMap: Record<string, ClassInfo[]> = {};
    try {
      const { data: ncData, error: ncErr } = await supabase
        .from('exam_notice_classes')
        .select('exam_notice_id, class_id')
        .in('exam_notice_id', noticeIds);

      if (!ncErr && ncData && ncData.length > 0) {
        const classIds = Array.from(new Set(ncData.map((item) => item.class_id)));
        const { data: classData } = await supabase
          .from('classes')
          .select('*')
          .in('id', classIds);

        const classById: Record<string, ClassInfo> = {};
        if (classData) {
          for (const cls of classData) {
            const displayName =
              cls.name_bn ||
              cls.name ||
              cls.class_name ||
              cls.title ||
              cls.code ||
              'শ্রেণী';
            classById[cls.id] = {
              id: cls.id,
              name: displayName,
              code: cls.code || undefined,
            };
          }
        }

        for (const link of ncData) {
          const clsObj = classById[link.class_id];
          if (clsObj) {
            if (!noticeClassesMap[link.exam_notice_id]) {
              noticeClassesMap[link.exam_notice_id] = [];
            }
            noticeClassesMap[link.exam_notice_id].push(clsObj);
          }
        }
      }
    } catch (err) {
      console.warn('Note while fetching class mappings for exam notices:', err);
    }

    return notices.map((n) => ({
      ...n,
      classes: noticeClassesMap[n.id] || [],
    }));
  },
};
