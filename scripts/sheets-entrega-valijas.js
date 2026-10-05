/**
 * Google Apps Script - Integración de Entrega de Valijas CDP
 * Casas de Paz - Ministerio Internacional Monte de Dios
 * 
 * Configuración:
 * 1. Abre tu hoja de cálculo en Google Sheets para Entrega de Valijas.
 * 2. Ve a Extensiones > Apps Script.
 * 3. Pega este código completo en Code.gs.
 * 4. Guarda y ejecuta una vez 'limpiarYFormatearHoja' para dar permisos y estructurar la hoja.
 * 5. Haz clic en 'Implementar' > 'Nueva implementación'.
 *    - Tipo: Aplicación web.
 *    - Descripción: Webhook Entrega de Valijas CDP.
 *    - Ejecutar como: Yo (tu correo de Google).
 *    - Quién tiene acceso: Cualquier usuario (Anyone).
 * 6. Copia la URL generada y asígnala a la variable GOOGLE_SHEETS_VALIJAS_URL en Cloudflare Pages.
 */

var HOJA_NOMBRE = 'Entregas';
var COLOR_ENCABEZADO = '#0F172A'; // Azul noche pizarra corporativo
var ZONA_HORARIA = 'America/Santo_Domingo';

var COLUMNAS = [
  { clave: 'marca_temporal', titulo: 'Marca temporal', ancho: 175, alinear: 'center' },
  { clave: 'id', titulo: 'ID Entrega', ancho: 140, alinear: 'center' },
  { clave: 'fecha', titulo: 'Fecha de entrega', ancho: 150, alinear: 'center' },
  { clave: 'hora', titulo: 'Hora de entrega', ancho: 140, alinear: 'center' },
  { clave: 'codigo', titulo: 'Código CDP', ancho: 150, alinear: 'center' },
  { clave: 'red', titulo: 'Red', ancho: 160, alinear: 'center' },
  { clave: 'lider', titulo: 'Líder de Casa de Paz', ancho: 240, alinear: 'left' },
  { clave: 'sublideres', titulo: 'Sublíderes', ancho: 240, alinear: 'left' },
  { clave: 'entregado_por', titulo: 'Entregado por', ancho: 180, alinear: 'left' },
  { clave: 'firma', titulo: 'Firma digital', ancho: 160, alinear: 'center' },
  { clave: 'comentarios', titulo: 'Comentarios y observaciones', ancho: 330, alinear: 'left' }
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

    if (COLUMNAS[i].clave === 'codigo' || COLUMNAS[i].clave === 'id') {
      sheet.getRange(2, colNum, sheet.getMaxRows() - 1, 1).setNumberFormat('@');
    }
  }

  return 'Hoja de entrega de valijas formateada con éxito';
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
        mensaje: 'Lote histórico de entrega de valijas insertado correctamente'
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
      mensaje: 'Entrega de valija registrada satisfactoriamente en Google Sheets'
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
    servicio: 'Webhook de Entrega de Valijas CDP - Monte de Dios',
    zona_horaria: ZONA_HORARIA,
    estado: 'Operativo'
  })).setMimeType(ContentService.MimeType.JSON);
}

function mapearRegistroAFila(r) {
  var ahora = new Date();
  var marcaTemporal = Utilities.formatDate(ahora, ZONA_HORARIA, 'dd/MM/yyyy HH:mm:ss');
  var horaEntrega = Utilities.formatDate(ahora, ZONA_HORARIA, 'hh:mm a');

  if (r.created_at) {
    try {
      var d = new Date(r.created_at);
      marcaTemporal = Utilities.formatDate(d, ZONA_HORARIA, 'dd/MM/yyyy HH:mm:ss');
      horaEntrega = Utilities.formatDate(d, ZONA_HORARIA, 'hh:mm a');
    } catch (ignore) {}
  }

  // Soporte para datos anidados (join de cdps) o planos
  var codigo = r.codigo || (r.cdps && r.cdps.codigo) || '';
  var red = r.red || (r.cdps && r.cdps.red) || '';
  var lider = r.lider || (r.cdps && r.cdps.lider) || '';
  var sublideres = r.sublideres || (r.cdps && r.cdps.sublideres) || '';

  var fecha = (r.fecha || '').toString().trim();
  var comentarios = (r.comentarios || '').toString().trim();
  var entregadoPor = (r.entregado_por_nombre || r.entregado_por || '').toString().trim();
  var tieneFirma = r.firma ? 'Sí (firma digital)' : 'Sin firma';

  return [
    marcaTemporal,
    (r.id || '').toString(),
    fecha,
    horaEntrega,
    codigo ? "'" + codigo : '',
    red,
    lider,
    sublideres,
    entregadoPor,
    tieneFirma,
    comentarios
  ];
}

function aplicarFormatoFilas(sheet, filaInicio, cantidad) {
  var rango = sheet.getRange(filaInicio, 1, cantidad, COLUMNAS.length);
  rango
    .setFontFamily('Arial')
    .setFontSize(10)
    .setVerticalAlignment('middle');

  // Ajuste de texto en comentarios
  sheet.getRange(filaInicio, 11, cantidad, 1).setWrap(true);

  for (var c = 0; c < COLUMNAS.length; c++) {
    sheet.getRange(filaInicio, c + 1, cantidad, 1).setHorizontalAlignment(COLUMNAS[c].alinear);
  }
}

function verificarEstado() {
  SpreadsheetApp.getUi().alert('Webhook de entrega de valijas activo y enlazado.');
}
