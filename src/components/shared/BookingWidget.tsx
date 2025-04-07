
import { useEffect } from 'react';

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
    <div className="booking-calendar-container">
      <h3 className="text-2xl font-bold text-center mb-6">
        Agende uma conversa com nossos especialistas
      </h3>
      <div className="w-full max-w-4xl mx-auto">
        <iframe 
          src="https://team.growthagency.com.br/widget/booking/q8iihQ5MnZfqRAHh3KZz" 
          style={{ width: '100%', border: 'none', overflow: 'hidden' }} 
          scrolling="no" 
          id="q8iihQ5MnZfqRAHh3KZz_1743983913878"
          title="Agendar consulta"
          className="min-h-[600px]"
        />
      </div>
    </div>
  );
};

export default BookingWidget;
