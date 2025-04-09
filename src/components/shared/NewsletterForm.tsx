
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
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
    <div>
      <p className="text-sm text-gray-300 mb-3">
        Inscreva-se para receber nossos materiais
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          type="text"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-white border-gray-200 text-gray-800 placeholder:text-gray-500 h-10 px-4 rounded-md"
        />
        <Input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white border-gray-200 text-gray-800 placeholder:text-gray-500 h-10 px-4 rounded-md"
        />
        <Button 
          type="submit" 
          className="w-full h-10 text-base font-medium bg-revgreen text-black hover:bg-revgreen/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <Mail className="mr-2 h-4 w-4 animate-pulse" />
              Processando...
            </span>
          ) : (
            <span>
              Inscrever-se
            </span>
          )}
        </Button>
        <div className="flex items-start mt-2">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              id="privacyPolicy"
              className="h-4 w-4 text-revgreen border-gray-300 rounded"
            />
          </div>
          <div className="ml-2">
            <label htmlFor="privacyPolicy" className="text-xs text-gray-400">
              Ao inserir seu e-mail, você concorda em receber a newsletter da RevClass. Você pode cancelar a inscrição a qualquer momento.
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewsletterForm;
