/**
 * Sincronizador de Respuestas Históricas hacia Google Sheets
 * Ministerio Internacional Monte de Dios
 * 
 * Uso:
 *   node scripts/sync-all-to-sheets.cjs
 * 
 * O pasando URLs directamente por consola:
 *   node scripts/sync-all-to-sheets.cjs --servidores="URL_1" --presentacion="URL_2" --hospedaje="URL_3"
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://fnwtfjwysitrpnpjsuoy.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZud3Rmand5c2l0cnBucGpzdW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NTY3MDMsImV4cCI6MjA5ODQzMjcwM30.dMPBJZOmAuYwmsYUZPebNtLQYn74_XAu1Hs-YwrA-AQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function getArg(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find(a => a.startsWith(prefix));
  if (arg) return arg.substring(prefix.length).replace(/^["']|["']$/g, '');
  return process.env[name] || process.env[`GOOGLE_SHEETS_${name.toUpperCase()}_URL`];
}

async function postBatch(url, records, label) {
  if (!url) {
    console.log(`[Omitido] No se proporcionó URL para ${label}.`);
    return false;
  }

  console.log(`Enviando ${records.length} registros a ${label}...`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sync_batch',
        records: records
      })
    });
    const text = await res.text();
    console.log(`[Exito] Respuesta de ${label}:`, text);
    return true;
  } catch (err) {
    console.error(`[Error] Falló el envío a ${label}:`, err.message);
    return false;
  }
}

async function main() {
  console.log('Iniciando sincronización de respuestas históricas con Google Sheets...');

  const urlServidores = getArg('servidores');
  const urlPresentacion = getArg('presentacion');
  const urlHospedaje = getArg('hospedaje');

  // 1. Sincronizar Servidores
  if (urlServidores) {
    console.log('Consultando servidores_registro en Supabase...');
    const { data: servidores, error: errServ } = await supabase
      .from('servidores_registro')
      .select('*')
      .order('created_at', { ascending: true });

    if (errServ) {
      console.error('Error consultando servidores:', errServ.message);
    } else {
      console.log(`Se obtuvieron ${servidores.length} registros de servidores.`);
      await postBatch(urlServidores, servidores, 'Inscripción de Servidores');
    }
  } else {
    console.log('[Info] Para sincronizar Servidores, proporcione --servidores="URL_WEBHOOK"');
  }

  // 2. Sincronizar Presentación de Niños
  if (urlPresentacion) {
    console.log('Consultando presentaciones_ninos en Supabase...');
    const { data: ninos, error: errNinos } = await supabase
      .from('presentaciones_ninos')
      .select('*')
      .order('created_at', { ascending: true });

    if (errNinos) {
      console.error('Error consultando presentación de niños:', errNinos.message);
    } else {
      console.log(`Se obtuvieron ${ninos.length} registros de presentación de niños.`);
      await postBatch(urlPresentacion, ninos, 'Presentación de Niños');
    }
  } else {
    console.log('[Info] Para sincronizar Presentación de Niños, proporcione --presentacion="URL_WEBHOOK"');
  }

  // 3. Sincronizar Hospedaje Revival 2026
  if (urlHospedaje) {
    console.log('Consultando hospedaje_revival_2026 en Supabase...');
    const { data: hospedajes, error: errHospedajes } = await supabase
      .from('hospedaje_revival_2026')
      .select('*')
      .order('created_at', { ascending: true });

    if (errHospedajes) {
      console.error('Error consultando hospedajes:', errHospedajes.message);
    } else {
      console.log(`Se obtuvieron ${hospedajes.length} registros de hospedaje.`);
      await postBatch(urlHospedaje, hospedajes, 'Hospedaje Revival 2026');
    }
  } else {
    console.log('[Info] Para sincronizar Hospedaje Revival, proporcione --hospedaje="URL_WEBHOOK"');
  }

  console.log('Proceso de sincronización finalizado.');
}

main().catch(console.error);
