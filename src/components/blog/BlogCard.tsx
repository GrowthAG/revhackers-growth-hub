import { useMemo } from 'react';
import { Clock, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import BlogCoverArt from './BlogCoverArt';

interface Author {
  name: string;
  role: string;
  avatar: string;
}

interface BlogPost {
  id: number | string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  image: string;
  category: string;
  author: Author;
}

interface BlogCardProps {
  post: BlogPost;
  onClick?: () => void;
}

const BlogCard = ({ post, onClick }: BlogCardProps) => {
  const cleanExcerpt = useMemo(() =>
    (post.excerpt || '').replace(/<[^>]*>?/gm, ''),
    [post.excerpt]
  );

  return (
    <Link
      to={`/blog/${post.slug || post.id}`}
      className="group block h-full"
      onClick={onClick}
    >
      <article className="h-full flex flex-col bg-white border border-zinc-200/80 rounded-xl overflow-hidden hover:border-zinc-300 transition-all duration-300 shadow-xs hover:shadow-md p-5 space-y-4">
        {/* Cover Container */}
        <div className="aspect-[16/9] w-full rounded-lg border border-zinc-800 relative overflow-hidden">
          <BlogCoverArt seed={post.slug || post.id} className="w-full h-full transition-transform duration-500 group-hover:scale-[1.02]" />
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#00CC6A] text-black">
              {post.category}
            </span>
          </div>
        </div>

        {/* Content Details */}
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
              <Clock size={13} className="text-zinc-400" />
              <span>{post.readTime || '5 min de leitura'}</span>
            </div>

            <h3 className="text-lg font-bold text-zinc-900 group-hover:text-black leading-snug tracking-tight">
              {post.title}
            </h3>

            <p className="text-xs text-zinc-500 font-normal line-clamp-3 leading-relaxed">
              {cleanExcerpt}
            </p>
          </div>

          {/* Author Footer */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={post.author?.avatar || '/uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png'}
                alt={post.author?.name || 'Giulliano Alves'}
                className="w-7 h-7 rounded-full object-cover border border-zinc-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png';
                }}
              />
              <div>
                <span className="text-xs font-semibold text-zinc-900 block leading-tight">{post.author?.name}</span>
                <span className="text-[10px] text-zinc-500 font-medium block">{post.author?.role}</span>
              </div>
            </div>

            <div className="w-7 h-7 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center group-hover:bg-zinc-950 group-hover:text-white transition-all">
              <ArrowUpRight size={14} className="text-zinc-500 group-hover:text-[#00CC6A]" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default BlogCard;
