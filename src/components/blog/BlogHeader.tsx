
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const categories = [
  "Todos",
  "PLG",
  "ABM",
  "Automação",
  "CRO",
  "Dados",
  "Vendas",
  "MarTech"
];

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
    <div className="bg-gray-50 py-12 md:py-20">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog RevHackers</h1>
          <p className="text-lg text-gray-600">
            Conteúdo estratégico sobre crescimento, marketing e vendas B2B.
          </p>
        </div>
        
        <div className="max-w-md mx-auto relative mb-12">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input 
            type="search"
            placeholder="Buscar artigos..."
            className="pl-10 pr-4 py-6"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category
                  ? "bg-revgreen text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
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
