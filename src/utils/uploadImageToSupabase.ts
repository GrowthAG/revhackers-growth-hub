import { apiBase } from '@/api/adapters/_base';
import { supabase } from '@/integrations/supabase/client';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];

/**
 * Faz upload de imagem via GCP Storage (Google Cloud Storage) com fallback resiliente
 */
export const uploadImageToGcp = async (file: File, bucketName = 'blog-covers'): Promise<string> => {
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(`Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Limite: 10MB.`);
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(`Tipo de arquivo não permitido: ${file.type}. Use JPG, PNG, WebP, SVG ou GIF.`);
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;

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
      console.warn('Fallback no upload para GCP Storage, tentando Supabase...', err);
    }
  }

  // Fallback Supabase
  const { error } = await supabase.storage.from(bucketName).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw new Error(`Erro no upload do arquivo: ${error.message}`);
  }

  const getUrlRes = supabase.storage.from(bucketName).getPublicUrl(fileName);
  if (!getUrlRes.data?.publicUrl) {
    throw new Error('Não foi possível obter a URL pública do arquivo');
  }

  return getUrlRes.data.publicUrl;
};

// Aliases para retrocompatibilidade sem quebrar imports legados
export const uploadImageToSupabase = uploadImageToGcp;
