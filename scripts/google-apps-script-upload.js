/**
 * Google Apps Script para upload de fotos para o Google Drive
 * 
 * Como usar:
 * 1. Crie uma pasta no Google Drive para as fotos do casamento
 * 2. Acesse script.google.com e crie um novo projeto
 * 3. Cole este código
 * 4. Substitua PASTA_DRIVE_ID pelo ID da pasta (da URL: drive.google.com/drive/folders/PASTA_DRIVE_ID)
 * 5. Implante: Implantar > Nova implantação > Tipo: Aplicativo da Web
 * 6. Execute como: Eu
 * 7. Quem tem acesso: Qualquer pessoa
 * 8. Copie a URL e configure em NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_UPLOAD_URL
 */

const PASTA_DRIVE_ID = '1HoHMOXOtWYBhvahp4ZzOdFgeSslLTJUm';

/**
 * Teste de implantação: abra a URL no navegador.
 * Deve retornar {"ok":true}. Se funcionar, o upload via POST também deve funcionar.
 */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: 'Script ativo. Use POST para enviar fotos.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Requisição inválida' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  try {
    const data = JSON.parse(e.postData.contents);
    const base64 = data.file;
    const filename = data.fileName || data.filename || 'foto-' + Date.now() + '.jpg';
    const mimeType = data.mimeType || 'image/jpeg';
    
    if (!base64) {
      throw new Error('Arquivo não enviado');
    }
    
    const blob = Utilities.newBlob(Utilities.base64Decode(base64), mimeType, filename);
    const pasta = DriveApp.getFolderById(PASTA_DRIVE_ID);
    const arquivo = pasta.createFile(blob);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Foto enviada com sucesso!',
        id: arquivo.getId()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
