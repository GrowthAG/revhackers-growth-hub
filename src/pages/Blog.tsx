
import { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import BlogHeader from '@/components/blog/BlogHeader';
import BlogCard from '@/components/blog/BlogCard';
import { Button } from '@/components/ui/button';
import { blogPosts, BlogPost } from '@/data/blogData';

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
  
  return (
    <PageLayout>
      <BlogHeader 
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <section className="py-16">
        <div className="container-custom">
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
                    className="px-8"
                  >
                    Carregar mais artigos
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold mb-4">Nenhum artigo encontrado</h3>
              <p className="text-gray-600">
                Tente ajustar seus filtros ou termos de busca.
              </p>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default Blog;
