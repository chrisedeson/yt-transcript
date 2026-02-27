import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)",
          borderRadius: "6px",
        }}
      >
        {/* Play triangle with transcript lines */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Play triangle */}
          <path
            d="M6 3.5L19 12L6 20.5V3.5Z"
            fill="url(#grad)"
            stroke="rgba(139,92,246,0.4)"
            strokeWidth="0.5"
          />
          {/* Transcript lines overlaid */}
          <line x1="9" y1="9" x2="16" y2="9" stroke="#e8e8ed" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
          <line x1="9" y1="12" x2="14.5" y2="12" stroke="#e8e8ed" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
          <line x1="9" y1="15" x2="15.5" y2="15" stroke="#e8e8ed" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
          <defs>
            <linearGradient id="grad" x1="6" y1="3.5" x2="19" y2="20.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8b5cf6" />
              <stop offset="1" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
