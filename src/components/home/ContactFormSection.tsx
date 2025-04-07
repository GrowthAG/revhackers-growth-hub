
import ContactForm from '../shared/ContactForm';

const ContactFormSection = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Entre em contato
          </h2>
          <p className="text-lg text-gray-600">
            Estamos prontos para ajudar sua empresa a crescer com soluções de Revenue Operations personalizadas.
          </p>
        </div>
        
        <div className="max-w-xl mx-auto bg-gray-50 p-8 rounded-xl shadow-sm">
          <ContactForm formType="contact" />
        </div>
      </div>
    </section>
  );
};

export default ContactFormSection;
