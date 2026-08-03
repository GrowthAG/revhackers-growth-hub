// Capa gerada por componente (sem arquivo de imagem) - garante que cada artigo
// tenha uma capa unica e nunca fique sem imagem ou com uma imagem de outro artigo.

interface BlogCoverArtProps {
  seed: string | number;
  className?: string;
}

const hashSeed = (seed: string | number): number => {
  const str = String(seed);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const TEXTURES = [
  // Blueprint grid
  {
    backgroundImage:
      'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
    backgroundSize: '28px 28px',
  },
  // Linhas diagonais
  {
    backgroundImage:
      'repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 14px)',
    backgroundSize: 'auto',
  },
  // Grade de pontos
  {
    backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
    backgroundSize: '18px 18px',
  },
];

const CORNER_POSITIONS = [
  ['top-3 left-3 border-t border-l', 'bottom-3 right-3 border-b border-r'],
  ['top-3 right-3 border-t border-r', 'bottom-3 left-3 border-b border-l'],
  ['top-3 left-3 border-t border-l', 'top-3 right-3 border-t border-r', 'bottom-3 left-3 border-b border-l', 'bottom-3 right-3 border-b border-r'],
];

const BlogCoverArt = ({ seed, className = '' }: BlogCoverArtProps) => {
  const hash = hashSeed(seed);
  const variant = hash % TEXTURES.length;
  const code = String(hash % 1000).padStart(3, '0');
  const corners = CORNER_POSITIONS[hash % CORNER_POSITIONS.length];
  const tickTop = 20 + (hash % 40); // 20%-59%, varia a posicao do tracinho de accent

  return (
    <div className={`relative bg-zinc-950 overflow-hidden ${className}`}>
      {/* Textura tecnica sutil */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={TEXTURES[variant]}
      />

      {/* Marcadores de canto - prancheta tecnica */}
      {corners.map((cls, i) => (
        <div key={i} className={`absolute w-3 h-3 border-zinc-700 ${cls}`} />
      ))}

      {/* Tracinho de accent - unica cor permitida */}
      <div
        className="absolute left-0 w-6 h-px bg-[#00CC6A]"
        style={{ top: `${tickTop}%` }}
      />

      {/* Numeral fantasma - assinatura tecnica, unico por artigo (hash do slug) */}
      <span className="absolute bottom-1 right-2 text-6xl sm:text-7xl font-black text-white/[0.06] leading-none select-none font-mono">
        {code}
      </span>
    </div>
  );
};

export default BlogCoverArt;
