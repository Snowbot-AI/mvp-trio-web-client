import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Euro } from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface FinancialSummaryCardProps {
    orderTotal: number
    deliveryTotal?: number
    billingFees?: number
    total: number
}

export function FinancialSummaryCard({ orderTotal, deliveryTotal, billingFees, total }: FinancialSummaryCardProps) {
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
                <div className="flex justify-between">
                    <span>Participation livraison :</span>
                    <span className="font-medium">{formatPrice(deliveryTotal ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Frais de facturation :</span>
                    <span className="font-medium">{formatPrice(billingFees ?? 0)}</span>
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
