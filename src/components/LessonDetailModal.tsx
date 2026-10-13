/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, BookOpen, Sparkles, Copy, Check, Share2, HelpCircle, FileCheck2, UserCheck } from 'lucide-react';
import { Lesson } from '../types/lesson';

interface LessonDetailModalProps {
  lesson: Lesson | null;
  onClose: () => void;
  onCopySuccess: () => void;
}

export const LessonDetailModal: React.FC<LessonDetailModalProps> = ({
  lesson,
  onClose,
  onCopySuccess,
}) => {
  const [copied, setCopied] = useState(false);

  if (!lesson) return null;

  const handleCopy = () => {
    const textToCopy = `📚 জামিয়া আরাবিয়া মদিনাতুল উলুম রাখালিয়াচালা মাদ্রাসা
📅 নূরানী ক্লাসের পাঠ (${lesson.date}, ${lesson.dayName})
---------------------------------
বিষয়: ${lesson.lessonTitle}
📖 কায়দা: ${lesson.qaida}
🕌 আমপারা: ${lesson.ampara || 'প্রযোজ্য নয়'}
${lesson.duaOrHadith ? `🤲 দু'আ/সুন্নত: ${lesson.duaOrHadith}\n` : ''}
📝 বাড়ির কাজ:
${lesson.homework}
${lesson.note ? `\n💡 অভিভাবক নোট: ${lesson.note}\n` : ''}
মুয়াল্লিম: ${lesson.teacherName || 'মুয়াল্লিম সাহেব'}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      onCopySuccess();
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShareWhatsApp = () => {
    const textToShare = `*জামিয়া আরাবিয়া মদিনাতুল উলুম রাখালিয়াচালা মাদ্রাসা*\n*নূরানী পাঠ (${lesson.date}, ${lesson.dayName})*\n\n📖 *কায়দা:* ${lesson.qaida}\n🕌 *আমপারা:* ${lesson.ampara || 'প্রযোজ্য নয়'}\n📝 *বাড়ির কাজ:* ${lesson.homework}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
    window.open(url, '_blank');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl rounded-2xl border border-stone-300 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-emerald-950 bg-[#08422B] text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
              <span>{lesson.date}</span>
              <span aria-hidden="true">·</span>
              <span>{lesson.dayName}</span>
              {lesson.hijriDate && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-100">{lesson.hijriDate}</span>
                </>
              )}
            </div>
            <h3 className="mt-1 text-lg sm:text-xl font-serif-bn font-bold text-white">
              {lesson.lessonTitle}
            </h3>
            {lesson.teacherName && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-200/90 font-medium">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{lesson.teacherName}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-900/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 bg-white">
          {/* Qaida info */}
          <div className="rounded-xl border border-emerald-900/15 bg-[#F6FAF7] p-4">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-[#073D28] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs uppercase font-bold text-[#073D28] tracking-wider">
                  নূরানী কায়দা পাঠ
                </h4>
                <p className="mt-1 text-base font-bold text-stone-900">
                  {lesson.qaida}
                </p>
              </div>
            </div>
          </div>

          {/* Ampara info */}
          <div className="rounded-xl border border-amber-900/15 bg-[#FFFDF5] p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs uppercase font-bold text-amber-900 tracking-wider">
                  আমপারা / কুরআন তিলাওয়াত
                </h4>
                <p className="mt-1 text-base font-bold text-stone-900">
                  {lesson.ampara || 'আমপারা পাঠ ছিল না'}
                </p>
              </div>
            </div>
          </div>

          {/* Dua/Hadith if present */}
          {lesson.duaOrHadith && (
            <div className="rounded-xl border border-stone-200 bg-[#FAF9F5] p-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-stone-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs uppercase font-bold text-stone-700 tracking-wider">
                    মাসনূন দু'আ ও শিষ্টাচার
                  </h4>
                  <p className="mt-1 text-sm text-stone-900 font-semibold">
                    {lesson.duaOrHadith}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Homework */}
          <div className="rounded-xl border-2 border-[#0A4830]/20 bg-[#FBF9F2] p-4 shadow-2xs">
            <div className="flex items-center gap-1.5 mb-1.5">
              <FileCheck2 className="w-4 h-4 text-[#0A4830]" />
              <h4 className="text-xs uppercase font-bold text-stone-900 tracking-wider">
                বাড়ির কাজ (হোমওয়ার্ক)
              </h4>
            </div>
            <p className="text-stone-900 text-sm sm:text-base font-medium leading-relaxed bg-white p-3 rounded-lg border border-stone-200/90">
              {lesson.homework}
            </p>
          </div>

          {/* Note */}
          {lesson.note && (
            <div className="p-4 rounded-xl bg-amber-50 text-stone-800 text-xs sm:text-sm leading-relaxed border border-amber-300/60 font-medium">
              <span className="font-bold text-amber-950">মুয়াল্লিমের নোট: </span>
              {lesson.note}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-[#FAF8F2] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span className="text-emerald-800 font-bold">কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-500" />
                  <span>কপি করুন</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="min-h-[44px] px-3.5 py-2 rounded-lg bg-[#073D28] hover:bg-[#052F1E] text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <Share2 className="w-4 h-4 text-amber-300" />
              <span>হোয়াটসঅ্যাপ</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
