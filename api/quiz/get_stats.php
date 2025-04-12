<?php
// 開発環境でのCORS設定
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    } else {
        header('Access-Control-Allow-Origin: http://localhost:3000');
    }
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Max-Age: 86400');    // 24時間
    exit(0);
}

header('Content-Type: application/json');
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
} else {
    header('Access-Control-Allow-Origin: http://localhost:3000');
}
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

try {
    // 全体の回答数を取得
    $total = $pdo->query("SELECT COUNT(*) as count FROM results")->fetch()['count'];
    
    // タイプごとの回答数を取得
    $stmt = $pdo->query("SELECT type, COUNT(*) as count FROM results GROUP BY type");
    $types = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // タイプごとのパーセンテージを計算
    $stats = [];
    foreach ($types as $type) {
        // データベースのタイプ名とフロントエンドの表示名の対応
        $displayType = $type['type'];
        $stats[$displayType] = [
            'count' => (int)$type['count'],
            'percentage' => $total > 0 ? round(($type['count'] / $total) * 100, 1) : 0
        ];
    }
    
    // 存在しないタイプのデータを0で初期化
    $allTypes = ['giver', 'taker', 'matcher'];
    foreach ($allTypes as $type) {
        if (!isset($stats[$type])) {
            $stats[$type] = [
                'count' => 0,
                'percentage' => 0
            ];
        }
    }
    
    echo json_encode([
        'total' => $total,
        'stats' => $stats
    ]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => '統計取得エラー: ' . $e->getMessage()]);
} 