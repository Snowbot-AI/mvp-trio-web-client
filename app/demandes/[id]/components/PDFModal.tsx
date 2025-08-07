import { useState } from 'react'
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { DemandePDF } from '../utils/pdfGenerator'
import { Demande } from '../../types'

interface PDFModalProps {
    isOpen: boolean
    onClose: () => void
    demande: Demande
}

export function PDFModal({ isOpen, onClose, demande }: PDFModalProps) {
    const [isGenerating, setIsGenerating] = useState(false)

    const handleDownload = () => {
        setIsGenerating(true)
        // Le téléchargement se fait automatiquement via PDFDownloadLink
        setTimeout(() => setIsGenerating(false), 1000)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="p-8 h-[90vh]">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-lg font-semibold">
                            Aperçu de la demande d&apos;achat
                        </DialogTitle>
                        <div className="flex items-center gap-2">
                            <PDFDownloadLink
                                document={<DemandePDF demande={demande} />}
                                fileName={`demande-achat-${demande.id}-${new Date().toISOString().split('T')[0]}.pdf`}
                                onClick={handleDownload}
                            >
                                {({ loading }: { loading: boolean }) => (
                                    <Button
                                        variant="outline"
                                        disabled={loading || isGenerating}
                                        className="flex items-center gap-2"
                                        size="sm"
                                    >
                                        <Download className="h-4 w-4" />
                                        {loading || isGenerating ? 'Génération...' : 'Télécharger'}
                                    </Button>
                                )}
                            </PDFDownloadLink>
                        </div>
                    </div>
                </DialogHeader>

                <div className="h-[80vh]">
                    <PDFViewer
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none'
                        }}
                        showToolbar={false}
                    >
                        <DemandePDF demande={demande} />
                    </PDFViewer>
                </div>
            </DialogContent>
        </Dialog>
    )
}
