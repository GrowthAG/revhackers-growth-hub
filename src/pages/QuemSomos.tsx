
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';

const QuemSomos = () => {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="pt-28 pb-16 md:pt-40 md:pb-20 bg-gradient-to-br from-white to-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Somos a <span className="text-revgreen">RevHackers</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-700 max-w-lg">
                Ajudamos empresas a escalar com inteligência através de automação, crescimento e inovação orientados por dados.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  asChild 
                  className="bg-revgreen text-black font-medium px-6 py-6 rounded-md hover:brightness-110 transition-all shadow-lg"
                  style={{ backgroundColor: '#D3FF00' }}
                >
                  <Link to="/diagnostico">
                    Conheça nossa metodologia
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -z-10 top-1/3 right-1/3 w-72 h-72 bg-revgreen/20 rounded-full blur-3xl" />
              <img 
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
                alt="Equipe RevHackers" 
                className="w-full h-auto rounded-lg shadow-xl"
              />
            </div>
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
                src="https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b" 
                alt="Ideia inovadora" 
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

      {/* Nossos Valores */}
      <section className="py-16 md:py-24 bg-gray-50">
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
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-revgreen/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-6 w-6 text-revgreen" />
              </div>
              <h3 className="text-xl font-bold mb-3">Orientação por dados</h3>
              <p className="text-gray-600">
                Todas as decisões e estratégias são fundamentadas em dados concretos, análises aprofundadas e 
                evidências mensuráveis, não em suposições ou tendências passageiras.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-revgreen/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-6 w-6 text-revgreen" />
              </div>
              <h3 className="text-xl font-bold mb-3">Inovação constante</h3>
              <p className="text-gray-600">
                Buscamos continuamente novas tecnologias, metodologias e abordagens para garantir que nossos 
                clientes estejam sempre à frente em suas estratégias de crescimento.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-revgreen/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-6 w-6 text-revgreen" />
              </div>
              <h3 className="text-xl font-bold mb-3">Transparência</h3>
              <p className="text-gray-600">
                Mantemos comunicação clara e honesta sobre resultados, desafios e oportunidades, construindo 
                relações de confiança duradouras com nossos clientes e parceiros.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-revgreen/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-6 w-6 text-revgreen" />
              </div>
              <h3 className="text-xl font-bold mb-3">Resultados mensuráveis</h3>
              <p className="text-gray-600">
                Focamos em KPIs claros e resultados tangíveis que impactam diretamente o crescimento e a 
                lucratividade dos negócios que atendemos.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-revgreen/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-6 w-6 text-revgreen" />
              </div>
              <h3 className="text-xl font-bold mb-3">Transferência de conhecimento</h3>
              <p className="text-gray-600">
                Não apenas implementamos soluções, mas capacitamos equipes para que possam continuar evoluindo e 
                executando estratégias de crescimento com autonomia.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm">
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

      {/* Nossa Equipe */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Conheça nosso time
            </h2>
            <p className="text-lg text-gray-600">
              Especialistas apaixonados por crescimento, tecnologia e resultados
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="overflow-hidden rounded-lg">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-auto transition-transform hover:scale-110 duration-500"
                    />
                  </div>
                  {member.linkedin && (
                    <a 
                      href={member.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-revgreen flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect x="2" y="9" width="4" height="12"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                    </a>
                  )}
                </div>
                <h3 className="font-bold text-lg">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clientes e Parceiros */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Clientes e parceiros
            </h2>
            <p className="text-lg text-gray-600">
              Empresas que confiam na RevHackers para acelerar seu crescimento
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {clientLogos.map((logo, index) => (
              <div key={index} className="p-6 bg-white rounded-lg flex items-center justify-center h-24">
                <img 
                  src={logo.src} 
                  alt={logo.alt} 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Button asChild className="btn-primary">
              <Link to="/cases">
                Ver cases de sucesso
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
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
                className="bg-revgreen text-black font-medium px-8 py-4 rounded-md hover:brightness-110 transition-all shadow-lg"
                style={{ backgroundColor: '#D3FF00' }}
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

// Dados de membros da equipe
const teamMembers = [
  {
    name: "Ana Mendes",
    role: "CEO & Fundadora",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    linkedin: "https://linkedin.com/"
  },
  {
    name: "Ricardo Torres",
    role: "Head de Estratégia",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    linkedin: "https://linkedin.com/"
  },
  {
    name: "Juliana Costa",
    role: "Head de Operações",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
    linkedin: "https://linkedin.com/"
  },
  {
    name: "Carlos Silva",
    role: "Especialista em Dados",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    linkedin: "https://linkedin.com/"
  },
  {
    name: "Mariana Santos",
    role: "Consultora de Growth",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956",
    linkedin: "https://linkedin.com/"
  },
  {
    name: "Fernando Lima",
    role: "Especialista em PLG",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    linkedin: "https://linkedin.com/"
  },
  {
    name: "Patricia Alves",
    role: "Especialista em ABM",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    linkedin: "https://linkedin.com/"
  },
  {
    name: "Rafael Gomez",
    role: "Especialista em Automação",
    image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79",
    linkedin: "https://linkedin.com/"
  }
];

// Logos dos clientes
const clientLogos = [
  { src: "https://revhackers.com.br/images/softexpert-logo.webp", alt: "SoftExpert" },
  { src: "https://revhackers.com.br/images/rd-station-logo.webp", alt: "RD Station" },
  { src: "https://revhackers.com.br/images/contabilizei-logo.webp", alt: "Contabilizei" },
  { src: "https://placeholder.com/wp-content/uploads/2018/10/placeholder.png", alt: "Cliente 4" },
  { src: "https://placeholder.com/wp-content/uploads/2018/10/placeholder.png", alt: "Cliente 5" },
  { src: "https://placeholder.com/wp-content/uploads/2018/10/placeholder.png", alt: "Cliente 6" },
  { src: "https://placeholder.com/wp-content/uploads/2018/10/placeholder.png", alt: "Cliente 7" },
  { src: "https://placeholder.com/wp-content/uploads/2018/10/placeholder.png", alt: "Cliente 8" },
  { src: "https://placeholder.com/wp-content/uploads/2018/10/placeholder.png", alt: "Cliente 9" },
  { src: "https://placeholder.com/wp-content/uploads/2018/10/placeholder.png", alt: "Cliente 10" }
];

export default QuemSomos;
