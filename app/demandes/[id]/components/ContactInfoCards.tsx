import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2, Truck } from "lucide-react"
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form"
import { DemandeFormData } from "../../validation-schema"

interface ContactInfoCardsProps {
    demande: DemandeFormData
    modeEdition: boolean
    validationErrors: FieldErrors<DemandeFormData>
    register: UseFormRegister<DemandeFormData>
    watch: UseFormWatch<DemandeFormData>
    setValue: UseFormSetValue<DemandeFormData>
}

export function ContactInfoCards({
    demande,
    modeEdition,
    validationErrors,
    register,
}: ContactInfoCardsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations de facturation */}
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

            {/* Informations fournisseur */}
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
            </Card>

            {/* Informations de livraison */}
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
        </div>
    )
}
