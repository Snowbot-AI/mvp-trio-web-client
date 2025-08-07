import { useState } from "react"
import { toast } from "sonner"
import { buildApiUrl } from "@/lib/api-config"
import { FileType, type Demande } from "../../types"
import { UseFormReset, UseFormWatch } from "react-hook-form"

export function useFileManagement() {
    const [fichierASupprimer, setFichierASupprimer] = useState<{ id: string; name: string } | null>(null)

    const gererUploadFichier = (
        event: React.ChangeEvent<HTMLInputElement>,
        category: string = "quotations",
        watch: UseFormWatch<Demande>,
        reset: UseFormReset<Demande>,
    ) => {
        const fichiers = event.target.files
        if (fichiers) {
            const nouveauxFichiers: Demande["files"] = Array.from(fichiers).map((fichier, index) => ({
                id: `${Date.now()}-${index}`,
                name: fichier.name,
                category: category,
                uploadInstant: new Date().toISOString(),
                // Stocker la référence au fichier réel pour l'envoi
                file: fichier
            }))

            const currentFiles = watch("files") || []
            const updatedFiles = [...currentFiles, ...nouveauxFichiers]

            // Mettre à jour le formulaire
            const currentData = watch()
            reset({ ...currentData, files: updatedFiles })
        }
    }

    const gererSuppressionFichier = (idFichier: string, watch: UseFormWatch<Demande>, reset: UseFormReset<Demande>) => {
        const currentFiles = watch("files") || []
        const updatedFiles = currentFiles.filter((f: FileType) => f.id !== idFichier)

        // Mettre à jour le formulaire
        const currentData = watch()
        reset({ ...currentData, files: updatedFiles })
    }

    const confirmerSuppressionFichier = (watch: UseFormWatch<Demande>, reset: UseFormReset<Demande>) => {
        if (fichierASupprimer) {
            gererSuppressionFichier(fichierASupprimer.id, watch, reset)
            setFichierASupprimer(null)
        }
    }

    // Fonction pour télécharger un fichier
    const telechargerFichier = async (fileId: string, fileName: string) => {
        try {
            const response = await fetch(buildApiUrl(`/api/files/${fileId}`))

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`)
            }

            // Récupérer le blob du fichier
            const blob = await response.blob()

            // Créer un lien de téléchargement
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = fileName

            // Déclencher le téléchargement
            document.body.appendChild(link)
            link.click()

            // Nettoyer
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            toast.success(`Téléchargement de "${fileName}" réussi !`)
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error)
            toast.error(`Erreur lors du téléchargement de "${fileName}"`, {
                duration: 4000,
                style: {
                    background: 'white',
                    color: '#ef4444',
                    fontWeight: 'bold',
                    border: '1px solid #ef4444'
                }
            })
        }
    }

    return {
        fichierASupprimer,
        setFichierASupprimer,
        gererUploadFichier,
        gererSuppressionFichier,
        confirmerSuppressionFichier,
        telechargerFichier,
    }
}
