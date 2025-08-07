import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { File, Upload, Trash2 } from "lucide-react"
import { FileType, type Demande } from "../../types"
import { UseFormWatch } from "react-hook-form"

interface FilesSectionProps {
    demande: Demande
    modeEdition: boolean
    watch: UseFormWatch<Demande>
    fichierASupprimer: { id: string; name: string } | null
    onUploadFile: (event: React.ChangeEvent<HTMLInputElement>, category: string) => void
    onDownloadFile: (fileId: string, fileName: string) => void
    onSetFileToDelete: (file: { id: string; name: string } | null) => void
    onConfirmDeleteFile: () => void
}

export function FilesSection({
    modeEdition,
    watch,
    fichierASupprimer,
    onUploadFile,
    onDownloadFile,
    onSetFileToDelete,
    onConfirmDeleteFile,
}: FilesSectionProps) {
    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                        onChange={(e) => onUploadFile(e, "quotations")}
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
                            {watch("files")?.filter((fichier: FileType) => fichier.category === "quotations").map((fichier: FileType) => (
                                <div key={fichier.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <File className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="font-medium">{fichier.name}</p>
                                            <p className="text-sm text-gray-500">{new Date(fichier.uploadInstant).toLocaleDateString("fr-FR")}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="outline" onClick={() => onDownloadFile(fichier.id, fichier.name)}>
                                            Télécharger
                                        </Button>
                                        {modeEdition && (
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => onSetFileToDelete({ id: fichier.id, name: fichier.name })}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {(!watch("files") || watch("files")?.filter((fichier: FileType) => fichier.category === "quotations").length === 0) && (
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
                                        onChange={(e) => onUploadFile(e, "invoices")}
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
                            {watch("files")?.filter((fichier: FileType) => fichier.category === "invoices").map((fichier: FileType) => (
                                <div key={fichier.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <File className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="font-medium">{fichier.name}</p>
                                            <p className="text-sm text-gray-500">{new Date(fichier.uploadInstant).toLocaleDateString("fr-FR")}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="outline" onClick={() => onDownloadFile(fichier.id, fichier.name)}>
                                            Télécharger
                                        </Button>
                                        {modeEdition && (
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => onSetFileToDelete({ id: fichier.id, name: fichier.name })}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {(!watch("files") || watch("files")?.filter((fichier: FileType) => fichier.category === "invoices").length === 0) && (
                                <p className="text-gray-500 text-center py-4">Aucune facture</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Popup de confirmation pour la suppression de fichiers */}
            <AlertDialog open={!!fichierASupprimer} onOpenChange={(open) => !open && onSetFileToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer le fichier</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer le fichier &quot;{fichierASupprimer?.name}&quot; ?
                            Cette action ne peut pas être annulée.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => onSetFileToDelete(null)}>
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onConfirmDeleteFile}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
