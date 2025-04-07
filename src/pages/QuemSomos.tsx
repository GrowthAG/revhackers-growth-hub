
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import BookingWidget from '@/components/shared/BookingWidget';

const QuemSomos = () => {
  const timelineEvents = [
    {
      year: 2012,
      title: "Nascimento da ideia",
      description: "Fundação da agência digital com foco em marketing digital para pequenas empresas."
    },
    {
      year: 2014,
      title: "Expansão para marketing B2B",
      description: "Especialização em estratégias de marketing para empresas de tecnologia e SaaS."
    },
    {
      year: 2016,
      title: "Entrada no mercado de automação",
      description: "Primeiros projetos de automação de marketing e implementação de CRM integrado."
    },
    {
      year: 2018,
      title: "Desenvolvimento da metodologia RevOps",
      description: "Criação da metodologia própria de Revenue Operations para empresas B2B."
    },
    {
      year: 2019,
      title: "Nasce a RevHackers",
      description: "Rebranding e foco exclusivo em estratégias de crescimento baseadas em RevOps."
    },
    {
      year: 2021,
      title: "Expansão nacional",
      description: "Abertura de novas frentes de atuação em diferentes regiões do Brasil."
    },
    {
      year: 2023,
      title: "Comunidade RevHackers",
      description: "Lançamento da comunidade para profissionais de RevOps, Marketing e Vendas B2B."
    },
    {
      year: 2025,
      title: "Consolidação de metodologia",
      description: "Implementação de frameworks proprietários e consolidação da metodologia em grandes empresas."
    },
    {
      year: 2026,
      title: "Expansão internacional",
      description: "Início das operações na América Latina e parcerias estratégicas com empresas globais de tecnologia."
    }
  ];

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="pt-28 pb-16 md:pt-40 md:pb-20 bg-gradient-to-br from-white to-gray-50">
        <div className="container-custom">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-8">
              Somos a <img src="/lovable-uploads/523a572a-20db-48ed-b7d7-aed43501e687.png" alt="RevHackers" className="h-12 inline-block ml-2 mb-1" />
            </h1>
            
            <p className="text-lg md:text-xl text-gray-700 mb-10">
              Transformamos estratégias de marketing B2B através de funis de vendas otimizados, automações inteligentes e integração entre times de marketing e vendas para gerar resultados mensuráveis.
            </p>
            
            <Button 
              asChild 
              className="bg-revgreen text-white font-medium px-6 py-6 rounded-md hover:brightness-110 transition-all shadow-lg"
            >
              <Link to="/diagnostico">
                Conheça nossa metodologia
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Nossa história
            </h2>
            <p className="text-lg text-gray-600">
              Como nasceu a RevHackers e nossa missão de transformar o crescimento B2B no Brasil
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7" 
                alt="Tecnologia e dados para crescimento de negócios" 
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
            
            <div className="space-y-6">
              <h3 className="text-2xl font-bold mb-4">Do problema à solução</h3>
              <p className="text-gray-700">
                Fundada em 2019, a RevHackers nasceu da percepção de que empresas B2B brasileiras 
                enfrentavam desafios complexos para crescer de forma escalável e previsível. Nossa equipe 
                de especialistas identificou que faltavam metodologias estruturadas e orientadas por dados 
                para impulsionar o crescimento sustentável.
              </p>
              <p className="text-gray-700">
                Combinando experiência em marketing, tecnologia e dados, desenvolvemos frameworks próprios 
                que já ajudaram mais de 150 empresas a transformar seus resultados através de estratégias 
                como PLG, ABM e automação avançada.
              </p>
              <p className="text-gray-700">
                Hoje, trabalhamos com empresas de diversos setores e tamanhos, sempre com foco em 
                entregar resultados mensuráveis e construir capacidades internas para crescimento contínuo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Nossa Jornada
            </h2>
            <p className="text-lg text-gray-600">
              De 2012 até 2026: Como construímos a RevHackers ao longo dos anos
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline center line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-revgreen/30"></div>
            
            <div className="space-y-12">
              {timelineEvents.map((event, index) => (
                <div key={index} className="relative">
                  {/* Desktop layout */}
                  <div className="hidden md:flex items-center">
                    <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'order-last pl-12'}`}>
                      <div className="mb-2">
                        <span className="text-4xl font-bold text-revgreen">{event.year}</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                      <p className="text-gray-600">{event.description}</p>
                    </div>
                    
                    <div className="z-10 flex items-center justify-center w-10 h-10 bg-revgreen rounded-full shrink-0 mx-auto">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    
                    <div className={`w-1/2 ${index % 2 === 0 ? 'order-last pl-12' : 'pr-12 text-right'}`}>
                      {index % 2 !== 0 && (
                        <>
                          <div className="mb-2">
                            <span className="text-4xl font-bold text-revgreen">{event.year}</span>
                          </div>
                          <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                          <p className="text-gray-600">{event.description}</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Mobile layout */}
                  <div className="md:hidden flex gap-4">
                    <div className="z-10 flex items-center justify-center w-10 h-10 bg-revgreen rounded-full shrink-0">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <div className="mb-2">
                        <span className="text-2xl font-bold text-revgreen">{event.year}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                      <p className="text-gray-600">{event.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Nossos Valores */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Nossos valores
            </h2>
            <p className="text-lg text-gray-600">
              Princípios que guiam nossa atuação e nosso compromisso com os clientes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-revgreen/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-6 w-6 text-revgreen" />
              </div>
              <h3 className="text-xl font-bold mb-3">Orientação por dados</h3>
              <p className="text-gray-600">
                Todas as decisões e estratégias são fundamentadas em dados concretos, análises aprofundadas e 
                evidências mensuráveis, não em suposições ou tendências passageiras.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-revgreen/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-6 w-6 text-revgreen" />
              </div>
              <h3 className="text-xl font-bold mb-3">Inovação constante</h3>
              <p className="text-gray-600">
                Buscamos continuamente novas tecnologias, metodologias e abordagens para garantir que nossos 
                clientes estejam sempre à frente em suas estratégias de crescimento.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-revgreen/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-6 w-6 text-revgreen" />
              </div>
              <h3 className="text-xl font-bold mb-3">Transparência</h3>
              <p className="text-gray-600">
                Mantemos comunicação clara e honesta sobre resultados, desafios e oportunidades, construindo 
                relações de confiança duradouras com nossos clientes e parceiros.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-revgreen/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-6 w-6 text-revgreen" />
              </div>
              <h3 className="text-xl font-bold mb-3">Resultados mensuráveis</h3>
              <p className="text-gray-600">
                Focamos em KPIs claros e resultados tangíveis que impactam diretamente o crescimento e a 
                lucratividade dos negócios que atendemos.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-revgreen/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-6 w-6 text-revgreen" />
              </div>
              <h3 className="text-xl font-bold mb-3">Transferência de conhecimento</h3>
              <p className="text-gray-600">
                Não apenas implementamos soluções, mas capacitamos equipes para que possam continuar evoluindo e 
                executando estratégias de crescimento com autonomia.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-revgreen/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-6 w-6 text-revgreen" />
              </div>
              <h3 className="text-xl font-bold mb-3">Excelência técnica</h3>
              <p className="text-gray-600">
                Mantemos o mais alto padrão de qualidade técnica em nossas implementações, estratégias e 
                recomendações, com equipe especializada e em constante atualização.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Agendamento */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <BookingWidget />
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-black text-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold">
                Vamos crescer <span className="text-revgreen">juntos?</span>
              </h2>
              
              <p className="text-lg text-gray-300">
                Agende uma conversa com nossos especialistas e descubra como podemos 
                ajudar sua empresa a escalar resultados de forma sustentável.
              </p>
              
              <Button 
                asChild 
                className="bg-revgreen text-white font-medium px-8 py-4 rounded-md hover:brightness-110 transition-all shadow-lg"
              >
                <Link to="/diagnostico">
                  Falar com um especialista
                </Link>
              </Button>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
                alt="Estratégias de crescimento" 
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default QuemSomos;
