import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Rareza = 'Común' | 'Inusual' | 'Raro' | 'Épico' | 'Legendario' | 'Único';

export interface Cromo {
  id: string;
  nombre: string;
  seleccion: string;
  rareza: Rareza;
  imagen_url: string;
  informacion_tecnica: Record<string, unknown>;
  created_at: string;
}
