"use client";

import React, { useState } from "react";
import { Grid3X3, FolderHeart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProfilePostsTab from "./ProfilePostsTab";
import ProfileCollectionsTab from "./ProfileCollectionsTab";

interface ProfileTabsProps {
  initialPosts: any[];
  totalPosts: number;
  initialCollections: any[];
  totalCollections: number;
  profileId: string;
  currentUserId: string | null;
  isOwner: boolean;
}

export default function ProfileTabs({
  initialPosts,
  totalPosts,
  initialCollections,
  totalCollections,
  profileId,
  currentUserId,
  isOwner,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "collections">("posts");

  return (
    <div className="flex items-center gap-6 pb-16">
      <main className="w-full space-y-4">
        {/* Tab bar */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-1.5 flex gap-1">
          {(
            [
              {
                key: "posts",
                label: `Posts (${totalPosts})`,
                icon: <Grid3X3 size={14} />,
              },
              {
                key: "collections",
                label: `Collections (${totalCollections})`,
                icon: <FolderHeart size={14} />,
              },
            ] as const
          ).map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${
                  activeTab === key
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === "posts" ? (
            <motion.div
              key="posts"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              <ProfilePostsTab
                initialPosts={initialPosts}
                totalPosts={totalPosts}
                profileId={profileId}
                currentUserId={currentUserId}
              />
            </motion.div>
          ) : (
            <motion.div
              key="collections"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              <ProfileCollectionsTab
                initialCollections={initialCollections}
                totalCollections={totalCollections}
                profileId={profileId}
                isOwner={isOwner}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
