
import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { blogPosts } from '@/data/blogData';
import BlogPostHeader from '@/components/blog/post/BlogPostHeader';
import BlogPostContent from '@/components/blog/post/BlogPostContent';
import BlogPostFooter from '@/components/blog/post/BlogPostFooter';
import RelatedPosts from '@/components/blog/post/RelatedPosts';
import TableOfContents from '@/components/blog/post/TableOfContents';
import { getArticleImageBySlug } from '@/components/blog/post/articles/utils/frameworkImages';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  
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
  
  // Update the author info consistently with avatar
  const authorInfo = {
    name: "Giulliano Alves",
    role: "CEO da RevHackers",
    avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
  };
  
  // Get custom image if available for this article
  const customImage = getArticleImageBySlug(post.slug);
  
  // Copy the post but update the author and image if custom one exists
  const updatedPost = {
    ...post,
    author: authorInfo,
    image: customImage || post.image
  };
  
  return (
    <PageLayout>
      <article className="pt-16 pb-24">
        <div className="container-custom">
          <BlogPostHeader post={updatedPost} formatDate={formatDate} />
          
          {/* Article Content with Table of Contents */}
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24">
                  <TableOfContents containerRef={contentRef} />
                </div>
              </div>
              <div ref={contentRef} className="lg:col-span-3">
                <BlogPostContent 
                  category={post.category}
                  authorName={authorInfo.name}
                  authorRole={authorInfo.role}
                  slug={post.slug}
                />
                <BlogPostFooter />
              </div>
            </div>
          </div>
        </div>
      </article>
      
      {/* Related Articles */}
      <RelatedPosts posts={relatedPosts.map(p => ({ ...p, author: authorInfo }))} />
    </PageLayout>
  );
};

export default BlogPostPage;
