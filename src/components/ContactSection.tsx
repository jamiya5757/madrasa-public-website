/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Phone, MapPin, Clock, Copy, Check, PhoneCall } from 'lucide-react';
import { MadrasaInfo } from '../types/lesson';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M12.012 2c-5.508 0-9.982 4.475-9.982 9.983 0 1.764.462 3.486 1.34 5.006L2 22l5.12-1.34c1.472.802 3.136 1.224 4.892 1.224 5.508 0 9.982-4.475 9.982-9.983 0-5.508-4.474-9.983-9.982-9.983zm0 18.288c-1.524 0-3.023-.41-4.34-1.185l-.311-.184-3.23.846.862-3.148-.203-.323a8.28 8.28 0 0 1-1.272-4.48c0-4.57 3.718-8.289 8.294-8.289 4.57 0 8.288 3.719 8.288 8.289 0 4.57-3.718 8.288-8.288 8.288zm4.542-6.208c-.249-.125-1.472-.726-1.7-.809-.228-.083-.395-.125-.561.125-.166.249-.644.809-.79 0.974-.145.166-.29.187-.539.062a6.8 6.8 0 0 1-2.001-1.233c-.76-.665-1.274-1.488-1.423-1.737-.149-.249-.016-.384.109-.508.112-.112.249-.29.374-.436.125-.145.166-.29.249-.415.083-.166.042-.311-.021-.436s-.561-1.352-.769-1.85c-.203-.486-.41-.418-.561-.426h-.478c-.166 0-.436.062-.664.311s-.873.852-.873 2.078c0 1.225.893 2.408 1.018 2.574.125.166 1.758 2.685 4.26 3.766.595.257 1.06.41 1.422.525.597.19 1.141.163 1.571.099.478-.071 1.472-.602 1.68-1.183.208-.581.208-1.08.145-1.183-.062-.104-.228-.166-.477-.291z" />
  </svg>
);

interface ContactSectionProps {
  info: MadrasaInfo;
}

const DIRECT_CONTACTS = [
  {
    designation: 'পরিচালক',
    displayNumber: '০১৭৩৯-৯৭৩১০৭',
    rawNumber: '01739973107',
  },
  {
    designation: 'মুহতামীম',
    displayNumber: '০১৬০৪-৯৮৮২০০',
    rawNumber: '01604988200',
  },
  {
    designation: 'ছদরুল মুদাররিস',
    displayNumber: '০১৩৪২-৬৭৫৭৫৭',
    rawNumber: '01342675757',
  },
];

export const ContactSection: React.FC<ContactSectionProps> = ({ info }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyNumber = (rawNumber: string, index: number) => {
    navigator.clipboard.writeText(rawNumber).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  return (
    <section id="contact" className="scroll-mt-24 pt-1 sm:pt-2">
      <div className="bg-[#073D28] text-white rounded-2xl p-6 sm:p-8 lg:p-10 border border-emerald-950 shadow-sm relative overflow-hidden">
        {/* Subtle warm gold accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600/40 via-amber-400/80 to-amber-600/40" />

        <div className="max-w-2xl mb-8">
          <span className="text-xs uppercase tracking-wider text-amber-300 font-bold">
            যোগাযোগ ও অভিভাবক সেবা
          </span>
          <h2 className="mt-1 text-2xl sm:text-3xl font-serif-bn font-bold text-white">
            মাদরাসা কার্যালয় ও জরুরি হেল্পলাইন
          </h2>
          <p className="mt-2 text-emerald-100/90 text-sm leading-relaxed">
            সন্তানের দৈনিক পড়া, ছুটি কিংবা যেকোনো প্রয়োজনে সরাসরি পরিচালক বা মুহতামীম বা ছদরুল মুদারিসীনের সাথে যোগাযোগ করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location Card */}
          <div className="bg-[#052F1E] rounded-xl p-5 border border-emerald-800/60 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-emerald-800/80 text-amber-300 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white font-serif-bn">ঠিকানা ও অবস্থান</h3>
              <p className="mt-2 text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                {info.address}
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-emerald-900/60 flex items-center gap-1.5 text-xs text-amber-200/90">
              <Clock className="w-3.5 h-3.5" />
              <span>সাক্ষাৎ: {info.parentConsultationHours}</span>
            </div>
          </div>

          {/* Direct Calling & Contact List Card */}
          <div className="bg-[#052F1E] rounded-xl p-5 border border-emerald-800/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-4 border-b border-emerald-800/50 pb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-800/80 text-amber-300 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white font-serif-bn">ফোন নম্বর ও যোগাযোগ</h3>
              </div>

              <div className="divide-y divide-emerald-800/40">
                {DIRECT_CONTACTS.map((contact, idx) => (
                  <div
                    key={contact.rawNumber}
                    className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    {/* Name and Phone Number Side by Side */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-amber-300 font-serif-bn whitespace-nowrap">
                        {contact.designation} —
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-white tracking-wide whitespace-nowrap font-mono">
                        {contact.displayNumber}
                      </span>
                    </div>

                    {/* Action Buttons: কপি → কল → WhatsApp */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyNumber(contact.rawNumber, idx)}
                        className="min-h-[30px] px-2.5 py-1 rounded bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 hover:text-white border border-emerald-700/50 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title={`${contact.designation}-এর নম্বর কপি করুন`}
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-amber-300" />
                            <span className="text-amber-300 font-bold">কপি হয়েছে!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>কপি</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`tel:${contact.rawNumber}`}
                        className="min-h-[30px] px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        title={`${contact.designation}-কে সরাসরি কল করুন`}
                      >
                        <PhoneCall className="w-3 h-3 text-stone-950" />
                        <span>কল</span>
                      </a>

                      <a
                        href={`https://wa.me/88${contact.rawNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[30px] px-2.5 py-1 rounded bg-[#073D28] hover:bg-[#0A4D33] text-emerald-200 hover:text-white border border-emerald-700/80 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title={`${contact.designation}-এর হোয়াটসঅ্যাপে বার্তা পাঠান`}
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 text-amber-300 fill-current" />
                        <span>মেসেজ</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
