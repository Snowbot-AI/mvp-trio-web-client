// app/api/demandes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
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

// GET /api/demandes → proxy to Spring
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const token = getAuthTokenFromRequest(req);

    const upstream = await backendRequest("/api/demandes", {
      method: "GET",
      token,
    });

    if (upstream.status < 200 || upstream.status >= 300) {
      let details: unknown = upstream.bodyText;
      try {
        details = JSON.parse(upstream.bodyText);
      } catch (e) {
        console.warn("[API demandes GET] Failed to parse upstream error body", e);
      }
      return NextResponse.json({ error: "upstream", status: upstream.status, details }, { status: 502 });
    }

    const json: unknown = JSON.parse(upstream.bodyText);
    return NextResponse.json(json, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "proxy_error", message }, { status: 500 });
  }
}

// POST /api/demandes → forward multipart
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
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

    const CreateSchema = z.object({}).passthrough();
    const validation = CreateSchema.safeParse(requestJson);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request data", details: validation.error.format() }, { status: 400 });
    }

    const forwardForm = new FormData();
    const jsonBlob = new Blob([JSON.stringify(validation.data)], { type: "application/json" });
    forwardForm.append("request", jsonBlob, "request.json");

    const files = form.getAll("files");
    for (const file of files) {
      if (isFileLike(file)) {
        const name = typeof (file as { name?: unknown }).name === "string" ? ((file as { name?: string }).name as string) : "file";
        forwardForm.append("files", file as unknown as Blob, name);
      }
    }

    const reqForBody = new Request("http://local", {
      method: "POST",
      body: forwardForm as unknown as BodyInit,
    });
    const contentType = reqForBody.headers.get("content-type") || "application/octet-stream";
    const arrayBuffer = await reqForBody.arrayBuffer();
    const bodyBuffer = Buffer.from(arrayBuffer);

    const upstream = await backendRequest("/api/demandes", {
      method: "POST",
      headers: {
        "content-type": contentType,
        "content-length": String(bodyBuffer.byteLength),
      },
      body: bodyBuffer,
      token,
    });
    console.log("Upstream response status:", upstream.status);
    console.log("Upstream response bodyText:", upstream.bodyText);
    if (upstream.status < 200 || upstream.status >= 300) {
      let details: unknown = upstream.bodyText;
      try {
        details = JSON.parse(upstream?.bodyText);
      } catch (e) {
        console.warn("[API demandes POST] Failed to parse upstream error body", e);
      }
      return NextResponse.json({ error: "upstream", details }, { status: 502 });
    }

    const created: unknown = JSON.parse(upstream.bodyText);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API demandes POST] Proxy error", { message });
    return NextResponse.json({ error: "proxy_error", message }, { status: 500 });
  }
}
