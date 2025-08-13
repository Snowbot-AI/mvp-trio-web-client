"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tag, Plus, Trash2, X, Check } from "lucide-react"
import { useEffect } from "react"
import { TrioService, ItemType } from "../../types"
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors, FieldArrayWithId, Control, useWatch } from "react-hook-form"
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
    control: Control<DemandeFormData>
    onAddItem: () => void
    onCancelAddItem: () => void
    onDeleteItem: (index: number) => void
    onConfirmAddItem: () => void
}

export function ItemsTable({
    modeEdition,
    ajoutArticle,
    validationErrors,
    items,
    register,
    watch,
    setValue,
    control,
    onAddItem,
    onCancelAddItem,
    onDeleteItem,
    onConfirmAddItem,
}: ItemsTableProps) {
    // Définir la quantité par défaut à 1 dès qu'on commence l'ajout d'un article
    useEffect(() => {
        if (ajoutArticle) {
            const index = items.length
            const currentQuantity = watch(`items.${index}.quantity`) || 0
            if (!currentQuantity) {
                setValue(`items.${index}.quantity`, 1)
                const unitPrice = watch(`items.${index}.unitPrice`) || 0
                setValue(`items.${index}.price`, 1 * unitPrice)
            }
        }
    }, [ajoutArticle, items.length, setValue, watch])
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

    const newIndex = items.length
    const watchedQuantity = useWatch({ control, name: `items.${newIndex}.quantity` }) || 0
    const watchedUnitPrice = useWatch({ control, name: `items.${newIndex}.unitPrice` }) || 0

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Tag className="h-6 w-6" />
                        Articles commandés
                    </div>
                    {modeEdition && (
                        <Button size="sm" onClick={onAddItem} disabled={ajoutArticle} >
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
                                        <div className="px-3 py-2 bg-gray-50 rounded-md border border-input text-sm">
                                            {(Number(watchedQuantity || 0) * Number(watchedUnitPrice || 0)).toFixed(2)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="flex gap-2">
                                        <Button type="button" size="icon" onClick={onConfirmAddItem} aria-label="Confirmer l'ajout">
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button type="button" size="icon" variant="outline" onClick={onCancelAddItem} aria-label="Annuler">
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
