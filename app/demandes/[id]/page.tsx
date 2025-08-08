"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import { PurchaseRequestStatus } from "../types"
import { getStationName } from "../types"
import { useDemande, useUpdateDemandeWithJsonFile } from "../hooks"
import { buildApiUrl } from "@/lib/api-config"
import { DemandeSchema, type DemandeFormData } from "../validation-schema"

type FileType = {
  id?: string;
  name: string;
  category: string;
  uploadInstant: string;
}

// Composants refactorisés
import { StatusBadge } from "./components/StatusBadge"
import { ActionButtons } from "./components/ActionButtons"
import { GeneralInfoCard } from "./components/GeneralInfoCard"
import { FinancialSummaryCard } from "./components/FinancialSummaryCard"
import { ItemsTable } from "./components/ItemsTable"
import { ContactInfoCards } from "./components/ContactInfoCards"
import { FilesSection } from "./components/FilesSection"
import { PDFModal } from "./components/PDFModal"


export default function DetailDemande() {
  const router = useRouter()
  const params = useParams<{ id: string }>()

  // Utilisation de TanStack Query pour récupérer les vraies données
  const { data: demande, isLoading, error } = useDemande(params.id)
  const updateDemandeWithJsonFileMutation = useUpdateDemandeWithJsonFile()

  // États locaux
  const [modeEdition, setModeEdition] = useState(false)
  const [ajoutArticle, setAjoutArticle] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showMoreInfoDialog, setShowMoreInfoDialog] = useState(false)
  const [showPDFModal, setShowPDFModal] = useState(false)
  const [rejectComment, setRejectComment] = useState("")
  const [moreInfoComment, setMoreInfoComment] = useState("")
  const [filesToUpload, setFilesToUpload] = useState<File[]>([])
  const [fichierASupprimer, setFichierASupprimer] = useState<{ id: string; name: string } | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  // React Hook Form avec validation Zod
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DemandeFormData>({
    resolver: zodResolver(DemandeSchema),
    mode: 'onChange',
    defaultValues: demande ? {
      ...demande,
      priority: demande.priority || "LOW",
      status: demande.status || "BROUILLON" as PurchaseRequestStatus,
    } : undefined
  })

  const { fields: items } = useFieldArray({
    control,
    name: "items"
  })

  // Réinitialiser le formulaire quand les données arrivent
  useEffect(() => {
    if (demande) {
      reset(demande)
    }
  }, [demande, reset])

  // Détecter le scroll pour changer l'apparence du header
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handlers
  const gererSauvegarde = (data: DemandeFormData, files?: File[]) => {
    const dataToSave = data
    if (ajoutArticle) {
      const currentItems = data.items || []
      const newItemIndex = currentItems.length

      const description = watch(`items.${newItemIndex}.description`) || ""
      const service = watch(`items.${newItemIndex}.service`) || ""

      if (description.trim() && service.trim()) {
        const nouvelArticle = {
          description: description,
          service: service,
          budgetType: watch(`items.${newItemIndex}.budgetType`) || "B",
          itemType: watch(`items.${newItemIndex}.itemType`) || null,
          referenceDevis: watch(`items.${newItemIndex}.referenceDevis`) || undefined,
          quantity: watch(`items.${newItemIndex}.quantity`) || 0,
          unitPrice: watch(`items.${newItemIndex}.unitPrice`) || 0,
          price: watch(`items.${newItemIndex}.price`) || 0,
        }

        dataToSave.items = [...currentItems, nouvelArticle]
      } else {
        dataToSave.items = currentItems
      }
    }

    updateDemandeWithJsonFileMutation.mutate({ requests: dataToSave, files: files || [] }, {
      onSuccess: () => {
        setModeEdition(false)
        setAjoutArticle(false)
        setFilesToUpload([])
        toast.success("Sauvegarde réussie !")
      },
      onError: (error) => {
        console.error("Erreur lors de la sauvegarde:", error)
        toast.error(error.message || "Erreur lors de la sauvegarde de la demande", {
          duration: 4000,
          style: {
            background: 'white',
            color: '#ef4444',
            fontWeight: 'bold',
            border: '1px solid #ef4444'
          }
        })
      }
    })
  }

  const gererAnnulation = () => {
    if (demande) {
      reset(demande)
    }
    setModeEdition(false)
    setAjoutArticle(false)
    setFilesToUpload([])
  }

  const gererChangementStatut = (nouveauStatut: PurchaseRequestStatus) => {
    const currentData = watch()

    // Si on passe en mode "A_VERIFIER" (soumission), faire la validation
    if (nouveauStatut === PurchaseRequestStatus.A_VERIFIER) {
      // Valider les données avec le schéma Zod
      const validationResult = DemandeSchema.safeParse(currentData)

      if (!validationResult.success) {
        // Passer automatiquement en mode édition
        setModeEdition(true)

        // Afficher un toast informatif
        toast.info(
          <div>
            <div className="font-bold mb-2">Informations manquantes</div>
            <p className="text-sm">La demande a été mise en mode édition pour vous permettre de corriger les erreurs.</p>
          </div>,
          {
            duration: 5000,
            style: {
              background: 'white',
              color: '#3b82f6',
              border: '1px solid #3b82f6',
              maxWidth: '400px'
            }
          }
        )
        return // Ne pas continuer si validation échoue
      }
    }

    // Préparer les données à sauvegarder
    let demandeUpdated = { ...currentData, status: nouveauStatut }

    // Si on demande plus d'informations, ajouter le commentaire
    if (nouveauStatut === PurchaseRequestStatus.A_MODIFIER && moreInfoComment.trim()) {
      const currentComment = currentData.comment || ""
      const newComment = currentComment
        ? `${currentComment}\n\n--- Demande d'informations supplémentaires ---\n${moreInfoComment}`
        : `--- Demande d'informations supplémentaires ---\n${moreInfoComment}`

      demandeUpdated = { ...demandeUpdated, comment: newComment }
    }

    // Si on rejette, ajouter le commentaire de rejet
    if (nouveauStatut === PurchaseRequestStatus.REJETEE && rejectComment.trim()) {
      const currentComment = currentData.comment || ""
      const newComment = currentComment
        ? `${currentComment}\n\n--- Raison du rejet ---\n${rejectComment}`
        : `--- Raison du rejet ---\n${rejectComment}`

      demandeUpdated = { ...demandeUpdated, comment: newComment }
    }

    updateDemandeWithJsonFileMutation.mutate({ requests: demandeUpdated, files: [] }, {
      onSuccess: () => {
        console.log("Statut changé:", nouveauStatut)
        if (nouveauStatut === PurchaseRequestStatus.A_VERIFIER) {
          toast.success("Demande soumise avec succès !")
        } else {
          toast.success("Statut changé avec succès !")
        }
      },
      onError: (error) => {
        console.error("Erreur lors du changement de statut:", error)
        toast.error(error.message || "Erreur lors du changement de statut", {
          duration: 4000,
          style: {
            background: 'white',
            color: '#ef4444',
            fontWeight: 'bold',
            border: '1px solid #ef4444'
          }
        })
      }
    })
  }

  // Fonction spécifique pour la validation lors de la soumission en mode brouillon
  const handleValidateAndSubmit = () => {
    const currentData = watch()

    // Valider les données avec le schéma Zod
    const validationResult = DemandeSchema.safeParse(currentData)

    if (!validationResult.success) {
      // Afficher les erreurs de validation dans un toast
      const errorMessages = validationResult.error.issues.map((issue) => {
        const fieldName = issue.path?.join('.') || '(champ inconnu)';
        return `${fieldName}: ${issue.message}`;
      });

      toast.error(
        <div>
          <div className="font-bold mb-2">Erreurs de validation ({errorMessages.length}) :</div>
          <ul className="text-sm space-y-1">
            {errorMessages.map((error: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-1">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>,
        {
          duration: 8000,
          style: {
            background: 'white',
            color: '#ef4444',
            border: '1px solid #ef4444',
            maxWidth: '500px'
          }
        }
      )
      return // Ne pas continuer si validation échoue
    }

    // Si validation réussie, changer le statut
    const demandeUpdated = { ...currentData, status: PurchaseRequestStatus.A_VERIFIER }

    updateDemandeWithJsonFileMutation.mutate({ requests: demandeUpdated, files: [] }, {
      onSuccess: () => {
        toast.success("Demande soumise avec succès !")
      },
      onError: (error) => {
        console.error("Erreur lors de la soumission:", error)
        toast.error(error.message || "Erreur lors de la soumission", {
          duration: 4000,
          style: {
            background: 'white',
            color: '#ef4444',
            fontWeight: 'bold',
            border: '1px solid #ef4444'
          }
        })
      }
    })
  }

  const supprimerArticle = (index: number) => {
    const currentData = watch()
    const updatedItems = currentData.items?.filter((_, i) => i !== index) || []
    setValue('items', updatedItems)
  }

  // Handlers pour les fichiers
  const handleUploadFile = (event: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const fichiers = event.target.files
    if (fichiers) {
      const nouveauxFichiers = Array.from(fichiers)
      setFilesToUpload(prev => [...prev, ...nouveauxFichiers])

      // Ajouter les métadonnées des fichiers au formulaire pour l'affichage
      const nouveauxFichiersMetadata = nouveauxFichiers.map((fichier) => ({
        name: fichier.name,
        category: category,
        uploadInstant: new Date().toISOString(),
      }))

      const currentFiles = watch("files") || []
      const updatedFiles = [...currentFiles, ...nouveauxFichiersMetadata]
      setValue('files', updatedFiles)
    }
  }

  const handleConfirmDeleteFile = () => {
    if (fichierASupprimer) {
      // Supprimer du formulaire
      const currentFiles = watch("files") || []
      const updatedFiles = currentFiles.filter((f: FileType) => f.id !== fichierASupprimer.id)
      setValue('files', updatedFiles)

      // Supprimer des fichiers à uploader si c'est un nouveau fichier
      setFilesToUpload(prev => prev.filter(file => file.name !== fichierASupprimer.name))

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

  // Fonction wrapper pour la sauvegarde avec extraction des fichiers
  const handleSave = handleSubmit((data: DemandeFormData) => {
    gererSauvegarde(data, filesToUpload)
  }, (errors) => {
    // Toujours afficher les erreurs de validation
    const errorMessages = Object.keys(errors).map(key => {
      const error = errors[key as keyof typeof errors]
      if (error && typeof error === 'object' && 'message' in error) {
        return `${key}: ${error.message}`
      }
      return `${key}: Erreur de validation`
    })

    toast.error(
      <div>
        <div className="font-bold mb-2">Erreurs de validation ({errorMessages.length}) :</div>
        <ul className="text-sm space-y-1">
          {errorMessages.map((error: string, index: number) => (
            <li key={index} className="flex items-start">
              <span className="text-red-500 mr-1">•</span>
              <span>{error}</span>
            </li>
          ))}
        </ul>
      </div>,
      {
        duration: 8000,
        style: {
          background: 'white',
          color: '#ef4444',
          border: '1px solid #ef4444',
          maxWidth: '500px'
        }
      }
    )
  })

  // Fonction d'export PDF
  const handleExportPDF = () => {
    setShowPDFModal(true)
  }

  // États de chargement et d'erreur
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chargement...</h2>
          <p className="text-gray-600">Récupération des données de la demande</p>
        </div>
      </div>
    )
  }

  if (error) {
    const isNotFound = error.message.includes('404') || error.message.includes('Failed to fetch demande')

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isNotFound ? 'Demande non trouvée' : 'Erreur'}
          </h2>
          <p className="text-gray-600 mb-4">
            {isNotFound
              ? `La demande avec l'ID ${params.id} n'existe pas.`
              : `Impossible de charger la demande : ${error.message}`
            }
          </p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Button>
        </div>
      </div>
    )
  }

  if (!demande) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Demande non trouvée</h2>
          <p className="text-gray-600 mb-4">La demande avec l&apos;ID {params.id} n&apos;existe pas.</p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header sticky en haut */}
      <div className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm'
        : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <ActionButtons
                demande={demande}
                modeEdition={modeEdition}
                validationErrors={modeEdition ? errors : {}}
                isPending={updateDemandeWithJsonFileMutation.isPending}
                showRejectDialog={showRejectDialog}
                showMoreInfoDialog={showMoreInfoDialog}
                rejectComment={rejectComment}
                moreInfoComment={moreInfoComment}
                onEdit={() => setModeEdition(true)}
                onCancel={gererAnnulation}
                onSave={handleSave}
                onStatusChange={gererChangementStatut}
                onRejectCommentChange={setRejectComment}
                onMoreInfoCommentChange={setMoreInfoComment}
                onShowRejectDialogChange={setShowRejectDialog}
                onShowMoreInfoDialogChange={setShowMoreInfoDialog}
                onExport={handleExportPDF}
                onValidateAndSubmit={handleValidateAndSubmit}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal avec padding ajusté */}
      <div className="max-w-7xl mx-auto px  -6 space-y-6">
        {/* Titre */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900">{`Demande d'achat Trio Pyrénées ${getStationName(demande.codeStation)}`}</h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            <StatusBadge status={demande.status} />
          </div>
        </div>

        {/* Contenu principal - Layout vertical */}
        <div className="space-y-6">
          {/* 1ère partie : Informations générales avec demandeur et récap financier */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <GeneralInfoCard
                demande={demande}
                modeEdition={modeEdition}
                validationErrors={modeEdition ? errors : {}}
                register={register}
                watch={watch}
                setValue={setValue}
              />
            </div>
            <div className="space-y-6">
              <FinancialSummaryCard demande={demande} />
            </div>
          </div>

          {/* 2ème partie : Tableau des articles commandés */}
          <ItemsTable
            demande={demande}
            modeEdition={modeEdition}
            ajoutArticle={ajoutArticle}
            validationErrors={modeEdition ? errors : {}}
            items={items}
            register={register}
            watch={watch}
            setValue={setValue}
            onAddItem={() => setAjoutArticle(true)}
            onCancelAddItem={() => setAjoutArticle(false)}
            onDeleteItem={supprimerArticle}
          />

          {/* 3ème partie : Informations de facturation, fournisseur et livraison */}
          <ContactInfoCards
            demande={demande}
            modeEdition={modeEdition}
            validationErrors={modeEdition ? errors : {}}
            register={register}
            watch={watch}
            setValue={setValue}
          />

          {/* 4ème partie : Documents joints */}
          <FilesSection
            demande={demande}
            modeEdition={modeEdition}
            watch={watch}
            fichierASupprimer={fichierASupprimer}
            onUploadFile={handleUploadFile}
            onDownloadFile={telechargerFichier}
            onSetFileToDelete={setFichierASupprimer}
            onConfirmDeleteFile={handleConfirmDeleteFile}
          />

          {/* 5ème partie : Commentaires */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Commentaire</h3>
            {modeEdition ? (
              <div className="space-y-2">
                <textarea
                  {...register("comment")}
                  placeholder="Ajouter un commentaire..."
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 resize-vertical"
                />
                {errors.comment && (
                  <p className="text-sm text-red-600">{errors.comment.message}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                {demande.comment || "Aucun commentaire"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal PDF */}
      <PDFModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        demande={demande}
      />

      <Toaster
        closeButton
        position="bottom-right"
      />
    </div>
  )
}
