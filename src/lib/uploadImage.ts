import { supabase } from './supabaseClient';

export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
