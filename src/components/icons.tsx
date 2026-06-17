import type { ReactNode, SVGProps } from "react";
import type { IconSet } from "../types";

// Tiny, dependency-free inline SVG glyphs (stroke = currentColor) so the library
// never forces an icon package on consumers. Any glyph can be overridden via the
// `icons` prop.

const base = (props: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
  ...props,
});

export const DefaultIcons: Required<IconSet> = {
  chat: (
    <svg {...base({})}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  close: (
    <svg {...base({})}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  reset: (
    <svg {...base({})}>
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
  send: (
    <svg {...base({})}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  sparkles: (
    <svg {...base({})}>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
    </svg>
  ),
  search: (
    <svg {...base({})}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  email: (
    <svg {...base({})}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  ),
  phone: (
    <svg {...base({})}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  whatsapp: (
    <svg {...base({ stroke: "none", fill: "currentColor" })}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 1.8c2.17 0 4.21.85 5.74 2.38a8.06 8.06 0 0 1 2.38 5.73c0 4.48-3.64 8.12-8.12 8.12h-.01a8.14 8.14 0 0 1-4.13-1.13l-.3-.18-3.07.8.82-3-.19-.31a8.04 8.04 0 0 1-1.26-4.31c0-4.48 3.64-8.12 8.12-8.12zm-2.78 4.4c-.13 0-.34.05-.52.24-.18.19-.69.67-.69 1.64 0 .96.71 1.9.81 2.03.1.13 1.4 2.14 3.4 3 1.66.72 2 .57 2.36.54.36-.03 1.16-.47 1.32-.93.16-.46.16-.85.11-.93-.05-.08-.18-.13-.38-.23-.2-.1-1.16-.57-1.34-.64-.18-.06-.31-.1-.44.1-.13.19-.5.64-.62.77-.11.13-.23.15-.42.05-.2-.1-.83-.31-1.59-.98-.59-.52-.98-1.17-1.1-1.37-.11-.19-.01-.3.09-.39.09-.09.2-.23.3-.35.1-.12.13-.2.2-.34.06-.13.03-.25-.02-.35-.05-.1-.43-1.08-.6-1.47-.16-.39-.32-.33-.43-.34h-.38z" />
    </svg>
  ),
  link: (
    <svg {...base({})}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
};

export type IconName = keyof IconSet;

/** Resolve a glyph from user overrides, falling back to the bundled defaults. */
export function getIcon(name: IconName, overrides?: IconSet): ReactNode {
  return overrides?.[name] ?? DefaultIcons[name];
}
