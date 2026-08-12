/**
 * FARES TAIE — Formulario de actualización de datos
 * Recibe el POST del formulario y agrega una fila en la hoja "Respuestas".
 *
 * Instalación: ver README.md, sección "Publicar el Apps Script".
 */

var SHEET_NAME = 'Respuestas';

var COLUMNS = [
  ['fecha',              'Fecha de envío'],
  ['folio',              'Folio'],
  ['solicitanteEmail',   'Email del solicitante'],
  ['razonSocial',        'Nombre o Razón Social'],
  ['domicilioFiscal',    'Domicilio fiscal'],
  ['direccionReal',      'Dirección real'],
  ['cuit',               'CUIT'],
  ['codigoPostal',       'Código postal'],
  ['telefonoAdmin',      'Teléfono área administrativa'],
  ['correoInstitucional','Correo electrónico institucional'],
  ['ordenCompra',        'Trabaja con orden de compra'],
  ['condicionIva',       'Condición frente al IVA'],
  ['agenteRetencion',    'Es agente de retención'],
  ['res1Nombre',         'Resultados 1 - Nombre'],
  ['res1Email',          'Resultados 1 - Email'],
  ['res1Telefono',       'Resultados 1 - Teléfono'],
  ['res2Nombre',         'Resultados 2 - Nombre'],
  ['res2Email',          'Resultados 2 - Email'],
  ['res2Telefono',       'Resultados 2 - Teléfono'],
  ['res3Nombre',         'Resultados 3 - Nombre'],
  ['res3Email',          'Resultados 3 - Email'],
  ['res3Telefono',       'Resultados 3 - Teléfono'],
  ['fac1Nombre',         'Facturación 1 - Nombre'],
  ['fac1Telefono',       'Facturación 1 - Teléfono'],
  ['fac1Email',          'Facturación 1 - Email'],
  ['fac2Nombre',         'Facturación 2 - Nombre'],
  ['fac2Telefono',       'Facturación 2 - Teléfono'],
  ['fac2Email',          'Facturación 2 - Email'],
  ['fac3Nombre',         'Facturación 3 - Nombre'],
  ['fac3Telefono',       'Facturación 3 - Teléfono'],
  ['fac3Email',          'Facturación 3 - Email'],
  ['aceptaTyc',          'Aceptó T&C'],
  ['confirmaEmail',      'Confirmó domicilio electrónico']
];

function doPost(e) {
  try {
    var sheet = getOrCreateSheet_();
    var data = JSON.parse(e.postData.contents);

    var row = COLUMNS.map(function(col) {
      var key = col[0];
      if (key === 'fecha') {
        return data.fecha ? new Date(data.fecha) : new Date();
      }
      return data[key] || '';
    });

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, folio: data.folio }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    var headers = COLUMNS.map(function(col) { return col[1]; });
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

/**
 * Función de prueba: ejecutar manualmente desde el editor de Apps Script
 * (menú "Ejecutar" > seleccionar "test") para verificar que escribe bien
 * antes de publicar el formulario real.
 */
function test() {
  var fakeEvent = {
    postData: {
      contents: JSON.stringify({
        fecha: new Date().toISOString(),
        folio: 'FT-TEST-0001',
        solicitanteEmail: 'prueba@ejemplo.com',
        razonSocial: 'Cliente de Prueba SA',
        cuit: '30-00000000-0',
        condicionIva: 'Responsable inscripto'
      })
    }
  };
  doPost(fakeEvent);
}
