"use client";

import React, { useState, useEffect } from "react";
import { Scale, FileText, Shield, AlertTriangle, PlayCircle, BookOpen, Globe } from "lucide-react";
import PublicNav from "@/app/components/general/PublicNav";
import PublicFooter from "@/app/components/general/PublicFooter";
import { Reveal } from "@/app/components/general/PublicComponents";

export default function TermsPage() {
  const [date, setDate] = useState<string>("March 23, 2026");

  useEffect(() => {
    setDate(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
  }, []);

  return (
    <main className="bg-[#FAFAFA] min-h-screen text-gray-900 overflow-x-hidden">
      <PublicNav transparent={false} />

      {/* Decorative Background */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-linear-to-b from-indigo-50/80 to-transparent pointer-events-none -z-10" />

      <section className="relative pt-32 pb-24 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <Reveal>
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-indigo-100 rounded-full text-xs font-bold text-indigo-700 shadow-sm">
                <Scale size={14} className="text-indigo-500" />
                Legal Documents
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.06] text-gray-900">
                Terms of Service
              </h1>
              <p className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-xl mx-auto">
                Last updated: <span className="font-medium text-gray-700">{date}</span>
              </p>
            </div>
          </Reveal>

          <Reveal delay={100} className="prose prose-indigo max-w-none bg-white p-8 sm:p-14 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-100/10 space-y-12">
            
            {/* Intro */}
            <div className="text-base sm:text-lg text-gray-500 leading-relaxed space-y-4">
              <p>
                Welcome to Snippit. These terms outline our mutual agreement. We&apos;ve tried to keep them 
                as simple and readable as possible.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-4 text-gray-900">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-indigo-600" />
                </div>
                1. Acceptance of Terms
              </h2>
              <p className="text-base sm:text-lg text-gray-500 leading-relaxed ml-0 sm:ml-14">
                By accessing Snippit, you agree to be bound by these Terms of Service. 
                If you do not agree, please do not use our platform.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-4 text-gray-900">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <Shield size={20} className="text-indigo-600" />
                </div>
                2. Content Ownership & Responsibility
              </h2>
              <p className="text-base sm:text-lg text-gray-500 leading-relaxed ml-0 sm:ml-14">
                Snippit allows you to upload, curate, and share a wide variety of content. 
                You retain ownership of your annotations, but you are responsible for ensuring 
                your use of third-party media complies with copyright laws.
              </p>

              {/* Media Types Grid */}
              <div className="grid sm:grid-cols-3 gap-4 ml-14 mt-6">
                 <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col gap-2">
                    <PlayCircle size={20} className="text-red-500" />
                    <span className="font-semibold text-gray-800">Videos & YouTube</span>
                 </div>
                 <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col gap-2">
                    <BookOpen size={20} className="text-emerald-500" />
                    <span className="font-semibold text-gray-800">Books & Articles</span>
                 </div>
                 <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col gap-2">
                    <Globe size={20} className="text-sky-500" />
                    <span className="font-semibold text-gray-800">Websites & Podcasts</span>
                 </div>
              </div>

              <div className="ml-14 mt-6 p-5 sm:p-6 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-4">
                <AlertTriangle size={24} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-900">Fair Use & Copyright Notice</h4>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Snippit does not host full copyrighted movies, albums, or books. 
                    Users are expected to share only highlights or snippets for commentary, 
                    review, and educational purposes in accordance with Fair Use guidelines.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-4 text-gray-900">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center shrink-0 text-indigo-700 font-bold text-lg">
                  3
                </div>
                 Prohibited Use
              </h2>
              <p className="text-base sm:text-lg text-gray-500 leading-relaxed ml-0 sm:ml-14">
                You may not use Snippit to distribute illegal material, hate speech, 
                or full-length pirated content. We reserve the right to remove any 
                content and suspend accounts that violate these guidelines without prior notice.
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 text-center sm:text-left text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="font-medium">Have questions about these terms?</p>
              <a href="mailto:legal@snippit.com" className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors">
                Contact Legal
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
