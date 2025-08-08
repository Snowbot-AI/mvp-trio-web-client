import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const AUTH_TOKEN = 'UURNUzYkeVJuSlR5P0BwYWFwZ2ZxU3BwQWhoUiZiQkJTcmFoWEpFVA=='
const COOKIE_NAME = 'trio_auth'

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

    const res = NextResponse.json({ authenticated: true })
    res.cookies.set(COOKIE_NAME, AUTH_TOKEN, {
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
    const authenticated = token === AUTH_TOKEN
    return NextResponse.json({ authenticated })
}


