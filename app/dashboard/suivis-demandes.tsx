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
import { Search, Eye, CheckCircle, XCircle, Clock, AlertCircle, Plus } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

interface Demande {
  id: string
  titre: string
  demandeur: string
  departement: string
  montant: number
  statut: "en-attente" | "approuve" | "rejete" | "en-cours-examen"
  priorite: "faible" | "moyenne" | "elevee" | "urgente"
  datesoumission: string
  description: string
  categorie: string
}

const demandesExemples: Demande[] = []

const getIconeStatut = (statut: string) => {
  switch (statut) {
    case "approuve":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "rejete":
      return <XCircle className="h-4 w-4 text-red-600" />
    case "en-cours-examen":
      return <Clock className="h-4 w-4 text-blue-600" />
    default:
      return <AlertCircle className="h-4 w-4 text-yellow-600" />
  }
}

const getCouleurStatut = (statut: string) => {
  switch (statut) {
    case "approuve":
      return "bg-green-100 text-green-800 border-green-200"
    case "rejete":
      return "bg-red-100 text-red-800 border-red-200"
    case "en-cours-examen":
      return "bg-blue-100 text-blue-800 border-blue-200"
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
  }
}

const getCouleurPriorite = (priorite: string) => {
  switch (priorite) {
    case "urgente":
      return "bg-red-100 text-red-800 border-red-200"
    case "elevee":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "moyenne":
      return "bg-blue-100 text-blue-800 border-blue-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getLibelleStatut = (statut: string) => {
  switch (statut) {
    case "en-attente":
      return "En attente"
    case "approuve":
      return "Approuvé"
    case "rejete":
      return "Rejeté"
    case "en-cours-examen":
      return "En cours d&aposexamen"
    default:
      return statut
  }
}

const getLibellePriorite = (priorite: string) => {
  switch (priorite) {
    case "faible":
      return "Faible"
    case "moyenne":
      return "Moyenne"
    case "elevee":
      return "Élevée"
    case "urgente":
      return "Urgente"
    default:
      return priorite
  }
}

export default function SuiviDemandes() {
  const [demandes, setDemandes] = useState<Demande[]>(demandesExemples)
  const [termeRecherche, setTermeRecherche] = useState("")
  const [filtreStatut, setFiltreStatut] = useState("tous")
  const [filtreDepartement, setFiltreDepartement] = useState("tous")
  const [, setDemandeSelectionnee] = useState<Demande | null>(null)

  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [nouvelleDemande, setNouvelleDemande] = useState({
    titre: "",
    description: "",
    montant: "",
    categorie: "",
    priorite: "moyenne" as const,
    departement: "",
  })

  const router = useRouter()

  const demandesFiltrees = demandes.filter((dem) => {
    const correspondRecherche =
      dem.titre.toLowerCase().includes(termeRecherche.toLowerCase()) ||
      dem.demandeur.toLowerCase().includes(termeRecherche.toLowerCase()) ||
      dem.id.toLowerCase().includes(termeRecherche.toLowerCase())
    const correspondStatut = filtreStatut === "tous" || dem.statut === filtreStatut
    const correspondDepartement = filtreDepartement === "tous" || dem.departement === filtreDepartement

    return correspondRecherche && correspondStatut && correspondDepartement
  })

  const comptesStatut = {
    "en-attente": demandes.filter((d) => d.statut === "en-attente").length,
    approuve: demandes.filter((d) => d.statut === "approuve").length,
    rejete: demandes.filter((d) => d.statut === "rejete").length,
    "en-cours-examen": demandes.filter((d) => d.statut === "en-cours-examen").length,
  }

  const montantTotal = demandesFiltrees.reduce((somme, dem) => somme + dem.montant, 0)

  const gererChangementStatut = (id: string, nouveauStatut: "approuve" | "rejete") => {
    setDemandes((prev) => prev.map((dem) => (dem.id === id ? { ...dem, statut: nouveauStatut } : dem)))
  }

  const gererSoumissionFormulaire = (e: React.FormEvent) => {
    e.preventDefault()

    // Générer un nouvel ID
    const nouvelId = `DEM-${String(demandes.length + 1).padStart(3, "0")}`

    // Créer la nouvelle demande
    const demande: Demande = {
      id: nouvelId,
      titre: nouvelleDemande.titre,
      demandeur: "Utilisateur Actuel", // En réalité, cela viendrait de l&aposauthentification
      departement: nouvelleDemande.departement,
      montant: Number.parseFloat(nouvelleDemande.montant),
      statut: "en-attente",
      priorite: nouvelleDemande.priorite,
      datesoumission: new Date().toISOString().split("T")[0],
      description: nouvelleDemande.description,
      categorie: nouvelleDemande.categorie,
    }

    // Ajouter la demande à la liste
    setDemandes((prev) => [demande, ...prev])

    // Réinitialiser le formulaire
    setNouvelleDemande({
      titre: "",
      description: "",
      montant: "",
      categorie: "",
      priorite: "moyenne",
      departement: "",
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Suivi des Demandes d&aposAchat</h1>
            <p className="text-gray-600 mt-1">Gérer et suivre les demandes d&aposachat</p>
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
                    <Label htmlFor="titre" className="text-sm font-medium">
                      Titre de la demande *
                    </Label>
                    <Input
                      id="titre"
                      value={nouvelleDemande.titre}
                      onChange={(e) => gererChangementChamp("titre", e.target.value)}
                      placeholder="Ex: Fournitures de bureau - T1"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="departement" className="text-sm font-medium">
                      Département *
                    </Label>
                    <Select
                      value={nouvelleDemande.departement}
                      onValueChange={(value) => gererChangementChamp("departement", value)}
                      required
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionner un département" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Informatique">Informatique</SelectItem>
                        <SelectItem value="Ventes">Ventes</SelectItem>
                        <SelectItem value="Ingénierie">Ingénierie</SelectItem>
                        <SelectItem value="Ressources Humaines">Ressources Humaines</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Operations">Opérations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="categorie" className="text-sm font-medium">
                      Catégorie *
                    </Label>
                    <Select
                      value={nouvelleDemande.categorie}
                      onValueChange={(value) => gererChangementChamp("categorie", value)}
                      required
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fournitures de bureau">Fournitures de bureau</SelectItem>
                        <SelectItem value="Logiciel">Logiciel</SelectItem>
                        <SelectItem value="Équipement">Équipement</SelectItem>
                        <SelectItem value="Voyage">Voyage</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Formation">Formation</SelectItem>
                        <SelectItem value="Services">Services</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="montant" className="text-sm font-medium">
                      Montant (€) *
                    </Label>
                    <Input
                      id="montant"
                      type="number"
                      step="0.01"
                      min="0"
                      value={nouvelleDemande.montant}
                      onChange={(e) => gererChangementChamp("montant", e.target.value)}
                      placeholder="0.00"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="priorite" className="text-sm font-medium">
                      Priorité
                    </Label>
                    <Select
                      value={nouvelleDemande.priorite}
                      onValueChange={(value: "faible" | "moyenne" | "elevee" | "urgente") =>
                        gererChangementChamp("priorite", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="faible">Faible</SelectItem>
                        <SelectItem value="moyenne">Moyenne</SelectItem>
                        <SelectItem value="elevee">Élevée</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description détaillée *
                    </Label>
                    <Textarea
                      id="description"
                      value={nouvelleDemande.description}
                      onChange={(e) => gererChangementChamp("description", e.target.value)}
                      placeholder="Décrivez en détail votre demande d&aposachat, incluant les spécifications, quantités, et justifications..."
                      required
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
                        !nouvelleDemande.titre ||
                        !nouvelleDemande.departement ||
                        !nouvelleDemande.categorie ||
                        !nouvelleDemande.montant ||
                        !nouvelleDemande.description
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600">{comptesStatut["en-attente"]}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En examen</p>
                  <p className="text-2xl font-bold text-blue-600">{comptesStatut["en-cours-examen"]}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approuvées</p>
                  <p className="text-2xl font-bold text-green-600">{comptesStatut["approuve"]}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
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
                  <SelectItem value="en-attente">En attente</SelectItem>
                  <SelectItem value="en-cours-examen">En cours d&aposexamen</SelectItem>
                  <SelectItem value="approuve">Approuvé</SelectItem>
                  <SelectItem value="rejete">Rejeté</SelectItem>
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
                  <TableHead>ID</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Demandeur</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demandesFiltrees.map((dem) => (
                  <TableRow
                    key={dem.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => router.push(`/demandes/${dem.id}`)}
                  >
                    <TableCell className="font-medium">{dem.id}</TableCell>
                    <TableCell>{dem.titre}</TableCell>
                    <TableCell>{dem.demandeur}</TableCell>
                    <TableCell>{dem.departement}</TableCell>
                    <TableCell>{dem.montant.toLocaleString()} €</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getCouleurPriorite(dem.priorite)}>
                        {getLibellePriorite(dem.priorite)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getIconeStatut(dem.statut)}
                        <Badge variant="outline" className={getCouleurStatut(dem.statut)}>
                          {getLibelleStatut(dem.statut)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(dem.datesoumission).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setDemandeSelectionnee(dem)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Détails de la demande - {dem.id}</DialogTitle>
                              <DialogDescription>Examiner et gérer cette demande</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Titre</Label>
                                  <p className="text-sm text-gray-600">{dem.titre}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Montant</Label>
                                  <p className="text-sm text-gray-600">{dem.montant.toLocaleString()} €</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Demandeur</Label>
                                  <p className="text-sm text-gray-600">{dem.demandeur}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Département</Label>
                                  <p className="text-sm text-gray-600">{dem.departement}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Catégorie</Label>
                                  <p className="text-sm text-gray-600">{dem.categorie}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Date de soumission</Label>
                                  <p className="text-sm text-gray-600">
                                    {new Date(dem.datesoumission).toLocaleDateString("fr-FR")}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Description</Label>
                                <p className="text-sm text-gray-600 mt-1">{dem.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium">Statut actuel :</Label>
                                <div className="flex items-center gap-2">
                                  {getIconeStatut(dem.statut)}
                                  <Badge variant="outline" className={getCouleurStatut(dem.statut)}>
                                    {getLibelleStatut(dem.statut)}
                                  </Badge>
                                </div>
                              </div>
                              {dem.statut === "en-attente" && (
                                <div className="flex gap-2 pt-4">
                                  <Button
                                    onClick={() => gererChangementStatut(dem.id, "approuve")}
                                    className="flex items-center gap-2"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    Approuver
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => gererChangementStatut(dem.id, "rejete")}
                                    className="flex items-center gap-2"
                                  >
                                    <XCircle className="h-4 w-4" />
                                    Rejeter
                                  </Button>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        {dem.statut === "en-attente" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => gererChangementStatut(dem.id, "approuve")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => gererChangementStatut(dem.id, "rejete")}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
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
