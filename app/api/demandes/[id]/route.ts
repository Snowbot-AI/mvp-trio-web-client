import https from 'node:https'
import fs from 'node:fs'
import { NextRequest, NextResponse } from 'next/server'
import { DemandeSchema } from '../../../demandes/validation-schema'

export const runtime = 'nodejs'
function isFileLike(value: unknown): value is Blob & { name?: string } {
    return !!value && typeof value === 'object' && typeof (value as { arrayBuffer?: unknown }).arrayBuffer === 'function' && typeof (value as { type?: unknown }).type === 'string'
}


function normalizePem(value: string | undefined): string {
    return (value ?? '').replace(/\\n/g, '\n')
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

    // Only set CA when provided; otherwise use Node default trust store
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

async function httpsRequest(pathname: string, init: { method: string; headers?: Record<string, string>; body?: Buffer | null }): Promise<{ status: number; bodyText: string }> {
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
                    const bodyText = Buffer.concat(chunks).toString('utf8')
                    resolve({ status: res.statusCode || 0, bodyText })
                })
            },
        )

        req.on('error', (err) => reject(err))

        if (init.body) {
            req.write(init.body)
        }
        req.end()
    })
}

// GET /api/demandes/[id]
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
        const { id } = await ctx.params

        const upstream = await httpsRequest(`/api/demandes/${encodeURIComponent(id)}`, { method: 'GET' })

        if (upstream.status < 200 || upstream.status >= 300) {
            let details: unknown = upstream.bodyText
            try { details = JSON.parse(upstream.bodyText) } catch (e) { console.warn('[API demandes/:id GET] Failed to parse upstream error body', e) }
            const status = upstream.status === 404 ? 404 : 502
            return NextResponse.json({ error: 'upstream', status: upstream.status, details }, { status })
        }

        const json: unknown = JSON.parse(upstream.bodyText)
        return NextResponse.json(json, { status: 200 })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('[API] Proxy error GET /api/demandes/:id', { message })
        return NextResponse.json({ error: 'proxy_error', message }, { status: 500 })
    }
}

// PUT /api/demandes/[id] → forward multipart (request JSON + files)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
        const { id } = await params

        const form = await req.formData().catch(() => null)
        if (!form) {
            return NextResponse.json({ error: 'Invalid multipart/form-data' }, { status: 400 })
        }

        const requestPart = form.get('request')
        if (!requestPart) {
            return NextResponse.json({ error: "Missing 'request' part" }, { status: 400 })
        }

        let requestJson: unknown
        if (typeof requestPart === 'string') {
            requestJson = JSON.parse(requestPart)
        } else if (isFileLike(requestPart)) {
            const text = await (requestPart as Blob).text()
            requestJson = JSON.parse(text)
        } else {
            return NextResponse.json({ error: 'Unsupported request part type' }, { status: 400 })
        }

        // Vérifier si c'est un brouillon pour permettre la sauvegarde sans validation
        const isDraft = requestJson && typeof requestJson === 'object' && 'status' in requestJson && requestJson.status === 'BROUILLON'

        let validatedData: unknown

        if (isDraft) {
            // En mode brouillon, on accepte les données même avec des erreurs de validation
            validatedData = requestJson
        } else {
            // Pour les autres statuts, validation stricte obligatoire
            const validation = DemandeSchema.safeParse(requestJson)
            if (!validation.success) {
                return NextResponse.json({ error: 'Invalid request data', details: validation.error.format() }, { status: 400 })
            }
            validatedData = validation.data
        }

        // Ensure path id matches body id if present
        if (validatedData && typeof validatedData === 'object' && 'id' in validatedData && validatedData.id && validatedData.id !== id) {
            return NextResponse.json({ error: 'Path id and body id mismatch' }, { status: 400 })
        }

        const forwardForm = new FormData()
        const jsonBlob = new Blob([JSON.stringify(validatedData)], { type: 'application/json' })
        forwardForm.append('request', jsonBlob, 'request.json')

        const files = form.getAll('files')
        for (const file of files) {
            if (isFileLike(file)) {
                const name = typeof (file as { name?: unknown }).name === 'string' ? ((file as { name?: string }).name as string) : 'file'
                forwardForm.append('files', file as unknown as Blob, name)
            }
        }

        const reqForBody = new Request('http://local', { method: 'PUT', body: forwardForm as unknown as BodyInit })
        const contentType = reqForBody.headers.get('content-type') || 'application/octet-stream'
        const arrayBuffer = await reqForBody.arrayBuffer()
        const bodyBuffer = Buffer.from(arrayBuffer)

        const upstream = await httpsRequest(`/api/demandes/${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers: {
                'content-type': contentType,
                'content-length': String(bodyBuffer.byteLength),
            },
            body: bodyBuffer,
        })

        if (upstream.status < 200 || upstream.status >= 300) {
            let details: unknown = upstream.bodyText
            try { details = JSON.parse(upstream.bodyText) } catch (e) { console.warn('[API demandes/:id PUT] Failed to parse upstream error body', e) }
            return NextResponse.json({ error: 'upstream', details }, { status: 502 })
        }

        const updated: unknown = JSON.parse(upstream.bodyText)
        return NextResponse.json(updated, { status: 200 })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('[API] Proxy error PUT /api/demandes/:id', { message })
        return NextResponse.json({ error: 'proxy_error', message }, { status: 500 })
    }
}
