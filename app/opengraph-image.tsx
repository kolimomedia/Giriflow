import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const runtime = "edge";
export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(60% 60% at 20% 10%, rgba(30,163,86,0.25), transparent 60%), radial-gradient(50% 50% at 90% 100%, rgba(109,213,149,0.4), transparent 70%), #fbfbf7",
          padding: 72,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#1ea356",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            G
          </div>
          <div style={{ display: "flex", fontSize: 32, fontWeight: 600, color: "#0d1f17" }}>
            <span>Giri</span>
            <span style={{ color: "#138544", fontStyle: "italic" }}>Flow</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <p
            style={{
              fontSize: 22,
              textTransform: "uppercase",
              letterSpacing: 6,
              color: "#138544",
              margin: 0,
            }}
          >
            Social media planner
          </p>
          <h1
            style={{
              fontSize: 96,
              lineHeight: 1.02,
              letterSpacing: -2,
              color: "#0d1f17",
              margin: 0,
              fontWeight: 600,
              maxWidth: 1000,
            }}
          >
            Plan your social,{" "}
            <span style={{ color: "#138544", fontStyle: "italic" }}>together.</span>
          </h1>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#6b7a72", fontSize: 22 }}>
          <span>Day · Week · Month · Year</span>
          <span style={{ fontFamily: "ui-monospace, monospace" }}>{site.domain}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
