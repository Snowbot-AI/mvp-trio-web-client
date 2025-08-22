import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const expected = process.env.AUTH_TOKEN;

    if (!expected || expected.length < 16) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!token || token !== expected) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const redirectTo = url.searchParams.get("redirect") || "/";

    const res = NextResponse.redirect(new URL(redirectTo, url.origin));
    res.cookies.set({
        name: "trio_auth",
        value: expected,
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
    });
    return res;
}


