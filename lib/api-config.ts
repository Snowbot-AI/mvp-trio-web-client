// Configuration de l'API backend
export const API_CONFIG = {
  // En développement, utiliser le proxy Next.js pour éviter les problèmes CORS
  baseUrl: process.env.NODE_ENV === 'development' 
    ? '' // Proxy Next.js vers localhost:8080
    : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'),
  endpoints: {
    demandes: '/api/demandes',
    demande: (id: string) => `/api/demandes/${id}`,
  },
} as const;

// Fonction utilitaire pour construire les URLs complètes
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseUrl}${endpoint}`;
}; 