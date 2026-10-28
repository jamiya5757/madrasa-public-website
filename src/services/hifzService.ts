/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from '../lib/supabase';
import { HifzWeeklyRecord, HifzStudentItem } from '../types/lesson';

/**
 * Parses admission form number to integer for natural numeric sorting.
 * Converts Bengali digits to English digits (e.g., "১০" -> 10, "২" -> 2).
 */
function parseFormNumber(formNo?: string | null): number {
  if (!formNo) return Infinity;
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  let cleaned = String(formNo);
  bnDigits.forEach((bn, idx) => {
    cleaned = cleaned.split(bn).join(String(idx));
  });
  const match = cleaned.match(/\d+/);
  if (match) {
    return parseInt(match[0], 10);
  }
  return Infinity;
}

export const hifzService = {
  /**
   * Fetches all active Hifz department students from Supabase `students` table,
   * sorted naturally by admission form number (earliest form number first).
   */
  async getHifzStudents(): Promise<HifzStudentItem[]> {
    try {
      // 1. Get Hifz class ID from public.classes
      const { data: classesData } = await supabase
        .from('classes')
        .select('id, name, code')
        .or('code.eq.hifz,name.ilike.%হিফজ%')
        .eq('is_active', true);

      const hifzClassIds = (classesData || []).map((c: any) => c.id);

      // 2. Query students table
      let studentQuery = supabase
        .from('students')
        .select('id, name, student_id, admission_form_no, photo_url, class_id, is_active, deleted_at')
        .is('deleted_at', null)
        .eq('is_active', true);

      if (hifzClassIds.length > 0) {
        studentQuery = studentQuery.in('class_id', hifzClassIds);
      }

      const { data: studentsData, error: stError } = await studentQuery;

      const studentsList: HifzStudentItem[] = [];
      const studentMap = new Map<string, HifzStudentItem>();

      if (!stError && studentsData) {
        studentsData.forEach((st: any) => {
          const item: HifzStudentItem = {
            id: st.id,
            name: st.name,
            admission_form_no: st.admission_form_no || null,
            student_id: st.student_id || null,
            photo_url: st.photo_url || null,
          };
          studentsList.push(item);
          studentMap.set(st.id, item);
        });
      }

      // 3. Also check published records to ensure any student with published hifz records is included
      const { data: publishedRecs } = await supabase
        .from('hifz_weekly_records')
        .select('student_id, student_name, student_form_no, student:students(photo_url, student_id, admission_form_no)')
        .eq('is_published', true);

      if (publishedRecs && publishedRecs.length > 0) {
        publishedRecs.forEach((rec: any) => {
          if (!studentMap.has(rec.student_id)) {
            const liveStudent = rec.student;
            const item: HifzStudentItem = {
              id: rec.student_id,
              name: rec.student_name,
              admission_form_no: liveStudent?.admission_form_no || rec.student_form_no || null,
              student_id: liveStudent?.student_id || null,
              photo_url: liveStudent?.photo_url || null,
              has_published_records: true,
            };
            studentsList.push(item);
            studentMap.set(rec.student_id, item);
          } else {
            const existing = studentMap.get(rec.student_id)!;
            existing.has_published_records = true;
          }
        });
      }

      // 4. Sort students naturally by admission form number (earliest first)
      studentsList.sort((a, b) => {
        const numA = parseFormNumber(a.admission_form_no);
        const numB = parseFormNumber(b.admission_form_no);
        if (numA !== numB) {
          return numA - numB;
        }
        return a.name.localeCompare(b.name, 'bn');
      });

      return studentsList;
    } catch (err) {
      console.error('Failed to fetch Hifz students list:', err);
      return [];
    }
  },

  /**
   * Retrieves all published weekly progress records for a specific Hifz student
   * along with child daily logs and student photo info.
   */
  async getPublicWeeklyRecordsByStudent(studentId: string): Promise<HifzWeeklyRecord[]> {
    try {
      if (!studentId) return [];

      let { data, error } = await supabase
        .from('hifz_weekly_records')
        .select(`
          id,
          student_id,
          student_name,
          student_form_no,
          student:students(photo_url, student_id, name, admission_form_no),
          year,
          month,
          week,
          shabina_total,
          paras_read,
          total_lokma,
          is_published,
          created_at,
          daily_logs:hifz_daily_logs(
            id,
            day_index,
            day_name,
            sabak_para,
            sabak_page,
            sabat_sabak_para,
            sabat_sabak_page,
            sabat_sabak_amount,
            sabat_sabak_mistakes,
            amukhta_para,
            amukhta_page,
            amukhta_amount,
            amukhta_mistakes,
            tilawat_details
          )
        `)
        .eq('is_published', true)
        .eq('student_id', studentId)
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Primary Hifz relation query failed for student, trying fallback:', error.message);
        const fallbackRes = await supabase
          .from('hifz_weekly_records')
          .select(`
            *,
            daily_logs:hifz_daily_logs(*)
          `)
          .eq('is_published', true)
          .eq('student_id', studentId)
          .order('year', { ascending: false })
          .order('month', { ascending: false })
          .order('created_at', { ascending: false });

        if (fallbackRes.error) {
          console.error('Error fetching published hifz records for student:', fallbackRes.error);
          return [];
        }
        data = fallbackRes.data;
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Fetch live student photo if missing
      let livePhotoUrl: string | null = null;
      try {
        const { data: stData } = await supabase
          .from('students')
          .select('photo_url, admission_form_no, student_id')
          .eq('id', studentId)
          .maybeSingle();

        if (stData) {
          livePhotoUrl = stData.photo_url || null;
        }
      } catch {
        // Ignore
      }

      const records: HifzWeeklyRecord[] = data.map((record: any) => {
        const liveStudent = record.student;
        const sortedLogs = [...(record.daily_logs || [])].sort(
          (a: any, b: any) => a.day_index - b.day_index
        );

        return {
          id: record.id,
          student_id: record.student_id,
          student_name: liveStudent?.name || record.student_name,
          student_form_no: liveStudent?.admission_form_no || record.student_form_no || null,
          student_roll_no: liveStudent?.student_id || null,
          photo_url: livePhotoUrl || liveStudent?.photo_url || record.photo_url || null,
          year: record.year,
          month: record.month,
          week: record.week,
          shabina_total: record.shabina_total || null,
          paras_read: record.paras_read || null,
          total_lokma: Number(record.total_lokma) || 0,
          is_published: Boolean(record.is_published),
          daily_logs: sortedLogs,
          created_at: record.created_at,
          updated_at: record.updated_at,
        };
      });

      return records;
    } catch (err) {
      console.error('Failed to fetch public Hifz records by student:', err);
      return [];
    }
  },

  /**
   * Retrieves all published weekly progress records for the Hifz department
   */
  async getPublicWeeklyRecords(): Promise<HifzWeeklyRecord[]> {
    try {
      let { data, error } = await supabase
        .from('hifz_weekly_records')
        .select(`
          id,
          student_id,
          student_name,
          student_form_no,
          student:students(photo_url, student_id, name, admission_form_no),
          year,
          month,
          week,
          shabina_total,
          paras_read,
          total_lokma,
          is_published,
          created_at,
          daily_logs:hifz_daily_logs(
            id,
            day_index,
            day_name,
            sabak_para,
            sabak_page,
            sabat_sabak_para,
            sabat_sabak_page,
            sabat_sabak_amount,
            sabat_sabak_mistakes,
            amukhta_para,
            amukhta_page,
            amukhta_amount,
            amukhta_mistakes,
            tilawat_details
          )
        `)
        .eq('is_published', true)
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        const fallbackRes = await supabase
          .from('hifz_weekly_records')
          .select(`
            *,
            daily_logs:hifz_daily_logs(*)
          `)
          .eq('is_published', true)
          .order('year', { ascending: false })
          .order('month', { ascending: false })
          .order('created_at', { ascending: false });

        if (fallbackRes.error) {
          return [];
        }
        data = fallbackRes.data;
      }

      if (!data || data.length === 0) {
        return [];
      }

      const studentIds = data
        .map((r: any) => r.student_id)
        .filter((id: string) => Boolean(id));

      const studentMap: Record<string, { photo_url?: string; student_id?: string; admission_form_no?: string }> = {};

      if (studentIds.length > 0) {
        try {
          const { data: stData } = await supabase
            .from('students')
            .select('id, photo_url, student_id, admission_form_no')
            .in('id', studentIds);

          if (stData) {
            stData.forEach((st: any) => {
              studentMap[st.id] = st;
            });
          }
        } catch {
          // Ignore
        }
      }

      const records: HifzWeeklyRecord[] = data.map((record: any) => {
        const liveStudent = record.student || studentMap[record.student_id];
        const sortedLogs = [...(record.daily_logs || [])].sort(
          (a: any, b: any) => a.day_index - b.day_index
        );

        return {
          id: record.id,
          student_id: record.student_id,
          student_name: liveStudent?.name || record.student_name,
          student_form_no: liveStudent?.admission_form_no || record.student_form_no || null,
          student_roll_no: liveStudent?.student_id || null,
          photo_url: liveStudent?.photo_url || record.photo_url || null,
          year: record.year,
          month: record.month,
          week: record.week,
          shabina_total: record.shabina_total || null,
          paras_read: record.paras_read || null,
          total_lokma: Number(record.total_lokma) || 0,
          is_published: Boolean(record.is_published),
          daily_logs: sortedLogs,
          created_at: record.created_at,
          updated_at: record.updated_at,
        };
      });

      return records;
    } catch (err) {
      console.error('Failed to fetch public Hifz records:', err);
      return [];
    }
  },
};
