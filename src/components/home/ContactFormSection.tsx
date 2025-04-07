
import ContactForm from '../shared/ContactForm';
import { ArrowRight } from 'lucide-react';

const ContactFormSection = () => {
  return (
    <section className="section-padding bg-gray-50 relative">
      <div className="absolute inset-0 z-0 opacity-5">
        <img 
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=1169&q=80" 
          alt="Contact background" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Entre em contato
          </h2>
          <p className="text-lg text-gray-600">
            Estamos prontos para ajudar sua empresa a crescer com soluções de Revenue Operations personalizadas.
            Nosso time de especialistas está preparado para entender seus desafios e propor soluções eficientes.
          </p>
        </div>
        
        <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-sm">
          <h3 className="text-xl font-bold mb-6 text-center">Agende uma consulta estratégica</h3>
          <ContactForm formType="contact" />
          <div className="mt-6 text-center text-gray-500 text-sm">
            <p>Ao enviar, você será redirecionado para agendar sua consulta</p>
            <p className="flex items-center justify-center mt-2">
              <ArrowRight className="h-4 w-4 mr-2 text-revgreen" />
              Resposta em até 24 horas úteis
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactFormSection;
