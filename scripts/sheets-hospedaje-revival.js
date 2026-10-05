/**
 * Google Apps Script - Integración de Hospedaje Revival 2026
 * Conferencia Revival - Ministerio Internacional Monte de Dios
 * 
 * Configuración:
 * 1. Abre tu hoja de cálculo en Google Sheets.
 * 2. Ve a Extensiones > Apps Script.
 * 3. Pega este código completo en Code.gs.
 * 4. Guarda y ejecuta una vez 'limpiarYFormatearHoja' para estructurar la hoja.
 * 5. Haz clic en 'Implementar' > 'Administrar implementaciones' > Editar > Versión: Nueva versión > Implementar.
 */

var HOJA_NOMBRE = 'Hospedaje';
var COLOR_ENCABEZADO = '#1E1B4B'; // Indigo profundo institucional Revival
var ZONA_HORARIA = 'America/Santo_Domingo';

var TITULO_LINEA_1 = 'MINISTERIO INTERNACIONAL MONTE DE DIOS';
var TITULO_LINEA_2 = 'Registro de hospedaje Revival';
var TITULO_LINEA_3 = 'OCTUBRE, 2026';
var FILA_ENCABEZADOS = 4;

var COLUMNAS = [
  { clave: 'marca_temporal', titulo: 'Marca temporal', ancho: 180, alinear: 'center' },
  { clave: 'nombre_anfitrion', titulo: 'Nombre del anfitrión', ancho: 230, alinear: 'left' },
  { clave: 'telefono', titulo: 'Teléfono o WhatsApp', ancho: 175, alinear: 'center' },
  { clave: 'direccion', titulo: 'Dirección del alojamiento', ancho: 300, alinear: 'left' },
  { clave: 'cantidad_personas', titulo: 'Cupo de personas', ancho: 150, alinear: 'center' },
  { clave: 'sexo_hospedaje', titulo: 'Sexo aceptado', ancho: 155, alinear: 'center' },
  { clave: 'estado', titulo: 'Estado del hospedaje', ancho: 160, alinear: 'center' },
  { clave: 'notas', titulo: 'Detalles y notas', ancho: 340, alinear: 'left' }
];

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Revival 2026')
    .addItem('Inicializar y formatear encabezados', 'limpiarYFormatearHoja')
    .addItem('Comprobar estado del webhook', 'verificarEstado')
    .addToUi();
}

function limpiarYFormatearHoja() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(HOJA_NOMBRE) || ss.getActiveSheet();
  sheet.setName(HOJA_NOMBRE);
  asegurarEncabezadosYFormato(sheet);
  return 'Hoja de hospedaje formateada con éxito';
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
    .setBackground('#1E1B4B')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(14)
    .setFontFamily('Calibri')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 38);

  // Fila 2: Registro de hospedaje Revival
  var rangoFila2 = sheet.getRange(2, 1, 1, totalCols);
  rangoFila2.merge()
    .setValue(TITULO_LINEA_2)
    .setBackground('#2E1065')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(13)
    .setFontFamily('Calibri')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(2, 34);

  // Fila 3: OCTUBRE, 2026
  var rangoFila3 = sheet.getRange(3, 1, 1, totalCols);
  rangoFila3.merge()
    .setValue(TITULO_LINEA_3)
    .setBackground('#F3E8FF')
    .setFontColor('#1E1B4B')
    .setFontWeight('bold')
    .setFontSize(12)
    .setFontFamily('Calibri')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(3, 30);

  // Fila 4: Encabezados de columnas
  var titulos = COLUMNAS.map(function(c) { return c.titulo; });
  var rangoEncabezado = sheet.getRange(FILA_ENCABEZADOS, 1, 1, titulos.length);
  rangoEncabezado.setValues([titulos])
    .setBackground('#1E1B4B')
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

    if (COLUMNAS[i].clave === 'telefono') {
      sheet.getRange(FILA_ENCABEZADOS + 1, colNum, Math.max(sheet.getMaxRows() - FILA_ENCABEZADOS, 1), 1).setNumberFormat('@');
    }
  }

  var filasTotales = sheet.getLastRow();
  if (filasTotales >= FILA_ENCABEZADOS + 1) {
    aplicarFormatoFilas(sheet, FILA_ENCABEZADOS + 1, filasTotales - FILA_ENCABEZADOS);
  }
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
        mensaje: 'Lote histórico de hospedaje insertado correctamente'
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
      mensaje: 'Registro de hospedaje guardado satisfactoriamente en Google Sheets'
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
    servicio: 'Webhook de Hospedaje Revival 2026 - Monte de Dios',
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

  var telRaw = (r.telefono || '').toString().trim();
  var telefono = telRaw ? "'" + telRaw : '';

  var sexo = r.sexo_hospedaje || '';
  if (sexo === 'femenino') sexo = 'Femenino';
  else if (sexo === 'masculino') sexo = 'Masculino';
  else if (sexo === 'ambos') sexo = 'Ambos sexos';

  var estado = r.estado || 'Pendiente';
  if (estado === 'pendiente') estado = 'Pendiente';
  else if (estado === 'confirmado') estado = 'Confirmado';
  else if (estado === 'cancelado') estado = 'Cancelado';

  var cupo = Number(r.cantidad_personas) || 1;

  return [
    marcaTemporal,
    (r.nombre_anfitrion || '').toString().trim(),
    telefono,
    (r.direccion || '').toString().trim(),
    cupo,
    sexo,
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
    if (COLUMNAS[c].clave === 'direccion' || COLUMNAS[c].clave === 'notas') {
      sheet.getRange(filaInicio, c + 1, cantidad, 1).setWrap(true);
    }
  }
}

function verificarEstado() {
  SpreadsheetApp.getUi().alert('Webhook configurado y listo para recibir registros de hospedaje.');
}
