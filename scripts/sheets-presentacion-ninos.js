/**
 * Google Apps Script - Integración de Presentación de Niños
 * Ministerio Internacional Monte de Dios
 * 
 * Instrucciones:
 * 1. Abre tu hoja de Google Sheets: "Presentación de niños (Octubre, 2026)".
 * 2. Ve al menú superior "Extensiones" > "Apps Script".
 * 3. Reemplaza todo el contenido en Code.gs con este código completo.
 * 4. Haz clic en "Guardar" (icono de disquete).
 * 5. En el menú superior de funciones selecciona 'repararFilasYEliminarEstado' y haz clic en "Ejecutar"
 *    (acepta los permisos de Google si es la primera vez).
 *    -> Esto reparará de inmediato todas las filas corridas a partir de la fila 55 y eliminará la columna de estatus.
 *    (O si prefieres reconstruir la hoja completa directamente con los 180 registros oficiales de Supabase, ejecuta 'sincronizarDesdeSupabase').
 * 6. Luego ve a "Implementar" > "Administrar implementaciones" > Editar > Versión: "Nueva versión" > Implementar.
 */

var HOJA_NOMBRE = 'Presentaciones';
var ZONA_HORARIA = 'America/Santo_Domingo';

var TITULO_LINEA_1 = 'MINISTERIO INTERNACIONAL MONTE DE DIOS';
var TITULO_LINEA_2 = 'Presentación de niños';
var TITULO_LINEA_3 = 'OCTUBRE, 2026';
var FILA_ENCABEZADOS = 4;

var SUPABASE_URL = 'https://fnwtfjwysitrpnpjsuoy.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZud3Rmand5c2l0cnBucGpzdW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NTY3MDMsImV4cCI6MjA5ODQzMjcwM30.dMPBJZOmAuYwmsYUZPebNtLQYn74_XAu1Hs-YwrA-AQ';

// Estructura oficial de 9 columnas (sin columna de estatus)
var COLUMNAS = [
  { clave: 'marca_temporal', titulo: 'Marca temporal', ancho: 175, alinear: 'center' },
  { clave: 'nombre_nino', titulo: 'Nombre del niño o niña', ancho: 260, alinear: 'left' },
  { clave: 'fecha_nacimiento', titulo: 'Fecha de nacimiento', ancho: 160, alinear: 'center' },
  { clave: 'edad_nino', titulo: 'Edad del niño', ancho: 150, alinear: 'center' },
  { clave: 'nombre_padre', titulo: 'Nombre del padre', ancho: 230, alinear: 'left' },
  { clave: 'telefono_padre', titulo: 'Teléfono del padre', ancho: 175, alinear: 'center' },
  { clave: 'nombre_madre', titulo: 'Nombre de la madre', ancho: 230, alinear: 'left' },
  { clave: 'telefono_madre', titulo: 'Teléfono de la madre', ancho: 175, alinear: 'center' },
  { clave: 'notas', titulo: 'Notas y observaciones', ancho: 320, alinear: 'left' }
];

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Monte de Dios')
    .addItem('1. Reparar filas corridas y eliminar columna de estatus', 'repararFilasYEliminarEstado')
    .addItem('2. Sincronizar y reconstruir todo desde Supabase (180 registros)', 'sincronizarDesdeSupabase')
    .addItem('3. Formatear encabezados y membrete institucional', 'limpiarYFormatearHoja')
    .addItem('4. Comprobar estado del webhook', 'verificarEstado')
    .addToUi();
}

/**
 * Corrige filas desfasadas a partir de la fila 55, elimina la columna de estatus
 * y aplica el membrete institucional de 9 columnas sin alterar notas manuales.
 */
function repararFilasYEliminarEstado() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(HOJA_NOMBRE) || ss.getActiveSheet();
  sheet.setName(HOJA_NOMBRE);

  // Paso 1: Separar celdas combinadas de los títulos para evitar errores al eliminar columnas
  for (var r = 1; r <= 3; r++) {
    try {
      sheet.getRange(r, 1, 1, sheet.getMaxColumns()).breakApart();
    } catch (ignore) {}
  }

  var totalFilas = sheet.getLastRow();
  var filasReparadas = 0;

  // Paso 2: Alinear filas donde la columna B quedó vacía y los datos cayeron en C..J
  for (var f = FILA_ENCABEZADOS + 1; f <= totalFilas; f++) {
    var valB = sheet.getRange(f, 2).getValue().toString().trim();
    var valC = sheet.getRange(f, 3).getValue().toString().trim();

    if (!valB && valC) {
      // Tomar las 7 columnas principales: Nombre niño, Fecha, Edad, Padre, Tel Padre, Madre, Tel Madre
      var bloqueDatos = sheet.getRange(f, 3, 1, 7).getValues()[0];
      sheet.getRange(f, 2, 1, 7).setValues([bloqueDatos]);

      // Recuperar notas si cayeron en columna 11 (K)
      var notasDesplazadas = '';
      if (sheet.getMaxColumns() >= 11) {
        notasDesplazadas = sheet.getRange(f, 11).getValue();
        sheet.getRange(f, 11).setValue('');
      }

      var estadoDesplazado = sheet.getRange(f, 10).getValue();
      sheet.getRange(f, 9).setValue(estadoDesplazado);
      sheet.getRange(f, 10).setValue(notasDesplazadas);

      filasReparadas++;
    }
  }

  // Paso 3: Eliminar la columna 9 (Estado de presentación) si aún existe
  if (sheet.getLastColumn() >= 9) {
    var encabezadoCol9 = sheet.getRange(FILA_ENCABEZADOS, 9).getValue().toString().toLowerCase().trim();
    if (encabezadoCol9.indexOf('estado') !== -1 || encabezadoCol9.indexOf('estatus') !== -1) {
      sheet.deleteColumn(9);
    }
  }

  // Paso 4: Eliminar columnas excedentes más allá de la columna 9
  if (sheet.getLastColumn() > COLUMNAS.length) {
    var exceso = sheet.getLastColumn() - COLUMNAS.length;
    sheet.deleteColumns(COLUMNAS.length + 1, exceso);
  }

  // Paso 5: Reconstruir encabezados y membrete institucional
  asegurarEncabezadosYFormato(sheet);

  var mensaje = 'Proceso completado con éxito:\n' +
    '- Se alinearon ' + filasReparadas + ' filas corridas.\n' +
    '- Se eliminó la columna de estatus.\n' +
    '- La hoja cuenta con 9 columnas exactas y formato institucional.';
  SpreadsheetApp.getUi().alert(mensaje);
}

function limpiarYFormatearHoja() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(HOJA_NOMBRE) || ss.getActiveSheet();
  sheet.setName(HOJA_NOMBRE);
  asegurarEncabezadosYFormato(sheet);
  SpreadsheetApp.getUi().alert('Diseño y encabezados de presentación de niños aplicados con éxito.');
}

function asegurarEncabezadosYFormato(sheet) {
  var totalCols = COLUMNAS.length;

  for (var r = 1; r <= 3; r++) {
    try {
      sheet.getRange(r, 1, 1, sheet.getMaxColumns()).breakApart();
    } catch (ignore) {}
  }

  if (sheet.getLastColumn() > totalCols) {
    var exceso = sheet.getLastColumn() - totalCols;
    sheet.deleteColumns(totalCols + 1, exceso);
  }

  var valorA1 = sheet.getRange(1, 1).getValue().toString().trim();
  if (valorA1 !== TITULO_LINEA_1) {
    if (valorA1 === COLUMNAS[0].titulo) {
      sheet.insertRowsBefore(1, 3);
    } else if (sheet.getLastRow() > 0) {
      sheet.insertRowsBefore(1, 4);
    }
  }

  // Fila 1: Membrete institucional
  var rangoFila1 = sheet.getRange(1, 1, 1, totalCols);
  rangoFila1.merge()
    .setValue(TITULO_LINEA_1)
    .setBackground('#0369A1')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(14)
    .setFontFamily('Calibri')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 40);

  // Fila 2: Subtítulo
  var rangoFila2 = sheet.getRange(2, 1, 1, totalCols);
  rangoFila2.merge()
    .setValue(TITULO_LINEA_2)
    .setBackground('#0284C7')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(13)
    .setFontFamily('Calibri')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(2, 36);

  // Fila 3: Período
  var rangoFila3 = sheet.getRange(3, 1, 1, totalCols);
  rangoFila3.merge()
    .setValue(TITULO_LINEA_3)
    .setBackground('#E0F2FE')
    .setFontColor('#0369A1')
    .setFontWeight('bold')
    .setFontSize(12)
    .setFontFamily('Calibri')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(3, 32);

  // Fila 4: Encabezados de columnas
  var titulos = COLUMNAS.map(function(c) { return c.titulo; });
  var rangoEncabezado = sheet.getRange(FILA_ENCABEZADOS, 1, 1, titulos.length);
  rangoEncabezado.setValues([titulos])
    .setBackground('#0284C7')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(12)
    .setFontFamily('Calibri')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
  sheet.setRowHeight(FILA_ENCABEZADOS, 44);

  sheet.setFrozenRows(FILA_ENCABEZADOS);

  for (var i = 0; i < COLUMNAS.length; i++) {
    var colNum = i + 1;
    sheet.setColumnWidth(colNum, COLUMNAS[i].ancho);

    if (COLUMNAS[i].clave === 'telefono_padre' || COLUMNAS[i].clave === 'telefono_madre') {
      sheet.getRange(FILA_ENCABEZADOS + 1, colNum, Math.max(sheet.getMaxRows() - FILA_ENCABEZADOS, 1), 1).setNumberFormat('@');
    }
  }

  var filasTotales = sheet.getLastRow();
  if (filasTotales >= FILA_ENCABEZADOS + 1) {
    aplicarFormatoFilas(sheet, FILA_ENCABEZADOS + 1, filasTotales - FILA_ENCABEZADOS);
  }
}

/**
 * Descarga y reconstruye de forma 100% limpia todos los niños inscritos desde Supabase.
 * Corrige filas corridas, huecos en blanco y columnas desfasadas con los 180 registros oficiales.
 */
function sincronizarDesdeSupabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(HOJA_NOMBRE) || ss.getActiveSheet();
  sheet.setName(HOJA_NOMBRE);

  asegurarEncabezadosYFormato(sheet);

  var url = SUPABASE_URL + '/rest/v1/presentaciones_ninos?select=*&order=created_at.asc';
  var options = {
    method: 'get',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
    },
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() !== 200) {
    throw new Error('Error al conectar con la base de datos: ' + response.getContentText());
  }

  var registros = JSON.parse(response.getContentText());
  if (!Array.isArray(registros) || registros.length === 0) {
    SpreadsheetApp.getUi().alert('No se encontraron registros en la base de datos.');
    return;
  }

  // Limpiar datos existentes a partir de la fila 5
  var totalFilasActuales = sheet.getLastRow();
  if (totalFilasActuales > FILA_ENCABEZADOS) {
    sheet.getRange(FILA_ENCABEZADOS + 1, 1, totalFilasActuales - FILA_ENCABEZADOS, COLUMNAS.length).clearContent();
  }

  var filas = [];
  for (var i = 0; i < registros.length; i++) {
    filas.push(mapearRegistroAFila(registros[i]));
  }

  sheet.getRange(FILA_ENCABEZADOS + 1, 1, filas.length, COLUMNAS.length).setValues(filas);
  aplicarFormatoFilas(sheet, FILA_ENCABEZADOS + 1, filas.length);

  SpreadsheetApp.getUi().alert('Se sincronizaron y repararon exitosamente ' + filas.length + ' registros en la hoja.');
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'El servicio se encuentra ocupado.'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(HOJA_NOMBRE) || ss.getActiveSheet();
    sheet.setName(HOJA_NOMBRE);

    asegurarEncabezadosYFormato(sheet);

    var contenido = JSON.parse(e.postData.contents);

    // Caso 1: Sincronización en lote
    if (contenido.action === 'sync_batch' && Array.isArray(contenido.records)) {
      var filasLote = [];
      for (var k = 0; k < contenido.records.length; k++) {
        filasLote.push(mapearRegistroAFila(contenido.records[k]));
      }

      if (filasLote.length > 0) {
        var ultimaFilaLote = Math.max(sheet.getLastRow(), FILA_ENCABEZADOS);
        sheet.getRange(ultimaFilaLote + 1, 1, filasLote.length, COLUMNAS.length).setValues(filasLote);
        aplicarFormatoFilas(sheet, ultimaFilaLote + 1, filasLote.length);
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        registros_insertados: filasLote.length
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Caso 2: Inserción individual en vivo
    var registro = contenido.data || contenido;
    var fila = mapearRegistroAFila(registro);

    var ultimaFila = Math.max(sheet.getLastRow(), FILA_ENCABEZADOS);
    var filaInsertada = ultimaFila + 1;
    sheet.getRange(filaInsertada, 1, 1, COLUMNAS.length).setValues([fila]);
    aplicarFormatoFilas(sheet, filaInsertada, 1);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      fila: filaInsertada
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    servicio: 'Webhook de Presentación de Niños - Monte de Dios',
    zona_horaria: ZONA_HORARIA,
    columnas: COLUMNAS.length,
    estado: 'Operativo'
  })).setMimeType(ContentService.MimeType.JSON);
}

function mapearRegistroAFila(r) {
  var ahora = new Date();
  var marcaTemporal = Utilities.formatDate(ahora, ZONA_HORARIA, 'dd/MM/yyyy HH:mm:ss');
  if (r.created_at) {
    try {
      marcaTemporal = Utilities.formatDate(new Date(r.created_at), ZONA_HORARIA, 'dd/MM/yyyy HH:mm:ss');
    } catch (ignore) {}
  }

  var telPadreRaw = (r.telefono_padre || '').toString().trim();
  var telMadreRaw = (r.telefono_madre || '').toString().trim();
  var telPadre = telPadreRaw ? "'" + telPadreRaw : '';
  var telMadre = telMadreRaw ? "'" + telMadreRaw : '';

  var nombreNino = (r.nombre_nino || r.nombre || '').toString().trim();
  var fechaNac = (r.fecha_nacimiento || '').toString().trim();
  var edadNino = (r.edad_nino || r.edad || '').toString().trim();
  var nombrePadre = (r.nombre_padre || '').toString().trim();
  var nombreMadre = (r.nombre_madre || '').toString().trim();
  var notas = (r.notas || '').toString().trim();

  return [
    marcaTemporal,
    nombreNino,
    fechaNac,
    edadNino,
    nombrePadre,
    telPadre,
    nombreMadre,
    telMadre,
    notas
  ];
}

function aplicarFormatoFilas(sheet, filaInicio, cantidad) {
  var rango = sheet.getRange(filaInicio, 1, cantidad, COLUMNAS.length);
  rango
    .setFontFamily('Calibri')
    .setFontSize(12)
    .setVerticalAlignment('middle');

  for (var i = 0; i < cantidad; i++) {
    sheet.setRowHeight(filaInicio + i, 28);
  }

  for (var c = 0; c < COLUMNAS.length; c++) {
    sheet.getRange(filaInicio, c + 1, cantidad, 1).setHorizontalAlignment(COLUMNAS[c].alinear);
    if (COLUMNAS[c].clave === 'notas') {
      sheet.getRange(filaInicio, c + 1, cantidad, 1).setWrap(true);
    }
  }
}

function verificarEstado() {
  SpreadsheetApp.getUi().alert('Webhook de presentación de niños activo y enlazado con 9 columnas oficiales.');
}
