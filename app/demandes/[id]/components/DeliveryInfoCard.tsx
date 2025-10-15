import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Truck } from "lucide-react"
import { UseFormRegister } from "react-hook-form"
import { DemandeFormData } from "../../validation-schema"
import { FieldErrors } from "react-hook-form"

interface DeliveryInfoCardProps {
    demande: DemandeFormData
    modeEdition: boolean
    validationErrors: FieldErrors<DemandeFormData>
    register: UseFormRegister<DemandeFormData>
}
export const DeliveryInfoCard = ({ demande, modeEdition, validationErrors, register}: DeliveryInfoCardProps) => {

    return (
        <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
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
                        className={`mt-1 ${validationErrors.delivery?.address ? 'border-red-500' : ''}`}
                    />
                ) : (
                    <p className="mt-1">{demande.delivery.address}</p>
                )}
                {validationErrors.delivery?.address && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.delivery.address.message}</p>
                )}
            </div>

            <div>
                <Label className="text-sm font-medium">Téléphone de livraison *</Label>
                {modeEdition ? (
                    <Input
                        {...register("delivery.tel")}
                        placeholder="06 12 34 56 78"
                        className={`mt-1 ${validationErrors.delivery?.tel ? 'border-red-500' : ''}`}
                    />
                ) : (
                    <p className="mt-1">{demande.delivery.tel}</p>
                )}
                {validationErrors.delivery?.tel && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.delivery.tel.message}</p>
                )}
            </div>

            <div>
                <Label className="text-sm font-medium">Commentaire</Label>
                {modeEdition ? (
                    <Textarea
                        {...register("delivery.comment")}
                        rows={2}
                        className={`mt-1 ${validationErrors.delivery?.comment ? 'border-red-500' : ''}`}
                    />
                ) : (
                    <p className="mt-1">{demande.delivery.comment || "Non spécifié"}</p>
                )}
                {validationErrors.delivery?.comment && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.delivery.comment.message}</p>
                )}
            </div>
        </CardContent>
    </Card>
    )
}