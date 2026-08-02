
import { DownloadFormData } from "./types";
import { isCorporateEmail } from "@/utils/emailValidation";

export const validateForm = (formData: DownloadFormData): { isValid: boolean; errorMessage?: string } => {
  // Required fields validation
  if (!formData.firstName || !formData.email || !formData.company ||
    !formData.industry || !formData.role) {
    return {
      isValid: false,
      errorMessage: "Por favor, preencha todos os campos obrigatórios."
    };
  }

  // Email format validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(formData.email)) {
    return {
      isValid: false,
      errorMessage: "Por favor, insira um endereço de email válido."
    };
  }

  // Corporate Email Domain Validation (Block Gmail, Hotmail, Yahoo, etc.)
  if (!isCorporateEmail(formData.email)) {
    return {
      isValid: false,
      errorMessage: "Por favor, insira seu e-mail corporativo. Não aceitamos e-mails pessoais (Gmail, Hotmail, Yahoo, etc.)."
    };
  }

  return { isValid: true };
};

