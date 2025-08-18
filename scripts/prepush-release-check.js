#!/usr/bin/env node
/*
  リリース前チェック:
  - docs/03_進捗管理/06_リリース前テストチェックリスト.md の未チェック項目が0であることを検証
  - 未チェックがある場合は git push をブロック
*/

const fs = require('fs');
const path = require('path');

function fail(message) {
  console.error(`\n\x1b[31m[BLOCKED]\x1b[0m ${message}\n`);
  process.exit(1);
}

try {
  const checklistPath = path.resolve(__dirname, '..', 'docs', '03_進捗管理', '06_リリース前テストチェックリスト.md');
  if (!fs.existsSync(checklistPath)) {
    fail('チェックリストファイルが見つかりません: docs/03_進捗管理/06_リリース前テストチェックリスト.md');
  }

  const content = fs.readFileSync(checklistPath, 'utf8');
  // 未チェックのパターン: "- [ ]"
  const unchecked = content.match(/^- \[ \]/gm) || [];
  if (unchecked.length > 0) {
    console.error('\n未チェック項目があります。すべてチェックを付けてから push してください。');
    // 未チェックの行を最大20件まで表示
    const lines = content.split('\n').filter(l => /^- \[ \]/.test(l)).slice(0, 20);
    for (const l of lines) console.error('  ' + l);
    fail(`未チェック: ${unchecked.length} 件`);
  }

  console.log('\x1b[32m[OK]\x1b[0m リリース前チェックリストは全て完了しています');
  process.exit(0);
} catch (e) {
  fail('チェック中にエラーが発生しました: ' + e.message);
}


