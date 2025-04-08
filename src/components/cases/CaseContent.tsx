
import { CaseStudy } from '@/data/casesData';
import CaseMetrics from './CaseMetrics';
import CaseTestimonial from './CaseTestimonial';
import ContactForm from '@/components/shared/contact-form';

interface CaseContentProps {
  caseData: CaseStudy;
}

const CaseContent = ({ caseData }: CaseContentProps) => {
  return (
    <section className="py-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <img 
            src={caseData.coverImage} 
            alt={`${caseData.title} case study`} 
            className="w-full h-auto rounded-xl mb-12 shadow-lg"
          />
          
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold mb-4">O Desafio</h2>
              <p className="text-gray-700">{caseData.challenge}</p>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-4">A Solução</h2>
              <p className="text-gray-700">{caseData.solution}</p>
            </div>

            <CaseMetrics caseData={caseData} />
            
            <CaseTestimonial caseData={caseData} />
            
            <div className="text-center pt-8">
              <h2 className="text-2xl font-bold mb-6">
                Quer resultados como estes para sua empresa?
              </h2>
              
              <div className="mt-8 max-w-xl mx-auto bg-gray-50 p-8 rounded-xl shadow-sm">
                <ContactForm formType="diagnosis" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseContent;
