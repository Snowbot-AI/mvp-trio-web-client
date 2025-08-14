import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer'
import { getStationName } from '../../types'
import { DemandeFormData } from '../../validation-schema'

// Enregistrer les polices (optionnel - utilise les polices par défaut si non disponible)
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf', fontWeight: 'normal' },
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfB.ttf', fontWeight: 'bold' },
    ]
})

// Styles pour le PDF - Style professionnel correspondant au document modèle
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 15,
        fontFamily: 'Helvetica',
        fontSize: 9,
    },

    // En-tête avec logo et titre
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottom: '2px solid #000000',
    },
    logoContainer: {
        width: '100px',
        height: '60px',
    },
    logoImage: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        color: 'black',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    mainTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 3,
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 12,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    pageInfo: {
        width: '120px',
        alignItems: 'flex-end',
    },
    pageNumber: {
        fontSize: 10,
        marginBottom: 5,
    },
    documentDate: {
        fontSize: 8,
        color: '#666666',
    },

    // Section d'informations principales
    infoSection: {
        marginBottom: 10,
        border: '1px solid #000000',
    },
    infoGrid: {
        flexDirection: 'row',
        borderBottom: '1px solid #000000',
    },
    infoColumn: {
        flex: 1,
        padding: 6,
    },
    infoBorder: {
        borderRight: '1px solid #000000',
    },
    infoLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 10,
        minHeight: 12,
    },

    // Cases à cocher
    checkboxRow: {
        flexDirection: 'row',
        padding: 6,
        alignItems: 'center',
    },
    checkbox: {
        width: 12,
        height: 12,
        border: '1px solid #000000',
        marginRight: 5,
        textAlign: 'center',
        fontSize: 8,
    },
    checkboxLabel: {
        fontSize: 9,
        marginRight: 15,
    },

    // Tableau des articles
    table: {
        border: '1px solid #000000',
        marginBottom: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderBottom: '1px solid #000000',
    },
    tableHeaderCell: {
        fontSize: 8,
        fontWeight: 'bold',
        padding: 4,
        textAlign: 'center',
        borderRight: '1px solid #000000',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1px solid #000000',
        minHeight: 16,
    },
    tableCell: {
        fontSize: 8,
        padding: 4,
        borderRight: '1px solid #000000',
        textAlign: 'center',
        justifyContent: 'center',
    },
    tableCellLeft: {
        textAlign: 'left',
    },

    // Colonnes du tableau
    colDesignation: { width: '20%' },
    colService: { width: '12%' },
    colGER: { width: '8%' },
    colINVEST: { width: '8%' },
    colFONCT: { width: '8%' },
    colQuantite: { width: '10%' },
    colPrixUnit: { width: '12%' },
    colMontant: { width: '12%' },
    colNoBorder: { borderRight: 'none' },

    // Section totaux
    totalSection: {
        marginBottom: 8,
    },
    totalGrid: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    totalBox: {
        width: '200px',
        border: '1px solid #000000',
    },
    totalRow: {
        flexDirection: 'row',
        borderBottom: '1px solid #000000',
        paddingVertical: 3,
        paddingHorizontal: 8,
    },
    totalLabel: {
        fontSize: 9,
        width: '70%',
    },
    totalValue: {
        fontSize: 9,
        width: '30%',
        textAlign: 'right',
        fontWeight: 'bold',
    },
    grandTotalRow: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 3,
        paddingHorizontal: 8,
    },
    grandTotalText: {
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'right',
    },

    // Section signature et validation
    signatureSection: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBox: {
        width: '45%',
        border: '1px solid #000000',
        padding: 8,
        minHeight: 60,
    },
    signatureTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    signatureContent: {
        fontSize: 8,
        marginBottom: 3,
    },

    // Pied de page
    footer: {
        position: 'absolute',
        bottom: 15,
        left: 15,
        right: 15,
        fontSize: 6,
        textAlign: 'center',
        color: '#666666',
        borderTop: '1px solid #cccccc',
        paddingTop: 3,
    },

})

// Fonction pour formater les dates
const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

// Remplace les espaces insécables étroits (U+202F) et insécables (U+00A0) par des espaces normaux pour compatibilité PDF
const normalizeFrenchSpaces = (value: string): string => value.replace(/\u202F/g, ' ').replace(/\u00A0/g, ' ')

// Fonction pour formater les montants
const formatAmount = (amount: number): string => {
    const formatted = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount)
    return normalizeFrenchSpaces(formatted)
}
// Fonction pour générer le numéro de demande
const generateRequestNumber = (demande: DemandeFormData) => {
    const date = new Date(demande.date)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    // Utiliser le service du premier article ou un service par défaut
    const serviceCode = demande.items?.[0]?.service || ''

    // Utiliser le nom du fournisseur ou un nom par défaut
    const providerName = demande.provider?.name || ''

    // code station
    const stationCode = demande.codeStation

    return `${year}-${month}-${day}-${serviceCode}-${stationCode}-${providerName}`
}


// Composant principal du PDF - Format professionnel
export const DemandePDF = ({ demande }: { demande: DemandeFormData }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* En-tête avec logo, titre et infos page */}
            <View style={styles.header}>
                {/* Logo Trio */}
                <View style={styles.logoContainer}>
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <Image
                        style={styles.logoImage}
                        src="/logoTrio.png"
                    />
                </View>

                {/* Titre principal */}
                <View style={styles.titleContainer}>
                    <Text style={styles.mainTitle}>DEMANDE D&apos;ACHAT</Text>
                    <Text style={styles.subtitle}>SITE {getStationName(demande.codeStation).toUpperCase()}</Text>
                </View>

                {/* Informations de page */}
                <View style={styles.pageInfo}>
                    <Text style={styles.pageNumber}>Page 1 / 1</Text>
                    <Text style={styles.documentDate}>
                        Procédure Achats{'\n'}
                        Demande d&apos;achat{'\n'}
                        du {formatDate(new Date().toISOString())}
                    </Text>
                </View>
            </View>

            {/* Section informations principales */}
            <View style={styles.infoSection}>
                {/* Première ligne - Facturation et N° demande */}
                <View style={styles.infoGrid}>
                    <View style={[styles.infoColumn, styles.infoBorder]}>
                        <Text style={styles.infoLabel}>Facturation :</Text>
                        <Text style={styles.infoValue}>SPL Trio-Pyrénées</Text>
                        <Text style={styles.infoValue}>Site {getStationName(demande.codeStation)}</Text>
                        <Text style={styles.infoValue}>66210 Saint-Pierre dels Forcats</Text>
                        <Text style={styles.infoValue}>Mails facturation :</Text>
                        <Text style={styles.infoValue}>{demande.billing?.emails?.[0] || ''}</Text>
                        <Text style={styles.infoValue}>SIRET {demande.billing?.siret || ''}</Text>
                    </View>
                    <View style={styles.infoColumn}>
                        <Text style={styles.infoLabel}>N° demande :</Text>
                        <Text style={styles.infoValue}>{generateRequestNumber(demande)}</Text>
                        <Text style={styles.infoLabel}>Date demande :</Text>
                        <Text style={styles.infoValue}>{formatDate(demande.date)}</Text>
                        <Text style={styles.infoLabel}>Date livraison souhaitée :</Text>
                        <Text style={styles.infoValue}>{formatDate(demande.deliveryDate || null)}</Text>
                        <Text style={styles.infoLabel}>Emis par :</Text>
                        <Text style={styles.infoValue}>{demande.from}</Text>
                    </View>
                </View>

                {/* Deuxième ligne - Adresse de livraison et Fournisseur */}
                <View style={styles.infoGrid}>
                    <View style={[styles.infoColumn, styles.infoBorder]}>
                        <Text style={styles.infoLabel}>Adresse de livraison :</Text>
                        <Text style={styles.infoValue}>Station de ski de Saint-Pierre</Text>
                        <Text style={styles.infoValue}>66210 Saint-Pierre dels Forcats</Text>
                        <Text style={styles.infoValue}></Text>
                        <Text style={styles.infoValue}>Tel :</Text>
                        <Text style={styles.infoValue}>Mail :</Text>
                    </View>
                    <View style={styles.infoColumn}>
                        <Text style={styles.infoLabel}>Fournisseur :</Text>
                        <Text style={styles.infoValue}>{demande.provider?.name || ''}</Text>
                        <Text style={styles.infoLabel}>Adresse :</Text>
                        <Text style={styles.infoValue}>{demande.provider?.address || ''}</Text>
                        <Text style={styles.infoLabel}>Tel :</Text>
                        <Text style={styles.infoValue}>{demande.provider?.tel || ''}</Text>
                        <Text style={styles.infoLabel}>Mail :</Text>
                        <Text style={styles.infoValue}>{demande.provider?.email || ''}</Text>
                    </View>
                </View>

                {/* Cases à cocher pour validation */}
                <View style={styles.checkboxRow}>
                    <Text style={styles.checkbox}>{demande.priority === 'HIGH' ? 'X' : ''}</Text>
                    <Text style={styles.checkboxLabel}>Demande urgente</Text>
                </View>
            </View>

            {/* Tableau des articles */}
            <View style={styles.table}>
                {/* En-tête du tableau */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, styles.colDesignation]}>Désignation</Text>
                    <Text style={[styles.tableHeaderCell, styles.colService]}>Service</Text>
                    <Text style={[styles.tableHeaderCell, styles.colGER]}>GER</Text>
                    <Text style={[styles.tableHeaderCell, styles.colINVEST]}>INVEST</Text>
                    <Text style={[styles.tableHeaderCell, styles.colFONCT]}>FONCT</Text>
                    <Text style={[styles.tableHeaderCell, styles.colQuantite]}>Quantité</Text>
                    <Text style={[styles.tableHeaderCell, styles.colPrixUnit]}>Prix unit.</Text>
                    <Text style={[styles.tableHeaderCell, styles.colMontant, styles.colNoBorder]}>Montant</Text>
                </View>

                {/* Lignes du tableau */}
                {demande.items?.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.tableCellLeft, styles.colDesignation]}>{item.description}</Text>
                        <Text style={[styles.tableCell, styles.colService]}>{item.service}</Text>
                        <Text style={[styles.tableCell, styles.colGER]}>{item.itemType === 'ger' ? 'X' : ''}</Text>
                        <Text style={[styles.tableCell, styles.colINVEST]}>{item.itemType === 'invest' ? 'X' : ''}</Text>
                        <Text style={[styles.tableCell, styles.colFONCT]}>{item.itemType === 'funct' ? 'X' : ''}</Text>
                        <Text style={[styles.tableCell, styles.colQuantite]}>{item.quantity}</Text>
                        <Text style={[styles.tableCell, styles.colPrixUnit]}>{formatAmount(item.unitPrice)}</Text>
                        <Text style={[styles.tableCell, styles.colMontant, styles.colNoBorder]}>{formatAmount(item.price)}</Text>
                    </View>
                )) || []}


            </View>

            {/* Section totaux */}
            <View style={styles.totalSection}>
                <View style={styles.totalGrid}>
                    <View style={styles.totalBox}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total commande HT</Text>
                            <Text style={styles.totalValue}>{formatAmount(demande.total?.orderTotal || 0)}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Participation livraison</Text>
                            <Text style={styles.totalValue}>{formatAmount(demande.total?.deliveryTotal || 0)}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Frais de facturation</Text>
                            <Text style={styles.totalValue}>{formatAmount(demande.total?.billingFees || 0)}</Text>
                        </View>

                        <View style={styles.grandTotalRow}>
                            <Text style={styles.grandTotalText}>Total HT: {formatAmount(demande.total?.total || 0)}</Text>
                        </View>
                    </View>
                </View>
            </View>


            {/* Section signature */}
            <View style={styles.signatureSection}>
                <View style={styles.signatureBox}>
                    <Text style={styles.signatureTitle}>Signature demandeur :</Text>
                    <Text style={styles.signatureContent}>Tel de contact pour livraison :</Text>
                    <Text style={styles.signatureContent}>06 23 26 02 45</Text>
                </View>

                <View style={styles.signatureBox}>
                    <Text style={styles.signatureTitle}>Validation Direction :</Text>
                    <Text style={styles.signatureContent}></Text>
                </View>
            </View>

            {/* Note en bas */}
            <Text style={{
                fontSize: 7,
                textAlign: 'center',
                marginTop: 8,
                backgroundColor: '#e0e0e0',
                padding: 3
            }}>
                La demande d&apos;achat vaut &quot;bon de commande&quot; dès validation du service Achat
            </Text>

            {/* Pied de page */}
            <View style={styles.footer}>
                <Text>SPL TRIO PYRÉNÉES - Site de CAMBRE D&apos;AZE - Billetterie 66210 SAINT PIERRE DELS FORCATS</Text>
                <Text>Cambre-d-aze@trio-pyrenees.fr contact@trio-pyrenees.fr - Siret 913 727 871 00034 - APE 9311Z</Text>
            </View>
        </Page>
    </Document>
)
