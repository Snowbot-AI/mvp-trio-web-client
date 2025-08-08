import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tag, Plus, Trash2, X } from "lucide-react"
import { TrioService, ItemType } from "../../types"
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors, FieldArrayWithId } from "react-hook-form"
import { DemandeFormData } from "../../validation-schema"

interface ItemsTableProps {
    demande: DemandeFormData
    modeEdition: boolean
    ajoutArticle: boolean
    validationErrors: FieldErrors<DemandeFormData>
    items: FieldArrayWithId<DemandeFormData, "items", "id">[]
    register: UseFormRegister<DemandeFormData>
    watch: UseFormWatch<DemandeFormData>
    setValue: UseFormSetValue<DemandeFormData>
    onAddItem: () => void
    onCancelAddItem: () => void
    onDeleteItem: (index: number) => void
}

export function ItemsTable({
    modeEdition,
    ajoutArticle,
    validationErrors,
    items,
    register,
    watch,
    setValue,
    onAddItem,
    onCancelAddItem,
    onDeleteItem,
}: ItemsTableProps) {
    const serviceLabels: Record<string, string> = {
        ACC: 'Accueil',
        ADM: 'Admin',
        BAT: 'Bâtiment',
        BIL: 'Billetterie',
        COM: 'Communication commerciale',
        DAM: 'Dammage',
        PAR: 'Parc de roulage',
        PIS: 'Pistes',
        REST: 'Restaurant',
        RM: 'Remontée mécanique',
        USI: 'Snowmaker (Usine à neige)',
        AUT: 'Autre'
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Tag className="h-6 w-6" />
                        Articles commandés
                    </div>
                    {modeEdition && (
                        <Button size="sm" onClick={onAddItem}>
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter
                        </Button>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service</TableHead>
                                <TableHead>BudgetType</TableHead>
                                <TableHead>ItemType</TableHead>
                                <TableHead>Référence devis</TableHead>
                                <TableHead>Désignation</TableHead>
                                <TableHead>Qté</TableHead>
                                <TableHead>Prix unit. HT</TableHead>
                                <TableHead>Montant HT</TableHead>
                                {modeEdition && <TableHead>Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((article, index) => (
                                <TableRow key={article.id}>
                                    <TableCell>{article.service}</TableCell>
                                    <TableCell>{article.budgetType}</TableCell>
                                    <TableCell>{article.itemType || '-'}</TableCell>
                                    <TableCell>{article.referenceDevis || '-'}</TableCell>
                                    <TableCell>{article.description}</TableCell>
                                    <TableCell>{article.quantity}</TableCell>
                                    <TableCell>{article.unitPrice ? article.unitPrice.toFixed(2) : '0.00'} €</TableCell>
                                    <TableCell className="font-medium">{article.price ? article.price.toFixed(2) : '0.00'} €</TableCell>
                                    {modeEdition && (
                                        <TableCell>
                                            <Button size="sm" variant="destructive" onClick={() => onDeleteItem(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}

                            {ajoutArticle && (
                                <TableRow>
                                    <TableCell>
                                        <Select
                                            onValueChange={(value) => {
                                                setValue(`items.${items.length}.service`, value)
                                            }}
                                        >
                                            <SelectTrigger className={validationErrors.items?.[items.length]?.service ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Sélectionner un service" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(TrioService).map(([key, value]) => (
                                                    <SelectItem key={key} value={value}>
                                                        {key} - {serviceLabels[key]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {validationErrors.items?.[items.length]?.service && (
                                            <p className="text-red-500 text-xs mt-1">{validationErrors.items[items.length]?.service?.message}</p>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            placeholder="BudgetType (ex: B29, B105, H)"
                                            {...register(`items.${items.length}.budgetType`)}
                                            className={validationErrors.items?.[items.length]?.budgetType ? 'border-red-500' : ''}
                                        />
                                        {validationErrors.items?.[items.length]?.budgetType && (
                                            <p className="text-red-500 text-xs mt-1">{validationErrors.items[items.length]?.budgetType?.message}</p>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            onValueChange={(value) => {
                                                setValue(`items.${items.length}.itemType`, value as ItemType)
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={ItemType.GI}>GI</SelectItem>
                                                <SelectItem value={ItemType.GER}>GER</SelectItem>
                                                <SelectItem value={ItemType.INVEST}>INVEST</SelectItem>
                                                <SelectItem value={ItemType.FUNCT}>FUNCT</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            placeholder="Référence devis"
                                            {...register(`items.${items.length}.referenceDevis`)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            placeholder="Désignation"
                                            {...register(`items.${items.length}.description`)}
                                            className={validationErrors.items?.[items.length]?.description ? 'border-red-500' : ''}
                                        />
                                        {validationErrors.items?.[items.length]?.description && (
                                            <p className="text-red-500 text-xs mt-1">{validationErrors.items[items.length]?.description?.message}</p>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="1"
                                            {...register(`items.${items.length}.quantity`, { valueAsNumber: true })}
                                            className={validationErrors.items?.[items.length]?.quantity ? 'border-red-500' : ''}
                                            onChange={(e) => {
                                                let quantity = Number(e.target.value) || 0

                                                if (quantity < 0) {
                                                    quantity = 0
                                                    setValue(`items.${items.length}.quantity`, 0)
                                                }

                                                const unitPrice = watch(`items.${items.length}.unitPrice`) || 0
                                                const calculatedPrice = quantity * unitPrice

                                                setValue(`items.${items.length}.price`, calculatedPrice)
                                            }}
                                        />
                                        {validationErrors.items?.[items.length]?.quantity && (
                                            <p className="text-red-500 text-xs mt-1">{validationErrors.items[items.length]?.quantity?.message}</p>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            {...register(`items.${items.length}.unitPrice`, { valueAsNumber: true })}
                                            className={validationErrors.items?.[items.length]?.unitPrice ? 'border-red-500' : ''}
                                            onChange={(e) => {
                                                let unitPrice = Number(e.target.value) || 0

                                                if (unitPrice < 0) {
                                                    unitPrice = 0
                                                    setValue(`items.${items.length}.unitPrice`, 0)
                                                }

                                                const quantity = watch(`items.${items.length}.quantity`) || 0
                                                const calculatedPrice = quantity * unitPrice

                                                setValue(`items.${items.length}.price`, calculatedPrice)
                                            }}
                                        />
                                        {validationErrors.items?.[items.length]?.unitPrice && (
                                            <p className="text-red-500 text-xs mt-1">{validationErrors.items[items.length]?.unitPrice?.message}</p>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            readOnly
                                            value={((watch(`items.${items.length}.quantity`) || 0) * (watch(`items.${items.length}.unitPrice`) || 0)).toFixed(2)}
                                            {...register(`items.${items.length}.price`, { valueAsNumber: true })}
                                            className="bg-gray-50"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button size="sm" variant="outline" onClick={onCancelAddItem}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
