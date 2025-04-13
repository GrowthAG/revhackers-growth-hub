
import { CalendarIcon, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BlogPost } from '@/data/blogData';
import { getArticleImageBySlug } from './post/articles/utils/frameworkImages';

interface BlogCardProps {
  post: BlogPost;
  onClick?: () => void;
}

const BlogCard = ({ post, onClick }: BlogCardProps) => {
  // Format date to Portuguese
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  // Standard author info for all articles
  const authorInfo = {
    name: "Giulliano Alves",
    role: "CEO da RevHackers",
    avatar: "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
  };

  // Get custom image if available for this article
  const articleImage = getArticleImageBySlug(post.slug) || post.image;

  return (
    <Link to={`/blog/${post.slug}`} className="group block h-full" onClick={onClick}>
      <Card className="overflow-hidden card-hover h-full border-0 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="h-48 overflow-hidden relative">
          <img 
            src={articleImage} 
            alt={post.title} 
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
          />
          <div className="absolute top-3 left-3">
            <span className="text-xs px-3 py-1 bg-green-50 text-green-800 rounded-full font-medium shadow-sm">
              {post.category}
            </span>
          </div>
        </div>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-revgreen transition-colors">{post.title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
          
          <div className="flex text-sm text-gray-500 space-x-4 mb-4">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>{formatDate(post.date)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{post.readTime}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={authorInfo.avatar} alt={authorInfo.name} />
                <AvatarFallback>{authorInfo.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{authorInfo.name}</p>
                <p className="text-xs text-gray-500">{authorInfo.role}</p>
              </div>
            </div>
            <span className="text-revgreen opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
              <span className="text-sm font-medium mr-1">Ler</span>
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default BlogCard;
