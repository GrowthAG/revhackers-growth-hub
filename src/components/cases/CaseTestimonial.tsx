
import { CaseStudy } from '@/data/casesData';

interface CaseTestimonialProps {
  caseData: CaseStudy;
}

const CaseTestimonial = ({ caseData }: CaseTestimonialProps) => {
  return (
    <div className="bg-gray-50 p-8 rounded-xl shadow-sm">
      <blockquote className="text-xl italic text-gray-700 mb-6">
        "{caseData.quote}"
      </blockquote>
      <div className="flex flex-col">
        <p className="font-bold text-lg">{caseData.author}</p>
        <p className="text-gray-600">{caseData.role}</p>
      </div>
    </div>
  );
};

export default CaseTestimonial;
