import type { Config } from "tailwindcss";
export default { content:["./app/**/*.{ts,tsx}","./components/**/*.{ts,tsx}"], theme:{extend:{colors:{pine:"#173d2b",forest:"#24543c",cream:"#f7f2e8",sand:"#d79a60",sky:"#83b8d6",ink:"#183029"},fontFamily:{sans:["var(--font-body)"],display:["var(--font-display)"]},boxShadow:{soft:"0 18px 50px rgba(23,61,43,.12)"}}},plugins:[] } satisfies Config;
