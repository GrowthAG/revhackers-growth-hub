
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

export const WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/oFTw9DcsKRUj6xCiq4mb/webhook-trigger/31b57e7f-20a7-41d0-aba6-21df635e9e76';
