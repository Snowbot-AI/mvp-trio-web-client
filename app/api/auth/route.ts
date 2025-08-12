import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const COOKIE_NAME = 'trio_auth'

const AuthTokenSchema = z.string().min(16)

function resolveAuthToken(): string {
    const fromEnv = process.env.AUTH_TOKEN
    const parsed = AuthTokenSchema.safeParse(fromEnv)
    if (parsed.success) {
        return parsed.data
    }
    // Fallback only for non-production to ease local dev
    const fallback = 'UURNUzYkeVJuSlR5P0BwYWFwZ2ZxU3BwQWhoUiZiQkJTcmFoWEpFVA=='
    if (process.env.NODE_ENV === 'production') {
        throw new Error('AUTH_TOKEN env var is required in production')
    }
    return fallback
}

const PostBodySchema = z.object({
    remember: z.boolean().optional().default(false),
})

export async function POST(req: NextRequest) {
    const json = await req.json().catch(() => null)

    const result = PostBodySchema.safeParse(json ?? {})
    if (!result.success) {
        return NextResponse.json(
            { error: 'Invalid body', details: result.error.format() },
            { status: 400 },
        )
    }

    const { remember } = result.data

    const token = resolveAuthToken()
    const res = NextResponse.json({ authenticated: true })
    res.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: remember ? 60 * 60 * 24 * 30 : undefined, // 30j si remember=true, sinon cookie de session
    })
    return res
}

export async function DELETE() {
    const res = NextResponse.json({ authenticated: false })
    res.cookies.set(COOKIE_NAME, '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 0,
    })
    return res
}

export async function GET(req: NextRequest) {
    const token = req.cookies.get(COOKIE_NAME)?.value ?? null
    let expected: string
    try {
        expected = resolveAuthToken()
    } catch {
        return NextResponse.json({ authenticated: false }, { status: 401 })
    }
    const authenticated = token === expected
    return NextResponse.json({ authenticated })
}


