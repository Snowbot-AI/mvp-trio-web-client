import https from 'node:https'
import fs from 'node:fs'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'
import { renderToBuffer } from '@react-pdf/renderer'
import { DemandePDF, generateRequestNumber } from '@/app/demandes/[id]/utils/pdfGenerator'
import { DemandeSchema, type DemandeFormData } from '@/app/demandes/validation-schema'

export const runtime = 'nodejs'

function normalizePem(value: string | undefined): string {
    return (value ?? '').replace(/\n/g, '\n')
}

function readTextFileSafe(path: string): string {
    return fs.readFileSync(path, 'utf8')
}

function readPemFromEnv(contentEnv: string | undefined, fileEnv: string | undefined): string | undefined {
    if (fileEnv && fileEnv.trim().length > 0) {
        const parts = fileEnv.split(/[,;]+/).map((p) => p.trim()).filter(Boolean)
        const contents = parts.map((p) => readTextFileSafe(p))
        return contents.join('\n')
    }
    const norm = normalizePem(contentEnv)
    return norm.trim().length > 0 ? norm : undefined
}

function getTlsOptions(hostname: string) {
    const cert = readPemFromEnv(process.env.BACKEND_CLIENT_CERT, process.env.BACKEND_CLIENT_CERT_FILE)
    const key = readPemFromEnv(process.env.BACKEND_CLIENT_KEY, process.env.BACKEND_CLIENT_KEY_FILE)
    const ca = readPemFromEnv(process.env.BACKEND_CA_CERT, process.env.BACKEND_CA_CERT_FILE)
    const insecure = (process.env.BACKEND_TLS_INSECURE ?? '').toLowerCase() === 'true'

    if (!cert || !key) {
        throw new Error('Missing mTLS client material: provide *_FILE or inline content for BACKEND_CLIENT_CERT and BACKEND_CLIENT_KEY')
    }

    const tls: https.AgentOptions = {
        cert,
        key,
        servername: hostname,
        rejectUnauthorized: !insecure,
    }

    if (ca) {
        tls.ca = ca
    }

    return tls
}

function getBackendBase(): URL {
    const base = process.env.BACK_URL
    if (!base) {
        throw new Error('Missing BACK_URL environment variable')
    }
    const url = new URL(base)
    if (url.protocol !== 'https:') {
        throw new Error('BACK_URL must start with https://')
    }
    return url
}

type HttpBinaryResponse = {
    status: number
    headers: Record<string, string>
    bodyBuffer: Buffer
}

async function httpsRequestBinary(
    pathname: string,
    init: { method: string; headers?: Record<string, string> },
): Promise<HttpBinaryResponse> {
    const base = getBackendBase()
    const hostname = base.hostname
    const port = Number(base.port || 443)
    const fullPath = `${base.pathname.replace(/\/?$/, '')}${pathname}`

    const tls = getTlsOptions(hostname)

    return new Promise((resolve, reject) => {
        const req = https.request(
            {
                host: hostname,
                port,
                method: init.method,
                path: fullPath,
                headers: init.headers,
                ...tls,
            },
            (res) => {
                const chunks: Buffer[] = []
                res.on('data', (d) => chunks.push(Buffer.isBuffer(d) ? d : Buffer.from(d)))
                res.on('end', () => {
                    const buffer = Buffer.concat(chunks)
                    const headers: Record<string, string> = {}
                    for (const [key, value] of Object.entries(res.headers)) {
                        if (!key) { continue }
                        if (typeof value === 'string') {
                            headers[key.toLowerCase()] = value
                        } else if (Array.isArray(value) && value.length > 0) {
                            headers[key.toLowerCase()] = value[0]
                        }
                    }
                    resolve({ status: res.statusCode || 0, headers, bodyBuffer: buffer })
                })
            },
        )

        req.on('error', (err) => reject(err))
        req.end()
    })
}

async function httpsRequestText(
    pathname: string,
    init: { method: string; headers?: Record<string, string> },
): Promise<{ status: number; headers: Record<string, string>; bodyText: string }> {
    const base = getBackendBase()
    const hostname = base.hostname
    const port = Number(base.port || 443)
    const fullPath = `${base.pathname.replace(/\/?$/, '')}${pathname}`

    const tls = getTlsOptions(hostname)

    return new Promise((resolve, reject) => {
        const req = https.request(
            {
                host: hostname,
                port,
                method: init.method,
                path: fullPath,
                headers: init.headers,
                ...tls,
            },
            (res) => {
                const chunks: Buffer[] = []
                res.on('data', (d) => chunks.push(Buffer.isBuffer(d) ? d : Buffer.from(d)))
                res.on('end', () => {
                    const buffer = Buffer.concat(chunks)
                    const headers: Record<string, string> = {}
                    for (const [key, value] of Object.entries(res.headers)) {
                        if (!key) { continue }
                        if (typeof value === 'string') {
                            headers[key.toLowerCase()] = value
                        } else if (Array.isArray(value) && value.length > 0) {
                            headers[key.toLowerCase()] = value[0]
                        }
                    }
                    resolve({ status: res.statusCode || 0, headers, bodyText: buffer.toString('utf8') })
                })
            },
        )

        req.on('error', (err) => reject(err))
        req.end()
    })
}

// GET /api/demandes/[id]/zip -> proxy to backend /api/demandes/{id}/zip
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
        const { id } = await ctx.params

        const upstream = await httpsRequestBinary(`/api/demandes/${encodeURIComponent(id)}/zip`, { method: 'GET', headers: { 'accept': 'application/zip,application/octet-stream;q=0.9,*/*;q=0.1' } })



        if (upstream.status < 200 || upstream.status >= 300) {
            let details: unknown
            try { details = JSON.parse(upstream.bodyBuffer.toString('utf8')) } catch (e) { console.warn('[ZIP] Failed to parse upstream error body as JSON', e); details = 'Failed to download zip' }
            const status = upstream.status === 404 ? 404 : 502
            return NextResponse.json({ error: 'upstream', status: upstream.status, details }, { status })
        }

        // Try to enrich the ZIP with a generated PDF DA-<numero>.pdf
        let finalZipBuffer = upstream.bodyBuffer
        try {
            const demandeResponse = await httpsRequestText(`/api/demandes/${encodeURIComponent(id)}`, { method: 'GET', headers: { accept: 'application/json' } })
            if (demandeResponse.status >= 200 && demandeResponse.status < 300) {
                let demandeJson: unknown
                try {
                    demandeJson = JSON.parse(demandeResponse.bodyText)
                } catch (e) {
                    console.warn('[ZIP] Failed to parse demande JSON for PDF enrichment', e)
                    demandeJson = undefined
                }
                const validation = DemandeSchema.safeParse(demandeJson)
                if (validation.success) {
                    const demandeData: DemandeFormData = validation.data
                    const numero = generateRequestNumber(demandeData)
                    let zip: JSZip
                    try {
                        zip = await JSZip.loadAsync(upstream.bodyBuffer)
                    } catch {
                        zip = new JSZip()
                    }
                    let pdfBuffer: Buffer | null = null
                    try {
                        // Load logo from public as data URL to ensure availability in Node context
                        let logoDataUrl: string | undefined
                        try {
                            const logoPath = path.join(process.cwd(), 'public', 'logoTrio.png')
                            const logoBuffer = fs.readFileSync(logoPath)
                            logoDataUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`
                        } catch (e) { console.warn('[ZIP] Logo not found or failed to read; continuing without logo', e) }

                        pdfBuffer = await renderToBuffer(DemandePDF({ demande: demandeData, logoSrc: logoDataUrl }))
                    } catch (e) { console.error('[ZIP] Failed to render PDF for enrichment', e); pdfBuffer = null }
                    if (pdfBuffer) {
                        zip.file(`DA-${numero}.pdf`, pdfBuffer)
                        finalZipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
                    }
                }
            }
        } catch (e) { console.error('[ZIP] ZIP enrichment failed', e) }

        const headers = new Headers()
        const contentType = upstream.headers['content-type'] || 'application/zip'
        headers.set('content-type', contentType)
        const contentDisposition = upstream.headers['content-disposition'] || `attachment; filename="demande-${encodeURIComponent(id)}.zip"`
        headers.set('content-disposition', contentDisposition)
        headers.set('content-length', String(finalZipBuffer.byteLength))

        return new NextResponse(finalZipBuffer, { status: 200, headers })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('[API] Proxy error GET /api/demandes/:id/zip', { message })
        return NextResponse.json({ error: 'proxy_error', message }, { status: 500 })
    }
}


