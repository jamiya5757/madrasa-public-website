/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import emblemImg from '../assets/images/madrasa_emblem_logo_1791342863943.jpg';
import { Phone, MapPin, Clock, BookOpen } from 'lucide-react';

interface FooterProps {
  onNavigateToToday: () => void;
  onNavigateToArchive: () => void;
  onNavigateToAbout: () => void;
  onNavigateToContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateToToday,
  onNavigateToArchive,
  onNavigateToAbout,
  onNavigateToContact,
}) => {
  return (
    <footer className="mt-6 sm:mt-8 border-t border-stone-200 bg-[#F4F1E8] text-stone-700">
      {/* Quranic Prayer Top Ribbon */}
      <div className="border-b border-stone-200/90 py-5 px-4 text-center bg-[#ECE8DC]/50">
        <p className="font-arabic text-lg sm:text-xl text-[#073D28] tracking-widest font-normal">
          « رَّبِّ زِدْنِي عِلْمًا »
        </p>
        <p className="text-xs text-stone-600 mt-1 font-medium">
          "হে আমার প্রতিপালক! আমাকে জ্ঞানে সমৃদ্ধ করুন।" — (সূরা ত্ব-হা, আয়াত ১১৪)
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
          {/* Madrasa Identity */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={emblemImg}
                alt="জামিয়া আরাবিয়া মদিনাতুল উলুম রাখালিয়াচালা মাদ্রাসা"
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border-2 border-amber-600/30"
              />
              <div>
                <h3 className="font-serif-bn font-bold text-base sm:text-lg text-stone-900 leading-tight">
                  জামিয়া আরাবিয়া মদিনাতুল উলুম রাখালিয়াচালা মাদ্রাসা
                </h3>
                <span className="text-[11px] text-stone-500 font-medium">
                  মৌচাক, কালিয়াকৈর, গাজীপুর
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm pt-1">
              কোমলমতি শিশুদের সহিহ-শুদ্ধভাবে কুরআন মাজীদ তিলাওয়াত শিক্ষা এবং দ্বীনি আদব ও শৃঙ্খলা গঠনের বিশ্বস্ত অভিভাবক-বান্ধব প্রতিষ্ঠান।
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              গুরুত্বপূর্ণ লিঙ্কসমূহ
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  type="button"
                  onClick={onNavigateToToday}
                  className="text-stone-600 hover:text-[#073D28] transition-colors py-0.5 text-left cursor-pointer"
                >
                  আজকের নূরানী পড়া
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onNavigateToArchive}
                  className="text-stone-600 hover:text-[#073D28] transition-colors py-0.5 text-left cursor-pointer"
                >
                  পূর্ববর্তী পাঠের সংরক্ষণাগার
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onNavigateToAbout}
                  className="text-stone-600 hover:text-[#073D28] transition-colors py-0.5 text-left cursor-pointer"
                >
                  মাদরাসা পরিচিতি ও পাঠ্যক্রম
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onNavigateToContact}
                  className="text-stone-600 hover:text-[#073D28] transition-colors py-0.5 text-left cursor-pointer"
                >
                  যোগাযোগ ও অবস্থান
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Summary */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              মাদরাসা কার্যালয়
            </h4>
            <div className="space-y-2 text-xs text-stone-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#073D28] shrink-0 mt-0.5" />
                <span>রাখালিয়াচালা, পাকার মাথার আগে, নেতার মাদ্রাসা</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#073D28] shrink-0" />
                <span>হেল্পলাইন: ০১৩৪২-৬৭৫৭৫৭ / ০১৬০৪-৯৮৮২০০</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-[#073D28] shrink-0" />
                <span>শিক্ষাব্যবস্থা: নূরানী, নাজেরা, হিফজ ও কিতাব বিভাগ</span>
              </div>
            </div>
            <p className="text-[11px] text-stone-500 pt-2 border-t border-stone-200">
              ইনশাআল্লাহ প্রতিদিন আছরের পর পড়া প্রকাশ করা হবে।
            </p>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-8 pt-6 border-t border-stone-200/90 text-center text-xs text-stone-500 font-medium">
          <span>© ২০২৬ জামিয়া আরাবিয়া মদিনাতুল উলুম রাখালিয়াচালা মাদ্রাসা। সর্বস্বত্ব সংরক্ষিত।</span>
        </div>
      </div>
    </footer>
  );
};
