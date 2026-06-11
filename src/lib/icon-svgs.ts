/** Homescreen icon art — 512×512 viewBox, ~10% safe padding for iOS mask. */

export const REFLECTION_APP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="reflectWarm" x1="256" y1="48" x2="256" y2="464" gradientUnits="userSpaceOnUse">
      <stop stop-color="#fffaf2"/>
      <stop stop-color="#f7f4ef"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#reflectWarm)"/>
  <circle cx="404" cy="108" r="24" fill="#e8d5a0" opacity="0.55"/>
  <circle cx="96" cy="392" r="18" fill="#1A7A6E" opacity="0.12"/>
  <g transform="translate(256 286)">
    <path d="M-92-58c0-18 14-32 32-32h120c18 0 32 14 32 32v92c0 18-14 32-32 32H-60c-18 0-32-14-32-32v-92z" fill="#fff"/>
    <path d="M-92-58c0-18 14-32 32-32h58v156H-60c-18 0-32-14-32-32v-92z" fill="#faf4e6"/>
    <path d="M-28-90h116c12 0 22 10 22 22v8H-50v-30z" fill="#9a7c2e"/>
    <path d="M-16-18h72M-16 2h56M-16 22h40" stroke="#c8a85a" stroke-width="6" stroke-linecap="round"/>
    <path d="M52-18h36M52 2h28M52 22h20" stroke="#d9c78a" stroke-width="6" stroke-linecap="round"/>
    <circle cx="88" cy="36" r="34" fill="#EAF5F3" stroke="#1A7A6E" stroke-width="8"/>
    <circle cx="88" cy="36" r="16" fill="#fff" stroke="#1A7A6E" stroke-width="6"/>
    <path d="M114 62l34 34" stroke="#1A7A6E" stroke-width="10" stroke-linecap="round"/>
    <path d="M142 90l12 12" stroke="#9a7c2e" stroke-width="12" stroke-linecap="round"/>
  </g>
  <g transform="translate(132 132)">
    <circle cx="0" cy="0" r="18" fill="#ff8fab" opacity="0.85"/>
    <circle cx="16" cy="14" r="18" fill="#ff8fab" opacity="0.85"/>
    <circle cx="-16" cy="14" r="18" fill="#ff8fab" opacity="0.85"/>
    <circle cx="0" cy="24" r="18" fill="#ff8fab" opacity="0.85"/>
    <circle cx="0" cy="12" r="10" fill="#ffd166"/>
  </g>
  <path d="M372 360c18-8 34-8 52 0" stroke="#1A7A6E" stroke-width="8" stroke-linecap="round" opacity="0.35"/>
</svg>`;

export function svgToDataUri(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
