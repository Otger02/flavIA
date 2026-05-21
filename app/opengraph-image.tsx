import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Flavia — Acompañamiento íntimo";

/**
 * Default site OG image. Brand colors (cream → rose → terracotta)
 * with editorial typography. One static composition for the whole
 * site at the root level; route segments can override with their
 * own `opengraph-image.tsx`.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, #fef6ee 0%, #f5ddd5 55%, #e8a0a0 100%)",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Decorative orb */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 360,
            height: 360,
            borderRadius: "9999px",
            background: "rgba(196, 96, 90, 0.18)",
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -120,
            left: -120,
            width: 360,
            height: 360,
            borderRadius: "9999px",
            background: "rgba(245, 221, 213, 0.5)",
            filter: "blur(40px)",
          }}
        />

        <div
          style={{
            fontSize: 22,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#c4605a",
            fontWeight: 600,
            display: "flex",
          }}
        >
          Acompañamiento íntimo
        </div>
        <div
          style={{
            fontSize: 220,
            color: "#1c1917",
            fontStyle: "italic",
            lineHeight: 1,
            marginTop: 20,
            letterSpacing: -4,
            display: "flex",
          }}
        >
          Flavia
        </div>
        <div
          style={{
            fontSize: 38,
            color: "#3f3f46",
            marginTop: 32,
            maxWidth: 880,
            lineHeight: 1.3,
            display: "flex",
          }}
        >
          Conversaciones sobre deseo, intimidad, pareja y sexualidad — sin tabú,
          sin moralizar.
        </div>
        <div
          style={{
            fontSize: 26,
            color: "#78716c",
            marginTop: 36,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "9999px",
              background: "#c4605a",
              display: "inline-block",
            }}
          />
          flavia.app
        </div>
      </div>
    ),
    { ...size },
  );
}
