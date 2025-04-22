
import { supabase } from '@/integrations/supabase/client';

/**
 * Faz upload de uma imagem para o Supabase Storage e retorna a URL pública.
 * @param file O arquivo selecionado pelo usuário.
 * @returns string | null - A URL pública, ou null em caso de erro.
 */
export const uploadImageToSupabase = async (file: File) => {
  const bucket = 'blog-covers';
  const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false
  });

  if (error) {
    throw error;
  }

  // Obter a URL pública da imagem
  const {
    data: { publicUrl }
  } = supabase.storage.from(bucket).getPublicUrl(fileName);

  return publicUrl;
};
