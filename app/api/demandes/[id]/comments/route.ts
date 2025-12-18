// app/api/demandes/[id]/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { backendRequest, getAuthTokenFromRequest } from "@/lib/backend-client";

export const runtime = "nodejs";

// POST /api/demandes/[id]/comments - Ajouter un commentaire
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await ctx.params;
    const token = getAuthTokenFromRequest(req);

    // Lire le body JSON
    const body = await req.json().catch(() => null);
    if (!body || typeof body.content !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'content' field" }, { status: 400 });
    }

    const upstream = await backendRequest(`/api/comments/demande/${encodeURIComponent(id)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: body.content }),
      token,
    });

    if (upstream.status < 200 || upstream.status >= 300) {
      let details: unknown = upstream.bodyText;
      try {
        details = JSON.parse(upstream.bodyText);
      } catch (e) {
        console.warn("[API demandes/:id/comments POST] Failed to parse upstream error body", e);
      }
      const status = upstream.status || 502;
      return NextResponse.json(
        {
          error: "upstream",
          upstreamStatus: upstream.status,
          upstreamBody: upstream.bodyText,
          details,
        },
        { status }
      );
    }

    const json: unknown = JSON.parse(upstream.bodyText);
    return NextResponse.json(json, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] Proxy error POST /api/demandes/:id/comments", { message });
    return NextResponse.json({ error: "proxy_error", message }, { status: 500 });
  }
}

// GET /api/demandes/[id]/comments - Récupérer les commentaires (optionnel)
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await ctx.params;
    const token = getAuthTokenFromRequest(req);

    const upstream = await backendRequest(`/api/comments/demande/${encodeURIComponent(id)}`, {
      method: "GET",
      token,
    });

    if (upstream.status < 200 || upstream.status >= 300) {
      let details: unknown = upstream.bodyText;
      try {
        details = JSON.parse(upstream.bodyText);
      } catch (e) {
        console.warn("[API demandes/:id/comments GET] Failed to parse upstream error body", e);
      }
      const status = upstream.status || 502;
      return NextResponse.json(
        {
          error: "upstream",
          upstreamStatus: upstream.status,
          upstreamBody: upstream.bodyText,
          details,
        },
        { status }
      );
    }

    const json: unknown = JSON.parse(upstream.bodyText);
    return NextResponse.json(json, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] Proxy error GET /api/demandes/:id/comments", { message });
    return NextResponse.json({ error: "proxy_error", message }, { status: 500 });
  }
}
