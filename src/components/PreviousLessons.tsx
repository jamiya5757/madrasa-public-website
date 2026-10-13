/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Calendar, Search, ArrowRight, BookOpen, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { Lesson } from '../types/lesson';

interface PreviousLessonsProps {
  lessons: Lesson[];
  onSelectLesson: (lesson: Lesson) => void;
}

export const PreviousLessons: React.FC<PreviousLessonsProps> = ({
  lessons,
  onSelectLesson,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        lesson.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.qaida.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lesson.ampara && lesson.ampara.toLowerCase().includes(searchQuery.toLowerCase())) ||
        lesson.date.includes(searchQuery);

      const matchesDate =
        selectedDate === '' || lesson.isoDate === selectedDate;

      return matchesSearch && matchesDate;
    });
  }, [lessons, searchQuery, selectedDate]);

  return (
    <section id="archive" className="scroll-mt-24 pt-1 sm:pt-2">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-stone-200">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#073D28] font-bold">
            দৈনিক পাঠ সংরক্ষণাগার
          </span>
          <h2 className="mt-1 text-2xl sm:text-3xl font-serif-bn font-bold text-stone-900">
            পূর্ববর্তী পাঠের বিবরণী
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            পেছনের যেকোনো তারিখের কায়দা, আমপারা ও হোমওয়ার্ক সহজে পর্যালোচনার জন্য তালিকাভুক্ত।
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Keyword Search */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="কায়দা বা সূরা খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-stone-300 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-[#073D28] min-h-[42px]"
            />
          </div>

          {/* Date Picker */}
          <div className="relative flex items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-white border border-stone-300 rounded-lg text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-[#073D28] min-h-[42px]"
              aria-label="তারিখ অনুযায়ী অনুসন্ধান"
            />
          </div>

          {(selectedDate || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedDate('');
                setSearchQuery('');
              }}
              className="min-h-[42px] px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-950 bg-stone-200/80 hover:bg-stone-300 rounded-lg transition-colors cursor-pointer"
            >
              রিসেট
            </button>
          )}
        </div>
      </div>

      {/* Timeline / Ledger Style List */}
      {filteredLessons.length > 0 ? (
        <div className="relative border-l-2 border-[#0A4830]/25 ml-3 sm:ml-5 space-y-6 sm:space-y-8 pl-5 sm:pl-8">
          {filteredLessons.map((item) => (
            <div key={item.id} className="relative group">
              {/* Timeline Node Point */}
              <div className="absolute -left-[27px] sm:-left-[39px] top-4 w-4 h-4 rounded-full bg-white border-3 border-[#0A4830] shadow-2xs group-hover:scale-125 transition-transform" />

              {/* Archive Item Container */}
              <div className="bg-white rounded-xl border border-stone-200/90 shadow-2xs hover:shadow-xs hover:border-emerald-800/40 transition-all p-5 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Date & Lesson Info */}
                  <div className="flex-1 space-y-2.5">
                    {/* Unboxed Date & Class Metadata */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-medium">
                      <span className="text-[#073D28] font-bold text-sm">
                        {item.date}
                      </span>
                      <span aria-hidden="true" className="text-stone-300">·</span>
                      <span className="text-stone-700 font-semibold">{item.dayName}</span>
                      {item.hijriDate && (
                        <>
                          <span aria-hidden="true" className="text-stone-300">·</span>
                          <span className="text-stone-600">{item.hijriDate}</span>
                        </>
                      )}
                      <span aria-hidden="true" className="text-stone-300">·</span>
                      <span>শ্রেণি: {item.className}</span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-serif-bn font-bold text-stone-900 group-hover:text-[#073D28] transition-colors">
                      {item.lessonTitle}
                    </h3>

                    {/* Quick Two-Pillar Lesson Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="flex items-start gap-2 bg-[#F6FAF7] p-3 rounded-lg border border-emerald-900/10">
                        <BookOpen className="w-4 h-4 text-[#073D28] shrink-0 mt-0.5" />
                        <div className="text-xs sm:text-sm">
                          <span className="font-bold text-stone-900">কায়দা: </span>
                          <span className="text-stone-700">{item.qaida}</span>
                        </div>
                      </div>

                      {item.ampara && (
                        <div className="flex items-start gap-2 bg-[#FFFDF5] p-3 rounded-lg border border-amber-900/10">
                          <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <div className="text-xs sm:text-sm">
                            <span className="font-bold text-stone-900">আমপারা: </span>
                            <span className="text-stone-700">{item.ampara}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Brief Homework line */}
                    <p className="text-xs text-stone-600 pt-1">
                      <span className="font-semibold text-stone-800">বাড়ির কাজ: </span>
                      {item.homework}
                    </p>
                  </div>

                  {/* Right Action Button */}
                  <div className="shrink-0 flex items-center lg:self-center pt-2 lg:pt-0">
                    <button
                      type="button"
                      onClick={() => onSelectLesson(item)}
                      className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-lg bg-stone-100 hover:bg-[#08422B] text-stone-800 hover:text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 border border-stone-200 hover:border-[#08422B] cursor-pointer"
                    >
                      <span>বিস্তারিত বিবরণ</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-8 sm:p-12 text-center">
          <Filter className="w-8 h-8 text-stone-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-stone-800">
            কোনো পাঠের তথ্য পাওয়া যায়নি
          </h3>
          <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
            আপনার অনুসন্ধান বা তারিখের সাথে মিল রেখে কোনো আর্কাইভ তথ্য মেলেনি। ফিল্টার রিসেট করুন।
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedDate('');
              setSearchQuery('');
            }}
            className="mt-4 min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-[#08422B] hover:bg-[#063522] rounded-lg transition-colors cursor-pointer"
          >
            সব পাঠ দেখুন
          </button>
        </div>
      )}
    </section>
  );
};
