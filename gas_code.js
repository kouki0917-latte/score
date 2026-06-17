// =====================================================
// Google Apps Script — スコア受信 & スプレッドシート書き込み
// =====================================================

function doGet(e) {
  try {
    const data = JSON.parse(e.parameter.data);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // ヘッダーがなければ追加
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'タイムスタンプ',
        '審査員名',
        '画像ファイル名',
        '完成度',
        'コントラスト',
        'カップバランス',
        '合計点（20点満点）'
      ]);
    }

    // 各画像のスコアを1行ずつ書き込み
    data.scores.forEach(s => {
      sheet.appendRow([
        data.timestamp,
        data.judge,
        s.imageUrl,
        s.c1,
        s.c2,
        s.c3,
        s.weighted_total
      ]);
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
