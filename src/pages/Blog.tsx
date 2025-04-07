
import { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import BlogHeader from '@/components/blog/BlogHeader';
import BlogCard from '@/components/blog/BlogCard';
import { Button } from '@/components/ui/button';
import { blogPosts, BlogPost } from '@/data/blogData';
import { Search, Filter, BookOpen } from 'lucide-react';

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<BlogPost[]>([]);
  const [postsPerPage] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter posts based on category and search query
  useEffect(() => {
    let filtered = [...blogPosts];
    
    if (activeCategory !== 'Todos') {
      filtered = filtered.filter(post => post.category === activeCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.excerpt.toLowerCase().includes(query)
      );
    }
    
    setFilteredPosts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [activeCategory, searchQuery]);
  
  // Update displayed posts based on pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    setDisplayedPosts(filteredPosts.slice(startIndex, endIndex));
  }, [filteredPosts, currentPage, postsPerPage]);
  
  // Load more posts
  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };
  
  const hasMorePosts = currentPage * postsPerPage < filteredPosts.length;

  // Get all unique categories
  const categories = ['Todos', ...Array.from(new Set(blogPosts.map(post => post.category)))];
  
  return (
    <PageLayout>
      <section className="bg-gray-50 pt-16 pb-12">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Blog RevHackers</h1>
            <p className="text-lg text-gray-600 mb-8">
              Artigos, guias e insights sobre Revenue Operations, Marketing B2B e transformação digital
            </p>
            
            <div className="relative mx-auto max-w-lg">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar artigos..."
                className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:ring focus:ring-green-100 focus:outline-none focus:border-revgreen"
              />
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="container-custom">
          <div className="flex items-center mb-8 overflow-x-auto pb-2">
            <div className="flex items-center mr-3">
              <Filter className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">Filtrar por:</span>
            </div>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium mr-2 whitespace-nowrap ${
                  activeCategory === category
                    ? 'bg-revgreen text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {filteredPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedPosts.map(post => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
              
              {hasMorePosts && (
                <div className="mt-12 text-center">
                  <Button 
                    variant="outline" 
                    onClick={loadMore}
                    className="px-8 group"
                  >
                    <span>Carregar mais artigos</span>
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Nenhum artigo encontrado</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Tente ajustar seus filtros ou termos de busca para encontrar o conteúdo que você procura.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setActiveCategory('Todos');
                  setSearchQuery('');
                }}
                className="mt-6"
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default Blog;
