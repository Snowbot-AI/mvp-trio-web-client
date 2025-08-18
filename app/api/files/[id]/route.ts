import https from 'node:https'
import fs from 'node:fs'
import { NextRequest, NextResponse } from 'next/server'

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

// GET /api/files/[id] -> proxy to backend /files/{id}
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
        const { id } = await ctx.params

        const upstream = await httpsRequestBinary(`/api/files/${encodeURIComponent(id)}`, { method: 'GET' })

        if (upstream.status < 200 || upstream.status >= 300) {
            let details: unknown
            try { details = JSON.parse(upstream.bodyBuffer.toString('utf8')) } catch (e) { console.warn('[Files] Failed to parse upstream error body as JSON', e); details = 'Failed to download file' }
            const status = upstream.status === 404 ? 404 : 502
            return NextResponse.json({ error: 'upstream', status: upstream.status, details }, { status })
        }

        const headers = new Headers()
        const contentType = upstream.headers['content-type'] || 'application/octet-stream'
        headers.set('content-type', contentType)
        const contentDisposition = upstream.headers['content-disposition']
        if (contentDisposition) {
            headers.set('content-disposition', contentDisposition)
        }
        const contentLength = upstream.headers['content-length']
        if (contentLength) {
            headers.set('content-length', contentLength)
        }

        return new NextResponse(upstream.bodyBuffer, { status: 200, headers })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('[Files] Proxy error GET /api/files/:id', { message })
        return NextResponse.json({ error: 'proxy_error', message }, { status: 500 })
    }
}


