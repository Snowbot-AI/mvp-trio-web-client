"use client"

import type React from "react"
import { useState } from "react"
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
import { Search, CheckCircle, XCircle, Clock, Plus, Loader2, FileText, Edit, Archive } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { Demande, getStationName, PurchaseRequestStatus } from "./types"
import { useDemandes } from "./hooks"

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


export default function DemandesPage() {
  const [termeRecherche, setTermeRecherche] = useState("")
  const [filtreStatut, setFiltreStatut] = useState("tous")
  const [filtreDepartement, setFiltreDepartement] = useState("tous")

  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [nouvelleDemande, setNouvelleDemande] = useState({
    name: "",
    description: "",
    total: 0,
    service: "",
    priority: "LOW" as const,
    from: "",
  })

  const router = useRouter()

  // Utiliser React Query pour récupérer les demandes
  const { data: demandes, isLoading, error } = useDemandes()

  const demandesFiltrees = (demandes || []).filter((dem: Demande) => {
    const correspondRecherche =
      (dem.name?.toLowerCase() || '').includes(termeRecherche.toLowerCase()) ||
      (dem.from?.toLowerCase() || '').includes(termeRecherche.toLowerCase()) ||
      (dem.id?.toLowerCase() || '').includes(termeRecherche.toLowerCase())
    const correspondStatut = filtreStatut === "tous" || dem.status === filtreStatut
    const correspondDepartement = filtreDepartement === "tous" || dem.from === filtreDepartement

    return correspondRecherche && correspondStatut && correspondDepartement
  })

  const comptesStatut = {
    [PurchaseRequestStatus.BROUILLON]: (demandes || []).filter((d: Demande) => d.status === PurchaseRequestStatus.BROUILLON).length,
    [PurchaseRequestStatus.A_VERIFIER]: (demandes || []).filter((d: Demande) => d.status === PurchaseRequestStatus.A_VERIFIER).length,
    [PurchaseRequestStatus.A_MODIFIER]: (demandes || []).filter((d: Demande) => d.status === PurchaseRequestStatus.A_MODIFIER).length,
    [PurchaseRequestStatus.VALIDEE]: (demandes || []).filter((d: Demande) => d.status === PurchaseRequestStatus.VALIDEE).length,
    [PurchaseRequestStatus.REJETEE]: (demandes || []).filter((d: Demande) => d.status === PurchaseRequestStatus.REJETEE).length,
    [PurchaseRequestStatus.EXPORTEE]: (demandes || []).filter((d: Demande) => d.status === PurchaseRequestStatus.EXPORTEE).length,
  }

  const montantTotal = demandesFiltrees.reduce((somme: number, dem: Demande) => somme + (dem.total.total || 0), 0)

  const gererSoumissionFormulaire = (e: React.FormEvent) => {
    e.preventDefault()

    // TODO: Implémenter la création de demande avec le bon format
    console.log("Création de demande:", nouvelleDemande)

    // Réinitialiser le formulaire
    setNouvelleDemande({
      name: "",
      description: "",
      total: 0,
      service: "",
      priority: "LOW",
      from: "",
    })
    // Fermer le modal
    setFormulaireOuvert(false)
  }

  const gererChangementChamp = (champ: string, valeur: string) => {
    setNouvelleDemande((prev) => ({
      ...prev,
      [champ]: valeur,
    }))
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Suivi des Demandes d&apos;Achat</h1>
            <p className="text-gray-600 mt-1">Gérer et suivre les demandes d&apos;achat</p>
          </div>
          <Dialog open={formulaireOuvert} onOpenChange={setFormulaireOuvert}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle Demande
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle demande d&aposachat</DialogTitle>
                <DialogDescription>
                  Remplissez les informations ci-dessous pour soumettre votre demande d&aposachat
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={gererSoumissionFormulaire} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Nom de la demande *
                    </Label>
                    <Input
                      id="name"
                      value={nouvelleDemande.name}
                      onChange={(e) => gererChangementChamp("name", e.target.value)}
                      placeholder="Ex: Fournitures de bureau - T1"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
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

                  <div>
                    <Label htmlFor="service" className="text-sm font-medium">
                      Service *
                    </Label>
                    <Select
                      value={nouvelleDemande.service}
                      onValueChange={(value) => gererChangementChamp("service", value)}
                      required
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionner un service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACC">Accueil</SelectItem>
                        <SelectItem value="ADM">Admin</SelectItem>
                        <SelectItem value="BAT">Bâtiment</SelectItem>
                        <SelectItem value="BIL">Billetterie</SelectItem>
                        <SelectItem value="COM">Communication</SelectItem>
                        <SelectItem value="DAM">Dammage</SelectItem>
                        <SelectItem value="PAR">Parc de roulage</SelectItem>
                        <SelectItem value="PIS">Pistes</SelectItem>
                        <SelectItem value="REST">Restaurant</SelectItem>
                        <SelectItem value="RM">Remontée mécanique</SelectItem>
                        <SelectItem value="USI">Snowmaker</SelectItem>
                        <SelectItem value="AUT">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="total" className="text-sm font-medium">
                      Montant total (€) *
                    </Label>
                    <Input
                      id="total"
                      type="number"
                      step="0.01"
                      min="0"
                      value={nouvelleDemande.total}
                      onChange={(e) => gererChangementChamp("total", e.target.value)}
                      placeholder="0.00"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="priority" className="text-sm font-medium">
                      Priorité
                    </Label>
                    <Select
                      value={nouvelleDemande.priority}
                      onValueChange={(value: "HIGH" | "LOW") =>
                        gererChangementChamp("priority", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Faible</SelectItem>
                        <SelectItem value="HIGH">Élevée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={nouvelleDemande.description}
                      onChange={(e) => gererChangementChamp("description", e.target.value)}
                      placeholder="Description de la demande..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-gray-500">* Champs obligatoires</p>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setFormulaireOuvert(false)}>
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        !nouvelleDemande.name ||
                        !nouvelleDemande.from ||
                        !nouvelleDemande.service ||
                        !nouvelleDemande.total
                      }
                    >
                      Soumettre la demande
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cartes de résumé */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Brouillon</p>
                  <p className="text-2xl font-bold text-gray-600">{comptesStatut[PurchaseRequestStatus.BROUILLON]}</p>
                </div>
                <FileText className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">À vérifier</p>
                  <p className="text-2xl font-bold text-blue-600">{comptesStatut[PurchaseRequestStatus.A_VERIFIER]}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">À modifier</p>
                  <p className="text-2xl font-bold text-orange-600">{comptesStatut[PurchaseRequestStatus.A_MODIFIER]}</p>
                </div>
                <Edit className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Validées</p>
                  <p className="text-2xl font-bold text-green-600">{comptesStatut[PurchaseRequestStatus.VALIDEE]}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Exportées</p>
                  <p className="text-2xl font-bold text-purple-600">{comptesStatut[PurchaseRequestStatus.EXPORTEE]}</p>
                </div>
                <Archive className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
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
              <Select value={filtreStatut} onValueChange={setFiltreStatut}>
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
                  <SelectItem value={PurchaseRequestStatus.EXPORTEE}>Exportée</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtreDepartement} onValueChange={setFiltreDepartement}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrer par département" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les départements</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Informatique">Informatique</SelectItem>
                  <SelectItem value="Ventes">Ventes</SelectItem>
                  <SelectItem value="Ingénierie">Ingénierie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des demandes */}
        <Card>
          <CardHeader>
            <CardTitle>Demandes ({demandesFiltrees.length})</CardTitle>
            <CardDescription>Gérer et suivre toutes les demandes d&aposachat</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Demandeur</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Montant</TableHead>
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
                    <TableCell>{getStationName(dem.code) || 'N/A'}</TableCell>
                    <TableCell className="max-w-xs truncate" title={dem.description || ''}>
                      {dem.description || 'Aucune description'}
                    </TableCell>
                    <TableCell>{(dem.total.total || 0).toLocaleString()} €</TableCell>
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