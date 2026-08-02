
import { DownloadFormData } from "./types";

export const validateForm = (formData: DownloadFormData): { isValid: boolean; errorMessage?: string } => {
  // Required fields validation
  if (!formData.firstName || !formData.email || !formData.company ||
    !formData.industry || !formData.role) {
    return {
      isValid: false,
      errorMessage: "Por favor, preencha todos os campos obrigatórios."
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

