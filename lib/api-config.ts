// Configuration de l'API backend
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
  endpoints: {
    demandes: '/api/demandes',
    demande: (id: string) => `/api/demandes/${id}`,
    files: (id: string) => `/api/files/${id}`,
  },
} as const;

// Fonction utilitaire pour construire les URLs complètes
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseUrl}${endpoint}`;
}; 