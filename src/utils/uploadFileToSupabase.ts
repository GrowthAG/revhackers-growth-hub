import { apiBase } from '@/api/adapters/_base';
import { supabase } from '@/integrations/supabase/client';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const BLOCKED_EXTENSIONS = ['exe', 'bat', 'cmd', 'sh', 'ps1', 'msi', 'dll', 'so', 'bin', 'com'];

/**
 * Faz upload de arquivos gerais via GCP Storage (Google Cloud Storage) com fallback resiliente
 */
export const uploadFileToGcp = async (
  file: File,
  projectId: string,
  bucketName = 'rei-materials'
): Promise<string> => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Limite: 50MB.`);
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
  if (BLOCKED_EXTENSIONS.includes(fileExt)) {
    throw new Error(`Tipo de arquivo não permitido: .${fileExt}`);
  }

  const fileName = `${projectId}/${crypto.randomUUID()}.${fileExt}`;

  // Se a API GCP estiver habilitada ou ativa
  if (import.meta.env.VITE_GCP_ENABLED === 'true' || import.meta.env.VITE_CLIENTS_GCP_ENABLED === 'true') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucketName);
      formData.append('filename', fileName);

      const res = await fetch(`${apiBase()}/storage/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        return data.publicUrl;
      }
    } catch (err) {
      console.warn('Fallback no upload de arquivo para GCP Storage, tentando Supabase...', err);
    }
  }

  // Fallback Supabase
  const { error } = await supabase.storage.from(bucketName).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw new Error(`Erro no upload: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
  if (!data?.publicUrl) {
    throw new Error('Não foi possível obter a URL pública do arquivo');
  }

  return data.publicUrl;
};

// Aliases para retrocompatibilidade
export const uploadFileToSupabase = uploadFileToGcp;
