
export interface DownloadFormProps {
  materialId: string;
  materialType: string;
  onSubmit: () => void;
}

export interface DownloadFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  role: string;
  roleType: string;
  agree: boolean;
}
