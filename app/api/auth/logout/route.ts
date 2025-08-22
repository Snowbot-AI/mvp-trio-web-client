import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const redirectTo = url.searchParams.get("redirect") || "/";

    const res = NextResponse.redirect(new URL(redirectTo, url.origin));
    res.cookies.set({
        name: "trio_auth",
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0,
    });
    return res;
}


