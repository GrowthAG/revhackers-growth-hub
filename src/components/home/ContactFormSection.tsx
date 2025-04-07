
import ContactForm from '../shared/ContactForm';
import { Separator } from '@/components/ui/separator';

const ContactFormSection = () => {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Entre em contato
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            Estamos prontos para ajudar sua empresa a crescer com soluções de Revenue Operations personalizadas.
          </p>
          <Separator className="mx-auto w-24 bg-revgreen h-1 rounded-full mb-6" />
        </div>
        
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <ContactForm formType="contact" />
        </div>
      </div>
    </section>
  );
};

export default ContactFormSection;
