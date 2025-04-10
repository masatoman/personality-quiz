<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['type']) || !isset($data['answers'])) {
            sendError('Invalid data', 400);
        }
        
        $db = getDB();
        
        // 結果の保存
        $stmt = $db->prepare("
            INSERT INTO quiz_results 
            (personality_type, source, user_agent, ip_address, answers, score) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $type = $data['type'];
        $source = $data['source'] ?? 'direct';
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '';
        $answers = json_encode($data['answers']);
        $score = json_encode($data['score'] ?? null);
        
        $stmt->bind_param("ssssss", $type, $source, $userAgent, $ipAddress, $answers, $score);
        
        if (!$stmt->execute()) {
            throw new Exception('Failed to save result');
        }
        
        // 日次統計の更新
        $updateStats = $db->prepare("
            INSERT INTO daily_stats (date, personality_type, source, count)
            VALUES (CURRENT_DATE(), ?, ?, 1)
            ON DUPLICATE KEY UPDATE count = count + 1
        ");
        
        $updateStats->bind_param("ss", $type, $source);
        $updateStats->execute();
        
        // 保存された結果の取得
        $resultId = $db->insert_id;
        $result = $db->query("SELECT * FROM quiz_results WHERE id = $resultId")->fetch_assoc();
        
        echo json_encode([
            'success' => true,
            'message' => '結果が保存されました',
            'data' => [
                'id' => $result['id'],
                'type' => $result['personality_type'],
                'created_at' => $result['created_at']
            ]
        ]);
        
    } catch (Exception $e) {
        sendError($e->getMessage());
    }
} else {
    sendError('Method not allowed', 405);
} 