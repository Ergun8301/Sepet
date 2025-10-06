import { supabase } from './supabaseClient';

export const uploadImageToSupabase = async (file: File, path: string): Promise<string> => {
  try {
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, file, {
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const uploadImage = uploadImageToSupabase;
