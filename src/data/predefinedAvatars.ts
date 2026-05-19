export interface PredefinedAvatar {
  id: string;
  name: string;
  category: string;
  svg: string;
  dataUrl: string;
}

const buildDataUrl = (svg: string): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const AVATAR_TEMPLATES = [
  {
    id: 'wise-owl',
    name: 'Búho Sabio',
    category: 'Académico',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8a2be2"/>
      <stop offset="100%" stop-color="#4a00e0"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#g1)"/>
  <path d="M30 35 Q40 37 50 45 Q60 37 70 35 L70 50 Q70 65 50 75 Q30 65 30 50 Z" fill="#ffffff" opacity="0.15"/>
  <circle cx="40" cy="50" r="10" fill="#ffffff"/>
  <circle cx="60" cy="50" r="10" fill="#ffffff"/>
  <circle cx="40" cy="50" r="4" fill="#000000"/>
  <circle cx="60" cy="50" r="4" fill="#000000"/>
  <polygon points="50,52 46,60 54,60" fill="#ff7f50"/>
  <path d="M25 30 L38 38 M75 30 L62 38" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
</svg>`
  },
  {
    id: 'cosmic-explorer',
    name: 'Astronauta',
    category: 'Ciencia',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141e30"/>
      <stop offset="100%" stop-color="#243b55"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#g2)"/>
  <circle cx="50" cy="50" r="22" fill="#ffffff"/>
  <rect x="34" y="40" width="32" height="18" rx="8" fill="#1e293b"/>
  <path d="M38 43 Q50 39 62 43 Q55 45 38 43" fill="#38bdf8" opacity="0.6"/>
  <ellipse cx="40" cy="46" rx="2" ry="1.5" fill="#ffffff" opacity="0.8"/>
  <rect x="44" y="70" width="12" height="10" fill="#cbd5e1"/>
  <circle cx="25" cy="30" r="1.5" fill="#ffd700"/>
  <circle cx="75" cy="35" r="1.2" fill="#ffffff"/>
  <circle cx="30" cy="70" r="1" fill="#ffffff"/>
</svg>`
  },
  {
    id: 'brain-spark',
    name: 'Mente Brillante',
    category: 'Creatividad',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff007f"/>
      <stop offset="100%" stop-color="#7f00ff"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#g3)"/>
  <path d="M48 30 C38 30 32 38 35 48 C30 52 32 62 42 62 C44 62 46 60 48 58 Z" fill="#ffffff"/>
  <path d="M52 30 C62 30 68 38 65 48 C70 52 68 62 58 62 C56 62 54 60 52 58 Z" fill="#f1f5f9"/>
  <path d="M50 30 L50 64" stroke="#a78bfa" stroke-width="2"/>
  <circle cx="35" cy="40" r="2" fill="#cbd5e1"/>
  <circle cx="32" cy="52" r="2" fill="#cbd5e1"/>
  <circle cx="45" cy="56" r="2" fill="#cbd5e1"/>
  <circle cx="65" cy="40" r="2" fill="#94a3b8"/>
  <circle cx="68" cy="52" r="2" fill="#94a3b8"/>
  <circle cx="55" cy="56" r="2" fill="#94a3b8"/>
  <path d="M50 20 L50 24 M25 50 L29 50 M75 50 L71 50 M32 32 L35 35 M68 32 L65 35" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
</svg>`
  },
  {
    id: 'ai-helper',
    name: 'Asistente IA',
    category: 'Tecnología',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00c6ff"/>
      <stop offset="100%" stop-color="#0072ff"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#g4)"/>
  <rect x="23" y="44" width="6" height="12" rx="2" fill="#cbd5e1"/>
  <rect x="71" y="44" width="6" height="12" rx="2" fill="#cbd5e1"/>
  <rect x="28" y="32" width="44" height="36" rx="10" fill="#f8fafc"/>
  <rect x="34" y="38" width="32" height="18" rx="6" fill="#1e293b"/>
  <circle cx="44" cy="47" r="3" fill="#22d3ee"/>
  <circle cx="56" cy="47" r="3" fill="#22d3ee"/>
  <rect x="46" y="58" width="8" height="2" rx="1" fill="#94a3b8"/>
  <rect x="48" y="22" width="4" height="10" rx="1" fill="#cbd5e1"/>
  <circle cx="50" cy="20" r="4" fill="#fb7185"/>
</svg>`
  },
  {
    id: 'atom-sc',
    name: 'Átomo Cuántico',
    category: 'Ciencia',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#11998e"/>
      <stop offset="100%" stop-color="#38ef7d"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#g5)"/>
  <circle cx="50" cy="50" r="6" fill="#ffffff"/>
  <ellipse cx="50" cy="50" rx="26" ry="10" fill="none" stroke="#ffffff" stroke-width="2" transform="rotate(30 50 50)"/>
  <ellipse cx="50" cy="50" rx="26" ry="10" fill="none" stroke="#ffffff" stroke-width="2" transform="rotate(150 50 50)"/>
  <ellipse cx="50" cy="50" rx="26" ry="10" fill="none" stroke="#ffffff" stroke-width="2" transform="rotate(90 50 50)"/>
  <circle cx="65" cy="41" r="3" fill="#ffffff"/>
  <circle cx="35" cy="59" r="3" fill="#ffffff"/>
  <circle cx="50" cy="24" r="3" fill="#ffffff"/>
</svg>`
  },
  {
    id: 'star-student',
    name: 'Estrella Académica',
    category: 'Académico',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g6" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f857a6"/>
      <stop offset="100%" stop-color="#ff5858"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#g6)"/>
  <path d="M50 20 L58 38 L78 40 L62 53 L67 73 L50 62 L33 73 L38 53 L22 40 L42 38 Z" fill="#ffffff"/>
  <polygon points="50,15 62,21 50,27 38,21" fill="#1e293b"/>
  <rect x="47" y="21" width="6" height="5" fill="#1e293b"/>
  <path d="M60 21 L64 28" stroke="#fcd34d" stroke-width="1.5"/>
</svg>`
  },
  {
    id: 'code-master',
    name: 'Programador',
    category: 'Tecnología',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g7" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f2027"/>
      <stop offset="50%" stop-color="#203a43"/>
      <stop offset="100%" stop-color="#2c5364"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#g7)"/>
  <path d="M38 35 L26 50 L38 65" fill="none" stroke="#22c55e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M62 35 L74 50 L62 65" fill="none" stroke="#22c55e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M54 30 L46 70" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>
</svg>`
  },
  {
    id: 'phoenix-educator',
    name: 'Fénix',
    category: 'Creatividad',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g8" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f12711"/>
      <stop offset="100%" stop-color="#f5af19"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#g8)"/>
  <path d="M50 25 C45 35 30 42 30 55 C30 68 40 75 50 75 C60 75 70 68 70 55 C70 42 55 35 50 25 Z" fill="#ffffff" opacity="0.2"/>
  <path d="M42 40 Q50 30 58 40 Q50 50 42 40" fill="#ffffff"/>
  <path d="M32 50 C26 58 35 70 50 72 C65 72 74 58 68 50 C65 56 58 62 50 62 C42 62 35 56 32 50 Z" fill="#ffffff"/>
  <polygon points="50,42 47,48 53,48" fill="#ff7f50"/>
</svg>`
  }
];

export const PREDEFINED_AVATARS: PredefinedAvatar[] = AVATAR_TEMPLATES.map(t => ({
  ...t,
  dataUrl: buildDataUrl(t.svg)
}));
