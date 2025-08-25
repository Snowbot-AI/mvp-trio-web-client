import * as React from "react"
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
import { CheckCircle, XCircle, Clock, Edit, Save, X, Download, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PurchaseRequestStatus } from "../../types"
import { DemandeFormData } from "../../validation-schema"
import { FieldErrors } from "react-hook-form"

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
    onExportZip: () => void
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
    onExportZip,
    onValidateAndSubmit,
}: ActionButtonsProps) {
    // Fonction pour vérifier s'il y a des erreurs de validation
    const hasValidationErrors = () => {
        // En mode brouillon, on ignore les erreurs de validation
        if (demande.status === PurchaseRequestStatus.BROUILLON) {
            return false
        }
        return getValidationErrorCount() > 0
    }

    // Fonction pour compter le nombre d'erreurs de validation
    const getValidationErrorCount = () => {
        let count = 0

        Object.keys(validationErrors).forEach(key => {
            const error = validationErrors[key as keyof typeof validationErrors]

            if (key === 'items' && Array.isArray(error)) {
                error.forEach((itemError) => {
                    if (!itemError || typeof itemError !== 'object') {
                        return
                    }
                    Object.keys(itemError).forEach((fieldKey) => {
                        const fieldError = (itemError as Record<string, unknown>)[fieldKey]
                        if (fieldError && typeof fieldError === 'object' && 'message' in fieldError) {
                            count++
                        }
                    })
                })
                return
            }

            if (error && typeof error === 'object' && 'message' in error) {
                count++
                return
            }

            if (error && typeof error === 'object') {
                Object.keys(error).forEach((subKey) => {
                    const subError = (error as Record<string, unknown>)[subKey]
                    if (subError && typeof subError === 'object' && 'message' in subError) {
                        count++
                    }
                })
            }
        })

        return count
    }


    if (modeEdition) {
        return (
            <div className="flex w-full items-center justify-end">
                <div className="hidden md:flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={onCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Annuler
                    </Button>

                    <Button
                        onClick={onSave}
                        disabled={isPending}
                        className={hasValidationErrors() && demande.status !== PurchaseRequestStatus.BROUILLON ? 'bg-red-500 hover:bg-red-600' : ''}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {isPending ? 'Sauvegarde...' :
                            demande.status === PurchaseRequestStatus.BROUILLON ? 'Sauvegarder brouillon' :
                                hasValidationErrors() ? `Erreurs de validation (${getValidationErrorCount()})` : 'Sauvegarder'}
                    </Button>
                </div>
                <div className="md:hidden flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        aria-label="Annuler"
                        title="Annuler"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    <Button
                        onClick={onSave}
                        disabled={isPending}
                        aria-label={isPending ? 'Sauvegarde…' : (demande.status === PurchaseRequestStatus.BROUILLON ? 'Sauvegarder brouillon' : (hasValidationErrors() ? `Erreurs de validation (${getValidationErrorCount()})` : 'Sauvegarder'))}
                        title={isPending ? 'Sauvegarde…' : (demande.status === PurchaseRequestStatus.BROUILLON ? 'Sauvegarder brouillon' : (hasValidationErrors() ? `Erreurs de validation (${getValidationErrorCount()})` : 'Sauvegarder'))}
                        className={hasValidationErrors() && demande.status !== PurchaseRequestStatus.BROUILLON ? 'bg-red-500 hover:bg-red-600' : ''}
                    >
                        <Save className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex w-full items-center justify-end gap-2">
            <div className="hidden md:flex flex-wrap items-center gap-2 justify-end">
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

                {/* Bouton Modifier - caché pour certains statuts */}
                {demande.status !== PurchaseRequestStatus.A_VERIFIER &&
                    demande.status !== PurchaseRequestStatus.VALIDEE &&
                    demande.status !== PurchaseRequestStatus.REJETEE &&
                    demande.status !== PurchaseRequestStatus.EXPORTEE && (
                        <Button onClick={onEdit}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                        </Button>
                    )}

                {/* Boutons d'export - visibles en SUIVI_COMPTA et REJETEE */}
                {(demande.status === PurchaseRequestStatus.SUIVI_COMPTA || demande.status === PurchaseRequestStatus.REJETEE) && (
                    <>
                        <Button variant="outline" onClick={onExport}>
                            <Download className="h-4 w-4 mr-2" />
                            Exporter PDF
                        </Button>
                        {demande.status === PurchaseRequestStatus.SUIVI_COMPTA && (
                            <Button variant="outline" onClick={onExportZip}>
                                <Download className="h-4 w-4 mr-2" />
                                Exporter ZIP
                            </Button>
                        )}
                    </>
                )}

                {/* Bouton passer en Suivi Compta quand Validée */}
                {demande.status === PurchaseRequestStatus.VALIDEE && (
                    <>
                        <Button variant="outline" onClick={onExport}>
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger le PDF
                        </Button>
                        <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => onStatusChange(PurchaseRequestStatus.SUIVI_COMPTA)}>
                            <Clock className="h-4 w-4 mr-2" />
                            Passer en Suivi compta
                        </Button>
                    </>
                )}

                {/* Bouton marquer comme Exportée quand en Suivi Compta */}
                {demande.status === PurchaseRequestStatus.SUIVI_COMPTA && (
                    <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => onStatusChange(PurchaseRequestStatus.EXPORTEE)}>
                        Marquer comme exportée
                    </Button>
                )}

                {/* Bouton revenir en Suivi Compta quand Exportée */}
                {demande.status === PurchaseRequestStatus.EXPORTEE && (
                    <Button variant="outline" onClick={() => onStatusChange(PurchaseRequestStatus.SUIVI_COMPTA)}>
                        <Clock className="h-4 w-4 mr-2" />
                        Revenir en Suivi compta
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

            {/* Mobile menu */}
            <div className="md:hidden flex items-center gap-2">
                {demande.status !== PurchaseRequestStatus.A_VERIFIER &&
                    demande.status !== PurchaseRequestStatus.VALIDEE &&
                    demande.status !== PurchaseRequestStatus.REJETEE &&
                    demande.status !== PurchaseRequestStatus.EXPORTEE && (
                        <Button onClick={onEdit}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                        </Button>
                    )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {demande.status === PurchaseRequestStatus.A_VERIFIER && (
                            <>
                                <DropdownMenuItem onSelect={() => { onStatusChange(PurchaseRequestStatus.VALIDEE) }}>
                                    <span className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Approuver
                                    </span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => { onShowRejectDialogChange(true) }}>
                                    <span className="flex items-center gap-2">
                                        <XCircle className="h-4 w-4" />
                                        Rejeter
                                    </span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => { onShowMoreInfoDialogChange(true) }}>
                                    <span className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Demander plus d&apos;info
                                    </span>
                                </DropdownMenuItem>
                            </>
                        )}

                        {(demande.status === PurchaseRequestStatus.SUIVI_COMPTA || demande.status === PurchaseRequestStatus.REJETEE) && (
                            <>
                                <DropdownMenuItem onSelect={onExport}>
                                    <span className="flex items-center gap-2">
                                        <Download className="h-4 w-4" />
                                        Exporter PDF
                                    </span>
                                </DropdownMenuItem>
                                {demande.status === PurchaseRequestStatus.SUIVI_COMPTA && (
                                    <DropdownMenuItem onSelect={onExportZip}>
                                        <span className="flex items-center gap-2">
                                            <Download className="h-4 w-4" />
                                            Exporter ZIP
                                        </span>
                                    </DropdownMenuItem>
                                )}
                            </>
                        )}

                        {demande.status === PurchaseRequestStatus.VALIDEE && (
                            <>
                                <DropdownMenuItem onSelect={onExport}>
                                    <span className="flex items-center gap-2">
                                        <Download className="h-4 w-4" />
                                        Télécharger le PDF
                                    </span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => { onStatusChange(PurchaseRequestStatus.SUIVI_COMPTA) }}>
                                    <span className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Passer en Suivi compta
                                    </span>
                                </DropdownMenuItem>
                            </>
                        )}

                        {demande.status === PurchaseRequestStatus.SUIVI_COMPTA && (
                            <DropdownMenuItem onSelect={() => { onStatusChange(PurchaseRequestStatus.EXPORTEE) }}>
                                Marquer comme exportée
                            </DropdownMenuItem>
                        )}

                        {demande.status === PurchaseRequestStatus.EXPORTEE && (
                            <DropdownMenuItem onSelect={() => { onStatusChange(PurchaseRequestStatus.SUIVI_COMPTA) }}>
                                <span className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Revenir en Suivi compta
                                </span>
                            </DropdownMenuItem>
                        )}

                        {(demande.status === PurchaseRequestStatus.BROUILLON || demande.status === PurchaseRequestStatus.A_MODIFIER) && (
                            <DropdownMenuItem onSelect={() => {
                                if (demande.status === PurchaseRequestStatus.BROUILLON && onValidateAndSubmit) {
                                    onValidateAndSubmit()
                                } else {
                                    onStatusChange(PurchaseRequestStatus.A_VERIFIER)
                                }
                            }}>
                                <span className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    Soumettre
                                </span>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
