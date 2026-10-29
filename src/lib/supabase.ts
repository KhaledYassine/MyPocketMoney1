import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to upload receipt images to Supabase Storage or convert to data URL locally
export async function uploadReceiptImage(file: File): Promise<string> {
  if (supabase) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (error) {
        console.warn('Supabase storage upload error, fallback to data URL:', error);
      } else {
        const { data } = supabase.storage.from('receipts').getPublicUrl(filePath);
        return data.publicUrl;
      }
    } catch (err) {
      console.warn('Failed to upload to Supabase storage, using fallback:', err);
    }
  }

  // Fallback: convert file to Base64 data URL for instant client usage
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}
