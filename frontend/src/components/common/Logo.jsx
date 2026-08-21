import { Box } from "@mui/material";

// Custom mark: a shield (guardian/security) containing a cloud silhouette
// (cloud infrastructure) with a small live-status pulse dot — the three
// visual ideas the product name actually points at, instead of a generic
// stock "shield" icon in a plain gradient square.
export default function Logo({ size = 36 }) {
  return (
    <Box
      width={size}
      height={size}
      flexShrink={0}
      sx={{ filter: "drop-shadow(0 2px 5px rgba(99,102,241,.22))" }}
    >
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cgShieldGrad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="55%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="cgCloudGrad" x1="14" y1="18" x2="34" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#EEF2FF" />
          </linearGradient>
        </defs>

        {/* Shield body */}
        <path
          d="M24 3.5L6.5 9.8V21.6C6.5 32.9 13.6 42.2 24 45.5C34.4 42.2 41.5 32.9 41.5 21.6V9.8L24 3.5Z"
          fill="url(#cgShieldGrad)"
        />
        {/* Inner rim for depth */}
        <path
          d="M24 7.2L9.7 12.3V21.6C9.7 31.2 15.7 39.2 24 42.1C32.3 39.2 38.3 31.2 38.3 21.6V12.3L24 7.2Z"
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1"
        />

        {/* Cloud silhouette, centered in the shield */}
        <path
          d="M17.8 27.5C15.7 27.5 14 25.8 14 23.7C14 21.7 15.6 20 17.6 19.9C18.2 17.4 20.5 15.5 23.2 15.5C26 15.5 28.3 17.5 28.8 20.1C31 20.4 32.7 22.3 32.7 24.5C32.7 26.9 30.7 28.9 28.3 28.9H17.8V27.5Z"
          fill="url(#cgCloudGrad)"
        />

        {/* Live-status pulse dot */}
        <circle cx="33.5" cy="32.5" r="4.2" fill="#131B2E" />
        <circle cx="33.5" cy="32.5" r="3" fill="#22C55E" />
      </svg>
    </Box>
  );
}