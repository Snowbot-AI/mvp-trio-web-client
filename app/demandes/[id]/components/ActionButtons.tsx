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
import { PurchaseRequestStatus, type Demande } from "../../types"

interface ActionButtonsProps {
    demande: Demande
    modeEdition: boolean
    validationErrors: Record<string, string>
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
}: ActionButtonsProps) {
    if (modeEdition) {
        return (
            <>
                <Button variant="outline" onClick={onCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                </Button>

                <Button
                    onClick={onSave}
                    disabled={isPending || Object.keys(validationErrors).length > 0}
                    className={Object.keys(validationErrors).length > 0 ? 'bg-red-500 hover:bg-red-600' : ''}
                >
                    <Save className="h-4 w-4 mr-2" />
                    {isPending ? 'Sauvegarde...' :
                        Object.keys(validationErrors).length > 0 ? 'Erreurs de validation' : 'Sauvegarder'}
                </Button>
            </>
        )
    }

    return (
        <div className="flex items-center gap-2">
            {/* Actions selon le statut */}
            {demande.status === PurchaseRequestStatus.A_VERIFIER && (
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
                                    Commentaire obligatoire *
                                </Label>
                                <Textarea
                                    id="more-info-comment"
                                    value={moreInfoComment}
                                    onChange={(e) => onMoreInfoCommentChange(e.target.value)}
                                    placeholder="Veuillez préciser quelles informations supplémentaires sont nécessaires..."
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
                                        if (moreInfoComment.trim()) {
                                            onStatusChange(PurchaseRequestStatus.A_MODIFIER)
                                            onShowMoreInfoDialogChange(false)
                                            onMoreInfoCommentChange("")
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
                            <AlertDialogAction onClick={() => onStatusChange(PurchaseRequestStatus.A_VERIFIER)}>
                                Envoyer la demande
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    )
}
