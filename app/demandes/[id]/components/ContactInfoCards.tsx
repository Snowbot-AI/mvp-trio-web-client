import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building } from "lucide-react"
import { type Demande } from "../../types"
import { UseFormRegister } from "react-hook-form"

interface ContactInfoCardsProps {
    demande: Demande
    modeEdition: boolean
    validationErrors: Record<string, string>
    register: UseFormRegister<Demande>
    validateField: (fieldName: string, value: string | number) => void
    validateRegexField: (fieldName: string, value: string, regex: RegExp, errorMessage: string) => void
    validateEmailField: (fieldName: string, value: string) => void
}

export function ContactInfoCards({
    demande,
    modeEdition,
    validationErrors,
    register,
    validateField,
    validateRegexField,
    validateEmailField,
}: ContactInfoCardsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        </div>
    )
}
