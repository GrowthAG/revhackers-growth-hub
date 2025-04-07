
import { CaseStudy } from '@/data/casesData';

interface CaseTestimonialProps {
  caseData: CaseStudy;
}

const CaseTestimonial = ({ caseData }: CaseTestimonialProps) => {
  return (
    <div className="bg-gray-50 p-8 rounded-xl">
      <blockquote className="text-xl italic text-gray-700 mb-4">
        "{caseData.quote}"
      </blockquote>
      <p className="font-bold">{caseData.author}</p>
      <p className="text-gray-600">{caseData.role}</p>
    </div>
  );
};

export default CaseTestimonial;
