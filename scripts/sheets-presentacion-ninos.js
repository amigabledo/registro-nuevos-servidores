/**
 * Google Apps Script - Integración de Presentación de Niños
 * Ministerio Internacional Monte de Dios
 * 
 * Configuración:
 * 1. Abre tu hoja de cálculo en Google Sheets.
 * 2. Ve a Extensiones > Apps Script.
 * 3. Pega este código completo en Code.gs.
 * 4. Guarda y ejecuta una vez 'limpiarYFormatearHoja' para estructurar la hoja.
 * 5. Haz clic en 'Implementar' > 'Administrar implementaciones' > Editar > Versión: Nueva versión > Implementar.
 */

var HOJA_NOMBRE = 'Presentaciones';
var COLOR_ENCABEZADO = '#0284C7'; // Azul zafiro institucional
var ZONA_HORARIA = 'America/Santo_Domingo';

var TITULO_LINEA_1 = 'MINISTERIO INTERNACIONAL MONTE DE DIOS';
var TITULO_LINEA_2 = 'Presentación de niños';
var TITULO_LINEA_3 = 'OCTUBRE, 2026';
var FILA_ENCABEZADOS = 4;

var COLUMNAS = [
  { clave: 'marca_temporal', titulo: 'Marca temporal', ancho: 180, alinear: 'center' },
  { clave: 'nombre_nino', titulo: 'Nombre del niño o niña', ancho: 260, alinear: 'left' },
  { clave: 'fecha_nacimiento', titulo: 'Fecha de nacimiento', ancho: 160, alinear: 'center' },
  { clave: 'edad_nino', titulo: 'Edad del niño', ancho: 150, alinear: 'center' },
  { clave: 'nombre_padre', titulo: 'Nombre del padre', ancho: 230, alinear: 'left' },
  { clave: 'telefono_padre', titulo: 'Teléfono del padre', ancho: 175, alinear: 'center' },
  { clave: 'nombre_madre', titulo: 'Nombre de la madre', ancho: 230, alinear: 'left' },
  { clave: 'telefono_madre', titulo: 'Teléfono de la madre', ancho: 175, alinear: 'center' },
  { clave: 'estado', titulo: 'Estado de presentación', ancho: 165, alinear: 'center' },
  { clave: 'notas', titulo: 'Notas y observaciones', ancho: 320, alinear: 'left' }
];

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Monte de Dios')
    .addItem('Inicializar y formatear encabezados', 'limpiarYFormatearHoja')
    .addItem('Corregir columnas desalineadas', 'corregirFilasDesalineadas')
    .addItem('Comprobar estado del webhook', 'verificarEstado')
    .addToUi();
}

function limpiarYFormatearHoja() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(HOJA_NOMBRE) || ss.getActiveSheet();
  sheet.setName(HOJA_NOMBRE);
  asegurarEncabezadosYFormato(sheet);
  return 'Hoja de presentación de niños formateada con éxito';
}

function asegurarEncabezadosYFormato(sheet) {
  var totalCols = COLUMNAS.length;

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

  // Fila 1: MINISTERIO INTERNACIONAL MONTE DE DIOS
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

  // Fila 2: Presentación de niños
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

  // Fila 3: OCTUBRE, 2026
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
    // Corregir automáticamente filas desalineadas (donde el estado cayó en Notas)
    for (var f = FILA_ENCABEZADOS + 1; f <= filasTotales; f++) {
      var valI = sheet.getRange(f, 9).getValue().toString().trim();
      var valJ = sheet.getRange(f, 10).getValue().toString().trim();
      var esEstado = (valJ === 'Pendiente' || valJ === 'Confirmado' || valJ === 'Presentado' || valJ === 'Cancelado');
      if (!valI && esEstado) {
        sheet.getRange(f, 9).setValue(valJ);
        sheet.getRange(f, 10).setValue('');
      }
    }

    aplicarFormatoFilas(sheet, FILA_ENCABEZADOS + 1, filasTotales - FILA_ENCABEZADOS);
  }
}

function corregirFilasDesalineadas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(HOJA_NOMBRE) || ss.getActiveSheet();
  var ultimaFila = sheet.getLastRow();
  var filasCorregidas = 0;
  var filaInicio = (sheet.getRange(1, 1).getValue().toString().trim() === TITULO_LINEA_1) ? (FILA_ENCABEZADOS + 1) : 2;

  for (var f = filaInicio; f <= ultimaFila; f++) {
    var valI = sheet.getRange(f, 9).getValue().toString().trim();
    var valJ = sheet.getRange(f, 10).getValue().toString().trim();
    var esEstado = (valJ === 'Pendiente' || valJ === 'Confirmado' || valJ === 'Presentado' || valJ === 'Cancelado');
    if (!valI && esEstado) {
      sheet.getRange(f, 9).setValue(valJ);
      sheet.getRange(f, 10).setValue('');
      filasCorregidas++;
    }
  }

  SpreadsheetApp.getUi().alert('Proceso completado: se corrigieron ' + filasCorregidas + ' fila(s) desalineadas.');
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

    // Caso 1: Sincronización por lote (batch histórico)
    if (contenido.action === 'sync_batch' && Array.isArray(contenido.records)) {
      var filasLote = [];
      for (var k = 0; k < contenido.records.length; k++) {
        filasLote.push(mapearRegistroAFila(contenido.records[k]));
      }

      if (filasLote.length > 0) {
        var ultimaFila = Math.max(sheet.getLastRow(), FILA_ENCABEZADOS);
        var numCols = COLUMNAS.length;
        sheet.getRange(ultimaFila + 1, 1, filasLote.length, numCols).setValues(filasLote);
        aplicarFormatoFilas(sheet, ultimaFila + 1, filasLote.length);
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        registros_insertados: filasLote.length,
        mensaje: 'Lote histórico de presentación de niños insertado correctamente'
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
      mensaje: 'Registro de niño guardado satisfactoriamente en Google Sheets'
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

  var estado = r.estado || 'Pendiente';
  if (estado === 'pendiente') estado = 'Pendiente';
  else if (estado === 'confirmado') estado = 'Confirmado';
  else if (estado === 'presentado') estado = 'Presentado';
  else if (estado === 'cancelado') estado = 'Cancelado';

  return [
    marcaTemporal,
    (r.nombre_nino || '').toString().trim(),
    (r.fecha_nacimiento || '').toString().trim(),
    (r.edad_nino || '').toString().trim(),
    (r.nombre_padre || '').toString().trim(),
    telPadre,
    (r.nombre_madre || '').toString().trim(),
    telMadre,
    estado,
    (r.notas || '').toString().trim()
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
  SpreadsheetApp.getUi().alert('Webhook de presentación de niños activo y enlazado.');
}
