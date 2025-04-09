
import { useEffect } from 'react';
import ContactForm from './ContactForm';

// The webhook URL is already configured in the ContactForm component

const BookingWidget = () => {
  useEffect(() => {
    // Create a script element for the form embed
    const script = document.createElement('script');
    script.src = "https://team.growthagency.com.br/js/form_embed.js";
    script.type = "text/javascript";
    script.async = true;
    
    // Add the script to the document
    document.body.appendChild(script);
    
    // Clean up function to remove the script when component unmounts
    return () => {
      const existingScript = document.querySelector('script[src="https://team.growthagency.com.br/js/form_embed.js"]');
      if (existingScript && document.body.contains(existingScript)) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <h3 className="text-2xl font-bold text-center mb-6">
          Entre em contato
        </h3>
        <ContactForm />
      </div>
      
      <div className="booking-calendar-container bg-white rounded-xl shadow-lg p-6 md:p-8">
        <h3 className="text-2xl font-bold text-center mb-6">
          Ou agende diretamente
        </h3>
        <div className="w-full">
          <iframe 
            src="https://team.growthagency.com.br/widget/booking/sKnL4ucDKohNmqj1hn6H" 
            style={{ width: '100%', border: 'none', overflow: 'hidden' }} 
            scrolling="no" 
            id="sKnL4ucDKohNmqj1hn6H_1744205651626"
            title="Agendar consulta"
            className="min-h-[600px]"
          />
        </div>
      </div>
    </div>
  );
};

export default BookingWidget;
