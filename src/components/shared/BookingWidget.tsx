import { useEffect, useState } from 'react';
import ContactForm from './ContactForm';
import { getFormData } from '@/utils/formStorage';
import { Card } from '@/components/ui/card';

const BookingWidget = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  });
  const [calendarLoaded, setCalendarLoaded] = useState(false);

  useEffect(() => {
    // Load user data from localStorage
    const storedData = getFormData();
    if (storedData) {
      const userName = storedData.name || `${storedData.firstName || ''} ${storedData.lastName || ''}`.trim();
      setUserData({
        name: userName,
        email: storedData.email || '',
        phone: storedData.phone || '',
        company: storedData.company || '',
      });
      console.log('Retrieved form data for booking widget:', storedData);
    }
    
    // Create a script element for the form embed
    const script = document.createElement('script');
    script.src = "https://team.growthagency.com.br/js/form_embed.js";
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => setCalendarLoaded(true);
    
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

  // Monitor any changes to the calendar
  useEffect(() => {
    if (calendarLoaded) {
      console.log("Calendar loaded and ready with user data:", userData);
    }
  }, [calendarLoaded, userData]);

  // Build query parameters for the iframe URL
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    
    if (userData.email) params.append('email', userData.email);
    if (userData.name) params.append('name', userData.name);
    if (userData.phone) params.append('phone', userData.phone);
    if (userData.company) params.append('company', userData.company);
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="bg-black rounded-xl shadow-lg p-6 md:p-8 border border-white/10 hover:shadow-xl transition-all">
        <h3 className="text-2xl font-bold text-center mb-6 text-white">
          Entre em <span className="text-revgreen">contato</span>
        </h3>
        <ContactForm />
      </Card>
      
      <Card className="booking-calendar-container bg-black rounded-xl shadow-lg p-6 md:p-8 border border-white/10 hover:shadow-xl transition-all">
        <h3 className="text-2xl font-bold text-center mb-6 text-white">
          Ou agende <span className="bg-gradient-to-r from-revgreen to-revgreen/80 bg-clip-text text-transparent">diretamente</span>
        </h3>
        <div className="w-full bg-black rounded-lg overflow-hidden p-1 relative">
          <div className="absolute inset-0 bg-revgreen/5 opacity-30"></div>
          <iframe 
            src={`https://team.growthagency.com.br/widget/booking/sKnL4ucDKohNmqj1hn6H${buildQueryParams()}`}
            style={{ 
              width: '100%', 
              border: 'none', 
              overflow: 'hidden',
              backgroundColor: 'transparent'
            }} 
            scrolling="no" 
            id="sKnL4ucDKohNmqj1hn6H_1744205651626"
            title="Agendar consulta"
            className="min-h-[600px] relative z-10"
          />
        </div>
      </Card>
    </div>
  );
};

export default BookingWidget;
