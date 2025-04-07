
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { partnersData } from '@/data/partnersData';
import ContactForm from '@/components/shared/ContactForm';
import NotFound from './NotFound';

const PartnerDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  
  if (!slug || !partnersData[slug]) {
    return <NotFound />;
  }
  
  const partner = partnersData[slug];

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-black to-gray-900 text-white relative">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src={partner.coverImage} 
            alt={`${partner.name} background`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container-custom relative z-10">
          <Link to="/cases" className="inline-flex items-center text-gray-300 hover:text-white mb-10">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>Voltar para todos os parceiros</span>
          </Link>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl w-full md:w-1/3 flex items-center justify-center">
              <img 
                src={partner.logo}
                alt={`${partner.name} logo`}
                className="max-w-[80%] max-h-40 object-contain"
              />
            </div>
            <div className="w-full md:w-2/3">
              <div className="inline-block px-3 py-1 mb-4 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">
                {partner.category}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{partner.name}</h1>
              <p className="text-xl text-gray-300 mb-6">
                {partner.description}
              </p>
              <div className="flex flex-wrap gap-3">
                {partner.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-white/10 text-gray-100 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Study Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Estratégia implementada</h2>
            <div className="prose prose-lg max-w-none mb-12">
              {partner.caseStudy.map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700">{paragraph}</p>
              ))}
            </div>

            {/* Results */}
            <div className="bg-gray-50 rounded-xl p-8 mb-12">
              <h3 className="text-2xl font-bold mb-6">Resultados alcançados</h3>
              <ul className="space-y-4">
                {partner.results.map((result, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center bg-green-100 text-green-800 rounded-full w-6 h-6 text-sm mr-3 mt-1 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span>{result}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quote */}
            {partner.testimonial && (
              <div className="border-l-4 border-green-500 pl-6 py-2 mb-12">
                <p className="text-xl italic text-gray-600 mb-4">{partner.testimonial.quote}</p>
                <p className="font-bold">{partner.testimonial.author}</p>
                <p className="text-sm text-gray-500">{partner.testimonial.role}, {partner.name}</p>
              </div>
            )}

            {/* CTA */}
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold mb-4">Quer resultados como esses?</h3>
              <p className="text-gray-600 mb-6">
                Nossos especialistas estão prontos para desenvolver uma estratégia personalizada para o seu negócio.
              </p>
              <Button asChild size="lg">
                <Link to="/diagnostico">Agende uma consultoria gratuita</Link>
              </Button>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-4 text-center">Entre em contato</h3>
              <ContactForm formType="diagnosis" />
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default PartnerDetail;
