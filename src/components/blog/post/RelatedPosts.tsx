
import { BlogPost } from '@/data/blogData';
import BlogCard from '@/components/blog/BlogCard';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface RelatedPostsProps {
  posts: BlogPost[];
}

const RelatedPosts = ({ posts }: RelatedPostsProps) => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };
  
  if (posts.length === 0) return null;
  
  return (
    <section className="bg-gray-50 py-16">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Artigos relacionados</h2>
          <Button variant="link" asChild className="text-revgreen">
            <Link to="/blog" onClick={scrollToTop} className="flex items-center">
              Ver todos os artigos
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <BlogCard key={post.id} post={post} onClick={scrollToTop} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedPosts;
