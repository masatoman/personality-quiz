<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $db = getDB();
        
        // 全体の統計
        $stats = [
            'total' => 0,
            'distribution' => [],
            'daily' => [],
            'sources' => []
        ];
        
        // 総数とタイプ別分布
        $query = "SELECT 
            personality_type,
            COUNT(*) as count
            FROM quiz_results 
            GROUP BY personality_type";
        
        $result = $db->query($query);
        while ($row = $result->fetch_assoc()) {
            $stats['distribution'][$row['personality_type']] = (int)$row['count'];
            $stats['total'] += (int)$row['count'];
        }
        
        // 日次データ（直近30日）
        $query = "SELECT 
            DATE(created_at) as date,
            personality_type,
            COUNT(*) as count
            FROM quiz_results
            WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
            GROUP BY DATE(created_at), personality_type
            ORDER BY date";
        
        $result = $db->query($query);
        while ($row = $result->fetch_assoc()) {
            $stats['daily'][] = [
                'date' => $row['date'],
                'type' => $row['personality_type'],
                'count' => (int)$row['count']
            ];
        }
        
        // ソース別統計
        $query = "SELECT 
            source,
            personality_type,
            COUNT(*) as count
            FROM quiz_results
            GROUP BY source, personality_type";
        
        $result = $db->query($query);
        while ($row = $result->fetch_assoc()) {
            if (!isset($stats['sources'][$row['source']])) {
                $stats['sources'][$row['source']] = [];
            }
            $stats['sources'][$row['source']][$row['personality_type']] = (int)$row['count'];
        }
        
        // 最新の結果（最新10件）
        $query = "SELECT 
            id,
            personality_type,
            source,
            created_at
            FROM quiz_results
            ORDER BY created_at DESC
            LIMIT 10";
            
        $result = $db->query($query);
        $stats['recent'] = [];
        while ($row = $result->fetch_assoc()) {
            $stats['recent'][] = [
                'id' => (int)$row['id'],
                'type' => $row['personality_type'],
                'source' => $row['source'],
                'created_at' => $row['created_at']
            ];
        }
        
        echo json_encode([
            'success' => true,
            'data' => $stats
        ]);
        
    } catch (Exception $e) {
        sendError($e->getMessage());
    }
} else {
    sendError('Method not allowed', 405);
} 