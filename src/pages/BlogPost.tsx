
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { blogPosts } from '@/data/blogData';
import BlogPostHeader from '@/components/blog/post/BlogPostHeader';
import BlogPostContent from '@/components/blog/post/BlogPostContent';
import BlogPostFooter from '@/components/blog/post/BlogPostFooter';
import RelatedPosts from '@/components/blog/post/RelatedPosts';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // Find the current post
  const post = blogPosts.find(post => post.slug === slug);
  
  // Get related posts (same category, excluding current)
  const relatedPosts = post 
    ? blogPosts
        .filter(p => p.category === post.category && p.id !== post.id)
        .slice(0, 3)
    : [];
  
  // Format date to Portuguese
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };
  
  // If post not found, redirect to blog page
  useEffect(() => {
    if (!post) {
      navigate('/blog');
    }
  }, [post, navigate]);
  
  if (!post) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <PageLayout>
      <article className="pt-16 pb-24">
        <div className="container-custom">
          <BlogPostHeader post={post} formatDate={formatDate} />
          
          {/* Article Content */}
          <div className="max-w-3xl mx-auto">
            <BlogPostContent 
              category={post.category}
              authorName={post.author.name}
              authorRole={post.author.role}
            />
            <BlogPostFooter />
          </div>
        </div>
      </article>
      
      {/* Related Articles */}
      <RelatedPosts posts={relatedPosts} />
    </PageLayout>
  );
};

export default BlogPostPage;
