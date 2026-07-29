import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import React from 'react';

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
    <section className="bg-black py-24 md:py-32 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <div className="mb-16">
          {eyebrow && (
            <p className="text-[#00CC6A] text-xs font-semibold tracking-wider uppercase mb-4">
              {eyebrow}
            </p>
          )}
          <h1 className="text-[2rem] sm:text-[2.5rem] md:text-[2.75rem] font-extrabold text-white mb-5 leading-[1.1] tracking-tight text-center">
            {title}
          </h1>
          <p className="text-zinc-400 text-base md:text-lg font-normal leading-relaxed max-w-2xl mx-auto text-center mb-8">
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
