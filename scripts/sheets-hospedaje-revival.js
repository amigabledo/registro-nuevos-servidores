/**
 * Google Apps Script - Integración de Hospedaje Revival 2026
 * Conferencia Revival - Ministerio Internacional Monte de Dios
 * 
 * Configuración:
 * 1. Abre tu hoja de cálculo en Google Sheets.
 * 2. Ve a Extensiones > Apps Script.
 * 3. Pega este código completo en Code.gs.
 * 4. Guarda y ejecuta una vez 'limpiarYFormatearHoja' para dar permisos y estructurar la hoja.
 * 5. Haz clic en 'Implementar' > 'Nueva implementación'.
 *    - Tipo: Aplicación web.
 *    - Descripción: Webhook Hospedaje Revival 2026.
 *    - Ejecutar como: Yo (tu correo de Google).
 *    - Quién tiene acceso: Cualquier usuario (Anyone).
 * 6. Copia la URL generada y configúrala en Cloudflare Pages como GOOGLE_SHEETS_HOSPEDAJE_URL.
 */

var HOJA_NOMBRE = 'Hospedaje';
var COLOR_ENCABEZADO = '#1E1B4B'; // Indigo profundo institucional Revival
var ZONA_HORARIA = 'America/Santo_Domingo';

var COLUMNAS = [
  { clave: 'marca_temporal', titulo: 'Marca temporal', ancho: 175, alinear: 'center' },
  { clave: 'id', titulo: 'ID Registro', ancho: 140, alinear: 'center' },
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
  var sheet = ss.getSheetByName(HOJA_NOMBRE);
  if (!sheet) {
    sheet = ss.insertSheet(HOJA_NOMBRE);
  }

  // Congelar la primera fila
  sheet.setFrozenRows(1);

  // Escribir títulos de encabezados
  var titulos = COLUMNAS.map(function(c) { return c.titulo; });
  var rangoEncabezado = sheet.getRange(1, 1, 1, titulos.length);
  rangoEncabezado.setValues([titulos]);

  // Estilo visual corporativo
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

  // Ajustar anchos y formato de columnas
  for (var i = 0; i < COLUMNAS.length; i++) {
    var colNum = i + 1;
    sheet.setColumnWidth(colNum, COLUMNAS[i].ancho);

    if (COLUMNAS[i].clave === 'telefono' || COLUMNAS[i].clave === 'id') {
      sheet.getRange(2, colNum, sheet.getMaxRows() - 1, 1).setNumberFormat('@');
    }
  }

  return 'Hoja de hospedaje formateada con éxito';
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

  // Teléfono como texto con apóstrofe inicial
  var telRaw = (r.telefono || '').toString().trim();
  var telefono = telRaw ? "'" + telRaw : '';

  // Formato de sexo aceptado
  var sexo = r.sexo_hospedaje || '';
  if (sexo === 'femenino') sexo = 'Femenino';
  else if (sexo === 'masculino') sexo = 'Masculino';
  else if (sexo === 'ambos') sexo = 'Ambos sexos';

  // Formato de estado
  var estado = r.estado || 'Pendiente';
  if (estado === 'pendiente') estado = 'Pendiente';
  else if (estado === 'confirmado') estado = 'Confirmado';
  else if (estado === 'cancelado') estado = 'Cancelado';

  var cupo = Number(r.cantidad_personas) || 1;

  return [
    marcaTemporal,
    (r.id || '').toString(),
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
    .setFontFamily('Arial')
    .setFontSize(10)
    .setVerticalAlignment('middle');

  // Ajuste de texto para dirección (col 5) y notas (col 9)
  sheet.getRange(filaInicio, 5, cantidad, 1).setWrap(true);
  sheet.getRange(filaInicio, 9, cantidad, 1).setWrap(true);

  // Alineaciones específicas por columna
  for (var c = 0; c < COLUMNAS.length; c++) {
    sheet.getRange(filaInicio, c + 1, cantidad, 1).setHorizontalAlignment(COLUMNAS[c].alinear);
  }
}

function verificarEstado() {
  SpreadsheetApp.getUi().alert('Webhook configurado y listo para recibir registros de hospedaje.');
}
