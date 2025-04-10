<?php
require_once 'config.php';

try {
    $db = getDB();
    
    // 既存のテーブルを削除
    $db->query("DROP TABLE IF EXISTS quiz_results");
    $db->query("DROP TABLE IF EXISTS daily_stats");
    
    // quiz_resultsテーブルの作成
    $db->query("
        CREATE TABLE quiz_results (
            id INT AUTO_INCREMENT PRIMARY KEY,
            personality_type ENUM('giver', 'taker', 'matcher') NOT NULL,
            source VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_agent VARCHAR(255),
            ip_address VARCHAR(45),
            answers JSON,
            score JSON,
            INDEX idx_personality_type (personality_type),
            INDEX idx_source (source),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "quiz_results table created successfully!\n";
    
    // daily_statsテーブルの作成
    $db->query("
        CREATE TABLE daily_stats (
            id INT AUTO_INCREMENT PRIMARY KEY,
            date DATE,
            personality_type ENUM('giver', 'taker', 'matcher'),
            count INT,
            source VARCHAR(50),
            INDEX idx_date (date),
            UNIQUE KEY unique_daily_stat (date, personality_type, source)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "daily_stats table created successfully!\n";
    
    echo "Indexes created successfully!\n\n";
    
    // テーブル構造の表示
    $result = $db->query("DESCRIBE quiz_results");
    echo "Structure of quiz_results table:\n";
    while ($row = $result->fetch_assoc()) {
        echo $row['Field'] . " - " . $row['Type'] . " - " . $row['Null'] . " - " . $row['Key'] . "\n";
    }
    
    echo "\nStructure of daily_stats table:\n";
    $result = $db->query("DESCRIBE daily_stats");
    while ($row = $result->fetch_assoc()) {
        echo $row['Field'] . " - " . $row['Type'] . " - " . $row['Null'] . " - " . $row['Key'] . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
} 