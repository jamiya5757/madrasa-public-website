/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ClassInfo {
  id: string;
  name: string;
  code?: string;
}

export interface ExamNotice {
  id: string;
  title: string;
  category: 'fee' | 'routine' | 'result' | 'holiday' | string;
  description?: string | null;
  notice_date?: string | null;
  file_path?: string | null;
  file_url?: string | null;
  original_filename?: string | null;
  file_size?: number | null;
  is_active: boolean;
  status: 'draft' | 'published' | string;
  created_at?: string | null;
  updated_at?: string | null;
  classes?: ClassInfo[];
}

export interface ExamNoticeCategoryMeta {
  id: string;
  label: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}
