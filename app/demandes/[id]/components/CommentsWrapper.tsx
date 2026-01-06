// CommentsWrapper.tsx
"use client";

import React, { useState } from "react";
import { CommentsSection } from "./CommentsSection";
import { CommentsSectionPro } from "./CommentsSectionPro";
import { User } from "../../useCurrentUser";
import { MessageCircle, LayoutList } from "lucide-react";

type CommentsWrapperProps = {
  demandeId: string;
  currentUser: User | null;
};

export function CommentsWrapper({ demandeId, currentUser }: CommentsWrapperProps) {
  const [viewMode, setViewMode] = useState<"chat" | "pro">("pro");

  return (
    <div>
      {/* Toggle switch */}
      <div className="flex justify-end mb-3">
        <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
          <button
            onClick={() => setViewMode("pro")}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-all
                      ${viewMode === "pro" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            <LayoutList className="h-4 w-4" />
            Timeline
          </button>
          <button
            onClick={() => setViewMode("chat")}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-all
                      ${viewMode === "chat" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            <MessageCircle className="h-4 w-4" />
            Messages
          </button>
        </div>
      </div>

      {/* Composant selon le mode */}
      {viewMode === "pro" ? (
        <CommentsSectionPro demandeId={demandeId} currentUser={currentUser} />
      ) : (
        <CommentsSection demandeId={demandeId} currentUser={currentUser} />
      )}
    </div>
  );
}
