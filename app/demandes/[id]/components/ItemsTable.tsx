"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tag, Plus, Trash2, X, Check, Pencil } from "lucide-react"
import { useEffect, useState } from "react"
import { TrioService, ItemType } from "../../types"
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors, FieldArrayWithId, Control, useWatch } from "react-hook-form"
import { DemandeFormData } from "../../validation-schema"
import { formatPrice } from "@/lib/utils"

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
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [editedSnapshot, setEditedSnapshot] = useState<DemandeFormData['items'][number] | null>(null)
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
    }

    const newIndex = items.length
    const watchedPrice = useWatch({ control, name: `items.${newIndex}.price` }) || 0

    const getItemAtIndex = (index: number): DemandeFormData['items'][number] => {
        const service = (watch(`items.${index}.service`) || "") as string
        const budgetType = (watch(`items.${index}.budgetType`) || "H") as string
        const itemType = (watch(`items.${index}.itemType`) || null) as ItemType | null
        const referenceDevis = (watch(`items.${index}.referenceDevis`) || undefined) as string | undefined
        const description = (watch(`items.${index}.description`) || "") as string
        const rawQuantity = watch(`items.${index}.quantity`)
        const quantity = typeof rawQuantity === 'number' && Number.isFinite(rawQuantity) ? rawQuantity : 0
        const rawUnitPrice = watch(`items.${index}.unitPrice`)
        const unitPrice = typeof rawUnitPrice === 'number' && Number.isFinite(rawUnitPrice) ? rawUnitPrice : 0
        const price = (watch(`items.${index}.price`) as number | undefined) ?? (quantity * unitPrice)
        return { service, budgetType, itemType, referenceDevis, description, quantity, unitPrice, price }
    }

    const startEdit = (index: number) => {
        if (!modeEdition || ajoutArticle) {
            return
        }
        setEditedSnapshot(getItemAtIndex(index))
        setEditingIndex(index)
    }

    const cancelEdit = () => {
        if (editingIndex === null || !editedSnapshot) {
            setEditingIndex(null)
            setEditedSnapshot(null)
            return
        }
        const i = editingIndex
        setValue(`items.${i}.service`, editedSnapshot.service)
        setValue(`items.${i}.budgetType`, editedSnapshot.budgetType)
        setValue(`items.${i}.itemType`, editedSnapshot.itemType)
        setValue(`items.${i}.referenceDevis`, editedSnapshot.referenceDevis)
        setValue(`items.${i}.description`, editedSnapshot.description)
        setValue(`items.${i}.quantity`, editedSnapshot.quantity)
        setValue(`items.${i}.unitPrice`, editedSnapshot.unitPrice)
        setValue(`items.${i}.price`, editedSnapshot.price)
        setEditingIndex(null)
        setEditedSnapshot(null)
    }

    const confirmEdit = () => {
        if (editingIndex === null) {
            return
        }
        const i = editingIndex
        // Normaliser les nombres et recalculer le prix pour éviter NaN/null côté API
        const rawQuantity = watch(`items.${i}.quantity`)
        const rawUnitPrice = watch(`items.${i}.unitPrice`)
        const quantity = typeof rawQuantity === 'number' && Number.isFinite(rawQuantity) && rawQuantity > 0 ? rawQuantity : 1
        const unitPrice = typeof rawUnitPrice === 'number' && Number.isFinite(rawUnitPrice) && rawUnitPrice >= 0 ? rawUnitPrice : 0
        setValue(`items.${i}.quantity`, quantity)
        setValue(`items.${i}.unitPrice`, unitPrice)
        setValue(`items.${i}.price`, quantity * unitPrice)

        // Valeurs par défaut/coercitions légères
        const budgetTypeRaw = (watch(`items.${i}.budgetType`) as string | undefined) || 'H'
        const budgetType = budgetTypeRaw.toUpperCase()
        setValue(`items.${i}.budgetType`, budgetType)

        setEditingIndex(null)
        setEditedSnapshot(null)
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
                        <Button size="sm" onClick={onAddItem} disabled={ajoutArticle || editingIndex !== null} >
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
                                <TableHead>Service *</TableHead>
                                <TableHead>BudgetType *</TableHead>
                                <TableHead>ItemType</TableHead>
                                <TableHead>Référence devis</TableHead>
                                <TableHead>Désignation *</TableHead>
                                <TableHead>Qté *</TableHead>
                                <TableHead>Prix unit. HT *</TableHead>
                                <TableHead>Montant HT</TableHead>
                                {modeEdition && <TableHead>Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((article, index) => (
                                <TableRow key={article.id}>
                                    {editingIndex === index ? (
                                        <>
                                            <TableCell>
                                                <Select
                                                    defaultValue={(watch(`items.${index}.service`) as string | undefined) || undefined}
                                                    onValueChange={(value) => {
                                                        setValue(`items.${index}.service`, value)
                                                    }}
                                                >
                                                    <SelectTrigger className={validationErrors.items?.[index]?.service ? 'border-red-500' : ''}>
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
                                                {validationErrors.items?.[index]?.service && (
                                                    <p className="text-red-500 text-xs mt-1">{validationErrors.items[index]?.service?.message}</p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    placeholder="BudgetType (ex: B29, B105, H)"
                                                    {...register(`items.${index}.budgetType`)}
                                                    className={validationErrors.items?.[index]?.budgetType ? 'border-red-500' : ''}
                                                />
                                                {validationErrors.items?.[index]?.budgetType && (
                                                    <p className="text-red-500 text-xs mt-1">{validationErrors.items[index]?.budgetType?.message}</p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    defaultValue={(watch(`items.${index}.itemType`) as ItemType | null) || undefined as unknown as string}
                                                    onValueChange={(value) => {
                                                        setValue(`items.${index}.itemType`, value as ItemType)
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
                                                    {...register(`items.${index}.referenceDevis`)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    placeholder="Désignation"
                                                    {...register(`items.${index}.description`)}
                                                    className={validationErrors.items?.[index]?.description ? 'border-red-500' : ''}
                                                />
                                                {validationErrors.items?.[index]?.description && (
                                                    <p className="text-red-500 text-xs mt-1">{validationErrors.items[index]?.description?.message}</p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="1"
                                                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                                    className={validationErrors.items?.[index]?.quantity ? 'border-red-500' : ''}
                                                    onChange={(e) => {
                                                        let quantity = Number(e.target.value) || 0
                                                        if (quantity < 0) {
                                                            quantity = 0
                                                            setValue(`items.${index}.quantity`, 0)
                                                        }
                                                        const unitPrice = (watch(`items.${index}.unitPrice`) as number) || 0
                                                        const calculatedPrice = quantity * unitPrice
                                                        setValue(`items.${index}.price`, calculatedPrice)
                                                    }}
                                                />
                                                {validationErrors.items?.[index]?.quantity && (
                                                    <p className="text-red-500 text-xs mt-1">{validationErrors.items[index]?.quantity?.message}</p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                                                    className={validationErrors.items?.[index]?.unitPrice ? 'border-red-500' : ''}
                                                    onChange={(e) => {
                                                        let unitPrice = Number(e.target.value) || 0
                                                        if (unitPrice < 0) {
                                                            unitPrice = 0
                                                            setValue(`items.${index}.unitPrice`, 0)
                                                        }
                                                        const quantity = (watch(`items.${index}.quantity`) as number) || 0
                                                        const calculatedPrice = quantity * unitPrice
                                                        setValue(`items.${index}.price`, calculatedPrice)
                                                    }}
                                                />
                                                {validationErrors.items?.[index]?.unitPrice && (
                                                    <p className="text-red-500 text-xs mt-1">{validationErrors.items[index]?.unitPrice?.message}</p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="px-3 py-2 bg-gray-50 rounded-md border border-input text-sm">
                                                    {formatPrice(((watch(`items.${index}.price`) as number | undefined) ?? ((watch(`items.${index}.quantity`) as number || 0) * ((watch(`items.${index}.unitPrice`) as number) || 0))))}
                                                </div>
                                            </TableCell>
                                            {modeEdition && (
                                                <TableCell className="flex gap-2">
                                                    <Button type="button" size="icon" onClick={confirmEdit} aria-label="Confirmer la modification">
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button type="button" size="icon" variant="outline" onClick={cancelEdit} aria-label="Annuler la modification">
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <TableCell>{(watch(`items.${index}.service`) as string) || article.service}</TableCell>
                                            <TableCell>{(watch(`items.${index}.budgetType`) as string) || article.budgetType}</TableCell>
                                            <TableCell>{(watch(`items.${index}.itemType`) as ItemType | null) || article.itemType || '-'}</TableCell>
                                            <TableCell>{(watch(`items.${index}.referenceDevis`) as string | undefined) || article.referenceDevis || '-'}</TableCell>
                                            <TableCell>{(watch(`items.${index}.description`) as string) || article.description}</TableCell>
                                            <TableCell>{(watch(`items.${index}.quantity`) as number) ?? article.quantity}</TableCell>
                                            <TableCell>{formatPrice(((watch(`items.${index}.unitPrice`) as number | undefined) ?? article.unitPrice ?? 0))}</TableCell>
                                            <TableCell className="font-medium">{
                                                formatPrice(
                                                    (((watch(`items.${index}.quantity`) as number | undefined) ?? article.quantity ?? 0) *
                                                        (((watch(`items.${index}.unitPrice`) as number | undefined) ?? article.unitPrice ?? 0)))
                                                )
                                            }</TableCell>
                                            {modeEdition && (
                                                <TableCell className="sticky right-0 bg-white z-10 flex gap-2 border-l">
                                                    <Button size="sm" variant="outline" onClick={() => startEdit(index)} disabled={ajoutArticle || editingIndex !== null}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="destructive" onClick={() => onDeleteItem(index)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </>
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
                                            {formatPrice(watchedPrice)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="sticky right-0 bg-white z-10 flex gap-2 border-l">
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
