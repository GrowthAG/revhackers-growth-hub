
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import BookingWidget from '@/components/shared/BookingWidget';

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
                  className="bg-revgreen text-white font-medium px-6 py-6 rounded-md hover:brightness-110 transition-all shadow-lg"
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

      {/* Clientes e Parceiros */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Empresas que confiam no poder do Growth
            </h2>
            <p className="text-lg text-gray-600">
              Conheça algumas das empresas que já transformaram seus resultados com a RevHackers
            </p>
          </div>
          
          {/* Primeira linha de logos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
            <div className="p-6 bg-white rounded-lg flex items-center justify-center h-24 shadow-sm">
              <img 
                src="https://www.waproject.com.br/assets/logos/waproject-logo-colored.svg" 
                alt="WA Project" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="p-6 bg-white rounded-lg flex items-center justify-center h-24 shadow-sm">
              <img 
                src="https://enics.com.br/wp-content/uploads/2024/03/logo.png" 
                alt="Enics" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="p-6 bg-white rounded-lg flex items-center justify-center h-24 shadow-sm">
              <img 
                src="https://growthfunnels.com.br/wp-content/uploads/2023/07/logo-escura.png" 
                alt="Growth Funnels" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="p-6 bg-white rounded-lg flex items-center justify-center h-24 shadow-sm">
              <img 
                src="https://bldndigital.com.br/wp-content/uploads/2024/02/cropped-cropped-logo-bldn-2-e1709297192702.png" 
                alt="BLDN Digital" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>

          {/* Segunda linha de logos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
            <div className="p-6 bg-white rounded-lg flex items-center justify-center h-24 shadow-sm">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/8/89/Heineken_logo.svg" 
                alt="Heineken" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="p-6 bg-white rounded-lg flex items-center justify-center h-24 shadow-sm">
              <img 
                src="https://s3.amazonaws.com/gupy5/production/companies/2033/career/4864/images/2021-10-26_15-33_logo.png" 
                alt="Omni" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="p-6 bg-white rounded-lg flex items-center justify-center h-24 shadow-sm">
              <img 
                src="https://www.tikpag.com.br/wp-content/uploads/2022/01/logo-tikpag.png" 
                alt="TikPag" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="p-6 bg-white rounded-lg flex items-center justify-center h-24 shadow-sm">
              <img 
                src="https://www.datavoxx.com.br/wp-content/uploads/2022/07/logo-datavoxx-1.png" 
                alt="DataVoxx" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>

          {/* Terceira linha de logos - novos clientes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
            <div className="p-6 bg-white rounded-lg flex items-center justify-center h-24 shadow-sm">
              <img 
                src="https://securityfirst.com.br/wp-content/uploads/2022/12/logo-ret.svg" 
                alt="Security First" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="p-6 bg-white rounded-lg flex items-center justify-center h-24 shadow-sm">
              <img 
                src="https://portal.anhembi.br/wp-content/uploads/2023/12/logo-anhembi.png" 
                alt="Anhembi Morumbi" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="p-6 bg-white rounded-lg flex items-center justify-center h-24 shadow-sm">
              <img 
                src="https://www.fmuvirtual.com.br/wp-content/themes/fmuvirtual/assets/images/fmu-virtual.svg" 
                alt="FMU Virtual" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="p-6 bg-white rounded-lg flex items-center justify-center h-24 shadow-sm">
              <img 
                src="https://toefljunior.com.br/wp-content/uploads/2022/12/logo.png" 
                alt="TOEFL Junior" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>

          {/* Quarta linha de logos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="p-6 bg-white rounded-lg flex items-center justify-center h-24 shadow-sm">
              <img 
                src="https://enovaimobiliaria.com.br/wp-content/uploads/2019/11/Enove-Logo-Imobiliaria.png" 
                alt="Enove Imobiliária" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="p-6 bg-white rounded-lg flex items-center justify-center h-24 shadow-sm">
              <img 
                src="https://ideeseguros.com.br/wp-content/uploads/2019/10/logo-idee-seguros.png" 
                alt="Idee Seguros" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="p-6 bg-white rounded-lg flex items-center justify-center h-24 shadow-sm">
              <img 
                src="https://www.flexsolucoesfibraotica.com.br/wp-content/uploads/2023/02/Flex-Solucoes-26-anos.png" 
                alt="Flex Soluções" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="p-6 bg-white rounded-lg flex items-center justify-center h-24 shadow-sm">
              <img 
                src="https://agence.com.br/wp-content/uploads/2020/12/agence-logo.svg" 
                alt="Agence" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Button asChild className="bg-revgreen text-white">
              <Link to="/cases">
                Ver cases de sucesso
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
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
