"use client";

import { useEffect, useState } from "react";
import { qrSignFilename, renderQrSign, type QrSign } from "@/components/business-qr-signs";

export function QRGenerator({
  action,
  initialCode = "",
  initialName = "",
}: {
  action: (data: FormData) => void | Promise<void>;
  initialCode?: string;
  initialName?: string;
}) {
  const [code, setCode] = useState(initialCode || "custom-location-01");
  const [name, setName] = useState(initialName || "Custom visitor location");
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const saved = Boolean(initialCode);
  const sign: QrSign = {
    name,
    slug: code,
    code,
    trackingCode: `LOC-${code.slice(0, 12).toUpperCase()}`,
    scans: 0,
  };

  useEffect(() => {
    let current = true;
    setBusy(true);
    renderQrSign(sign)
      .then((url) => {
        if (current) setPreview(url);
      })
      .finally(() => {
        if (current) setBusy(false);
      });
    return () => {
      current = false;
    };
  }, [code, name]);

  function download() {
    if (!preview) return;
    const anchor = document.createElement("a");
    anchor.href = preview;
    anchor.download = qrSignFilename(sign);
    anchor.click();
  }

  return (
    <div>
      <form action={action} className="grid gap-4">
        <label className="font-bold">
          Location name
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="mt-2 h-12 w-full border px-3"
            placeholder="Front desk, coffee counter, visitor center…"
          />
        </label>
        <label className="font-bold">
          QR tracking code
          <input
            name="code"
            value={code}
            onChange={(event) => setCode(event.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
            required
            className="mt-2 h-12 w-full border px-3"
          />
        </label>
        <button className="w-fit bg-pine px-5 py-3 font-bold text-cream">
          {saved ? "Update tracked location" : "Create tracked location"}
        </button>
      </form>
      <p className="mt-3 text-xs text-ink/60">
        The QR opens the visitor guide and records this location as the source of the scan.
      </p>
      {preview && (
        <img
          src={preview}
          alt={`Branded QR sign for ${name}`}
          className="mt-6 w-full max-w-xl border border-cream/20"
        />
      )}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={download}
          disabled={!saved || busy}
          className="bg-pine px-5 py-3 font-bold text-cream disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Preparing template…" : "Download branded sign"}
        </button>
        {saved && (
          <a href={`/go/${code}`} target="_blank" className="border border-cream/20 px-5 py-3 font-bold">
            Test tracked link
          </a>
        )}
      </div>
      {!saved && (
        <p className="mt-3 text-xs font-bold text-forest">
          Save this tracked location before downloading or printing its sign.
        </p>
      )}
    </div>
  );
}
