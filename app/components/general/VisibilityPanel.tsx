"use client";

import { Globe, Users, Lock, FileText, Eye as EyeIcon, Edit2 } from "lucide-react";
import { Visibility } from "@/app/generated/prisma/enums";

const VISIBILITY_OPTIONS = [
  {
    vis: "PUBLIC" as Visibility,
    label: "Public",
    icon: Globe,
    activeClass: "bg-green-50 text-green-700 border-green-100",
    inactiveClass: "text-gray-500 border-gray-200 hover:border-green-300 hover:text-green-600",
  },
  {
    vis: "FOLLOWERS" as Visibility,
    label: "Followers",
    icon: Users,
    activeClass: "bg-indigo-50 text-indigo-700 border-indigo-100",
    inactiveClass: "text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600",
  },
  {
    vis: "PRIVATE" as Visibility,
    label: "Private",
    icon: Lock,
    activeClass: "bg-gray-100 text-gray-700 border-gray-200",
    inactiveClass: "text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-600",
  },
];

interface VisibilityPanelProps {
  visibility: Visibility;
  isDraft?: boolean;
  isSubmitting: boolean;
  currVisibility: string;
  postIsDraft?: boolean;
  onChange: (visibility: Visibility, isDraft: boolean) => void;
}

const VisibilityBadge = ({ visibility }: { visibility: string }) => {
  const map: Record<
    string,
    { icon: React.ReactNode; label: string; cls: string }
  > = {
    PUBLIC: {
      icon: <Globe size={10} />,
      label: "Public",
      cls: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    PRIVATE: {
      icon: <Lock size={10} />,
      label: "Private",
      cls: "bg-gray-100 text-gray-500 border-gray-200",
    },
    FOLLOWERS: {
      icon: <Users size={10} />,
      label: "Followers",
      cls: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
  };
    const v = map[visibility] ?? map.PRIVATE;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${v.cls}`}
    >
      {v.icon}
      {v.label}
    </span>
  );
};

export const VisibilityPanel = ({
  visibility,
  isDraft,
  isSubmitting,
  currVisibility,
  postIsDraft,
  onChange,
}: VisibilityPanelProps) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-2">      
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <EyeIcon size={13} className="text-gray-400" />
        <span className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
          Visibility
        </span>
      </div>
      <div className="flex items-center gap-2">
          <VisibilityBadge visibility={currVisibility} />
          {postIsDraft && (
            <span className="bg-amber-50 text-amber-600 border-amber-100 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider">
              <Edit2 size={10} /> Draft
            </span>
          )}
      </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Segmented pill toggle */}
        <div className="grid grid-cols-3 gap-1.5">
          {VISIBILITY_OPTIONS.map(({ vis, label, icon: Icon, activeClass, inactiveClass }) => {
            const isActive = visibility === vis && !isDraft;
            return (
              <button
                key={vis}
                onClick={() => onChange(vis, false)}
                disabled={isSubmitting}
                className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border text-xs font-semibold transition-all active:scale-95 disabled:opacity-50
                  ${isActive ? activeClass : inactiveClass}`}
              >
                <Icon size={15} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Draft option — only shown when post was originally a draft */}
        {postIsDraft && (
          <button
            onClick={() => onChange(visibility, true)}
            disabled={isSubmitting}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50
              ${isDraft
                ? "bg-amber-50 border-amber-400 text-amber-700"
                : "bg-white border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50"
              }`}
          >
            <FileText size={14} />
            Save as Draft
            {isDraft && (
              <span className="ml-auto text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase tracking-wide">
                Active
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};