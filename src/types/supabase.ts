export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'servidor';

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type AreaServicio = 'ujieres' | 'seguridad' | 'escuela_dominical';
export type EscuelaNuevosCreyentes = 'si' | 'no' | 'cursando';
export type EstadoRegistro = 'pendiente' | 'en_revision' | 'aprobado' | 'contactado';

export interface ServidorRegistro {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string | null;
  escuela_nuevos_creyentes: EscuelaNuevosCreyentes;
  bautizado: boolean;
  fecha_bautismo: string | null;
  retiro_liberacion: boolean;
  fecha_retiro: string | null;
  tiene_mentor: boolean;
  nombre_mentor: string | null;
  asiste_casa_paz: boolean;
  area_servicio: AreaServicio;
  estado: EstadoRegistro;
  notas_servidor: string | null;
  registrado_por: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          email?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          email?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      servidores_registro: {
        Row: ServidorRegistro;
        Insert: {
          id?: string;
          nombre: string;
          apellido: string;
          telefono: string;
          correo?: string | null;
          escuela_nuevos_creyentes: EscuelaNuevosCreyentes;
          bautizado?: boolean;
          fecha_bautismo?: string | null;
          retiro_liberacion?: boolean;
          fecha_retiro?: string | null;
          tiene_mentor?: boolean;
          nombre_mentor?: string | null;
          asiste_casa_paz?: boolean;
          area_servicio: AreaServicio;
          estado?: EstadoRegistro;
          notas_servidor?: string | null;
          registrado_por?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          apellido?: string;
          telefono?: string;
          correo?: string | null;
          escuela_nuevos_creyentes?: EscuelaNuevosCreyentes;
          bautizado?: boolean;
          fecha_bautismo?: string | null;
          retiro_liberacion?: boolean;
          fecha_retiro?: string | null;
          tiene_mentor?: boolean;
          nombre_mentor?: string | null;
          asiste_casa_paz?: boolean;
          area_servicio?: AreaServicio;
          estado?: EstadoRegistro;
          notas_servidor?: string | null;
          registrado_por?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      ping: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      has_role: {
        Args: {
          user_id: string;
          role_name: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}