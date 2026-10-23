const HUES: Record<string, number> = {
  Eletrônicos: 222,
  Casa: 28,
  Moda: 330,
  Esporte: 152,
  Livros: 262,
  Outros: 200,
};

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const categoryHue = (category: string) =>
  HUES[category] ?? hash(category) % 360;

export const categoryColor = (category: string) =>
  `hsl(${categoryHue(category)} 65% 42%)`;

/** Imagem SVG determinística (data URI): funciona offline e sem domínio externo. */
export function placeholderImage(seed: string, category: string): string {
  const h = hash(seed);
  const hue = categoryHue(category);
  const n = (shift: number, mod: number) => (h >>> shift) % mod;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450">` +
    `<rect width="600" height="450" fill="hsl(${hue} 38% 90%)"/>` +
    `<circle cx="${120 + n(0, 360)}" cy="${120 + n(4, 200)}" r="${90 + n(8, 70)}" fill="hsl(${hue} 62% 52%)"/>` +
    `<rect x="${40 + n(12, 300)}" y="${200 + n(16, 120)}" width="${150 + n(20, 120)}" height="${110 + n(24, 80)}" rx="14" fill="hsl(${hue} 55% 28%)" transform="rotate(${n(28, 24) - 12} 300 300)"/>` +
    `<circle cx="${60 + n(2, 480)}" cy="${60 + n(6, 330)}" r="${18 + n(10, 26)}" fill="hsl(${(hue + 40) % 360} 85% 68%)"/>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
