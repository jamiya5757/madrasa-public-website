/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  GraduationCap,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileX,
} from 'lucide-react';
import { ExamNotice } from '../types/examNotice';
import {
  examNoticeService,
  getNoticeFileUrl,
  formatBengaliDate,
} from '../services/examNoticeService';
import { InlinePdfViewer } from './InlinePdfViewer';

export interface ExamCategoryTab {
  id: string;
  label: string;
}

export const EXAM_CATEGORY_TABS: ExamCategoryTab[] = [
  { id: 'fee', label: 'ফি' },
  { id: 'routine', label: 'রুটিন' },
  { id: 'result', label: 'ফলাফল' },
  { id: 'holiday', label: 'ছুটি' },
];

export const ExamsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('fee');
  const [notices, setNotices] = useState<ExamNotice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchNotices = async (cat: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await examNoticeService.getPublishedExamNotices(cat);
      setNotices(data);
    } catch (err: any) {
      console.error('Error in ExamsPage fetchNotices:', err);
      setErrorMsg(err?.message || 'পরীক্ষার নোটিশসমূহ লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices(activeCategory);
  }, [activeCategory]);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 1. Header Banner & Arabic Verse */}
      <div className="text-center">
        <div className="islamic-divider">
          <span className="font-arabic text-xl sm:text-2xl text-amber-700 tracking-wider select-none font-normal">
            عِنْدَ الِامْتِحَانِ يُكْرَمُ الرَّجُلُ أَوْ يُهَانُ
          </span>
        </div>
      </div>

      {/* 2. Category Navigation Tabs */}
      <div className="flex justify-center">
        <nav
          aria-label="পরীক্ষার নোটিশ ক্যাটাগরি নির্বাচন"
          className="inline-flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-2xl bg-stone-200/70 border border-stone-300/60 shadow-2xs max-w-full overflow-x-auto no-scrollbar shrink-0"
        >
          {EXAM_CATEGORY_TABS.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 sm:px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer min-h-[40px] flex items-center justify-center ${
                  isActive
                    ? 'bg-[#073D28] text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-300/50'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. Main Content Display Area */}
      <div>
        {loading ? (
          /* Loading State */
          <div className="min-h-[250px] flex flex-col items-center justify-center gap-3 text-stone-600 bg-[#FFFFFF] rounded-2xl border border-stone-200/80 p-8 shadow-2xs">
            <Loader2 className="w-9 h-9 animate-spin text-[#073D28]" />
            <p className="text-sm font-semibold">পরীক্ষার নোটিশসমূহ লোড হচ্ছে...</p>
          </div>
        ) : errorMsg ? (
          /* Error State */
          <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-6 sm:p-8 text-center space-y-4 max-w-xl mx-auto">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-700">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base sm:text-lg">নোটিশ লোড করতে ব্যর্থ হয়েছে</h3>
              <p className="text-xs sm:text-sm text-rose-800">{errorMsg}</p>
            </div>
            <button
              type="button"
              onClick={() => fetchNotices(activeCategory)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>পুনরায় চেষ্টা করুন</span>
            </button>
          </div>
        ) : notices.length === 0 ? (
          /* Empty State */
          <div className="bg-[#FFFFFF] rounded-2xl border border-stone-200/90 p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto shadow-2xs">
            <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
              <FileX className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-base sm:text-lg text-stone-800 font-serif-bn">
                কোনো নোটিশ পাওয়া যায়নি
              </h3>
              <p className="text-xs sm:text-sm text-stone-600">
                বর্তমানে এই ক্যাটাগরিতে কোনো প্রকাশিত নোটিশ নেই। নতুন নোটিশ প্রকাশিত হলে এখানে দেখতে পাবেন।
              </p>
            </div>
          </div>
        ) : (
          /* Notice List Display */
          <div className="space-y-6 sm:space-y-8">
            {notices.map((notice) => {
              const pdfUrl = getNoticeFileUrl(notice);
              const formattedDate = formatBengaliDate(
                notice.notice_date || notice.created_at
              );

              return (
                <article
                  key={notice.id}
                  className="bg-[#FFFFFF] rounded-2xl border border-[#073D28]/30 p-4 sm:p-6 shadow-2xs hover:shadow-md transition-all space-y-3.5"
                >
                  {/* Notice Header Bar (Classes & Date) */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {/* Associated Classes */}
                    {notice.classes && notice.classes.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="inline-flex items-center gap-1 text-stone-500 font-semibold mr-1">
                          <GraduationCap className="w-4 h-4 text-[#073D28]" />
                          <span>সংযুক্ত শ্রেণী:</span>
                        </span>
                        {notice.classes.map((cls) => (
                          <span
                            key={cls.id}
                            className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-50 text-[#073D28] border border-emerald-200/70 font-semibold"
                          >
                            {cls.name}
                          </span>
                        ))}
                      </div>
                    ) : <div />}

                    {/* Notice Date */}
                    {formattedDate && (
                      <span className="inline-flex items-center gap-1 text-xs text-stone-500 font-medium ml-auto">
                        <Calendar className="w-3.5 h-3.5 text-amber-700" />
                        <span>{formattedDate}</span>
                      </span>
                    )}
                  </div>

                  {/* Database Notice Title & Description - Single Shared Container */}
                  {(notice.title || (notice.description && notice.description.trim() !== '')) && (
                    <div className="bg-emerald-50/50 border border-emerald-900/15 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-center shadow-2xs space-y-1.5">
                      {/* Title */}
                      {notice.title && (
                        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-[#073D28] font-serif-bn leading-snug">
                          {notice.title}
                        </h2>
                      )}

                      {/* Description */}
                      {notice.description && notice.description.trim() !== '' && (
                        <p className="text-xs sm:text-sm text-stone-700 font-medium whitespace-pre-line leading-relaxed border-t border-emerald-900/10 pt-2">
                          {notice.description}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Inline Embedded PDF Viewer */}
                  {pdfUrl ? (
                    <div>
                      <InlinePdfViewer
                        pdfUrl={pdfUrl}
                        filePath={notice.file_path || undefined}
                        title={notice.title}
                        filename={notice.original_filename || 'notice.pdf'}
                        downloadUrl={pdfUrl}
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-500 text-center italic">
                      এই নোটিশের সাথে কোনো পিডিএফ ফাইল সংযুক্ত নেই।
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
