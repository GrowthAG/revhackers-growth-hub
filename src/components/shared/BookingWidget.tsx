
import { useEffect, useState } from 'react';
import ContactForm from './ContactForm';
import { getFormData } from '@/utils/formStorage';
import { Card } from '@/components/ui/card';

// The webhook URL is already configured in the ContactForm component

const BookingWidget = () => {
  const [userData, setUserData] = useState({
    email: '',
  });

  useEffect(() => {
    // Load user data from localStorage
    const storedData = getFormData();
    if (storedData) {
      setUserData({
        email: storedData.email || '',
      });
    }
    
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
      <Card className="bg-white rounded-xl shadow-lg p-6 md:p-8 border-gray-200 hover:shadow-xl transition-all">
        <h3 className="text-2xl font-bold text-center mb-6">
          Entre em contato
        </h3>
        <ContactForm />
      </Card>
      
      <Card className="booking-calendar-container bg-white rounded-xl shadow-lg p-6 md:p-8 border-gray-200 hover:shadow-xl transition-all">
        <h3 className="text-2xl font-bold text-center mb-6">
          Ou agende diretamente
        </h3>
        <div className="w-full">
          <iframe 
            src={`https://team.growthagency.com.br/widget/booking/sKnL4ucDKohNmqj1hn6H${userData.email ? `?email=${encodeURIComponent(userData.email)}` : ''}`}
            style={{ width: '100%', border: 'none', overflow: 'hidden' }} 
            scrolling="no" 
            id="sKnL4ucDKohNmqj1hn6H_1744205651626"
            title="Agendar consulta"
            className="min-h-[600px]"
          />
        </div>
      </Card>
    </div>
  );
};

export default BookingWidget;
