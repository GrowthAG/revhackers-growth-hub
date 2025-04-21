
import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getArticleImageBySlug } from '../blog/post/articles/utils/frameworkImages';
import { blogPosts, BlogPost } from '@/data/blogData';

const BlogSection = () => {
  const [featuredArticles, setFeaturedArticles] = useState<BlogPost[]>([]);
  
  useEffect(() => {
    // Try to load posts from localStorage first
    const savedPosts = localStorage.getItem('blogPosts');
    const posts = savedPosts ? JSON.parse(savedPosts) : blogPosts;
    
    // Sort posts by date (newest first) and take the first 4
    const sortedPosts = [...posts].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 4);
    
    setFeaturedArticles(sortedPosts);
  }, []);

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start mb-16">
          <div className="max-w-lg mb-8 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Blog RevHackers
            </h2>
            <p className="text-lg text-gray-600">
              Conteúdo estratégico e especializado sobre crescimento, tecnologia e dados para empresas B2B.
            </p>
          </div>
          
          <Button
            variant="link"
            asChild
            className="text-base"
          >
            <Link 
              to="/blog" 
              className="inline-flex items-center text-revgreen hover:text-black font-medium group"
            >
              Ver todos os artigos
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredArticles.map((article, index) => {
            // Get custom image if available for this article
            const articleImage = getArticleImageBySlug(article.slug) || article.image;
            
            return (
              <Link to={`/blog/${article.slug}`} key={index} className="group block h-full">
                <Card className="overflow-hidden card-hover h-full border-0 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={articleImage} 
                      alt={article.title} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-xs px-3 py-1 bg-green-50 text-green-800 rounded-full font-medium shadow-sm">
                        {article.category}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-revgreen transition-colors">{article.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{article.excerpt}</p>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={article.author.avatar} alt={article.author.name} />
                          <AvatarFallback>{article.author.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{article.author.name}</p>
                          <p className="text-xs text-gray-500">{article.author.role}</p>
                        </div>
                      </div>
                      <span className="text-revgreen opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
