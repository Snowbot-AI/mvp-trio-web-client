"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import type { Demande, StatusDemande } from "../types"
import { getStationName } from "../types"
import { useDemande, useUpdateDemandeWithJsonFile } from "../hooks"

// Composants refactorisés
import { StatusBadge } from "./components/StatusBadge"
import { ActionButtons } from "./components/ActionButtons"
import { GeneralInfoCard } from "./components/GeneralInfoCard"
import { FinancialSummaryCard } from "./components/FinancialSummaryCard"
import { ItemsTable } from "./components/ItemsTable"
import { ContactInfoCards } from "./components/ContactInfoCards"
import { FilesSection } from "./components/FilesSection"

// Hooks personnalisés
import { useValidation } from "./hooks/useValidation"
import { useFileManagement } from "./hooks/useFileManagement"

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
  const [rejectComment, setRejectComment] = useState("")
  const [moreInfoComment, setMoreInfoComment] = useState("")

  // Hooks personnalisés
  const {
    validationErrors,
    validateField,
    validateRegexField,
    validateEmailField,
    clearValidationErrors,
  } = useValidation()

  const {
    fichierASupprimer,
    setFichierASupprimer,
    gererUploadFichier,
    confirmerSuppressionFichier,
    telechargerFichier,
  } = useFileManagement()

  // React Hook Form avec validation en temps réel
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
  } = useForm<Demande>({
    mode: 'onChange',
    defaultValues: demande || undefined
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

  // Handlers
  const gererSauvegarde = (data: Demande) => {
    clearValidationErrors()

    const dataToSave = { ...data }
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

    const files = watch("files") || []
    const filesToUpload = files.filter((file) => file.file).map((file) => file.file)

    updateDemandeWithJsonFileMutation.mutate({ requests: dataToSave, files: filesToUpload }, {
      onSuccess: () => {
        setModeEdition(false)
        setAjoutArticle(false)
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
    reset(demande || undefined)
    setModeEdition(false)
    setAjoutArticle(false)
    clearValidationErrors()
  }

  const gererChangementStatut = (nouveauStatut: StatusDemande) => {
    const currentData = watch()
    const demandeUpdated = { ...currentData, status: nouveauStatut }

    updateDemandeWithJsonFileMutation.mutate({ requests: demandeUpdated, files: [] }, {
      onSuccess: () => {
        console.log("Statut changé:", nouveauStatut)
        toast.success("Statut changé avec succès !")
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

  const supprimerArticle = (index: number) => {
    const currentData = watch()
    const updatedItems = currentData.items?.filter((_, i) => i !== index) || []
    setValue('items', updatedItems)
  }

  // Handlers pour les fichiers
  const handleUploadFile = (event: React.ChangeEvent<HTMLInputElement>, category: string) => {
    gererUploadFichier(event, category, watch, reset)
  }

  const handleConfirmDeleteFile = () => {
    confirmerSuppressionFichier(watch, reset)
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
    <div className="min-h-screen bg-gray-50 p-6 pt-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header en haut */}
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
              validationErrors={validationErrors}
              isPending={updateDemandeWithJsonFileMutation.isPending}
              showRejectDialog={showRejectDialog}
              showMoreInfoDialog={showMoreInfoDialog}
              rejectComment={rejectComment}
              moreInfoComment={moreInfoComment}
              onEdit={() => setModeEdition(true)}
              onCancel={gererAnnulation}
              onSave={handleSubmit(gererSauvegarde)}
              onStatusChange={gererChangementStatut}
              onRejectCommentChange={setRejectComment}
              onMoreInfoCommentChange={setMoreInfoComment}
              onShowRejectDialogChange={setShowRejectDialog}
              onShowMoreInfoDialogChange={setShowMoreInfoDialog}
            />
          </div>
        </div>

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
                validationErrors={validationErrors}
                register={register}
                watch={watch}
                setValue={setValue}
                validateField={(fieldName, value) => validateField(fieldName as keyof Demande, value, watch, setValue)}
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
            validationErrors={validationErrors}
            items={items}
            register={register}
            watch={watch}
            setValue={setValue}
            validateField={(fieldName, value) => validateField(fieldName as keyof Demande, value, watch, setValue)}
            validateRegexField={(fieldName, value, regex, errorMessage) => validateRegexField(fieldName as keyof Demande, value, regex, errorMessage, setValue)}
            onAddItem={() => setAjoutArticle(true)}
            onCancelAddItem={() => setAjoutArticle(false)}
            onDeleteItem={supprimerArticle}
          />

          {/* 3ème partie : Informations de facturation, fournisseur et livraison */}
          <ContactInfoCards
            demande={demande}
            modeEdition={modeEdition}
            validationErrors={validationErrors}
            register={register}
            validateField={(fieldName, value) => validateField(fieldName as keyof Demande, value, watch, setValue)}
            validateRegexField={(fieldName, value, regex, errorMessage) => validateRegexField(fieldName as keyof Demande, value, regex, errorMessage, setValue)}
            validateEmailField={(fieldName, value) => validateEmailField(fieldName as keyof Demande, value, setValue)}
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
          {demande.comment && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Commentaire</h3>
              <p className="text-sm">{demande.comment}</p>
            </div>
          )}
        </div>
      </div>

      <Toaster
        closeButton
        position="bottom-right"
      />
    </div>
  )
}
