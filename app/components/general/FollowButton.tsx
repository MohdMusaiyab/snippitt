"use client";

import React, { useState } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { toggleFollow } from "@/actions/follow";
import { toast } from "sonner";
import Button from "@/app/components/Button";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  initialFollowerCount?: number;
  initialFollowingCount?: number;
  onOptimisticUpdate?: (isFollowing: boolean) => void;
  onRevert?: () => void;
}

const FollowButton = ({
  targetUserId,
  initialIsFollowing,
  onOptimisticUpdate,
  onRevert,
}: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async () => {
    if (isPending) return;

    // 1. Optimistic Update (Instant feedback)
    const previousState = isFollowing;
    const newState = !previousState;
    setIsFollowing(newState);
    if (onOptimisticUpdate) onOptimisticUpdate(newState);
    setIsPending(true);

    try {
      const result = await toggleFollow(targetUserId);

      if (!result.success) {
        // 2. Rollback on Server Failure
        setIsFollowing(previousState);
        if (onRevert) onRevert();
        toast.error(result.message || "Failed to update follow status");
      }
    } catch {
      // 3. Rollback on Network Error
      setIsFollowing(previousState);
      if (onRevert) onRevert();
      toast.error("Network error. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      {/* Action Button */}
      <Button
        variant={isFollowing ? "outline" : "primary"}
        onClick={handleToggle}
        disabled={isPending}
        className={`min-w-[130px] shadow-sm ${isFollowing ? "bg-white border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all" : ""}`}
        icon={isPending ? <Loader2 className="animate-spin" size={18} /> : isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
      >
        {isFollowing ? "Following" : "Follow"}
      </Button>
    </div>
  );
};

export default FollowButton;