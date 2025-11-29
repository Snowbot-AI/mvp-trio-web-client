// app/api/demandes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DemandeSchema } from "../../../demandes/validation-schema";
import { backendRequest, getAuthTokenFromRequest } from "@/lib/backend-client";

export const runtime = "nodejs";

function isFileLike(value: unknown): value is Blob & { name?: string } {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as { arrayBuffer?: unknown }).arrayBuffer === "function" &&
    typeof (value as { type?: unknown }).type === "string"
  );
}

// GET /api/demandes/[id]
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await ctx.params;
    const token = getAuthTokenFromRequest(req);

    const upstream = await backendRequest(`/api/demandes/${encodeURIComponent(id)}`, {
      method: "GET",
      token,
    });

    if (upstream.status < 200 || upstream.status >= 300) {
      let details: unknown = upstream.bodyText;
      try {
        details = JSON.parse(upstream.bodyText);
      } catch (e) {
        console.warn("[API demandes/:id GET] Failed to parse upstream error body", e);
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
    console.error("[API] Proxy error GET /api/demandes/:id", { message });
    return NextResponse.json({ error: "proxy_error", message }, { status: 500 });
  }
}

// PUT /api/demandes/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await params;
    const token = getAuthTokenFromRequest(req);

    const form = await req.formData().catch(() => null);
    if (!form) {
      return NextResponse.json({ error: "Invalid multipart/form-data" }, { status: 400 });
    }

    const requestPart = form.get("request");
    if (!requestPart) {
      return NextResponse.json({ error: "Missing 'request' part" }, { status: 400 });
    }

    let requestJson: unknown;
    if (typeof requestPart === "string") {
      requestJson = JSON.parse(requestPart);
    } else if (isFileLike(requestPart)) {
      const text = await (requestPart as Blob).text();
      requestJson = JSON.parse(text);
    } else {
      return NextResponse.json({ error: "Unsupported request part type" }, { status: 400 });
    }

    const isDraft = requestJson && typeof requestJson === "object" && "status" in requestJson && requestJson.status === "BROUILLON";

    let validatedData: unknown;

    if (isDraft) {
      validatedData = requestJson;
    } else {
      const validation = DemandeSchema.safeParse(requestJson);
      if (!validation.success) {
        return NextResponse.json({ error: "Invalid request data", details: validation.error.format() }, { status: 400 });
      }
      validatedData = validation.data;
    }

    if (validatedData && typeof validatedData === "object" && "id" in validatedData && validatedData.id && validatedData.id !== id) {
      return NextResponse.json({ error: "Path id and body id mismatch" }, { status: 400 });
    }

    const forwardForm = new FormData();
    const jsonBlob = new Blob([JSON.stringify(validatedData)], { type: "application/json" });
    forwardForm.append("request", jsonBlob, "request.json");

    const files = form.getAll("files");
    for (const file of files) {
      if (isFileLike(file)) {
        const name = typeof (file as { name?: unknown }).name === "string" ? ((file as { name?: string }).name as string) : "file";
        forwardForm.append("files", file as unknown as Blob, name);
      }
    }

    const reqForBody = new Request("http://local", {
      method: "PUT",
      body: forwardForm as unknown as BodyInit,
    });
    const contentType = reqForBody.headers.get("content-type") || "application/octet-stream";
    const arrayBuffer = await reqForBody.arrayBuffer();
    const bodyBuffer = Buffer.from(arrayBuffer);

    const upstream = await backendRequest(`/api/demandes/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: {
        "content-type": contentType,
        "content-length": String(bodyBuffer.byteLength),
      },
      body: bodyBuffer,
      token,
    });

    if (upstream.status < 200 || upstream.status >= 300) {
      let details: unknown = upstream.bodyText;
      try {
        details = JSON.parse(upstream.bodyText);
      } catch (e) {
        console.warn("[API demandes/:id PUT] Failed to parse upstream error body", e);
      }
      return NextResponse.json(
        {
          error: "upstream",
          upstreamStatus: upstream.status,
          upstreamBody: upstream.bodyText,
          details,
        },
        { status: upstream.status || 502 }
      );
    }

    const updated: unknown = JSON.parse(upstream.bodyText);
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] Proxy error PUT /api/demandes/:id", { message });
    return NextResponse.json({ error: "proxy_error", message }, { status: 500 });
  }
}

// DELETE /api/demandes/[id]
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await ctx.params;
    const token = getAuthTokenFromRequest(req);

    const upstream = await backendRequest(`/api/demandes/${encodeURIComponent(id)}`, {
      method: "DELETE",
      token,
    });

    if (upstream.status < 200 || upstream.status >= 300) {
      let details: unknown = upstream.bodyText;
      try {
        details = JSON.parse(upstream.bodyText);
      } catch (e) {
        console.warn("[API demandes/:id DELETE] Failed to parse upstream error body", e);
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

    if (upstream.status === 204 || (upstream.bodyText || "").trim().length === 0) {
      return new NextResponse(null, { status: 204 });
    }

    let json: unknown;
    try {
      json = JSON.parse(upstream.bodyText);
    } catch {
      json = { success: true };
    }
    return NextResponse.json(json, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] Proxy error DELETE /api/demandes/:id", { message });
    return NextResponse.json({ error: "proxy_error", message }, { status: 500 });
  }
}
