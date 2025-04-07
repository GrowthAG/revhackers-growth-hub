
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Calendar, TrendingUp, Users, Target, Laptop, Layers, Zap, Rocket } from 'lucide-react';
import ContactFormSection from '@/components/home/ContactFormSection';

const QuemSomos = () => {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="pt-28 pb-16 md:pt-40 md:pb-20 bg-gradient-to-br from-black to-gray-900 text-white relative">
        <div className="absolute inset-0 z-0 opacity-15">
          <img 
            src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5" 
            alt="Team Collaboration" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Somos a <span className="text-revgreen">RevHackers</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-300 max-w-lg">
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
                Fundada em 2012, a RevHackers nasceu da percepção de que empresas B2B brasileiras 
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

      {/* Linha do Tempo */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Nossa evolução
            </h2>
            <p className="text-lg text-gray-600">
              De 2012 a 2025: Uma jornada de inovação e crescimento exponencial
            </p>
          </div>
          
          <div className="relative">
            {/* Linha central */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-revgreen/30"></div>
            
            {/* 2012-2013 */}
            <div className="relative mb-20">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 md:text-right order-2 md:order-1">
                  <h3 className="text-2xl font-bold text-revgreen mb-2">2012-2013</h3>
                  <h4 className="text-xl font-semibold mb-3">Início com websites e landing pages</h4>
                  <p className="text-gray-600">
                    Começamos desenvolvendo websites e páginas de vendas para pequenas empresas, 
                    focados em design responsivo e conversões.
                  </p>
                </div>
                <div className="md:w-1/2 flex justify-center md:justify-start order-1 md:order-2 mb-6 md:mb-0">
                  <div className="w-16 h-16 rounded-full bg-revgreen flex items-center justify-center z-10">
                    <Laptop className="text-white w-8 h-8" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* 2014-2015 */}
            <div className="relative mb-20">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 flex justify-center md:justify-end order-1 mb-6 md:mb-0">
                  <div className="w-16 h-16 rounded-full bg-revgreen flex items-center justify-center z-10">
                    <Users className="text-white w-8 h-8" />
                  </div>
                </div>
                <div className="md:w-1/2 md:pl-12 md:text-left order-2">
                  <h3 className="text-2xl font-bold text-revgreen mb-2">2014-2015</h3>
                  <h4 className="text-xl font-semibold mb-3">Expansão para mídias sociais</h4>
                  <p className="text-gray-600">
                    Expandimos nossa oferta para incluir gestão de mídias sociais e estratégias de 
                    conteúdo, ajudando empresas a construir presença online consistente.
                  </p>
                </div>
              </div>
            </div>
            
            {/* 2016-2017 */}
            <div className="relative mb-20">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 md:text-right order-2 md:order-1">
                  <h3 className="text-2xl font-bold text-revgreen mb-2">2016-2017</h3>
                  <h4 className="text-xl font-semibold mb-3">Tráfego pago e análise de dados</h4>
                  <p className="text-gray-600">
                    Implementamos estratégias avançadas de tráfego pago e começamos a aplicar análise de dados 
                    para otimização de campanhas e ROI mensurável.
                  </p>
                </div>
                <div className="md:w-1/2 flex justify-center md:justify-start order-1 md:order-2 mb-6 md:mb-0">
                  <div className="w-16 h-16 rounded-full bg-revgreen flex items-center justify-center z-10">
                    <TrendingUp className="text-white w-8 h-8" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* 2018-2019 */}
            <div className="relative mb-20">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 flex justify-center md:justify-end order-1 mb-6 md:mb-0">
                  <div className="w-16 h-16 rounded-full bg-revgreen flex items-center justify-center z-10">
                    <Layers className="text-white w-8 h-8" />
                  </div>
                </div>
                <div className="md:w-1/2 md:pl-12 md:text-left order-2">
                  <h3 className="text-2xl font-bold text-revgreen mb-2">2018-2019</h3>
                  <h4 className="text-xl font-semibold mb-3">Funis de vendas completos</h4>
                  <p className="text-gray-600">
                    Desenvolvemos metodologias para criação e otimização de funis de vendas completos, 
                    integrando marketing e vendas em processos fluidos.
                  </p>
                </div>
              </div>
            </div>
            
            {/* 2020-2021 */}
            <div className="relative mb-20">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 md:text-right order-2 md:order-1">
                  <h3 className="text-2xl font-bold text-revgreen mb-2">2020-2021</h3>
                  <h4 className="text-xl font-semibold mb-3">Automação de marketing</h4>
                  <p className="text-gray-600">
                    Implementamos soluções avançadas de automação de marketing e vendas, 
                    permitindo escalabilidade e personalização das jornadas de clientes.
                  </p>
                </div>
                <div className="md:w-1/2 flex justify-center md:justify-start order-1 md:order-2 mb-6 md:mb-0">
                  <div className="w-16 h-16 rounded-full bg-revgreen flex items-center justify-center z-10">
                    <Zap className="text-white w-8 h-8" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* 2022-2023 */}
            <div className="relative mb-20">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 flex justify-center md:justify-end order-1 mb-6 md:mb-0">
                  <div className="w-16 h-16 rounded-full bg-revgreen flex items-center justify-center z-10">
                    <Target className="text-white w-8 h-8" />
                  </div>
                </div>
                <div className="md:w-1/2 md:pl-12 md:text-left order-2">
                  <h3 className="text-2xl font-bold text-revgreen mb-2">2022-2023</h3>
                  <h4 className="text-xl font-semibold mb-3">RevOps e ABM</h4>
                  <p className="text-gray-600">
                    Criamos nossa metodologia RevOps e implementamos estratégias de Account-Based Marketing (ABM) 
                    para empresas B2B que buscam crescimento estratégico.
                  </p>
                </div>
              </div>
            </div>
            
            {/* 2024-2025 */}
            <div className="relative">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 md:text-right order-2 md:order-1">
                  <h3 className="text-2xl font-bold text-revgreen mb-2">2024-2025</h3>
                  <h4 className="text-xl font-semibold mb-3">Ecossistema completo</h4>
                  <p className="text-gray-600">
                    Nos tornamos um ecossistema completo de educação, marketing, vendas e tecnologia, 
                    oferecendo soluções integradas para o crescimento sustentável de empresas B2B.
                  </p>
                </div>
                <div className="md:w-1/2 flex justify-center md:justify-start order-1 md:order-2 mb-6 md:mb-0">
                  <div className="w-16 h-16 rounded-full bg-revgreen flex items-center justify-center z-10">
                    <Rocket className="text-white w-8 h-8" />
                  </div>
                </div>
              </div>
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

      {/* Contato Section */}
      <ContactFormSection />

      {/* CTA Section */}
      <section className="section-padding bg-black text-white relative">
        <div className="absolute inset-0 z-0 opacity-15">
          <img 
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf" 
            alt="Growth strategy" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container-custom relative z-10">
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
