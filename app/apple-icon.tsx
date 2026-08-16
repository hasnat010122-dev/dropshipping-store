import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#14141C",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#FBFAF7",
            fontFamily: "sans-serif",
            display: "flex",
          }}
        >
          {BRAND.name[0]}
          <span style={{ color: "#FF4B5C" }}>.</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
