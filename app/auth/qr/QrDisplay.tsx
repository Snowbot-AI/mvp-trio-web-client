"use client";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

type QrDisplayProps = {
    readonly loginUrl: string;
};

export default function QrDisplay({ loginUrl }: QrDisplayProps) {
    const [copied, setCopied] = useState<boolean>(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(loginUrl);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch (error) {
            console.error(error);
            setCopied(false);
        }
    };

    return (
        <section aria-label="QR de connexion" className="grid gap-6">
            <div className="mx-auto w-full max-w-sm rounded-lg border bg-background p-6">
                <div className="flex justify-center">
                    <div className="rounded-md bg-white p-4">
                        <QRCode value={loginUrl} size={220} style={{ width: "100%", height: "auto" }} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
                <Input readOnly value={loginUrl} aria-label="Lien de connexion" />
                <Button type="button" onClick={handleCopy} className="sm:w-40">
                    {copied ? "Copié !" : "Copier le lien"}
                </Button>
            </div>
        </section>
    );
}


