
import { DownloadFormData } from "./types";

export const validateForm = (formData: DownloadFormData): { isValid: boolean; errorMessage?: string } => {
  // Required fields validation
  if (!formData.firstName || !formData.email || !formData.company || 
      !formData.industry || !formData.role || !formData.agree) {
    return {
      isValid: false,
      errorMessage: "Por favor, preencha todos os campos obrigatórios e aceite os termos."
    };
  }
  
  // Email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(formData.email)) {
    return {
      isValid: false,
      errorMessage: "Por favor, insira um endereço de email válido."
    };
  }
  
  return { isValid: true };
};

export const WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/oFTw9DcsKRUj6xCiq4mb/webhook-trigger/53a38266-2b9b-4039-8dbb-5d92c453069b';

export const EMAIL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/oFTw9DcsKRUj6xCiq4mb/webhook-trigger/email-material';
