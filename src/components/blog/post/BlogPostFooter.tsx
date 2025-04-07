
import { Linkedin, Twitter, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BlogPostFooter = () => {
  return (
    <div className="max-w-3xl mx-auto mt-12 border-t border-gray-100 pt-8">
      <div className="flex items-center justify-between">
        <span className="text-gray-500">Compartilhe este artigo:</span>
        <div className="flex space-x-3">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
            <Linkedin className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
            <Twitter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
            <Facebook className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogPostFooter;
