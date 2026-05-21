import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Sobre Flavia Dos Santos";

/**
 * Per-page OG for /sobre-flavia. Same brand palette as the root OG
 * but composed around her name + the single tagline that already
 * lives in the system prompt and the about page hero.
 */
export default function SobreFlaviaOG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: "70px",
          background:
            "linear-gradient(135deg, #fef6ee 0%, #f5ddd5 50%, #fde8d8 100%)",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -140,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "9999px",
            background: "rgba(196, 96, 90, 0.20)",
            filter: "blur(60px)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 24,
              letterSpacing: 10,
              textTransform: "uppercase",
              color: "#c4605a",
              fontWeight: 600,
              display: "flex",
            }}
          >
            Sobre
          </div>
          <div
            style={{
              fontSize: 170,
              color: "#1c1917",
              fontStyle: "italic",
              lineHeight: 0.95,
              marginTop: 22,
              letterSpacing: -3,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Flavia</span>
            <span style={{ fontSize: 110, color: "#3f3f46" }}>Dos Santos</span>
          </div>
          <div
            style={{
              fontSize: 36,
              color: "#5b4a44",
              fontStyle: "italic",
              marginTop: 36,
              maxWidth: 820,
              lineHeight: 1.3,
              display: "flex",
            }}
          >
            “El placer es un derecho, no un lujo.”
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
