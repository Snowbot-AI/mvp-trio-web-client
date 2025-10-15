import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2 } from "lucide-react"
import { UseFormRegister } from "react-hook-form"
import { DemandeFormData } from "../../validation-schema"
import { FieldErrors } from "react-hook-form"

interface BillingInfoCardProps {
    demande: DemandeFormData
    modeEdition: boolean
    validationErrors: FieldErrors<DemandeFormData>
    register: UseFormRegister<DemandeFormData>
}


export const BillingInfoCard = ({ demande, modeEdition, validationErrors, register}: BillingInfoCardProps) => {

    return (
        <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
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
                            className={`mt-1 ${validationErrors.billing?.name ? 'border-red-500' : ''}`}
                        />
                    ) : (
                        <p className="mt-1 font-medium">{demande.billing.name}</p>
                    )}
                    {validationErrors.billing?.name && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.billing.name.message}</p>
                    )}
                </div>

                <div>
                    <Label className="text-sm font-medium">SIRET *</Label>
                    {modeEdition ? (
                        <Input
                            {...register("billing.siret")}
                            placeholder="12345678901234"
                            className={`mt-1 ${validationErrors.billing?.siret ? 'border-red-500' : ''}`}
                        />
                    ) : (
                        <p className="mt-1">{demande.billing.siret}</p>
                    )}
                    {validationErrors.billing?.siret && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.billing.siret.message}</p>
                    )}
                </div>
            </div>

            <div>
                <Label className="text-sm font-medium">Adresse de facturation *</Label>
                {modeEdition ? (
                    <Textarea
                        {...register("billing.address")}
                        rows={2}
                        className={`mt-1 ${validationErrors.billing?.address ? 'border-red-500' : ''}`}
                    />
                ) : (
                    <p className="mt-1">{demande.billing.address}</p>
                )}
                {validationErrors.billing?.address && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.billing.address.message}</p>
                )}
            </div>

            <div>
                <Label className="text-sm font-medium">Email de facturation *</Label>
                {modeEdition ? (
                    <Input
                        type="email"
                        {...register("billing.emails.0")}
                        className={`mt-1 ${validationErrors.billing?.emails?.[0] ? 'border-red-500' : ''}`}
                    />
                ) : (
                    <p className="mt-1">{demande.billing.emails[0]}</p>
                )}
                {validationErrors.billing?.emails?.[0] && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.billing.emails[0]?.message}</p>
                )}
            </div>
        </CardContent>
    </Card>

    )
}