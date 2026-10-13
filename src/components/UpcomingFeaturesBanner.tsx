/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BellRing, FileText, CalendarDays } from 'lucide-react';

export const UpcomingFeaturesBanner: React.FC = () => {
  return (
    <aside aria-label="আসন্ন সুবিধা ও নোটিশ" className="my-8 sm:my-10 p-5 rounded-2xl bg-[#F7F5EE] border border-amber-800/15 text-stone-700 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#08422B] text-amber-300 flex items-center justify-center shrink-0 shadow-2xs">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 font-serif-bn">
              অভিভাবকদের সুবিধার্থে পর্যায়ক্রমিক ডিজিটাল সেবা
            </h4>
            <p className="text-xs text-stone-600 mt-0.5">
              সামনে এই পোর্টালে যুক্ত হচ্ছে সাময়িক পরীক্ষার ফলাফল, সাধারণ নোটিশ ও বার্ষিক ছুটির তালিকা।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-stone-600 shrink-0 font-medium">
          <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-stone-200">
            <FileText className="w-3.5 h-3.5 text-amber-700" />
            <span>পরীক্ষার ফলাফল</span>
          </span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-stone-200">
            <CalendarDays className="w-3.5 h-3.5 text-[#073D28]" />
            <span>ছুটির ক্যালেন্ডার</span>
          </span>
        </div>
      </div>
    </aside>
  );
};
