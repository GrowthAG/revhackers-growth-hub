
import { BlogPost } from '@/data/blogData';
import BlogCard from '@/components/blog/BlogCard';

interface RelatedPostsProps {
  posts: BlogPost[];
}

const RelatedPosts = ({ posts }: RelatedPostsProps) => {
  if (posts.length === 0) return null;
  
  return (
    <section className="bg-gray-50 py-16">
      <div className="container-custom">
        <h2 className="text-2xl font-bold mb-8">Artigos relacionados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedPosts;
