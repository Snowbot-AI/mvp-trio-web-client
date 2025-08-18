"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
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
import { buildApiUrl, API_CONFIG } from "@/lib/api-config"
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
  const isAppendingRef = useRef(false)

  // React Hook Form avec validation Zod
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    unregister,
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

  const { fields: items, append, remove } = useFieldArray({
    control,
    name: "items"
  })

  // Recalculer les totaux HT à partir des items et des frais saisis
  const watchedItems = watch("items") ?? []
  const participationLivraison = watch("total.deliveryTotal") ?? 0
  const fraisFacturation = watch("total.billingFees") ?? 0

  const orderTotal = watchedItems.reduce((acc: number, item: { price?: number; quantity?: number; unitPrice?: number }) => {
    const linePrice = typeof item?.price === 'number'
      ? item.price
      : ((item?.quantity ?? 0) * (item?.unitPrice ?? 0))
    return acc + (Number.isFinite(linePrice) ? linePrice : 0)
  }, 0)

  const totalHT = orderTotal + (participationLivraison ?? 0) + (fraisFacturation ?? 0)

  // Propager les totaux dans le form state pour cohérence
  useEffect(() => {
    setValue("total.orderTotal", orderTotal)
    setValue("total.total", totalHT)
  }, [orderTotal, totalHT, setValue])

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
    updateDemandeWithJsonFileMutation.mutate({ requests: data, files: files || [] }, {
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

  // Fonction pour sauvegarder en mode brouillon sans validation
  // Cette fonction permet de sauvegarder une demande même si elle contient des erreurs de validation
  // Utile pour permettre aux utilisateurs de sauvegarder leur travail en cours
  const handleSaveDraft = () => {
    const currentData = watch()

    // Sanitize: retirer les entrées falsy (ex: null) éventuellement présentes dans items
    const sanitizedItems = Array.isArray(currentData.items) ? currentData.items.filter(Boolean) : []
    const dataSanitized: DemandeFormData = { ...currentData, items: sanitizedItems as DemandeFormData['items'] }

    // Sauvegarder directement sans validation
    gererSauvegarde(dataSanitized, filesToUpload)
  }

  const supprimerArticle = (index: number) => {
    remove(index)
  }

  const annulerAjoutArticle = () => {
    setAjoutArticle(false)
    const newIndex = items.length
    unregister(`items.${newIndex}`)
  }

  const confirmerAjoutArticle = () => {
    if (isAppendingRef.current) {
      return
    }
    isAppendingRef.current = true
    const newItemIndex = items.length

    const description = (watch(`items.${newItemIndex}.description`) || "").trim()
    const service = (watch(`items.${newItemIndex}.service`) || "").trim()
    if (!description || !service) {
      isAppendingRef.current = false
      return
    }

    const budgetType = watch(`items.${newItemIndex}.budgetType`) || "H"
    const itemType = watch(`items.${newItemIndex}.itemType`) || null
    const referenceDevis = watch(`items.${newItemIndex}.referenceDevis`) || undefined
    const rawQuantity = watch(`items.${newItemIndex}.quantity`)
    const quantity = typeof rawQuantity === 'number' && rawQuantity > 0 ? rawQuantity : 1
    const unitPrice = watch(`items.${newItemIndex}.unitPrice`) || 0
    const price = quantity * unitPrice

    const nouvelArticle: DemandeFormData['items'][number] = {
      description,
      service,
      budgetType,
      itemType,
      referenceDevis,
      quantity,
      unitPrice,
      price,
    }

    // Nettoyer d'abord les valeurs "brouillon" à l'index virtuel avant d'ajouter
    unregister(`items.${newItemIndex}`)
    append(nouvelArticle)
    setAjoutArticle(false)
    isAppendingRef.current = false
  }

  const handleSaveClick = () => {
    if (ajoutArticle) {
      const desc = (watch(`items.${items.length}.description`) || "").trim()
      const svc = (watch(`items.${items.length}.service`) || "").trim()
      const hasAnyValue = `${desc}${svc}`.length > 0

      if (!hasAnyValue) {
        annulerAjoutArticle()
      } else {
        // Exiger au minimum désignation et service pour confirmer l'ajout
        if (!desc || !svc) {
          toast.error("Complétez l'article en cours (désignation et service) avant de sauvegarder.", {
            duration: 5000,
            style: { background: 'white', color: '#ef4444', border: '1px solid #ef4444' }
          })
          return
        }
        confirmerAjoutArticle()
      }
    }

    // Logique conditionnelle selon le statut
    const currentStatus = watch("status")
    if (currentStatus === PurchaseRequestStatus.BROUILLON) {
      // En mode brouillon, sauvegarder sans validation
      handleSaveDraft()
    } else {
      // Pour les autres statuts, utiliser la validation normale
      handleSave()
    }
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

      // Auto-save when demande is validated and adding invoices without edit mode
      const currentStatus = watch("status")
      if (category === 'invoices' && currentStatus === PurchaseRequestStatus.VALIDEE) {
        const currentData = watch()
        const dataForSave: DemandeFormData = { ...(currentData as DemandeFormData), files: updatedFiles }
        const allFilesToUpload = [...filesToUpload, ...nouveauxFichiers]
        gererSauvegarde(dataForSave, allFilesToUpload)
      }
    }
  }

  const handleConfirmDeleteFile = () => {
    if (fichierASupprimer) {
      // Supprimer du formulaire
      const currentFiles = watch("files") || []
      const updatedFiles = currentFiles.filter((f: FileType) => {
        // Si le fichier a un ID, comparer par ID
        if (f.id && fichierASupprimer.id) {
          return f.id !== fichierASupprimer.id
        }
        // Sinon, comparer par nom (pour les fichiers nouvellement uploadés)
        return f.name !== fichierASupprimer.name
      })
      setValue('files', updatedFiles)

      // Supprimer des fichiers à uploader si c'est un nouveau fichier
      setFilesToUpload(prev => prev.filter(file => file.name !== fichierASupprimer.name))

      // Si on est en statut VALIDEE et qu'on supprime une facture, auto-sauvegarder
      const currentStatus = watch("status")
      const deletedWasInvoice = currentFiles.some((f: FileType) => (f.id === fichierASupprimer.id || f.name === fichierASupprimer.name) && f.category === 'invoices')
      if (currentStatus === PurchaseRequestStatus.VALIDEE && deletedWasInvoice) {
        const currentData = watch()
        const dataForSave: DemandeFormData = { ...(currentData as DemandeFormData), files: updatedFiles }
        gererSauvegarde(dataForSave, filesToUpload)
      }

      setFichierASupprimer(null)
    }
  }

  // Fonction pour télécharger un fichier
  const telechargerFichier = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.endpoints.files(fileId)))

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
    // Sanitize: retirer les entrées falsy (ex: null) éventuellement présentes dans items
    const sanitizedItems = Array.isArray(data.items) ? data.items.filter(Boolean) : []
    const dataSanitized: DemandeFormData = { ...data, items: sanitizedItems as DemandeFormData['items'] }
    gererSauvegarde(dataSanitized, filesToUpload)
  }, (errors) => {
    // Extraire récursivement des messages détaillés (items[index].champ)
    const flattenErrors = (err: unknown, path: string[] = []): string[] => {
      const messages: string[] = []
      if (!err) {
        return messages
      }

      if (Array.isArray(err)) {
        err.forEach((item, idx) => {
          messages.push(...flattenErrors(item as unknown, [...path, String(idx)]))
        })
        return messages
      }

      if (typeof err === 'object') {
        const obj = err as Record<string, unknown>
        if ('message' in obj && typeof (obj as { message?: unknown }).message === 'string') {
          messages.push(`${path.join('.')} : ${(obj as { message: string }).message}`)
          return messages
        }
        Object.keys(obj).forEach((key) => {
          messages.push(...flattenErrors(obj[key], [...path, key]))
        })
        return messages
      }

      return messages
    }

    const errorMessages = flattenErrors(errors)

    toast.error(
      <div>
        <div className="font-bold mb-2">Erreurs de validation ({errorMessages.length}) :</div>
        <ul className="text-sm space-y-1">
          {(errorMessages.length > 0 ? errorMessages : ['Validation: Erreur de validation']).map((error: string, index: number) => (
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
          <div className="flex items-center justify-between gap-4">
            <div>
              <Button variant="outline" onClick={() => router.push("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </div>
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
              onSave={handleSaveClick}
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

      {/* Contenu principal avec padding ajusté */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Titre */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900">{`Demande d'achat Trio Pyrénées ${getStationName(demande.codeStation)}`}</h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            <StatusBadge status={demande.status} />
          </div>
        </div>

        {/* Contenu principal - Layout vertical */}
        <div className="space-y-6 px-6">
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
              <FinancialSummaryCard
                orderTotal={orderTotal}
                deliveryTotal={participationLivraison}
                billingFees={fraisFacturation}
                total={totalHT}
                modeEdition={modeEdition}
                register={register}
                watch={watch}
                setValue={setValue}
                errors={errors}
              />
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
            control={control}
            onAddItem={() => setAjoutArticle(true)}
            onCancelAddItem={annulerAjoutArticle}
            onDeleteItem={supprimerArticle}
            onConfirmAddItem={confirmerAjoutArticle}
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
          <div className="bg-white rounded-lg shadow p-6 mb-8">
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
