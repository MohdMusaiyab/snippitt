"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Layers } from "lucide-react";

/* useInView */
export function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* Reveal */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* FeatureCard */
export function FeatureCard({
  icon: Icon,
  title,
  desc,
  color,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 space-y-4 hover:border-indigo-100 hover:shadow-sm transition-all group">
      <div
        className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shrink-0`}
      >
        <Icon size={20} className="text-white" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* Stat */
export function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="text-center space-y-1">
      <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 tracking-tight">
        {n}
      </p>
      <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}

/* ScreenFrame */
export function ScreenFrame({
  label,
  src,
  className = "",
}: {
  label: string;
  src?: any;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border border-gray-200 bg-white shadow-md overflow-hidden ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt={label}
          fill
          className="object-cover object-top"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-linear-to-br from-indigo-50 to-violet-50/60">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Layers size={18} className="text-indigo-400" />
          </div>
          <p className="text-[11px] font-semibold text-indigo-300 uppercase tracking-widest text-center px-4">
            {label}
          </p>
        </div>
      )}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5 pointer-events-none" />
    </div>
  );
}
