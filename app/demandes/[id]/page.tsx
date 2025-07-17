"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Building,
  Euro,
  Tag,
  FileText,
  Upload,
  File,
  Trash2,
  Plus,
} from "lucide-react"

interface ArticleDemande {
  id: string
  service: string
  type: string
  giger: string
  invest: string
  fonct: string
  designation: string
  quantite: number
  prixUnitaire: number
  montant: number
}

interface PieceJointe {
  id: string
  nom: string
  taille: number
  type: string
  url: string
}

interface Demande {
  id: string
  titre: string
  demandeur: string
  departement: string
  statut: "en-attente" | "approuve" | "rejete" | "en-cours-examen"
  priorite: "faible" | "moyenne" | "elevee" | "urgente"
  datesoumission: string
  dateLivraisonSouhaitee: string
  description: string
  categorie: string

  // Informations fournisseur
  fournisseur: string
  adresseFournisseur: string
  telFournisseur: string
  emailFournisseur: string

  // Adresse de livraison
  adresseLivraison: string
  telContactLivraison: string

  // Articles
  articles: ArticleDemande[]

  // Totaux
  totalCommandeHT: number
  participationLivraison: number
  fraisFacturation: number
  totalHT: number

  // Validation et commentaires
  commentaire: string
  signatureDemandeur: boolean
  validationResponsable: boolean

  // Pièces jointes
  piecesJointes: PieceJointe[]
}

// Simulation des données étendues
const demandesExemples: Demande[] = [
  {
    id: "DEM-001",
    titre: "Fournitures de bureau - T1",
    demandeur: "Sarah Dubois",
    departement: "Marketing",
    statut: "en-attente",
    priorite: "moyenne",
    datesoumission: "2024-01-15",
    dateLivraisonSouhaitee: "2024-02-01",
    description: "Fournitures de bureau trimestrielles",
    categorie: "Fournitures de bureau",
    fournisseur: "Bureau Vallée",
    adresseFournisseur: "123 Rue du Commerce, 66000 Perpignan",
    telFournisseur: "04 68 12 34 56",
    emailFournisseur: "contact@bureau-vallee.fr",
    adresseLivraison: "Formiguères - Station La Calmazeille, 66210 FORMIGUERES",
    telContactLivraison: "04 68 04 47 35",
    articles: [
      {
        id: "1",
        service: "Marketing",
        type: "B",
        giger: "MAR001",
        invest: "Non",
        fonct: "ADM",
        designation: "Papier A4 80g - Ramette 500 feuilles",
        quantite: 10,
        prixUnitaire: 4.5,
        montant: 45.0,
      },
      {
        id: "2",
        service: "Marketing",
        type: "B",
        giger: "MAR002",
        invest: "Non",
        fonct: "ADM",
        designation: "Stylos bille bleu - Lot de 10",
        quantite: 5,
        prixUnitaire: 8.9,
        montant: 44.5,
      },
    ],
    totalCommandeHT: 89.5,
    participationLivraison: 15.0,
    fraisFacturation: 2.5,
    totalHT: 107.0,
    commentaire: "Livraison urgente pour début de trimestre",
    signatureDemandeur: true,
    validationResponsable: false,
    piecesJointes: [
      {
        id: "1",
        nom: "devis-bureau-vallee.pdf",
        taille: 245760,
        type: "application/pdf",
        url: "/placeholder-document.pdf",
      },
    ],
  },
]

const getIconeStatut = (statut: string) => {
  switch (statut) {
    case "approuve":
      return <CheckCircle className="h-5 w-5 text-green-600" />
    case "rejete":
      return <XCircle className="h-5 w-5 text-red-600" />
    case "en-cours-examen":
      return <Clock className="h-5 w-5 text-blue-600" />
    default:
      return <AlertCircle className="h-5 w-5 text-yellow-600" />
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
      return "En cours d'examen"
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

const formatTailleFichier = (taille: number) => {
  if (taille < 1024) return `${taille} B`
  if (taille < 1024 * 1024) return `${(taille / 1024).toFixed(1)} KB`
  return `${(taille / (1024 * 1024)).toFixed(1)} MB`
}

export default function DetailDemande({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [demande, setDemande] = useState<Demande | null>(null)
  const [modeEdition, setModeEdition] = useState(false)
  const [demandeModifiee, setDemandeModifiee] = useState<Demande | null>(null)
  const [nouvelArticle, setNouvelArticle] = useState<Partial<ArticleDemande>>({})
  const [ajoutArticle, setAjoutArticle] = useState(false)

  useEffect(() => {
    const demandeFound = demandesExemples.find((d) => d.id === params.id)
    if (demandeFound) {
      setDemande(demandeFound)
      setDemandeModifiee(demandeFound)
    }
  }, [params.id])

  const gererSauvegarde = () => {
    if (demandeModifiee) {
      setDemande(demandeModifiee)
      setModeEdition(false)
      console.log("Demande sauvegardée:", demandeModifiee)
    }
  }

  const gererAnnulation = () => {
    setDemandeModifiee(demande)
    setModeEdition(false)
    setAjoutArticle(false)
  }

  const gererChangementStatut = (nouveauStatut: "approuve" | "rejete" | "en-cours-examen") => {
    if (demande) {
      const demandeUpdated = { ...demande, statut: nouveauStatut }
      setDemande(demandeUpdated)
      setDemandeModifiee(demandeUpdated)
      console.log("Statut changé:", nouveauStatut)
    }
  }

  const gererChangementChamp = (champ: keyof Demande, valeur: string) => {
    if (demandeModifiee) {
      setDemandeModifiee({
        ...demandeModifiee,
        [champ]: valeur,
      })
    }
  }

  const gererUploadFichier = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fichiers = event.target.files
    if (fichiers && demandeModifiee) {
      const nouveauxFichiers: PieceJointe[] = Array.from(fichiers).map((fichier, index) => ({
        id: `${Date.now()}-${index}`,
        nom: fichier.name,
        taille: fichier.size,
        type: fichier.type,
        url: URL.createObjectURL(fichier),
      }))

      setDemandeModifiee({
        ...demandeModifiee,
        piecesJointes: [...demandeModifiee.piecesJointes, ...nouveauxFichiers],
      })
    }
  }

  const gererSuppressionFichier = (idFichier: string) => {
    if (demandeModifiee) {
      setDemandeModifiee({
        ...demandeModifiee,
        piecesJointes: demandeModifiee.piecesJointes.filter((f) => f.id !== idFichier),
      })
    }
  }

  const ajouterArticle = () => {
    if (demandeModifiee && nouvelArticle.designation) {
      const article: ArticleDemande = {
        id: Date.now().toString(),
        service: nouvelArticle.service || "",
        type: nouvelArticle.type || "B",
        giger: nouvelArticle.giger || "",
        invest: nouvelArticle.invest || "Non",
        fonct: nouvelArticle.fonct || "",
        designation: nouvelArticle.designation,
        quantite: nouvelArticle.quantite || 1,
        prixUnitaire: nouvelArticle.prixUnitaire || 0,
        montant: (nouvelArticle.quantite || 1) * (nouvelArticle.prixUnitaire || 0),
      }

      setDemandeModifiee({
        ...demandeModifiee,
        articles: [...demandeModifiee.articles, article],
      })

      setNouvelArticle({})
      setAjoutArticle(false)
    }
  }

  const supprimerArticle = (idArticle: string) => {
    if (demandeModifiee) {
      setDemandeModifiee({
        ...demandeModifiee,
        articles: demandeModifiee.articles.filter((a) => a.id !== idArticle),
      })
    }
  }

  if (!demande) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Demande non trouvée</h2>
          <p className="text-gray-600 mb-4">La demande avec l&aposID {params.id} n&aposexiste pas.</p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Demande {demande.id}</h1>
              <p className="text-gray-600 mt-1">TRIO PYRÉNÉES - Station de Formiguères</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {modeEdition ? (
              <>
                <Button variant="outline" onClick={gererAnnulation}>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button onClick={gererSauvegarde}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
              </>
            ) : (
              <Button onClick={() => setModeEdition(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
        </div>

        {/* Statut et actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {getIconeStatut(demande.statut)}
                  <Badge variant="outline" className={`${getCouleurStatut(demande.statut)} text-lg px-3 py-1`}>
                    {getLibelleStatut(demande.statut)}
                  </Badge>
                </div>
                <Badge variant="outline" className={getCouleurPriorite(demande.priorite)}>
                  Priorité {getLibellePriorite(demande.priorite)}
                </Badge>
              </div>

              {demande.statut === "en-attente" && (
                <div className="flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approuver
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Approuver la demande</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir approuver cette demande d&aposachat ? Cette action ne peut pas être
                          annulée.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => gererChangementStatut("approuve")}>
                          Confirmer l&aposapprobation
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeter
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Rejeter la demande</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir rejeter cette demande d&aposachat ? Cette action ne peut pas être
                          annulée.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => gererChangementStatut("rejete")}>
                          Confirmer le rejet
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button variant="outline" onClick={() => gererChangementStatut("en-cours-examen")}>
                    <Clock className="h-4 w-4 mr-2" />
                    Mettre en examen
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Titre de la demande</Label>
                    {modeEdition ? (
                      <Input
                        value={demandeModifiee?.titre || ""}
                        onChange={(e) => gererChangementChamp("titre", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-lg font-semibold mt-1">{demande.titre}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Date de livraison souhaitée</Label>
                    {modeEdition ? (
                      <Input
                        type="date"
                        value={demandeModifiee?.dateLivraisonSouhaitee || ""}
                        onChange={(e) => gererChangementChamp("dateLivraisonSouhaitee", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1">{new Date(demande.dateLivraisonSouhaitee).toLocaleDateString("fr-FR")}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  {modeEdition ? (
                    <Textarea
                      value={demandeModifiee?.description || ""}
                      onChange={(e) => gererChangementChamp("description", e.target.value)}
                      rows={3}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-gray-700 mt-1">{demande.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informations fournisseur */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informations fournisseur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Nom du fournisseur</Label>
                    {modeEdition ? (
                      <Input
                        value={demandeModifiee?.fournisseur || ""}
                        onChange={(e) => gererChangementChamp("fournisseur", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 font-medium">{demande.fournisseur}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Téléphone</Label>
                    {modeEdition ? (
                      <Input
                        value={demandeModifiee?.telFournisseur || ""}
                        onChange={(e) => gererChangementChamp("telFournisseur", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1">{demande.telFournisseur}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Adresse</Label>
                  {modeEdition ? (
                    <Textarea
                      value={demandeModifiee?.adresseFournisseur || ""}
                      onChange={(e) => gererChangementChamp("adresseFournisseur", e.target.value)}
                      rows={2}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1">{demande.adresseFournisseur}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  {modeEdition ? (
                    <Input
                      type="email"
                      value={demandeModifiee?.emailFournisseur || ""}
                      onChange={(e) => gererChangementChamp("emailFournisseur", e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1">{demande.emailFournisseur}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Articles commandés */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Articles commandés
                  </div>
                  {modeEdition && (
                    <Button size="sm" onClick={() => setAjoutArticle(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Désignation</TableHead>
                      <TableHead>Qté</TableHead>
                      <TableHead>Prix unit.</TableHead>
                      <TableHead>Montant</TableHead>
                      {modeEdition && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demandeModifiee?.articles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell>{article.service}</TableCell>
                        <TableCell>{article.type}</TableCell>
                        <TableCell>{article.designation}</TableCell>
                        <TableCell>{article.quantite}</TableCell>
                        <TableCell>{article.prixUnitaire.toFixed(2)} €</TableCell>
                        <TableCell className="font-medium">{article.montant.toFixed(2)} €</TableCell>
                        {modeEdition && (
                          <TableCell>
                            <Button size="sm" variant="destructive" onClick={() => supprimerArticle(article.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}

                    {ajoutArticle && (
                      <TableRow>
                        <TableCell>
                          <Input
                            placeholder="Service"
                            value={nouvelArticle.service || ""}
                            onChange={(e) => setNouvelArticle({ ...nouvelArticle, service: e.target.value })}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={nouvelArticle.type || "B"}
                            onValueChange={(value) => setNouvelArticle({ ...nouvelArticle, type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="H">H</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Désignation"
                            value={nouvelArticle.designation || ""}
                            onChange={(e) => setNouvelArticle({ ...nouvelArticle, designation: e.target.value })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="1"
                            value={nouvelArticle.quantite || ""}
                            onChange={(e) => setNouvelArticle({ ...nouvelArticle, quantite: Number(e.target.value) })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={nouvelArticle.prixUnitaire || ""}
                            onChange={(e) =>
                              setNouvelArticle({ ...nouvelArticle, prixUnitaire: Number(e.target.value) })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {((nouvelArticle.quantite || 0) * (nouvelArticle.prixUnitaire || 0)).toFixed(2)} €
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" onClick={ajouterArticle}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setAjoutArticle(false)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pièces jointes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <File className="h-5 w-5" />
                  Pièces jointes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {modeEdition && (
                  <div>
                    <Label htmlFor="upload" className="text-sm font-medium">
                      Ajouter des fichiers (factures, devis...)
                    </Label>
                    <div className="mt-2">
                      <input
                        id="upload"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={gererUploadFichier}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById("upload")?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Sélectionner des fichiers
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {demandeModifiee?.piecesJointes.map((fichier) => (
                    <div key={fichier.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <File className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{fichier.nom}</p>
                          <p className="text-sm text-gray-500">{formatTailleFichier(fichier.taille)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          Télécharger
                        </Button>
                        {modeEdition && (
                          <Button size="sm" variant="destructive" onClick={() => gererSuppressionFichier(fichier.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {demandeModifiee?.piecesJointes.length === 0 && (
                    <p className="text-gray-500 text-center py-4">Aucune pièce jointe</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Totaux */}
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
                  <span className="font-medium">{demande.totalCommandeHT.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Participation livraison :</span>
                  <span className="font-medium">{demande.participationLivraison.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Frais de facturation :</span>
                  <span className="font-medium">{demande.fraisFacturation.toFixed(2)} €</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total HT :</span>
                  <span className="text-green-600">{demande.totalHT.toFixed(2)} €</span>
                </div>
              </CardContent>
            </Card>

            {/* Informations du demandeur */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Demandeur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nom</Label>
                  <p className="font-medium">{demande.demandeur}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Département</Label>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span>{demande.departement}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Signature demandeur</Label>
                  <div className="flex items-center gap-2">
                    {demande.signatureDemandeur ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span>{demande.signatureDemandeur ? "Signée" : "Non signée"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Dates importantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Date de soumission</Label>
                  <p>{new Date(demande.datesoumission).toLocaleDateString("fr-FR")}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Livraison souhaitée</Label>
                  <p>{new Date(demande.dateLivraisonSouhaitee).toLocaleDateString("fr-FR")}</p>
                </div>
              </CardContent>
            </Card>

            {/* Livraison */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de livraison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Adresse</Label>
                  <p className="text-sm">{demande.adresseLivraison}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Téléphone contact</Label>
                  <p>{demande.telContactLivraison}</p>
                </div>
              </CardContent>
            </Card>

            {/* Commentaires */}
            {demande.commentaire && (
              <Card>
                <CardHeader>
                  <CardTitle>Commentaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{demande.commentaire}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
