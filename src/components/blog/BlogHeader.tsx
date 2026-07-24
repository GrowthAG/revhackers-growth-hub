import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const categories = ["Todos", "PLG", "ABM", "Automação", "CRO", "Dados", "Vendas", "MarTech"];

interface BlogHeaderProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const BlogHeader = ({
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery
}: BlogHeaderProps) => {
  return (
    <div className="bg-zinc-950 py-20 relative overflow-hidden border-b border-zinc-800">
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-8">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#00CC6A]">
            Mídia & Inteligência B2B
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            Artigos Ricos & Playbooks
          </h1>
          <p className="text-sm md:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Estratégias avançadas de Growth, Revenue Operations, arquiteturas de vendas e automações com IA.
          </p>
        </div>

        {/* Search Input */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            type="search"
            placeholder="Buscar por artigos, frameworks ou palavras-chave..."
            className="pl-10 pr-4 h-10 bg-zinc-900/90 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-[#00CC6A] focus-visible:ring-offset-0 transition-all rounded-xl text-xs font-medium shadow-xs"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {categories.map(category => (
            <button
              key={category}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCategory === category
                  ? "bg-[#00CC6A] text-black font-bold shadow-xs"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800"
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogHeader;