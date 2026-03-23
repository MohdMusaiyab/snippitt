"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const Logo = "/assets/Snippit-logo-v2.svg";

const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { name: "Features", href: "/#features" },
      { name: "Explore", href: "/explore/posts" },
      { name: "Collections", href: "/explore/collections" },
      { name: "Notifications", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { name: "About", href: "/about" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { name: "Privacy", href: "/privacy" },
      { name: "Terms", href: "/terms" },
      { name: "Cookies", href: "/cookies" },
    ],
  },
];

export default function PublicFooter() {
  const [year, setYear] = useState<number>(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2 sm:col-span-3 md:col-span-2 space-y-4">
            <Link href="/">
              <Image src={Logo} alt="Snippit" width={100} height={36} unoptimized />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              A social platform for curious minds. Save, curate, and share the
              content that shapes you.
            </p>
          </div>

          {FOOTER_LINKS.map(({ heading, links }) => (
            <div key={heading} className="space-y-4">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l.name}>
                    <Link
                      href={l.href}
                      className="text-sm text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-7 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <p>© {year} Snippit. All rights reserved.</p>
          <p>Made for curious minds everywhere</p>
        </div>
      </div>
    </footer>
  );
}
