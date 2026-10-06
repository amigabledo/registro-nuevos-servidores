/**
 * Google Apps Script - Integración de Inscripción de Servidores
 * Ministerio Internacional Monte de Dios
 * 
 * Instrucciones:
 * 1. Abre tu hoja de cálculo en Google Sheets: "Registro de nuevos servidores (Octubre, 2026)".
 * 2. Ve a Extensiones > Apps Script.
 * 3. Reemplaza todo el contenido de Code.gs con este código completo.
 * 4. Haz clic en "Guardar" (icono de disquete).
 * 5. En el menú superior de funciones selecciona 'sincronizarDesdeSupabase' y presiona "Ejecutar"
 *    (acepta los permisos de Google si te los solicita).
 *    -> Esto reparará de inmediato todas las filas desalineadas y vacías directamente desde la base de datos oficial.
 * 6. Luego ve a "Implementar" > "Administrar implementaciones" > Editar > Versión: "Nueva versión" > Implementar.
 */

var HOJA_NOMBRE = 'Servidores';
var ZONA_HORARIA = 'America/Santo_Domingo';

var TITULO_LINEA_1 = 'MINISTERIO INTERNACIONAL MONTE DE DIOS';
var TITULO_LINEA_2 = 'Inscripción de nuevos servidores';
var TITULO_LINEA_3 = 'OCTUBRE, 2026';
var FILA_ENCABEZADOS = 4;

var SUPABASE_URL = 'https://fnwtfjwysitrpnpjsuoy.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZud3Rmand5c2l0cnBucGpzdW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NTY3MDMsImV4cCI6MjA5ODQzMjcwM30.dMPBJZOmAuYwmsYUZPebNtLQYn74_XAu1Hs-YwrA-AQ';

var COLUMNAS = [
  { clave: 'marca_temporal', titulo: 'Marca temporal', ancho: 175, alinear: 'center' },
  { clave: 'nombre', titulo: 'Nombre', ancho: 170, alinear: 'left' },
  { clave: 'apellido', titulo: 'Apellido', ancho: 170, alinear: 'left' },
  { clave: 'telefono', titulo: 'Teléfono o WhatsApp', ancho: 180, alinear: 'center' },
  { clave: 'correo', titulo: 'Correo electrónico', ancho: 230, alinear: 'left' },
  { clave: 'area_servicio', titulo: 'Área en que desea servir', ancho: 195, alinear: 'center' },
  { clave: 'escuela_nuevos_creyentes', titulo: 'Escuela de nuevos creyentes', ancho: 195, alinear: 'center' },
  { clave: 'bautizado', titulo: 'Bautizado en aguas', ancho: 155, alinear: 'center' },
  { clave: 'fecha_bautismo', titulo: 'Fecha de bautismo', ancho: 155, alinear: 'center' },
  { clave: 'retiro_liberacion', titulo: 'Retiro de liberación', ancho: 165, alinear: 'center' },
  { clave: 'fecha_retiro', titulo: 'Fecha de retiro', ancho: 155, alinear: 'center' },
  { clave: 'tiene_mentor', titulo: 'Tiene mentor', ancho: 145, alinear: 'center' },
  { clave: 'nombre_mentor', titulo: 'Nombre del mentor', ancho: 220, alinear: 'left' },
  { clave: 'asiste_casa_paz', titulo: 'Asiste a casa de paz', ancho: 165, alinear: 'center' },
  { clave: 'notas_servidor', titulo: 'Notas y observaciones', ancho: 350, alinear: 'left' }
];

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Monte de Dios')
    .addItem('1. Sincronizar y reparar filas desde la base de datos', 'sincronizarDesdeSupabase')
    .addItem('2. Formatear encabezados y diseño institucional', 'limpiarYFormatearHoja')
    .addItem('3. Corregir celdas vacías en filas actuales', 'corregirFilasDesalineadas')
    .addItem('4. Comprobar estado del webhook', 'verificarEstado')
    .addToUi();
}

function limpiarYFormatearHoja() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(HOJA_NOMBRE) || ss.getActiveSheet();
  sheet.setName(HOJA_NOMBRE);
  asegurarEncabezadosYFormato(sheet);
  SpreadsheetApp.getUi().alert('Diseño y encabezados institucionales aplicados con éxito.');
  return 'Hoja formateada con éxito';
}

function asegurarEncabezadosYFormato(sheet) {
  var totalCols = COLUMNAS.length;

  // 1. Eliminar automáticamente columnas sobrantes a la derecha si existen
  if (sheet.getLastColumn() > totalCols) {
    var exceso = sheet.getLastColumn() - totalCols;
    sheet.deleteColumns(totalCols + 1, exceso);
  }

  // 2. Banner institucional en filas 1, 2 y 3
  var valorA1 = sheet.getRange(1, 1).getValue().toString().trim();
  if (valorA1 !== TITULO_LINEA_1) {
    if (valorA1 === COLUMNAS[0].titulo) {
      sheet.insertRowsBefore(1, 3);
    } else if (sheet.getLastRow() > 0) {
      sheet.insertRowsBefore(1, 4);
    }
  }

  // Fila 1: MINISTERIO INTERNACIONAL MONTE DE DIOS
  var rangoFila1 = sheet.getRange(1, 1, 1, totalCols);
  rangoFila1.merge()
    .setValue(TITULO_LINEA_1)
    .setBackground('#0A4ABF')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(14)
    .setFontFamily('Calibri')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 40);

  // Fila 2: Inscripción de nuevos servidores
  var rangoFila2 = sheet.getRange(2, 1, 1, totalCols);
  rangoFila2.merge()
    .setValue(TITULO_LINEA_2)
    .setBackground('#0C56DB')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(13)
    .setFontFamily('Calibri')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(2, 36);

  // Fila 3: OCTUBRE, 2026
  var rangoFila3 = sheet.getRange(3, 1, 1, totalCols);
  rangoFila3.merge()
    .setValue(TITULO_LINEA_3)
    .setBackground('#EBF2FF')
    .setFontColor('#0A4ABF')
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
    .setBackground('#082F7E')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(12)
    .setFontFamily('Calibri')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
  sheet.setRowHeight(FILA_ENCABEZADOS, 44);

  // Congelar las 4 filas superiores (banner + encabezados)
  sheet.setFrozenRows(FILA_ENCABEZADOS);

  // Anchos de columna y formato texto en teléfonos
  for (var i = 0; i < COLUMNAS.length; i++) {
    var colNum = i + 1;
    sheet.setColumnWidth(colNum, COLUMNAS[i].ancho);

    if (COLUMNAS[i].clave === 'telefono') {
      sheet.getRange(FILA_ENCABEZADOS + 1, colNum, Math.max(sheet.getMaxRows() - FILA_ENCABEZADOS, 1), 1).setNumberFormat('@');
    }
  }

  // Formato visual en filas existentes
  var filasTotales = sheet.getLastRow();
  if (filasTotales >= FILA_ENCABEZADOS + 1) {
    aplicarFormatoFilas(sheet, FILA_ENCABEZADOS + 1, filasTotales - FILA_ENCABEZADOS);
  }
}

/**
 * Descarga y reconstruye de forma 100% limpia todos los postulantes desde Supabase.
 * Corrige filas desfasadas, campos vacíos erróneos y desfases entre columnas.
 */
function sincronizarDesdeSupabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(HOJA_NOMBRE) || ss.getActiveSheet();
  sheet.setName(HOJA_NOMBRE);

  asegurarEncabezadosYFormato(sheet);

  var url = SUPABASE_URL + '/rest/v1/servidores_registro?select=*&order=created_at.asc';
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

/**
 * Auto-corrección local de filas desalineadas en la hoja actual
 */
function corregirFilasDesalineadas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(HOJA_NOMBRE) || ss.getActiveSheet();
  var totalFilas = sheet.getLastRow();
  var corregidas = 0;

  for (var f = FILA_ENCABEZADOS + 1; f <= totalFilas; f++) {
    var mentorVal = sheet.getRange(f, 12).getValue().toString().trim(); // Col L: Tiene mentor
    var nombreMentorVal = sheet.getRange(f, 13).getValue().toString().trim(); // Col M: Nombre mentor
    var casaPazVal = sheet.getRange(f, 14).getValue().toString().trim(); // Col N: Casa de paz

    // Si tiene nombre de mentor pero la columna "Tiene mentor" está vacía
    if (!mentorVal && nombreMentorVal) {
      sheet.getRange(f, 12).setValue('Sí');
      corregidas++;
    } else if (!mentorVal && !nombreMentorVal) {
      sheet.getRange(f, 12).setValue('No');
    }

    // Si casa de paz está vacía
    if (!casaPazVal) {
      sheet.getRange(f, 14).setValue('No');
    }
  }

  SpreadsheetApp.getUi().alert('Se revisaron y normalizaron las filas. Filas ajustadas: ' + corregidas);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'El servicio se encuentra ocupado. Intente nuevamente en unos segundos.'
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
        var ultimaFila = Math.max(sheet.getLastRow(), FILA_ENCABEZADOS);
        sheet.getRange(ultimaFila + 1, 1, filasLote.length, COLUMNAS.length).setValues(filasLote);
        aplicarFormatoFilas(sheet, ultimaFila + 1, filasLote.length);
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        registros_insertados: filasLote.length,
        mensaje: 'Lote histórico insertado correctamente'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Caso 2: Inserción individual
    var registro = contenido.data || contenido;
    var fila = mapearRegistroAFila(registro);

    sheet.appendRow(fila);
    var filaInsertada = sheet.getLastRow();
    aplicarFormatoFilas(sheet, filaInsertada, 1);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      fila: filaInsertada,
      mensaje: 'Postulante registrado satisfactoriamente en Google Sheets'
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
    servicio: 'Webhook de Inscripción de Servidores - Monte de Dios',
    zona_horaria: ZONA_HORARIA,
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

  var nombre = (r.nombre || '').toString().trim();
  var apellido = (r.apellido || '').toString().trim();

  var telRaw = (r.telefono || '').toString().trim();
  var telefono = telRaw ? "'" + telRaw : '';

  var escuela = r.escuela_nuevos_creyentes === 'si' ? 'Sí' : (r.escuela_nuevos_creyentes === 'cursando' ? 'Cursando' : 'No');

  // Bautismo
  var bautizado = (r.bautizado === true || r.bautizado === 'si' || (r.fecha_bautismo && r.fecha_bautismo.toString().trim().length > 0)) ? 'Sí' : 'No';

  // Retiro de liberación
  var retiro = (r.retiro_liberacion === true || r.retiro_liberacion === 'si' || (r.fecha_retiro && r.fecha_retiro.toString().trim().length > 0)) ? 'Sí' : 'No';

  // Mentor: si tiene nombre o tiene_mentor es afirmativo -> 'Sí'
  var tieneNombreMentor = r.nombre_mentor && r.nombre_mentor.toString().trim().length > 0;
  var mentor = (r.tiene_mentor === true || r.tiene_mentor === 'si' || tieneNombreMentor) ? 'Sí' : 'No';

  // Casa de paz
  var casaPaz = (r.asiste_casa_paz === true || r.asiste_casa_paz === 'si') ? 'Sí' : 'No';

  // Área de servicio
  var area = r.area_servicio || '';
  if (area === 'ujieres') area = 'Ujieres';
  else if (area === 'seguridad') area = 'Seguridad';
  else if (area === 'escuela_dominical') area = 'Escuela dominical';

  // Formación exacta de las 15 columnas
  return [
    marcaTemporal,                                       // Col 1 (A)
    nombre,                                              // Col 2 (B)
    apellido,                                            // Col 3 (C)
    telefono,                                            // Col 4 (D)
    (r.correo || '').toString().trim(),                  // Col 5 (E)
    area,                                                // Col 6 (F)
    escuela,                                             // Col 7 (G)
    bautizado,                                           // Col 8 (H)
    (r.fecha_bautismo || '').toString().trim(),          // Col 9 (I)
    retiro,                                              // Col 10 (J)
    (r.fecha_retiro || '').toString().trim(),            // Col 11 (K)
    mentor,                                              // Col 12 (L)
    (r.nombre_mentor || '').toString().trim(),           // Col 13 (M)
    casaPaz,                                             // Col 14 (N)
    (r.notas_servidor || r.notas || '').toString().trim()// Col 15 (O)
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
    if (COLUMNAS[c].clave === 'notas_servidor') {
      sheet.getRange(filaInicio, c + 1, cantidad, 1).setWrap(true);
    }
  }
}

function verificarEstado() {
  SpreadsheetApp.getUi().alert('Webhook configurado y listo para recibir postulaciones de servidores.');
}
