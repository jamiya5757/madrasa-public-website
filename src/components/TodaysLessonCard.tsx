/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  BookOpen,
  Share2,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  HelpCircle,
  FileCheck2,
  UserCheck,
} from 'lucide-react';
import { Lesson } from '../types/lesson';
import { lessonService } from '../services/lessonService';

export type Department = 'noorani' | 'nazera' | 'hifz' | 'kitab';

export interface DepartmentItem {
  id: Department;
  label: string;
  title: string;
  emptyMessage: string;
}

export const DEPARTMENTS: DepartmentItem[] = [
  {
    id: 'noorani',
    label: 'নূরানী',
    title: 'আজকের নূরানী পড়া',
    emptyMessage: '',
  },
  {
    id: 'nazera',
    label: 'নাজেরা',
    title: 'আজকের নাজেরা পড়া',
    emptyMessage: 'নাজেরা বিভাগের পড়া এখনো প্রকাশ করা হয়নি।',
  },
  {
    id: 'hifz',
    label: 'হিফজ',
    title: 'আজকের হিফজ পড়া',
    emptyMessage: 'হিফজ বিভাগের পড়া এখনো প্রকাশ করা হয়নি।',
  },
  {
    id: 'kitab',
    label: 'কিতাব',
    title: 'আজকের কিতাব পড়া',
    emptyMessage: 'কিতাব বিভাগের পড়া এখনো প্রকাশ করা হয়নি।',
  },
];

export type NooraniClass = 'shishu' | 'first';

export const NOORANI_CLASSES: { id: NooraniClass; name: string }[] = [
  { id: 'shishu', name: 'শিশু শ্রেণি' },
  { id: 'first', name: 'প্রথম শ্রেণি' },
];

function toBnDigits(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
}

function getBengaliWeekday(d: Date): string {
  const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  return days[d.getDay()];
}

function getGregorianBengaliStr(d: Date): string {
  const day = d.getDate();
  const monthNames = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${getBengaliWeekday(d)} · ${toBnDigits(day)} ${month} ${toBnDigits(year)}`;
}

function getBengaliCalendarDate(date: Date): string {
  const gYear = date.getFullYear();
  const gMonth = date.getMonth();
  const gDay = date.getDate();

  const monthInfo = [
    { name: 'বৈশাখ', startMonth: 3, startDay: 14 },
    { name: 'জ্যৈষ্ঠ', startMonth: 4, startDay: 15 },
    { name: 'আষাঢ়', startMonth: 5, startDay: 16 },
    { name: 'শ্রাবণ', startMonth: 6, startDay: 17 },
    { name: 'ভাদ্র', startMonth: 7, startDay: 18 },
    { name: 'আশ্বিন', startMonth: 8, startDay: 18 },
    { name: 'কার্তিক', startMonth: 9, startDay: 18 },
    { name: 'অগ্রহায়ণ', startMonth: 10, startDay: 17 },
    { name: 'পৌষ', startMonth: 11, startDay: 17 },
    { name: 'মাঘ', startMonth: 0, startDay: 16 },
    { name: 'ফাল্গুন', startMonth: 1, startDay: 15 },
    { name: 'চৈত্র', startMonth: 2, startDay: 15 }
  ];

  let bYear = gYear - 593;
  if (gMonth < 3 || (gMonth === 3 && gDay < 14)) {
    bYear = gYear - 594;
  }

  let bMonthName = 'আশ্বিন';
  let bDay = 25;

  for (let i = 0; i < monthInfo.length; i++) {
    const current = monthInfo[i];
    const next = monthInfo[(i + 1) % monthInfo.length];

    const currentStartDate = new Date(gYear, current.startMonth, current.startDay);
    let nextStartDate = new Date(gYear, next.startMonth, next.startDay);
    if (next.startMonth < current.startMonth) {
      nextStartDate = new Date(gYear + 1, next.startMonth, next.startDay);
    }

    if (date >= currentStartDate && date < nextStartDate) {
      bMonthName = current.name;
      const diffTime = date.getTime() - currentStartDate.getTime();
      bDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      break;
    }
  }

  return `${toBnDigits(bDay)} ${bMonthName} ${toBnDigits(bYear)} বঙ্গাব্দ`;
}

function getHijriBengaliStr(fallbackHijri?: string): string {
  if (fallbackHijri && fallbackHijri.trim() !== '') {
    return fallbackHijri;
  }
  return '১৯ রবিউস সানি ১৪৪৮ হিজরি';
}

interface TodaysLessonCardProps {
  lesson: Lesson | null;
  onCopySuccess: () => void;
  activeDept?: Department;
  onSelectDept?: (dept: Department) => void;
}

export const TodaysLessonCard: React.FC<TodaysLessonCardProps> = ({
  lesson,
  onCopySuccess,
  activeDept: externalActiveDept,
  onSelectDept,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [internalDept, setInternalDept] = useState<Department>('noorani');
  const [selectedClass, setSelectedClass] = useState<NooraniClass>('shishu');
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(lesson ?? null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const activeDept = externalActiveDept ?? internalDept;
  const displayLesson = currentLesson ?? lesson;

  useEffect(() => {
    let isMounted = true;
    async function fetchClassLesson() {
      if (activeDept !== 'noorani') {
        if (isMounted) {
          setCurrentLesson(null);
          setFetchError(null);
        }
        return;
      }

      try {
        const res = await lessonService.getTodaysLesson('noorani', selectedClass);
        if (isMounted) {
          setCurrentLesson(res);
          setFetchError(null);
        }
      } catch (error) {
        console.error('Failed to fetch Noorani lesson for selected class:', error);
        if (isMounted) {
          setCurrentLesson(null);
          setFetchError('আজকের পাঠের তথ্য পড়তে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন।');
        }
      }
    }
    fetchClassLesson();
    return () => {
      isMounted = false;
    };
  }, [activeDept, selectedClass, lesson]);

  const handleSelectDept = (dept: Department) => {
    setInternalDept(dept);
    if (onSelectDept) {
      onSelectDept(dept);
    }
  };

  const handleCopy = () => {
    if (!displayLesson) {
      return;
    }

    const textToCopy = `📚 জামিয়া আরাবিয়া মদিনাতুল উলুম রাখালিয়াচালা মাদ্রাসা
📅 আজকের নূরানী পড়া (${displayLesson.date}, ${displayLesson.dayName})
---------------------------------
📖 কায়দা: ${displayLesson.qaida}
🕌 আমপারা/কুরআন: ${displayLesson.ampara || 'প্রযোজ্য নয়'}
${displayLesson.duaOrHadith ? `🤲 দু'আ ও শিষ্টাচার: ${displayLesson.duaOrHadith}\n` : ''}
📝 বাড়ির কাজ:
${displayLesson.homework}
${displayLesson.note ? `\n💡 অভিভাবক নির্দেশনা: ${displayLesson.note}\n` : ''}
মুয়াল্লিম: ${displayLesson.teacherName || 'মুয়াল্লিম সাহেব'}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      onCopySuccess();
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const handleShareWhatsApp = () => {
    if (!displayLesson) {
      return;
    }

    const textToShare = `*জামিয়া আরাবিয়া মদিনাতুল উলুম রাখালিয়াচালা মাদ্রাসা*\n*আজকের নূরানী পড়া (${displayLesson.date}, ${displayLesson.dayName})*\n\n📖 *কায়দা:* ${displayLesson.qaida}\n🕌 *আমপারা/কুরআন:* ${displayLesson.ampara || 'প্রযোজ্য নয়'}\n📝 *বাড়ির কাজ:* ${displayLesson.homework}\n${displayLesson.note ? `\n💡 *জরুরি নোট:* ${displayLesson.note}` : ''}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
    window.open(url, '_blank');
  };

  const currentDate = new Date();

  return (
    <section id="today" className="relative scroll-mt-24">
      {/* 1. Bismillah Heading (Row 1 - Centered) */}
      <div className="text-center mb-4 sm:mb-5">
        <div className="islamic-divider">
          <span className="font-arabic text-xl sm:text-2xl text-amber-700 tracking-wider select-none font-normal">
           اِقْرَأْ بِاسْمِ رَبِّكَ الَّذِى خَلَقَ
          </span>
        </div>
      </div>

      {/* 2. Category Navigation Tabs (LEFT) + Date Card (RIGHT) (Row 2 - Horizontally Aligned) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3.5 sm:gap-4 mb-5 sm:mb-6">
        {/* Category Navigation Tabs on the LEFT */}
        <nav
          aria-label="বিভাগ নির্বাচন"
          className="inline-flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-stone-200/70 border border-stone-300/60 shadow-2xs max-w-full overflow-x-auto no-scrollbar shrink-0"
        >
          {DEPARTMENTS.map((dept) => {
            const isActive = activeDept === dept.id;
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => handleSelectDept(dept.id)}
                className={`px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#073D28] text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-300/50'
                }`}
              >
                {dept.label}
              </button>
            );
          })}
        </nav>

        {/* Premium Date Card on the RIGHT */}
        <div className="shrink-0 flex justify-center md:justify-end">
          <div className="inline-flex flex-col p-2.5 px-3.5 rounded-xl bg-[#FFFDF7] border border-amber-900/20 shadow-xs text-left max-w-full">
            {/* Top Section: Bengali Weekday & Gregorian Date in Bengali */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-900 font-serif-bn">
              <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>{getGregorianBengaliStr(currentDate)}</span>
            </div>

            {/* Thin decorative horizontal divider */}
            <div className="my-1.5 border-t border-amber-900/15" />

            {/* Bottom Section: Hijri Date · Bengali Calendar Date */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-[#073D28] font-serif-bn">
              <span>{getHijriBengaliStr(displayLesson?.hijriDate)}</span>
              <span className="text-amber-700/60 font-normal">·</span>
              <span className="text-amber-900">{getBengaliCalendarDate(currentDate)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Department Content */}
      {activeDept === 'noorani' ? (
        /* ONE Complete Parent Information Container for Noorani */
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden transition-all">
          {/* Attached Green Heading Banner with Class Selector */}
          <div className="bg-[#08422B] text-white py-3 px-5 border-b border-emerald-950 text-center flex flex-col items-center gap-2">
            <h1 className="text-base sm:text-lg md:text-xl font-serif-bn font-bold text-white tracking-tight leading-snug">
              {DEPARTMENTS.find((d) => d.id === activeDept)?.title || 'আজকের পাঠ'}
            </h1>

            {/* Class Selector Tabs for Noorani */}
            <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-emerald-950/70 border border-emerald-800/40">
              {NOORANI_CLASSES.map((cls) => {
                const isSelected = selectedClass === cls.id;
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => setSelectedClass(cls.id)}
                    className={`px-3.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 shadow-2xs'
                        : 'text-emerald-100/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {cls.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Two-Column Internal Body */}
          {fetchError ? (
            <div className="p-8 sm:p-14 text-center bg-white">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-700 border border-red-600/20 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
                <AlertCircle className="w-6 h-6 text-red-700" />
              </div>
              <h3 className="text-lg sm:text-xl font-serif-bn font-bold text-stone-900 mb-1.5">
                তথ্য লোড করতে সমস্যা হয়েছে।
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed font-medium">
                {fetchError}
              </p>
            </div>
          ) : currentLesson ? (() => {
            const activeLesson = currentLesson;
            const items = activeLesson.lessonItems || [];
            const madrasahItems = items
              .filter((i) => i.section_type === 'madrasah')
              .sort((a, b) => a.item_order - b.item_order);
            const homeItems = items
              .filter((i) => i.section_type === 'home')
              .sort((a, b) => a.item_order - b.item_order);

            const displayMadrasah = madrasahItems;
            const displayHome = homeItems;

            const bnNumbers = ['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '১০'];

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200/80 bg-white">
                {/* LEFT COLUMN: আজ মাদ্রাসায় পড়ানো হয়েছে */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center gap-2 pb-2 mb-3 border-b border-stone-100">
                    <span className="text-base">📚</span>
                    <h2 className="text-xs sm:text-sm font-serif-bn font-bold text-[#073D28]">
                      আজ মাদ্রাসায় পড়ানো হয়েছে
                    </h2>
                  </div>

                  <ol className="space-y-3 text-xs sm:text-sm text-stone-800 list-none">
                    {displayMadrasah.map((item, idx) => (
                      <li key={item.id || idx} className="pb-3 border-b border-stone-100/90 last:border-0 last:pb-0 space-y-1">
                        <div className="flex items-start gap-1.5 leading-snug">
                          <span className="font-bold text-[#073D28] shrink-0 font-serif-bn">
                            {bnNumbers[idx] || `${idx + 1}`}.
                          </span>
                          <span>{item.lesson_text}</span>
                        </div>
                        {(item.book_name || item.teacher_name) && (
                          <div className="pl-5 space-y-0.5 text-[11px] sm:text-xs text-stone-600 font-medium">
                            {item.book_name && <div>📖 বই: {item.book_name}</div>}
                            {item.teacher_name && <div>👨‍🏫 শিক্ষক: {item.teacher_name}</div>}
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* RIGHT COLUMN: আজ বাড়িতে পড়া */}
                <div className="p-4 sm:p-5 space-y-3 bg-[#FFFDF8]">
                  <div className="flex items-center gap-2 pb-2 mb-3 border-b border-stone-100">
                    <span className="text-base">🏠</span>
                    <h2 className="text-xs sm:text-sm font-serif-bn font-bold text-amber-900">
                      আজ বাড়িতে পড়া
                    </h2>
                  </div>

                  <ol className="space-y-3 text-xs sm:text-sm text-stone-800 list-none">
                    {displayHome.map((item, idx) => (
                      <li key={item.id || idx} className="pb-3 border-b border-stone-100/90 last:border-0 last:pb-0 space-y-1">
                        <div className="flex items-start gap-1.5 leading-snug">
                          <span className="font-bold text-amber-800 shrink-0 font-serif-bn">
                            {bnNumbers[idx] || `${idx + 1}`}.
                          </span>
                          <span>{item.lesson_text}</span>
                        </div>
                        {(item.book_name || item.teacher_name) && (
                          <div className="pl-5 space-y-0.5 text-[11px] sm:text-xs text-stone-600 font-medium">
                            {item.book_name && <div>📖 বই: {item.book_name}</div>}
                            {item.teacher_name && <div>👨‍🏫 শিক্ষক: {item.teacher_name}</div>}
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            );
          })() : (
            <div className="p-8 sm:p-14 text-center bg-white">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-800 border border-amber-600/20 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
                <BookOpen className="w-6 h-6 text-amber-800" />
              </div>
              <h3 className="text-lg sm:text-xl font-serif-bn font-bold text-stone-900 mb-1.5">
                আজকের পড়া এখনো প্রকাশ করা হয়নি।
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed font-medium">
                ইনশাআল্লাহ শীঘ্রই {NOORANI_CLASSES.find((c) => c.id === selectedClass)?.name} শ্রেণির দৈনন্দিন পাঠের বিবরণী ও হোমওয়ার্ক এখান প্রকাশ করা হবে।
              </p>
            </div>
          )}

          {/* Optional Mu'allim Note */}
          {displayLesson?.note && (
            <div className="bg-amber-50/50 border-t border-amber-600/20 px-4 py-2.5 sm:px-5 text-xs">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-950">মুয়াল্লিমের বার্তা: </span>
                  <span className="text-stone-800 font-medium">{displayLesson.note}</span>
                </div>
              </div>
            </div>
          )}

          {/* Utility Action Bar */}
          <div className="bg-stone-50/80 border-t border-stone-200/80 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopy}
                className="min-h-[36px] px-3 py-1 rounded-lg border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-xs font-bold text-stone-700 transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="text-emerald-800">কপি হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    <span>পড়া কপি</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="min-h-[36px] px-3 py-1 rounded-lg bg-[#0A4830] hover:bg-[#073825] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-300" />
                <span>হোয়াটসঅ্যাপে শেয়ার</span>
              </button>
            </div>

            <div className="text-[11px] text-stone-500 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-stone-400" />
              <span>ইনশাআল্লাহ প্রতিদিন আছরের পর পড়া প্রকাশ করা হবে</span>
            </div>
          </div>
        </div>
      ) : (
        /* Future Department Empty State */
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs p-8 sm:p-14 text-center max-w-2xl mx-auto my-4 sm:my-8 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-800 border border-amber-600/20 flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <BookOpen className="w-7 h-7 text-amber-800" />
          </div>
          <h3 className="text-xl sm:text-2xl font-serif-bn font-bold text-stone-900 mb-2">
            {DEPARTMENTS.find((d) => d.id === activeDept)?.emptyMessage}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed font-medium">
            ইনশাআল্লাহ শীঘ্রই {DEPARTMENTS.find((d) => d.id === activeDept)?.label} বিভাগের দৈনন্দিন পাঠের বিবরণী ও হোমওয়ার্ক এখানে প্রকাশ করা হবে।
          </p>
        </div>
      )}
    </section>
  );
};
