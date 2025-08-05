import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Demande } from './types';
import { buildApiUrl, API_CONFIG } from '../../lib/api-config';

// Constante pour le token d'authentification
const AUTH_TOKEN = 'UURNUzYkeVJuSlR5P0BwYWFwZ2ZxU3BwQWhoUiZiQkJTcmFoWEpFVA==';

// Fonction utilitaire pour créer les headers de base
const createHeaders = (contentType?: string) => {
  const headers: Record<string, string> = {
    'trio_auth': AUTH_TOKEN,
  };
  
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  
  return headers;
};

// Fonction utilitaire pour créer un FormData équivalent à la commande curl
const createFormDataFromJson = (jsonData: any, files?: File[]): FormData => {
  const formData = new FormData()
  
  // Créer un fichier JSON à partir des données (équivalent à @test.json)
  const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], {
    type: 'application/json'
  })
  const jsonFile = new File([jsonBlob], 'request.json', { type: 'application/json' })
  
  // Ajouter le fichier JSON comme dans la commande curl
  formData.append('request', jsonFile)
  
  // Ajouter les fichiers s'ils existent
  if (files && files.length > 0) {
    files.forEach(file => {
      formData.append('files', file)
    })
  }
  
  return formData
}

// Fonctions API utilisant la configuration
const fetchDemandes = async (): Promise<Demande[]> => {
  const response = await fetch(buildApiUrl(API_CONFIG.endpoints.demandes), {
    headers: createHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch demandes: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

const fetchDemandeById = async (id: string): Promise<Demande> => {
  const response = await fetch(buildApiUrl(API_CONFIG.endpoints.demande(id)), {
    headers: createHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch demande ${id}: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

const createDemande = async (demande: Omit<Demande, 'id'>): Promise<Demande> => {
  const response = await fetch(buildApiUrl(API_CONFIG.endpoints.demandes), {
    method: 'POST',
    headers: createHeaders('application/json'),
    body: JSON.stringify(demande),
  });
  if (!response.ok) {
    throw new Error(`Failed to create demande: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

const updateDemande = async (formData: FormData): Promise<Demande> => {
  // Extraire l'ID depuis les données du formulaire
  const requestPart = formData.get('request')
  let id: string
  
  if (requestPart instanceof File) {
    // Si c'est un fichier JSON, lire son contenu pour extraire l'ID
    const text = await requestPart.text()
    const data = JSON.parse(text)
    id = data.id
  } else {
    // Si c'est une chaîne JSON, la parser
    const data = JSON.parse(requestPart as string)
    id = data.id
  }
  
  const response = await fetch(buildApiUrl(API_CONFIG.endpoints.demande(id)), {
    method: 'PUT',
    headers: createHeaders(), // Pas de Content-Type pour FormData, le navigateur le fait automatiquement
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Failed to update demande ${id}: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

// Nouvelle fonction équivalente à la commande curl
const updateDemandeWithJsonFile = async (input: any): Promise<Demande> => {
  let jsonData: any
  let files: File[] | undefined
  
  // Vérifier si l'input contient data et files ou si c'est directement les données
  if (input.data && input.files) {
    jsonData = input.data
    files = input.files
  } else {
    jsonData = input
    files = undefined
  }
  
  const formData = createFormDataFromJson(jsonData, files)
  const id = jsonData.id
  
  const response = await fetch(buildApiUrl(API_CONFIG.endpoints.demande(id)), {
    method: 'PUT',
    headers: createHeaders(), // Pas de Content-Type pour FormData, le navigateur le fait automatiquement
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Failed to update demande ${id}: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

// Query hooks
export const useDemandes = () => {
  return useQuery({
    queryKey: ['demandes'],
    queryFn: fetchDemandes,
  });
};

export const useDemande = (id: string) => {
  return useQuery({
    queryKey: ['demande', id],
    queryFn: () => fetchDemandeById(id),
    enabled: !!id, // Only run query if id exists
  });
};

// Mutation hooks
export const useCreateDemande = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createDemande,
    onSuccess: () => {
      // Invalidate and refetch demandes list
      queryClient.invalidateQueries({ queryKey: ['demandes'] });
    },
  });
};

export const useUpdateDemande = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateDemande,
    onSuccess: (updatedDemande) => {
      // Update the specific demande in cache
      queryClient.setQueryData(['demande', updatedDemande.id], updatedDemande);
      // Invalidate the demandes list
      queryClient.invalidateQueries({ queryKey: ['demandes'] });
    },
  });
};

export const useUpdateDemandeWithJsonFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateDemandeWithJsonFile,
    onSuccess: (updatedDemande) => {
      // Update the specific demande in cache
      queryClient.setQueryData(['demande', updatedDemande.id], updatedDemande);
      // Invalidate the demandes list
      queryClient.invalidateQueries({ queryKey: ['demandes'] });
    },
  });
}; 