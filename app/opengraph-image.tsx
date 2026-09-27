import { ImageResponse } from "next/og";

export const alt = "Sibenson Gautam | PM + QA | Software Quality & Project Coordination";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const steps = ["Understand", "Test", "Investigate", "Coordinate", "Verify", "Deliver"];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 80px",
          background: "#0b0b0c",
          backgroundImage: "radial-gradient(circle at 85% 20%, rgba(255,106,61,0.22), transparent 45%)",
          color: "#f2efe9",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", color: "#a29e96", fontSize: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, background: "#7ed6a5" }} />
            PM + QA at Hazesoft · Kathmandu, Nepal
          </div>
          <div>SG</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 118, fontWeight: 700, letterSpacing: -5, lineHeight: 0.95 }}>Sibenson</div>
          <div style={{ fontSize: 118, fontWeight: 700, letterSpacing: -5, lineHeight: 0.95, color: "#ff6a3d" }}>Gautam</div>
          <div style={{ marginTop: 26, fontSize: 36, color: "#f2efe9" }}>Software Quality & Project Coordination</div>
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 22, color: "#a29e96" }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: "flex", gap: 14 }}>
              <span>{s}</span>
              {i < steps.length - 1 && <span style={{ color: "#55524d" }}>→</span>}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
