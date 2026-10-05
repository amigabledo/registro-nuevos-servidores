/**
 * Google Apps Script - Integración de Inscripción de Servidores
 * Ministerio Internacional Monte de Dios
 * 
 * Configuración:
 * 1. Abre tu hoja de cálculo en Google Sheets.
 * 2. Ve a Extensiones > Apps Script.
 * 3. Pega este código completo en Code.gs.
 * 4. Guarda y ejecuta una vez 'limpiarYFormatearHoja' para dar permisos y estructurar la hoja.
 * 5. Haz clic en 'Implementar' > 'Nueva implementación'.
 *    - Tipo: Aplicación web.
 *    - Descripción: Webhook Inscripción de Servidores.
 *    - Ejecutar como: Yo (tu correo de Google).
 *    - Quién tiene acceso: Cualquier usuario (Anyone).
 * 6. Copia la URL generada y asígnala a la variable GOOGLE_SHEETS_SERVIDORES_URL en Cloudflare Pages.
 */

var HOJA_NOMBRE = 'Servidores';
var COLOR_ENCABEZADO = '#0A4ABF'; // Azul corporativo institucional
var ZONA_HORARIA = 'America/Santo_Domingo';

var COLUMNAS = [
  { clave: 'marca_temporal', titulo: 'Marca temporal', ancho: 175, alinear: 'center' },
  { clave: 'nombre', titulo: 'Nombre', ancho: 170, alinear: 'left' },
  { clave: 'apellido', titulo: 'Apellido', ancho: 170, alinear: 'left' },
  { clave: 'telefono', titulo: 'Teléfono o WhatsApp', ancho: 175, alinear: 'center' },
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
  { clave: 'notas_servidor', titulo: 'Notas y observaciones', ancho: 340, alinear: 'left' }
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
  var valorA1 = sheet.getRange(1, 1).getValue();
  if (!valorA1 || valorA1.toString() !== COLUMNAS[0].titulo) {
    if (sheet.getLastRow() > 0) {
      sheet.insertRowBefore(1);
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

      if (COLUMNAS[i].clave === 'telefono') {
        sheet.getRange(2, colNum, sheet.getMaxRows() - 1, 1).setNumberFormat('@');
      }
    }
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

    // Garantizar de manera autonoma que la fila 1 tenga los encabezados y formato corporativo
    asegurarEncabezadosYFormato(sheet);

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
  var nombreCompleto = (nombre + ' ' + apellido).trim();

  // Formato texto de teléfono
  var telRaw = (r.telefono || '').toString().trim();
  var telefono = telRaw ? "'" + telRaw : '';

  // Formateo de opciones booleanas / valores legibles
  var escuela = r.escuela_nuevos_creyentes === 'si' ? 'Sí' : (r.escuela_nuevos_creyentes === 'cursando' ? 'Cursando' : 'No');
  var bautizado = r.bautizado === true || r.bautizado === 'si' ? 'Sí' : 'No';
  var retiro = r.retiro_liberacion === true || r.retiro_liberacion === 'si' ? 'Sí' : 'No';
  var mentor = r.tiene_mentor === true || r.tiene_mentor === 'si' ? 'Sí' : 'No';
  var casaPaz = r.asiste_casa_paz === true || r.asiste_casa_paz === 'si' ? 'Sí' : 'No';

  var area = r.area_servicio || '';
  if (area === 'ujieres') area = 'Ujieres';
  else if (area === 'seguridad') area = 'Seguridad';
  else if (area === 'escuela_dominical') area = 'Escuela dominical';

  var estado = r.estado || 'Pendiente';
  if (estado === 'pendiente') estado = 'Pendiente';
  else if (estado === 'en_revision') estado = 'En revisión';
  else if (estado === 'contactado') estado = 'Contactado';
  else if (estado === 'aprobado') estado = 'Aprobado';

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
    .setFontFamily('Arial')
    .setFontSize(10)
    .setVerticalAlignment('middle');

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
