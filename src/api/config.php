<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// データベース接続設定
define('DB_HOST', '127.0.0.1');
define('DB_USER', 'u969053517_PQuser');
define('DB_PASS', 'T&2>xtr65b');
define('DB_NAME', 'u969053517_PQ_test');

// APIのベースパスを設定
define('API_BASE_PATH', '/src/api');

// 許可するオリジン
$allowed_origins = [
    'https://virtualph-academy.com',
    'http://virtualph-academy.com',
    'http://localhost:3000'  // 開発環境用
];

// CORSの設定
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

// データベース接続関数
function getDB() {
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    
    try {
        $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        $db->set_charset("utf8mb4");
        return $db;
    } catch (mysqli_sql_exception $e) {
        error_log("Database connection failed: " . $e->getMessage());
        throw new Exception("データベース接続に失敗しました: " . $e->getMessage());
    }
}

// エラーハンドリング関数
function sendError($message, $code = 500) {
    http_response_code($code);
    echo json_encode([
        'error' => $message,
        'timestamp' => date('Y-m-d H:i:s'),
        'code' => $code
    ]);
    exit;
} 