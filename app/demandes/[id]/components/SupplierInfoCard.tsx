import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Building2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { FieldErrors, UseFormRegister } from "react-hook-form"
import { DemandeFormData } from "../../validation-schema"

interface SupplierInfoCardProps {
    demande: DemandeFormData
    modeEdition: boolean
    validationErrors: FieldErrors<DemandeFormData>
    register: UseFormRegister<DemandeFormData>
}

export const SupplierInfoCard = ({ demande, modeEdition, validationErrors, register}: SupplierInfoCardProps) => {
    return (            
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
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
                                className={`mt-1 ${validationErrors.provider?.name ? 'border-red-500' : ''}`}
                            />
                        ) : (
                            <p className="mt-1 font-medium">{demande.provider?.name}</p>
                        )}
                        {validationErrors.provider?.name && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.provider.name.message}</p>
                        )}
                    </div>
                </div>

                <div>
                    <Label className="text-sm font-medium">Adresse *</Label>
                    {modeEdition ? (
                        <Textarea
                            {...register("provider.address")}
                            rows={2}
                            className={`mt-1 ${validationErrors.provider?.address ? 'border-red-500' : ''}`}
                        />
                    ) : (
                        <p className="mt-1">{demande.provider?.address}</p>
                    )}
                    {validationErrors.provider?.address && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.provider.address.message}</p>
                    )}
                </div>

                <div>
                    <Label className="text-sm font-medium">Email</Label>
                    {modeEdition ? (
                        <Input
                            type="email"
                            {...register("provider.email")}
                            className={`mt-1 ${validationErrors.provider?.email ? 'border-red-500' : ''}`}
                        />
                    ) : (
                        <p className="mt-1">{demande.provider?.email || "Non spécifié"}</p>
                    )}
                    {validationErrors.provider?.email && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.provider.email.message}</p>
                    )}
                </div>

                <div>
                    <Label className="text-sm font-medium">Téléphone</Label>
                    {modeEdition ? (
                        <Input
                            {...register("provider.tel")}
                            placeholder="06 12 34 56 78"
                            className={`mt-1 ${validationErrors.provider?.tel ? 'border-red-500' : ''}`}
                        />
                    ) : (
                        <p className="mt-1">{demande.provider?.tel || "Non spécifié"}</p>
                    )}
                    {validationErrors.provider?.tel && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.provider.tel.message}</p>
                    )}
                </div>
            </CardContent>
        </Card>)
}