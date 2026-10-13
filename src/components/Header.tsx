/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, BookOpen, Clock, ChevronRight, Bell } from 'lucide-react';
import emblemImg from '../assets/images/madrasa_emblem_logo_1791342863943.jpg';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  onNavigateToToday: () => void;
  onNavigateToArchive: () => void;
  onNavigateToAbout: () => void;
  onNavigateToContact: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigateToToday,
  onNavigateToArchive,
  onNavigateToAbout,
  onNavigateToContact,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    async function fetchNotices() {
      try {
        const nowIso = new Date().toISOString();
        const { data, error } = await supabase
          .from('notices')
          .select('*')
          .eq('is_published', true)
          .lte('scheduled_at', nowIso)
          .order('scheduled_at', { ascending: false });

        if (!error && data) {
          setNotices(data);
        } else if (error) {
          console.warn('Notice fetch note (ensure notices table & RLS policies exist):', error.message);
        }
      } catch (err) {
        console.warn('Failed to fetch notices:', err);
      }
    }

    fetchNotices();
    const interval = setInterval(fetchNotices, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleNav = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
  };

  const tickerNotices = React.useMemo(() => {
    const listToUse = notices && notices.length > 0 ? notices : [
      { id: 'default-1', title: 'মাদরাসা নোটিশ', content: 'দারুল উলূম নূরানী মাদরাসার নিয়মিত শিক্ষা কার্যক্রম ও নোটিশ বোর্ডে স্বাগতম।' }
    ];
    let list = [...listToUse];
    while (list.length < 6) {
      list = [...list, ...listToUse];
    }
    return [...list, ...list];
  }, [notices]);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F2]/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs">
      {/* Permanent Notice Ticker Header Strip */}
      <div className="text-xs sm:text-sm py-2 sm:py-2.5 bg-[#FFFFFF] text-[#111111] border-b border-stone-200 overflow-hidden transition-colors">
        <div className="w-full pl-2 pr-4 flex items-center">
          <div className="flex items-center w-full overflow-hidden">
            <span className="text-[#073D28] font-bold mr-3 shrink-0 flex items-center gap-1.5 z-10 bg-white pr-2 text-xs sm:text-sm">
              <Bell className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>জরুরি নোটিশ:</span>
            </span>
            <div className="overflow-hidden w-full relative">
              <div className="animate-marquee flex items-center gap-2 whitespace-nowrap">
                {tickerNotices.map((n, i) => {
                  const title = n.title || '';
                  const content = n.content || n.message || n.notice_text || n.text || '';
                  return (
                    <div key={n.id ? `${n.id}-${i}` : i} className="flex items-center gap-2 shrink-0 whitespace-nowrap text-[#111111] text-xs sm:text-sm">
                      {title && <span className="font-bold text-[#073D28]">{title}:</span>}
                      <span className="font-semibold">{content}</span>
                      <span className="text-stone-300 ml-2 font-normal">✦</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
        {/* Zone 1: Brand Emblem & Title */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 rounded-lg py-1 min-w-0"
        >
          <div className="relative shrink-0">
            <img
              src={emblemImg}
              alt="জামিয়া আরাবিয়া মদিনাতুল উলুম রাখালিয়াচালা মাদ্রাসা লোগো"
              referrerPolicy="no-referrer"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-amber-600/30 shadow-xs transition-transform group-hover:scale-102"
            />
            {/* Subtle gold accent dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-amber-600 border border-white rounded-full" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-serif-bn font-bold text-sm sm:text-base lg:text-lg text-[#0B3A26] tracking-tight leading-tight">
                জামিয়া আরাবিয়া মদিনাতুল উলুম রাখালিয়াচালা মাদ্রাসা
              </span>
            </div>
            <span className="text-[11px] sm:text-xs text-stone-600 font-medium">
              মৌচাক, কালিয়াকৈর, গাজীপুর
            </span>
          </div>
        </a>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-stone-700">
          <button
            type="button"
            onClick={onNavigateToToday}
            className="hover:text-[#0B3A26] transition-colors py-1 cursor-pointer"
          >
            বিভাগ
          </button>
          <button
            type="button"
            onClick={onNavigateToArchive}
            className="hover:text-[#0B3A26] transition-colors py-1 cursor-pointer"
          >
            পাঠসমূহ
          </button>
          <button
            type="button"
            onClick={onNavigateToAbout}
            className="hover:text-[#0B3A26] transition-colors py-1 cursor-pointer"
          >
            মাদরাসা পরিচিতি
          </button>
          <button
            type="button"
            onClick={onNavigateToContact}
            className="hover:text-[#0B3A26] transition-colors py-1 cursor-pointer"
          >
            যোগাযোগ
          </button>
        </nav>

        {/* Zone 3: Primary Action & Mobile Menu Toggle */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onNavigateToToday}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0A4830] hover:bg-[#073825] border border-emerald-950/20 rounded-lg shadow-xs transition-all whitespace-nowrap min-h-[42px]"
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>আজকের পাঠ দেখুন</span>
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'}
            className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg text-stone-700 hover:bg-stone-200/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-stone-800" /> : <Menu className="w-6 h-6 text-stone-800" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200/90 bg-[#FAF8F2] px-4 py-4 space-y-2.5 animate-in fade-in duration-200 shadow-lg">
          <button
            type="button"
            onClick={() => handleNav(onNavigateToToday)}
            className="w-full text-left py-3 px-3.5 rounded-lg text-sm font-bold text-[#073D28] bg-emerald-50 border border-emerald-900/10 flex items-center justify-between min-h-[46px]"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-800" />
              <span>আজকের নূরানী পড়া</span>
            </span>
            <ChevronRight className="w-4 h-4 text-emerald-700" />
          </button>

          <button
            type="button"
            onClick={() => handleNav(onNavigateToArchive)}
            className="w-full text-left py-3 px-3.5 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-100 min-h-[46px] flex items-center justify-between"
          >
            <span>পূর্ববর্তী পাঠসমূহ (আর্কাইভ)</span>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          <button
            type="button"
            onClick={() => handleNav(onNavigateToAbout)}
            className="w-full text-left py-3 px-3.5 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-100 min-h-[46px] flex items-center justify-between"
          >
            <span>মাদরাসা পরিচিতি ও বৈশিষ্ট্য</span>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          <button
            type="button"
            onClick={() => handleNav(onNavigateToContact)}
            className="w-full text-left py-3 px-3.5 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-100 min-h-[46px] flex items-center justify-between"
          >
            <span>যোগাযোগ ও অভিভাবক হেল্পলাইন</span>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          <div className="pt-3 border-t border-stone-200">
            <a
              href="tel:01711234567"
              className="w-full py-3 px-3.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#0A4830] flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Phone className="w-4 h-4 text-amber-300" />
              <span>মুয়াল্লিম / অফিসে সরাসরি কল: ০১৭১১-২৩৪৫৬৭</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
