import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Edit, Archive, FileText } from "lucide-react"
import { PurchaseRequestStatus } from "../../types"

interface StatusBadgeProps {
    status: PurchaseRequestStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const getLibelleStatut = (statut: PurchaseRequestStatus) => {
        switch (statut) {
            case PurchaseRequestStatus.BROUILLON:
                return "Brouillon"
            case PurchaseRequestStatus.A_VERIFIER:
                return "À vérifier"
            case PurchaseRequestStatus.A_MODIFIER:
                return "À modifier"
            case PurchaseRequestStatus.VALIDEE:
                return "Validée"
            case PurchaseRequestStatus.REJETEE:
                return "Rejetée"
            case PurchaseRequestStatus.EXPORTEE:
                return "Exportée"
            default:
                return statut
        }
    }

    const getIconeStatut = (statut: PurchaseRequestStatus) => {
        switch (statut) {
            case PurchaseRequestStatus.VALIDEE:
                return <CheckCircle className="h-4 w-4 text-green-600" />
            case PurchaseRequestStatus.REJETEE:
                return <XCircle className="h-4 w-4 text-red-600" />
            case PurchaseRequestStatus.A_VERIFIER:
                return <Clock className="h-4 w-4 text-blue-600" />
            case PurchaseRequestStatus.A_MODIFIER:
                return <Edit className="h-4 w-4 text-orange-600" />
            case PurchaseRequestStatus.EXPORTEE:
                return <Archive className="h-4 w-4 text-purple-600" />
            case PurchaseRequestStatus.BROUILLON:
            default:
                return <FileText className="h-4 w-4 text-gray-600" />
        }
    }

    const getCouleurStatut = (statut: PurchaseRequestStatus) => {
        switch (statut) {
            case PurchaseRequestStatus.VALIDEE:
                return "bg-green-100 text-green-800 border-green-200"
            case PurchaseRequestStatus.REJETEE:
                return "bg-red-100 text-red-800 border-red-200"
            case PurchaseRequestStatus.A_VERIFIER:
                return "bg-blue-100 text-blue-800 border-blue-200"
            case PurchaseRequestStatus.A_MODIFIER:
                return "bg-orange-100 text-orange-800 border-orange-200"
            case PurchaseRequestStatus.EXPORTEE:
                return "bg-purple-100 text-purple-800 border-purple-200"
            case PurchaseRequestStatus.BROUILLON:
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    return (
        <div className="flex items-center gap-2">
            {getIconeStatut(status)}
            <Badge variant="outline" className={getCouleurStatut(status)}>
                {getLibelleStatut(status)}
            </Badge>
        </div>
    )
}
