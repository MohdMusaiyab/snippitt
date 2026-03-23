"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Eye, Database, Lock } from "lucide-react";
import PublicNav from "@/app/components/general/PublicNav";
import PublicFooter from "@/app/components/general/PublicFooter";
import { Reveal } from "@/app/components/general/PublicComponents";

export default function PrivacyPage() {
  const [date, setDate] = useState<string>("March 23, 2026");

  useEffect(() => {
    setDate(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
  }, []);

  return (
    <main className="bg-[#FAFAFA] min-h-screen text-gray-900 overflow-x-hidden">
      <PublicNav transparent={false} />

      <div className="absolute top-0 inset-x-0 h-[600px] bg-linear-to-b from-emerald-50/60 to-transparent pointer-events-none -z-10" />

      <section className="relative pt-32 pb-24 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <Reveal>
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-emerald-100 rounded-full text-xs font-bold text-emerald-700 shadow-sm">
                <ShieldCheck size={14} className="text-emerald-500" />
                Privacy
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.06] text-gray-900">
                Privacy Policy
              </h1>
              <p className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-xl mx-auto">
                How we protect your insights and data. (Verified: {date})
              </p>
            </div>
          </Reveal>

          <Reveal delay={100} className="prose max-w-none bg-white p-8 sm:p-14 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-emerald-100/10 space-y-12">
            
            <div className="space-y-4 sm:space-y-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-4 text-gray-900">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <Eye size={24} className="text-emerald-500" />
                </div>
                1. Data Collection
              </h2>
              <div className="ml-0 sm:ml-16 space-y-4">
                <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
                  We believe in zero-friction knowledge sharing, but we also believe your data is yours. 
                  We collect only what is strictly necessary:
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  <div className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50">
                    <h4 className="font-bold text-gray-900 mb-2">Account Info</h4>
                    <p className="text-sm text-gray-600">Name, email, and avatar provided via OAuth providers (like Google).</p>
                  </div>
                  <div className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50">
                    <h4 className="font-bold text-gray-900 mb-2">User Content</h4>
                    <p className="text-sm text-gray-600">The snippets, text, tags, and media URLs you actively save.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-4 text-gray-900">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <Database size={24} className="text-emerald-500" />
                </div>
                2. Data Storage & Security
              </h2>
              <p className="text-base sm:text-lg text-gray-500 leading-relaxed ml-0 sm:ml-16">
                Your content is stored securely on modern cloud infrastructure. Images, custom media, 
                and references are handled via AWS S3 using standard encryption protocols.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-4 text-gray-900">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <Lock size={24} className="text-emerald-500" />
                </div>
                3. Your Control
              </h2>
              <p className="text-base sm:text-lg text-gray-500 leading-relaxed ml-0 sm:ml-16">
                You have full agency over your library. Every snippet can be set to Public or Private. 
                You can export your data, edit past clips, or completely delete your account at any time, 
                erasing all associations.
              </p>
            </div>

          </Reveal>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
