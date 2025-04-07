
import { Quote } from 'lucide-react';
import { Card } from '@/components/ui/card';

const QuoteSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-transparent border border-gray-700 p-10 relative">
            <div className="absolute -top-5 -left-5 h-10 w-10 bg-revgreen rounded-full flex items-center justify-center">
              <Quote className="h-5 w-5 text-white" />
            </div>
            
            <p className="text-xl md:text-2xl italic mb-8">
              "A RevHackers transformou completamente nossa abordagem de crescimento B2B. 
              A integração entre nossos times de marketing e vendas praticamente eliminou 
              o atrito no funil e aumentamos em 47% nossa taxa de conversão de leads em 
              apenas 3 meses. O ROI foi muito além do que esperávamos."
            </p>
            
            <div className="flex items-center">
              <div className="mr-4">
                <div className="h-12 w-12 bg-gray-700 rounded-full overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a" 
                    alt="CEO" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <p className="font-bold text-white">Ricardo Almeida</p>
                <p className="text-gray-400">CEO, WA Project</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default QuoteSection;
