"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grid3X3,
  FolderHeart,
  Calendar,
  Camera,
  Loader2,
  Check,
  X as CloseIcon,
  MapPin,
  Users,
  UserCheck,
  BarChart2,
} from "lucide-react";
import Snippet from "@/app/components/general/Snippitt";
import { Collections } from "@/app/components/collection/Collection";
import FollowButton from "./FollowButton";
import CategoryChart from "./CategoryChart";
import { updateUserProfile } from "@/actions/user/updateUserProfile";
import { toast } from "sonner";
import { generatePresignedUrlAction } from "@/actions/upload";
import Image from "next/image";

interface ProfileClientProps {
  profileData: any;
  categoryStats: any;
  initialPosts: any[];
  initialCollections: any[];
  currentUserId: string | null;
}

const ProfileClient = ({
  profileData,
  categoryStats,
  initialPosts,
  initialCollections,
  currentUserId,
}: ProfileClientProps) => {
  const [activeTab, setActiveTab] = useState<"posts" | "collections" | "stats">(
    "posts",
  );
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const toggleMenu = (id: string) => setMenuOpen(menuOpen === id ? null : id);

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editData, setEditData] = useState({
    username: profileData.username,
    bio: profileData.bio || "",
    avatar: profileData.avatar || "",
  });

  const [tempAvatarFile, setTempAvatarFile] = useState<File | null>(null);
  const [tempAvatarPreview, setTempAvatarPreview] = useState<string | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024)
      return toast.error("Avatar must be under 2MB");
    const localUrl = URL.createObjectURL(file);
    setTempAvatarPreview(localUrl);
    setTempAvatarFile(file);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      username: profileData.username,
      bio: profileData.bio || "",
      avatar: profileData.avatar || "",
    });
    if (tempAvatarPreview) URL.revokeObjectURL(tempAvatarPreview);
    setTempAvatarFile(null);
    setTempAvatarPreview(null);
  };

  const handleSaveProfile = async () => {
    setIsSubmitting(true);
    let avatarUrl = editData.avatar;
    try {
      if (tempAvatarFile) {
        const toastId = toast.loading("Uploading avatar...");
        const result = await generatePresignedUrlAction({
          fileName: tempAvatarFile.name,
          fileType: tempAvatarFile.type,
        });
        if (!result.success || !result.data) {
          toast.error(result.message || "Failed to get upload URL", {
            id: toastId,
          });
          throw new Error(result.message);
        }
        const uploadRes = await fetch(result.data.uploadUrl, {
          method: "PUT",
          body: tempAvatarFile,
          headers: { "Content-Type": tempAvatarFile.type },
        });
        if (!uploadRes.ok) throw new Error("Upload failed");
        avatarUrl = result.data.fileUrl;
        toast.success("Avatar uploaded!", { id: toastId });
        if (tempAvatarPreview) URL.revokeObjectURL(tempAvatarPreview);
        setTempAvatarFile(null);
        setTempAvatarPreview(null);
      }
      const res = await updateUserProfile({
        username: editData.username,
        bio: editData.bio,
        avatar: avatarUrl,
      });
      if (res.success) {
        toast.success(res.message);
        setIsEditing(false);
        window.location.reload();
      } else toast.error(res.message);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    return () => {
      if (tempAvatarPreview) URL.revokeObjectURL(tempAvatarPreview);
    };
  }, [tempAvatarPreview]);

  const avatarSrc = tempAvatarPreview || editData.avatar;
  const joinDate = new Date(profileData.createdAt).toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" },
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Cover banner ──────────────────────────────────────────────── */}
      <div className="relative h-44 sm:h-56 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 overflow-hidden -m-8">
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* ── Profile header card ───────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative -mt-16 sm:-mt-20 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 sm:px-8 pt-6 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              {/* Avatar */}
              <div className="relative group -mt-16 sm:-mt-20 flex-shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-indigo-50 ring-2 ring-indigo-100">
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt={profileData.username}
                      fill
                      className="object-cover"
                      priority
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-indigo-400">
                      {editData.username[0]?.toUpperCase()}
                    </div>
                  )}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                    >
                      <Camera size={20} />
                      <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">
                        Change
                      </span>
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarSelect}
                  className="hidden"
                  accept="image/*"
                />
              </div>

              {/* Name + actions */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0">
                    {isEditing ? (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Username
                        </label>
                        <input
                          value={editData.username}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              username: e.target.value,
                            })
                          }
                          className="text-xl font-extrabold text-gray-900 border-b-2 border-indigo-500 outline-none bg-transparent pb-1 w-full max-w-xs"
                        />
                      </div>
                    ) : (
                      <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight truncate">
                        @{profileData.username}
                      </h1>
                    )}

                    {!isEditing && (
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar size={11} />
                          Joined {joinDate}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {profileData.isOwner ? (
                      isEditing ? (
                        <>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isSubmitting}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                          >
                            <CloseIcon size={16} />
                          </button>
                          <button
                            onClick={handleSaveProfile}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-indigo-200 transition-all disabled:opacity-50"
                          >
                            {isSubmitting ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Check size={14} />
                            )}
                            {isSubmitting ? "Saving…" : "Save"}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                        >
                          Edit Profile
                        </button>
                      )
                    ) : (
                      <FollowButton
                        targetUserId={profileData.id}
                        initialIsFollowing={profileData.isFollowing}
                        initialFollowerCount={profileData._count.followers}
                        initialFollowingCount={profileData._count.following}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-4">
              {isEditing ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Bio
                  </label>
                  <textarea
                    value={editData.bio}
                    onChange={(e) =>
                      setEditData({ ...editData, bio: e.target.value })
                    }
                    placeholder="Tell the world about yourself…"
                    rows={3}
                    className="w-full max-w-xl px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white outline-none transition-all text-sm text-gray-700 resize-none"
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
                  {profileData.bio || (
                    <span className="text-gray-300 italic">
                      No bio added yet.
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Stats strip */}
            {!isEditing && (
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-6 flex-wrap">
                {[
                  {
                    icon: <Grid3X3 size={13} />,
                    label: "Posts",
                    value: profileData._count.posts,
                  },
                  {
                    icon: <FolderHeart size={13} />,
                    label: "Collections",
                    value: profileData._count.collections,
                  },
                  {
                    icon: <Users size={13} />,
                    label: "Followers",
                    value: profileData._count.followers,
                  },
                  {
                    icon: <UserCheck size={13} />,
                    label: "Following",
                    value: profileData._count.following,
                  },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className="text-gray-400">{icon}</span>
                    <span className="text-sm font-extrabold text-gray-900 tabular-nums">
                      {value}
                    </span>
                    <span className="text-xs text-gray-400">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Main grid ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-6 pb-16">
          {/* Main content */}
          <main className="w-full space-y-4">
            {/* Tab bar */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-1.5 flex gap-1">
              {(
                [
                  {
                    key: "posts",
                    label: `Posts (${initialPosts.length})`,
                    icon: <Grid3X3 size={14} />,
                  },
                  {
                    key: "collections",
                    label: `Collections (${initialCollections.length})`,
                    icon: <FolderHeart size={14} />,
                  },
                ] as const
              ).map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                    ${activeTab === key ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
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
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {initialPosts.length > 0 ? (
                    initialPosts.map((post) => (
                      <Snippet
                        key={post.id}
                        post={post}
                        currentUserId={currentUserId as any}
                        showActions
                        menuOpen={menuOpen}
                        toggleMenu={toggleMenu}
                      />
                    ))
                  ) : (
                    <EmptyState
                      icon={<Grid3X3 size={22} />}
                      message="No posts published yet."
                    />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="collections"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                >
                  {initialCollections.length > 0 ? (
                    <Collections
                      collections={initialCollections}
                      isOwner={profileData.isOwner}
                    />
                  ) : (
                    <EmptyState
                      icon={<FolderHeart size={22} />}
                      message="No collections yet."
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({
  icon,
  message,
}: {
  icon: React.ReactNode;
  message: string;
}) => (
  <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center space-y-3">
    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-300">
      {icon}
    </div>
    <p className="text-sm font-medium text-gray-400">{message}</p>
  </div>
);

export default ProfileClient;
