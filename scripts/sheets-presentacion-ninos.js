/**
 * Google Apps Script - Integración de Presentación de Niños
 * Ministerio Internacional Monte de Dios
 * 
 * Configuración:
 * 1. Abre tu hoja de cálculo en Google Sheets para Presentación de Niños.
 * 2. Ve a Extensiones > Apps Script.
 * 3. Pega este código completo en Code.gs.
 * 4. Guarda y ejecuta una vez 'limpiarYFormatearHoja' para dar permisos y estructurar la hoja.
 * 5. Haz clic en 'Implementar' > 'Nueva implementación'.
 *    - Tipo: Aplicación web.
 *    - Descripción: Webhook Presentación de Niños.
 *    - Ejecutar como: Yo (tu correo de Google).
 *    - Quién tiene acceso: Cualquier usuario (Anyone).
 * 6. Copia la URL generada y asígnala a la variable GOOGLE_SHEETS_PRESENTACION_URL en Cloudflare Pages.
 */

var HOJA_NOMBRE = 'Presentaciones';
var COLOR_ENCABEZADO = '#0284C7'; // Azul zafiro institucional
var ZONA_HORARIA = 'America/Santo_Domingo';

var COLUMNAS = [
  { clave: 'marca_temporal', titulo: 'Marca temporal', ancho: 175, alinear: 'center' },
  { clave: 'id', titulo: 'ID Registro', ancho: 140, alinear: 'center' },
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
    .addItem('Comprobar estado del webhook', 'verificarEstado')
    .addToUi();
}

function limpiarYFormatearHoja() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(HOJA_NOMBRE);
  if (!sheet) {
    sheet = ss.insertSheet(HOJA_NOMBRE);
  }

  sheet.setFrozenRows(1);

  var titulos = COLUMNAS.map(function(c) { return c.titulo; });
  var rangoEncabezado = sheet.getRange(1, 1, 1, titulos.length);
  rangoEncabezado.setValues([titulos]);

  rangoEncabezado
    .setBackground(COLOR_ENCABEZADO)
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(11)
    .setFontFamily('Arial')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);

  sheet.setRowHeight(1, 40);

  for (var i = 0; i < COLUMNAS.length; i++) {
    var colNum = i + 1;
    sheet.setColumnWidth(colNum, COLUMNAS[i].ancho);

    if (COLUMNAS[i].clave === 'telefono_padre' || COLUMNAS[i].clave === 'telefono_madre' || COLUMNAS[i].clave === 'id') {
      sheet.getRange(2, colNum, sheet.getMaxRows() - 1, 1).setNumberFormat('@');
    }
  }

  return 'Hoja de presentación de niños formateada con éxito';
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
    var sheet = ss.getSheetByName(HOJA_NOMBRE);
    if (!sheet) {
      limpiarYFormatearHoja();
      sheet = ss.getSheetByName(HOJA_NOMBRE);
    }

    var contenido = JSON.parse(e.postData.contents);

    // Caso 1: Sincronización por lote (batch histórico)
    if (contenido.action === 'sync_batch' && Array.isArray(contenido.records)) {
      var filasLote = [];
      for (var k = 0; k < contenido.records.length; k++) {
        filasLote.push(mapearRegistroAFila(contenido.records[k]));
      }
      if (filasLote.length > 0) {
        var ultimaFila = sheet.getLastRow();
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
      mensaje: 'Presentación de niño registrada satisfactoriamente en Google Sheets'
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
    (r.id || '').toString(),
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
    .setFontFamily('Arial')
    .setFontSize(10)
    .setVerticalAlignment('middle');

  // Ajuste de texto en notas
  sheet.getRange(filaInicio, 11, cantidad, 1).setWrap(true);

  for (var c = 0; c < COLUMNAS.length; c++) {
    sheet.getRange(filaInicio, c + 1, cantidad, 1).setHorizontalAlignment(COLUMNAS[c].alinear);
  }
}

function verificarEstado() {
  SpreadsheetApp.getUi().alert('Webhook de presentación de niños activo y enlazado.');
}
