export * from './supabase';

export interface FormularioRegistroData {
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  escuela_nuevos_creyentes: 'si' | 'no' | 'cursando';
  bautizado: 'si' | 'no';
  fecha_bautismo: string;
  retiro_liberacion: 'si' | 'no';
  fecha_retiro: string;
  tiene_mentor: 'si' | 'no';
  nombre_mentor: string;
  asiste_casa_paz: 'si' | 'no';
  area_servicio: 'ujieres' | 'seguridad' | 'escuela_dominical' | '';
}

export interface MetricCardData {
  label: string;
  value: number | string;
  subtext?: string;
  trend?: string;
}
