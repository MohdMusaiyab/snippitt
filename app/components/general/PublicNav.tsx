"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight } from "lucide-react";

const Logo = "/assets/Snippit-logo-v2.svg";

interface PublicNavProps {
  transparent?: boolean;
}

export default function PublicNav({ transparent = true }: PublicNavProps) {
  const { status } = useSession();
  const [scrolled, setScrolled] = useState(!transparent);

  useEffect(() => {
    if (!transparent) return;
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn, { passive: true });
    fn(); // initial check
    return () => window.removeEventListener("scroll", fn);
  }, [transparent]);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
          : "bg-transparent backdrop-blur-sm"
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3 sm:py-4 flex items-center justify-between gap-4">
        <Link href="/">
          <Image src={Logo} alt="Snippit" width={110} height={40} priority unoptimized />
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
          <Link href="/#features" className="hover:text-gray-900 transition-colors">
            Features
          </Link>
          <Link href="/#how" className="hover:text-gray-900 transition-colors">
            How it works
          </Link>
          <Link href="/#community" className="hover:text-gray-900 transition-colors">
            Community
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {status === "authenticated" ? (
            <Link href="/dashboard">
              <button className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-primary hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-indigo-200 whitespace-nowrap">
                Dashboard <ArrowRight size={14} />
              </button>
            </Link>
          ) : (
            <>
              <Link
                href="/auth/sign-in"
                className="hidden sm:block text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
              >
                Sign in
              </Link>
              <Link href="/auth/sign-up">
                <button className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-primary hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-indigo-200 whitespace-nowrap">
                  Get started <ArrowRight size={14} />
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
