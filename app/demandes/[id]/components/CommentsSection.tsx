/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Send, MessageCircle, Clock, Trash2, Loader2 } from "lucide-react";
import { useComments, useAddComment, useDeleteComment, CommentDTO, ApiError } from "../../hooks";
import { User } from "../../useCurrentUser";

type CommentsSectionProps = {
  demandeId: string;
  currentUser: User | null;
};

// Fonction pour formater la date de manière lisible
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Couleurs pour les avatars
const avatarColors = [
  { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", bubble: "bg-blue-50" },
  { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", bubble: "bg-emerald-50" },
  { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", bubble: "bg-amber-50" },
  { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200", bubble: "bg-rose-50" },
  { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200", bubble: "bg-violet-50" },
  { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200", bubble: "bg-cyan-50" },
  { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200", bubble: "bg-orange-50" },
  { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200", bubble: "bg-indigo-50" },
];

// Fonction pour obtenir une couleur cohérente basée sur l'userId
const getUserColorIndex = (userId: string): number => {
  let hash = 0;
  for (let i = 0; i < userId?.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) % avatarColors.length;
};

// Fonction pour obtenir les initiales d'un utilisateur
const getUserInitials = (firstName?: string, lastName?: string, email?: string): string => {
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return "??";
};

// Fonction pour obtenir le nom affiché
const getUserDisplayName = (comment: CommentDTO): string => {
  const { user } = comment;
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.email || `Utilisateur ${user.id.substring(0, 8)}...`;
};

export function CommentsSection({ demandeId, currentUser }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("");

  // Hooks API
  const { data: comments = [], isLoading, isError } = useComments(demandeId);
  const addCommentMutation = useAddComment();
  const deleteCommentMutation = useDeleteComment();

  const handleSubmitComment = () => {
    if (!newComment.trim()) {
      toast.error("Le commentaire ne peut pas être vide");
      return;
    }

    addCommentMutation.mutate(
      { demandeId, content: newComment.trim() },
      {
        onSuccess: () => {
          setNewComment("");
          toast.success("Commentaire ajouté !");
        },
        onError: (error: any) => {
          console.error("Erreur lors de l'ajout du commentaire:", error);
          let userMessage = "Erreur lors de l'ajout du commentaire";
          if (error instanceof ApiError) {
            const statusPart = error.status ? ` (HTTP ${error.status})` : "";
            userMessage = `Erreur${statusPart}`;
          }
          toast.error(userMessage);
        },
      }
    );
  };

  const handleDeleteComment = (commentId: string) => {
    deleteCommentMutation.mutate(
      { demandeId, commentId },
      {
        onSuccess: () => {
          toast.success("Commentaire supprimé");
        },
        onError: () => {
          toast.error("Erreur lors de la suppression");
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  // Trier les commentaires du plus récent au plus ancien
  const sortedComments = [...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const currentUserColorIndex = currentUser ? getUserColorIndex(currentUser.userId) : 0;
  const currentUserColors = avatarColors[currentUserColorIndex];

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-100 rounded-lg">
          <MessageCircle className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Commentaires</h3>
          <p className="text-sm text-gray-500">
            {isLoading
              ? "Chargement..."
              : comments.length === 0
              ? "Aucun commentaire pour le moment"
              : `${comments.length} commentaire${comments.length > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Zone de saisie du nouveau commentaire */}
      <div className="mb-6">
        <div className="flex gap-3">
          {/* Avatar de l'utilisateur courant */}
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center 
                       font-semibold text-sm ${currentUserColors.bg} ${currentUserColors.text}`}
          >
            {currentUser ? getUserInitials(undefined, undefined, currentUser.email) : "?"}
          </div>

          {/* Zone de texte */}
          <div className="flex-1">
            <div className="relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ajouter un commentaire..."
                className="w-full min-h-[80px] p-3 pr-12 border border-gray-200 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         resize-none transition-all duration-200
                         placeholder:text-gray-400"
                disabled={addCommentMutation.isPending}
              />
              {/* Bouton d'envoi */}
              <Button
                type="button"
                size="sm"
                onClick={handleSubmitComment}
                disabled={addCommentMutation.isPending || !newComment.trim()}
                className="absolute bottom-3 right-3 h-8 w-8 p-0 rounded-full
                         bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300
                         transition-colors duration-200"
              >
                {addCommentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-400">Appuyez sur Ctrl+Entrée pour envoyer</p>
          </div>
        </div>
      </div>

      {/* État de chargement */}
      {isLoading && (
        <div className="flex justify-center py-8 border-t border-gray-100">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {/* État d'erreur */}
      {isError && (
        <div className="text-center py-8 border-t border-gray-100">
          <p className="text-red-500 text-sm">Erreur lors du chargement des commentaires</p>
        </div>
      )}

      {/* Liste des commentaires */}
      {!isLoading && !isError && sortedComments.length > 0 && (
        <div className="space-y-4 border-t border-gray-100 pt-6">
          {sortedComments.map((comment) => {
            const colorIndex = getUserColorIndex(comment.user.id);
            const colors = avatarColors[colorIndex];
            const isCurrentUser = currentUser?.userId === comment.user.id;

            return (
              <div key={comment.id + comment.createdAt} className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center 
                            font-semibold text-sm ${colors.bg} ${colors.text}`}
                >
                  {getUserInitials(comment.user.firstName, comment.user.lastName, comment.user.email)}
                </div>

                {/* Contenu du commentaire */}
                <div className={`flex-1 max-w-[80%] ${isCurrentUser ? "text-right" : ""}`}>
                  {/* Header du commentaire */}
                  <div className={`flex items-center gap-2 mb-1 ${isCurrentUser ? "justify-end" : ""}`}>
                    <span className={`font-medium text-sm ${colors.text}`}>{isCurrentUser ? "Vous" : getUserDisplayName(comment)}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{comment.user.role}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {formatDate(comment.createdAt)}
                    </span>
                    {/* Bouton supprimer (seulement pour ses propres commentaires) */}
                    {isCurrentUser && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deleteCommentMutation.isPending}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Bulle de message */}
                  <div
                    className={`inline-block p-3 rounded-2xl ${
                      isCurrentUser ? "bg-blue-600 text-white rounded-tr-sm" : `${colors.bubble} ${colors.text} rounded-tl-sm border ${colors.border}`
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{comment.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* État vide */}
      {!isLoading && !isError && sortedComments.length === 0 && (
        <div className="text-center py-8 border-t border-gray-100">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
            <MessageCircle className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">Soyez le premier à commenter cette demande</p>
        </div>
      )}
    </div>
  );
}
