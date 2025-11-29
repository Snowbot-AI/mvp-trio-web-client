// app/api/files/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { backendRequestBinary, getAuthTokenFromRequest } from "@/lib/backend-client";

export const runtime = "nodejs";

// GET /api/files/[id] -> proxy to backend /api/files/{id}
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await ctx.params;
    const token = getAuthTokenFromRequest(req);

    const upstream = await backendRequestBinary(`/api/files/${encodeURIComponent(id)}`, {
      method: "GET",
      token,
    });

    if (upstream.status < 200 || upstream.status >= 300) {
      let details: unknown;
      try {
        details = JSON.parse(upstream.bodyBuffer.toString("utf8"));
      } catch (e) {
        console.warn("[Files] Failed to parse upstream error body as JSON", e);
        details = "Failed to download file";
      }
      const status = upstream.status === 404 ? 404 : 502;
      return NextResponse.json({ error: "upstream", status: upstream.status, details }, { status });
    }

    const headers = new Headers();
    const contentType = upstream.headers["content-type"] || "application/octet-stream";
    headers.set("content-type", contentType);

    const contentDisposition = upstream.headers["content-disposition"];
    if (contentDisposition) {
      headers.set("content-disposition", contentDisposition);
    }

    const contentLength = upstream.headers["content-length"];
    if (contentLength) {
      headers.set("content-length", contentLength);
    }

    return new NextResponse(new Uint8Array(upstream.bodyBuffer), { status: 200, headers });
    // return new NextResponse(upstream.bodyBuffer, { status: 200, headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Files] Proxy error GET /api/files/:id", { message });
    return NextResponse.json({ error: "proxy_error", message }, { status: 500 });
  }
}
