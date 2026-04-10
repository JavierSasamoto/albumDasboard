export interface Database {
  public: {
    Tables: {
      auditoria_log: {
        Row: {
          id: string;
          admin_id: string | null;
          accion: string;
          tabla_afectada: string | null;
          registro_id: string | null;
          detalle_cambio: Record<string, any> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id?: string | null;
          accion: string;
          tabla_afectada?: string | null;
          registro_id?: string | null;
          detalle_cambio?: Record<string, any> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string | null;
          accion?: string;
          tabla_afectada?: string | null;
          registro_id?: string | null;
          detalle_cambio?: Record<string, any> | null;
          created_at?: string;
        };
      };
      cromos_info: {
        Row: {
          id: number;
          nombre_cromo: string;
          nombres: string;
          apodo: string | null;
          categoria: string;
          sub_categoria: string | null;
          pais: string | null;
          informacion_tecnica: Record<string, any>;
          url_imagen: string | null;
          url_video_ra: string | null;
          url_target_ra: string | null;
          created_at: string;
          url_animacion: string | null;
          seleccion: string | null;
          rareza: 'Común' | 'Inusual' | 'Raro' | 'Épico' | 'Legendario' | 'Único';
        };
        Insert: {
          id: number;
          nombre_cromo: string;
          nombres: string;
          apodo?: string | null;
          categoria: string;
          sub_categoria?: string | null;
          pais?: string | null;
          informacion_tecnica?: Record<string, any>;
          url_imagen?: string | null;
          url_video_ra?: string | null;
          url_target_ra?: string | null;
          created_at?: string;
          url_animacion?: string | null;
          seleccion?: string | null;
          rareza?: 'Común' | 'Inusual' | 'Raro' | 'Épico' | 'Legendario' | 'Único';
        };
        Update: {
          id?: number;
          nombre_cromo?: string;
          nombres?: string;
          apodo?: string | null;
          categoria?: string;
          sub_categoria?: string | null;
          pais?: string | null;
          informacion_tecnica?: Record<string, any>;
          url_imagen?: string | null;
          url_video_ra?: string | null;
          url_target_ra?: string | null;
          created_at?: string;
          url_animacion?: string | null;
          seleccion?: string | null;
          rareza?: 'Común' | 'Inusual' | 'Raro' | 'Épico' | 'Legendario' | 'Único';
        };
      };
      perfiles: {
        Row: {
          id: string;
          email: string | null;
          monedas: number;
          album_pasted: boolean[];
          favoritos: any;
          created_at: string;
          trivia_intentos: number;
          ultima_trivia: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          monedas?: number;
          album_pasted?: boolean[];
          favoritos?: any;
          created_at?: string;
          trivia_intentos?: number;
          ultima_trivia?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          monedas?: number;
          album_pasted?: boolean[];
          favoritos?: any;
          created_at?: string;
          trivia_intentos?: number;
          ultima_trivia?: string | null;
        };
      };
      perfil_detalles: {
        Row: {
          id: string;
          cedula_identidad: string;
          nombres: string;
          apellidos: string;
          whatsapp: string | null;
          ciudad: string | null;
          qr_bancario_url: string | null;
          fecha_nacimiento: string | null;
          fecha_registro: string;
        };
        Insert: {
          id: string;
          cedula_identidad: string;
          nombres: string;
          apellidos: string;
          whatsapp?: string | null;
          ciudad?: string | null;
          qr_bancario_url?: string | null;
          fecha_nacimiento?: string | null;
          fecha_registro?: string;
        };
        Update: {
          id?: string;
          cedula_identidad?: string;
          nombres?: string;
          apellidos?: string;
          whatsapp?: string | null;
          ciudad?: string | null;
          qr_bancario_url?: string | null;
          fecha_nacimiento?: string | null;
          fecha_registro?: string;
        };
      };
      transacciones_monedas: {
        Row: {
          id: string;
          perfil_id: string;
          monto_dinero: number;
          cantidad_monedas: number;
          concepto: string;
          banco_origen: string | null;
          cuenta_origen: string | null;
          cuenta_destino: string | null;
          comprobante_url: string | null;
          referencia_bancaria: string | null;
          estado: 'exitoso' | 'en curso' | 'rechazado';
          fecha_hora: string;
        };
        Insert: {
          id?: string;
          perfil_id: string;
          monto_dinero: number;
          cantidad_monedas: number;
          concepto?: string;
          banco_origen?: string | null;
          cuenta_origen?: string | null;
          cuenta_destino?: string | null;
          comprobante_url?: string | null;
          referencia_bancaria?: string | null;
          estado?: 'exitoso' | 'en curso' | 'rechazado';
          fecha_hora?: string;
        };
        Update: {
          id?: string;
          perfil_id?: string;
          monto_dinero?: number;
          cantidad_monedas?: number;
          concepto?: string;
          banco_origen?: string | null;
          cuenta_origen?: string | null;
          cuenta_destino?: string | null;
          comprobante_url?: string | null;
          referencia_bancaria?: string | null;
          estado?: 'exitoso' | 'en curso' | 'rechazado';
          fecha_hora?: string;
        };
      };
      ranking_global: {
        Row: {
          id: string;
          posicion: number | null;
          puntos_totales: number;
          cromos_completados: number;
          ultima_actualizacion: string;
        };
        Insert: {
          id: string;
          posicion?: number | null;
          puntos_totales?: number;
          cromos_completados?: number;
          ultima_actualizacion?: string;
        };
        Update: {
          id?: string;
          posicion?: number | null;
          puntos_totales?: number;
          cromos_completados?: number;
          ultima_actualizacion?: string;
        };
      };
      trivia: {
        Row: {
          id: number;
          pregunta: string;
          opcion_a: string;
          opcion_b: string;
          opcion_c: string;
          opcion_d: string;
          respuesta_correcta: string;
          categoria: string;
          created_at: string;
        };
        Insert: {
          pregunta: string;
          opcion_a: string;
          opcion_b: string;
          opcion_c: string;
          opcion_d: string;
          respuesta_correcta: string;
          categoria?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          pregunta?: string;
          opcion_a?: string;
          opcion_b?: string;
          opcion_c?: string;
          opcion_d?: string;
          respuesta_correcta?: string;
          categoria?: string;
          created_at?: string;
        };
      };
      notificaciones: {
        Row: {
          id: string;
          perfil_id: string;
          titulo: string;
          mensaje: string;
          leido: boolean;
          tipo: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          perfil_id: string;
          titulo: string;
          mensaje: string;
          leido?: boolean;
          tipo?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          perfil_id?: string;
          titulo?: string;
          mensaje?: string;
          leido?: boolean;
          tipo?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

export type Cromo = Database['public']['Tables']['cromos_info']['Row'];
export type Perfil = Database['public']['Tables']['perfiles']['Row'];
export type PerfilDetalle = Database['public']['Tables']['perfil_detalles']['Row'];
export type Transaccion = Database['public']['Tables']['transacciones_monedas']['Row'];
export type Ranking = Database['public']['Tables']['ranking_global']['Row'];
export type Trivia = Database['public']['Tables']['trivia']['Row'];
export type Notificacion = Database['public']['Tables']['notificaciones']['Row'];
export type AuditoriaLog = Database['public']['Tables']['auditoria_log']['Row'];
