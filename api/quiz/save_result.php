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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['type'])) {
        http_response_code(400);
        echo json_encode(['error' => 'タイプが指定されていません。']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO results (type) VALUES (:type)");
        $stmt->execute(['type' => $data['type']]);
        
        echo json_encode([
            'success' => true,
            'message' => '結果が保存されました。',
            'id' => $pdo->lastInsertId(),
            'type' => $data['type']
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        error_log('Save error: ' . $e->getMessage());
        echo json_encode([
            'success' => false,
            'error' => '保存エラー',
            'details' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'POSTメソッドのみ許可されています。'
    ]);
} 