"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, CheckCircle, XCircle, Clock, Plus, Loader2, FileText, Edit, Download } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { getStationName, PurchaseRequestStatus, CodeStation } from "./types"
import { useDemandes, useCreateDemande } from "./hooks"
import { DemandeFormData } from "./validation-schema"

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
    case PurchaseRequestStatus.SUIVI_COMPTA:
      return <Clock className="h-4 w-4 text-purple-600" />
    case PurchaseRequestStatus.EXPORTEE:
      return <Download className="h-4 w-4 text-indigo-600" />
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
    case PurchaseRequestStatus.SUIVI_COMPTA:
      return "bg-purple-100 text-purple-800 border-purple-200"
    case PurchaseRequestStatus.EXPORTEE:
      return "bg-indigo-100 text-indigo-800 border-indigo-200"
    case PurchaseRequestStatus.BROUILLON:
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

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
    case PurchaseRequestStatus.SUIVI_COMPTA:
      return "Suivi compta"
    case PurchaseRequestStatus.EXPORTEE:
      return "Exportée"
    default:
      return statut
  }
}
export default function DemandesPage() {
  type StatutFiltre = PurchaseRequestStatus | "tous"

  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const statutQueryKey = "status"

  const statutOptions: StatutFiltre[] = useMemo(() => [
    "tous",
    PurchaseRequestStatus.BROUILLON,
    PurchaseRequestStatus.A_VERIFIER,
    PurchaseRequestStatus.A_MODIFIER,
    PurchaseRequestStatus.VALIDEE,
    PurchaseRequestStatus.REJETEE,
    PurchaseRequestStatus.SUIVI_COMPTA,
    PurchaseRequestStatus.EXPORTEE,
  ], [])

  const extractStatusFromParams = useCallback((params: URLSearchParams | ReturnType<typeof useSearchParams>): StatutFiltre => {
    const statusParam = params.get(statutQueryKey)

    if (!statusParam) {
      return "tous"
    }

    return statutOptions.includes(statusParam as StatutFiltre) ? (statusParam as StatutFiltre) : "tous"
  }, [statutOptions, statutQueryKey])

  const setQueryParam = (key: string, value: StatutFiltre) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === "tous") {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    const nextQuery = params.toString()
    const nextPath = nextQuery ? `${pathname}?${nextQuery}` : pathname

    router.replace(nextPath, { scroll: false })
  }

  const [termeRecherche, setTermeRecherche] = useState("")
  const [filtreStatut, setFiltreStatut] = useState<StatutFiltre>(() => extractStatusFromParams(searchParams))
  const [filtreStation, setFiltreStation] = useState("tous")

  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [nouvelleDemande, setNouvelleDemande] = useState({
    from: "LAUBRAY",
    codeStation: CodeStation.CODE_06 as CodeStation,
    description: "",
  })
  const [fichiersDevis, setFichiersDevis] = useState<File[]>([])

  // Utiliser React Query pour récupérer les demandes
  const { data: demandes, isLoading, error } = useDemandes()

  // Hook pour créer une nouvelle demande
  const createDemandeMutation = useCreateDemande()

  const handleStatutUpdate = (value: StatutFiltre) => {
    setFiltreStatut(value)
    setQueryParam(statutQueryKey, value)
  }

  const handleResumeCardClick = (status: PurchaseRequestStatus) => {
    const nextValue: StatutFiltre = filtreStatut === status ? "tous" : status
    handleStatutUpdate(nextValue)
  }

  const handleResumeCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, status: PurchaseRequestStatus) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleResumeCardClick(status)
    }
  }

  const handleStatutSelect = (value: string) => {
    const nextValue = statutOptions.includes(value as StatutFiltre) ? (value as StatutFiltre) : "tous"
    handleStatutUpdate(nextValue)
  }

  useEffect(() => {
    const statusFromParams = extractStatusFromParams(searchParams)

    if (statusFromParams !== filtreStatut) {
      setFiltreStatut(statusFromParams)
    }
  }, [searchParams, filtreStatut, extractStatusFromParams])

  const demandesFiltrees = (demandes || []).filter((dem: DemandeFormData) => {
    const correspondRecherche =
      (dem.from?.toLowerCase() || '').includes(termeRecherche.toLowerCase()) ||
      (dem.id?.toLowerCase() || '').includes(termeRecherche.toLowerCase()) ||
      (dem.description?.toLowerCase() || '').includes(termeRecherche.toLowerCase()) ||
      (dem.billing?.name?.toLowerCase() || '').includes(termeRecherche.toLowerCase()) ||
      (dem.billing?.address?.toLowerCase() || '').includes(termeRecherche.toLowerCase()) ||
      (dem.billing?.siret?.toLowerCase() || '').includes(termeRecherche.toLowerCase()) ||
      (dem.provider?.name?.toLowerCase() || '').includes(termeRecherche.toLowerCase()) ||
      (dem.provider?.address?.toLowerCase() || '').includes(termeRecherche.toLowerCase()) ||
      (dem.delivery?.address?.toLowerCase() || '').includes(termeRecherche.toLowerCase()) ||
      (dem.items?.some((item) =>
        item.description?.toLowerCase().includes(termeRecherche.toLowerCase()) ||
        item.service?.toLowerCase().includes(termeRecherche.toLowerCase()) ||
        item.referenceDevis?.toLowerCase().includes(termeRecherche.toLowerCase())
      ) || false)
    const correspondStatut = filtreStatut === "tous" || dem.status === filtreStatut
    const correspondStation = filtreStation === "tous" || dem.codeStation === filtreStation

    return correspondRecherche && correspondStatut && correspondStation
  })

  const comptesStatut = {
    [PurchaseRequestStatus.BROUILLON]: (demandes || []).filter((d: DemandeFormData) => d.status === PurchaseRequestStatus.BROUILLON).length,
    [PurchaseRequestStatus.A_VERIFIER]: (demandes || []).filter((d: DemandeFormData) => d.status === PurchaseRequestStatus.A_VERIFIER).length,
    [PurchaseRequestStatus.A_MODIFIER]: (demandes || []).filter((d: DemandeFormData) => d.status === PurchaseRequestStatus.A_MODIFIER).length,
    [PurchaseRequestStatus.VALIDEE]: (demandes || []).filter((d: DemandeFormData) => d.status === PurchaseRequestStatus.VALIDEE).length,
    [PurchaseRequestStatus.REJETEE]: (demandes || []).filter((d: DemandeFormData) => d.status === PurchaseRequestStatus.REJETEE).length,
    [PurchaseRequestStatus.SUIVI_COMPTA]: (demandes || []).filter((d: DemandeFormData) => d.status === PurchaseRequestStatus.SUIVI_COMPTA).length,
    [PurchaseRequestStatus.EXPORTEE]: (demandes || []).filter((d: DemandeFormData) => d.status === PurchaseRequestStatus.EXPORTEE).length,
  }

  type ResumeCardConfig = {
    key: PurchaseRequestStatus
    label: string
    count: number
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    iconClassName: string
    valueClassName: string
  }

  const resumeCards: ResumeCardConfig[] = [
    {
      key: PurchaseRequestStatus.BROUILLON,
      label: "Brouillon",
      count: comptesStatut[PurchaseRequestStatus.BROUILLON],
      Icon: FileText,
      iconClassName: "text-gray-600",
      valueClassName: "text-gray-600",
    },
    {
      key: PurchaseRequestStatus.A_VERIFIER,
      label: "À vérifier",
      count: comptesStatut[PurchaseRequestStatus.A_VERIFIER],
      Icon: Clock,
      iconClassName: "text-blue-600",
      valueClassName: "text-blue-600",
    },
    {
      key: PurchaseRequestStatus.A_MODIFIER,
      label: "À modifier",
      count: comptesStatut[PurchaseRequestStatus.A_MODIFIER],
      Icon: Edit,
      iconClassName: "text-orange-600",
      valueClassName: "text-orange-600",
    },
    {
      key: PurchaseRequestStatus.VALIDEE,
      label: "Validées",
      count: comptesStatut[PurchaseRequestStatus.VALIDEE],
      Icon: CheckCircle,
      iconClassName: "text-green-600",
      valueClassName: "text-green-600",
    },
    {
      key: PurchaseRequestStatus.REJETEE,
      label: "Rejetées",
      count: comptesStatut[PurchaseRequestStatus.REJETEE],
      Icon: XCircle,
      iconClassName: "text-red-600",
      valueClassName: "text-red-600",
    },
    {
      key: PurchaseRequestStatus.SUIVI_COMPTA,
      label: "Suivi compta",
      count: comptesStatut[PurchaseRequestStatus.SUIVI_COMPTA],
      Icon: Clock,
      iconClassName: "text-purple-600",
      valueClassName: "text-purple-600",
    },
    {
      key: PurchaseRequestStatus.EXPORTEE,
      label: "Exportées",
      count: comptesStatut[PurchaseRequestStatus.EXPORTEE],
      Icon: Download,
      iconClassName: "text-indigo-600",
      valueClassName: "text-indigo-600",
    },
  ]

  const montantTotal = demandesFiltrees.reduce((somme: number, dem: DemandeFormData) => somme + (dem.total.total || 0), 0)

  const gererSoumissionFormulaire = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Créer une demande minimale avec le statut BROUILLON
      const demandeData: Partial<DemandeFormData> = {
        from: nouvelleDemande.from,
        codeStation: nouvelleDemande.codeStation,
        description: nouvelleDemande.description || "",
        date: new Date().toISOString(),
        priority: "LOW",
        status: PurchaseRequestStatus.BROUILLON,
        items: [], // Sera rempli plus tard
        total: {
          orderTotal: 0,
          total: 0,
        },
        files: fichiersDevis.length > 0 ? fichiersDevis.map((fichier) => ({
          name: fichier.name,
          category: 'quotations',
          uploadInstant: new Date().toISOString(),
        })) : [],
      }

      // Utiliser la mutation pour créer la demande avec le format multipart
      const createdDemande = await createDemandeMutation.mutateAsync({
        requests: demandeData,
        files: fichiersDevis
      })

      // Réinitialiser le formulaire
      setNouvelleDemande({
        from: "LAUBRAY",
        codeStation: CodeStation.CODE_06 as CodeStation,
        description: "",
      })
      setFichiersDevis([])

      // Fermer le modal
      setFormulaireOuvert(false)

      // Rediriger vers la page de détail de la nouvelle demande
      if (createdDemande.id) {
        router.push(`/demandes/${createdDemande.id}`)
      }
    } catch (error) {
      console.error('Erreur lors de la création de la demande:', error)
      alert(`Erreur lors de la création: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  }

  const gererChangementChamp = (champ: string, valeur: string) => {
    setNouvelleDemande((prev) => ({
      ...prev,
      [champ]: valeur,
    }))
  }

  const gererChangementFichiers = (files: File[]) => {
    setFichiersDevis(files)
  }

  // Affichage du loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 pt-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Chargement des demandes...</span>
          </div>
        </div>
      </div>
    )
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-800 font-semibold">Erreur lors du chargement</h2>
            <p className="text-red-600 mt-1">{error.message}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-2"
              variant="outline"
            >
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Titre et sous-titre */}
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">Suivi des Demandes d&apos;Achat</h1>
            <p className="text-gray-600 mt-1">Gérer et suivre les demandes d&apos;achat</p>
          </div>

          {/* Bouton Nouvelle Demande */}
          <div className="flex justify-center md:justify-end">
            <Dialog open={formulaireOuvert} onOpenChange={setFormulaireOuvert}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nouvelle Demande
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full md:max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle demande d&apos;achat</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations de base pour créer un brouillon de demande
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={gererSoumissionFormulaire} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-1">
                      <Label htmlFor="from" className="text-sm font-medium">
                        Demandeur *
                      </Label>
                      <Input
                        id="from"
                        value={nouvelleDemande.from}
                        onChange={(e) => gererChangementChamp("from", e.target.value)}
                        placeholder="Nom du demandeur"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <Label htmlFor="codeStation" className="text-sm font-medium">
                        Station *
                      </Label>
                      <Select
                        value={nouvelleDemande.codeStation}
                        onValueChange={(value: CodeStation) => {
                          gererChangementChamp("codeStation", value)
                        }}
                        required
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Sélectionner une station" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={CodeStation.CODE_00}>Siège</SelectItem>
                          <SelectItem value={CodeStation.CODE_06}>Cambre d&apos;Aze</SelectItem>
                          <SelectItem value={CodeStation.CODE_07}>Porté-Puymorens</SelectItem>
                          <SelectItem value={CodeStation.CODE_08}>Formiguères</SelectItem>
                          <SelectItem value={CodeStation.CODE_999}>Restauration</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-1">
                      <Label htmlFor="description" className="text-sm font-medium">
                        Description *
                      </Label>
                      <Input
                        id="description"
                        value={nouvelleDemande.description}
                        onChange={(e) => gererChangementChamp("description", e.target.value)}
                        placeholder="Description de la demande..."
                        className="mt-1"
                        required
                      />
                    </div>



                    <div className="md:col-span-2">
                      <Label htmlFor="devis" className="text-sm font-medium">
                        Devis
                      </Label>
                      <Input
                        id="devis"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        onChange={(e) => gererChangementFichiers(e.target.files ? Array.from(e.target.files) : [])}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-gray-500">* Champs obligatoires</p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormulaireOuvert(false)}
                        disabled={createDemandeMutation.isPending}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          createDemandeMutation.isPending ||
                          !nouvelleDemande.from ||
                          !nouvelleDemande.codeStation ||
                          !nouvelleDemande.description
                        }
                      >
                        {createDemandeMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Création...
                          </>
                        ) : (
                          "Créer le brouillon"
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Cartes de résumé */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
          {resumeCards.map(({ key, label, count, Icon, iconClassName, valueClassName }) => {
            const isActive = filtreStatut === key

            const ariaLabel = `Filtrer les demandes avec le statut ${label}`

            return (
              <Card
                key={key}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                aria-label={ariaLabel}
                onClick={() => handleResumeCardClick(key)}
                onKeyDown={(event) => handleResumeCardKeyDown(event, key)}
                className={cn(
                  "transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  "cursor-pointer border",
                  isActive ? "border-primary bg-primary/10" : "border-transparent hover:border-gray-200 hover:bg-white"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{label}</p>
                      <p className={cn("text-2xl font-bold", valueClassName)}>{count}</p>
                    </div>
                    <Icon className={cn("h-8 w-8", iconClassName)} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Valeur totale</p>
                  <p className="text-2xl font-bold text-gray-900">{montantTotal.toLocaleString()} €</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher des demandes..."
                  value={termeRecherche}
                  onChange={(e) => setTermeRecherche(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filtreStatut} onValueChange={handleStatutSelect}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les statuts</SelectItem>
                  <SelectItem value={PurchaseRequestStatus.BROUILLON}>Brouillon</SelectItem>
                  <SelectItem value={PurchaseRequestStatus.A_VERIFIER}>À vérifier</SelectItem>
                  <SelectItem value={PurchaseRequestStatus.A_MODIFIER}>À modifier</SelectItem>
                  <SelectItem value={PurchaseRequestStatus.VALIDEE}>Validée</SelectItem>
                  <SelectItem value={PurchaseRequestStatus.REJETEE}>Rejetée</SelectItem>
                  <SelectItem value={PurchaseRequestStatus.SUIVI_COMPTA}>Suivi compta</SelectItem>
                  <SelectItem value={PurchaseRequestStatus.EXPORTEE}>Exportée</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtreStation} onValueChange={setFiltreStation}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrer par station" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Toutes les stations</SelectItem>
                  <SelectItem value={CodeStation.CODE_00}>Siège</SelectItem>
                  <SelectItem value={CodeStation.CODE_06}>Cambre d&apos;Az</SelectItem>
                  <SelectItem value={CodeStation.CODE_07}>Porté-Puymorens</SelectItem>
                  <SelectItem value={CodeStation.CODE_08}>Formiguères</SelectItem>
                  <SelectItem value={CodeStation.CODE_999}>Restauration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des demandes */}
        <Card>
          <CardHeader>
            <CardTitle>Demandes ({demandesFiltrees.length})</CardTitle>
            <CardDescription>Gérer et suivre toutes les demandes d&apos;achat</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Demandeur</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demandesFiltrees.map((dem) => (
                  <TableRow
                    key={dem.id || 'unknown'}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => dem.id && router.push(`/demandes/${dem.id}`)}
                  >
                    <TableCell className="font-medium">{dem.from || 'N/A'}</TableCell>
                    <TableCell>{dem.date ? new Date(dem.date).toLocaleDateString("fr-FR") : 'N/A'}</TableCell>
                    <TableCell>{getStationName(dem.codeStation) || 'N/A'}</TableCell>
                    <TableCell className="max-w-xs truncate" title={dem.description || ''}>
                      {dem.description || 'Aucune description'}
                    </TableCell>
                    <TableCell>{(dem.total.total || 0).toLocaleString()} €</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={dem.priority === "HIGH" ? "bg-orange-100 text-orange-800 border-orange-200" : "bg-gray-100 text-gray-800 border-gray-200"}
                      >
                        {dem.priority === "HIGH" ? "Élevée" : "Faible"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getIconeStatut(dem.status || PurchaseRequestStatus.BROUILLON)}
                        <Badge variant="outline" className={getCouleurStatut(dem.status || PurchaseRequestStatus.BROUILLON)}>
                          {getLibelleStatut(dem.status || PurchaseRequestStatus.BROUILLON)}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 