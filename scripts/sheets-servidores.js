/**
 * Google Apps Script - Integración de Inscripción de Servidores
 * Ministerio Internacional Monte de Dios
 * 
 * Configuración:
 * 1. Abre tu hoja de cálculo en Google Sheets.
 * 2. Ve a Extensiones > Apps Script.
 * 3. Pega este código completo en Code.gs.
 * 4. Guarda y ejecuta una vez 'limpiarYFormatearHoja' para estructurar la hoja.
 * 5. Haz clic en 'Implementar' > 'Administrar implementaciones' > Editar > Versión: Nueva versión > Implementar.
 */

var HOJA_NOMBRE = 'Servidores';
var COLOR_ENCABEZADO = '#0A4ABF'; // Azul corporativo institucional
var ZONA_HORARIA = 'America/Santo_Domingo';

var TITULO_LINEA_1 = 'MINISTERIO INTERNACIONAL MONTE DE DIOS';
var TITULO_LINEA_2 = 'Inscripción de nuevos servidores';
var TITULO_LINEA_3 = 'OCTUBRE, 2026';
var FILA_ENCABEZADOS = 4;

var COLUMNAS = [
  { clave: 'marca_temporal', titulo: 'Marca temporal', ancho: 180, alinear: 'center' },
  { clave: 'nombre', titulo: 'Nombre', ancho: 170, alinear: 'left' },
  { clave: 'apellido', titulo: 'Apellido', ancho: 170, alinear: 'left' },
  { clave: 'telefono', titulo: 'Teléfono o WhatsApp', ancho: 180, alinear: 'center' },
  { clave: 'correo', titulo: 'Correo electrónico', ancho: 240, alinear: 'left' },
  { clave: 'area_servicio', titulo: 'Área en que desea servir', ancho: 200, alinear: 'center' },
  { clave: 'escuela_nuevos_creyentes', titulo: 'Escuela de nuevos creyentes', ancho: 200, alinear: 'center' },
  { clave: 'bautizado', titulo: 'Bautizado en aguas', ancho: 160, alinear: 'center' },
  { clave: 'fecha_bautismo', titulo: 'Fecha de bautismo', ancho: 160, alinear: 'center' },
  { clave: 'retiro_liberacion', titulo: 'Retiro de liberación', ancho: 170, alinear: 'center' },
  { clave: 'fecha_retiro', titulo: 'Fecha de retiro', ancho: 160, alinear: 'center' },
  { clave: 'tiene_mentor', titulo: 'Tiene mentor', ancho: 150, alinear: 'center' },
  { clave: 'nombre_mentor', titulo: 'Nombre del mentor', ancho: 220, alinear: 'left' },
  { clave: 'asiste_casa_paz', titulo: 'Asiste a casa de paz', ancho: 170, alinear: 'center' },
  { clave: 'notas_servidor', titulo: 'Notas y observaciones', ancho: 350, alinear: 'left' }
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
  var sheet = ss.getSheetByName(HOJA_NOMBRE) || ss.getActiveSheet();
  sheet.setName(HOJA_NOMBRE);
  asegurarEncabezadosYFormato(sheet);
  return 'Hoja de inscripción de servidores formateada con éxito';
}

function asegurarEncabezadosYFormato(sheet) {
  var totalCols = COLUMNAS.length;

  // 1. Eliminar automáticamente columnas sobrantes a la derecha si existen
  if (sheet.getLastColumn() > totalCols) {
    var exceso = sheet.getLastColumn() - totalCols;
    sheet.deleteColumns(totalCols + 1, exceso);
  }

  // 2. Verificar o reestructurar filas superiores para el banner institucional
  var valorA1 = sheet.getRange(1, 1).getValue().toString().trim();
  if (valorA1 !== TITULO_LINEA_1) {
    if (valorA1 === COLUMNAS[0].titulo) {
      // Los encabezados estaban en la fila 1: insertar 3 filas arriba para el banner
      sheet.insertRowsBefore(1, 3);
    } else if (sheet.getLastRow() > 0) {
      // Había datos directamente desde la fila 1: insertar 4 filas arriba
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

  // Formatear todas las filas de datos existentes a Calibri 12 con altura espaciosa
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

    // Garantizar de manera autonoma el banner institucional y los encabezados
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
        mensaje: 'Lote histórico de servidores insertado correctamente'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Caso 2: Inserción individual regular
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
  var bautizado = r.bautizado === true || r.bautizado === 'si' ? 'Sí' : 'No';
  var retiro = r.retiro_liberacion === true || r.retiro_liberacion === 'si' ? 'Sí' : 'No';
  var mentor = r.tiene_mentor === true || r.tiene_mentor === 'si' ? 'Sí' : 'No';
  var casaPaz = r.asiste_casa_paz === true || r.asiste_casa_paz === 'si' ? 'Sí' : 'No';

  var area = r.area_servicio || '';
  if (area === 'ujieres') area = 'Ujieres';
  else if (area === 'seguridad') area = 'Seguridad';
  else if (area === 'escuela_dominical') area = 'Escuela dominical';

  return [
    marcaTemporal,
    nombre,
    apellido,
    telefono,
    (r.correo || '').toString().trim(),
    area,
    escuela,
    bautizado,
    (r.fecha_bautismo || '').toString().trim(),
    retiro,
    (r.fecha_retiro || '').toString().trim(),
    mentor,
    (r.nombre_mentor || '').toString().trim(),
    casaPaz,
    (r.notas_servidor || r.notas || '').toString().trim()
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
