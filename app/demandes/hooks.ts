import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DemandeFormData } from "./validation-schema";
import { buildApiUrl, API_CONFIG } from "../../lib/api-config";

// Erreur API enrichie pour propager le statut et les détails en cas d'échec
export class ApiError extends Error {
  public readonly status: number;
  public readonly details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

// Fonction utilitaire pour créer les headers de base (sans auth, on passe par cookie)
const createHeaders = (contentType?: string) => {
  const headers: Record<string, string> = {};

  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  return headers;
};

// Normalise les données avant envoi pour respecter les attentes du backend
// - convertit les chaînes vides en null pour les champs optionnels (comment)
const normalizeDemandeForSubmission = (data: DemandeFormData): DemandeFormData => {
  const rawComment = data.comment ?? undefined;
  const trimmedComment = typeof rawComment === "string" ? rawComment.trim() : rawComment ?? null;
  const normalizedComment = trimmedComment === "" ? null : trimmedComment;

  return {
    ...data,
    comment: normalizedComment,
  };
};

// Fonction utilitaire pour créer un FormData équivalent à la commande curl
const createFormDataFromJson = (jsonData: DemandeFormData, files?: File[]): FormData => {
  const formData = new FormData();

  // Normaliser les données (ex: commentaire vide => null)
  const normalized = normalizeDemandeForSubmission(jsonData);

  // Créer un fichier JSON à partir des données (équivalent à @test.json)
  const jsonBlob = new Blob([JSON.stringify(normalized, null, 2)], {
    type: "application/json",
  });
  const jsonFile = new File([jsonBlob], "request.json", { type: "application/json" });

  // Ajouter le fichier JSON comme dans la commande curl
  formData.append("request", jsonFile);

  // Ajouter les fichiers s'ils existent
  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append("files", file);
    });
  }
  // } else {
  //   // Si aucun fichier, envoyer tout de même un champ 'files' vide (fichier 0 octet)
  //   const emptyFile = new File([new Uint8Array()], 'empty', { type: 'application/octet-stream' })
  //   formData.append('files', emptyFile)
  // }

  return formData;
};

// Fonctions API utilisant la configuration
const fetchDemandes = async (): Promise<DemandeFormData[]> => {
  const url = buildApiUrl(API_CONFIG.endpoints.demandes);
  console.log(url);
  const response = await fetch(url, {
    headers: createHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch demandes: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

const deleteDemande = async (id: string): Promise<void> => {
  const url = buildApiUrl(API_CONFIG.endpoints.demande(id));
  const response = await fetch(url, {
    method: "DELETE",
    headers: createHeaders(),
  });
  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text();
    }

    console.error("[deleteDemande] Error response", { status: response.status, statusText: response.statusText, body: errorBody });
    const message =
      typeof errorBody === "object" && errorBody && "error" in (errorBody as Record<string, unknown>)
        ? String((errorBody as { error?: unknown }).error)
        : `${response.status} ${response.statusText}`;
    throw new ApiError(message, response.status, errorBody);
  }
};

const fetchDemandeById = async (id: string): Promise<DemandeFormData> => {
  const response = await fetch(buildApiUrl(API_CONFIG.endpoints.demande(id)), {
    headers: createHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch demande ${id}: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

const updateDemande = async (formData: FormData): Promise<DemandeFormData> => {
  // Extraire l'ID depuis les données du formulaire
  const requestPart = formData.get("request");
  let id: string;

  if (requestPart instanceof File) {
    // Si c'est un fichier JSON, lire son contenu pour extraire l'ID
    const text = await requestPart.text();
    const data = JSON.parse(text);
    id = data.id;
  } else {
    // Si c'est une chaîne JSON, la parser
    const data = JSON.parse(requestPart as string);
    id = data.id;
  }

  const response = await fetch(buildApiUrl(API_CONFIG.endpoints.demande(id)), {
    method: "PUT",
    headers: createHeaders(), // Pas de Content-Type pour FormData, le navigateur le fait automatiquement
    body: formData,
  });
  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text();
    }
    // Log détaillé en console

    console.error("[updateDemande] Error response", { status: response.status, statusText: response.statusText, body: errorBody });
    const message =
      typeof errorBody === "object" && errorBody && "error" in (errorBody as Record<string, unknown>)
        ? String((errorBody as { error?: unknown }).error)
        : `${response.status} ${response.statusText}`;
    throw new ApiError(message, response.status, errorBody);
  }
  return response.json();
};

// Nouvelle fonction équivalente à la commande curl
const updateDemandeWithJsonFile = async (input: { requests: DemandeFormData; files: (File | undefined)[] }): Promise<DemandeFormData> => {
  let jsonData: DemandeFormData;
  let files: File[] | undefined;

  // Vérifier si l'input contient data et files ou si c'est directement les données
  if (input.requests && input.files) {
    jsonData = input.requests;
    files = input.files.filter((file): file is File => file !== undefined);
  } else {
    jsonData = input.requests;
    files = undefined;
  }

  const formData = createFormDataFromJson(jsonData, files);
  const id = jsonData.id;

  const url = buildApiUrl(API_CONFIG.endpoints.demande(id as string));
  const response = await fetch(url, {
    method: "PUT",
    headers: createHeaders(), // Pas de Content-Type pour FormData, le navigateur le fait automatiquement
    body: formData,
  });

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text();
    }
    // Log détaillé en console

    console.error("[updateDemandeWithJsonFile] Error response", { status: response.status, statusText: response.statusText, body: errorBody });
    const message =
      typeof errorBody === "object" && errorBody && "error" in (errorBody as Record<string, unknown>)
        ? String((errorBody as { error?: unknown }).error)
        : `${response.status} ${response.statusText}`;
    throw new ApiError(message, response.status, errorBody);
  }

  return response.json();
};

// Fonction pour créer une nouvelle demande avec le format multipart
const createDemande = async (input: { requests: Partial<DemandeFormData>; files?: (File | undefined)[] }): Promise<DemandeFormData> => {
  let jsonData: Partial<DemandeFormData>;
  let files: File[] | undefined;

  // Vérifier si l'input contient data et files ou si c'est directement les données
  if (input.requests && input.files) {
    jsonData = input.requests;
    files = input.files.filter((file): file is File => file !== undefined);
  } else {
    jsonData = input.requests;
    files = undefined;
  }

  const formData = createFormDataFromJson(jsonData as DemandeFormData, files);

  const url = buildApiUrl(API_CONFIG.endpoints.demandes);
  const response = await fetch(url, {
    method: "POST",
    headers: createHeaders(), // Pas de Content-Type pour FormData, le navigateur le fait automatiquement
    body: formData,
  });

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text();
    }
    // Log détaillé en console

    //console.error("[createDemande] Error response", { status: response.status, statusText: response.statusText, body: errorBody });
    console.log("[createDemande] Error response", errorBody);
    console.log("[createDemande] Response status", response.status, response.statusText);
    const message =
      typeof errorBody === "object" && errorBody && "error" in (errorBody as Record<string, unknown>)
        ? String((errorBody as { error?: unknown }).error)
        : `${response.status} ${response.statusText}`;
    console.log("[createDemande] Error message", message);
    throw new ApiError(message, response.status, errorBody);
  }

  return response.json();
};

// Query hooks
export const useDemandes = () => {
  return useQuery({
    queryKey: ["demandes"],
    queryFn: fetchDemandes,
  });
};

export const useDemande = (id: string) => {
  return useQuery({
    queryKey: ["demande", id],
    queryFn: () => fetchDemandeById(id),
    enabled: !!id, // Only run query if id exists
  });
};

export const useUpdateDemande = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDemande,
    onSuccess: (updatedDemande) => {
      // Update the specific demande in cache
      queryClient.setQueryData(["demande", updatedDemande.id], updatedDemande);
      // Invalidate the demandes list
      queryClient.invalidateQueries({ queryKey: ["demandes"] });
    },
  });
};

export const useUpdateDemandeWithJsonFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDemandeWithJsonFile,
    onSuccess: (updatedDemande) => {
      // Update the specific demande in cache
      queryClient.setQueryData(["demande", updatedDemande.id], updatedDemande);
      // Invalidate the demandes list
      queryClient.invalidateQueries({ queryKey: ["demandes"] });
    },
  });
};

export const useCreateDemande = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDemande,
    onSuccess: (createdDemande) => {
      // Add the new demande to cache
      queryClient.setQueryData(["demande", createdDemande.id], createdDemande);
      // Invalidate the demandes list
      queryClient.invalidateQueries({ queryKey: ["demandes"] });
    },
  });
};

export const useDeleteDemande = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDemande(id),
    onSuccess: (_data, id) => {
      // Remove the specific demande from cache
      queryClient.removeQueries({ queryKey: ["demande", id] });
      // Invalidate the demandes list
      queryClient.invalidateQueries({ queryKey: ["demandes"] });
    },
  });
};

export type CommentUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

export type CommentDTO = {
  id: string;
  content: string;
  createdAt: string;
  user: CommentUser;
};

// Hook pour récupérer les commentaires
export function useComments(demandeId: string) {
  return useQuery<CommentDTO[]>({
    queryKey: ["comments", demandeId],
    queryFn: async () => {
      const response = await fetch(`/api/demandes/${demandeId}/comments`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new ApiError("Erreur lors de la récupération des commentaires", response.status);
      }
      return response.json();
    },
    enabled: !!demandeId,
  });
}

// Hook pour ajouter un commentaire (mis à jour pour retourner CommentDTO)
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation<CommentDTO, ApiError, { demandeId: string; content: string }>({
    mutationFn: async ({ demandeId, content }) => {
      const response = await fetch(`/api/demandes/${demandeId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        throw new ApiError("Erreur lors de l'ajout du commentaire", response.status);
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalider le cache pour recharger les commentaires
      queryClient.invalidateQueries({ queryKey: ["comments", variables.demandeId] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { demandeId: string; commentId: string }>({
    mutationFn: async ({ demandeId, commentId }) => {
      const response = await fetch(`/api/demandes/${demandeId}/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new ApiError("Erreur lors de la suppression du commentaire", response.status);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.demandeId] });
    },
  });
}
