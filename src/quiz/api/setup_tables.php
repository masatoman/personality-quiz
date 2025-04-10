<?php
require_once 'config.php';

try {
    // resultsテーブルの作成
    $sql = "CREATE TABLE IF NOT EXISTS results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);

    echo json_encode(['message' => 'テーブルが正常に作成されました。']);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'テーブル作成エラー: ' . $e->getMessage()]);
} 