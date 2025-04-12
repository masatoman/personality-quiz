<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'config.php';

try {
    echo "Attempting to connect to database...\n";
    echo "Host: " . DB_HOST . "\n";
    echo "Database: " . DB_NAME . "\n";
    echo "User: " . DB_USER . "\n";
    
    $db = getDB();
    
    // テーブルの存在確認
    $tables = ['quiz_results', 'daily_stats'];
    $missing_tables = [];
    
    foreach ($tables as $table) {
        $result = $db->query("SHOW TABLES LIKE '$table'");
        if ($result->num_rows === 0) {
            $missing_tables[] = $table;
        }
    }
    
    if (!empty($missing_tables)) {
        echo "Missing tables: " . implode(", ", $missing_tables) . "\n";
        echo "Creating tables...\n";
        
        // テーブルの作成
        $db->query("
            CREATE TABLE IF NOT EXISTS quiz_results (
                id INT AUTO_INCREMENT PRIMARY KEY,
                personality_type ENUM('giver', 'taker', 'matcher') NOT NULL,
                source VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                user_agent VARCHAR(255),
                ip_address VARCHAR(45)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
        
        $db->query("
            CREATE TABLE IF NOT EXISTS daily_stats (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date DATE,
                personality_type ENUM('giver', 'taker', 'matcher'),
                count INT DEFAULT 0,
                source VARCHAR(50),
                UNIQUE KEY date_type_source (date, personality_type, source)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
        
        echo "Tables created successfully!\n";
    } else {
        echo "All required tables exist.\n";
    }
    
    // データベースのバージョン情報を表示
    $version = $db->query("SELECT VERSION() as version")->fetch_assoc();
    echo "Connected successfully!\n";
    echo "MySQL Version: " . $version['version'] . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Error Code: " . $e->getCode() . "\n";
    
    // 追加のデバッグ情報
    if ($e instanceof mysqli_sql_exception) {
        echo "MySQL Error No: " . $e->getCode() . "\n";
        echo "MySQL Error: " . $e->getMessage() . "\n";
    }
} 