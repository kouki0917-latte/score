// =====================================================
// Google Apps Script — スコア受信 & スプレッドシート書き込み
// =====================================================
// 【設定手順】
// 1. Google スプレッドシートを新規作成
// 2. メニュー「拡張機能 → Apps Script」を開く
// 3. このファイルの内容を貼り付けて保存
// 4. 「デプロイ → 新しいデプロイ」→ 種類「ウェブアプリ」
//    - 実行ユーザー: 自分
//    - アクセスできるユーザー: 全員
// 5. デプロイして表示されたURLを index.html の管理者設定に貼る
// =====================================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // ヘッダーがなければ追加
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'タイムスタンプ',
        '審査員名',
        '画像URL',
        '審査項目1',
        '審査項目2',
        '審査項目3',
        '合計点'
      ]);
    }

    // 各画像のスコアを1行ずつ書き込み
    data.scores.forEach(s => {
      const total = (s.c1 || 0) + (s.c2 || 0) + (s.c3 || 0);
      sheet.appendRow([
        data.timestamp,
        data.judge,
        s.imageUrl,
        s.c1,
        s.c2,
        s.c3,
        total
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

// テスト用（ブラウザから直接アクセスした時に動作確認できる）
function doGet(e) {
  return ContentService
    .createTextOutput('採点システム GAS は正常に動作しています。')
    .setMimeType(ContentService.MimeType.TEXT);
}
