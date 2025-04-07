
import { CaseStudy } from '@/data/casesData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CaseTestimonialProps {
  caseData: CaseStudy;
}

const CaseTestimonial = ({ caseData }: CaseTestimonialProps) => {
  return (
    <div className="bg-gray-50 p-8 rounded-xl shadow-sm">
      <blockquote className="text-2xl md:text-3xl font-medium leading-tight text-gray-800 mb-8 line-clamp-3">
        "{caseData.quote}"
      </blockquote>
      <div className="flex items-center">
        {caseData.authorImage && (
          <Avatar className="h-14 w-14 mr-5">
            <AvatarImage src={caseData.authorImage} alt={caseData.author} />
            <AvatarFallback>{caseData.author.substring(0, 2)}</AvatarFallback>
          </Avatar>
        )}
        <div className="flex flex-col">
          <p className="font-bold text-xl md:text-2xl">{caseData.author}</p>
          <p className="text-gray-600 text-base md:text-lg">{caseData.role}</p>
        </div>
      </div>
    </div>
  );
};

export default CaseTestimonial;
