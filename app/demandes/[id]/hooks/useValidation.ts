import { useState } from "react"
import { validateDemande } from "../../validation-schema"
import { UseFormSetValue, UseFormWatch } from "react-hook-form"
import { Demande } from "../../types"

export function useValidation() {
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

    // Fonction de validation en temps réel
    const validateField = (fieldName: keyof Demande, value: string | number, watch: UseFormWatch<Demande>, setValue: UseFormSetValue<Demande>) => {
        // Mettre à jour les données du formulaire
        setValue(fieldName, value as Demande[keyof Demande], { shouldValidate: false })

        // Validation simple pour les champs obligatoires
        if (fieldName === "from") {
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                setValidationErrors(prev => ({ ...prev, [fieldName]: "Le demandeur est requis" }))
            } else {
                setValidationErrors(prev => {
                    const newErrors = { ...prev }
                    delete newErrors[fieldName]
                    return newErrors
                })
            }
            return
        }

        // Pour les autres champs, utiliser la validation existante
        const currentData = watch()
        const dataToValidate = { ...currentData } as Record<string, unknown>

        // Gérer les champs imbriqués (ex: billing.siret)
        if (fieldName.includes('.')) {
            const parts = fieldName.split('.')
            let current = dataToValidate as Record<string, unknown>
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) {
                    current[parts[i]] = {}
                }
                current = current[parts[i]] as Record<string, unknown>
            }
            current[parts[parts.length - 1]] = value
        } else {
            (dataToValidate as Record<string, unknown>)[fieldName] = value
        }

        const validation = validateDemande(dataToValidate)
        if (!validation.success) {
            const fieldErrors: Record<string, string> = {}
            validation.error.issues.forEach((issue) => {
                const path = issue.path.join('.')
                if (path === fieldName || path.startsWith(fieldName + '.')) {
                    fieldErrors[fieldName] = issue.message
                }
            })
            setValidationErrors(prev => ({ ...prev, ...fieldErrors }))
        } else {
            setValidationErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[fieldName]
                return newErrors
            })
        }
    }

    // Fonction de validation spécifique pour les champs avec regex
    const validateRegexField = (fieldName: keyof Demande, value: string, regex: RegExp, errorMessage: string, setValue: UseFormSetValue<Demande>) => {
        // Mettre à jour les données du formulaire
        setValue(fieldName as keyof Demande, value as Demande[keyof Demande], { shouldValidate: false })

        // Si le champ est vide, on ne valide pas (pas d'erreur)
        if (!value || value.trim() === '') {
            setValidationErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[fieldName]
                return newErrors
            })
            return
        }

        // Si le champ a une valeur, on valide avec la regex
        if (!regex.test(value)) {
            setValidationErrors(prev => ({ ...prev, [fieldName]: errorMessage }))
        } else {
            setValidationErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[fieldName]
                return newErrors
            })
        }
    }

    // Fonction de validation pour les emails
    const validateEmailField = (fieldName: keyof Demande, value: string, setValue: UseFormSetValue<Demande>) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        // Mettre à jour les données du formulaire
        setValue(fieldName, value, { shouldValidate: false })

        // Si le champ est vide, on ne valide pas (pas d'erreur)
        if (!value || value.trim() === '') {
            setValidationErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[fieldName]
                return newErrors
            })
            return
        }

        // Si le champ a une valeur, on valide avec la regex
        if (!emailRegex.test(value)) {
            setValidationErrors(prev => ({ ...prev, [fieldName]: "Format d'email invalide" }))
        } else {
            setValidationErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[fieldName]
                return newErrors
            })
        }
    }

    // Fonction pour nettoyer toutes les erreurs de validation
    const clearValidationErrors = () => {
        setValidationErrors({})
    }

    return {
        validationErrors,
        validateField,
        validateRegexField,
        validateEmailField,
        clearValidationErrors,
    }
}
