// app/api/demandes/[id]/zip/route.ts
import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { renderToBuffer } from "@react-pdf/renderer";
import { DemandePDF, generateRequestNumber } from "@/app/demandes/[id]/utils/pdfGenerator";
import { DemandeSchema, type DemandeFormData } from "@/app/demandes/validation-schema";
import { backendRequestBinary, backendRequest, getAuthTokenFromRequest } from "@/lib/backend-client";

export const runtime = "nodejs";

// GET /api/demandes/[id]/zip -> proxy to backend /api/demandes/{id}/zip
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await ctx.params;
    const token = getAuthTokenFromRequest(req);

    // Récupérer le ZIP depuis le backend
    const upstream = await backendRequestBinary(`/api/demandes/${encodeURIComponent(id)}/zip`, {
      method: "GET",
      headers: { accept: "application/zip,application/octet-stream;q=0.9,*/*;q=0.1" },
      token,
    });

    if (upstream.status < 200 || upstream.status >= 300) {
      let details: unknown;
      try {
        details = JSON.parse(upstream.bodyBuffer.toString("utf8"));
      } catch (e) {
        console.warn("[ZIP] Failed to parse upstream error body as JSON", e);
        details = "Failed to download zip";
      }
      const status = upstream.status === 404 ? 404 : 502;
      return NextResponse.json({ error: "upstream", status: upstream.status, details }, { status });
    }

    // Try to enrich the ZIP with a generated PDF DA-<numero>.pdf
    let finalZipBuffer = upstream.bodyBuffer;
    try {
      // Récupérer les données de la demande pour générer le PDF
      const demandeResponse = await backendRequest(`/api/demandes/${encodeURIComponent(id)}`, {
        method: "GET",
        headers: { accept: "application/json" },
        token,
      });

      if (demandeResponse.status >= 200 && demandeResponse.status < 300) {
        let demandeJson: unknown;
        try {
          demandeJson = JSON.parse(demandeResponse.bodyText);
        } catch (e) {
          console.warn("[ZIP] Failed to parse demande JSON for PDF enrichment", e);
          demandeJson = undefined;
        }

        const validation = DemandeSchema.safeParse(demandeJson);
        if (validation.success) {
          const demandeData: DemandeFormData = validation.data;
          const numero = generateRequestNumber(demandeData);

          let zip: JSZip;
          try {
            zip = await JSZip.loadAsync(upstream.bodyBuffer);
          } catch {
            zip = new JSZip();
          }

          let pdfBuffer: Buffer | null = null;
          try {
            // Load logo from public as data URL to ensure availability in Node context
            let logoDataUrl: string | undefined;
            try {
              const logoPath = path.join(process.cwd(), "public", "logoTrio.png");
              const logoBuffer = fs.readFileSync(logoPath);
              logoDataUrl = `data:image/png;base64,${logoBuffer.toString("base64")}`;
            } catch (e) {
              console.warn("[ZIP] Logo not found or failed to read; continuing without logo", e);
            }

            pdfBuffer = await renderToBuffer(DemandePDF({ demande: demandeData, logoSrc: logoDataUrl }));
          } catch (e) {
            console.error("[ZIP] Failed to render PDF for enrichment", e);
            pdfBuffer = null;
          }

          if (pdfBuffer) {
            zip.file(`DA-${numero}.pdf`, pdfBuffer);
            finalZipBuffer = await zip.generateAsync({ type: "nodebuffer" });
          }
        }
      }
    } catch (e) {
      console.error("[ZIP] ZIP enrichment failed", e);
    }

    const headers = new Headers();
    const contentType = upstream.headers["content-type"] || "application/zip";
    headers.set("content-type", contentType);

    const contentDisposition = upstream.headers["content-disposition"] || `attachment; filename="demande-${encodeURIComponent(id)}.zip"`;
    headers.set("content-disposition", contentDisposition);
    headers.set("content-length", String(finalZipBuffer.byteLength));

    // return new NextResponse(finalZipBuffer, { status: 200, headers });
    return new NextResponse(new Uint8Array(finalZipBuffer), { status: 200, headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] Proxy error GET /api/demandes/:id/zip", { message });
    return NextResponse.json({ error: "proxy_error", message }, { status: 500 });
  }
}
