
import { CaseStudy } from '@/data/casesData';

interface CaseHeroProps {
  caseData: CaseStudy;
}

const CaseHero = ({ caseData }: CaseHeroProps) => {
  return (
    <section className="pt-32 pb-12 bg-gradient-to-br from-black to-gray-900 text-white relative">
      <div className="absolute inset-0 z-0 opacity-20">
        <img 
          src={caseData.coverImage} 
          alt={`${caseData.title} cover`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <span className="text-sm text-gray-300 border border-gray-700 rounded-full px-4 py-1">
              {caseData.category}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Case {caseData.title} - Revenue Operations
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 mt-8">
            <img 
              src={caseData.logo} 
              alt={caseData.title} 
              className="h-16 bg-white p-2 rounded-lg object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseHero;
