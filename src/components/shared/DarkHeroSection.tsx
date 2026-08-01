import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DarkHeroSectionProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle: string;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  categories?: string[];
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const DarkHeroSection = ({
  eyebrow,
  title,
  subtitle,
  searchPlaceholder = 'BUSCAR...',
  searchQuery = '',
  onSearchChange,
  categories,
  activeCategory = 'Todos',
  onCategoryChange
}: DarkHeroSectionProps) => {
  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center items-center overflow-hidden pt-28 pb-16 bg-black border-b border-zinc-900">
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
        <div>
          {eyebrow && (
            <p className="text-[#00CC6A] text-xs font-semibold tracking-wider uppercase mb-4">
              {eyebrow}
            </p>
          )}
          <h1 className="font-sans text-[2rem] sm:text-[2.75rem] md:text-[3.25rem] font-extrabold text-white mb-5 leading-[1.1] tracking-tight text-center max-w-3xl mx-auto">
            {title}
          </h1>
          <p className="text-zinc-400 mb-8 text-base md:text-lg font-normal leading-relaxed max-w-2xl mx-auto text-center">
            {subtitle}
          </p>
        </div>

        {onSearchChange && (
          <div className="max-w-xl mx-auto relative mb-16">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              className="h-14 pl-14 pr-6 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 rounded-lg shadow-sm text-tiny font-bold uppercase tracking-tight focus-visible:ring-1 focus-visible:ring-revgreen focus-visible:border-revgreen transition-all"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
            />
          </div>
        )}

        {categories && categories.length > 0 && onCategoryChange && (
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 border-t border-zinc-900 pt-8 mt-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`text-xxs uppercase tracking-tight font-bold font-sans transition-all duration-300 relative py-2 ${
                  activeCategory === category
                    ? "text-revgreen"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {category}
                {activeCategory === category && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-revgreen" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DarkHeroSection;
