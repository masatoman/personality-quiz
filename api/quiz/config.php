<?php
// 環境設定
$env = getenv('APP_ENV') ?: 'development';

// 環境に応じたCORS設定
if ($env === 'production') {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header('Access-Control-Allow-Origin: https://virtualph-academy.com');
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Access-Control-Max-Age: 86400');    // 24時間
        exit(0);
    }
    header('Access-Control-Allow-Origin: https://virtualph-academy.com');
} else {
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
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    } else {
        header('Access-Control-Allow-Origin: http://localhost:3000');
    }
}

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// 環境に応じた設定
if ($env === 'production') {
    // 本番環境設定
    $host = 'srv1415.hstgr.io';
    $dbname = 'u969053517_PQ_test';
    $username = 'u969053517_PQuser';
    $password = 'T&2>xtr65b';
} else {
    // 開発環境設定（MacOS用）
    $host = '127.0.0.1';  // localhostの代わりにIPアドレスを使用
    $dbname = 'quiz_test';
    $username = 'root';
    $password = '';  // パスワードなしの場合は空文字列
    $port = 3306;  // MySQLのポート番号
}

try {
    // データベース接続
    $dsn = $env === 'development' 
        ? "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4"
        : "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8mb4',
        PDO::ATTR_TIMEOUT => 3,
    ];
    
    $pdo = new PDO($dsn, $username, $password, $options);
} catch(PDOException $e) {
    http_response_code(500);
    error_log('Database connection error: ' . $e->getMessage());
    echo json_encode(['error' => 'データベース接続エラー', 'details' => $e->getMessage()]);
    exit;
} 