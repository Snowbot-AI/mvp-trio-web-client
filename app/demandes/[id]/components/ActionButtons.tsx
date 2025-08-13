import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Clock, Edit, Save, X, Download } from "lucide-react"
import { PurchaseRequestStatus } from "../../types"
import { DemandeFormData } from "../../validation-schema"
import { FieldErrors } from "react-hook-form"
import { toast } from "sonner"

interface ActionButtonsProps {
    demande: DemandeFormData
    modeEdition: boolean
    validationErrors: FieldErrors<DemandeFormData>
    isPending: boolean
    showRejectDialog: boolean
    showMoreInfoDialog: boolean
    rejectComment: string
    moreInfoComment: string
    onEdit: () => void
    onCancel: () => void
    onSave: () => void
    onStatusChange: (status: PurchaseRequestStatus) => void
    onRejectCommentChange: (comment: string) => void
    onMoreInfoCommentChange: (comment: string) => void
    onShowRejectDialogChange: (show: boolean) => void
    onShowMoreInfoDialogChange: (show: boolean) => void
    onExport: () => void
    onValidateAndSubmit?: () => void
}

export function ActionButtons({
    demande,
    modeEdition,
    validationErrors,
    isPending,
    showRejectDialog,
    showMoreInfoDialog,
    rejectComment,
    moreInfoComment,
    onEdit,
    onCancel,
    onSave,
    onStatusChange,
    onRejectCommentChange,
    onMoreInfoCommentChange,
    onShowRejectDialogChange,
    onShowMoreInfoDialogChange,
    onExport,
    onValidateAndSubmit,
}: ActionButtonsProps) {
    // Fonction pour vérifier s'il y a des erreurs de validation
    const hasValidationErrors = () => {
        // Vérifier s'il y a des erreurs dans les champs principaux
        const hasMainErrors = Object.keys(validationErrors).some(key =>
            key !== 'items' && validationErrors[key as keyof typeof validationErrors]
        )

        // Vérifier s'il y a des erreurs dans les articles
        const hasItemErrors = validationErrors.items &&
            Array.isArray(validationErrors.items) &&
            validationErrors.items.some(item => item && Object.keys(item).length > 0)

        return hasMainErrors || hasItemErrors
    }

    // Fonction pour compter le nombre d'erreurs de validation
    const getValidationErrorCount = () => {
        let count = 0

        // Compter les erreurs dans les champs principaux
        Object.keys(validationErrors).forEach(key => {
            if (key !== 'items' && validationErrors[key as keyof typeof validationErrors]) {
                count++
            }
        })

        // Compter les erreurs dans les articles
        if (validationErrors.items && Array.isArray(validationErrors.items)) {
            validationErrors.items.forEach(item => {
                if (item && Object.keys(item).length > 0) {
                    count++
                }
            })
        }

        return count
    }

    // Fonction pour obtenir la liste des erreurs de validation
    const getValidationErrorMessages = () => {
        const errors: string[] = []

        // Mapping des noms de champs pour plus de clarté
        const fieldNames: Record<string, string> = {
            from: 'Demandeur',
            billing: 'Facturation',
            provider: 'Fournisseur',
            delivery: 'Livraison',
            items: 'Articles',
            name: 'Nom',
            siret: 'SIRET',
            address: 'Adresse',
            emails: 'Emails',
            email: 'Email',
            tel: 'Téléphone',
            description: 'Désignation',
            service: 'Service',
            budgetType: 'Type de budget',
            quantity: 'Quantité',
            unitPrice: 'Prix unitaire',
            price: 'Prix'
        }

        // Récupérer les erreurs dans les champs principaux
        Object.keys(validationErrors).forEach(key => {
            const error = validationErrors[key as keyof typeof validationErrors]
            if (key === 'items' && Array.isArray(error)) {
                error.forEach((itemError, index) => {
                    if (itemError && Object.keys(itemError).length > 0) {
                        Object.keys(itemError).forEach(fieldKey => {
                            const fieldError = (itemError as Record<string, unknown>)[fieldKey]
                            if (fieldError && typeof fieldError === 'object' && fieldError !== null && 'message' in fieldError) {
                                const fieldName = fieldNames[fieldKey] || fieldKey
                                errors.push(`Article ${index + 1} - ${fieldName}: ${(fieldError as { message: string }).message}`)
                            }
                        })
                    }
                })
            } else if (error && typeof error === 'object' && 'message' in error) {
                const fieldName = fieldNames[key] || key
                errors.push(`${fieldName}: ${error.message}`)
            } else if (error && typeof error === 'object') {
                // Pour les objets imbriqués comme billing, provider, delivery
                Object.keys(error).forEach(subKey => {
                    const subError = (error as Record<string, unknown>)[subKey]
                    if (subError && typeof subError === 'object' && subError !== null && 'message' in subError) {
                        const sectionName = fieldNames[key] || key
                        const fieldName = fieldNames[subKey] || subKey
                        errors.push(`${sectionName} - ${fieldName}: ${(subError as { message: string }).message}`)
                    }
                })
            }
        })

        return errors
    }

    if (modeEdition) {
        return (
            <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" onClick={onCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                </Button>

                <Button
                    onClick={() => {
                        // En mode édition, on fait toujours la validation avant la sauvegarde
                        if (hasValidationErrors()) {
                            // Afficher les erreurs dans un toast détaillé
                            const errorMessages = getValidationErrorMessages()
                            toast.error(
                                <div>
                                    <div className="font-bold mb-2">Erreurs de validation ({errorMessages.length}) :</div>
                                    <ul className="text-sm space-y-1">
                                        {errorMessages.map((error, index) => (
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
                        } else {
                            onSave()
                        }
                    }}
                    disabled={isPending}
                    className={hasValidationErrors() ? 'bg-red-500 hover:bg-red-600' : ''}
                >
                    <Save className="h-4 w-4 mr-2" />
                    {isPending ? 'Sauvegarde...' :
                        hasValidationErrors() ? `Erreurs de validation (${getValidationErrorCount()})` : 'Sauvegarder'}
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* Actions selon le statut */}
            {demande.status === PurchaseRequestStatus.A_VERIFIER && (
                <div className="flex flex-wrap items-center gap-2">
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
                                <AlertDialogAction onClick={() => onStatusChange(PurchaseRequestStatus.VALIDEE)}>
                                    Confirmer l&apos;approbation
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog open={showRejectDialog} onOpenChange={onShowRejectDialogChange}>
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
                                    onChange={(e) => onRejectCommentChange(e.target.value)}
                                    placeholder="Veuillez expliquer la raison du rejet..."
                                    rows={3}
                                    className="mt-1"
                                />
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => {
                                    onShowRejectDialogChange(false)
                                    onRejectCommentChange("")
                                }}>
                                    Annuler
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => {
                                        if (rejectComment.trim()) {
                                            onStatusChange(PurchaseRequestStatus.REJETEE)
                                            onShowRejectDialogChange(false)
                                            onRejectCommentChange("")
                                        }
                                    }}
                                    disabled={!rejectComment.trim()}
                                >
                                    Confirmer le rejet
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog open={showMoreInfoDialog} onOpenChange={onShowMoreInfoDialogChange}>
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
                                    Commentaire (optionnel)
                                </Label>
                                <Textarea
                                    id="more-info-comment"
                                    value={moreInfoComment}
                                    onChange={(e) => onMoreInfoCommentChange(e.target.value)}
                                    placeholder="Vous pouvez préciser quelles informations supplémentaires sont nécessaires..."
                                    rows={3}
                                    className="mt-1"
                                />
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => {
                                    onShowMoreInfoDialogChange(false)
                                    onMoreInfoCommentChange("")
                                }}>
                                    Annuler
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        onStatusChange(PurchaseRequestStatus.A_MODIFIER)
                                        onShowMoreInfoDialogChange(false)
                                        onMoreInfoCommentChange("")
                                    }}
                                >
                                    Confirmer la demande
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}

            {/* Bouton Modifier - caché pour les statuts finaux */}
            {demande.status !== PurchaseRequestStatus.A_VERIFIER &&
                demande.status !== PurchaseRequestStatus.VALIDEE &&
                demande.status !== PurchaseRequestStatus.REJETEE && (
                    <Button onClick={onEdit}>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                    </Button>
                )}

            {/* Bouton Exporter - visible seulement pour les statuts finaux */}
            {(demande.status === PurchaseRequestStatus.VALIDEE || demande.status === PurchaseRequestStatus.REJETEE) && (
                <Button variant="outline" onClick={onExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Exporter PDF
                </Button>
            )}

            {(demande.status === PurchaseRequestStatus.BROUILLON || demande.status === PurchaseRequestStatus.A_MODIFIER) && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="outline"
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
                            <AlertDialogAction onClick={() => {
                                // En mode brouillon, utiliser la fonction de validation personnalisée
                                if (demande.status === PurchaseRequestStatus.BROUILLON && onValidateAndSubmit) {
                                    onValidateAndSubmit()
                                } else {
                                    // Pour les autres statuts, utiliser la fonction normale
                                    onStatusChange(PurchaseRequestStatus.A_VERIFIER)
                                }
                            }}>
                                Envoyer la demande
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    )
}
