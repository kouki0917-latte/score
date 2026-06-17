// =====================================================
// Google Apps Script — スコア受信 & スプレッドシート書き込み
// =====================================================
// ・審査員名ごとに専用シートを作成
// ・同じ審査員が再送信した場合は上書き（重複しない）
// ・Results シート：全審査員の合計点を集計・降順表示
// =====================================================

function doGet(e) {
  try {
    const data = JSON.parse(e.parameter.data);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const judgeName = data.judge;

    // --- 審査員専用シートを取得 or 作成 ---
    let judgeSheet = ss.getSheetByName(judgeName);
    if (!judgeSheet) {
      judgeSheet = ss.insertSheet(judgeName);
    }

    // 既存データを全クリア（上書き）
    judgeSheet.clearContents();

    // ヘッダー
    judgeSheet.appendRow([
      'Timestamp', 'Judge', 'Image', 'Completion', 'Contrast', 'Cup Balance', 'Weighted Total'
    ]);
    judgeSheet.getRange(1, 1, 1, 7).setFontWeight('bold');

    // スコアを書き込み
    data.scores.forEach(s => {
      judgeSheet.appendRow([
        data.timestamp,
        judgeName,
        s.imageUrl.replace(/^.*\//, ''),
        s.c1,
        s.c2,
        s.c3,
        s.weighted_total
      ]);
    });

    // --- Results シートを更新 ---
    updateResults(ss);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function updateResults(ss) {
  // 審査員シート一覧（Results以外の全シート）
  const excludeSheets = ['Results'];
  const judgeSheets = ss.getSheets().filter(s => !excludeSheets.includes(s.getName()));

  // 全審査員のデータを集める
  // { imageName: { total: 合計点, judges: [審査員名, ...] } }
  const imageMap = {};

  judgeSheets.forEach(sheet => {
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;
    const rows = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
    rows.forEach(row => {
      const image = row[2];
      const weightedTotal = parseFloat(row[6]) || 0;
      const judge = row[1];
      if (!image) return;
      if (!imageMap[image]) imageMap[image] = { total: 0, judges: [] };
      imageMap[image].total += weightedTotal;
      imageMap[image].judges.push(judge);
    });
  });

  // Results シートを作成 or クリア
  let resultsSheet = ss.getSheetByName('Results');
  if (!resultsSheet) {
    resultsSheet = ss.insertSheet('Results');
    // 先頭に移動
    ss.setActiveSheet(resultsSheet);
    ss.moveActiveSheet(1);
  }
  resultsSheet.clearContents();

  // ヘッダー
  resultsSheet.appendRow(['Rank', 'Image', 'Total Score', 'Judge Count', 'Judges']);
  resultsSheet.getRange(1, 1, 1, 5).setFontWeight('bold');

  // 合計点で降順ソート
  const sorted = Object.entries(imageMap)
    .sort((a, b) => b[1].total - a[1].total);

  sorted.forEach(([image, info], i) => {
    resultsSheet.appendRow([
      i + 1,
      image,
      info.total,
      info.judges.length,
      info.judges.join(', ')
    ]);
  });
}
