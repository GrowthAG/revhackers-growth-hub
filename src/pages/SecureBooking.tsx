
import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';

// Validate booking token - in a real app, this would verify against a backend
const isValidBookingToken = (token: string) => {
  return token && token.length >= 32; // Simple validation for now
};

const SecureBooking = () => {
  const { token } = useParams();
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Load the booking script
    const script = document.createElement('script');
    script.src = "https://team.growthagency.com.br/js/form_embed.js";
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    
    document.body.appendChild(script);
    
    return () => {
      const existingScript = document.querySelector('script[src="https://team.growthagency.com.br/js/form_embed.js"]');
      if (existingScript && document.body.contains(existingScript)) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  // Redirect if token is invalid
  if (!token || !isValidBookingToken(token)) {
    return <Navigate to="/" replace />;
  }

  return (
    <PageLayout>
      <section className="py-12 bg-black text-white min-h-screen">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto mb-8">
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Schedule Your <span className="text-revgreen">Consultation</span>
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Choose the best time for your consultation. We look forward to discussing your needs.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="bg-black border border-white/10 rounded-xl shadow-xl p-6 md:p-8">
              <div className="booking-calendar-wrapper relative bg-black rounded-lg overflow-hidden p-1">
                <div className="absolute inset-0 bg-revgreen/5 opacity-30"></div>
                <iframe 
                  src="https://team.growthagency.com.br/widget/booking/MmyRuRPox3ZComQA3jJ1"
                  style={{ 
                    width: '100%', 
                    border: 'none', 
                    overflow: 'hidden',
                    backgroundColor: 'transparent'
                  }} 
                  scrolling="no" 
                  id="MmyRuRPox3ZComQA3jJ1_1745274440346"
                  title="Schedule consultation"
                  className="min-h-[700px] relative z-10"
                />
              </div>
            </Card>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default SecureBooking;
