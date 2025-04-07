
import ContactForm from '../shared/ContactForm';

const ContactFormSection = () => {
  return (
    <section className="section-padding bg-gray-50 relative">
      <div className="absolute inset-0 z-0 opacity-5">
        <img 
          src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40" 
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
          <ContactForm formType="contact" />
        </div>
      </div>
    </section>
  );
};

export default ContactFormSection;
