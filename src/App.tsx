/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { TodaysLessonCard, Department } from './components/TodaysLessonCard';
import { MadrasaInfo } from './components/MadrasaInfo';
import { ContactSection } from './components/ContactSection';
import { ExamsPage } from './components/ExamsPage';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { lessonService } from './services/lessonService';
import { Lesson, MadrasaInfo as MadrasaInfoType } from './types/lesson';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [todaysLesson, setTodaysLesson] = useState<Lesson | null>(null);
  const [madrasaInfo, setMadrasaInfo] = useState<MadrasaInfoType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeDept, setActiveDept] = useState<Department>('noorani');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [today, info] = await Promise.all([
          lessonService.getTodaysLesson(),
          lessonService.getMadrasaInfo(),
        ]);
        setTodaysLesson(today);
        setMadrasaInfo(info);
      } catch (err) {
        console.error('Failed to load madrasa lesson data:', err);
        setTodaysLesson(null);
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

  const navigateTo = (path: string, sectionId?: string) => {
    const normalizedPath = path === '/exams' || path === '/exams/' ? '/exams' : '/';
    if (window.location.pathname !== normalizedPath) {
      window.history.pushState({}, '', normalizedPath);
      setCurrentPath(normalizedPath);
    } else {
      setCurrentPath(normalizedPath);
    }

    if (normalizedPath === '/' && sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isExamsRoute = currentPath === '/exams' || currentPath === '/exams/';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F2] text-stone-900 selection:bg-emerald-100 selection:text-emerald-950 font-sans">
      {/* Top Bar Header */}
      <Header
        currentPath={currentPath}
        onNavigateToHome={() => navigateTo('/')}
        onNavigateToToday={() => navigateTo('/', 'today')}
        onNavigateToArchive={() => navigateTo('/', 'today')}
        onNavigateToExam={() => navigateTo('/exams')}
        onNavigateToAbout={() => navigateTo('/', 'about')}
        onNavigateToContact={() => navigateTo('/', 'contact')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-8 pb-4 sm:pb-6 space-y-6 sm:space-y-8">
        <div key={isExamsRoute ? 'exams' : 'home'} className="animate-page-transition space-y-6 sm:space-y-8">
          {isExamsRoute ? (
            <ExamsPage />
          ) : loading ? (
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
        </div>
      </main>

      {/* Floating Feedback Toast */}
      <Toast message={toastMessage} show={showToast} />

      {/* Footer */}
      <Footer
        onNavigateToToday={() => navigateTo('/', 'today')}
        onNavigateToArchive={() => navigateTo('/', 'today')}
        onNavigateToAbout={() => navigateTo('/', 'about')}
        onNavigateToContact={() => navigateTo('/', 'contact')}
      />
    </div>
  );
}
