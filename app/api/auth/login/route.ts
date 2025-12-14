// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { backendRequest } from "@/lib/backend-client";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    // Appel au backend pour authentification
    const upstream = await backendRequest("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (upstream.status !== 200) {
      console.log("[api/auth/login/", "Erreur login");
      return NextResponse.json({ error: "Identifiants invalides" }, { status: upstream.status });
    }

    const authData = JSON.parse(upstream.bodyText);
    const { token, role, userId, email: userEmail } = authData;

    // Créer la réponse avec le cookie sécurisé
    const response = NextResponse.json(
      {
        success: true,
        user: { email: userEmail, role, userId },
      },
      { status: 200 }
    );

    // Stocker le token JWT dans un cookie httpOnly
    response.cookies.set({
      name: "trio_auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24h
    });

    // Stocker les infos utilisateur dans un cookie accessible côté client
    response.cookies.set({
      name: "trio_user",
      value: JSON.stringify({ email: userEmail, role, userId }),
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("[Login] Error:", error);
    return NextResponse.json({ error: "Erreur lors de la connexion" }, { status: 500 });
  }
}
