const fs = require('fs');
const path = require('path');

// JSONファイルから教材データを読み込み
const materialsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/initial-materials.json'), 'utf8')
);

console.log(`JSONファイルから ${materialsData.length} 件の教材を読み込みました`);

// データベースに挿入するためのSQL文を生成
const generateInsertSQL = (materials) => {
  const inserts = materials.map((material, index) => {
    const { basicInfo, contentSections, settings } = material;
    
    // コンテンツをJSON形式に変換
    const content = {
      sections: contentSections.map(section => ({
        type: section.type,
        title: section.title,
        content: section.content,
        order: section.order,
        ...(section.options && { options: section.options })
      })),
      introduction: '',
      conclusion: ''
    };

    // 難易度を数値に変換
    const difficultyLevel = settings.difficulty === 'beginner' ? 1 : 
                           settings.difficulty === 'intermediate' ? 3 : 
                           settings.difficulty === 'advanced' ? 5 : 2;

    return `INSERT INTO materials (
      user_id, 
      title, 
      description, 
      content, 
      category, 
      tags, 
      difficulty_level, 
      is_published,
      created_at,
      updated_at
    ) VALUES (
      '550e8400-e29b-41d4-a716-446655440001',
      '${basicInfo.title.replace(/'/g, "''")}',
      '${basicInfo.description.replace(/'/g, "''")}',
      '${JSON.stringify(content).replace(/'/g, "''")}',
      '${settings.category || 'general'}',
      ARRAY[${basicInfo.tags.map(tag => `'${tag}'`).join(', ')}],
      ${difficultyLevel},
      ${settings.isPublic},
      NOW(),
      NOW()
    );`;
  });

  return inserts.join('\n\n');
};

// SQLファイルを生成
const sqlContent = `
-- 教材データの移行
-- 既存の教材を削除（オプション）
-- DELETE FROM materials WHERE user_id = '550e8400-e29b-41d4-a716-446655440001';

-- 新しい教材データを挿入
${generateInsertSQL(materialsData)}

-- 確認用クエリ
SELECT COUNT(*) as total_materials FROM materials;
SELECT title, category, difficulty_level, is_published FROM materials ORDER BY created_at DESC;
`;

// SQLファイルを保存
const outputPath = path.join(__dirname, '../sql/migrate-materials.sql');
fs.writeFileSync(outputPath, sqlContent);

console.log(`SQLファイルを生成しました: ${outputPath}`);
console.log(`実行するには: psql -h localhost -p 5432 -U postgres -d shiftwith -f ${outputPath}`);
