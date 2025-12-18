// CommentsSectionPro.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Send, MessageSquareText, Trash2, Loader2, User as UserIcon, MoreHorizontal } from "lucide-react";
import { useComments, useAddComment, useDeleteComment, CommentDTO, ApiError } from "../../hooks";
import { User } from "../../useCurrentUser";

type CommentsSectionProProps = {
  demandeId: string;
  currentUser: User | null;
};

// Fonction pour formater la date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Fonction pour formater la date relative
const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "à l'instant";
  if (diffMins < 60) return `il y a ${diffMins} min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  if (diffDays < 7) return `il y a ${diffDays}j`;
  return formatDate(dateString);
};

// Couleurs par rôle
const roleColors: Record<string, { bg: string; text: string }> = {
  DEMANDEUR: { bg: "bg-blue-100", text: "text-blue-700" },
  VALIDEUR: { bg: "bg-purple-100", text: "text-purple-700" },
  COMPTABLE: { bg: "bg-green-100", text: "text-green-700" },
  ADMIN: { bg: "bg-red-100", text: "text-red-700" },
};

const getRoleStyle = (role: string) => roleColors[role] || { bg: "bg-gray-100", text: "text-gray-700" };

// Fonction pour obtenir les initiales
const getUserInitials = (firstName?: string, lastName?: string, email?: string): string => {
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return "??";
};

// Fonction pour obtenir le nom complet
const getUserFullName = (comment: CommentDTO): string => {
  const { user } = comment;
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.email || "Utilisateur inconnu";
};

// Composant Menu d'actions isolé
type CommentMenuProps = {
  commentId: string;
  onDelete: () => void;
  isDeleting: boolean;
};

function CommentMenu({ commentId, onDelete, isDeleting }: CommentMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  console.log(commentId);

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        aria-label="Actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          {/* Overlay invisible pour capturer les clics */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Menu déroulant */}
          <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
            <button
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              disabled={isDeleting}
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 
                       flex items-center gap-2 disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Supprimer
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function CommentsSectionPro({ demandeId, currentUser }: CommentsSectionProProps) {
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
          toast.success("Commentaire ajouté");
        },
        onError: (error: unknown) => {
          console.error("Erreur:", error);
          const message = error instanceof ApiError ? `Erreur (HTTP ${error.status})` : "Erreur lors de l'ajout";
          toast.error(message);
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
        onError: () => toast.error("Erreur lors de la suppression"),
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  // Trier du plus ancien au plus récent (fil chronologique)
  const sortedComments = [...comments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-8">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Activité & Commentaires</h3>
          </div>
          <span className="text-sm text-gray-500">{isLoading ? "..." : `${comments.length} commentaire${comments.length > 1 ? "s" : ""}`}</span>
        </div>
      </div>

      {/* Timeline des commentaires */}
      <div className="px-6 py-4">
        {/* État de chargement */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Chargement des commentaires...</span>
          </div>
        )}

        {/* État d'erreur */}
        {isError && (
          <div className="text-center py-12">
            <p className="text-red-500 text-sm">Impossible de charger les commentaires</p>
          </div>
        )}

        {/* Liste des commentaires - Format Timeline */}
        {!isLoading && !isError && (
          <div className="relative">
            {/* Ligne verticale de timeline */}
            {sortedComments.length > 0 && <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" style={{ height: "calc(100% - 60px)" }} />}

            {/* Commentaires */}
            <div className="space-y-6">
              {sortedComments.map((comment) => {
                const isCurrentUser = currentUser?.userId === comment.user.id;
                const roleStyle = getRoleStyle(comment.user.role);

                return (
                  <div key={comment.id + comment.createdAt} className="relative flex gap-4">
                    {/* Avatar avec indicateur timeline */}
                    <div className="relative z-10 flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center 
                                  text-sm font-medium border-2 border-white shadow-sm
                                  ${roleStyle.bg} ${roleStyle.text}`}
                      >
                        {getUserInitials(comment.user.firstName, comment.user.lastName, comment.user.email)}
                      </div>
                    </div>

                    {/* Contenu du commentaire */}
                    <div className="flex-1 min-w-0">
                      {/* En-tête */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-medium text-gray-900">{isCurrentUser ? "Vous" : getUserFullName(comment)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${roleStyle.bg} ${roleStyle.text}`}>{comment.user.role}</span>
                          <span className="text-xs text-gray-400" title={formatDate(comment.createdAt)}>
                            {formatRelativeDate(comment.createdAt)}
                          </span>
                        </div>

                        {/* Menu d'actions - Composant isolé */}
                        {isCurrentUser && (
                          <CommentMenu
                            commentId={comment.id}
                            onDelete={() => handleDeleteComment(comment.id)}
                            isDeleting={deleteCommentMutation.isPending}
                          />
                        )}
                      </div>

                      {/* Corps du commentaire */}
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* État vide */}
              {sortedComments.length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                    <MessageSquareText className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">Aucun commentaire pour le moment</p>
                  <p className="text-gray-400 text-xs mt-1">Soyez le premier à commenter cette demande</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Zone de saisie */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex gap-3">
          {/* Avatar utilisateur courant */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium bg-gray-200 text-gray-600">
              {currentUser ? <UserIcon className="h-5 w-5" /> : "?"}
            </div>
          </div>

          {/* Zone de saisie */}
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ajouter un commentaire..."
              rows={2}
              className="w-full p-3 text-sm border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       resize-none bg-white placeholder:text-gray-400"
              disabled={addCommentMutation.isPending}
            />

            {/* Actions */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">Ctrl + Entrée pour envoyer</span>
              <Button
                type="button"
                size="sm"
                onClick={handleSubmitComment}
                disabled={addCommentMutation.isPending || !newComment.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4"
              >
                {addCommentMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Commenter
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
