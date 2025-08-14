import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Euro } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form"
import type { DemandeFormData } from "../../validation-schema"

interface FinancialSummaryCardProps {
    orderTotal: number
    deliveryTotal?: number
    billingFees?: number
    total: number
    modeEdition?: boolean
    register?: UseFormRegister<DemandeFormData>
    watch?: UseFormWatch<DemandeFormData>
    setValue?: UseFormSetValue<DemandeFormData>
    errors?: Record<string, { message?: string }>
}

export function FinancialSummaryCard({
    orderTotal,
    deliveryTotal,
    billingFees,
    total,
    modeEdition = false,
    watch,
    setValue
}: FinancialSummaryCardProps) {

    const handleDeliveryTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (setValue) {
            const value = e.target.value === "" ? 0 : parseFloat(e.target.value)
            if (!isNaN(value) && value >= 0) {
                setValue("total.deliveryTotal", value)
                setValue("total.participationLivraison", value) // Synchroniser avec l'ancien champ
            }
        }
    }

    const handleBillingFeesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (setValue) {
            const value = e.target.value === "" ? 0 : parseFloat(e.target.value)
            if (!isNaN(value) && value >= 0) {
                setValue("total.billingFees", value)
                setValue("total.fraisFacturation", value) // Synchroniser avec l'ancien champ
            }
        }
    }

    // Utiliser les valeurs surveillées pour une meilleure réactivité
    const watchedDeliveryTotal = watch ? watch("total.deliveryTotal") : deliveryTotal
    const watchedBillingFees = watch ? watch("total.billingFees") : billingFees

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Euro className="h-5 w-5" />
                    Récapitulatif financier
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex justify-between">
                    <span>Total commande HT :</span>
                    <span className="font-medium">{formatPrice(orderTotal)}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span>Participation livraison :</span>
                    {modeEdition ? (
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={watchedDeliveryTotal ?? 0}
                                onChange={handleDeliveryTotalChange}
                                className="w-24 text-right"
                                placeholder="0.00"
                                onFocus={(e) => e.target.select()}
                            />
                            <span className="text-sm text-gray-500">€</span>
                        </div>
                    ) : (
                        <span className="font-medium">{formatPrice(deliveryTotal ?? 0)}</span>
                    )}
                </div>

                <div className="flex justify-between items-center">
                    <span>Frais de facturation :</span>
                    {modeEdition ? (
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={watchedBillingFees ?? 0}
                                onChange={handleBillingFeesChange}
                                className="w-24 text-right"
                                placeholder="0.00"
                                onFocus={(e) => e.target.select()}
                            />
                            <span className="text-sm text-gray-500">€</span>
                        </div>
                    ) : (
                        <span className="font-medium">{formatPrice(billingFees ?? 0)}</span>
                    )}
                </div>

                <hr />
                <div className="flex justify-between text-lg font-bold">
                    <span>Total HT :</span>
                    <span className="text-green-600">{formatPrice(total)}</span>
                </div>
            </CardContent>
        </Card>
    )
}
