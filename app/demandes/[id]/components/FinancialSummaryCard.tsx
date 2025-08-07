import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Euro } from "lucide-react"
import { type Demande } from "../../types"

interface FinancialSummaryCardProps {
    demande: Demande
}

export function FinancialSummaryCard({ demande }: FinancialSummaryCardProps) {
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
                    <span className="font-medium">{demande.total.orderTotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                    <span>Participation livraison :</span>
                    <span className="font-medium">{demande.total.deliveryTotal?.toFixed(2) || "0.00"} €</span>
                </div>
                <div className="flex justify-between">
                    <span>Frais de facturation :</span>
                    <span className="font-medium">{demande.total.billingFees?.toFixed(2) || "0.00"} €</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                    <span>Total HT :</span>
                    <span className="text-green-600">{demande.total.total.toFixed(2)} €</span>
                </div>
            </CardContent>
        </Card>
    )
}
