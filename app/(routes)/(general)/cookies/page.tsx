"use client";

import React, { useState, useEffect } from "react";
import { Cookie, Info, ShieldAlert, Fingerprint } from "lucide-react";
import PublicNav from "@/app/components/general/PublicNav";
import PublicFooter from "@/app/components/general/PublicFooter";
import { Reveal } from "@/app/components/general/PublicComponents";

export default function CookiesPage() {
  const [date, setDate] = useState<string>("March 23, 2026");

  useEffect(() => {
    setDate(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
  }, []);

  return (
    <main className="bg-[#FAFAFA] min-h-screen text-gray-900 overflow-x-hidden">
      <PublicNav transparent={false} />

      <div className="absolute top-0 inset-x-0 h-[600px] bg-linear-to-b from-amber-50/60 to-transparent pointer-events-none -z-10" />

      <section className="relative pt-32 pb-24 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <Reveal>
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-amber-100 rounded-full text-xs font-bold text-amber-700 shadow-sm">
                <Cookie size={14} className="text-amber-500" />
                Cookies
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.06] text-gray-900">
                Cookie Policy
              </h1>
              <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
                We respect your browsing habits. Here&apos;s exactly what we store and why.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100} className="prose max-w-none bg-white p-8 sm:p-14 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-amber-100/10 space-y-12">
            
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-4 text-gray-900">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Info size={24} className="text-amber-500" />
                </div>
                Essential Cookies Only
              </h2>
              <div className="ml-0 sm:ml-16 space-y-4">
                <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
                  Snippit only uses essential cookies strictly necessary for the application to function. 
                  Without these, you couldn&apos;t log in or securely save your clips.
                </p>
                
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mt-6">
                  <div className="flex items-start gap-4">
                    <Fingerprint className="text-gray-400 mt-1 shrink-0" />
                    <div>
                      <h4 className="font-bold text-gray-900">Session & Auth Cookies</h4>
                      <p className="text-gray-600 text-sm mt-1">
                        Managed by NextAuth.js, these are used to keep you logged in securely 
                        across page reloads. They expire automatically.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-4 text-gray-900">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                  <ShieldAlert size={24} className="text-amber-500" />
                </div>
                No Tracking. No Ads.
              </h2>
              <p className="text-base sm:text-lg text-gray-500 leading-relaxed ml-0 sm:ml-16">
                We believe your personal curation process is private. 
                <strong> We do not use third-party tracking cookies, pixel tags, or invasive advertising networks. </strong> 
                Your data is not sold to brokers. There is no cookie banner on Snippit because we have nothing unnecessary to ask you to consent to.
              </p>
            </div>

          </Reveal>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
