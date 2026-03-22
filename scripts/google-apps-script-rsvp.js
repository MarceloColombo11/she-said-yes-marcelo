/**
 * Google Apps Script para receber confirmações de presença (RSVP)
 * 
 * Como usar:
 * 1. Crie uma nova planilha no Google Sheets
 * 2. Acesse Extensões > Apps Script
 * 3. Cole este código e salve
 * 4. Na primeira execução, adicione os headers na linha 1 da planilha: Data, Nome, Email, Acompanhantes, Restrições
 * 5. Implante: Implantar > Nova implantação > Tipo: Aplicativo da Web
 * 6. Execute como: Eu
 * 7. Quem tem acesso: Qualquer pessoa
 * 8. Copie a URL e configure em NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_RSVP_URL
 * 
 * Para CORS: O Google Apps Script pode retornar erro de CORS em requisições de outros domínios.
 * Considere usar um proxy ou Cloud Function se necessário.
 */

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      new Date(),
      data.nome || '',
      data.email || '',
      data.acompanhantes || '0',
      data.restricoes || ''
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
