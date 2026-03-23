"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Share2,
  Tag,
  Mic,
  Globe,
  Film,
  Bookmark,
  Heart,
  Layers,
  Users,
  Lock,
  Zap,
  ChevronRight,
  Star,
} from "lucide-react";
import PublicNav from "./components/general/PublicNav";
import PublicFooter from "./components/general/PublicFooter";
import { Reveal, FeatureCard, Stat, ScreenFrame } from "./components/general/PublicComponents";

const PostImg = "/assets/screenshots/post.png";
const CollectionImg = "/assets/screenshots/collection.png";
const ProfileImg = "/assets/screenshots/profile.png";
const ExploreImg = "/assets/screenshots/explore.png";

/* Static data */
const FEATURES = [
  {
    icon: Bookmark,
    title: "Clip anything",
    color: "bg-indigo-500",
    desc: "Save moments from films, podcasts, YouTube, articles, books, and more. If it moved you, capture it.",
  },
  {
    icon: Tag,
    title: "Tag and filter",
    color: "bg-violet-500",
    desc: "Rich tagging, category filters, and full-text search so every snippet is findable in seconds.",
  },
  {
    icon: Users,
    title: "Follow creators",
    color: "bg-purple-500",
    desc: "Discover people with similar taste. Follow their reading lists, film journals, and podcast notes.",
  },
  {
    icon: Lock,
    title: "Private by default",
    color: "bg-blue-500",
    desc: "Your snippets are yours. Go public, followers-only, or keep it completely private — you decide.",
  },
  {
    icon: Share2,
    title: "Collections",
    color: "bg-sky-500",
    desc: "Group your snippets into beautiful, shareable collections. Build your own knowledge library.",
  },
  {
    icon: Zap,
    title: "Real-time feed",
    color: "bg-indigo-400",
    desc: "Get notified when someone likes, comments, or follows. Stay connected to your community.",
  },
];

const CONTENT_TYPES = [
  {
    label: "Film & Docs",
    icon: Film,
    color: "bg-purple-50 text-purple-700 border-purple-100",
  },
  {
    label: "Podcasts",
    icon: Mic,
    color: "bg-indigo-50 text-indigo-700 border-indigo-100",
  },
  {
    label: "Articles",
    icon: BookOpen,
    color: "bg-violet-50 text-violet-700 border-violet-100",
  },
  {
    label: "YouTube",
    icon: Globe,
    color: "bg-blue-50   text-blue-700   border-blue-100",
  },
  {
    label: "Books",
    icon: Bookmark,
    color: "bg-sky-50    text-sky-700    border-sky-100",
  },
  {
    label: "& More",
    icon: Zap,
    color: "bg-gray-100  text-gray-600   border-gray-200",
  },
];

const HOW_STEPS = [
  {
    n: "01",
    title: "Create a snippet",
    desc: "Add the title, pick the content type, drop in a description, tag it, and set your visibility. Done in under a minute.",
  },
  {
    n: "02",
    title: "Build collections",
    desc: "Group related snippets into curated collections — your podcast picks, reading list, film journal — and share with the world.",
  },
  {
    n: "03",
    title: "Discover and connect",
    desc: "Explore what others are saving. Follow creators whose taste you trust. Build a feed that actually makes you smarter.",
  },
];

/* Page */
export default function Page() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard");
  }, [status, router]);

  if (status === "loading") {
    return (
      <main className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="bg-[#FAFAFA] min-h-screen text-gray-900 overflow-x-hidden">
      <PublicNav />

      {/* Hero */}
      <section className="relative flex items-center justify-center min-h-[70vh] sm:min-h-screen pt-32 pb-16 overflow-hidden">
        {/* Blobs */}
        <div className="absolute top-0 right-0 w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] bg-gradient-to-bl from-indigo-50/90 via-violet-50/50 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 sm:w-80 h-64 sm:h-80 bg-blue-50/60 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left */}
            <div className="space-y-6 sm:space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-semibold text-indigo-700"
                style={{
                  opacity: 0,
                  animation: "fadeUp 0.6s ease 100ms forwards",
                }}
              >
                <Star size={11} className="fill-indigo-400 text-indigo-400" />
                Your personal knowledge archive
              </div>

              {/* Headline */}
              <h1
                className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.06] text-gray-900"
                style={{
                  opacity: 0,
                  animation: "fadeUp 0.7s ease 220ms forwards",
                }}
              >
                Save what moves you.
                <br />
                <span className="text-indigo-500">Share what shapes you.</span>
              </h1>

              {/* Body */}
              <p
                className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-md"
                style={{
                  opacity: 0,
                  animation: "fadeUp 0.7s ease 360ms forwards",
                }}
              >
                Clip moments from podcasts, films, articles, and videos, build
                your collection, and discover what others are learning.
              </p>

              {/* CTAs */}
              <div
                className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
                style={{
                  opacity: 0,
                  animation: "fadeUp 0.7s ease 480ms forwards",
                }}
              >
                <Link href="/auth/sign-up">
                  <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-indigo-700 text-white font-semibold rounded-2xl transition-all shadow-md shadow-indigo-200 text-sm">
                    Start curating for free <ArrowRight size={16} />
                  </button>
                </Link>
                <Link href="/explore/posts">
                  <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-2xl border border-gray-200 transition-all text-sm">
                    Browse the community <ChevronRight size={16} />
                  </button>
                </Link>
              </div>

              {/* Social proof */}
              <div
                className="flex items-center gap-3"
                style={{
                  opacity: 0,
                  animation: "fadeUp 0.7s ease 600ms forwards",
                }}
              >
                <div className="flex -space-x-2 flex-shrink-0">
                  {["A", "M", "P", "S", "L"].map((l, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600"
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 font-medium">
                  Joined by{" "}
                  <span className="text-gray-700 font-semibold">1,200+</span>{" "}
                  curious people
                </p>
              </div>
            </div>

            {/* Right — screenshot grid (desktop only) */}
            <div
              className="relative hidden lg:block"
              style={{
                opacity: 0,
                animation: "fadeUp 0.9s ease 400ms forwards",
              }}
            >
              <div className="grid grid-cols-5 grid-rows-6 gap-3 h-[520px]">
                <ScreenFrame
                  label="Post card"
                  src={PostImg}
                  className="col-span-3 row-span-4"
                />
                <ScreenFrame
                  label="Collection"
                  src={CollectionImg}
                  className="col-span-2 row-span-3"
                />
                <ScreenFrame
                  label="Explore feed"
                  src={ExploreImg}
                  className="col-span-2 row-span-3"
                />
                <ScreenFrame
                  label="Profile view"
                  src={ProfileImg}
                  className="col-span-3 row-span-2"
                />
              </div>

              {/* Floating — like */}
              <div className="absolute -left-8 top-1/3 -translate-y-1/2 bg-white rounded-2xl border border-gray-100 shadow-lg px-4 py-3 flex items-center gap-3 z-10">
                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Heart size={14} className="text-red-500 fill-red-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">
                    @lily liked your snippet
                  </p>
                  <p className="text-[10px] text-gray-400">just now</p>
                </div>
              </div>

              {/* Floating — saved */}
              <div className="absolute -bottom-4 left-8 bg-white rounded-2xl border border-gray-100 shadow-lg px-4 py-3 flex items-center gap-3 z-10">
                <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Layers size={14} className="text-violet-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">
                    12 snippets saved
                  </p>
                  <p className="text-[10px] text-gray-400">
                    in your collections
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 sm:py-12 border-y border-gray-100 bg-white">
        <div className="max-w-3xl mx-auto px-6 sm:px-8">
          <Reveal className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            <Stat n="10K+" label="Snippets saved" />
            <Stat n="6" label="Content types" />
            <Stat n="100%" label="Free to start" />
            <Stat n="∞" label="Collections" />
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-24 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-12 sm:mb-14">
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
              Everything you consume,
              <br />
              finally organised
            </h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto">
              One place for every insight from every format — no app switching,
              no scattered notes.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <FeatureCard
                  icon={f.icon}
                  title={f.title}
                  desc={f.desc}
                  color={f.color}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how"
        className="py-20 sm:py-24 px-5 sm:px-8 bg-white border-y border-gray-100"
      >
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-12 sm:mb-16">
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
              Three steps to a
              <br />
              smarter content life
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-8 sm:gap-10">
            {HOW_STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 150}>
                <div className="space-y-3 sm:space-y-4">
                  <span className="text-4xl sm:text-5xl font-extrabold text-indigo-100 leading-none block">
                    {s.n}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    {s.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Content types */}
      <section id="community" className="py-16 sm:py-20 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-10 sm:mb-12">
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">
              Content types
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
              Every format, one home
            </h2>
            <p className="text-sm sm:text-base text-gray-500 max-w-lg mx-auto">
              Whatever you consume, Snippit has a category for it.
            </p>
          </Reveal>

          <Reveal
            delay={100}
            className="flex flex-wrap justify-center gap-2.5 sm:gap-3"
          >
            {CONTENT_TYPES.map(({ label, icon: Icon, color }) => (
              <div
                key={label}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border text-sm font-semibold ${color} hover:scale-105 transition-transform cursor-default`}
              >
                <Icon size={14} />
                {label}
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 sm:pb-24 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="relative bg-primary rounded-3xl px-8 sm:px-10 py-14 sm:py-16 text-center overflow-hidden">
              <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />
              <div className="absolute top-8 left-8 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />

              <div className="relative z-10 space-y-5 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  Your knowledge,
                  <br />
                  beautifully organised
                </h2>
                <p className="text-indigo-200 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
                  Join thousands of curious people who are turning the content
                  they consume into a lasting personal library.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/auth/sign-up">
                    <button className="w-full sm:w-auto px-7 sm:px-8 py-3.5 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-indigo-50 transition-all text-sm shadow-lg">
                      Create your free account
                    </button>
                  </Link>
                  <Link href="/explore/posts">
                    <button className="w-full sm:w-auto px-7 sm:px-8 py-3.5 bg-white/10 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all text-sm border border-white/20">
                      Explore snippets
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <PublicFooter />

      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </main>
  );
}
