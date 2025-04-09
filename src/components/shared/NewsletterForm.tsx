
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const NewsletterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos para se inscrever.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Prepare data for webhook
    const webhookData = {
      name,
      email,
      formType: 'newsletter',
      source: window.location.href,
      timestamp: new Date().toISOString()
    };
    
    // Updated webhook URL
    const WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/oFTw9DcsKRUj6xCiq4mb/webhook-trigger/a98d7f48-96fb-4433-a10d-4fa22370034f';

    try {
      console.log('Newsletter submission:', webhookData);
      
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });
      
      if (!response.ok && response.status !== 0) {
        throw new Error('Failed to submit newsletter subscription');
      }
      
      toast({
        title: "Inscrição confirmada!",
        description: "Você foi inscrito em nossa newsletter com sucesso.",
      });
      
      // Reset form
      setName('');
      setEmail('');
    } catch (error) {
      console.error('Newsletter submission error:', error);
      toast({
        title: "Erro ao processar inscrição",
        description: "Ocorreu um erro ao processar sua inscrição. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto px-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col space-y-3">
          <Input
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 h-12 px-4 rounded-md text-sm"
          />
          <Input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 h-12 px-4 rounded-md text-sm"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full h-12 text-base font-medium transition-all hover:translate-y-[-2px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <Mail className="mr-2 h-5 w-5 animate-pulse" />
              Processando...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Mail className="mr-2 h-5 w-5" />
              Inscrever-se
              <ArrowRight className="ml-2 h-5 w-5" />
            </span>
          )}
        </Button>
        <p className="text-xs text-gray-400 text-center mt-2">
          Ao se inscrever, você concorda com nossa <a href="/privacidade" className="text-gray-300 hover:text-revgreen underline">Política de Privacidade</a>
        </p>
      </form>
    </div>
  );
};

export default NewsletterForm;
