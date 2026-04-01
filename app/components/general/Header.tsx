"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, User } from "lucide-react";
import NotificationBell from "./NotificationBell";

const Logo = "/assets/Snippit-logo-v2.svg";

interface HeaderProps {
  userId: string | null;
}

export const Header = ({ userId }: HeaderProps) => {
  return (
    <header className="sticky top-0 h-16 flex-shrink-0 px-4 sm:px-6 flex items-center justify-between bg-white border-b border-gray-200 z-30">
      {/* Mobile Logo */}
      <div className="md:hidden pl-4">
        <Link href="/dashboard">
          <Image
            src={Logo}
            alt="Snippit Logo"
            width={100}
            height={32}
            className="cursor-pointer"
          />
        </Link>
      </div>

      {/* Spacer for Desktop (keeps icons right-aligned) */}
      <div className="hidden md:block" />

      {/* Right Side Icons */}
      <div className="flex items-center space-x-3">
        <NotificationBell />

        <Link
          href={`/profile/${userId}`}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Profile"
        >
          <User className="w-6 h-6 text-gray-700" />
        </Link>
      </div>
    </header>
  );
};
