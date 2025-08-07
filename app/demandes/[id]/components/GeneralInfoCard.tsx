import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"
import { type Demande } from "../../types"
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form"

interface GeneralInfoCardProps {
    demande: Demande
    modeEdition: boolean
    validationErrors: Record<string, string>
    register: UseFormRegister<Demande>
    watch: UseFormWatch<Demande>
    setValue: UseFormSetValue<Demande>
    validateField: (fieldName: string, value: string | number) => void
}

export function GeneralInfoCard({
    demande,
    modeEdition,
    validationErrors,
    register,
    watch,
    setValue,
    validateField,
}: GeneralInfoCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Informations générales
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <Label className="text-sm font-medium">Priorité</Label>
                        {modeEdition ? (
                            <Select
                                value={watch("priority")}
                                onValueChange={(value: "HIGH" | "LOW") => {
                                    setValue("priority", value)
                                }}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Faible</SelectItem>
                                    <SelectItem value="HIGH">Élevée</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="mt-1">
                                <Badge
                                    variant="outline"
                                    className={demande.priority === "HIGH" ? "bg-orange-100 text-orange-800 border-orange-200" : "bg-gray-100 text-gray-800 border-gray-200"}
                                >
                                    {demande.priority === "HIGH" ? "Élevée" : "Faible"}
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
