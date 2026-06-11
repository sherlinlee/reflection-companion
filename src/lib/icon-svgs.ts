/** Homescreen icon art — full-bleed 512×512, artwork centered large. */

export const REFLECTION_APP_ICON_BG = "#f7f4ef";

export const REFLECTION_APP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="reflectWarm" x1="256" y1="0" x2="256" y2="512" gradientUnits="userSpaceOnUse">
      <stop stop-color="#faf4e6"/>
      <stop stop-color="#f7f4ef"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#reflectWarm)"/>
  <g transform="translate(256 292) scale(1.35)">
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
</svg>`;

export function svgToDataUri(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
