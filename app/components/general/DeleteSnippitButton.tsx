"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, AlertCircle } from "lucide-react";
import Button from "../Button";

import { deletePost } from "@/actions/posts/deletePost";
import { is } from "zod/v4/locales";

interface DeleteSnippetButtonProps {
  postId: string;
}

const DeleteSnippitButton: React.FC<DeleteSnippetButtonProps> = ({
  postId,
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      const result = await deletePost(postId);
      if (result.success) {
        toast.success("Post deleted successfully");
        router.refresh()
      } else {
        toast.error(result.message || "Failed to delete post");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
      >
        <Trash2 size={16} className="mr-2" />
        Delete
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Delete Post
                  </h3>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800 font-medium mb-1">
                  Are you sure you want to delete this post?
                </p>
                <p className="text-xs text-red-700">
                  • All associated data will be permanently removed
                  <br />
                  • This includes images, comments, and likes
                  <br />• This action is irreversible
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeletePost}
                  variant="primary"
                  className="flex-1"
                  icon={<Trash2 className="w-4 h-4" />}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Post"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteSnippitButton;
