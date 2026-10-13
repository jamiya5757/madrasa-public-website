/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Clock, Award, Users, BookOpen, MapPin, Phone } from 'lucide-react';
import { MadrasaInfo as MadrasaInfoType } from '../types/lesson';
import hallImg from '../assets/images/madrasa_learning_hall_1791342881948.jpg';

interface MadrasaInfoProps {
  info: MadrasaInfoType;
}

export const MadrasaInfo: React.FC<MadrasaInfoProps> = ({ info }) => {
  return (
    <section id="about" className="scroll-mt-24 pt-1 sm:pt-2">
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Architectural Learning Hall Photography */}
          <div className="lg:col-span-4 relative min-h-[220px] lg:min-h-full bg-stone-100 border-b lg:border-b-0 lg:border-r border-stone-200">
            <img
              src={hallImg}
              alt="দারুল উলূম নূরানী মাদরাসার শ্রেণিকক্ষ"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent flex items-end p-5">
              <div className="text-white">
                <span className="text-amber-300 text-[11px] font-bold tracking-wider uppercase">
                  শান্তিপূর্ণ দ্বীনি পরিবেশ
                </span>
                <p className="text-xs sm:text-sm font-medium leading-snug drop-shadow-xs mt-0.5">
                  শিশু-বান্ধব পরিবেশে নূরানী কুরআন শিক্ষা ও চরিত্র গঠন
                </p>
              </div>
            </div>
          </div>

          {/* Institutional Content */}
          <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#073D28]">
                <Award className="w-4 h-4 text-amber-600" />
                <span>মাদরাসা পরিচিতি</span>
              </div>
              <h2 className="mt-1 text-xl sm:text-2xl lg:text-[22px] xl:text-2xl font-serif-bn font-bold text-stone-900 whitespace-normal lg:whitespace-nowrap">
                {info.name}
              </h2>
              <p className="mt-2 text-stone-600 text-sm sm:text-base leading-relaxed">
                {info.tagline}। কোমলমতি শিশুদের অল্প সময়ে সহিহ মাখরাজ ও তাজবীদের সাথে কুরআন মাজীদ তিলাওয়াত শিক্ষা এবং দৈনন্দিন জীবনে নববী আদব-শিষ্টাচার গঠনের নির্ভরযোগ্য দ্বীনি প্রতিষ্ঠান।
              </p>

              {/* Salient Features Grid */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-stone-200/80">
                  <div className="flex items-start gap-2.5">
                    <BookOpen className="w-4 h-4 text-[#073D28] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                        বোর্ড অনুমোদিত পাঠ্যক্রম
                      </h4>
                      <p className="text-xs text-stone-600 mt-0.5">
                        {info.boardAffiliation}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-stone-200/80">
                  <div className="flex items-start gap-2.5">
                    <Users className="w-4 h-4 text-[#073D28] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                        সনদপ্রাপ্ত মুয়াল্লিমবৃন্দ
                      </h4>
                      <p className="text-xs text-stone-600 mt-0.5">
                        স্নেহপরায়ণ ও তাজবীদে অভিজ্ঞ শিক্ষক
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-stone-200/80">
                  <div className="flex items-start gap-2.5">
                    <BookOpen className="w-4 h-4 text-[#073D28] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                        শিক্ষাব্যবস্থা
                      </h4>
                      <p className="text-xs text-stone-600 mt-0.5">
                        নূরানী, নাজেরা, হিফজ ও কিতাব বিভাগ
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-stone-200/80">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#073D28] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                        অবস্থান ও ঠিকানা
                      </h4>
                      <p className="text-xs text-stone-600 mt-0.5">
                        {info.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Institutional Info Row */}
            <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
              <span>স্থাপিত: {info.establishedYear} খ্রিষ্টাব্দ</span>
              <span>অভিভাবক পরামর্শ সময়: {info.parentConsultationHours}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
