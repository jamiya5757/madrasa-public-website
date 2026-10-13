/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { TodaysLessonCard, Department } from './components/TodaysLessonCard';
import { PreviousLessons } from './components/PreviousLessons';
import { MadrasaInfo } from './components/MadrasaInfo';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { LessonDetailModal } from './components/LessonDetailModal';
import { Toast } from './components/Toast';
import { lessonService } from './services/lessonService';
import { Lesson, MadrasaInfo as MadrasaInfoType } from './types/lesson';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [todaysLesson, setTodaysLesson] = useState<Lesson | null>(null);
  const [previousLessons, setPreviousLessons] = useState<Lesson[]>([]);
  const [madrasaInfo, setMadrasaInfo] = useState<MadrasaInfoType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeDept, setActiveDept] = useState<Department>('noorani');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [today, previous, info] = await Promise.all([
          lessonService.getTodaysLesson(),
          lessonService.getPreviousLessons(),
          lessonService.getMadrasaInfo(),
        ]);
        setTodaysLesson(today);
        setPreviousLessons(previous);
        setMadrasaInfo(info);
      } catch (err) {
        console.error('Failed to load madrasa lesson data:', err);
        setTodaysLesson(null);
        setPreviousLessons([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F2] text-stone-900 selection:bg-emerald-100 selection:text-emerald-950 font-sans">
      {/* Top Bar Header */}
      <Header
        onNavigateToToday={() => scrollToSection('today')}
        onNavigateToArchive={() => scrollToSection('archive')}
        onNavigateToAbout={() => scrollToSection('about')}
        onNavigateToContact={() => scrollToSection('contact')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-8 pb-4 sm:pb-6 space-y-6 sm:space-y-8">
        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-stone-600">
            <Loader2 className="w-8 h-8 animate-spin text-[#073D28]" />
            <p className="text-sm font-semibold">আজকের পাঠের বিবরণী লোড হচ্ছে...</p>
          </div>
        ) : madrasaInfo ? (
          <>
            {/* Primary Focus: Today's Lesson with Department Segmented Tabs */}
            <TodaysLessonCard
              lesson={todaysLesson}
              activeDept={activeDept}
              onSelectDept={setActiveDept}
              onCopySuccess={() => triggerToast('আজকের পড়া ক্লিপবোর্ডে কপি করা হয়েছে!')}
            />

            {/* Previous Lessons Timeline (Visible for Noorani) */}
            {activeDept === 'noorani' && (
              <PreviousLessons
                lessons={previousLessons}
                onSelectLesson={(lesson) => setSelectedLesson(lesson)}
              />
            )}

            {/* About Madrasa */}
            <MadrasaInfo info={madrasaInfo} />

            {/* Contact & Helpline */}
            <ContactSection info={madrasaInfo} />
          </>
        ) : (
          <div className="text-center py-16 text-stone-500">
            <p>পাঠের তথ্য লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পৃষ্ঠাটি রিফ্রেশ করুন।</p>
          </div>
        )}
      </main>

      {/* Detail Modal for Previous Lessons */}
      <LessonDetailModal
        lesson={selectedLesson}
        onClose={() => setSelectedLesson(null)}
        onCopySuccess={() => triggerToast('পাঠের পূর্ণ বিবরণ কপি করা হয়েছে!')}
      />

      {/* Floating Feedback Toast */}
      <Toast message={toastMessage} show={showToast} />

      {/* Footer */}
      <Footer
        onNavigateToToday={() => scrollToSection('today')}
        onNavigateToArchive={() => scrollToSection('archive')}
        onNavigateToAbout={() => scrollToSection('about')}
        onNavigateToContact={() => scrollToSection('contact')}
      />
    </div>
  );
}
