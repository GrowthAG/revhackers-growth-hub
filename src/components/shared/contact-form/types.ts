
export interface ContactFormProps {
  formType?: 'contact' | 'diagnosis';
  materialLink?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  industry: string;
  message: string;
  role: string;
}
