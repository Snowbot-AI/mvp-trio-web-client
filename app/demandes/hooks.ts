import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DemandeFormData } from './validation-schema';
import { buildApiUrl, API_CONFIG } from '../../lib/api-config';

// Fonction utilitaire pour créer les headers de base (sans auth, on passe par cookie)
const createHeaders = (contentType?: string) => {
  const headers: Record<string, string> = {};

  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  return headers;
};

// Fonction utilitaire pour créer un FormData équivalent à la commande curl
const createFormDataFromJson = (jsonData: DemandeFormData, files?: File[]): FormData => {
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
const fetchDemandes = async (): Promise<DemandeFormData[]> => {
  const url = buildApiUrl(API_CONFIG.endpoints.demandes)
  const response = await fetch(url, {
    headers: createHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch demandes: ${response.status} ${response.statusText}`);
  }
  return response.json();
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
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
};

// Nouvelle fonction équivalente à la commande curl
const updateDemandeWithJsonFile = async (input: { requests: DemandeFormData, files: (File | undefined)[] }): Promise<DemandeFormData> => {
  let jsonData: DemandeFormData;
  let files: File[] | undefined

  // Vérifier si l'input contient data et files ou si c'est directement les données
  if (input.requests && input.files) {
    jsonData = input.requests
    files = input.files.filter((file): file is File => file !== undefined)
  } else {
    jsonData = input.requests
    files = undefined
  }

  const formData = createFormDataFromJson(jsonData, files)
  const id = jsonData.id

  const url = buildApiUrl(API_CONFIG.endpoints.demande(id as string))
  const response = await fetch(url, {
    method: 'PUT',
    headers: createHeaders(), // Pas de Content-Type pour FormData, le navigateur le fait automatiquement
    body: formData,
  });

  if (!response.ok) {
    // Récupérer le message d'erreur de la réponse JSON
    const errorData = await response.json()
    throw new Error(errorData.error || `${response.status} ${response.statusText}`)
  }

  return response.json();
};

// Fonction pour créer une nouvelle demande avec le format multipart
const createDemande = async (input: { requests: Partial<DemandeFormData>, files?: (File | undefined)[] }): Promise<DemandeFormData> => {
  let jsonData: Partial<DemandeFormData>;
  let files: File[] | undefined

  // Vérifier si l'input contient data et files ou si c'est directement les données
  if (input.requests && input.files) {
    jsonData = input.requests
    files = input.files.filter((file): file is File => file !== undefined)
  } else {
    jsonData = input.requests
    files = undefined
  }

  const formData = createFormDataFromJson(jsonData as DemandeFormData, files)

  const url = buildApiUrl(API_CONFIG.endpoints.demandes)
  const response = await fetch(url, {
    method: 'POST',
    headers: createHeaders(), // Pas de Content-Type pour FormData, le navigateur le fait automatiquement
    body: formData,
  });

  if (!response.ok) {
    // Récupérer le message d'erreur de la réponse JSON
    const errorData = await response.json()
    throw new Error(errorData.error || `${response.status} ${response.statusText}`)
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

export const useCreateDemande = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDemande,
    onSuccess: (createdDemande) => {
      // Add the new demande to cache
      queryClient.setQueryData(['demande', createdDemande.id], createdDemande);
      // Invalidate the demandes list
      queryClient.invalidateQueries({ queryKey: ['demandes'] });
    },
  });
}; 