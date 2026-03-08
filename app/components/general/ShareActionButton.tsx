import React, { useState, useCallback } from "react";
import { Check, Share } from "lucide-react";
import { handleShare } from "@/lib/share";

interface ShareActionButtonProps {
  postId: string;
  postTitle: string;
  postDescription: string;
}
const ShareActionButton: React.FC<ShareActionButtonProps> = ({
  postId,
  postTitle,
  postDescription,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const onShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/posts/${postId}`;

    // Using the utility we discussed
    await handleShare(postTitle, postDescription, url);
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <button
      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition"
      onClick={onShare}
    >
      {isCopied ? (
        <>
          <Check size={16} className="mr-2 text-green-500" /> Copied!
        </>
      ) : (
        <>
          <Share size={16} className="mr-2" /> Share
        </>
      )}
    </button>
  );
};

export default ShareActionButton;
