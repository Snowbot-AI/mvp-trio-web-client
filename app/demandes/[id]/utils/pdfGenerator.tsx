import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { Demande } from '../../types'
import { getStationName } from '../../types'

// Enregistrer les polices (optionnel - utilise les polices par défaut si non disponible)
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf', fontWeight: 'normal' },
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfB.ttf', fontWeight: 'bold' },
    ]
})

// Styles pour le PDF
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 30,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#1f2937',
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 15,
    },
    status: {
        fontSize: 12,
        color: '#059669',
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: '#d1fae5',
        padding: 5,
        borderRadius: 4,
        marginBottom: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#374151',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: 5,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    label: {
        fontSize: 10,
        fontWeight: 'bold',
        width: '30%',
        color: '#4b5563',
    },
    value: {
        fontSize: 10,
        width: '70%',
        color: '#1f2937',
    },
    table: {
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        padding: 8,
        borderBottom: '1px solid #e5e7eb',
    },
    tableHeaderCell: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#374151',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 8,
        borderBottom: '1px solid #f3f4f6',
    },
    tableCell: {
        fontSize: 9,
        color: '#1f2937',
    },
    col1: { width: '25%' },
    col2: { width: '20%' },
    col3: { width: '15%' },
    col4: { width: '15%' },
    col5: { width: '15%' },
    col6: { width: '10%' },
    total: {
        marginTop: 15,
        paddingTop: 10,
        borderTop: '2px solid #e5e7eb',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    totalLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#374151',
    },
    totalValue: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    grandTotal: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#059669',
    },
    footer: {
        marginTop: 30,
        paddingTop: 15,
        borderTop: '1px solid #e5e7eb',
        fontSize: 8,
        color: '#6b7280',
        textAlign: 'center',
    },
})

// Fonction pour formater les dates
const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non spécifiée'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

// Fonction pour formater les montants
const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount)
}

// Fonction pour obtenir le libellé du statut
const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
        'BROUILLON': 'Brouillon',
        'A_VERIFIER': 'En attente de validation',
        'A_MODIFIER': 'À modifier',
        'VALIDEE': 'Validée',
        'REJETEE': 'Rejetée',
    }
    return statusMap[status] || status
}

// Composant principal du PDF
export const DemandePDF = ({ demande }: { demande: Demande }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* En-tête */}
            <View style={styles.header}>
                <Text style={styles.title}>
                    Demande d&apos;achat Trio Pyrénées {getStationName(demande.codeStation)}
                </Text>
                <Text style={styles.subtitle}>
                    Référence: {demande.id} | Date de création: {formatDate(demande.date)}
                </Text>
                <Text style={styles.status}>
                    Statut: {getStatusLabel(demande.status)}
                </Text>
            </View>

            {/* Informations générales */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informations générales</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>Demandeur:</Text>
                    <Text style={styles.value}>{demande.from || 'Non spécifié'}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Description:</Text>
                    <Text style={styles.value}>{demande.description || 'Aucune description'}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Date de livraison souhaitée:</Text>
                    <Text style={styles.value}>{formatDate(demande.deliveryDate)}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Priorité:</Text>
                    <Text style={styles.value}>{demande.priority || 'Normale'}</Text>
                </View>
            </View>

            {/* Articles commandés */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Articles commandés</Text>

                {demande.items && demande.items.length > 0 ? (
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderCell, styles.col1]}>Description</Text>
                            <Text style={[styles.tableHeaderCell, styles.col2]}>Service</Text>
                            <Text style={[styles.tableHeaderCell, styles.col3]}>Quantité</Text>
                            <Text style={[styles.tableHeaderCell, styles.col4]}>Prix unitaire</Text>
                            <Text style={[styles.tableHeaderCell, styles.col5]}>Prix total</Text>
                            <Text style={[styles.tableHeaderCell, styles.col6]}>Type</Text>
                        </View>

                        {demande.items.map((item, index) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={[styles.tableCell, styles.col1]}>{item.description}</Text>
                                <Text style={[styles.tableCell, styles.col2]}>{item.service}</Text>
                                <Text style={[styles.tableCell, styles.col3]}>{item.quantity}</Text>
                                <Text style={[styles.tableCell, styles.col4]}>{formatAmount(item.unitPrice)}</Text>
                                <Text style={[styles.tableCell, styles.col5]}>{formatAmount(item.price)}</Text>
                                <Text style={[styles.tableCell, styles.col6]}>{item.budgetType}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.value}>Aucun article commandé</Text>
                )}

                {/* Récapitulatif financier */}
                <View style={styles.total}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total commande:</Text>
                        <Text style={styles.totalValue}>{formatAmount(demande.total.orderTotal || 0)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Frais de livraison:</Text>
                        <Text style={styles.totalValue}>{formatAmount(demande.total.deliveryTotal || 0)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Frais de facturation:</Text>
                        <Text style={styles.totalValue}>{formatAmount(demande.total.billingFees || 0)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.grandTotal}>Total général:</Text>
                        <Text style={styles.grandTotal}>{formatAmount(demande.total.total || 0)}</Text>
                    </View>
                </View>
            </View>

            {/* Informations de facturation */}
            {demande.billing && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations de facturation</Text>

                    <View style={styles.row}>
                        <Text style={styles.label}>Nom:</Text>
                        <Text style={styles.value}>{demande.billing.name || 'Non spécifié'}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Adresse:</Text>
                        <Text style={styles.value}>{demande.billing.address || 'Non spécifiée'}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>SIRET:</Text>
                        <Text style={styles.value}>{demande.billing.siret || 'Non spécifié'}</Text>
                    </View>

                    {demande.billing.emails && demande.billing.emails.length > 0 && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Emails:</Text>
                            <Text style={styles.value}>{demande.billing.emails.join(', ')}</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Informations fournisseur */}
            {demande.provider && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations fournisseur</Text>

                    <View style={styles.row}>
                        <Text style={styles.label}>Adresse:</Text>
                        <Text style={styles.value}>{demande.provider.address || 'Non spécifiée'}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Téléphone:</Text>
                        <Text style={styles.value}>{demande.provider.tel || 'Non spécifié'}</Text>
                    </View>
                </View>
            )}

            {/* Informations de livraison */}
            {demande.delivery && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations de livraison</Text>

                    <View style={styles.row}>
                        <Text style={styles.label}>Adresse:</Text>
                        <Text style={styles.value}>{demande.delivery.address || 'Non spécifiée'}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Téléphone:</Text>
                        <Text style={styles.value}>{demande.delivery.tel || 'Non spécifié'}</Text>
                    </View>
                </View>
            )}

            {/* Commentaire */}
            {demande.comment && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Commentaire</Text>
                    <Text style={styles.value}>{demande.comment}</Text>
                </View>
            )}

            {/* Pied de page */}
            <View style={styles.footer}>
                <Text>Document généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</Text>
                <Text>Trio Pyrénées - Système de gestion des demandes d&apos;achat</Text>
            </View>
        </Page>
    </Document>
)
