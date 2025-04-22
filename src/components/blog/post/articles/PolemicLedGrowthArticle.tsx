import { ArrowRight, BookOpen, CheckCircle2, Download, Eye, Link, MessageSquare, Star, TrendingUp, Users, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link as RouterLink } from 'react-router-dom';
interface PolemicLedGrowthArticleProps {
  authorName: string;
  authorRole: string;
}
const PolemicLedGrowthArticle = ({
  authorName,
  authorRole
}: PolemicLedGrowthArticleProps) => {
  return <div className="prose prose-lg lg:prose-xl">
      {/* Author Card - Start */}
      <div className="not-prose bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <img src="/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png" alt={authorName} className="w-20 h-20 rounded-full object-cover border-2 border-revgreen" />
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold">{authorName}</h3>
            <p className="text-gray-600">{authorRole}</p>
            <div className="flex items-center justify-center sm:justify-start mt-2 gap-4">
              <span className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Atualizado em 13 abril, 2025</span>
              </span>
              <span className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>12 min de leitura</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Author Card - End */}

      <p className="lead text-xl mb-8">
        Em um mundo onde todos lutam por atenção online, a verdadeira autoridade não é construída gritando mais alto, mas sim através de um posicionamento estratégico e magnético.
      </p>
      
      <figure className="my-10">
        <img alt="Reação de choque e surpresa - a essência do Polemic Led Growth" className="w-full h-auto rounded-lg shadow-md" src="/lovable-uploads/598e264f-f94b-4ef1-a672-c75147e00f3a.jpg" />
        <figcaption className="text-center text-sm text-gray-500 mt-2">
          Visibilidade com autoridade: o verdadeiro objetivo do Polemic Led Growth
        </figcaption>
      </figure>

      <h2 id="introducao">A invisibilidade digital no LinkedIn: o maior problema dos profissionais competentes</h2>
      
      <p>
        Você já se perguntou por que alguns profissionais medianos parecem atrair todas as oportunidades 
        no LinkedIn, enquanto outros extremamente talentosos permanecem invisíveis? O problema não 
        é sua competência profissional — é sua estratégia de posicionamento.
      </p>

      <div className="not-prose my-8 bg-green-50 p-6 rounded-lg border border-green-100">
        <p className="text-lg font-medium italic">
          "Seu LinkedIn não é um currículo. É uma máquina de conversão invisível – se bem configurado."
        </p>
      </div>
      
      <p>
        A verdade é que o LinkedIn deixou de ser apenas uma plataforma para buscar empregos e se tornou um 
        poderoso ecossistema de oportunidades de negócios, parcerias e reconhecimento profissional. No entanto, 
        a maioria dos usuários ainda o utiliza como um simples repositório de experiências passadas, sem 
        uma estratégia clara de posicionamento futuro.
      </p>

      <h2 id="o-que-e">O que é o Polemic Led Growth?</h2>
      
      <p>
        O Polemic Led Growth (PLG) é uma metodologia estratégica de construção de autoridade silenciosa 
        nas redes profissionais, com foco principal no LinkedIn. Diferente do que o nome pode sugerir, 
        não se trata de criar polêmicas vazias ou gerar controvérsias desnecessárias.
      </p>

      <div className="not-prose my-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold mb-3 flex items-center">
          <BookOpen className="mr-2 text-revgreen" size={20} />
          A origem do termo "Polemic"
        </h3>
        <p className="text-gray-700">
          A palavra "polêmica" vem do grego "polemikos", que significa "relativo à guerra" ou "controverso". No contexto 
          do método PLG, utilizamos o conceito de "polêmica construtiva" — ideias que desafiam o status quo e provocam 
          reflexão, sem necessariamente gerar conflito. São perspectivas que fazem as pessoas pararem para pensar.
        </p>
      </div>
      
      <p>
        Esta abordagem se baseia em cinco pilares fundamentais que, quando implementados de forma 
        coordenada, transformam seu perfil do LinkedIn em um verdadeiro ímã de oportunidades:
      </p>

      <ul className="space-y-2 mb-8">
        <li className="flex items-start">
          <CheckCircle2 className="h-5 w-5 text-revgreen mr-2 flex-shrink-0 mt-1" />
          <span><strong>Posicionamento magnético</strong> que comunica claramente seu valor único</span>
        </li>
        <li className="flex items-start">
          <CheckCircle2 className="h-5 w-5 text-revgreen mr-2 flex-shrink-0 mt-1" />
          <span><strong>Narrativa estratégica</strong> que conecta sua história profissional a um propósito claro</span>
        </li>
        <li className="flex items-start">
          <CheckCircle2 className="h-5 w-5 text-revgreen mr-2 flex-shrink-0 mt-1" />
          <span><strong>Provas sociais específicas</strong> que validam sua autoridade sem autopromoção explícita</span>
        </li>
        <li className="flex items-start">
          <CheckCircle2 className="h-5 w-5 text-revgreen mr-2 flex-shrink-0 mt-1" />
          <span><strong>Gatilhos psicológicos</strong> que ativam curiosidade, escassez e desejo de conexão</span>
        </li>
        <li className="flex items-start">
          <CheckCircle2 className="h-5 w-5 text-revgreen mr-2 flex-shrink-0 mt-1" />
          <span><strong>Conteúdo que ativa demanda</strong>, não apenas visibilidade sem propósito</span>
        </li>
      </ul>

      <figure className="my-10">
        
        
      </figure>

      <h2 id="framework">O Framework do Polemic Led Growth</h2>
      
      <figure className="my-12">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-6 text-center">AS 5 ENGRENAGENS DO POLEMIC LED GROWTH</h3>
          
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 border-b border-gray-200 pb-6">
              <div className="bg-revgreen text-black font-bold rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">1</div>
              <div>
                <h4 className="text-lg font-bold mb-2 text-center md:text-left">POSICIONAMENTO MAGNÉTICO</h4>
                <p className="text-gray-600">Clareza sobre quem você ajuda, como e com qual diferencial único que apenas você pode oferecer. Este é o alicerce de toda a estratégia.</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 border-b border-gray-200 pb-6">
              <div className="bg-revgreen text-black font-bold rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">2</div>
              <div>
                <h4 className="text-lg font-bold mb-2 text-center md:text-left">PROVOCAÇÃO SILENCIOSA</h4>
                <p className="text-gray-600">Bio, headline e conteúdos com contraintuições e frases que criam gaps de curiosidade, incentivando a investigação sobre seu trabalho.</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 border-b border-gray-200 pb-6">
              <div className="bg-revgreen text-black font-bold rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">3</div>
              <div>
                <h4 className="text-lg font-bold mb-2 text-center md:text-left">PROVA SOCIAL ESTRATÉGICA</h4>
                <p className="text-gray-600">Recomendações, números, cases e marcas que validam sua autoridade sem que você precise afirmá-la diretamente.</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 border-b border-gray-200 pb-6">
              <div className="bg-revgreen text-black font-bold rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">4</div>
              <div>
                <h4 className="text-lg font-bold mb-2 text-center md:text-left">CONTEÚDO DE DOMÍNIO</h4>
                <p className="text-gray-600">Publicações que reforçam seus pilares: autoridade, processo, resultados e disrupção em sua área de atuação.</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="bg-revgreen text-black font-bold rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">5</div>
              <div>
                <h4 className="text-lg font-bold mb-2 text-center md:text-left">SISTEMA DE ATRAÇÃO</h4>
                <p className="text-gray-600">Call to actions, ativos em destaque e mensagens estratégicas que convertem visualizações de perfil em oportunidades reais de negócio.</p>
              </div>
            </div>
          </div>
        </div>
        <figcaption className="text-center text-sm text-gray-500 mt-2">
          Framework completo do Polemic Led Growth para maximizar seu posicionamento no LinkedIn
        </figcaption>
      </figure>
      
      <h2 id="beneficios">Benefícios do método Polemic Led Growth</h2>
      
      <p>
        Implementar o PLG como estratégia de posicionamento no LinkedIn gera resultados tangíveis 
        e mensuráveis. Nossos clientes reportam melhorias significativas em diversos indicadores:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose my-8">
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-start mb-4">
              <Eye className="h-8 w-8 text-revgreen mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold">Aumento de visibilidade qualificada</h3>
                <p className="text-gray-600">Mais visualizações de perfil com intencionalidade estratégica, atraindo o público certo para sua expertise.</p>
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="font-bold text-green-800">+187% em visualizações de perfil em 90 dias</p>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-start mb-4">
              <Link className="h-8 w-8 text-revgreen mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold">Atração de oportunidades</h3>
                <p className="text-gray-600">Leads, convites para colaborações e propostas chegam até você, sem necessidade de prospecção ativa.</p>
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="font-bold text-green-800">+326% em mensagens de oportunidades</p>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-start mb-4">
              <TrendingUp className="h-8 w-8 text-revgreen mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold">Elevação de ticket médio</h3>
                <p className="text-gray-600">Posicionamento de valor que prepara o terreno para negociações mais favoráveis e projetos de maior porte.</p>
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="font-bold text-green-800">+43% no valor médio de projetos fechados</p>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-start mb-4">
              <Users className="h-8 w-8 text-revgreen mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold">Autoridade silenciosa</h3>
                <p className="text-gray-600">Reconhecimento como referência em sua área, sem depender de autopromoção constante ou conteúdo ostensivo.</p>
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="font-bold text-green-800">+92% em menções espontâneas como autoridade</p>
            </div>
          </div>
        </div>
      </div>

      <h2 id="exemplos">Exemplos práticos: antes e depois do PLG</h2>
      
      <div className="not-prose my-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-xl font-bold mb-4">Case: Marcelo R., Desenvolvedor Senior</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-lg mb-2 flex items-center">
              <span className="bg-gray-200 text-gray-700 text-sm px-2 py-1 rounded mr-2">ANTES</span>
              Perfil técnico genérico
            </h4>
            
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-white mb-3">
              <div className="p-4 border-b border-gray-200">
                <p className="font-medium">Marcelo Rodrigues</p>
                <p className="text-sm text-gray-600">Desenvolvedor Full Stack | JavaScript | React | Node.js</p>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600">
                  "Desenvolvedor com 8 anos de experiência em desenvolvimento web, especializado em tecnologias JavaScript e arquitetura de sistemas."
                </p>
              </div>
            </div>
            
            <div className="bg-red-50 p-3 rounded-lg mb-2">
              <div className="flex items-start">
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-2">STATS</span>
                <div>
                  <p className="text-sm">• 30-40 visualizações mensais</p>
                  <p className="text-sm">• 1-2 oportunidades por mês</p>
                  <p className="text-sm">• Propostas de baixo valor</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-2 flex items-center">
              <span className="bg-revgreen text-black text-sm px-2 py-1 rounded mr-2">DEPOIS</span>
              Posicionamento magnético
            </h4>
            
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-white mb-3">
              <div className="p-4 border-b border-gray-200">
                <p className="font-medium">Marcelo Rodrigues | Engenheiro de Performance</p>
                <p className="text-sm text-gray-800 font-medium">Recupero aplicações React que perdem clientes por serem 3x mais lentas que o esperado — Especialista em Web Vitals</p>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600">
                  "Transformo aplicações que frustram usuários por sua lentidão em experiências fluidas que aumentam conversão. Tenho um método de otimização em 4 semanas que elevou métricas de performance em +187% para 27 startups sem refatorar todo o código."
                </p>
              </div>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg mb-2">
              
            </div>
          </div>
        </div>
      </div>

      <figure className="my-10">
        
        
      </figure>
      
      <h2 id="implementacao">Como implementar o Polemic Led Growth no seu LinkedIn</h2>
      
      <p>
        A implementação do Polemic Led Growth ocorre em três etapas principais, que podem ser 
        aplicadas de forma independente ou como um processo completo de transformação:
      </p>
      
      <div className="not-prose bg-white p-6 rounded-lg border border-gray-200 my-8">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-16 flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700">1</div>
            </div>
            <div className="md:ml-4 md:flex-1">
              <h3 className="font-bold text-lg mb-2">Diagnóstico de posicionamento</h3>
              <p className="text-gray-600 mb-2">
                Análise completa do seu perfil atual, identificando pontos fortes, fracos e oportunidades de melhoria em cada um dos 5 pilares do framework.
              </p>
              <div className="p-3 bg-gray-50 rounded-lg inline-block">
                <span className="text-sm font-medium">Duração: 5-7 dias</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row">
            <div className="md:w-16 flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700">2</div>
            </div>
            <div className="md:ml-4 md:flex-1">
              <h3 className="font-bold text-lg mb-2">Reconstrução estratégica</h3>
              <p className="text-gray-600 mb-2">
                Reformulação completa do seu perfil, incluindo headline, bio, experiências, recomendações e recursos destacados, alinhados ao posicionamento magnético.
              </p>
              <div className="p-3 bg-gray-50 rounded-lg inline-block">
                <span className="text-sm font-medium">Duração: 14-21 dias</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row">
            <div className="md:w-16 flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700">3</div>
            </div>
            <div className="md:ml-4 md:flex-1">
              <h3 className="font-bold text-lg mb-2">Ativação e crescimento</h3>
              <p className="text-gray-600 mb-2">
                Implementação de estratégia de conteúdo, networking estratégico e sistema de conversão para transformar visualizações em oportunidades concretas.
              </p>
              <div className="p-3 bg-gray-50 rounded-lg inline-block">
                <span className="text-sm font-medium">Duração: 30-90 dias</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <blockquote>
        <p>"Você não precisa gritar para ser notado. Precisa de clareza, estratégia e um perfil magnético que converte visualizações em oportunidades reais enquanto você dorme."</p>
        <cite>— {authorName}, {authorRole}</cite>
      </blockquote>
      
      <h2 id="conclusao">Seu LinkedIn é uma máquina de oportunidades ou apenas um currículo digital?</h2>
      
      <p>
        O LinkedIn deixou de ser uma simples plataforma de busca de empregos para se tornar o maior ecossistema 
        de oportunidades profissionais do mundo. No entanto, a maioria dos perfis ainda opera como um mero currículo 
        digital, sem estratégia clara de posicionamento e atração.
      </p>
      
      <p>
        O método Polemic Led Growth oferece um caminho estruturado para transformar sua presença nesta 
        rede em um verdadeiro ímã de oportunidades, construindo autoridade silenciosa e atraindo 
        exatamente o tipo de conexões, projetos e reconhecimento que você deseja.
      </p>

      <figure className="my-10">
        <img src="https://images.unsplash.com/photo-1552581234-26160f608093?q=80&w=1800&auto=format&fit=crop" alt="Profissional confiante revisando perfil com resultados visíveis de engajamento" className="w-full h-auto rounded-lg shadow-md" />
        <figcaption className="text-center text-sm text-gray-500 mt-2">
          O resultado do método PLG: autoridade silenciosa e atração constante de oportunidades
        </figcaption>
      </figure>

      <div className="not-prose my-10 bg-gray-800 text-white p-8 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Pronto para transformar seu LinkedIn com o método PLG?</h3>
        <p className="mb-6">Quer descobrir se o seu perfil está invisível enquanto você dorme? Faça agora o diagnóstico gratuito em menos de 3 minutos.</p>
        <Button asChild className="bg-revgreen text-black hover:bg-revgreen/90">
          <RouterLink to="/diagnostico" className="flex items-center">
            Solicitar diagnóstico gratuito
            <ArrowRight className="ml-2 h-4 w-4" />
          </RouterLink>
        </Button>
      </div>
      
      <div className="not-prose my-6">
        <p className="text-sm font-medium">Recursos adicionais:</p>
        <div className="flex flex-col space-y-2 mt-2">
          <a href="#" className="flex items-center text-revgreen hover:underline">
            <Button variant="link" className="p-0 h-auto">
              <Download className="h-4 w-4 mr-2" />
              <span>Checklist: 27 elementos de um perfil LinkedIn magnético (PDF)</span>
            </Button>
          </a>
          <a href="#" className="flex items-center text-revgreen hover:underline">
            <Button variant="link" className="p-0 h-auto">
              <MessageSquare className="h-4 w-4 mr-2" />
              <span>Webinar: Como aplicar o PLG em seu nicho específico</span>
            </Button>
          </a>
          <a href="#" className="flex items-center text-revgreen hover:underline">
            <Button variant="link" className="p-0 h-auto">
              <Star className="h-4 w-4 mr-2" />
              <span>Template: Headline magnética para seu perfil LinkedIn</span>
            </Button>
          </a>
        </div>
      </div>
    </div>;
};
export default PolemicLedGrowthArticle;