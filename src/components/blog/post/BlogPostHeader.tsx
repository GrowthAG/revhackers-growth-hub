
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BlogPost } from '@/data/blogData';

interface BlogPostHeaderProps {
  post: BlogPost;
  formatDate: (dateString: string) => string;
}

const BlogPostHeader = ({ post, formatDate }: BlogPostHeaderProps) => {
  return (
    <>
      {/* Back to Blog Link */}
      <div className="mb-8">
        <Link 
          to="/blog" 
          className="inline-flex items-center text-gray-600 hover:text-revgreen"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Voltar para o blog</span>
        </Link>
      </div>
      
      {/* Article Header */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="mb-6">
          <span className="inline-block px-3 py-1 bg-green-50 text-green-800 rounded-full text-sm font-medium">
            {post.category}
          </span>
        </div>
        
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
          {post.title}
        </h1>
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.author.name}</p>
              <p className="text-sm text-gray-500">{post.author.role}</p>
            </div>
          </div>
          
          <div className="flex text-sm text-gray-500 space-x-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(post.date)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{post.readTime}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured Image */}
      <div className="max-w-4xl mx-auto mb-10">
        <figure className="rounded-lg overflow-hidden">
          <img 
            src={post.image}
            alt={post.title}
            className="w-full h-auto"
          />
        </figure>
      </div>
    </>
  );
};

export default BlogPostHeader;
