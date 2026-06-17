// =====================================================
// Google Apps Script — スコア受信 & スプレッドシート書き込み
// =====================================================
// Scores シート：審査員ごとの生データを追記
// Results シート：画像ごとの合計点を自動集計・降順表示
// =====================================================

function doGet(e) {
  try {
    const data = JSON.parse(e.parameter.data);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // --- Scores シート ---
    let scoresSheet = ss.getSheetByName('Scores');
    if (!scoresSheet) {
      scoresSheet = ss.insertSheet('Scores');
    }
    if (scoresSheet.getLastRow() === 0) {
      scoresSheet.appendRow([
        'Timestamp', 'Judge', 'Image', 'Completion', 'Contrast', 'Cup Balance', 'Weighted Total'
      ]);
      scoresSheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    }

    // 各画像のスコアを追記
    data.scores.forEach(s => {
      scoresSheet.appendRow([
        data.timestamp,
        data.judge,
        s.imageUrl.replace(/^.*\//, ''),
        s.c1,
        s.c2,
        s.c3,
        s.weighted_total
      ]);
    });

    // --- Results シート ---
    let resultsSheet = ss.getSheetByName('Results');
    if (!resultsSheet) {
      resultsSheet = ss.insertSheet('Results');
    }

    // 集計数式をセット（毎回上書きして最新状態を保つ）
    resultsSheet.clearContents();
    resultsSheet.getRange('A1').setValue('Image');
    resultsSheet.getRange('B1').setValue('Total Score (all judges)');
    resultsSheet.getRange('C1').setValue('Judge Count');
    resultsSheet.getRange(1, 1, 1, 3).setFontWeight('bold');

    // QUERY で画像ごとに合計・件数を集計し SORT で降順
    resultsSheet.getRange('A2').setFormula(
      '=IFERROR(SORT(QUERY(Scores!A2:G,"select C, sum(G), count(G) where C != \'\' group by C label C \'Image\', sum(G) \'Total\', count(G) \'Count\'"),2,FALSE),{"No data yet","",""})'
    );

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
