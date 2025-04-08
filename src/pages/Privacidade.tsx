
import PageLayout from '@/components/layout/PageLayout';

const Privacidade = () => {
  return (
    <PageLayout>
      <section className="pt-32 pb-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="lead">
                A RevHackers se compromete a proteger sua privacidade. Esta Política de Privacidade 
                explica como coletamos, usamos e protegemos suas informações pessoais quando você 
                utiliza nosso site e serviços.
              </p>
              
              <h2>1. Informações que Coletamos</h2>
              <p>
                Podemos coletar os seguintes tipos de informações:
              </p>
              <ul>
                <li>
                  <strong>Informações de identificação pessoal:</strong> nome, endereço de email, 
                  número de telefone, empresa e cargo que você fornece ao preencher formulários ou 
                  solicitar nossos serviços.
                </li>
                <li>
                  <strong>Informações de uso:</strong> como você interage com nosso site, incluindo 
                  páginas visitadas, tempo de permanência e interações.
                </li>
                <li>
                  <strong>Informações técnicas:</strong> endereço IP, tipo de navegador, 
                  dispositivo utilizado e sistema operacional.
                </li>
              </ul>
              
              <h2>2. Como Usamos Suas Informações</h2>
              <p>
                Utilizamos suas informações para:
              </p>
              <ul>
                <li>Fornecer, manter e melhorar nossos serviços</li>
                <li>Processar suas solicitações e responder suas dúvidas</li>
                <li>Enviar informações sobre nossos serviços, atualizações e eventos</li>
                <li>Personalizar sua experiência em nosso site</li>
                <li>Analisar tendências de uso para melhorar nossa plataforma</li>
                <li>Cumprir obrigações legais</li>
              </ul>
              
              <h2>3. Compartilhamento de Informações</h2>
              <p>
                Não vendemos, alugamos ou negociamos suas informações pessoais com terceiros. 
                Podemos compartilhar suas informações com:
              </p>
              <ul>
                <li>Prestadores de serviços que nos auxiliam na operação do site</li>
                <li>Parceiros comerciais com seu consentimento prévio</li>
                <li>Autoridades legais quando exigido por lei</li>
              </ul>
              
              <h2>4. Cookies e Tecnologias Semelhantes</h2>
              <p>
                Utilizamos cookies e tecnologias similares para coletar informações sobre suas 
                interações com nosso site. Você pode configurar seu navegador para recusar cookies, 
                mas isso pode limitar sua experiência em nosso site.
              </p>
              
              <h2>5. Segurança</h2>
              <p>
                Implementamos medidas de segurança projetadas para proteger suas informações 
                pessoais. No entanto, nenhum método de transmissão pela internet ou armazenamento 
                eletrônico é 100% seguro.
              </p>
              
              <h2>6. Seus Direitos</h2>
              <p>
                Você tem os seguintes direitos relacionados aos seus dados pessoais:
              </p>
              <ul>
                <li>Acessar e receber uma cópia dos seus dados</li>
                <li>Retificar dados incorretos ou incompletos</li>
                <li>Solicitar a exclusão dos seus dados (quando aplicável)</li>
                <li>Restringir ou opor-se ao processamento dos seus dados</li>
                <li>Retirar seu consentimento a qualquer momento</li>
              </ul>
              
              <h2>7. Retenção de Dados</h2>
              <p>
                Mantemos suas informações pessoais pelo tempo necessário para cumprir as 
                finalidades para as quais foram coletadas, incluindo o atendimento de 
                requisitos legais, contábeis ou de relatórios.
              </p>
              
              <h2>8. Links para Sites de Terceiros</h2>
              <p>
                Nosso site pode conter links para sites de terceiros. Não somos responsáveis 
                pelas práticas de privacidade desses sites.
              </p>
              
              <h2>9. Alterações na Política de Privacidade</h2>
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente. Recomendamos que 
                você revise esta página regularmente para se manter informado sobre as alterações.
              </p>
              
              <h2>10. Contato</h2>
              <p>
                Se você tiver dúvidas ou preocupações sobre esta Política de Privacidade, entre em contato conosco pelo email: 
                <a href="mailto:contato@revhackers.com.br" className="text-blue-600 hover:underline ml-1">contato@revhackers.com.br</a>
              </p>
              
              <p className="text-sm text-gray-500 mt-8">
                Última atualização: 8 de Abril de 2025
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Privacidade;
