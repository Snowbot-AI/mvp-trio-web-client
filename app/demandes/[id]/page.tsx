"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building,
  Euro,
  Tag,
  FileText,
  Upload,
  File,
  Trash2,
  Plus,
  Archive,
} from "lucide-react"
import type { Demande, StatusDemande } from "../types"
import { PurchaseRequestStatus, TrioService, getStationName } from "../types"
import { validateDemande } from "../validation-schema"
import { useDemande, useUpdateDemandeWithJsonFile } from "../hooks"
import { Badge } from "@/components/ui/badge"


export default function DetailDemande() {
  const router = useRouter()
  const params = useParams<{ id: string }>()

  // Utilisation de TanStack Query pour récupérer les vraies données
  const { data: demande, isLoading, error } = useDemande(params.id)
  const updateDemandeWithJsonFileMutation = useUpdateDemandeWithJsonFile()

  const [modeEdition, setModeEdition] = useState(false)
  const [ajoutArticle, setAjoutArticle] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showMoreInfoDialog, setShowMoreInfoDialog] = useState(false)
  const [rejectComment, setRejectComment] = useState("")
  const [moreInfoComment, setMoreInfoComment] = useState("")

  // React Hook Form avec validation en temps réel
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
  } = useForm<Demande>({
    mode: 'onChange', // Validation en temps réel
    defaultValues: demande || undefined
  })

  // État pour les erreurs de validation en temps réel
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})



  // Fonction de validation en temps réel
  const validateField = (fieldName: string, value: string | number) => {
    // Mettre à jour les données du formulaire
    setValue(fieldName as keyof Demande, value as keyof Demande, { shouldValidate: false })

    // Validation simple pour les champs obligatoires
    if (fieldName === "from") {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        setValidationErrors(prev => ({ ...prev, [fieldName]: "Le demandeur est requis" }))
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[fieldName]
          return newErrors
        })
      }
      return
    }

    // Pour les autres champs, utiliser la validation existante
    const currentData = watch()
    const dataToValidate = { ...currentData } as Record<string, unknown>

    // Gérer les champs imbriqués (ex: billing.siret)
    if (fieldName.includes('.')) {
      const parts = fieldName.split('.')
      let current = dataToValidate as Record<string, unknown>
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {}
        }
        current = current[parts[i]] as Record<string, unknown>
      }
      current[parts[parts.length - 1]] = value
    } else {
      (dataToValidate as Record<string, unknown>)[fieldName] = value
    }

    const validation = validateDemande(dataToValidate)
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {}
      validation.error.issues.forEach((issue) => {
        const path = issue.path.join('.')
        if (path === fieldName || path.startsWith(fieldName + '.')) {
          fieldErrors[fieldName] = issue.message
        }
      })
      setValidationErrors(prev => ({ ...prev, ...fieldErrors }))
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  // Fonction de validation spécifique pour les champs avec regex
  const validateRegexField = (fieldName: string, value: string, regex: RegExp, errorMessage: string) => {
    // Mettre à jour les données du formulaire
    setValue(fieldName as keyof Demande, value, { shouldValidate: false })

    // Si le champ est vide, on ne valide pas (pas d'erreur)
    if (!value || value.trim() === '') {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
      return
    }

    // Si le champ a une valeur, on valide avec la regex
    if (!regex.test(value)) {
      setValidationErrors(prev => ({ ...prev, [fieldName]: errorMessage }))
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  // Fonction de validation pour les emails
  const validateEmailField = (fieldName: string, value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    // Mettre à jour les données du formulaire
    setValue(fieldName as keyof Demande, value, { shouldValidate: false })

    // Si le champ est vide, on ne valide pas (pas d'erreur)
    if (!value || value.trim() === '') {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
      return
    }

    // Si le champ a une valeur, on valide avec la regex
    if (!emailRegex.test(value)) {
      setValidationErrors(prev => ({ ...prev, [fieldName]: "Format d'email invalide" }))
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  // Fonction pour nettoyer toutes les erreurs de validation
  const clearValidationErrors = () => {
    setValidationErrors({})
  }

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

  const gererSauvegarde = (data: Demande) => {
    // Nettoyer les erreurs de validation avant la sauvegarde
    clearValidationErrors()

    // Si un article est en cours d'ajout, l'inclure dans les données
    const dataToSave = { ...data }
    if (ajoutArticle) {
      const currentItems = data.items || []
      const newItemIndex = currentItems.length

      const description = watch(`items.${newItemIndex}.description`) || ""
      const service = watch(`items.${newItemIndex}.service`) || ""
      const quantity = watch(`items.${newItemIndex}.quantity`) || 0
      const unitPrice = watch(`items.${newItemIndex}.unitPrice`) || 0
      const price = watch(`items.${newItemIndex}.price`) || 0

      // N'ajouter l'article que s'il a au moins une description et un service
      if (description.trim() && service.trim()) {
        const nouvelArticle = {
          description: description,
          service: service,
          budgetType: watch(`items.${newItemIndex}.budgetType`) || "B",
          itemType: watch(`items.${newItemIndex}.itemType`) || null,
          referenceDevis: watch(`items.${newItemIndex}.referenceDevis`) || undefined,
          quantity: quantity,
          unitPrice: unitPrice,
          price: price,
        }

        dataToSave.items = [...currentItems, nouvelArticle]
      } else {
        // Si l'article n'est pas complet, ne pas l'ajouter
        dataToSave.items = currentItems
      }
    }



    // Extraire les fichiers uploadés
    const files = watch("files") || []
    const filesToUpload = files.filter((file) => file.file).map((file) => file.file)

    // Utiliser l'approche avec fichier JSON (équivalente à curl)
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

    // Utiliser l'approche avec fichier JSON pour le changement de statut
    // Pas de fichiers pour le changement de statut, juste les données
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

  const gererUploadFichier = (event: React.ChangeEvent<HTMLInputElement>, category: string = "quotations") => {
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

  const gererSuppressionFichier = (idFichier: string) => {
    const currentFiles = watch("files") || []
    const updatedFiles = currentFiles.filter((f) => f.id !== idFichier)

    // Mettre à jour le formulaire
    const currentData = watch()
    reset({ ...currentData, files: updatedFiles })
  }

  const [fichierASupprimer, setFichierASupprimer] = useState<{ id: string; name: string } | null>(null)

  const confirmerSuppressionFichier = () => {
    if (fichierASupprimer) {
      gererSuppressionFichier(fichierASupprimer.id)
      setFichierASupprimer(null)
    }
  }




  const supprimerArticle = (index: number) => {
    const currentData = watch()
    const updatedItems = currentData.items?.filter((_, i) => i !== index) || []
    setValue('items', updatedItems)
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
    // Vérifier si c'est une erreur 404 (demande non trouvée)
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

  // Ajout de la fonction utilitaire pour le label du statut (à placer en haut du fichier ou importer si déjà présent)
  const getLibelleStatut = (statut: PurchaseRequestStatus) => {
    switch (statut) {
      case PurchaseRequestStatus.BROUILLON:
        return "Brouillon"
      case PurchaseRequestStatus.A_VERIFIER:
        return "À vérifier"
      case PurchaseRequestStatus.A_MODIFIER:
        return "À modifier"
      case PurchaseRequestStatus.VALIDEE:
        return "Validée"
      case PurchaseRequestStatus.REJETEE:
        return "Rejetée"
      case PurchaseRequestStatus.EXPORTEE:
        return "Exportée"
      default:
        return statut
    }
  }

  // Ajout des fonctions utilitaires pour l'affichage du statut (après les imports)
  const getIconeStatut = (statut: PurchaseRequestStatus) => {
    switch (statut) {
      case PurchaseRequestStatus.VALIDEE:
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case PurchaseRequestStatus.REJETEE:
        return <XCircle className="h-4 w-4 text-red-600" />
      case PurchaseRequestStatus.A_VERIFIER:
        return <Clock className="h-4 w-4 text-blue-600" />
      case PurchaseRequestStatus.A_MODIFIER:
        return <Edit className="h-4 w-4 text-orange-600" />
      case PurchaseRequestStatus.EXPORTEE:
        return <Archive className="h-4 w-4 text-purple-600" />
      case PurchaseRequestStatus.BROUILLON:
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getCouleurStatut = (statut: PurchaseRequestStatus) => {
    switch (statut) {
      case PurchaseRequestStatus.VALIDEE:
        return "bg-green-100 text-green-800 border-green-200"
      case PurchaseRequestStatus.REJETEE:
        return "bg-red-100 text-red-800 border-red-200"
      case PurchaseRequestStatus.A_VERIFIER:
        return "bg-blue-100 text-blue-800 border-blue-200"
      case PurchaseRequestStatus.A_MODIFIER:
        return "bg-orange-100 text-orange-800 border-orange-200"
      case PurchaseRequestStatus.EXPORTEE:
        return "bg-purple-100 text-purple-800 border-purple-200"
      case PurchaseRequestStatus.BROUILLON:
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
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
            {/* Actions selon le statut */}
            {!modeEdition && demande.status === PurchaseRequestStatus.A_VERIFIER && (
              <div className="flex items-center gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approuver
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Approuver la demande</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir approuver cette demande d&apos;achat ? Cette action ne peut pas être
                        annulée.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => gererChangementStatut(PurchaseRequestStatus.VALIDEE)}>
                        Confirmer l&apos;approbation
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Rejeter la demande</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir rejeter cette demande d&apos;achat ? Cette action ne peut pas être
                        annulée. Si oui veuillez préciser la raison du rejet.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <Label htmlFor="reject-comment" className="text-sm font-medium">
                        Commentaire obligatoire *
                      </Label>
                      <Textarea
                        id="reject-comment"
                        value={rejectComment}
                        onChange={(e) => setRejectComment(e.target.value)}
                        placeholder="Veuillez expliquer la raison du rejet..."
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => {
                        setShowRejectDialog(false)
                        setRejectComment("")
                      }}>
                        Annuler
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => {
                          if (rejectComment.trim()) {
                            gererChangementStatut(PurchaseRequestStatus.REJETEE)
                            setShowRejectDialog(false)
                            setRejectComment("")
                          }
                        }}
                        disabled={!rejectComment.trim()}
                      >
                        Confirmer le rejet
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={showMoreInfoDialog} onOpenChange={setShowMoreInfoDialog}>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">
                      <Clock className="h-4 w-4 mr-2" />
                      Demander plus d&apos;info
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Demander plus d&apos;informations</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir demander plus d&apos;informations sur cette demande d&apos;achat ? Si oui veuillez préciser quelles informations supplémentaires sont nécessaires.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <Label htmlFor="more-info-comment" className="text-sm font-medium">
                        Commentaire obligatoire *
                      </Label>
                      <Textarea
                        id="more-info-comment"
                        value={moreInfoComment}
                        onChange={(e) => setMoreInfoComment(e.target.value)}
                        placeholder="Veuillez préciser quelles informations supplémentaires sont nécessaires..."
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => {
                        setShowMoreInfoDialog(false)
                        setMoreInfoComment("")
                      }}>
                        Annuler
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          if (moreInfoComment.trim()) {
                            gererChangementStatut(PurchaseRequestStatus.A_MODIFIER)
                            setShowMoreInfoDialog(false)
                            setMoreInfoComment("")
                          }
                        }}
                        disabled={!moreInfoComment.trim()}
                      >
                        Confirmer la demande
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {modeEdition ? (
              <>
                <Button variant="outline" onClick={gererAnnulation}>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>

                <Button
                  onClick={handleSubmit(gererSauvegarde)}
                  disabled={updateDemandeWithJsonFileMutation.isPending || Object.keys(validationErrors).length > 0}
                  className={Object.keys(validationErrors).length > 0 ? 'bg-red-500 hover:bg-red-600' : ''}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateDemandeWithJsonFileMutation.isPending ? 'Sauvegarde...' :
                    Object.keys(validationErrors).length > 0 ? 'Erreurs de validation' : 'Sauvegarder'}
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {demande.status !== PurchaseRequestStatus.A_VERIFIER && (
                  <Button onClick={() => setModeEdition(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                )}

                {(demande.status === PurchaseRequestStatus.BROUILLON || demande.status === PurchaseRequestStatus.A_MODIFIER) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={!demande.items || demande.items.length === 0}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Soumettre
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Soumettre la demande</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir soumettre cette demande d&apos;achat pour validation ? Cette action ne peut pas être
                          annulée.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => gererChangementStatut(PurchaseRequestStatus.A_VERIFIER)}>
                          Envoyer la demande
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Titre */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900">{`Demande d'achat Trio Pyrénées ${getStationName(demande.codeStation)}`}</h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            {getIconeStatut(demande.status)}
            <Badge variant="outline" className={getCouleurStatut(demande.status)}>
              {getLibelleStatut(demande.status)}
            </Badge>
          </div>
        </div>

        {/* Contenu principal - Cartes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Demandeur *</Label>
                  {modeEdition ? (
                    <Input
                      {...register("from")}
                      className={`mt-1 ${validationErrors.from ? 'border-red-500' : ''}`}
                      onBlur={(e) => validateField("from", e.target.value)}
                      onChange={(e) => validateField("from", e.target.value)}
                    />
                  ) : (
                    <p className="mt-1">{demande.from}</p>
                  )}
                  {validationErrors.from && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.from}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  {modeEdition ? (
                    <Textarea
                      {...register("description")}
                      rows={3}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-gray-700 mt-1">{demande.description || "Aucune description"}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Date de la demande</Label>
                    <p className="mt-1">{new Date(demande.date).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Date de livraison souhaitée</Label>
                    {modeEdition ? (
                      <Input
                        type="date"
                        {...register("deliveryDate")}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1">{demande.deliveryDate ? new Date(demande.deliveryDate).toLocaleDateString("fr-FR") : "Non spécifié"}</p>
                    )}
                  </div>
                </div>




              </CardContent>
            </Card>

            {/* Articles commandés */}
            <div className="lg:col-span-3">
              <Card >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="h-6 w-6" />
                      Articles commandés
                    </div>
                    {modeEdition && (
                      <Button size="sm" onClick={() => setAjoutArticle(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>BudgetType</TableHead>
                        <TableHead>Désignation</TableHead>
                        <TableHead>Qté</TableHead>
                        <TableHead>Prix unit.</TableHead>
                        <TableHead>Montant</TableHead>
                        {modeEdition && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((article, index) => (
                        <TableRow key={article.id}>
                          <TableCell>{article.service}</TableCell>
                          <TableCell>{article.budgetType}</TableCell>
                          <TableCell>{article.description}</TableCell>
                          <TableCell>{article.quantity}</TableCell>
                          <TableCell>{article.unitPrice ? article.unitPrice.toFixed(2) : '0.00'} €</TableCell>
                          <TableCell className="font-medium">{article.price ? article.price.toFixed(2) : '0.00'} €</TableCell>
                          {modeEdition && (
                            <TableCell>
                              <Button size="sm" variant="destructive" onClick={() => supprimerArticle(index)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}

                      {ajoutArticle && (
                        <TableRow>
                          <TableCell>
                            <Select
                              onValueChange={(value) => {
                                setValue(`items.${items.length}.service`, value)
                                validateField(`items.${items.length}.service`, value)
                              }}
                            >
                              <SelectTrigger className={validationErrors[`items.${items.length}.service`] ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Sélectionner un service" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(TrioService).map(([key, value]) => {
                                  const labels: Record<string, string> = {
                                    ACC: 'Accueil',
                                    ADM: 'Admin',
                                    BAT: 'Bâtiment',
                                    BIL: 'Billetterie',
                                    COM: 'Communication commerciale',
                                    DAM: 'Dammage',
                                    PAR: 'Parc de roulage',
                                    PIS: 'Pistes',
                                    REST: 'Restaurant',
                                    RM: 'Remontée mécanique',
                                    USI: 'Snowmaker (Usine à neige)',
                                    AUT: 'Autre'
                                  }
                                  return (
                                    <SelectItem key={key} value={value}>
                                      {key} - {labels[key]}
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                            {validationErrors[`items.${items.length}.service`] && (
                              <p className="text-red-500 text-xs mt-1">{validationErrors[`items.${items.length}.service`]}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="BudgetType (ex: B29, B105, H)"
                              {...register(`items.${items.length}.budgetType`)}
                              className={validationErrors[`items.${items.length}.budgetType`] ? 'border-red-500' : ''}
                              onBlur={(e) => validateRegexField(`items.${items.length}.budgetType`, e.target.value, /^(B\d{1,4}|H)$/, "Le type de budget doit être 'H' ou correspondre au format 'B29', 'B105', etc.")}
                              onChange={(e) => {
                                // Validation immédiate à chaque changement
                                validateRegexField(`items.${items.length}.budgetType`, e.target.value, /^(B\d{1,4}|H)$/, "Le type de budget doit être 'H' ou correspondre au format 'B29', 'B105', etc.")
                              }}
                            />
                            {validationErrors[`items.${items.length}.budgetType`] && (
                              <p className="text-red-500 text-xs mt-1">{validationErrors[`items.${items.length}.budgetType`]}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Désignation"
                              {...register(`items.${items.length}.description`)}
                              className={validationErrors[`items.${items.length}.description`] ? 'border-red-500' : ''}
                              onBlur={(e) => validateField(`items.${items.length}.description`, e.target.value)}
                              onChange={(e) => {
                                if (validationErrors[`items.${items.length}.description`]) {
                                  validateField(`items.${items.length}.description`, e.target.value)
                                }
                              }}
                            />
                            {validationErrors[`items.${items.length}.description`] && (
                              <p className="text-red-500 text-xs mt-1">{validationErrors[`items.${items.length}.description`]}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              placeholder="1"
                              {...register(`items.${items.length}.quantity`, { valueAsNumber: true })}
                              className={validationErrors[`items.${items.length}.quantity`] ? 'border-red-500' : ''}
                              onBlur={(e) => validateField(`items.${items.length}.quantity`, Number(e.target.value))}
                              onChange={(e) => {
                                let quantity = Number(e.target.value) || 0

                                // Empêcher les valeurs négatives
                                if (quantity < 0) {
                                  quantity = 0
                                  setValue(`items.${items.length}.quantity`, 0)
                                }

                                const unitPrice = watch(`items.${items.length}.unitPrice`) || 0
                                const calculatedPrice = quantity * unitPrice

                                setValue(`items.${items.length}.price`, calculatedPrice)

                                if (validationErrors[`items.${items.length}.quantity`]) {
                                  validateField(`items.${items.length}.quantity`, quantity)
                                }
                              }}
                            />
                            {validationErrors[`items.${items.length}.quantity`] && (
                              <p className="text-red-500 text-xs mt-1">{validationErrors[`items.${items.length}.quantity`]}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              {...register(`items.${items.length}.unitPrice`, { valueAsNumber: true })}
                              className={validationErrors[`items.${items.length}.unitPrice`] ? 'border-red-500' : ''}
                              onBlur={(e) => validateField(`items.${items.length}.unitPrice`, Number(e.target.value))}
                              onChange={(e) => {
                                let unitPrice = Number(e.target.value) || 0

                                // Empêcher les valeurs négatives
                                if (unitPrice < 0) {
                                  unitPrice = 0
                                  setValue(`items.${items.length}.unitPrice`, 0)
                                }

                                const quantity = watch(`items.${items.length}.quantity`) || 0
                                const calculatedPrice = quantity * unitPrice

                                setValue(`items.${items.length}.price`, calculatedPrice)

                                if (validationErrors[`items.${items.length}.unitPrice`]) {
                                  validateField(`items.${items.length}.unitPrice`, unitPrice)
                                }
                              }}
                            />
                            {validationErrors[`items.${items.length}.unitPrice`] && (
                              <p className="text-red-500 text-xs mt-1">{validationErrors[`items.${items.length}.unitPrice`]}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              readOnly
                              value={((watch(`items.${items.length}.quantity`) || 0) * (watch(`items.${items.length}.unitPrice`) || 0)).toFixed(2)}
                              {...register(`items.${items.length}.price`, { valueAsNumber: true })}
                              className="bg-gray-50"
                            />
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => setAjoutArticle(false)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Informations de facturation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informations de facturation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Nom de facturation *</Label>
                    {modeEdition ? (
                      <Input
                        {...register("billing.name")}
                        className={`mt-1 ${validationErrors['billing.name'] ? 'border-red-500' : ''}`}
                        onBlur={(e) => validateField("billing.name", e.target.value)}
                        onChange={(e) => {
                          if (validationErrors['billing.name']) {
                            validateField("billing.name", e.target.value)
                          }
                        }}
                      />
                    ) : (
                      <p className="mt-1 font-medium">{demande.billing.name}</p>
                    )}
                    {validationErrors['billing.name'] && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors['billing.name']}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium">SIRET *</Label>
                    {modeEdition ? (
                      <Input
                        {...register("billing.siret")}
                        placeholder="12345678901234"
                        className={`mt-1 ${validationErrors['billing.siret'] ? 'border-red-500' : ''}`}
                        onBlur={(e) => validateRegexField("billing.siret", e.target.value, /^\d{14}$/, "Le SIRET doit contenir 14 chiffres")}
                        onChange={(e) => {
                          // Validation immédiate à chaque changement
                          validateRegexField("billing.siret", e.target.value, /^\d{14}$/, "Le SIRET doit contenir 14 chiffres")
                        }}
                      />
                    ) : (
                      <p className="mt-1">{demande.billing.siret}</p>
                    )}
                    {validationErrors['billing.siret'] && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors['billing.siret']}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Adresse de facturation *</Label>
                  {modeEdition ? (
                    <Textarea
                      {...register("billing.address")}
                      rows={2}
                      className={`mt-1 ${validationErrors['billing.address'] ? 'border-red-500' : ''}`}
                      onBlur={(e) => validateField("billing.address", e.target.value)}
                      onChange={(e) => {
                        if (validationErrors['billing.address']) {
                          validateField("billing.address", e.target.value)
                        }
                      }}
                    />
                  ) : (
                    <p className="mt-1">{demande.billing.address}</p>
                  )}
                  {validationErrors['billing.address'] && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors['billing.address']}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Email de facturation *</Label>
                  {modeEdition ? (
                    <Input
                      type="email"
                      {...register("billing.emails.0")}
                      className={`mt-1 ${validationErrors['billing.emails.0'] ? 'border-red-500' : ''}`}
                      onBlur={(e) => validateEmailField("billing.emails.0", e.target.value)}
                      onChange={(e) => {
                        // Validation immédiate à chaque changement
                        validateEmailField("billing.emails.0", e.target.value)
                      }}
                    />
                  ) : (
                    <p className="mt-1">{demande.billing.emails[0]}</p>
                  )}
                  {validationErrors['billing.emails.0'] && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors['billing.emails.0']}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informations fournisseur */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informations fournisseur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Nom du fournisseur *</Label>
                    {modeEdition ? (
                      <Input
                        {...register("provider.name")}
                        className={`mt-1 ${validationErrors['provider.name'] ? 'border-red-500' : ''}`}
                        onBlur={(e) => validateField("provider.name", e.target.value)}
                        onChange={(e) => {
                          if (validationErrors['provider.name']) {
                            validateField("provider.name", e.target.value)
                          }
                        }}
                      />
                    ) : (
                      <p className="mt-1 font-medium">{demande.provider.name}</p>
                    )}
                    {validationErrors['provider.name'] && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors['provider.name']}</p>
                    )}
                  </div>


                </div>

                <div>
                  <Label className="text-sm font-medium">Adresse *</Label>
                  {modeEdition ? (
                    <Textarea
                      {...register("provider.address")}
                      rows={2}
                      className={`mt-1 ${validationErrors['provider.address'] ? 'border-red-500' : ''}`}
                      onBlur={(e) => validateField("provider.address", e.target.value)}
                      onChange={(e) => {
                        if (validationErrors['provider.address']) {
                          validateField("provider.address", e.target.value)
                        }
                      }}
                    />
                  ) : (
                    <p className="mt-1">{demande.provider.address}</p>
                  )}
                  {validationErrors['provider.address'] && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors['provider.address']}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  {modeEdition ? (
                    <Input
                      type="email"
                      {...register("provider.email")}
                      className={`mt-1 ${validationErrors['provider.email'] ? 'border-red-500' : ''}`}
                      onBlur={(e) => validateEmailField("provider.email", e.target.value)}
                      onChange={(e) => {
                        // Validation immédiate à chaque changement
                        validateEmailField("provider.email", e.target.value)
                      }}
                    />
                  ) : (
                    <p className="mt-1">{demande.provider.email || "Non spécifié"}</p>
                  )}
                  {validationErrors['provider.email'] && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors['provider.email']}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Téléphone</Label>
                  {modeEdition ? (
                    <Input
                      {...register("provider.tel")}
                      placeholder="06 12 34 56 78"
                      className={`mt-1 ${validationErrors['provider.tel'] ? 'border-red-500' : ''}`}
                      onBlur={(e) => validateRegexField("provider.tel", e.target.value, /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, "Format de téléphone invalide")}
                      onChange={(e) => {
                        // Validation immédiate à chaque changement
                        validateRegexField("provider.tel", e.target.value, /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, "Format de téléphone invalide (ex: 06 12 34 56 78 ou +33 6 12 34 56 78)")
                      }}
                    />
                  ) : (
                    <p className="mt-1">{demande.provider.tel || "Non spécifié"}</p>
                  )}
                  {validationErrors['provider.tel'] && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors['provider.tel']}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informations de livraison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informations de livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Adresse de livraison *</Label>
                  {modeEdition ? (
                    <Textarea
                      {...register("delivery.address")}
                      rows={2}
                      className={`mt-1 ${validationErrors['delivery.address'] ? 'border-red-500' : ''}`}
                      onBlur={(e) => validateField("delivery.address", e.target.value)}
                      onChange={(e) => {
                        if (validationErrors['delivery.address']) {
                          validateField("delivery.address", e.target.value)
                        }
                      }}
                    />
                  ) : (
                    <p className="mt-1">{demande.delivery.address}</p>
                  )}
                  {validationErrors['delivery.address'] && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors['delivery.address']}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Téléphone de livraison *</Label>
                  {modeEdition ? (
                    <Input
                      {...register("delivery.tel")}
                      placeholder="06 12 34 56 78"
                      className={`mt-1 ${validationErrors['delivery.tel'] ? 'border-red-500' : ''}`}
                      onBlur={(e) => validateRegexField("delivery.tel", e.target.value, /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, "Format de téléphone invalide (ex: 06 12 34 56 78 ou +33 6 12 34 56 78)")}
                      onChange={(e) => {
                        // Validation immédiate à chaque changement
                        validateRegexField("delivery.tel", e.target.value, /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, "Format de téléphone invalide (ex: 06 12 34 56 78 ou +33 6 12 34 56 78)")
                      }}
                    />
                  ) : (
                    <p className="mt-1">{demande.delivery.tel}</p>
                  )}
                  {validationErrors['delivery.tel'] && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors['delivery.tel']}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Devis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <File className="h-5 w-5" />
                  Devis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {modeEdition && (
                  <div>
                    <Label htmlFor="upload-quotations" className="text-sm font-medium">
                      Ajouter des devis
                    </Label>
                    <div className="mt-2">
                      <input
                        id="upload-quotations"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => gererUploadFichier(e, "quotations")}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById("upload-quotations")?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Ajouter des devis
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {watch("files")?.filter((fichier) => fichier.category === "quotations").map((fichier) => (
                    <div key={fichier.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <File className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{fichier.name}</p>
                          <p className="text-sm text-gray-500">{new Date(fichier.uploadInstant).toLocaleDateString("fr-FR")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          Télécharger
                        </Button>
                        {modeEdition && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setFichierASupprimer({ id: fichier.id, name: fichier.name })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {(!watch("files") || watch("files")?.filter((fichier) => fichier.category === "quotations").length === 0) && (
                    <p className="text-gray-500 text-center py-4">Aucun devis</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Factures */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <File className="h-5 w-5" />
                  Factures
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {modeEdition && (
                  <div>
                    <Label htmlFor="upload-invoices" className="text-sm font-medium">
                      Ajouter des factures
                    </Label>
                    <div className="mt-2">
                      <input
                        id="upload-invoices"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => gererUploadFichier(e, "invoices")}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById("upload-invoices")?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Ajouter des factures
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {watch("files")?.filter((fichier) => fichier.category === "invoices").map((fichier) => (
                    <div key={fichier.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <File className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{fichier.name}</p>
                          <p className="text-sm text-gray-500">{new Date(fichier.uploadInstant).toLocaleDateString("fr-FR")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          Télécharger
                        </Button>
                        {modeEdition && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setFichierASupprimer({ id: fichier.id, name: fichier.name })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {(!watch("files") || watch("files")?.filter((fichier) => fichier.category === "invoices").length === 0) && (
                    <p className="text-gray-500 text-center py-4">Aucune facture</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Totaux */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Récapitulatif financier
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Total commande HT :</span>
                  <span className="font-medium">{demande.total.orderTotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Participation livraison :</span>
                  <span className="font-medium">{demande.total.deliveryTotal?.toFixed(2) || "0.00"} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Frais de facturation :</span>
                  <span className="font-medium">{demande.total.billingFees?.toFixed(2) || "0.00"} €</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total HT :</span>
                  <span className="text-green-600">{demande.total.total.toFixed(2)} €</span>
                </div>
              </CardContent>
            </Card>

            {/* Informations du demandeur */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Demandeur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nom</Label>
                  <p className="font-medium">{demande.from}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Département</Label>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span>{demande.billing.name}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Signature demandeur</Label>
                  <div className="flex items-center gap-2">
                    {demande.signatureDemandeur ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span>{demande.signatureDemandeur ? "Signée" : "Non signée"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commentaire */}
            {demande.comment && (
              <Card>
                <CardHeader>
                  <CardTitle>Commentaire</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{demande.comment}</p>
                </CardContent>
              </Card>
            )}


          </div>
        </div>



        {/* Popup de confirmation pour la suppression de fichiers */}
        <AlertDialog open={!!fichierASupprimer} onOpenChange={(open) => !open && setFichierASupprimer(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer le fichier</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer le fichier &quot;{fichierASupprimer?.name}&quot; ?
                Cette action ne peut pas être annulée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setFichierASupprimer(null)}>
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmerSuppressionFichier}
                className="bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>


      <Toaster
        // richColors
        closeButton
        position="bottom-right"
      />
    </div>
  )
}
