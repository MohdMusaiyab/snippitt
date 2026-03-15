"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  FolderPlus,
  Check,
  Loader2,
  Folder,
  Trash2,
  X,
} from "lucide-react";
import {
  getUserCollectionNames,
  addNewPostToCollection,
  removePostFromCollection,
  createCollection,
} from "@/actions/collection";
import { toast } from "sonner";
import Button from "../Button";

interface Collection {
  id: string;
  name: string;
  hasPost?: boolean;
}

interface AddCollectionButtonProps {
  postId: string;
  userId: string;
}

const AddCollectionButton: React.FC<AddCollectionButtonProps> = ({
  postId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const result = await getUserCollectionNames(postId);
    if (result.success && result.data) {
      setCollections(result.data);
    } else {
      toast.error("Could not load collections");
    }
    setIsLoading(false);
  }, [postId]);

  useEffect(() => {
    if (isOpen) loadData();
  }, [isOpen, loadData]);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  const handleTogglePost = async (
    collectionId: string,
    currentlyHasPost: boolean,
  ) => {
    const collectionName =
      collections.find((c) => c.id === collectionId)?.name ?? "collection";

    try {
      if (currentlyHasPost) {
        const res = await removePostFromCollection(collectionId, postId);
        if (!res.success) throw new Error(res.error?.message);

        // Optimistic UI update
        setCollections((prev) =>
          prev.map((c) =>
            c.id === collectionId ? { ...c, hasPost: false } : c,
          ),
        );
        toast.success(`Removed from "${collectionName}"`, {
          description: "The post has been removed from this collection.",
        });
      } else {
        const res = await addNewPostToCollection(collectionId, postId);
        if (!res.success) throw new Error(res.error?.message);

        // Optimistic UI update
        setCollections((prev) =>
          prev.map((c) =>
            c.id === collectionId ? { ...c, hasPost: true } : c,
          ),
        );
        toast.success(`Added to "${collectionName}"`, {
          description: "You can view it in your collections.",
        });
      }

      // Small delay so user sees the checkmark update before modal closes
      setTimeout(() => setIsOpen(false), 600);
    } catch (error: any) {
      toast.error(error.message || "Operation failed");
    }
  };

  const handleCreateNewCollection = async () => {
    if (!newCollectionName.trim()) return;
    setIsCreating(true);
    try {
      const result = await createCollection({ name: newCollectionName });
      if (result.success) {
        setNewCollectionName("");
        toast.success("Collection created!");
        await loadData();
      } else {
        toast.error(result.error?.message || "Error creating collection");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsCreating(false);
    }
  };

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-4">
          <h3 className="text-base font-extrabold text-gray-900">
            Save to Collection
          </h3>

          {/* Create new */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New collection name…"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateNewCollection();
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
            />
            <Button
              size="sm"
              variant="primary"
              onClick={handleCreateNewCollection}
              disabled={isCreating || !newCollectionName.trim()}
              className="rounded-xl"
            >
              {isCreating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
            </Button>
          </div>

          {/* Collections list */}
          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-0.5">
            {isLoading ? (
              <div className="py-8 flex justify-center">
                <Loader2 size={18} className="animate-spin text-gray-300" />
              </div>
            ) : collections.length > 0 ? (
              collections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => handleTogglePost(col.id, !!col.hasPost)}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl border transition-all text-left group
      ${
        col.hasPost
          ? "border-indigo-200 bg-indigo-50/50 hover:border-red-200 hover:bg-red-50/50"
          : "border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50"
      }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Folder
                      size={15}
                      className={`shrink-0 transition-colors
          ${
            col.hasPost
              ? "text-indigo-500 group-hover:text-red-400"
              : "text-gray-400 group-hover:text-indigo-500"
          }`}
                    />
                    <span
                      className={`text-sm font-medium transition-colors
          ${
            col.hasPost
              ? "text-indigo-700 group-hover:text-red-600"
              : "text-gray-700 group-hover:text-indigo-700"
          }`}
                    >
                      {col.name}
                    </span>
                  </div>

                  {/* Right side indicator */}
                  <div
                    className={`shrink-0 transition-all ${col.hasPost ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                  >
                    {col.hasPost ? (
                      // Shows check at rest, X on hover
                      <div className="relative w-5 h-5">
                        <Check
                          size={14}
                          className="text-indigo-500 group-hover:opacity-0 transition-opacity absolute inset-0 m-auto"
                        />
                        <X
                          size={14}
                          className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 m-auto"
                        />
                      </div>
                    ) : (
                      <Plus size={14} className="text-indigo-400" />
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="py-6 text-center space-y-1">
                <p className="text-sm font-semibold text-gray-400">
                  No collections yet
                </p>
                <p className="text-xs text-gray-300">
                  Create one above to get started
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition"
      >
        <FolderPlus size={16} className="mr-2" />
        Add to Collection
      </button>

      {/* Portal renders outside all card stacking contexts */}
      {mounted && isOpen && createPortal(modal, document.body)}
    </>
  );
};

export default AddCollectionButton;
