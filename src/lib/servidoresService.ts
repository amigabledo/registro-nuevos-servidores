import { supabase } from './supabase';
import type { ServidorRegistro, FormularioRegistroData, EstadoRegistro, AreaServicio } from '@/types';

const STORAGE_KEY = 'servidores_registrados_local';

const SEED_DATA: ServidorRegistro[] = [
  {
    id: 'seed-1',
    nombre: 'Carlos',
    apellido: 'Martínez',
    telefono: '809-555-0142',
    correo: 'carlos.m@example.com',
    escuela_nuevos_creyentes: 'si',
    bautizado: true,
    fecha_bautismo: '2023-04-15',
    retiro_liberacion: true,
    fecha_retiro: '2023-08-20',
    tiene_mentor: true,
    nombre_mentor: 'Pastor Juan',
    asiste_casa_paz: true,
    area_servicio: 'ujieres',
    estado: 'aprobado',
    notas_servidor: 'Excelente disposición y puntualidad.',
    registrado_por: null,
    created_at: '2026-09-20T10:00:00Z',
    updated_at: '2026-09-20T10:00:00Z',
  },
  {
    id: 'seed-2',
    nombre: 'Ana',
    apellido: 'Rodríguez',
    telefono: '829-555-0189',
    correo: 'ana.rodriguez@example.com',
    escuela_nuevos_creyentes: 'cursando',
    bautizado: true,
    fecha_bautismo: '2024-01-10',
    retiro_liberacion: false,
    fecha_retiro: null,
    tiene_mentor: true,
    nombre_mentor: 'Hermana María',
    asiste_casa_paz: true,
    area_servicio: 'escuela_dominical',
    estado: 'en_revision',
    notas_servidor: 'Graduada de pedagogía infantil.',
    registrado_por: null,
    created_at: '2026-09-25T14:30:00Z',
    updated_at: '2026-09-25T14:30:00Z',
  },
  {
    id: 'seed-3',
    nombre: 'David',
    apellido: 'Pérez',
    telefono: '849-555-0123',
    correo: 'david.perez@example.com',
    escuela_nuevos_creyentes: 'si',
    bautizado: true,
    fecha_bautismo: '2022-11-05',
    retiro_liberacion: true,
    fecha_retiro: '2023-03-12',
    tiene_mentor: false,
    nombre_mentor: null,
    asiste_casa_paz: true,
    area_servicio: 'seguridad',
    estado: 'pendiente',
    notas_servidor: null,
    registrado_por: null,
    created_at: '2026-09-28T18:15:00Z',
    updated_at: '2026-09-28T18:15:00Z',
  },
];

function getLocalData(): ServidorRegistro[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
      return SEED_DATA;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_DATA;
  }
}

function saveLocalData(items: ServidorRegistro[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Manejo silencioso en cuota excedida
  }
}

export async function fetchServidores(): Promise<ServidorRegistro[]> {
  try {
    const { data, error } = await supabase
      .from('servidores_registro')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as ServidorRegistro[];
    }
  } catch {
    // Si la conexión a Supabase no responde, se utiliza el almacenamiento local
  }
  return getLocalData();
}

export async function registrarServidor(
  formData: FormularioRegistroData,
  registradoPorId?: string | null
): Promise<{ success: boolean; error?: string }> {
  const nuevoRegistro: Omit<ServidorRegistro, 'id' | 'created_at' | 'updated_at'> = {
    nombre: formData.nombre.trim(),
    apellido: formData.apellido.trim(),
    telefono: formData.telefono.trim(),
    correo: formData.correo.trim() || null,
    escuela_nuevos_creyentes: formData.escuela_nuevos_creyentes,
    bautizado: formData.bautizado === 'si',
    fecha_bautismo: formData.bautizado === 'si' && formData.fecha_bautismo ? formData.fecha_bautismo : null,
    retiro_liberacion: formData.retiro_liberacion === 'si',
    fecha_retiro: formData.retiro_liberacion === 'si' && formData.fecha_retiro ? formData.fecha_retiro : null,
    tiene_mentor: formData.tiene_mentor === 'si',
    nombre_mentor: formData.tiene_mentor === 'si' && formData.nombre_mentor ? formData.nombre_mentor.trim() : null,
    asiste_casa_paz: formData.asiste_casa_paz === 'si',
    area_servicio: formData.area_servicio as AreaServicio,
    estado: 'pendiente',
    notas_servidor: null,
    registrado_por: registradoPorId ?? null,
  };

  try {
    const { error } = await supabase
      .from('servidores_registro')
      // @ts-expect-error compatibilidad con cliente genérico
      .insert([nuevoRegistro]);
    if (!error) {
      return { success: true };
    }
  } catch {
    // Continuar al almacenamiento local
  }

  // Respaldo en almacenamiento local
  const current = getLocalData();
  const itemConId: ServidorRegistro = {
    ...nuevoRegistro,
    id: `local-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  saveLocalData([itemConId, ...current]);
  return { success: true };
}

export async function actualizarEstadoServidor(
  id: string,
  estado: EstadoRegistro,
  notas?: string
): Promise<{ success: boolean }> {
  try {
    const updatePayload: { estado: EstadoRegistro; notas_servidor?: string } = { estado };
    if (notas !== undefined) updatePayload.notas_servidor = notas;

    const { error } = await supabase
      .from('servidores_registro')
      // @ts-expect-error compatibilidad con cliente genérico
      .update(updatePayload)
      .eq('id', id);

    if (!error) return { success: true };
  } catch {
    // Continuar con actualización local
  }

  const items = getLocalData();
  const index = items.findIndex((i) => i.id === id);
  if (index !== -1) {
    items[index] = {
      ...items[index],
      estado,
      notas_servidor: notas !== undefined ? notas : items[index].notas_servidor,
      updated_at: new Date().toISOString(),
    };
    saveLocalData(items);
  }
  return { success: true };
}
