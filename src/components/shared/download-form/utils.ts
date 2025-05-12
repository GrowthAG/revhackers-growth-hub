
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

export const WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/oFTw9DcsKRUj6xCiq4mb/webhook-trigger/a43962ce-48d9-4af9-84ae-06f3e9216b96';

export const EMAIL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/oFTw9DcsKRUj6xCiq4mb/webhook-trigger/email-material';
