"use client";

import React from "react";
import { Star, Target, Zap, Rocket, Users, Heart, BookOpen, Mic, Globe, Film, Bookmark } from "lucide-react";
import PublicNav from "@/app/components/general/PublicNav";
import PublicFooter from "@/app/components/general/PublicFooter";
import { Reveal, Stat } from "@/app/components/general/PublicComponents";

export default function AboutPage() {
  return (
    <main className="bg-[#FAFAFA] min-h-screen text-gray-900 overflow-x-hidden">
      <PublicNav transparent={false} />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-5 sm:px-8 overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-linear-to-bl from-indigo-100/80 via-violet-100/40 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-linear-to-tr from-sky-100/60 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative max-w-5xl mx-auto text-center space-y-8 z-10">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-semibold text-indigo-700 shadow-sm">
              <Star size={12} className="fill-indigo-400 text-indigo-400" />
              Our Story
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.06] text-gray-900 mt-6">
              Curating the web&apos;s <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-violet-500">
                best insights.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed mt-6">
              Every day, we consume incredible articles, books, podcasts, YouTube videos, and films. 
              But the most profound insights often vanish the moment we close the tab. Snippit was built to capture them.
            </p>
          </Reveal>
        </div>
      </section>

      {/* What we curate */}
      <section className="py-20 bg-white border-y border-gray-100 relative">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Whatever moves you.</h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto">
              Your personal library doesn&apos;t just have to be text. It&apos;s the multi-media compilation of your intellectual journey.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <Reveal delay={100} className="bg-sky-50 rounded-3xl p-6 border border-sky-100 text-center space-y-4 hover:shadow-lg transition-all hover:-translate-y-1">
              <Globe size={32} className="mx-auto text-sky-500" />
              <h3 className="font-bold text-gray-900">Websites</h3>
            </Reveal>
            <Reveal delay={200} className="bg-violet-50 rounded-3xl p-6 border border-violet-100 text-center space-y-4 hover:shadow-lg transition-all hover:-translate-y-1">
              <BookOpen size={32} className="mx-auto text-violet-500" />
              <h3 className="font-bold text-gray-900">Books</h3>
            </Reveal>
            <Reveal delay={300} className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 text-center space-y-4 hover:shadow-lg transition-all hover:-translate-y-1">
              <Mic size={32} className="mx-auto text-emerald-500" />
              <h3 className="font-bold text-gray-900">Podcasts</h3>
            </Reveal>
            <Reveal delay={400} className="bg-red-50 rounded-3xl p-6 border border-red-100 text-center space-y-4 hover:shadow-lg transition-all hover:-translate-y-1">
              <Film size={32} className="mx-auto text-red-500" />
              <h3 className="font-bold text-gray-900">YouTube</h3>
            </Reveal>
            <Reveal delay={500} className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100 text-center space-y-4 hover:shadow-lg transition-all hover:-translate-y-1 col-span-2 md:col-span-1">
              <Bookmark size={32} className="mx-auto text-indigo-500" />
              <h3 className="font-bold text-gray-900">Docs & More</h3>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Mission/Vision */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid md:grid-cols-2 gap-12 sm:gap-16">
          <Reveal delay={100} className="bg-white p-10 sm:p-12 rounded-[2.5rem] shadow-xl shadow-indigo-100/20 border border-gray-100">
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-200">
                <Target size={32} className="text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Our Mission</h2>
              <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
                To provide a beautiful, private, and social space for people to archive 
                the moments that shape their thinking. We believe in high-signal, low-noise ecosystems.
              </p>
            </div>
          </Reveal>
          <Reveal delay={200} className="bg-linear-to-br from-indigo-600 to-violet-700 p-10 sm:p-12 rounded-[2.5rem] shadow-xl text-white">
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <Rocket size={32} className="text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Our Vision</h2>
              <p className="text-indigo-100 leading-relaxed text-base sm:text-lg">
                A world where collective human insight is easily accessible, 
                organized, and shared. A library of highlights that makes everyone 
                a little smarter, one snippet at a time.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              <div className="pt-8 sm:pt-0">
                <Stat n="Infinite" label="Possibilities" />
              </div>
              <div className="pt-8 sm:pt-0">
                <Stat n="Seamless" label="Web interface" />
              </div>
              <div className="pt-8 sm:pt-0">
                <Stat n="Built for" label="The curious" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <Reveal className="text-center mb-16 space-y-4">
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Our DNA</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">What we stand for</h2>
          </Reveal>
          
          <div className="grid sm:grid-cols-3 gap-8">
            <Reveal delay={100}>
              <div className="bg-white p-10 rounded-4xl border border-gray-100 shadow-sm space-y-5 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
                  <Users size={24} className="text-indigo-500" />
                </div>
                <h3 className="text-2xl font-bold">Community</h3>
                <p className="text-gray-500 leading-relaxed text-sm sm:text-base">
                  Learning is better together. We build tools that foster connection 
                  through shared curiosity and taste.
                </p>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="bg-white p-10 rounded-4xl border border-gray-100 shadow-sm space-y-5 hover:-translate-y-2 transition-transform duration-300">
                 <div className="w-14 h-14 rounded-full bg-violet-50 flex items-center justify-center">
                  <Zap size={24} className="text-violet-500" />
                </div>
                <h3 className="text-2xl font-bold">Velocity</h3>
                <p className="text-gray-500 leading-relaxed text-sm sm:text-base">
                  Capturing a thought shouldn&apos;t be a chore. Snippit is designed to be 
                  fast and out of your way.
                </p>
              </div>
            </Reveal>
            <Reveal delay={300}>
              <div className="bg-white p-10 rounded-4xl border border-gray-100 shadow-sm space-y-5 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center">
                  <Heart size={24} className="text-pink-500" />
                </div>
                <h3 className="text-2xl font-bold">Quality</h3>
                <p className="text-gray-500 leading-relaxed text-sm sm:text-base">
                  We believe in high-density content. Quality over quantity, 
                  always. A sanctuary for deep thought.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <PublicFooter />

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
